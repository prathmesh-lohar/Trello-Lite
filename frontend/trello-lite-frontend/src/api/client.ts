const API_BASE_URL = "http://localhost:1000/api/v1";

export type ApiOptions = {
  method?: string;
  headers?: Record<string, string>;
  body?: any;
  token?: string | null;
};

export class ApiError extends Error {
  status: number;
  data: any;
  constructor(status: number, message: string, data: any) {
    super(message);
    this.status = status;
    this.data = data;
  }
}

export const request = async (path: string, options: ApiOptions = {}) => {
  const { method = "GET", headers = {}, body, token } = options;
  const finalHeaders: Record<string, string> = {
    "Content-Type": "application/json",
    ...headers,
  };
  if (token) {
    finalHeaders["Authorization"] = `Bearer ${token}`;
  }
  const res = await fetch(`${API_BASE_URL}${path}`, {
    method,
    headers: finalHeaders,
    body: body ? JSON.stringify(body) : undefined,
  });
  const contentType = res.headers.get("content-type") || "";
  const isJson = contentType.includes("application/json");
  const data = isJson ? await res.json() : await res.text();
  if (!res.ok) {
    const message = (isJson && (data as any)?.message) || res.statusText || "Request failed";
    throw new ApiError(res.status, message, data);
  }
  return data;
};