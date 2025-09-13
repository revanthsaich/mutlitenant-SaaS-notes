import { RequestHandler } from "express";
import { verifyJWT } from "../core/jwt";
import { Role } from "../core/types";

export interface AuthedRequest extends Request {
  user?: {
    id: string;
    email: string;
    role: Role;
    tenantId: string;
    tenantSlug: string;
  };
}

export const requireAuth: RequestHandler = (req: AuthedRequest, res, next) => {
  const header = req.headers["authorization"] || req.headers["Authorization"];
  const token = typeof header === "string" && header.startsWith("Bearer ") ? header.slice(7) : undefined;
  if (!token) return res.status(401).json({ error: "Unauthorized" });
  const payload = verifyJWT(token);
  if (!payload) return res.status(401).json({ error: "Invalid token" });
  req.user = {
    id: payload.sub,
    email: payload.email,
    role: payload.role,
    tenantId: payload.tenantId,
    tenantSlug: payload.tenantSlug,
  };
  next();
};

export const requireRole = (role: Role): RequestHandler => (req: AuthedRequest, res, next) => {
  if (!req.user) return res.status(401).json({ error: "Unauthorized" });
  if (req.user.role !== role) return res.status(403).json({ error: "Forbidden" });
  next();
};
