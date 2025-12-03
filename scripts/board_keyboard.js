/**
 * Board Keyboard Event Handlers and Accessibility Features
 * Contains all keyboard navigation and accessibility functions for the board module
 */

// #region keyboard accessibility board

/**
 * Keyboard event handler for task card navigation
 * @param {KeyboardEvent} event - The keyboard event
 * @param {string} taskJson - Base64 encoded task JSON
 */
function handleTaskCardKeydown(event, taskJson) {
    if (event.key === 'Enter' || event.key === ' ') {
        event.preventDefault();
        renderTaskDetail(taskJson);
    }
}

/**
 * Keyboard event handler for delete task button
 * @param {KeyboardEvent} event - The keyboard event
 * @param {string} taskId - The ID of the task to delete
 */
function handleDeleteTaskKeydown(event, taskId) {
    if (event.key === 'Enter' || event.key === ' ') {
        event.preventDefault();
        deleteTaskfromBoard(taskId);
    }
}

/**
 * Keyboard event handler for edit task button  
 * @param {KeyboardEvent} event - The keyboard event
 * @param {string} taskId - The ID of the task to edit
 */
function handleEditTaskKeydown(event, taskId) {
    if (event.key === 'Enter' || event.key === ' ') {
        event.preventDefault();
        renderEditTaskDetail(taskId);
    }
}

/**
 * Keyboard event handler for subtask toggle
 * @param {KeyboardEvent} event - The keyboard event
 * @param {string} taskId - The task ID
 * @param {number} index - The subtask index
 */
function handleSubtaskToggleKeydown(event, taskId, index) {
    if (event.key === 'Enter' || event.key === ' ') {
        event.preventDefault();
        toggleSubtask(taskId, index);
    }
}

/**
 * Keyboard event handler for search input
 * @param {KeyboardEvent} event - The keyboard event
 */
function handleSearchKeydown(event) {
    if (event.key === 'Enter') {
        event.preventDefault();
        searchTasks();
    }
}

/**
 * Keyboard event handler for search button
 * @param {KeyboardEvent} event - The keyboard event
 */
function handleSearchButtonKeydown(event) {
    if (event.key === 'Enter' || event.key === ' ') {
        event.preventDefault();
        searchAndClearSearchField();
    }
}

/**
 * Keyboard event handler for close dialog buttons
 * @param {KeyboardEvent} event - The keyboard event
 */
function handleCloseKeydown(event) {
    if (event.key === 'Enter' || event.key === ' ') {
        event.preventDefault();
        closeAddTaskOverlay();
    }
}

// #endregion