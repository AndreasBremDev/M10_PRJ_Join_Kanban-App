bool = [0, 0];

const isNameValid = val => /^[A-Z\-a-zÄÖÜäöüß]+\s[A-Z\-a-zÄÖÜäöüß]+$/.test(val);
const isEmailValid = val => /^[^@]+@[^@]+\.(?!\.)[^@]+$/.test(val);
const isPhoneValid = val => /^[0-9 +()/\-]{6,20}$/.test(val);

async function init() {
    checkLoggedInPageSecurity();
    await eachPageSetCurrentUserInitials();
    await loadAndRenderContacts('contactList', 'contacts');
}

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

async function renderContacts() {
    let contactListRef = document.getElementById('contactList');
    contactsFetch = await fetchData(`/${activeUserId}/contacts`);
    if (contactsFetch.length == 0) {
        contactListRef.innerHTML = emptyContactsHtml();
    } else {
        let contacts = contactsFetch.filter(i => i && i.name);
        let sortedContacts = contacts.sort((a, b) => { return a.name.localeCompare(b.name) });
        let groupedContacts = groupContactsByLetter(sortedContacts);
        contactListRef.innerHTML = renderGroupedContacts(groupedContacts);
    };
}

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

function renderContactLarge(contact, color) {
    let contactLargeRef = document.getElementById('contactDisplayLarge');
    contactLargeRef.innerHTML = '';
    contactLargeRef.innerHTML = renderContactLargeHtml(contact, color);
}

function handleContactKeydown(event, contactJson, color) {
    if (event.key === 'Enter' || event.key === ' ') {
        event.preventDefault();
        contactsLargeSlideIn(event, contactJson, color);
    }
}

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

function checkContactForPhoneHtml(contact) {
    if (contact?.phone) {
        return `<a href="tel:${contact.phone}">${contact.phone}</a>`
    } else {
        return `<a href="tel:">phone number to be edit</a>`
    }
}

function checkContactForPhone(contact) {
    if (contact?.phone) {
        return contact.phone;
    } else {
        return "";
    }
}

function groupContactsByLetter(contacts) {
    const grouped = {};
    contacts.forEach((c) => {
        const letter = (c.name?.[0] || "?").toUpperCase();
        if (!grouped[letter]) grouped[letter] = [];
        grouped[letter].push(c);
    });
    return grouped;
}

let lastFocusedContact = null;

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
    
    setTimeout(() => { 
        contactLargeRef.style.display = 'block'; 
        contactLargeRef.setAttribute('aria-hidden', 'false');
        
        // Focus management - set focus to Edit-Button
        const editButton = contactLargeRef.querySelector('#edit-contact-btn');
        if (editButton) {
            editButton.focus();
        }
        
        // Escape key handler for contact details
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

async function showDialogCreateContact(id, ev) {
    ev.stopPropagation();
    const modal = document.getElementById(id);
    bool = [0, 0];
    modal.innerHTML = renderAddNewContactOverlayHtml();
    modal.showModal();
    setTimeout(() => {
        modal.classList.add("open");
    }, 10);

    checkAllCreateContactValidations('contactCreateBtn');
    await loadAndRenderContacts('contactList', 'contacts');;
}

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

async function showDialogContact(id, contactJson, color, ev, option) {
    ev.stopPropagation();
    let contactEditDeleteModal = document.getElementById(id);
    let contact = JSON.parse(contactJson);
    bool = [1, 1];
    contactEditDeleteModal.innerHTML = renderEditContactOverlayHtml(contact, color, option);
    contactEditDeleteModal.showModal();
    setTimeout(() => {
        contactEditDeleteModal.classList.add("open");
    }, 10);
    await renderContacts();
}

async function createContact() {
    await createNextIdPutDataAndRender();
    clearAllContactsInputFields();
    showPopup('popupContactCreated');
    setTimeout(() => {
        let contactAddModal = document.getElementById('contactAddModal');
        contactAddModal.close()
    }, 1500);
}

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

function validateField(inputId, errMsgId, validateFn, boolIndex, errMsg, shouldCheckAll = false) {
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

function clearAllContactsInputFields() {
    let nameContact = document.getElementById('nameContact');
    let emailContact = document.getElementById('emailContact');
    let phoneContact = document.getElementById('phoneContact');
    nameContact.value = '';
    emailContact.value = '';
    phoneContact.value = '';
}

function showPopup(id) {
    const popup = document.getElementById(id);
    popup.style.display = 'block';
    popup.classList.add('show');
    setTimeout(function () {
        popup.classList.remove('show');
        setTimeout(() => {
            popup.style.display = 'none';
        }, 500);
    }, 1000);
}

function contactCancel(ev) {
    ev.preventDefault();
    ev.stopPropagation();

    const modal = ev.target.closest("dialog");
    if (!modal) return;

    modal.classList.remove("open");
    modal.close();
}

function closeContactOverlay() {
    const overlay = document.getElementById('contactDisplayLarge');
    
    overlay.classList.remove('open');
    overlay.style.display = 'none';
    overlay.setAttribute('aria-hidden', 'true');
    
    document.body.classList.remove('no-scroll');
    
    // Return focus to last focused contact in the list
    if (lastFocusedContact) {
        lastFocusedContact.focus();
        lastFocusedContact = null;
    }
}

/////////// overlength (2b updated) /////////////////
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
        
        // Focus management for menu items
        const firstMenuItem = menu.querySelector('button[role="menuitem"]');
        if (firstMenuItem) {
            firstMenuItem.focus();
        }
        
        setTimeout(() => {
            document.body.onclick = (ev) => {
                if (!menu.contains(ev.target) &&
                    !button.contains(ev.target)) {
                    menu.classList.remove('show');
                    menu.setAttribute('aria-hidden', 'true');
                    button.setAttribute('aria-expanded', 'false');
                    button.focus(); // Return focus to button
                    document.body.onclick = null;
                }
            }
        }, 0);
    }
}

function openEditContact(contactJson, color) {
    toggleMobileContactMenu();
    showDialogContact('contactEditDeleteModal', contactJson, color, event, 'Edit');
}

function openDeleteContact(contactJson, color) {
    toggleMobileContactMenu();
    showDialogContact('contactEditDeleteModal', contactJson, color, event, 'Delete');
}

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

function handleContactEditKeydown(event, contactJson, color) {
    if (event.key === 'Enter' || event.key === ' ') {
        event.preventDefault();
        showDialogContact('contactEditDeleteModal', contactJson, color, event, 'Edit');
    }
}

function handleContactDeleteKeydown(event, contactJson, color) {
    if (event.key === 'Enter' || event.key === ' ') {
        event.preventDefault();
        showDialogContact('contactEditDeleteModal', contactJson, color, event, 'Delete');
    }
}

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

function handleMobileEditKeydown(event, contactJson, color) {
    if (event.key === 'Enter' || event.key === ' ') {
        event.preventDefault();
        openEditContact(contactJson, color);
    }
}

function handleMobileDeleteKeydown(event, contactJson, color) {
    if (event.key === 'Enter' || event.key === ' ') {
        event.preventDefault();
        openDeleteContact(contactJson, color);
    }
}

/////////////////// NEU /////////////////////////U
// Update the toggleMobileContactMenu function to manage ARIA states
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
        
        // Focus management for menu items
        const firstMenuItem = menu.querySelector('button[role="menuitem"]');
        if (firstMenuItem) {
            firstMenuItem.focus();
        }
        
        setTimeout(() => {
            document.body.onclick = (ev) => {
                if (!menu.contains(ev.target) &&
                    !button.contains(ev.target)) {
                    menu.classList.remove('show');
                    menu.setAttribute('aria-hidden', 'true');
                    button.setAttribute('aria-expanded', 'false');
                    button.focus(); // Return focus to button
                    document.body.onclick = null;
                }
            }
        }, 0);
    }
}