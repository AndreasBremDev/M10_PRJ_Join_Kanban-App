function init() {
    setActivateBtn();
    setupFormButtons();
    setupPriorityButtons();
}

/* Set active priority button*/
function setActivateBtn() {
    document.querySelectorAll(".priority-btn").forEach(btn => {
        btn.addEventListener("click", () => {
            document.querySelectorAll(".priority-btn").forEach(b => b.classList.remove("active"));
            btn.classList.add("active");
        });
    });
}

/** Setup form buttons */
function setupFormButtons() {
    let createBtn = document.getElementById("create-btn");
    let clearBtn = document.getElementById("clear-btn");

    createBtn.addEventListener("click", handleCreateTask);
    clearBtn.addEventListener("click", clearForm);
}

/** Setup priority buttons */
function setupPriorityButtons() {
    let buttons = document.querySelectorAll(".priority-btn");
    buttons.forEach(button => {
        button.addEventListener("click", () => {
            buttons.forEach(btn => btn.classList.remove("active"));
            button.classList.add("active");
        });
    });
}

/** Handle create task */
async function handleCreateTask() {
    let title = document.getElementById("title").value.trim();
    let description = document.getElementById("description").value.trim();
    let dueDate = document.getElementById("due-date").value;
    let category = document.getElementById("category").value;
    let assigned = document.getElementById("assigned").value;
    let subtask = document.getElementById("subtask").value.trim();
    let activePriority = document.querySelector(".priority-btn.active");
    let priority = activePriority ? activePriority.classList[1] : "medium";

    if (!title || !dueDate || !category) {
        alert("Please fill in all required fields.");
        return;
    }

    /**have to change, just testing */
    let activeUserId = 3;

    let newTask = {
        title,
        description,
        dueDate,
        category,
        assigned,
        priority,
        subtasks: subtask ? [subtask] : [],
        createdAt: new Date().toISOString()
    }

    console.log("New Task Created:", newTask);

    try {
        let taskPath = `user/${activeUserId}/tasks`;
        let nextTaskId = await calcNextId(taskPath);
        await putData(`${taskPath}/${nextTaskId}`, newTask);
        clearForm();
    } catch (error) {
        console.error("Error creating task:", error);
    }

}

/** Clear form */
function clearForm() {
    document.getElementById("task-form").reset();
    document.querySelectorAll(".priority-btn").forEach(btn => btn.classList.remove("active"));
    document.querySelector(".priority-btn.medium").classList.add("active");
}


let BASE_URL = "https://join-kanban-app-14634-default-rtdb.europe-west1.firebasedatabase.app/";

/** Post data to backend */
async function putData(path = "", data = {}) {
    try {
        let response = await fetch(BASE_URL + path + ".json", {
            method: "PUT",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify(data)
        });
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
    } catch (error) {
        console.error("Error posting data:", error);
        throw error;
    }

}

function toggleDropDownMenu() {
    let userMenu = document.getElementById('user-menu');
    userMenu.classList.toggle('show');
    document.addEventListener('click', function (event) {
        let userMenu = document.getElementById('user-menu');
        let userCircle = document.querySelector('.user-circle');
        if (!userCircle.contains(event.target) && !userMenu.contains(event.target)) {
            userMenu.classList.remove('show');
        }
    });
}



/** function to calculate the next taskId */
async function calcNextId(path) {
    let res = await fetch(`${BASE_URL}${path}.json`);
    let resJson = await res.json();

    if (!resJson) return 1;

    let keys = Object.keys(resJson).map(Number);
    let nextId = Math.max(...keys) + 1;
    return nextId;
}
