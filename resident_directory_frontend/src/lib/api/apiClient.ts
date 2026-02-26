export type ApiErrorShape = {
  message: string;
  status?: number;
  details?: unknown;
};

export class ApiError extends Error {
  status?: number;
  details?: unknown;

  constructor(shape: ApiErrorShape) {
    super(shape.message);
    this.name = "ApiError";
    this.status = shape.status;
    this.details = shape.details;
  }
}

type RequestOptions = {
  method?: "GET" | "POST" | "PUT" | "PATCH" | "DELETE";
  path: string;
  token?: string | null;
  body?: unknown;
  query?: Record<string, string | number | boolean | undefined | null>;
  signal?: AbortSignal;
};

function getBaseUrl(): string {
  const env = process.env.NEXT_PUBLIC_API_BASE_URL;
  if (!env) {
    // Keep it deterministic in dev; caller will see a clear error.
    throw new ApiError({
      message:
        "Missing NEXT_PUBLIC_API_BASE_URL. Set it in your environment (.env) to point to the backend API.",
    });
  }
  return env.replace(/\/+$/, "");
}

function toQueryString(q?: RequestOptions["query"]): string {
  if (!q) return "";
  const params = new URLSearchParams();
  Object.entries(q).forEach(([k, v]) => {
    if (v === undefined || v === null) return;
    params.set(k, String(v));
  });
  const s = params.toString();
  return s ? `?${s}` : "";
}

// PUBLIC_INTERFACE
export async function apiRequest<T>(opts: RequestOptions): Promise<T> {
  /**
   * Canonical HTTP flow used by all frontend API calls.
   *
   * Contract:
   * - Inputs: method/path/token/body/query/signal
   * - Output: parsed JSON response as T (or throws ApiError)
   * - Errors:
   *    - ApiError(message,status,details) for HTTP errors and parse errors
   * Side effects: network call to NEXT_PUBLIC_API_BASE_URL.
   */
  const baseUrl = getBaseUrl();
  const method = opts.method ?? "GET";
  const url = `${baseUrl}${opts.path}${toQueryString(opts.query)}`;

  const headers: Record<string, string> = {
    Accept: "application/json",
  };
  if (opts.body !== undefined) headers["Content-Type"] = "application/json";
  if (opts.token) headers.Authorization = `Bearer ${opts.token}`;

  let res: Response;
  try {
    res = await fetch(url, {
      method,
      headers,
      body: opts.body !== undefined ? JSON.stringify(opts.body) : undefined,
      signal: opts.signal,
      cache: "no-store",
    });
  } catch (e) {
    throw new ApiError({
      message: "Network error while contacting backend API.",
      details: e,
    });
  }

  let payload: unknown = null;
  const contentType = res.headers.get("content-type") ?? "";
  if (contentType.includes("application/json")) {
    try {
      payload = await res.json();
    } catch (e) {
      throw new ApiError({
        message: "Failed to parse JSON response from backend API.",
        status: res.status,
        details: e,
      });
    }
  } else {
    // Best-effort text extraction for debugability.
    try {
      payload = await res.text();
    } catch {
      payload = null;
    }
  }

  if (!res.ok) {
    // Avoid `any` to satisfy strict linting; handle common FastAPI error shapes.
    const maybeObj =
      typeof payload === "object" && payload !== null
        ? (payload as Record<string, unknown>)
        : null;

    const detail = maybeObj?.detail;
    const msg = maybeObj?.message;

    const message =
      (typeof detail === "string" && detail) ||
      (typeof msg === "string" && msg) ||
      `Backend API request failed (${res.status})`;

    throw new ApiError({ message, status: res.status, details: payload });
  }

  return payload as T;
}
