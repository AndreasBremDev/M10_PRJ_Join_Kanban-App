
let touchStartX = 0;
let touchStartY = 0;
let touchElement = null;
let isDraggingTouch = false;
let longPressTimeout = null;
const longPressDragThresholdInMs = 300;
const longPressMoveThresholdInPx = 10;


/**
 * Initializes touch drag-and-drop functionality for all task items
 * Sets up touch event listeners on devices that support touch input
 * Should be called after tasks are rendered or re-rendered
 */
function initTouchDragAndDrop() {
    if (!isTouchDevice()) return;
    const dragItems = document.querySelectorAll('.drag-item');
    dragItems.forEach(item => {
        setupNewTouchListeners(item);
    });
}

/**
 * Detects if the current device supports touch input
 * @returns {boolean} True if touch events are supported, false otherwise
 */
function isTouchDevice() {
    return 'ontouchstart' in window || navigator.maxTouchPoints > 0;
}

/**
 * Sets up touch event listeners for a specific drag item
 * Attaches touchstart, touchmove, and touchend handlers with passive: false
 * @param {HTMLElement} item - The DOM element to attach touch listeners to
 */
function setupNewTouchListeners(item) {
    item.addEventListener('touchstart', handleTouchStart, { passive: false });
    item.addEventListener('touchmove', handleTouchMove, { passive: false });
    item.addEventListener('touchend', handleTouchEnd, { passive: false });
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
 * Handles the start of a touch event for drag-and-drop on touch devices.
 * Records the initial touch position and sets up a long-press timeout to initiate drag.
 * @param {TouchEvent} event - The touch event containing touch coordinates.
 */
function handleTouchStart(event) {
    const item = event.currentTarget;
    const taskId = item.dataset.taskId || item.closest('[data-task-id]')?.dataset.taskId;
    if (!taskId) return;
    initializeTouchDrag__handleTouchStart(event, item, taskId);
    longPressTimeout = setTimeout(() => {
        if (touchElement) {
            enableTouchDragEffects__handleTouchStart();
        }
    }, longPressDragThresholdInMs);
}

/**
 * Initializes touch drag state variables at the start of a touch drag.
 * Stores initial touch position, element reference, and task ID.
 * @param {TouchEvent} event - The touchstart event.
 * @param {HTMLElement} item - The element being touched.
 * @param {string} taskId - The ID of the task being dragged.
 */
function initializeTouchDrag__handleTouchStart(event, item, taskId) {
    const touch = event.touches[0];
    touchStartX = touch.clientX;
    touchStartY = touch.clientY;
    touchElement = item;
    currentDraggedId = taskId;
}

/**
 * Enables visual and logical effects for touch drag start.
 * Sets dragging state, applies CSS class and styles, and disables body scrolling.
 */
function enableTouchDragEffects__handleTouchStart() {
    isDraggingTouch = true;
    touchElement.classList.add('dragging-touch');
    touchElement.style.transform = 'rotate(2deg)';
    touchElement.style.zIndex = "1000";
    document.body.style.overflow = 'hidden';
}

/**
 * Handles touch movement during drag-and-drop operations
 * Calculates movement distance, initiates drag when threshold is met, and manages drop zone highlighting
 * @param {TouchEvent} event - The touch move event containing current touch coordinates
 */
function handleTouchMove(ev) {
    const touch = ev.touches[0];
    if (!isDraggingTouch) {checkIfTouchMoveExceedsThreshold__handleTouchMove(touch); return;};
    if (!touchElement) return;
    const x = touch.clientX - touchElement.offsetWidth / 2;
    const y = touch.clientY - touchElement.offsetHeight / 2;
    touchElement.style.transform = `translate3d(${x}px, ${y}px, 0) rotate(2deg)`;
    handleAutoScroll(touch);
    touchElement.style.pointerEvents = 'none';
    const elementBelow = document.elementFromPoint(touch.clientX, touch.clientY);
    touchElement.style.pointerEvents = 'auto';
    handleTouchRemoveHighlightsAllDropZone();
    handleTouchHighlightNewDropZone(elementBelow);
    ev.preventDefault();
}

/**
 * Checks if the touch movement exceeds the threshold before long-press activates.
 * Cancels the long-press timeout if movement is detected.
 * @param {Touch} touch - The current touch object containing clientX and clientY.
 */
function checkIfTouchMoveExceedsThreshold__handleTouchMove(touch) {
        const deltaX = Math.abs(touch.clientX - touchStartX);
        const deltaY = Math.abs(touch.clientY - touchStartY);
        if (deltaX > longPressMoveThresholdInPx || deltaY > longPressMoveThresholdInPx) {
            clearTimeout(longPressTimeout);
            longPressTimeout = null;
        }
}


/**
 * Handles the end of a touch drag operation
 * Determines drop zone, executes task movement, and resets touch state
 * @param {TouchEvent} event - The touch end event containing final touch coordinates
 */
function handleTouchEnd(ev) {
    stopAutoScroll();
    if (!touchElement) return;
    const touch = ev.changedTouches[0];
    touchElement.style.pointerEvents = 'none';
    const elementBelow = document.elementFromPoint(touch.clientX, touch.clientY);
    const dropZone = elementBelow?.closest('.draggable');
    touchElement.style.pointerEvents = 'auto';
    if (dropZone) {
        const category = getCategoryByDropZoneId(dropZone);
        if (category) dragOndropMoveTo(category);
    }
    resetTouchState();
}

/**
 * Resets all touch drag state and cleans up visual effects
 * Removes styling, highlights, stops auto-scroll, and resets variables
 */
function resetTouchState() {
    if (touchElement) {
        touchElement.style.transform = '';
        touchElement.style.zIndex = '';
        touchElement.style.pointerEvents = '';
        touchElement.classList.remove('dragging-touch');
        document.body.style.overflow = '';
    }
    handleTouchRemoveHighlightsAllDropZone();
    stopAutoScroll();
    resetTouchVariables();
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
 * Removes existing touch event listeners from a drag item
 * Prevents duplicate event listeners when reinitializing touch functionality
 * @param {HTMLElement} item - The DOM element to remove touch listeners from
 */
function removeTouchListeners(item) {
    console.log('check if removeTouchListerners is running');
    
    item.removeEventListener('touchstart', handleTouchStart);
    item.removeEventListener('touchmove', handleTouchMove);
    item.removeEventListener('touchend', handleTouchEnd);
}

// POSSIBLY NOT NEEDED ANYMORE, BUT KEEPING FOR NOW IN CASE OF FUTURE USE

// /**
//  * Checks if the current browser is Safari (including iOS/MacOS Safari).
//  * @returns {boolean} True if Safari, otherwise false.
//  */
// function isSafari() {
//     return /^((?!chrome|android|crios).)*safari/i.test(navigator.userAgent);
// }