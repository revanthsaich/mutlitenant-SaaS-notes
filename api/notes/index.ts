import type { VercelRequest, VercelResponse } from "@vercel/node";
import { requireAuth } from "../_lib";
import { Store, FREE_NOTE_LIMIT } from "../../../server/core/store";
import { applyCors } from "../../_cors";

export default function handler(req: VercelRequest, res: VercelResponse) {
  if (applyCors(req, res)) return;
  const payload = requireAuth(req, res);
  if (!payload) return;
  const tenantId = payload.tenantId;
  if (req.method === "GET") {
    const items = Store.listNotes(tenantId);
    const tenant = Store.getTenantById(tenantId)!;
    const canCreate = tenant.plan === "pro" || items.length < FREE_NOTE_LIMIT;
    return res.status(200).json({ items, tenantPlan: tenant.plan, canCreate, limit: FREE_NOTE_LIMIT });
  }
  if (req.method === "POST") {
    const tenant = Store.getTenantById(tenantId)!;
    const currentCount = Store.listNotes(tenantId).length;
    if (tenant.plan === "free" && currentCount >= FREE_NOTE_LIMIT) {
      return res.status(402).json({ error: "Free plan limit reached", limit: FREE_NOTE_LIMIT });
    }
    const { title, content } = (req.body || {}) as { title?: string; content?: string };
    if (!title) return res.status(400).json({ error: "Title required" });
    const note = Store.createNote(tenantId, title, content ?? "");
    return res.status(201).json(note);
  }
  return res.status(405).json({ error: "Method Not Allowed" });
}
