function renderTasksHTML(task) {
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
    return `
        <div class="contact-list-card">
            <div class="user-circle-intials" style="background-color: ${color}">
            ${getInitials(contact.name)}
            </div>
        <div>
            <div style="font-size: 20px; margin-bottom: 5px;">
                ${contact.name}
            </div>
            <div style="color: #007CEE;">
                ${contact.email}
            </div>
        </div>
    </div>
    `;
}