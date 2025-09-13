import type { VercelRequest, VercelResponse } from "@vercel/node";
import { Store } from "../../../server/core/store";
import { signJWT } from "../../../server/core/jwt";
import { applyCors } from "../../_cors";

export default function handler(req: VercelRequest, res: VercelResponse) {
  if (applyCors(req, res)) return;
  if (req.method !== "POST") return res.status(405).json({ error: "Method Not Allowed" });
  const { email, password } = (req.body || {}) as { email?: string; password?: string };
  if (!email || !password) return res.status(400).json({ error: "Email and password required" });
  const auth = Store.authenticate(email, password);
  if (!auth) return res.status(401).json({ error: "Invalid credentials" });
  const { user, tenant } = auth;
  const token = signJWT({ sub: user.id, email: user.email, role: user.role, tenantId: tenant.id, tenantSlug: tenant.id });
  res.status(200).json({ token, user: { id: user.id, email: user.email, role: user.role }, tenant: { id: tenant.id, name: tenant.name, plan: tenant.plan } });
}
