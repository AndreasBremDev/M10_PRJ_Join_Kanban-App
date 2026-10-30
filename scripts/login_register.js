/** Validates full name format (first name space last name with Unicode support) */
const isNameValid = val => /^[A-Z\-a-zÄÖÜäöüß]+\s[A-Z\-a-zÄÖÜäöüß\p{M}]+$/.test(val);
/** Validates email address format with length constraints */
const isEmailValid = val => /^(?=[a-zA-Z0-9@._%+-]{6,64}$)(?=[a-zA-Z0-9._%+-]{1,64}@)[a-zA-Z0-9._%+-]+@[a-zA-Z0-9-]+\.(?!\.)[a-zA-Z]{2,3}(\.(?!\.)(?:uk|jp|in|au|at))?$/.test(val);
/** Validates password strength (uppercase, lowercase, no number, special char, min 8 chars) */
const isPassValid = val => /[A-Za-z0-9]/.test(val) /* && /[a-z]/.test(val) && /[0-9]/.test(val) */ && /[!§$%&\/\?\-\+#@]/.test(val) && val.length >= 8;
/** Validates password confirmation matches original password */
const isConfirmValid = val => val === document.getElementById('passwordRegister').value;
/** Validates checkbox is checked */
const isCheckboxValid = () => document.getElementById('checkbox').checked;

const futureDate = new Date();
futureDate.setFullYear(futureDate.getFullYear() + 1);
const dueDateString = futureDate.toISOString().split('T')[0];

const firstLoginTasksObject = {
    "0": {
        title: "You Successfully logged in",
        description: "You entered name, email, password and signed in",
        dueDate: dueDateString,
        category: "User Story",
        priority: "low",
        assigned: { "0": "0" },
        subtasks: {
            "0": {
                title: "Account created and verified",
                done: true
            }
        },
        board: "done",
        createdAt: new Date().getTime()
    },
    "1": {
        title: "Manage Contacts & Assignments",
        description: "Create, edit, or delete contacts in the Contacts section and assign them to this task.",
        dueDate: dueDateString,
        category: "User Story",
        priority: "medium",
        assigned: { "0": "0" },
        board: "toDo",
        createdAt: new Date().getTime()
    },
    "2": {
        title: "Test Attachments & Deletion",
        description: "Try adding images/attachments to this task and test the card deletion feature.",
        dueDate: dueDateString,
        category: "Technical Task",
        priority: "low",
        assigned: { "0": "0" },
        board: "toDo",
        createdAt: new Date().getTime()
    },
    "3": {
        title: "Create New Tasks And Subtasks",
        description: "Create new tasks either directly in the board view or via the dedicated add task view.",
        dueDate: dueDateString,
        category: "User Story",
        priority: "urgent",
        assigned: { "0": "0" },
        subtasks: {
            "0": {
                title: "Test creation in board view",
                done: false
            },
            "1": {
                title: "Test creation in add task view",
                done: false
            }
        },
        board: "inProgress",
        createdAt: new Date().getTime()
    },
    "4": {
        title: "Check Summary & Urgent Tasks",
        description: "Monitor critical project metrics in the Summary view, especially checking which urgent tasks are due starting today.",
        dueDate: dueDateString,
        category: "Technical Task",
        priority: "urgent",
        assigned: { "0": "0" },
        board: "awaitFeedback",
        createdAt: new Date().getTime()
    },
    "5": {
        title: "Explore via Guest Login",
        description: "You can also explore the application instantly using the guest login feature without creating a permanent account.",
        dueDate: dueDateString,
        category: "User Story",
        priority: "low",
        assigned: { "0": "0" },
        board: "awaitFeedback",
        createdAt: new Date().getTime()
    }
}

let bool = [0, 0, 0, 0, 0]

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
function validateField(inputId, errMsgId, validateFn, boolIndex, errMsg, shouldCheckAll = true) {
    let input = document.getElementById(inputId);
    let errMsgElem = document.getElementById(errMsgId);
    if (validateFn(input.value)) {
        errMsgElem.innerText = '';
        bool[boolIndex] = 1;
    } else {
        errMsgElem.innerText = errMsg;
        bool[boolIndex] = 0;
    }
    if (shouldCheckAll) { checkAllValidations() };
    return bool[boolIndex];
}

/**
 * Checks all validations and enables/disables the sign up button
 */
function checkAllValidations() {
    let signUpBtn = document.getElementById('signUp');
    let allBoolEqualOne = bool.every(el => el === 1);
    if (allBoolEqualOne) {
        signUpBtn.disabled = false;
        signUpBtn.setAttribute('aria-disabled', 'false');
    } else {
        signUpBtn.disabled = true;
        signUpBtn.setAttribute('aria-disabled', 'true');
    }
}

/**
 * Changes the password icon to visibility_off when user starts typing
 * @param {string} id - The ID of the icon element
 */
function changePasswordIcon(id, website) {
    let containerId = document.getElementById(`${id}`);
    if (containerId.src.endsWith('visibility.png')) {
        return;
    }
    containerId.src = website === 'index' ? './assets/icons/visibility_off.png' : '../assets/icons/visibility_off.png';
    containerId.alt = 'visibility_off icon';
}

/**
 * Toggles password visibility and preserves cursor position
 * @param {string} inputId - The ID of the password input element
 * @param {string} iconId - The ID of the toggle icon element
 * @param {Event} event - The triggering event
 */
function passwordVisible(inputId, iconId, website, event = false) {
    if (event) { event.preventDefault() }
    let input = document.getElementById(`${inputId}`);
    let icon = document.getElementById(`${iconId}`);
    let cursorPosition = input.selectionStart;
    checkIconPathAndSetNewIconAndInputType(icon, input, website);
    setTimeout(() => {
        input.focus();
        input.setSelectionRange(cursorPosition, cursorPosition)
    }, 0);
}

/**
 * Checks icon path and toggles between visibility icons and input types
 * @param {HTMLElement} icon - The icon element
 * @param {HTMLInputElement} input - The password input element
 */
function checkIconPathAndSetNewIconAndInputType(icon, input, website) {
    if (icon.src.endsWith('lock.png')) {
        return
    }
    else if (icon.src.endsWith('visibility_off.png')) {
        icon.src = website === 'index' ? './assets/icons/visibility.png' : '../assets/icons/visibility.png';
        icon.alt = 'visibility icon';
        input.type = 'text';
    } else {
        icon.src = website === 'index' ? './assets/icons/visibility_off.png' : '../assets/icons/visibility_off.png';
        icon.alt = 'visibility_off icon';
        input.type = 'password';
    }
}

/**
 * Adds a new user to the Firebase database and handles success flow
 */
async function addUser() {
    if (bool.every(el => el === 1)) {
        let nextUserId = await calcNextId();
        await putData('/' + nextUserId, setDataForBackendUpload());
        clearAllSignUpInputFields();
        showPopup('popup');
        setTimeout(() => {
            window.location.href = '../index.html?msg=You signed up successfully';
        }, 1500);
    }
}

/**
 * Collects and formats user registration data for backend upload
 * @returns {Object} User data object with name, email, password, contacts, and tasks
 */
function setDataForBackendUpload() {
    let nameRegister = document.getElementById('nameRegister');
    let emailRegister = document.getElementById('emailRegister');
    let passwordRegister = document.getElementById('passwordRegister');
    let formattedName = nameRegister.value.trim().split(' ').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');
    let formattedEmail = emailRegister.value.trim().toLowerCase();
    return {
        name: formattedName,
        email: formattedEmail,
        password: passwordRegister.value,
        contacts: {
            "0": { name: formattedName, email: formattedEmail }
        },
        tasks: firstLoginTasksObject
    };
}

/**
 * Clears all sign up form input fields
 */
function clearAllSignUpInputFields() {
    let nameRegister = document.getElementById('nameRegister');
    let emailRegister = document.getElementById('emailRegister');
    let passwordRegister = document.getElementById('passwordRegister');
    let passwordRegisterConfirm = document.getElementById('passwordRegisterConfirm');
    let signUpBtn = document.getElementById('signUp');
    nameRegister.value = emailRegister.value = passwordRegister.value = passwordRegisterConfirm.value = '';
    signUpBtn.checked = false;
}

/**
 * Handles user login by validating credentials against Firebase database
 * @param {string} path - Optional path parameter (unused)
 */
async function login(path = "") {
    let email = document.getElementById('emailLogin');
    let password = document.getElementById('passwordLogin');
    let response = await fetchData();
    let activeUser = response.findIndex(user =>
        user && user.email && user.password &&
        user.email === email.value && user.password === password.value
    );
    if (activeUser !== -1) {
        saveToLocalStorage(activeUser);
        window.location.href = 'html/summary.html';
    } else {
        document.getElementById('errMsgPassword').style.display = "block";
        document.getElementById('errMsgPassword').innerText = "please double check email and password or not a Join user?";
    }
    email.value = password.value = '';
}

/**
 * Handles guest login by setting default user (ID: 0) and redirecting to summary
 */
function guestLogin() {
    let email = document.getElementById('emailLogin');
    let password = document.getElementById('passwordLogin');
    email.value = password.value = '';
    let activeUser = 0;
    saveToLocalStorage(activeUser)
    window.location.href = 'html/summary.html';
}

/**
 * Animates the logo on first visit with responsive behavior for mobile and desktop
 */
function animateLogoFirstVisit() {
    let logoOverlay = document.getElementById('logoOverlay');
    let logo = document.getElementById('logo');
    let animatedImgMobile = document.getElementById('animatedImgMobile');
    if (window.innerWidth <= 768) {
        logoOverlay.classList.add('animate-out-mobile');
        setTimeout(() => {
            animatedImgMobile.src = './assets/icons/Join_dark.png';
        }, 400);
    } else {
        logoOverlay.classList.add('animate-out');
    }
    setTimeout(() => {
        logoOverlay.style.display = 'none';
        logo.style.opacity = 1;
    }, 800);
}

/**
 * Saves user session data to localStorage
 * @param {number} activeUserId - The ID of the active user
 */
function saveToLocalStorage(activeUserId) {
    localStorage.setItem("activeUserId", JSON.stringify(activeUserId));
    localStorage.setItem("shownGreeting", "false");
}

/**
 * Keyboard event handler for password toggle buttons
 * @param {KeyboardEvent} event - The keyboard event
 * @param {string} inputId - The password input ID
 * @param {string} iconId - The icon element ID
 */
function handlePasswordToggleKeydown(event, inputId, iconId) {
    if (event.key === 'Enter' || event.key === ' ') {
        event.preventDefault();
        passwordVisible(inputId, iconId, website, event);
    }
}