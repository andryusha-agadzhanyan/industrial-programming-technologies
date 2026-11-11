import assert from "node:assert/strict";
import { after, before, test } from "node:test";
import { once } from "node:events";
import { createApiServer } from "../api/server.mjs";
import { buildUrl, createApiClient } from "../src/api-client.js";
import { createTaskApi } from "../src/task-api.js";
import { variantFilters } from "../src/variant.js";

const server = createApiServer();
let client;
let api;
let baseUrl;

before(async () => {
  server.listen(0, "127.0.0.1");
  await once(server, "listening");
  baseUrl = "http://127.0.0.1:" + server.address().port + "/api";
  client = createApiClient({ baseUrl });
  api = createTaskApi(client);
});
after(() => new Promise((resolve) => server.close(resolve)));

test("Высокий приоритет и категория «Проект» дают четыре задачи", async () => {
  const { tasks, meta } = await api.getTasks({ priority: "high", categoryId: 2 });
  assert.deepEqual(tasks.map((task) => task.id), [4, 16, 25, 34]);
  assert.equal(meta.total, 4);
});

test("Неизвестная категория возвращает 404, а код ошибки сохраняется", async () => {
  await assert.rejects(() => client.requestJson("/categories/999"), {
    kind: "http", status: 404, code: "CATEGORY_NOT_FOUND",
  });
});

test("Заранее отменённый запрос даже не вызывает fetch", async () => {
  let calls = 0;
  const controller = new AbortController();
  controller.abort();
  const probe = createApiClient({
    baseUrl,
    async fetchFn() {
      calls += 1;
      return new Response("{}");
    },
  });
  await assert.rejects(() => probe.requestJson("/tasks", { signal: controller.signal }), {
    kind: "aborted",
  });
  assert.equal(calls, 0);
});

test("Фильтр варианта 3 передаётся в URL и даёт ожидаемую выборку", async () => {
  assert.equal(new URL(buildUrl(baseUrl, "/tasks", variantFilters)).search, "?priority=high");
  const { tasks, meta } = await api.getTasks(variantFilters);
  assert.deepEqual(tasks.map((task) => task.id), [4, 13, 16, 25, 34]);
  assert.equal(meta.total, 5);
});
