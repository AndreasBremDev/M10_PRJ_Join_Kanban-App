/**
 * Board Drag & Drop Module
 * Contains all drag-and-drop functionality including auto-scroll operations
 * Handles task dragging, drop zones, visual feedback, and smooth scrolling during drag operations
 */
let currentDraggedId;
let scrollSpeed = 10;
let scrollThreshold = 50;
let touchStartX = 0;
let touchStartY = 0;
let touchElement = null;
let isDraggingTouch = false;
let longPressTimeout = null;
let scrollInterval;

/**
 * Checks if the current browser is Safari (including iOS/MacOS Safari).
 * @returns {boolean} True if Safari, otherwise false.
 */
function isSafari() {
    return /^((?!chrome|android|crios).)*safari/i.test(navigator.userAgent);
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
    if (mouseX < rect.left + scrollThreshold) { // temporary disabled horizontal scrolling
        // handleScrollLeft(main); // temporary disabled horizontal auto-scroll
    } else if (mouseX > rect.right - scrollThreshold) {
        // handleScrollRight(main); // temporary disabled horizontal auto-scroll
    } else { /* handleScrollXStop();  */ }
}

/**
 * Stops the auto-scroll functionality
 */
function stopAutoScroll() {
    const main = document.querySelector('main');
    setAutoScroll(main, 0, 0);
}

/**
 * Handles the drag start event for task cards
 * @param {DragEvent} event - The drag event
 * @param {string} id - The ID of the task being dragged
 */
function dragstartHandler(event, id) {
    currentDraggedId = id;
    event.target.style.transform = 'rotate(2deg)';
}

/**
 * Handles the drag over event for drop zones
 * @param {DragEvent} ev - The drag event
 */
function dragoverHandler(ev) {
    ev.preventDefault();
    toggleStyleDragSections(ev);
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
function toggleStyleDragSections(ev) {
    ev.preventDefault();
    const targetDiv = ev.target.closest('.draggable');
    const elements = document.querySelectorAll('.draggable');
    elements.forEach(el => el.classList.remove('highlight'));
    if (ev.type === 'dragover' && targetDiv) {
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
 * Handles the start of a touch event for drag-and-drop on touch devices.
 * Records the initial touch position and sets up a long-press timeout to initiate drag.
 * @param {TouchEvent} event - The touch event containing touch coordinates.
 */
function handleTouchStart(event) {
    const item = event.currentTarget;
    const taskId = item.id || item.closest('[id]')?.id;
    if (!taskId) return;
    initializeTouchDrag_handleTouchStart(event, item, taskId);
    longPressTimeout = setTimeout(() => {
        if (touchElement) {
            enableTouchDragEffects_handleTouchStart();
        }
    }, 150);
}

/**
 * Enables visual and logical effects for touch drag start.
 * Sets dragging state, applies CSS class and styles, and disables body scrolling.
 */
function enableTouchDragEffects_handleTouchStart() {
    isDraggingTouch = true;
    touchElement.classList.add('dragging-touch');
    touchElement.style.transform = 'rotate(2deg)';
    touchElement.style.zIndex = "1000";
    document.body.style.overflow = 'hidden';
}

/**
 * Initializes touch drag state variables at the start of a touch drag.
 * Stores initial touch position, element reference, and task ID.
 * @param {TouchEvent} event - The touchstart event.
 * @param {HTMLElement} item - The element being touched.
 * @param {string} taskId - The ID of the task being dragged.
 */
function initializeTouchDrag_handleTouchStart(event, item, taskId) {
    const touch = event.touches[0];
    touchStartX = touch.clientX;
    touchStartY = touch.clientY;
    touchElement = item;
    currentDraggedId = taskId;
}

/**
 * Handles touch movement during drag-and-drop operations
 * Calculates movement distance, initiates drag when threshold is met, and manages drop zone highlighting
 * @param {TouchEvent} event - The touch move event containing current touch coordinates
 */
function handleTouchMove(ev) {
    if (!touchElement) return;
    const touch = ev.touches[0];
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
        if (category) moveTo(category);
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
        touchElement.style.position = '';
        touchElement.style.zIndex = '';
        touchElement.style.pointerEvents = '';
        touchElement.style.left = '';
        touchElement.style.top = '';
        touchElement.style.width = ''; 
        touchElement.classList.remove('dragging-touch');
        document.body.style.overflow = '';
    }
    handleTouchRemoveHighlightsAllDropZone();
    stopAutoScroll();
    resetTouchVariables();
}

/**
 * Detects if the current device supports touch input
 * @returns {boolean} True if touch events are supported, false otherwise
 */
function isTouchDevice() {
    return 'ontouchstart' in window || navigator.maxTouchPoints > 0;
}

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
    item.addEventListener('touchstart', handleTouchStart, { passive: false });
    item.addEventListener('touchmove', handleTouchMove, { passive: false });
    item.addEventListener('touchend', handleTouchEnd, { passive: false });
}

/**
 * Removes existing touch event listeners from a drag item
 * Prevents duplicate event listeners when reinitializing touch functionality
 * @param {HTMLElement} item - The DOM element to remove touch listeners from
 */
function removeTouchListeners(item) {
    item.removeEventListener('touchstart', handleTouchStart);
    item.removeEventListener('touchmove', handleTouchMove);
    item.removeEventListener('touchend', handleTouchEnd);
}













// --------------------- TO BE DELETED CODE SNIPPETS --------------------- //

// startAutoScroll: Da wir das Scrolling direkt in dragoverHandler und handleTouchMove triggern
// /**
//  * Starts the auto-scroll functionality during drag operations
//  */
// function startAutoScroll() {
//     // document.addEventListener('dragover', handleAutoScroll);
// }

// touchPositionAtRelease: Der Code darin ist identisch mit dem Anfang von handleTouchEnd
// /**
//  * Determines the drop zone at the touch release position
//  * Finds the draggable container under the final touch coordinates
//  * @param {TouchEvent} event - The touch end event with changedTouches data
//  * @returns {HTMLElement|null} The drop zone element or null if none found
//  */
// function touchPositionAtRelease(event) {
//     const touch = event.changedTouches[0];
//     const elementBelow = document.elementFromPoint(touch.clientX, touch.clientY);
//     const dropZone = elementBelow?.closest('.draggable');
//     return dropZone;
// }

// /**
//  * Applies drag styling and initiates auto-scroll for touch drag operations
//  * Adds visual feedback (rotation, CSS class) and starts auto-scroll functionality
//  */
// function AddDragClassesAndAutoScroll() {
//     touchElement.style.transform = 'rotate(2deg)';
//     touchElement.classList.add('dragging-touch');
//     isDraggingTouch = true;
//     if (typeof startAutoScroll === 'function') {
//         startAutoScroll();
//     }
// }

// let autoScrollInterval = null;
// let autoScrollIntervalX = null;
// /**
//  * Stops horizontal auto-scroll during drag operations
//  */
// function handleScrollXStop() {
//     if (autoScrollIntervalX) {
//         clearInterval(autoScrollIntervalX);
//         autoScrollIntervalX = null;
//     }
// }

// /**
//  * Stops vertical auto-scroll during drag operations
//  */
// function handleScrollYStop() {
//     if (autoScrollInterval) {
//         clearInterval(autoScrollInterval);
//         autoScrollInterval = null;
//     }
// }

//  **
//  * Initiates rightward horizontal scrolling during drag operations
//  * @param {HTMLElement} main - The main container element to scroll
//  */
// function handleScrollRight(main) {
//     if (!autoScrollIntervalX) {
//         autoScrollIntervalX = setInterval(() => {
//             if (isSafari()) {
//                 if (main.scrollWidth > main.clientWidth) {
//                     main.scrollLeft += scrollSpeed;
//                 } else {
//                     window.scrollBy(scrollSpeed, 0);
//                 }
//             } else {
//                 main.scrollLeft += scrollSpeed;
//             }
//         }, 16);
//     }
// }

// /**
//  * Initiates leftward horizontal scrolling during drag operations
//  * Uses a Safari-specific workaround if needed.
//  * @param {HTMLElement} main - The main container element to scroll
//  */
// function handleScrollLeft(main) {
//     if (!autoScrollIntervalX) {
//         autoScrollIntervalX = setInterval(() => {
//             if (isSafari()) {
//                 if (main.scrollWidth > main.clientWidth) {
//                     main.scrollLeft -= scrollSpeed;
//                 } else {
//                     window.scrollBy(-scrollSpeed, 0);
//                 }
//             } else {
//                 main.scrollLeft -= scrollSpeed;
//             }
//         }, 16);
//     }
// }


// /**
//  * Initiates downward vertical scrolling during drag operations.
//  * Uses a Safari-specific workaround if needed.
//  * @param {HTMLElement} main - The main container element to scroll
//  */
// function handleScrollDown(main) {
//     if (!autoScrollInterval) {
//         autoScrollInterval = setInterval(() => {
//             if (isSafari()) {
//                 if (main.scrollHeight > main.clientHeight) {
//                     main.scrollTop += scrollSpeed;
//                 } else {
//                     window.scrollBy(0, scrollSpeed);
//                 }
//             } else {
//                 main.scrollTop += scrollSpeed;
//             }
//         }, 16);
//     }
// }

// /**
//  * Initiates upward vertical scrolling during drag operations.
//  * Uses a Safari-specific workaround if needed.
//  * @param {HTMLElement} main - The main container element to scroll
//  */

// function handleScrollUp(main) {
//     if (!autoScrollInterval) {
//         autoScrollInterval = setInterval(() => {
//             if (isSafari()) {
//                 if (main.scrollHeight > main.clientHeight) {
//                     main.scrollTop -= scrollSpeed;
//                 } else {
//                     window.scrollBy(0, -scrollSpeed);
//                 }
//             } else {
//                 main.scrollTop -= scrollSpeed;
//             }
//         }, 16);
//     }
// }

// function handleTouchEnd(ev) {
// clearTimeout(longPressTimeout);
// if (!touchElement) return;
// if (!isDraggingTouch) {
//     resetTouchState();
//     return;
// }
// const dropZone = touchPositionAtRelease(ev);
// if (dropZone && currentDraggedId) {
//     let category = getCategoryByDropZoneId(dropZone);
//     if (category) {
//         moveTo(category);
//     }
// }
// resetTouchState();
// }

// let touchMoveThreshold = 10; // Mindest-Bewegung in Pixels

// function handleTouchMove(ev) {
// if (!touchElement) return;
// const { totalDistance, touch } = calculateTouchDistanceAndDelta(ev);
// if (totalDistance < touchMoveThreshold && !isDraggingTouch) { return; }
// if (!isDraggingTouch && totalDistance >= touchMoveThreshold) {
//     clearTimeout(longPressTimeout);
//     AddDragClassesAndAutoScroll();
// }
// if (!isDraggingTouch) return;
// ev.preventDefault();
// const elementBelow = moveElementByTouch(touch);
// handleTouchRemoveHighlightsAllDropZone();
// handleTouchHighlightNewDropZone(elementBelow);
// }

// /**
//  * Calculates the distance and delta between the initial and current touch positions.
//  * @param {TouchEvent} event - The touch event containing current touch coordinates.
//  * @returns {{ totalDistance: number, touch: Touch }} The total distance and the current touch object.
//  */
// function calculateTouchDistanceAndDelta(event) {
//     const touch = event.touches[0];
//     const deltaX = touch.clientX - touchStartX;
//     const deltaY = touch.clientY - touchStartY;
//     const absDeltaX = Math.abs(deltaX);
//     const absDeltaY = Math.abs(deltaY);
//     const totalDistance = Math.sqrt(absDeltaX * absDeltaX + absDeltaY * absDeltaY);
//     return { totalDistance, touch };
// }

// /**
//  * Moves the dragged element to follow the finger during touch drag.
//  * @param {Touch} touch - The current touch object with coordinates.
//  * @returns {Element|null} The element currently below the finger.
//  */
// function moveElementByTouch(touch) {
//     touchElement.style.position = 'fixed';
//     touchElement.style.zIndex = '9999';
//     touchElement.style.pointerEvents = 'none';
//     touchElement.style.left = '0px';
//     touchElement.style.top = '0px';
//     touchElement.style.transform = `translate3d(${touch.clientX - touchElement.offsetWidth / 2}px, ${touch.clientY - touchElement.offsetHeight / 2}px, 0) rotate(2deg)`;
//     const elementBelow = document.elementFromPoint(touch.clientX, touch.clientY);
//     return elementBelow;
// }

// --------------------- CHANGED, and REPLACED by other CODE --------------------- //

// function handleTouchStart(event, id) {
    // const taskId = item.getAttribute('draggable') ? item.id : item.closest('[id]')?.id;

    // const touch = event.touches[0];
    // touchStartX = touch.clientX;
    // touchStartY = touch.clientY;
    // touchElement = event.currentTarget;
    // currentDraggedId = id;
    // event.preventDefault();
    // longPressTimeout = setTimeout(() => {
    //     if (touchElement && !isDraggingTouch) {
    //         AddDragClassesAndAutoScroll();
    //     }
    // }, 150);
// }

// function resetTouchState() {
//     if (touchElement) {
//         touchElement.style.transform = '';
//         touchElement.style.position = '';
//         touchElement.style.zIndex = '';
//         touchElement.style.pointerEvents = '';
//         touchElement.style.left = '';
//         touchElement.style.top = '';
//         touchElement.classList.remove('dragging-touch');
//     }
//     document.querySelectorAll('.draggable').forEach(zone => {
//         zone.classList.remove('highlight');
//     });
//     if (typeof stopAutoScroll === 'function') { ///// HIER noch stopAutoScroll in Verwendung
//         stopAutoScroll();
//     }
//     resetTouchVariables();
// }