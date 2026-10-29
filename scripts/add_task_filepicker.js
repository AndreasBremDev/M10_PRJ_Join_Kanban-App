let filepicker;
let gallery;
let error;
let currentViewer = null;
let allImages = [];
let currentTaskId = null;
const MAX_FILE_LIMIT = 10;
const MAX_ERROR_TIMEOUT = 3000;
const MAX_FILENAME_CHARACTER = 20;

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
function renderAttachmentGallery(task) {
    gallery = document.getElementById('filepicker-gallery');
    currentTaskId = task?.id || null;
    if (!gallery) { console.error("Filepicker-Galerie-Element nicht gefunden!"); return; }
    pushTaskImagesToAllImages(task);
    render();
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
        showErrorMessage__filepicker(`Die Datei "${file.name.slice(0, MAX_FILENAME_CHARACTER) + "..."}" ist kein gültiges Bild.`, error);
        return false;
    }
    if (file.size > 1000000) {
        showErrorMessage__filepicker(`Datei "${file.name.slice(0, MAX_FILENAME_CHARACTER) + "..."}" zu groß. Erlaubt sind nur <1MB.`, error);
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
 * Renders the image gallery UI, applying visibility rules for thumbnail limits (max 5 visible),
 * appending an overflow badge if necessary, and re-initializing the ViewerJS lightbox instance.
 */
function render() {
    gallery.innerHTML = '';
    let imagesHTML = '<div id="viewer-container" style="display: contents;">';
    allImages.forEach((image, index) => {

        imagesHTML += index < 5 ? `
        <div class="filepicker-image-wrapper" role="group" aria-label="Vorschaubild mit Option zum Löschen">
            <img class="filepicker-image" src="${image.base64}" alt="${image.fileName}" tabindex="0" />
            <button onclick="deleteFromAllImages(${index})" type="button" class="filepicker-delete-btn" aria-label="${image.fileName} löschen">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <mask id="mask0_75592_9951" style="mask-type:alpha" maskUnits="userSpaceOnUse" x="0" y="0" width="24" height="24">
                        <rect width="24" height="24" fill="#D9D9D9"/>
                    </mask>
                    <g mask="url(#mask0_75592_9951)">
                        <path d="M7 21C6.45 21 5.97917 20.8042 5.5875 20.4125C5.19583 20.0208 5 19.55 5 19V6C4.71667 6 4.47917 5.90417 4.2875 5.7125C4.09583 5.52083 4 5.28333 4 5C4 4.71667 4.09583 4.47917 4.2875 4.2875C4.47917 4.09583 4.71667 4 5 4H9C9 3.71667 9.09583 3.47917 9.2875 3.2875C9.47917 3.09583 9.71667 3 10 3H14C14.2833 3 14.5208 3.09583 14.7125 3.2875C14.9042 3.47917 15 3.71667 15 4H19C19.2833 4 19.5208 4.09583 19.7125 4.2875C19.9042 4.47917 20 4.71667 20 5C20 5.28333 19.9042 5.52083 19.7125 5.7125C19.5208 5.90417 19.2833 6 19 6V19C19 19.55 18.8042 20.0208 18.4125 20.4125C18.0208 20.8042 17.55 21 17 21H7ZM7 6V19H17V6H7ZM9 16C9 16.2833 9.09583 16.5208 9.2875 16.7125C9.47917 16.9042 9.71667 17 10 17C10.2833 17 10.5208 16.9042 10.7125 16.7125C10.9042 16.5208 11 16.2833 11 16V9C11 8.71667 10.9042 8.47917 10.7125 8.2875C10.5208 8.09583 10.2833 8 10 8C9.71667 8 9.47917 8.09583 9.2875 8.2875C9.09583 8.47917 9 8.71667 9 9V16ZM13 16C13 16.2833 13.0958 16.5208 13.2875 16.7125C13.4792 16.9042 13.7167 17 14 17C14.2833 17 14.5208 16.9042 14.7125 16.7125C14.9042 16.5208 15 16.2833 15 16V9C15 8.71667 14.9042 8.47917 14.7125 8.2875C14.5208 8.09583 14.2833 8 14 8C13.7167 8 13.4792 8.09583 13.2875 8.2875C13.0958 8.47917 13 8.71667 13 9V16Z" fill="#2A3647"/>
                    </g>
                </svg>
            </button>
        </div>
        ` : `
        <img class="filepicker-image--nonvisible" aria-hidden="true" src="${image.base64}" alt="${image.fileName}" />
        `;
    });
    imagesHTML += '</div>';
    gallery.innerHTML += imagesHTML;
    if (allImages.length > 5) { gallery.innerHTML += `<span class="filepicker-image--span">+${allImages.length - 5}</span>`; }
    if (currentViewer) { currentViewer.destroy(); }
    const viewerContainer = document.getElementById('viewer-container');
    currentViewer = new Viewer(viewerContainer);
}

/**
 * Deletes an image from the global allImages array by its index.
 * If a currentTaskId is set (edit mode), it updates the task's images object 
 * in the Firebase database, re-fetches the tasks, and updates the board rendering.
 * Finally, it re-renders the local filepicker/attachment gallery.
 * 
 * @async
 * @param {number} index - The index of the image in the allImages array to be removed.
 * @returns {Promise<void>}
 */
async function deleteFromAllImages(index) {
    console.log('index:', index, 'allImages:', allImages);
    allImages.splice(index, 1);
    render();
    if (currentTaskId) {
        let task = tasks.find(t => t.id === currentTaskId);
        if (task) {
            task.images = Object.fromEntries(allImages.map((img, index)=>[index, img]))
            await putData(`/${activeUserId}/tasks/${currentTaskId}/images`, task.images);
            tasks = await fetchAndAddIdAndRemoveUndefinedContacts();
            await renderTasks(tasks);
        }
    }
    render();
}

/**
 * Resets the file picker by clearing the global allImages array and re-rendering the gallery.
 */
function resetFilePicker() {
    allImages = [];
    render();
}