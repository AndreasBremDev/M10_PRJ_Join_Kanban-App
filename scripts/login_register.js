const BASE_URL = "https://join-kanban-app-14634-default-rtdb.europe-west1.firebasedatabase.app/user";
let firebase = [];

const isNameValid = val => val.trim() !== '';
const isEmailValid = val => /^[^@]+@[^@]+\.[^@]+$/.test(val);
const isPassValid = val => /[A-Z]/.test(val) && /[a-z]/.test(val) && /[0-9]/.test(val) && /[!§$%&\/?\-\+#@]/.test(val) && val.length >= 12;
const isConfirmValid = val => val === document.getElementById('passwordRegister').value;
const isCheckboxValid = () => document.getElementById('checkbox').checked;

let bool = [0, 0, 0, 0, 0]

// #region registration validation

function validateField(inputId, errMsgId, validateFn, boolIndex, errMsg) {
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
    checkAllValidations();
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
    if (fourOutOfFive) { validateCheckboxSeperately()};
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
    await putRegisterData('/' + nextUserId, setDataForBackendUpload());
    clearAllSignUpInputFields();
    showPopup();
    setTimeout(() => {
        window.location.href = '../index.html?msg=You signed up successfully';
    }, 1500);
}

async function calcNextId() {
    let res = await fetch(BASE_URL + ".json");
    let resJson = await res.json();
    let userId = Object.keys(resJson);
    userId.length === 0 ? nextUser = 1 : nextUser = userId.reduce((a, b) => Math.max(a, b), -Infinity) + 1;
    return nextUser;
}

function setDataForBackendUpload() {
    let nameRegister = document.getElementById('nameRegister');
    let emailRegister = document.getElementById('emailRegister');
    let passwordRegister = document.getElementById('passwordRegister');
    let data = {
        name: nameRegister.value,
        email: emailRegister.value,
        password: passwordRegister.value
    };
    return data;
}

async function putRegisterData(path = "", data = {}) {
    let response = await fetch(BASE_URL + path + ".json", {
        method: "put",
        header: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
    });
    return responseToJson = await response.json();
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

// #endregion

function showPopup() {
    const popup = document.getElementById('popup');
    popup.style.display = 'block';
    popup.classList.add('show');
    setTimeout(function () {
        popup.classList.remove('show');
        setTimeout(() => {
            popup.style.display = 'none';
        }, 500);
    }, 1000);
}
