# VenSai Venture Admin — `admin.vensailabs.in`

## Central MongoDB (server `.env`)

| Variable | Purpose |
|----------|---------|
| `MONGODB_URI` | Boots the admin portal and stores the **registry** |
| `MONGODB_DB_NAME` | Central DB name (default `vensai_admin`) |

## Venture cluster registry (UI)

After login: **Dashboard → Manage venture MongoDB clusters**

| Action | What it does |
|--------|----------------|
| **Test & save URI** | Pings the URI, stores it on `venture_mongo_clusters` for that venture key (for CRM `.env` / next app) |
| **Create Atlas cluster** | Uses Atlas Admin API (if `ATLAS_*` env set), saves `provisioning` until **Refresh** returns the SRV URI |
| **List** | All ventures → cluster URI / status |

Collection: `venture_mongo_clusters` in the central database.
