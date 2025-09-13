export type Role = "admin" | "member";

export type Plan = "free" | "pro";

export interface Tenant {
  id: string; // slug-form id (e.g., "acme")
  name: string;
  plan: Plan;
}

export interface User {
  id: string;
  email: string;
  password: string; // plain for demo only
  role: Role;
  tenantId: string; // references Tenant.id
}

export interface Note {
  id: string;
  tenantId: string;
  title: string;
  content: string;
  createdAt: number;
  updatedAt: number;
}

export interface AuthTokenPayload {
  sub: string; // user id
  email: string;
  role: Role;
  tenantId: string;
  tenantSlug: string;
  iat: number;
  exp: number;
}

export interface LoginRequestBody {
  email: string;
  password: string;
}

export interface LoginResponse {
  token: string;
  user: { id: string; email: string; role: Role };
  tenant: { id: string; name: string; plan: Plan };
}
