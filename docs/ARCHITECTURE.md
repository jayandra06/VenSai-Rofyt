# Rofyt architecture

## Products on one deployment

Single Next.js app on `rofyt.vensailabs.in` with two authenticated surfaces:

1. **Rofyt Admin** (`/admin/*`) — VenSai platform operator (marketplace, licensing, cross-tenant tools).
2. **Rofyt ERP** (`/erp/*`) — Each car rental company (fleet, locations, pricing, bookings, incidents).

Sessions are separate cookies (`rofyt_admin_session`, `rofyt_erp_session`) so Admin and ERP can be used in parallel in the same browser.

## Control plane vs data plane

| Layer | App | Database |
|-------|-----|----------|
| Control plane | VenSai Admin Portal (`admin.vensailabs.in`) | Central `vensai` — ventures, URI pools, cluster registry, SMTP |
| Platform runtime | Rofyt Admin `/admin` | Tenant DB `rofyt` (cluster **0**) |
| Company runtime | Rofyt ERP `/erp` | Tenant DB `rofyt-{n}` (cluster **n**) |

## Cluster model

Per MongoDB URI pool (700 slots):

- **0** — platform / Rofyt operator DB (`PLATFORM_DB`, default `rofyt`).
- **1…699** — customer organizations; org login code = cluster id; DB name `rofyt-{id}`.

When a pool is full, Admin Portal adds another URI; invites continue on the next pool.

## Auth records (`admins` collection)

| Role | App | orgCode | Created by |
|------|-----|---------|------------|
| `platform_admin` | `/admin` | `0` | **Seed account** in Admin Portal |
| `org_admin` | `/erp` | `1`, `2`, … | **Invite organization** in Admin Portal |

Passwords: scrypt hash; invited users get `mustChangePassword: true`.

## ERP domain model (target)

```
Organization
  └── Fleets (1..n)
        └── Locations (1..n per fleet or shared)
        └── Vehicles (photos, specs, status)
              └── Incidents / damage reports
              └── Pricing rules, rent calculator, adjustments
        └── Bookings (ERP + optional public microsite)
```

## Public surfaces (planned)

- **Global marketplace** — `rofyt.vensailabs.in` catalog aggregating opt-in fleet inventory from all tenants.
- **Tenant microsite** — lightweight booking page on customer domain, backed by same tenant DB.
- **Mobile** — consumer app for marketplace; optional white-label app for large operators.

## Integration points

- Admin Portal **Seed** → upsert `platform_admin` in `rofyt` DB.
- Admin Portal **Invite** → create `rofyt-n`, org + org_admin, email with `/erp/login` link.
- Future: webhooks / sync jobs to publish vehicles to marketplace index.
