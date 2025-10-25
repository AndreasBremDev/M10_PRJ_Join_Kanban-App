const BASE_URL = "https://join-kanban-app-14634-default-rtdb.europe-west1.firebasedatabase.app/user/1";
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