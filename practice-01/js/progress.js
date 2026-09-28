"use strict";

// Вариант 3
const totalTasks = 9;
const completedTasks = 9;

if (!Number.isFinite(totalTasks) || !Number.isInteger(totalTasks) ||
    !Number.isFinite(completedTasks) || !Number.isInteger(completedTasks)) {
  console.log("Ошибка: количество задач должно быть целым числом");
} else if (totalTasks < 0 || totalTasks > 1000) {
  console.log("Ошибка: общее количество задач должно быть от 0 до 1000");
} else if (completedTasks < 0) {
  console.log("Ошибка: количество выполненных задач не может быть отрицательным");
} else if (completedTasks > totalTasks) {
  console.log("Ошибка: выполнено больше задач, чем существует");
} else if (totalTasks === 0 && completedTasks === 0) {
  console.log("Задач пока нет");
} else {
  const remainingTasks = totalTasks - completedTasks;
  const percentage = completedTasks / totalTasks * 100;
  let status;

  if (completedTasks === 0) {
    status = "Не начато";
  } else if (completedTasks === totalTasks) {
    status = "Завершено";
  } else {
    status = "В работе";
  }

  console.log(`Всего задач: ${totalTasks}`);
  console.log(`Выполнено: ${completedTasks}`);
  console.log(`Осталось: ${remainingTasks}`);
  console.log(`Прогресс: ${percentage.toFixed(1)}%`);
  console.log(`Статус: ${status}`);
}
