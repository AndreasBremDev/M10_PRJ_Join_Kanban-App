
let currentDraggedId;

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
async function dragOndropMoveTo(category) {
    console.log('dragOndropMoveTo(category): ', category, 'currentDraggedId: ', currentDraggedId);
    try {
        await putData('/' + activeUserId + '/tasks/' + currentDraggedId + '/board', category);
        let tasksRefetch = await fetchAndAddIdAndRemoveUndefinedContacts();
        await renderTasks(tasksRefetch);
    } catch (error) {
        console.error('Error dragOndropMoveTo(category):', error);
    }
    const elements = document.querySelectorAll('.draggable');
    elements.forEach(el => el.classList.remove('highlight'));
}