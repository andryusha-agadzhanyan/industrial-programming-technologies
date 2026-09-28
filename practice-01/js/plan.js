"use strict";

// Вариант 3
const totalTasks = 9;
const completedTasks = 9;
const dailyLimit = 3;

if (!Number.isFinite(totalTasks) || !Number.isInteger(totalTasks) ||
    !Number.isFinite(completedTasks) || !Number.isInteger(completedTasks)) {
  console.log("Ошибка: количество задач должно быть целым числом");
} else if (totalTasks < 0 || totalTasks > 1000) {
  console.log("Ошибка: общее количество задач должно быть от 0 до 1000");
} else if (completedTasks < 0 || completedTasks > totalTasks) {
  console.log("Ошибка: некорректное количество выполненных задач");
} else if (!Number.isFinite(dailyLimit) || !Number.isInteger(dailyLimit) ||
           dailyLimit < 1 || dailyLimit > 1000) {
  console.log("Ошибка: дневная норма должна быть целым числом от 1 до 1000");
} else {
  let remainingTasks = totalTasks - completedTasks;
  let day = 0;

  console.log(`Осталось задач: ${remainingTasks}`);

  if (remainingTasks === 0) {
    console.log("Все задачи уже выполнены");
  }

  while (remainingTasks > 0) {
    day += 1;
    const tasksToday = Math.min(dailyLimit, remainingTasks);
    remainingTasks -= tasksToday;
    console.log(`День ${day}: выполнено ${tasksToday}, осталось ${remainingTasks}`);
  }

  console.log(`Потребуется дней: ${day}`);
}
