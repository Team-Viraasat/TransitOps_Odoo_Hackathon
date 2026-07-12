# TransitOps

Smart transport operations platform for the Odoo hackathon.

The current repo contains the provided React frontend in `frontend/` and a local-first Express/PostgreSQL backend in `api/`.

## Tech Stack

- Frontend: React, TypeScript, Vite, Tailwind CSS, Lucide React, Recharts
- Backend: Node.js, Express, TypeScript
- Database: PostgreSQL local
- ORM: Prisma
- Auth: JWT access token in secure HTTP-only cookie
- Validation: Zod on API boundaries
- Realtime: Socket.IO
- CSV: backend-generated from live database queries

## Backend Quick Start

```bash
docker compose up -d
cd api
copy .env.example .env
npm install
npm run prisma:migrate -- --name init
npm run prisma:seed
npm run dev
```

API health check:

```bash
GET http://localhost:4000/api/health
```

Frontend origin defaults to `http://localhost:5173`.

## Demo Accounts

All seeded users use password `password123`.

| Role | Email |
|---|---|
| Fleet Manager | `fleet@transitops.local` |
| Dispatcher | `dispatch@transitops.local` |
| Safety Officer | `safety@transitops.local` |
| Financial Analyst | `finance@transitops.local` |
| Admin | `admin@transitops.local` |

## Main API Contract

Auth:

- `POST /api/auth/login`
- `POST /api/auth/logout`
- `GET /api/auth/me`

Vehicles:

- `GET /api/vehicles`
- `GET /api/vehicles/available-for-dispatch`
- `GET /api/vehicles/:id`
- `POST /api/vehicles`
- `PATCH /api/vehicles/:id`
- `PATCH /api/vehicles/:id/retire`

Drivers:

- `GET /api/drivers`
- `GET /api/drivers/available-for-dispatch`
- `GET /api/drivers/:id`
- `POST /api/drivers`
- `PATCH /api/drivers/:id`
- `PATCH /api/drivers/:id/status`

Trips:

- `GET /api/trips`
- `GET /api/trips/:id`
- `POST /api/trips`
- `POST /api/trips/:id/dispatch`
- `POST /api/trips/:id/complete`
- `POST /api/trips/:id/cancel`

Maintenance, fuel, expenses:

- `GET /api/maintenance`
- `POST /api/maintenance`
- `PATCH /api/maintenance/:id`
- `POST /api/maintenance/:id/close`
- `GET /api/fuel-logs`
- `POST /api/fuel-logs`
- `GET /api/expenses`
- `POST /api/expenses`

Dashboard and analytics:

- `GET /api/dashboard/kpis`
- `GET /api/dashboard/recent-trips`
- `GET /api/dashboard/vehicle-status-breakdown`
- `GET /api/analytics/summary`
- `GET /api/analytics/fuel-efficiency`
- `GET /api/analytics/fleet-utilization`
- `GET /api/analytics/operational-cost`
- `GET /api/analytics/vehicle-roi`
- `GET /api/analytics/export.csv`

Settings:

- `GET /api/settings`
- `PATCH /api/settings`

## Realtime Events

The backend emits Socket.IO events after meaningful mutations:

- `dashboard:updated`
- `vehicles:updated`
- `drivers:updated`
- `trips:updated`
- `maintenance:updated`
- `fuel:updated`
- `expenses:updated`
- `analytics:updated`

The frontend should refetch affected queries when these events arrive.

## Backend Business Rules

- Dispatch runs in one transaction.
- Vehicle and driver must be `Available` before dispatch.
- Expired-license, suspended, off-duty, in-shop, retired, or on-trip resources are blocked.
- Cargo weight cannot exceed vehicle capacity.
- Dispatch changes vehicle and driver to `On Trip`.
- Completing or cancelling a dispatched trip restores vehicle and driver to `Available`.
- Active maintenance changes vehicle to `In Shop`.
- Closing maintenance restores vehicle to `Available` unless retired.
- CSV export is generated from live database queries.

## Version Control

This downloaded folder is not currently a git repository. Initialize it before team work:

```bash
git init
git add .
git commit -m "feat: add transitops backend api"
```

Recommended follow-up commits:

- `feat: connect frontend auth to backend`
- `feat: connect vehicle and driver screens to api`
- `feat: connect trip dispatcher workflow`
- `feat: add dashboard realtime refetch`
