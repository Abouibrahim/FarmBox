# FarmBox - Step-by-Step Implementation Guide

**Version:** 1.0
**Date:** December 2024
**Prerequisites:** Node.js 18+, PostgreSQL 14+, Git

---

## Table of Contents

1. [Overview](#overview)
2. [Phase 1: Project Setup](#phase-1-project-setup)
3. [Phase 2: Database Design](#phase-2-database-design)
4. [Phase 3: Backend API Development](#phase-3-backend-api-development)
5. [Phase 4: Frontend Development](#phase-4-frontend-development)
6. [Phase 5: External Integrations](#phase-5-external-integrations)
7. [Phase 6: Testing](#phase-6-testing)
8. [Phase 7: Deployment](#phase-7-deployment)
9. [Phase 8: Launch Preparation](#phase-8-launch-preparation)
10. [Appendix: Code Templates](#appendix-code-templates)

---

## Overview

This guide walks through building the FarmBox MVP - a local organic CSA marketplace connecting Tunisian farms to urban consumers. Follow each phase sequentially.

### What We're Building

```
┌─────────────────────────────────────────────────────────────┐
│                      FarmBox MVP                             │
├─────────────────────────────────────────────────────────────┤
│  Frontend (Next.js)          │  Backend (Node.js/Express)   │
│  - Landing page              │  - REST API                  │
│  - Farm listings             │  - Authentication            │
│  - Product catalog           │  - Order management          │
│  - Shopping cart             │  - WhatsApp notifications    │
│  - Order checkout            │                              │
│  - Farm dashboard            │  Database (PostgreSQL)       │
│  - Admin panel               │  - Users, Farms, Products    │
│                              │  - Orders, Subscriptions     │
└─────────────────────────────────────────────────────────────┘
```

### Technology Stack Summary

| Layer | Technology | Version |
|-------|------------|---------|
| Frontend | Next.js + React | 14.x |
| Styling | Tailwind CSS | 3.x |
| Backend | Node.js + Express | 20.x / 4.x |
| Database | PostgreSQL | 14+ |
| ORM | Prisma | 5.x |
| Auth | NextAuth.js | 4.x |
| Images | Cloudinary | - |
| Notifications | WhatsApp Business API | - |

---

## Phase 1: Project Setup

### Step 1.1: Create Project Structure

```bash
# Create root directory
mkdir farmbox
cd farmbox

# Initialize git repository
git init

# Create project structure
mkdir -p backend frontend docs scripts

# Create environment files
touch .env.example
touch backend/.env
touch frontend/.env.local
```

### Step 1.2: Backend Setup

```bash
cd backend

# Initialize Node.js project
npm init -y

# Install core dependencies
npm install express cors helmet morgan dotenv
npm install prisma @prisma/client
npm install jsonwebtoken bcryptjs
npm install express-validator
npm install multer cloudinary

# Install dev dependencies
npm install -D typescript ts-node @types/node @types/express
npm install -D nodemon eslint prettier
npm install -D @types/cors @types/morgan @types/jsonwebtoken @types/bcryptjs

# Initialize TypeScript
npx tsc --init

# Initialize Prisma
npx prisma init
```

**Create `backend/package.json` scripts:**

```json
{
  "scripts": {
    "dev": "nodemon src/index.ts",
    "build": "tsc",
    "start": "node dist/index.js",
    "db:migrate": "prisma migrate dev",
    "db:push": "prisma db push",
    "db:seed": "ts-node prisma/seed.ts",
    "db:studio": "prisma studio"
  }
}
```

### Step 1.3: Frontend Setup

```bash
cd ../frontend

# Create Next.js app with TypeScript and Tailwind
npx create-next-app@latest . --typescript --tailwind --eslint --app --src-dir

# Install additional dependencies
npm install @tanstack/react-query axios
npm install react-hook-form zod @hookform/resolvers
npm install next-auth
npm install lucide-react
npm install date-fns
npm install zustand
```

### Step 1.4: Configure Environment Variables

**`backend/.env`:**

```env
# Server
NODE_ENV=development
PORT=3001

# Database
DATABASE_URL="postgresql://user:password@localhost:5432/farmbox?schema=public"

# JWT
JWT_SECRET=your-super-secret-jwt-key-change-in-production
JWT_EXPIRES_IN=7d

# Cloudinary
CLOUDINARY_CLOUD_NAME=your-cloud-name
CLOUDINARY_API_KEY=your-api-key
CLOUDINARY_API_SECRET=your-api-secret

# WhatsApp (for later)
WHATSAPP_API_TOKEN=your-token
WHATSAPP_PHONE_NUMBER_ID=your-phone-id
```

**`frontend/.env.local`:**

```env
NEXT_PUBLIC_API_URL=http://localhost:3001/api
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=your-nextauth-secret-key
```

---

## Phase 2: Database Design

### Step 2.1: Define Prisma Schema

**Create `backend/prisma/schema.prisma`:**

```prisma
generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

// ============ ENUMS ============

enum UserRole {
  CUSTOMER
  FARMER
  ADMIN
}

enum OrderStatus {
  PENDING
  CONFIRMED
  PREPARING
  OUT_FOR_DELIVERY
  DELIVERED
  CANCELLED
}

enum DeliveryType {
  DELIVERY
  PICKUP
}

enum SubscriptionStatus {
  ACTIVE
  PAUSED
  CANCELLED
}

enum SubscriptionFrequency {
  WEEKLY
  BIWEEKLY
}

enum BoxSize {
  SMALL
  MEDIUM
  LARGE
  FAMILY
}

enum DeliveryZone {
  ZONE_A
  ZONE_B
  ZONE_C
}

// ============ MODELS ============

model User {
  id            String    @id @default(cuid())
  email         String    @unique
  phone         String?   @unique
  passwordHash  String
  name          String
  role          UserRole  @default(CUSTOMER)

  // Address fields
  address       String?
  city          String?
  zone          DeliveryZone?
  coordinates   Json?     // { lat: number, lng: number }

  // Timestamps
  createdAt     DateTime  @default(now())
  updatedAt     DateTime  @updatedAt

  // Relations
  farm          Farm?
  orders        Order[]
  subscriptions Subscription[]
  reviews       Review[]
}

model Farm {
  id            String    @id @default(cuid())
  name          String
  slug          String    @unique
  description   String?   @db.Text
  story         String?   @db.Text

  // Location
  address       String
  city          String
  coordinates   Json?     // { lat: number, lng: number }

  // Contact
  phone         String?
  whatsapp      String?
  email         String?

  // Media
  logo          String?
  coverImage    String?
  images        String[]

  // Business details
  deliveryZones DeliveryZone[]
  isActive      Boolean   @default(true)
  isVerified    Boolean   @default(false)

  // Subscription tier
  tier          String    @default("basic") // basic, growth, pro

  // Timestamps
  createdAt     DateTime  @default(now())
  updatedAt     DateTime  @updatedAt

  // Relations
  owner         User      @relation(fields: [ownerId], references: [id])
  ownerId       String    @unique
  products      Product[]
  orders        Order[]
  subscriptions Subscription[]
  reviews       Review[]

  @@index([slug])
  @@index([isActive])
}

model Product {
  id              String    @id @default(cuid())
  name            String
  nameAr          String?   // Arabic name
  description     String?   @db.Text

  // Pricing
  price           Decimal   @db.Decimal(10, 3)
  unit            String    // kg, bunch, piece, dozen, liter
  minQuantity     Decimal   @default(1) @db.Decimal(10, 2)

  // Categorization
  category        String    // vegetables, herbs, fruits, eggs, honey, olive-oil
  subcategory     String?

  // Availability
  isAvailable     Boolean   @default(true)
  seasonStart     Int?      // Month number (1-12)
  seasonEnd       Int?      // Month number (1-12)
  stockQuantity   Decimal?  @db.Decimal(10, 2)

  // Media
  images          String[]

  // Timestamps
  createdAt       DateTime  @default(now())
  updatedAt       DateTime  @updatedAt

  // Relations
  farm            Farm      @relation(fields: [farmId], references: [id], onDelete: Cascade)
  farmId          String
  orderItems      OrderItem[]

  @@index([farmId])
  @@index([category])
  @@index([isAvailable])
}

model Order {
  id              String      @id @default(cuid())
  orderNumber     String      @unique

  // Status
  status          OrderStatus @default(PENDING)

  // Delivery details
  deliveryType    DeliveryType
  deliveryDate    DateTime
  deliveryWindow  String?     // "6:00-9:00", "18:00-21:00"
  deliveryAddress String?
  deliveryZone    DeliveryZone?
  deliveryFee     Decimal     @default(0) @db.Decimal(10, 3)

  // Pricing
  subtotal        Decimal     @db.Decimal(10, 3)
  total           Decimal     @db.Decimal(10, 3)

  // Payment
  paymentMethod   String      @default("cash") // cash, flouci
  isPaid          Boolean     @default(false)

  // Notes
  customerNotes   String?     @db.Text
  internalNotes   String?     @db.Text

  // Timestamps
  createdAt       DateTime    @default(now())
  updatedAt       DateTime    @updatedAt
  confirmedAt     DateTime?
  deliveredAt     DateTime?

  // Relations
  customer        User        @relation(fields: [customerId], references: [id])
  customerId      String
  farm            Farm        @relation(fields: [farmId], references: [id])
  farmId          String
  items           OrderItem[]
  subscription    Subscription? @relation(fields: [subscriptionId], references: [id])
  subscriptionId  String?

  @@index([customerId])
  @@index([farmId])
  @@index([status])
  @@index([deliveryDate])
}

model OrderItem {
  id          String    @id @default(cuid())
  quantity    Decimal   @db.Decimal(10, 2)
  unitPrice   Decimal   @db.Decimal(10, 3)
  totalPrice  Decimal   @db.Decimal(10, 3)

  // Relations
  order       Order     @relation(fields: [orderId], references: [id], onDelete: Cascade)
  orderId     String
  product     Product   @relation(fields: [productId], references: [id])
  productId   String

  @@index([orderId])
}

model Subscription {
  id              String              @id @default(cuid())

  // Subscription details
  boxSize         BoxSize
  frequency       SubscriptionFrequency
  deliveryDay     Int                 // 0-6 (Sunday-Saturday)
  status          SubscriptionStatus  @default(ACTIVE)

  // Delivery
  deliveryAddress String
  deliveryZone    DeliveryZone

  // Preferences
  preferences     Json?               // { excludeItems: [], notes: "" }

  // Dates
  startDate       DateTime
  nextDelivery    DateTime?
  pausedUntil     DateTime?

  // Timestamps
  createdAt       DateTime            @default(now())
  updatedAt       DateTime            @updatedAt

  // Relations
  customer        User                @relation(fields: [customerId], references: [id])
  customerId      String
  farm            Farm                @relation(fields: [farmId], references: [id])
  farmId          String
  orders          Order[]

  @@index([customerId])
  @@index([farmId])
  @@index([status])
}

model Review {
  id          String    @id @default(cuid())
  rating      Int       // 1-5
  comment     String?   @db.Text

  // Timestamps
  createdAt   DateTime  @default(now())
  updatedAt   DateTime  @updatedAt

  // Relations
  customer    User      @relation(fields: [customerId], references: [id])
  customerId  String
  farm        Farm      @relation(fields: [farmId], references: [id])
  farmId      String

  @@unique([customerId, farmId])
  @@index([farmId])
}

model DeliverySchedule {
  id          String      @id @default(cuid())
  zone        DeliveryZone
  dayOfWeek   Int         // 0-6
  timeWindows String[]    // ["6:00-9:00", "18:00-21:00"]
  isActive    Boolean     @default(true)

  @@unique([zone, dayOfWeek])
}
```

### Step 2.2: Run Database Migration

```bash
cd backend

# Create PostgreSQL database first (using psql or pgAdmin)
# CREATE DATABASE farmbox;

# Run migration
npx prisma migrate dev --name init

# Generate Prisma client
npx prisma generate
```

### Step 2.3: Create Seed Data

**Create `backend/prisma/seed.ts`:**

```typescript
import { PrismaClient, UserRole, DeliveryZone, BoxSize } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('Seeding database...');

  // Create admin user
  const adminPassword = await bcrypt.hash('admin123', 10);
  const admin = await prisma.user.upsert({
    where: { email: 'admin@farmbox.tn' },
    update: {},
    create: {
      email: 'admin@farmbox.tn',
      phone: '+21612345678',
      passwordHash: adminPassword,
      name: 'Admin FarmBox',
      role: UserRole.ADMIN,
    },
  });

  // Create sample farmer
  const farmerPassword = await bcrypt.hash('farmer123', 10);
  const farmer = await prisma.user.upsert({
    where: { email: 'farmer@example.tn' },
    update: {},
    create: {
      email: 'farmer@example.tn',
      phone: '+21698765432',
      passwordHash: farmerPassword,
      name: 'Ahmed Ben Salem',
      role: UserRole.FARMER,
      address: 'Route de Zaghouan, Km 15',
      city: 'Zaghouan',
      zone: DeliveryZone.ZONE_B,
    },
  });

  // Create sample farm
  const farm = await prisma.farm.upsert({
    where: { slug: 'ferme-ben-salem' },
    update: {},
    create: {
      name: 'Ferme Ben Salem',
      slug: 'ferme-ben-salem',
      description: 'Ferme familiale bio depuis 3 générations, spécialisée dans les légumes de saison et les herbes aromatiques.',
      story: 'Notre famille cultive cette terre fertile depuis 1960. Nous pratiquons une agriculture traditionnelle et respectueuse de l\'environnement.',
      address: 'Route de Zaghouan, Km 15',
      city: 'Zaghouan',
      coordinates: { lat: 36.4028, lng: 10.1428 },
      phone: '+21698765432',
      whatsapp: '+21698765432',
      email: 'contact@fermebensalem.tn',
      deliveryZones: [DeliveryZone.ZONE_A, DeliveryZone.ZONE_B],
      isActive: true,
      isVerified: true,
      ownerId: farmer.id,
    },
  });

  // Create sample products
  const products = [
    {
      name: 'Tomates Bio',
      nameAr: 'طماطم عضوية',
      description: 'Tomates fraîches cultivées sans pesticides',
      price: 3.5,
      unit: 'kg',
      category: 'vegetables',
      isAvailable: true,
      seasonStart: 5,
      seasonEnd: 10,
      farmId: farm.id,
    },
    {
      name: 'Menthe Fraîche',
      nameAr: 'نعناع طازج',
      description: 'Bouquet de menthe fraîche pour thé et cuisine',
      price: 1.5,
      unit: 'bunch',
      category: 'herbs',
      isAvailable: true,
      farmId: farm.id,
    },
    {
      name: 'Huile d\'Olive Extra Vierge',
      nameAr: 'زيت زيتون بكر ممتاز',
      description: 'Huile d\'olive première pression à froid',
      price: 20.0,
      unit: 'liter',
      category: 'olive-oil',
      isAvailable: true,
      farmId: farm.id,
    },
    {
      name: 'Oeufs Fermiers',
      nameAr: 'بيض بلدي',
      description: 'Oeufs de poules élevées en plein air',
      price: 6.0,
      unit: 'dozen',
      category: 'eggs',
      isAvailable: true,
      farmId: farm.id,
    },
    {
      name: 'Miel de Thym',
      nameAr: 'عسل الزعتر',
      description: 'Miel pur de thym sauvage',
      price: 35.0,
      unit: 'kg',
      category: 'honey',
      isAvailable: true,
      farmId: farm.id,
    },
  ];

  for (const product of products) {
    await prisma.product.create({ data: product });
  }

  // Create delivery schedules
  const schedules = [
    { zone: DeliveryZone.ZONE_A, dayOfWeek: 3, timeWindows: ['6:00-9:00', '18:00-21:00'] }, // Wednesday
    { zone: DeliveryZone.ZONE_B, dayOfWeek: 4, timeWindows: ['6:00-9:00', '18:00-21:00'] }, // Thursday
    { zone: DeliveryZone.ZONE_C, dayOfWeek: 4, timeWindows: ['6:00-9:00', '18:00-21:00'] }, // Thursday
  ];

  for (const schedule of schedules) {
    await prisma.deliverySchedule.upsert({
      where: { zone_dayOfWeek: { zone: schedule.zone, dayOfWeek: schedule.dayOfWeek } },
      update: {},
      create: schedule,
    });
  }

  // Create sample customer
  const customerPassword = await bcrypt.hash('customer123', 10);
  await prisma.user.upsert({
    where: { email: 'customer@example.tn' },
    update: {},
    create: {
      email: 'customer@example.tn',
      phone: '+21655555555',
      passwordHash: customerPassword,
      name: 'Sonia Trabelsi',
      role: UserRole.CUSTOMER,
      address: '15 Avenue Habib Bourguiba',
      city: 'La Marsa',
      zone: DeliveryZone.ZONE_A,
    },
  });

  console.log('Database seeded successfully!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
```

**Run seed:**

```bash
npm run db:seed
```

---

## Phase 3: Backend API Development

### Step 3.1: Project Structure

```bash
cd backend
mkdir -p src/{config,controllers,middleware,routes,services,utils,types}
```

**Create directory structure:**

```
backend/src/
├── config/
│   ├── database.ts
│   └── cloudinary.ts
├── controllers/
│   ├── auth.controller.ts
│   ├── farm.controller.ts
│   ├── product.controller.ts
│   ├── order.controller.ts
│   └── subscription.controller.ts
├── middleware/
│   ├── auth.middleware.ts
│   ├── validate.middleware.ts
│   └── error.middleware.ts
├── routes/
│   ├── index.ts
│   ├── auth.routes.ts
│   ├── farm.routes.ts
│   ├── product.routes.ts
│   ├── order.routes.ts
│   └── subscription.routes.ts
├── services/
│   ├── auth.service.ts
│   ├── farm.service.ts
│   ├── order.service.ts
│   ├── notification.service.ts
│   └── upload.service.ts
├── utils/
│   ├── helpers.ts
│   └── validators.ts
├── types/
│   └── index.ts
└── index.ts
```

### Step 3.2: Create Core Backend Files

**`backend/src/index.ts`:**

```typescript
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import dotenv from 'dotenv';
import routes from './routes';
import { errorHandler } from './middleware/error.middleware';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(helmet());
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:3000',
  credentials: true,
}));
app.use(morgan('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// API routes
app.use('/api', routes);

// Error handler
app.use(errorHandler);

// Start server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

export default app;
```

**`backend/src/config/database.ts`:**

```typescript
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient({
  log: process.env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error'],
});

export default prisma;
```

**`backend/src/middleware/auth.middleware.ts`:**

```typescript
import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import prisma from '../config/database';

export interface AuthRequest extends Request {
  user?: {
    id: string;
    email: string;
    role: string;
  };
}

export const authenticate = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader?.startsWith('Bearer ')) {
      return res.status(401).json({ error: 'No token provided' });
    }

    const token = authHeader.split(' ')[1];
    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as {
      userId: string;
      email: string;
      role: string;
    };

    const user = await prisma.user.findUnique({
      where: { id: decoded.userId },
      select: { id: true, email: true, role: true },
    });

    if (!user) {
      return res.status(401).json({ error: 'User not found' });
    }

    req.user = user;
    next();
  } catch (error) {
    return res.status(401).json({ error: 'Invalid token' });
  }
};

export const requireRole = (...roles: string[]) => {
  return (req: AuthRequest, res: Response, next: NextFunction) => {
    if (!req.user || !roles.includes(req.user.role)) {
      return res.status(403).json({ error: 'Insufficient permissions' });
    }
    next();
  };
};
```

**`backend/src/middleware/error.middleware.ts`:**

```typescript
import { Request, Response, NextFunction } from 'express';

export class AppError extends Error {
  statusCode: number;

  constructor(message: string, statusCode: number) {
    super(message);
    this.statusCode = statusCode;
  }
}

export const errorHandler = (
  err: Error,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  console.error('Error:', err);

  if (err instanceof AppError) {
    return res.status(err.statusCode).json({ error: err.message });
  }

  // Prisma errors
  if (err.name === 'PrismaClientKnownRequestError') {
    return res.status(400).json({ error: 'Database operation failed' });
  }

  return res.status(500).json({ error: 'Internal server error' });
};
```

### Step 3.3: Create Auth Controller & Routes

**`backend/src/controllers/auth.controller.ts`:**

```typescript
import { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import prisma from '../config/database';
import { AuthRequest } from '../middleware/auth.middleware';

export const register = async (req: Request, res: Response) => {
  try {
    const { email, phone, password, name, role = 'CUSTOMER' } = req.body;

    // Check if user exists
    const existingUser = await prisma.user.findFirst({
      where: { OR: [{ email }, { phone }] },
    });

    if (existingUser) {
      return res.status(400).json({ error: 'User already exists' });
    }

    // Hash password
    const passwordHash = await bcrypt.hash(password, 10);

    // Create user
    const user = await prisma.user.create({
      data: {
        email,
        phone,
        passwordHash,
        name,
        role,
      },
      select: {
        id: true,
        email: true,
        phone: true,
        name: true,
        role: true,
      },
    });

    // Generate token
    const token = jwt.sign(
      { userId: user.id, email: user.email, role: user.role },
      process.env.JWT_SECRET!,
      { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
    );

    res.status(201).json({ user, token });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ error: 'Registration failed' });
  }
};

export const login = async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;

    // Find user
    const user = await prisma.user.findUnique({
      where: { email },
    });

    if (!user) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    // Verify password
    const isValid = await bcrypt.compare(password, user.passwordHash);
    if (!isValid) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    // Generate token
    const token = jwt.sign(
      { userId: user.id, email: user.email, role: user.role },
      process.env.JWT_SECRET!,
      { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
    );

    res.json({
      user: {
        id: user.id,
        email: user.email,
        phone: user.phone,
        name: user.name,
        role: user.role,
      },
      token,
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: 'Login failed' });
  }
};

export const getProfile = async (req: AuthRequest, res: Response) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.user!.id },
      select: {
        id: true,
        email: true,
        phone: true,
        name: true,
        role: true,
        address: true,
        city: true,
        zone: true,
        farm: {
          select: {
            id: true,
            name: true,
            slug: true,
          },
        },
      },
    });

    res.json(user);
  } catch (error) {
    console.error('Get profile error:', error);
    res.status(500).json({ error: 'Failed to get profile' });
  }
};

export const updateProfile = async (req: AuthRequest, res: Response) => {
  try {
    const { name, phone, address, city, zone } = req.body;

    const user = await prisma.user.update({
      where: { id: req.user!.id },
      data: { name, phone, address, city, zone },
      select: {
        id: true,
        email: true,
        phone: true,
        name: true,
        address: true,
        city: true,
        zone: true,
      },
    });

    res.json(user);
  } catch (error) {
    console.error('Update profile error:', error);
    res.status(500).json({ error: 'Failed to update profile' });
  }
};
```

**`backend/src/routes/auth.routes.ts`:**

```typescript
import { Router } from 'express';
import { register, login, getProfile, updateProfile } from '../controllers/auth.controller';
import { authenticate } from '../middleware/auth.middleware';

const router = Router();

router.post('/register', register);
router.post('/login', login);
router.get('/profile', authenticate, getProfile);
router.put('/profile', authenticate, updateProfile);

export default router;
```

### Step 3.4: Create Farm Controller & Routes

**`backend/src/controllers/farm.controller.ts`:**

```typescript
import { Request, Response } from 'express';
import prisma from '../config/database';
import { AuthRequest } from '../middleware/auth.middleware';

export const getAllFarms = async (req: Request, res: Response) => {
  try {
    const { zone, search } = req.query;

    const farms = await prisma.farm.findMany({
      where: {
        isActive: true,
        ...(zone && { deliveryZones: { has: zone as any } }),
        ...(search && {
          OR: [
            { name: { contains: search as string, mode: 'insensitive' } },
            { description: { contains: search as string, mode: 'insensitive' } },
          ],
        }),
      },
      include: {
        products: {
          where: { isAvailable: true },
          take: 4,
        },
        _count: {
          select: { products: true, reviews: true },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    // Calculate average rating for each farm
    const farmsWithRating = await Promise.all(
      farms.map(async (farm) => {
        const avgRating = await prisma.review.aggregate({
          where: { farmId: farm.id },
          _avg: { rating: true },
        });
        return {
          ...farm,
          averageRating: avgRating._avg.rating || 0,
        };
      })
    );

    res.json(farmsWithRating);
  } catch (error) {
    console.error('Get farms error:', error);
    res.status(500).json({ error: 'Failed to get farms' });
  }
};

export const getFarmBySlug = async (req: Request, res: Response) => {
  try {
    const { slug } = req.params;

    const farm = await prisma.farm.findUnique({
      where: { slug },
      include: {
        products: {
          where: { isAvailable: true },
          orderBy: { category: 'asc' },
        },
        reviews: {
          include: {
            customer: {
              select: { name: true },
            },
          },
          orderBy: { createdAt: 'desc' },
          take: 10,
        },
        _count: {
          select: { products: true, reviews: true, orders: true },
        },
      },
    });

    if (!farm) {
      return res.status(404).json({ error: 'Farm not found' });
    }

    // Calculate average rating
    const avgRating = await prisma.review.aggregate({
      where: { farmId: farm.id },
      _avg: { rating: true },
    });

    res.json({
      ...farm,
      averageRating: avgRating._avg.rating || 0,
    });
  } catch (error) {
    console.error('Get farm error:', error);
    res.status(500).json({ error: 'Failed to get farm' });
  }
};

export const createFarm = async (req: AuthRequest, res: Response) => {
  try {
    const { name, description, story, address, city, phone, whatsapp, deliveryZones } = req.body;

    // Generate slug from name
    const slug = name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '');

    // Check if slug exists
    const existingFarm = await prisma.farm.findUnique({ where: { slug } });
    if (existingFarm) {
      return res.status(400).json({ error: 'Farm name already taken' });
    }

    const farm = await prisma.farm.create({
      data: {
        name,
        slug,
        description,
        story,
        address,
        city,
        phone,
        whatsapp,
        deliveryZones,
        ownerId: req.user!.id,
      },
    });

    // Update user role to FARMER
    await prisma.user.update({
      where: { id: req.user!.id },
      data: { role: 'FARMER' },
    });

    res.status(201).json(farm);
  } catch (error) {
    console.error('Create farm error:', error);
    res.status(500).json({ error: 'Failed to create farm' });
  }
};

export const updateFarm = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const updateData = req.body;

    // Verify ownership
    const farm = await prisma.farm.findFirst({
      where: { id, ownerId: req.user!.id },
    });

    if (!farm) {
      return res.status(404).json({ error: 'Farm not found or unauthorized' });
    }

    const updatedFarm = await prisma.farm.update({
      where: { id },
      data: updateData,
    });

    res.json(updatedFarm);
  } catch (error) {
    console.error('Update farm error:', error);
    res.status(500).json({ error: 'Failed to update farm' });
  }
};

export const getMyFarm = async (req: AuthRequest, res: Response) => {
  try {
    const farm = await prisma.farm.findUnique({
      where: { ownerId: req.user!.id },
      include: {
        products: true,
        _count: {
          select: { orders: true, subscriptions: true, reviews: true },
        },
      },
    });

    if (!farm) {
      return res.status(404).json({ error: 'No farm found' });
    }

    res.json(farm);
  } catch (error) {
    console.error('Get my farm error:', error);
    res.status(500).json({ error: 'Failed to get farm' });
  }
};
```

**`backend/src/routes/farm.routes.ts`:**

```typescript
import { Router } from 'express';
import {
  getAllFarms,
  getFarmBySlug,
  createFarm,
  updateFarm,
  getMyFarm,
} from '../controllers/farm.controller';
import { authenticate, requireRole } from '../middleware/auth.middleware';

const router = Router();

// Public routes
router.get('/', getAllFarms);
router.get('/:slug', getFarmBySlug);

// Protected routes
router.post('/', authenticate, createFarm);
router.get('/me/farm', authenticate, requireRole('FARMER'), getMyFarm);
router.put('/:id', authenticate, requireRole('FARMER'), updateFarm);

export default router;
```

### Step 3.5: Create Product Controller & Routes

**`backend/src/controllers/product.controller.ts`:**

```typescript
import { Request, Response } from 'express';
import prisma from '../config/database';
import { AuthRequest } from '../middleware/auth.middleware';

export const getProducts = async (req: Request, res: Response) => {
  try {
    const { farmId, category, available } = req.query;

    const products = await prisma.product.findMany({
      where: {
        ...(farmId && { farmId: farmId as string }),
        ...(category && { category: category as string }),
        ...(available === 'true' && { isAvailable: true }),
      },
      include: {
        farm: {
          select: { id: true, name: true, slug: true },
        },
      },
      orderBy: { name: 'asc' },
    });

    res.json(products);
  } catch (error) {
    console.error('Get products error:', error);
    res.status(500).json({ error: 'Failed to get products' });
  }
};

export const getProductById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const product = await prisma.product.findUnique({
      where: { id },
      include: {
        farm: {
          select: { id: true, name: true, slug: true, phone: true },
        },
      },
    });

    if (!product) {
      return res.status(404).json({ error: 'Product not found' });
    }

    res.json(product);
  } catch (error) {
    console.error('Get product error:', error);
    res.status(500).json({ error: 'Failed to get product' });
  }
};

export const createProduct = async (req: AuthRequest, res: Response) => {
  try {
    // Get farmer's farm
    const farm = await prisma.farm.findUnique({
      where: { ownerId: req.user!.id },
    });

    if (!farm) {
      return res.status(400).json({ error: 'You must create a farm first' });
    }

    const product = await prisma.product.create({
      data: {
        ...req.body,
        farmId: farm.id,
      },
    });

    res.status(201).json(product);
  } catch (error) {
    console.error('Create product error:', error);
    res.status(500).json({ error: 'Failed to create product' });
  }
};

export const updateProduct = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;

    // Verify ownership
    const product = await prisma.product.findFirst({
      where: { id },
      include: { farm: true },
    });

    if (!product || product.farm.ownerId !== req.user!.id) {
      return res.status(404).json({ error: 'Product not found or unauthorized' });
    }

    const updatedProduct = await prisma.product.update({
      where: { id },
      data: req.body,
    });

    res.json(updatedProduct);
  } catch (error) {
    console.error('Update product error:', error);
    res.status(500).json({ error: 'Failed to update product' });
  }
};

export const deleteProduct = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;

    // Verify ownership
    const product = await prisma.product.findFirst({
      where: { id },
      include: { farm: true },
    });

    if (!product || product.farm.ownerId !== req.user!.id) {
      return res.status(404).json({ error: 'Product not found or unauthorized' });
    }

    await prisma.product.delete({ where: { id } });

    res.json({ message: 'Product deleted' });
  } catch (error) {
    console.error('Delete product error:', error);
    res.status(500).json({ error: 'Failed to delete product' });
  }
};
```

**`backend/src/routes/product.routes.ts`:**

```typescript
import { Router } from 'express';
import {
  getProducts,
  getProductById,
  createProduct,
  updateProduct,
  deleteProduct,
} from '../controllers/product.controller';
import { authenticate, requireRole } from '../middleware/auth.middleware';

const router = Router();

// Public routes
router.get('/', getProducts);
router.get('/:id', getProductById);

// Protected routes (farmers only)
router.post('/', authenticate, requireRole('FARMER'), createProduct);
router.put('/:id', authenticate, requireRole('FARMER'), updateProduct);
router.delete('/:id', authenticate, requireRole('FARMER'), deleteProduct);

export default router;
```

### Step 3.6: Create Order Controller & Routes

**`backend/src/controllers/order.controller.ts`:**

```typescript
import { Request, Response } from 'express';
import prisma from '../config/database';
import { AuthRequest } from '../middleware/auth.middleware';
import { generateOrderNumber } from '../utils/helpers';

export const createOrder = async (req: AuthRequest, res: Response) => {
  try {
    const {
      farmId,
      items,
      deliveryType,
      deliveryDate,
      deliveryWindow,
      deliveryAddress,
      deliveryZone,
      customerNotes,
    } = req.body;

    // Validate items and calculate totals
    let subtotal = 0;
    const orderItems = [];

    for (const item of items) {
      const product = await prisma.product.findUnique({
        where: { id: item.productId },
      });

      if (!product || product.farmId !== farmId) {
        return res.status(400).json({ error: `Invalid product: ${item.productId}` });
      }

      const totalPrice = Number(product.price) * item.quantity;
      subtotal += totalPrice;

      orderItems.push({
        productId: item.productId,
        quantity: item.quantity,
        unitPrice: product.price,
        totalPrice,
      });
    }

    // Calculate delivery fee based on zone
    let deliveryFee = 0;
    if (deliveryType === 'DELIVERY') {
      switch (deliveryZone) {
        case 'ZONE_A':
          deliveryFee = subtotal >= 80 ? 0 : 5;
          break;
        case 'ZONE_B':
          deliveryFee = subtotal >= 120 ? 0 : 8;
          break;
        case 'ZONE_C':
          deliveryFee = subtotal >= 150 ? 0 : 12;
          break;
      }
    }

    const total = subtotal + deliveryFee;

    // Create order
    const order = await prisma.order.create({
      data: {
        orderNumber: generateOrderNumber(),
        customerId: req.user!.id,
        farmId,
        deliveryType,
        deliveryDate: new Date(deliveryDate),
        deliveryWindow,
        deliveryAddress,
        deliveryZone,
        deliveryFee,
        subtotal,
        total,
        customerNotes,
        items: {
          create: orderItems,
        },
      },
      include: {
        items: {
          include: { product: true },
        },
        farm: {
          select: { name: true, phone: true },
        },
      },
    });

    // TODO: Send notification to farmer

    res.status(201).json(order);
  } catch (error) {
    console.error('Create order error:', error);
    res.status(500).json({ error: 'Failed to create order' });
  }
};

export const getMyOrders = async (req: AuthRequest, res: Response) => {
  try {
    const orders = await prisma.order.findMany({
      where: { customerId: req.user!.id },
      include: {
        items: {
          include: { product: true },
        },
        farm: {
          select: { name: true, slug: true },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    res.json(orders);
  } catch (error) {
    console.error('Get my orders error:', error);
    res.status(500).json({ error: 'Failed to get orders' });
  }
};

export const getFarmOrders = async (req: AuthRequest, res: Response) => {
  try {
    const farm = await prisma.farm.findUnique({
      where: { ownerId: req.user!.id },
    });

    if (!farm) {
      return res.status(404).json({ error: 'Farm not found' });
    }

    const { status, date } = req.query;

    const orders = await prisma.order.findMany({
      where: {
        farmId: farm.id,
        ...(status && { status: status as any }),
        ...(date && {
          deliveryDate: {
            gte: new Date(date as string),
            lt: new Date(new Date(date as string).getTime() + 24 * 60 * 60 * 1000),
          },
        }),
      },
      include: {
        items: {
          include: { product: true },
        },
        customer: {
          select: { name: true, phone: true, address: true },
        },
      },
      orderBy: { deliveryDate: 'asc' },
    });

    res.json(orders);
  } catch (error) {
    console.error('Get farm orders error:', error);
    res.status(500).json({ error: 'Failed to get orders' });
  }
};

export const updateOrderStatus = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    // Verify farmer ownership
    const order = await prisma.order.findFirst({
      where: { id },
      include: { farm: true },
    });

    if (!order || order.farm.ownerId !== req.user!.id) {
      return res.status(404).json({ error: 'Order not found or unauthorized' });
    }

    const updatedOrder = await prisma.order.update({
      where: { id },
      data: {
        status,
        ...(status === 'CONFIRMED' && { confirmedAt: new Date() }),
        ...(status === 'DELIVERED' && { deliveredAt: new Date() }),
      },
    });

    // TODO: Send notification to customer

    res.json(updatedOrder);
  } catch (error) {
    console.error('Update order status error:', error);
    res.status(500).json({ error: 'Failed to update order' });
  }
};

export const getOrderById = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;

    const order = await prisma.order.findFirst({
      where: {
        id,
        OR: [
          { customerId: req.user!.id },
          { farm: { ownerId: req.user!.id } },
        ],
      },
      include: {
        items: {
          include: { product: true },
        },
        farm: {
          select: { name: true, slug: true, phone: true },
        },
        customer: {
          select: { name: true, phone: true, address: true },
        },
      },
    });

    if (!order) {
      return res.status(404).json({ error: 'Order not found' });
    }

    res.json(order);
  } catch (error) {
    console.error('Get order error:', error);
    res.status(500).json({ error: 'Failed to get order' });
  }
};
```

**`backend/src/routes/order.routes.ts`:**

```typescript
import { Router } from 'express';
import {
  createOrder,
  getMyOrders,
  getFarmOrders,
  updateOrderStatus,
  getOrderById,
} from '../controllers/order.controller';
import { authenticate, requireRole } from '../middleware/auth.middleware';

const router = Router();

// Customer routes
router.post('/', authenticate, createOrder);
router.get('/my-orders', authenticate, getMyOrders);
router.get('/:id', authenticate, getOrderById);

// Farmer routes
router.get('/farm/orders', authenticate, requireRole('FARMER'), getFarmOrders);
router.patch('/:id/status', authenticate, requireRole('FARMER'), updateOrderStatus);

export default router;
```

### Step 3.7: Create Utility Functions

**`backend/src/utils/helpers.ts`:**

```typescript
export function generateOrderNumber(): string {
  const timestamp = Date.now().toString(36).toUpperCase();
  const random = Math.random().toString(36).substring(2, 6).toUpperCase();
  return `FB-${timestamp}-${random}`;
}

export function calculateDeliveryFee(zone: string, subtotal: number): number {
  const feeStructure: Record<string, { fee: number; freeThreshold: number }> = {
    ZONE_A: { fee: 5, freeThreshold: 80 },
    ZONE_B: { fee: 8, freeThreshold: 120 },
    ZONE_C: { fee: 12, freeThreshold: 150 },
  };

  const zoneConfig = feeStructure[zone];
  if (!zoneConfig) return 0;

  return subtotal >= zoneConfig.freeThreshold ? 0 : zoneConfig.fee;
}

export function isProductInSeason(
  seasonStart: number | null,
  seasonEnd: number | null
): boolean {
  if (!seasonStart || !seasonEnd) return true;

  const currentMonth = new Date().getMonth() + 1;

  if (seasonStart <= seasonEnd) {
    return currentMonth >= seasonStart && currentMonth <= seasonEnd;
  } else {
    // Season spans year boundary (e.g., Nov-Feb)
    return currentMonth >= seasonStart || currentMonth <= seasonEnd;
  }
}
```

### Step 3.8: Create Main Routes File

**`backend/src/routes/index.ts`:**

```typescript
import { Router } from 'express';
import authRoutes from './auth.routes';
import farmRoutes from './farm.routes';
import productRoutes from './product.routes';
import orderRoutes from './order.routes';

const router = Router();

router.use('/auth', authRoutes);
router.use('/farms', farmRoutes);
router.use('/products', productRoutes);
router.use('/orders', orderRoutes);

export default router;
```

### Step 3.9: Create TypeScript Configuration

**`backend/tsconfig.json`:**

```json
{
  "compilerOptions": {
    "target": "ES2020",
    "module": "commonjs",
    "lib": ["ES2020"],
    "outDir": "./dist",
    "rootDir": "./src",
    "strict": true,
    "esModuleInterop": true,
    "skipLibCheck": true,
    "forceConsistentCasingInFileNames": true,
    "resolveJsonModule": true,
    "declaration": true,
    "declarationMap": true,
    "sourceMap": true
  },
  "include": ["src/**/*", "prisma/**/*"],
  "exclude": ["node_modules", "dist"]
}
```

---

## Phase 4: Frontend Development

### Step 4.1: Project Structure

```
frontend/src/
├── app/
│   ├── (auth)/
│   │   ├── login/page.tsx
│   │   └── register/page.tsx
│   ├── (main)/
│   │   ├── page.tsx              # Landing page
│   │   ├── farms/
│   │   │   ├── page.tsx          # Farm listing
│   │   │   └── [slug]/page.tsx   # Farm detail
│   │   ├── cart/page.tsx
│   │   └── checkout/page.tsx
│   ├── dashboard/
│   │   ├── page.tsx              # Customer dashboard
│   │   ├── orders/page.tsx
│   │   └── subscriptions/page.tsx
│   ├── farmer/
│   │   ├── page.tsx              # Farmer dashboard
│   │   ├── products/page.tsx
│   │   ├── orders/page.tsx
│   │   └── settings/page.tsx
│   ├── layout.tsx
│   └── globals.css
├── components/
│   ├── ui/                       # Reusable UI components
│   ├── layout/                   # Header, Footer, etc.
│   ├── farms/                    # Farm-related components
│   ├── products/                 # Product components
│   ├── cart/                     # Cart components
│   └── forms/                    # Form components
├── lib/
│   ├── api.ts                    # API client
│   ├── auth.ts                   # Auth utilities
│   └── utils.ts                  # Helper functions
├── hooks/
│   ├── useCart.ts
│   ├── useAuth.ts
│   └── useFarms.ts
├── store/
│   └── cart.ts                   # Zustand cart store
└── types/
    └── index.ts
```

### Step 4.2: Create API Client

**`frontend/src/lib/api.ts`:**

```typescript
import axios from 'axios';

const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api',
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add auth token
api.interceptors.request.use((config) => {
  if (typeof window !== 'undefined') {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
  }
  return config;
});

// Response interceptor for error handling
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      if (typeof window !== 'undefined') {
        localStorage.removeItem('token');
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

// Auth API
export const authApi = {
  login: (data: { email: string; password: string }) =>
    api.post('/auth/login', data),
  register: (data: { email: string; password: string; name: string; phone?: string }) =>
    api.post('/auth/register', data),
  getProfile: () => api.get('/auth/profile'),
  updateProfile: (data: any) => api.put('/auth/profile', data),
};

// Farms API
export const farmsApi = {
  getAll: (params?: { zone?: string; search?: string }) =>
    api.get('/farms', { params }),
  getBySlug: (slug: string) => api.get(`/farms/${slug}`),
  create: (data: any) => api.post('/farms', data),
  update: (id: string, data: any) => api.put(`/farms/${id}`, data),
  getMyFarm: () => api.get('/farms/me/farm'),
};

// Products API
export const productsApi = {
  getAll: (params?: { farmId?: string; category?: string; available?: boolean }) =>
    api.get('/products', { params }),
  getById: (id: string) => api.get(`/products/${id}`),
  create: (data: any) => api.post('/products', data),
  update: (id: string, data: any) => api.put(`/products/${id}`, data),
  delete: (id: string) => api.delete(`/products/${id}`),
};

// Orders API
export const ordersApi = {
  create: (data: any) => api.post('/orders', data),
  getMyOrders: () => api.get('/orders/my-orders'),
  getById: (id: string) => api.get(`/orders/${id}`),
  getFarmOrders: (params?: { status?: string; date?: string }) =>
    api.get('/orders/farm/orders', { params }),
  updateStatus: (id: string, status: string) =>
    api.patch(`/orders/${id}/status`, { status }),
};

export default api;
```

### Step 4.3: Create Cart Store

**`frontend/src/store/cart.ts`:**

```typescript
import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface CartItem {
  productId: string;
  productName: string;
  farmId: string;
  farmName: string;
  price: number;
  unit: string;
  quantity: number;
  image?: string;
}

interface CartStore {
  items: CartItem[];
  addItem: (item: Omit<CartItem, 'quantity'>) => void;
  removeItem: (productId: string) => void;
  updateQuantity: (productId: string, quantity: number) => void;
  clearCart: () => void;
  clearFarmItems: (farmId: string) => void;
  getSubtotal: () => number;
  getItemCount: () => number;
  getFarmIds: () => string[];
}

export const useCartStore = create<CartStore>()(
  persist(
    (set, get) => ({
      items: [],

      addItem: (item) => {
        set((state) => {
          const existingIndex = state.items.findIndex(
            (i) => i.productId === item.productId
          );

          if (existingIndex > -1) {
            const newItems = [...state.items];
            newItems[existingIndex].quantity += 1;
            return { items: newItems };
          }

          return { items: [...state.items, { ...item, quantity: 1 }] };
        });
      },

      removeItem: (productId) => {
        set((state) => ({
          items: state.items.filter((i) => i.productId !== productId),
        }));
      },

      updateQuantity: (productId, quantity) => {
        if (quantity <= 0) {
          get().removeItem(productId);
          return;
        }

        set((state) => ({
          items: state.items.map((i) =>
            i.productId === productId ? { ...i, quantity } : i
          ),
        }));
      },

      clearCart: () => set({ items: [] }),

      clearFarmItems: (farmId) => {
        set((state) => ({
          items: state.items.filter((i) => i.farmId !== farmId),
        }));
      },

      getSubtotal: () => {
        return get().items.reduce(
          (sum, item) => sum + item.price * item.quantity,
          0
        );
      },

      getItemCount: () => {
        return get().items.reduce((sum, item) => sum + item.quantity, 0);
      },

      getFarmIds: () => {
        return [...new Set(get().items.map((i) => i.farmId))];
      },
    }),
    {
      name: 'farmbox-cart',
    }
  )
);
```

### Step 4.4: Create Types

**`frontend/src/types/index.ts`:**

```typescript
export interface User {
  id: string;
  email: string;
  phone?: string;
  name: string;
  role: 'CUSTOMER' | 'FARMER' | 'ADMIN';
  address?: string;
  city?: string;
  zone?: DeliveryZone;
  farm?: {
    id: string;
    name: string;
    slug: string;
  };
}

export interface Farm {
  id: string;
  name: string;
  slug: string;
  description?: string;
  story?: string;
  address: string;
  city: string;
  phone?: string;
  whatsapp?: string;
  logo?: string;
  coverImage?: string;
  images: string[];
  deliveryZones: DeliveryZone[];
  isActive: boolean;
  isVerified: boolean;
  products?: Product[];
  averageRating?: number;
  _count?: {
    products: number;
    reviews: number;
    orders: number;
  };
}

export interface Product {
  id: string;
  name: string;
  nameAr?: string;
  description?: string;
  price: number;
  unit: string;
  category: string;
  subcategory?: string;
  isAvailable: boolean;
  seasonStart?: number;
  seasonEnd?: number;
  stockQuantity?: number;
  images: string[];
  farmId: string;
  farm?: {
    id: string;
    name: string;
    slug: string;
  };
}

export interface Order {
  id: string;
  orderNumber: string;
  status: OrderStatus;
  deliveryType: DeliveryType;
  deliveryDate: string;
  deliveryWindow?: string;
  deliveryAddress?: string;
  deliveryZone?: DeliveryZone;
  deliveryFee: number;
  subtotal: number;
  total: number;
  paymentMethod: string;
  isPaid: boolean;
  customerNotes?: string;
  createdAt: string;
  items: OrderItem[];
  farm: {
    name: string;
    slug: string;
    phone?: string;
  };
  customer?: {
    name: string;
    phone?: string;
    address?: string;
  };
}

export interface OrderItem {
  id: string;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
  product: Product;
}

export type DeliveryZone = 'ZONE_A' | 'ZONE_B' | 'ZONE_C';
export type DeliveryType = 'DELIVERY' | 'PICKUP';
export type OrderStatus =
  | 'PENDING'
  | 'CONFIRMED'
  | 'PREPARING'
  | 'OUT_FOR_DELIVERY'
  | 'DELIVERED'
  | 'CANCELLED';

export const DELIVERY_ZONES = {
  ZONE_A: {
    name: 'Zone A (0-15km)',
    cities: ['Tunis', 'La Marsa', 'Carthage', 'Sidi Bou Said'],
    fee: 5,
    freeThreshold: 80,
  },
  ZONE_B: {
    name: 'Zone B (15-30km)',
    cities: ['Ariana', 'Ben Arous', 'Manouba'],
    fee: 8,
    freeThreshold: 120,
  },
  ZONE_C: {
    name: 'Zone C (30-50km)',
    cities: ['Outer suburbs'],
    fee: 12,
    freeThreshold: 150,
  },
};

export const PRODUCT_CATEGORIES = [
  { id: 'vegetables', name: 'Légumes', nameAr: 'خضروات' },
  { id: 'herbs', name: 'Herbes', nameAr: 'أعشاب' },
  { id: 'fruits', name: 'Fruits', nameAr: 'فواكه' },
  { id: 'eggs', name: 'Oeufs', nameAr: 'بيض' },
  { id: 'honey', name: 'Miel', nameAr: 'عسل' },
  { id: 'olive-oil', name: 'Huile d\'olive', nameAr: 'زيت زيتون' },
];
```

### Step 4.5: Create Layout Components

**`frontend/src/components/layout/Header.tsx`:**

```typescript
'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ShoppingCart, User, Menu, LogOut } from 'lucide-react';
import { useCartStore } from '@/store/cart';
import { useState, useEffect } from 'react';

export default function Header() {
  const router = useRouter();
  const itemCount = useCartStore((state) => state.getItemCount());
  const [user, setUser] = useState<any>(null);
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    // Check for stored user
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setUser(null);
    router.push('/');
  };

  return (
    <header className="bg-white shadow-sm sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center space-x-2">
            <span className="text-2xl font-bold text-green-600">FarmBox</span>
          </Link>

          {/* Navigation */}
          <nav className="hidden md:flex items-center space-x-8">
            <Link
              href="/farms"
              className="text-gray-600 hover:text-green-600 transition"
            >
              Nos Fermes
            </Link>
            <Link
              href="/how-it-works"
              className="text-gray-600 hover:text-green-600 transition"
            >
              Comment ça marche
            </Link>
          </nav>

          {/* Actions */}
          <div className="flex items-center space-x-4">
            {/* Cart */}
            <Link href="/cart" className="relative p-2">
              <ShoppingCart className="h-6 w-6 text-gray-600" />
              {itemCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-green-600 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                  {itemCount}
                </span>
              )}
            </Link>

            {/* User Menu */}
            {user ? (
              <div className="relative">
                <button
                  onClick={() => setMenuOpen(!menuOpen)}
                  className="flex items-center space-x-2 p-2 rounded-lg hover:bg-gray-100"
                >
                  <User className="h-6 w-6 text-gray-600" />
                  <span className="hidden md:block text-sm">{user.name}</span>
                </button>

                {menuOpen && (
                  <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg py-2">
                    <Link
                      href={user.role === 'FARMER' ? '/farmer' : '/dashboard'}
                      className="block px-4 py-2 text-gray-700 hover:bg-gray-100"
                    >
                      Tableau de bord
                    </Link>
                    <Link
                      href="/dashboard/orders"
                      className="block px-4 py-2 text-gray-700 hover:bg-gray-100"
                    >
                      Mes commandes
                    </Link>
                    <hr className="my-2" />
                    <button
                      onClick={handleLogout}
                      className="w-full text-left px-4 py-2 text-red-600 hover:bg-gray-100 flex items-center"
                    >
                      <LogOut className="h-4 w-4 mr-2" />
                      Déconnexion
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <Link
                href="/login"
                className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition"
              >
                Connexion
              </Link>
            )}

            {/* Mobile menu button */}
            <button className="md:hidden p-2" onClick={() => setMenuOpen(!menuOpen)}>
              <Menu className="h-6 w-6" />
            </button>
          </div>
        </div>
      </div>
    </header>
  );
}
```

### Step 4.6: Create Main Pages

**`frontend/src/app/page.tsx`:** (Landing Page)

```typescript
import Link from 'next/link';
import { Leaf, Truck, Heart, MapPin } from 'lucide-react';

export default function HomePage() {
  return (
    <main>
      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-green-50 to-green-100 py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h1 className="text-4xl md:text-6xl font-bold text-gray-900 mb-6">
              Du champ à votre table
            </h1>
            <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
              Découvrez les produits frais et bio de nos fermes tunisiennes.
              Livraison directe chaque semaine.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                href="/farms"
                className="bg-green-600 text-white px-8 py-3 rounded-lg text-lg font-semibold hover:bg-green-700 transition"
              >
                Découvrir nos fermes
              </Link>
              <Link
                href="/how-it-works"
                className="bg-white text-green-600 px-8 py-3 rounded-lg text-lg font-semibold border-2 border-green-600 hover:bg-green-50 transition"
              >
                Comment ça marche
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-center mb-12">
            Pourquoi choisir FarmBox?
          </h2>
          <div className="grid md:grid-cols-4 gap-8">
            <FeatureCard
              icon={<Leaf className="h-8 w-8" />}
              title="100% Bio"
              description="Produits cultivés sans pesticides ni engrais chimiques"
            />
            <FeatureCard
              icon={<MapPin className="h-8 w-8" />}
              title="Local"
              description="Fermes à moins de 50km de Tunis"
            />
            <FeatureCard
              icon={<Truck className="h-8 w-8" />}
              title="Livraison fraîche"
              description="Récolté et livré en moins de 48h"
            />
            <FeatureCard
              icon={<Heart className="h-8 w-8" />}
              title="Soutien local"
              description="Soutenez directement nos agriculteurs"
            />
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 bg-green-600">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-bold text-white mb-4">
            Prêt à commander?
          </h2>
          <p className="text-green-100 mb-8 text-lg">
            Inscrivez-vous et recevez 10% de réduction sur votre première commande
          </p>
          <Link
            href="/register"
            className="bg-white text-green-600 px-8 py-3 rounded-lg text-lg font-semibold hover:bg-green-50 transition inline-block"
          >
            Créer un compte
          </Link>
        </div>
      </section>
    </main>
  );
}

function FeatureCard({
  icon,
  title,
  description,
}: {
  icon: React.ReactNode;
  title: string;
  description: string;
}) {
  return (
    <div className="text-center p-6">
      <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-green-100 text-green-600 mb-4">
        {icon}
      </div>
      <h3 className="text-xl font-semibold mb-2">{title}</h3>
      <p className="text-gray-600">{description}</p>
    </div>
  );
}
```

**`frontend/src/app/farms/page.tsx`:**

```typescript
'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { farmsApi } from '@/lib/api';
import { Farm, DELIVERY_ZONES, DeliveryZone } from '@/types';
import { MapPin, Star, Package } from 'lucide-react';

export default function FarmsPage() {
  const [farms, setFarms] = useState<Farm[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedZone, setSelectedZone] = useState<string>('');

  useEffect(() => {
    loadFarms();
  }, [selectedZone]);

  const loadFarms = async () => {
    try {
      setLoading(true);
      const params = selectedZone ? { zone: selectedZone } : undefined;
      const response = await farmsApi.getAll(params);
      setFarms(response.data);
    } catch (error) {
      console.error('Failed to load farms:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-4">Nos Fermes Partenaires</h1>
        <p className="text-gray-600">
          Découvrez les fermes bio de la région de Tunis
        </p>
      </div>

      {/* Filters */}
      <div className="mb-8 flex flex-wrap gap-4">
        <select
          value={selectedZone}
          onChange={(e) => setSelectedZone(e.target.value)}
          className="px-4 py-2 border rounded-lg"
        >
          <option value="">Toutes les zones</option>
          {Object.entries(DELIVERY_ZONES).map(([key, zone]) => (
            <option key={key} value={key}>
              {zone.name}
            </option>
          ))}
        </select>
      </div>

      {/* Farms Grid */}
      {loading ? (
        <div className="text-center py-12">Chargement...</div>
      ) : farms.length === 0 ? (
        <div className="text-center py-12 text-gray-500">
          Aucune ferme trouvée
        </div>
      ) : (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {farms.map((farm) => (
            <FarmCard key={farm.id} farm={farm} />
          ))}
        </div>
      )}
    </div>
  );
}

function FarmCard({ farm }: { farm: Farm }) {
  return (
    <Link
      href={`/farms/${farm.slug}`}
      className="bg-white rounded-xl shadow-sm overflow-hidden hover:shadow-md transition"
    >
      {/* Cover Image */}
      <div className="h-48 bg-gradient-to-br from-green-100 to-green-200 relative">
        {farm.coverImage && (
          <img
            src={farm.coverImage}
            alt={farm.name}
            className="w-full h-full object-cover"
          />
        )}
        {farm.isVerified && (
          <span className="absolute top-3 right-3 bg-green-600 text-white text-xs px-2 py-1 rounded-full">
            Vérifié
          </span>
        )}
      </div>

      {/* Content */}
      <div className="p-4">
        <h3 className="text-xl font-semibold mb-2">{farm.name}</h3>

        <div className="flex items-center text-gray-500 text-sm mb-2">
          <MapPin className="h-4 w-4 mr-1" />
          {farm.city}
        </div>

        {farm.averageRating ? (
          <div className="flex items-center text-sm mb-3">
            <Star className="h-4 w-4 text-yellow-400 fill-current mr-1" />
            <span>{farm.averageRating.toFixed(1)}</span>
            <span className="text-gray-400 ml-1">
              ({farm._count?.reviews || 0} avis)
            </span>
          </div>
        ) : null}

        <p className="text-gray-600 text-sm mb-4 line-clamp-2">
          {farm.description}
        </p>

        <div className="flex items-center justify-between">
          <span className="flex items-center text-sm text-gray-500">
            <Package className="h-4 w-4 mr-1" />
            {farm._count?.products || 0} produits
          </span>
          <span className="text-green-600 font-medium text-sm">
            Voir la ferme →
          </span>
        </div>
      </div>
    </Link>
  );
}
```

### Step 4.7: Create Root Layout

**`frontend/src/app/layout.tsx`:**

```typescript
import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import Header from '@/components/layout/Header';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'FarmBox - Produits bio locaux',
  description: 'Commandez des produits frais et bio directement de nos fermes tunisiennes',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="fr">
      <body className={`${inter.className} bg-gray-50 min-h-screen`}>
        <Header />
        {children}
        <footer className="bg-gray-900 text-white py-8 mt-16">
          <div className="max-w-7xl mx-auto px-4 text-center">
            <p className="text-gray-400">
              © 2024 FarmBox. Tous droits réservés.
            </p>
          </div>
        </footer>
      </body>
    </html>
  );
}
```

---

## Phase 5: External Integrations

### Step 5.1: Cloudinary Image Upload

**`backend/src/config/cloudinary.ts`:**

```typescript
import { v2 as cloudinary } from 'cloudinary';

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

export default cloudinary;
```

**`backend/src/services/upload.service.ts`:**

```typescript
import cloudinary from '../config/cloudinary';

export async function uploadImage(
  file: Express.Multer.File,
  folder: string = 'farmbox'
): Promise<string> {
  return new Promise((resolve, reject) => {
    cloudinary.uploader
      .upload_stream(
        {
          folder,
          transformation: [
            { width: 800, height: 600, crop: 'limit' },
            { quality: 'auto' },
          ],
        },
        (error, result) => {
          if (error) reject(error);
          else resolve(result!.secure_url);
        }
      )
      .end(file.buffer);
  });
}

export async function deleteImage(publicId: string): Promise<void> {
  await cloudinary.uploader.destroy(publicId);
}
```

### Step 5.2: WhatsApp Notifications

**`backend/src/services/notification.service.ts`:**

```typescript
import axios from 'axios';

const WHATSAPP_API_URL = 'https://graph.facebook.com/v17.0';

interface NotificationOptions {
  to: string;
  template: string;
  parameters?: string[];
}

export async function sendWhatsAppMessage(options: NotificationOptions) {
  const { to, template, parameters } = options;

  try {
    const response = await axios.post(
      `${WHATSAPP_API_URL}/${process.env.WHATSAPP_PHONE_NUMBER_ID}/messages`,
      {
        messaging_product: 'whatsapp',
        to: to.replace(/[^0-9]/g, ''),
        type: 'template',
        template: {
          name: template,
          language: { code: 'fr' },
          components: parameters
            ? [
                {
                  type: 'body',
                  parameters: parameters.map((text) => ({ type: 'text', text })),
                },
              ]
            : undefined,
        },
      },
      {
        headers: {
          Authorization: `Bearer ${process.env.WHATSAPP_API_TOKEN}`,
          'Content-Type': 'application/json',
        },
      }
    );

    return response.data;
  } catch (error) {
    console.error('WhatsApp notification error:', error);
    throw error;
  }
}

// Notification templates
export const notifications = {
  orderConfirmation: (phone: string, orderNumber: string, total: string) =>
    sendWhatsAppMessage({
      to: phone,
      template: 'order_confirmation',
      parameters: [orderNumber, total],
    }),

  orderReady: (phone: string, orderNumber: string) =>
    sendWhatsAppMessage({
      to: phone,
      template: 'order_ready',
      parameters: [orderNumber],
    }),

  deliveryStarted: (phone: string, orderNumber: string, estimatedTime: string) =>
    sendWhatsAppMessage({
      to: phone,
      template: 'delivery_started',
      parameters: [orderNumber, estimatedTime],
    }),
};
```

---

## Phase 6: Testing

### Step 6.1: Backend Testing Setup

```bash
cd backend
npm install -D jest ts-jest @types/jest supertest @types/supertest
```

**Create `backend/jest.config.js`:**

```javascript
module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  roots: ['<rootDir>/src'],
  testMatch: ['**/__tests__/**/*.ts', '**/*.test.ts'],
  moduleFileExtensions: ['ts', 'js', 'json'],
  collectCoverageFrom: ['src/**/*.ts', '!src/**/*.d.ts'],
  setupFilesAfterEnv: ['<rootDir>/src/test/setup.ts'],
};
```

**Create `backend/src/test/setup.ts`:**

```typescript
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

beforeAll(async () => {
  // Setup test database
});

afterAll(async () => {
  await prisma.$disconnect();
});
```

### Step 6.2: API Test Example

**Create `backend/src/__tests__/auth.test.ts`:**

```typescript
import request from 'supertest';
import app from '../index';

describe('Auth API', () => {
  describe('POST /api/auth/register', () => {
    it('should register a new user', async () => {
      const response = await request(app)
        .post('/api/auth/register')
        .send({
          email: 'test@example.com',
          password: 'password123',
          name: 'Test User',
        });

      expect(response.status).toBe(201);
      expect(response.body).toHaveProperty('user');
      expect(response.body).toHaveProperty('token');
    });

    it('should reject duplicate email', async () => {
      // First registration
      await request(app).post('/api/auth/register').send({
        email: 'duplicate@example.com',
        password: 'password123',
        name: 'User 1',
      });

      // Second registration with same email
      const response = await request(app)
        .post('/api/auth/register')
        .send({
          email: 'duplicate@example.com',
          password: 'password456',
          name: 'User 2',
        });

      expect(response.status).toBe(400);
    });
  });

  describe('POST /api/auth/login', () => {
    it('should login with valid credentials', async () => {
      // Register first
      await request(app).post('/api/auth/register').send({
        email: 'login@example.com',
        password: 'password123',
        name: 'Login User',
      });

      // Login
      const response = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'login@example.com',
          password: 'password123',
        });

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('token');
    });
  });
});
```

### Step 6.3: Frontend Testing Setup

```bash
cd frontend
npm install -D @testing-library/react @testing-library/jest-dom jest jest-environment-jsdom
```

---

## Phase 7: Deployment

### Step 7.1: Backend Deployment (Railway)

1. Create `backend/Procfile`:
```
web: npm start
```

2. Create `backend/railway.json`:
```json
{
  "$schema": "https://railway.app/railway.schema.json",
  "build": {
    "builder": "NIXPACKS"
  },
  "deploy": {
    "startCommand": "npx prisma migrate deploy && npm start",
    "healthcheckPath": "/health",
    "restartPolicyType": "ON_FAILURE"
  }
}
```

3. Deploy commands:
```bash
# Install Railway CLI
npm install -g @railway/cli

# Login and deploy
railway login
railway init
railway up
```

### Step 7.2: Frontend Deployment (Vercel)

1. Create `frontend/vercel.json`:
```json
{
  "framework": "nextjs",
  "regions": ["fra1"],
  "env": {
    "NEXT_PUBLIC_API_URL": "@api_url"
  }
}
```

2. Deploy:
```bash
# Install Vercel CLI
npm install -g vercel

# Deploy
vercel --prod
```

### Step 7.3: Database Hosting (Supabase/Neon)

For PostgreSQL hosting, use:
- **Supabase**: Free tier with 500MB storage
- **Neon**: Serverless PostgreSQL, free tier available

Update `DATABASE_URL` in production environment.

---

## Phase 8: Launch Preparation

### Step 8.1: Pre-Launch Checklist

```markdown
## Technical Checklist
- [ ] All API endpoints tested
- [ ] Database migrations applied
- [ ] Environment variables configured
- [ ] SSL certificates active
- [ ] Error monitoring set up (Sentry)
- [ ] Analytics configured (Google Analytics)
- [ ] Backup system in place

## Content Checklist
- [ ] At least 1 farm profile complete
- [ ] Minimum 5 products listed
- [ ] Farm photos uploaded
- [ ] Delivery zones configured
- [ ] Pricing finalized

## Business Checklist
- [ ] Payment method ready (cash on delivery)
- [ ] WhatsApp Business account set up
- [ ] Order confirmation templates ready
- [ ] Delivery schedule finalized
- [ ] Customer support process defined
```

### Step 8.2: Soft Launch Steps

1. **Week 1**: Internal testing with team
2. **Week 2**: Friends and family beta (10-20 users)
3. **Week 3**: Limited public launch (first 50 customers)
4. **Week 4+**: Open public launch

### Step 8.3: Post-Launch Monitoring

```typescript
// Key metrics to track daily
const metrics = {
  orders: {
    total: 'count of orders',
    completed: 'successful deliveries',
    cancelled: 'cancelled orders',
  },
  users: {
    signups: 'new registrations',
    active: 'users who placed orders',
  },
  revenue: {
    gmv: 'gross merchandise value',
    commission: 'platform revenue',
  },
  satisfaction: {
    rating: 'average order rating',
    nps: 'net promoter score',
  },
};
```

---

## Appendix: Code Templates

### A.1: Environment Variables Template

**`.env.example`:**

```env
# Backend
NODE_ENV=development
PORT=3001
DATABASE_URL="postgresql://user:password@localhost:5432/farmbox"
JWT_SECRET=change-this-in-production
JWT_EXPIRES_IN=7d
FRONTEND_URL=http://localhost:3000

# Cloudinary
CLOUDINARY_CLOUD_NAME=
CLOUDINARY_API_KEY=
CLOUDINARY_API_SECRET=

# WhatsApp
WHATSAPP_API_TOKEN=
WHATSAPP_PHONE_NUMBER_ID=

# Frontend
NEXT_PUBLIC_API_URL=http://localhost:3001/api
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=change-this-in-production
```

### A.2: Docker Compose (Development)

**`docker-compose.yml`:**

```yaml
version: '3.8'

services:
  db:
    image: postgres:14
    environment:
      POSTGRES_USER: farmbox
      POSTGRES_PASSWORD: farmbox123
      POSTGRES_DB: farmbox
    ports:
      - '5432:5432'
    volumes:
      - postgres_data:/var/lib/postgresql/data

  redis:
    image: redis:alpine
    ports:
      - '6379:6379'

volumes:
  postgres_data:
```

### A.3: Git Ignore Files

**`.gitignore`:**

```
# Dependencies
node_modules/
.pnp
.pnp.js

# Build
dist/
build/
.next/
out/

# Environment
.env
.env.local
.env.*.local

# Logs
logs/
*.log
npm-debug.log*

# IDE
.idea/
.vscode/
*.swp
*.swo

# OS
.DS_Store
Thumbs.db

# Testing
coverage/

# Prisma
prisma/migrations/**/migration_lock.toml
```

---

## Quick Reference Commands

```bash
# Backend
cd backend
npm run dev              # Start development server
npm run db:migrate       # Run database migrations
npm run db:seed          # Seed database
npm run db:studio        # Open Prisma Studio
npm run build            # Build for production
npm run test             # Run tests

# Frontend
cd frontend
npm run dev              # Start development server
npm run build            # Build for production
npm run start            # Start production server
npm run lint             # Run linter

# Database
npx prisma migrate dev   # Create migration
npx prisma migrate reset # Reset database
npx prisma generate      # Generate client
```

---

## Document History

| Version | Date | Changes |
|---------|------|---------|
| 1.0 | December 2024 | Initial implementation guide |

---

*This implementation guide should be used alongside the FarmBox Design Document. For questions or issues, refer to the project documentation or contact the development team.*
