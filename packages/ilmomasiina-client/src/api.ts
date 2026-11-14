import { ErrorCode } from "@tietokilta/ilmomasiina-models";
import type { ErrorResponse } from "@tietokilta/ilmomasiina-models";

const errorCodes = new Map<unknown, ErrorCode>(Object.values(ErrorCode).map((code) => [code, code]));

export interface FetchOptions {
  method?: "GET" | "POST" | "PUT" | "PATCH" | "DELETE";
  body?: unknown;
  headers?: Record<string, string>;
  signal?: AbortSignal;
}

export class ApiError extends Error {
  status: number;
  code?: ErrorCode;
  response?: unknown;

  constructor(status: number, response: Pick<ErrorResponse, "message" | "code">) {
    super(response.message);
    this.status = status;
    this.name = "ApiError";
    this.code = response.code;
    this.response = response;
  }

  static async fromResponse(response: Response) {
    try {
      const data: unknown = await response.json();
      if (typeof data === "object" && data !== null && "message" in data && typeof data.message === "string") {
        const code = "code" in data ? errorCodes.get(data.code) : undefined;
        return new ApiError(response.status, { message: data.message, code });
      }
    } catch {
      /* fall through */
    }
    return new ApiError(response.status, { message: response.statusText });
  }
}

/** Converts any thrown value to an `ApiError`. Values that are not API errors become status 0 errors. */
export function toApiError(err: unknown): ApiError {
  if (err instanceof ApiError) return err;
  return new ApiError(0, { message: err instanceof Error ? err.message : String(err) });
}

let apiUrl = "/api";

export function configureApi(url: string) {
  apiUrl = url;
}

export async function apiFetch<T = unknown>(uri: string, { method = "GET", body, headers, signal }: FetchOptions = {}) {
  const allHeaders = {
    ...headers,
  };
  if (body !== undefined) {
    allHeaders["Content-Type"] = "application/json; charset=utf-8";
  }

  const response = await fetch(`${apiUrl}/${uri}`, {
    method,
    body: body === undefined ? undefined : JSON.stringify(body),
    headers: allHeaders,
    signal,
  }).catch((err: unknown) => {
    // convert network errors to barebones ApiError
    throw toApiError(err);
  });
  // proper API errors, try to parse JSON
  if (!response.ok) {
    throw await ApiError.fromResponse(response);
  }
  // 204 No Content
  if (response.status === 204) {
    // oxlint-disable-next-line typescript/no-unsafe-type-assertion -- callers type T to include null for 204 endpoints
    return null as T;
  }
  // just in case, convert JSON parse errors for 2xx responses to ApiError
  // oxlint-disable-next-line typescript/no-unsafe-type-assertion -- the caller declares the response type T
  return response.json().catch((err: unknown) => {
    throw toApiError(err);
  }) as Promise<T>;
}
