# 🏭 CMMS - Computerized Maintenance Management System

A comprehensive maintenance management system for manufacturing facilities, built with modern web technologies.

## 🚀 Quick Start

### Option 1: Automated Setup (Recommended)

```bash
# Clone and navigate to project
cd hoaancmms-main

# Run setup script (handles everything)
./setup.sh

# Start development
yarn dev
```

### Option 2: Manual Setup

```bash
# 1. Install dependencies
yarn

# 2. Setup environment files
cp apps/api/.env.example apps/api/.env
echo "VITE_API_URL=http://localhost:3000" > apps/web/.env

# 3. Start Docker services (PostgreSQL + Redis)
docker compose up -d

# 4. Run database migrations
cd apps/api
npx prisma migrate dev
npx prisma generate
cd ../..

# 5. Start development
yarn dev
```

## 📦 What's Inside

This monorepo uses [Turborepo](https://turbo.build/) and contains:

### Apps

- **`apps/api`** - NestJS backend (REST API)
  - PostgreSQL database with Prisma ORM
  - Redis for queue processing (BullMQ)
  - JWT authentication
  - File upload handling

- **`apps/web`** - React frontend (Vite)
  - shadcn/ui components
  - TanStack Query for data fetching
  - React Router for navigation
  - Tailwind CSS for styling

### Tech Stack

**Backend:**

- NestJS
- Prisma ORM
- PostgreSQL
- Redis + BullMQ
- TypeScript

**Frontend:**

- React 18
- TypeScript
- Vite
- shadcn-ui
- Tailwind CSS
- TanStack Query

## 🛠️ Development

### Available Commands

From **root directory**:

```bash
yarn dev      # Start all apps in dev mode (API + Web)
yarn build    # Build all apps
yarn lint     # Lint all apps
yarn test     # Run tests for all apps
```

### Development URLs

- **Frontend:** http://localhost:5173
- **Backend API:** http://localhost:3000
- **Database:** postgresql://admin:password123@localhost:5432/cmms

### Hot Reload

Both applications support hot reload:

- API: NestJS watch mode (auto-restart on changes)
- Web: Vite HMR (instant updates)

## 📚 Documentation

- [Quick Start Guide](./QUICKSTART.md) - Detailed setup instructions
- [Implementation Plan](./.agent/implementation_plan.md) - Technical architecture
- [Task Breakdown](./.agent/task.md) - Development roadmap
- [Project Index](./.agent/PROJECT_INDEX.md) - Codebase guide

## 🏗️ Project Structure

```
hoaancmms-main/
├── apps/
│   ├── api/                 # NestJS Backend
│   │   ├── src/
│   │   │   ├── modules/     # Feature modules
│   │   │   ├── database/    # Prisma client
│   │   │   └── main.ts
│   │   └── prisma/
│   │       └── schema.prisma
│   │
│   └── web/                 # React Frontend
│       ├── src/
│       │   ├── components/  # UI components
│       │   ├── pages/       # Route pages
│       │   ├── services/    # API clients
│       │   └── features/    # Feature modules
│       └── package.json
│
├── docker-compose.yml       # PostgreSQL + Redis
├── turbo.json              # Turborepo config
├── setup.sh                # Automated setup script
└── package.json            # Root workspace
```

## 🔧 Troubleshooting

### Port already in use

```bash
# Kill process on port 3000 (API)
lsof -ti:3000 | xargs kill -9

# Kill process on port 5173 (Web)
lsof -ti:5173 | xargs kill -9
```

### Database connection issues

```bash
# Check if PostgreSQL is running
docker ps | grep postgres

# Restart Docker services
docker-compose restart
```

### Prisma issues

```bash
cd apps/api
npx prisma generate
npx prisma migrate reset
```

## 📝 License

Private - All rights reserved
