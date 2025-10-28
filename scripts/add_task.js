function init () {
    setActivateBtn();
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