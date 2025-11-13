let contacts = [];

const isNameValid = val => /^[A-Za-z]+\s[A-Za-z]+$/.test(val);
const isEmailValid = val => /^[^@]+@[^@]+\.[^@]+$/.test(val);

async function init() {
    await renderContacts()
}

async function fetchContacts(activeUserId) {
    try {
        let res = await fetch(BASE_URL + "/" + activeUserId + "/contacts" + ".json");
        let fetchJson = await res.json();
        contacts = Object.entries(fetchJson).map(([id, contactsData]) => ({
            id: id,
            ...contactsData
        }));
        return contacts
    } catch (error) {
        console.log("Error fetchContacts(): ", error);
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
    if (shouldCheckAll) { checkAllValidations() };
    return bool[boolIndex];
}

async function renderContacts() {
    let contactListRef = document.getElementById('contactList');
    let contacts = await fetchContacts(activeUserId);
    if (contacts.length == 0) {
        contactListRef.innerHTML = emptyContactsHtml();
    } else {
    let groupedContacts = groupContactsByLetter(contacts)
    contactListRef.innerHTML = renderGroupedContacts(groupedContacts)
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

function renderContactLarge(contact,color){
    let contactLargeRef = document.getElementById('contactDisplayLarge');
    contactLargeRef.innerHTML = '';
    contactLargeRef.innerHTML = renderContactLargeHtml(contact,color);
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
        contactCardsActive[i].classList.add('contact-list-card')};
    ev.currentTarget.classList.remove('contact-list-card');
    ev.currentTarget.classList.add('contact-list-card-active');    
    contactLargeRef.innerHTML = renderContactLargeHtml(contact, color);
    setTimeout(() => {contactLargeRef.style.display = 'block';},10);  
}

async function showDialogCreateContact(id, event/*, toggleStyling = null */) {
    let contactAddModal = document.getElementById(id);
    event.stopPropagation();
    contactAddModal.showModal();
    // contactAddModal.innerHTML = getDialogCardHtml(index);
    // if (toggleStyling === 'yes') {
    //     toggleDialogStyling('hidden');
    // }
}

async function createContact() {
    let 

}
