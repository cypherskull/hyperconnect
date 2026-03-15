# HyperConnect - B2B Networking Platform

HyperConnect is a robust B2B networking platform connecting solution seekers and sellers across industries, geographies, and value chains. Built with a modern monolithic React frontend and an Express/Prisma backend to power an interactive, responsive experience.

## System Architecture

**Frontend:**
- **Framework:** React + Vite (`vite`, `react`, `react-dom`)
- **Language:** TypeScript
- **Styling:** Tailwind CSS (implied via React components/Tailwind patterns)

**Backend:**
- **Environment:** Node.js + Express
- **Database:** PostgreSQL accessed via Prisma ORM
- **Authentication:** JWT & bcrypt
- **Storage:** Amazon S3 (Multer + AWS SDK)

**Infrastructure / E2E:**
- **Containerization:** Docker (`docker-compose.yml` orchestrates frontend, backend, and postgres db)
- **Testing:** Playwright (`tests/`)

## Folder Structure

```
├── backend/            # Express application, API routes, and Prisma schema
│   ├── prisma/         # Prisma schemas, seeds, and migrations
│   ├── src/            # Controllers, middleware, routes, services
│   └── package.json    # Backend specific dependencies
│
├── components/         # Frontend React functional components (Admin, Feed, User, Auth, etc)
├── context/            # React Contexts (AppContext, AuthContext, DataContext)
├── services/           # Frontend API and service abstractions
├── hooks/              # Custom React hooks
├── tests/              # Playwright E2E and API tests
│   ├── e2e/            # Test specs across features (auth, feed, seller profiles)
│   └── package.json    # Test suite specific dependencies
│
├── App.tsx             # Root component and navigation routing
├── types.ts            # Global TypeScript definitions
├── package.json        # Frontend specific dependencies
├── docker-compose.yml  # Docker environment orchestration
└── tsconfig.json       # Frontend TS configuration
```

## Quick Start (Docker)

To start the full stack (Frontend, Backend, PostgreSQL) instantly using Docker:
```bash
docker-compose up -d --build
```
*Frontend will be available on port 3000, Backend on port 3001, and DB on port 5432.*

## Manual Installation & Development 

If you prefer to run services manually for development:

### 1. Database & Backend Configuration

```bash
# Navigate to the backend
cd backend

# Install dependencies
npm install

# Setup environment variables (refer to .env.example)
# Add your local DB connection string and JWT_SECRET
cp .env.example .env

# Run migrations to generate the database schema
npx prisma migrate dev

# Seed the database (Optional but recommended)
npx prisma db seed

# Run the backend development server
npm run dev
```

### 2. Frontend Configuration

Open a new terminal session at the root of the project:

```bash
# Install frontend dependencies
npm install

# Start the Vite development server
npm run dev
```
*Your application should now be accessible at http://localhost:5173 (or as configured by Vite).*

### 3. Testing (QA Suite)

The repository uses Playwright for E2E tests.

```bash
# Navigate to tests directory
cd tests

# Install test dependencies
npm install

# Install Playwright browsers (first-time only)
npx playwright install

# Run the test suite
npm run test
```

## Available Commands Summary

**Frontend (Root)**
- `npm run dev` — Starts Vite dev server.
- `npm run build` — Builds project for production.
- `npm run preview` — Locally preview the production build.
- `npx tsc` — Type-check frontend code.

**Backend (`/backend`)**
- `npm run dev` — Run server via ts-node-dev.
- `npm run build` — Compile TypeScript codebase.
- `npm run start` — Boot compiled code from `dist/index.js`.
- `npm run db:studio` — Explore DB via Prisma Studio UI.
- `npx tsc` — Type-check backend code.

**Tests (`/tests`)**
- `npm run test` — Run headless Playwright suite.
- `npm run test:headed` — Run Playwright visually.
- `npm run test:report` — Open the test HTML report visually.

## Contribution & Git Workflow

Ensure your features adhere strictly to TypeScript rules and React functional component patterns. 
Always verify that tests (`npm run test`) and type-checking (`npx tsc`) successfully pass before making a pull request.
