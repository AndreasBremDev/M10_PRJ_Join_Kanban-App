
bool = [0, 0]

const isNameValid = val => /^[A-Za-z]+\s[A-Za-z]+$/.test(val);
const isEmailValid = val => /^[^@]+@[^@]+\.[^@]+$/.test(val);

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
    contactsFetch = await fetchContacts(activeUserId);
    if (contactsFetch.length == 0) {
        contactListRef.innerHTML = emptyContactsHtml();
    } else {
        let contacts = contactsFetch.filter(i => i.name !== undefined);
        let sortedContacts = contacts.sort((a, b) => { return a.name.localeCompare(b.name) });
        let groupedContacts = groupContactsByLetter(sortedContacts);
        contactListRef.innerHTML = renderGroupedContacts(groupedContacts);
    };
}

function renderGroupedContacts(groupedContacts) {
    let html = '';
    let globalIndex = 0;
    const sortedKeys = Object.keys(groupedContacts).sort();
    for (const key of sortedKeys) {
        html += renderContactsCardPartOne(key);

        groupedContacts[key].forEach(contact => {
            const color = contactCircleColor[globalIndex % contactCircleColor.length];
            html += renderContactsCardPartTwo(contact, color);
            globalIndex++;
        });
    }
    return html;
}

function renderContactLarge(contact, color) {
    let contactLargeRef = document.getElementById('contactDisplayLarge');
    contactLargeRef.innerHTML = '';
    contactLargeRef.innerHTML = renderContactLargeHtml(contact, color);
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

function contactsLargeSlideIn(ev, contactJson, color) {
    let contactLargeRef = document.getElementById('contactDisplayLarge');
    contactLargeRef.style.display = 'none';
    contactLargeRef.innerHTML = '';
    let contact = JSON.parse(contactJson);
    let contactCardsActive = document.querySelectorAll('.contact-list-card-active');
    for (let i = 0; i < contactCardsActive.length; i++) {
        contactCardsActive[i].classList.remove('contact-list-card-active');
        contactCardsActive[i].classList.add('contact-list-card')
    };
    ev.currentTarget.classList.remove('contact-list-card');
    ev.currentTarget.classList.add('contact-list-card-active');
    contactLargeRef.innerHTML = renderContactLargeHtml(contact, color);
    setTimeout(() => { contactLargeRef.style.display = 'block'; }, 10);
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
        option === 'Edit' ? await putData('/' + activeUserId + '/contacts/' + currContactId, contactData) : await deletePath('/' + activeUserId + '/contacts/' + currContactId);
        clearAllContactsInputFields();
        await loadAndRenderContacts('contactList', 'contacts');
        document.getElementById('contactDisplayLarge').innerHTML = '';
        document.getElementById('contactEditDeleteModal').close();
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
        bool[boolIndex] = 1;
    } else {
        errMsgElem.style.display = 'block';
        errMsgElem.innerText = errMsg;
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

    document.body.classList.remove('no-scroll');
}

function toggleMobileContactMenu() {
    const menu = document.getElementById('mobileContactMenu');

    const isOpen = menu.classList.contains('show');

    if (isOpen) {
        menu.classList.remove('show');
        document.body.onclick = null;
    } else {
        menu.classList.add('show');
        setTimeout(() => {
            document.body.onclick = (ev) => {
                if (!menu.contains(ev.target) &&
                    !document.querySelector('.mobile-actions-btn').contains(ev.target)) {
                    menu.classList.remove('show');
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