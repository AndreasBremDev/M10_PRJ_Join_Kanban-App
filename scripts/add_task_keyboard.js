/**
 * Add Task Keyboard Event Handlers and Accessibility Features
 * Contains all keyboard navigation and accessibility functions for the add task module
 */

/**
 * Handles keyboard events for assigned dropdown interactions
 * @param {KeyboardEvent} event - The keyboard event
 */
function handleAssignedDropdownKeydown(event) {
    if (event.key === 'Enter' || event.key === ' ') {
        event.preventDefault();
        toggleContactDropdown();
    } else if (event.key === 'Escape') {
        let dropdown = document.getElementById('assigned-dropdown');
        if (dropdown.style.display === 'block') {
            toggleContactDropdown();
        }
    }
}

/**
 * Handles keyboard events for close button
 * @param {KeyboardEvent} event - The keyboard event
 */
function handleCloseKeydown(event) {
    if (event.key === 'Enter' || event.key === ' ') {
        event.preventDefault();
        closeAddTaskOverlay();
    }
}

/**
 * Handles keyboard events for edit assigned dropdown
 * @param {KeyboardEvent} event - The keyboard event
 */
function handleAssignedDropdownEditKeydown(event) {
    if (event.key === 'Enter' || event.key === ' ') {
        event.preventDefault();
        toggleContactDropdownEdit();
    } else if (event.key === 'Escape') {
        let dropdown = document.getElementById('assigned-dropdown-edit');
        if (dropdown.style.display === 'block') {
            toggleContactDropdownEdit();
        }
    }
}

/**
 * Handles keyboard events for save button
 * @param {KeyboardEvent} event - The keyboard event
 * @param {string} taskId - The task ID to save
 */
function handleSaveKeydown(event, taskId) {
    if (event.key === 'Enter' || event.key === ' ') {
        event.preventDefault();
        saveEditedTask(taskId);
    }
}

/**
 * Handles keyboard events for subtask cancel button
 * @param {KeyboardEvent} event - The keyboard event
 */
function handleSubtaskCancelKeydown(event) {
    if (event.key === 'Enter' || event.key === ' ') {
        event.preventDefault();
        cancelMainSubtaskInput();
    }
}

/**
 * Handles keyboard events for subtask add button
 * @param {KeyboardEvent} event - The keyboard event
 */
function handleSubtaskAddKeydown(event) {
    if (event.key === 'Enter' || event.key === ' ') {
        event.preventDefault();
        addSubtaskEdit();
    }
}

/**
 * Handles keyboard events for subtask edit input
 * @param {KeyboardEvent} event - The keyboard event
 * @param {number} index - The subtask index
 */
function handleSubtaskEditKeydown(event, index) {
    if (event.key === 'Enter') {
        event.preventDefault();
        saveEditedSubtask(index);
    } else if (event.key === 'Escape') {
        event.preventDefault();
        editingSubtaskIndex = -1;
        renderSubtasksEditMode();
    }
}

/**
 * Handles keyboard events for subtask delete button
 * @param {KeyboardEvent} event - The keyboard event
 * @param {number} index - The subtask index
 */
function handleSubtaskDeleteKeydown(event, index) {
    if (event.key === 'Enter' || event.key === ' ') {
        event.preventDefault();
        deleteSubtaskEdit(index);
    }
}

/**
 * Handles keyboard events for subtask save button
 * @param {KeyboardEvent} event - The keyboard event
 * @param {number} index - The subtask index
 */
function handleSubtaskSaveKeydown(event, index) {
    if (event.key === 'Enter' || event.key === ' ') {
        event.preventDefault();
        saveEditedSubtask(index);
    }
}

/**
 * Handles keyboard events for subtask row
 * @param {KeyboardEvent} event - The keyboard event
 * @param {number} index - The subtask index
 */
function handleSubtaskRowKeydown(event, index) {
    if (event.key === 'Enter' || event.key === ' ') {
        event.preventDefault();
        editSubtask(index);
    }
}

/**
 * Handles keyboard events for subtask edit action
 * @param {KeyboardEvent} event - The keyboard event
 * @param {number} index - The subtask index
 */
function handleSubtaskEditActionKeydown(event, index) {
    if (event.key === 'Enter' || event.key === ' ') {
        event.preventDefault();
        editSubtask(index);
    }
}

/**
 * Handles keyboard events for subtask input
 * @param {KeyboardEvent} event - The keyboard event
 */
function handleSubtaskKey(event) {
    if (event.key === 'Enter') {
        event.preventDefault();
        addSubtaskEdit();
    }
}

/**
 * Handles keyboard events for contact selection checkboxes
 * @param {string} contactId - The ID of the contact
 * @param {KeyboardEvent} event - The keyboard event
 */
function handlecontactSelectonCheckboxKeydown(contactId, event) {
    if (event.key === 'Enter' || event.key === ' ') {
        event.preventDefault();
        toggleContactSelection(contactId, event)
    }
}

/**
 * Initializes accessibility features for the edit task form
 * Should be called after the edit overlay is rendered
 */
function initializeEditTaskAccessibility() {
    setupEditFormValidation();
    const editTitle = document.getElementById('edit-title');
    if (editTitle) { setTimeout(() => editTitle.focus(), 100); }
    const dialog = document.querySelector('[role="dialog"]');
    if (dialog) {
        const focusableElements = dialog.querySelectorAll(
            'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
        );
        
        const firstElement = focusableElements[0];
        const lastElement = focusableElements[focusableElements.length - 1];
        
        bindDialogAccessibilityKeys(dialog, firstElement, lastElement);
    }
    const assignedDisplay = document.getElementById('assigned-display-edit');
    if (assignedDisplay) {
        assignedDisplay.setAttribute('aria-expanded', 'false');
    }
}

/**
 * Binds keyboard accessibility features to a dialog element
 * Manages tab cycling within the dialog and escape key handling
 * @param {HTMLElement} dialog - The dialog element to bind keyboard events to
 * @param {HTMLElement} firstElement - The first focusable element in the dialog
 * @param {HTMLElement} lastElement - The last focusable element in the dialog
 */
function bindDialogAccessibilityKeys(dialog, firstElement, lastElement) {
    dialog.addEventListener('keydown', (e) => {
        if (e.key === 'Tab') {
            if (e.shiftKey && document.activeElement === firstElement) {
                e.preventDefault();
                lastElement.focus();
            } else if (!e.shiftKey && document.activeElement === lastElement) {
                e.preventDefault();
                firstElement.focus();
            }
        } else if (e.key === 'Escape') {
            closeAddTaskOverlay();
        }
    });
}
