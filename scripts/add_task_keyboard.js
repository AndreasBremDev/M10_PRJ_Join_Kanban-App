/**
 * Add Task Keyboard Event Handlers and Accessibility Features
 * Contains all keyboard navigation and accessibility functions for the add task module
 */



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
 * Handles keyboard events for subtask add button
 * @param {KeyboardEvent} event - The keyboard event
 * @param {string} priority - The priority level to select
 */
function handlePrioritySelectionKeydown(event, priority) {
    if (event.key === 'Enter' || event.key === ' ') {
        event.preventDefault();
        setEditPrio(priority);
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
 * Handles keyboard events for contact selection checkboxes
 * @param {string} contactId - The ID of the contact
 * @param {KeyboardEvent} event - The keyboard event
 */
function handleContactSelectionCheckboxKeydown(contactId, event) {
    let element = event.target;
    let parent = element.parentElement.parentElement;  
    let lastLastElementChild = parent.lastElementChild.lastElementChild;    
    if (event.key === 'Enter' || event.key === ' ') {
        event.preventDefault();
        toggleContactSelection(contactId, event)
    } else if (event.key === 'Escape' || element === lastLastElementChild) {
        event.preventDefault();
        toggleCustomDropdown('assigned-display-edit', 'assigned-dropdown-edit', 'assigned-arrow');
    }
}

/**
 * Handles keyboard events for category selection
 * @param {KeyboardEvent} event - The keyboard event
 * @param {string} category - The category to select
 */
function handleCategorySelectionKeydown(event, category) {
    let element = event.target;
    let parent = element.parentElement;   
    if (event.key === 'Enter' || event.key === ' ') {
        event.preventDefault();
        selectCategory(category);
    } else if (event.key === 'Escape' || element === parent.lastElementChild) {
        event.preventDefault();
        toggleCustomDropdown('category-display', 'category-options', 'category-arrow');
    }
}


/**
 * Initializes accessibility features for the edit task form
 * Should be called after the edit overlay is rendered
 */
function initializeEditTaskAccessibility() {
    setupEditFormValidation();
    const editTitle = document.getElementById('title');
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
