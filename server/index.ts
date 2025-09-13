import "dotenv/config";
import express from "express";
import cors from "cors";
import { handleDemo } from "./routes/demo";
import { requireAuth, requireRole } from "./middleware/auth";
import { health, login, listNotes, getNote, createNote, updateNote, deleteNote, upgradeTenant } from "./routes/app";

export function createServer() {
  const app = express();

  // Middleware
  app.use(cors({ origin: "*" }));
  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));

  // Health
  app.get("/health", health);

  // Example API routes
  app.get("/api/ping", (_req, res) => {
    const ping = process.env.PING_MESSAGE ?? "ping";
    res.json({ message: ping });
  });

  app.get("/api/demo", handleDemo);

  // Auth
  app.post("/auth/login", login);
  app.post("/api/auth/login", login);

  // Notes (protected)
  app.get("/notes", requireAuth, listNotes);
  app.post("/notes", requireAuth, createNote);
  app.get("/notes/:id", requireAuth, getNote);
  app.put("/notes/:id", requireAuth, updateNote);
  app.delete("/notes/:id", requireAuth, deleteNote);
  // Mirror under /api for Vercel parity in dev
  app.get("/api/notes", requireAuth, listNotes);
  app.post("/api/notes", requireAuth, createNote);
  app.get("/api/notes/:id", requireAuth, getNote);
  app.put("/api/notes/:id", requireAuth, updateNote);
  app.delete("/api/notes/:id", requireAuth, deleteNote);

  // Upgrade (admin only)
  app.post("/tenants/:slug/upgrade", requireAuth, requireRole("admin"), upgradeTenant);
  app.post("/api/tenants/:slug/upgrade", requireAuth, requireRole("admin"), upgradeTenant);

  return app;
}
