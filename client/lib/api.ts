import { getToken } from "./auth";

export async function api(path: string, options: RequestInit = {}) {
  const token = getToken();
  const headers: HeadersInit = {
    "Content-Type": "application/json",
    ...(options.headers || {}),
  };
  if (token) (headers as any)["Authorization"] = `Bearer ${token}`;
  const res = await fetch(path, { ...options, headers });
  const contentType = res.headers.get("content-type") || "";
  const body = contentType.includes("application/json") ? await res.json() : await res.text();
  if (!res.ok) {
    throw { status: res.status, body };
  }
  return body;
}
