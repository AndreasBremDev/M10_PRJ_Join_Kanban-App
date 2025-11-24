let shownGreeting = loadShownGreeting();

async function init() {
  checkLoggedInPageSecurity();
  const overlay = document.getElementById("greeting_overlay");

  if (window.innerWidth <= 780 && !loadShownGreeting()) {
    overlay.style.display = "flex";
    overlay.style.opacity = "1";
  } else {
    overlay.style.display = "none";
  }

  await initSummary();
  await eachPageSetCurrentUserInitials();
}

function isTaskEntry(entry) {
  return entry && typeof entry === "object" && entry.board;
}

function extractTasks(userData) {
  let tasks = [];
  if (userData && userData.tasks && typeof userData.tasks === "object") {
    for (let taskId in userData.tasks) {
      let task = userData.tasks[taskId];
      if (isTaskEntry(task)) tasks.push(task);
    }
  }
  for (let key in userData) {
    if (key !== "tasks" && isTaskEntry(userData[key])) tasks.push(userData[key]);
  }
  return tasks;
}

function normalizeBoardValue(boardValue) {
  return String(boardValue || "").toLowerCase().replace(/\s|_/g, "");
}

function formatDate(deadlineDate) {
  if (!deadlineDate) return "-";
  return deadlineDate.toLocaleDateString("en-US", { month: "long", day: "2-digit", year: "numeric" });
}

function findNextDeadline(tasks) {
  let deadlines = [];
  for (let i = 0; i < tasks.length; i++) {
    let task = tasks[i];
    if (task.dueDate) {
      let dueDate = new Date(task.dueDate);
      if (!isNaN(dueDate)) deadlines.push(dueDate);
    }
  }
  if (deadlines.length === 0) return null;
  return new Date(Math.min.apply(null, deadlines));
}

function countTasks(tasks) {
  let counts = { todo: 0, inProgress: 0, awaitingFeedback: 0, done: 0, urgent: 0, total: tasks.length, nextDeadline: "-" };
  for (let i = 0; i < tasks.length; i++) {
    let board = normalizeBoardValue(tasks[i].board);
    let priority = String(tasks[i].priority || "").toLowerCase();

    if (board.includes("todo")) counts.todo++;
    else if (board.includes("inprogress")) counts.inProgress++;
    else if (board.includes("await")) counts.awaitingFeedback++;
    else if (board.includes("done")) counts.done++;

    if (priority === "urgent") counts.urgent++;
  }
  counts.nextDeadline = formatDate(findNextDeadline(tasks));
  return counts;
}

function renderSummaryCounts(taskCounts) {
  let numberFields = document.getElementsByClassName("numbers");

  if (numberFields[0]) numberFields[0].innerText = taskCounts.todo;
  if (numberFields[1]) numberFields[1].innerText = taskCounts.done;
  if (numberFields[2]) numberFields[2].innerText = taskCounts.urgent;
  if (numberFields[3]) numberFields[3].innerText = taskCounts.total;
  if (numberFields[4]) numberFields[4].innerText = taskCounts.inProgress;
  if (numberFields[5]) numberFields[5].innerText = taskCounts.awaitingFeedback;

  let deadlineField = document.getElementsByClassName("urgend_calender")[0];
  if (deadlineField) deadlineField.innerText = taskCounts.nextDeadline;
}

function getGreetingText(currentDate) {
  let hour = (currentDate || new Date()).getHours();
  if (hour < 12) return "Good morning,";
  if (hour < 18) return "Good afternoon,";
  return "Good evening,";
}

function renderGreeting(userName, currentDate) {
  const greetingText = document.getElementById("greeting_text");
  const greetingName = document.getElementById("greeting_name");
  if (!greetingText || !greetingName) return;

  const baseGreeting = getGreetingText(currentDate);

  if (!userName || userName.toLowerCase() === "guest user") {
    greetingText.innerText = baseGreeting.replace(",", "!");
    greetingName.style.display = "none";
  } else {
    greetingText.innerText = baseGreeting;
    greetingName.style.display = "block";
    greetingName.innerText = userName;
  }
}

async function initSummary() {
  try {
    let userData = await fetchData(`/${activeUserId}`);
    if (!userData) return;

    let tasks = extractTasks(userData);
    let taskCounts = countTasks(tasks);

    renderSummaryCounts(taskCounts);
    renderGreeting(userData.name || "Guest User", new Date());
    shownGreeting = loadShownGreeting();
    document.getElementById("greeting_overlay").style.display = "none";

    if (window.innerWidth <= 780 && !shownGreeting) {
      showGreetingOverlay(userData.name || "Guest User");
    }

  } catch (error) {
    console.error("Summary could not be opened:", error);
  }
}

function showGreetingOverlay(userName) {
  if (window.innerWidth > 780 || shownGreeting) return;

  const overlay = document.getElementById("greeting_overlay");
  const text = document.getElementById("overlay_greeting_text");
  const name = document.getElementById("overlay_greeting_name");
  if (!overlay || !text || !name) {
    console.error("Overlay elements not found");
    return;
  }
  overlay.style.display = "flex";
  overlay.classList.remove("fade-out");

  const greeting = getGreetingText(new Date());
  if (!userName || userName.toLowerCase() === "guest user") {
    text.innerText = greeting.replace(",", "!");
    name.style.display = "none";
  } else {
    text.innerText = greeting;
    name.innerText = userName;
    name.style.display = "block";
  }
  setTimeout(() => overlay.classList.add("fade-out"), 1200);
  setTimeout(() => {
    overlay.style.display = "none";
    overlay.classList.remove("fade-out");
  }, 2000);
  shownGreeting = true;
  localStorage.setItem("shownGreeting", "true");
}

function handleResizeOverlay() {
  const overlay = document.getElementById("greeting_overlay");
  if (window.innerWidth > 780 && overlay) {
    overlay.style.display = "none";
    overlay.classList.remove("fade-out");
  }
}