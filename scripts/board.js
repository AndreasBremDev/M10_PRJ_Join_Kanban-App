let currentDraggedId;
let autoScrollInterval = null;
let scrollSpeed = 10;
let scrollThreshold = 50;

async function init() {
    checkLoggedInPageSecurity();
    await eachPageSetCurrentUserInitials();
    await renderTasks();
}

async function renderTasks() {
    contacts = await fetchAndSortContacts();
    let tasksObj = await fetchData(`/${activeUserId}/tasks`);
    let tasksWithId = Object.entries(tasksObj || {}).map(([key, contact]) => ({ id: key, ...contact }));
    sortOutUndefined(tasksWithId);
    tasks = tasksWithId;
    // console.log(tasksWithId[0].assigned);
    if (tasksWithId && tasksWithId.length > 0) { tasksWithId = await compareContactsWithTasksAssignedContactsAndCleanUp(tasksWithId) }

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

function sortOutUndefined(tasksWithId) {
    for (let i = 0; i < tasksWithId.length; i++) {
        if (tasksWithId[i].assigned !== undefined) {
            let tasksAssignedFiltered = []
            let assignedArr = tasksWithId[i].assigned
            for (let j = 0; j < assignedArr.length; j++) {
                if (assignedArr[j] !== null) {
                    tasksAssignedFiltered.push(assignedArr[j])
                }
            }
            tasksWithId[i].assigned = tasksAssignedFiltered;
        }
    }
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
        // if (overlay === 'overlay') { html += `<div>${contacts[contactIndex].name}</div>`} // eine DIv mit allen circles und name
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
    setupPriorityButtons();
    setTimeout(() => {
        let section = overlay.querySelector('.add-task-section');
        if (section) {
            section.classList.add('slide-in');
        }
    }, 50);
    renderContactsInOverlay(task); // Note: all contacts for activeUserId -> innerHTML: overlayContactContainer
}

/**
 * Render contact circles in the overlay container.
 * Fetches contacts, generates initials, and displays them with colored circles.
 */


function renderContactsInOverlay(task) {
    const container = document.getElementById('overlayContactContainer');
    let arrAssigned = task.assigned;
    let html = '';

    if (arrAssigned && arrAssigned.length > 0) {
        for (let i = 0; i < arrAssigned.length; i++) {
            let contactId = arrAssigned[i]; // holen die ID raus
            let contact = contacts.find(c => c.id === contactId); //das ganze contact object wird anhand der ID gesucht

            if (contact) {
                let color = contactCircleColor[contact.id % contactCircleColor.length]; // Farbe anhand contact.id berechnen 

                let initials = getInitials(contact.name);
                //baue pro contact eigen Div 
                html += `
                <div class="overlay-contact-row">  
                    <div class="user-circle-intials" style="background-color: ${color}">${initials}</div>
                    <span>${contact.name}</span>
                </div>
                `;
            }
        }

    } else {
        html = '<span class="gray-text">No contact assigned</span>';
    }
    container.innerHTML = html;
}

// function renderContactsInOverlay(task) {
//     const container = document.getElementById('overlayContactContainer');
//     let arrAssigned = task.assigned;
//     let html = '';
//     if (arrAssigned && arrAssigned.length > 0) {
//         html += `<div class="rendered-assigned-contacts-names">`
//         for (let i = 0; i < arrAssigned.length; i++) {
//             html = createInitialCircle(arrAssigned, i, html, 'overlay');
//         }
//         html += `</div>`
//     }

//     container.innerHTML = html;

// }

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

function renderSubtasksForOverlay(task) {
    if (!task.subtasks || task.subtasks.length === 0) {
        return '<div>No subtasks</div>';
    }
    let html = '<div class="subtask-list-overlay">';
    for (let i = 0; i < task.subtasks.length; i++) {
        let subtask = task.subtasks[i];
        if (!subtask) continue;
        let subtaskTitle = subtask.title || subtask.name || "Unnamed Subtask"; // subtasks has title or name (old vs. new version)
        let isChecked = subtask.done === true || subtask.done === 'true';
        let icon = isChecked ? getCheckIcon() : getUncheckIcon();
       html += generateSubtaskRowHtml(task.id, i, subtaskTitle, icon, isChecked);
    }
    html += '</div>';
    return html;
}


async function toggleSubtask(taskId, subtaskIndex) {  //taskId = place to save  | subtaskIndex = which subtask
    let task = tasks.find(t => t.id === taskId); // find the task by its ID
    if (!task || !task.subtasks) return;
    let currentStatus = task.subtasks[subtaskIndex].done === true || task.subtasks[subtaskIndex].done === 'true'; // setting string or boolean true
    let newStatus = !currentStatus; //toggle
    task.subtasks[subtaskIndex].done = newStatus; // update local task object | manipulate the local object first and then update the Firebase 
    try {
        await putData(`/${activeUserId}/tasks/${taskId}/subtasks/${subtaskIndex}/done`, newStatus);
        const taskJson = btoa(JSON.stringify(task)); // Base64-Encoding
        renderTaskDetail(taskJson);
        renderTasks();
    } catch (error) {
        console.error("Update failed:", error);
    }
}



// ////////// to be refactor'd (check/remove comments) ///////////
// function renderSubtasks(subtasks) {
//     // Konvertiere eingehende subtasks ins Array, falls es ein Objekt mit Keys ist
//     const subtasksArray = Array.isArray(subtasks)
//         ? subtasks
//         : Object.values(subtasks || {});

//     // Filtere gültige Einträge (nicht null, haben 'name')
//     const validSubtasks = subtasksArray.filter(st => st && st.name); // just with name , newer one has title

//     // Wenn keine gültigen Subtasks, gib Hinweis zurück
//     if (validSubtasks.length === 0) {
//         return '<p>No subtasks</p>';
//     }

//     // Baue HTML-Liste
//     const listItems = validSubtasks
//         .map(st => `<li>${st.name}</li>`) // not clickable
//         .join('');

//     return `<ul>${listItems}</ul>`; // no checkboxes
// }

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
