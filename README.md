# TransitOps — Smart Transport Operations Platform

A centralized transport operations platform for logistics teams. Replaces spreadsheets and manual logbooks with a live system for vehicle registration, driver compliance, trip dispatching, maintenance tracking, fuel logs, expenses, and analytics.

> Built for the Odoo Hackathon by **Team Viraasat**.

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend | React + TypeScript + Vite, Tailwind CSS, Recharts, Lucide Icons |
| Backend | Node.js + Express + TypeScript |
| Database | PostgreSQL 16 (Docker) |
| ORM | Prisma |
| Auth | JWT in HTTP-only cookie, bcrypt password hashing |
| Realtime | Socket.IO |
| Validation | Zod (backend), React Hook Form (frontend) |
| Security | Helmet, CORS, express-rate-limit |

## Quick Start

### Prerequisites

- **Node.js** ≥ 18
- **Docker** & Docker Compose
- **npm**

### 1. Clone

```bash
git clone https://github.com/Team-Viraasat/TransitOps_Odoo_Hackathon.git
cd TransitOps_Odoo_Hackathon
```

### 2. Start Database

```bash
docker compose up -d
```

PostgreSQL 16 starts on port **5433** (avoids conflicts with local installs). Verify with:

```bash
docker compose ps   # should show transitops-db-1 as healthy
```

### 3. Setup & Run API

```bash
cd api
cp .env.example .env
npm install
npx prisma migrate deploy
npx tsx prisma/seed.ts
npm run dev
```

API runs at **http://localhost:4000**. Health check:

```bash
curl http://localhost:4000/api/health
# → {"ok":true,"service":"transitops-api"}
```

### 4. Setup & Run Frontend

```bash
cd frontend
npm install
npm run dev
```

Frontend runs at **http://localhost:5173**.

### 5. Open the App

Visit **http://localhost:5173** and login with any demo account below.

## Demo Accounts

All passwords: `password123`

| Role | Email | Access |
|---|---|---|
| Fleet Manager | `fleet@transitops.local` | Vehicles, Maintenance |
| Dispatcher | `dispatch@transitops.local` | Trips, Fuel, Expenses |
| Safety Officer | `safety@transitops.local` | Drivers, Compliance |
| Financial Analyst | `finance@transitops.local` | Analytics, CSV Export |
| Admin | `admin@transitops.local` | Full access + Settings |

## Demo Script (for Judges)

1. **Login** as Dispatcher → see Dashboard KPIs and live vehicle status
2. **Vehicle Registry** → show Available, On Trip, In Shop, Retired statuses
3. **Drivers** → show expired license, suspended, on-trip states
4. **Create trip** with cargo weight above vehicle capacity → dispatch is **blocked**
5. **Fix cargo weight** and dispatch → vehicle and driver become **On Trip**
6. **Dashboard** → KPIs update (fleet utilization changes)
7. **Complete trip** with odometer/fuel → statuses **restore to Available**
8. **Create maintenance** → vehicle becomes **In Shop**
9. **Trip Dispatcher** → In Shop vehicle is **hidden** from selection
10. **Analytics** → operational cost, fuel efficiency, ROI, **CSV export**
11. **Settings** → role permission matrix

## API Endpoints

### Auth
- `POST /api/auth/login` — returns JWT in HTTP-only cookie
- `POST /api/auth/logout` — clears cookie
- `GET /api/auth/me` — returns current user

### Dashboard
- `GET /api/dashboard/kpis` — active vehicles, fleet utilization, etc.
- `GET /api/dashboard/recent-trips`
- `GET /api/dashboard/vehicle-status-breakdown`

### Vehicles
- `GET /api/vehicles` — paginated, filterable by `?search=&type=&status=&region=`
- `GET /api/vehicles/available-for-dispatch` — only Available vehicles
- `GET /api/vehicles/:id`
- `POST /api/vehicles`
- `PATCH /api/vehicles/:id`
- `PATCH /api/vehicles/:id/retire`

### Drivers
- `GET /api/drivers` — paginated, filterable by `?search=&status=&licenseCategory=`
- `GET /api/drivers/available-for-dispatch` — Available + non-expired license
- `GET /api/drivers/:id`
- `POST /api/drivers`
- `PATCH /api/drivers/:id`
- `PATCH /api/drivers/:id/status`

### Trips
- `GET /api/trips` — filterable by `?status=&vehicleId=&driverId=`
- `GET /api/trips/:id`
- `POST /api/trips` — create Draft with optional vehicle/driver
- `POST /api/trips/:id/dispatch` — transactional: validates + updates statuses
- `POST /api/trips/:id/complete` — restores resources, creates fuel log
- `POST /api/trips/:id/cancel` — restores resources if dispatched

### Maintenance
- `GET /api/maintenance` — filterable by `?vehicleId=&status=`
- `POST /api/maintenance` — transactional: vehicle → In Shop
- `PATCH /api/maintenance/:id`
- `POST /api/maintenance/:id/close` — transactional: vehicle → Available

### Fuel & Expenses
- `GET /api/fuel-logs`, `POST /api/fuel-logs`
- `GET /api/expenses`, `POST /api/expenses`

### Analytics
- `GET /api/analytics/summary` — fuel efficiency, costs, revenue, profit
- `GET /api/analytics/fuel-efficiency` — per-trip km/L
- `GET /api/analytics/fleet-utilization` — vehicle status breakdown
- `GET /api/analytics/operational-cost` — fuel + maintenance + other
- `GET /api/analytics/vehicle-roi` — per-vehicle ROI percentage
- `GET /api/analytics/export.csv` — live CSV download

### Settings
- `GET /api/settings` — depot name, currency, roles
- `PATCH /api/settings`

## Realtime Events (Socket.IO)

After mutations, the backend emits events so the frontend can refetch:

`dashboard:updated` · `vehicles:updated` · `drivers:updated` · `trips:updated` · `maintenance:updated` · `fuel:updated` · `expenses:updated` · `analytics:updated`

## Business Rules

| Rule | Enforcement |
|---|---|
| Dispatch is **transactional** | Vehicle + driver + trip updated atomically |
| Vehicle must be `Available` to dispatch | Backend rejects with `VEHICLE_UNAVAILABLE` |
| Driver must be `Available` + valid license | Backend checks expiry against server date |
| Cargo weight ≤ vehicle capacity | Backend rejects with `CAPACITY_EXCEEDED` |
| Complete trip restores resources | Vehicle→Available, driver→Available, odometer updated |
| Cancel dispatched trip restores resources | Same as completion |
| Active maintenance → vehicle `In Shop` | Transactional, blocks duplicate active maintenance |
| Close maintenance → vehicle `Available` | Unless vehicle is `Retired` |
| Retired vehicles are **permanent** | Cannot be dispatched or restored |
| Unique constraints | Registration numbers, license numbers, trip codes |
| RBAC per module | Each role has specific permissions; Admin has full access |

## Analytics Formulas

```
Fuel Efficiency    = Total Distance / Total Fuel Consumed (km/L)
Fleet Utilization  = Vehicles On Trip / Total Active Vehicles × 100
Operational Cost   = Fuel Cost + Maintenance Cost
Vehicle ROI        = (Revenue − Maintenance − Fuel) / Acquisition Cost × 100
```

## Project Structure

```
TransitOps/
├── api/                        # Express + TypeScript backend
│   ├── prisma/
│   │   ├── schema.prisma       # 10 models, all indexes
│   │   ├── seed.ts             # Demo data (30+ records)
│   │   └── migrations/         # PostgreSQL migration
│   └── src/
│       ├── config/env.ts       # Zod-validated env
│       ├── db/prisma.ts        # Singleton client
│       ├── middleware/         # auth, rbac, validate, error
│       ├── modules/            # auth, vehicles, drivers, trips,
│       │                       # maintenance, fuel, expenses,
│       │                       # analytics, dashboard, settings
│       ├── realtime/socket.ts  # Socket.IO events
│       ├── utils/              # Shared helpers
│       └── server.ts           # Entry point
├── frontend/                   # React + Vite
│   └── src/
│       ├── app/components/     # UI, screens, layout
│       └── app/lib/            # API hooks, store, types
├── docker-compose.yml          # PostgreSQL service
└── README.md
```
