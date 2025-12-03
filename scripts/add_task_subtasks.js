/**
 * Add Task Subtasks Management Module
 * Contains all subtask-related functionality for the add task module
 */

// #region subtask management add_task

/**
 * Enters edit mode for a specific subtask
 * @param {number} index - The index of the subtask to edit
 */
function editSubtask(index) {
    editingSubtaskIndex = index;
    renderSubtasksEditMode();
}

/**
 * Saves the edited subtask or deletes it if empty
 * @param {number} index - The index of the subtask to save
 */
function saveEditedSubtask(index) {
    let input = document.getElementById(`edit-subtask-input-${index}`);
    if (input.value.trim().length > 0) {
        editSubtasks[index].title = input.value;
        editingSubtaskIndex = -1;
        renderSubtasksEditMode();
    } else {
        deleteSubtaskEdit(index);
    }
}

/**
 * Adds a new subtask to the edit list
 */
function addSubtaskEdit() {
    let input = document.getElementById('subtask-input-edit');
    let title = input.value.trim();
    if (title) {
        editSubtasks.push({ title: title, done: false });
        renderSubtasksEditMode();
        input.value = '';
    }
    resetMainSubtaskIcons();
}

/**
 * Deletes a subtask from the edit list
 * @param {number} index - The index of the subtask to delete
 */
function deleteSubtaskEdit(index) {
    editSubtasks.splice(index, 1);
    editingSubtaskIndex = -1;
    renderSubtasksEditMode();
}

/**
 * Resets the main subtask icons container
 */
function resetMainSubtaskIcons() {
    let container = document.getElementById('main-subtask-icons');
    container.innerHTML = '';
}

/**
 * Cancels the main subtask input and resets the interface
 */
function cancelMainSubtaskInput() {
    let input = document.getElementById('subtask-input-edit');
    input.value = '';
    input.blur();
    resetMainSubtaskIcons();
}

// #endregion