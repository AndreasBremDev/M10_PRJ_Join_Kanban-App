async function initAddTask() {
    checkLoggedInPageSecurity();
    await eachPageSetCurrentUserInitials();
    
    await loadAndRenderContacts('assigned-dropdown-edit', 'addTask');
    setupPriorityButtons();
    setupFormElements();
    setCheckboxesById();
    editSubtasks = [];
    editAssignedIds = [];
    editPriority = 'medium';
    
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

/** Handle create task */
async function handleCreateTask(boardCategory) {
 let title = document.getElementById('title').value.trim();
    let description = document.getElementById('description').value.trim();
    let dueDate = document.getElementById('due-date').value;
    let categoryElement = document.getElementById('category');
    let category = categoryElement ? categoryElement.value : '';

    if (title && dueDate && category) {
        let newTask = {
            title: title,
            description: description,
            dueDate: dueDate,
            category: category,
            priority: editPriority,     
            assigned: editAssignedIds,  
            subtasks: editSubtasks,     
            board: boardCategory,
            createdAt: new Date().getTime()
        };
    try {
        let taskPath = `/${activeUserId}/tasks`;
        let nextTaskId = await calcNextId(taskPath);
        await putData(`${taskPath}/${nextTaskId}`, newTask);
        clearForm(); 
    } catch (error) {
        console.error("Error creating task:", error);
    }
 }
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
}

/** Post data to backend */
async function putData(path = "", data = {}) {
    try {

        let response = await fetch(BASE_URL + path + ".json", {
            method: "PUT",
            headers: {
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
        for (let i = 0; i < 5; i++) {
            let userId = editAssignedIds[i];
            let contact = contacts.find(c => c.id == userId); 
            if (contact) {
                container.innerHTML += renderContactCircle(contact);
            }
        }
        let remainingCount = editAssignedIds.length - 5;
        container.innerHTML += `
            <div class="user-circle-intials" style="background-color: #2A3647; color: white;">
                +${remainingCount}
            </div>`;
    } else {
        editAssignedIds.forEach(userId => {
            let contact = contacts.find(c => c.id == userId);
            if (contact) {
                container.innerHTML += renderContactCircle(contact);
            } else {
                console.warn("Kontakt nicht gefunden für ID:", userId);
            }
        });
    }
}


async function saveEditedTask(taskId) {
    let title = document.getElementById('title').value;
    let description = document.getElementById('description').value;
    let dueDate = document.getElementById('due-date').value;
    let oldTask = tasks.find(t => t.id === taskId);
    let updatedTask = {
        ...oldTask,             
        title: title,             
        description: description, 
        dueDate: dueDate,         
        priority: editPriority,  
        assigned: editAssignedIds,
        subtasks: editSubtasks   
    };
    try {
        await putData(`/${activeUserId}/tasks/${taskId}`, updatedTask);
        closeAddTaskOverlay();
        tasks = await fetchAndAddIdAndRemoveUndefinedContacts(); 
        await renderTasks(tasks); 
    } catch (error) {
        console.error("Can't save:", error);
    }
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
    
    if (dropdown.style.display === 'block') {
        dropdown.style.display = 'none';
    } else {
        dropdown.style.display = 'block';
    }
}
//

function setCheckboxesById() {
    let container = document.getElementById('assigned-dropdown-edit');
    if (!container) return;
    let checkboxes = container.getElementsByTagName('input');
    for (let i = 0; i < checkboxes.length; i++) {
        let cb = checkboxes[i];
        cb.checked = editAssignedIds.includes(cb.value);
        cb.onclick = function(e) {
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