async function initAddTask() {
    await eachPageSetcurrentUserInitials();
    loadContacts();
    setupPriorityButtons();   
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

function toggleDropDownMenu() {
    let userMenu = document.getElementById('user-menu');
    userMenu.classList.toggle('show');
    if (!isUserMenuListenerAdded) {
        document.addEventListener('click', function (event) {
            let userMenu = document.getElementById('user-menu');
            let userCircle = document.querySelector('.user-circle');
            if (!userCircle.contains(event.target) && !userMenu.contains(event.target)) {
                userMenu.classList.remove('show');
            }
        });

        isUserMenuListenerAdded = true;
    }
}

function toggleContactDropdown() {
    let dropdown = document.getElementById('assigned-dropdown');
    dropdown.style.display = dropdown.style.display === 'none' ? 'block' : 'none';
}

/** function to calculate the next taskId 
async function calcNextId(path) {
    let res = await fetch(`${BASE_URL}${path}.json`);
    let resJson = await res.json();

    if (!resJson) return 1;

    let keys = Object.keys(resJson).map(Number);
    let nextId = Math.max(...keys) + 1;
    return nextId;
}*/


/** Load data from backend */
async function loadData(path = "") {
    try {
        let response = await fetch(BASE_URL + path + ".json");
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        return await response.json();
    } catch (error) {
        console.error("Error loading data:", error);
    }
}

async function loadContacts() {
    let dropdownContainer = document.getElementById("assigned-dropdown");
    dropdownContainer.innerHTML = ''; // Leere den Container

    try {
        let contacts = await loadData(`/${activeUserId}/contacts`);

        if (contacts) {
            Object.keys(contacts).forEach(key => {
                const contact = contacts[key];

                if (contact && contact.name) {
                    // Erstelle Label und Checkbox für jeden Kontakt
                    let contactItem = document.createElement('label');
                    contactItem.className = 'contact-item';

                    // Checkbox
                    let checkbox = document.createElement('input');
                    checkbox.type = 'checkbox';
                    checkbox.value = key; // Speichere die ID

                    // Text
                    let textSpan = document.createElement('span');
                    textSpan.textContent = contact.name;

                    contactItem.appendChild(checkbox);
                    contactItem.appendChild(textSpan);
                    dropdownContainer.appendChild(contactItem);
                }
            });
        }
    } catch (error) {
        console.error("Could not load contacts:", error);
        dropdownContainer.innerHTML = '(Error loading contacts)';
    }
}

/** Setup form buttons 
function setupFormButtons() {
    let createBtn = document.getElementById("create-btn");
    let clearBtn = document.getElementById("clear-btn");

    createBtn.addEventListener("click", handleCreateTask);
    clearBtn.addEventListener("click", clearForm);
} */


//overlay add_task


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
