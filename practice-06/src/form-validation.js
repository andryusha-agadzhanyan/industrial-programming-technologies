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
