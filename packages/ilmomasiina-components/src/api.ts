export interface FetchOptions {
  method?: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';
  body?: any;
  headers?: Record<string, string>;
  accessToken?: string;
  signal?: AbortSignal;
}

export class ApiError extends Error {
  status: number;
  code?: string;
  response?: any;

  constructor(status: number, response: any) {
    super(response.message);
    this.status = status;
    this.name = 'ApiError';
    this.code = response.code;
    this.response = response;
  }

  static async fromResponse(response: Response) {
    let error = new Error(response.statusText);
    try {
      const data = await response.json();
      if (data.message) {
        error = new ApiError(response.status, data);
      }
    } catch (e) {
      /* fall through */
    }
    return error;
  }

  get isUnauthenticated() {
    return this.status === 401;
  }
}

let apiUrl = '/api';

export function configureApi(url: string) {
  apiUrl = url;
}

export default async function apiFetch(uri: string, {
  method = 'GET', body, headers, accessToken, signal,
}: FetchOptions = {}) {
  const allHeaders = {
    ...headers || {},
  };
  if (accessToken) {
    allHeaders.Authorization = accessToken;
  }
  if (body !== undefined) {
    allHeaders['Content-Type'] = 'application/json; charset=utf-8';
  }

  const response = await fetch(`${apiUrl}/${uri}`, {
    method,
    body: body === undefined ? undefined : JSON.stringify(body),
    headers: allHeaders,
    signal,
  });

  if (!response.ok) {
    throw await ApiError.fromResponse(response);
  }
  return response.status === 204 ? null : response.json();
}
