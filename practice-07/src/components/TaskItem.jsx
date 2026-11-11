const priorityLabels = {
  low: "Низкий",
  medium: "Средний",
  high: "Высокий",
};

export default function TaskItem({ task, categoryName, onToggle, onEdit, onDelete }) {
  return (
    <li data-task-id={task.id}>
      <h3>{task.title}</h3>
      <p>{task.completed ? "Выполнена" : "В работе"} · {priorityLabels[task.priority]} · {categoryName}</p>
      <div className="actions">
        <button type="button" aria-pressed={task.completed} onClick={() => onToggle(task.id)}>
          Выполнена
        </button>
        <button type="button" onClick={() => onEdit(task.id)}>Редактировать</button>
        <button type="button" onClick={() => onDelete(task.id)}>Удалить</button>
      </div>
    </li>
  );
}
