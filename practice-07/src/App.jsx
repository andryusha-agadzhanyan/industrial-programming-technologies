import { useState } from "react";
import { tasks as initialTasks, categories } from "./data.js";
import { createInitialFilters } from "./variant.js";
import { addTask, getTaskStats, removeTask, selectTasks, toggleTask, updateTask } from "./domain/task-service.js";
import TaskForm from "./components/TaskForm.jsx";
import TaskFilters from "./components/TaskFilters.jsx";
import TaskList from "./components/TaskList.jsx";
import TaskStats from "./components/TaskStats.jsx";

export default function App() {
  const [tasks, setTasks] = useState(() => initialTasks.map((task) => ({ ...task })));
  const [filters, setFilters] = useState(createInitialFilters);
  const [editingId, setEditingId] = useState(null);
  const [message, setMessage] = useState("");

  const visibleTasks = selectTasks(tasks, filters);
  const stats = getTaskStats(tasks);
  const editingTask = tasks.find((task) => task.id === editingId) ?? null;

  function saveTask(value) {
    if (editingId === null) {
      setTasks((previous) => {
        const maxId = previous.reduce((max, task) => Math.max(max, task.id), 0);
        return addTask(previous, value, maxId + 1);
      });
      setMessage("Задача добавлена.");
      return true;
    }

    if (!editingTask) return false;
    setTasks((previous) => updateTask(previous, editingId, value));
    setEditingId(null);
    setMessage("Изменения сохранены.");
    return true;
  }

  function changeStatus(id) {
    setTasks((previous) => toggleTask(previous, id));
    setMessage("Статус задачи изменён.");
  }

  function deleteTask(id) {
    if (!window.confirm("Удалить задачу?")) return;
    setTasks((previous) => removeTask(previous, id));
    if (editingId === id) setEditingId(null);
    setMessage("Задача удалена.");
  }

  return (
    <main>
      <h1>Задачи на React</h1>
      <p>После перезагрузки восстанавливается исходный набор.</p>
      <TaskStats stats={stats} />
      <TaskFilters filters={filters} categories={categories} onChange={setFilters} />
      <TaskForm
        key={editingId ?? "new"}
        categories={categories}
        initialTask={editingTask}
        onSave={saveTask}
        onCancel={() => setEditingId(null)}
      />
      <p role="status">{message}</p>
      <TaskList
        tasks={visibleTasks}
        categories={categories}
        total={stats.total}
        onToggle={changeStatus}
        onEdit={setEditingId}
        onDelete={deleteTask}
      />
    </main>
  );
}
