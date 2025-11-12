let contacts;

async function fetchContacts(activeUserId = 0) {
    try {
        let res = await fetch(FIREBASE_URL + "/" + activeUserId + "/contacts" + ".json");
        let tasks = await res.json();
        let contacts = Object.entries(tasks).map(([id, contactsData]) => ({
            id: id,
            ...contactsData
        }));
        return contacts
    } catch (error) {
        console.log("Error fetchContacts(): ", error);
    }
}

async function init() {
    await renderContacts()
}

async function renderContacts() {
    let contactListRef = document.getElementById('contactList');
    let contacts = await fetchContacts();
    let groupedContacts = groupContactsByLetter(contacts)
    contactListRef.innerHTML = renderGroupedContacts(groupedContacts)
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

function initialsFromName(name) {
    return name.split(' ').map(part => part[0]).join('').toUpperCase();
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
