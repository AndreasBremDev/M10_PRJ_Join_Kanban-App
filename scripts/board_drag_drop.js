/**
 * Board Drag & Drop Module
 * Contains all drag-and-drop functionality including auto-scroll operations
 * Handles task dragging, drop zones, visual feedback, and smooth scrolling during drag operations
 */

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
    if (mouseY < rect.top + scrollThreshold) {
        handleScrollUp(main);
    } else if (mouseY > rect.bottom - scrollThreshold) {
        handleScrollDown(main);
    } else { handleScrollYStop(); }
    if (mouseX < rect.left + scrollThreshold) {
        handleScrollLeft(main);
    } else if (mouseX > rect.right - scrollThreshold) {
        handleScrollRight(main);
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

let touchStartX = 0;
let touchStartY = 0;
let touchElement = null;
let isDraggingTouch = false;
let touchMoveThreshold = 10; // Mindest-Bewegung in Pixels
let longPressTimeout = null;


/**
 * Handles the start of a touch event for drag-and-drop on touch devices
 * Records initial touch position and sets up long-press timeout for drag initiation
 * @param {TouchEvent} event - The touch event containing touch coordinates
 * @param {string} id - The ID of the task element being touched
 */
function handleTouchStart(event, id) {
    const touch = event.touches[0];
    touchStartX = touch.clientX;
    touchStartY = touch.clientY;
    touchElement = event.currentTarget;
    currentDraggedId = id;
    event.preventDefault();
    longPressTimeout = setTimeout(() => {
        if (touchElement && !isDraggingTouch) {
            AddDragClassesAndAutoScroll();
        }
    }, 150);
}

/**
 * Handles touch movement during drag-and-drop operations
 * Calculates movement distance, initiates drag when threshold is met, and manages drop zone highlighting
 * @param {TouchEvent} event - The touch move event containing current touch coordinates
 */
function handleTouchMove(event) {
    if (!touchElement) return;
    const touch = event.touches[0];
    const deltaX = Math.abs(touch.clientX - touchStartX);
    const deltaY = Math.abs(touch.clientY - touchStartY);
    const totalDistance = Math.sqrt(deltaX * deltaX + deltaY * deltaY);
    if (totalDistance < touchMoveThreshold && !isDraggingTouch) { return; }
    if (!isDraggingTouch && totalDistance >= touchMoveThreshold) {
        clearTimeout(longPressTimeout);
        AddDragClassesAndAutoScroll();
    }
    if (!isDraggingTouch) return;
    event.preventDefault();
    const elementBelow = document.elementFromPoint(touch.clientX, touch.clientY);
    handleTouchRemoveHighlightsAllDropZone();
    handleTouchHighlightNewDropZone(elementBelow);
}

/**
 * Applies drag styling and initiates auto-scroll for touch drag operations
 * Adds visual feedback (rotation, CSS class) and starts auto-scroll functionality
 */
function AddDragClassesAndAutoScroll() {
    touchElement.style.transform = 'rotate(2deg)';
    touchElement.classList.add('dragging-touch');
    isDraggingTouch = true;
    if (typeof startAutoScroll === 'function') {
        startAutoScroll();
    }
}

/**
 * Removes highlight styling from all drop zones
 * Clears visual feedback from all draggable containers during touch operations
 */
function handleTouchRemoveHighlightsAllDropZone() {
    document.querySelectorAll('.draggable').forEach(zone => {
        zone.classList.remove('highlight');
    });
}

/**
 * Highlights the drop zone under the current touch position
 * Adds visual feedback to valid drop zones during touch drag operations
 * @param {Element|null} elementBelow - The DOM element currently under the touch point
 */
function handleTouchHighlightNewDropZone(elementBelow) {
    const dropZone = elementBelow?.closest('.draggable');
    if (dropZone && dropZone !== touchElement.closest('.draggable')) {
        dropZone.classList.add('highlight');
    }
}

/**
 * Handles the end of a touch drag operation
 * Determines drop zone, executes task movement, and resets touch state
 * @param {TouchEvent} event - The touch end event containing final touch coordinates
 */
function handleTouchEnd(event) {
    clearTimeout(longPressTimeout);
    if (!touchElement) return;
    if (!isDraggingTouch) {
        resetTouchState();
        return;
    }
    const dropZone = touchPositionAtRelease(event);
    if (dropZone && currentDraggedId) {
        let category = getCategoryByDropZoneId(dropZone);
        if (category) {
            moveTo(category);
        }
    }
    resetTouchState();
}

/**
 * Maps drop zone element IDs to their corresponding category names
 * Converts DOM element IDs to backend category identifiers
 * @param {HTMLElement} dropZone - The drop zone element with an ID
 * @returns {string} The category name ('toDo', 'inProgress', 'awaitFeedback', 'done') or empty string
 */
function getCategoryByDropZoneId(dropZone) {
    let category = '';
    if (dropZone.id === 'categoryToDo') category = 'toDo';
    else if (dropZone.id === 'categoryInProgress') category = 'inProgress';
    else if (dropZone.id === 'categoryAwaitFeedback') category = 'awaitFeedback';
    else if (dropZone.id === 'categoryDone') category = 'done';
    return category;
}

/**
 * Determines the drop zone at the touch release position
 * Finds the draggable container under the final touch coordinates
 * @param {TouchEvent} event - The touch end event with changedTouches data
 * @returns {HTMLElement|null} The drop zone element or null if none found
 */
function touchPositionAtRelease(event) {
    const touch = event.changedTouches[0];
    const elementBelow = document.elementFromPoint(touch.clientX, touch.clientY);
    const dropZone = elementBelow?.closest('.draggable');
    return dropZone;
}

/**
 * Resets all touch drag state and cleans up visual effects
 * Removes styling, highlights, stops auto-scroll, and resets variables
 */
function resetTouchState() {
    if (touchElement) {
        touchElement.style.transform = '';
        touchElement.classList.remove('dragging-touch');
    }
    document.querySelectorAll('.draggable').forEach(zone => {
        zone.classList.remove('highlight');
    });
    if (typeof stopAutoScroll === 'function') {
        stopAutoScroll();
    }
    resetTouchVariables();
}

/**
 * Resets all touch-related global variables to their initial state
 * Clears coordinates, element references, flags, and timeouts
 */
function resetTouchVariables() {
    touchStartX = 0;
    touchStartY = 0;
    touchElement = null;
    isDraggingTouch = false;
    longPressTimeout = null;
}

/**
 * Detects if the current device supports touch input
 * @returns {boolean} True if touch events are supported, false otherwise
 */
function isTouchDevice() {
    return 'ontouchstart' in window || navigator.maxTouchPoints > 0;
}

// 2DO: Sollte nach dem Laden/Rendern der Tasks aufgerufen werden
// In board.js oder wo auch immer Tasks gerendert werden

// async function renderTasks() {
//     // ... bestehender Render-Code ...
    
//     // Touch-Support initialisieren
//     initTouchDragAndDrop();
// }

/**
 * Initializes touch drag-and-drop functionality for all task items
 * Sets up touch event listeners on devices that support touch input
 * Should be called after tasks are rendered or re-rendered
 */
function initTouchDragAndDrop() {
    if (!isTouchDevice()) return;
    const dragItems = document.querySelectorAll('.drag-item');
    dragItems.forEach(item => {
        removeTouchListeners(item);
        setupNewTouchListeners(item);
    });
}

/**
 * Global touch event listeners for enhanced drag-and-drop performance
 * Uses document-level listeners to ensure touch events are captured even when
 * dragged elements move outside their original containers
 */

/**
 * Global touchmove event listener for active drag operations
 * Handles touch movement only when a drag is in progress to optimize performance
 */
document.addEventListener('touchmove', (e) => {
    if (isDraggingTouch) {
        handleTouchMove(e);
    }
}, { passive: false });

/**
 * Global touchend event listener for completing drag operations
 * Ensures drag operations are properly completed even if touch ends outside the original element
 */
document.addEventListener('touchend', (e) => {
    if (isDraggingTouch || touchElement) {
        handleTouchEnd(e);
    }
}, { passive: false });

/**
 * Window resize event listener for touch drag reinitialization
 * Reinitializes touch drag functionality after layout changes on touch devices
 */
window.addEventListener('resize', () => {
    if (isTouchDevice()) {
        setTimeout(initTouchDragAndDrop, 100);
    }
});

/**
 * Sets up touch event listeners for a specific drag item
 * Attaches touchstart, touchmove, and touchend handlers with passive: false
 * @param {HTMLElement} item - The DOM element to attach touch listeners to
 */
function setupNewTouchListeners(item) {
    const taskId = item.getAttribute('draggable') ? item.id : item.closest('[id]')?.id;

    item.addEventListener('touchstart', (e) => handleTouchStart(e, taskId), { passive: false });
    item.addEventListener('touchmove', handleTouchMove, { passive: false });
    item.addEventListener('touchend', handleTouchEnd, { passive: false });
}

/**
 * Removes existing touch event listeners from a drag item
 * Prevents duplicate event listeners when reinitializing touch functionality
 * @param {HTMLElement} item - The DOM element to remove touch listeners from
 */
function removeTouchListeners(item) {
    item.removeEventListener('touchstart', handleTouchStartBound);
    item.removeEventListener('touchmove', handleTouchMoveBound);
    item.removeEventListener('touchend', handleTouchEndBound);
}
