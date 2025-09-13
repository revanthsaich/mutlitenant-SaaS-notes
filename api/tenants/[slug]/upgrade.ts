import type { VercelRequest, VercelResponse } from "@vercel/node";
import { requireAuth } from "../../_lib";
import { Store } from "../../../../server/core/store";
import { applyCors } from "../../../_cors";

export default function handler(req: VercelRequest, res: VercelResponse) {
  if (applyCors(req, res)) return;
  const payload = requireAuth(req, res);
  if (!payload) return;
  if (req.method !== "POST") return res.status(405).json({ error: "Method Not Allowed" });
  if (payload.role !== "admin") return res.status(403).json({ error: "Forbidden" });
  const slug = req.query.slug as string;
  const tenant = Store.getTenantBySlug(slug);
  if (!tenant) return res.status(404).json({ error: "Tenant not found" });
  if (tenant.id !== payload.tenantId) return res.status(403).json({ error: "Forbidden" });
  Store.setTenantPlan(slug, "pro");
  const updated = Store.getTenantBySlug(slug)!;
  return res.status(200).json({ id: updated.id, name: updated.name, plan: updated.plan });
}
