export const STORAGE_VERSION = 1;

const PRIORITIES = new Set(["low", "medium", "high"]);

export function isValidTaskList(value) {
  if (!Array.isArray(value)) return false;

  const ids = new Set();
  for (const task of value) {
    if (!task || typeof task !== "object" || Array.isArray(task)) return false;
    const { id, title, completed, priority } = task;

    if (!Number.isSafeInteger(id) || id <= 0 || ids.has(id)) return false;
    if (typeof title !== "string" || !title || title.length > 100 || title !== title.trim()) {
      return false;
    }
    if (typeof completed !== "boolean" || !PRIORITIES.has(priority)) return false;
    ids.add(id);
  }
  return true;
}

export function loadTasks(storage, key, fallbackTasks) {
  const initial = fallbackTasks.map((task) => ({ ...task }));
  try {
    const raw = storage.getItem(key);
    if (raw === null) return { ok: true, source: "initial", tasks: initial };

    const saved = JSON.parse(raw);
    if (saved?.version !== STORAGE_VERSION || !isValidTaskList(saved.tasks)) {
      throw new Error("Неверная версия или структура данных.");
    }
    return {
      ok: true,
      source: "storage",
      tasks: saved.tasks.map((task) => ({ ...task })),
    };
  } catch {
    return {
      ok: false,
      source: "fallback",
      tasks: initial,
      error: "Не удалось прочитать localStorage. Используется исходный набор.",
    };
  }
}

export function saveTasks(storage, key, tasks) {
  if (!isValidTaskList(tasks)) {
    return { ok: false, error: "Список задач не соответствует схеме хранения." };
  }

  try {
    storage.setItem(key, JSON.stringify({ version: STORAGE_VERSION, tasks }));
    return { ok: true };
  } catch {
    return { ok: false, error: "Не удалось сохранить изменения в localStorage." };
  }
}

export function removeSavedTasks(storage, key) {
  try {
    storage.removeItem(key);
    return { ok: true };
  } catch {
    return { ok: false, error: "Не удалось удалить сохранённые данные из localStorage." };
  }
}
