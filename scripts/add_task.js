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

function setupFormElements() {
    const dueDateInput = document.getElementById('due-date');
    if (dueDateInput) {
        const todayStr = new Date().toISOString().split('T')[0];
        dueDateInput.setAttribute('min', todayStr);
    }
}

/** Setup priority buttons */
function setupPriorityButtons() {
    let buttons = document.querySelectorAll(".priority-btn");
    buttons.forEach(button => {
        button.addEventListener("click", () => {
            buttons.forEach(btn => btn.classList.remove("active"));
            button.classList.add("active");
        });
    });
}

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

/** Clear form */
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

/** Post data to backend */
async function putData(path = "", data = {}) {
    try {
        let response = await fetch(BASE_URL + path + ".json", {
            method: "PUT", headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify(data)
        });
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
    } catch (error) {
        console.error("Error posting data:", error);
        throw error;
    }
}

function toggleContactDropdown() {
    let dropdown = document.getElementById('assigned-dropdown');
    dropdown.style.display = dropdown.style.display === 'none' ? 'block' : 'none';
}

function renderAddTAskOverlay() {
    let overlay = document.getElementById("add-task-overlay");
    overlay.innerHTML = getAddTaskOverlayTemplate();
}

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
        title: document.getElementById('title').value,
        description: document.getElementById('description').value,
        dueDate: document.getElementById('due-date').value,
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

function setEditPrio(newPrio) {
    editPriority = newPrio;
    ['urgent', 'medium', 'low'].forEach(p => {
        document.getElementById('prio-' + p).classList.remove('active');
    });
    document.getElementById('prio-' + newPrio).classList.add('active');
}

function toggleEditAssign(userId) {
    let index = editAssignedIds.indexOf(userId);
    if (index === -1) {
        editAssignedIds.push(userId);
    } else {
        editAssignedIds.splice(index, 1);
    }
    renderAssignedEditCircles();
}

function editSubtask(index) {
    editingSubtaskIndex = index;
    renderSubtasksEditMode();
}

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

function deleteSubtaskEdit(index) {
    editSubtasks.splice(index, 1);
    editingSubtaskIndex = -1;
    renderSubtasksEditMode();
}

function resetMainSubtaskIcons() {
    let container = document.getElementById('main-subtask-icons');
    container.innerHTML = '';
}

function cancelMainSubtaskInput() {
    let input = document.getElementById('subtask-input-edit');
    input.value = '';
    input.blur();
    resetMainSubtaskIcons();
}

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
        // Fehler
        input.classList.add('input-error');
        errorMsg.classList.add('visible');
        return false;
    } else {
        // OK
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