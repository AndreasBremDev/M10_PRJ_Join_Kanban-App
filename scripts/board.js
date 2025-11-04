const BASE_URL = "https://join-kanban-app-14634-default-rtdb.europe-west1.firebasedatabase.app/user";
let urlParams = new URLSearchParams(window.location.search);
let activeUserId = urlParams.get('activeUserId');

async function renderTasks(activeUserId = 0) {
    try {
        let res = await fetch(BASE_URL + "/" + activeUserId + "/tasks" + ".json");
        let resJson = await res.json();
        console.log(resJson);

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