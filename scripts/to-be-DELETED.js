function getAddTaskTemplate() {
    return /*html*/`
        <section class="add-task-section" aria-labelledby="add-task-heading">
            <h1 id="add-task-heading">Add Task</h1>

            <form id="task-form" class="task-form" novalidate>
                <div class="form-left">
                    <div class="add-task-label-box-sizing padding-bottom-32">
                        <label for="title">Title<span class="required-marker" aria-label="required">*</span></label>
                        <input id="title" maxlength="50" type="text" placeholder="Enter a title"
                            onblur="validateField('title')" oninput="clearError('title')" aria-required="true"
                            aria-describedby="title-error" aria-invalid="false">
                        <div id="title-error" class="error-text" role="alert" aria-live="polite">This field is
                            required</div>
                    </div>

                    <div class="add-task-label-box-sizing padding-bottom-32">
                        <label for="description">Description</label>
                        <textarea class="description-box" id="description"
                            class="description-input-overlay title-input" placeholder="Enter a Description"
                            tabindex="0" aria-describedby="description-hint"></textarea>
                        <div id="description-hint" class="sr-only">Optional field for task description</div>
                    </div>

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

                <div class="form-right">
                    <div class="padding-bottom-24">
                        <fieldset style="border: none; padding: 0; margin: 0;">
                            <legend class="sr-only">Task Priority</legend>
                            <div style="padding-bottom: 8px;"><label>Priority</label></div>
                            <div class="priority-buttons" role="group" aria-label="Select task priority">
                                <button type="button" id="prio-urgent" class="priority-btn urgent"
                                    onclick="setEditPrio('urgent')" role="radio" aria-checked="false"
                                    aria-label="High priority">
                                    Urgent <img src="../assets/icons/prio_urgent_icon.svg" alt="" aria-hidden="true">
                                </button>
                                <button type="button" id="prio-medium" class="priority-btn medium active"
                                    onclick="setEditPrio('medium')" role="radio" aria-checked="true"
                                    aria-label="Medium priority">
                                    Medium <img src="../assets/icons/prio_medium_icon.svg" alt="" aria-hidden="true">
                                </button>
                                <button type="button" id="prio-low" class="priority-btn low"
                                    onclick="setEditPrio('low')" role="radio" aria-checked="false"
                                    aria-label="Low priority">
                                    Low <img src="../assets/icons/prio_low_icon.svg" alt="" aria-hidden="true">
                                </button>
                            </div>
                        </fieldset>
                    </div>
                    <div class="padding-bottom-24 add-task-label-box-sizing">
                        <label for="assigned">Assigned to</label>
                        <div class="custom-select-container">
                            <div id="assigned-display-edit" class="select-display" onclick="toggleContactDropdownEdit()"
                                tabindex="0" role="combobox" aria-expanded="false" aria-haspopup="listbox"
                                aria-controls="assigned-dropdown-edit" aria-label="Select contacts to assign"
                                onkeydown="handleAssignedDropdownEditKeydown(event)">
                                <p>Select contacts to assign</p> <img id="arrow-icon-edit"
                                    src="../assets/icons/arrow_drop_down.svg" alt="arrow" class="dropdown-icon"
                                    aria-hidden="true">
                            </div>
                            <div id="assigned-dropdown-edit" class="select-dropdown" role="listbox"
                                aria-labelledby="assigned" style="display: none;"></div>
                        </div>
                        <div id="user-circle-assigned-edit-overlay" class="assigned-circles-edit-overlay" role="group"
                            aria-label="Currently assigned contacts" aria-live="polite"></div>
                    </div>

                    <div class="padding-bottom-24 add-task-label-box-sizing">
                        <label for="category">Category<span class="required-marker"
                                aria-label="required">*</span></label>

                        <div class="custom-select-container">

                            <div id="category-display" class="select-display" onclick="toggleCategoryDropdown()"
                                tabindex="0" role="combobox" required aria-required="true"
                                aria-describedby="category-error" aria-invalid="false" aria-haspopup="listbox"
                                onkeydown="handleCategoryDropdownKeydown(event)">

                                <span id="category-text">Select task category</span>

                                <img id="category-arrow"
                                    src="../assets/icons/arrow_drop_down.svg" alt="Arrow" class="dropdown-icon">
                            </div>
                            <div id="category-options" class="select-dropdown" style="display: none;">
                                <div class="contact-item" onclick="selectCategory('Technical Task')">Technical Task
                                </div>
                                <div class="contact-item" onclick="selectCategory('User Story')">User Story</div>
                            </div>
                            <div id="category-error" class="error-text" style="padding-top: 8px;" role="alert"
                                aria-live="polite">This field is
                                required</div>
                            <input type="hidden" id="category" value="">

                        </div>
                    </div>


                    <div class="padding-bottom-24 add-task-label-box-sizing">
                        <label for="subtask">Subtasks</label>
                        <div class="subtask-input-wrapper">
                            <input type="text" id="subtask-input-edit" class="subtask-input-field"
                                placeholder="Add new subtask" onclick="showMainSubtaskIcons()"
                                onkeydown="handleSubtaskKey(event)" onblur="cleanInput('subtask-input-edit')"
                                tabindex="0" aria-describedby="subtask-hint">
                            <div id="main-subtask-icons" class="input-action-icons"></div>
                        </div>
                        <div id="subtask-hint" class="sr-only">Enter subtask text and press Enter to add, or use the
                            buttons
                            to save or cancel</div>

                        <ul id="subtask-list-edit-ul" role="list"
                            aria-label="Subtask list"></ul>
                    </div>
                </div>

            </form>
        </section>

        <div class="form-footer">

            <div>
                <p class="form-hint">
                    <span class="required-marker">*</span>This field is required
                </p>
            </div>


            <div class="form-actions" role="group" aria-label="Form actions">
                <button onclick="clearForm()" id="clear-btn" type="button" class="clear"
                    aria-label="Clear all form fields">Clear ✖</button>
                <button type="button" onclick="handleCreateTask('toDo')" id="create-btn" type="button" class="create"
                    aria-label="Create new task">Create
                    Task
                    ✔</button>
            </div>
        </div>
    `
}

function getAddTaskOverlayTemplate(board) {
    const todayStr = new Date().toISOString().split('T')[0];

    return /* html */`
        <section class="overlay-add-task" 
            onclick="event.stopPropagation()" 
            role="dialog" 
            aria-labelledby="overlay-title" 
            aria-modal="true">

        <div class="overlay-scroll">
            <div class="overlay-header">

                <div><h1 id="overlay-title" class="overlay-headline">Add Task</h1></div>
                <div><button onclick="closeAddTaskOverlay()" class="close-add-task-overlay" aria-label="Close add task dialog">
                    <img src="../assets/icons/close.svg" alt="">
                    </button>
                </div>    
            </div>

            <div id="task-form" class="task-form-overlay">
                <div class="form-left-overlay">
                    <label for="title">Title<span class="required-marker" aria-label="required">*</span></label>
                    <input id="title" type="text" placeholder="Enter a title" onblur="validateField('title')"
                        oninput="clearError('title')" aria-required="true" aria-describedby="title-error" aria-invalid="false">
                    <div id="title-error" class="error-text" role="alert" aria-live="polite">This field is required</div>

                    <label for="description">Description</label>
                    <textarea class="description-box" id="description"
                        class="description-input-overlay title-input" placeholder="Enter a Description"
                        tabindex="0" aria-describedby="description-hint"></textarea>
                    <div id="description-error" class="error-text" role="alert" aria-live="polite"></div>
                    <div id="description-hint" class="sr-only">Optional field for task description</div>

                    <div class="add-task-label-box-sizing">
                        <label for="due-date">Due date<span class="required-marker"
                                aria-label="required">*</span></label>
                        <input min="${todayStr}" id="due-date" type="date" required onblur="validateField('due-date')"
                            oninput="clearError('due-date')" tabindex="0" aria-required="true"
                            aria-describedby="date-error" aria-invalid="false">
                        <div id="due-date-error" class="error-text" role="alert" aria-live="polite">This field
                            is required</div>
                    </div>
                </div>

                <div class="divider-overlay" role="presentation" aria-hidden="true"></div>

                <div class="form-right-overlay">
                    <fieldset style="border: none; padding: 0; margin: 0;">
                        <legend class="sr-only">Task Priority</legend>
                        <label>Priority</label>
                        <div class="priority-buttons" role="group" aria-label="Select task priority">
                            <button type="button" id="prio-urgent" class="priority-btn urgent"
                                onclick="setEditPrio('urgent')" role="radio" aria-checked="false"
                                aria-label="High priority">
                                Urgent <img src="../assets/icons/prio_urgent_icon.svg" alt="" aria-hidden="true">
                            </button>
                            <button type="button" id="prio-medium" class="priority-btn medium active"
                                onclick="setEditPrio('medium')" role="radio" aria-checked="true"
                                aria-label="Medium priority">
                                Medium <img src="../assets/icons/prio_medium_icon.svg" alt="" aria-hidden="true">
                            </button>
                            <button type="button" id="prio-low" class="priority-btn low" onclick="setEditPrio('low')"
                                role="radio" aria-checked="false" aria-label="Low priority">
                                Low <img src="../assets/icons/prio_low_icon.svg" alt="" aria-hidden="true">
                            </button>
                        </div>
                    </fieldset>

                    <label id="assigned-label" for="assigned">Assigned to</label>
                    <div class="custom-select-container">
                        <div id="assigned-display-edit" class="select-display" onclick="toggleContactDropdown('assigned-dropdown-edit', 'assigned-display-edit', 'arrow-icon-edit')"
                            role="button" tabindex="0" aria-expanded="false" aria-haspopup="listbox"
                            aria-labelledby="assigned-label" aria-controls="assigned-dropdown-edit">
                            Select contacts to assign 
                            <img id="arrow-icon-edit" src="../assets/icons/arrow_drop_down.svg" alt="arrow" class="dropdown-icon" aria-hidden="true">
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
                            <img id="category-arrow" src="../assets/icons/arrow_drop_down.svg" alt="Arrow" class="dropdown-icon">
                        </div>
                        <div id="category-options" class="select-dropdown" style="display: none;">
                            <div class="contact-item" onclick="selectCategory('Technical Task')">Technical Task</div>
                            <div class="contact-item" onclick="selectCategory('User Story')">User Story</div>
                        </div>
                        <input type="hidden" id="category" value="">
                    </div>
                    <div id="category-error" class="error-text" role="alert" aria-live="polite">This field is required</div>

                    <label for="subtask-input-overlay">Subtasks</label>
                    <div class="subtask-input-wrapper">
                        <input type="text" id="subtask-input-overlay" class="subtask-input-field"
                            placeholder="Add new subtask" onclick="showMainSubtaskIcons()"
                            onkeydown="handleSubtaskKey(event)" tabindex="0" aria-describedby="subtask-hint">
                        <div id="main-subtask-icons" class="input-action-icons"></div>
                    </div>
                    <div id="subtask-hint" class="sr-only">Enter subtask text and press Enter to add, or use the buttons to save or cancel</div>
                    <div class="test">
                        <ul id="subtask-list-overlay" class="scrollable-list" style="padding: 0; list-style: none;" role="list" aria-label="Subtask list"></ul>
                    </div>            
                
                </div>

            </div>

            <div class="form-footer-overlay">
                        <p class="form-hint form-hint-overlay">
                            <span class="required-marker">*</span>This field is required
                        </p>
                        <div class="form-actions-overlay" role="group" aria-label="Form actions">
                            <button onclick="clearForm(), closeAddTaskOverlay()" id="clear-btn" type="button" class="clear btn-clear-overlay">
                                Cancel ✖
                            </button>
                            <button onclick="handleCreateTask('${board}')" id="create-btn" type="button" class="create btn-create-overlay">
                                Create Task ✔
                            </button>
                        </div>
                    </div>

        </section>
    `;
}

function editTaskDetailOverlayTemplate(task) {
    const todayStr = new Date().toISOString().split('T')[0];
    return /* html */`
    <section class="task-detail-overlay"
            onclick="event.stopPropagation()"
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
                <img src="../assets/icons/close.svg" alt="" aria-hidden="true">
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
                    class="title-input" 
                    placeholder="Enter a title"
                    onblur="validateField('edit-title')"
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
                    class="title-input description-textarea" 
                    placeholder="Enter a Description"
                    aria-describedby="description-hint"
                    rows="4"
                    onblur="validateField('edit-description')"
                    oninput="clearError('edit-description')"
                ></textarea>
                <div id="edit-description-error" class="error-text" aria-live="polite"></div>
                <div id="description-hint" class="sr-only">Optional detailed description of the task</div>
            </div>

            <div class="edit-form-section">
                <label for="edit-due-date" class="form-headline-text">
                    Due date<span class="required-marker" aria-hidden="true">*</span>
                </label>
                <input 
                    id="edit-due-date" 
                    class="title-input" 
                    min="${todayStr}" 
                    type="date" 
                    aria-required="true"
                    aria-describedby="edit-due-date-error date-hint"
                    onblur="validateField('edit-due-date')"
                    oninput="clearError('edit-due-date')">
                <div id="date-hint" class="sr-only">Select the deadline for this task</div>
                <div id="edit-due-date-error" class="error-message" aria-live="polite"></div>
            </div>

            <fieldset class="priority-fieldset edit-form-section" style="border: none; padding: 0; margin: 0;">
                <legend class="form-headline-text" style="padding: 0; margin-bottom: 0.5rem;">Priority</legend>
                <div class="priority-buttons">
                    <button 
                        type="button" 
                        class="priority-btn urgent ${task.priority === 'urgent' ? 'active' : ''}" 
                        id="prio-urgent" 
                        role="radio" 
                        aria-checked="false"
                        onclick="setEditPrio('urgent')"
                        onkeydown="setEditPrio('urgent')"
                        aria-describedby="urgent-hint">
                        Urgent
                        <img src="../assets/icons/prio_urgent_icon.svg" alt="" aria-hidden="true">
                    </button>
                    <button 
                        type="button" 
                        class="priority-btn medium ${task.priority === 'medium' ? 'active' : ''}" 
                        id="prio-medium" 
                        role="radio" 
                        aria-checked="true"
                        onclick="setEditPrio('medium')"
                        onkeydown="setEditPrio('medium')"
                        aria-describedby="medium-hint">
                        Medium
                        <img src="../assets/icons/prio_medium_icon.svg" alt="" aria-hidden="true">
                    </button>
                    <button 
                        type="button" 
                        class="priority-btn low ${task.priority === 'low' ? 'active' : ''}" 
                        id="prio-low" 
                        role="radio" 
                        aria-checked="false"
                        onclick="setEditPrio('low')"
                        onkeydown="setEditPrio('low')"
                        aria-describedby="low-hint">
                        Low
                        <img src="../assets/icons/prio_low_icon.svg" alt="" aria-hidden="true">
                    </button>
                </div>
                <div id="urgent-hint" class="sr-only">High priority task that requires immediate attention</div>
                <div id="medium-hint" class="sr-only">Standard priority task</div>
                <div id="low-hint" class="sr-only">Lower priority task that can be addressed when time permits</div>
            </fieldset>

            <div class="edit-form-section">
                <label id="assigned-label" class="form-headline-text">Assigned to</label>
                <div class="custom-select-container">
                    <div id="assigned-display-edit" 
                        class="select-display" 
                        role="combobox"
                        tabindex="0"
                        aria-expanded="false"
                        aria-haspopup="listbox"
                        aria-labelledby="assigned-label"
                        aria-controls="assigned-dropdown-edit"
                        aria-describedby="assigned-hint"
                        onclick="toggleContactDropdownEdit()"
                        onkeydown="handleAssignedDropdownEditKeydown(event)">
                        Select contacts to assign
                    </div>

                    <div id="assigned-dropdown-edit" 
                        class="select-dropdown" 
                        role="listbox"
                        aria-labelledby="assigned-label"
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
                <label for="category">Category<span class="required-marker"
                        aria-label="required">*</span></label>

                <div class="custom-select-container">

                    <div id="category-display" class="select-display" onclick="toggleCategoryDropdown()"
                        tabindex="0" role="combobox"
                        required aria-required="true" aria-describedby="category-error" aria-invalid="false" aria-haspopup="listbox"
                        onkeydown="handleCategoryDropdownKeydown(event)">

                        <span id="category-text">Select task category</span>

                        <img id="category-arrow" src="../assets/icons/arrow_drop_down.svg" alt="Arrow"
                            class="dropdown-icon">
                    </div>
                    <div id="category-options" class="select-dropdown" style="display: none;">
                        <div class="contact-item" onclick="selectCategory('Technical Task')">Technical Task
                        </div>
                        <div class="contact-item" onclick="selectCategory('User Story')">User Story</div>
                    </div>
                    <div id="category-error" class="error-text" style="padding-top: 8px;" role="alert"
                        aria-live="polite">This field is
                        required</div>
                    <input type="hidden" id="category" value="">

                </div>
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
                    <img src="../assets/icons/check.svg" alt="" aria-hidden="true">
                </button>
            <div id="save-hint" class="sr-only">Save all changes and close the edit dialog</div>
        </div>  
            
    </section>
    `;
}