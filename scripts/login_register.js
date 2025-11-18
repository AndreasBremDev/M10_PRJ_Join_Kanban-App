// const BASE_URL = "https://join-kanban-app-14634-default-rtdb.europe-west1.firebasedatabase.app/user";
let firebase = [];

const isNameValid = val => /^[A-Za-z]+\s[A-Za-z]+$/.test(val);
const isEmailValid = val => /^[^@]+@[^@]+\.[^@]+$/.test(val);
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
        name: nameRegister.value.trim(),
        email: emailRegister.value.trim().toLowerCase(),
        password: passwordRegister.value,
        contacts: "",
        tasks: ""
    };
    return data;
}

async function putData(path = "", data = {}) {
    let response = await fetch(BASE_URL + path + ".json", {
        method: "PUT",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
    });
    return await response.json();
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
    popup.classList.add('show');
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
    let response = await fetchUserData();
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

async function fetchUserData() {
    try {
        let res = await fetch(BASE_URL + ".json");
        let response = await res.json();
        return response;
    } catch (error) {
        console.log(`error in login(): `, error);
    }
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

    if (window.innerWidth > 768) {
        logoOverlay.classList.add('animate-out');
        setTimeout(() => {
            logoOverlay.style.display = 'none';
            logo.style.opacity = 1;
        }, 1500);
    } else {
        logoOverlay.style.display = 'none';
        logo.style.opacity = 1;
    }
}

function saveToLocalStorage(activeUserId) {
    localStorage.setItem("activeUserId", JSON.stringify(activeUserId));
}