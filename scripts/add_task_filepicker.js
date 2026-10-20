let filepicker;
let gallery;
let error;
let currentViewer = null;
let allImages = [];
const MAX_FILE_LIMIT = 10;
const MAX_ERROR_TIMEOUT = 3000;
const MAX_FILENAME_CHARACTER = 20;

/**
 * Initializes the filepicker elements, loads existing images from storage,
 * and sets up the event listener for file selections.
 */
function filepickerInit() {
    [filepicker, gallery, error] = ['filepicker', 'filepicker-gallery', 'filepicker-error'].map(id => document.getElementById(id));
    if (!filepicker) { console.error("Filepicker-Element nicht gefunden!"); return; }
    load();
    filepickerEventListener();
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
            allImages.push({ filename: file.name, fileType: blob.type, base64: compressedBase64 });
            save();
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
 * Saves the current image array state into the browser's local storage as a JSON string.
 */
function save() {
    let arrayAsString = JSON.stringify(allImages);
    localStorage.setItem('allImages', arrayAsString)
}

/**
 * Loads the stored images array from local storage, parses it, and triggers a UI render update.
 */
function load() {
    let arrayAsString = localStorage.getItem('allImages');
    if (arrayAsString) {
        allImages = JSON.parse(arrayAsString)
        render();
    }
}

/**
 * Renders the image gallery UI, applying visibility rules for thumbnail limits (max 5 visible),
 * appending an overflow badge if necessary, and re-initializing the ViewerJS lightbox instance.
 */
function render() {
    gallery.innerHTML = '';
    let imagesHTML = '<div id="viewer-container" style="display: contents;">';
    allImages.forEach((image, index) => {
        imagesHTML += index < 5 ? `<img class="filepicker-image" src="${image.base64}" alt="${image.filename}" />` : `<img class="filepicker-image--nonvisible" aria-hidden="true" src="${image.base64}" alt="${image.filename}">`;
    });
    imagesHTML += '</div>';
    gallery.innerHTML += imagesHTML;
    if (allImages.length > 5) { gallery.innerHTML += `<span class="filepicker-image" style="background-color: #2A3647; color: white;">+${allImages.length - 5}</span>`; }
    if (currentViewer) { currentViewer.destroy(); }
    const viewerContainer = document.getElementById('viewer-container');
    currentViewer = new Viewer(viewerContainer);
}