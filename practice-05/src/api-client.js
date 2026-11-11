export class ApiError extends Error {
  constructor(message, {
    kind,
    status = null,
    code = null,
    details = null,
    url = null,
    cause,
  } = {}) {
    super(message, cause === undefined ? undefined : { cause });
    this.name = "ApiError";
    this.kind = kind;
    this.status = status;
    this.code = code;
    this.details = details;
    this.url = url;
  }
}

function parseBaseUrl(baseUrl) {
  if (typeof baseUrl !== "string" || !/^https?:\/\//i.test(baseUrl) || /[?#]/.test(baseUrl)) {
    throw new TypeError("baseUrl должен быть HTTP(S)-адресом без параметров и фрагмента.");
  }
  return new URL(baseUrl);
}

export function buildUrl(baseUrl, path, query = {}) {
  const url = parseBaseUrl(baseUrl);
  const relativePath = typeof path === "string" ? path.trim() : "";
  if (!relativePath || /[?#]/.test(relativePath) || /^[a-z][a-z\d+.-]*:/i.test(relativePath)) {
    throw new TypeError("Укажите относительный путь без параметров и фрагмента.");
  }
  const prototype = query && typeof query === "object" ? Object.getPrototypeOf(query) : undefined;
  if (prototype !== Object.prototype && prototype !== null) {
    throw new TypeError("query должен быть обычным объектом.");
  }

  url.pathname = url.pathname.replace(/\/+$/, "") + "/" + relativePath.replace(/^\/+/, "");
  for (const [name, value] of Object.entries(query)) {
    if (value !== null && value !== undefined && value !== "") {
      url.searchParams.set(name, String(value));
    }
  }
  return url.href;
}

function validateTimeout(timeoutMs) {
  if (!Number.isInteger(timeoutMs) || timeoutMs < 1 || timeoutMs > 4_294_967_295) {
    throw new TypeError("Время ожидания должно быть положительным целым числом миллисекунд.");
  }
}

function isJson(response) {
  const type = response.headers.get("content-type")?.split(";")[0].trim().toLowerCase();
  return type === "application/json" || Boolean(type?.endsWith("+json"));
}

export function createApiClient({
  baseUrl,
  fetchFn = globalThis.fetch,
  timeoutMs = 2000,
} = {}) {
  parseBaseUrl(baseUrl);
  if (typeof fetchFn !== "function") throw new TypeError("fetchFn должен быть функцией.");
  validateTimeout(timeoutMs);

  async function requestJson(path, {
    query,
    signal,
    timeoutMs: requestTimeout = timeoutMs,
  } = {}) {
    const url = buildUrl(baseUrl, path, query);
    validateTimeout(requestTimeout);
    const timeoutSignal = AbortSignal.timeout(requestTimeout);
    const requestSignal = signal ? AbortSignal.any([signal, timeoutSignal]) : timeoutSignal;

    function connectionError(cause) {
      if (requestSignal.aborted) {
        if (timeoutSignal.aborted && requestSignal.reason === timeoutSignal.reason) {
          return new ApiError("Истекло время ожидания ответа.", { kind: "timeout", url, cause });
        }
        return new ApiError("Запрос отменён.", { kind: "aborted", url, cause });
      }
      return new ApiError("Не удалось связаться с сервером.", { kind: "network", url, cause });
    }

    let response;
    try {
      requestSignal.throwIfAborted();
      response = await fetchFn(url, {
        method: "GET",
        headers: { Accept: "application/json" },
        signal: requestSignal,
      });
      requestSignal.throwIfAborted();
    } catch (cause) {
      throw connectionError(cause);
    }

    if (!(response instanceof Response)) {
      throw new ApiError("Сервер вернул неверный ответ.", { kind: "invalid-response", url });
    }

    const status = response.status;
    if (!response.ok) {
      let details;
      if (isJson(response)) {
        try {
          details = (await response.json())?.error;
        } catch (cause) {
          if (requestSignal.aborted) throw connectionError(cause);
        }
      }
      const message = typeof details?.message === "string" ? details.message : "HTTP " + status;
      throw new ApiError(message, {
        kind: "http",
        status,
        code: typeof details?.code === "string" ? details.code : null,
        details: details?.details ?? null,
        url,
      });
    }

    if (status === 204) return null;
    if (!isJson(response)) {
      throw new ApiError("Ожидался ответ в формате JSON.", { kind: "invalid-response", status, url });
    }

    try {
      const value = await response.json();
      requestSignal.throwIfAborted();
      return value;
    } catch (cause) {
      if (requestSignal.aborted) throw connectionError(cause);
      throw new ApiError("Не удалось прочитать JSON.", { kind: "invalid-response", status, url, cause });
    }
  }

  return { requestJson };
}
