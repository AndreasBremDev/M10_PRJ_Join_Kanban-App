let bool = [0, 0];
let lastFocusedContact = null;

/** Validates full name format (first name space last name) */
const isNameValid = val => /^[A-Z\-a-zÄÖÜäöüß]+\s[A-Z\-a-zÄÖÜäöüß]+$/.test(val);
/** Validates email address format */
const isEmailValid = val => /^[^@]+@[^@]+\.(?!\.)[^@]+$/.test(val);
/** Validates phone number format (6-20 characters, numbers and common symbols) */
const isPhoneValid = val => /^[0-9 +()\/-]{6,20}$/.test(val);

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
 * Checks all contact creation validations and enables/disables the create button
 * @param {string} id - The ID of the create button element
 */
function checkAllCreateContactValidations(id) {
    let contactCreateBtn = document.getElementById(id);
    let errMsgPhone = document.getElementById('errMsgPhone');
    let allBoolEqualOne = bool.every(el => el === 1);
    if (allBoolEqualOne) {
        errMsgPhone.style.display = 'none';
        contactCreateBtn.disabled = false;
        contactCreateBtn.ariaDisabled = false;
    } else {
        errMsgPhone.style.display = 'block';
        errMsgPhone.innerHTML = "Please enter at least full name and email"
        contactCreateBtn.disabled = true;
        contactCreateBtn.ariaDisabled = true;
    }
}

// renderContacts function moved to rendering.js

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

// renderGroupedContacts function moved to rendering.js

// renderContactLarge function moved to rendering.js

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
        // Trigger the form submission
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
 */
async function updateContact(currContactId, option) {
    try {
        let contactData = await setContactDataForBackendUpload();
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
 * Creates the next contact ID, saves the contact data and re-renders the contact list
 */
async function createNextIdPutDataAndRender() {
    try {
        let nextContactId = await calcNextId('/' + activeUserId + '/contacts');
        let contactData = await setContactDataForBackendUpload();
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
function validateFieldContact(inputId, errMsgId, validateFn, boolIndex, errMsg, shouldCheckAll = false) {
    let input = document.getElementById(inputId);
    let errMsgElem = document.getElementById(errMsgId);
    if (validateFn(input.value)) {
        errMsgElem.style.display = 'none';
        input.setAttribute('aria-invalid', 'false');
        bool[boolIndex] = 1;
    } else {
        errMsgElem.style.display = 'block';
        errMsgElem.innerText = errMsg;
        input.setAttribute('aria-invalid', 'true');
        bool[boolIndex] = 0;
    }
    if (shouldCheckAll) { checkAllCreateContactValidations('contactCreateBtn') };
    return bool[boolIndex];
}

/**
 * Collects contact data from form inputs and formats it for backend upload
 * @returns {Object} Contact data object with name, email, and phone
 */
async function setContactDataForBackendUpload() {
    let nameContact = document.getElementById('nameContact');
    let emailContact = document.getElementById('emailContact');
    let phoneContact = document.getElementById('phoneContact');
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

// checkContactForPhoneHtml function moved to rendering.js

// checkContactForPhone function moved to rendering.js

// groupContactsByLetter function moved to rendering.js

// contactsLargeSlideIn function moved to contacts_dialogs.js

// showDialogCreateContact function moved to contacts_dialogs.js

// showDialogContact function moved to contacts_dialogs.js

// contactCancel function moved to contacts_dialogs.js

// closeContactOverlay function moved to contacts_dialogs.js

// openEditContact function moved to contacts_dialogs.js

// openDeleteContact function moved to contacts_dialogs.js

// toggleMobileContactMenu function moved to contacts_dialogs.js

// toggleMobileContactMenuTimeoutAriaAndFocus function moved to contacts_dialogs.js
