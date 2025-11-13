function renderTasksCardSmallHtml(task) {
    return `
    <article class="drag-item" draggable="true" ondragstart="dragstartHandler(event, '${task.id}')" ondragend="dragendHandler(event)">
        <div class="card-inner">
            <p class="${categoryColor(task)}">${task.category}</p>
            <h3>${task.title}</h3>
            <p class="gray-text">${task.description}</p>
            <div class="flex">
                <progress value="1" max="2" style="width:96px"></progress>
                <span>1/2 Subtasks</span>
            </div>
            <div class="flex spacebetween">
                <div class="spacing">
                    <div class="color-one">
                        AM
                    </div>
                    <div class="color-two">
                        EM
                    </div>
                    <div class="color-three">
                        MB
                    </div>
                </div>
                <img src="/assets/icons/prio_medium_orange_icon.svg" alt="urgency icon">
            </div>
        </div>
    </article>`
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
            <div class="user-circle-intials" style="background-color: ${color}">
            ${getInitials(contact.name)}
            </div>
            <div>
                <div class="contact-list-name">
                ${contact.name}
                </div>
                <div style="color: #007CEE;">
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

function renderContactLargeHtml(contact,color) {
    return `
    <div class="flex gap-56 align">
        <div class="user-circle-intials user-circle-large" style="background-color: ${color}">
            ${getInitials(contact.name)}
        </div>
        <div class="flex column">
            <div class="contact-list-name contact-name-large">
                ${contact.name}
            </div>
            <div class="flex gap-13">
                <button id="edit" onclick="" class="contacts-edit-delete-buttons" tabindex="0">
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
                <button id="edit" onclick="" class="contacts-edit-delete-buttons" tabindex="0">
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
    <div class="flex column gap-13">
        <h1 class="contact-head" id="contactInformation">Contact Information</h1>
        <p class="font-16"><b>Email</b></p>
        <p style="color: #007CEE;"><a href="mailto:${contact.email}">${contact.email}</a></p>
        <p class="font-16"><b>Phone</b></p>
        <p style="color: #007CEE;"><a>phone number to be edit</a></p>
    </div>
    `;

}
   
function getAddTaskOverlayTemplate(board) {
    return `
            <section class="add-task-section overlay-add-task">
        <div class= overlay-header>
            <h1 class="overlay-headline">Add Task</h1>
        </div>
        <img onclick="closeAddTaskOverlay()" class="close-add-task-overlay" src="/assets/icons/close.svg" alt="close">
                <form id="task-form" class="task-form">
                    <div class="form-left form-left-overlay">
                        <div class="overlay-add-task-div">
                            <label for="title" class="form-headline-text">Title*</label>
                               <div class="title-input-container-overlay">
                                    <input id="title" class="title-input-overlay" type="text" placeholder="Enter a title">
                                 </div>
                        </div>

                        <div class="description-overlay">
                            <label for="description">Description</label>
                            <textarea style="width: 440px" id="description" class="description-input-overlay" placeholder="Enter a Description"></textarea>
                        </div>

                        <div class="date-overlay">
                            <label for="due-date">Due date*</label>
                            <input id="due-date" class="due-date-overlay" type="date" required>
                        </div>
                    </div>

                    <div class="divider divider-overlay"></div>

                    <div class="form-right form-right-overlay">
                            <label class="at-overlay-text">Priority</label>
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

                        
                        <div class="custom-select-container">
                        <label for="assigned">Assigned to</label>
                            <div id="assigned-display" class="select-display" onclick="toggleContactDropdown()">
                                Select contacts to assign
                            </div>

                            <div id="assigned-dropdown" class="select-dropdown" style="display: none;">
                            </div>
                        </div>

                        
                        <select id="category" required>
                        <label for="category">Category*</label>
                            <option value="" disabled selected>Select task category</option>
                            <option value="technical">Technical Task</option>
                            <option value="user-story">User Story</option>
                        </select>
                        <div class="subtask-overlay">
                            <label for="subtask">Subtasks</label>
                            <input type="text" id="subtask" placeholder="Add new subtask">
                        </div>

                    </div>
                </form>

                <div class="form-footer">
                    <p class="form-hint form-hint-overlay">
                        <span class="required-marker">*</span>This field is required
                    </p>

                    <div class="form-actions form-actions-overlay">
                        <button onclick="clearForm(), closeAddTaskOverlay()" id="clear-btn" type="button" class="clear">Clear ✖</button>
                        <button onclick="handleCreateTask('${board}')" id="create-btn" type="button" class="create">Create Task ✔</button>
                    </div>
                </div>
            </section>
    `;
}


function getTaskDetailOverlayTemplate() {
    return `
    <div class="task-detail-overlay">
    
        <div class="task-detail-header">

            <div class="overlay-task-category">
            
            </div>

            <img onclick="closeTaskDetailOverlay()" class="" src="/assets/icons/close.svg" alt="close">
        
        
        </div>

    
    
    </div>
    `
}