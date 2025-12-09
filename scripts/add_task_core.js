/**
 * Initializes the Add Task page
 */
async function initAddTask() {
    checkLoggedInPageSecurity();
    await eachPageSetCurrentUserInitials();
    editSubtasks = [];
    editAssignedIds = [];
    editPriority = 'medium';
    await loadAndRenderContacts('assigned-dropdown-edit', 'addTask');
    setCheckboxesById();
    setupFormElements();
}

/**
 * Sets up form elements with default values and constraints
 */
function setupFormElements() {
    const dueDateInput = document.getElementById('due-date');
    if (dueDateInput) {
        const todayStr = new Date().toISOString().split('T')[0];
        dueDateInput.setAttribute('min', todayStr);
    }
}

/**
 * Sets up priority button event listeners and interactions
 */
function setupPriorityButtons() {
    let buttons = document.querySelectorAll(".priority-btn");
    buttons.forEach(button => {
        button.addEventListener("click", () => {
            buttons.forEach(btn => btn.classList.remove("active"));
            button.classList.add("active");
        });
    });
}

/**
 * Handles the creation of a new task
 * @param {string} boardCategory - The board category for the new task
 */
async function handleCreateTask(boardCategory, event) {
    if (event) event.preventDefault();
    if (!validateTaskForm()) return;
    const newTask = createTaskObject(boardCategory);
    try {
        await saveTaskToServer(newTask);
        finalizeTaskCreation();
    } catch (error) {
        console.error("Task creation failed:", error);
    }
}

/**
 * Creates a task object with all form data and metadata
 * @param {string} boardCategory - The board category to assign the task to
 * @returns {Object} The complete task object ready for storage
 */
function createTaskObject(boardCategory) {
    return {
        title: document.getElementById('title').value.trim(),
        description: document.getElementById('description').value.trim(),
        dueDate: document.getElementById('due-date').value,
        category: document.getElementById('category').value,
        priority: editPriority,
        assigned: editAssignedIds,
        subtasks: editSubtasks,
        board: boardCategory,
        createdAt: new Date().getTime()
    };
}

/**
 * Saves a task object to the server with auto-generated ID
 * @param {Object} task - The task object to save
 * @returns {Promise<void>} Promise that resolves when task is saved
 */
async function saveTaskToServer(task) {
    const taskPath = `/${activeUserId}/tasks`;
    const nextTaskId = await calcNextId(taskPath);
    await putData(`${taskPath}/${nextTaskId}`, task);
}

/**
 * Finalizes task creation by clearing form and showing success animation
 */
function finalizeTaskCreation() {
    clearForm();
    showSuccessImageAnimation();
}

/**
 * Clears all form inputs and resets form state
 */
function clearForm() {
    resetBaseInputs();
    resetCategory();
    resetAssigned();
    resetSubtasks();
    resetPriority();
    resetValidation();
    enableCreateBtn();
}

/**
 * Resets the basic text inputs (title, description, due date) and subtask input.
 */
function resetBaseInputs() {
    ['title', 'description', 'due-date'].forEach(id => {
        const el = document.getElementById(id);
        if (el) el.value = '';
    });
    const sub = document.getElementById('subtask-input-edit');
    if (sub) sub.value = '';
}

/**
 * Resets the category selection to the default placeholder state.
 */
function resetCategory() {
    document.getElementById('category-text').innerHTML = 'Select task category';
    document.getElementById('category').value = '';
}

/**
 * Clears the assigned contacts list, resets the dropdown, and updates the UI.
 */
function resetAssigned() {
    editAssignedIds = [];
    const disp = document.getElementById('assigned-display-edit');
    if (disp) disp.innerHTML = `
        <p>Select contacts to assign</p>
        <img id="arrow-icon-edit" src="/assets/icons/arrow_drop_down.svg" class="dropdown-icon" aria-hidden="true">
    `;
    const dd = document.getElementById('assigned-dropdown-edit');
    if (dd) {
        dd.innerHTML = '';
        loadAndRenderContacts('assigned-dropdown-edit', 'addTask')
            .then(() => setCheckboxesById());
    }
    renderAssignedEditCircles();
}

/**
 * Clears the temporary subtask array and resets the subtask UI elements.
 */
function resetSubtasks() {
    editSubtasks = [];
    renderSubtasksEditMode();
    resetMainSubtaskIcons();
}

/**
 * Resets the priority selection to the default value ('medium') and updates the UI.
 */
function resetPriority() {
    editPriority = 'medium';
    updatePrioUI('medium');
}

/**
 * Removes all visual error indicators and validation messages from the form.
 */
function resetValidation() {
    document.querySelectorAll('.input-error').forEach(el => el.classList.remove('input-error'));
    document.querySelectorAll('.visible').forEach(el => el.classList.remove('visible'));
}

/**
 * Re-enables the create task button.
 */
function enableCreateBtn() {
    const btn = document.getElementById('create-btn');
    if (btn) btn.disabled = false;
}

/**
 * Toggles the contact dropdown with accessibility features
 * Set and find IDs in Dom, and toggle only, when dropdown exists
 */
function toggleContactDropdown(dropdownId, displayId, arrowId) {
    const idDropdown = dropdownId || 'assigned-dropdown';
    const idDisplay = displayId || 'assigned-display';
    const idArrow = arrowId || 'arrow-icon';
    let dropdown = document.getElementById(idDropdown);
    let display = document.getElementById(idDisplay);
    let arrow = document.getElementById(idArrow);
    if (!dropdown) {
        console.warn(`FEHLER: Das Element mit der ID '${idDropdown}' existiert nicht im DOM!`);
        return;
    }
    dropdown.style.display === 'none' || dropdown.style.display === '' ? toggleIfDropdownExist(dropdown, display, arrow) : toggleNotAsDropdownDoesNotExist(dropdown, display, arrow);
}

/**
 * Hides the dropdown when it doesn't exist or should be closed
 * @param {HTMLElement} dropdown - The dropdown element to hide
 * @param {HTMLElement} display - The display element to update ARIA state
 * @param {HTMLElement} arrow - The arrow element for rotation styling
 */
function toggleNotAsDropdownDoesNotExist(dropdown, display, arrow) {
    dropdown.style.display = 'none';
    if (display) display.setAttribute('aria-expanded', 'false');
    if (arrow) arrow.classList.remove('rotate-180');
}

/**
 * Shows the dropdown when it exists and should be opened
 * @param {HTMLElement} dropdown - The dropdown element to show
 * @param {HTMLElement} display - The display element to update ARIA state
 * @param {HTMLElement} arrow - The arrow element for rotation styling
 */
function toggleIfDropdownExist(dropdown, display, arrow) {
    dropdown.style.display = 'block';
    if (display) display.setAttribute('aria-expanded', 'true');
    if (arrow) arrow.classList.add('rotate-180');
}

/**
 * Saves an edited task to the backend
 * @param {string} taskId - The ID of the task to save
 */
async function saveEditedTask(taskId) {
    if (!validateEditInputs()) return;
    const oldTask = tasks.find(t => t.id === taskId);
    if (!oldTask) return;
    try {
        await putData(`/${activeUserId}/tasks/${taskId}`, getMergedTaskData(oldTask));
        await refreshBoardAfterEdit();
    } catch (error) {
        console.error("Save failed:", error);
    }
}

/**
 * Validates a single input field and updates its visual error state.
 * @param {string} inputId - The DOM ID of the input field.
 * @param {string} errorId - The DOM ID of the error message container.
 * @param {string} msg - The error message text to display.
 * @returns {boolean} True if the input is valid, false if empty/invalid.
 */
function checkInput(inputId, errorId, msg) {
    const input = document.getElementById(inputId);
    const error = document.getElementById(errorId);
    const isInvalid = !input || input.value.trim() === "";
    if (input) input.classList.toggle('input-error', isInvalid);
    if (error) {
        error.textContent = isInvalid ? msg : "";
        error.classList.toggle('visible', isInvalid);
    }
    return !isInvalid;
}



/**
 * Merges old task data with edited form values
 * @param {Object} oldTask - The original task object
 * @returns {Object} The merged task data with updated values
 */
function getMergedTaskData(oldTask) {
    return {
        ...oldTask,
        title: document.getElementById('edit-title').value,
        description: document.getElementById('edit-description').value,
        dueDate: document.getElementById('edit-due-date').value,
        category: document.getElementById('category').value == '' ? oldTask.category : document.getElementById('category').value,
        priority: editPriority,
        assigned: editAssignedIds,
        subtasks: editSubtasks
    };
}

/**
 * Triggers validation for all required fields in the edit task form.
 * Ensures all error messages are displayed if fields are missing.
 * @returns {boolean} True only if ALL required fields are valid.
 */
function validateEditInputs() {
    const titleValid = checkInput('edit-title', 'edit-title-error', 'Title is required');
    const dateValid = checkInput('edit-due-date', 'edit-due-date-error', 'Date is required');
    return titleValid && dateValid;
}

/**
 * Refreshes the board view after editing a task
 * @async
 */
async function refreshBoardAfterEdit() {
    closeAddTaskOverlay();
    tasks = await fetchAndAddIdAndRemoveUndefinedContacts();
    renderTasks(tasks);
}

/**
 * Sets the priority for task editing with accessibility features
 * @param {string} newPrio - The new priority level
 */
function setEditPrio(newPrio) {
    editPriority = newPrio;
    ['urgent', 'medium', 'low'].forEach(p => {
        const button = document.getElementById('prio-' + p);
        if (button) {
            button.classList.remove('active');
            button.setAttribute('aria-checked', 'false');
        }
    });
    const activeButton = document.getElementById('prio-' + newPrio);
    if (activeButton) {
        setEditPrioSetActivePriorityButton(activeButton, newPrio);
    }
}

/**
 * Sets the active priority button with accessibility features
 * @param {HTMLElement} activeButton - The button element to set as active
 * @param {string} newPrio - The new priority level
 */
function setEditPrioSetActivePriorityButton(activeButton, newPrio) {
    activeButton.classList.add('active');
    activeButton.setAttribute('aria-checked', 'true');
    const announcement = document.createElement('div');
    announcement.setAttribute('aria-live', 'polite');
    announcement.className = 'sr-only';
    announcement.textContent = `Priority changed to ${newPrio}`;
    document.body.appendChild(announcement);
    setTimeout(() => {
        if (announcement.parentNode) {
            announcement.parentNode.removeChild(announcement);
        }
    }, 1000);
}

/**
 * Toggles assignment of a user to the task being edited
 * @param {string} userId - The ID of the user to toggle
 */
function toggleEditAssign(userId) {
    let index = editAssignedIds.indexOf(userId);
    if (index === -1) {
        editAssignedIds.push(userId);
    } else {
        editAssignedIds.splice(index, 1);
    }
    renderAssignedEditCircles();
}