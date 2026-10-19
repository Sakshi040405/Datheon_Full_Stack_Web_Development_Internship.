
const STORAGE_KEY = "taskflow-tasks-v1";

let tasks = loadFromLocalStorage();
let currentFilter = "All";

const taskForm = document.getElementById("taskForm");
const taskInput = document.getElementById("taskInput");
const categoryInput = document.getElementById("categoryInput");
const dueDateInput = document.getElementById("dueDateInput");
const taskList = document.getElementById("taskList");
const searchInput = document.getElementById("searchInput");
const emptyState = document.getElementById("emptyState");

document.getElementById("todayDate").textContent =
  new Date().toLocaleDateString("en-IN", {
    weekday: "long", day: "numeric", month: "short", year: "numeric"
  });

function loadFromLocalStorage() {
  try {
    const saved = JSON.parse(localStorage.getItem(STORAGE_KEY) || "[]");
    return Array.isArray(saved) ? saved.filter(task =>
      task && typeof task.id === "string" &&
      typeof task.title === "string" &&
      typeof task.completed === "boolean"
    ) : [];
  } catch {
    return [];
  }
}

function saveToLocalStorage() {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(tasks));
  } catch {
    alert("Could not save tasks. Check your browser storage settings.");
  }
}

function createId() {
  return crypto.randomUUID
    ? crypto.randomUUID()
    : `${Date.now()}-${Math.random().toString(16).slice(2)}`;
}

taskForm.addEventListener("submit", event => {
  event.preventDefault();

  const title = taskInput.value.trim();
  if (!title) return;

  tasks.unshift({
    id: createId(),
    title,
    category: categoryInput.value,
    dueDate: dueDateInput.value,
    completed: false,
    createdAt: new Date().toISOString()
  });

  saveToLocalStorage();
  taskForm.reset();
  renderTasks();
  taskInput.focus();
});

document.querySelectorAll(".filter").forEach(button => {
  button.addEventListener("click", () => {
    currentFilter = button.dataset.filter;

    document.querySelectorAll(".filter").forEach(item => {
      item.classList.toggle("active", item === button);
    });

    renderTasks();
  });
});

searchInput.addEventListener("input", renderTasks);

taskList.addEventListener("change", event => {
  const checkbox = event.target.closest("[data-action='toggle']");
  if (!checkbox) return;

  const task = tasks.find(item => item.id === checkbox.dataset.id);
  if (!task) return;

  task.completed = checkbox.checked;
  saveToLocalStorage();
  renderTasks();
});

taskList.addEventListener("click", event => {
  const button = event.target.closest("button[data-action]");
  if (!button) return;

  const { id, action } = button.dataset;
  const task = tasks.find(item => item.id === id);
  if (!task) return;

  if (action === "delete") {
    if (!confirm(`Delete "${task.title}"?`)) return;
    tasks = tasks.filter(item => item.id !== id);
  }

  if (action === "edit") {
    const updatedTitle = prompt("Edit task name:", task.title);
    if (updatedTitle === null) return;

    const title = updatedTitle.trim();
    if (!title) {
      alert("Task name cannot be empty.");
      return;
    }
    task.title = title;
  }

  saveToLocalStorage();
  renderTasks();
});

function formatDueDate(value) {
  if (!value) return "No due date";

  const [year, month, day] = value.split("-").map(Number);
  const date = new Date(year, month - 1, day);

  return `Due ${date.toLocaleDateString("en-IN", {
    day: "numeric", month: "short", year: "numeric"
  })}`;
}

function escapeHTML(value) {
  return String(value).replace(/[&<>"']/g, char => ({
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    '"': "&quot;",
    "'": "&#39;"
  })[char]);
}

function renderTasks() {
  const query = searchInput.value.trim().toLowerCase();

  const visibleTasks = tasks.filter(task => {
    const matchesFilter =
      currentFilter === "All" ||
      (currentFilter === "Active" && !task.completed) ||
      (currentFilter === "Completed" && task.completed);

    const matchesSearch =
      task.title.toLowerCase().includes(query) ||
      String(task.category || "").toLowerCase().includes(query);

    return matchesFilter && matchesSearch;
  });

  document.getElementById("totalCount").textContent = tasks.length;
  document.getElementById("activeCount").textContent =
    tasks.filter(task => !task.completed).length;
  document.getElementById("completedCount").textContent =
    tasks.filter(task => task.completed).length;

  taskList.innerHTML = visibleTasks.map(task => {
    const overdue = task.dueDate &&
      task.dueDate < localToday() && !task.completed;

    return `
      <article class="task ${task.completed ? "done" : ""}">
        <input
          class="task-check"
          type="checkbox"
          data-action="toggle"
          data-id="${escapeHTML(task.id)}"
          ${task.completed ? "checked" : ""}
          aria-label="Mark ${escapeHTML(task.title)} as complete">

        <div class="task-info">
          <div class="task-name">${escapeHTML(task.title)}</div>
          <div class="task-meta">
            <span class="category">${escapeHTML(task.category || "Other")}</span>
            <span class="due ${overdue ? "overdue" : ""}">
              ${overdue ? "Overdue · " : ""}${escapeHTML(formatDueDate(task.dueDate))}
            </span>
          </div>
        </div>

        <div class="task-actions">
          <button class="action-btn" data-action="edit"
            data-id="${escapeHTML(task.id)}" aria-label="Edit task">Edit</button>
          <button class="action-btn delete-btn" data-action="delete"
            data-id="${escapeHTML(task.id)}" aria-label="Delete task">Delete</button>
        </div>
      </article>
    `;
  }).join("");

  emptyState.hidden = visibleTasks.length > 0;
}

function localToday() {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, "0");
  const day = String(now.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

renderTasks();
