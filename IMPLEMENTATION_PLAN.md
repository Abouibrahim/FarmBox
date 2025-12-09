# FarmBox Tunisia: Step-by-Step Implementation Plan

## Overview

This document provides a detailed, actionable implementation plan for building the five customer engagement features for the FarmBox organic produce marketplace. Each step includes specific files to create/modify, commands to run, and acceptance criteria.

**Reference Document:** `ENGAGEMENT_FEATURES_DESIGN.md`

---

## Table of Contents

1. [Prerequisites & Initial Setup](#1-prerequisites--initial-setup)
2. [Phase 1: Flexibility & Quality (Month 1-3)](#2-phase-1-flexibility--quality-month-1-3)
3. [Phase 2: Delivery & Sourcing (Month 4-6)](#3-phase-2-delivery--sourcing-month-4-6)
4. [Phase 3: Sustainability & Loyalty (Month 7-12)](#4-phase-3-sustainability--loyalty-month-7-12)
5. [Testing Strategy](#5-testing-strategy)
6. [Deployment Checklist](#6-deployment-checklist)

---

## 1. Prerequisites & Initial Setup

### 1.1 Development Environment

```bash
# Ensure Node.js 18+ is installed
node --version

# Ensure Docker and Docker Compose are installed
docker --version
docker-compose --version

# Clone and setup the project
cd /home/mmdfarhat/FarmBox
npm install
```

### 1.2 Required External Services

| Service | Purpose | Setup Required |
|---------|---------|----------------|
| WhatsApp Business API | Customer messaging | Meta Business verification |
| Tunisie Telecom SMS Gateway | SMS notifications | API credentials |
| Cloudinary | Image storage | Already configured |
| Redis | WebSocket scaling, job queues | Add to docker-compose |
| Google Maps API | Delivery tracking maps | API key required |

### 1.3 Add New Dependencies

```bash
# Backend dependencies
cd backend
npm install socket.io bull ioredis qrcode @types/qrcode

# Frontend dependencies
cd ../frontend
npm install socket.io-client @react-google-maps/api react-qr-code
```

### 1.4 Update Docker Compose

**File:** `docker-compose.yml`

Add Redis service:

```yaml
services:
  # ... existing services ...

  redis:
    image: redis:7-alpine
    ports:
      - "6379:6379"
    volumes:
      - redis_data:/data
    command: redis-server --appendonly yes

volumes:
  # ... existing volumes ...
  redis_data:
```

---

## 2. Phase 1: Flexibility & Quality (Month 1-3)

### Month 1: Database Schema & Core APIs

---

#### Step 1.1: Extend Prisma Schema for Subscriptions

**File:** `backend/prisma/schema.prisma`

**Action:** Add subscription management models

```prisma
// Add after existing Subscription model

model SubscriptionPause {
  id              String       @id @default(uuid())
  subscriptionId  String
  subscription    Subscription @relation(fields: [subscriptionId], references: [id])
  startDate       DateTime
  endDate         DateTime
  reason          String?
  createdAt       DateTime     @default(now())

  @@index([subscriptionId])
}

model SubscriptionSkip {
  id              String       @id @default(uuid())
  subscriptionId  String
  subscription    Subscription @relation(fields: [subscriptionId], references: [id])
  skipDate        DateTime
  reason          String?
  createdAt       DateTime     @default(now())

  @@unique([subscriptionId, skipDate])
  @@index([subscriptionId])
}

model TrialBox {
  id              String       @id @default(uuid())
  customerId      String
  customer        User         @relation(fields: [customerId], references: [id])
  farmId          String
  farm            Farm         @relation(fields: [farmId], references: [id])
  boxSize         BoxSize
  status          TrialStatus  @default(PENDING)
  orderId         String?      @unique
  order           Order?       @relation(fields: [orderId], references: [id])
  discountPercent Int          @default(25)
  convertedToSub  Boolean      @default(false)
  createdAt       DateTime     @default(now())
  expiresAt       DateTime

  @@unique([customerId, farmId])
  @@index([customerId])
  @@index([farmId])
}

enum TrialStatus {
  PENDING
  ORDERED
  DELIVERED
  CONVERTED
  EXPIRED
}

// Update existing Subscription model - add these fields:
// pausesUsedThisYear   Int      @default(0)
// maxPausesPerYear     Int      @default(4)
// skipsThisMonth       Int      @default(0)
// maxSkipsPerMonth     Int      @default(2)
// autoRenew            Boolean  @default(true)
// reminderDaysBefore   Int      @default(2)
// trialConverted       Boolean  @default(false)

// Add relations to Subscription:
// pauses               SubscriptionPause[]
// skips                SubscriptionSkip[]
```

**Commands:**
```bash
cd backend
npx prisma migrate dev --name add_subscription_flexibility
npx prisma generate
```

**Acceptance Criteria:**
- [ ] Migration runs without errors
- [ ] New tables created: `SubscriptionPause`, `SubscriptionSkip`, `TrialBox`
- [ ] Subscription model has new fields

---

#### Step 1.2: Extend Schema for Quality Guarantee

**File:** `backend/prisma/schema.prisma`

**Action:** Add quality and credits models

```prisma
model QualityReport {
  id              String       @id @default(uuid())
  orderId         String
  order           Order        @relation(fields: [orderId], references: [id])
  customerId      String
  customer        User         @relation(fields: [customerId], references: [id])
  productId       String?
  product         Product?     @relation(fields: [productId], references: [id])
  issueType       QualityIssue
  description     String
  photoUrls       String[]
  status          ReportStatus @default(PENDING)
  resolution      String?
  refundAmount    Float?
  creditAmount    Float?
  handledBy       String?
  handledAt       DateTime?
  createdAt       DateTime     @default(now())

  @@index([orderId])
  @@index([customerId])
  @@index([status])
}

model CustomerCredit {
  id              String       @id @default(uuid())
  customerId      String
  customer        User         @relation(fields: [customerId], references: [id])
  amount          Float
  reason          CreditReason
  referenceId     String?
  expiresAt       DateTime?
  usedAt          DateTime?
  usedInOrderId   String?
  createdAt       DateTime     @default(now())

  @@index([customerId])
  @@index([expiresAt])
}

model DeliverySurvey {
  id              String       @id @default(uuid())
  orderId         String       @unique
  order           Order        @relation(fields: [orderId], references: [id])
  customerId      String
  customer        User         @relation(fields: [customerId], references: [id])
  overallRating   Int
  freshnessRating Int
  deliveryRating  Int
  packagingRating Int
  wouldRecommend  Boolean
  feedback        String?
  createdAt       DateTime     @default(now())

  @@index([customerId])
}

enum QualityIssue {
  DAMAGED
  NOT_FRESH
  WRONG_ITEM
  MISSING_ITEM
  QUANTITY_SHORT
  TASTE_QUALITY
  OTHER
}

enum ReportStatus {
  PENDING
  REVIEWING
  RESOLVED
  REJECTED
}

enum CreditReason {
  QUALITY_ISSUE
  PACKAGING_RETURN
  REFERRAL
  LOYALTY
  APOLOGY
  PROMOTION
}
```

**Commands:**
```bash
npx prisma migrate dev --name add_quality_guarantee
npx prisma generate
```

**Acceptance Criteria:**
- [ ] Migration successful
- [ ] Tables created: `QualityReport`, `CustomerCredit`, `DeliverySurvey`
- [ ] Enums available for use

---

#### Step 1.3: Create Subscription Controller

**File:** `backend/src/controllers/subscription.controller.ts`

**Action:** Create new controller with subscription management logic

```typescript
import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { AuthRequest } from '../middleware/auth.middleware';

const prisma = new PrismaClient();

// Create subscription
export const createSubscription = async (req: AuthRequest, res: Response) => {
  try {
    const { farmId, boxSize, frequency, preferences, deliveryDay } = req.body;
    const customerId = req.user!.id;

    // Check if customer already has active subscription to this farm
    const existing = await prisma.subscription.findFirst({
      where: {
        customerId,
        farmId,
        status: 'ACTIVE',
      },
    });

    if (existing) {
      return res.status(400).json({
        success: false,
        error: { message: 'You already have an active subscription to this farm' },
      });
    }

    const subscription = await prisma.subscription.create({
      data: {
        customerId,
        farmId,
        boxSize,
        frequency,
        preferences,
        deliveryDay,
        status: 'ACTIVE',
        nextDeliveryDate: calculateNextDeliveryDate(deliveryDay, frequency),
      },
      include: {
        farm: { select: { name: true, slug: true, logo: true } },
      },
    });

    res.status(201).json({ success: true, data: subscription });
  } catch (error) {
    console.error('Create subscription error:', error);
    res.status(500).json({ success: false, error: { message: 'Failed to create subscription' } });
  }
};

// Get my subscriptions
export const getMySubscriptions = async (req: AuthRequest, res: Response) => {
  try {
    const customerId = req.user!.id;

    const subscriptions = await prisma.subscription.findMany({
      where: { customerId },
      include: {
        farm: { select: { name: true, slug: true, logo: true } },
        pauses: { where: { endDate: { gte: new Date() } } },
        skips: { where: { skipDate: { gte: new Date() } } },
      },
      orderBy: { createdAt: 'desc' },
    });

    res.json({ success: true, data: subscriptions });
  } catch (error) {
    console.error('Get subscriptions error:', error);
    res.status(500).json({ success: false, error: { message: 'Failed to fetch subscriptions' } });
  }
};

// Pause subscription
export const pauseSubscription = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const { startDate, endDate, reason } = req.body;
    const customerId = req.user!.id;

    // Validate subscription ownership
    const subscription = await prisma.subscription.findFirst({
      where: { id, customerId },
    });

    if (!subscription) {
      return res.status(404).json({ success: false, error: { message: 'Subscription not found' } });
    }

    // Check pause limits (max 4 per year)
    if (subscription.pausesUsedThisYear >= subscription.maxPausesPerYear) {
      return res.status(400).json({
        success: false,
        error: { message: 'Maximum pauses for this year reached' },
      });
    }

    // Validate pause duration (max 4 weeks)
    const start = new Date(startDate);
    const end = new Date(endDate);
    const diffDays = Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24));

    if (diffDays > 28) {
      return res.status(400).json({
        success: false,
        error: { message: 'Pause duration cannot exceed 4 weeks' },
      });
    }

    // Create pause and update subscription
    const [pause] = await prisma.$transaction([
      prisma.subscriptionPause.create({
        data: { subscriptionId: id, startDate: start, endDate: end, reason },
      }),
      prisma.subscription.update({
        where: { id },
        data: {
          status: 'PAUSED',
          pausesUsedThisYear: { increment: 1 },
        },
      }),
    ]);

    res.json({ success: true, data: pause });
  } catch (error) {
    console.error('Pause subscription error:', error);
    res.status(500).json({ success: false, error: { message: 'Failed to pause subscription' } });
  }
};

// Resume subscription
export const resumeSubscription = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const customerId = req.user!.id;

    const subscription = await prisma.subscription.findFirst({
      where: { id, customerId, status: 'PAUSED' },
    });

    if (!subscription) {
      return res.status(404).json({ success: false, error: { message: 'Paused subscription not found' } });
    }

    // End current pause and resume subscription
    await prisma.$transaction([
      prisma.subscriptionPause.updateMany({
        where: { subscriptionId: id, endDate: { gte: new Date() } },
        data: { endDate: new Date() },
      }),
      prisma.subscription.update({
        where: { id },
        data: { status: 'ACTIVE' },
      }),
    ]);

    res.json({ success: true, data: { message: 'Subscription resumed' } });
  } catch (error) {
    console.error('Resume subscription error:', error);
    res.status(500).json({ success: false, error: { message: 'Failed to resume subscription' } });
  }
};

// Skip delivery
export const skipDelivery = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const { skipDate, reason } = req.body;
    const customerId = req.user!.id;

    const subscription = await prisma.subscription.findFirst({
      where: { id, customerId },
    });

    if (!subscription) {
      return res.status(404).json({ success: false, error: { message: 'Subscription not found' } });
    }

    // Check skip limits (max 2 per month)
    if (subscription.skipsThisMonth >= subscription.maxSkipsPerMonth) {
      return res.status(400).json({
        success: false,
        error: { message: 'Maximum skips for this month reached' },
      });
    }

    // Validate skip date is at least 48 hours away
    const skip = new Date(skipDate);
    const minSkipDate = new Date(Date.now() + 48 * 60 * 60 * 1000);

    if (skip < minSkipDate) {
      return res.status(400).json({
        success: false,
        error: { message: 'Must skip at least 48 hours before delivery' },
      });
    }

    const subscriptionSkip = await prisma.subscriptionSkip.create({
      data: { subscriptionId: id, skipDate: skip, reason },
    });

    await prisma.subscription.update({
      where: { id },
      data: { skipsThisMonth: { increment: 1 } },
    });

    res.json({ success: true, data: subscriptionSkip });
  } catch (error) {
    console.error('Skip delivery error:', error);
    res.status(500).json({ success: false, error: { message: 'Failed to skip delivery' } });
  }
};

// Cancel subscription
export const cancelSubscription = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const customerId = req.user!.id;

    const subscription = await prisma.subscription.findFirst({
      where: { id, customerId },
    });

    if (!subscription) {
      return res.status(404).json({ success: false, error: { message: 'Subscription not found' } });
    }

    await prisma.subscription.update({
      where: { id },
      data: { status: 'CANCELLED' },
    });

    res.json({ success: true, data: { message: 'Subscription cancelled' } });
  } catch (error) {
    console.error('Cancel subscription error:', error);
    res.status(500).json({ success: false, error: { message: 'Failed to cancel subscription' } });
  }
};

// Helper function
function calculateNextDeliveryDate(deliveryDay: string, frequency: string): Date {
  const days = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
  const targetDay = days.indexOf(deliveryDay.toLowerCase());
  const today = new Date();
  const currentDay = today.getDay();

  let daysUntilDelivery = targetDay - currentDay;
  if (daysUntilDelivery <= 0) daysUntilDelivery += 7;

  const nextDelivery = new Date(today);
  nextDelivery.setDate(today.getDate() + daysUntilDelivery);

  return nextDelivery;
}
```

**Acceptance Criteria:**
- [ ] All CRUD operations work
- [ ] Pause limits enforced (4/year, max 4 weeks)
- [ ] Skip limits enforced (2/month, 48h advance)
- [ ] Proper error handling

---

#### Step 1.4: Create Subscription Routes

**File:** `backend/src/routes/subscription.routes.ts`

```typescript
import { Router } from 'express';
import { authenticate, requireRole } from '../middleware/auth.middleware';
import {
  createSubscription,
  getMySubscriptions,
  getSubscriptionById,
  updateSubscription,
  pauseSubscription,
  resumeSubscription,
  skipDelivery,
  unskipDelivery,
  cancelSubscription,
} from '../controllers/subscription.controller';

const router = Router();

// All routes require authentication
router.use(authenticate);

// Customer routes
router.post('/', createSubscription);
router.get('/my', getMySubscriptions);
router.get('/:id', getSubscriptionById);
router.patch('/:id', updateSubscription);
router.delete('/:id', cancelSubscription);

// Pause/Resume
router.post('/:id/pause', pauseSubscription);
router.delete('/:id/pause', resumeSubscription);

// Skip/Unskip
router.post('/:id/skip', skipDelivery);
router.delete('/:id/skip/:date', unskipDelivery);

export default router;
```

**File:** `backend/src/routes/index.ts`

**Action:** Add subscription routes

```typescript
// Add import
import subscriptionRoutes from './subscription.routes';

// Add route
router.use('/subscriptions', subscriptionRoutes);
```

**Acceptance Criteria:**
- [ ] Routes registered and accessible
- [ ] Authentication required for all endpoints
- [ ] API responds with correct status codes

---

#### Step 1.5: Create Quality Report Controller

**File:** `backend/src/controllers/quality.controller.ts`

```typescript
import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { AuthRequest } from '../middleware/auth.middleware';

const prisma = new PrismaClient();

// Auto-credit rules based on issue type
const AUTO_CREDIT_RULES: Record<string, number> = {
  DAMAGED: 1.0,
  NOT_FRESH: 1.0,
  WRONG_ITEM: 1.0,
  MISSING_ITEM: 1.0,
  QUANTITY_SHORT: 0.5,
  TASTE_QUALITY: 0.5,
  OTHER: 0,
};

// Submit quality report
export const createQualityReport = async (req: AuthRequest, res: Response) => {
  try {
    const { orderId, productId, issueType, description, photoUrls } = req.body;
    const customerId = req.user!.id;

    // Verify order belongs to customer
    const order = await prisma.order.findFirst({
      where: { id: orderId, customerId },
      include: { items: { include: { product: true } } },
    });

    if (!order) {
      return res.status(404).json({ success: false, error: { message: 'Order not found' } });
    }

    // Create quality report
    const report = await prisma.qualityReport.create({
      data: {
        orderId,
        customerId,
        productId,
        issueType,
        description,
        photoUrls,
        status: 'PENDING',
      },
    });

    // Calculate and issue automatic credit
    const creditMultiplier = AUTO_CREDIT_RULES[issueType] || 0;

    if (creditMultiplier > 0) {
      let creditAmount = 0;

      if (productId) {
        // Credit for specific product
        const item = order.items.find(i => i.productId === productId);
        if (item) {
          creditAmount = item.price * item.quantity * creditMultiplier;
        }
      } else {
        // Credit for general issue - 10% of order total
        creditAmount = order.total * 0.1 * creditMultiplier;
      }

      if (creditAmount > 0) {
        await prisma.customerCredit.create({
          data: {
            customerId,
            amount: creditAmount,
            reason: 'QUALITY_ISSUE',
            referenceId: report.id,
            expiresAt: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000), // 90 days
          },
        });

        // Update report with credit amount
        await prisma.qualityReport.update({
          where: { id: report.id },
          data: { creditAmount, status: 'RESOLVED' },
        });
      }
    }

    res.status(201).json({
      success: true,
      data: {
        report,
        creditAwarded: creditMultiplier > 0,
        message: creditMultiplier > 0
          ? 'Credit has been added to your account'
          : 'Report submitted for review',
      },
    });
  } catch (error) {
    console.error('Create quality report error:', error);
    res.status(500).json({ success: false, error: { message: 'Failed to submit report' } });
  }
};

// Get my quality reports
export const getMyQualityReports = async (req: AuthRequest, res: Response) => {
  try {
    const customerId = req.user!.id;

    const reports = await prisma.qualityReport.findMany({
      where: { customerId },
      include: {
        order: { select: { orderNumber: true, createdAt: true } },
        product: { select: { name: true, nameAr: true } },
      },
      orderBy: { createdAt: 'desc' },
    });

    res.json({ success: true, data: reports });
  } catch (error) {
    console.error('Get quality reports error:', error);
    res.status(500).json({ success: false, error: { message: 'Failed to fetch reports' } });
  }
};

// Get my credits
export const getMyCredits = async (req: AuthRequest, res: Response) => {
  try {
    const customerId = req.user!.id;

    const credits = await prisma.customerCredit.findMany({
      where: {
        customerId,
        usedAt: null,
        OR: [
          { expiresAt: null },
          { expiresAt: { gt: new Date() } },
        ],
      },
      orderBy: { createdAt: 'desc' },
    });

    const totalAvailable = credits.reduce((sum, c) => sum + c.amount, 0);

    res.json({
      success: true,
      data: {
        credits,
        totalAvailable,
      },
    });
  } catch (error) {
    console.error('Get credits error:', error);
    res.status(500).json({ success: false, error: { message: 'Failed to fetch credits' } });
  }
};

// Submit delivery survey
export const submitSurvey = async (req: AuthRequest, res: Response) => {
  try {
    const {
      orderId,
      overallRating,
      freshnessRating,
      deliveryRating,
      packagingRating,
      wouldRecommend,
      feedback,
    } = req.body;
    const customerId = req.user!.id;

    // Verify order belongs to customer
    const order = await prisma.order.findFirst({
      where: { id: orderId, customerId, status: 'DELIVERED' },
    });

    if (!order) {
      return res.status(404).json({
        success: false,
        error: { message: 'Delivered order not found' },
      });
    }

    // Check if survey already submitted
    const existing = await prisma.deliverySurvey.findUnique({
      where: { orderId },
    });

    if (existing) {
      return res.status(400).json({
        success: false,
        error: { message: 'Survey already submitted for this order' },
      });
    }

    const survey = await prisma.deliverySurvey.create({
      data: {
        orderId,
        customerId,
        overallRating,
        freshnessRating,
        deliveryRating,
        packagingRating,
        wouldRecommend,
        feedback,
      },
    });

    // Award 5 TND credit for completing survey
    await prisma.customerCredit.create({
      data: {
        customerId,
        amount: 5,
        reason: 'LOYALTY',
        referenceId: survey.id,
        expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days
      },
    });

    res.status(201).json({
      success: true,
      data: {
        survey,
        creditAwarded: 5,
        message: 'Thank you! 5 TND credit added to your account',
      },
    });
  } catch (error) {
    console.error('Submit survey error:', error);
    res.status(500).json({ success: false, error: { message: 'Failed to submit survey' } });
  }
};
```

**Acceptance Criteria:**
- [ ] Quality reports auto-issue credits based on rules
- [ ] Credits have 90-day expiry
- [ ] Surveys award 5 TND credit
- [ ] Duplicate survey prevention works

---

#### Step 1.6: Create Quality Routes

**File:** `backend/src/routes/quality.routes.ts`

```typescript
import { Router } from 'express';
import { authenticate, requireRole } from '../middleware/auth.middleware';
import {
  createQualityReport,
  getMyQualityReports,
  getQualityReportById,
  getMyCredits,
  submitSurvey,
  getMySurveys,
} from '../controllers/quality.controller';

const router = Router();

router.use(authenticate);

// Quality reports
router.post('/reports', createQualityReport);
router.get('/reports/my', getMyQualityReports);
router.get('/reports/:id', getQualityReportById);

// Credits
router.get('/credits/my', getMyCredits);

// Surveys
router.post('/surveys', submitSurvey);
router.get('/surveys/my', getMySurveys);

export default router;
```

**File:** `backend/src/routes/index.ts`

```typescript
// Add import
import qualityRoutes from './quality.routes';

// Add route
router.use('/quality', qualityRoutes);
```

---

### Month 2: Messaging Integration & Frontend

---

#### Step 2.1: Create Notification System

**File:** `backend/prisma/schema.prisma`

Add notification models:

```prisma
model Notification {
  id              String       @id @default(uuid())
  userId          String
  user            User         @relation(fields: [userId], references: [id])
  type            NotificationType
  title           String
  titleAr         String
  message         String
  messageAr       String
  data            Json?
  channel         NotificationChannel[]
  isRead          Boolean      @default(false)
  readAt          DateTime?
  createdAt       DateTime     @default(now())

  @@index([userId])
  @@index([isRead])
  @@index([createdAt])
}

model NotificationPreference {
  id              String       @id @default(uuid())
  userId          String       @unique
  user            User         @relation(fields: [userId], references: [id])
  orderUpdates    Boolean      @default(true)
  deliveryAlerts  Boolean      @default(true)
  promotions      Boolean      @default(true)
  farmUpdates     Boolean      @default(true)
  subscriptionReminders Boolean @default(true)
  smsEnabled      Boolean      @default(true)
  whatsappEnabled Boolean      @default(true)
  emailEnabled    Boolean      @default(true)
  pushEnabled     Boolean      @default(true)
  updatedAt       DateTime     @updatedAt
}

enum NotificationType {
  ORDER_CONFIRMED
  ORDER_PREPARING
  ORDER_OUT_FOR_DELIVERY
  ORDER_DELIVERED
  ORDER_CANCELLED
  SUBSCRIPTION_REMINDER
  SUBSCRIPTION_PAUSED
  SUBSCRIPTION_RESUMED
  DELIVERY_APPROACHING
  QUALITY_REPORT_UPDATE
  CREDIT_AWARDED
  PROMOTION
  FARM_UPDATE
  SEASONAL_ALERT
}

enum NotificationChannel {
  IN_APP
  SMS
  WHATSAPP
  EMAIL
  PUSH
}
```

**Commands:**
```bash
npx prisma migrate dev --name add_notifications
npx prisma generate
```

---

#### Step 2.2: Create Notification Service

**File:** `backend/src/services/notification.service.ts`

```typescript
import { PrismaClient, NotificationType, NotificationChannel } from '@prisma/client';

const prisma = new PrismaClient();

interface NotificationPayload {
  userId: string;
  type: NotificationType;
  title: string;
  titleAr: string;
  message: string;
  messageAr: string;
  data?: Record<string, any>;
}

export class NotificationService {
  async send(payload: NotificationPayload): Promise<void> {
    // Get user preferences
    const prefs = await prisma.notificationPreference.findUnique({
      where: { userId: payload.userId },
    });

    const channels: NotificationChannel[] = ['IN_APP'];

    // Determine channels based on preferences and notification type
    if (prefs) {
      if (prefs.smsEnabled && this.shouldSendSMS(payload.type)) {
        channels.push('SMS');
      }
      if (prefs.whatsappEnabled && this.shouldSendWhatsApp(payload.type)) {
        channels.push('WHATSAPP');
      }
      if (prefs.emailEnabled && this.shouldSendEmail(payload.type)) {
        channels.push('EMAIL');
      }
    }

    // Create notification record
    const notification = await prisma.notification.create({
      data: {
        userId: payload.userId,
        type: payload.type,
        title: payload.title,
        titleAr: payload.titleAr,
        message: payload.message,
        messageAr: payload.messageAr,
        data: payload.data,
        channel: channels,
      },
    });

    // Send to each channel
    for (const channel of channels) {
      await this.sendToChannel(channel, payload);
    }
  }

  private shouldSendSMS(type: NotificationType): boolean {
    const smsTypes = [
      'ORDER_CONFIRMED',
      'ORDER_OUT_FOR_DELIVERY',
      'ORDER_DELIVERED',
      'SUBSCRIPTION_REMINDER',
    ];
    return smsTypes.includes(type);
  }

  private shouldSendWhatsApp(type: NotificationType): boolean {
    const whatsappTypes = [
      'ORDER_CONFIRMED',
      'ORDER_OUT_FOR_DELIVERY',
      'DELIVERY_APPROACHING',
      'ORDER_DELIVERED',
      'QUALITY_REPORT_UPDATE',
      'CREDIT_AWARDED',
    ];
    return whatsappTypes.includes(type);
  }

  private shouldSendEmail(type: NotificationType): boolean {
    const emailTypes = [
      'ORDER_CONFIRMED',
      'ORDER_DELIVERED',
      'SUBSCRIPTION_REMINDER',
      'CREDIT_AWARDED',
      'PROMOTION',
    ];
    return emailTypes.includes(type);
  }

  private async sendToChannel(
    channel: NotificationChannel,
    payload: NotificationPayload
  ): Promise<void> {
    switch (channel) {
      case 'SMS':
        await this.sendSMS(payload);
        break;
      case 'WHATSAPP':
        await this.sendWhatsApp(payload);
        break;
      case 'EMAIL':
        await this.sendEmail(payload);
        break;
      case 'IN_APP':
        // Already stored in database
        break;
    }
  }

  private async sendSMS(payload: NotificationPayload): Promise<void> {
    // TODO: Integrate with Tunisie Telecom SMS gateway
    console.log('SMS notification:', payload.message);
  }

  private async sendWhatsApp(payload: NotificationPayload): Promise<void> {
    // TODO: Integrate with WhatsApp Business API
    console.log('WhatsApp notification:', payload.message);
  }

  private async sendEmail(payload: NotificationPayload): Promise<void> {
    // TODO: Integrate with email service
    console.log('Email notification:', payload.message);
  }
}

export const notificationService = new NotificationService();
```

---

#### Step 2.3: Create SMS Command Handler

**File:** `backend/src/services/sms-commands.service.ts`

```typescript
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

interface SMSCommand {
  from: string;
  body: string;
}

interface SMSResponse {
  message: string;
  messageAr: string;
}

export class SMSCommandService {
  async handleCommand(command: SMSCommand): Promise<SMSResponse> {
    const { from, body } = command;
    const text = body.trim().toUpperCase();

    // Find user by phone number
    const user = await prisma.user.findFirst({
      where: { phone: from },
    });

    if (!user) {
      return {
        message: 'Phone number not registered. Please register at farmbox.tn',
        messageAr: 'رقم الهاتف غير مسجل. يرجى التسجيل على farmbox.tn',
      };
    }

    // Parse command
    if (text === 'SKIP' || text === 'تخطي') {
      return await this.handleSkip(user.id);
    }

    if (text.startsWith('PAUSE') || text.startsWith('توقف')) {
      const weeks = parseInt(text.split(' ')[1]) || 1;
      return await this.handlePause(user.id, weeks);
    }

    if (text === 'RESUME' || text === 'استئناف') {
      return await this.handleResume(user.id);
    }

    if (text === 'STATUS' || text === 'حالة') {
      return await this.handleStatus(user.id);
    }

    if (text === 'HELP' || text === 'مساعدة') {
      return this.getHelpMessage();
    }

    return {
      message: 'Unknown command. Text HELP for available commands.',
      messageAr: 'أمر غير معروف. أرسل "مساعدة" للأوامر المتاحة.',
    };
  }

  private async handleSkip(userId: string): Promise<SMSResponse> {
    const subscription = await prisma.subscription.findFirst({
      where: { customerId: userId, status: 'ACTIVE' },
    });

    if (!subscription) {
      return {
        message: 'No active subscription found.',
        messageAr: 'لا يوجد اشتراك نشط.',
      };
    }

    if (subscription.skipsThisMonth >= subscription.maxSkipsPerMonth) {
      return {
        message: `Maximum skips reached (${subscription.maxSkipsPerMonth}/month).`,
        messageAr: `تم الوصول للحد الأقصى من التخطي (${subscription.maxSkipsPerMonth}/شهر).`,
      };
    }

    // Skip next delivery
    const nextDelivery = subscription.nextDeliveryDate;

    await prisma.subscriptionSkip.create({
      data: {
        subscriptionId: subscription.id,
        skipDate: nextDelivery,
        reason: 'SMS command',
      },
    });

    await prisma.subscription.update({
      where: { id: subscription.id },
      data: { skipsThisMonth: { increment: 1 } },
    });

    const dateStr = nextDelivery.toLocaleDateString('fr-TN');

    return {
      message: `Delivery for ${dateStr} skipped. Text UNSKIP to restore.`,
      messageAr: `تم تخطي التوصيل ليوم ${dateStr}. أرسل UNSKIP للاستعادة.`,
    };
  }

  private async handlePause(userId: string, weeks: number): Promise<SMSResponse> {
    const subscription = await prisma.subscription.findFirst({
      where: { customerId: userId, status: 'ACTIVE' },
    });

    if (!subscription) {
      return {
        message: 'No active subscription found.',
        messageAr: 'لا يوجد اشتراك نشط.',
      };
    }

    if (weeks > 4) weeks = 4;

    const startDate = new Date();
    const endDate = new Date(Date.now() + weeks * 7 * 24 * 60 * 60 * 1000);

    await prisma.subscriptionPause.create({
      data: {
        subscriptionId: subscription.id,
        startDate,
        endDate,
        reason: 'SMS command',
      },
    });

    await prisma.subscription.update({
      where: { id: subscription.id },
      data: {
        status: 'PAUSED',
        pausesUsedThisYear: { increment: 1 },
      },
    });

    return {
      message: `Subscription paused for ${weeks} week(s). Text RESUME to restart.`,
      messageAr: `تم إيقاف الاشتراك لمدة ${weeks} أسبوع. أرسل RESUME للاستئناف.`,
    };
  }

  private async handleResume(userId: string): Promise<SMSResponse> {
    const subscription = await prisma.subscription.findFirst({
      where: { customerId: userId, status: 'PAUSED' },
    });

    if (!subscription) {
      return {
        message: 'No paused subscription found.',
        messageAr: 'لا يوجد اشتراك متوقف.',
      };
    }

    await prisma.subscription.update({
      where: { id: subscription.id },
      data: { status: 'ACTIVE' },
    });

    return {
      message: 'Subscription resumed! Your next delivery is scheduled.',
      messageAr: 'تم استئناف الاشتراك! تم جدولة التوصيل القادم.',
    };
  }

  private async handleStatus(userId: string): Promise<SMSResponse> {
    const subscription = await prisma.subscription.findFirst({
      where: { customerId: userId },
      include: { farm: { select: { name: true } } },
    });

    if (!subscription) {
      return {
        message: 'No subscription found.',
        messageAr: 'لا يوجد اشتراك.',
      };
    }

    const status = subscription.status;
    const nextDate = subscription.nextDeliveryDate?.toLocaleDateString('fr-TN') || 'N/A';

    return {
      message: `Status: ${status}. Farm: ${subscription.farm.name}. Next: ${nextDate}`,
      messageAr: `الحالة: ${status}. المزرعة: ${subscription.farm.name}. التالي: ${nextDate}`,
    };
  }

  private getHelpMessage(): SMSResponse {
    return {
      message: 'Commands: SKIP, PAUSE [weeks], RESUME, STATUS, HELP',
      messageAr: 'الأوامر: تخطي، توقف [أسابيع]، استئناف، حالة، مساعدة',
    };
  }
}

export const smsCommandService = new SMSCommandService();
```

---

#### Step 2.4: Create Subscription Frontend Pages

**File:** `frontend/src/app/subscriptions/page.tsx`

```tsx
'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/store/auth';
import { api } from '@/lib/api';
import { Subscription } from '@/types';
import { Loader2, Plus, Pause, Play, SkipForward, X } from 'lucide-react';
import Link from 'next/link';

export default function SubscriptionsPage() {
  const [subscriptions, setSubscriptions] = useState<Subscription[]>([]);
  const [loading, setLoading] = useState(true);
  const { isAuthenticated } = useAuthStore();
  const router = useRouter();

  useEffect(() => {
    if (!isAuthenticated) {
      router.push('/login');
      return;
    }
    fetchSubscriptions();
  }, [isAuthenticated]);

  const fetchSubscriptions = async () => {
    try {
      const { data } = await api.get('/subscriptions/my');
      setSubscriptions(data.data);
    } catch (error) {
      console.error('Failed to fetch subscriptions:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSkip = async (id: string, nextDate: string) => {
    try {
      await api.post(`/subscriptions/${id}/skip`, { skipDate: nextDate });
      fetchSubscriptions();
    } catch (error) {
      console.error('Failed to skip delivery:', error);
    }
  };

  const handlePause = async (id: string) => {
    const endDate = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString();
    try {
      await api.post(`/subscriptions/${id}/pause`, {
        startDate: new Date().toISOString(),
        endDate,
      });
      fetchSubscriptions();
    } catch (error) {
      console.error('Failed to pause subscription:', error);
    }
  };

  const handleResume = async (id: string) => {
    try {
      await api.delete(`/subscriptions/${id}/pause`);
      fetchSubscriptions();
    } catch (error) {
      console.error('Failed to resume subscription:', error);
    }
  };

  const handleCancel = async (id: string) => {
    if (!confirm('Are you sure you want to cancel this subscription?')) return;
    try {
      await api.delete(`/subscriptions/${id}`);
      fetchSubscriptions();
    } catch (error) {
      console.error('Failed to cancel subscription:', error);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">My Subscriptions</h1>
        <Link
          href="/farms"
          className="flex items-center gap-2 bg-primary-600 text-white px-4 py-2 rounded-lg hover:bg-primary-700"
        >
          <Plus className="h-5 w-5" />
          New Subscription
        </Link>
      </div>

      {subscriptions.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-gray-500 mb-4">No subscriptions yet</p>
          <Link href="/farms" className="text-primary-600 hover:underline">
            Browse farms to start a subscription
          </Link>
        </div>
      ) : (
        <div className="grid gap-6">
          {subscriptions.map((sub) => (
            <div
              key={sub.id}
              className="bg-white rounded-lg shadow-md p-6 border border-gray-200"
            >
              <div className="flex justify-between items-start">
                <div>
                  <h2 className="text-xl font-semibold">{sub.farm?.name}</h2>
                  <p className="text-gray-600">
                    {sub.boxSize} box - {sub.frequency}
                  </p>
                  <p className="text-sm text-gray-500 mt-2">
                    Next delivery:{' '}
                    {sub.nextDeliveryDate
                      ? new Date(sub.nextDeliveryDate).toLocaleDateString()
                      : 'N/A'}
                  </p>
                </div>
                <span
                  className={`px-3 py-1 rounded-full text-sm font-medium ${
                    sub.status === 'ACTIVE'
                      ? 'bg-green-100 text-green-800'
                      : sub.status === 'PAUSED'
                      ? 'bg-yellow-100 text-yellow-800'
                      : 'bg-gray-100 text-gray-800'
                  }`}
                >
                  {sub.status}
                </span>
              </div>

              <div className="flex gap-3 mt-4 pt-4 border-t">
                {sub.status === 'ACTIVE' && (
                  <>
                    <button
                      onClick={() => handleSkip(sub.id, sub.nextDeliveryDate)}
                      className="flex items-center gap-1 text-sm text-gray-600 hover:text-primary-600"
                    >
                      <SkipForward className="h-4 w-4" />
                      Skip Next
                    </button>
                    <button
                      onClick={() => handlePause(sub.id)}
                      className="flex items-center gap-1 text-sm text-gray-600 hover:text-yellow-600"
                    >
                      <Pause className="h-4 w-4" />
                      Pause
                    </button>
                  </>
                )}
                {sub.status === 'PAUSED' && (
                  <button
                    onClick={() => handleResume(sub.id)}
                    className="flex items-center gap-1 text-sm text-green-600 hover:text-green-700"
                  >
                    <Play className="h-4 w-4" />
                    Resume
                  </button>
                )}
                <button
                  onClick={() => handleCancel(sub.id)}
                  className="flex items-center gap-1 text-sm text-red-600 hover:text-red-700 ml-auto"
                >
                  <X className="h-4 w-4" />
                  Cancel
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Flexibility messaging */}
      <div className="mt-8 bg-green-50 rounded-lg p-6">
        <h3 className="font-semibold text-green-800 mb-2">
          Complete Flexibility, Zero Commitment
        </h3>
        <ul className="text-sm text-green-700 space-y-1">
          <li>Skip up to 2 deliveries per month</li>
          <li>Pause your subscription for up to 4 weeks, 4 times per year</li>
          <li>Cancel anytime - no fees, no questions asked</li>
          <li>Manage via SMS: Text SKIP, PAUSE, or RESUME to 12345</li>
        </ul>
      </div>
    </div>
  );
}
```

**Acceptance Criteria:**
- [ ] Subscriptions list displays correctly
- [ ] Skip, Pause, Resume, Cancel actions work
- [ ] Status badges show correct colors
- [ ] Flexibility messaging visible

---

#### Step 2.5: Create Quality Report Frontend

**File:** `frontend/src/app/quality/report/page.tsx`

```tsx
'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/store/auth';
import { api } from '@/lib/api';
import { Order } from '@/types';
import { Loader2, Upload, CheckCircle } from 'lucide-react';

const ISSUE_TYPES = [
  { value: 'DAMAGED', label: 'Damaged produce', labelAr: 'منتج تالف' },
  { value: 'NOT_FRESH', label: 'Not fresh', labelAr: 'غير طازج' },
  { value: 'WRONG_ITEM', label: 'Wrong item', labelAr: 'منتج خاطئ' },
  { value: 'MISSING_ITEM', label: 'Missing item', labelAr: 'منتج مفقود' },
  { value: 'QUANTITY_SHORT', label: 'Quantity short', labelAr: 'كمية ناقصة' },
  { value: 'TASTE_QUALITY', label: 'Taste/quality issue', labelAr: 'مشكلة في الطعم/الجودة' },
  { value: 'OTHER', label: 'Other', labelAr: 'أخرى' },
];

export default function QualityReportPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [selectedOrder, setSelectedOrder] = useState<string>('');
  const [issueType, setIssueType] = useState<string>('');
  const [description, setDescription] = useState('');
  const [photos, setPhotos] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [creditAwarded, setCreditAwarded] = useState<number | null>(null);

  const { isAuthenticated } = useAuthStore();
  const router = useRouter();

  useEffect(() => {
    if (!isAuthenticated) {
      router.push('/login');
      return;
    }
    fetchRecentOrders();
  }, [isAuthenticated]);

  const fetchRecentOrders = async () => {
    try {
      const { data } = await api.get('/orders/my?status=DELIVERED&limit=10');
      setOrders(data.data);
    } catch (error) {
      console.error('Failed to fetch orders:', error);
    } finally {
      setLoading(false);
    }
  };

  const handlePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;

    // Upload to Cloudinary (simplified - in production use proper upload)
    const formData = new FormData();
    formData.append('file', files[0]);
    formData.append('upload_preset', 'farmbox_quality');

    try {
      const response = await fetch(
        `https://api.cloudinary.com/v1_1/${process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD}/image/upload`,
        { method: 'POST', body: formData }
      );
      const data = await response.json();
      setPhotos([...photos, data.secure_url]);
    } catch (error) {
      console.error('Failed to upload photo:', error);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);

    try {
      const { data } = await api.post('/quality/reports', {
        orderId: selectedOrder,
        issueType,
        description,
        photoUrls: photos,
      });

      setSuccess(true);
      if (data.data.creditAwarded) {
        setCreditAwarded(data.data.report.creditAmount);
      }
    } catch (error) {
      console.error('Failed to submit report:', error);
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  if (success) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-md mx-auto text-center">
          <CheckCircle className="h-16 w-16 text-green-500 mx-auto mb-4" />
          <h1 className="text-2xl font-bold mb-2">Report Submitted</h1>
          {creditAwarded && (
            <p className="text-green-600 mb-4">
              {creditAwarded.toFixed(2)} TND credit has been added to your account!
            </p>
          )}
          <p className="text-gray-600 mb-6">
            We're sorry for the inconvenience and are working to improve.
          </p>
          <button
            onClick={() => router.push('/dashboard')}
            className="bg-primary-600 text-white px-6 py-2 rounded-lg hover:bg-primary-700"
          >
            Back to Dashboard
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-lg mx-auto">
        <h1 className="text-2xl font-bold mb-6">Report a Quality Issue</h1>

        {/* Quality Guarantee Banner */}
        <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-6">
          <p className="text-green-800 font-medium">100% Satisfaction Guaranteed</p>
          <p className="text-green-700 text-sm">
            No questions asked. Submit a photo and receive instant credit.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Order Selection */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Select Order
            </label>
            <select
              value={selectedOrder}
              onChange={(e) => setSelectedOrder(e.target.value)}
              required
              className="w-full border border-gray-300 rounded-lg px-4 py-2"
            >
              <option value="">Choose an order...</option>
              {orders.map((order) => (
                <option key={order.id} value={order.id}>
                  {order.orderNumber} - {new Date(order.createdAt).toLocaleDateString()}
                </option>
              ))}
            </select>
          </div>

          {/* Issue Type */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Issue Type
            </label>
            <select
              value={issueType}
              onChange={(e) => setIssueType(e.target.value)}
              required
              className="w-full border border-gray-300 rounded-lg px-4 py-2"
            >
              <option value="">Select issue type...</option>
              {ISSUE_TYPES.map((type) => (
                <option key={type.value} value={type.value}>
                  {type.label}
                </option>
              ))}
            </select>
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Description
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              required
              rows={3}
              className="w-full border border-gray-300 rounded-lg px-4 py-2"
              placeholder="Please describe the issue..."
            />
          </div>

          {/* Photo Upload */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Photos (recommended)
            </label>
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
              <input
                type="file"
                accept="image/*"
                onChange={handlePhotoUpload}
                className="hidden"
                id="photo-upload"
              />
              <label
                htmlFor="photo-upload"
                className="cursor-pointer flex flex-col items-center"
              >
                <Upload className="h-8 w-8 text-gray-400 mb-2" />
                <span className="text-gray-600">Click to upload photo</span>
              </label>
            </div>
            {photos.length > 0 && (
              <div className="flex gap-2 mt-2">
                {photos.map((url, i) => (
                  <img
                    key={i}
                    src={url}
                    alt={`Photo ${i + 1}`}
                    className="h-16 w-16 object-cover rounded"
                  />
                ))}
              </div>
            )}
          </div>

          {/* Submit */}
          <button
            type="submit"
            disabled={submitting}
            className="w-full bg-primary-600 text-white py-3 rounded-lg hover:bg-primary-700 disabled:opacity-50 flex items-center justify-center"
          >
            {submitting ? (
              <Loader2 className="h-5 w-5 animate-spin" />
            ) : (
              'Submit Report'
            )}
          </button>
        </form>
      </div>
    </div>
  );
}
```

**Acceptance Criteria:**
- [ ] Order selection from recent deliveries
- [ ] All issue types available
- [ ] Photo upload works
- [ ] Credit awarded message displays
- [ ] Success state shows correctly

---

### Month 3: Trial Box & Admin Dashboard

---

#### Step 3.1: Create Trial Box Controller

**File:** `backend/src/controllers/trial.controller.ts`

```typescript
import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { AuthRequest } from '../middleware/auth.middleware';

const prisma = new PrismaClient();

export const createTrialBox = async (req: AuthRequest, res: Response) => {
  try {
    const { farmId, boxSize, deliveryDate, deliveryWindow } = req.body;
    const customerId = req.user!.id;

    // Check if customer already has trial with this farm
    const existing = await prisma.trialBox.findUnique({
      where: { customerId_farmId: { customerId, farmId } },
    });

    if (existing) {
      return res.status(400).json({
        success: false,
        error: { message: 'You have already used your trial with this farm' },
      });
    }

    // Create trial box
    const trialBox = await prisma.trialBox.create({
      data: {
        customerId,
        farmId,
        boxSize,
        discountPercent: 25,
        expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days
      },
      include: {
        farm: { select: { name: true, slug: true } },
      },
    });

    res.status(201).json({ success: true, data: trialBox });
  } catch (error) {
    console.error('Create trial box error:', error);
    res.status(500).json({ success: false, error: { message: 'Failed to create trial box' } });
  }
};

export const convertTrialToSubscription = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const { frequency, deliveryDay } = req.body;
    const customerId = req.user!.id;

    const trialBox = await prisma.trialBox.findFirst({
      where: { id, customerId, status: 'DELIVERED' },
    });

    if (!trialBox) {
      return res.status(404).json({
        success: false,
        error: { message: 'Delivered trial box not found' },
      });
    }

    // Create subscription from trial
    const subscription = await prisma.subscription.create({
      data: {
        customerId,
        farmId: trialBox.farmId,
        boxSize: trialBox.boxSize,
        frequency,
        deliveryDay,
        status: 'ACTIVE',
        trialConverted: true,
      },
    });

    // Update trial box
    await prisma.trialBox.update({
      where: { id },
      data: { convertedToSub: true, status: 'CONVERTED' },
    });

    res.json({ success: true, data: subscription });
  } catch (error) {
    console.error('Convert trial error:', error);
    res.status(500).json({ success: false, error: { message: 'Failed to convert trial' } });
  }
};
```

---

#### Step 3.2: Create Admin Quality Dashboard

**File:** `backend/src/controllers/admin.controller.ts`

```typescript
import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { AuthRequest } from '../middleware/auth.middleware';

const prisma = new PrismaClient();

export const getQualityDashboard = async (req: AuthRequest, res: Response) => {
  try {
    const { startDate, endDate } = req.query;

    const dateFilter = {
      createdAt: {
        gte: startDate ? new Date(startDate as string) : new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
        lte: endDate ? new Date(endDate as string) : new Date(),
      },
    };

    // Get quality metrics
    const [
      totalReports,
      reportsByStatus,
      reportsByType,
      avgResolutionTime,
      totalCreditsIssued,
      reportsByFarm,
    ] = await Promise.all([
      prisma.qualityReport.count({ where: dateFilter }),
      prisma.qualityReport.groupBy({
        by: ['status'],
        where: dateFilter,
        _count: true,
      }),
      prisma.qualityReport.groupBy({
        by: ['issueType'],
        where: dateFilter,
        _count: true,
      }),
      prisma.qualityReport.aggregate({
        where: { ...dateFilter, handledAt: { not: null } },
        _avg: {
          // Calculate difference between handledAt and createdAt
        },
      }),
      prisma.customerCredit.aggregate({
        where: { ...dateFilter, reason: 'QUALITY_ISSUE' },
        _sum: { amount: true },
      }),
      prisma.qualityReport.groupBy({
        by: ['orderId'],
        where: dateFilter,
        _count: true,
      }),
    ]);

    // Get survey metrics
    const surveyMetrics = await prisma.deliverySurvey.aggregate({
      where: dateFilter,
      _avg: {
        overallRating: true,
        freshnessRating: true,
        deliveryRating: true,
        packagingRating: true,
      },
      _count: true,
    });

    res.json({
      success: true,
      data: {
        reports: {
          total: totalReports,
          byStatus: reportsByStatus,
          byType: reportsByType,
        },
        credits: {
          totalIssued: totalCreditsIssued._sum.amount || 0,
        },
        surveys: {
          count: surveyMetrics._count,
          avgOverall: surveyMetrics._avg.overallRating,
          avgFreshness: surveyMetrics._avg.freshnessRating,
          avgDelivery: surveyMetrics._avg.deliveryRating,
          avgPackaging: surveyMetrics._avg.packagingRating,
        },
      },
    });
  } catch (error) {
    console.error('Get quality dashboard error:', error);
    res.status(500).json({ success: false, error: { message: 'Failed to fetch dashboard' } });
  }
};

export const resolveQualityReport = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const { resolution, creditAmount, status } = req.body;
    const adminId = req.user!.id;

    const report = await prisma.qualityReport.update({
      where: { id },
      data: {
        status,
        resolution,
        creditAmount,
        handledBy: adminId,
        handledAt: new Date(),
      },
    });

    // Issue additional credit if specified
    if (creditAmount && creditAmount > 0) {
      await prisma.customerCredit.create({
        data: {
          customerId: report.customerId,
          amount: creditAmount,
          reason: 'QUALITY_ISSUE',
          referenceId: report.id,
          expiresAt: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000),
        },
      });
    }

    res.json({ success: true, data: report });
  } catch (error) {
    console.error('Resolve quality report error:', error);
    res.status(500).json({ success: false, error: { message: 'Failed to resolve report' } });
  }
};
```

---

## 3. Phase 2: Delivery & Sourcing (Month 4-6)

### Month 4: Delivery Tracking System

---

#### Step 4.1: Add Delivery Schema

**File:** `backend/prisma/schema.prisma`

```prisma
model DeliveryRoute {
  id              String       @id @default(uuid())
  date            DateTime
  zone            DeliveryZone
  driverId        String?
  driver          User?        @relation("DriverRoutes", fields: [driverId], references: [id])
  status          RouteStatus  @default(PLANNED)
  stops           DeliveryStop[]
  startedAt       DateTime?
  completedAt     DateTime?
  createdAt       DateTime     @default(now())
  updatedAt       DateTime     @updatedAt

  @@index([date, zone])
}

model DeliveryStop {
  id              String       @id @default(uuid())
  routeId         String
  route           DeliveryRoute @relation(fields: [routeId], references: [id])
  orderId         String       @unique
  order           Order        @relation(fields: [orderId], references: [id])
  sequence        Int
  estimatedTime   DateTime?
  actualTime      DateTime?
  status          StopStatus   @default(PENDING)
  notes           String?
  photoProof      String?
  signature       String?

  @@index([routeId])
}

model PickupPoint {
  id              String       @id @default(uuid())
  name            String
  nameAr          String
  address         String
  addressAr       String
  city            String
  zone            DeliveryZone
  lat             Float
  lng             Float
  partnerName     String
  partnerPhone    String
  operatingHours  Json
  isActive        Boolean      @default(true)
  orders          Order[]
  createdAt       DateTime     @default(now())
  updatedAt       DateTime     @updatedAt

  @@index([zone])
}

model DeliveryTracking {
  id              String       @id @default(uuid())
  orderId         String
  order           Order        @relation(fields: [orderId], references: [id])
  status          TrackingStatus
  location        Json?
  message         String
  messageAr       String
  timestamp       DateTime     @default(now())

  @@index([orderId])
}

enum RouteStatus {
  PLANNED
  IN_PROGRESS
  COMPLETED
  CANCELLED
}

enum StopStatus {
  PENDING
  ARRIVED
  DELIVERED
  FAILED
  SKIPPED
}

enum TrackingStatus {
  ORDER_PLACED
  ORDER_CONFIRMED
  BEING_PACKED
  OUT_FOR_DELIVERY
  NEARBY
  DELIVERED
  PICKUP_READY
  PICKED_UP
}
```

**Commands:**
```bash
npx prisma migrate dev --name add_delivery_tracking
npx prisma generate
```

---

#### Step 4.2: Setup WebSocket Server

**File:** `backend/src/websocket.ts`

```typescript
import { Server as HTTPServer } from 'http';
import { Server, Socket } from 'socket.io';
import jwt from 'jsonwebtoken';

let io: Server;

export const initWebSocket = (server: HTTPServer) => {
  io = new Server(server, {
    cors: {
      origin: process.env.FRONTEND_URL || 'http://localhost:3000',
      methods: ['GET', 'POST'],
    },
  });

  // Authentication middleware
  io.use((socket, next) => {
    const token = socket.handshake.auth.token;
    if (!token) {
      return next(new Error('Authentication required'));
    }

    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET!);
      socket.data.user = decoded;
      next();
    } catch (error) {
      next(new Error('Invalid token'));
    }
  });

  io.on('connection', (socket: Socket) => {
    console.log(`Client connected: ${socket.id}`);

    // Subscribe to order updates
    socket.on('subscribe:order', (orderId: string) => {
      socket.join(`order:${orderId}`);
    });

    // Subscribe to delivery tracking
    socket.on('subscribe:delivery', (orderId: string) => {
      socket.join(`delivery:${orderId}`);
    });

    socket.on('disconnect', () => {
      console.log(`Client disconnected: ${socket.id}`);
    });
  });

  return io;
};

export const emitOrderUpdate = (orderId: string, data: any) => {
  io?.to(`order:${orderId}`).emit('order:status', data);
};

export const emitDeliveryUpdate = (orderId: string, data: any) => {
  io?.to(`delivery:${orderId}`).emit('delivery:location', data);
};

export const emitETAUpdate = (orderId: string, eta: Date) => {
  io?.to(`delivery:${orderId}`).emit('delivery:eta', { eta });
};
```

**File:** `backend/src/index.ts`

Update to use WebSocket:

```typescript
import express from 'express';
import { createServer } from 'http';
import { initWebSocket } from './websocket';

const app = express();
const server = createServer(app);

// Initialize WebSocket
initWebSocket(server);

// ... rest of your express setup ...

server.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
```

---

#### Step 4.3: Create Delivery Tracking Controller

**File:** `backend/src/controllers/delivery.controller.ts`

```typescript
import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { AuthRequest } from '../middleware/auth.middleware';
import { emitDeliveryUpdate, emitETAUpdate } from '../websocket';

const prisma = new PrismaClient();

// Get delivery zones
export const getDeliveryZones = async (req: Request, res: Response) => {
  const zones = {
    ZONE_A: {
      name: 'Tunis Central',
      nameAr: 'تونس العاصمة',
      areas: ['La Marsa', 'Sidi Bou Said', 'Carthage', 'Les Berges du Lac'],
      baseFee: 5,
      freeThreshold: 80,
      deliveryDays: ['wednesday', 'saturday'],
      windows: ['08:00-12:00', '14:00-18:00', '18:00-21:00'],
    },
    ZONE_B: {
      name: 'Greater Tunis',
      nameAr: 'الضواحي',
      areas: ['Ariana', 'Ben Arous', 'Manouba', 'Ezzahra'],
      baseFee: 8,
      freeThreshold: 120,
      deliveryDays: ['thursday', 'sunday'],
      windows: ['09:00-13:00', '15:00-19:00'],
    },
    ZONE_C: {
      name: 'Extended Area',
      nameAr: 'المناطق الممتدة',
      areas: ['Sousse', 'Sfax', 'Nabeul', 'Hammamet'],
      baseFee: 15,
      freeThreshold: 200,
      deliveryDays: ['friday'],
      windows: ['10:00-18:00'],
      pickupOnly: true,
    },
  };

  res.json({ success: true, data: zones });
};

// Get pickup points
export const getPickupPoints = async (req: Request, res: Response) => {
  try {
    const { zone } = req.query;

    const pickupPoints = await prisma.pickupPoint.findMany({
      where: {
        isActive: true,
        ...(zone && { zone: zone as any }),
      },
      orderBy: { name: 'asc' },
    });

    res.json({ success: true, data: pickupPoints });
  } catch (error) {
    console.error('Get pickup points error:', error);
    res.status(500).json({ success: false, error: { message: 'Failed to fetch pickup points' } });
  }
};

// Get order tracking
export const getOrderTracking = async (req: AuthRequest, res: Response) => {
  try {
    const { orderId } = req.params;
    const customerId = req.user!.id;

    // Verify order belongs to customer
    const order = await prisma.order.findFirst({
      where: { id: orderId, customerId },
      include: {
        deliveryTracking: { orderBy: { timestamp: 'desc' } },
        deliveryStop: {
          include: {
            route: {
              select: { status: true, driverId: true },
            },
          },
        },
      },
    });

    if (!order) {
      return res.status(404).json({ success: false, error: { message: 'Order not found' } });
    }

    res.json({ success: true, data: order });
  } catch (error) {
    console.error('Get order tracking error:', error);
    res.status(500).json({ success: false, error: { message: 'Failed to fetch tracking' } });
  }
};

// Add tracking event (driver app)
export const addTrackingEvent = async (req: AuthRequest, res: Response) => {
  try {
    const { orderId } = req.params;
    const { status, location, message, messageAr } = req.body;

    const tracking = await prisma.deliveryTracking.create({
      data: {
        orderId,
        status,
        location,
        message,
        messageAr,
      },
    });

    // Emit real-time update
    emitDeliveryUpdate(orderId, {
      status,
      location,
      message,
      timestamp: tracking.timestamp,
    });

    // If nearby, send notification
    if (status === 'NEARBY') {
      // TODO: Send push notification
    }

    res.status(201).json({ success: true, data: tracking });
  } catch (error) {
    console.error('Add tracking event error:', error);
    res.status(500).json({ success: false, error: { message: 'Failed to add tracking event' } });
  }
};
```

---

#### Step 4.4: Create Delivery Tracking Frontend

**File:** `frontend/src/app/tracking/[orderId]/page.tsx`

```tsx
'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { io, Socket } from 'socket.io-client';
import { api } from '@/lib/api';
import { useAuthStore } from '@/store/auth';
import { Package, Truck, MapPin, CheckCircle, Clock } from 'lucide-react';

interface TrackingEvent {
  status: string;
  message: string;
  messageAr: string;
  timestamp: string;
  location?: { lat: number; lng: number };
}

const TRACKING_STEPS = [
  { status: 'ORDER_CONFIRMED', icon: Package, label: 'Order Confirmed' },
  { status: 'BEING_PACKED', icon: Package, label: 'Being Packed' },
  { status: 'OUT_FOR_DELIVERY', icon: Truck, label: 'Out for Delivery' },
  { status: 'NEARBY', icon: MapPin, label: 'Driver Nearby' },
  { status: 'DELIVERED', icon: CheckCircle, label: 'Delivered' },
];

export default function TrackingPage() {
  const { orderId } = useParams();
  const [events, setEvents] = useState<TrackingEvent[]>([]);
  const [currentStatus, setCurrentStatus] = useState<string>('');
  const [eta, setEta] = useState<Date | null>(null);
  const [driverLocation, setDriverLocation] = useState<{ lat: number; lng: number } | null>(null);
  const { token } = useAuthStore();

  useEffect(() => {
    // Fetch initial tracking data
    const fetchTracking = async () => {
      try {
        const { data } = await api.get(`/orders/${orderId}/tracking`);
        setEvents(data.data.deliveryTracking || []);
        if (data.data.deliveryTracking?.length > 0) {
          setCurrentStatus(data.data.deliveryTracking[0].status);
        }
      } catch (error) {
        console.error('Failed to fetch tracking:', error);
      }
    };

    fetchTracking();

    // Connect to WebSocket
    const socket: Socket = io(process.env.NEXT_PUBLIC_WS_URL || 'http://localhost:4000', {
      auth: { token },
    });

    socket.on('connect', () => {
      socket.emit('subscribe:delivery', orderId);
    });

    socket.on('delivery:location', (data: TrackingEvent) => {
      setEvents((prev) => [data, ...prev]);
      setCurrentStatus(data.status);
      if (data.location) {
        setDriverLocation(data.location);
      }
    });

    socket.on('delivery:eta', ({ eta }: { eta: string }) => {
      setEta(new Date(eta));
    });

    return () => {
      socket.disconnect();
    };
  }, [orderId, token]);

  const getCurrentStepIndex = () => {
    return TRACKING_STEPS.findIndex((step) => step.status === currentStatus);
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-6">Track Your Order</h1>

      {/* Progress Steps */}
      <div className="bg-white rounded-lg shadow-md p-6 mb-6">
        <div className="flex justify-between">
          {TRACKING_STEPS.map((step, index) => {
            const StepIcon = step.icon;
            const isCompleted = index <= getCurrentStepIndex();
            const isCurrent = index === getCurrentStepIndex();

            return (
              <div key={step.status} className="flex flex-col items-center flex-1">
                <div
                  className={`w-10 h-10 rounded-full flex items-center justify-center ${
                    isCompleted
                      ? 'bg-green-500 text-white'
                      : 'bg-gray-200 text-gray-400'
                  } ${isCurrent ? 'ring-4 ring-green-200' : ''}`}
                >
                  <StepIcon className="h-5 w-5" />
                </div>
                <span
                  className={`text-xs mt-2 text-center ${
                    isCompleted ? 'text-green-600' : 'text-gray-400'
                  }`}
                >
                  {step.label}
                </span>
              </div>
            );
          })}
        </div>
      </div>

      {/* ETA */}
      {eta && currentStatus !== 'DELIVERED' && (
        <div className="bg-blue-50 rounded-lg p-4 mb-6 flex items-center gap-3">
          <Clock className="h-6 w-6 text-blue-600" />
          <div>
            <p className="text-blue-800 font-medium">Estimated Arrival</p>
            <p className="text-blue-600">
              {eta.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
            </p>
          </div>
        </div>
      )}

      {/* Map placeholder */}
      {driverLocation && (
        <div className="bg-gray-100 rounded-lg h-64 mb-6 flex items-center justify-center">
          <p className="text-gray-500">
            Map showing driver at {driverLocation.lat.toFixed(4)}, {driverLocation.lng.toFixed(4)}
          </p>
          {/* TODO: Integrate Google Maps */}
        </div>
      )}

      {/* Event Timeline */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <h2 className="font-semibold mb-4">Tracking History</h2>
        <div className="space-y-4">
          {events.map((event, index) => (
            <div key={index} className="flex gap-4">
              <div className="w-2 h-2 rounded-full bg-green-500 mt-2" />
              <div>
                <p className="font-medium">{event.message}</p>
                <p className="text-sm text-gray-500">
                  {new Date(event.timestamp).toLocaleString()}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
```

---

### Month 5: Farm Profiles & Traceability

---

#### Step 5.1: Add Farm Profile Schema

**File:** `backend/prisma/schema.prisma`

```prisma
model FarmProfile {
  id              String       @id @default(uuid())
  farmId          String       @unique
  farm            Farm         @relation(fields: [farmId], references: [id])
  story           String       @db.Text
  storyAr         String       @db.Text
  farmingMethods  String[]
  certifications  String[]
  foundedYear     Int?
  familyGeneration Int?
  farmSize        Float?
  specialties     String[]
  videoUrl        String?
  galleryImages   String[]
  socialMedia     Json?
  updatedAt       DateTime     @updatedAt
}

model ProductBatch {
  id              String       @id @default(uuid())
  productId       String
  product         Product      @relation(fields: [productId], references: [id])
  batchCode       String       @unique
  harvestDate     DateTime
  harvestLocation String?
  farmerId        String
  quantityKg      Float
  qualityGrade    QualityGrade @default(A)
  notes           String?
  createdAt       DateTime     @default(now())

  @@index([productId])
  @@index([harvestDate])
}

model RegionalCampaign {
  id              String       @id @default(uuid())
  name            String
  nameAr          String
  region          TunisianRegion
  description     String       @db.Text
  descriptionAr   String       @db.Text
  heroImage       String
  products        String[]
  startDate       DateTime
  endDate         DateTime
  isActive        Boolean      @default(true)
  createdAt       DateTime     @default(now())

  @@index([region])
  @@index([startDate, endDate])
}

enum TunisianRegion {
  CAP_BON
  SAHEL
  SOUTH
  NORTH
  CENTRAL
  TUNIS_SUBURBS
}

enum QualityGrade {
  A_PLUS
  A
  B
}
```

**Commands:**
```bash
npx prisma migrate dev --name add_farm_profiles_traceability
npx prisma generate
```

---

#### Step 5.2: Create Traceability Controller

**File:** `backend/src/controllers/traceability.controller.ts`

```typescript
import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import QRCode from 'qrcode';

const prisma = new PrismaClient();

// Get batch info by code (QR scan destination)
export const getBatchByCode = async (req: Request, res: Response) => {
  try {
    const { code } = req.params;

    const batch = await prisma.productBatch.findUnique({
      where: { batchCode: code },
      include: {
        product: {
          include: {
            farm: {
              select: {
                name: true,
                slug: true,
                logo: true,
                region: true,
                lat: true,
                lng: true,
              },
            },
          },
        },
      },
    });

    if (!batch) {
      return res.status(404).json({ success: false, error: { message: 'Batch not found' } });
    }

    const daysAgo = Math.floor(
      (Date.now() - new Date(batch.harvestDate).getTime()) / (1000 * 60 * 60 * 24)
    );

    res.json({
      success: true,
      data: {
        batchCode: batch.batchCode,
        product: {
          name: batch.product.name,
          nameAr: batch.product.nameAr,
        },
        farm: batch.product.farm,
        harvest: {
          date: batch.harvestDate,
          location: batch.harvestLocation,
          daysAgo,
        },
        quality: {
          grade: batch.qualityGrade,
        },
      },
    });
  } catch (error) {
    console.error('Get batch error:', error);
    res.status(500).json({ success: false, error: { message: 'Failed to fetch batch' } });
  }
};

// Generate QR code for batch
export const generateBatchQR = async (req: Request, res: Response) => {
  try {
    const { batchCode } = req.params;
    const url = `${process.env.FRONTEND_URL}/trace/${batchCode}`;

    const qrDataUrl = await QRCode.toDataURL(url, {
      width: 300,
      margin: 2,
    });

    res.json({ success: true, data: { qrCode: qrDataUrl, url } });
  } catch (error) {
    console.error('Generate QR error:', error);
    res.status(500).json({ success: false, error: { message: 'Failed to generate QR' } });
  }
};

// Get farm profile
export const getFarmProfile = async (req: Request, res: Response) => {
  try {
    const { farmId } = req.params;

    const profile = await prisma.farmProfile.findUnique({
      where: { farmId },
      include: {
        farm: {
          select: {
            name: true,
            slug: true,
            logo: true,
            coverImage: true,
            region: true,
            products: {
              take: 6,
              select: { id: true, name: true, nameAr: true, images: true },
            },
          },
        },
      },
    });

    if (!profile) {
      return res.status(404).json({ success: false, error: { message: 'Profile not found' } });
    }

    res.json({ success: true, data: profile });
  } catch (error) {
    console.error('Get farm profile error:', error);
    res.status(500).json({ success: false, error: { message: 'Failed to fetch profile' } });
  }
};

// Get regional campaigns
export const getRegionalCampaigns = async (req: Request, res: Response) => {
  try {
    const { region } = req.query;
    const now = new Date();

    const campaigns = await prisma.regionalCampaign.findMany({
      where: {
        isActive: true,
        startDate: { lte: now },
        endDate: { gte: now },
        ...(region && { region: region as any }),
      },
      orderBy: { startDate: 'asc' },
    });

    res.json({ success: true, data: campaigns });
  } catch (error) {
    console.error('Get campaigns error:', error);
    res.status(500).json({ success: false, error: { message: 'Failed to fetch campaigns' } });
  }
};

// Get seasonal produce
export const getSeasonalProduce = async (req: Request, res: Response) => {
  const { month } = req.params;
  const targetMonth = month ? parseInt(month) : new Date().getMonth() + 1;

  const SEASONAL_CALENDAR: Record<number, any[]> = {
    1: [
      { product: 'oranges', peak: true, region: 'CAP_BON' },
      { product: 'lemons', peak: true, region: 'CAP_BON' },
      { product: 'cauliflower', peak: false, region: 'NORTH' },
    ],
    2: [
      { product: 'oranges', peak: true, region: 'CAP_BON' },
      { product: 'clementines', peak: true, region: 'CAP_BON' },
    ],
    // ... add all 12 months
    8: [
      { product: 'tomatoes', peak: true, region: 'CENTRAL' },
      { product: 'peppers', peak: true, region: 'CENTRAL' },
      { product: 'dates', peak: true, region: 'SOUTH' },
      { product: 'figs', peak: true, region: 'CAP_BON' },
    ],
  };

  res.json({
    success: true,
    data: {
      month: targetMonth,
      produce: SEASONAL_CALENDAR[targetMonth] || [],
    },
  });
};
```

---

#### Step 5.3: Create Traceability Frontend Page

**File:** `frontend/src/app/trace/[batchCode]/page.tsx`

```tsx
'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { api } from '@/lib/api';
import { MapPin, Calendar, Award, Truck, Leaf } from 'lucide-react';
import Link from 'next/link';

interface BatchInfo {
  batchCode: string;
  product: { name: string; nameAr: string };
  farm: {
    name: string;
    slug: string;
    logo: string;
    region: string;
  };
  harvest: {
    date: string;
    location: string;
    daysAgo: number;
  };
  quality: { grade: string };
}

export default function TraceabilityPage() {
  const { batchCode } = useParams();
  const [batch, setBatch] = useState<BatchInfo | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchBatch = async () => {
      try {
        const { data } = await api.get(`/batches/${batchCode}`);
        setBatch(data.data);
      } catch (error) {
        console.error('Failed to fetch batch:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchBatch();
  }, [batchCode]);

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin h-8 w-8 border-4 border-primary-600 border-t-transparent rounded-full" />
      </div>
    );
  }

  if (!batch) {
    return (
      <div className="container mx-auto px-4 py-8 text-center">
        <h1 className="text-2xl font-bold mb-4">Product Not Found</h1>
        <p className="text-gray-600">This batch code could not be found.</p>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-lg">
      {/* Header */}
      <div className="text-center mb-8">
        <Leaf className="h-12 w-12 text-green-600 mx-auto mb-2" />
        <h1 className="text-2xl font-bold">Product Traceability</h1>
        <p className="text-gray-600">From farm to your table</p>
      </div>

      {/* Product Info */}
      <div className="bg-white rounded-lg shadow-md p-6 mb-6">
        <h2 className="text-xl font-semibold mb-1">{batch.product.name}</h2>
        <p className="text-gray-600 text-sm mb-4" dir="rtl">{batch.product.nameAr}</p>

        <div className="flex items-center gap-2 text-sm text-gray-500 mb-2">
          <Award className="h-4 w-4" />
          <span>Quality Grade: {batch.quality.grade}</span>
        </div>

        <div className="text-xs text-gray-400">
          Batch: {batch.batchCode}
        </div>
      </div>

      {/* Farm Info */}
      <div className="bg-white rounded-lg shadow-md p-6 mb-6">
        <div className="flex items-center gap-4 mb-4">
          {batch.farm.logo && (
            <img
              src={batch.farm.logo}
              alt={batch.farm.name}
              className="w-16 h-16 rounded-full object-cover"
            />
          )}
          <div>
            <h3 className="font-semibold">{batch.farm.name}</h3>
            <p className="text-sm text-gray-600">{batch.farm.region}</p>
          </div>
        </div>
        <Link
          href={`/farms/${batch.farm.slug}`}
          className="text-primary-600 text-sm hover:underline"
        >
          Meet the farmer &rarr;
        </Link>
      </div>

      {/* Harvest Info */}
      <div className="bg-white rounded-lg shadow-md p-6 mb-6">
        <h3 className="font-semibold mb-4">Harvest Information</h3>

        <div className="space-y-3">
          <div className="flex items-center gap-3">
            <Calendar className="h-5 w-5 text-gray-400" />
            <div>
              <p className="text-sm text-gray-600">Harvested</p>
              <p className="font-medium">
                {new Date(batch.harvest.date).toLocaleDateString()}
                <span className="text-green-600 text-sm ml-2">
                  ({batch.harvest.daysAgo} days ago)
                </span>
              </p>
            </div>
          </div>

          {batch.harvest.location && (
            <div className="flex items-center gap-3">
              <MapPin className="h-5 w-5 text-gray-400" />
              <div>
                <p className="text-sm text-gray-600">Location</p>
                <p className="font-medium">{batch.harvest.location}</p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Journey */}
      <div className="bg-green-50 rounded-lg p-6">
        <div className="flex items-center gap-2 mb-2">
          <Truck className="h-5 w-5 text-green-600" />
          <h3 className="font-semibold text-green-800">Farm to Table Journey</h3>
        </div>
        <p className="text-green-700 text-sm">
          This product traveled directly from {batch.farm.name} in {batch.farm.region} to your local delivery hub, ensuring maximum freshness.
        </p>
      </div>
    </div>
  );
}
```

---

## 4. Phase 3: Sustainability & Loyalty (Month 7-12)

### Month 7-8: Impact Tracking & Rescued Produce

---

#### Step 7.1: Add Sustainability Schema

**File:** `backend/prisma/schema.prisma`

```prisma
model ImpactMetrics {
  id              String       @id @default(uuid())
  orderId         String       @unique
  order           Order        @relation(fields: [orderId], references: [id])
  foodSavedKg     Float        @default(0)
  co2SavedKg      Float        @default(0)
  kmFromFarm      Float        @default(0)
  farmersSupported Int         @default(1)
  packagingReturned Boolean    @default(false)
  createdAt       DateTime     @default(now())
}

model CustomerImpact {
  id              String       @id @default(uuid())
  customerId      String       @unique
  customer        User         @relation(fields: [customerId], references: [id])
  totalFoodSavedKg Float       @default(0)
  totalCo2SavedKg  Float       @default(0)
  totalOrders      Int         @default(0)
  totalFarmersSupported Int    @default(0)
  packagingsReturned Int       @default(0)
  memberSince      DateTime    @default(now())
  updatedAt        DateTime    @updatedAt
}

model RescuedProduce {
  id              String       @id @default(uuid())
  farmId          String
  farm            Farm         @relation(fields: [farmId], references: [id])
  productName     String
  productNameAr   String
  weightKg        Float
  reason          RescueReason
  discountPercent Int          @default(30)
  availableUntil  DateTime
  isAvailable     Boolean      @default(true)
  createdAt       DateTime     @default(now())

  @@index([farmId])
  @@index([availableUntil])
}

model PackagingReturn {
  id              String       @id @default(uuid())
  customerId      String
  customer        User         @relation(fields: [customerId], references: [id])
  itemsReturned   Int
  creditAwarded   Float
  returnedAt      DateTime     @default(now())

  @@index([customerId])
}

enum RescueReason {
  COSMETIC_IMPERFECTION
  SURPLUS
  NEAR_EXPIRY
  SIZE_VARIATION
}
```

---

#### Step 7.2: Create Impact Service

**File:** `backend/src/services/impact.service.ts`

```typescript
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export class ImpactService {
  async calculateOrderImpact(orderId: string) {
    const order = await prisma.order.findUnique({
      where: { id: orderId },
      include: {
        items: { include: { product: true } },
        farm: true,
      },
    });

    if (!order) throw new Error('Order not found');

    let foodSavedKg = 0;
    let co2SavedKg = 0;

    for (const item of order.items) {
      const weightKg = item.quantity * 0.5; // Assume 0.5kg average per item

      if (item.product.isRescued) {
        foodSavedKg += weightKg;
      } else {
        foodSavedKg += weightKg * 0.1; // 10% waste prevention estimate
      }

      co2SavedKg += weightKg * 2.0; // 2kg CO2 saved per kg local vs imported
    }

    // Calculate distance (simplified)
    const kmFromFarm = 25; // Average for Zone A

    const impact = await prisma.impactMetrics.create({
      data: {
        orderId,
        foodSavedKg,
        co2SavedKg,
        kmFromFarm,
        farmersSupported: 1,
      },
    });

    // Update customer lifetime impact
    await this.updateCustomerImpact(order.customerId, impact);

    return impact;
  }

  async updateCustomerImpact(customerId: string, newImpact: any) {
    await prisma.customerImpact.upsert({
      where: { customerId },
      update: {
        totalFoodSavedKg: { increment: newImpact.foodSavedKg },
        totalCo2SavedKg: { increment: newImpact.co2SavedKg },
        totalOrders: { increment: 1 },
      },
      create: {
        customerId,
        totalFoodSavedKg: newImpact.foodSavedKg,
        totalCo2SavedKg: newImpact.co2SavedKg,
        totalOrders: 1,
      },
    });
  }

  async getCustomerImpact(customerId: string) {
    const impact = await prisma.customerImpact.findUnique({
      where: { customerId },
    });

    if (!impact) {
      return {
        totalFoodSavedKg: 0,
        totalCo2SavedKg: 0,
        totalOrders: 0,
        equivalentTrees: 0,
      };
    }

    // 1 tree absorbs ~21kg CO2 per year
    const equivalentTrees = Math.round(impact.totalCo2SavedKg / 21);

    return {
      ...impact,
      equivalentTrees,
    };
  }

  async getCommunityImpact() {
    const totals = await prisma.customerImpact.aggregate({
      _sum: {
        totalFoodSavedKg: true,
        totalCo2SavedKg: true,
        totalOrders: true,
        totalFarmersSupported: true,
      },
      _count: true,
    });

    return {
      totalCustomers: totals._count,
      totalFoodSavedKg: totals._sum.totalFoodSavedKg || 0,
      totalCo2SavedKg: totals._sum.totalCo2SavedKg || 0,
      totalOrders: totals._sum.totalOrders || 0,
      equivalentTrees: Math.round((totals._sum.totalCo2SavedKg || 0) / 21),
    };
  }
}

export const impactService = new ImpactService();
```

---

### Month 9-12: Loyalty Program & Referrals

---

#### Step 9.1: Add Loyalty Schema

**File:** `backend/prisma/schema.prisma`

```prisma
model CustomerLoyalty {
  id              String       @id @default(uuid())
  customerId      String       @unique
  customer        User         @relation(fields: [customerId], references: [id])
  points          Int          @default(0)
  tier            LoyaltyTier  @default(BRONZE)
  totalSpent      Float        @default(0)
  totalOrders     Int          @default(0)
  referralCode    String       @unique
  referralsCount  Int          @default(0)
  updatedAt       DateTime     @updatedAt
}

model Referral {
  id              String       @id @default(uuid())
  referrerId      String
  referrer        User         @relation("Referrer", fields: [referrerId], references: [id])
  referredId      String
  referred        User         @relation("Referred", fields: [referredId], references: [id])
  status          ReferralStatus @default(PENDING)
  rewardAmount    Float        @default(10)
  createdAt       DateTime     @default(now())
  completedAt     DateTime?

  @@unique([referrerId, referredId])
  @@index([referrerId])
}

enum LoyaltyTier {
  BRONZE
  SILVER
  GOLD
  PLATINUM
}

enum ReferralStatus {
  PENDING
  COMPLETED
  EXPIRED
}
```

---

#### Step 9.2: Create Loyalty Controller

**File:** `backend/src/controllers/loyalty.controller.ts`

```typescript
import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { AuthRequest } from '../middleware/auth.middleware';
import { nanoid } from 'nanoid';

const prisma = new PrismaClient();

// Tier thresholds (TND spent)
const TIER_THRESHOLDS = {
  BRONZE: 0,
  SILVER: 500,
  GOLD: 1500,
  PLATINUM: 3000,
};

export const getMyLoyalty = async (req: AuthRequest, res: Response) => {
  try {
    const customerId = req.user!.id;

    let loyalty = await prisma.customerLoyalty.findUnique({
      where: { customerId },
    });

    if (!loyalty) {
      // Create loyalty record
      loyalty = await prisma.customerLoyalty.create({
        data: {
          customerId,
          referralCode: nanoid(8).toUpperCase(),
        },
      });
    }

    // Calculate next tier progress
    const nextTier = getNextTier(loyalty.tier);
    const nextThreshold = nextTier ? TIER_THRESHOLDS[nextTier] : null;
    const progress = nextThreshold
      ? (loyalty.totalSpent / nextThreshold) * 100
      : 100;

    res.json({
      success: true,
      data: {
        ...loyalty,
        nextTier,
        nextThreshold,
        progress: Math.min(progress, 100),
        benefits: getTierBenefits(loyalty.tier),
      },
    });
  } catch (error) {
    console.error('Get loyalty error:', error);
    res.status(500).json({ success: false, error: { message: 'Failed to fetch loyalty' } });
  }
};

export const createReferral = async (req: AuthRequest, res: Response) => {
  try {
    const { referralCode } = req.body;
    const referredId = req.user!.id;

    // Find referrer by code
    const referrerLoyalty = await prisma.customerLoyalty.findUnique({
      where: { referralCode },
    });

    if (!referrerLoyalty) {
      return res.status(404).json({
        success: false,
        error: { message: 'Invalid referral code' },
      });
    }

    if (referrerLoyalty.customerId === referredId) {
      return res.status(400).json({
        success: false,
        error: { message: 'Cannot refer yourself' },
      });
    }

    // Check if already referred
    const existing = await prisma.referral.findUnique({
      where: { referrerId_referredId: {
        referrerId: referrerLoyalty.customerId,
        referredId,
      }},
    });

    if (existing) {
      return res.status(400).json({
        success: false,
        error: { message: 'Already used a referral code' },
      });
    }

    const referral = await prisma.referral.create({
      data: {
        referrerId: referrerLoyalty.customerId,
        referredId,
        rewardAmount: 10,
      },
    });

    res.status(201).json({ success: true, data: referral });
  } catch (error) {
    console.error('Create referral error:', error);
    res.status(500).json({ success: false, error: { message: 'Failed to create referral' } });
  }
};

// Called after first order to complete referral
export const completeReferral = async (customerId: string, orderId: string) => {
  const referral = await prisma.referral.findFirst({
    where: { referredId: customerId, status: 'PENDING' },
  });

  if (!referral) return;

  // Award credits to both parties
  await prisma.$transaction([
    // Credit to referrer
    prisma.customerCredit.create({
      data: {
        customerId: referral.referrerId,
        amount: referral.rewardAmount,
        reason: 'REFERRAL',
        referenceId: referral.id,
      },
    }),
    // Credit to referred
    prisma.customerCredit.create({
      data: {
        customerId: referral.referredId,
        amount: referral.rewardAmount,
        reason: 'REFERRAL',
        referenceId: referral.id,
      },
    }),
    // Update referral status
    prisma.referral.update({
      where: { id: referral.id },
      data: { status: 'COMPLETED', completedAt: new Date() },
    }),
    // Increment referrer's count
    prisma.customerLoyalty.update({
      where: { customerId: referral.referrerId },
      data: { referralsCount: { increment: 1 } },
    }),
  ]);
};

function getNextTier(current: string): string | null {
  const tiers = ['BRONZE', 'SILVER', 'GOLD', 'PLATINUM'];
  const currentIndex = tiers.indexOf(current);
  return currentIndex < tiers.length - 1 ? tiers[currentIndex + 1] : null;
}

function getTierBenefits(tier: string) {
  const benefits = {
    BRONZE: ['Earn 1 point per TND spent', 'Birthday bonus'],
    SILVER: ['Earn 1.5 points per TND', 'Free delivery on orders over 60 TND', 'Early access to seasonal boxes'],
    GOLD: ['Earn 2 points per TND', 'Free delivery on all orders', 'Priority customer support'],
    PLATINUM: ['Earn 3 points per TND', 'Free delivery always', 'Exclusive products', 'Farm visit invitations'],
  };
  return benefits[tier as keyof typeof benefits] || benefits.BRONZE;
}
```

---

## 5. Testing Strategy

### Unit Tests

```bash
# Backend tests
cd backend
npm install --save-dev jest @types/jest ts-jest supertest @types/supertest
npm test

# Frontend tests
cd frontend
npm install --save-dev jest @testing-library/react @testing-library/jest-dom
npm test
```

### Integration Tests

Create test files for each feature:

- `backend/src/__tests__/subscription.test.ts`
- `backend/src/__tests__/quality.test.ts`
- `backend/src/__tests__/delivery.test.ts`
- `backend/src/__tests__/traceability.test.ts`
- `backend/src/__tests__/impact.test.ts`

### E2E Tests

```bash
# Install Playwright
npm install --save-dev @playwright/test

# Run E2E tests
npx playwright test
```

---

## 6. Deployment Checklist

### Pre-Deployment

- [ ] All environment variables configured
- [ ] Database migrations applied to production
- [ ] SSL certificates configured
- [ ] WhatsApp Business API verified
- [ ] SMS gateway credentials set
- [ ] Cloudinary configured
- [ ] Redis configured for WebSocket
- [ ] Google Maps API key set

### Infrastructure

- [ ] Docker images built and pushed
- [ ] Docker Compose production file updated
- [ ] Nginx configured with SSL
- [ ] Health checks configured
- [ ] Logging configured (optional: add logging service)
- [ ] Monitoring configured (optional: add monitoring service)

### Post-Deployment

- [ ] Smoke tests passed
- [ ] WebSocket connections working
- [ ] SMS/WhatsApp integration tested
- [ ] Payment processing tested
- [ ] Admin dashboard accessible
- [ ] Customer-facing features working

---

## Quick Reference: Commands

```bash
# Start development
docker-compose up -d
cd backend && npm run dev
cd frontend && npm run dev

# Run migrations
cd backend && npx prisma migrate dev

# Generate Prisma client
cd backend && npx prisma generate

# Seed database
cd backend && npx prisma db seed

# Run tests
cd backend && npm test
cd frontend && npm test

# Build for production
docker-compose -f docker-compose.prod.yml build

# Deploy
docker-compose -f docker-compose.prod.yml up -d
```

---

*Document Version: 1.0*
*Last Updated: December 2024*
*Reference: ENGAGEMENT_FEATURES_DESIGN.md*
