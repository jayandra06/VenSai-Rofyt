# VenSai Rofyt

Next.js car rental platform for **VenSai Labs** (operator) and **licensed rental companies** (tenants).

| URL (production target) | Audience | Login |
|---------------------------|----------|--------|
| `rofyt.vensailabs.in/` | Public hub | Links to Admin / ERP |
| `rofyt.vensailabs.in/admin` | Platform owner (you) | Email + password — **Seed account** in [VenSai Admin Portal](https://admin.vensailabs.in) → Ventures → Rofyt (cluster **0**, DB `rofyt`) |
| `rofyt.vensailabs.in/erp` | Car rental companies | Org code **1+**, email, temp password from invitation |

## Local development

```bash
npm install
npm run dev
```

Open [http://localhost:3001](http://localhost:3001). ERP login: [http://localhost:3001/erp/login](http://localhost:3001/erp/login). Admin: [http://localhost:3001/admin/login](http://localhost:3001/admin/login).

`.env.local`:

- `MONGODB_URI` — same Atlas host as saved in Admin Portal venture `.env`
- `PLATFORM_DB=rofyt`
- `AUTH_SECRET` — long random string

## Tenancy

- **Cluster 0** → database `rofyt` (platform)
- **Cluster N** → database `rofyt-N` (customer org), org code = `N`

Provisioning (invite, DB create, email) is done from the **VenSai Admin Portal**, not from this app’s `.env` store.

## Docs

- [docs/ARCHITECTURE.md](./docs/ARCHITECTURE.md) — system design
- [docs/ROADMAP.md](./docs/ROADMAP.md) — phased ERP + marketplace + mobile

## Repository

GitHub: [jayandra06/VenSai-Rofyt](https://github.com/jayandra06/VenSai-Rofyt.git)
