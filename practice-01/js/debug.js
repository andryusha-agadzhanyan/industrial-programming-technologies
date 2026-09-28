"use strict";

const plannedText = "8";
const completedText = "3";
const additionalText = "2";

const plannedTotal = Number(plannedText);
const completedTotal = Number(completedText) + Number(additionalText);
const remainingTasks = plannedTotal - completedTotal;

console.log("Выполнено:", completedTotal);
console.log("Осталось:", remainingTasks);

let controlSum = 0;
for (let taskNumber = 1; taskNumber <= 4; taskNumber += 1) {
  controlSum += taskNumber;
}

console.log("Контрольная сумма:", controlSum);
