import { useEffect, useRef, useState } from 'react';

// api передаётся зависимостью, поэтому хук проверяется без настоящей сети.
export function useTaskData({ api, filters }) {
  const [snapshot, setSnapshot] = useState({ tasks: [], categories: [], meta: { total: 0 } });
  const [status, setStatus] = useState('loading');
  const [error, setError] = useState(null);
  const [mutationError, setMutationError] = useState(null);
  const [pending, setPending] = useState(false);
  const [revision, setRevision] = useState(0);
  const mounted = useRef(false);
  const mutationController = useRef(null);
  const { q, completed, priority, categoryId } = filters;

  useEffect(() => {
    // Setup выполняется заново и в пробном цикле StrictMode.
    mounted.current = true;
    return () => {
      mounted.current = false;
      mutationController.current?.abort();
      mutationController.current = null;
    };
  }, []);

  useEffect(() => {
    let active = true;
    const controller = new AbortController();
    setStatus('loading');
    setError(null);

    async function load() {
      try {
        const result = await api.loadInitialData(
          { q, completed, priority, categoryId },
          { signal: controller.signal },
        );
        if (!active) return;
        setSnapshot(result);
        setStatus('ready');
      } catch (cause) {
        if (!active || controller.signal.aborted || cause.kind === 'aborted') return;
        setError(cause);
        setStatus('error');
      }
    }

    void load();
    return () => {
      active = false;
      controller.abort();
    };
  }, [api, q, completed, priority, categoryId, revision]);

  function refresh() {
    setRevision(previous => previous + 1);
  }

  async function mutate(operation) {
    if (!mounted.current || mutationController.current) return false;
    const controller = new AbortController();
    // Ref блокирует второй вызов сразу, ещё до нового рендера с pending.
    mutationController.current = controller;
    setPending(true);
    setMutationError(null);
    try {
      await operation(controller.signal);
      if (!mounted.current || controller.signal.aborted) return false;
      // Успех записи не зависит от результата следующего GET.
      refresh();
      return true;
    } catch (cause) {
      if (mounted.current && !controller.signal.aborted && cause.kind !== 'aborted') {
        setMutationError(cause);
      }
      return false;
    } finally {
      if (mutationController.current === controller) {
        mutationController.current = null;
        if (mounted.current) setPending(false);
      }
    }
  }

  return {
    snapshot, status, error, mutationError, pending,
    refresh,
    saveTask(id, value) {
      return mutate(signal => id === null
        ? api.createTask(value, { signal })
        : api.updateTask(id, value, { signal }));
    },
    toggleTask(task) {
      return mutate(signal => api.setTaskCompleted(task.id, !task.completed, { signal }));
    },
    deleteTask(id) {
      return mutate(signal => api.deleteTask(id, { signal }));
    },
    resetData() {
      return mutate(signal => api.resetDemoData({ signal }));
    },
  };
}
