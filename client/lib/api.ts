import { getToken, setToken } from "./auth";

// On page load, ensure token is loaded from localStorage
let cachedToken: string | null = null;
if (typeof window !== "undefined") {
  cachedToken = getToken();
}

export async function api(path: string, options: RequestInit = {}) {
  // Prepend /api in development if not already present
  let apiPath = path;
  if (import.meta.env.DEV && !apiPath.startsWith("/api/")) {
    apiPath = apiPath.startsWith("/") ? `/api${apiPath}` : `/api/${apiPath}`;
  }
  const token = typeof window !== "undefined" ? getToken() : cachedToken;
  const headers: HeadersInit = {
    "Content-Type": "application/json",
    ...(options.headers || {}),
  };
  if (token) (headers as any)["Authorization"] = `Bearer ${token}`;
  const res = await fetch(apiPath, { ...options, headers });
  const contentType = res.headers.get("content-type") || "";
  const body = contentType.includes("application/json") ? await res.json() : await res.text();
  if (!res.ok) {
    // If unauthorized, clear token
    if (res.status === 401) setToken(null);
    throw { status: res.status, body };
  }
  return body;
}
