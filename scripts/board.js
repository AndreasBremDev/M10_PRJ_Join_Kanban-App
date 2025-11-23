let currentDraggedId;
let autoScrollInterval = null;
let scrollSpeed = 10;
let scrollThreshold = 50;

async function init() {
    checkLoggedInPageSecurity();
    await eachPageSetCurrentUserInitials();

    let start = performance.now();
    await renderTasks();
    let end = performance.now();
    console.log("Dauer von renderTask in ms: " + (end - start));
}

// FIND right position to inject new code (?!)
// BEFORE fetch(?) / BEFORE work with(?) Tasks --> at renderTasks():
// compare contacts to tasks.assigned
// and delete tasks.assigned.id from firebase
// handle issue "undefined/blanks" tasks.assigned: 0,1, ,3,4.usw.


async function renderTasks() {
    contacts = await fetchAndSortContacts();
    console.log(contacts)
    let tasksObj = await fetchData(`/${activeUserId}/tasks`);
    let tasksWithId = Object.entries(tasksObj || {}).map(([key, contact]) => ({ id: key, ...contact }));
    tasks = tasksWithId;
    console.log(tasks);
    // maybe wrong if-statement // double check
    if (tasks && tasks.length > 0) { tasks = await compareContactsWithTasksAssignedContactsAndCleanUp(tasks) }
    console.log(tasks);
    
    let categories = {
        'categoryToDo': tasks.filter(cat => cat.board === "toDo") || [],
        'categoryInProgress': tasks.filter(cat => cat.board === "inProgress") || [],
        'categoryAwaitFeedback': tasks.filter(cat => cat.board === "awaitFeedback") || [],
        'categoryDone': tasks.filter(cat => cat.board === "done") || []
    }
    Object.entries(categories).forEach(([htmlContainerId, tasks]) => {
        const container = document.getElementById(htmlContainerId);
        tasks.length === 0 ? container.innerHTML = renderTasksHtmlEmptyArray(htmlContainerId) : container.innerHTML = tasks.map(task => renderTasksCardSmallHtml(task)).join('');
    });
}

async function compareContactsWithTasksAssignedContactsAndCleanUp(tasks) {
    for (let i = 0; i < tasks.length; i++) {
        if (tasks[i].assigned && Array.isArray(tasks[i].assigned)) {
            for (let j = 0; j < tasks[i].assigned.length; j++) {
                let contactIndex = contacts.indexOf(contacts.find(c => c.id === tasks[i].assigned[j]));
                if (contactIndex === -1) {
                    await deletePath(`/${activeUserId}/tasks/${tasks[i].id}/assigned/${j}`);
                }
            }
        }
    }
    return tasks;
}


function checkForAndDisplaySubtasks(task) {
    if (task.subtasks) {
        let totalSubtasks = task.subtasks.length;
        let doneSubtasks = task.subtasks.filter(d => d.done === true).length;
        return renderTaskCardSubtaskProgress(doneSubtasks, totalSubtasks);
    } else {
        return "";
    }
}

function checkForAndDisplayUserCircles(task) {
    let arrAssigned = task.assigned;
    let html = '';
    if (arrAssigned && arrAssigned.length > 0 && arrAssigned.length <= 5) {
        html += renderTaskCardAssignedSectionGrid(arrAssigned);
        for (let i = 0; i < arrAssigned.length; i++) {
            html = createInitialCircle(arrAssigned, i, html);
        }
        html += `</div>`
        return html
    } else if (arrAssigned && arrAssigned.length > 5) {
        html += renderTaskCardAssignedSectionGridMoreThanFive();
        for (let i = 0; i < 5; i++) {
            html = createInitialCircle(arrAssigned, i, html);
        }
        additionalAssigned = `+${arrAssigned.length - 5}`;
        const color = '#2A3647';
        html += renderTaskCardAssignedSectionInitials(additionalAssigned, color)
        html += `</div>`
        return html
    } else {
        return '<div></div>';
    }
}

/** creates the initials circles, within a for loop, 
 * and writes html-code into the string variable html
 * 
 * @param {Typ[]} arrAssigned 
 * @param {number} i 
 * @param {string} html 
 * @returns {string} to be rendered HTML-String.
 */
function createInitialCircle(arrAssigned, i, html) {
    let contactIndex = contacts.indexOf(contacts.find(c => c.id === arrAssigned[i]));
    const color = contactCircleColor[arrAssigned[i] % contactCircleColor.length];
    if (contactIndex !== -1) {
        let initials = getInitials(contacts[contactIndex].name);
        html += renderTaskCardAssignedSectionInitials(initials, color);
    } else {
        html += '';
    }
    return html;
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
    startAutoScroll();
}

function dragoverHandler(ev) {
    ev.preventDefault();
    toggleStyle(ev);
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
    await loadContacts();
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
    setupPriorityButtons();
    setTimeout(() => {
        let section = overlay.querySelector('.add-task-section');
        if (section) {
            section.classList.add('slide-in');
        }
    }, 50);
    await renderContactsInOverlay(); // Note: all contacts for activeUserId -> innerHTML: overlayContactContainer
}

/**
 * Render contact circles in the overlay container.
 * Fetches contacts, generates initials, and displays them with colored circles.
 */
async function renderContactsInOverlay() {
    const contactsObject = await fetchContactsForOverlay(); // all contacts for activeUserId
    if (!contactsObject) return;
    const container = document.getElementById('overlayContactContainer');
    container.innerHTML = Object.values(contactsObject).map((contact, index) => {
        const color = contactCircleColor[index % contactCircleColor.length];
        const initials = getInitials(contact.name);
        return `
        <div class="contact-row" style="display: flex; align-items: center; gap: 12px; margin-bottom: 8px;">
        <div class="user-circle-intials" style="background-color: ${color};">${initials}</div>
        <div style="font-size: 18px;">${contact.name}</div>
        </div>`;
    }).join('');
}

async function deleteTaskfromBoard(taskId) {
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

////////// to be refactor'd (check/remove comments) ///////////
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

////////// to be refactor'd (>14 lines) ///////////
function handleAutoScroll(event) {
    // Auto-scroll basierend auf Mausposition
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
