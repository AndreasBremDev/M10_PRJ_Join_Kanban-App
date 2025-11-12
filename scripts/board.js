let urlParams = new URLSearchParams(window.location.search);
let activeUserId = urlParams.get('activeUserId') || 0;
let currentDraggedId;

async function init() {
    await fetchTasks(activeUserId = 0);
    await renderTasks()
}

async function fetchTasks(activeUserId = 0) {
    try {
        let res = await fetch(BASE_URL + "/" + activeUserId + "/tasks" + ".json");
        let tasks = await res.json();
        let tasksWithId = Object.entries(tasks).map(([id, taskData]) => ({
            id: id,
            ...taskData
        }));
        return tasksWithId
    } catch (error) {
        console.log("Error fetchTasks(): ", error);
    }
}

async function renderTasks() {
    let tasksWithId = await fetchTasks();
    let categories = {
        'categoryToDo': tasksWithId.filter(cat => cat.board === "toDo") || [],
        'categoryInProgress': tasksWithId.filter(cat => cat.board === "inProgress") || [],
        'categoryAwaitFeedback': tasksWithId.filter(cat => cat.board === "awaitFeedback") || [],
        'categoryDone': tasksWithId.filter(cat => cat.board === "done") || []
    }
    Object.entries(categories).forEach(([htmlContainerId, tasksWithId]) => {
        const container = document.getElementById(htmlContainerId);
        tasksWithId.length === 0 ? container.innerHTML = renderTasksHtmlEmptyArray(htmlContainerId) : container.innerHTML = tasksWithId.map(task => renderTasksHTML(task)).join('');
    });
}

function categoryColor(task) {
    if (task.category === 'User Story') {
        return "blue"
    } else {
        return "turquoise"
    }
}

function dragstartHandler(event, id) {
    currentDraggedId = id;
    event.target.style.transform = 'rotate(2deg)';
}

function dragoverHandler(ev) {
    ev.preventDefault();
    toggleStyle(ev);
}

function dragendHandler(event) {
    event.target.style.transform = '';
}

function toggleStyle(ev) {
    ev.preventDefault();
    const targetDiv = ev.target.closest('.draggable');
    if (!targetDiv) return;
    const elements = document.querySelectorAll('.draggable');
    elements.forEach(el => el.classList.remove('highlight'));
    if (ev.type === 'dragover') {
        targetDiv.classList.add('highlight');
    }
}

async function moveTo(category) {
    try {
        let result = await putData('/' + activeUserId + '/tasks/' + currentDraggedId + '/board', category);
        renderTasks();
    } catch (error) {
        console.error('Error moveTask():', error);
    }
    const elements = document.querySelectorAll('.draggable');
    elements.forEach(el => el.classList.remove('highlight'));
}
