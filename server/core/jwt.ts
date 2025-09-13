import crypto from "node:crypto";
import { AuthTokenPayload } from "./types";

// Simple HS256 JWT utilities (for demo). In production, rotate secrets and use a vetted library.
const SECRET = process.env.JWT_SECRET || "dev_secret_change_me";

function base64urlEncode(input: Buffer | string): string {
  const buff = Buffer.isBuffer(input) ? input : Buffer.from(input);
  return buff
    .toString("base64")
    .replace(/=/g, "")
    .replace(/\+/g, "-")
    .replace(/\//g, "_");
}

function base64urlDecode(input: string): Buffer {
  const pad = input.length % 4 === 0 ? "" : "===".slice(0, 4 - (input.length % 4));
  const base64 = input.replace(/-/g, "+").replace(/_/g, "/") + pad;
  return Buffer.from(base64, "base64");
}

export function signJWT(payload: Omit<AuthTokenPayload, "iat" | "exp">, expiresInSeconds = 60 * 60 * 24): string {
  const header = { alg: "HS256", typ: "JWT" };
  const iat = Math.floor(Date.now() / 1000);
  const exp = iat + expiresInSeconds;
  const fullPayload: AuthTokenPayload = { ...payload, iat, exp } as AuthTokenPayload;

  const headerB64 = base64urlEncode(JSON.stringify(header));
  const payloadB64 = base64urlEncode(JSON.stringify(fullPayload));
  const data = `${headerB64}.${payloadB64}`;
  const signature = crypto.createHmac("sha256", SECRET).update(data).digest();
  const signatureB64 = base64urlEncode(signature);
  return `${data}.${signatureB64}`;
}

export function verifyJWT(token: string): AuthTokenPayload | null {
  const parts = token.split(".");
  if (parts.length !== 3) return null;
  const [headerB64, payloadB64, sigB64] = parts;
  const data = `${headerB64}.${payloadB64}`;
  const expectedSig = crypto.createHmac("sha256", SECRET).update(data).digest();
  const expectedSigB64 = base64urlEncode(expectedSig);
  if (!crypto.timingSafeEqual(Buffer.from(sigB64), Buffer.from(expectedSigB64))) return null;

  try {
    const payloadJson = base64urlDecode(payloadB64).toString("utf8");
    const payload = JSON.parse(payloadJson) as AuthTokenPayload;
    if (payload.exp && payload.exp < Math.floor(Date.now() / 1000)) return null;
    return payload;
  } catch {
    return null;
  }
}
