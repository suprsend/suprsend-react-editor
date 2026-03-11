export class HttpError extends Error {
  status: number;
  response: Response;
  data: unknown;

  constructor(status: number, response: Response, data: unknown) {
    super(`HTTP Error ${status}`);
    this.name = 'HttpError';
    this.status = status;
    this.response = response;
    this.data = data;
  }
}

export function isHttpError(error: unknown): error is HttpError {
  return error instanceof HttpError;
}

type RequestInterceptor = (
  url: string,
  options: RequestInit
) => { url: string; options: RequestInit };

type ResponseInterceptor = (
  response: Response,
  url: string,
  options: RequestInit
) => Promise<Response>;

export class FetchClient {
  baseURL: string;
  credentials: RequestCredentials;
  private requestInterceptors: RequestInterceptor[] = [];
  private responseInterceptors: ResponseInterceptor[] = [];

  constructor({
    baseURL,
    credentials,
  }: {
    baseURL: string;
    credentials: RequestCredentials;
  }) {
    this.baseURL = baseURL;
    this.credentials = credentials;
  }

  addRequestInterceptor(fn: RequestInterceptor) {
    this.requestInterceptors.push(fn);
  }

  addResponseInterceptor(fn: ResponseInterceptor) {
    this.responseInterceptors.push(fn);
  }

  async request(
    url: string,
    options: RequestInit = {}
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
  ): Promise<{ data: any; response: Response }> {
    let finalUrl = url;
    let finalOptions: RequestInit = {
      ...options,
      credentials: this.credentials,
    };

    for (const interceptor of this.requestInterceptors) {
      const result = interceptor(finalUrl, finalOptions);
      finalUrl = result.url;
      finalOptions = result.options;
    }

    let response = await fetch(finalUrl, finalOptions);

    for (const interceptor of this.responseInterceptors) {
      response = await interceptor(response, finalUrl, finalOptions);
    }

    const contentType = response.headers.get('content-type');
    let data: unknown;
    if (contentType?.includes('application/json')) {
      data = await response.json();
    } else {
      data = await response.text();
    }

    if (!response.ok) {
      throw new HttpError(response.status, response, data);
    }

    return { data, response };
  }

  get(url: string, headers?: Record<string, string>) {
    return this.request(url, { method: 'GET', headers });
  }

  post(url: string, body?: unknown, headers?: Record<string, string>) {
    const isFormData = body instanceof FormData;
    return this.request(url, {
      method: 'POST',
      headers: isFormData
        ? headers
        : { 'Content-Type': 'application/json', ...headers },
      body: isFormData ? body : body != null ? JSON.stringify(body) : undefined,
    });
  }

  put(url: string, body?: unknown, headers?: Record<string, string>) {
    const isFormData = body instanceof FormData;
    return this.request(url, {
      method: 'PUT',
      headers: isFormData
        ? headers
        : { 'Content-Type': 'application/json', ...headers },
      body: isFormData ? body : body != null ? JSON.stringify(body) : undefined,
    });
  }

  patch(url: string, body?: unknown, headers?: Record<string, string>) {
    const isFormData = body instanceof FormData;
    return this.request(url, {
      method: 'PATCH',
      headers: isFormData
        ? headers
        : { 'Content-Type': 'application/json', ...headers },
      body: isFormData ? body : body != null ? JSON.stringify(body) : undefined,
    });
  }
}
