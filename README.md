# Multi-tenant Notes (Acme & Globex)

A production-ready React + Express app showcasing strict multi-tenancy, JWT auth with roles, subscription gating, and a minimal UI. Includes both an integrated Express server and Vercel serverless API functions for deployment flexibility.

## Multi-tenancy Approach

Chosen: shared schema with a tenantId column.

- Tenants (Acme, Globex) have unique slugs (acme, globex).
- Every multi-tenant record (e.g., Note) includes a `tenantId` column.
- All queries are automatically scoped by the authenticated user's `tenantId` via middleware/utilities.
- Strict isolation: An entity is only returned/modified if its `tenantId` matches the current user's tenant.

Rationale:
- Simple and cost-effective for small to medium scale.
- Easy to evolve to schema-per-tenant or database-per-tenant later.
- Works well with common ORMs/DBs when you connect a real database.

## Authentication & Authorization

- JWT-based login: `POST /auth/login` with email/password.
- Roles: Admin (invite users, upgrade subscription), Member (CRUD notes).
- Test accounts (password: `password`):
  - admin@acme.test (Admin, Acme)
  - user@acme.test (Member, Acme)
  - admin@globex.test (Admin, Globex)
  - user@globex.test (Member, Globex)

## Subscription Gating

- Free plan: tenant can create up to 3 notes.
- Pro plan: unlimited notes.
- Upgrade endpoint (Admin only): `POST /tenants/:slug/upgrade` – takes effect immediately.

## API Endpoints

- `GET  /health` → { "status": "ok" }
- `POST /auth/login` → returns JWT and context
- Notes (all require Authorization: Bearer <token>):
  - `POST   /notes` – Create a note (enforces plan limit)
  - `GET    /notes` – List current tenant notes
  - `GET    /notes/:id` – Retrieve note
  - `PUT    /notes/:id` – Update note
  - `DELETE /notes/:id` – Delete note
- `POST /tenants/:slug/upgrade` – Admin only

CORS is enabled globally.

## Frontend

- Minimal UI (React + Tailwind) with:
  - Login using predefined accounts
  - Notes list/create/delete
  - Upgrade to Pro banner when hitting the Free limit (Admin can upgrade instantly)

## Local Development

- `pnpm dev` starts Vite (client + Express) on a single port.
- API paths are the same in dev and production.

## Deployment on Vercel

This repo includes Vercel serverless functions under `api/` that mirror the Express endpoints, so the app can be deployed fully on Vercel. Frontend is a static SPA; API is served via `api/*` serverless endpoints.

If you prefer a persistent database for production (recommended), connect to Neon/Postgres and migrate from the in-memory store. The current implementation uses an in-memory store for demo simplicity.

## Environment

- `JWT_SECRET` (optional): Secret for signing JWTs. Defaults to a development-only value.

## Security Notes

- Passwords are plain-text for demo purposes only. Do not use as-is in production.
- Replace the in-memory store with a real database and hashed passwords before going live.
