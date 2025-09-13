import { Note, Plan, Tenant, User } from "./types";
import crypto from "node:crypto";

// In-memory store for demo and local dev. In production, back with a database.

// Seed tenants
const tenants: Record<string, Tenant> = {
  acme: { id: "acme", name: "Acme", plan: "free" },
  globex: { id: "globex", name: "Globex", plan: "free" },
};

// Seed users (password: "password")
const users: Record<string, User> = {};
function addUser(id: string, email: string, role: User["role"], tenantId: string) {
  users[id] = { id, email, password: "password", role, tenantId };
}
addUser("u1", "admin@acme.test", "admin", "acme");
addUser("u2", "user@acme.test", "member", "acme");
addUser("u3", "admin@globex.test", "admin", "globex");
addUser("u4", "user@globex.test", "member", "globex");

const notes: Record<string, Note> = {};

export const FREE_NOTE_LIMIT = 3;

export const Store = {
  getTenantBySlug(slug: string): Tenant | undefined {
    return tenants[slug];
  },
  getTenantById(id: string): Tenant | undefined {
    return tenants[id];
  },
  setTenantPlan(slug: string, plan: Plan) {
    const t = tenants[slug];
    if (t) t.plan = plan;
  },
  authenticate(email: string, password: string): { user: User; tenant: Tenant } | null {
    const user = Object.values(users).find((u) => u.email.toLowerCase() === email.toLowerCase());
    if (!user) return null;
    if (user.password !== password) return null;
    const tenant = tenants[user.tenantId];
    if (!tenant) return null;
    return { user, tenant };
  },
  listNotes(tenantId: string): Note[] {
    return Object.values(notes).filter((n) => n.tenantId === tenantId).sort((a, b) => b.createdAt - a.createdAt);
  },
  getNote(tenantId: string, id: string): Note | undefined {
    const n = notes[id];
    if (!n || n.tenantId !== tenantId) return undefined;
    return n;
  },
  createNote(tenantId: string, title: string, content: string): Note {
    const id = crypto.randomUUID();
    const now = Date.now();
    const note: Note = { id, tenantId, title, content, createdAt: now, updatedAt: now };
    notes[id] = note;
    return note;
  },
  updateNote(tenantId: string, id: string, title: string, content: string): Note | undefined {
    const note = notes[id];
    if (!note || note.tenantId !== tenantId) return undefined;
    note.title = title;
    note.content = content;
    note.updatedAt = Date.now();
    return note;
  },
  deleteNote(tenantId: string, id: string): boolean {
    const note = notes[id];
    if (!note || note.tenantId !== tenantId) return false;
    delete notes[id];
    return true;
  },
};
