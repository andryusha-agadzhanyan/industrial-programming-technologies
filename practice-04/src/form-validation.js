import { findTaskById } from "./task-service.js";

const ALLOWED_PRIORITIES = new Set(["low", "medium", "high"]);

export function validateTaskDraft(draft, tasks, editingId = null) {
  const creating = editingId === null;
  const rawId = draft.id;
  let id = editingId;
  if (creating) {
    id = typeof rawId === "number" || typeof rawId === "string" ? Number(rawId) : NaN;
  }

  const errors = {};
  if (!Number.isSafeInteger(id) || id <= 0) {
    errors.id = "Введите положительное целое число в допустимом диапазоне.";
  } else {
    const task = findTaskById(tasks, id);
    if (creating && task) errors.id = "Задача с таким id уже существует.";
    if (!creating && !task) errors.id = "Задача не найдена.";
  }

  const title = typeof draft.title === "string" ? draft.title.trim() : "";
  if (!title || title.length > 100) {
    errors.title = "Введите название длиной от 1 до 100 символов.";
  }

  const priority = draft.priority;
  if (!ALLOWED_PRIORITIES.has(priority)) {
    errors.priority = "Выберите низкий, средний или высокий приоритет.";
  }

  if (Object.keys(errors).length > 0) return { ok: false, errors };
  return { ok: true, value: { id, title, priority } };
}
