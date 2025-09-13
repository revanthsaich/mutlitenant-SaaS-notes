import { RequestHandler } from "express";
import { Store, FREE_NOTE_LIMIT } from "../core/store";
import { signJWT } from "../core/jwt";
import { AuthedRequest } from "../middleware/auth";

export const health: RequestHandler = (_req, res) => {
  res.json({ status: "ok" });
};

export const login: RequestHandler = (req, res) => {
  const { email, password } = req.body ?? {};
  if (!email || !password) return res.status(400).json({ error: "Email and password required" });
  const auth = Store.authenticate(email, password);
  if (!auth) return res.status(401).json({ error: "Invalid credentials" });
  const { user, tenant } = auth;
  const token = signJWT({
    sub: user.id,
    email: user.email,
    role: user.role,
    tenantId: tenant.id,
    tenantSlug: tenant.id,
  });
  res.json({
    token,
    user: { id: user.id, email: user.email, role: user.role },
    tenant: { id: tenant.id, name: tenant.name, plan: tenant.plan },
  });
};

export const listNotes: RequestHandler = (req: AuthedRequest, res) => {
  const tenantId = req.user!.tenantId;
  const items = Store.listNotes(tenantId);
  const tenant = Store.getTenantById(tenantId)!;
  const canCreate = tenant.plan === "pro" || items.length < FREE_NOTE_LIMIT;
  res.json({ items, tenantPlan: tenant.plan, canCreate, limit: FREE_NOTE_LIMIT });
};

export const getNote: RequestHandler = (req: AuthedRequest, res) => {
  const tenantId = req.user!.tenantId;
  const note = Store.getNote(tenantId, req.params.id);
  if (!note) return res.status(404).json({ error: "Not found" });
  res.json(note);
};

export const createNote: RequestHandler = (req: AuthedRequest, res) => {
  const tenantId = req.user!.tenantId;
  const tenant = Store.getTenantById(tenantId)!;
  const currentCount = Store.listNotes(tenantId).length;
  if (tenant.plan === "free" && currentCount >= FREE_NOTE_LIMIT) {
    return res.status(402).json({ error: "Free plan limit reached", limit: FREE_NOTE_LIMIT });
  }
  const { title, content } = req.body ?? {};
  if (!title) return res.status(400).json({ error: "Title required" });
  const note = Store.createNote(tenantId, title, content ?? "");
  res.status(201).json(note);
};

export const updateNote: RequestHandler = (req: AuthedRequest, res) => {
  const tenantId = req.user!.tenantId;
  const { title, content } = req.body ?? {};
  if (!title) return res.status(400).json({ error: "Title required" });
  const note = Store.updateNote(tenantId, req.params.id, title, content ?? "");
  if (!note) return res.status(404).json({ error: "Not found" });
  res.json(note);
};

export const deleteNote: RequestHandler = (req: AuthedRequest, res) => {
  const tenantId = req.user!.tenantId;
  const ok = Store.deleteNote(tenantId, req.params.id);
  if (!ok) return res.status(404).json({ error: "Not found" });
  res.status(204).end();
};

export const upgradeTenant: RequestHandler = (req: AuthedRequest, res) => {
  const slug = req.params.slug;
  const tenant = Store.getTenantBySlug(slug);
  if (!tenant) return res.status(404).json({ error: "Tenant not found" });
  if (tenant.id !== req.user!.tenantId) return res.status(403).json({ error: "Forbidden" });
  Store.setTenantPlan(slug, "pro");
  const updated = Store.getTenantBySlug(slug)!;
  res.json({ id: updated.id, name: updated.name, plan: updated.plan });
};
