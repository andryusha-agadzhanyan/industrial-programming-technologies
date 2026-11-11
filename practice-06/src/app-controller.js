import { ApiError } from "./api-client.js";
import { validateTaskDraft } from "./form-validation.js";

export function messageForError(error) {
  if (!(error instanceof ApiError)) return "Не удалось выполнить операцию.";
  if (error.kind === "timeout") return "Сервер не ответил вовремя. Попробуйте ещё раз.";
  if (error.kind === "network") return "Нет соединения с учебным API. Проверьте, запущен ли npm start.";
  if (error.kind === "invalid-response") return "Сервер вернул ответ неожиданного формата.";
  if (error.kind === "http" && error.status === 404) return "Запись уже отсутствует на сервере. Обновите список.";
  if (error.kind === "http") return error.message || `Сервер вернул ошибку ${error.status}.`;
  return "Не удалось выполнить операцию.";
}

// Представление передаётся аргументом, поэтому контроллер можно проверить без DOM.
export function createAppController({ api, view, validateDraft = validateTaskDraft } = {}) {
  if (typeof api?.loadInitialData !== "function" || typeof view?.setListState !== "function"
      || typeof validateDraft !== "function") {
    throw new TypeError("Нужны API, представление и функция проверки формы.");
  }

  let tasks = [];
  let categories = null;
  let filters = {};
  let editingId = null;
  let activeLoad = null;
  let latestLoad = 0;
  let mutationPending = false;

  async function loadCurrentTasks() {
    const loadNumber = ++latestLoad;
    activeLoad?.abort();
    const controller = new AbortController();
    activeLoad = controller;
    view.setListState("loading");

    try {
      const options = { signal: controller.signal };
      const result = categories === null
        ? await api.loadInitialData(filters, options)
        : await api.getTasks(filters, options);
      if (loadNumber !== latestLoad) return;

      if (categories === null) {
        categories = result.categories;
        view.setCategories(categories);
      }
      tasks = result.tasks;
      view.setTasks(tasks, categories);
      view.setTotal(result.meta.total);
      if (mutationPending) view.setMutationPending(true);
      view.setListState(tasks.length ? "ready" : "empty");
    } catch (error) {
      if (loadNumber !== latestLoad || error?.kind === "aborted") return;
      view.setListState("error", messageForError(error));
    } finally {
      if (loadNumber === latestLoad) activeLoad = null;
    }
  }

  function applyFilters(nextFilters = {}) {
    filters = { ...nextFilters };
    return loadCurrentTasks();
  }

  function cancelEdit() {
    editingId = null;
    view.setFormTask(null);
    view.showFormErrors({});
  }

  function beginEdit(id) {
    if (mutationPending) return;
    const task = tasks.find((item) => item.id === id);
    if (!task) return;

    editingId = id;
    view.setFormTask(task);
    view.showFormErrors({});
  }

  async function mutate(action, successMessage, afterSuccess) {
    if (mutationPending) return;
    mutationPending = true;
    view.setMutationPending(true);

    try {
      await action();
      afterSuccess?.();
      view.notify(successMessage, "success");
      await loadCurrentTasks();
    } catch (error) {
      view.notify(messageForError(error), "error");
    } finally {
      mutationPending = false;
      view.setMutationPending(false);
    }
  }

  function submit(draft) {
    if (mutationPending) return;
    const result = validateDraft(draft, categories ?? []);
    view.showFormErrors(result.errors);
    if (!result.valid) return;

    const id = editingId;
    if (id === null) {
      return mutate(() => api.createTask(result.value), "Задача добавлена.", cancelEdit);
    }
    return mutate(() => api.updateTask(id, result.value), "Задача изменена.", cancelEdit);
  }

  function toggleTask(id) {
    const task = tasks.find((item) => item.id === id);
    if (!task) return;
    return mutate(() => api.setTaskCompleted(id, !task.completed), "Статус задачи изменён.");
  }

  function deleteTask(id) {
    return mutate(() => api.deleteTask(id), "Задача удалена.", () => {
      if (editingId === id) cancelEdit();
    });
  }

  function resetData() {
    return mutate(() => api.resetDemoData(), "Исходные данные восстановлены.", cancelEdit);
  }

  function destroy() {
    latestLoad += 1;
    activeLoad?.abort();
    activeLoad = null;
  }

  return {
    start: applyFilters,
    applyFilters,
    refresh: loadCurrentTasks,
    submit,
    beginEdit,
    cancelEdit,
    toggleTask,
    deleteTask,
    resetData,
    destroy,
  };
}
