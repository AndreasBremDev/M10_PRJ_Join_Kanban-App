function renderTasksCardSmallHtml(task) {
    const taskJson = btoa(JSON.stringify(task));
    return /* html */`
    <div 
        role="button" 
        tabindex="0" 
        aria-label="${task.title}"
        onclick="renderTaskDetail('${taskJson}')" 
        onkeydown="handleTaskCardKeydown(event, '${taskJson}')"
        class="drag-item" 
        draggable="true" 
        ondragstart="dragstartHandler(event, '${task.id}')" 
        ondragend="dragendHandler(event)">
        <div class="card-inner">
            <p class="${categoryColor(task)}">${task.category}</p>
            <h3>${task.title}</h3>
            <p class="card-description">${task.description}</p>
                ${checkForAndDisplaySubtasks(task)}
            <div class="flex spacebetween">
                ${checkForAndDisplayUserCircles(task)}
                <img src="/assets/icons/prio_${task.priority}_icon.svg" alt="${task.priority} priority">
            </div>
        </div>
    </div>`
}

function renderTaskCardSubtaskProgress(doneSubtasks, totalSubtasks) {
    const progressPercentage = Math.round((doneSubtasks / totalSubtasks) * 100);

    return `<div class="flex">
                <progress 
                    value="${doneSubtasks}" 
                    max="${totalSubtasks}" 
                    style="width:96px"
                    aria-label="Subtask completion: ${doneSubtasks} of ${totalSubtasks} completed (${progressPercentage}%)"
                    title="${progressPercentage}% completed">
                </progress>
                <span aria-hidden="true">${doneSubtasks}/${totalSubtasks} Subtasks</span>
            </div>`
}

function renderTaskCardAssignedSectionGrid(arrAssigned) {
    return /*html*/ `<div class="grid-container" style="grid-template-columns: repeat(${arrAssigned.length}, 22px); width: calc(${arrAssigned.length - 1} *22px + 44px);">`
}
function renderTaskCardAssignedSectionGridMoreThanFive() {
    return /*html*/ `<div class="grid-container" style="grid-template-columns: repeat(6, 22px); width: calc(5 *22px + 44px);">`
}

function renderTaskCardAssignedSectionInitials(initial, color, contactIndex) {
    return /*html*/`<div class="user-circle-task" style="background-color: ${color};">${initial}</div>`
}

function renderTasksHtmlEmptyArray(categoryId) {
    const categoryNames = {
        'categoryToDo': 'To Do',
        'categoryInProgress': 'In Progress',
        'categoryAwaitFeedback': 'Await Feedback',
        'categoryDone': 'Done'
    };
    const categoryName = categoryNames[categoryId];

    return `
    <article 
        class="empty-task-box" 
        role="status" 
        aria-label="Empty ${categoryName} category"
        aria-live="polite">
        <span class="card-inner">
            No tasks in ${categoryName}
        </span>
    </article>
    `
}

function renderContactsCardPartTwo(contact, color) {
    const contactJson = JSON.stringify(contact).replace(/"/g, '&quot;').replace(/'/g, "'");
    return `
        <div class="contact-list-card" 
            role="button" 
            tabindex="0"
            aria-label="Contact: ${contact.name}, Email: ${contact.email}"
            onclick="contactsLargeSlideIn(event, '${contactJson}', '${color}')"
            onkeydown="handleContactKeydown(event, '${contactJson}', '${color}')">
            <div class="user-circle-intials" 
                style="background-color: ${color}"
                aria-hidden="true">
            ${getInitials(contact.name)}
            </div>
            <div>
                <div class="contact-list-name">
                ${contact.name}
                </div>
                <div class="contact-list-email" style="color: #007CEE;">
                ${contact.email}
                </div>
            </div>
        </div>
    `;
}

function renderContactsCardPartOne(key) {
    return `
    <div class="contact-letter-group" role="group" aria-labelledby="contact-letter-${key}">
        <h3 id="contact-letter-${key}" class="contact-list-letter" aria-label="Contacts starting with ${key}">
            ${key}
        </h3>
        <div class="contact-list-separator" aria-hidden="true"></div>
    </div>
    `;
}

function emptyContactsHtml() {
    return `
    <div 
        role="status" 
        aria-live="polite" 
        class="empty-contacts-message"
        style="text-align: center; padding: 2rem;">
        <p>No contacts yet.</p>
        <p>Please add new contacts to get started.</p>
    </div>
    `
}

function contactsLoadingIssueHTML() {
    return `
    <div 
        role="alert" 
        aria-live="assertive" 
        class="error-message"
        style="text-align: center; padding: 1rem; color: #ff4444;">
        <p>Error loading contacts. Please try again.</p>
    </div>
    `
}

function getAddTaskOverlayTemplate(board) {
    const todayStr = new Date().toISOString().split('T')[0];

    return /* html */`
        <section class="overlay-add-task" role="dialog" aria-labelledby="overlay-title" aria-modal="true">
            <div class="overlay-header">
                <h1 id="overlay-title" class="overlay-headline">Add Task</h1>
            </div>
            
            <button onclick="closeAddTaskOverlay()" class="close-add-task-overlay" aria-label="Close add task dialog">
                <img src="/assets/icons/close.svg" alt="">
            </button>

            <form id="task-form" class="task-form" novalidate>
                <div class="form-left form-left-overlay">
                    <label for="title">Title<span class="required-marker" aria-label="required">*</span></label>
                    <input id="title" type="text" placeholder="Enter a title" onblur="validateField('title')"
                        oninput="clearError('title')" aria-required="true" aria-describedby="title-error" aria-invalid="false">
                    <div id="title-error" class="error-text" role="alert" aria-live="polite">This field is required</div>

                    <label for="description">Description</label>
                    <textarea class="description-box" id="description"
                        class="description-input-overlay title-input-overlay" placeholder="Enter a Description"
                        tabindex="0" aria-describedby="description-hint"></textarea>
                    <div id="description-hint" class="sr-only">Optional field for task description</div>

                    <div class="add-task-label-box-sizing">
                        <label for="due-date">Due date<span class="required-marker"
                                aria-label="required">*</span></label>
                        <input id="due-date" type="date" required onblur="validateField('due-date')"
                            oninput="clearError('due-date')" tabindex="0" aria-required="true"
                            aria-describedby="date-error" aria-invalid="false">
                        <div id="due-date-error" class="error-text" role="alert" aria-live="polite">This field
                            is required</div>
                    </div>
                </div>

                <div class="divider" role="presentation" aria-hidden="true"></div>

                <div class="form-right form-right-overlay">
                    <fieldset style="border: none; padding: 0; margin: 0;">
                        <legend class="sr-only">Task Priority</legend>
                        <label>Priority</label>
                        <div class="priority-buttons" role="group" aria-label="Select task priority">
                            <button type="button" id="prio-urgent" class="priority-btn urgent"
                                onclick="setEditPrio('urgent')" role="radio" aria-checked="false"
                                aria-label="High priority">
                                Urgent <img src="/assets/icons/prio_urgent_icon.svg" alt="" aria-hidden="true">
                            </button>
                            <button type="button" id="prio-medium" class="priority-btn medium active"
                                onclick="setEditPrio('medium')" role="radio" aria-checked="true"
                                aria-label="Medium priority">
                                Medium <img src="/assets/icons/prio_medium_icon.svg" alt="" aria-hidden="true">
                            </button>
                            <button type="button" id="prio-low" class="priority-btn low" onclick="setEditPrio('low')"
                                role="radio" aria-checked="false" aria-label="Low priority">
                                Low <img src="/assets/icons/prio_low_icon.svg" alt="" aria-hidden="true">
                            </button>
                        </div>
                    </fieldset>

                    <label id="assigned-label" for="assigned">Assigned to</label>
                    <div class="custom-select-container">
                        <div id="assigned-display-edit" class="select-display" onclick="toggleContactDropdown('assigned-dropdown-edit', 'assigned-display-edit', 'arrow-icon-edit')"
                            role="button" tabindex="0" aria-expanded="false" aria-haspopup="listbox"
                            aria-labelledby="assigned-label" aria-controls="assigned-dropdown-edit">
                            Select contacts to assign 
                            <img id="arrow-icon-edit" src="/assets/icons/arrow_drop_down.svg" alt="arrow" class="dropdown-icon" aria-hidden="true">
                        </div>
                        <div id="assigned-dropdown-edit" class="select-dropdown" role="listbox"
                            aria-labelledby="assigned" style="display: none;"></div>
                    </div>

                    <div id="user-circle-assigned-edit-overlay" class="assigned-circles-edit-overlay" role="group"
                        aria-label="Currently assigned contacts" aria-live="polite"></div>

                    <label for="category">Category<span class="required-marker" aria-label="required">*</span></label>
                    <div class="custom-select-container">
                        <div id="category-display" class="select-display" onclick="toggleCategoryDropdown()" required aria-required="true" aria-describedby="category-error"
                            aria-invalid="false" tabindex="0">
                            <span id="category-text">Select task category</span>
                            <img id="category-arrow" src="/assets/icons/arrow_drop_down.svg" alt="Arrow" class="dropdown-icon">
                        </div>
                        <div id="category-options" class="select-dropdown" style="display: none;">
                            <div class="contact-item" onclick="selectCategory('Technical Task')">Technical Task</div>
                            <div class="contact-item" onclick="selectCategory('User Story')">User Story</div>
                        </div>
                        <input type="hidden" id="category" value="">
                    </div>
                    <div id="category-error" class="error-text" role="alert" aria-live="polite">This field is required</div>

                    <label for="subtask">Subtasks</label>
                    <div class="subtask-input-wrapper">
                        <input type="text" id="subtask-input-edit" class="subtask-input-field"
                            placeholder="Add new subtask" onclick="showMainSubtaskIcons()"
                            onkeydown="handleSubtaskKey(event)" tabindex="0" aria-describedby="subtask-hint">
                        <div id="main-subtask-icons" class="input-action-icons"></div>
                    </div>
                    <div id="subtask-hint" class="sr-only">Enter subtask text and press Enter to add, or use the buttons to save or cancel</div>
                    <ul id="subtask-list-edit-ul" style="padding: 0; list-style: none;" role="list" aria-label="Subtask list"></ul>
                </div>
            </form>

            <div class="form-footer">
                <p class="form-hint form-hint-overlay">
                    <span class="required-marker">*</span>This field is required
                </p>
                <div class="form-actions form-actions-overlay" role="group" aria-label="Form actions">
                    <button onclick="clearForm(), closeAddTaskOverlay()" id="clear-btn" type="button" class="clear">
                        Cancel ✖
                    </button>
                    <button onclick="handleCreateTask('${board}')" id="create-btn" type="button" class="create">
                        Create Task ✔
                    </button>
                </div>
            </div>
        </section>
    `;
}


function getTaskDetailOverlayTemplate(task) {
    return /* html */`
    <div class="task-detail-overlay" 
            role="dialog" 
            aria-modal="true"
            aria-labelledby="task-detail-title"
            aria-describedby="task-detail-description">
            <div class="task-detail-header">
                <p class="${categoryColor(task)}" role="text" aria-label="Category: ${task.category}">${task.category}</p>
                <button onclick="closeAddTaskOverlay()" 
                        onkeydown="handleCloseKeydown(event)"
                        class="close-board-info-overlay" 
                        aria-label="Close task details dialog"
                        tabindex="1"
                        style="border: none; background: none; cursor: pointer; padding: 4px;">
                    <img src="/assets/icons/close.svg" alt="" aria-hidden="true">
                </button>
            </div>
        <div class="task-overlay-wrapper">

            <div class="task-detail-headline">
                <h1 id="task-detail-title" class="task-detail-title" role="heading" aria-level="1">${task.title}</h1>
            </div>

            <div class="task-detail-description">
                <h2 class="sr-only">Description</h2>
                <p id="task-detail-description" role="text">${task.description}</p>
            </div>

            <div class="task-detail-due-date" role="text" aria-label="Due date: ${task.dueDate}">
                <div>Due Date:</div>
                <div>${task.dueDate}</div>
            </div>
            
            <div class="task-detail-priority" role="text" aria-label="Priority: ${task.priority}">
                <div style="font-size: 18px;">Priority:</div>
                <div>${task.priority.charAt(0).toUpperCase() + task.priority.slice(1)}</div>
                <img src="/assets/icons/prio_${task.priority}_icon.svg" alt="${task.priority} priority icon" aria-hidden="true">
            </div>

            <div class="task-detail-assigned">
                <h2 class="sr-only">Assigned Contacts</h2>
                <div style="font-size: 18px;" role="text">Assigned to:</div>
                <div id="overlayContactContainer" class="contact-circle-container" role="list" aria-label="Assigned contacts"></div>
            </div>

            <div class="task-detail-subtasks" id="subtasks-section">
                <h2 class="sr-only">Subtasks</h2>
                <div style="font-size: 18px;" role="text">Subtasks:</div>
                <div role="group" aria-label="Subtasks list" id="subtasks-container">
                    ${renderSubtasksForOverlay(task)}
                </div>
            </div>

        </div>
        <div class="task-detail-delete-edit-button-container" role="toolbar" aria-label="Task actions">
            <button onclick="deleteTaskfromBoard('${task.id}')" 
                    onkeydown="handleDeleteTaskKeydown(event, '${task.id}')"
                    class="task-detail-delete-button"
                    aria-label="Delete task: ${task.title}"
                    tabindex="0"
                    style="border: none; cursor: pointer;">
                <div class="task-delete-icon" aria-hidden="true"></div>
                <span class="sr-only">Delete Task</span>
            </button>

            <div class="task-detail-spacer" aria-hidden="true"></div>

            <button onclick="renderEditTaskDetail('${task.id}')" 
                    onkeydown="handleEditTaskKeydown(event, '${task.id}')"
                    class="task-detail-edit-button"
                    aria-label="Edit task: ${task.title}"
                    tabindex="0"
                    style="border: none; cursor: pointer;">
                <div class="task-edit-icon" aria-hidden="true"></div>
                <span class="sr-only">Edit Task</span>
            </button>
        </div>

    </div>
    `
}

function editTaskDetailOverlayTemplate(task) {
    const todayStr = new Date().toISOString().split('T')[0];
    return /* html */`
    <section class="task-detail-overlay"
            role="dialog" 
            aria-modal="true" 
            aria-labelledby="edit-task-title"
            aria-describedby="edit-task-description">   
        <div class="task-detail-header task-detail-edit-header">
            <button 
                onclick="closeAddTaskOverlay()" 
                onkeydown="handleCloseKeydown(event)"
                class="close-board-info-overlay" 
                aria-label="Close edit task dialog"
                type="button"
                tabindex="0"
                style="border: none; background: none; cursor: pointer; padding: 4px;">
                <img src="/assets/icons/close.svg" alt="" aria-hidden="true">
            </button>
        </div>
        <div class="task-overlay-wrapper">
            <h1 id="edit-task-title" class="sr-only">Edit Task</h1>
            <div id="edit-task-description" class="sr-only">Edit task form with title, description, due date, priority, assigned contacts, and subtasks</div>
            
            <div class="edit-form-section">
                <label for="edit-title" class="form-headline-text">
                    Title<span class="required-marker" aria-hidden="true">*</span>
                </label>
                <input 
                    id="edit-title" 
                    type="text" 
                    class="title-input-overlay" 
                    placeholder="Enter a title"
                    aria-required="true"
                    aria-describedby="edit-title-error title-hint"
                    autofocus>
                <div id="title-hint" class="sr-only">Enter a descriptive title for the task</div>
                <div id="edit-title-error" class="error-text" aria-live="polite"></div>
            </div>

            <div class="edit-form-section">
                <label for="edit-description" class="form-headline-text">Description</label>
                <textarea 
                    id="edit-description" 
                    class="title-input-overlay description-textarea" 
                    placeholder="Enter a Description"
                    aria-describedby="description-hint"
                    rows="4"></textarea>
                <div id="description-hint" class="sr-only">Optional detailed description of the task</div>
            </div>

            <div class="edit-form-section">
                <label for="edit-due-date" class="form-headline-text">
                    Due date<span class="required-marker" aria-hidden="true">*</span>
                </label>
                <input 
                    id="edit-due-date" 
                    class="title-input-overlay" 
                    min="${todayStr}" 
                    type="date" 
                    aria-required="true"
                    aria-describedby="edit-due-date-error date-hint">
                <div id="date-hint" class="sr-only">Select the deadline for this task</div>
                <div id="edit-due-date-error" class="error-message" aria-live="polite"></div>
            </div>

            <fieldset class="priority-fieldset edit-form-section" style="border: none; padding: 0; margin: 0;">
                <legend class="form-headline-text" style="padding: 0; margin-bottom: 0.5rem;">Priority</legend>
                <div class="priority-buttons">
                    <button 
                        type="button" 
                        class="priority-btn urgent" 
                        id="prio-urgent" 
                        role="radio" 
                        aria-checked="false"
                        onclick="setEditPrio('urgent')"
                        onkeydown="handlePriorityKeydown(event, 'urgent')"
                        aria-describedby="urgent-hint">
                        Urgent
                        <img src="/assets/icons/prio_urgent_icon.svg" alt="" aria-hidden="true">
                    </button>
                    <button 
                        type="button" 
                        class="priority-btn medium active" 
                        id="prio-medium" 
                        role="radio" 
                        aria-checked="true"
                        onclick="setEditPrio('medium')"
                        onkeydown="handlePriorityKeydown(event, 'medium')"
                        aria-describedby="medium-hint">
                        Medium
                        <img src="/assets/icons/prio_medium_icon.svg" alt="" aria-hidden="true">
                    </button>
                    <button 
                        type="button" 
                        class="priority-btn low" 
                        id="prio-low" 
                        role="radio" 
                        aria-checked="false"
                        onclick="setEditPrio('low')"
                        onkeydown="handlePriorityKeydown(event, 'low')"
                        aria-describedby="low-hint">
                        Low
                        <img src="/assets/icons/prio_low_icon.svg" alt="" aria-hidden="true">
                    </button>
                </div>
                <div id="urgent-hint" class="sr-only">High priority task that requires immediate attention</div>
                <div id="medium-hint" class="sr-only">Standard priority task</div>
                <div id="low-hint" class="sr-only">Lower priority task that can be addressed when time permits</div>
            </fieldset>

            <div class="edit-form-section">
                <label id="assigned-edit-label" class="form-headline-text">Assigned to</label>
                <div class="custom-select-container">
                    <div id="assigned-display-edit" 
                        class="select-display" 
                        role="combobox"
                        tabindex="0"
                        aria-expanded="false"
                        aria-haspopup="listbox"
                        aria-labelledby="assigned-edit-label"
                        aria-controls="assigned-dropdown-edit"
                        aria-describedby="assigned-hint"
                        onclick="toggleContactDropdownEdit()"
                        onkeydown="handleAssignedDropdownEditKeydown(event)">
                        Select contacts to assign
                    </div>

                    <div id="assigned-dropdown-edit" 
                        class="select-dropdown" 
                        role="listbox"
                        aria-labelledby="assigned-edit-label"
                        style="display: none;">
                    </div>
                </div>
                <div id="assigned-hint" class="sr-only">Use arrow keys to navigate options, Enter to select</div>

                <div id="user-circle-assigned-edit-overlay" 
                    class="assigned-circles-edit-overlay"
                    role="status"
                    aria-live="polite"></div>
            </div>
            
            <div class="edit-form-section">
                <label for="subtask-input-edit" class="form-headline-text">Subtasks</label>
                <div class="subtask-input-wrapper">
                    <input 
                        type="text" 
                        id="subtask-input-edit" 
                        class="subtask-input-field select-display"
                        placeholder="Add new subtask" 
                        aria-describedby="subtask-hint"
                        onclick="showMainSubtaskIcons()" 
                        onkeydown="handleSubtaskKey(event)">
                    <div id="main-subtask-icons" class="input-action-icons"></div>
                </div>
                <div id="subtask-hint" class="sr-only">Enter subtask text and press Enter to add, or use the buttons to save or cancel</div>

                <ul id="subtask-list-edit-ul" 
                    role="list" 
                    aria-label="Subtask list"
                    style="padding: 0; list-style: none;"></ul>
            </div>
        </div>
        <div class="task-detail-edit-footer">
                <button 
                    onclick="saveEditedTask('${task.id}')" 
                    onkeydown="handleSaveKeydown(event, '${task.id}')"
                    class="btn"
                    aria-describedby="save-hint">
                    Save Changes&nbsp;&nbsp;
                    <img src="/assets/icons/check.svg" alt="" aria-hidden="true">
                </button>
            <div id="save-hint" class="sr-only">Save all changes and close the edit dialog</div>
        </div>  
            
    </section>
    `;
}

function getContactsInTaskOverlayHtml(color, initials, contact) {
    return /* html */`
        <div class="overlay-contact-row">  
            <div class="user-circle-intials" style="background-color: ${color}">${initials}</div>
            <span>${contact.name}</span>
        </div>
        `
}

function showMainSubtaskIcons() {
    let container = document.getElementById('main-subtask-icons');
    container.innerHTML = `
    <button 
            type="button"
            class="subtask-icon" 
            style="display:flex; align-items:center; justify-content:center; border: none; background: none; cursor: pointer;"
            onclick="cancelMainSubtaskInput()"
            onkeydown="handleSubtaskCancelKeydown(event)"
            aria-label="Cancel subtask input"
            tabindex="0">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#2A3647" stroke-width="2" aria-hidden="true">
                <path d="M18 6L6 18M6 6l12 12"/>
            </svg>
        </button>
        <div class="separator-vertical" aria-hidden="true"></div>
        <button 
            type="button"
            class="subtask-icon" 
            style="display:flex; align-items:center; justify-content:center; border: none; background: none; cursor: pointer;"
            onclick="addSubtaskEdit()"
            onkeydown="handleSubtaskAddKeydown(event)"
            aria-label="Add subtask"
            tabindex="0">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#2A3647" stroke-width="2" aria-hidden="true">
                <path d="M20 6L9 17l-5-5"/>
            </svg>
        </button>
    `;
}

function renderSubtasksEditMode() {
    let list = document.getElementById('subtask-list-edit-ul');
    list.innerHTML = '';

    editSubtasks.forEach((st, i) => {
        if (i === editingSubtaskIndex) {
            list.innerHTML += `
            <li class="subtask-edit-row-editing">
                <input 
                    id="edit-subtask-input-${i}" 
                    class="subtask-row-input" 
                    type="text" 
                    value="${st.title}"
                    aria-label="Edit subtask: ${st.title}"
                    onkeydown="handleSubtaskEditKeydown(event, ${i})">
                
                <div class="subtask-icons-container" style="display: flex;">
                    <button 
                        type="button"
                        class="subtask-icon" 
                        onclick="deleteSubtaskEdit(${i})"
                        onkeydown="handleSubtaskDeleteKeydown(event, ${i})"
                        aria-label="Delete subtask: ${st.title}"
                        tabindex="0"
                        style="border: none; background: none; cursor: pointer; padding: 2px;">
                        <img src="/assets/icons/delete.svg" alt="" aria-hidden="true">
                    </button>
                    
                    <div class="separator-vertical" aria-hidden="true"></div>
                    
                    <button 
                        type="button"
                        class="subtask-icon" 
                        onclick="saveEditedSubtask(${i})"
                        onkeydown="handleSubtaskSaveKeydown(event, ${i})"
                        aria-label="Save changes to subtask"
                        tabindex="0"
                        style="border: none; background: none; cursor: pointer; padding: 2px;">
                        <img src="/assets/icons/check_black.svg" alt="" aria-hidden="true">
                    </button>
                </div>
            </li>`;

        } else {
            list.innerHTML += `
            <li class="subtask-edit-row">
                <button 
                    type="button"
                    aria-label="Subtask: ${st.title}. Press to edit this subtask"
                    onclick="editSubtask(${i})"
                    onkeydown="handleSubtaskRowKeydown(event, ${i})"
                    class="subtask-edit-element-one">
                    
                    <span style="flex-grow:1; text-align: left;">• ${st.title}</span>
                    
                    <div class="subtask-icons-container" style="display: flex;">
                        <button 
                            type="button"
                            class="subtask-icon" 
                            onclick="editSubtask(${i}); event.stopPropagation();"
                            onkeydown="handleSubtaskEditActionKeydown(event, ${i})"
                            aria-label="Edit subtask: ${st.title}"
                            tabindex="0"
                            style="border: none; background: none; cursor: pointer; padding: 2px;">
                            <img src="/assets/icons/edit.svg" alt="" aria-hidden="true">
                        </button>
                        
                        <div class="separator-vertical" aria-hidden="true"></div>
                        
                        <button 
                            type="button"
                            class="subtask-icon" 
                            onclick="deleteSubtaskEdit(${i}); event.stopPropagation();"
                            onkeydown="handleSubtaskDeleteKeydown(event, ${i})"
                            aria-label="Delete subtask: ${st.title}"
                            tabindex="0"
                            style="border: none; background: none; cursor: pointer; padding: 2px;">
                            <img src="/assets/icons/delete.svg" alt="" aria-hidden="true">
                        </button>
                    </div>
                </button>
            </li>`;
        }
    });

    if (editingSubtaskIndex >= 0) {
        setTimeout(() => {
            const editInput = document.getElementById(`edit-subtask-input-${editingSubtaskIndex}`);
            if (editInput) {
                editInput.focus();
                editInput.setSelectionRange(editInput.value.length, editInput.value.length);
            }
        }, 10);
    }
}

function renderContactLargeHtml(contact, color) {
    const contactJson = JSON.stringify(contact).replace(/"/g, '&quot;');
    return /* html */`
        <div class="tile_summary_2">
            <div class="overlay_title_mobile">
                <div>
                    <h1 class="h1_title_summary">Contacts</h1>
                </div>
                <div>
                    <button 
                        type="button"
                        class="go_back" 
                        onclick="closeContactOverlay()"
                        onkeydown="handleContactBackKeydown(event)"
                        aria-label="Go back to contacts list"
                        tabindex="0"
                        style="background: none; border: none; cursor: pointer;">
                        <img src="/assets/icons/arrow-left-line.svg" alt="go back" aria-hidden="true">
                    </button>
                </div>
            </div>

            <div class="title_seperator_2" aria-hidden="true">
                <img src="/assets/icons/Summary_title_seperator.svg" height="59px" width="3px" alt="seperator">
            </div>

            <div class="title_summary_discription_2">
                <p class="title_discription">Better with a team</p>
            </div>
        </div>

        <main class="flex gap-56 align edit_cirle_name" role="main" aria-labelledby="contact-name-display">
            <div class="user-circle-intials user-circle-large" 
                style="background-color: ${color}"
                aria-hidden="true">
                ${getInitials(contact.name)}
            </div>
            <div class="flex column name_contact">
                <h2 id="contact-name-display" class="contact-list-name contact-name-large">
                    ${contact.name}
                </h2>
                <div class="flex gap-13" role="toolbar" aria-label="Contact actions">
                    <button 
                        id="edit-contact-btn"
                        type="button"
                        onclick="showDialogContact('contactEditDeleteModal', '${contactJson}', '${color}', event, 'Edit')" 
                        onkeydown="handleContactEditKeydown(event, '${contactJson}', '${color}')"
                        class="contacts-edit-delete-buttons" 
                        aria-label="Edit contact information for ${contact.name}"
                        aria-describedby="edit-contact-hint"
                        tabindex="0"
                        autofocus>
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none"
                            xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
                            <mask id="mask0_75592_9969" style="mask-type:alpha" maskUnits="userSpaceOnUse" x="0"
                                y="0" width="24" height="24">
                                <rect width="24" height="24" fill="#D9D9D9" />
                            </mask>
                            <g mask="url(#mask0_75592_9969)">
                                <path
                                    d="M5 19H6.4L15.025 10.375L13.625 8.975L5 17.6V19ZM19.3 8.925L15.05 4.725L16.45 3.325C16.8333 2.94167 17.3042 2.75 17.8625 2.75C18.4208 2.75 18.8917 2.94167 19.275 3.325L20.675 4.725C21.0583 5.10833 21.2583 5.57083 21.275 6.1125C21.2917 6.65417 21.1083 7.11667 20.725 7.5L19.3 8.925ZM17.85 10.4L7.25 21H3V16.75L13.6 6.15L17.85 10.4Z"
                                    fill="#2A3647" />
                            </g>
                        </svg>
                        <span>Edit</span>
                    </button>
                    <div id="edit-contact-hint" class="sr-only">Opens edit dialog for this contact</div>
                    
                    <button 
                        type="button"
                        onclick="showDialogContact('contactEditDeleteModal', '${contactJson}', '${color}', event, 'Delete')" 
                        onkeydown="handleContactDeleteKeydown(event, '${contactJson}', '${color}')"
                        class="contacts-edit-delete-buttons" 
                        aria-label="Delete contact ${contact.name}"
                        aria-describedby="delete-contact-hint"
                        tabindex="0">
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none"
                            xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
                            <mask id="mask0_75592_9951" style="mask-type:alpha" maskUnits="userSpaceOnUse" x="0"
                                y="0" width="24" height="24">
                                <rect width="24" height="24" fill="#D9D9D9" />
                            </mask>
                            <g mask="url(#mask0_75592_9951)">
                                <path
                                    d="M7 21C6.45 21 5.97917 20.8042 5.5875 20.4125C5.19583 20.0208 5 19.55 5 19V6C4.71667 6 4.47917 5.90417 4.2875 5.7125C4.09583 5.52083 4 5.28333 4 5C4 4.71667 4.09583 4.47917 4.2875 4.2875C4.47917 4.09583 4.71667 4 5 4H9C9 3.71667 9.09583 3.47917 9.2875 3.2875C9.47917 3.09583 9.71667 3 10 3H14C14.2833 3 14.5208 3.09583 14.7125 3.2875C14.9042 3.47917 15 3.71667 15 4H19C19.2833 4 19.5208 4.09583 19.7125 4.2875C19.9042 4.47917 20 4.71667 20 5C20 5.28333 19.9042 5.52083 19.7125 5.7125C19.5208 5.90417 19.2833 6 19 6V19C19 19.55 18.8042 20.0208 18.4125 20.4125C18.0208 20.8042 17.55 21 17 21H7ZM7 6V19H17V6H7ZM9 16C9 16.2833 9.09583 16.5208 9.2875 16.7125C9.47917 16.9042 9.71667 17 10 17C10.2833 17 10.5208 16.9042 10.7125 16.7125C10.9042 16.5208 11 16.2833 11 16V9C11 8.71667 10.9042 8.47917 10.7125 8.2875C10.5208 8.09583 10.2833 8 10 8C9.71667 8 9.47917 8.09583 9.2875 8.2875C9.09583 8.47917 9 8.71667 9 9V16ZM13 16C13 16.2833 13.0958 16.5208 13.2875 16.7125C13.4792 16.9042 13.7167 17 14 17C14.2833 17 14.5208 16.9042 14.7125 16.7125C14.9042 16.5208 15 16.2833 15 16V9C15 8.71667 14.9042 8.47917 14.7125 8.2875C14.5208 8.09583 14.2833 8 14 8C13.7167 8 13.4792 8.09583 13.2875 8.2875C13.0958 8.47917 13 8.71667 13 9V16Z"
                                    fill="#2A3647" />
                            </g>
                        </svg>
                        <span>Delete</span>
                    </button>
                    <div id="delete-contact-hint" class="sr-only">Permanently removes this contact</div>
                </div>
            </div>
        </main>

        <section class="flex column gap-13 title_mobile" 
            aria-labelledby="contactInformation" 
            role="region">
            <h3 class="contact-head" id="contactInformation">Contact Information</h3>
            
            <div class="contact-info-group" role="group" aria-labelledby="email-label">
                <p id="email-label" class="font-16"><strong>Email</strong></p>
                <p style="color: #007CEE;">
                    <a href="mailto:${contact.email}" 
                        aria-label="Send email to ${contact.name} at ${contact.email}"
                        tabindex="0">
                        ${contact.email}
                    </a>
                </p>
            </div>
            
            <div class="contact-info-group" role="group" aria-labelledby="phone-label">
                <p id="phone-label" class="font-16"><strong>Phone</strong></p>
                <p style="color: #007CEE;" aria-describedby="phone-hint">
                    ${checkContactForPhoneHtml(contact)}
                </p>
                <div id="phone-hint" class="sr-only">
                    ${contact.phone ? `Phone number for ${contact.name}` : 'No phone number available'}
                </div>
            </div>
        </section>

        <button 
            type="button"
            class="mobile-actions-btn" 
            onclick="toggleMobileContactMenu()"
            onkeydown="handleMobileMenuKeydown(event)"
            aria-label="Open contact actions menu"
            aria-expanded="false"
            aria-haspopup="menu"
            aria-controls="mobileContactMenu"
            tabindex="0">
            <img src="../assets/icons/more_vert.svg" alt="" aria-hidden="true">
        </button>

        <div id="mobileContactMenu" 
            class="mobile-contact-menu"
            role="menu"
            aria-label="Contact actions menu"
            aria-hidden="true"
            style="display: none;">
            <button 
                type="button"
                role="menuitem"
                onclick="openEditContact('${contactJson}', '${color}')"
                onkeydown="handleMobileEditKeydown(event, '${contactJson}', '${color}')"
                aria-label="Edit contact information for ${contact.name}"
                tabindex="-1">
                <img src="../assets/icons/edit.svg" alt="" aria-hidden="true"> 
                <span>Edit</span>
            </button>

            <button 
                type="button"
                role="menuitem"
                onclick="openDeleteContact('${contactJson}', '${color}')"
                onkeydown="handleMobileDeleteKeydown(event, '${contactJson}', '${color}')"
                aria-label="Delete contact ${contact.name}"
                tabindex="-1">
                <img src="../assets/icons/delete.svg" alt="" aria-hidden="true"> 
                <span>Delete</span>
            </button>
        </div>
    `;
}

function renderAddNewContactOverlayHtml() {
    return /*html*/`
        <article class="flex h-100 add_contact_overlay" 
                role="dialog"
                aria-modal="true"
                aria-labelledby="contact-dialog-h2"
                style="color: var(--white); position: relative;">
            <button class="close-button-position" 
                    onclick="contactCancel(event); return false;" 
                    onkeydown="handleContactCloseKeydown(event)"
                    aria-label="Close add contact dialog" 
                    tabindex="0"
                    type="button"
                    style="cursor: pointer; background: none; border: none;">
                <svg class="close-btn" width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path
                        d="M12.001 12.0001L17.244 17.2431M6.758 17.2431L12.001 12.0001L6.758 17.2431ZM17.244 6.75708L12 12.0001L17.244 6.75708ZM12 12.0001L6.758 6.75708L12 12.0001Z"
                        stroke="#2A3647" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" />
                </svg>
            </button>

            <div class="flex align contact-dialog-add">
                <div class="flex column gap-13 overlay_title">
                    <img class="add_contact_overlay_img" src="/assets/icons/Join_light.png" alt="Join Logo"
                        style="height: 66px; width: 55px;" aria-hidden="true">
                    <h2 id="contact-dialog-h2" class="contact-dialog-h2">Add contact</h2>
                    <p class="contact-dialog-h3">Tasks are better with a team!</p>
                    <div class="contact-dialog-line" aria-hidden="true"></div>
                </div>
            </div>

            <div class="flex align user_idle_add_task" aria-hidden="true">
                <div class="user-circle-intials user-circle-large" style="background-color: #D1D1D1">
                    <svg width="64" height="64" viewBox="0 0 64 64" fill="none"
                        xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
                        <mask id="mask0_71395_17941" style="mask-type:alpha" maskUnits="userSpaceOnUse" x="0"
                            y="0" width="64" height="64">
                            <rect width="64" height="64" fill="#D9D9D9" />
                        </mask>
                        <g mask="url(#mask0_71395_17941)">
                            <path
                                d="M32.0001 32.0001C29.0667 32.0001 26.5556 30.9556 24.4667 28.8667C22.3779 26.7779 21.3334 24.2667 21.3334 21.3334C21.3334 18.4001 22.3779 15.889 24.4667 13.8001C26.5556 11.7112 29.0667 10.6667 32.0001 10.6667C34.9334 10.6667 37.4445 11.7112 39.5334 13.8001C41.6223 15.889 42.6667 18.4001 42.6667 21.3334C42.6667 24.2667 41.6223 26.7779 39.5334 28.8667C37.4445 30.9556 34.9334 32.0001 32.0001 32.0001ZM48.0001 53.3334H16.0001C14.5334 53.3334 13.2779 52.8112 12.2334 51.7668C11.189 50.7223 10.6667 49.4668 10.6667 48.0001V45.8667C10.6667 44.3556 11.0556 42.9667 11.8334 41.7001C12.6112 40.4334 13.6445 39.4667 14.9334 38.8001C17.689 37.4223 20.489 36.389 23.3334 35.7001C26.1779 35.0112 29.0667 34.6667 32.0001 34.6667C34.9334 34.6667 37.8223 35.0112 40.6667 35.7001C43.5112 36.389 46.3112 37.4223 49.0667 38.8001C50.3556 39.4667 51.389 40.4334 52.1667 41.7001C52.9445 42.9667 53.3334 44.3556 53.3334 45.8667V48.0001C53.3334 49.4668 52.8112 50.7223 51.7668 51.7668C50.7223 52.8112 49.4668 53.3334 48.0001 53.3334ZM16.0001 48.0001H48.0001V45.8667C48.0001 45.3779 47.8779 44.9334 47.6334 44.5334C47.389 44.1334 47.0667 43.8223 46.6667 43.6001C44.2668 42.4001 41.8445 41.5001 39.4001 40.9001C36.9556 40.3001 34.489 40.0001 32.0001 40.0001C29.5112 40.0001 27.0445 40.3001 24.6001 40.9001C22.1556 41.5001 19.7334 42.4001 17.3334 43.6001C16.9334 43.8223 16.6112 44.1334 16.3667 44.5334C16.1223 44.9334 16.0001 45.3779 16.0001 45.8667V48.0001ZM32.0001 26.6667C33.4667 26.6667 34.7223 26.1445 35.7668 25.1001C36.8112 24.0556 37.3334 22.8001 37.3334 21.3334C37.3334 19.8667 36.8112 18.6112 35.7668 17.5667C34.7223 16.5223 33.4667 16.0001 32.0001 16.0001C30.5334 16.0001 29.2779 16.5223 28.2334 17.5667C27.189 18.6112 26.6667 19.8667 26.6667 21.3334C26.6667 22.8001 27.189 24.0556 28.2334 25.1001C29.2779 26.1445 30.5334 26.6667 32.0001 26.6667Z"
                                fill="white" />
                        </g>
                    </svg>
                </div>
            </div>

            <div class="flex column justify pg-r30 overlay_form">
                <form class="contact-form" onsubmit="createContact(); return false;" novalidate>
                    <div class="input-field">
                        <input class="input_login" type="text" id="nameContact"
                            oninput="validateFieldContact('nameContact', 'errMsgName', isNameValid, 0, 'Please enter forename + _space_ + surname', true)"
                            tabindex="0" 
                            placeholder="Full name"
                            aria-required="true"
                            aria-describedby="errMsgName"
                            aria-label="Contact full name"
                            aria-invalid="false"
                            autofocus>
                        <div class="icon-div">
                            <img src="../assets/icons/person.png" alt="Person icon" aria-hidden="true">
                        </div>
                    </div>
                    <div id="errMsgName" class="error-msg" style="display: none;" aria-live="polite"></div>

                    <div class="input-field">
                        <input class="input_login" type="email" id="emailContact"
                            oninput="validateFieldContact('emailContact', 'errMsgEmail', isEmailValid, 1, 'Email format is wrong, please update', true)"
                            tabindex="0" 
                            placeholder="Email"
                            aria-required="true"
                            aria-describedby="errMsgEmail"
                            aria-label="Contact email address"
                            aria-invalid="false">
                        <div class="icon-div">
                            <img src="../assets/icons/mail.png" alt="Email icon" aria-hidden="true">
                        </div>
                    </div>
                    <div id="errMsgEmail" class="error-msg" style="display: none;" aria-live="polite"></div>

                    <div class="input-field">
                        <input class="input_login" type="tel" id="phoneContact" 
                            tabindex="0"
                            placeholder="Phone number"
                            aria-describedby="errMsgPhone"
                            aria-label="Contact phone number (optional)"
                            aria-invalid="false">
                        <div class="icon-div">
                            <img src="../assets/icons/call.png" alt="Phone icon" aria-hidden="true">
                        </div>
                    </div>
                    <div id="errMsgPhone" class="error-msg" style="display: none;" aria-live="polite"></div>

                    <div class="two-buttons">
                        <button class="btn_contact_cancel flex align gap-13"
                                onclick="contactCancel(event); return false;" 
                                onkeydown="handleContactCancelKeydown(event)"
                                tabindex="0" 
                                type="button"
                                aria-label="Cancel and close dialog">
                            Cancel
                            <svg width="24" height="24" viewBox="0 0 24 24" fill="none"
                                xmlns="http://www.w3.org/2000/svg">
                                <path
                                    d="M12.001 12.0001L17.244 17.2431M6.758 17.2431L12.001 12.0001L6.758 17.2431ZM17.244 6.75708L12 12.0001L17.244 6.75708ZM12 12.0001L6.758 6.75708L12 12.0001Z"
                                    stroke="#2A3647" stroke-width="2" stroke-linecap="round"
                                    stroke-linejoin="round" />
                            </svg>
                        </button>
                        <button id="contactCreateBtn" 
                                class="btn_contact_create btn flex align gap-13" 
                                type="submit" 
                                tabindex="0" 
                                disabled 
                                aria-disabled="true"
                                aria-label="Create new contact"
                                onkeydown="handleContactSubmitKeydown(event)">
                            Create contact
                            <svg width="20" height="15" viewBox="0 0 16 12" fill="none"
                                xmlns="http://www.w3.org/2000/svg">
                                <path
                                    d="M5.288 8.775L13.763 0.3C13.963 0.1 14.2005 0 14.4755 0C14.7505 0 14.988 0.1 15.188 0.3C15.388 0.5 15.488 0.7375 15.488 1.0125C15.488 1.2875 15.388 1.525 15.188 1.725L5.988 10.925C5.788 11.125 5.55467 11.225 5.288 11.225C5.02133 11.225 4.788 11.125 4.588 10.925L0.288 6.625C0.088 6.425 -0.00783333 6.1875 0.0005 5.9125C0.00883333 5.6375 0.113 5.4 0.313 5.2C0.513 5 0.7505 4.9 1.0255 4.9C1.3005 4.9 1.538 5 1.738 5.2L5.288 8.775Z"
                                    fill="white" />
                            </svg>
                        </button>
                    </div>
                </form>
            </div>
        </article>
        `
}

function renderEditContactOverlayHtml(contact, color, option) {
    return /*html*/`
        <article class="flex h-100 overlay_edit_delete" 
                role="dialog"
                aria-modal="true"
                aria-labelledby="edit-contact-dialog-h2"
                style="color: var(--white); position: relative;">
            <button 
                type="button"
                class="close-button-position" 
                onclick="contactCancel(event); return false;" 
                onkeydown="handleContactCloseKeydown(event)"
                aria-label="Close ${option.toLowerCase()} contact dialog" 
                tabindex="0"
                style="cursor: pointer; background: none; border: none;">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
                    <path
                        d="M12.001 12.0001L17.244 17.2431M6.758 17.2431L12.001 12.0001L6.758 17.2431ZM17.244 6.75708L12 12.0001L17.244 6.75708ZM12 12.0001L6.758 6.75708L12 12.0001Z"
                        stroke="#2A3647" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" />
                </svg>
            </button>

            <div class="flex align contact-dialog-add">
                <div class="flex column gap-13 title_mobile">
                    <img class="logo_img_edit" src="/assets/icons/Join_light.png" alt="Join Logo" aria-hidden="true"
                        style="height: 66px; width: 55px;">
                    <h2 id="edit-contact-dialog-h2" class="contact-dialog-h2">${option} contact</h2>
                    <div class="contact-dialog-line" aria-hidden="true"></div>
                </div>
            </div>

            <div class="flex align user-circle-intials" aria-hidden="true">
                <div class="user-circle-intials user-circle-large_edit" style="background-color: ${color}; font-size: 47px;">
                    ${getInitials(contact.name)}
                </div>
            </div>

            <div class="flex column justify pg-r30 mobile_input">
                <form class="contact-form" onsubmit="updateContact('${contact.id}', '${option}'); return false;" novalidate>
                    <div class="input-field">
                        <input 
                            class="input_login" 
                            type="text" 
                            id="nameContact" 
                            value="${contact.name}"
                            oninput="validateFieldContact('nameContact', 'errMsgName', isNameValid, 0, 'Please enter forename + _space_ + surname', true)"
                            tabindex="0" 
                            placeholder="Full name"
                            aria-required="true"
                            aria-describedby="errMsgName"
                            aria-label="Contact full name"
                            aria-invalid="false"
                            autofocus>
                        <div class="icon-div" aria-hidden="true">
                            <img src="../assets/icons/person.png" alt="" aria-hidden="true">
                        </div>
                    </div>
                    <div id="errMsgName" class="error-msg" role="alert" aria-live="polite" style="display: none;"></div>

                    <div class="input-field">
                        <input class="input_login" type="email" id="emailContact" value="${contact.email}"
                            oninput="validateFieldContact('emailContact', 'errMsgEmail', isEmailValid, 1, 'Email format is wrong, please update', true)"
                            tabindex="0" 
                            placeholder="Email"
                            aria-required="true"
                            aria-describedby="errMsgEmail"
                            aria-label="Contact email address"
                            aria-invalid="false">
                        <div class="icon-div" aria-hidden="true">
                            <img src="../assets/icons/mail.png" alt="" aria-hidden="true">
                        </div>
                    </div>
                    <div id="errMsgEmail" class="error-msg" role="alert" aria-live="polite" style="display: none"></div>

                    <div class="input-field">
                        <input class="input_login" type="tel" id="phoneContact" value="${checkContactForPhone(contact)}"
                            oninput="validateFieldContact('phoneContact', 'errMsgPhone', isPhoneValid, 1, 'Allowed 20 symbols [0-9+()/-] and [space]', false)"
                            tabindex="0" 
                            placeholder="Phone number"
                            aria-describedby="errMsgPhone"
                            aria-label="Contact phone number (optional)"
                            aria-invalid="false">
                        <div class="icon-div" aria-hidden="true">
                            <img src="../assets/icons/call.png" alt="" aria-hidden="true">
                        </div>
                    </div>
                    <div id="errMsgPhone" class="error-msg" role="alert" aria-live="polite" style="display: none;"></div>

                    <div class="two-buttons" role="group" aria-label="Dialog actions">
                        <button 
                            type="button"
                            class="btn_contact_cancel flex align gap-13"
                            onclick="contactCancel(event); return false;" 
                            onkeydown="handleContactCancelKeydown(event)"
                            tabindex="0"
                            aria-label="Cancel and close dialog">
                            Cancel
                            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
                                <path
                                    d="M12.001 12.0001L17.244 17.2431M6.758 17.2431L12.001 12.0001L6.758 17.2431ZM17.244 6.75708L12 12.0001L17.244 6.75708ZM12 12.0001L6.758 6.75708L12 12.0001Z"
                                    stroke="#2A3647" stroke-width="2" stroke-linecap="round"
                                    stroke-linejoin="round" />
                            </svg>
                        </button>
                        <button 
                            id="contactCreateBtn" 
                            class="btn_contact_create btn flex align gap-13" 
                            type="submit" 
                            tabindex="0"
                            aria-label="${option === 'Edit' ? 'Save changes to contact' : 'Delete this contact'}"
                            onkeydown="handleContactSubmitKeydown(event)">
                            ${option === 'Edit' ? 'Save' : 'Delete'}
                            <svg width="20" height="15" viewBox="0 0 16 12" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
                                <path
                                    d="M5.288 8.775L13.763 0.3C13.963 0.1 14.2005 0 14.4755 0C14.7505 0 14.988 0.1 15.188 0.3C15.388 0.5 15.488 0.7375 15.488 1.0125C15.488 1.2875 15.388 1.525 15.188 1.725L5.988 10.925C5.788 11.125 5.55467 11.225 5.288 11.225C5.02133 11.225 4.788 11.125 4.588 10.925L0.288 6.625C0.088 6.425 -0.00783333 6.1875 0.0005 5.9125C0.00883333 5.6375 0.113 5.4 0.313 5.2C0.513 5 0.7505 4.9 1.0255 4.9C1.3005 4.9 1.538 5 1.738 5.2L5.288 8.775Z"
                                    fill="white" />
                            </svg>
                        </button>
                    </div>
                </form>
            </div>
        </article>

        <div id="popupContactUpdated" 
            class="popup btn"
            role="status"
            aria-live="polite"
            aria-label="Contact update confirmation">
            <p class="btn_std">Contact updated successfully</p>
        </div>
        `
}

function contactRowHTML(contact, index) {
    let isSelected = editAssignedIds.includes(contact.id);
    let cssClass = isSelected ? 'contact-item selected' : 'contact-item';
    let icon = isSelected ? getCheckboxCheckedSvg() : getCheckboxEmptySvg();
    return `
    <div id="contact-row-${contact.id}" class="${cssClass}" onclick="toggleContactSelection('${contact.id}', event)"
    onkeydown="handlecontactSelectonCheckboxKeydown('${contact.id}', event)">
        <div class="contact-item-left">
            ${renderContactCircle(contact)}
            <span class="contact-name">${contact.name}</span>
        </div>
        <div class="contact-checkbox-icon" aria-label="Select ${contact.name} for task assignment"
            tabindex="0">
            ${icon}
        </div>
    </div>
    `;
}

function renderContactCircle(contact, index) {
    const color = contactCircleColor[contact.id % contactCircleColor.length];
    const initials = getInitials(contact.name);
    return `<div class="user-circle-intials" style="background-color: ${color};">${initials}</div>`;
}

function generateSubtaskRowHtml(taskId, index, title, icon, isChecked, tabIndex = 0) {
    return `
        <div class="subtask-row" 
            role="checkbox" 
            aria-checked="${isChecked}"
            tabindex="${tabIndex}"
            aria-label="Subtask: ${title}"
            onclick="toggleSubtaskWithScrollPreservation('${taskId}', ${index})"
            onkeydown="handleSubtaskToggleKeydown(event, '${taskId}', ${index})">
            <div class="subtask-icon" aria-hidden="true">
                ${icon}
            </div>
            <span class="subtask-text ${isChecked ? 'text-done' : ''}" aria-describedby="subtask-status-${taskId}-${index}">
                ${title}
            </span>
            <span id="subtask-status-${taskId}-${index}" class="sr-only">
                ${isChecked ? 'Completed' : 'Not completed'}
            </span>
        </div>
    `;
}


function getCheckboxEmptySvg() {
    return `<svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <rect x="4" y="4" width="16" height="16" rx="3" stroke="#2A3647" stroke-width="2"/>
            </svg>`;
}

function getCheckboxCheckedSvg() {
    return `<svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <rect x="4" y="4" width="16" height="16" rx="3" stroke="white" stroke-width="2"/>
            <path d="M8 12L11 15L16 9" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
            </svg>`;
}

function getUncheckIcon() {
    return `<svg width="24" height="24" viewBox="0 0 24 24" fill="none" aria-hidden="true">
            <rect x="4" y="4" width="16" height="16" rx="3" stroke="#2A3647" stroke-width="2"/>
            </svg>`;
}

function getCheckIcon() {
    return `<svg width="24" height="24" viewBox="0 0 24 24" fill="none" aria-hidden="true">
            <rect x="4" y="4" width="16" height="16" rx="3" stroke="#2A3647" stroke-width="2"/>
            <path d="M8 12L11 15L16 9" stroke="#2A3647" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
            </svg>`;
}

// #region board_search

function displaySearchInBoardHtml() {
    return /* html */`
        <div class="searchbar" role="search" aria-label="Task search">
            <label for="searchTasks" class="sr-only">Find Task</label>
            <input 
                id="searchTasks" 
                oninput="searchTasks()" 
                onkeydown="handleSearchKeydown(event)"
                class="searchbar__input" 
                type="text"
                placeholder="Find Task" 
                autocomplete="off"
                aria-label="Find Task">
            <div class="searchbar__divider" aria-hidden="true"></div>
            <button 
                type="button"
                class="btn_glass" 
                onclick="searchAndClearSearchField()"
                onkeydown="handleSearchButtonKeydown(event)"
                aria-label="Find Task"
                tabindex="0">
                <img class="searchbar__icon" src="/assets/icons/search.svg" alt="" aria-hidden="true">
            </button>
        </div>`
}

// #endregion
