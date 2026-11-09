let scrollSpeed = 10;
let scrollThreshold = 50;
let scrollInterval;

/**
 * Handles auto-scrolling based on mouse position during drag operations
 * first if block handles vertical, second if block handles horizontal scrolling
 * @param {DragEvent} event - The drag event containing mouse coordinates
 */
function handleAutoScroll(event) {
    const main = document.querySelector('main');
    const rect = main.getBoundingClientRect();
    const mouseY = event.clientY;
    const mouseX = event.clientX;
    if (mouseY < rect.top + scrollThreshold) {
        setAutoScroll(main, 0, -scrollSpeed);
    } else if (mouseY > rect.bottom - scrollThreshold) {
        setAutoScroll(main, 0, scrollSpeed); 
    } else { setAutoScroll(main, 0, 0); }
    if (mouseX < rect.left + scrollThreshold) {
        setAutoScroll(main, -10, 0)
    } else if (mouseX > rect.right - scrollThreshold) {
        setAutoScroll(main, 10, 0)
    } else { setAutoScroll(main, 0, 0); }
}

/**
 * Stops the auto-scroll functionality
 */
function stopAutoScroll() {
    const main = document.querySelector('main');
    setAutoScroll(main, 0, 0);
}

/**
 * Central scroll function
 * @param {HTMLElement} container - The element to be scrolled (usually 'main')
 * @param {number} speedX - Horizontal speed (negative = left, positive = right)
 * @param {number} speedY - Vertical speed (negative = up, positive = down)
 */
function setAutoScroll(container, speedX, speedY) {
    clearInterval(scrollInterval);
    if (speedX === 0 && speedY === 0) return;
    scrollInterval = setInterval(() => {
        container.scrollLeft += speedX;
        container.scrollTop += speedY;
        if (container.scrollTop === 0 && speedY !== 0) {
            window.scrollBy(speedX, speedY);
        }
    }, 1000 / 60);
}