# FarmBox Tunisia: Customer Engagement Features Design Document

## Executive Summary

This document outlines the technical design and implementation strategy for integrating five critical customer engagement features into the FarmBox organic produce marketplace. These features are adapted specifically for the Tunisian market, considering local consumer behavior, cultural values, and operational realities.

**Target Platform:** FarmBox - Tunisian Organic Produce Marketplace with Box-Based Subscription Model

**Core Philosophy:** Connect urban Tunisian consumers with rural Mediterranean farmers through flexible subscriptions, reliable delivery, sustainable practices, transparent sourcing, and guaranteed quality.

---

## Table of Contents

1. [Feature Overview](#feature-overview)
2. [Database Schema Extensions](#database-schema-extensions)
3. [Feature #1: Flexibility & Subscription Management](#feature-1-flexibility--subscription-management)
4. [Feature #2: Delivery Speed & Convenience](#feature-2-delivery-speed--convenience)
5. [Feature #3: Sustainability & Mission-Driven Branding](#feature-3-sustainability--mission-driven-branding)
6. [Feature #4: Direct Sourcing & Local Farms](#feature-4-direct-sourcing--local-farms)
7. [Feature #5: Quality Guarantee & Satisfaction](#feature-5-quality-guarantee--satisfaction)
8. [API Specifications](#api-specifications)
9. [Frontend Components](#frontend-components)
10. [Integration & Rollout Plan](#integration--rollout-plan)
11. [Success Metrics](#success-metrics)

---

## Feature Overview

| Feature | Priority | Adoption Rate | Implementation Phase |
|---------|----------|---------------|---------------------|
| Flexibility & Subscription Management | P0 | 90% | Phase 1 (Month 1-3) |
| Quality Guarantee & Satisfaction | P0 | 65% | Phase 1 (Month 1-3) |
| Delivery Speed & Convenience | P1 | 80% | Phase 2 (Month 4-6) |
| Direct Sourcing & Local Farms | P1 | 75% | Phase 2 (Month 4-6) |
| Sustainability & Mission-Driven Branding | P2 | 75% | Phase 3 (Month 7-12) |

---

## Database Schema Extensions

### New Prisma Models

```prisma
// ============================================
// SUBSCRIPTION MANAGEMENT EXTENSIONS
// ============================================

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
  skipDate        DateTime     // The delivery date being skipped
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
  discountPercent Int          @default(25) // 25% off first box
  convertedToSub  Boolean      @default(false)
  createdAt       DateTime     @default(now())
  expiresAt       DateTime     // Trial offer expires after 7 days

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

// ============================================
// DELIVERY & LOGISTICS
// ============================================

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
  sequence        Int          // Order in the route
  estimatedTime   DateTime?
  actualTime      DateTime?
  status          StopStatus   @default(PENDING)
  notes           String?
  photoProof      String?      // Cloudinary URL
  signature       String?      // Base64 signature data

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
  partnerName     String       // Local business partner
  partnerPhone    String
  operatingHours  Json         // { "monday": "8:00-20:00", ... }
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
  location        Json?        // { lat, lng }
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

// ============================================
// SUSTAINABILITY & IMPACT TRACKING
// ============================================

model ImpactMetrics {
  id              String       @id @default(uuid())
  orderId         String       @unique
  order           Order        @relation(fields: [orderId], references: [id])
  foodSavedKg     Float        @default(0)    // Rescued produce weight
  co2SavedKg      Float        @default(0)    // Carbon footprint reduction
  kmFromFarm      Float        @default(0)    // Farm-to-table distance
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

enum RescueReason {
  COSMETIC_IMPERFECTION  // "Ugly" produce
  SURPLUS                // Overproduction
  NEAR_EXPIRY           // Short shelf life
  SIZE_VARIATION        // Non-standard sizes
}

model PackagingReturn {
  id              String       @id @default(uuid())
  customerId      String
  customer        User         @relation(fields: [customerId], references: [id])
  itemsReturned   Int
  creditAwarded   Float        // TND credit for next order
  returnedAt      DateTime     @default(now())

  @@index([customerId])
}

// ============================================
// FARM SOURCING & TRACEABILITY
// ============================================

model FarmProfile {
  id              String       @id @default(uuid())
  farmId          String       @unique
  farm            Farm         @relation(fields: [farmId], references: [id])
  story           String       @db.Text
  storyAr         String       @db.Text
  farmingMethods  String[]     // ["organic", "traditional", "permaculture"]
  certifications  String[]     // ["bio_tunisia", "ecocert"]
  foundedYear     Int?
  familyGeneration Int?        // e.g., "3rd generation farmer"
  farmSize        Float?       // Hectares
  specialties     String[]     // Regional specialties
  videoUrl        String?
  galleryImages   String[]     // Cloudinary URLs
  socialMedia     Json?        // { facebook, instagram }
  updatedAt       DateTime     @updatedAt
}

model ProductBatch {
  id              String       @id @default(uuid())
  productId       String
  product         Product      @relation(fields: [productId], references: [id])
  batchCode       String       @unique
  harvestDate     DateTime
  harvestLocation String?      // GPS or region name
  farmerId        String       // Specific farmer if farm has multiple
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
  heroImage       String       // Cloudinary URL
  products        String[]     // Featured product IDs
  startDate       DateTime
  endDate         DateTime
  isActive        Boolean      @default(true)
  createdAt       DateTime     @default(now())

  @@index([region])
  @@index([startDate, endDate])
}

enum TunisianRegion {
  CAP_BON         // Citrus, vegetables
  SAHEL           // Olive oil
  SOUTH           // Dates, desert produce
  NORTH           // Grains, dairy
  CENTRAL         // Tomatoes, peppers
  TUNIS_SUBURBS   // Mixed produce
}

enum QualityGrade {
  A_PLUS  // Premium
  A       // Standard
  B       // Rescued/cosmetic imperfections
}

// ============================================
// QUALITY GUARANTEE & FEEDBACK
// ============================================

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
  photoUrls       String[]     // Cloudinary URLs
  status          ReportStatus @default(PENDING)
  resolution      String?
  refundAmount    Float?
  creditAmount    Float?
  handledBy       String?      // Admin user ID
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
  referenceId     String?      // QualityReport ID or PackagingReturn ID
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
  overallRating   Int          // 1-5
  freshnessRating Int          // 1-5
  deliveryRating  Int          // 1-5
  packagingRating Int          // 1-5
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

// ============================================
// NOTIFICATIONS & COMMUNICATION
// ============================================

model Notification {
  id              String       @id @default(uuid())
  userId          String
  user            User         @relation(fields: [userId], references: [id])
  type            NotificationType
  title           String
  titleAr         String
  message         String
  messageAr       String
  data            Json?        // Additional context (orderId, farmId, etc.)
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

model WhatsAppMessage {
  id              String       @id @default(uuid())
  userId          String
  user            User         @relation(fields: [userId], references: [id])
  direction       MessageDirection
  messageType     WhatsAppMessageType
  content         String
  templateName    String?      // For outbound template messages
  status          MessageStatus @default(PENDING)
  externalId      String?      // WhatsApp message ID
  createdAt       DateTime     @default(now())

  @@index([userId])
  @@index([createdAt])
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

enum MessageDirection {
  INBOUND
  OUTBOUND
}

enum WhatsAppMessageType {
  TEMPLATE
  TEXT
  IMAGE
  DOCUMENT
}

enum MessageStatus {
  PENDING
  SENT
  DELIVERED
  READ
  FAILED
}

// ============================================
// LOYALTY & ENGAGEMENT
// ============================================

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
  rewardAmount    Float        @default(10) // TND
  createdAt       DateTime     @default(now())
  completedAt     DateTime?

  @@unique([referrerId, referredId])
  @@index([referrerId])
}

enum LoyaltyTier {
  BRONZE    // 0-500 TND spent
  SILVER    // 500-1500 TND spent
  GOLD      // 1500-3000 TND spent
  PLATINUM  // 3000+ TND spent
}

enum ReferralStatus {
  PENDING
  COMPLETED
  EXPIRED
}
```

### Schema Updates to Existing Models

```prisma
// Add to existing User model
model User {
  // ... existing fields ...

  // New relations
  subscriptionPauses    SubscriptionPause[]
  subscriptionSkips     SubscriptionSkip[]
  trialBoxes           TrialBox[]
  driverRoutes         DeliveryRoute[] @relation("DriverRoutes")
  customerImpact       CustomerImpact?
  packagingReturns     PackagingReturn[]
  qualityReports       QualityReport[]
  customerCredits      CustomerCredit[]
  deliverySurveys      DeliverySurvey[]
  notifications        Notification[]
  notificationPrefs    NotificationPreference?
  whatsappMessages     WhatsAppMessage[]
  customerLoyalty      CustomerLoyalty?
  referralsMade        Referral[] @relation("Referrer")
  referredBy           Referral[] @relation("Referred")

  // New fields
  whatsappNumber       String?
  preferredLanguage    String   @default("fr") // "fr" or "ar"
  lastActiveAt         DateTime?
}

// Add to existing Farm model
model Farm {
  // ... existing fields ...

  // New relations
  trialBoxes           TrialBox[]
  rescuedProduce       RescuedProduce[]
  farmProfile          FarmProfile?
  regionalCampaigns    RegionalCampaign[]

  // New fields
  region               TunisianRegion?
  sustainabilityScore  Int?     @default(0) // 0-100
  avgDeliveryRating    Float?
  totalFoodSavedKg     Float    @default(0)
}

// Add to existing Order model
model Order {
  // ... existing fields ...

  // New relations
  deliveryStop         DeliveryStop?
  pickupPoint          PickupPoint?  @relation(fields: [pickupPointId], references: [id])
  pickupPointId        String?
  deliveryTracking     DeliveryTracking[]
  impactMetrics        ImpactMetrics?
  qualityReports       QualityReport[]
  deliverySurvey       DeliverySurvey?
  trialBox             TrialBox?

  // New fields
  estimatedDeliveryTime DateTime?
  actualDeliveryTime    DateTime?
  deliveryInstructions  String?
  isRescueBox          Boolean  @default(false)
  creditsUsed          Float    @default(0)
}

// Add to existing Product model
model Product {
  // ... existing fields ...

  // New relations
  batches              ProductBatch[]
  qualityReports       QualityReport[]

  // New fields
  isRescued            Boolean  @default(false)
  rescueDiscount       Int?     // Percentage discount
  harvestRegion        TunisianRegion?
  traceabilityEnabled  Boolean  @default(false)
}

// Add to existing Subscription model
model Subscription {
  // ... existing fields ...

  // New relations
  pauses               SubscriptionPause[]
  skips                SubscriptionSkip[]

  // New fields
  pausesUsedThisYear   Int      @default(0)
  maxPausesPerYear     Int      @default(4)
  skipsThisMonth       Int      @default(0)
  maxSkipsPerMonth     Int      @default(2)
  autoRenew            Boolean  @default(true)
  reminderDaysBefore   Int      @default(2)
  trialConverted       Boolean  @default(false)
}
```

---

## Feature #1: Flexibility & Subscription Management

### Overview

Enable customers to have complete control over their subscription with zero friction. This is critical for the Tunisian market where subscription models are relatively new and trust needs to be built.

### User Stories

1. **As a customer**, I want to pause my subscription for up to 4 weeks per year without penalty
2. **As a customer**, I want to skip individual deliveries with a single click or SMS
3. **As a customer**, I want to cancel my subscription at any time with no fees
4. **As a customer**, I want to try a discounted trial box before committing to a subscription
5. **As a customer**, I want to manage my subscription via WhatsApp

### Technical Implementation

#### Backend API Endpoints

```
POST   /api/subscriptions                    # Create subscription
GET    /api/subscriptions/my                 # Get my subscriptions
GET    /api/subscriptions/:id                # Get subscription details
PATCH  /api/subscriptions/:id                # Update subscription preferences
DELETE /api/subscriptions/:id                # Cancel subscription

POST   /api/subscriptions/:id/pause          # Pause subscription
DELETE /api/subscriptions/:id/pause          # Resume subscription
POST   /api/subscriptions/:id/skip           # Skip next delivery
DELETE /api/subscriptions/:id/skip/:date     # Unskip a delivery

POST   /api/trial-boxes                      # Request trial box
GET    /api/trial-boxes/my                   # Get my trial boxes
POST   /api/trial-boxes/:id/convert          # Convert trial to subscription

POST   /api/subscriptions/sms-command        # Handle SMS commands (SKIP, PAUSE, etc.)
POST   /api/subscriptions/whatsapp-webhook   # WhatsApp webhook for commands
```

#### Subscription Controller Logic

```typescript
// subscription.controller.ts

interface PauseSubscriptionDto {
  startDate: string;      // ISO date
  endDate: string;        // ISO date (max 4 weeks from start)
  reason?: string;
}

interface SkipDeliveryDto {
  skipDate: string;       // ISO date of delivery to skip
  reason?: string;
}

interface CreateTrialBoxDto {
  farmId: string;
  boxSize: BoxSize;
  deliveryDate: string;
  deliveryWindow: string;
}

// Pause validation rules:
// - Maximum 4 pauses per calendar year
// - Each pause max 4 weeks
// - Cannot pause if already paused
// - Cannot pause past deliveries

// Skip validation rules:
// - Maximum 2 skips per month
// - Must skip at least 48 hours before delivery
// - Cannot skip same date twice
```

#### SMS Command Handler

```typescript
// sms.service.ts

const SMS_COMMANDS = {
  'SKIP': handleSkipCommand,      // "SKIP" -> Skip next delivery
  'PAUSE': handlePauseCommand,    // "PAUSE 2" -> Pause for 2 weeks
  'RESUME': handleResumeCommand,  // "RESUME" -> Resume subscription
  'STATUS': handleStatusCommand,  // "STATUS" -> Get subscription status
  'HELP': handleHelpCommand,      // "HELP" -> List commands
};

// Example: Customer texts "SKIP" to 12345
// System: "Your delivery for Wednesday Dec 11 has been skipped. Text UNSKIP to restore."
```

#### Frontend Pages

```
/subscriptions                    # Subscription management hub
/subscriptions/[id]               # Single subscription details
/subscriptions/[id]/manage        # Pause/skip/cancel controls
/trial                            # Trial box landing page
/trial/[farmSlug]                 # Farm-specific trial box
```

#### UI Components

```typescript
// SubscriptionCard.tsx
- Shows next delivery date
- Quick "Skip Next" button
- Pause/Resume toggle
- Cancel link

// SubscriptionCalendar.tsx
- Monthly view of upcoming deliveries
- Click to skip/unskip dates
- Shows paused periods

// TrialBoxCTA.tsx
- "Try Your First Box - 25% Off"
- Farm selection
- Box size picker
- One-click order

// FlexibilityBadge.tsx
- "Cancel Anytime"
- "No Commitments"
- "Pause When You Need"
```

### Tunisian-Specific Adaptations

1. **Cash on Delivery (COD)** for trial boxes to build trust
2. **WhatsApp Integration** as primary communication channel
3. **SMS Commands** for low-tech users
4. **Bilingual UI** (French/Arabic) with language toggle
5. **Ramadan Pause Feature** - Pre-configured pause option during Ramadan

---

## Feature #2: Delivery Speed & Convenience

### Overview

Implement a hybrid delivery model with in-house fleet for urban Tunis and partner networks for wider reach. Provide real-time tracking and flexible delivery options.

### User Stories

1. **As a customer**, I want to choose between home delivery and pickup points
2. **As a customer**, I want to track my delivery in real-time
3. **As a customer**, I want to receive notifications when delivery is nearby
4. **As a farmer**, I want to manage delivery routes efficiently
5. **As a driver**, I want optimized routes for my deliveries

### Technical Implementation

#### Backend API Endpoints

```
GET    /api/delivery/zones                   # Get delivery zones with schedules
GET    /api/delivery/pickup-points           # List pickup points by zone
GET    /api/delivery/pickup-points/:id       # Get pickup point details

GET    /api/orders/:id/tracking              # Get delivery tracking
POST   /api/orders/:id/tracking              # Add tracking event (driver app)

GET    /api/driver/routes                    # Get my routes (driver)
GET    /api/driver/routes/:id                # Get route details with stops
PATCH  /api/driver/stops/:id                 # Update stop status

POST   /api/farmer/routes                    # Create delivery route
GET    /api/farmer/routes                    # Get farm's routes
PATCH  /api/farmer/routes/:id                # Update route status
```

#### Delivery Zone Configuration

```typescript
// delivery.config.ts

const DELIVERY_ZONES = {
  ZONE_A: {
    name: 'Tunis Central',
    nameAr: 'تونس العاصمة',
    areas: ['La Marsa', 'Sidi Bou Said', 'Carthage', 'Les Berges du Lac'],
    baseFee: 5,           // TND
    freeThreshold: 80,    // TND - Free delivery above this
    deliveryDays: ['wednesday', 'saturday'],
    windows: ['08:00-12:00', '14:00-18:00', '18:00-21:00'],
    estimatedMinutes: 30,
  },
  ZONE_B: {
    name: 'Greater Tunis',
    nameAr: 'الضواحي',
    areas: ['Ariana', 'Ben Arous', 'Manouba', 'Ezzahra'],
    baseFee: 8,
    freeThreshold: 120,
    deliveryDays: ['thursday', 'sunday'],
    windows: ['09:00-13:00', '15:00-19:00'],
    estimatedMinutes: 45,
  },
  ZONE_C: {
    name: 'Extended Area',
    nameAr: 'المناطق الممتدة',
    areas: ['Sousse', 'Sfax', 'Nabeul', 'Hammamet'],
    baseFee: 15,
    freeThreshold: 200,
    deliveryDays: ['friday'],
    windows: ['10:00-18:00'],
    estimatedMinutes: 90,
    hasPickupOnly: true,  // Only pickup points, no home delivery
  },
};
```

#### Real-Time Tracking Service

```typescript
// tracking.service.ts

interface TrackingUpdate {
  orderId: string;
  status: TrackingStatus;
  location?: { lat: number; lng: number };
  estimatedArrival?: Date;
}

class TrackingService {
  // WebSocket for real-time updates
  async broadcastUpdate(update: TrackingUpdate): Promise<void>;

  // Calculate ETA based on remaining stops
  async calculateETA(routeId: string, stopId: string): Promise<Date>;

  // Send notification when driver is nearby (< 5 min)
  async notifyNearby(orderId: string): Promise<void>;
}
```

#### Pickup Point System

```typescript
// pickup-points.controller.ts

// Pickup points are local businesses (bakeries, small shops) that agree to
// receive deliveries for customers. Benefits:
// - Customer convenience (collect when available)
// - Reduced failed deliveries
// - Lower delivery costs
// - Community business support

interface PickupPoint {
  id: string;
  name: string;
  nameAr: string;
  address: string;
  partnerName: string;      // "Boulangerie Ben Ali"
  operatingHours: Record<string, string>;
  zone: DeliveryZone;
  coordinates: { lat: number; lng: number };
}
```

#### Frontend Components

```typescript
// DeliveryTracker.tsx
- Live map with driver location
- Progress steps (Packed → On Route → Nearby → Delivered)
- ETA countdown
- Driver contact button

// PickupPointSelector.tsx
- Map view of nearby pickup points
- List view with operating hours
- Distance from customer address

// DeliveryScheduleSelector.tsx
- Calendar with available dates
- Time window selection
- Zone-based availability

// DriverRouteView.tsx (Driver App)
- Turn-by-turn navigation
- Stop checklist
- Proof of delivery capture
- Customer contact
```

### Tunisian-Specific Adaptations

1. **Motorcycle Fleet** for congested areas (La Marsa, downtown Tunis)
2. **Local Neighborhood Hubs** - Partner with local "hanout" shops
3. **Prayer Time Consideration** - Avoid deliveries during Friday prayers
4. **Siesta Hours** - Respect 12:00-15:00 rest period in summer
5. **Cash Collection** - Drivers can collect cash payments

---

## Feature #3: Sustainability & Mission-Driven Branding

### Overview

Position FarmBox as the champion of Tunisian farmers and guardian of traditional values. Implement food waste reduction through rescued produce and track environmental impact.

### User Stories

1. **As a customer**, I want to see my environmental impact (food saved, CO2 reduced)
2. **As a customer**, I want to buy "rescued" produce at a discount
3. **As a customer**, I want to return packaging for credit
4. **As a farmer**, I want to list surplus produce that would otherwise be wasted
5. **As a customer**, I want to learn about the farmers I'm supporting

### Technical Implementation

#### Backend API Endpoints

```
GET    /api/impact/my                        # Get my impact metrics
GET    /api/impact/community                 # Get community-wide impact

GET    /api/rescued-produce                  # List available rescued produce
POST   /api/farmer/rescued-produce           # Farmer lists rescued produce
PATCH  /api/farmer/rescued-produce/:id       # Update rescued produce

POST   /api/packaging-returns                # Log packaging return
GET    /api/packaging-returns/my             # My return history

GET    /api/farms/:id/sustainability         # Farm's sustainability metrics
```

#### Impact Calculation Service

```typescript
// impact.service.ts

class ImpactService {
  // Calculate impact for an order
  async calculateOrderImpact(orderId: string): Promise<ImpactMetrics> {
    const order = await this.getOrderWithProducts(orderId);

    return {
      foodSavedKg: this.calculateFoodSaved(order),
      co2SavedKg: this.calculateCO2Saved(order),
      kmFromFarm: this.calculateFarmDistance(order),
      farmersSupported: order.items.length, // Unique farmers
    };
  }

  // Food saved calculation
  // - Rescued produce: 100% of weight counts
  // - Regular produce: 10% estimated waste prevention
  calculateFoodSaved(order: Order): number {
    let saved = 0;
    for (const item of order.items) {
      if (item.product.isRescued) {
        saved += item.quantity * item.product.weightKg;
      } else {
        saved += item.quantity * item.product.weightKg * 0.1;
      }
    }
    return saved;
  }

  // CO2 saved: Local sourcing vs. imported produce
  // Average: 0.5 kg CO2 per kg of local produce vs 2.5 kg for imported
  calculateCO2Saved(order: Order): number {
    const totalWeight = order.items.reduce(
      (sum, item) => sum + item.quantity * item.product.weightKg, 0
    );
    return totalWeight * 2.0; // 2 kg CO2 saved per kg of local produce
  }
}
```

#### Rescued Produce System

```typescript
// rescued-produce.controller.ts

interface CreateRescuedProduceDto {
  productName: string;
  productNameAr: string;
  weightKg: number;
  reason: RescueReason;
  discountPercent: number;  // Default 30%
  availableUntil: string;   // Must be within 48 hours
  photoUrl?: string;
}

// Rescued produce appears in a special "Save Food" section
// with clear messaging about why it's discounted
// "These tomatoes are perfectly delicious but too small for regular sale"
```

#### Packaging Return Program

```typescript
// packaging.controller.ts

// Customers return insulated bags and containers
// Drivers collect returns during delivery
// Customer receives 2 TND credit per item returned

interface LogPackagingReturnDto {
  itemsReturned: number;
  returnedToDriver: boolean;
  orderId?: string;  // If returned with a delivery
}

const PACKAGING_CREDIT_PER_ITEM = 2; // TND
```

#### Frontend Components

```typescript
// ImpactDashboard.tsx
- Total food saved (kg)
- CO2 reduced (kg)
- Farmers supported
- Comparison: "Equivalent to X trees planted"
- Progress toward goals

// RescuedProduceSection.tsx
- "Save Food, Save Money" header
- Countdown timer to expiry
- Reason badges ("Surplus", "Cosmetic", etc.)
- Discount percentage display

// PackagingReturnTracker.tsx
- Items returned count
- Credits earned
- "Return with next delivery" checkbox

// SustainabilityBadge.tsx (on Farm cards)
- Sustainability score (0-100)
- Key practices icons
- Food waste reduction stats
```

### Tunisian-Specific Adaptations

1. **"Ne Pas Gaspiller" Campaign** - Traditional value of not wasting food
2. **Farmer Hero Stories** - Feature individual farmer journeys
3. **Ramadan Food Drive** - Donate rescued produce during Ramadan
4. **School Partnership** - Sustainability education in schools
5. **Traditional Recipes** - Show how to use "ugly" produce in traditional dishes

---

## Feature #4: Direct Sourcing & Local Farms

### Overview

Build direct relationships with organic farms across Tunisia and create transparent supply chain traceability. Highlight regional specialties and seasonal produce.

### User Stories

1. **As a customer**, I want to scan a QR code to see where my produce came from
2. **As a customer**, I want to learn about the farmers who grow my food
3. **As a customer**, I want to buy regional specialties (Cap Bon citrus, Southern dates)
4. **As a farmer**, I want to tell my story to customers
5. **As a customer**, I want to know what's in season and why it matters

### Technical Implementation

#### Backend API Endpoints

```
GET    /api/farms/:id/profile                # Get detailed farm profile
PATCH  /api/farmer/profile                   # Update farm profile

GET    /api/products/:id/traceability        # Get product batch info
GET    /api/batches/:code                    # Lookup batch by QR code

GET    /api/regions                          # List Tunisian regions with specialties
GET    /api/regions/:region/products         # Products from a region
GET    /api/regions/:region/campaign         # Active regional campaign

GET    /api/seasonal                         # What's in season now
GET    /api/seasonal/:month                  # What's in season for a month
```

#### Farm Profile System

```typescript
// farm-profile.controller.ts

interface FarmProfileDto {
  story: string;
  storyAr: string;
  farmingMethods: string[];      // ['organic', 'traditional', 'permaculture']
  certifications: string[];      // ['bio_tunisia', 'ecocert']
  foundedYear?: number;
  familyGeneration?: number;     // "3rd generation farmer"
  farmSize?: number;             // Hectares
  specialties: string[];         // ['olive_oil', 'citrus', 'tomatoes']
  videoUrl?: string;             // YouTube/Vimeo intro video
  galleryImages: string[];
  socialMedia?: {
    facebook?: string;
    instagram?: string;
  };
}
```

#### Traceability Service

```typescript
// traceability.service.ts

interface BatchInfo {
  batchCode: string;
  product: {
    name: string;
    nameAr: string;
  };
  farm: {
    name: string;
    slug: string;
    region: string;
    logo: string;
  };
  harvest: {
    date: string;
    location: string;      // "Cap Bon, Nabeul"
    daysAgo: number;
  };
  quality: {
    grade: QualityGrade;
    inspection: string;
  };
  journey: {
    farmToWarehouse: string;   // "12 km"
    warehouseToCustomer: string;
  };
}

// QR Code format: https://farmbox.tn/trace/{batchCode}
```

#### Regional Campaign System

```typescript
// regional-campaigns.config.ts

const REGIONAL_CAMPAIGNS = {
  CAP_BON_CITRUS: {
    region: 'CAP_BON',
    name: 'Citrus from Cap Bon',
    nameAr: 'حمضيات الوطن القبلي',
    season: { start: 'december', end: 'february' },
    description: 'The finest oranges, lemons, and clementines...',
    heroImage: '/campaigns/cap-bon-citrus.jpg',
    featuredFarms: ['farm-id-1', 'farm-id-2'],
    featuredProducts: ['oranges', 'lemons', 'clementines'],
  },
  SAHEL_OLIVE_OIL: {
    region: 'SAHEL',
    name: 'Olive Oil from the Sahel',
    nameAr: 'زيت الزيتون الساحلي',
    season: { start: 'november', end: 'december' },
    // ...
  },
  SOUTHERN_DATES: {
    region: 'SOUTH',
    name: 'Dates from the South',
    nameAr: 'تمور الجنوب',
    season: { start: 'august', end: 'october' },
    // ...
  },
};
```

#### Seasonal Calendar Service

```typescript
// seasonal.service.ts

const SEASONAL_CALENDAR: Record<number, SeasonalProduce[]> = {
  1: [ // January
    { product: 'oranges', peak: true, region: 'CAP_BON' },
    { product: 'lemons', peak: true, region: 'CAP_BON' },
    { product: 'cauliflower', peak: false, region: 'NORTH' },
  ],
  // ... all 12 months
  8: [ // August
    { product: 'tomatoes', peak: true, region: 'CENTRAL' },
    { product: 'peppers', peak: true, region: 'CENTRAL' },
    { product: 'dates', peak: true, region: 'SOUTH' },
    { product: 'figs', peak: true, region: 'CAP_BON' },
  ],
};
```

#### Frontend Pages & Components

```typescript
// Pages
/farms/[slug]/story              # Full farm story page
/trace/[batchCode]               # Traceability page (QR destination)
/regions                         # Regional specialties overview
/regions/[region]                # Region detail with farms & products
/seasonal                        # What's in season now

// Components

// FarmStoryCard.tsx
- Farmer photo/video
- Story excerpt
- "Meet the Farmer" CTA
- Specialties badges

// TraceabilityView.tsx
- Product journey map
- Harvest date & location
- Farm info card
- Quality grade
- "X km from farm to your table"

// RegionalCampaignBanner.tsx
- Hero image from region
- "In Season Now" badge
- Featured products carousel
- Shop CTA

// SeasonalCalendar.tsx
- 12-month grid view
- Product availability by month
- Click to filter products

// ProductOriginBadge.tsx (on product cards)
- Region flag/icon
- "From Cap Bon"
- Distance from Tunis
```

### Tunisian-Specific Adaptations

1. **Regional Pride** - Highlight famous Tunisian agricultural regions
2. **Heritage Varieties** - Feature traditional Tunisian produce varieties
3. **Family Farm Stories** - Emphasize multi-generational farming
4. **Artisan Partnerships** - Feature olive oil, honey, harissa producers
5. **Farm Visit Program** - Organize customer visits to partner farms

---

## Feature #5: Quality Guarantee & Satisfaction

### Overview

Implement a "No Questions Asked" refund policy with easy photo-based reporting. Build trust through proactive quality communication and customer satisfaction tracking.

### User Stories

1. **As a customer**, I want to report quality issues with a simple photo via WhatsApp
2. **As a customer**, I want instant credit for quality problems
3. **As a customer**, I want to rate my delivery and produce quality
4. **As a farmer**, I want to know about quality issues to improve
5. **As an admin**, I want to track quality trends across farms

### Technical Implementation

#### Backend API Endpoints

```
POST   /api/quality-reports                  # Submit quality report
GET    /api/quality-reports/my               # My submitted reports
GET    /api/quality-reports/:id              # Report details

GET    /api/credits/my                       # My available credits
POST   /api/credits/use                      # Apply credits to order

POST   /api/surveys                          # Submit delivery survey
GET    /api/surveys/my                       # My survey history

GET    /api/farmer/quality-reports           # Reports about my farm
GET    /api/farmer/quality-stats             # Quality statistics

GET    /api/admin/quality-reports            # All reports (admin)
PATCH  /api/admin/quality-reports/:id        # Resolve report (admin)
GET    /api/admin/quality-dashboard          # Quality metrics dashboard
```

#### Quality Report System

```typescript
// quality-report.controller.ts

interface CreateQualityReportDto {
  orderId: string;
  productId?: string;           // Optional - can report general issues
  issueType: QualityIssue;
  description: string;
  photoUrls: string[];          // Cloudinary URLs
}

// Automatic credit rules:
// - DAMAGED: Full item value credit
// - NOT_FRESH: Full item value credit
// - WRONG_ITEM: Full item value credit + correct item sent
// - MISSING_ITEM: Full item value credit
// - QUANTITY_SHORT: Proportional credit
// - TASTE_QUALITY: 50% item value credit (subjective)

const AUTO_CREDIT_RULES: Record<QualityIssue, number> = {
  DAMAGED: 1.0,           // 100% of item value
  NOT_FRESH: 1.0,
  WRONG_ITEM: 1.0,
  MISSING_ITEM: 1.0,
  QUANTITY_SHORT: 0.5,    // Estimated 50%
  TASTE_QUALITY: 0.5,
  OTHER: 0,               // Manual review required
};
```

#### WhatsApp Quality Report Handler

```typescript
// whatsapp-quality.service.ts

// Customer sends photo to WhatsApp business number
// System auto-detects quality report intent
// Responds with order selection
// Creates report and issues credit automatically

const WHATSAPP_QUALITY_FLOW = {
  TRIGGER: ['problem', 'issue', 'damaged', 'not fresh', 'مشكلة', 'تالف'],

  RESPONSE_DETECT: `
    I see you have an issue with your order.
    Please reply with your order number (e.g., ORD-123456).
  `,

  RESPONSE_ORDER_FOUND: `
    Order {orderNumber} found. What's the issue?
    1. Damaged produce
    2. Not fresh
    3. Wrong item
    4. Missing item
    5. Other

    Reply with a number or describe the issue.
  `,

  RESPONSE_CREDIT_ISSUED: `
    Thank you for letting us know.
    We've added {amount} TND credit to your account.
    It will be applied to your next order automatically.

    We're sorry for the inconvenience and are working to improve.
  `,
};
```

#### Customer Credits System

```typescript
// credits.service.ts

class CreditsService {
  // Get available credits for a customer
  async getAvailableCredits(customerId: string): Promise<number> {
    const credits = await prisma.customerCredit.findMany({
      where: {
        customerId,
        usedAt: null,
        OR: [
          { expiresAt: null },
          { expiresAt: { gt: new Date() } },
        ],
      },
    });
    return credits.reduce((sum, c) => sum + c.amount, 0);
  }

  // Apply credits to an order
  async applyCredits(
    customerId: string,
    orderId: string,
    amount: number
  ): Promise<void>;

  // Award credit to customer
  async awardCredit(
    customerId: string,
    amount: number,
    reason: CreditReason,
    referenceId?: string,
    expiresInDays?: number
  ): Promise<CustomerCredit>;
}
```

#### Delivery Survey System

```typescript
// survey.service.ts

interface DeliverySurveyDto {
  orderId: string;
  overallRating: number;      // 1-5
  freshnessRating: number;    // 1-5
  deliveryRating: number;     // 1-5
  packagingRating: number;    // 1-5
  wouldRecommend: boolean;
  feedback?: string;
}

// Survey is sent 24 hours after delivery via:
// - Push notification
// - WhatsApp message
// - Email

// Incentive: 5 TND credit for completing survey
```

#### Frontend Components

```typescript
// QualityReportForm.tsx
- Order selector (recent orders)
- Issue type selection
- Photo upload (drag & drop or camera)
- Description text area
- Submit button
- Instant confirmation

// CreditBalance.tsx
- Available credits display
- Credit history
- Expiring soon warning
- "Use at checkout" info

// DeliverySurveyModal.tsx
- Star ratings for each category
- Emoji-based feedback (simpler)
- Optional text feedback
- Thank you animation

// QualityGuaranteeBadge.tsx
- "100% Satisfaction Guaranteed"
- "No Questions Asked Returns"
- Click for policy details

// FarmerQualityDashboard.tsx (Farmer view)
- Quality score over time
- Issue breakdown by type
- Customer feedback highlights
- Improvement suggestions
```

### Tunisian-Specific Adaptations

1. **WhatsApp-First Reporting** - Most customers prefer WhatsApp
2. **Phone Support Fallback** - Direct line for complex issues
3. **Arabic Language Support** - Full RTL interface for Arabic speakers
4. **Fast Resolution** - Credit issued within 1 hour during business hours
5. **Personal Follow-Up** - Phone call for recurring issues
6. **Empathetic Tone** - Customer service trained in local cultural norms

---

## API Specifications

### Authentication

All protected endpoints require JWT token in Authorization header:
```
Authorization: Bearer <token>
```

### Response Format

```typescript
// Success response
{
  success: true,
  data: { ... },
  meta?: {
    pagination?: { page, limit, total, totalPages }
  }
}

// Error response
{
  success: false,
  error: {
    code: string,
    message: string,
    messageAr: string,
    details?: any
  }
}
```

### Webhook Endpoints

```
POST /webhooks/whatsapp          # WhatsApp Business API
POST /webhooks/sms               # SMS provider (Tunisie Telecom)
POST /webhooks/payment           # Flouci payment callbacks
```

### WebSocket Events

```typescript
// Client -> Server
'subscribe:order'        // Subscribe to order updates
'subscribe:delivery'     // Subscribe to delivery tracking

// Server -> Client
'order:status'           // Order status changed
'delivery:location'      // Driver location update
'delivery:eta'           // ETA update
'notification'           // New notification
```

---

## Frontend Components

### Shared Component Library

```
/components
├── subscription/
│   ├── SubscriptionCard.tsx
│   ├── SubscriptionCalendar.tsx
│   ├── PauseModal.tsx
│   ├── SkipButton.tsx
│   └── TrialBoxCTA.tsx
├── delivery/
│   ├── DeliveryTracker.tsx
│   ├── DeliveryMap.tsx
│   ├── PickupPointSelector.tsx
│   ├── TimeWindowPicker.tsx
│   └── DriverContactCard.tsx
├── sustainability/
│   ├── ImpactDashboard.tsx
│   ├── ImpactCounter.tsx
│   ├── RescuedProduceCard.tsx
│   ├── PackagingReturnForm.tsx
│   └── SustainabilityBadge.tsx
├── sourcing/
│   ├── FarmStoryCard.tsx
│   ├── TraceabilityView.tsx
│   ├── RegionalBanner.tsx
│   ├── SeasonalIndicator.tsx
│   └── ProductOriginBadge.tsx
├── quality/
│   ├── QualityReportForm.tsx
│   ├── CreditBalance.tsx
│   ├── DeliverySurvey.tsx
│   ├── QualityGuaranteeBadge.tsx
│   └── FeedbackCard.tsx
└── common/
    ├── LanguageToggle.tsx
    ├── WhatsAppButton.tsx
    ├── SMSLink.tsx
    └── NotificationBell.tsx
```

### New Pages Structure

```
/app
├── subscriptions/
│   ├── page.tsx                 # My subscriptions list
│   ├── new/page.tsx             # Create subscription
│   └── [id]/
│       ├── page.tsx             # Subscription details
│       └── manage/page.tsx      # Pause/skip/cancel
├── trial/
│   ├── page.tsx                 # Trial box landing
│   └── [farmSlug]/page.tsx      # Farm-specific trial
├── tracking/
│   └── [orderId]/page.tsx       # Live delivery tracking
├── pickup-points/
│   └── page.tsx                 # Pickup points map
├── impact/
│   └── page.tsx                 # My sustainability impact
├── trace/
│   └── [batchCode]/page.tsx     # Product traceability
├── regions/
│   ├── page.tsx                 # All regions
│   └── [region]/page.tsx        # Region detail
├── seasonal/
│   └── page.tsx                 # Seasonal calendar
├── quality/
│   └── report/page.tsx          # Submit quality report
└── credits/
    └── page.tsx                 # My credits & history
```

---

## Integration & Rollout Plan

### Phase 1: Foundation (Month 1-3)
**Focus: Flexibility & Quality Guarantee**

**Month 1:**
- Database schema extensions for subscriptions and quality
- Subscription management API endpoints
- Quality report API endpoints
- Basic subscription UI (pause/skip/cancel)

**Month 2:**
- WhatsApp integration for subscription commands
- SMS command handler
- Quality report form with photo upload
- Customer credits system

**Month 3:**
- Trial box feature
- Delivery survey system
- Admin quality dashboard
- Testing and refinement

### Phase 2: Operations (Month 4-6)
**Focus: Delivery & Sourcing**

**Month 4:**
- Delivery tracking API
- Real-time WebSocket implementation
- Pickup point system
- Driver mobile app (basic)

**Month 5:**
- Farm profile system
- Traceability (batch codes, QR)
- Regional campaign system
- Seasonal calendar

**Month 6:**
- Route optimization
- Delivery notifications
- Full traceability UI
- Testing and refinement

### Phase 3: Brand (Month 7-12)
**Focus: Sustainability & Mission**

**Month 7-8:**
- Impact tracking system
- Rescued produce feature
- Packaging return program

**Month 9-10:**
- Impact dashboard
- Community impact page
- Marketing materials integration

**Month 11-12:**
- Loyalty program
- Referral system
- Full system integration
- Performance optimization

---

## Success Metrics

### Feature #1: Flexibility & Subscription Management
| Metric | Target | Measurement |
|--------|--------|-------------|
| Monthly subscription retention | >95% | Subscriptions retained / Total active |
| Monthly churn rate | <5% | Cancellations / Total active |
| Trial-to-subscription conversion | >40% | Conversions / Trial boxes ordered |
| Pause utilization | <20% | Active pauses / Total subscriptions |
| SMS/WhatsApp command usage | >30% | Commands received / Total subscribers |

### Feature #2: Delivery Speed & Convenience
| Metric | Target | Measurement |
|--------|--------|-------------|
| On-time delivery rate | >98% | On-time / Total deliveries |
| Delivery satisfaction rating | >4.5/5 | Average delivery rating |
| Failed delivery rate | <2% | Failed / Total deliveries |
| Pickup point adoption | >15% | Pickup orders / Total orders |
| Tracking engagement | >70% | Tracking views / Orders with tracking |

### Feature #3: Sustainability & Mission
| Metric | Target | Measurement |
|--------|--------|-------------|
| Customer mission awareness | >80% | Survey: "Can articulate mission" |
| Rescued produce sales | >10% | Rescued items / Total items sold |
| Packaging return rate | >40% | Returns / Returnable items sent |
| Repeat rate (mission-aware) | >90% | Repeat orders from aware customers |
| Impact dashboard visits | >50% | Unique visitors / Active customers |

### Feature #4: Direct Sourcing & Local Farms
| Metric | Target | Measurement |
|--------|--------|-------------|
| Traceability scans | >30% | QR scans / Products with QR |
| Farm profile views | >50% | Profile views / Farm page visits |
| Regional campaign conversion | >25% | Campaign orders / Campaign views |
| Seasonal content engagement | >40% | Seasonal page visits / Total users |
| Average sourcing distance | <50km | Weighted average farm-to-customer |

### Feature #5: Quality Guarantee & Satisfaction
| Metric | Target | Measurement |
|--------|--------|-------------|
| Product satisfaction rate | >95% | Positive ratings / Total ratings |
| Quality report rate | <2% | Reports / Total orders |
| Report resolution time | <4 hours | Average time to credit/resolve |
| Survey completion rate | >30% | Surveys completed / Surveys sent |
| Customer service satisfaction | >4.5/5 | Average CSAT score |

---

## Technical Considerations

### Infrastructure Requirements

1. **WhatsApp Business API** - Meta Business verification required
2. **SMS Gateway** - Tunisie Telecom or third-party provider
3. **WebSocket Server** - Socket.io with Redis adapter for scaling
4. **Background Jobs** - Bull queue for notifications, reports
5. **Image Storage** - Cloudinary (already integrated)
6. **Maps Integration** - Google Maps or OpenStreetMap for tracking

### Security Considerations

1. **PII Protection** - Customer phone numbers, addresses encrypted at rest
2. **Payment Data** - Never store card details, use Flouci tokenization
3. **Driver Location** - Only share during active deliveries
4. **Quality Photos** - Auto-delete after 30 days
5. **Rate Limiting** - Prevent SMS/notification abuse

### Performance Targets

1. **API Response Time** - <200ms for 95th percentile
2. **WebSocket Latency** - <100ms for tracking updates
3. **Image Upload** - <3s for quality report photos
4. **SMS Delivery** - <10s from trigger to delivery
5. **Page Load** - <2s for all pages on 3G

---

## Appendix: Tunisian Market Data

### Delivery Zones Coverage

| Zone | Population | Target Customers | Delivery Cost |
|------|------------|------------------|---------------|
| Zone A (Tunis Central) | 1.2M | 50,000 | 5 TND |
| Zone B (Greater Tunis) | 2.8M | 100,000 | 8 TND |
| Zone C (Regional) | 3M | 50,000 | 15 TND |

### Seasonal Produce Calendar (Tunisia)

| Month | Peak Produce | Region |
|-------|--------------|--------|
| Jan-Feb | Citrus (oranges, lemons) | Cap Bon |
| Mar-Apr | Artichokes, Fava beans | North |
| May-Jun | Strawberries, Apricots | Cap Bon |
| Jul-Aug | Tomatoes, Peppers, Figs | Central |
| Sep-Oct | Grapes, Dates | South |
| Nov-Dec | Olives (oil), Pomegranates | Sahel |

### Payment Methods (Tunisian Preferences)

| Method | Preference | Implementation |
|--------|------------|----------------|
| Cash on Delivery | 60% | Driver collection |
| Flouci | 25% | API integration |
| Bank Card | 10% | Flouci gateway |
| Mobile Money | 5% | Tunisie Telecom D17 |

---

*Document Version: 1.0*
*Last Updated: December 2024*
*Author: FarmBox Development Team*
