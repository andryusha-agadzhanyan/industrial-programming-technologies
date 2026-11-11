import { useState } from "react";
import { validateTaskDraft } from "../domain/task-service.js";

function createDraft(task, categories) {
  const categoryId = task?.categoryId ?? categories[0]?.id ?? "";
  return {
    title: task?.title ?? "",
    priority: task?.priority ?? "medium",
    categoryId: String(categoryId),
  };
}

export default function TaskForm({ categories, initialTask, onSave, onCancel }) {
  const [draft, setDraft] = useState(() => createDraft(initialTask, categories));
  const [errors, setErrors] = useState({});
  const [saveError, setSaveError] = useState("");
  const editing = initialTask !== null;

  function changeField(event) {
    const { name, value } = event.target;
    setDraft((previous) => ({ ...previous, [name]: value }));
    setErrors((previous) => ({ ...previous, [name]: "" }));
    setSaveError("");
  }

  function submit(event) {
    event.preventDefault();
    const validation = validateTaskDraft(draft, categories);
    setErrors(validation.errors);
    setSaveError("");
    if (!validation.valid) return;

    if (onSave(validation.value)) {
      setDraft(createDraft(null, categories));
    } else {
      setSaveError("Задачу не удалось сохранить. Проверьте, есть ли она в списке.");
    }
  }

  return (
    <section aria-labelledby="form-heading">
      <h2 id="form-heading">{editing ? "Редактирование задачи" : "Добавление задачи"}</h2>
      <form noValidate onSubmit={submit}>
        <label htmlFor="task-title">Название</label>
        <input
          id="task-title"
          name="title"
          value={draft.title}
          onChange={changeField}
          aria-describedby="title-error"
          aria-invalid={Boolean(errors.title)}
        />
        <div id="title-error" className="error" aria-live="polite">{errors.title}</div>

        <label htmlFor="task-priority">Приоритет</label>
        <select
          id="task-priority"
          name="priority"
          value={draft.priority}
          onChange={changeField}
          aria-describedby="priority-error"
          aria-invalid={Boolean(errors.priority)}
        >
          <option value="low">Низкий</option>
          <option value="medium">Средний</option>
          <option value="high">Высокий</option>
        </select>
        <div id="priority-error" className="error" aria-live="polite">{errors.priority}</div>

        <label htmlFor="task-category">Категория</label>
        <select
          id="task-category"
          name="categoryId"
          value={draft.categoryId}
          onChange={changeField}
          aria-describedby="category-error"
          aria-invalid={Boolean(errors.categoryId)}
        >
          <option value="">Выберите категорию</option>
          {categories.map((category) => (
            <option key={category.id} value={category.id}>{category.name}</option>
          ))}
        </select>
        <div id="category-error" className="error" aria-live="polite">{errors.categoryId}</div>

        {saveError && <p role="alert">{saveError}</p>}
        <div className="actions">
          <button type="submit">{editing ? "Сохранить изменения" : "Добавить задачу"}</button>
          {editing && (
            <button type="button" onClick={onCancel}>Отменить редактирование</button>
          )}
        </div>
      </form>
    </section>
  );
}
