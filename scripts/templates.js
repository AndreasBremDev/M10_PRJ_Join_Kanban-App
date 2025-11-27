function renderTasksCardSmallHtml(task) {
    // const taskJson = JSON.stringify(task).replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/'/g, '&#39;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/\n/g, '\\n').replace(/\r/g, '\\r').replace(/\t/g, '\\t');
    const taskJson = btoa(JSON.stringify(task)); // Base64-Encoding
    return `
    <article onclick="renderTaskDetail('${taskJson}')" class="drag-item" draggable="true" ondragstart="dragstartHandler(event, '${task.id}')" ondragend="dragendHandler(event)">
        <div class="card-inner">
            <p class="${categoryColor(task)}">${task.category}</p>
            <h3>${task.title}</h3>
            <p class="gray-text">${task.description}</p>
                ${checkForAndDisplaySubtasks(task)}
            <div class="flex spacebetween">
                ${checkForAndDisplayUserCircles(task)}
                <img src="/assets/icons/prio_${task.priority}_icon.svg" alt="urgency icon">
            </div>
        </div>
    </article>`
}

function renderTaskCardSubtaskProgress(doneSubtasks, totalSubtasks) {
    return `<div class="flex">
                <progress value="${doneSubtasks}" max="${totalSubtasks}" style="width:96px"></progress>
                <span>${doneSubtasks}/${totalSubtasks} Subtasks</span>
            </div>`
}

function renderTaskCardAssignedSectionGrid(arrAssigned) {
    return /*html*/ `<div class="grid-container" style="grid-template-columns: repeat(${arrAssigned.length}, 22px); width: calc(${arrAssigned.length - 1} *22px + 44px);">`
}
function renderTaskCardAssignedSectionGridMoreThanFive() {
    return /*html*/ `<div class="grid-container" style="grid-template-columns: repeat(6, 22px); width: calc(5 *22px + 44px);">`
}

function renderTaskCardAssignedSectionInitials(initial, color) {
    return /*html*/`<div class="user-circle-task" style="background-color: ${color};">${initial}</div>`
}

function renderTasksHtmlEmptyArray(categoryId) {
    const categoryNames = {
        'categoryToDo': 'To Do',
        'categoryInProgress': 'In Progress',
        'categoryAwaitFeedback': 'Await Feedback',
        'categoryDone': 'Done'
    };
    return `
    <article class="empty-task-box">
        <span class="card-inner">
            No Task ${categoryNames[categoryId]}
        </span>
    </article>
    `
}

function renderContactsCardPartOne(key) {
    return `<div class="contact-list-letter">${key}</div>
                <hr class="contact-list-separator">
        `;
}

function renderContactsCardPartTwo(contact, color) {
    const contactJson = JSON.stringify(contact).replace(/"/g, '&quot;');
    return `
        <div class="contact-list-card" onclick="contactsLargeSlideIn(event, '${contactJson}', '${color}')">
            <div class="user-circle-intials" data-color="globalIndex" style="background-color: ${color}">
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

function emptyContactsHtml() {
    return `
    <br><br><br><br><br>
        No Contacts 🙍‍♂️ yet, please add new contacts+
    `
}

function contactsLoadingIssueHTML() {
    return `
   <div>Error loading contacts.</div>
     `
}

function getAddTaskOverlayTemplate(board) {
    const todayStr = new Date().toISOString().split('T')[0];

    return `
            <section class="add-task-section overlay-add-task">
        <div class= overlay-header>
            <h1 class="overlay-headline">Add Task</h1>
        </div>
        <img onclick="closeAddTaskOverlay()" class="close-add-task-overlay" src="/assets/icons/close.svg" alt="close">
                <form id="task-form" class="task-form">
                    <div class="form-left form-left-overlay">
                        <div class="overlay-add-task-div">
                            <label for="title" class="form-headline-text">Title<span class="required-marker">*</span></label>
                               <div class="title-input-container-overlay">
                                    <input id="title" class="title-input-overlay" type="text" placeholder="Enter a title">
                                 </div>
                        </div>

                        <div class="description-overlay">
                            <label for="description" class="form-headline-text">Description</label>
                            <textarea id="description" class="description-input-overlay title-input-overlay" placeholder="Enter a Description"></textarea>
                        </div>

                        <label for="due-date" class="form-headline-text">Due date<span class="required-marker">*</span></label>
                        <div class="date-overlay">
                            <input id="due-date" class="due-date-overlay" min="${todayStr}" type="date" required>
                        </div>
                    </div>

                    <div class="divider divider-overlay"></div>

                    <div class="form-right form-right-overlay">
                            <label class="form-headline-text">Priority</label>
                        <div class="priority-buttons priority-buttons-overlay">
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

                        

                        <label for="assigned" class="form-headline-text">Assigned to</label>
                        <div class="custom-select-container">
                            <div id="assigned-display" class="select-display" onclick="toggleContactDropdown()">
                                Select contacts to assign
                            </div>

                            <div id="assigned-dropdown" class="select-dropdown" style="display: none;">
                            </div>
                        </div>

                        
                        
                                     <label for="category" class="form-headline-text">Category<span class="required-marker">*</span></label>
                                <select id="category" required>
                                <option value="" disabled selected>Select task category</option>
                                <option value="technical">Technical Task</option>
                                <option value="user-story">User Story</option>
                                </select>

                                <label for="subtask" class="form-headline-text">Subtasks</label>
                            <div class="subtask-overlay">
                                <input  type="text" id="subtask" class="title-input-overlay" placeholder="Add new subtask">
                            </div>

                    </div>
                </form>

                <div class="form-footer">
                    <p class="form-hint form-hint-overlay">
                        <span class="required-marker">*</span>This field is required
                    </p>

                    <div class="form-actions form-actions-overlay">
                        <button onclick="clearForm(), closeAddTaskOverlay()" id="clear-btn" type="button" class="clear">Cancel ✖</button>
                        <button onclick="handleCreateTask('${board}')" id="create-btn" type="button" class="create">Create Task ✔</button>
                    </div>
                </div>
            </section>
    `;
}


function getTaskDetailOverlayTemplate(task) {

    return `
    <div class="task-detail-overlay">
    
        <div class="task-detail-header ">

            <p class="${categoryColor(task)}">${task.category}</p>

            <img onclick="closeAddTaskOverlay()" class="close-board-info-overlay" src="/assets/icons/close.svg" alt="close">
        
        </div>

            <div class="task-detail-headline">
                <h1>${task.title}</h1>
            </div>


            <div class="task-detail-description">
                <p class="pd-bottom-16">${task.description}</h1>
            </div>


            <div class="task-detail-due-date pd-bottom-16">
                    <div>Due Date:</div>
                    <div>${task.dueDate}</div>
            </div>
            
            <div class="task-detail-priority pd-bottom-16">
                <div style="font-size: 18px;">Priority:</div>
                <div>${task.priority.charAt(0).toUpperCase() + task.priority.slice(1)}</div>
                <img src="/assets/icons/prio_${task.priority}_icon.svg" alt="priority icon">
            </div>

            <div class="task-detail-assigned pd-bottom-16">
                <div style="font-size: 18px;">Assigned to:</div>
                <div id="overlayContactContainer" class="contact-circle-container"></div>
            </div>

            <div class="task-detail-subtasks pd-bottom-16">
                <div style="font-size: 18px;">Subtasks:</div>
                <div>
                    ${renderSubtasksForOverlay(task)}
                </div>
            </div>


            <div class="task-detail-delete-edit-button-container">
                <div onclick="deleteTaskfromBoard('${task.id}')" class="task-detail-delete-button">
                <div class="task-delete-icon"></div>
                </div>

                <div class="task-detail-spacer"></div>

                <div onclick="renderEditTaskDetail('${task.id}')" class="task-detail-edit-button">
                <div class="task-edit-icon"></div>
                </div>
            </div>

            
    
    
    </div>
    `
}

function editTaskDetailOverlayTemplate(task) {
    const todayStr = new Date().toISOString().split('T')[0];
    return `
    <div class="task-detail-overlay">   
    
        <div class="task-detail-header task-detail-edit-header">
                <img onclick="closeAddTaskOverlay()" class="close-board-info-overlay" src="/assets/icons/close.svg" alt="close">
            </div>

            <div class="task-detail-edit-main">
                <label for="title">Title</label>
                    <input id="title" type="text" class="title-input-overlay" placeholder="Enter a title">

                    <label for="description">Description</label>
                    <textarea id="description" class="title-input-overlay" placeholder="Enter a Description"></textarea>

                    <label for="due-date">Due date</label>
                    <input id="due-date" class="title-input-overlay" min="${todayStr}" type="date" required>

                    <label><b>Priority</b></label>
                    <div class="priority-buttons">
                        <button type="button" class="priority-btn urgent" id="prio-urgent" onclick="setEditPrio('urgent')">
                            Urgent
                            <img src="/assets/icons/prio_urgent_icon.svg" alt="urgent icon">
                        </button>
                        <button type="button" class="priority-btn medium active" id="prio-medium" onclick="setEditPrio('medium')">
                            Medium
                            <img src="/assets/icons/prio_medium_icon.svg" alt="medium icon">
                        </button>
                        <button type="button" class="priority-btn low" id="prio-low" onclick="setEditPrio('low')">
                            Low
                            <img src="/assets/icons/prio_low_icon.svg" alt="low icon">
                        </button>
                    </div>

                    <label for="assigned">Assigned to</label>
                    <div class="custom-select-container">
                        <div id="assigned-display-edit" class="select-display" onclick="toggleContactDropdownEdit()">
                            Select contacts to assign
                        </div>

                        <div id="assigned-dropdown-edit" class="select-dropdown" style="display: block;">
                        </div>
                    </div>

                    <div id="user-circle-assigned-edit-overlay" class="assigned-circles-edit-overlay"></div>
                    
                    <label for="subtask">Subtasks</label>

                        <div class="subtask-input-wrapper">
                            <input type="text" id="subtask-input-edit" class="subtask-input-field" 
                                placeholder="Add new subtask" 
                                onfocus="showMainSubtaskIcons()"
                                onkeydown="handleSubtaskKey(event)">
                            
                            <div id="main-subtask-icons" class="input-action-icons">
                        
                            </div>
                                </div>

                                <ul id="subtask-list-edit-ul" style="padding: 0; list-style: none;"></ul>
                  </div>  

            <div class="task-detail-edit-footer">
                <button onclick="saveEditedTask('${task.id}')" class="btn btn-primary">
                Ok
                <img src="/assets/icons/check.svg" alt="check">
                </button>
            </div>  
                
    </div>
    `;
}

function showMainSubtaskIcons() {
    let container = document.getElementById('main-subtask-icons');
    container.innerHTML = `
        <div onmousedown="cancelMainSubtaskInput()" class="subtask-icon" style="display:flex; align-items:center; justify-content:center;">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#2A3647" stroke-width="2"><path d="M18 6L6 18M6 6l12 12"/></svg>
        </div>
        <div class="separator-vertical"></div>
        <div onmousedown="addSubtaskEdit()" class="subtask-icon" style="display:flex; align-items:center; justify-content:center;">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#2A3647" stroke-width="2"><path d="M20 6L9 17l-5-5"/></svg>
        </div>
    `;
}

function renderSubtasksEditMode() {
    let list = document.getElementById('subtask-list-edit-ul');
    list.innerHTML = '';

    editSubtasks.forEach((st, i) => {
        if (i === editingSubtaskIndex) {
            list.innerHTML +=`
            <li class="subtask-edit-row-editing">
                <input id="edit-subtask-input-${i}" class="subtask-row-input" type="text" value="${st.title}">
                
                <div class="subtask-icons-container" style="display: flex;"> <img src="/assets/icons/delete.svg" class="subtask-icon" onmousedown="deleteSubtaskEdit(${i})">
                    
                    <div class="separator-vertical"></div>
                    
                    <img src="/assets/icons/check.svg" class="subtask-icon" onmousedown="saveEditedSubtask(${i})">
                </div>
            </li>`;

        } else {
            list.innerHTML +=`
            <li class="subtask-edit-row" ondblclick="editSubtask(${i})">
               <span onclick="editSubtask(${i})" style="cursor:text; flex-grow:1;">• ${st.title}</span>
                
                <div class="subtask-icons-container">
                    <img src="/assets/icons/edit.svg" class="subtask-icon" onclick="editSubtask(${i})">
                    
                    <div class="separator-vertical"></div>
                    
                    <img src="/assets/icons/delete.svg" class="subtask-icon" onclick="deleteSubtaskEdit(${i})">
                </div>
            </li>`;
        }
    });
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
                        <a class="go_back" onclick="closeContactOverlay()">
                        <img src="/assets/icons/arrow-left-line.svg" alt="arrow-left">
                        </a>
                    </div>
                    </div>

                <div class="title_seperator_2">
                        <img src="/assets/icons/Summary_title_seperator.svg" height="59px" width="3px" alt="">
                    </div>

                    <div class="title_summary_discription_2">
                        <p class="title_discription">Better with a team</p>
                    </div>
                </div>
    <div class="flex gap-56 align edit_cirle_name">
        <div class="user-circle-intials user-circle-large" style="background-color: ${color}">
            ${getInitials(contact.name)}
        </div>
        <div class="flex column name_contact">
            <div class="contact-list-name contact-name-large">
                ${contact.name}
            </div>
            <div class="flex gap-13">
                <button id="edit" onclick="showDialogContact('contactEditDeleteModal', '${contactJson}', '${color}', event, 'Edit')" class="contacts-edit-delete-buttons" tabindex="0">
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none"
                        xmlns="http://www.w3.org/2000/svg">
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
                    Edit
                </button>
                <button id="edit" onclick="showDialogContact('contactEditDeleteModal', '${contactJson}', '${color}', event, 'Delete')" class="contacts-edit-delete-buttons" tabindex="0">
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none"
                        xmlns="http://www.w3.org/2000/svg">
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
                    Delete
                </button>
            </div>
        </div>

    </div>
    <div class="flex column gap-13 title_mobile">
        <h1 class="contact-head" id="contactInformation">Contact Information</h1>
        <p class="font-16"><b>Email</b></p>
        <p style="color: #007CEE;"><a href="mailto:${contact.email}">${contact.email}</a></p>
        <p class="font-16"><b>Phone</b></p>
        <p style="color: #007CEE;">${checkContactForPhoneHtml(contact)}</p>
    </div>

        <div class="mobile-actions-btn" onclick="toggleMobileContactMenu()">
         <img src="../assets/icons/more_vert.svg" alt="more">
        </div>

        <div id="mobileContactMenu" class="mobile-contact-menu">
            <button onclick="openEditContact('${contactJson}', '${color}')">
                <img src="../assets/icons/edit.svg" alt=""> Edit
            </button>

            <button onclick="openDeleteContact('${contactJson}', '${color}')">
                <img src="../assets/icons/delete.svg" alt=""> Delete
            </button>
</div>
    `;
}

function renderAddNewContactOverlayHtml() {
    return /*html*/`
        <article class="flex h-100 add_contact_overlay" style="color: var(--white); position: relative;">
            <button class="close-button-position" onclick="contactCancel(event); return false;" aria-label="button" style="cursor: pointer;">
                <svg class="close-btn" width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path
                        d="M12.001 12.0001L17.244 17.2431M6.758 17.2431L12.001 12.0001L6.758 17.2431ZM17.244 6.75708L12 12.0001L17.244 6.75708ZM12 12.0001L6.758 6.75708L12 12.0001Z"
                        stroke="#2A3647" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" />
                </svg>
            </button>

            <div class="flex align contact-dialog-add">
                <div class="flex column gap-13 overlay_title">
                    <img class="add_contact_overlay_img" src="/assets/icons/Join_light.png" alt="Join Logo Small"
                        style="height: 66px; width: 55px;">
                    <h2 class="contact-dialog-h2">Add contact</h2>
                    <h3 class="contact-dialog-h3">Tasks are better with a team!</h3>
                    <div class="contact-dialog-line"></div>
                </div>
            </div>

            <div class="flex align user_idle_add_task">
                <div class="user-circle-intials user-circle-large" style="background-color: #D1D1D1">
                    <svg width="64" height="64" viewBox="0 0 64 64" fill="none"
                        xmlns="http://www.w3.org/2000/svg">
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
                <form class="contact-form" onsubmit="createContact(); return false;">
                    <div class="input-field">
                        <input class="input_login" type="text" id="nameContact"
                            oninput="validateField('nameContact', 'errMsgName', isNameValid, 0, 'Please enter forename + _space_ + surname', true)"
                            tabindex="1" placeholder="Full name">
                        <div class="icon-div">
                            <img src="../assets/icons/person.png" alt="email icon">
                        </div>
                    </div>
                    <div id="errMsgName" class="error-msg" style="display: none;"></div>

                    <div class="input-field">
                        <input class="input_login" type="email" id="emailContact"
                            oninput="validateField('emailContact', 'errMsgEmail', isEmailValid, 1, 'Email format is wrong, please update', true)"
                            tabindex="1" placeholder="Email">
                        <div class="icon-div">
                            <img src="../assets/icons/mail.png" alt="email icon">
                        </div>
                    </div>
                    <div id="errMsgEmail" class="error-msg" style="display: none;"></div>

                    <div class="input-field">
                        <input class="input_login" type="tel" id="phoneContact" tabindex="1"
                            placeholder="Phone number">
                        <div class="icon-div">
                            <img src="../assets/icons/call.png" alt="email icon">
                        </div>
                    </div>
                    <div id="errMsgPhone" class="error-msg" style="display: none;"></div>

                    <div class="two-buttons">
                        <button class="btn_contact_cancel flex align gap-13"
                            onclick="contactCancel(event); return false;" tabindex="1">
                            Cancel
                            <svg width="24" height="24" viewBox="0 0 24 24" fill="none"
                                xmlns="http://www.w3.org/2000/svg">
                                <path
                                    d="M12.001 12.0001L17.244 17.2431M6.758 17.2431L12.001 12.0001L6.758 17.2431ZM17.244 6.75708L12 12.0001L17.244 6.75708ZM12 12.0001L6.758 6.75708L12 12.0001Z"
                                    stroke="#2A3647" stroke-width="2" stroke-linecap="round"
                                    stroke-linejoin="round" />
                            </svg>
                        </button>
                        <button id="contactCreateBtn" class="btn_contact_create btn flex align gap-13" type="submit" tabindex="1" disabled aria-disabled="true">
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

        <div id="popupContactCreated" class="popup btn">
            <p class="btn_std">Contact succesfully created</p>
        </div>
        `
}

function renderEditContactOverlayHtml(contact, color, option) {
    return /*html*/`
        <article class="flex h-100 overlay_edit_delete" style="color: var(--white); position: relative;">
            <button class="close-button-position" onclick="contactCancel(event); return false;" aria-label="button" style="cursor: pointer;">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path
                        d="M12.001 12.0001L17.244 17.2431M6.758 17.2431L12.001 12.0001L6.758 17.2431ZM17.244 6.75708L12 12.0001L17.244 6.75708ZM12 12.0001L6.758 6.75708L12 12.0001Z"
                        stroke="#2A3647" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" />
                </svg>
            </button>

            <div class="flex align contact-dialog-add">
                <div class="flex column gap-13 title_mobile">
                    <img class="logo_img_edit" src="/assets/icons/Join_light.png" alt="Join Logo Small"
                        style="height: 66px; width: 55px;">
                    <h2 class="contact-dialog-h2">${option} contact</h2>
                    <div class="contact-dialog-line"></div>
                </div>
            </div>

            <div class="flex align user_icon_edit">
                <div class="user-circle-intials user-circle-large_edit" style="background-color: ${color}; font-size: 47px;">
                    ${getInitials(contact.name)}
                </div>
            </div>

            <div class="flex column justify pg-r30 mobile_input">
                <form class="contact-form" onsubmit="updateContact('${contact.id}', '${option}'); return false;">
                    <div class="input-field">
                        <input class="input_login" type="text" id="nameContact" value="${contact.name}"
                            oninput="validateField('nameContact', 'errMsgName', isNameValid, 0, 'Please enter forename + _space_ + surname', true)"
                            tabindex="1" placeholder="Full name">
                        <div class="icon-div">
                            <img src="../assets/icons/person.png" alt="email icon">
                        </div>
                    </div>
                    <div id="errMsgName" class="error-msg" style="display: none;"></div>

                    <div class="input-field">
                        <input class="input_login" type="email" id="emailContact" value="${contact.email}"
                            oninput="validateField('emailContact', 'errMsgEmail', isEmailValid, 1, 'Email format is wrong, please update', true)"
                            tabindex="1" placeholder="Email">
                        <div class="icon-div">
                            <img src="../assets/icons/mail.png" alt="email icon">
                        </div>
                    </div>
                    <div id="errMsgEmail" class="error-msg" style="display: none"></div>

                    <div class="input-field">
                        <input class="input_login" type="tel" id="phoneContact" value="${checkContactForPhone(contact)}"
                            oninput="validateField('phoneContact', 'errMsgPhone', isPhoneValid, 1, 'Allowed 20 symbols [0-9+()/-] and [space]', false)"
                            tabindex="1" placeholder="Phone number">
                        <div class="icon-div">
                            <img src="../assets/icons/call.png" alt="email icon">
                        </div>
                    </div>
                    <div id="errMsgPhone" class="error-msg" style="display: none;"></div>

                    <div class="two-buttons">
                        <button class="btn_contact_cancel flex align gap-13"
                            onclick="contactCancel(event); return false;" tabindex="1">
                            Cancel
                            <svg width="24" height="24" viewBox="0 0 24 24" fill="none"
                                xmlns="http://www.w3.org/2000/svg">
                                <path
                                    d="M12.001 12.0001L17.244 17.2431M6.758 17.2431L12.001 12.0001L6.758 17.2431ZM17.244 6.75708L12 12.0001L17.244 6.75708ZM12 12.0001L6.758 6.75708L12 12.0001Z"
                                    stroke="#2A3647" stroke-width="2" stroke-linecap="round"
                                    stroke-linejoin="round" />
                            </svg>
                        </button>
                        <button id="contactCreateBtn" class="btn_contact_create btn flex align gap-13" type="submit" tabindex="1">
                            ${option === 'Edit' ? 'Save' : 'Delete'}
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

        <div id="popupContactUpdated" class="popup btn">
            <p class="btn_std">Contact updated succesfully</p>
        </div>
        `
}


function contactRowHTML(contact, index) {
    return `
    <div class="contact-row">
      <div class="left-info">
        ${renderContactCircle(contact, index)}
        <span class="contact-name">${contact.name}</span>
      </div>
      <input type="checkbox" value="${contact.id}">
    </div>
  `;
}

// to be reviewed later !!!
function renderContactCircle(contact, index) {
    const color = contactCircleColor[contact.id % contactCircleColor.length];
    const initials = getInitials(contact.name);
    return `<div class="user-circle-intials" style="background-color: ${color};">${initials}</div>`;
}

function generateSubtaskRowHtml(taskId, index, title, icon, isChecked) {
    return `
        <div class="subtask-row" onclick="toggleSubtask('${taskId}', ${index})">
            <div class="subtask-icon">
                ${icon}
            </div>
            <span class="subtask-text ${isChecked ? 'text-done' : ''}">
                ${title}
            </span>
        </div>
    `;
}

function getUncheckIcon() {
    return `<svg width="24" height="24" viewBox="0 0 24 24" fill="none">
            <rect x="4" y="4" width="16" height="16" rx="3" stroke="#2A3647" stroke-width="2"/>
            </svg>`;
}

function getCheckIcon() {
    return `<svg width="24" height="24" viewBox="0 0 24 24" fill="none">
            <rect x="4" y="4" width="16" height="16" rx="3" stroke="#2A3647" stroke-width="2"/>
            <path d="M8 12L11 15L16 9" stroke="#2A3647" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
            </svg>`;
}

// #region board_search

function displaySearchInBoardHtml() {
    return /* html */`
        <div class="searchbar">
            <input id="searchTasks" oninput="searchTasks()" class="searchbar__input" type="text"
                placeholder="Find Task" autocomplete="off">
            <div class="searchbar__divider"></div>
            <button class="btn_glass" onclick="searchAndClearSearchField()">
                <img class="searchbar__icon" src="/assets/icons/search.svg" alt="search icon">
            </button>
        </div>`
}

// #endregion
