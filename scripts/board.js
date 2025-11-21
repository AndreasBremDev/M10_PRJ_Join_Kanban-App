let currentDraggedId;
let autoScrollInterval = null;
let scrollSpeed = 10; // Pixel pro Intervall
let scrollThreshold = 50; // Pixel vom Rand

async function init() {
    checkLoggedInPageSecurity();
    await eachPageSetcurrentUserInitials();
    await renderTasks();
}

async function renderTasks() {
    let tasksWithId = await fetchTasks(activeUserId);
    let categories = {
        'categoryToDo': tasksWithId.filter(cat => cat.board === "toDo") || [],
        'categoryInProgress': tasksWithId.filter(cat => cat.board === "inProgress") || [],
        'categoryAwaitFeedback': tasksWithId.filter(cat => cat.board === "awaitFeedback") || [],
        'categoryDone': tasksWithId.filter(cat => cat.board === "done") || []
    }
    Object.entries(categories).forEach(([htmlContainerId, tasksWithId]) => {
        const container = document.getElementById(htmlContainerId);
        tasksWithId.length === 0 ? container.innerHTML = renderTasksHtmlEmptyArray(htmlContainerId) : container.innerHTML = tasksWithId.map(task => renderTasksCardSmallHtml(task)).join('');
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
    // Auto-scroll während Drag aktivieren
    startAutoScroll();
}

function dragoverHandler(ev) {
    ev.preventDefault();
    toggleStyle(ev);
    // Auto-scroll basierend auf Mausposition
    handleAutoScroll(ev);
}

function dragendHandler(event) {
    event.target.style.transform = '';
    // Auto-scroll stoppen
    stopAutoScroll();
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

async function renderAddTaskOverlay(board = "toDo") {
    let overlay = document.getElementById("add-task-overlay");
    overlay.innerHTML = getAddTaskOverlayTemplate(board);
    overlay.classList.remove('d-none');
    await loadAndRenderContacts('assigned-dropdown', 'addTask');
    setupPriorityButtons();
    setTimeout(() => {
        let section = overlay.querySelector('.add-task-section');
        if (section) {
            section.classList.add('slide-in');
        }
    }, 50);
}

function closeAddTaskOverlay() {
    let overlay = document.getElementById("add-task-overlay");
    let section = overlay.querySelector('.add-task-section');
    if (section) {
        section.classList.remove('slide-in');
    }
    setTimeout(() => {
        overlay.classList.add('d-none');
        overlay.innerHTML = '';
    }, 400);
}

function slideInOverlay() {
    let overlay = document.getElementById("add-task-overlay");
    overlay.classList.add("slide-in");
}


async function renderTaskDetail(taskJson) {
    // let task = JSON.parse(taskJson);
    let task = JSON.parse(atob(taskJson));// Base64-Decoding
    let overlay = document.getElementById("add-task-overlay");
    overlay.innerHTML = getTaskDetailOverlayTemplate(task);
    overlay.classList.remove('d-none');
    // await loadContacts();
    setupPriorityButtons();
    setTimeout(() => {
        let section = overlay.querySelector('.add-task-section');
        if (section) {
            section.classList.add('slide-in');
        }
    }, 50);
    await renderContactsInOverlay();
}

async function deleteTaskfromBoard(taskId)  { 
    try {
        await deleteTask(taskId);
        closeAddTaskOverlay();
        await renderTasks();
    } catch (error) {
        console.error("Error deleting task:", error);
    }
}

async function renderEditTaskDetail() {
    let overlay = document.getElementById("add-task-overlay");
    overlay.innerHTML = editTaskDetailOverlayTemplate();
    overlay.classList.remove('d-none');
    setupPriorityButtons();
}


function renderSubtasks(subtasks) {
  // Konvertiere eingehende subtasks ins Array, falls es ein Objekt mit Keys ist
  const subtasksArray = Array.isArray(subtasks)
    ? subtasks
    : Object.values(subtasks || {});

  // Filtere gültige Einträge (nicht null, haben 'name')
  const validSubtasks = subtasksArray.filter(st => st && st.name);

  // Wenn keine gültigen Subtasks, gib Hinweis zurück
  if (validSubtasks.length === 0) {
    return '<p>No subtasks</p>';
  }

  // Baue HTML-Liste
  const listItems = validSubtasks
    .map(st => `<li>${st.name}</li>`)
    .join('');
    
  return `<ul>${listItems}</ul>`;
}

// Auto-Scroll Funktionen
function startAutoScroll() {
    document.addEventListener('dragover', handleAutoScroll);
}

function stopAutoScroll() {
    document.removeEventListener('dragover', handleAutoScroll);
    if (autoScrollInterval) {
        clearInterval(autoScrollInterval);
        autoScrollInterval = null;
    }
}

function handleAutoScroll(event) {
    const main = document.querySelector('main');
    const rect = main.getBoundingClientRect();
    const mouseY = event.clientY;
    const mouseX = event.clientX;
    
    // Vertikales Scrollen
    if (mouseY < rect.top + scrollThreshold) {
        // Nach oben scrollen
        if (!autoScrollInterval) {
            autoScrollInterval = setInterval(() => {
                main.scrollTop -= scrollSpeed;
            }, 16); // ~60fps
        }
    } else if (mouseY > rect.bottom - scrollThreshold) {
        // Nach unten scrollen
        if (!autoScrollInterval) {
            autoScrollInterval = setInterval(() => {
                main.scrollTop += scrollSpeed;
            }, 16);
        }
    } else {
        // Scrollen stoppen
        if (autoScrollInterval) {
            clearInterval(autoScrollInterval);
            autoScrollInterval = null;
        }
    }
}
