let firebase = [];

/** Validates full name format (first name space last name with Unicode support) */
const isNameValid = val => /^[A-Z\-a-zÄÖÜäöüß]+\s[A-Z\-a-zÄÖÜäöüß\p{M}]+$/.test(val);
/** Validates email address format with length constraints */
const isEmailValid = val => /^(?=[a-zA-Z0-9@._%+-]{6,254}$)(?=[a-zA-Z0-9._%+-]{1,64}@)[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/.test(val);
/** Validates password strength (uppercase, lowercase, number, special char, min 12 chars) */
const isPassValid = val => /[A-Z]/.test(val) && /[a-z]/.test(val) && /[0-9]/.test(val) && /[!§$%&\/\?\-\+#@]/.test(val) && val.length >= 12;
/** Validates password confirmation matches original password */
const isConfirmValid = val => val === document.getElementById('passwordRegister').value;
/** Validates checkbox is checked */
const isCheckboxValid = () => document.getElementById('checkbox').checked;

let bool = [0, 0, 0, 0, 0]

// #region registration validation

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

/**
 * Validates the privacy policy checkbox separately
 * @returns {number} The validation result (0 or 1)
 */
function validateCheckboxSeperately() {
    let checkbox = document.getElementById('checkbox');
    let errMsgCheckbox = document.getElementById('errMsgCheckbox');
    if (!checkbox.checked) {
        errMsgCheckbox.style.display = 'block';
        errMsgCheckbox.innerText = 'Please accept the privacy policy to continue';
        bool[4] = 0;
    } else {
        errMsgCheckbox.style.display = 'none';
        bool[4] = 1;
    }
    return bool[4]
}

/**
 * Checks all validations and enables/disables the sign up button
 */
function checkAllValidations() {
    let fourOutOfFive = bool[0] === 1 && bool[1] === 1 && bool[2] === 1 && bool[3] === 1;
    if (fourOutOfFive) { validateCheckboxSeperately() };
    let signUpBtn = document.getElementById('signUp');
    let allBoolEqualOne = bool.every(el => el === 1);
    if (allBoolEqualOne) {
        signUpBtn.disabled = false;
        signUpBtn.ariaDisabled = false;
        signUpBtn.tabIndex = '1';
        signUpBtn.focus();
    } else {
        signUpBtn.disabled = true;
        signUpBtn.ariaDisabled = true;
    }
}

/**
 * Changes the password icon to visibility_off when user starts typing
 * @param {string} id - The ID of the icon element
 */
function changePasswordIcon(id) {
    let containerId = document.getElementById(`${id}`);
    if (containerId.src.endsWith('visibility.png')) {
        return;
    }
    containerId.src = '../assets/icons/visibility_off.png';
    containerId.alt = 'visibility_off icon';
}

/**
 * Toggles password visibility and preserves cursor position
 * @param {string} inputId - The ID of the password input element
 * @param {string} iconId - The ID of the toggle icon element
 * @param {Event} event - The triggering event
 */
function passwordVisible(inputId, iconId, event) {
    if (event) { event.preventDefault() }
    let input = document.getElementById(`${inputId}`);
    let icon = document.getElementById(`${iconId}`);
    let cursorPosition = input.selectionStart;
    checkIconPathAndSetNewIconAndInputType(icon, input);
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
function checkIconPathAndSetNewIconAndInputType(icon, input) {
    if (icon.src.endsWith('lock.png')) {
        return
    }
    else if (icon.src.endsWith('visibility_off.png')) {
        icon.src = '../assets/icons/visibility.png';
        icon.alt = 'visibility icon';
        input.type = 'text';
    } else {
        icon.src = '../assets/icons/visibility_off.png';
        icon.alt = 'visibility_off icon';
        input.type = 'password';
    }
}

// #endregion

// #region registration -> add New User to firebase DB

/**
 * Adds a new user to the Firebase database and handles success flow
 */
async function addUser() {
    let nextUserId = await calcNextId();
    await putData('/' + nextUserId, setDataForBackendUpload());
    clearAllSignUpInputFields();
    showPopup('popup');
    setTimeout(() => {
        window.location.href = '../index.html?msg=You signed up successfully';
    }, 1500);
}

/**
 * Collects and formats user registration data for backend upload
 * @returns {Object} User data object with name, email, password, contacts, and tasks
 */
function setDataForBackendUpload() {
    let nameRegister = document.getElementById('nameRegister');
    let emailRegister = document.getElementById('emailRegister');
    let passwordRegister = document.getElementById('passwordRegister');
    let data = {
        name: nameRegister.value.trim().split(' ').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' '),
        email: emailRegister.value.trim().toLowerCase(),
        password: passwordRegister.value,
        contacts: {
            "0": {
                name: nameRegister.value.trim().split(' ').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' '),
                email: emailRegister.value.trim().toLowerCase(),
            }
        },
        tasks: ""
    };
    return data;
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

// #endregion

/**
 * Handles user login by validating credentials against Firebase database
 * @param {string} path - Optional path parameter (unused)
 */
async function login(path = "") {
    let email = document.getElementById('emailLogin');
    let password = document.getElementById('passwordLogin');
    let response = await fetchData();
    let activeUser = response.findIndex(user => user.email === email.value && user.password === password.value);
    if (activeUser !== -1) {
        saveToLocalStorage(activeUser);
        window.location.href = `../html/summary.html`;
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
    window.location.href = `../html/summary.html`;
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
        passwordVisible(inputId, iconId, event);
    }
}