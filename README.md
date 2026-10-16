# ROFYT — Car Rental ERP (VenSai Labs)

Git: [github.com/jayandra06/rofyt-vensailabs](https://github.com/jayandra06/rofyt-vensailabs)

Monorepo for **ROFYT ERP** and **ROFYT Admin Portal**, provisioned from **VenSai CRM → Ventures**.

## Structure

| Path | Role |
|------|------|
| `apps/erp` | Main ERP (`rofyt.vensailabs.in`) |
| `apps/admin` | Admin portal (`admin-rofyt.vensailabs.in`) |
| `packages/provisioning-contract` | Shared health/provisioning API types |

## Local dev

```bash
pnpm install
pnpm dev:erp    # http://localhost:3100
pnpm dev:admin  # http://localhost:3101
```

## Deploy on Vercel (pnpm monorepo)

This repo uses **pnpm workspaces** (`workspace:*`). Vercel must **not** use plain `npm install`.

1. Create **two** Vercel projects from this GitHub repo (or one for ERP first):
   - **ROFYT ERP** — set **Root Directory** to `apps/erp`
   - **ROFYT Admin** — set **Root Directory** to `apps/admin`
2. Leave **Install Command** empty (each app’s `vercel.json` runs `pnpm install` from the repo root).
3. Commit **`pnpm-lock.yaml`** so Vercel detects pnpm via `packageManager` in the root `package.json`.

Domains (when ready): `rofyt.vensailabs.in` → ERP project, `admin-rofyt.vensailabs.in` → Admin project.

Health: `GET /api/health`  
Provisioning (CRM → target): `POST /api/internal/provisioning/admin` with `Authorization: Bearer <VENTURE_PROVISIONING_SECRET>`

## CRM integration

See `next-crm-app/docs/ventures/ARCHITECTURE.md`. CRM registers targets, tests health, then seeds admins — **only after** ROFYT returns real success (not mocked).

## Phase status

- [x] Monorepo + contract + health endpoints
- [ ] ERP/Admin auth + PostgreSQL
- [ ] Real admin seeding in provisioning handlers
- [ ] Deploy to `*.vensailabs.in`
