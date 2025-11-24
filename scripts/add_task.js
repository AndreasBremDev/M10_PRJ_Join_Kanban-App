async function initAddTask() {
    checkLoggedInPageSecurity();
    await eachPageSetCurrentUserInitials();
    await loadAndRenderContacts('assigned-dropdown', 'addTask');
    setupPriorityButtons();
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

/** Handle create task */
async function handleCreateTask(boardCategory) {
    let board = boardCategory;
    let title = document.getElementById("title").value.trim();
    let description = document.getElementById("description").value.trim();
    let dueDate = document.getElementById("due-date").value;
    let category = document.getElementById("category").value;
    let checkedBoxes = document.querySelectorAll('#assigned-dropdown input[type="checkbox"]:checked');
    let assigned = Array.from(checkedBoxes).map(checkbox => checkbox.value);
    let subtaskText = document.getElementById("subtask").value.trim();
    let subtasksArray = [];
    if (subtaskText) {
        const rawSubtasks = subtaskText.split('\n').filter(line => line.trim() !== '');
        subtasksArray = rawSubtasks.map((title, index) => ({
            done: "false",
            title: title.trim()
        }));
    }
    let activePriority = document.querySelector(".priority-btn.active");
    let priority = activePriority ? activePriority.classList[1] : "medium";

    if (!title || !dueDate || !category) {
        alert("Please fill in all required fields.");
        return;
    }

    let newTask = {
        title,
        description,
        dueDate,
        category,
        assigned,
        board,
        priority,
        subtasks: subtasksArray,
        createdAt: new Date().toISOString()
    }

    console.log("New Task Created:", newTask);

    try {
        let taskPath = `/${activeUserId}/tasks`;
        let nextTaskId = await calcNextId(taskPath);
        await putData(`${taskPath}/${nextTaskId}`, newTask);
        clearForm();
    } catch (error) {
        console.error("Error creating task:", error);
    }

}




/** Clear form */
function clearForm() {
    document.getElementById("task-form").reset();
    document.querySelectorAll(".priority-btn").forEach(btn => btn.classList.remove("active"));
    document.querySelector(".priority-btn.medium").classList.add("active");
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

// Helper functions for contacts, to sort and render them
function convertAndSortContacts(contactsObj) {
    if (!contactsObj) return [];
    const contactsArray = Object.entries(contactsObj).map(
        ([key, contact]) => ({ id: key, ...contact })
    );
    contactsArray.sort((a, b) =>
        a.name.localeCompare(b.name, 'de', { sensitivity: 'base' })
    );
    return contactsArray;
}

function createContactElement(contact) {
    const label = document.createElement('label');
    label.className = 'contact-item';
    const checkbox = document.createElement('input');
    checkbox.type = 'checkbox';
    checkbox.value = contact.id;
    const span = document.createElement('span');
    span.textContent = contact.name;
    label.appendChild(checkbox);
    label.appendChild(span);
    return label;
}


function renderTaskCard(task) {
    return `
        <div class="task-card" draggable="true">
            <h3>${task.title}</h3>
            <p>${task.description}</p>
            <div class="task-assignees">
                ${task.assignees ? task.assignees.map(a => `<span>${a}</span>`).join('') : ''}
            </div>
        </div>
    `;
}


function renderAddTAskOverlay() {
    let overlay = document.getElementById("add-task-overlay");
    overlay.innerHTML = getAddTaskOverlayTemplate();
}
