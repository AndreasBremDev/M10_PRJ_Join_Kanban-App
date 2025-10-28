const BASE_URL = "https://join-kanban-app-14634-default-rtdb.europe-west1.firebasedatabase.app/user";
let firebase = [];
let bool = [0, 0, 0, 0, 0]


function validateName() {
    let nameRegister = document.getElementById('nameRegister');
    let errMsgName = document.getElementById('errMsgName');
    if (nameRegister.value.trim() !== '') {
        errMsgName.style.display = 'none';
        bool[0] = 1;
    } else {
        errMsgName.style.display = 'block';
        errMsgName.innerText = 'Spaces " " only are not allowed, please update';
        bool[0] = 0;
    }
    checkAllValidations();
    return bool[0];
}

function validateEmail() {
    let emailRegister = document.getElementById('emailRegister');
    let errMsgEmail = document.getElementById('errMsgEmail')
    const emailRegex = /^[^@]+@[^@]+\.[^@]+$/;
    if (emailRegex.test(emailRegister.value)) {
        errMsgEmail.style.display = 'none';
        bool[1] = 1;
    } else {
        errMsgEmail.style.display = 'block';
        errMsgEmail.innerText = 'Email format is wrong, please update';
        bool[1] = 0;
    }
    checkAllValidations();
    return bool[1];
}

function validatePassword() {
    let passwordRegister = document.getElementById('passwordRegister');
    let errMsgPassword = document.getElementById('errMsgPassword')
    const passRegex1 = /[A-Z]/;
    const passRegex2 = /[a-z]/;
    const passRegex3 = /[0-9]/;
    const passRegex4 = /[!§$%&\/?\-\+#@]/;
    if (passRegex1.test(passwordRegister.value) && passRegex2.test(passwordRegister.value) && passRegex3.test(passwordRegister.value) && passRegex4.test(passwordRegister.value) && passwordRegister.value.length >= 12) {
        errMsgPassword.style.display = 'none';
        bool[2] = 1;
    } else {
        errMsgPassword.style.display = 'block';
        errMsgPassword.innerText = '12 characters, [A-Z], [a-z], [0-9], one special [!§$%&/?-+#@]'
        bool[2] = 0;
    }
    checkAllValidations();
    return bool[2]
}

function validatePasswordConfirm() {
    let passwordRegister = document.getElementById('passwordRegister');
    let passwordRegisterConfirm = document.getElementById('passwordRegisterConfirm');
    let errMsgPasswordConfirm = document.getElementById('errMsgPasswordConfirm');
    if (passwordRegister.value === passwordRegisterConfirm.value) {
        errMsgPasswordConfirm.style.display = 'none';
        bool[3] = 1;
    } else {
        errMsgPasswordConfirm.style.display = 'block';
        errMsgPasswordConfirm.innerText = 'Passwords are not equal. Please double check'
        bool[3] = 0;
    }
    validateCheckbox();
    checkAllValidations();
    return bool[3]
}

function validateCheckbox() {
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
    checkAllValidations();
    return bool[4]
}

function checkAllValidations() {
    let signUpBtn = document.getElementById('signUp');
    let allBoolEqualOne = bool.every(el => el === 1);
    if (allBoolEqualOne) {
        signUpBtn.disabled = false;
    } else {
        signUpBtn.disabled = true;
    }
}

async function addUser() {
    await putRegisterData('/2', setDataForBackendUpload());
    clearAllSignUpInputFields();
    showPopup();
    setTimeout(() => {
        window.location.href = '../index.html?msg=You signed up successfully';
    }, 2000);
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

function clearAllSignUpInputFields() {
    let nameRegister = document.getElementById('nameRegister');
    let emailRegister = document.getElementById('emailRegister');
    let passwordRegister = document.getElementById('passwordRegister');
    let passwordRegisterConfirm = document.getElementById('passwordRegisterConfirm');
    let signUpBtn = document.getElementById('signUp');

    nameRegister.value = emailRegister.value = passwordRegister.value = passwordRegisterConfirm.value = '';
    signUpBtn.checked = false;
}

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

getGuestUserData();

async function getGuestUserData() {
    try {
        let res = await fetch(BASE_URL + ".json");
        let resToJson = await res.json();
        firebase.push(resToJson);
        console.log(firebase);
        return firebase
    } catch (error) {

    }
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


let users = [];

testUploadUser();

async function testUploadUser() {
    let userResponse = await getAllUsers('namen');
    console.log(userResponse);

    let userKeyArray = Object.keys(userResponse)

    for (let i = 0; i < userKeyArray.length; i++) {
        users.push(
            {
                id: userKeyArray[i],
                user: userResponse[userKeyArray[i]]
            }
        )
    }
    console.log(users);
    await addEditSingleUser();
    await addContacts();
}

async function getAllUsers(path) {
    let response = await fetch('https://remotestorage-8c4dc-default-rtdb.europe-west1.firebasedatabase.app/' + path + ".json");
    return responseToJson = await response.json();
}

async function addEditSingleUser(id = 55, user = { name: 'Juliano', email: 'juliano@test.com', password: 'test1234', contacts: '', tasks: '' }) {
    putData(`namen/${id}`, user);
}

async function addContacts(id = 55, contactNo = 1, data = { name: 'Ivan Hoe' }) {
    putData(`namen/${id}/tasks/${contactNo}`, data)
}

async function putData(path = "", data = {}) {
    let response = await fetch('https://remotestorage-8c4dc-default-rtdb.europe-west1.firebasedatabase.app/' + path + ".json", {
        method: "put",
        header: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
    });
    return responseToJson = await response.json();
}
