let filepicker;
let gallery;
let error;
let currentViewer = null;
let allImages = [];
let currentTaskId = null;
const MAX_FILE_LIMIT = 10;
const MAX_ERROR_TIMEOUT = 3000;
const MAX_FILENAME_CHARACTER = 10;
const MAX_TOTAL_SIZE_MB = 5 * 1024 * 1024;
const viewerStandardOptions = {
    zoomIn: true,
    zoomOut: true,
    oneToOne: true,
    reset: true,
    prev: true,
    play: true,
    next: true,
    rotateLeft: true,
    rotateRight: true,
    flipHorizontal: true,
    flipVertical: true,
}
let isDownloading = false;

/**
 * Initializes the filepicker elements, optionally populates the image array 
 * with existing attachments from a given task (Edit mode), and sets up the event listener.
 * 
 * @param {Object|null} [task=null] - The task object containing existing images, or null for a new task.
 */
async function filepickerInit(task = null) {
    [filepicker, gallery, error] = ['filepicker', 'filepicker-gallery', 'filepicker-error'].map(id => document.getElementById(id));
    if (!filepicker) { console.error("Filepicker-Element nicht gefunden!"); return; }
    currentTaskId = task?.id || null;
    pushTaskImagesToAllImages(task);
    render();
    await filepickerEventListener();
}

/**
 * Renders the attachment gallery for a given task in the detail view.
 * Populates the global image array with task images and triggers the render process.
 * 
 * @param {Object} task - The task object containing the attachments/images to display.
 */
function renderAttachmentGallery__showTask(task) {
    gallery = document.getElementById('filepicker-gallery');
    currentTaskId = task?.id || null;
    if (!gallery) { console.error("Filepicker-Galerie-Element nicht gefunden!"); return; }
    pushTaskImagesToAllImages(task);
    let showTask = true;
    render(showTask);
}

/**
 * Clears the global allImages array and populates it with image objects from the provided task.
 * 
 * @param {Object} task - The task object containing image attachments.
 */
function pushTaskImagesToAllImages(task) {
    allImages = [];
    if (task && task.images) {
        Object.values(task?.images || {}).forEach(image => {
            allImages.push({ fileName: image.fileName, fileType: image.fileType, fileSize: image.fileSize, base64: image.base64 });
        });
    }
}

/**
 * Handles the event listener for the file picker, processing selected files,
 * validating limits, compressing images, converting to base64, and updating the state.
 * 
 * @async
 * @function filepickerEventListener
 * @returns {void}
 */
async function filepickerEventListener() {
    filepicker.addEventListener('change', () => {
        const files = filepicker.files;
        const filesToProcess = handleMaxUserSelectedFileLimit__filepicker(files);
        Array.from(filesToProcess).forEach(async (file) => {
            if (!errorHandling__filepicker(file, error)) return;
            const compressedBlob = await compressImage(file, 800, 800, 0.8);
            if (!handleMaxDatabaseUploadSizeLimit__filepicker(compressedBlob.size)) return;
            const base64String = await blobToBase64(compressedBlob);
            allImages.push({ fileName: file.name, fileType: compressedBlob.type, fileSize: compressedBlob.size, base64: base64String });
            render();
        });
    });
}

/**
 * Filters the selected files based on the remaining allowed file slots limit.
 * 
 * @function handleMaxUserSelectedFileLimit__filepicker
 * @param {FileList} files - The FileList object from the file picker input.
 * @returns {File[]} An array of files restricted to the available slots limit.
 */
function handleMaxUserSelectedFileLimit__filepicker(files) {
    const remainingSlots = Math.max(0, (MAX_FILE_LIMIT - allImages.length));
    const filesToProcess = Array.from(files).slice(0, remainingSlots);
    if (files.length > remainingSlots) { showErrorMessage__filepicker(`Limit ${MAX_FILE_LIMIT} erreicht. ${remainingSlots} Bilder hinzugefügt.`, error); }
    return filesToProcess;
}

/**
 * Validates if adding a new compressed image exceeds the maximum allowed total database upload size.
 * 
 * @function handleMaxDatabaseUploadSizeLimit__filepicker
 * @param {number} compressedBlobSize - The physical size of the compressed blob in bytes.
 * @returns {boolean} Returns true if within the limit, false if the limit is exceeded.
 */
function handleMaxDatabaseUploadSizeLimit__filepicker(compressedBlobSize) {
    const currentTotalSize = sumFileSizes(allImages);
    if ((currentTotalSize + compressedBlobSize) > MAX_TOTAL_SIZE_MB) {
        showErrorMessage__filepicker(`Max-Upload ${MAX_TOTAL_SIZE_MB / (1024 * 1024)} MB `, error);
        return false;
    }
    return true;
}

/**
 * Calculates the total file size of all images currently stored in the array.
 * 
 * @function sumFileSizes
 * @param {Object[]} images - Array of image objects containing a fileSize property.
 * @returns {number} The total sum of file sizes in bytes.
 */
function sumFileSizes(images) {
    const initialValue = 0;
    return images.reduce((accumulator, currentImage) => accumulator + currentImage.fileSize, initialValue);
}

/**
 * Validates a selected file against format (JPEG only) and size constraints (<1MB).
 * Displays an error message temporarily if validation fails.
 * 
 * @param {File} file - The file to validate.
 * @param {HTMLElement} error - The container element to display error messages.
 */
function errorHandling__filepicker(file, error) {
    if (!file.type.startsWith('image/jpeg') && !file.type.startsWith('image/png')) {
        showErrorMessage__filepicker(`"${file.name.slice(0, MAX_FILENAME_CHARACTER) + "..."}" ist kein gültiges Format.`, error);
        return false;
    }
    if (file.size > 10000000) {
        showErrorMessage__filepicker(`"${file.name.slice(0, MAX_FILENAME_CHARACTER) + "..."}" muss < 10MB sein.`, error);
        return false;
    }
    return true;
}

/**
 * Displays a temporary error message in the specified error container.
 * 
 * @param {string} message - The error message text to display.
 * @param {HTMLElement} error - The container element to display the error message.
 */
function showErrorMessage__filepicker(message, error) {
    error.textContent = message;
    error.classList.toggle('visible');
    setTimeout(() => { error.textContent = '', error.classList.toggle('visible') }, MAX_ERROR_TIMEOUT);
}

/**
 * Compresses an image file using a canvas and returns a base64 encoded string promise.
 * 
 * @param {File} file - The image file to compress.
 * @param {number} [maxWidth=800] - The maximum width constraint.
 * @param {number} [maxHeight=800] - The maximum height constraint.
 * @param {number} [quality=0.7] - The compression quality between 0 and 1.
 * @returns {Promise<string>} A promise resolving to the compressed base64 data URL.
 */
function compressImage(file, maxWidth = 800, maxHeight = 800, quality = 0.7) {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        loadImageAndCompress__compressImage(file, reader, maxWidth, maxHeight, quality, resolve, reject);
        reader.onerror = () => reject('Fehler beim Lesen der Datei.');
        reader.readAsDataURL(file);
    });
}

/**
 * Helper function for FileReader onload event to load image data into a canvas and execute compression.
 * 
 * @param {File} file The original image file.
 * @param {FileReader} reader The active FileReader instance.
 * @param {number} maxWidth Maximum allowed width.
 * @param {number} maxHeight Maximum allowed height.
 * @param {number} quality Image export quality.
 * @param {Function} resolve Promise resolve callback.
 * @param {Function} reject Promise reject callback.
 */
function loadImageAndCompress__compressImage(file, reader, maxWidth, maxHeight, quality, resolve, reject) {
    reader.onload = (event) => {
        const img = new Image();
        img.onload = () => {
            const canvas = document.createElement('canvas');
            const ctx = canvas.getContext('2d');
            let { width, height } = resizeImageToFit__compressImage(img, maxWidth, maxHeight, canvas);
            ctx.drawImage(img, 0, 0, width, height);
            convertCanvasToBlob__compressImage(canvas, reject, resolve, file, quality);
        };
        img.onerror = () => reject('Fehler beim Laden des Bildes.');
        img.src = event.target.result;
    };
}

/**
 * Converts a canvas element into a compressed Blob using the specified file type and quality.
 * 
 * @param {HTMLCanvasElement} canvas The canvas element containing the image.
 * @param {Function} reject Promise reject callback.
 * @param {Function} resolve Promise resolve callback.
 * @param {File} file The original image file used to determine the MIME type.
 * @param {number} quality The compression quality between 0 and 1.
 */
function convertCanvasToBlob__compressImage(canvas, reject, resolve, file, quality) {
    canvas.toBlob((blob) => {
        if (!blob) {
            reject('Fehler beim Komprimieren des Bildes.');
            return;
        }
        resolve(blob);
    }, file.type, quality);
}

/**
 * Calculates scaled dimensions for an image to fit within max width and height boundaries while keeping aspect ratio.
 * 
 * @param {HTMLImageElement} img - The source image element.
 * @param {number} maxWidth - Maximum width constraint.
 * @param {number} maxHeight - Maximum height constraint.
 * @param {HTMLCanvasElement} canvas - The target canvas to update dimensions on.
 * @returns {{width: number, height: number}} The adjusted dimensions.
 */
function resizeImageToFit__compressImage(img, maxWidth, maxHeight, canvas) {
    let { width, height } = img;
    if (width > maxWidth || height > maxHeight) {
        if (width > height) {
            height = (height * maxWidth) / width;
            width = maxWidth;
        } else {
            width = (width * maxHeight) / height;
            height = maxHeight;
        }
    }
    canvas.width = width;
    canvas.height = height;
    return { width, height };
}

/**
 * Converts a Blob object to a base64 encoded data string.
 * 
 * @param {Blob} blob The blob object to convert.
 * @returns {Promise<string>} A promise resolving to the base64 string result.
 */
function blobToBase64(blob) {
    return new Promise((resolve, _) => {
        const reader = new FileReader();
        reader.onloadend = () => resolve(reader.result);
        reader.readAsDataURL(blob);
    });
}

/**
 * Renders the attachment gallery container, manages image elements up to the limit, 
 * handles overflow counters, and re-initializes the Viewer.js instance.
 * 
 * @param {boolean} [boolShowTask=false] - Flag indicating whether to render in show-task mode or edit/add mode.
 * @returns {void}
 */
function render(boolShowTask = false) {
    gallery.innerHTML = '';
    let imagesHTML = '<div id="viewer-container" style="display: contents;">';
    imagesHTML = renderAttachmentImageSection(imagesHTML, boolShowTask);
    imagesHTML += '</div>';
    gallery.innerHTML += imagesHTML;
    if (allImages.length > 5) { gallery.innerHTML += getAttachmentRemainderSpanHtml(allImages); }
    if (currentViewer) { currentViewer.destroy(); }
    const viewerContainer = document.getElementById('viewer-container');
    currentViewer = new Viewer(viewerContainer, viewerOptionsCallback(allImages));
    const images = viewerContainer.querySelectorAll('.filepicker-image');
    images.forEach(image => addImageViewerClickListener(image));
}

/**
 * Generates the configuration options object for the image viewer instance.
 * 
 * @param {string[]} allImages - Array of image sources or objects used for the viewer title.
 * @returns {Object} The configuration object for Viewer.js.
 */
function viewerOptionsCallback(allImages) {
    return {
        title: viewerTitleCallback(allImages),
        toolbar: {
            ...viewerStandardOptions,
            download: { show: true }
        },
        shown: () => {
            viewerDownloadButtonSvg(allImages);
            viewerFocusPlayButton();
            viewerToolbarAccessibility();
        }
    }
}

/**
 * Generates the title callback function for the image viewer, displaying the file name, dimensions, and file size.
 * 
 * @param {Object[]} allImages - Array of file objects containing file data.
 * @returns {Function} The title callback function used by Viewer.js.
 */
function viewerTitleCallback(allImages) {
    return function (image, imageData) {
        let currentIndex = currentViewer ? currentViewer.index : 0;
        let fileObj = allImages[currentIndex];
        let fileSizeMb = fileObj && fileObj.fileSize ? (fileObj.fileSize / (1024 * 1024)).toFixed(2) + ' MB' : '';
        return `${image.alt.slice(0, MAX_FILENAME_CHARACTER) + "..."} (${imageData.naturalWidth} × ${imageData.naturalHeight}) – ${fileSizeMb}`;
    }
}

/**
 * Focuses the play button in the viewer toolbar after the viewer is shown.
 */
function viewerFocusPlayButton() {
    setTimeout(() => {
        const playButton = currentViewer.viewer.querySelector('.viewer-play');
        if (playButton) {
            playButton.focus();
        }
    }, 50);
}

/**
 * Injects the download SVG icon into the viewer toolbar download button, 
 * makes it accessible, and attaches click and keyboard event listeners.
 */
function viewerDownloadButtonSvg(allImages) {
    const downloadButton = currentViewer.viewer.querySelector('.viewer-download');
    if (downloadButton && !downloadButton.querySelector('svg')) {
        downloadButton.style.display = 'flex';
        downloadButton.style.alignItems = 'center';
        downloadButton.style.justifyContent = 'center';
        downloadButton.innerHTML = '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="#ffffff" width="16" height="16"><path d="M12,16L7,11L8.4,9.55l2.6,2.6V4h2v8.15l2.6-2.6L17,11l-5,5ZM6,20q-0.82,0-1.41-0.59T4,18V15H6v3H18V15h2v3q0,0.82-0.59,1.41T18,20H6Z"/></svg>';
        downloadButton.setAttribute('aria-label', 'download');
        downloadButton.addEventListener('click', () => viewerDownloadFunction(allImages));
        downloadButton.addEventListener('keydown', (event) => {
            if (event.key === 'Enter' || event.key === ' ') { event.preventDefault(); viewerDownloadFunction(allImages); }
        });
    }
}

/**
 * Triggers the download of the currently viewed image.
 */
function viewerDownloadFunction(allImages) {
    if (isDownloading) return;
    isDownloading = true;
    const link = document.createElement('a');
    link.href = currentViewer.image.src;
    let currentIndex = currentViewer ? currentViewer.index : 0;
    let fileObj = allImages[currentIndex];
    link.download = fileObj ? fileObj.fileName : 'download';
    link.click();
    setTimeout(() => { isDownloading = false; }, 1000);
}

/**
 * Adds accessibility attributes (aria-label) to all viewer toolbar buttons 
 * based on their data-viewer-action attribute.
 */
function viewerToolbarAccessibility() {
    const toolbarButtons = currentViewer.viewer.querySelectorAll('.viewer-toolbar li[data-viewer-action]');
    toolbarButtons.forEach(button => {
        const action = button.getAttribute('data-viewer-action');
        if (action && !button.hasAttribute('aria-label')) {
            button.setAttribute('aria-label', action);
        }
    });
}

/**
 * Adds accessibility attributes and event listeners to an image element to open the image viewer via click or keyboard.
 * 
 * @param {HTMLImageElement} image - The image element to enhance.
 */
function addImageViewerClickListener(image) {
    image.setAttribute('tabindex', '0');
    image.setAttribute('role', 'button');
    image.addEventListener('click', () => currentViewer.show());
    image.addEventListener('keydown', (event) => {
        if (event.key === 'Enter' || event.key === ' ') {
            event.preventDefault();
            currentViewer.show();
        }
    });
}

/**
 * Iterates through all images and appends the appropriate HTML template string 
 * depending on the index limit and the display mode.
 * 
 * @param {string} imagesHTML - The accumulated HTML string for the images.
 * @param {boolean} boolShowTask - Flag determining if the show-task layout should be used.
 * @returns {string} The updated HTML string containing all rendered image attachments.
 */
function renderAttachmentImageSection(imagesHTML, boolShowTask) {
    allImages.forEach((image, index) => {
        if (index < 5) {
            imagesHTML += boolShowTask
                ? getShowTaskAttachmentHtml(image, index, boolShowTask)
                : getAddTaskEditTaskAttachmentHtml(image, index);
        } else {
            imagesHTML += getAttachmentImageHiddenHtml(image);
        }
    });
    return imagesHTML;
}

/**
 * Deletes an image from the allImages array by its index, updates the backend if a task is active, 
 * and re-renders the gallery while preserving the current view mode.
 * 
 * @param {number} index - The index of the image to delete.
 * @param {boolean} [boolShowTask=false] - Flag indicating whether to maintain the show-task layout during re-rendering.
 * @returns {Promise<void>}
 */
async function deleteFromAllImages(index, boolShowTask = false) {
    allImages.splice(index, 1);
    render(boolShowTask);
    if (currentTaskId) {
        let task = tasks.find(t => t.id === currentTaskId);
        if (task) {
            task.images = Object.fromEntries(allImages.map((img, index) => [index, img]))
            await putData(`/${activeUserId}/tasks/${currentTaskId}/images`, task.images);
            tasks = await fetchAndAddIdAndRemoveUndefinedContacts();
            await renderTasks(tasks);
        }
    }
    render(boolShowTask);
}

/**
 * Resets the file picker by clearing the global allImages array and re-rendering the gallery.
 */
function resetFilePicker() {
    allImages = [];
    render();
}