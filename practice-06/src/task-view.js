const PRIORITY_LABELS = {
  low: "Низкий",
  medium: "Средний",
  high: "Высокий",
};

function createAction(action, label) {
  const button = document.createElement("button");
  button.type = "button";
  button.dataset.action = action;
  const text = document.createElement("span");
  text.className = "action-label";
  text.textContent = label;
  button.append(text);
  return button;
}

export function createTaskElement(task, category) {
  const card = document.createElement("li");
  card.classList.add("task-card");
  card.classList.toggle("is-completed", task.completed);
  card.dataset.taskId = task.id;

  const title = document.createElement("h3");
  title.className = "task-title";
  title.textContent = task.title;

  const status = document.createElement("span");
  status.className = "task-status";
  status.textContent = task.completed ? "Выполнена" : "В работе";

  const priority = document.createElement("span");
  priority.className = "task-priority";
  priority.textContent = PRIORITY_LABELS[task.priority];

  const categoryName = document.createElement("span");
  categoryName.className = "task-category";
  categoryName.textContent = category?.name ?? "Неизвестная категория";

  const meta = document.createElement("div");
  meta.className = "task-meta";
  meta.append(status, priority, categoryName);

  const toggle = createAction("toggle", "Выполнена");
  toggle.setAttribute("aria-pressed", String(task.completed));
  const actions = document.createElement("div");
  actions.className = "task-actions";
  actions.append(toggle, createAction("edit", "Изменить"), createAction("delete", "Удалить"));

  card.append(title, meta, actions);
  return card;
}

export function renderTaskList(list, tasks, categories) {
  const cards = tasks.map((task) => {
    const category = categories.find((item) => item.id === task.categoryId);
    return createTaskElement(task, category);
  });
  list.replaceChildren(...cards);
}
