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

Health: `GET /api/health`  
Provisioning (CRM → target): `POST /api/internal/provisioning/admin` with `Authorization: Bearer <VENTURE_PROVISIONING_SECRET>`

## CRM integration

See `next-crm-app/docs/ventures/ARCHITECTURE.md`. CRM registers targets, tests health, then seeds admins — **only after** ROFYT returns real success (not mocked).

## Phase status

- [x] Monorepo + contract + health endpoints
- [ ] ERP/Admin auth + PostgreSQL
- [ ] Real admin seeding in provisioning handlers
- [ ] Deploy to `*.vensailabs.in`
