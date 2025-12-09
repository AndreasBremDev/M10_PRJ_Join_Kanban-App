/**
 * All Project Rendering functions, for ADD_TASK, BOARD and CONTACTS
 */

/**
 * Renders assigned contact circles in edit overlay
 */
function renderAssignedEditCircles() {
    let container = document.getElementById('user-circle-assigned-edit-overlay');
    if (!container) return;
    container.innerHTML = '';

    if (editAssignedIds.length > 5) {
        renderLimitedCircles(container);
    } else {
        renderAllCircles(container);
    }
}

/**
 * Renders all assigned contact circles in the container
 * @param {HTMLElement} container - The container element to render circles in
 */
function renderAllCircles(container) {
    editAssignedIds.forEach(userId => {
        renderSingleCircle(container, userId);
    });
}

/**
 * Renders up to 5 assigned contact circles and a plus circle for remaining contacts
 * @param {HTMLElement} container - The container element to render circles in
 */
function renderLimitedCircles(container) {
    for (let i = 0; i < 5; i++) {
        renderSingleCircle(container, editAssignedIds[i]);
    }
    let remainingCount = editAssignedIds.length - 5;
    renderPlusCircle(container, remainingCount);
}

/**
 * Renders a single contact circle in the container
 * @param {HTMLElement} container - The container element to render the circle in
 * @param {string} userId - The ID of the user to render
 */
function renderSingleCircle(container, userId) {
    let contact = contacts.find(c => c.id == userId);
    if (contact) {
        container.innerHTML += renderContactCircle(contact);
    }
}

/**
 * Renders a plus circle showing the count of additional assigned contacts
 * @param {HTMLElement} container - The container element to render the circle in
 * @param {number} count - The number of additional contacts not displayed
 */
function renderPlusCircle(container, count) {
    container.innerHTML += `
        <div class="user-circle-intials" style="background-color: #2A3647; color: white;">
            +${count}
        </div>`;
}

/**
 * Updates the priority button UI to reflect the selected priority
 * @param {string} prio - The priority level ('urgent', 'medium', or 'low')
 */
function updatePrioUI(prio) {
    ['urgent', 'medium', 'low'].forEach(p => {
        let btn = document.getElementById('prio-' + p);
        if (btn) {
            btn.classList.remove('active');
        }
    });
    let activeBtn = document.getElementById('prio-' + prio);
    if (activeBtn) {
        activeBtn.classList.add('active');
    }
}

/**
 * Updates the visual state of a contact row based on selection status
 * @param {string} contactId - The ID of the contact to update
 */
function updateContactRowVisuals(contactId) {
    let row = document.getElementById(`contact-row-${contactId}`);
    if (!row) return;
    let isSelected = editAssignedIds.includes(contactId);
    if (isSelected) {
        row.classList.add('selected');
        row.querySelector('.contact-checkbox-icon').innerHTML = getCheckboxCheckedSvg();
    } else {
        row.classList.remove('selected');
        row.querySelector('.contact-checkbox-icon').innerHTML = getCheckboxEmptySvg();
    }
}

/**
 * Shows success animation and redirects to board page
 */
function showSuccessImageAnimation() {
    let toastImg = document.getElementById('success-toast-img');
    if (!toastImg) {
        window.location.href = 'board.html';
        return;
    }
    toastImg.classList.remove('d-none');
    setTimeout(() => {
        toastImg.classList.add('animate-toast-slide-in');
    }, 10);
    setTimeout(() => {
        window.location.href = 'board.html';
    }, 2000);
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

/**
 * Creates the initials circles, within a for loop, 
 * and writes html-code into the string variable html
 * 
 * @param {Array} arrAssigned - Array of assigned contact IDs
 * @param {number} i - Current index in the loop
 * @param {string} html - Current HTML string being built
 * @returns {string} Updated HTML string with new circle
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
 * Renders the contacts list by fetching, filtering, sorting and grouping contacts
 */
async function renderContacts() {
    let contactListRef = document.getElementById('contactList');
    contactsFetch = await fetchData(`/${activeUserId}/contacts`);
    let contactsArray = convertContactsFetchObjectToArray();
    if (contactsArray.length == 0) {
        contactListRef.innerHTML = emptyContactsHtml();
    } else {
        let contacts = contactsArray.filter(i => i && i.name);
        let sortedContacts = contacts.sort((a, b) => { return a.name.localeCompare(b.name) });
        let groupedContacts = groupContactsByLetter(sortedContacts);
        contactListRef.innerHTML = renderGroupedContacts(groupedContacts);
    };
}

/**
 * Renders grouped contacts organized by first letter
 * @param {Object} groupedContacts - Object containing contacts grouped by first letter
 * @returns {string} HTML string for the grouped contacts
 */
function renderGroupedContacts(groupedContacts) {
    let html = '';
    const sortedKeys = Object.keys(groupedContacts).sort();
    for (const key of sortedKeys) {
        html += renderContactsCardPartOne(key);
        groupedContacts[key].forEach(contact => {
            const color = contactCircleColor[contact.id % contactCircleColor.length];
            html += renderContactsCardPartTwo(contact, color);
        });
    }
    return html;
}

/**
 * Renders the large contact detail view
 * @param {Object} contact - The contact object to display
 * @param {string} color - The background color for the contact circle
 */
function renderContactLarge(contact, color) {
    let contactLargeRef = document.getElementById('contactDisplayLarge');
    contactLargeRef.innerHTML = '';
    contactLargeRef.innerHTML = renderContactLargeHtml(contact, color);
}

/**
 * Groups contacts by their first letter for alphabetical organization
 * @param {Array} contacts - Array of contact objects
 * @returns {Object} Object with contacts grouped by first letter
 */
function groupContactsByLetter(contacts) {
    const grouped = {};
    contacts.forEach((c) => {
        const letter = (c.name?.[0] || "?").toUpperCase();
        if (!grouped[letter]) grouped[letter] = [];
        grouped[letter].push(c);
    });
    return grouped;
}

/**
 * Returns HTML for contact phone number with tel: link
 * @param {Object} contact - The contact object
 * @returns {string} HTML string with phone link or placeholder
 */
function checkContactForPhoneHtml(contact) {
    if (contact?.phone) {
        return `<a href="tel:${contact.phone}">${contact.phone}</a>`
    } else {
        return `<a href="tel:">phone number to be edit</a>`
    }
}

/**
 * Returns the phone number of a contact or empty string
 * @param {Object} contact - The contact object
 * @returns {string} Phone number or empty string
 */
function checkContactForPhone(contact) {
    if (contact?.phone) {
        return contact.phone;
    } else {
        return "";
    }
}