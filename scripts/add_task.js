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