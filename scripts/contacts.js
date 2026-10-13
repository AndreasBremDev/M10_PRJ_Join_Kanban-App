let bool = [0, 0, 0];
let lastFocusedContact = null;

/** Validates full name format (first name space last name) */
const isNameValid = val => /^[A-Z\-a-zÄÖÜäöüß]+\s[A-Z\-a-zÄÖÜäöüß]+$/.test(val);
/** Validates email address format */
const isEmailValid = val => /^(?=[a-zA-Z0-9@._%+-]{6,64}$)(?=[a-zA-Z0-9._%+-]{1,64}@)[a-zA-Z0-9._%+-]+@[a-zA-Z0-9-]+\.(?!\.)[a-zA-Z]{2,3}(\.(?!\.)(?:uk|jp|in|au|at))?$/.test(val);
/** Validates phone number format (6-20 characters, numbers and common symbols) */
/** was: const isPhoneValid = val => /^[0-9 +()\/-]{6,20}$/.test(val); */
/** now is: accept empty value */
function isPhoneValid(value) {
    if (!value || value.trim() === '') {
        return true;
    }
    return /^(?!.*\s{2,})[0-9+()\/\-\s]{1,25}$/.test(value.trim());
}

/**
 * Initializes the contacts page by checking security, loading user initials and rendering contacts
 */
async function init() {
    checkLoggedInPageSecurity();
    initNavKeyboardSupport();
    await eachPageSetCurrentUserInitials();
    await loadAndRenderContacts('contactList', 'contacts');
}

/**
 * Updates the contact button state based on validation results
 * @param {string} dialogId - The ID of the dialog containing the button
 * @param {string} buttonId - The ID of the button to update (default: 'contactCreateBtn')
 */
function updateContactButtonState(dialogId, buttonId = 'contactCreateBtn') {
    const isValid = bool[0] === 1 && bool[1] === 1 && bool[2] === 1;
    const dialog = document.getElementById(dialogId);
    const button = dialog ? dialog.querySelector(`#${buttonId}`) : null;
    
    if (button) {
        if (isValid) {
            button.disabled = false;
            button.setAttribute('aria-disabled', 'false');
        } else {
            button.disabled = true;
            button.setAttribute('aria-disabled', 'true');
        }
    }
}

/**
 * Converts the contactsFetch data to an array format
 * Handles different data structures from Firebase: null/undefined, arrays, or objects
 * @returns {Array} Array of contact objects with preserved IDs
 */
function convertContactsFetchObjectToArray() {
    let contactsArray;
    if (!contactsFetch) {
        contactsArray = [];
    } else if (Array.isArray(contactsFetch)) {
        contactsArray = contactsFetch;
    } else {
        contactsArray = Object.keys(contactsFetch).map(key => ({
            id: key,
            ...contactsFetch[key]
        }));
    }
    return contactsArray;
}

/**
 * Handles keyboard events for contact card interactions
 * @param {KeyboardEvent} event - The keyboard event
 * @param {string} contactJson - JSON string of the contact data
 * @param {string} color - The contact's background color
 */
function handleContactKeydown(event, contactJson, color) {
    if (event.key === 'Enter' || event.key === ' ') {
        event.preventDefault();
        contactsLargeSlideIn(event, contactJson, color);
    }
}

/**
 * Handles keyboard events for contact cancel button
 * @param {KeyboardEvent} event - The keyboard event
 */
function handleContactCancelKeydown(event) {
    if (event.key === 'Enter' || event.key === ' ') {
        event.preventDefault();
        contactCancel(event);
    }
    if (event.key === 'Escape') {
        event.preventDefault();
        contactCancel(event);
    }
}

/**
 * Handles keyboard events for contact submit button
 * @param {KeyboardEvent} event - The keyboard event
 */
function handleContactSubmitKeydown(event) {
    if (event.key === 'Enter' || event.key === ' ') {
        event.preventDefault();
        const form = event.target.closest('form');
        if (form) {
            form.dispatchEvent(new Event('submit'));
        }
    }
}

/**
 * Handles keyboard events for contact close button (duplicate function)
 * @param {KeyboardEvent} event - The keyboard event
 */
function handleContactCloseKeydown(event) {
    if (event.key === 'Enter' || event.key === ' ') {
        event.preventDefault();
        contactCancel(event);
    }
    if (event.key === 'Escape') {
        event.preventDefault();
        contactCancel(event);
    }
}

/**
 * Creates a new contact and shows success feedback
 */
async function createContact() {
    await createNextIdPutDataAndRender();
    clearAllContactsInputFields();
    showPopup('popupContactCreated');
    setTimeout(() => {
        let contactAddModal = document.getElementById('contactAddModal');
        contactAddModal.close()
    }, 1500);
}

/**
 * Updates or deletes a contact based on the option parameter
 * @param {string} currContactId - The ID of the contact to update/delete
 * @param {string} option - The action to perform ('Edit' or 'Delete')
 * @param {Event} [event] - The form submit event (optional)
 */
async function updateContact(currContactId, option, event = null) {
    try {
        if (event) {
            event.preventDefault();
            event.stopPropagation();
        }
        await new Promise(resolve => requestAnimationFrame(() => setTimeout(resolve, 10)));
        let contactData = await setContactDataForBackendUpload('contactEditDeleteModal');
        if (option === 'Edit') {
            await putData('/' + activeUserId + '/contacts/' + currContactId, contactData);
        } else {
            await deletePath('/' + activeUserId + '/contacts/' + currContactId);
        }
        clearAllContactsInputFields();
        await loadAndRenderContacts('contactList', 'contacts');
        const big = document.getElementById('contactDisplayLarge');
        big.innerHTML = '';
        big.style.display = 'none';
        const modal = document.getElementById('contactEditDeleteModal');
        modal.close();
    } catch (error) {
        console.error('Error edit/delete contact at putData():', error);
    }
}

/**
 * Deletes a contact from the database and updates the UI
 * Removes the contact from Firebase, refreshes the contact list, and closes any open dialogs
 * @param {string} currContactId - The ID of the contact to delete
 * @param {string} option - The operation type (unused parameter, kept for consistency)
 * @returns {Promise<void>} Promise that resolves when the contact is successfully deleted
 * @throws {Error} Throws an error if the deletion operation fails
 */
async function deleteContact(currContactId, option) {
    try {
        await deletePath('/' + activeUserId + '/contacts/' + currContactId);
        await loadAndRenderContacts('contactList', 'contacts');
        const big = document.getElementById('contactDisplayLarge');
        big.innerHTML = '';
        big.style.display = 'none';
        const modal = document.getElementById('contactEditDeleteModal');
        modal.close();
    }  catch (error) {
        console.error('Error edit/delete contact at putData():', error);
    }
}


/**
 * Creates the next contact ID, saves the contact data and re-renders the contact list
 */
async function createNextIdPutDataAndRender() {
    try {
        let nextContactId = await calcNextId('/' + activeUserId + '/contacts');
        let contactData = await setContactDataForBackendUpload('contactAddModal');
        let result = await putData('/' + activeUserId + '/contacts/' + nextContactId, contactData);
        await loadAndRenderContacts('contactList', 'contacts');
    } catch (error) {
        console.error('Error creating contact:', error);
    }
}

/**
 * Validates an input field using a provided validation function
 * @param {string} inputId - The ID of the input element
 * @param {string} errMsgId - The ID of the error message element
 * @param {Function} validateFn - The validation function to use
 * @param {number} boolIndex - The index in the bool array to update
 * @param {string} errMsg - The error message to display
 * @param {boolean} shouldCheckAll - Whether to check all validations after this one
 * @returns {number} The validation result (0 or 1)
 */
function validateFieldContact(dialogId, inputId, errMsgId, validateFn, boolIndex, errMsg, shouldCheckAll = false) {
    let input = document.getElementById(dialogId).querySelector(`#${inputId}`);
    let errMsgElem = document.getElementById(dialogId).querySelector(`#${errMsgId}`);
    if (validateFn(input.value)) {
        errMsgElem.innerText = '';
        input.setAttribute('aria-invalid', 'false');
        bool[boolIndex] = 1;
    } else {
        errMsgElem.innerText = errMsg;
        input.setAttribute('aria-invalid', 'true');
        bool[boolIndex] = 0;
    }
    updateContactButtonState(dialogId);
    return bool[boolIndex];
}

/**
 * Collects contact data from form inputs and formats it for backend upload
 * @param {string} [dialogId] - The dialog container ID
 * @returns {Object} Contact data object with name, email, and phone
 */
async function setContactDataForBackendUpload(dialogId) {
    let nameContact = document.getElementById(dialogId).querySelector('#nameContact');
    let emailContact = document.getElementById(dialogId).querySelector('#emailContact');
    let phoneContact = document.getElementById(dialogId).querySelector('#phoneContact');
    let data = {
        name: nameContact.value.trim(),
        email: emailContact.value.trim().toLowerCase(),
        phone: phoneContact.value.trim(),
    };
    return data;
}

/**
 * Clears all contact input fields
 */
function clearAllContactsInputFields() {
    let nameContact = document.getElementById('nameContact');
    let emailContact = document.getElementById('emailContact');
    let phoneContact = document.getElementById('phoneContact');
    nameContact.value = '';
    emailContact.value = '';
    phoneContact.value = '';
}

/**
 * Handles keyboard events for contact back button
 * @param {KeyboardEvent} event - The keyboard event
 */
function handleContactBackKeydown(event) {
    if (event.key === 'Enter' || event.key === ' ') {
        event.preventDefault();
        closeContactOverlay();
    }
    if (event.key === 'Escape') {
        event.preventDefault();
        closeContactOverlay();
    }
}

/**
 * Handles keyboard events for contact edit button
 * @param {KeyboardEvent} event - The keyboard event
 * @param {string} contactJson - JSON string of the contact data
 * @param {string} color - The contact's background color
 */
function handleContactEditKeydown(event, contactJson, color) {
    if (event.key === 'Enter' || event.key === ' ') {
        event.preventDefault();
        showDialogContact('contactEditDeleteModal', contactJson, color, event, 'Edit');
    }
}

/**
 * Handles keyboard events for contact delete button
 * @param {KeyboardEvent} event - The keyboard event
 * @param {string} contactJson - JSON string of the contact data
 * @param {string} color - The contact's background color
 */
function handleContactDeleteKeydown(event, contactJson, color) {
    if (event.key === 'Enter' || event.key === ' ') {
        event.preventDefault();
        showDialogContact('contactEditDeleteModal', contactJson, color, event, 'Delete');
    }
}

/**
 * Handles keyboard events for mobile menu toggle
 * @param {KeyboardEvent} event - The keyboard event
 */
function handleMobileMenuKeydown(event) {
    if (event.key === 'Enter' || event.key === ' ') {
        event.preventDefault();
        toggleMobileContactMenu();
    }
    if (event.key === 'Escape') {
        const menu = document.getElementById('mobileContactMenu');
        if (menu.classList.contains('show')) {
            menu.classList.remove('show');
        }
    }
}

/**
 * Handles keyboard events for mobile edit button
 * @param {KeyboardEvent} event - The keyboard event
 * @param {string} contactJson - JSON string of the contact data
 * @param {string} color - The contact's background color
 */
function handleMobileEditKeydown(event, contactJson, color) {
    if (event.key === 'Enter' || event.key === ' ') {
        event.preventDefault();
        openEditContact(contactJson, color);
    }
}

/**
 * Handles keyboard events for mobile delete button
 * @param {KeyboardEvent} event - The keyboard event
 * @param {string} contactJson - JSON string of the contact data
 * @param {string} color - The contact's background color
 */
function handleMobileDeleteKeydown(event, contactJson, color) {
    if (event.key === 'Enter' || event.key === ' ') {
        event.preventDefault();
        openDeleteContact(contactJson, color);
    }
}