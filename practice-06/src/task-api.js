import { ApiError } from "./api-client.js";

const ALLOWED_PRIORITIES = new Set(["low", "medium", "high"]);
const ALLOWED_FILTERS = new Set(["completed", "priority", "categoryId", "q"]);

function invalidResponse(message) {
  return new ApiError(message, { kind: "invalid-response" });
}

function isPositiveSafeInteger(value) {
  return Number.isSafeInteger(value) && value > 0;
}

export function isTask(value) {
  return Boolean(
    value
    && typeof value === "object"
    && isPositiveSafeInteger(value.id)
    && typeof value.title === "string"
    && value.title.trim().length >= 1
    && value.title.trim().length <= 100
    && typeof value.completed === "boolean"
    && ALLOWED_PRIORITIES.has(value.priority)
    && isPositiveSafeInteger(value.categoryId),
  );
}

export function isCategory(value) {
  return Boolean(
    value
    && typeof value === "object"
    && isPositiveSafeInteger(value.id)
    && typeof value.name === "string"
    && value.name.trim().length >= 1
    && value.name.trim().length <= 100,
  );
}

function normalizeFilters(filters) {
  if (!filters || typeof filters !== "object" || Array.isArray(filters)) {
    throw new TypeError("Фильтры должны быть объектом.");
  }

  const query = {};
  for (const [name, value] of Object.entries(filters)) {
    if (!ALLOWED_FILTERS.has(name)) throw new TypeError("Неизвестный фильтр: " + name);
    if (value === undefined) continue;

    if (name === "completed" && typeof value !== "boolean") {
      throw new TypeError("completed должен быть логическим значением.");
    }
    if (name === "priority" && !ALLOWED_PRIORITIES.has(value)) {
      throw new TypeError("Неизвестный приоритет.");
    }
    if (name === "categoryId" && !isPositiveSafeInteger(value)) {
      throw new TypeError("categoryId должен быть положительным целым числом.");
    }
    if (name === "q") {
      if (typeof value !== "string" || value.trim().length > 100) {
        throw new TypeError("Поиск принимает строку до 100 символов.");
      }
      const search = value.trim();
      if (search) query.q = search;
    } else {
      query[name] = value;
    }
  }
  return query;
}

function readCollection(payload, validateItem, name) {
  const data = payload?.data;
  if (!Array.isArray(data) || payload.meta?.total !== data.length || !data.every(validateItem)) {
    throw invalidResponse("Неверный формат коллекции " + name + ".");
  }
  if (new Set(data.map((item) => item.id)).size !== data.length) {
    throw invalidResponse("Повторяющиеся id в коллекции " + name + ".");
  }
  return data;
}

function taskPath(id) {
  if (!isPositiveSafeInteger(id)) throw new TypeError("Неверный id задачи.");
  return "/tasks/" + id;
}

function readTask(payload, id) {
  const task = payload?.data;
  if (!isTask(task) || (id !== undefined && task.id !== id)) {
    throw invalidResponse("Неверный формат задачи.");
  }
  return task;
}

export function createTaskApi(client) {
  if (typeof client?.requestJson !== "function") {
    throw new TypeError("Требуется клиент с методом requestJson.");
  }

  async function getTasks(filters = {}, options) {
    const payload = await client.requestJson("/tasks", { ...options, query: normalizeFilters(filters) });
    const tasks = readCollection(payload, isTask, "задач");
    return { tasks, meta: payload.meta };
  }

  async function getTaskById(id, options) {
    const payload = await client.requestJson(taskPath(id), options);
    return readTask(payload, id);
  }

  async function getCategories(options) {
    const payload = await client.requestJson("/categories", options);
    return readCollection(payload, isCategory, "категорий");
  }

  async function loadInitialData(filters = {}, options) {
    const [result, categories] = await Promise.all([
      getTasks(filters, options),
      getCategories(options),
    ]);
    return { tasks: result.tasks, categories, meta: result.meta };
  }

  async function createTask(draft, options) {
    const payload = await client.requestJson("/tasks", { ...options, method: "POST", body: draft });
    return readTask(payload);
  }

  async function updateTask(id, changes, options) {
    const payload = await client.requestJson(taskPath(id), { ...options, method: "PATCH", body: changes });
    return readTask(payload, id);
  }

  async function setTaskCompleted(id, completed, options) {
    if (typeof completed !== "boolean") throw new TypeError("completed должен быть логическим значением.");
    return updateTask(id, { completed }, options);
  }

  async function deleteTask(id, options) {
    const payload = await client.requestJson(taskPath(id), { ...options, method: "DELETE" });
    if (payload !== null) throw invalidResponse("При удалении ожидался ответ без тела.");
    return null;
  }

  async function resetDemoData(options) {
    const payload = await client.requestJson("/debug/reset", { ...options, method: "POST" });
    const result = payload?.data;
    if (result?.reset !== true || !Number.isSafeInteger(result.total) || result.total < 0) {
      throw invalidResponse("Сервер не подтвердил сброс данных.");
    }
    return result;
  }

  return {
    getTasks, getTaskById, getCategories, loadInitialData,
    createTask, updateTask, setTaskCompleted, deleteTask, resetDemoData,
  };
}
