const BASE_URL = "https://join-kanban-app-14634-default-rtdb.europe-west1.firebasedatabase.app/user";
let urlParams = new URLSearchParams(window.location.search);
let activeUserId = urlParams.get('activeUserId') || 0;

function init() {
    renderOverlay();
}

async function renderTasks(activeUserId = 0) {
    try {
        let res = await fetch(BASE_URL + "/" + activeUserId + "/tasks" + ".json");
        let resJson = await res.json();


    } catch (error) {

    }
}

function dragstartHandler(ev) {
    ev.dataTransfer.setData("text", ev.target.id);
}
function dragoverHandler(ev) {
    ev.preventDefault();
    toggleStyle(ev);
}
function toggleStyle(ev) {
    ev.preventDefault();
    const targetDiv = event.target.closest('.draggable');
    if (!targetDiv) return;
    const elements = document.querySelectorAll('.draggable');
    elements.forEach(el => el.classList.remove('highlight'));
    if (ev.type === 'dragover') {
        targetDiv.classList.add('highlight');
    }
}
function dropHandler(ev) {
    ev.preventDefault();
    const data = ev.dataTransfer.getData("text");
    ev.target.closest('.draggable').appendChild(document.getElementById(data));
    const elements = document.querySelectorAll('.draggable');
    elements.forEach(el => el.classList.remove('highlight'));
}



// Array von Arrays mit entspr. Container-IDs:
function renderAllCategoriesOne(tasksData) {
    // Array von Arrays für die 4 Kategorien
    const categoryData = [
        { tasks: tasksData.toDo || [], containerId: 'categoryToDo' },
        { tasks: tasksData.inProgress || [], containerId: 'categoryInProgress' },
        { tasks: tasksData.awaitFeedback || [], containerId: 'categoryAwaitFeedback' },
        { tasks: tasksData.done || [], containerId: 'categoryDone' }
    ];

    // Iteriere durch alle Kategorien
    categoryData.forEach(category => {
        const container = document.getElementById(category.containerId);
        container.innerHTML = ''; // Container leeren

        // Iteriere durch alle Tasks in der aktuellen Kategorie
        category.tasks.forEach(task => {
            container.innerHTML += renderTaskCard(task);
        });
    });
}

/// Objekt-basierter Ansatz:
function renderAllCategoriesTwo(tasksData) {
    const categories = {
        'categoryToDo': tasksData.toDo || [],
        'categoryInProgress': tasksData.inProgress || [],
        'categoryAwaitFeedback': tasksData.awaitFeedback || [],
        'categoryDone': tasksData.done || []
    };

    // Iteriere durch alle Kategorien
    Object.entries(categories).forEach(([containerId, tasks]) => {
        const container = document.getElementById(containerId);
        if (container) {
            container.innerHTML = tasks.map(task => renderTaskCard(task)).join('');
        }
    });
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

function getAddTaskTemplate() {
    return `
       <section class="add-task-section">
            <h1>Add Task</h1>

            <form id="task-form" class="task-form">
                <div class="form-left">
                    <label for="title">Title*</label>
                    <input id="title" type="text" placeholder="Enter a title">

                    <label for="description">Description</label>
                    <textarea id="description" placeholder="Enter a Description"></textarea>

                    <label for="due-date">Due date*</label>
                    <input id="due-date" type="date" required>

                </div>

                <div class="divider"></div>

                <div class="form-right">
                    <label>Priority</label>
                    <div class="priority-buttons">
                        <button type="button" class="priority-btn urgent">
                            Urgent
                            <img src="/assets/icons/prio_urgent_icon.svg" alt="urgent icon">
                        </button>
                        <button type="button" class="priority-btn medium active">
                            Medium
                            <img src="/assets/icons/prio_medium_icon.svg" alt="medium icon">
                        </button>
                        <button type="button" class="priority-btn low">
                            Low
                            <img src="/assets/icons/prio_low_icon.svg" alt="low icon">
                        </button>
                    </div>

                    <label for="assigned">Assigned to</label>
                    <div class="custom-select-container">
                        <div id="assigned-display" class="select-display" onclick="toggleContactDropdown()">
                            Select contacts to assign
                        </div>

                        <div id="assigned-dropdown" class="select-dropdown" style="display: none;">
                        </div>
                    </div>

                    <label for="category">Category*</label>
                    <select id="category" required>
                        <option value="" disabled selected>Select task category</option>
                        <option value="technical">Technical Task</option>
                        <option value="user-story">User Story</option>
                    </select>

                    <label for="subtask">Subtasks</label>
                    <input type="text" id="subtask" placeholder="Add new subtask">
                </div>
            </form>

            <div class="form-footer">

                <p class="form-hint">
                    <span class="required-marker">*</span>This field is required
                </p>


                <div class="form-actions">
                    <button id="clear-btn" type="button" class="clear">Clear ✖</button>
                    <button id="create-btn" type="button" class="create">Create Task ✔</button>
                </div>


            </div>


        </section>
    `;
}

function renderOverlay() {

    let overlay = document.getElementById("add-task-overlay");
    overlay.innerHTML = getAddTaskTemplate();
}