const BASE_URL = "https://join-kanban-app-14634-default-rtdb.europe-west1.firebasedatabase.app/user";
let activeUserId;
activeUserId = loadActiveUserId();
let isUserMenuListenerAdded = false;
let contacts = [];
let tasks = [];

/**
 * Loads the active user ID from localStorage
 * @returns {number} The active user ID, defaults to 0 if not found
 */
function loadActiveUserId() {
    const val = localStorage.getItem("activeUserId");
    return val ? JSON.parse(val) : 0;
}

/**
 * Loads the greeting shown status from localStorage
 * @returns {boolean} True if greeting was already shown, false otherwise
 */
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

/**
 * Calculates the next available ID for a given path
 * @param {string} path - The database path to check for existing IDs
 * @returns {Promise<number>} The next available ID
 */
async function calcNextId(path = "") {
    let nextId;
    try {
        let res = await fetch(BASE_URL + path + ".json");
        let resJson = await res.json();
        let userId = Object.keys(resJson);
        userId.length === 0 ? nextId = 0 : nextId = userId.reduce((a, b) => Math.max(a, b), -Infinity) + 1;
    } catch (error) {
        console.error(`fetch in calcNextId() from ${BASE_URL + path} failed: `, error);
    }
    return nextId;
}

/**
 * Sends a PUT request to the Firebase database
 * @param {string} path - The database path
 * @param {Object} data - The data to send
 * @returns {Promise<Response>} The fetch response
 */
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

/**
 * Loads and renders contacts for a specific page
 * @param {string} divId - The ID of the container element
 * @param {string} useAtPage - The page type ('addTask' or 'contacts')
 */
async function loadAndRenderContacts(divId, useAtPage) {
    const containerId = document.getElementById(divId);
    let sortedContacts = await fetchAndSortContacts(containerId);
    contacts = sortedContacts;
    containerId.innerHTML = '';
    if (useAtPage === 'addTask') {
        const html = sortedContacts.map((contact, i) => contactRowHTML(contact, i)).join('');
        containerId.innerHTML = html;
    } else if (useAtPage === 'contacts') {
        let groupedContacts = groupContactsByLetter(sortedContacts);
        containerId.innerHTML = renderGroupedContacts(groupedContacts);
    }
}

/**
 * Fetches and sorts contacts from the database
 * @param {HTMLElement} containerId - The container element for error display
 * @returns {Promise<Array>} Sorted array of contacts
 */
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

/**
 * Fetches data from the Firebase database
 * @param {string} path - The database path to fetch from
 * @returns {Promise<Object|null>} The fetched data or null on error
 */
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

/**
 * Sets the current user's initials in the navigation
 */
async function eachPageSetCurrentUserInitials() {
    let currentUserInitials = document.getElementById('currentUserInitials');
    let currentUser = await fetchData(`/${activeUserId}/name`);
    let initials = await getInitials(currentUser);
    currentUserInitials.innerHTML = initials;
    currentUserInitials.setAttribute('aria-label', `${initials} - User menu`);
    if (!window.resizeListenerAdded) {
        window.addEventListener('resize', handleGlobalResize);
        window.resizeListenerAdded = true;
    }
}

/**
 * Handles global window resize events, checks if function exist and calls summary-specific function
 */
function handleGlobalResize() {
    if (typeof window.handleResizeOverlay === 'function') {
        window.handleResizeOverlay();
    }
    else if (typeof handleResizeOverlay === 'function' && handleResizeOverlay !== window.handleResizeOverlay) {
        handleResizeOverlay();
    }
}

/**
 * Deletes data from the Firebase database
 * @param {string} path - The database path to delete
 */
async function deletePath(path = "") {
    try {
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

/**
 * Generates initials from a full name (enhanced version with null check)
 * @param {string} name - The full name to generate initials from
 * @returns {string} The initials in uppercase or '?' if name is invalid
 */
function getInitials(name) {
    if (!name) return "?";
    return name.split(' ').map(word => word[0].toUpperCase()).join('');
}

/**
 * Logs out the current user and redirects to login page
 */
function logout() {
    localStorage.removeItem('activeUserId');
    localStorage.removeItem('shownGreeting');
    for (let i = 0; i < 50; i++) {
        history.pushState(null, null, '../index.html');
    }
    window.location.replace(window.location.origin + '/index.html');
}

/**
 * Checks if user is logged in, redirects to login if not
 */
function checkLoggedInPageSecurity() {
    if (!localStorage.getItem('activeUserId')) {
        for (let i = 0; i < 50; i++) {
            history.pushState(null, null, '../index.html');
        }
        window.location.replace(window.location.origin + '/index.html');
        return;
    }
}

/**
 * Toggles the user dropdown menu
 * @param {Event} event - The triggering event
 */
function toggleDropDownMenu(event) {
    if (event && (event.key === 'Enter' || event.key === ' ')) { event.preventDefault(); }
    let userMenu = document.getElementById('user-menu');
    let userCircle = document.querySelector('.user-circle');
    if (!userMenu || !userCircle) return;
    const isOpen = userMenu.classList.contains('show');
    if (isOpen) { closeDropDownAndResetFocus(userMenu, userCircle);
    } else { openDropDownResetFocusAndAddListener(userMenu, userCircle); }
    if (!isUserMenuListenerAdded) {
        clickOutsideEventListener();
        isUserMenuListenerAdded = true;
    }
}

/**
 * Adds click outside listener for dropdown menu
 */
function clickOutsideEventListener() {
    document.addEventListener('click', function (event) {
        let userMenu = document.getElementById('user-menu');
        let userCircle = document.querySelector('.user-circle');
        if (userMenu && userMenu.classList.contains('show') &&
            !userCircle?.contains(event.target) &&
            !userMenu.contains(event.target)) {
            closeDropDownAndResetFocus(userMenu, userCircle);
        }
    });
}

/**
 * Opens dropdown menu and sets focus
 * @param {HTMLElement} userMenu - The user menu element
 * @param {HTMLElement} userCircle - The user circle element
 */
function openDropDownResetFocusAndAddListener(userMenu, userCircle) {
    userMenu.classList.add('show');
    userMenu.setAttribute('aria-hidden', 'false');
    userCircle.setAttribute('aria-expanded', 'true');
    setTimeout(() => {
        const firstMenuItem = userMenu.querySelector('a[role="menuitem"]');
        if (firstMenuItem) {
            firstMenuItem.focus();
        } else {
            const menuLinks = userMenu.querySelectorAll('a');
            if (menuLinks.length > 0) { menuLinks[0].focus() }
        }
    }, 150);
    document.addEventListener('keydown', handleMenuEscapeKey);
}

/**
 * Shows a popup notification with fade-in/fade-out animation
 * @param {string} id - The ID of the popup element
 */
function showPopup(id) {
    const popup = document.getElementById(id);
    popup.style.display = 'block';
    setTimeout(() => {
        popup.classList.add('show');
    }, 10);
    setTimeout(function () {
        popup.classList.remove('show');
        setTimeout(() => {
            popup.style.display = 'none';
        }, 500);
    }, 1000);
}

/**
 * Closes dropdown menu and resets focus
 * @param {HTMLElement} userMenu - The user menu element
 * @param {HTMLElement} userCircle - The user circle element
 */
function closeDropDownAndResetFocus(userMenu, userCircle) {
    userMenu.classList.remove('show');
    userMenu.setAttribute('aria-hidden', 'true');
    userCircle.setAttribute('aria-expanded', 'false');
    userCircle.focus();
    document.removeEventListener('keydown', handleMenuEscapeKey);
}

/**Event listener to close dropdown when clicking outside
 */
document.addEventListener('click', function (event) {
    let dropdown = document.getElementById('assigned-dropdown');
    let displayElement = document.getElementById('assigned-display');
    handleDropdown(event, dropdown, displayElement);
    let dropdownEdit = document.getElementById('assigned-dropdown-edit');
    let displayElementEdit = document.getElementById('assigned-display-edit');
    handleDropdown(event, dropdownEdit, displayElementEdit);
    let categoryDropdown = document.getElementById('category-options');
    let categoryDisplay = document.getElementById('category-display');
    handleDropdown(event, categoryDropdown, categoryDisplay);
});

/**
 * Unified dropdown handler for outside clicks
 * @param {Event} event - The triggering event
 * @param {HTMLElement} dropdown - The dropdown element
 * @param {HTMLElement} displayElement - The display element
 */
function handleDropdown(event, dropdown, displayElement) {
    if (dropdown && dropdown.style.display === 'block' &&
        !dropdown.contains(event.target) &&
        !displayElement?.contains(event.target)) {
        dropdown.style.display = 'none';
        if (displayElement) {
            displayElement.setAttribute('aria-expanded', 'false');
        }
    }
}

/**
 * Toggle function for assigned dropdown
 */
function toggleAssignedDropdown() {
    const dropdown = document.getElementById('assigned-dropdown');
    const displayElement = document.getElementById('assigned-display');
    if (dropdown && displayElement) {
        const isOpen = dropdown.style.display === 'block';
        dropdown.style.display = isOpen ? 'none' : 'block';
        displayElement.setAttribute('aria-expanded', !isOpen);
        if (!isOpen) {
            setTimeout(() => {
                const firstItem = dropdown.querySelector('[tabindex="0"], input, button, a');
                if (firstItem) firstItem.focus();
            }, 50);
        }
    }
}

/**
 * Toggle function for category dropdown
 */
function toggleCategoryDropdown() {
    const dropdown = document.getElementById('category-options');
    const displayElement = document.getElementById('category-display');
    if (dropdown && displayElement) {
        const isOpen = dropdown.style.display === 'block';
        dropdown.style.display = isOpen ? 'none' : 'block';
        displayElement.setAttribute('aria-expanded', !isOpen);
        if (!isOpen) {
            setTimeout(() => {
                const firstItem = dropdown.querySelector('[tabindex="0"], input, button, a');
                if (firstItem) firstItem.focus();
            }, 50);
        }
    }
}