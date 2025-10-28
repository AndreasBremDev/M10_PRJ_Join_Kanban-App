function init() {
    setActivateBtn();
    setupFormButtons();
    setupPriorityButtons();
}


function setActivateBtn() {
    document.querySelectorAll(".priority-btn").forEach(btn => {
        btn.addEventListener("click", () => {
            document.querySelectorAll(".priority-btn").forEach(b => b.classList.remove("active"));
            btn.classList.add("active");
        });
    });
}

function setupFormButtons() {
    let createBtn = document.getElementById("create-btn");
    let clearBtn = document.getElementById("clear-btn");

    createBtn.addEventListener("click", handleCreateTask);
    clearBtn.addEventListener("click", clearForm);
}

function setupPriorityButtons() {
    let buttons = document.querySelectorAll(".priority-btn");
    buttons.forEach(button => {
        button.addEventListener("click", () => {
            buttons.forEach(btn => btn.classList.remove("active"));
            button.classList.add("active");
        });
    });
}

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
        let reuslt = await postData("tasks", newTask);
        console.log("Task successfully posted:", reuslt);

        clearForm();
    } catch (error) {
        console.error("Error creating task:", error);
    }

}

function clearForm() {
    document.getElementById("task-form").reset();
    document.querySelectorAll(".priority-btn").forEach(btn => btn.classList.remove("active"));
    document.querySelector(".priority-btn.medium").classList.add("active");
}


const BASE_URL = "https://join-b68c5-default-rtdb.europe-west1.firebasedatabase.app/";

async function postData(path = "", data = {}) {
    try {
        let response = await fetch(BASE_URL + path + ".json", {
            method: "POST",
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