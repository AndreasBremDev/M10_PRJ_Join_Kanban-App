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
    document.getElementById("task-form").reset();
    document.getElementById('category-text').innerHTML = 'Select task category';
    document.getElementById('category').value = '';
    editSubtasks = [];
    editAssignedIds = [];
    editPriority = 'medium';
    renderAssignedEditCircles();
    renderSubtasksEditMode();
    setCheckboxesById();
    updatePrioUI('medium');
    document.querySelectorAll('.input-error').forEach(el => el.classList.remove('input-error'));
    document.querySelectorAll('.visible').forEach(el => el.classList.remove('visible'));
    let btn = document.getElementById('create-btn');
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
    const oldTask = tasks.find(t => t.id === taskId);
    const updatedTask = getMergedTaskData(oldTask);
    try {
        await putData(`/${activeUserId}/tasks/${taskId}`, updatedTask);
        await refreshBoardAfterEdit();
    } catch (error) {
        console.error("Save failed:", error);
    }
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
        priority: editPriority,
        assigned: editAssignedIds,
        subtasks: editSubtasks
    };
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
    
    // Update visual classes and ARIA attributes
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
 */
function resetGlobalVariables() {
    editSubtasks = [];
    editAssignedIds = [];
    editPriority = 'medium';
}

/**
 * Resets all custom UI components to their default state
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
 */
function resetCategoryInput() {
    const categoryText = document.getElementById('category-text');
    const categoryInput = document.getElementById('category');

    if (categoryText) categoryText.innerHTML = 'Select task category';
    if (categoryInput) categoryInput.value = '';
}

/**
 * Resets all validation visual indicators and enables create button
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
 * @param {string} category - The category to select
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