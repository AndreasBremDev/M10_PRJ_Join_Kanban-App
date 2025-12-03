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

function validateTaskForm() {
    const isTitleValid = validateField('title');
    const isDateValid = validateField('due-date');
    const isCategoryValid = validateCategory();
    return isTitleValid && isDateValid && isCategoryValid;
}

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

async function saveTaskToServer(task) {
    const taskPath = `/${activeUserId}/tasks`;
    const nextTaskId = await calcNextId(taskPath);
    await putData(`${taskPath}/${nextTaskId}`, task);
}

function finalizeTaskCreation() {
    clearForm();
    showSuccessImageAnimation();
}

/**
 * Clears all form inputs and resets form state
 */
function clearForm() {
    document.getElementById("task-form").reset();
    editSubtasks = [];
    editAssignedIds = [];
    editPriority = 'medium';
    renderAssignedEditCircles();
    renderSubtasksEditMode();
    setCheckboxesById();
    updatePrioUI('medium');
    document.getElementById('category-text').innerHTML = 'Select task category';
    document.getElementById('category').value = '';
    document.querySelectorAll('.error-text').forEach(el => el.classList.remove('visible'));
    document.querySelectorAll('.input-error').forEach(el => el.classList.remove('input-error'));
}

/**
 * Toggles the visibility of the contact dropdown
 */
// function toggleContactDropdown() {
//     let dropdown = document.getElementById('assigned-dropdown');
//     dropdown.style.display = dropdown.style.display === 'none' ? 'block' : 'none';
// }

/**
 * Toggles the contact dropdown with accessibility features
 */

function toggleContactDropdown(dropdownId, displayId, arrowId) {
    // 1. IDs bestimmen (Parameter nutzen oder Standard für Hauptseite)
    const idDropdown = dropdownId || 'assigned-dropdown';
    const idDisplay = displayId || 'assigned-display';
    const idArrow = arrowId || 'arrow-icon';

    // 2. Elemente im DOM suchen
    let dropdown = document.getElementById(idDropdown);
    let display = document.getElementById(idDisplay);
    let arrow = document.getElementById(idArrow);

    // --- SICHERHEITS-CHECK (WICHTIG!) ---
    if (!dropdown) {
        console.warn(`FEHLER: Das Element mit der ID '${idDropdown}' existiert nicht im DOM!`);
        // Wir brechen hier ab, damit es keinen "Uncaught TypeError" gibt
        return; 
    }
    // -------------------------------------

    // 3. Toggle Logik (wird nur ausgeführt, wenn dropdown existiert)
    if (dropdown.style.display === 'none' || dropdown.style.display === '') {
        // Öffnen
        dropdown.style.display = 'block';
        if (display) display.setAttribute('aria-expanded', 'true');
        if (arrow) arrow.classList.add('rotate-180');
    } else {
        // Schließen
        dropdown.style.display = 'none';
        if (display) display.setAttribute('aria-expanded', 'false');
        if (arrow) arrow.classList.remove('rotate-180');
    }
}

/**
 * Handles keyboard navigation for priority buttons
 * @param {KeyboardEvent} event - The keyboard event
 * @param {string} priority - The current priority level
 */
function handlePriorityKeydown(event, priority) {
    const priorities = ['urgent', 'medium', 'low'];
    const currentIndex = priorities.indexOf(priority);
    
    switch(event.key) {
        case 'ArrowLeft':
        case 'ArrowUp':
            event.preventDefault();
            const prevIndex = currentIndex > 0 ? currentIndex - 1 : priorities.length - 1;
            document.getElementById(`prio-${priorities[prevIndex]}`).focus();
            break;
            
        case 'ArrowRight':
        case 'ArrowDown':
            event.preventDefault();
            const nextIndex = currentIndex < priorities.length - 1 ? currentIndex + 1 : 0;
            document.getElementById(`prio-${priorities[nextIndex]}`).focus();
            break;
            
        case 'Enter':
        case ' ':
            event.preventDefault();
            setPriority(priority);
            break;
    }
}

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
 * Validates the edit task form and shows error messages
 * @returns {boolean} true if form is valid
 */
function validateEditTaskForm() {
    let isValid = true;
    
    // Validate title
    const titleInput = document.getElementById('edit-title');
    const titleError = document.getElementById('edit-title-error');
    if (titleInput && titleError) {
        if (!titleInput.value.trim()) {
            titleError.textContent = 'Title is required';
            titleInput.setAttribute('aria-invalid', 'true');
            isValid = false;
        } else {
            titleError.textContent = '';
            titleInput.setAttribute('aria-invalid', 'false');
        }
    }
    
    // Validate due date
    const dateInput = document.getElementById('edit-due-date');
    const dateError = document.getElementById('edit-due-date-error');
    if (dateInput && dateError) {
        if (!dateInput.value) {
            dateError.textContent = 'Due date is required';
            dateInput.setAttribute('aria-invalid', 'true');
            isValid = false;
        } else {
            const selectedDate = new Date(dateInput.value);
            const today = new Date();
            today.setHours(0, 0, 0, 0);
            
            if (selectedDate < today) {
                dateError.textContent = 'Due date cannot be in the past';
                dateInput.setAttribute('aria-invalid', 'true');
                isValid = false;
            } else {
                dateError.textContent = '';
                dateInput.setAttribute('aria-invalid', 'false');
            }
        }
    }
    
    return isValid;
}

/**
 * Sets up real-time validation for edit form inputs
 */
function setupEditFormValidation() {
    const titleInput = document.getElementById('edit-title');
    if (titleInput) {
        titleInput.addEventListener('blur', () => validateEditTaskForm());
        titleInput.addEventListener('input', () => {
            // Clear error on input
            const titleError = document.getElementById('edit-title-error');
            if (titleError && titleInput.value.trim()) {
                titleError.textContent = '';
                titleInput.setAttribute('aria-invalid', 'false');
            }
        });
    }
    
    const dateInput = document.getElementById('edit-due-date');
    if (dateInput) {
        dateInput.addEventListener('blur', () => validateEditTaskForm());
        dateInput.addEventListener('change', () => validateEditTaskForm());
    }
}

/**
 * Initializes accessibility features for the edit task form
 * Should be called after the edit overlay is rendered
 */
function initializeEditTaskAccessibility() {
    // Set up form validation
    setupEditFormValidation();
    
    // Ensure focus management for dialog
    const editTitle = document.getElementById('edit-title');
    if (editTitle) {
        // Focus the first input when dialog opens
        setTimeout(() => editTitle.focus(), 100);
    }
    
    // Set up keyboard trap for dialog (basic implementation)
    const dialog = document.querySelector('[role="dialog"]');
    if (dialog) {
        const focusableElements = dialog.querySelectorAll(
            'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
        );
        
        const firstElement = focusableElements[0];
        const lastElement = focusableElements[focusableElements.length - 1];
        
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
    
    // Update dropdown ARIA state correctly
    const assignedDisplay = document.getElementById('assigned-display-edit');
    if (assignedDisplay) {
        assignedDisplay.setAttribute('aria-expanded', 'false');
    }
}

/**
 * Renders the add task overlay
 */
function renderAddTAskOverlay() {
    let overlay = document.getElementById("add-task-overlay");
    overlay.innerHTML = getAddTaskOverlayTemplate();
}

/**
 * Renders assigned contact circles in edit overlay
 */
function renderAssignedEditCircles() {
    let container = document.getElementById('user-circle-assigned-edit-overlay');
    if (!container) return;
    container.innerHTML = '';

    if (editAssignedIds.length > 5) {
        renderLimitedCircles(container);
    } else {
        renderAllCircles(container);
    }
}

function renderAllCircles(container) {
    editAssignedIds.forEach(userId => {
        renderSingleCircle(container, userId);
    });
}

function renderLimitedCircles(container) {
    for (let i = 0; i < 5; i++) {
        renderSingleCircle(container, editAssignedIds[i]);
    }
    let remainingCount = editAssignedIds.length - 5;
    renderPlusCircle(container, remainingCount);
}

function renderSingleCircle(container, userId) {
    let contact = contacts.find(c => c.id == userId);
    if (contact) {
        container.innerHTML += renderContactCircle(contact);
    }
}

function renderPlusCircle(container, count) {
    container.innerHTML += `
        <div class="user-circle-intials" style="background-color: #2A3647; color: white;">
            +${count}
        </div>`;
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
        activeButton.classList.add('active');
        activeButton.setAttribute('aria-checked', 'true');
        
        // Announce the change to screen readers
        const announcement = document.createElement('div');
        announcement.setAttribute('aria-live', 'polite');
        announcement.className = 'sr-only';
        announcement.textContent = `Priority changed to ${newPrio}`;
        document.body.appendChild(announcement);
        
        // Remove the announcement after it's been read
        setTimeout(() => {
            if (announcement.parentNode) {
                announcement.parentNode.removeChild(announcement);
            }
        }, 1000);
    }
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


function showSuccessImageAnimation() {
    let toastImg = document.getElementById('success-toast-img');
    if (!toastImg) {
        window.location.href = 'board.html';
        return;
    }
    toastImg.classList.remove('d-none');
    setTimeout(() => {
        toastImg.classList.add('animate-toast-slide-in');
    }, 10);
    setTimeout(() => {
        window.location.href = 'board.html';
    }, 2000);
}

function updatePrioUI(prio) {
    ['urgent', 'medium', 'low'].forEach(p => {
        let btn = document.getElementById('prio-' + p);
        if (btn) {
            btn.classList.remove('active');
        }
    });
    let activeBtn = document.getElementById('prio-' + prio);
    if (activeBtn) {
        activeBtn.classList.add('active');
    }
}

function toggleContactSelection(contactId) {
    toggleEditAssign(contactId);
    updateContactRowVisuals(contactId);
}

function updateContactRowVisuals(contactId) {
    let row = document.getElementById(`contact-row-${contactId}`);
    if (!row) return;
    let isSelected = editAssignedIds.includes(contactId);
    if (isSelected) {
        row.classList.add('selected');
        row.querySelector('.contact-checkbox-icon').innerHTML = getCheckboxCheckedSvg();
    } else {
        row.classList.remove('selected');
        row.querySelector('.contact-checkbox-icon').innerHTML = getCheckboxEmptySvg();
    }
}

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

function validateField(id) {
    let input = document.getElementById(id);
    let errorMsg = document.getElementById(id + '-error');
    if (!input.value.trim()) {
        input.classList.add('input-error');
        errorMsg.classList.add('visible');
        return false;
    } else {
        input.classList.remove('input-error');
        errorMsg.classList.remove('visible');
        return true;
    }
}

function clearError(id) {
    let input = document.getElementById(id);
    let errorMsg = document.getElementById(id + '-error');
    input.classList.remove('input-error');
    errorMsg.classList.remove('visible');
}

function clearForm() {
    document.getElementById("task-form").reset();
    resetGlobalVariables();
    resetCustomUIComponents();
    resetCategoryInput();
    resetValidationVisuals();
}

function resetGlobalVariables() {
    editSubtasks = [];
    editAssignedIds = [];
    editPriority = 'medium';
}

function resetCustomUIComponents() {
    renderAssignedEditCircles();
    renderSubtasksEditMode();
    setCheckboxesById();
    updatePrioUI('medium');
    resetMainSubtaskIcons();
}


function resetCategoryInput() {
    const categoryText = document.getElementById('category-text');
    const categoryInput = document.getElementById('category');

    if (categoryText) categoryText.innerHTML = 'Select task category';
    if (categoryInput) categoryInput.value = '';
}

function resetValidationVisuals() {
    document.querySelectorAll('.input-error')
        .forEach(el => el.classList.remove('input-error'));
    document.querySelectorAll('.visible')
        .forEach(el => el.classList.remove('visible'));
    const btn = document.getElementById('create-btn');
    if (btn) btn.disabled = false;
}

function selectCategory(category) {
    document.getElementById('category-text').innerHTML = category;
    document.getElementById('category').value = category;
    toggleCategoryDropdown();
    let container = document.getElementById('category-display');
    let errorMsg = document.getElementById('category-error');
    container.classList.remove('input-error');
    errorMsg.classList.remove('visible');
}


function validateCategory() {
    let input = document.getElementById('category');
    let container = document.getElementById('category-display');
    let errorMsg = document.getElementById('category-error');
    if (!input.value) {
        container.classList.add('input-error');
        errorMsg.classList.add('visible');
        return false;
    } else {
        container.classList.remove('input-error');
        errorMsg.classList.remove('visible');
        return true;
    }
}