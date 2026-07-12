# TransitOps Master Implementation Document

Version: 1.0  
Build target: 6-hour hackathon execution plan  
Official brief duration: 8 hours  
Project: TransitOps - Smart Transport Operations Platform

## 1. Source Material Reviewed

This document is based on the local project assets:

- `TransitOps Smart Transport Operations Platform.pdf`
- `Transitops - smart transport operations platform  - 8 hours.excalidraw`
- `Transitops - smart transport operations platform  - 8 hours.png`
- `Transitops - smart transport operations platform  - 8 hours.svg`

The Excalidraw mockup is readable locally and has been reviewed. It defines a dark ERP-style UI with these screens:

- Authentication with RBAC
- Dashboard
- Vehicle Registry
- Drivers and Safety Profiles
- Trip Dispatcher
- Maintenance
- Fuel and Expense Management
- Reports and Analytics
- Settings and RBAC

## 2. Product Objective

TransitOps is a centralized transport operations platform for logistics teams. It replaces spreadsheets and manual logbooks with a live system for vehicle registration, driver compliance, trip dispatching, maintenance tracking, fuel logs, expenses, and analytics.

The project must feel like a lightweight ERP module: structured, operational, role-based, data-driven, and reliable under business constraints.

## 3. Hackathon Winning Angle

The judging criteria strongly favor:

- Scalable, well-structured, clear code
- Proper local database design with MySQL or PostgreSQL
- No Firebase or Supabase
- Minimal third-party APIs
- Realtime and dynamic data, not static JSON
- Robust input validation
- Version controlled work
- Interactive, clean, consistent UI
- Modularity and security
- Attention to detail

Therefore, prioritize a complete, coherent MVP over many incomplete bonus features.

The strongest demo story:

1. Fleet manager adds a vehicle.
2. Safety/operations user adds a valid driver.
3. Dispatcher creates a trip.
4. System blocks invalid dispatches automatically.
5. Dispatch changes vehicle and driver to `On Trip`.
6. Dashboard KPIs update live.
7. Completing trip returns vehicle and driver to `Available`.
8. Maintenance moves vehicle to `In Shop` and removes it from dispatch.
9. Analytics update from real database records.

## 4. Recommended Tech Stack

Use a practical local-first stack:

- Frontend: React + TypeScript + Vite
- Styling: Tailwind CSS
- UI helpers: Lucide React icons, Recharts for charts
- Backend: Node.js + Express + TypeScript
- Database: PostgreSQL local
- ORM: Prisma
- Auth: JWT access token in secure HTTP-only cookie
- Password hashing: bcrypt
- Realtime: Socket.IO
- Validation: Zod on API boundaries, React Hook Form on forms
- CSV export: Backend-generated CSV from live database queries

Avoid:

- Firebase
- Supabase
- Static JSON data as the app data source
- Heavy third-party APIs
- Unnecessary AI/chatbot unless the core workflow is already complete

## 5. System Architecture

```mermaid
flowchart LR
  Browser["React Web App"] --> API["Express API"]
  Browser <--> Socket["Socket.IO Realtime Channel"]
  API --> Prisma["Prisma ORM"]
  Prisma --> DB[("Local PostgreSQL")]
  API --> Auth["JWT + RBAC Middleware"]
  API --> Validation["Zod Validation"]
  API --> CSV["CSV Export"]
  API --> Socket
```

### Core architectural rules

- Frontend never mutates local fake data as the source of truth.
- All create/update/delete actions go through backend APIs.
- Backend owns business rules and status transitions.
- Frontend duplicates important validations only for fast feedback.
- Database constraints protect uniqueness and relationships.
- Dashboard and analytics are computed from database records.
- Socket events notify clients after meaningful mutations.

## 6. Proposed Repository Structure

```text
TransitOps/
  MASTER_DOC.md
  apps/
    web/
      src/
        app/
        components/
          layout/
          ui/
          forms/
          charts/
        features/
          auth/
          dashboard/
          vehicles/
          drivers/
          trips/
          maintenance/
          expenses/
          analytics/
          settings/
        lib/
          api.ts
          socket.ts
          auth.ts
          validators.ts
        styles/
      package.json
    api/
      src/
        config/
        db/
        middleware/
          auth.middleware.ts
          rbac.middleware.ts
          error.middleware.ts
          validate.middleware.ts
        modules/
          auth/
          users/
          vehicles/
          drivers/
          trips/
          maintenance/
          fuel/
          expenses/
          analytics/
          dashboard/
          settings/
        realtime/
        utils/
        server.ts
      prisma/
        schema.prisma
        seed.ts
      package.json
  docs/
    problem-statement.pdf
  docker-compose.yml
  README.md
```

For a 6-hour build, a monorepo with `apps/web` and `apps/api` is clean but still manageable. If setup time becomes tight, keep one root package with `client/` and `server/`, but preserve the same module boundaries.

## 7. Roles And RBAC

The PDF lists target users as Fleet Manager, Driver, Safety Officer, and Financial Analyst. The Excalidraw mockup uses Dispatcher for the trip-creation role. Implement the operational role as `Dispatcher`; mention in demo that it maps to the PDF's trip-creating driver/dispatch user.

### Roles

- `Fleet Manager`: Manages fleet assets, vehicle lifecycle, and maintenance.
- `Dispatcher`: Creates and manages trips.
- `Safety Officer`: Manages driver compliance and safety status.
- `Financial Analyst`: Reviews costs, fuel, expenses, ROI, and analytics.
- `Admin`: Optional seed role for settings and RBAC.

### Permission matrix

| Module | Fleet Manager | Dispatcher | Safety Officer | Financial Analyst | Admin |
|---|---:|---:|---:|---:|---:|
| Dashboard | View | View | View | View | View |
| Vehicles | Full | View | View | View | Full |
| Drivers | View | View | Full | View | Full |
| Trips | View | Full | View | View | Full |
| Maintenance | Full | View | View | View | Full |
| Fuel Logs | View | Create/View | View | Full | Full |
| Expenses | View | Create/View | View | Full | Full |
| Analytics | View | Limited | Limited | Full | Full |
| Settings/RBAC | None | None | None | None | Full |

## 8. Database Design

Use PostgreSQL with Prisma migrations. Seed the database with demo records, but keep all app screens reading from the database.

### Entity relationship overview

```mermaid
erDiagram
  Role ||--o{ User : has
  Vehicle ||--o{ Trip : assigned_to
  Driver ||--o{ Trip : assigned_to
  Vehicle ||--o{ MaintenanceLog : has
  Vehicle ||--o{ FuelLog : has
  Trip ||--o{ FuelLog : may_have
  Trip ||--o{ Expense : has
  Vehicle ||--o{ Expense : may_have
  User ||--o{ AuditLog : creates

  Role {
    uuid id
    string name
  }

  User {
    uuid id
    string name
    string email
    string password_hash
    uuid role_id
    string status
  }

  Vehicle {
    uuid id
    string registration_number
    string name_model
    string type
    decimal max_load_kg
    int odometer_km
    decimal acquisition_cost
    string region
    string status
  }

  Driver {
    uuid id
    string name
    string license_number
    string license_category
    date license_expiry_date
    string contact_number
    int safety_score
    string status
  }

  Trip {
    uuid id
    string trip_code
    uuid vehicle_id
    uuid driver_id
    string source
    string destination
    decimal cargo_weight_kg
    decimal planned_distance_km
    decimal actual_distance_km
    decimal revenue
    string status
  }

  MaintenanceLog {
    uuid id
    uuid vehicle_id
    string service_type
    decimal cost
    date start_date
    date end_date
    string status
  }

  FuelLog {
    uuid id
    uuid vehicle_id
    uuid trip_id
    decimal liters
    decimal cost
    date log_date
  }

  Expense {
    uuid id
    uuid trip_id
    uuid vehicle_id
    string type
    decimal amount
    date expense_date
  }
```

### Tables and critical fields

#### `roles`

- `id`
- `name` unique
- `description`
- `created_at`
- `updated_at`

#### `users`

- `id`
- `name`
- `email` unique
- `password_hash`
- `role_id`
- `status`: `Active`, `Locked`, `Disabled`
- `failed_login_attempts`
- `last_login_at`
- `created_at`
- `updated_at`

#### `vehicles`

- `id`
- `registration_number` unique, required
- `name_model`, required
- `type`: `Van`, `Truck`, `Mini`, `Container`, `Other`
- `max_load_kg`, required, positive
- `odometer_km`, required, non-negative
- `acquisition_cost`, required, non-negative
- `region`, required for filters
- `status`: `Available`, `On Trip`, `In Shop`, `Retired`
- `created_at`
- `updated_at`

#### `drivers`

- `id`
- `name`, required
- `license_number` unique, required
- `license_category`: `LMV`, `HMV`, `Transport`, `Other`
- `license_expiry_date`, required
- `contact_number`, required
- `safety_score`, integer 0 to 100
- `status`: `Available`, `On Trip`, `Off Duty`, `Suspended`
- `created_at`
- `updated_at`

#### `trips`

- `id`
- `trip_code` unique
- `source`, required
- `destination`, required
- `vehicle_id`, nullable while draft only if needed
- `driver_id`, nullable while draft only if needed
- `cargo_weight_kg`, positive
- `planned_distance_km`, positive
- `actual_distance_km`, nullable until completion
- `start_odometer_km`
- `final_odometer_km`
- `fuel_consumed_liters`, nullable until completion
- `revenue`, optional but useful for ROI
- `status`: `Draft`, `Dispatched`, `Completed`, `Cancelled`
- `cancel_reason`
- `dispatched_at`
- `completed_at`
- `cancelled_at`
- `created_by_id`
- `created_at`
- `updated_at`

#### `maintenance_logs`

- `id`
- `vehicle_id`
- `service_type`, required
- `description`
- `cost`, non-negative
- `start_date`
- `end_date`, nullable
- `status`: `Active`, `Completed`
- `created_by_id`
- `created_at`
- `updated_at`

#### `fuel_logs`

- `id`
- `vehicle_id`
- `trip_id`, nullable
- `liters`, positive
- `cost`, non-negative
- `log_date`
- `odometer_km`, optional
- `created_by_id`
- `created_at`

#### `expenses`

- `id`
- `trip_id`, nullable
- `vehicle_id`, nullable
- `type`: `Toll`, `Maintenance`, `Misc`
- `description`
- `amount`, non-negative
- `expense_date`
- `created_by_id`
- `created_at`

#### `audit_logs`

- `id`
- `user_id`
- `entity_type`
- `entity_id`
- `action`
- `before_json`
- `after_json`
- `created_at`

Audit logs are optional for MVP but valuable for attention to detail.

### Database constraints and indexes

Add these at the Prisma/database level:

- Unique index on `users.email`.
- Unique index on `vehicles.registration_number`.
- Unique index on `drivers.license_number`.
- Unique index on `trips.trip_code`.
- Index on `vehicles.status`.
- Index on `vehicles.type`.
- Index on `vehicles.region`.
- Index on `drivers.status`.
- Index on `drivers.license_expiry_date`.
- Index on `trips.status`.
- Index on `trips.vehicle_id`.
- Index on `trips.driver_id`.
- Index on `maintenance_logs.vehicle_id`.
- Index on `maintenance_logs.status`.
- Index on `fuel_logs.vehicle_id`.
- Index on `expenses.vehicle_id`.

For PostgreSQL, prefer enum-like Prisma enums for statuses. If time is short, strings are acceptable only if all writes pass through Zod validation and service-level guards.

### Critical transaction patterns

Dispatch must be a single database transaction:

```text
1. Load trip, vehicle, and driver.
2. Validate trip is Draft.
3. Validate vehicle is Available.
4. Validate driver is Available.
5. Validate driver license is not expired.
6. Validate cargo weight <= vehicle capacity.
7. Update trip to Dispatched.
8. Update vehicle to On Trip.
9. Update driver to On Trip.
10. Emit realtime update after transaction succeeds.
```

Complete trip must be a single database transaction:

```text
1. Load dispatched trip.
2. Save final odometer, actual distance, fuel consumed, and optional revenue.
3. Update trip to Completed.
4. Update vehicle odometer and status to Available.
5. Update driver status to Available.
6. Optionally create linked fuel log.
7. Emit realtime update after transaction succeeds.
```

Create active maintenance must be a single database transaction:

```text
1. Validate vehicle is not Retired and not On Trip.
2. Ensure no existing Active maintenance for the vehicle.
3. Create maintenance log with Active status.
4. Update vehicle status to In Shop.
5. Emit realtime update after transaction succeeds.
```

## 9. Mandatory Business Rules

Backend must enforce these rules even if frontend also validates them:

1. Vehicle registration number must be unique.
2. Retired or In Shop vehicles must never appear in dispatch selection.
3. Drivers with expired licenses cannot be assigned to trips.
4. Suspended drivers cannot be assigned to trips.
5. Drivers marked On Trip cannot be assigned to another active trip.
6. Vehicles marked On Trip cannot be assigned to another active trip.
7. Cargo weight must not exceed the vehicle maximum load capacity.
8. Dispatching a trip changes vehicle and driver status to `On Trip`.
9. Completing a trip changes vehicle and driver status back to `Available`.
10. Cancelling a dispatched trip restores vehicle and driver to `Available`.
11. Creating an active maintenance record changes vehicle status to `In Shop`.
12. Closing maintenance restores vehicle to `Available` unless vehicle is `Retired`.
13. Retired vehicles cannot be dispatched or moved automatically to `Available`.
14. All money, distance, fuel, and capacity values must be non-negative.
15. License expiry validation uses the server date, not browser-only date logic.

## 10. Status Transition Rules

### Vehicle status

```mermaid
stateDiagram-v2
  [*] --> Available
  Available --> OnTrip: dispatch trip
  OnTrip --> Available: complete/cancel trip
  Available --> InShop: active maintenance
  InShop --> Available: close maintenance
  Available --> Retired: retire vehicle
  InShop --> Retired: retire vehicle
  OnTrip --> Retired: blocked
  Retired --> Available: blocked
```

### Driver status

```mermaid
stateDiagram-v2
  [*] --> Available
  Available --> OnTrip: dispatch trip
  OnTrip --> Available: complete/cancel trip
  Available --> OffDuty: manual status change
  OffDuty --> Available: manual status change
  Available --> Suspended: safety action
  OffDuty --> Suspended: safety action
  Suspended --> Available: reinstate
  OnTrip --> Suspended: blocked until trip closed
```

### Trip lifecycle

```mermaid
stateDiagram-v2
  [*] --> Draft
  Draft --> Dispatched: pass validations
  Dispatched --> Completed: enter completion details
  Draft --> Cancelled: cancel
  Dispatched --> Cancelled: cancel and restore resources
  Completed --> Cancelled: blocked
```

## 11. API Design

All protected routes require authentication. Routes that mutate records also require RBAC checks.

### Auth

- `POST /api/auth/login`
- `POST /api/auth/logout`
- `GET /api/auth/me`

### Dashboard

- `GET /api/dashboard/kpis?vehicleType=&status=&region=`
- `GET /api/dashboard/recent-trips`
- `GET /api/dashboard/vehicle-status-breakdown`

### Vehicles

- `GET /api/vehicles?search=&type=&status=&region=&page=`
- `GET /api/vehicles/available-for-dispatch`
- `GET /api/vehicles/:id`
- `POST /api/vehicles`
- `PATCH /api/vehicles/:id`
- `PATCH /api/vehicles/:id/retire`
- `DELETE /api/vehicles/:id` only if no dependent records, otherwise use retire

### Drivers

- `GET /api/drivers?search=&status=&licenseCategory=&page=`
- `GET /api/drivers/available-for-dispatch`
- `GET /api/drivers/:id`
- `POST /api/drivers`
- `PATCH /api/drivers/:id`
- `PATCH /api/drivers/:id/status`

### Trips

- `GET /api/trips?status=&vehicleId=&driverId=&page=`
- `GET /api/trips/:id`
- `POST /api/trips`
- `POST /api/trips/:id/dispatch`
- `POST /api/trips/:id/complete`
- `POST /api/trips/:id/cancel`

### Maintenance

- `GET /api/maintenance?vehicleId=&status=&page=`
- `POST /api/maintenance`
- `PATCH /api/maintenance/:id`
- `POST /api/maintenance/:id/close`

### Fuel and expenses

- `GET /api/fuel-logs?vehicleId=&dateFrom=&dateTo=`
- `POST /api/fuel-logs`
- `GET /api/expenses?vehicleId=&tripId=&dateFrom=&dateTo=`
- `POST /api/expenses`

### Analytics

- `GET /api/analytics/summary?dateFrom=&dateTo=`
- `GET /api/analytics/fuel-efficiency`
- `GET /api/analytics/fleet-utilization`
- `GET /api/analytics/operational-cost`
- `GET /api/analytics/vehicle-roi`
- `GET /api/analytics/export.csv`

### Settings and RBAC

- `GET /api/settings`
- `PATCH /api/settings`
- `GET /api/rbac/roles`
- `PATCH /api/rbac/roles/:id`

## 12. Realtime Events

Use Socket.IO to make the app feel dynamic.

Server emits:

- `dashboard:updated`
- `vehicles:updated`
- `drivers:updated`
- `trips:updated`
- `maintenance:updated`
- `expenses:updated`
- `analytics:updated`

Emit after:

- Vehicle create/update/retire
- Driver create/update/status change
- Trip dispatch/complete/cancel
- Maintenance create/close
- Fuel log create
- Expense create

Frontend behavior:

- On event, invalidate/refetch the related API queries.
- Dashboard should update KPIs without manual refresh.
- Toast should show operational messages such as "Trip dispatched. Vehicle and driver marked On Trip."

## 13. Frontend Screen Plan

Match the Excalidraw visual direction:

- Dark ERP-style shell
- Left sidebar navigation
- Top search bar
- User role badge and avatar
- Dense tables
- Status pills with consistent colors
- Orange primary action color
- Blue active navigation highlight or outline accents
- Green success/available indicators
- Red blocked/error indicators
- Clean spacing, no marketing landing page

### 0. Authentication

Screen elements:

- TransitOps branding
- Email field
- Password field
- Role hint from seeded demo accounts
- Remember me checkbox
- Forgot password text link, non-functional for MVP
- Error state after invalid login
- Account lock note after repeated failed attempts, optional

Validation:

- Email format required
- Password required
- Invalid credentials show generic error

### 1. Dashboard

KPIs:

- Active Vehicles
- Available Vehicles
- Vehicles in Maintenance
- Active Trips
- Pending Trips
- Drivers On Duty
- Fleet Utilization (%)

Filters:

- Vehicle Type
- Status
- Region

Panels:

- Recent Trips table
- Vehicle Status breakdown chart

### 2. Vehicle Registry

Features:

- Search by registration number or model
- Filter by type and status
- Add/Edit vehicle form
- Table with registration, model, type, capacity, odometer, acquisition cost, status
- Rule note: Retired/In Shop vehicles are hidden from dispatch

Required actions:

- Add vehicle
- Edit vehicle
- Retire vehicle

### 3. Drivers and Safety Profiles

Features:

- Driver table
- License number and expiry
- Safety score
- Trip completion percentage if time allows
- Status toggle
- Add/Edit driver

Rule note:

- Expired license or Suspended status blocks trip assignment.

### 4. Trip Dispatcher

This is the most important workflow screen.

Form fields:

- Source
- Destination
- Vehicle, available only
- Driver, available only and not expired/suspended
- Cargo weight
- Planned distance

Live validation card:

- Vehicle capacity
- Cargo weight
- Capacity exceeded message
- Dispatch button disabled if invalid

Live board:

- Draft trips
- Dispatched trips
- Completed trips
- Cancelled trips
- ETA or reason notes

Actions:

- Create draft trip
- Dispatch trip
- Complete trip
- Cancel trip

### 5. Maintenance

Features:

- Log service record form
- Vehicle selector
- Service type
- Cost
- Date
- Status
- Service log table

Critical behavior:

- Active maintenance changes vehicle status to `In Shop`.
- In Shop vehicles disappear from dispatch vehicle selection.
- Closing maintenance restores vehicle to `Available` unless retired.

### 6. Fuel and Expense Management

Features:

- Fuel logs table
- Add fuel log
- Other expenses table
- Add expense
- Auto operational cost calculation

Operational cost:

```text
Operational Cost = Fuel Cost + Maintenance Cost + Other Expenses
```

The PDF explicitly requires fuel plus maintenance. Include other expenses in detailed totals, but show the required formula clearly in analytics.

### 7. Reports and Analytics

Cards:

- Fuel Efficiency
- Fleet Utilization
- Operational Cost
- Vehicle ROI

Charts:

- Monthly revenue
- Top costliest vehicles
- Vehicle status chart from dashboard can be reused

Required export:

- CSV export from backend live query

Formulas:

```text
Fuel Efficiency = Distance / Fuel
Fleet Utilization = Vehicles On Trip / Total Active Vehicles * 100
Operational Cost = Fuel + Maintenance
Vehicle ROI = (Revenue - (Maintenance + Fuel)) / Acquisition Cost
```

### 8. Settings and RBAC

Features:

- Depot name
- Currency
- Distance unit
- Role-based access table

MVP approach:

- Seed roles and display matrix.
- Admin can view role permissions.
- Editing permissions is bonus if time remains.

## 14. Backend Validation Plan

Use Zod request schemas for every write route.

### Vehicle validation

- Registration number required, uppercase normalized, unique.
- Name/model required.
- Capacity must be positive.
- Odometer must be non-negative.
- Acquisition cost must be non-negative.
- Status must be allowed enum.

### Driver validation

- Name required.
- License number required and unique.
- License expiry required.
- Contact number required.
- Safety score between 0 and 100.
- Status must be allowed enum.

### Trip validation

- Source and destination required and cannot be identical.
- Planned distance must be positive.
- Cargo weight must be positive.
- Vehicle must exist and be `Available`.
- Driver must exist and be `Available`.
- Driver license must not be expired.
- Cargo weight must be <= vehicle max load.
- On dispatch, update trip, vehicle, and driver inside one database transaction.

### Maintenance validation

- Vehicle must exist.
- Active maintenance cannot be duplicated for the same vehicle.
- Cost must be non-negative.
- Creating active maintenance uses a transaction to update vehicle status.
- Closing maintenance uses a transaction to restore vehicle status.

### Fuel and expense validation

- Liters must be positive.
- Cost/amount must be non-negative.
- Date required.
- Vehicle or trip reference must exist.

## 15. Security Plan

Minimum required:

- Hash passwords with bcrypt.
- Store JWT in HTTP-only cookie.
- Use RBAC middleware per route group.
- Validate all input at backend.
- Use Prisma parameterized queries, no raw SQL unless necessary.
- Use CORS restricted to frontend origin.
- Add rate limit to login route if time allows.
- Return generic auth errors.
- Never expose password hashes.
- Keep secrets in `.env`.

Recommended `.env` values:

```text
DATABASE_URL=postgresql://postgres:postgres@localhost:5432/transitops
JWT_SECRET=replace-with-local-secret
CLIENT_ORIGIN=http://localhost:5173
PORT=4000
```

## 16. Modularity Guidelines

Each backend module should contain:

- `routes.ts`
- `controller.ts`
- `service.ts`
- `schema.ts`

Business logic belongs in services, not controllers.

Each frontend feature should contain:

- Page component
- API hooks
- Form component
- Table component
- Local validation schema

Shared UI components:

- Button
- Input
- Select
- Modal
- StatusBadge
- DataTable
- KpiCard
- Sidebar
- Topbar
- EmptyState
- ConfirmDialog

## 17. Data Strategy

No static JSON as app data.

Use:

- Prisma seed script for demo database records.
- Real API queries for every screen.
- Live database reads for KPIs and analytics.
- Socket events after mutations.

Seed demo records should include:

- Four roles plus optional admin
- One user per role
- Vehicles: Available, On Trip, In Shop, Retired
- Drivers: Available, On Trip, Off Duty, Suspended, expired license
- Trips: Draft, Dispatched, Completed, Cancelled
- Maintenance: Active and Completed
- Fuel logs and expenses

## 18. Demo Accounts

Use simple seeded credentials for judges:

| Role | Email | Password |
|---|---|---|
| Fleet Manager | fleet@transitops.local | password123 |
| Dispatcher | dispatch@transitops.local | password123 |
| Safety Officer | safety@transitops.local | password123 |
| Financial Analyst | finance@transitops.local | password123 |
| Admin | admin@transitops.local | password123 |

In production this would be unacceptable, but for hackathon demo it is clear and fast.

## 19. Six-Hour Execution Plan

### Hour 0:00 to 0:30 - Foundation

- Initialize git repo if not already initialized.
- Create React + Vite frontend.
- Create Express + TypeScript backend.
- Add PostgreSQL Docker Compose or local DB setup notes.
- Install Prisma and create initial schema.
- Add `.env.example`.

### Hour 0:30 to 1:30 - Database, seed, auth

- Build Prisma schema.
- Run migration.
- Add seed data.
- Implement login/logout/me.
- Add RBAC middleware.
- Create app shell with sidebar/topbar.

### Hour 1:30 to 2:30 - Vehicles and drivers

- Vehicle CRUD APIs and UI.
- Driver CRUD APIs and UI.
- Status badges and filters.
- Unique constraints and validation errors.

### Hour 2:30 to 3:45 - Trips and business rules

- Create trip.
- Available vehicle/driver selectors.
- Dispatch transaction.
- Complete transaction.
- Cancel transaction.
- Capacity and license validations.
- Live validation UI from Excalidraw.

### Hour 3:45 to 4:30 - Maintenance, fuel, expenses

- Active maintenance creates In Shop status.
- Close maintenance restores Available.
- Fuel log create/list.
- Expense create/list.
- Operational cost aggregation.

### Hour 4:30 to 5:15 - Dashboard and analytics

- KPI endpoint.
- Dashboard cards.
- Recent trips.
- Vehicle status chart.
- Analytics cards and chart.
- CSV export.

### Hour 5:15 to 5:45 - Realtime and polish

- Add Socket.IO.
- Emit update events after mutations.
- Refetch dashboard and tables on events.
- Add toasts.
- Tighten UI spacing and responsiveness.

### Hour 5:45 to 6:00 - Demo hardening

- Run full demo script.
- Fix broken states.
- Add README quick start.
- Commit final version.
- Prepare judge walkthrough.

## 20. Version Control Plan

Use git from the first minute.

Recommended commits:

- `docs: add master implementation plan`
- `chore: scaffold web and api apps`
- `feat: add database schema and seed data`
- `feat: add auth and rbac`
- `feat: add vehicle and driver modules`
- `feat: add trip dispatcher workflow`
- `feat: add maintenance fuel and expenses`
- `feat: add dashboard analytics and realtime updates`
- `docs: add setup and demo instructions`

README must include:

- Project overview
- Tech stack
- Local setup commands
- Database migration and seed commands
- Demo credentials
- Key business rules
- Screenshots if time allows

## 21. MVP Versus Bonus

### Must finish

- Auth with RBAC
- Dashboard with KPIs
- Vehicles CRUD
- Drivers CRUD
- Trip dispatcher with validations
- Automatic status transitions
- Maintenance workflow
- Fuel and expense tracking
- Analytics basics
- CSV export
- Clean UI

### Bonus only after MVP

- PDF export
- Email reminders for expiring licenses
- Vehicle document management
- Dark/light mode toggle
- AI assistant
- Editable RBAC matrix

## 22. AI/Chatbot Decision

Do not build an AI chatbot before the core product works.

If time remains, a useful AI feature would be an "Operations Assistant" that answers from existing platform data:

- "Which vehicles are unavailable?"
- "Which drivers have expired licenses?"
- "What caused operational cost this week?"
- "Which vehicles are due for maintenance?"

For hackathon safety, implement as rule-based insights from database queries, not a third-party LLM integration. This satisfies "AI/chatbot if it adds value" without risking API complexity.

## 23. UI Design Tokens

Use a consistent dark operational palette based on the Excalidraw mockup:

```text
Background: #0f1115
Panel: #151a20
Panel border: #2a313a
Text primary: #f5f7fa
Text muted: #98a2b3
Primary orange: #d98a00
Accent blue: #4a90e2
Success green: #36b26a
Warning amber: #f59e0b
Danger red: #ef5350
Neutral gray: #64748b
```

Status badge colors:

| Status | Color |
|---|---|
| Available | Green |
| On Trip | Blue |
| In Shop | Amber |
| Retired | Red |
| Draft | Gray |
| Dispatched | Blue |
| Completed | Green |
| Cancelled | Red |
| Suspended | Red |
| Off Duty | Gray |

## 24. Testing Checklist

Manual tests are acceptable for a 6-hour hackathon, but make them systematic.

### Auth

- Invalid login shows error.
- Valid login opens correct role view.
- Protected route redirects when logged out.
- Role cannot access forbidden route.

### Vehicles

- Duplicate registration number is blocked.
- Retired vehicle does not appear in dispatch selector.
- In Shop vehicle does not appear in dispatch selector.

### Drivers

- Expired license driver does not appear in dispatch selector.
- Suspended driver does not appear in dispatch selector.
- On Trip driver does not appear in dispatch selector.

### Trips

- Cargo over capacity blocks dispatch.
- Dispatch sets vehicle and driver to On Trip.
- Complete sets vehicle and driver to Available.
- Cancel dispatched trip restores vehicle and driver.

### Maintenance

- Creating active maintenance sets vehicle to In Shop.
- Closing maintenance sets vehicle to Available.
- Retired vehicle is not restored by closing maintenance.

### Analytics

- Fuel efficiency changes after fuel log.
- Operational cost changes after fuel or maintenance.
- CSV export downloads live data.

### Realtime

- Dashboard updates after dispatch.
- Dashboard updates after maintenance.
- Tables refresh after create/update.

## 25. Demo Script

Use this exact sequence during judging:

1. Login as Dispatcher.
2. Show dashboard KPIs and live vehicle status.
3. Open Vehicle Registry and show Available, On Trip, In Shop, Retired statuses.
4. Open Drivers and show expired/suspended/on-trip states.
5. Create a trip with cargo weight above capacity. Show dispatch blocked.
6. Correct cargo weight and dispatch. Show vehicle and driver become On Trip.
7. Return to dashboard. Show KPIs updated.
8. Complete trip with final odometer/fuel. Show statuses restored.
9. Create maintenance record for vehicle. Show vehicle becomes In Shop.
10. Return to Trip Dispatcher. Show vehicle hidden from selection.
11. Open Analytics. Show operational cost, fuel efficiency, ROI, and CSV export.
12. Open Settings/RBAC. Show role matrix.

## 26. Definition Of Done

The project is demo-ready when:

- The app starts from README commands.
- Database migrations and seed run cleanly.
- All screens use backend data.
- Auth and RBAC are functional.
- Core business rules are enforced on backend.
- Trip, maintenance, fuel, and expense workflows work end to end.
- Dashboard and analytics reflect real database state.
- UI is responsive enough for laptop and tablet widths.
- No obvious console errors.
- Final code is committed.
