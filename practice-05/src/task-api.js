import { ApiError } from "./api-client.js";

const ALLOWED_PRIORITIES = new Set(["low", "medium", "high"]);
const ALLOWED_FILTERS = new Set(["completed", "priority", "categoryId", "q"]);

function invalidResponse(message) {
  return new ApiError(message, { kind: "invalid-response" });
}

function isPositiveSafeInteger(value) {
  return Number.isSafeInteger(value) && value > 0;
}

function isTask(value) {
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

function isCategory(value) {
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

export function createTaskApi(client) {
  if (typeof client?.requestJson !== "function") {
    throw new TypeError("Требуется клиент с методом requestJson.");
  }

  async function getTasks(filters = {}) {
    const payload = await client.requestJson("/tasks", { query: normalizeFilters(filters) });
    const tasks = readCollection(payload, isTask, "задач");
    return { tasks, meta: payload.meta };
  }

  async function getTaskById(id) {
    if (!isPositiveSafeInteger(id)) throw new TypeError("Неверный id задачи.");
    const payload = await client.requestJson("/tasks/" + id);
    if (!isTask(payload?.data) || payload.data.id !== id) {
      throw invalidResponse("Неверный формат задачи.");
    }
    return payload.data;
  }

  async function getCategories() {
    const payload = await client.requestJson("/categories");
    return readCollection(payload, isCategory, "категорий");
  }

  async function loadInitialData(filters = {}) {
    const [result, categories] = await Promise.all([getTasks(filters), getCategories()]);
    return { tasks: result.tasks, categories, meta: result.meta };
  }

  return { getTasks, getTaskById, getCategories, loadInitialData };
}
