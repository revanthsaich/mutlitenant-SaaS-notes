import type { VercelRequest, VercelResponse } from "@vercel/node";
import { verifyJWT } from "../server/core/jwt";

export function requireAuth(req: VercelRequest, res: VercelResponse) {
  const header = (req.headers["authorization"] || req.headers["Authorization"]) as string | undefined;
  const token = header && header.startsWith("Bearer ") ? header.slice(7) : undefined;
  if (!token) {
    res.status(401).json({ error: "Unauthorized" });
    return null;
  }
  const payload = verifyJWT(token);
  if (!payload) {
    res.status(401).json({ error: "Invalid token" });
    return null;
  }
  return payload;
}
