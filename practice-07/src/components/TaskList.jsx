import TaskItem from "./TaskItem.jsx";

export default function TaskList({ tasks, categories, total, onToggle, onEdit, onDelete }) {
  return (
    <section aria-labelledby="tasks-heading">
      <h2 id="tasks-heading">Задачи</h2>
      <p>Найдено <strong>{tasks.length}</strong></p>
      {tasks.length === 0 ? (
        <p>{total === 0 ? "Список задач пуст." : "По выбранным фильтрам задач нет."}</p>
      ) : (
        <ul>
          {tasks.map((task) => (
            <TaskItem
              key={task.id}
              task={task}
              categoryName={categories.find((category) => category.id === task.categoryId)?.name ?? "Без категории"}
              onToggle={onToggle}
              onEdit={onEdit}
              onDelete={onDelete}
            />
          ))}
        </ul>
      )}
    </section>
  );
}
