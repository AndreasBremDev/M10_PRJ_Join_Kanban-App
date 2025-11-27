// const BASE_URL = "https://join-kanban-app-14634-default-rtdb.europe-west1.firebasedatabase.app/user";
let firebase = [];

const isNameValid = val => /^[A-Z\-a-zÄÖÜäöüß]+\s[A-Z\-a-zÄÖÜäöüß\p{M}]+$/.test(val);
const isEmailValid = val => /^(?=[a-zA-Z0-9@._%+-]{6,254}$)(?=[a-zA-Z0-9._%+-]{1,64}@)[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/.test(val);
const isPassValid = val => /[A-Z]/.test(val) && /[a-z]/.test(val) && /[0-9]/.test(val) && /[!§$%&\/?\-\+#@]/.test(val) && val.length >= 12;
const isConfirmValid = val => val === document.getElementById('passwordRegister').value;
const isCheckboxValid = () => document.getElementById('checkbox').checked;

let bool = [0, 0, 0, 0, 0]

// #region registration validation

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

function checkAllValidations() {
    let fourOutOfFive = bool[0] === 1 && bool[1] === 1 && bool[2] === 1 && bool[3] === 1;
    if (fourOutOfFive) { validateCheckboxSeperately() };
    let signUpBtn = document.getElementById('signUp');
    let allBoolEqualOne = bool.every(el => el === 1);
    if (allBoolEqualOne) {
        signUpBtn.disabled = false;
        signUpBtn.ariaDisabled = false;
    } else {
        signUpBtn.disabled = true;
        signUpBtn.ariaDisabled = true;
    }
}

function changePasswordIcon(id) {
    let containerId = document.getElementById(`${id}`);
    if (containerId.src.endsWith('visibility.png')) {
        return;
    }
    containerId.src = '../assets/icons/visibility_off.png';
    containerId.alt = 'visibility_off icon';
}

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

async function addUser() {
    let nextUserId = await calcNextId();
    await putData('/' + nextUserId, setDataForBackendUpload());
    clearAllSignUpInputFields();
    showPopup('popup');
    setTimeout(() => {
        window.location.href = '../index.html?msg=You signed up successfully';
    }, 1500);
}

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

function clearAllSignUpInputFields() {
    let nameRegister = document.getElementById('nameRegister');
    let emailRegister = document.getElementById('emailRegister');
    let passwordRegister = document.getElementById('passwordRegister');
    let passwordRegisterConfirm = document.getElementById('passwordRegisterConfirm');
    let signUpBtn = document.getElementById('signUp');

    nameRegister.value = emailRegister.value = passwordRegister.value = passwordRegisterConfirm.value = '';
    signUpBtn.checked = false;
}

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

// #endregion

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

function guestLogin() {
    let email = document.getElementById('emailLogin');
    let password = document.getElementById('passwordLogin');
    email.value = password.value = '';
    let activeUser = 0;
    saveToLocalStorage(activeUser)
    window.location.href = `../html/summary.html`;
}

function animateLogoFirstVisit() {
    let logoOverlay = document.getElementById('logoOverlay');
    let logo = document.getElementById('logo');
    let animatedImg = document.getElementById('animatedImg');
    if (window.innerWidth <= 768) {
        animatedImg.src = './assets/icons/Join_light.png';
        logoOverlay.classList.add('animate-out');
        setTimeout(() => {
            animatedImg.src = './assets/icons/Join_dark.png';
            animatedImg.alt = 'Join Logo Light Animation';
        }, 300);
    }
    setTimeout(() => {
        logoOverlay.style.display = 'none';
        logo.style.opacity = 1;
    }, 800);
}

function saveToLocalStorage(activeUserId) {
    localStorage.setItem("activeUserId", JSON.stringify(activeUserId));
    localStorage.setItem("shownGreeting", "false");
}