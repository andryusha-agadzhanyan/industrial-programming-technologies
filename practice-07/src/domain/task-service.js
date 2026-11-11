const ALLOWED_PRIORITIES = new Set(["low", "medium", "high"]);

export function validateTaskDraft(draft, categories) {
  const title = typeof draft.title === "string" ? draft.title.trim() : "";
  const priority = draft.priority;
  const rawCategory = draft.categoryId;
  const categoryId = typeof rawCategory === "number" || typeof rawCategory === "string"
    ? Number(rawCategory)
    : NaN;

  const errors = {};
  if (!title || title.length > 100) {
    errors.title = "Введите название длиной от 1 до 100 символов.";
  }
  if (!ALLOWED_PRIORITIES.has(priority)) {
    errors.priority = "Выберите допустимый приоритет.";
  }
  if (!Number.isSafeInteger(categoryId) || categoryId <= 0
      || !categories.some((category) => category.id === categoryId)) {
    errors.categoryId = "Выберите категорию из списка.";
  }
  return {
    valid: Object.keys(errors).length === 0,
    value: { title, priority, categoryId },
    errors,
  };
}

export function selectTasks(tasks, filters) {
  const query = filters.q.trim().toLowerCase();
  const categoryId = Number(filters.categoryId);

  return tasks.filter((task) => {
    if (query && !task.title.toLowerCase().includes(query)) return false;
    if (filters.completed === "true" && !task.completed) return false;
    if (filters.completed === "false" && task.completed) return false;
    if (filters.priority && task.priority !== filters.priority) return false;
    if (filters.categoryId && task.categoryId !== categoryId) return false;
    return true;
  });
}

export function getTaskStats(tasks) {
  const total = tasks.length;
  const completed = tasks.filter((task) => task.completed).length;
  return { total, completed, active: total - completed };
}

export function addTask(tasks, value, id) {
  if (!Number.isSafeInteger(id) || id <= 0 || tasks.some((task) => task.id === id)) {
    throw new Error("Для новой задачи нужен свободный положительный id.");
  }
  const { title, priority, categoryId } = value;
  return [...tasks, { id, title, priority, categoryId, completed: false }];
}

export function updateTask(tasks, id, value) {
  const { title, priority, categoryId } = value;
  return tasks.map((task) => (
    task.id === id ? { ...task, title, priority, categoryId } : task
  ));
}

export function toggleTask(tasks, id) {
  return tasks.map((task) => (
    task.id === id ? { ...task, completed: !task.completed } : task
  ));
}

export function removeTask(tasks, id) {
  return tasks.filter((task) => task.id !== id);
}
