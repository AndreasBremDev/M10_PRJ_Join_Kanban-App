const BASE_URL = "https://join-kanban-app-14634-default-rtdb.europe-west1.firebasedatabase.app/user";  // BASE-URL ersetzen
let activeUserId;
activeUserId = loadFromLocalStorage();

function loadFromLocalStorage() {
    let activeUserIdLoad = JSON.parse(localStorage.getItem("activeUserId"));
    if (activeUserIdLoad !== null) {
        activeUserId = activeUserIdLoad;
        return activeUserId;
    } else {
        console.log("Etwas beim Laden vom LocalStorage ist schief gelaufen: activeUserId = 0");
        return activeUserId = 0;
    }
}

async function calcNextId(path = "") {
    try {
        let res = await fetch(BASE_URL + path + ".json");
        let resJson = await res.json();
        let userId = Object.keys(resJson);
        userId.length === 0 ? nextUser = 0 : nextUser = userId.reduce((a, b) => Math.max(a, b), -Infinity) + 1;
    } catch (error) {
        console.log(`fetch in calcNextId() from ${BASE_URL + path} failed: `, error);
    }
    return nextUser;
}

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

// function saveActiveUserIdToLocalStorage(activeUserId) {
    
// }


// function to fetch user data from firebase
async function fetchUserData(path) {
    try {
        let url = `${BASE_URL}${path}`;
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

// function to extract initials from a full name
function getInitials(name) {
    return name.split(' ').map(part => part.charAt(0).toUpperCase()).join('');
}

// function to create a user circle and put it to the container
function createUserCircle(containerId, initials, index) {
    const color = contactCircleColor[index % contactCircleColor.length]; // choose color from  contactCircleColor
    const userCircle = document.createElement('div'); // create a 'div' element for the circle
    userCircle.classList.add('user-circle-intials');
    userCircle.textContent = initials; // set the initials as text inside the circle
    userCircle.style.backgroundColor = color; // set the background color for the circle

    const container = document.getElementById(containerId); // get the container to append the circle
    if (container) {
        container.appendChild(userCircle); // put circle tot he container
    } else {
        console.error(`Container ${containerId} not found!`);  // error handling
    }
}

// function to load user contacts and create user circles for each contact
async function renderUserCircles() {
    const contacts = await fetchUserData(`/${activeUserId}/contacts.json`); // fetch contacts for the active user
    if (!contacts) {
        console.error("No contacts found for user:", activeUserId); // error message
        return;
    }
    // loop through the contacts and create a circle for each one
    contacts.forEach((contact, index) => {
        if (contact) {
            const initials = getInitials(contact.name); // // Extract initials
            createUserCircle('user-initial-circle', initials, index); // create and append the user circle
        }
    });
}