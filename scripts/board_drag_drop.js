/**
 * Board Drag & Drop Module
 * Contains all drag-and-drop functionality including auto-scroll operations
 * Handles task dragging, drop zones, visual feedback, and smooth scrolling during drag operations
 */

// #region Drag & Drop Functions

/**
 * Handles the drag start event for task cards
 * @param {DragEvent} event - The drag event
 * @param {string} id - The ID of the task being dragged
 */
function dragstartHandler(event, id) {
    currentDraggedId = id;
    event.target.style.transform = 'rotate(2deg)';
    startAutoScroll();
}

/**
 * Handles the drag over event for drop zones
 * @param {DragEvent} ev - The drag event
 */
function dragoverHandler(ev) {
    ev.preventDefault();
    toggleStyle(ev);
    handleAutoScroll(ev);
}

/**
 * Handles the drag end event and cleans up drag state
 * @param {DragEvent} event - The drag event
 */
function dragendHandler(event) {
    event.target.style.transform = '';
    stopAutoScroll();
}

/**
 * Toggles visual styling for drag over effects
 * @param {DragEvent} ev - The drag event
 */
function toggleStyle(ev) {
    ev.preventDefault();
    const targetDiv = ev.target.closest('.draggable');
    if (!targetDiv) return;
    const elements = document.querySelectorAll('.draggable');
    elements.forEach(el => el.classList.remove('highlight'));
    if (ev.type === 'dragover') {
        targetDiv.classList.add('highlight');
    }
}

/**
 * Moves a task to a different category/column on the board
 * @param {string} category - The target category ('toDo', 'inProgress', 'awaitFeedback', 'done')
 */
async function moveTo(category) {
    try {
        await putData('/' + activeUserId + '/tasks/' + currentDraggedId + '/board', category);
        let tasksRefetch = await fetchAndAddIdAndRemoveUndefinedContacts();
        renderTasks(tasksRefetch);
    } catch (error) {
        console.error('Error moveTask():', error);
    }
    const elements = document.querySelectorAll('.draggable');
    elements.forEach(el => el.classList.remove('highlight'));
}

/**
 * Starts the auto-scroll functionality during drag operations
 */
function startAutoScroll() {
    document.addEventListener('dragover', handleAutoScroll);
}

/**
 * Stops the auto-scroll functionality and cleans up intervals
 */
function stopAutoScroll() {
    document.removeEventListener('dragover', handleAutoScroll);
    if (autoScrollInterval) {
        clearInterval(autoScrollInterval);
        autoScrollInterval = null;
    }
}

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
    if (mouseY < rect.top + scrollThreshold) { handleScrollUp(main);
    } else if (mouseY > rect.bottom - scrollThreshold) { handleScrollDown(main);
    } else { handleScrollYStop(); }
    if (mouseX < rect.left + scrollThreshold) { handleScrollLeft(main);
    } else if (mouseX > rect.right - scrollThreshold) { handleScrollRight(main);
    } else { handleScrollXStop(); }
}

/**
 * Stops horizontal auto-scroll during drag operations
 */
function handleScrollXStop() {
    if (autoScrollIntervalX) {
        clearInterval(autoScrollIntervalX);
        autoScrollIntervalX = null;
    }
}

/**
 * Initiates rightward horizontal scrolling during drag operations
 * @param {HTMLElement} main - The main container element to scroll
 */
function handleScrollRight(main) {
    if (!autoScrollIntervalX) {
        autoScrollIntervalX = setInterval(() => {
            main.scrollLeft += scrollSpeed;
        }, 16);
    }
}

/**
 * Initiates leftward horizontal scrolling during drag operations
 * @param {HTMLElement} main - The main container element to scroll
 */
function handleScrollLeft(main) {
    if (!autoScrollIntervalX) {
        autoScrollIntervalX = setInterval(() => {
            main.scrollLeft -= scrollSpeed;
        }, 16);
    }
}

/**
 * Stops vertical auto-scroll during drag operations
 */
function handleScrollYStop() {
    if (autoScrollInterval) {
        clearInterval(autoScrollInterval);
        autoScrollInterval = null;
    }
}

/**
 * Initiates downward vertical scrolling during drag operations
 * @param {HTMLElement} main - The main container element to scroll
 */
function handleScrollDown(main) {
    if (!autoScrollInterval) {
        autoScrollInterval = setInterval(() => {
            main.scrollTop += scrollSpeed;
        }, 16);
    }
}

/**
 * Initiates upward vertical scrolling during drag operations
 * @param {HTMLElement} main - The main container element to scroll
 */
function handleScrollUp(main) {
    if (!autoScrollInterval) {
        autoScrollInterval = setInterval(() => {
            main.scrollTop -= scrollSpeed;
        }, 16);
    }
}

// #endregion