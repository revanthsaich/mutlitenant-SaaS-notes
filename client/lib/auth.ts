export type DecodedToken = {
  sub: string;
  email: string;
  role: "admin" | "member";
  tenantId: string;
  tenantSlug: string;
  exp: number;
  iat: number;
};

function b64urlToJson<T>(segment: string): T | null {
  try {
    const b64 = segment.replace(/-/g, "+").replace(/_/g, "/");
    const pad = b64.length % 4 === 0 ? "" : "===".slice(0, 4 - (b64.length % 4));
    const json = atob(b64 + pad);
    return JSON.parse(json) as T;
  } catch {
    return null;
  }
}

export function decodeToken(token: string | null): DecodedToken | null {
  if (!token) return null;
  const parts = token.split(".");
  if (parts.length !== 3) return null;
  return b64urlToJson<DecodedToken>(parts[1]);
}

const TOKEN_KEY = "app_token";

export function getToken(): string | null {
  return localStorage.getItem(TOKEN_KEY);
}
export function setToken(token: string | null) {
  if (token) localStorage.setItem(TOKEN_KEY, token);
  else localStorage.removeItem(TOKEN_KEY);
}
