# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

FarmBox is a digital marketplace platform connecting small organic farms in Tunisia to urban consumers through subscription boxes and weekly deliveries. It's a full-stack application with a Node.js/Express backend and Next.js frontend.

## Development Commands

### Docker (Recommended)
```bash
docker-compose up -d          # Start all services (frontend :3000, backend :3001, postgres :5432, redis :6379)
docker-compose down           # Stop all services
docker-compose logs -f        # View logs
```

### Backend (manual setup)
```bash
cd backend
npm install
npm run dev                   # Start development server with nodemon
npm run build                 # Compile TypeScript
npm run lint                  # Run ESLint
npm test                      # Run Jest tests
npm run db:migrate            # Run Prisma migrations
npm run db:seed               # Seed database with test data
npm run db:studio             # Open Prisma Studio GUI
npx prisma migrate dev --name <name>  # Create new migration
npx prisma migrate reset      # Reset database
```

### Frontend (manual setup)
```bash
cd frontend
npm install
npm run dev                   # Start Next.js dev server
npm run build                 # Production build
npm run lint                  # Run ESLint
```

## Architecture

### Backend (`backend/`)
- **Framework**: Express.js with TypeScript
- **Database**: PostgreSQL with Prisma ORM
- **Auth**: JWT tokens (stored in localStorage on frontend)
- **Entry point**: `src/index.ts` - Express app setup with middleware (helmet, cors, morgan)

**Route structure** (`src/routes/`):
- `/api/auth` - Authentication (register, login, profile)
- `/api/farms` - Farm CRUD operations
- `/api/products` - Product management
- `/api/orders` - Order processing
- `/api/subscriptions` - Subscription box management
- `/api/quality` - Quality reports and customer feedback
- `/api/trial-boxes` - Trial box system for new customers

**Key patterns**:
- Controllers in `src/controllers/` handle request/response
- Business logic can be in `src/services/`
- Auth middleware at `src/middleware/auth.middleware.ts`
- Prisma client initialized in `src/config/database.ts`

### Frontend (`frontend/`)
- **Framework**: Next.js 14 with App Router
- **State**: Zustand for auth (`src/store/auth.ts`) and cart (`src/store/cart.ts`)
- **Styling**: Tailwind CSS
- **Forms**: React Hook Form with Zod validation
- **HTTP**: Axios (`src/lib/api.ts`)
- **Data fetching**: TanStack React Query

**Page structure** (`src/app/`):
- `/` - Home page
- `/farms` - Farm listing
- `/farms/[slug]` - Individual farm page
- `/cart`, `/checkout` - Shopping flow
- `/login`, `/register` - Auth pages
- `/dashboard` - Customer dashboard (orders, subscriptions, quality reports)
- `/farmer` - Farmer dashboard
- `/trial` - Trial box signup

### Database Schema (`backend/prisma/schema.prisma`)
Core models: `User`, `Farm`, `Product`, `Order`, `OrderItem`, `Subscription`

User roles: `CUSTOMER`, `FARMER`, `ADMIN`

The schema includes extensive engagement features:
- Subscription flexibility (pauses, skips)
- Trial boxes for new customers
- Quality reporting system
- Customer credits and loyalty
- Delivery tracking and routing
- Sustainability/impact metrics

## Environment Variables

Backend (`.env`):
- `DATABASE_URL` - PostgreSQL connection string
- `JWT_SECRET` - JWT signing key
- `JWT_EXPIRES_IN` - Token expiration (default: 7d)
- `FRONTEND_URL` - CORS origin (default: http://localhost:3000)
- `PORT` - Server port (default: 3001)

Frontend (`.env.local`):
- `NEXT_PUBLIC_API_URL` - Backend API URL (default: http://localhost:3001/api)

## Test Credentials (after seeding)
- Admin: admin@farmbox.tn / admin123
- Farmer: ahmed@fermebensalem.tn / farmer123
- Customer: sonia@example.tn / customer123

## Tunisia-Specific Context
- Currency: TND (Tunisian Dinar)
- Languages: French (primary), Arabic
- Delivery zones: Zone A (Tunis core), Zone B (suburbs), Zone C (outer areas)
- Seasonal produce calendar based on Mediterranean climate
