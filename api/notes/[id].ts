import type { VercelRequest, VercelResponse } from "@vercel/node";
import { requireAuth } from "../_lib";
import { Store } from "../../../server/core/store";
import { applyCors } from "../../_cors";

export default function handler(req: VercelRequest, res: VercelResponse) {
  if (applyCors(req, res)) return;
  const payload = requireAuth(req, res);
  if (!payload) return;
  const tenantId = payload.tenantId;
  const id = req.query.id as string;

  if (req.method === "GET") {
    const note = Store.getNote(tenantId, id);
    if (!note) return res.status(404).json({ error: "Not found" });
    return res.status(200).json(note);
  }
  if (req.method === "PUT") {
    const { title, content } = (req.body || {}) as { title?: string; content?: string };
    if (!title) return res.status(400).json({ error: "Title required" });
    const note = Store.updateNote(tenantId, id, title, content ?? "");
    if (!note) return res.status(404).json({ error: "Not found" });
    return res.status(200).json(note);
  }
  if (req.method === "DELETE") {
    const ok = Store.deleteNote(tenantId, id);
    if (!ok) return res.status(404).json({ error: "Not found" });
    return res.status(204).end();
  }
  return res.status(405).json({ error: "Method Not Allowed" });
}
