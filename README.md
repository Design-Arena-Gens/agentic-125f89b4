# Vinyasa Club Attendance & Performance Tracker

Full-stack platform for NMIMS Hyderabad's Vinyasa Robotics Club to orchestrate member management, attendance, and performance insights. The project ships a secure REST API (Express + Prisma + SQLite) and a modern dashboard frontend (React 18 + TypeScript + Vite) ready for Vercel deployment.

## Features
- **Authentication & Roles** – JWT-powered sessions with Admin, Instructor, and Member access tiers
- **Member Ops** – VIN auto-IDs, search, filters, create/update/delete, profile insights, bulk onboarding
- **Attendance HQ** – Daily bulk marking, status matrix (Present/Late/Absent/Excused), smart summaries
- **Performance Lab** – Category-based scoring, trend radar, quick logging, member streak dossiers
- **Executive Dashboard** – Snapshot metrics, attendance pulse, performance radar, category highlights
- **Security** – Helmet, CORS, rate limiting, sanitisation, hashed passwords, typed validation, Prisma ORM

## Tech Stack

| Layer      | Technology |
| ---------- | ---------- |
| Frontend   | React 18, TypeScript, Vite, React Router, Axios, Recharts, CSS Modules |
| Backend    | Node.js 20, Express, TypeScript, Prisma ORM, SQLite (switchable to Postgres) |
| Auth       | JWT (access tokens), bcrypt password hashing |
| Security   | Helmet, CORS, express-rate-limit, xss-clean |

## Local Development

### 1. Install dependencies
```bash
npm install --workspaces
```

### 2. Backend: database & seed
```bash
cd backend
npm run prisma:migrate-dev      # Creates SQLite schema
npm run seed                    # Seeds with demo users/members
cd ..
```

Seeding credentials:
- Admin – `admin@vinyasa.club` / `vinyasa@123`
- Instructor – `instructor@vinyasa.club` / `vinyasa@123`
- Member – `member@vinyasa.club` / `vinyasa@123`

### 3. Start dev servers
```bash
npm run dev:backend             # http://localhost:5000
npm run dev:frontend            # http://localhost:5173
```

The Vite dev server proxies `/api` requests to `http://localhost:5000`.

## Production Build
```bash
npm run build                   # Builds both workspaces
```
- Frontend output: `frontend/dist`
- Backend output: `backend/dist`
- Vercel serverless entry: `api/index.ts` (wraps compiled Express app)

## Environment Variables

| File                  | Key                       | Description                                |
| --------------------- | ------------------------- | ------------------------------------------ |
| `backend/.env`        | `DATABASE_URL`            | Prisma datasource (defaults to SQLite)     |
|                       | `JWT_SECRET`              | Token signing key                          |
|                       | `TOKEN_EXPIRATION_HOURS`  | JWT expiry window                          |
| `frontend/.env`       | `VITE_API_BASE_URL`       | API base (use `/api` when deployed)        |

To switch to PostgreSQL, update `DATABASE_URL`, change the Prisma provider, and rerun migrations.

## Testing Checklist

- `npm run build` (root) – ensures both frontend and backend compile
- `npm run seed --workspace backend` – confirms Prisma schema & seed integrity
- Manual smoke: Sign in as Admin, add member, mark attendance, log performance, verify dashboards

## Project Structure
```
.
├── api/                     # Vercel serverless handler (uses backend/dist)
├── backend/
│   ├── prisma/              # Prisma schema & migrations
│   ├── src/
│   │   ├── controllers/     # Auth, members, attendance, performance, dashboard
│   │   ├── middleware/      # Auth guards, error handling
│   │   ├── routes/          # Express route modules
│   │   ├── scripts/         # Database seed
│   │   └── server.ts        # Local HTTP entrypoint
│   └── dist/                # Compiled output (after build)
├── frontend/
│   ├── src/
│   │   ├── components/      # Layout, shared UI, charts
│   │   ├── pages/           # Login, Dashboard, Members, Attendance, Performance
│   │   ├── contexts/        # Auth provider
│   │   └── services/        # Axios client
│   └── dist/                # Production build (after `npm run build`)
└── package.json             # Workspace orchestration
```

## Deployment (Vercel)

1. Build locally: `npm run build`
2. Deploy: `vercel deploy --prod --yes --token $VERCEL_TOKEN --name agentic-125f89b4`
3. Verify: `curl https://agentic-125f89b4.vercel.app`

The serverless API lives at `/api`, automatically backed by the compiled Express app.

## License

MIT © Vinyasa Robotics Club
