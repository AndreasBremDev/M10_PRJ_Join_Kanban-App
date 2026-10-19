let filepicker;
let gallery;
let error;
let currentfilename;
let currentViewer = null;

let allImages = [];

function filepickerInit() {
    [filepicker, gallery, error] = ['filepicker', 'filepicker-gallery', 'filepicker-error'].map(id => document.getElementById(id));
    if (!filepicker) {console.error("Filepicker-Element nicht gefunden!"); return;}
    load();
    filepicker.addEventListener('change', () => {
        const files = filepicker.files;
        if (files.length > 0) {
            Array.from(files).forEach(async file => {
                file.name = currentfilename;
                errorHandling__filepicker(file, error);
                if (error.textContent) return;
                const blob = new Blob([file], { type: file.type })
                const compressedBase64 = await compressImage(file, 800, 800, 0.8)
                allImages.push({filename: file.name, fileType: blob.type, base64: compressedBase64});
                save();
                render();
            });
        }
    });
}

function errorHandling__filepicker(file, error) {
    if (!file.type.startsWith('image/jpeg')) {
        error.textContent = `Die Datei "${file.name}" ist kein gültiges Bild.`;
        error.classList.toggle('visible');
        setTimeout(() => { error.textContent = '', error.classList.toggle('visible') }, 2000)
        return error.textContent;
    }
    if (file.size > 1000000) {
        error.textContent = `Datei zu groß. Erlaubt sind nur <1MB.`;
        error.classList.toggle('visible');
        setTimeout(() => { error.textContent = '', error.classList.toggle('visible') }, 2000)
        return error.textContent;
    }
}

/** Komprimiert ein Bild auf eine Zielgröße oder -qualität
 * @param {File} file - Die Bilddatei, die komprimiert werden soll
 * @param {number} maxWidth - Die maximale Breite des Bildes
 * @param {number} maxHeight - Die maximale Höhe des Bildes
 * @param {number} quality - Qualität des komprimierten Bildes (zwischen 0 und 1)
 * @returns {Promise<string>} - Base64-String des komprimierten Bildes
 */
function compressImage(file, maxWidth = 800, maxHeight = 800, quality = 0.7) {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();

        reader.onload = (event) => {
            const img = new Image();
            img.onload = () => {
                const canvas = document.createElement('canvas');
                const ctx = canvas.getContext('2d');

                // Berechnung der neuen Größe, um die Proportionen beizubehalten
                let width = img.width;
                let height = img.height;

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

                // Zeichne das Bild in das Canvas
                ctx.drawImage(img, 0, 0, width, height);

                // Exportiere das Bild als Base64
                const compressedBase64 = canvas.toDataURL('image/jpeg', quality);
                resolve(compressedBase64);
            };

            img.onerror = () => reject('Fehler beim Laden des Bildes.');
            img.src = event.target.result;
        };

        reader.onerror = () => reject('Fehler beim Lesen der Datei.');
        reader.readAsDataURL(file);
    });
}

function blobToBase64(blob) {
    return new Promise((resolve, _) => {
        const reader = new FileReader();
        reader.onloadend = () => resolve(reader.result);
        reader.readAsDataURL(blob);
    });
}

function save() {
    let arrayAsString = JSON.stringify(allImages);
    localStorage.setItem('allImages', arrayAsString)
}

function load() {
    let arrayAsString = localStorage.getItem('allImages');
    if (arrayAsString) {
        allImages = JSON.parse(arrayAsString)
        render();
    }
}

function render() {
    gallery.innerHTML = '';
    let imagesHTML = '<div id="viewer-container" style="display: contents;">';
    allImages.forEach((image, index) => {
        if (index < 5) { imagesHTML += `<img class="filepicker-image" src="${image.base64}" alt="${image.filename}" />`}
        else { imagesHTML += `<img class="filepicker-image--nonvisible" aria-hidden="true" src="${image.base64}" alt="${image.filename}">`; }
    });
    imagesHTML += '</div>';
    gallery.innerHTML += imagesHTML;
    if (allImages.length > 5) {
        const overflowCount = allImages.length - 5;
        gallery.innerHTML += `<span class="filepicker-image" style="background-color: #2A3647; color: white;">+${overflowCount}</span>`;
    }
    if (currentViewer) {
        currentViewer.destroy();
    }
    const viewerContainer = document.getElementById('viewer-container');
    currentViewer  = new Viewer(viewerContainer);
}