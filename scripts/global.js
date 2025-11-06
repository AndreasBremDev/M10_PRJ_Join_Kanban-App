const FIREBASE_URL = "https://join-kanban-app-14634-default-rtdb.europe-west1.firebasedatabase.app";
let contactCircleColor = [
    '#FF7A00',
    '#FF5EB3',
    '#6E52FF',
    '#9327FF',
    '#00BEE8',
    '#1FD7C1',
    '#FF745E',
    '#FFA35E',
    '#FC71FF',
    '#FFC701',
    '#0038FF',
    '#C3FF2B',
    '#FFE62B',
    '#FF4646',
    '#FFBB2B',
]

function initGlobal() {
    renderUserCircles();
}

async function fetchUserData(path) {
    try {
        let url = `${FIREBASE_URL}${path}`;
        const response = await fetch(url);

        if (!response.ok) {
            throw new Error(`Error fetching data from ${path}`);
        }
        return await response.json();
    } catch (error) {
        console.error("Error loading user data:", error);
        return null;
    }
}

function getInitials(name) {
    return name.split(' ').map(part => part.charAt(0).toUpperCase()).join('');
}

function createUserCircle(containerId, initials, index) {
    const color = contactCircleColor[index % contactCircleColor.length];
    const userCircle = document.createElement('div');
    userCircle.classList.add('user-circle');
    userCircle.textContent = initials;
    userCircle.style.backgroundColor = color;

    const container = document.getElementById(containerId);
    if (container) {
        console.log("Creating circle for:", initials);
        container.appendChild(userCircle);
    } else {
        console.error(`Container ${containerId} not found!`);  // Fehlerbehandlung: Überprüfen, ob der Container vorhanden ist
    }
}

// Funktion zum Laden der Kontakte und Erstellen der Benutzerkreise
async function renderUserCircles() {
    const activeUserId = new URLSearchParams(window.location.search).get('activeUserId') || 0;
    const contacts = await fetchUserData(`/user/${activeUserId}/contacts.json`);

    if (!contacts) {
        console.error("No contacts found for user:", activeUserId);
        return;
    }
    contacts.forEach((contact, index) => {
        if (contact) {
            console.log("Contact:", contact);  // Gibt den gesamten Kontakt aus
            const initials = getInitials(contact.name); // Extrahiere Initialen
            createUserCircle('user-initial-circle', initials, index); // Erstelle den Kreis
        }
    });
}