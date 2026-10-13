/**
 * Add Task Subtasks Management Module
 * Contains all subtask-related functionality for the add task module
 */

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
    let input = document.getElementById('subtask-input-overlay');
    if (!input) {
        input = document.getElementById('subtask-input-edit');
    }
    if (!input) return;
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
    let container = document.getElementById('subtask-icons-overlay');
    if (!container) {
        container = document.getElementById('main-subtask-icons');
    }
    if (container) {
        container.innerHTML = '';
    }
}

/**
 * Cancels the main subtask input and resets the interface
 */
function cancelMainSubtaskInput() {
    let input = document.getElementById('subtask-input-overlay');
    if (!input) {
        input = document.getElementById('subtask-input-edit');
    }
    if (input) {
        input.value = '';
        input.blur();
    }
    resetMainSubtaskIcons();
}

/**
 * Toggles the visibility of the edit contact dropdown
 */
function toggleContactDropdownEdit() {
    let dropdown = document.getElementById('assigned-dropdown-edit');
    let arrow = document.getElementById('arrow-icon-edit');
    if (dropdown.style.display === 'block') {
        dropdown.style.display = 'none';
        if (arrow) {
            arrow.classList.remove('rotate-180');
        }
    } else {
        dropdown.style.display = 'block';
        if (arrow) {
            arrow.classList.add('rotate-180');
        }
    }
}

/**
 * Sets checkbox states based on currently assigned IDs
 */
function setCheckboxesById() {
    let container = document.getElementById('assigned-dropdown-edit');
    if (!container) return;
    let checkboxes = container.getElementsByTagName('input');
    for (let i = 0; i < checkboxes.length; i++) {
        let cb = checkboxes[i];
        cb.checked = editAssignedIds.includes(cb.value);
        cb.onclick = function (e) {
            e.stopPropagation();
            toggleEditAssign(cb.value);
        };
    }
}

/**
 * Toggles the selection state of a contact and updates visuals
 * @param {string} contactId - The ID of the contact to toggle
 * @param {Event} event - The triggering event
 */
function toggleContactSelection(contactId, event) {
    event.stopPropagation();
    toggleEditAssign(contactId);
    updateContactRowVisuals(contactId);
}

/**
 * Toggles the visibility of the category dropdown menu
 * Shows/hides the dropdown and rotates the arrow icon accordingly
 */
function toggleCategoryDropdown() {
    let dropdown = document.getElementById('category-options');
    let arrow = document.getElementById('category-arrow');
    if (dropdown.style.display === 'block') {
        dropdown.style.display = 'none';
        arrow.classList.remove('rotate-180');
    } else {
        dropdown.style.display = 'block';
        arrow.classList.add('rotate-180');
    }
}

/**
 * Resets global edit variables to their default values
 * Clears subtasks array, assigned IDs array, and sets priority to medium
 */
function resetGlobalVariables() {
    editSubtasks = [];
    editAssignedIds = [];
    editPriority = 'medium';
}

/**
 * Resets all custom UI components to their default state
 * Updates assigned circles, subtasks display, checkboxes, priority UI, and subtask icons
 */
function resetCustomUIComponents() {
    renderAssignedEditCircles();
    renderSubtasksEditMode();
    setCheckboxesById();
    updatePrioUI('medium');
    resetMainSubtaskIcons();
}

/**
 * Resets the category input and display to default state
 * Sets category text to placeholder and clears hidden input value
 */
function resetCategoryInput() {
    const categoryText = document.getElementById('category-text');
    const categoryInput = document.getElementById('category');
    if (categoryText) categoryText.innerHTML = 'Select task category';
    if (categoryInput) categoryInput.value = '';
}

/**
 * Resets all validation visual indicators and enables create button
 * Removes error styling from inputs and hides error messages
 */
function resetValidationVisuals() {
    document.querySelectorAll('.input-error')
        .forEach(el => el.classList.remove('input-error'));
    document.querySelectorAll('.visible')
        .forEach(el => el.classList.remove('visible'));
    const btn = document.getElementById('create-btn');
    if (btn) btn.disabled = false;
}

/**
 * Selects a category and updates the UI accordingly
 * Updates display text, hidden input value, closes dropdown, and clears validation errors
 * @param {string} category - The category name to select
 */
function selectCategory(category) {
    document.getElementById('category-text').innerHTML = category;
    document.getElementById('category').value = category;
    toggleCategoryDropdown();
    let container = document.getElementById('category-display');
    let errorMsg = document.getElementById('category-error');
    container.classList.remove('input-error');
    errorMsg.classList.remove('visible');
}