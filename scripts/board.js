let currentDraggedId;
let autoScrollInterval = null;
let autoScrollIntervalX = null;
let scrollSpeed = 10;
let scrollThreshold = 50;

async function init() {
    checkLoggedInPageSecurity();
    await eachPageSetCurrentUserInitials(); 
    contacts = await fetchAndSortContacts();
    tasks = await fetchAndAddIdAndRemoveUndefinedContacts();
    await renderTasks(tasks); 
}

async function renderTasks(tasks) {
    let categories = {
        'categoryToDo': tasks.filter(cat => cat.board === "toDo") || [],
        'categoryInProgress': tasks.filter(cat => cat.board === "inProgress") || [],
        'categoryAwaitFeedback': tasks.filter(cat => cat.board === "awaitFeedback") || [],
        'categoryDone': tasks.filter(cat => cat.board === "done") || []
    }
    Object.entries(categories).forEach(([htmlContainerId, task]) => {
        const container = document.getElementById(htmlContainerId);
        task.length === 0 ? container.innerHTML = renderTasksHtmlEmptyArray(htmlContainerId) : container.innerHTML = task.map(task => renderTasksCardSmallHtml(task)).join('');
    });
}

async function fetchAndAddIdAndRemoveUndefinedContacts() {
    let tasksObj = await fetchData(`/${activeUserId}/tasks`);
    let tasksWithId = Object.entries(tasksObj || {}).map(([key, contact]) => ({ id: key, ...contact }));
    if (tasksWithId && tasksWithId.length > 0) {
        await checkTaskAssignedAgainstNullOrInvalidContacts(tasksWithId);
        return tasksWithId;
    }
    return [];
}

async function checkTaskAssignedAgainstNullOrInvalidContacts(tasksWithId) {
    for (let i = 0; i < tasksWithId.length; i++) {
        if (tasksWithId[i].assigned !== undefined) {
            let tasksAssignedFiltered = []
            for (let j = 0; j < tasksWithId[i].assigned.length; j++) {
                let contactIndex = contacts.indexOf(contacts.find(c => c.id === tasksWithId[i].assigned[j]));
                if (contactIndex === -1) {
                    await deletePath(`/${activeUserId}/tasks/${tasksWithId[i].id}/assigned/${j}`);
                } else if (tasksWithId[i].assigned[j] !== null) {
                    tasksAssignedFiltered.push(tasksWithId[i].assigned[j])
                }
            }
            tasksWithId[i].assigned = tasksAssignedFiltered;
        }
    }
    return tasksWithId;
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
        await putData('/' + activeUserId + '/tasks/' + currentDraggedId + '/board', category);
        let tasksRefetch = await fetchAndAddIdAndRemoveUndefinedContacts();
        renderTasks(tasksRefetch);
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
 * And generates initials, and displays them with colored circles.
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
                let color = contactCircleColor[contactId % contactCircleColor.length]; // Farbe anhand contact.id berechnen 

                let initials = getInitials(contact.name);
                //pwn Div for each contact
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


async function deleteTaskfromBoard(taskId) {
    try {
        await deletePath(`/${activeUserId}/tasks/${taskId}`);
        closeAddTaskOverlay();
        let tasksRefetch = await fetchAndAddIdAndRemoveUndefinedContacts();
        renderTasks(tasksRefetch);
    } catch (error) {
        console.error("Error deleting task:", error);
    }
}

async function renderEditTaskDetail() {
    let overlay = document.getElementById("add-task-overlay");
    overlay.innerHTML = editTaskDetailOverlayTemplate();
    overlay.classList.remove('d-none');
    await loadAndRenderContacts('assigned-dropdown', 'addTask');
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
        let tasksRefetch = await fetchAndAddIdAndRemoveUndefinedContacts();
        renderTasks(tasksRefetch);
    } catch (error) {
        console.error("Update failed:", error);
    }
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

    // Vertikal
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

    // Horizontal
    if (mouseX < rect.left + scrollThreshold) {
        // Nach links scrollen
        if (!autoScrollIntervalX) {
            autoScrollIntervalX = setInterval(() => {
                main.scrollLeft -= scrollSpeed;
            }, 16);
        }
    } else if (mouseX > rect.right - scrollThreshold) {
        // Nach rechts scrollen
        if (!autoScrollIntervalX) {
            autoScrollIntervalX = setInterval(() => {
                main.scrollLeft += scrollSpeed;
            }, 16);
        }
    } else {
        // Horizontales Scrollen stoppen
        if (autoScrollIntervalX) {
            clearInterval(autoScrollIntervalX);
            autoScrollIntervalX = null;
        }
    }
}

// #region search

function searchTasks() {
    let searchInput = document.getElementById('searchTasks').value.trim().toLowerCase();
    let searchFailedRef = document.getElementById('searchFailed');
    if (searchInput === '') {renderTasks(tasks); return}
    let filteredTasks = tasks.filter(task => { return task.description.toLowerCase().includes(searchInput) || task.title.toLowerCase().includes(searchInput)});
    // task.length === 0 ? searchFailedRef.innerHTML = 'no result, try another search' : task;
    filteredTasks.length === 0 ? searchFailedRef.innerHTML = `no result with "${searchInput}"` : searchFailedRef.innerHTML = '';
    renderTasks(filteredTasks)
}

function searchAndClearSearchField() {
    let searchInput = document.getElementById('searchTasks')
    searchTasks();
    searchInput.value = ''
}

document.addEventListener('DOMContentLoaded', positionSearchField);
window.addEventListener('resize', positionSearchField);

function positionSearchField() {
    let searchDesktopRef = document.getElementById('searchPositionDesktop');
    let searchMobileRef = document.getElementById('searchPositionMobile');
    if(window.innerWidth>1074) {
        searchMobileRef.innerHTML = '';
        searchDesktopRef.innerHTML = displaySearchInBoardHtml();
        searchMobileRef.style.marginTop ="0px"
    } else {
        searchDesktopRef.innerHTML = '';
        searchMobileRef.innerHTML = displaySearchInBoardHtml();
        searchMobileRef.style.marginTop ="40px"
    }
}
// #endregion
