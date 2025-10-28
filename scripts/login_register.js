const BASE_URL = "https://join-kanban-app-14634-default-rtdb.europe-west1.firebasedatabase.app/user";
let firebase = [];

function addUser(){
    let email = document.getElementById('email');
    let password = document.getElementById('password');

}

getGuestUserData();

async function getGuestUserData(){
    try {
        let res = await fetch(BASE_URL + ".json");
        let resToJson = await res.json();
        firebase.push(resToJson);
        console.log(firebase);  
        return firebase
    } catch (error) {
        
    }
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

async function getAllUsers(path){
    let response = await fetch('https://remotestorage-8c4dc-default-rtdb.europe-west1.firebasedatabase.app/' + path + ".json");
    return responseToJson = await response.json();
}

async function addEditSingleUser(id = 55, user = { name: 'Juliano',email: 'juliano@test.com', password: 'test1234', contacts: '', tasks: ''}) {
    putData(`namen/${id}`, user);
}

async function addContacts(id = 55, contactNo = 1, data = {name : 'Ivan Hoe'}) {
    putData(`namen/${id}/contacts/${contactNo}`, data)
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
