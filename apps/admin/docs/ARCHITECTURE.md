# VenSai Venture Admin — `admin.vensailabs.in`

Single admin portal for **all** VenSai ventures (ROFYT, ROFABS, …). Not per-venture hosts like `admin-rofyt.*`.

## Tenancy

| Layer | Isolation |
|-------|-----------|
| **URL** | One host: `admin.vensailabs.in` |
| **Login** | Venture key + email + password |
| **MongoDB** | One cluster URI in `MONGODB_URI`; each venture gets its own **database** (e.g. `vensai_venture_rofyt`) |
| **Registry** | Platform DB `vensai_admin_platform` collection `ventures` tracks assignments |

CRM seeds admins via `POST /api/internal/provisioning/admin` (unchanged contract). Each seed registers the venture if needed and writes the user into that venture’s MongoDB database.

## Environment

See repo root `.env.example`. Minimum for admin deploy:

- `MONGODB_URI`
- `VENTURE_PROVISIONING_SECRET`

## Atlas automation (planned)

When `ATLAS_AUTO_CLUSTER=1` and API keys are set, future code can create a **dedicated cluster** per venture and store its URI on the venture registry document. Until then, all ventures share the cluster URI and differ by database name only.
