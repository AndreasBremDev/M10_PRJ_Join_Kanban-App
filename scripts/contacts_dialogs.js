/**
 * Contact Dialog Management Module
 * Handles all dialog-related operations for contact management
 * Includes dialog creation, editing, deletion, and mobile menu interactions
 */

/**
 * Shows the large contact view with slide-in animation and focus management
 * @param {Event} ev - The triggering event
 * @param {string} contactJson - JSON string of the contact data
 * @param {string} color - The contact's background color
 */
function contactsLargeSlideIn(ev, contactJson, color) {
    let contactLargeRef = document.getElementById('contactDisplayLarge');
    contactLargeRef.style.display = 'none';
    contactLargeRef.innerHTML = '';
    let contact = JSON.parse(contactJson);
    lastFocusedContact = ev.currentTarget;
    let contactCardsActive = document.querySelectorAll('.contact-list-card-active');
    for (let i = 0; i < contactCardsActive.length; i++) {
        contactCardsActive[i].classList.remove('contact-list-card-active');
        contactCardsActive[i].classList.add('contact-list-card')
    };
    ev.currentTarget.classList.remove('contact-list-card');
    ev.currentTarget.classList.add('contact-list-card-active');
    contactLargeRef.innerHTML = renderContactLargeHtml(contact, color);
    contactLargeSetFocusAndKeyEscapeHandling(contactLargeRef);
}

/**
 * Sets focus and keyboard escape handling for the large contact display
 * Manages timing, visibility, ARIA attributes, and focus management for contact overlay
 * @param {HTMLElement} contactLargeRef - The contact display large element
 */
function contactLargeSetFocusAndKeyEscapeHandling(contactLargeRef) {
    setTimeout(() => {
        contactLargeRef.style.display = 'block';
        contactLargeRef.setAttribute('aria-hidden', 'false');
        const editDeleteDiv = document.querySelector('.edit-delete-contact-btn-section');
        const editButtonDesktop = document.getElementById('edit-contact-btn');
        const editButtonMobile = contactLargeRef.querySelector('#mobileActionsBtn');
        const isHidden = editDeleteDiv && window.getComputedStyle(editDeleteDiv).display === 'none';
        isHidden ? editButtonMobile.focus() : editButtonDesktop.focus();
        const handleEscapeKey = (event) => {
            if (event.key === 'Escape') {
                event.preventDefault();
                closeContactOverlay();
                document.removeEventListener('keydown', handleEscapeKey);
            }
        };
        document.addEventListener('keydown', handleEscapeKey);
    }, 10);
}

/**
 * Shows the dialog for creating a new contact
 * @param {string} id - The ID of the modal dialog
 * @param {Event} ev - The triggering event
 */
async function showDialogCreateContact(dialogId, ev) {
    ev.stopPropagation();
    const modal = document.getElementById(dialogId);
    modal.onclick = (e) => contactCancel(e);
    bool = [0, 0, 1];
    modal.innerHTML = renderAddNewContactOverlayHtml();
    modal.showModal();
    setTimeout(() => {
        modal.classList.add("open");
    }, 10);
    updateContactButtonState(dialogId);
    await loadAndRenderContacts('contactList', 'contacts');
}

/**
 * Shows the dialog for editing or deleting a contact
 * @param {string} id - The ID of the modal dialog
 * @param {string} contactJson - JSON string of the contact data
 * @param {string} color - The contact's background color
 * @param {Event} ev - The triggering event
 * @param {string} option - The action ('Edit' or 'Delete')
 */
async function showDialogContact(id, contactJson, color, ev, option) {
    ev.stopPropagation();
    let contactEditDeleteModal = document.getElementById(id);
    let contact = JSON.parse(contactJson);
    option === 'Delete' || option === 'Edit' ? bool = [1, 1, 1] : bool = [0, 0, 0];
    option === 'Delete' ? contactEditDeleteModal.innerHTML = renderDeleteContactOverlayHtml(contact, color, option) : contactEditDeleteModal.innerHTML = renderEditContactOverlayHtml(contact, color, option);
    contactEditDeleteModal.onclick = (e) => contactCancel(e);
    contactEditDeleteModal.showModal();
    setTimeout(() => {
        contactEditDeleteModal.classList.add("open");
        updateContactButtonState(id);
    }, 10);
    await renderContacts();
}

/**
 * Cancels and closes the contact dialog
 * @param {Event} ev - The triggering event
 */
function contactCancel(ev) {
    ev.preventDefault();
    ev.stopPropagation();
    const modal = ev.target.closest("dialog");
    if (!modal) return;
    modal.classList.remove("open");
    modal.close();
}

/**
 * Closes the contact overlay and returns focus to the last focused contact
 */
function closeContactOverlay() {
    const overlay = document.getElementById('contactDisplayLarge');
    overlay.classList.remove('open');
    overlay.style.display = 'none';
    overlay.setAttribute('aria-hidden', 'true');
    document.body.classList.remove('no-scroll');
    if (lastFocusedContact) {
        lastFocusedContact.focus();
        lastFocusedContact = null;
    }
}

/**
 * Opens the edit contact dialog from mobile menu
 * @param {string} contactJson - JSON string of the contact data
 * @param {string} color - The contact's background color
 */
function openEditContact(contactJson, color) {
    toggleMobileContactMenu();
    showDialogContact('contactEditDeleteModal', contactJson, color, event, 'Edit');
}

/**
 * Opens the delete contact dialog from mobile menu
 * @param {string} contactJson - JSON string of the contact data
 * @param {string} color - The contact's background color
 */
function openDeleteContact(contactJson, color) {
    toggleMobileContactMenu();
    showDialogContact('contactEditDeleteModal', contactJson, color, event, 'Delete');
}

/**
 * Updated toggleMobileContactMenu function to manage ARIA states
 */
function toggleMobileContactMenu() {
    const menu = document.getElementById('mobileContactMenu');
    const button = document.querySelector('.mobile-actions-btn');
    const isOpen = menu.classList.contains('show');
    if (isOpen) {
        menu.classList.remove('show');
        menu.setAttribute('aria-hidden', 'true');
        button.setAttribute('aria-expanded', 'false');
        document.body.onclick = null;
    } else {
        menu.classList.add('show');
        menu.setAttribute('aria-hidden', 'false');
        button.setAttribute('aria-expanded', 'true');
        const firstMenuItem = menu.querySelector('button[role="menuitem"]');
        if (firstMenuItem) { firstMenuItem.focus(); }
        toggleMobileContactMenuTimeoutAriaAndFocus(menu, button);
    }
}

/**
 * Sets up click-outside behavior for mobile contact menu with timeout and ARIA management
 * @param {HTMLElement} menu - The mobile contact menu element
 * @param {HTMLElement} button - The menu toggle button element
 */
function toggleMobileContactMenuTimeoutAriaAndFocus(menu, button) {
    setTimeout(() => {
        document.body.onclick = (ev) => {
            if (!menu.contains(ev.target) &&
                !button.contains(ev.target)) {
                menu.classList.remove('show');
                menu.setAttribute('aria-hidden', 'true');
                button.setAttribute('aria-expanded', 'false');
                button.focus();
                document.body.onclick = null;
            }
        };
    }, 0);
}