# Rofyt development roadmap

Phased delivery with git commits per milestone. Status: **Phase 1 in progress**.

## Phase 1 — Foundation (current)

- [x] Split `/admin` and `/erp` apps, separate sessions
- [x] ERP login with org code + forced password change
- [x] Platform admin login (cluster 0) aligned with Admin Portal seed
- [x] Tenant dashboard stubs (overview, fleets, locations)
- [ ] Admin Portal: set Rofyt **Deployed URL** to `https://rofyt.vensailabs.in`
- [ ] Seed platform admin in production; send first org invite (cluster **1**)

## Phase 2 — Fleet & locations

- [ ] CRUD fleets (multi-fleet per org)
- [ ] CRUD locations linked to fleets
- [ ] Vehicle records linked to fleet + home location
- [ ] Vehicle photo upload (object storage TBD)

## Phase 3 — Operations

- [ ] Incident / accident reports
- [ ] Damage calculator + repair cost lines
- [ ] Rent calculator + seasonal price adjustments
- [ ] Availability calendar per vehicle

## Phase 4 — Bookings

- [ ] Internal booking flow in ERP
- [ ] Tenant lightweight booking page (subdomain or custom domain)
- [ ] Payments integration (TBD provider)

## Phase 5 — Global Rofyt marketplace

- [ ] Publish pipeline from tenant DB → platform search index
- [ ] Public search & book on `rofyt.vensailabs.in`
- [ ] Revenue / commission rules in Rofyt Admin

## Phase 6 — Mobile

- [ ] React Native (or Expo) app for marketplace consumers
- [ ] Optional operator app (fleet check-in/out, photos)
- [ ] Shared API layer (Next.js route handlers or dedicated API)

## Development records

Track work in git commit messages and this file. Major features merge to `main` on [VenSai-Rofyt](https://github.com/jayandra06/VenSai-Rofyt.git); Admin Portal changes on [VenSai-Admin](https://github.com/jayandra06/VenSai-Admin.git).
