# FarmBox - Local Organic CSA Marketplace

A digital marketplace platform connecting small organic farms in Tunisia to urban consumers through subscription boxes and weekly deliveries.

## Overview

FarmBox enables local farmers to sell directly to consumers, cutting out middlemen and ensuring fresher produce at fair prices for both parties.

### Features

**For Farmers:**
- Digital storefront with farm profiles
- Product management with seasonal availability
- Order management and tracking
- Delivery zone configuration

**For Consumers:**
- Browse local farms and their offerings
- Add products to cart and checkout
- Track orders and delivery status
- Choose pickup or delivery options

## Tech Stack

- **Frontend:** Next.js 14, React, Tailwind CSS, Zustand
- **Backend:** Node.js, Express, TypeScript
- **Database:** PostgreSQL with Prisma ORM
- **Authentication:** JWT tokens

## Project Structure

```
farmbox/
├── backend/                 # Express API
│   ├── prisma/             # Database schema and migrations
│   ├── src/
│   │   ├── config/         # Database and service configs
│   │   ├── controllers/    # Route handlers
│   │   ├── middleware/     # Auth and validation
│   │   ├── routes/         # API routes
│   │   ├── services/       # Business logic
│   │   └── utils/          # Helper functions
│   └── package.json
├── frontend/               # Next.js app
│   ├── src/
│   │   ├── app/           # Pages (App Router)
│   │   ├── components/    # React components
│   │   ├── lib/           # API client, utilities
│   │   ├── store/         # Zustand stores
│   │   └── types/         # TypeScript types
│   └── package.json
├── docker-compose.yml      # Docker development setup
├── DESIGN.md              # Design document
└── IMPLEMENTATION_GUIDE.md # Implementation guide
```

## Quick Start

### Prerequisites

- Node.js 18+
- PostgreSQL 14+ (or Docker)
- npm or yarn

### Option 1: Using Docker (Recommended)

```bash
# Start all services
docker-compose up -d

# The app will be available at:
# - Frontend: http://localhost:3000
# - Backend API: http://localhost:3001
# - Database: localhost:5432
```

### Option 2: Manual Setup

#### 1. Database Setup

```bash
# Create PostgreSQL database
createdb farmbox

# Or use Docker for just the database
docker run --name farmbox-db -e POSTGRES_USER=farmbox -e POSTGRES_PASSWORD=farmbox123 -e POSTGRES_DB=farmbox -p 5432:5432 -d postgres:14-alpine
```

#### 2. Backend Setup

```bash
cd backend

# Install dependencies
npm install

# Configure environment
cp ../.env.example .env
# Edit .env with your database credentials

# Run migrations
npx prisma migrate dev

# Seed the database
npm run db:seed

# Start development server
npm run dev
```

#### 3. Frontend Setup

```bash
cd frontend

# Install dependencies
npm install

# Start development server
npm run dev
```

## API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login
- `GET /api/auth/profile` - Get current user profile
- `PUT /api/auth/profile` - Update profile

### Farms
- `GET /api/farms` - List all farms
- `GET /api/farms/:slug` - Get farm by slug
- `POST /api/farms` - Create farm (auth required)
- `PUT /api/farms/:id` - Update farm (farmer only)
- `GET /api/farms/me/farm` - Get current user's farm

### Products
- `GET /api/products` - List products
- `GET /api/products/:id` - Get product
- `POST /api/products` - Create product (farmer only)
- `PUT /api/products/:id` - Update product (farmer only)
- `DELETE /api/products/:id` - Delete product (farmer only)

### Orders
- `POST /api/orders` - Create order (auth required)
- `GET /api/orders/my-orders` - Get user's orders
- `GET /api/orders/:id` - Get order details
- `GET /api/orders/farm/orders` - Get farm's orders (farmer only)
- `PATCH /api/orders/:id/status` - Update order status (farmer only)

## Test Credentials

After seeding the database:

| Role | Email | Password |
|------|-------|----------|
| Admin | admin@farmbox.tn | admin123 |
| Farmer | ahmed@fermebensalem.tn | farmer123 |
| Customer | sonia@example.tn | customer123 |

## Delivery Zones

| Zone | Cities | Fee | Free Threshold |
|------|--------|-----|----------------|
| Zone A | Tunis, La Marsa, Carthage, Sidi Bou Said | 5 TND | 80 TND |
| Zone B | Ariana, Ben Arous, Manouba | 8 TND | 120 TND |
| Zone C | Outer suburbs | 12 TND | 150 TND |

## Environment Variables

### Backend (.env)
```env
NODE_ENV=development
PORT=3001
DATABASE_URL="postgresql://user:password@localhost:5432/farmbox"
JWT_SECRET=your-secret-key
JWT_EXPIRES_IN=7d
FRONTEND_URL=http://localhost:3000
```

### Frontend (.env.local)
```env
NEXT_PUBLIC_API_URL=http://localhost:3001/api
```

## Development

### Running Tests
```bash
# Backend
cd backend && npm test

# Frontend
cd frontend && npm test
```

### Database Management
```bash
cd backend

# Open Prisma Studio
npm run db:studio

# Create migration
npx prisma migrate dev --name migration_name

# Reset database
npx prisma migrate reset
```

## Deployment

### Backend (Railway/Render)
```bash
# Build
npm run build

# Start
npm start
```

### Frontend (Vercel)
```bash
# Deploy
vercel --prod
```

## Documentation

- [Design Document](./DESIGN.md) - Business requirements and architecture
- [Implementation Guide](./IMPLEMENTATION_GUIDE.md) - Step-by-step development guide

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Submit a pull request

## License

MIT License - see LICENSE file for details

---

Built with love for Tunisian farmers and consumers.
