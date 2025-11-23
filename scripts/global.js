const BASE_URL = "https://join-kanban-app-14634-default-rtdb.europe-west1.firebasedatabase.app/user";  // BASE-URL ersetzen
let activeUserId;
activeUserId = loadActiveUserId();
let isUserMenuListenerAdded = false;
let contacts = [];
let tasks = [];

function loadActiveUserId() {
    const val = localStorage.getItem("activeUserId");
    return val ? JSON.parse(val) : 0;
}

function loadShownGreeting() {
    const val = localStorage.getItem("shownGreeting");
    return val === "true";
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

async function calcNextId(path = "") {
    let nextId;
    try {
        let res = await fetch(BASE_URL + path + ".json");
        let resJson = await res.json();
        let userId = Object.keys(resJson);
        userId.length === 0 ? nextId = 0 : nextId = userId.reduce((a, b) => Math.max(a, b), -Infinity) + 1;
    } catch (error) {
        console.log(`fetch in calcNextId() from ${BASE_URL + path} failed: `, error);
    }
    return nextId;
}

function getInitials(name) {
    return name.split(' ').map(part => part.charAt(0).toUpperCase()).join('');
}

async function putData(path = "", data = {}) {
    try {
        let response = await fetch(BASE_URL + path + ".json", {
            method: "PUT",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify(data),
        });
        return response;

    } catch (fetchError) {
        console.error('Fetch error:', fetchError);
        throw fetchError;
    }
}

async function loadAndRenderContacts(divId, useAtPage) {
    const containerId = document.getElementById(divId);
    let sortedContacts = await fetchAndSortContacts(containerId);
    containerId.innerHTML = '';
    if (useAtPage === 'addTask') {
        const html = sortedContacts.map((contact, i) => contactRowHTML(contact, i)).join('');
        containerId.innerHTML = html;
    } else if (useAtPage === 'contacts') {
        let groupedContacts = groupContactsByLetter(sortedContacts);
        containerId.innerHTML = renderGroupedContacts(groupedContacts);
    }
}

async function fetchAndSortContacts(containerId = "") {
    try {
        const contactsObj = await fetchData(`/${activeUserId}/contacts`);
        if (contactsObj.length == 0) { throw new Error; }
        const contactsArray = Object.entries(contactsObj || {}).map(([key, contact]) => ({ id: key, ...contact }));
        let contactsWithoutUndefined = contactsArray.filter(i => i.name !== undefined);
        let sortedContacts = contactsWithoutUndefined.sort((a, b) => a.name.localeCompare(b.name));
        return sortedContacts
    } catch (error) {
        containerId.innerHTML = '';
        containerId.innerHTML = emptyContactsHtml();
    }
}

async function fetchData(path = "") {
    try {
        let response = await fetch(BASE_URL + path + ".json");
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        return await response.json();
    } catch (error) {
        console.error("Error loading data:", error);
    }
}

async function fetchTasks(activeUserId) {
    try {
        let res = await fetch(BASE_URL + "/" + activeUserId + "/tasks" + ".json");
        let tasks = await res.json();
        let tasksWithId = Object.entries(tasks).map(([id, taskData]) => ({
            id: id,
            ...taskData
        }));
        return tasksWithId
    } catch (error) {
        console.log("Error fetchTasks(): ", error);
    }
}
async function fetchUserName(activeUserId) {
    try {
        let res = await fetch(BASE_URL + "/" + activeUserId + "/name" + ".json");
        let response = await res.json();
        return response
    } catch (error) {
        console.log("Error fetchTasks(): ", error);
    }
}

async function eachPageSetCurrentUserInitials() {
    let currentUserInitials = document.getElementById('currentUserInitials');
    let currentUser = await fetchUserName(activeUserId);
    let initials = await getInitials(currentUser);
    currentUserInitials.innerHTML = initials;
}


// function to fetch user data from firebase
async function fetchUserData(path) {
    try {
        let url = `${BASE_URL}${path}`;
        const response = await fetch(url);

        if (!response.ok) {
            throw new Error(`Error fetching data from ${path}`);
        }
        let result = await response.json();
        return result
    } catch (error) {
        console.error("Error loading user data:", error);
        return null;
    }
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




/**
 * Delete a task from the backend.
 */

async function deleteTask(taskId) {
    try {
        const taskPath = `/${activeUserId}/tasks/${taskId}`;
        const response = await fetch(BASE_URL + taskPath + ".json", {
            method: "DELETE"
        });
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
    } catch (error) {
        console.error("Error deleting task:", error);
    }
}

async function deletePath(path = "") {
    try {
        console.log(BASE_URL + path + ".json");
        
        const response = await fetch(BASE_URL + path + ".json", {
            method: "DELETE"
        });
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
    } catch (error) {
        console.error("Error deleting task:", error);
    }
}

function getInitials(name) {
    if (!name) return "?";
    return name.split(' ').map(word => word[0].toUpperCase()).join('');
}

async function fetchContactsForOverlay() {
    return await fetchUserData(`/${activeUserId}/contacts.json`);
}

function logout() {
    localStorage.removeItem('activeUserId');
    localStorage.removeItem('shownGreeting');
    for (let i = 0; i < 100; i++) {
        history.pushState(null, null, '../index.html');
    }
    window.location.replace(window.location.origin + '/index.html');
}

function checkLoggedInPageSecurity() {
    if (!localStorage.getItem('activeUserId')) {
        window.location.href = '../index.html';
        return;
    }
}

function toggleDropDownMenu() {
    let userMenu = document.getElementById('user-menu');
    userMenu.classList.toggle('show');
    if (!isUserMenuListenerAdded) {
        document.addEventListener('click', function (event) {
            let userMenu = document.getElementById('user-menu');
            let userCircle = document.querySelector('.user-circle');
            if (!userCircle.contains(event.target) && !userMenu.contains(event.target)) {
                userMenu.classList.remove('show');
            }
        });
        isUserMenuListenerAdded = true;
    }
}

