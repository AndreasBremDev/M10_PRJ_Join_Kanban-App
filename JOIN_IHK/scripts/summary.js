let shownGreeting = loadShownGreeting();

/**
 * Initializes the summary page by checking security, handling greeting overlay,
 * and loading summary data and user initials
 */
async function init() {
  checkLoggedInPageSecurity();
  initNavKeyboardSupport();
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

/**
 * Checks if an entry is a valid task object
 * @param {*} entry - The entry to validate
 * @returns {boolean} True if entry is a valid task object with a board property
 */
function isTaskEntry(entry) {
  return entry && typeof entry === "object" && entry.board;
}

/**
 * Extracts valid task objects from user data
 * @param {Object} userData - The user data containing tasks
 * @returns {Array} Array of valid task objects
 */
function extractTasks(userData) {
  let tasks = [];
  if (userData && userData.tasks && typeof userData.tasks === "object") {
    for (let taskId in userData.tasks) {
      let task = userData.tasks[taskId];
      if (isTaskEntry(task)) tasks.push(task);
    }
  }
  return tasks;
}

/**
 * Normalizes board values by converting to lowercase and removing spaces/underscores
 * @param {string} boardValue - The board value to normalize
 * @returns {string} Normalized board value
 */
function normalizeBoardValue(boardValue) {
  return String(boardValue || "").toLowerCase().replace(/\s|_/g, "");
}

/**
 * Formats a date object to a readable string format
 * @param {Date} deadlineDate - The date to format
 * @returns {string} Formatted date string or '-' if no date provided
 */
function formatDate(deadlineDate) {
  if (!deadlineDate) return "-";
  return deadlineDate.toLocaleDateString("en-US", { month: "long", day: "2-digit", year: "numeric" });
}

/**
 * Finds the next upcoming deadline from urgent tasks
 * @param {Array} tasks - Array of task objects
 * @returns {Date|null} The next deadline date or null if none found
 */
function findNextDeadline(tasks) {
  let today = new Date();
  today.setHours(0, 0, 0, 0);
  let urgentTasks = urgentTasksFilter(tasks);
  if (urgentTasks.length === 0) return null;
  let deadlines = [];
  for (let task of urgentTasks) {
    let due = new Date(task.dueDate);
    if (isNaN(due)) continue;
    due.setHours(0, 0, 0, 0);
    if (due >= today) deadlines.push(due);
  }
  return deadlines.length ? new Date(Math.min(...deadlines)) : null;
}

/**
 * Filters tasks to return only urgent tasks that are not completed and have a due date
 * @param {Array} tasks - Array of task objects to filter
 * @returns {Array} Array of urgent tasks that are not done and have due dates
 */
function urgentTasksFilter(tasks) {
  return tasks.filter(t => {
    const priority = String(t.priority || "").toLowerCase();
    const board = normalizeBoardValue(t.board);
    return (
      priority === "urgent" && !board.includes("done") && t.dueDate
    );
  });
}

/**
 * Counts tasks by category and calculates next deadline
 * @param {Array} tasks - Array of task objects
 * @returns {Object} Object containing task counts and next deadline
 */
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

/**
 * Renders task counts to the DOM elements
 * @param {Object} taskCounts - Object containing task counts and deadline
 */
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

/**
 * Returns appropriate greeting text based on time of day
 * @param {Date} currentDate - The current date (optional, defaults to new Date())
 * @returns {string} Time-appropriate greeting text
 */
function getGreetingText(currentDate) {
  let hour = (currentDate || new Date()).getHours();
  if (hour < 12) return "Good morning,";
  if (hour < 18) return "Good afternoon,";
  return "Good evening,";
}

/**
 * Renders personalized greeting message to DOM
 * @param {string} userName - The user's name
 * @param {Date} currentDate - The current date for time-based greeting
 */
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

/**
 * Initializes the summary dashboard by fetching user data,
 * processing tasks, and rendering summary information
 */
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

/**
 * Shows personalized greeting overlay on mobile devices with fade animation
 * @param {string} userName - The user's name for personalized greeting
 */
function showGreetingOverlay(userName) {
  if (window.innerWidth > 780 || shownGreeting) return;
  const overlay = document.getElementById("greeting_overlay");
  const text = document.getElementById("overlay_greeting_text");
  const name = document.getElementById("overlay_greeting_name");
  if (!overlay || !text || !name) {
    console.error("Overlay elements not found");
    return;
  }
  displayGreeting(overlay, userName, text, name);
  setTimeout(() => overlay.classList.add("fade-out"), 1200);
  setTimeout(() => {
    overlay.style.display = "none";
    overlay.classList.remove("fade-out");
  }, 2000);
  shownGreeting = true;
  localStorage.setItem("shownGreeting", "true");
}

/**
 * Displays personalized greeting in the overlay with time-appropriate message
 * Shows overlay, removes fade effects, and sets greeting text based on user name
 * @param {HTMLElement} overlay - The overlay element to display
 * @param {string} userName - The user's name for personalization
 * @param {HTMLElement} text - The DOM element for greeting text
 * @param {HTMLElement} name - The DOM element for displaying user name
 */
function displayGreeting(overlay, userName, text, name) {
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
}

/**
 * Handles window resize events for the greeting overlay
 * Hides overlay on desktop view (> 780px width)
 */
function handleResizeOverlay() {
  const overlay = document.getElementById("greeting_overlay");
  if (window.innerWidth > 780 && overlay) {
    overlay.style.display = "none";
    overlay.classList.remove("fade-out");
  }
}

/**
 * Keyboard event handler for summary page links
 * @param {KeyboardEvent} event - The keyboard event
 * @param {string} url - The URL to navigate to
 */
function handleSummaryLinkKeydown(event, url) {
  if (event.key === 'Enter' || event.key === ' ') {
    event.preventDefault();
    window.location.href = url;
  }
}