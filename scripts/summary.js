async function init() {
  checkLoggedInPageSecurity()
  await initSummary();
  await eachPageSetcurrentUserInitials();
}

/** get User-Object from realtime Database (REST) */
async function fetchUserData(userId) {
  let url = "https://join-kanban-app-14634-default-rtdb.europe-west1.firebasedatabase.app/user/" + userId + ".json";
  let response = await fetch(url);
  return await response.json();
}

/** checks, if entry Task on board */
function isTaskEntry(entry) {
  return entry && typeof entry === "object" && entry.board;
}

/** extracts Tasks from data.tasks and Top-Level */
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

/** norms Board-String */
function normalizeBoardValue(boardValue) {
  return String(boardValue || "").toLowerCase().replace(/\s|_/g, "");
}

/** norm Date DD.MM.YYYY */
function formatDate(deadlineDate) {
  if (!deadlineDate) return "-";
  return deadlineDate.toLocaleDateString("en-US", { month: "long", day: "2-digit", year: "numeric" });
}

/** checks the nearest Deadline */
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
  let earliest = new Date(Math.min.apply(null, deadlines));
  return earliest;
}

/**
 * Counts all key metrics for the summary cards.
 * Checks each task for its board status, priority, and due date.
 */
function countTasks(tasks) {
  let counts = { todo: 0, inProgress: 0, awaitingFeedback: 0, done: 0, urgent: 0, total: tasks.length, nextDeadline: "-" };
  for (let i = 0; i < tasks.length; i++) {
    let board = normalizeBoardValue(tasks[i].board);
    let priority = String(tasks[i].priority || "").toLowerCase();
    if (board.indexOf("todo") !== -1) counts.todo++;
    else if (board.indexOf("inprogress") !== -1) counts.inProgress++;
    else if (board.indexOf("await") !== -1) counts.awaitingFeedback++;
    else if (board.indexOf("done") !== -1) counts.done++;
    if (priority === "urgent") counts.urgent++;
  }
  let nextDeadline = findNextDeadline(tasks);
  counts.nextDeadline = formatDate(nextDeadline);
  return counts;
}

/** add numbers in cards (.numbers, .urgend_calender) */
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

/** shows login Time and Name */
function getGreetingText(currentDate) {
  let hour = (currentDate || new Date()).getHours();
  if (hour < 12) return "Good morning,";
  if (hour < 18) return "Good afternoon,";
  return "Good evening,";
}

/** writes greeting text */
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

/** Start: loading, counts, rendert */
async function initSummary() {
  try {
    let userData = await fetchUserData(activeUserId);
    if (!userData) return;
    let tasks = extractTasks(userData);
    let taskCounts = countTasks(tasks);
    renderSummaryCounts(taskCounts);
    renderGreeting(userData.name || "Guest User", new Date());
    if (window.innerWidth <= 780) {
      showGreetingOverlay(userData.name || "Guest User");
    }
  } catch (error) {
    console.error("Summary could not be opened:", error);
  }
}

/** shows and fades greeting overlay (mobile only) */
function showGreetingOverlay(userName) {
  if (window.innerWidth > 780) return;
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
}

/** hides overlay if resizes to desktop version*/
function handleResizeOverlay() {
  const overlay = document.getElementById("greeting_overlay");
  if (window.innerWidth > 780 && overlay) {
    overlay.style.display = "none";
    overlay.classList.remove("fade-out");
  }
}

// initSummary();