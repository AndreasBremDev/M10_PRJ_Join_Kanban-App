let filepicker;
let gallery;
let error;
let currentViewer = null;
let allImages = [];
let currentTaskId = null;
const MAX_FILE_LIMIT = 10;
const MAX_ERROR_TIMEOUT = 3000;
const MAX_FILENAME_CHARACTER = 10;

/**
 * Initializes the filepicker elements, optionally populates the image array 
 * with existing attachments from a given task (Edit mode), and sets up the event listener.
 * 
 * @param {Object|null} [task=null] - The task object containing existing images, or null for a new task.
 */
function filepickerInit(task = null) {
    [filepicker, gallery, error] = ['filepicker', 'filepicker-gallery', 'filepicker-error'].map(id => document.getElementById(id));
    if (!filepicker) { console.error("Filepicker-Element nicht gefunden!"); return; }
    currentTaskId = task?.id || null;
    pushTaskImagesToAllImages(task);
    render();
    filepickerEventListener();
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
 * Attaches a change event listener to the file input to handle uploaded images,
 * run error checks, compress them, store them in the global array, and update the view.
 */
function filepickerEventListener() {
    filepicker.addEventListener('change', () => {
        const files = filepicker.files;
        const remainingSlots = Math.max(0, (MAX_FILE_LIMIT - allImages.length));
        const filesToProcess = Array.from(files).slice(0, remainingSlots);
        if (files.length > remainingSlots) { showErrorMessage__filepicker(`Limit ${MAX_FILE_LIMIT} erreicht. ${remainingSlots} Bilder hinzugefügt.`, error); }
        Array.from(filesToProcess).forEach(async (file) => {
            if (!errorHandling__filepicker(file, error)) return;
            const blob = new Blob([file], { type: file.type });
            const compressedBase64 = await compressImage(file, 800, 800, 0.8);
            allImages.push({ fileName: file.name, fileType: blob.type, fileSize: file.size, base64: compressedBase64 });
            render();
        });
    });
}

/**
 * Validates a selected file against format (JPEG only) and size constraints (<1MB).
 * Displays an error message temporarily if validation fails.
 * 
 * @param {File} file - The file to validate.
 * @param {HTMLElement} error - The container element to display error messages.
 */
function errorHandling__filepicker(file, error) {
    if (!file.type.startsWith('image/jpeg')) {
        showErrorMessage__filepicker(`"${file.name.slice(0, MAX_FILENAME_CHARACTER) + "..."}" ist kein gültiges Bild.`, error);
        return false;
    }
    if (file.size > 1000000) {
        showErrorMessage__filepicker(`"${file.name.slice(0, MAX_FILENAME_CHARACTER) + "..."}" muss < 1MB sein.`, error);
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
        loadImageAndCompress__compressImage(reader, maxWidth, maxHeight, quality, resolve, reject);
        reader.onerror = () => reject('Fehler beim Lesen der Datei.');
        reader.readAsDataURL(file);
    });
}

/**
 * Helper function for FileReader onload event to load image data into a canvas and execute compression.
 * 
 * @param {FileReader} reader - The active FileReader instance.
 * @param {number} maxWidth - Maximum allowed width.
 * @param {number} maxHeight - Maximum allowed height.
 * @param {number} quality - Image export quality.
 * @param {Function} resolve - Promise resolve callback.
 * @param {Function} reject - Promise reject callback.
 */
function loadImageAndCompress__compressImage(reader, maxWidth, maxHeight, quality, resolve, reject) {
    reader.onload = (event) => {
        const img = new Image();
        img.onload = () => {
            const canvas = document.createElement('canvas');
            const ctx = canvas.getContext('2d');
            let { width, height } = resizeImageToFit__compressImage(img, maxWidth, maxHeight, canvas);
            ctx.drawImage(img, 0, 0, width, height);
            const compressedBase64 = canvas.toDataURL('image/jpeg', quality);
            resolve(compressedBase64);
        };
        img.onerror = () => reject('Fehler beim Laden des Bildes.');
        img.src = event.target.result;
    };
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
 * @param {Blob} blob - The blob object to convert.
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
    currentViewer = new Viewer(viewerContainer, viewerTitleCallback(allImages));
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
 * Generates a custom configuration object for Viewer.js to display file name, dimensions, and file size.
 * 
 * @param {Array<Object>} allImages - Array of image objects containing file metadata like fileSize.
 * @returns {Object} The configuration object for the Viewer instance containing the custom title function.
 */
function viewerTitleCallback(allImages) {
    return {
        title: function (image, imageData) {
            let fileObj = allImages[this.index];
            let fileSizeMb = (fileObj.fileSize / (1024 * 1024)).toFixed(2) + ' MB'
            return `${image.alt.slice(0, MAX_FILENAME_CHARACTER) + "..."} (${imageData.naturalWidth} × ${imageData.naturalHeight}) – ${fileSizeMb}`;
        }
    }
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
    console.log('index:', index, 'allImages:', allImages);
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