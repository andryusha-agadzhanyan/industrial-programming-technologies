import { demoTasks, variantNumber, variantTasks } from "./data.js";
import {
  findTaskById,
  getPendingTasks,
  getTaskTitles,
  getTaskStats,
  addTask,
  setTaskCompleted,
  renameTask,
  removeTask,
} from "./task-service.js";

function printStats(tasks) {
  const stats = getTaskStats(tasks);
  console.log(`Всего: ${stats.total}; выполнено: ${stats.completed}; осталось: ${stats.pending}`);
  if (stats.total === 0) {
    console.log("Задач пока нет");
  } else {
    console.log(`Прогресс: ${stats.progress.toFixed(1)}%`);
  }
}

function applyResult(result, currentTasks) {
  if (result.ok) {
    return result.tasks;
  }

  console.log(`Ошибка: ${result.error}`);
  return currentTasks;
}

console.log("=== Общий сценарий ===");
console.table(demoTasks);
console.log("Названия:", getTaskTitles(demoTasks));
console.log("Невыполненные id:", getPendingTasks(demoTasks).map((task) => task.id));
console.log("Поиск id = 4:", findTaskById(demoTasks, 4));
printStats(demoTasks);

let currentTasks = demoTasks;

currentTasks = applyResult(
  addTask(currentTasks, 20, "Добавить проверку", "high"),
  currentTasks
);
console.log("После добавления id = 20");
printStats(currentTasks);

currentTasks = applyResult(
  setTaskCompleted(currentTasks, 4, true),
  currentTasks
);
console.log("После выполнения id = 4");
printStats(currentTasks);

currentTasks = applyResult(
  renameTask(currentTasks, 10, "Подготовить инструкцию запуска"),
  currentTasks
);
console.log("После переименования id = 10");
printStats(currentTasks);

currentTasks = applyResult(removeTask(currentTasks, 7), currentTasks);
console.log("После удаления id = 7");
printStats(currentTasks);
console.log("Итоговые id:", currentTasks.map((task) => task.id));

console.log("Проверка обработанной ошибки");
currentTasks = applyResult(
  addTask(currentTasks, 20, "Дубликат", "medium"),
  currentTasks
);
console.log("После ошибки id:", currentTasks.map((task) => task.id));
console.log("Исходный demoTasks сохранён:", demoTasks.length === 4 && demoTasks[1].completed === false);

console.log(`\n=== Индивидуальный вариант ${variantNumber} ===`);
console.log("Тема: создание сайта-портфолио");
console.table(variantTasks);
printStats(variantTasks);

let variantCurrent = variantTasks;

variantCurrent = applyResult(
  addTask(variantCurrent, 80, "Добавить адаптивную верстку", "low"),
  variantCurrent
);
console.log("После добавления id = 80");
printStats(variantCurrent);

variantCurrent = applyResult(
  setTaskCompleted(variantCurrent, 11, true),
  variantCurrent
);
console.log("После установки completed = true для id = 11");
printStats(variantCurrent);

variantCurrent = applyResult(
  renameTask(variantCurrent, 23, "Оформить главную страницу"),
  variantCurrent
);
console.log("После переименования id = 23");
printStats(variantCurrent);

variantCurrent = applyResult(removeTask(variantCurrent, 37), variantCurrent);
console.log("После удаления id = 37");
printStats(variantCurrent);

console.log("Повторное добавление id = 80");
variantCurrent = applyResult(
  addTask(variantCurrent, 80, "Повторная задача", "low"),
  variantCurrent
);

console.log("Итоговые задачи варианта:");
console.table(variantCurrent);
printStats(variantCurrent);
console.log("Итоговые id:", variantCurrent.map((task) => task.id));
console.log(
  "Исходный variantTasks сохранён:",
  variantTasks.length === 6 &&
  variantTasks[1].title === "Подготовить главную страницу" &&
  variantTasks[2].id === 37
);
