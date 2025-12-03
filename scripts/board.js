let currentDraggedId;
let autoScrollInterval = null;
let autoScrollIntervalX = null;
let scrollSpeed = 10;
let scrollThreshold = 50;

//
let editAssignedIds = [];
let editSubtasks = [];
let editPriority = 'medium';
let editingSubtaskIndex = -1;


/**
 * Initializes the board page by checking security, loading user initials,
 * fetching contacts and tasks, then rendering the tasks on the board
 */
async function init() {
    checkLoggedInPageSecurity();
    initNavKeyboardSupport();
    await eachPageSetCurrentUserInitials();
    contacts = await fetchAndSortContacts();
    tasks = await fetchAndAddIdAndRemoveUndefinedContacts();
    await renderTasks(tasks);
}

/**
 * Renders tasks on the board by categorizing them into different columns
 * @param {Array} tasks - Array of task objects to render
 */
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

/**
 * Fetches tasks from database, adds IDs and removes undefined contacts
 * @returns {Promise<Array>} Array of tasks with IDs and cleaned contact assignments
 */
async function fetchAndAddIdAndRemoveUndefinedContacts() {
    let tasksObj = await fetchData(`/${activeUserId}/tasks`);
    let tasksWithId = Object.entries(tasksObj || {}).map(([key, contact]) => ({ id: key, ...contact }));
    if (tasksWithId && tasksWithId.length > 0) {
        await checkTaskAssignedAgainstNullOrInvalidContacts(tasksWithId);
        return tasksWithId;
    }
    return [];
}

/**
 * Checks task assignments and removes invalid or null contacts
 * @param {Array} tasksWithId - Array of tasks with IDs
 * @returns {Promise<Array>} Cleaned tasks array
 */
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

/**
 * Checks for subtasks in a task and displays progress bar if subtasks exist
 * @param {Object} task - The task object to check for subtasks
 * @returns {string} HTML string for subtask progress or empty string
 */
function checkForAndDisplaySubtasks(task) {
    if (task.subtasks) {
        let totalSubtasks = task.subtasks.length;
        let doneSubtasks = task.subtasks.filter(d => d.done === true).length;
        return renderTaskCardSubtaskProgress(doneSubtasks, totalSubtasks);
    } else {
        return "";
    }
}

/**
 * Checks for assigned users in a task and displays user circles
 * @param {Object} task - The task object to check for assigned users
 * @returns {string} HTML string for user circles or empty div
 */
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
        html += renderTaskCardAssignedSectionInitials(initials, color, contactIndex);
    } else {
        html += '';
    }
    return html;
}

/**
 * Returns the appropriate color class based on task category
 * @param {Object} task - The task object
 * @returns {string} Color class name ('blue' or 'turquoise')
 */
function categoryColor(task) {
    if (task.category === 'User Story') {
        return "blue"
    } else {
        return "turquoise"
    }
}

/**
 * Handles the drag start event for task cards
 * @param {DragEvent} event - The drag event
 * @param {string} id - The ID of the task being dragged
 */
function dragstartHandler(event, id) {
    currentDraggedId = id;
    event.target.style.transform = 'rotate(2deg)';
    startAutoScroll();
}

/**
 * Handles the drag over event for drop zones
 * @param {DragEvent} ev - The drag event
 */
function dragoverHandler(ev) {
    ev.preventDefault();
    toggleStyle(ev);
    handleAutoScroll(ev);
}

/**
 * Handles the drag end event and cleans up drag state
 * @param {DragEvent} event - The drag event
 */
function dragendHandler(event) {
    event.target.style.transform = '';
    stopAutoScroll();
}

/**
 * Toggles visual styling for drag over effects
 * @param {DragEvent} ev - The drag event
 */
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

/**
 * Moves a task to a different category/column on the board
 * @param {string} category - The target category ('toDo', 'inProgress', 'awaitFeedback', 'done')
 */
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

/**
 * Renders the add task overlay with animation and focus management
 * @param {string} board - The default board category for the new task (default: 'toDo')
 */
// async function renderAddTaskOverlay(board = "toDo") {
//     let overlay = document.getElementById("add-task-overlay");
//     overlay.classList.remove('d-none');
//     overlay.innerHTML = getAddTaskOverlayTemplate(board);
//     await loadAndRenderContacts('assigned-dropdown-edit', 'addTask');
//     setupPriorityButtons();
//     setTimeout(() => {
//         let section = overlay.querySelector('.add-task-section');
//         if (section) {
//             section.classList.add('slide-in');
//         }
//         let titleInput = document.getElementById('title');
//         if (titleInput) {
//             setTimeout(() => titleInput.focus(), 150);
//         }
//     }, 20);
// }


async function renderAddTaskOverlay(board = "toDo") {
    let overlay = document.getElementById("add-task-overlay");
    
    // 1. Sichtbar machen
    overlay.classList.remove('d-none');
    
    // 2. WICHTIG: Das hier hat gefehlt! Aria-Hidden entfernen.
    overlay.removeAttribute('aria-hidden'); 
    // Jetzt weiß der Browser: "Aha, das Element ist jetzt aktiv!"

    // 3. Inhalt reinladen
    overlay.innerHTML = getAddTaskOverlayTemplate(board);
    
    // 4. Logik starten
    await loadAndRenderContacts('assigned-dropdown-edit', 'addTask');
    setupPriorityButtons();
    
    // 5. Animation & Fokus
    setTimeout(() => {
        let section = overlay.querySelector('.add-task-section');
        if (section) {
            section.classList.add('slide-in');
        }
        
        // Fokus manuell setzen (statt autofocus im HTML)
        let titleInput = document.getElementById('title');
        if (titleInput) {
            setTimeout(() => titleInput.focus(), 150);
        }
    }, 20);
}

/**
 * Closes the add task overlay with slide-out animation and updates board
 * Update board after overlay close to reflect any changes made during modal interaction
 */
// async function closeAddTaskOverlay() {
//     let overlay = document.getElementById("add-task-overlay");
//     let section = overlay.querySelector('.add-task-section');
//     if (section) { section.classList.remove('slide-in')}
//     setTimeout(async () => {
//         overlay.classList.add('d-none');
//         overlay.innerHTML = '';
//         try {
//             let tasksRefetch = await fetchAndAddIdAndRemoveUndefinedContacts();
//             renderTasks(tasksRefetch);
//         } catch (error) {
//             console.error("Error updating board after overlay close:", error);
//         }
//     }, 400);
// }


async function closeAddTaskOverlay() {
    let overlay = document.getElementById("add-task-overlay");
    let section = overlay.querySelector('.add-task-section');
    
    if (section) { section.classList.remove('slide-in'); }
    
    setTimeout(async () => {
        overlay.classList.add('d-none');
        overlay.innerHTML = '';
        
        // WICHTIG: Wieder verstecken für Screenreader
        overlay.setAttribute('aria-hidden', 'true'); 
        
        try {
            let tasksRefetch = await fetchAndAddIdAndRemoveUndefinedContacts();
            renderTasks(tasksRefetch);
        } catch (error) {
            console.error("Error updating board after overlay close:", error);
        }
    }, 400);
}
/**
 * Adds slide-in animation to the overlay
 */
function slideInOverlay() {
    let overlay = document.getElementById("add-task-overlay");
    overlay.classList.add("slide-in");
}


/**
 * Renders the task detail overlay for viewing task information
 * @param {string} taskJson - Base64 encoded JSON string of the task object
 */
async function renderTaskDetail(taskJson) {
    let task = JSON.parse(atob(taskJson));
    let overlay = document.getElementById("add-task-overlay");
    overlay.innerHTML = getTaskDetailOverlayTemplate(task);
    overlay.classList.remove('d-none');
    overlay.setAttribute('aria-hidden', 'false');
    setupPriorityButtons();
    setTimeout(() => {
        let section = overlay.querySelector('.add-task-section, .task-detail-overlay');
        if (section) {
            section.classList.add('slide-in');
        }
    }, 50);
    renderContactsInOverlay(task); // Note: all contacts for activeUserId -> innerHTML: overlayContactContainer
}

/**
 * Renders contact circles in the overlay container with initials and colored circles
 * @param {Object} task - The task object containing assigned contacts
 */
function renderContactsInOverlay(task) {
    const container = document.getElementById('overlayContactContainer');
    let arrAssigned = task.assigned;
    let html = '';
    if (arrAssigned && arrAssigned.length > 0) {
        for (let i = 0; i < arrAssigned.length; i++) {
            let contactId = arrAssigned[i];
            let contact = contacts.find(c => c.id === contactId);
            if (contact) {
                let color = contactCircleColor[contactId % contactCircleColor.length];
                let initials = getInitials(contact.name);
                html += getContactsInTaskOverlayHtml(color, initials, contact);
            }
        }
    } else {
        html = '<span class="gray-text">No contact assigned</span>';
    }
    container.innerHTML = html;
}


/**
 * Deletes a task from the board and updates the UI
 * @param {string} taskId - The ID of the task to delete
 */
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

/**
 * Renders the edit task detail overlay with pre-filled data
 * @param {string} taskId - The ID of the task to edit
 */
async function renderEditTaskDetail(taskId) {
    let task = tasks.find(t => t.id === taskId);
    if (!task) return;
    loadTaskVariableGlobally(task);
    loadEditTaskDetailOverlay(task);
    loadFillInputFields(task);
    renderSubtasksEditMode();
    await loadAndRenderContacts('assigned-dropdown-edit', 'addTask');

    renderAssignedEditCircles();
    setCheckboxesById()
}

function loadTaskVariableGlobally(task) {
    editAssignedIds = [...(task.assigned || [])];
    editSubtasks = JSON.parse(JSON.stringify(task.subtasks || []));
    editPriority = task.priority;
}

function loadEditTaskDetailOverlay(task) {
    let overlay = document.getElementById("add-task-overlay");
    overlay.innerHTML = editTaskDetailOverlayTemplate(task);
    overlay.classList.remove('d-none');
}

function loadFillInputFields(task) {
    document.getElementById('edit-title').value = task.title;
    document.getElementById('edit-description').value = task.description;
    document.getElementById('edit-due-date').value = task.dueDate;
}

/**
 * Renders subtasks for display in the task detail overlay
 * @param {Object} task - The task object containing subtasks
 * @returns {string} HTML string for subtasks display
 */
function renderSubtasksForOverlay(task) {
    if (!task.subtasks || task.subtasks.length === 0) {
        return '<div role="text" aria-label="No subtasks available">No subtasks</div>';
    }
    let html = '<div class="subtask-list-overlay" role="group" aria-label="Subtasks list">';
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


/**
 * Toggles the completion status of a subtask
 * @param {string} taskId - The ID of the task containing the subtask
 * @param {number} subtaskIndex - The index of the subtask to toggle
 */
async function toggleSubtask(taskId, subtaskIndex) { 
    let task = tasks.find(t => t.id === taskId);
    if (!task || !task.subtasks) return;
    let currentStatus = task.subtasks[subtaskIndex].done === true || task.subtasks[subtaskIndex].done === 'true';
    let newStatus = !currentStatus;
    task.subtasks[subtaskIndex].done = newStatus; 
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

/**
 * Toggles subtask status while preserving scroll position
 * @param {string} taskId - The ID of the task containing the subtask
 * @param {number} subtaskIndex - The index of the subtask to toggle
 */
async function toggleSubtaskWithScrollPreservation(taskId, subtaskIndex) {
    let task = tasks.find(t => t.id === taskId);
    if (!task || !task.subtasks) return;
    
    // Toggle status in memory
    let currentStatus = task.subtasks[subtaskIndex].done === true || task.subtasks[subtaskIndex].done === 'true';
    let newStatus = !currentStatus;
    task.subtasks[subtaskIndex].done = newStatus;
    
    try {
        await putData(`/${activeUserId}/tasks/${taskId}/subtasks/${subtaskIndex}/done`, newStatus);
        updateSubtaskElementInDOM(taskId, subtaskIndex, newStatus);
        let tasksRefetch = await fetchAndAddIdAndRemoveUndefinedContacts();
        tasks = tasksRefetch; // Update global tasks without re-rendering
        
    } catch (error) {
        console.error("Update failed:", error);
        task.subtasks[subtaskIndex].done = currentStatus;
    }
}

/**
 * Updates a single subtask element in the DOM without full re-render
 * @param {string} taskId - The task ID
 * @param {number} subtaskIndex - The subtask index
 * @param {boolean} newStatus - The new completion status
 */
function updateSubtaskElementInDOM(taskId, subtaskIndex, newStatus) {
    const subtaskRows = document.querySelectorAll('.subtask-row');
    if (subtaskRows[subtaskIndex]) {
        const row = subtaskRows[subtaskIndex];
        const icon = row.querySelector('.subtask-icon');
        const text = row.querySelector('.subtask-text');
        const statusSpan = row.querySelector('.sr-only');
        row.setAttribute('aria-checked', newStatus.toString());
        if (icon) {
            icon.innerHTML = newStatus ? getCheckIcon() : getUncheckIcon();
        }
        if (text) {
            if (newStatus) {
                text.classList.add('text-done');
            } else {
                text.classList.remove('text-done');
            }
        }
        if (statusSpan) {
            statusSpan.textContent = newStatus ? 'Completed' : 'Not completed';
        }
    }
}

/**
 * Starts the auto-scroll functionality during drag operations
 */
function startAutoScroll() {
    document.addEventListener('dragover', handleAutoScroll);
}

/**
 * Stops the auto-scroll functionality and cleans up intervals
 */
function stopAutoScroll() {
    document.removeEventListener('dragover', handleAutoScroll);
    if (autoScrollInterval) {
        clearInterval(autoScrollInterval);
        autoScrollInterval = null;
    }
}

/**
 * Handles auto-scrolling based on mouse position during drag operations
 * @param {DragEvent} event - The drag event containing mouse coordinates
 */
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

/**
 * Searches tasks based on title and description content
 */
function searchTasks() {
    let searchInput = document.getElementById('searchTasks').value.trim().toLowerCase();
    let searchFailedRef = document.getElementById('searchFailed');
    if (searchInput === '') { renderTasks(tasks); return }
    let filteredTasks = tasks.filter(task => { return task.description.toLowerCase().includes(searchInput) || task.title.toLowerCase().includes(searchInput) });
    // task.length === 0 ? searchFailedRef.innerHTML = 'no result, try another search' : task;
    filteredTasks.length === 0 ? searchFailedRef.innerHTML = `no result with "${searchInput}"` : searchFailedRef.innerHTML = '';
    renderTasks(filteredTasks)
}

/**
 * Performs search and clears the search input field
 */
function searchAndClearSearchField() {
    let searchInput = document.getElementById('searchTasks')
    searchTasks();
    searchInput.value = ''
}

document.addEventListener('DOMContentLoaded', positionSearchField);
window.addEventListener('resize', positionSearchField);

/**
 * Positions the search field based on screen size for responsive design
 */
function positionSearchField() {
    let searchDesktopRef = document.getElementById('searchPositionDesktop');
    let searchMobileRef = document.getElementById('searchPositionMobile');
    if (!searchDesktopRef || !searchMobileRef) {
        return;
    }
    const currentSearchInput = document.getElementById('searchTasks');
    const currentValue = currentSearchInput ? currentSearchInput.value : '';
    const wasFocused = document.activeElement && document.activeElement.id === 'searchTasks';
    if (window.innerWidth > 1074) {
        searchFieldPositionInclusiveWcagAriaConformityA(searchMobileRef, searchDesktopRef, currentValue, wasFocused);
        
    } else {
        searchFieldPositionInclusiveWcagAriaConformityB(searchDesktopRef, searchMobileRef, currentValue, wasFocused);
    }
}

/**
 * Positions search field for desktop view with WCAG compliance
 * @param {HTMLElement} searchMobileRef - Mobile search container reference
 * @param {HTMLElement} searchDesktopRef - Desktop search container reference  
 * @param {string} currentValue - Current search input value
 * @param {boolean} wasFocused - Whether the search input was previously focused
 */
function searchFieldPositionInclusiveWcagAriaConformityA(searchMobileRef, searchDesktopRef, currentValue, wasFocused) {
    searchMobileRef.innerHTML = '';
    searchMobileRef.setAttribute('aria-hidden', 'true');
    searchDesktopRef.innerHTML = displaySearchInBoardHtml();
    searchDesktopRef.removeAttribute('aria-hidden');
    searchMobileRef.style.marginTop = "0px";
    const newSearchInput = document.getElementById('searchTasks');
    if (newSearchInput) {
        newSearchInput.value = currentValue;
        if (wasFocused) {
            setTimeout(() => newSearchInput.focus(), 50);
        }
    }
}

/**
 * Positions search field for mobile view with WCAG compliance
 * @param {HTMLElement} searchDesktopRef - Desktop search container reference
 * @param {HTMLElement} searchMobileRef - Mobile search container reference
 * @param {string} currentValue - Current search input value
 * @param {boolean} wasFocused - Whether the search input was previously focused
 */
function searchFieldPositionInclusiveWcagAriaConformityB(searchDesktopRef, searchMobileRef, currentValue, wasFocused) {
    searchDesktopRef.innerHTML = '';
    searchDesktopRef.setAttribute('aria-hidden', 'true');
    searchMobileRef.innerHTML = displaySearchInBoardHtml();
    searchMobileRef.removeAttribute('aria-hidden');
    searchMobileRef.style.marginTop = "40px";
    const newSearchInput = document.getElementById('searchTasks');
    if (newSearchInput) {
        newSearchInput.value = currentValue;
        if (wasFocused) {
            setTimeout(() => newSearchInput.focus(), 50);
        }
    }
}

// #endregion

// #region Keyboard Accessibility Functions

/**
 * Keyboard event handler for task card navigation
 * @param {KeyboardEvent} event - The keyboard event
 * @param {string} taskJson - Base64 encoded task JSON
 */
function handleTaskCardKeydown(event, taskJson) {
    if (event.key === 'Enter' || event.key === ' ') {
        event.preventDefault();
        renderTaskDetail(taskJson);
    }
}

/**
 * Keyboard event handler for delete task button
 * @param {KeyboardEvent} event - The keyboard event
 * @param {string} taskId - The ID of the task to delete
 */
function handleDeleteTaskKeydown(event, taskId) {
    if (event.key === 'Enter' || event.key === ' ') {
        event.preventDefault();
        deleteTaskfromBoard(taskId);
    }
}

/**
 * Keyboard event handler for edit task button  
 * @param {KeyboardEvent} event - The keyboard event
 * @param {string} taskId - The ID of the task to edit
 */
function handleEditTaskKeydown(event, taskId) {
    if (event.key === 'Enter' || event.key === ' ') {
        event.preventDefault();
        renderEditTaskDetail(taskId);
    }
}

/**
 * Keyboard event handler for subtask toggle
 * @param {KeyboardEvent} event - The keyboard event
 * @param {string} taskId - The task ID
 * @param {number} index - The subtask index
 */
function handleSubtaskToggleKeydown(event, taskId, index) {
    if (event.key === 'Enter' || event.key === ' ') {
        event.preventDefault();
        toggleSubtask(taskId, index);
    }
}

/**
 * Keyboard event handler for search input
 * @param {KeyboardEvent} event - The keyboard event
 */
function handleSearchKeydown(event) {
    if (event.key === 'Enter') {
        event.preventDefault();
        searchTasks();
    }
}

/**
 * Keyboard event handler for search button
 * @param {KeyboardEvent} event - The keyboard event
 */
function handleSearchButtonKeydown(event) {
    if (event.key === 'Enter' || event.key === ' ') {
        event.preventDefault();
        searchAndClearSearchField();
    }
}

/**
 * Keyboard event handler for close dialog buttons
 * @param {KeyboardEvent} event - The keyboard event
 */
function handleCloseKeydown(event) {
    if (event.key === 'Enter' || event.key === ' ') {
        event.preventDefault();
        closeAddTaskOverlay();
    }
}

// #endregion