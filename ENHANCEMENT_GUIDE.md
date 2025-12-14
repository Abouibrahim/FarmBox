# FarmBox Enhancement Guide

A step-by-step implementation guide for transforming FarmBox into a product-oriented marketplace with customer engagement features.

---

## Table of Contents

1. [Prerequisites](#prerequisites)
2. [Phase 0: Product-First Foundation](#phase-0-product-first-foundation)
3. [Phase 1: Foundation (Flexibility & Quality)](#phase-1-foundation)
4. [Phase 2: Operations (Delivery & Sourcing)](#phase-2-operations)
5. [Phase 3: Brand (Sustainability & Mission)](#phase-3-brand)
6. [Testing Checklist](#testing-checklist)
7. [Deployment Notes](#deployment-notes)

---

## Prerequisites

Before starting, ensure you have:

- [ ] PostgreSQL database running
- [ ] Backend and frontend development environments set up
- [ ] Cloudinary account configured for image uploads
- [ ] WhatsApp Business API access (for Phase 1)
- [ ] SMS gateway credentials (Tunisie Telecom or equivalent)

---

## Phase 0: Product-First Foundation

**Goal:** Transform from farm-first to product-first shopping experience with unified orders and category-based subscriptions.

### Overview

This phase restructures the shopping experience to prioritize products over farms:
- **Before**: Home → Farms → Farm Detail → Products → Cart (per farm)
- **After**: Home → Products/Categories → Product Detail → Unified Cart → Single Order

### Step 0.1: Database Schema - Unified Orders

**File:** `backend/prisma/schema.prisma`

1. Add `CustomerOrder` model for unified customer-facing orders:
   ```prisma
   model CustomerOrder {
     id              String       @id @default(cuid())
     orderNumber     String       @unique
     customerId      String
     customer        User         @relation(fields: [customerId], references: [id])

     deliveryType    DeliveryType
     deliveryDate    DateTime
     deliveryWindow  String?
     deliveryAddress String?
     deliveryZone    DeliveryZone?

     subtotal        Decimal      @db.Decimal(10, 3)
     deliveryFee     Decimal      @db.Decimal(10, 3)
     creditsUsed     Decimal      @default(0) @db.Decimal(10, 3)
     total           Decimal      @db.Decimal(10, 3)

     paymentMethod   String       @default("cash")
     isPaid          Boolean      @default(false)
     status          OrderStatus  @default(PENDING)
     customerNotes   String?      @db.Text

     createdAt       DateTime     @default(now())
     updatedAt       DateTime     @updatedAt

     subOrders       Order[]      @relation("CustomerOrderSubOrders")

     @@index([customerId])
     @@index([status])
   }
   ```

2. Update existing `Order` model to support sub-orders:
   ```prisma
   // Add to Order model:
   customerOrderId String?
   customerOrder   CustomerOrder? @relation("CustomerOrderSubOrders", fields: [customerOrderId], references: [id])

   @@index([customerOrderId])
   ```

3. Add `ProductPopularity` for trending products:
   ```prisma
   model ProductPopularity {
     id            String   @id @default(cuid())
     productId     String   @unique
     product       Product  @relation(fields: [productId], references: [id], onDelete: Cascade)
     viewCount     Int      @default(0)
     orderCount    Int      @default(0)
     cartAddCount  Int      @default(0)
     score         Float    @default(0)
     updatedAt     DateTime @updatedAt

     @@index([score])
   }
   ```

4. Add `FeaturedProduct` for homepage curation:
   ```prisma
   model FeaturedProduct {
     id            String    @id @default(cuid())
     productId     String
     product       Product   @relation(fields: [productId], references: [id], onDelete: Cascade)
     position      Int       @default(0)
     featuredUntil DateTime?
     isActive      Boolean   @default(true)
     createdAt     DateTime  @default(now())

     @@index([isActive, position])
   }
   ```

5. Update `Product` model with relations:
   ```prisma
   // Add to Product model:
   popularity      ProductPopularity?
   featuredIn      FeaturedProduct[]
   ```

6. Update `User` model with relation:
   ```prisma
   // Add to User model:
   customerOrders  CustomerOrder[]
   ```

7. Run migration:
   ```bash
   cd backend
   npx prisma migrate dev --name add_product_first_foundation
   ```

### Step 0.2: Database Schema - Category Subscriptions

**File:** `backend/prisma/schema.prisma`

1. Add `CategorySubscription` model:
   ```prisma
   model CategorySubscription {
     id                  String              @id @default(cuid())
     customerId          String
     customer            User                @relation(fields: [customerId], references: [id])

     category            String              // vegetables, fruits, herbs, etc.
     boxSize             BoxSize
     frequency           SubscriptionFrequency
     deliveryDay         Int                 // 0-6 (Sunday-Saturday)

     deliveryAddress     String
     deliveryZone        DeliveryZone
     preferences         Json?               // { excludeItems: [], preferredFarms: [], notes: "" }
     maxFarmsPerBox      Int                 @default(3)

     status              SubscriptionStatus  @default(ACTIVE)
     startDate           DateTime
     nextDelivery        DateTime?
     pausedUntil         DateTime?

     pausesUsedThisYear  Int      @default(0)
     maxPausesPerYear    Int      @default(4)
     skipsThisMonth      Int      @default(0)
     maxSkipsPerMonth    Int      @default(2)
     autoRenew           Boolean  @default(true)

     createdAt           DateTime @default(now())
     updatedAt           DateTime @updatedAt

     pauses              CategorySubscriptionPause[]
     skips               CategorySubscriptionSkip[]

     @@index([customerId])
     @@index([category])
     @@index([status])
   }
   ```

2. Add `CategorySubscriptionPause` model:
   ```prisma
   model CategorySubscriptionPause {
     id              String               @id @default(cuid())
     subscriptionId  String
     subscription    CategorySubscription @relation(fields: [subscriptionId], references: [id], onDelete: Cascade)
     startDate       DateTime
     endDate         DateTime
     reason          String?
     createdAt       DateTime             @default(now())

     @@index([subscriptionId])
   }
   ```

3. Add `CategorySubscriptionSkip` model:
   ```prisma
   model CategorySubscriptionSkip {
     id              String               @id @default(cuid())
     subscriptionId  String
     subscription    CategorySubscription @relation(fields: [subscriptionId], references: [id], onDelete: Cascade)
     skipDate        DateTime
     reason          String?
     createdAt       DateTime             @default(now())

     @@unique([subscriptionId, skipDate])
     @@index([subscriptionId])
   }
   ```

4. Update `User` model:
   ```prisma
   // Add to User model:
   categorySubscriptions CategorySubscription[]
   ```

5. Run migration:
   ```bash
   npx prisma migrate dev --name add_category_subscriptions
   ```

### Step 0.3: Product Discovery API

**Create:** `backend/src/controllers/product-discovery.controller.ts`

Implement the following functions:

1. `getFeaturedProducts` - Homepage featured products
   - Query `FeaturedProduct` where `isActive=true` and `featuredUntil > now()`
   - Order by `position`
   - Include product with farm details

2. `getPopularProducts` - Best sellers
   - Query `ProductPopularity` ordered by `score DESC`
   - Score formula: `(orderCount * 0.5) + (cartAddCount * 0.3) + (viewCount * 0.2)`
   - Filter by category optionally

3. `getSeasonalProducts` - In-season products
   - Query products where `seasonStart <= currentMonth <= seasonEnd`
   - Include products with null season (year-round)

4. `searchProducts` - Enhanced search
   - Full-text search on `name`, `nameAr`, `description`
   - Filter by: category, priceMin, priceMax, farmId, isAvailable
   - Sort by: relevance, price_asc, price_desc, popularity

5. `getProductsByCategory` - Category listing
   - Filter by category slug
   - Include pagination (limit/offset)
   - Include farm info

6. `recordProductView` - Analytics tracking
   - Increment `viewCount` in `ProductPopularity`
   - Create record if not exists

**Create:** `backend/src/routes/product-discovery.routes.ts`

```typescript
import { Router } from 'express';
import * as controller from '../controllers/product-discovery.controller';

const router = Router();

router.get('/featured', controller.getFeaturedProducts);
router.get('/popular', controller.getPopularProducts);
router.get('/seasonal', controller.getSeasonalProducts);
router.get('/search', controller.searchProducts);
router.get('/category/:slug', controller.getProductsByCategory);
router.post('/:id/view', controller.recordProductView);

export default router;
```

**Update:** `backend/src/index.ts`

```typescript
import productDiscoveryRoutes from './routes/product-discovery.routes';
// Add before other product routes:
app.use('/api/products', productDiscoveryRoutes);
```

### Step 0.4: Unified Order API

**Update:** `backend/src/controllers/order.controller.ts`

Add the following functions:

1. `createUnifiedOrder` - Create multi-farm order
   ```typescript
   // Input:
   interface CreateUnifiedOrderDto {
     items: Array<{ productId: string; quantity: number }>;
     deliveryType: 'DELIVERY' | 'PICKUP';
     deliveryDate: string;
     deliveryWindow?: string;
     deliveryAddress?: string;
     deliveryZone?: string;
     customerNotes?: string;
   }

   // Logic:
   // 1. Validate all products exist and are available
   // 2. Group items by farmId
   // 3. Calculate subtotal from all items
   // 4. Calculate delivery fee ONCE (based on zone)
   // 5. Create CustomerOrder record
   // 6. For each farm group:
   //    - Create sub-Order linked to CustomerOrder
   //    - Create OrderItems
   // 7. Return CustomerOrder with all sub-orders
   ```

2. `getMyUnifiedOrders` - Customer order history
   - Query `CustomerOrder` for authenticated user
   - Include `subOrders` with items
   - Order by `createdAt DESC`

3. `getUnifiedOrderById` - Order detail
   - Query `CustomerOrder` by ID
   - Verify belongs to customer
   - Include all sub-orders, items, and farm details

**Update:** `backend/src/routes/order.routes.ts`

```typescript
// Add routes:
router.post('/unified', authenticate, controller.createUnifiedOrder);
router.get('/unified/my', authenticate, controller.getMyUnifiedOrders);
router.get('/unified/:id', authenticate, controller.getUnifiedOrderById);
```

### Step 0.5: Category Subscription API

**Create:** `backend/src/controllers/category-subscription.controller.ts`

1. `createCategorySubscription` - Subscribe to category
   - Validate category is valid
   - Check for existing active subscription to same category
   - Create `CategorySubscription` record
   - Calculate first delivery date

2. `getMyCategorySubscriptions` - List subscriptions
   - Query for authenticated user
   - Include active pauses/skips

3. `getCategorySubscriptionById` - Get details
   - Include pause/skip history
   - Include recent orders

4. `updateCategorySubscription` - Update preferences
   - Allow updating: boxSize, frequency, deliveryDay, preferences, deliveryAddress, deliveryZone

5. `cancelCategorySubscription` - Cancel
   - Set status to CANCELLED

6. `pauseCategorySubscription` - Pause
   - Validate pause limits (max 4/year, max 4 weeks duration)
   - Create `CategorySubscriptionPause`
   - Update subscription status

7. `resumeCategorySubscription` - Resume
   - End active pause
   - Set status to ACTIVE

8. `skipCategoryDelivery` - Skip
   - Validate skip limits (max 2/month, 48hr notice)
   - Create `CategorySubscriptionSkip`

9. `unskipCategoryDelivery` - Unskip
   - Remove skip record

10. `previewNextBox` - Preview box contents
    - Run box curation algorithm without creating order
    - Return selected products

**Box Curation Algorithm:**
```typescript
async function autoSelectProducts(subscription: CategorySubscription) {
  // 1. Get available products in category
  const products = await getAvailableProducts(subscription.category);

  // 2. Filter by preferences
  const filtered = products.filter(p =>
    !subscription.preferences?.excludeItems?.includes(p.id)
  );

  // 3. Prioritize preferred farms
  const sorted = sortByPreference(filtered, subscription.preferences?.preferredFarms);

  // 4. Select products to meet box value
  const boxValue = getBoxValue(subscription.boxSize); // SMALL=35, MEDIUM=55, LARGE=85, FAMILY=120
  const selected = selectProductsForValue(sorted, boxValue, subscription.maxFarmsPerBox);

  return selected;
}
```

**Create:** `backend/src/routes/category-subscription.routes.ts`

```typescript
import { Router } from 'express';
import { authenticate } from '../middleware/auth.middleware';
import * as controller from '../controllers/category-subscription.controller';

const router = Router();

router.post('/', authenticate, controller.createCategorySubscription);
router.get('/my', authenticate, controller.getMyCategorySubscriptions);
router.get('/:id', authenticate, controller.getCategorySubscriptionById);
router.patch('/:id', authenticate, controller.updateCategorySubscription);
router.delete('/:id', authenticate, controller.cancelCategorySubscription);
router.post('/:id/pause', authenticate, controller.pauseCategorySubscription);
router.delete('/:id/pause', authenticate, controller.resumeCategorySubscription);
router.post('/:id/skip', authenticate, controller.skipCategoryDelivery);
router.delete('/:id/skip/:date', authenticate, controller.unskipCategoryDelivery);
router.get('/:id/preview', authenticate, controller.previewNextBox);

export default router;
```

### Step 0.6: Frontend - Products Listing Page

**Create:** `frontend/src/app/products/page.tsx`

```typescript
// Features:
// - Product grid (4 cols desktop, 2 cols mobile)
// - Filters sidebar:
//   - Category tabs/buttons
//   - Price range slider
//   - Farm multi-select
//   - In-stock only toggle
// - Sort dropdown: Price (low/high), Popularity, Newest
// - Quick add-to-cart buttons on cards
// - Pagination or infinite scroll
// - Results count display
```

**Create:** `frontend/src/components/product/ProductGrid.tsx`
**Create:** `frontend/src/components/product/ProductFilters.tsx`
**Create:** `frontend/src/components/product/ProductSort.tsx`

### Step 0.7: Frontend - Product Detail Page

**Create:** `frontend/src/app/products/[id]/page.tsx`

```typescript
// Features:
// - Product images carousel
// - Name (French + Arabic if available)
// - Price with unit
// - Farm info card (clickable → /farms/[slug])
// - Description
// - Seasonal availability indicator
// - Quantity selector
// - Add to cart button
// - "Also from this farm" section (4 products)
// - "Similar products" section (4 products)
// - Breadcrumb: Home > Category > Product
```

**Create:** `frontend/src/components/product/ProductDetail.tsx`
**Create:** `frontend/src/components/product/ProductImageCarousel.tsx`
**Create:** `frontend/src/components/product/RelatedProducts.tsx`

### Step 0.8: Frontend - Category Pages

**Create:** `frontend/src/app/categories/page.tsx`

```typescript
// Features:
// - Grid of category cards with icons
// - Product count per category
// - Links to /categories/[slug]
```

**Create:** `frontend/src/app/categories/[slug]/page.tsx`

```typescript
// Features:
// - Category header with icon and description
// - Subscribe CTA: "S'abonner au panier légumes hebdomadaire"
// - Filtered product grid
// - All filters from /products page
```

**Create:** `frontend/src/components/category/CategoryCard.tsx`
**Create:** `frontend/src/components/category/CategoryHeader.tsx`

### Step 0.9: Frontend - Homepage Redesign

**Update:** `frontend/src/app/page.tsx`

Replace farm-focused layout with product-focused:

```typescript
// New sections (in order):
// 1. Hero with search bar
//    - "Des produits frais, directement des fermes"
//    - Search input (redirects to /products?search=)
//    - CTA: "Découvrir nos produits" → /products

// 2. Category quick links
//    - Horizontal scrollable row
//    - Category icons with names
//    - Links to /categories/[slug]

// 3. Featured products (4-8 items)
//    - "Produits à la une"
//    - ProductCard grid
//    - "Voir tous" link → /products

// 4. Seasonal products
//    - "Produits de saison"
//    - Badge showing current season
//    - ProductCard grid
//    - "Voir tous" link → /products?seasonal=true

// 5. Popular products
//    - "Populaires cette semaine"
//    - ProductCard grid

// 6. Category subscription CTA
//    - "Recevez votre panier chaque semaine"
//    - Category selection cards
//    - CTA: "Choisir mon abonnement" → /subscriptions/category

// 7. How it works (updated)
//    - Step 1: "Découvrez nos produits" (was: "Choisissez une ferme")
//    - Step 2: "Composez votre panier"
//    - Step 3: "Recevez vos produits"

// 8. Our farms (moved down)
//    - "Nos fermes partenaires"
//    - Smaller farm cards (3-4)
//    - "Voir toutes nos fermes" link
```

### Step 0.10: Frontend - Navigation Redesign

**Update:** `frontend/src/components/layout/Header.tsx`

```typescript
// New navigation structure:
const navigation = [
  {
    label: 'Produits',
    href: '/products',
    dropdown: [
      { label: 'Tous les produits', href: '/products' },
      { divider: true },
      { label: 'Légumes', href: '/categories/vegetables', icon: '🥬' },
      { label: 'Fruits', href: '/categories/fruits', icon: '🍎' },
      { label: 'Herbes', href: '/categories/herbs', icon: '🌿' },
      { label: 'Oeufs', href: '/categories/eggs', icon: '🥚' },
      { label: 'Miel', href: '/categories/honey', icon: '🍯' },
      { label: 'Huile d\'olive', href: '/categories/olive-oil', icon: '🫒' },
      { label: 'Produits laitiers', href: '/categories/dairy', icon: '🧀' },
      { label: 'Autres', href: '/categories/other', icon: '📦' },
    ],
  },
  { label: 'Abonnements', href: '/subscriptions' },
  { label: 'Nos Fermes', href: '/farms' },
  { label: 'Comment ça marche', href: '/#how-it-works' },
];

// Add search bar in header (desktop)
// - Expands on focus
// - Autocomplete suggestions (future)
// - Enter redirects to /products?search=query
```

**Create:** `frontend/src/components/layout/SearchBar.tsx`
**Create:** `frontend/src/components/layout/CategoryDropdown.tsx`

### Step 0.11: Frontend - Cart Redesign

**Update:** `frontend/src/app/cart/page.tsx`

```typescript
// Changes:
// 1. Remove farm grouping - single unified list
// 2. Show farm as subtle badge on each item
// 3. Remove "multiple farms" warning banner
// 4. Single subtotal and total
// 5. Single delivery fee display
// 6. Add "You might also like" section
```

**Update:** `frontend/src/store/cart.ts`

```typescript
// Keep existing cart structure (farmId stored per item)
// Remove/update display-related helper methods:
// - Remove: getFarmIds() - not needed for display
// - Remove: getItemsByFarm() - not needed for display
// - Keep: farmId on items for backend processing
```

### Step 0.12: Frontend - Checkout Redesign

**Update:** `frontend/src/app/checkout/page.tsx`

```typescript
// Changes:
// 1. Single order creation
//    - Call POST /api/orders/unified instead of looping per farm
//    - Send all cart items in single request

// 2. Single delivery fee
//    - Calculate once based on zone
//    - Not multiplied by number of farms

// 3. Order summary
//    - List all items (no farm grouping)
//    - Show farm name as small text under product

// 4. Success state
//    - Single order number
//    - "Votre commande #ORD-XXXXX a été confirmée"
//    - List all items in confirmation
```

### Step 0.13: Frontend - API Client Updates

**Update:** `frontend/src/lib/api.ts`

```typescript
// Add new API functions:

export const productDiscoveryApi = {
  getFeatured: (params?: { limit?: number }) =>
    api.get('/products/featured', { params }),
  getPopular: (params?: { category?: string; limit?: number }) =>
    api.get('/products/popular', { params }),
  getSeasonal: (params?: { category?: string; limit?: number }) =>
    api.get('/products/seasonal', { params }),
  search: (params: {
    q: string;
    category?: string;
    priceMin?: number;
    priceMax?: number;
    farmId?: string;
    sort?: string;
    limit?: number;
    offset?: number;
  }) => api.get('/products/search', { params }),
  getByCategory: (slug: string, params?: { limit?: number; offset?: number; sort?: string }) =>
    api.get(`/products/category/${slug}`, { params }),
  recordView: (id: string) =>
    api.post(`/products/${id}/view`),
};

export const unifiedOrdersApi = {
  create: (data: {
    items: Array<{ productId: string; quantity: number }>;
    deliveryType: string;
    deliveryDate: string;
    deliveryWindow?: string;
    deliveryAddress?: string;
    deliveryZone?: string;
    customerNotes?: string;
  }) => api.post('/orders/unified', data),
  getMyOrders: (params?: { status?: string; limit?: number; offset?: number }) =>
    api.get('/orders/unified/my', { params }),
  getById: (id: string) =>
    api.get(`/orders/unified/${id}`),
};

export const categorySubscriptionsApi = {
  create: (data: {
    category: string;
    boxSize: string;
    frequency: string;
    deliveryDay: number;
    deliveryAddress: string;
    deliveryZone: string;
    preferences?: { excludeItems?: string[]; preferredFarms?: string[]; notes?: string };
  }) => api.post('/category-subscriptions', data),
  getMy: () =>
    api.get('/category-subscriptions/my'),
  getById: (id: string) =>
    api.get(`/category-subscriptions/${id}`),
  update: (id: string, data: Partial<{
    boxSize: string;
    frequency: string;
    deliveryDay: number;
    deliveryAddress: string;
    deliveryZone: string;
    preferences: object;
  }>) => api.patch(`/category-subscriptions/${id}`, data),
  cancel: (id: string) =>
    api.delete(`/category-subscriptions/${id}`),
  pause: (id: string, data: { weeks: number; reason?: string }) =>
    api.post(`/category-subscriptions/${id}/pause`, data),
  resume: (id: string) =>
    api.delete(`/category-subscriptions/${id}/pause`),
  skip: (id: string, data: { skipDate: string; reason?: string }) =>
    api.post(`/category-subscriptions/${id}/skip`, data),
  unskip: (id: string, date: string) =>
    api.delete(`/category-subscriptions/${id}/skip/${date}`),
  previewNextBox: (id: string) =>
    api.get(`/category-subscriptions/${id}/preview`),
};
```

### Step 0.14: Frontend - Category Subscription UI

**Create:** `frontend/src/app/subscriptions/category/page.tsx`

```typescript
// Features:
// - Explanation of category subscriptions
// - Category selection grid (with icons)
// - Box size selector (SMALL, MEDIUM, LARGE, FAMILY with prices)
// - Frequency selector (WEEKLY, BIWEEKLY)
// - Delivery day picker
// - Address form
// - "Aperçu de votre panier" preview section
// - Submit button
```

**Create:** `frontend/src/app/subscriptions/category/[id]/page.tsx`

```typescript
// Features:
// - Current subscription details
// - Next delivery preview (products that will be selected)
// - Preferences editor:
//   - Exclude products/items
//   - Preferred farms
// - Pause/skip controls
// - Cancel option
// - Order history for this subscription
```

**Create:** `frontend/src/components/subscription/CategorySubscriptionCard.tsx`
**Create:** `frontend/src/components/subscription/BoxPreview.tsx`
**Create:** `frontend/src/components/subscription/PreferencesEditor.tsx`

### Step 0.15: Run Migrations and Test

```bash
# 1. Run all migrations
cd backend
npx prisma migrate dev

# 2. Seed initial data
npm run db:seed

# 3. Bootstrap ProductPopularity
# Create a seed script to initialize popularity from existing order data

# 4. Start services
docker-compose up -d

# 5. Test endpoints
curl http://localhost:3001/api/products/featured
curl http://localhost:3001/api/products/popular
curl http://localhost:3001/api/products/seasonal
curl "http://localhost:3001/api/products/search?q=tomate"
curl http://localhost:3001/api/products/category/vegetables
```

---

## Phase 1: Foundation

**Goal:** Implement subscription flexibility and quality guarantee features.

### Step 1.1: Database Schema - Subscription Extensions

**File:** `backend/prisma/schema.prisma`

1. Add the `SubscriptionPause` model:
   ```prisma
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
   ```

2. Add the `SubscriptionSkip` model:
   ```prisma
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
   ```

3. Add the `TrialBox` model and `TrialStatus` enum:
   ```prisma
   enum TrialStatus {
     PENDING
     ORDERED
     DELIVERED
     CONVERTED
     EXPIRED
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
   ```

4. Update the `Subscription` model with new fields:
   ```prisma
   // Add to existing Subscription model
   pauses               SubscriptionPause[]
   skips                SubscriptionSkip[]
   pausesUsedThisYear   Int      @default(0)
   maxPausesPerYear     Int      @default(4)
   skipsThisMonth       Int      @default(0)
   maxSkipsPerMonth     Int      @default(2)
   autoRenew            Boolean  @default(true)
   reminderDaysBefore   Int      @default(2)
   trialConverted       Boolean  @default(false)
   ```

5. Run migration:
   ```bash
   cd backend
   npx prisma migrate dev --name add_subscription_flexibility
   ```

### Step 1.2: Database Schema - Quality System

**File:** `backend/prisma/schema.prisma`

1. Add quality-related enums:
   ```prisma
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

2. Add `QualityReport` model:
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
   ```

3. Add `CustomerCredit` model:
   ```prisma
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
   ```

4. Add `DeliverySurvey` model:
   ```prisma
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
   ```

5. Run migration:
   ```bash
   npx prisma migrate dev --name add_quality_system
   ```

### Step 1.3: Subscription Management API

**Create:** `backend/src/controllers/subscription.controller.ts`

1. Implement pause subscription endpoint:
   - Validate pause limits (max 4 per year)
   - Validate date range (max 4 weeks)
   - Check for overlapping pauses
   - Create `SubscriptionPause` record
   - Update subscription status

2. Implement skip delivery endpoint:
   - Validate skip limits (max 2 per month)
   - Validate 48-hour minimum notice
   - Check for duplicate skips
   - Create `SubscriptionSkip` record

3. Implement resume subscription endpoint:
   - Find active pause
   - Update pause end date to now
   - Restore subscription status

**Create:** `backend/src/routes/subscription.routes.ts`

```typescript
// Routes to implement:
POST   /api/subscriptions/:id/pause
DELETE /api/subscriptions/:id/pause
POST   /api/subscriptions/:id/skip
DELETE /api/subscriptions/:id/skip/:date
GET    /api/subscriptions/:id/calendar
```

### Step 1.4: Trial Box API

**Create:** `backend/src/controllers/trial-box.controller.ts`

1. Implement create trial box:
   - Check customer eligibility (one trial per farm)
   - Apply 25% discount
   - Set expiration (7 days)
   - Create `TrialBox` record

2. Implement convert to subscription:
   - Validate trial was delivered
   - Create new subscription
   - Mark trial as converted

**Create:** `backend/src/routes/trial-box.routes.ts`

```typescript
// Routes to implement:
POST   /api/trial-boxes
GET    /api/trial-boxes/my
POST   /api/trial-boxes/:id/convert
```

### Step 1.5: Quality Report API

**Create:** `backend/src/controllers/quality.controller.ts`

1. Implement create quality report:
   - Validate order belongs to customer
   - Upload photos to Cloudinary
   - Create `QualityReport` record
   - Auto-calculate credit based on issue type
   - Create `CustomerCredit` record

2. Implement credit system:
   - Get available credits (not used, not expired)
   - Apply credits to order
   - Mark credits as used

**Create:** `backend/src/routes/quality.routes.ts`

```typescript
// Routes to implement:
POST   /api/quality-reports
GET    /api/quality-reports/my
GET    /api/quality-reports/:id
GET    /api/credits/my
POST   /api/credits/use
```

### Step 1.6: Frontend - Subscription Management UI

**Create:** `frontend/src/app/subscriptions/page.tsx`
- List all user subscriptions
- Show next delivery date
- Quick action buttons (skip, pause)

**Create:** `frontend/src/app/subscriptions/[id]/manage/page.tsx`
- Pause subscription form (date picker)
- Skip delivery calendar
- Cancel subscription option

**Create:** `frontend/src/components/subscription/SubscriptionCard.tsx`
- Display subscription summary
- Status indicator
- Quick actions

**Create:** `frontend/src/components/subscription/SubscriptionCalendar.tsx`
- Monthly calendar view
- Clickable dates to skip/unskip
- Visual indicators for paused periods

### Step 1.7: Frontend - Trial Box UI

**Create:** `frontend/src/app/trial/page.tsx`
- Landing page for trial boxes
- Farm selection
- Box size picker
- CTA with 25% discount highlight

**Create:** `frontend/src/components/subscription/TrialBoxCTA.tsx`
- Promotional banner component
- "Try Your First Box" messaging

### Step 1.8: Frontend - Quality Report UI

**Create:** `frontend/src/app/quality/report/page.tsx`
- Order selector dropdown
- Issue type selection
- Photo upload with drag & drop
- Description text area
- Submit button with confirmation

**Create:** `frontend/src/app/credits/page.tsx`
- Available credits display
- Credit history list
- Expiration warnings

**Create:** `frontend/src/components/quality/QualityReportForm.tsx`
- Reusable report form component

**Create:** `frontend/src/components/quality/CreditBalance.tsx`
- Credit balance display component

### Step 1.9: SMS/WhatsApp Integration

**Create:** `backend/src/services/sms.service.ts`

1. Implement SMS command parser:
   - Parse incoming SMS messages
   - Handle commands: SKIP, PAUSE, RESUME, STATUS, HELP
   - Send response SMS

**Create:** `backend/src/services/whatsapp.service.ts`

1. Implement WhatsApp webhook handler:
   - Receive messages from WhatsApp Business API
   - Parse commands and photos
   - Handle quality report flow
   - Send response messages

**Create:** `backend/src/routes/webhook.routes.ts`

```typescript
// Routes to implement:
POST   /webhooks/sms
POST   /webhooks/whatsapp
```

---

## Phase 2: Operations

**Goal:** Implement delivery tracking and farm sourcing features.

### Step 2.1: Database Schema - Delivery System

**File:** `backend/prisma/schema.prisma`

1. Add delivery enums:
   ```prisma
   enum DeliveryZone {
     ZONE_A
     ZONE_B
     ZONE_C
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

2. Add delivery models:
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
   ```

3. Update `Order` model:
   ```prisma
   // Add to existing Order model
   deliveryStop         DeliveryStop?
   pickupPoint          PickupPoint?  @relation(fields: [pickupPointId], references: [id])
   pickupPointId        String?
   deliveryTracking     DeliveryTracking[]
   estimatedDeliveryTime DateTime?
   actualDeliveryTime    DateTime?
   deliveryInstructions  String?
   ```

4. Run migration:
   ```bash
   npx prisma migrate dev --name add_delivery_system
   ```

### Step 2.2: Database Schema - Farm Sourcing

**File:** `backend/prisma/schema.prisma`

1. Add sourcing enums:
   ```prisma
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

2. Add sourcing models:
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
   ```

3. Update `Farm` model:
   ```prisma
   // Add to existing Farm model
   farmProfile          FarmProfile?
   region               TunisianRegion?
   ```

4. Update `Product` model:
   ```prisma
   // Add to existing Product model
   batches              ProductBatch[]
   harvestRegion        TunisianRegion?
   traceabilityEnabled  Boolean  @default(false)
   ```

5. Run migration:
   ```bash
   npx prisma migrate dev --name add_sourcing_system
   ```

### Step 2.3: Delivery Tracking API

**Create:** `backend/src/controllers/delivery.controller.ts`

1. Implement get delivery zones
2. Implement list pickup points
3. Implement get order tracking
4. Implement add tracking event (for drivers)

**Create:** `backend/src/controllers/driver.controller.ts`

1. Implement get my routes
2. Implement get route details
3. Implement update stop status

**Create:** `backend/src/services/tracking.service.ts`

1. Implement ETA calculation
2. Implement "nearby" notification trigger
3. Implement WebSocket broadcast

**Create:** `backend/src/routes/delivery.routes.ts`

```typescript
// Routes to implement:
GET    /api/delivery/zones
GET    /api/delivery/pickup-points
GET    /api/delivery/pickup-points/:id
GET    /api/orders/:id/tracking
POST   /api/orders/:id/tracking
GET    /api/driver/routes
GET    /api/driver/routes/:id
PATCH  /api/driver/stops/:id
```

### Step 2.4: Real-Time Tracking WebSocket

**Create:** `backend/src/websocket/tracking.ws.ts`

1. Set up Socket.io server
2. Implement room management (per order)
3. Implement location broadcast
4. Implement ETA updates

**Update:** `backend/src/index.ts`
- Initialize WebSocket server alongside Express

### Step 2.5: Farm Sourcing API

**Create:** `backend/src/controllers/farm-profile.controller.ts`

1. Implement get farm profile
2. Implement update farm profile (farmer only)

**Create:** `backend/src/controllers/traceability.controller.ts`

1. Implement get product traceability
2. Implement batch lookup by code

**Create:** `backend/src/controllers/regional.controller.ts`

1. Implement list regions
2. Implement get region products
3. Implement get active campaigns

**Create:** `backend/src/services/seasonal.service.ts`

1. Implement seasonal calendar lookup
2. Implement "in season now" filter

**Create:** `backend/src/routes/sourcing.routes.ts`

```typescript
// Routes to implement:
GET    /api/farms/:id/profile
PATCH  /api/farmer/profile
GET    /api/products/:id/traceability
GET    /api/batches/:code
GET    /api/regions
GET    /api/regions/:region/products
GET    /api/regions/:region/campaign
GET    /api/seasonal
GET    /api/seasonal/:month
```

### Step 2.6: Frontend - Delivery Tracking UI

**Create:** `frontend/src/app/tracking/[orderId]/page.tsx`
- Live map with driver location
- Progress steps
- ETA countdown
- Driver contact button

**Create:** `frontend/src/app/pickup-points/page.tsx`
- Map view of pickup points
- List with operating hours
- Selection for checkout

**Create:** `frontend/src/components/delivery/DeliveryTracker.tsx`
- Real-time tracking component
- WebSocket connection
- Status timeline

**Create:** `frontend/src/components/delivery/PickupPointSelector.tsx`
- Map integration
- Point selection
- Distance calculation

### Step 2.7: Frontend - Farm Sourcing UI

**Create:** `frontend/src/app/farms/[slug]/story/page.tsx`
- Full farm story page
- Photo gallery
- Video embed
- Farmer information

**Create:** `frontend/src/app/trace/[batchCode]/page.tsx`
- QR code landing page
- Product journey visualization
- Farm info card
- Harvest details

**Create:** `frontend/src/app/regions/page.tsx`
- Region overview map
- Specialty highlights

**Create:** `frontend/src/app/regions/[region]/page.tsx`
- Region detail page
- Farms list
- Products list
- Active campaign banner

**Create:** `frontend/src/app/seasonal/page.tsx`
- 12-month calendar view
- Product availability indicators
- Click-to-filter functionality

**Create:** `frontend/src/components/sourcing/FarmStoryCard.tsx`
**Create:** `frontend/src/components/sourcing/TraceabilityView.tsx`
**Create:** `frontend/src/components/sourcing/RegionalBanner.tsx`
**Create:** `frontend/src/components/sourcing/SeasonalCalendar.tsx`
**Create:** `frontend/src/components/sourcing/ProductOriginBadge.tsx`

---

## Phase 3: Brand

**Goal:** Implement sustainability tracking and mission-driven features.

### Step 3.1: Database Schema - Sustainability

**File:** `backend/prisma/schema.prisma`

1. Add sustainability enums:
   ```prisma
   enum RescueReason {
     COSMETIC_IMPERFECTION
     SURPLUS
     NEAR_EXPIRY
     SIZE_VARIATION
   }
   ```

2. Add sustainability models:
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
   ```

3. Update `Order` model:
   ```prisma
   // Add to existing Order model
   impactMetrics        ImpactMetrics?
   isRescueBox          Boolean  @default(false)
   creditsUsed          Float    @default(0)
   ```

4. Update `Product` model:
   ```prisma
   // Add to existing Product model
   isRescued            Boolean  @default(false)
   rescueDiscount       Int?
   ```

5. Run migration:
   ```bash
   npx prisma migrate dev --name add_sustainability_system
   ```

### Step 3.2: Database Schema - Loyalty

**File:** `backend/prisma/schema.prisma`

1. Add loyalty enums:
   ```prisma
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

2. Add loyalty models:
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
   ```

3. Run migration:
   ```bash
   npx prisma migrate dev --name add_loyalty_system
   ```

### Step 3.3: Impact Tracking API

**Create:** `backend/src/services/impact.service.ts`

1. Implement order impact calculation:
   - Food saved (100% for rescued, 10% for regular)
   - CO2 saved (2 kg per kg of local produce)
   - Farm distance calculation

2. Implement customer impact aggregation

**Create:** `backend/src/controllers/impact.controller.ts`

1. Implement get my impact
2. Implement get community impact

**Create:** `backend/src/routes/impact.routes.ts`

```typescript
// Routes to implement:
GET    /api/impact/my
GET    /api/impact/community
```

### Step 3.4: Rescued Produce API

**Create:** `backend/src/controllers/rescued-produce.controller.ts`

1. Implement list rescued produce
2. Implement create rescued produce (farmer)
3. Implement update availability

**Create:** `backend/src/routes/rescued-produce.routes.ts`

```typescript
// Routes to implement:
GET    /api/rescued-produce
POST   /api/farmer/rescued-produce
PATCH  /api/farmer/rescued-produce/:id
```

### Step 3.5: Packaging Return API

**Create:** `backend/src/controllers/packaging.controller.ts`

1. Implement log packaging return
2. Implement get my returns
3. Calculate and award credits (2 TND per item)

**Create:** `backend/src/routes/packaging.routes.ts`

```typescript
// Routes to implement:
POST   /api/packaging-returns
GET    /api/packaging-returns/my
```

### Step 3.6: Loyalty & Referral API

**Create:** `backend/src/services/loyalty.service.ts`

1. Implement points calculation
2. Implement tier progression
3. Implement referral code generation

**Create:** `backend/src/controllers/loyalty.controller.ts`

1. Implement get my loyalty status
2. Implement redeem points

**Create:** `backend/src/controllers/referral.controller.ts`

1. Implement create referral
2. Implement complete referral
3. Implement get my referrals

**Create:** `backend/src/routes/loyalty.routes.ts`

```typescript
// Routes to implement:
GET    /api/loyalty/my
POST   /api/loyalty/redeem
POST   /api/referrals
GET    /api/referrals/my
```

### Step 3.7: Frontend - Sustainability UI

**Create:** `frontend/src/app/impact/page.tsx`
- Personal impact dashboard
- Stats cards (food saved, CO2, farmers)
- Progress visualizations
- Community comparison

**Create:** `frontend/src/components/sustainability/ImpactDashboard.tsx`
- Impact metrics display
- Animated counters
- Tree equivalence display

**Create:** `frontend/src/components/sustainability/RescuedProduceCard.tsx`
- "Save Food" product card
- Reason badge
- Countdown timer
- Discount highlight

**Create:** `frontend/src/components/sustainability/PackagingReturnForm.tsx`
- Return logging form
- Items count input
- Credit preview

### Step 3.8: Frontend - Loyalty UI

**Create:** `frontend/src/app/loyalty/page.tsx`
- Loyalty tier display
- Points balance
- Tier progress bar
- Referral code sharing

**Create:** `frontend/src/components/loyalty/LoyaltyCard.tsx`
- Tier badge
- Points display
- Next tier progress

**Create:** `frontend/src/components/loyalty/ReferralShare.tsx`
- Shareable referral link
- Social sharing buttons
- Referral history

### Step 3.9: Notification System

**Create:** `backend/src/services/notification.service.ts`

1. Implement multi-channel notifications:
   - In-app notifications
   - Push notifications
   - SMS
   - WhatsApp
   - Email

2. Implement notification preferences

**Create:** `backend/src/controllers/notification.controller.ts`

1. Implement get my notifications
2. Implement mark as read
3. Implement update preferences

**Create:** `backend/src/routes/notification.routes.ts`

```typescript
// Routes to implement:
GET    /api/notifications
PATCH  /api/notifications/:id/read
GET    /api/notifications/preferences
PATCH  /api/notifications/preferences
```

**Create:** `frontend/src/components/common/NotificationBell.tsx`
- Unread count badge
- Dropdown notification list
- Mark as read functionality

---

## Testing Checklist

### Phase 0 Tests

- [ ] Product discovery endpoints return correct data
- [ ] Featured products display on homepage
- [ ] Popular products sorted by score
- [ ] Seasonal products filter by current month
- [ ] Product search returns relevant results
- [ ] Category filtering works correctly
- [ ] Product view tracking increments counts
- [ ] Unified order creates CustomerOrder + sub-Orders
- [ ] Multi-farm cart creates single order number
- [ ] Delivery fee calculated once (not per farm)
- [ ] Category subscription creation
- [ ] Category subscription pause/skip/resume
- [ ] Box curation algorithm selects appropriate products
- [ ] Homepage displays product-first layout
- [ ] Navigation shows categories dropdown
- [ ] Cart displays unified list (no farm grouping)
- [ ] Checkout creates unified order

### Phase 1 Tests

- [ ] Subscription pause with valid dates
- [ ] Subscription pause exceeds yearly limit
- [ ] Subscription skip with valid date
- [ ] Subscription skip with insufficient notice
- [ ] Trial box creation for eligible customer
- [ ] Trial box creation for customer with existing trial
- [ ] Trial box conversion to subscription
- [ ] Quality report with photo upload
- [ ] Auto-credit calculation by issue type
- [ ] Credit application at checkout
- [ ] SMS command parsing (SKIP, PAUSE, etc.)
- [ ] WhatsApp quality report flow

### Phase 2 Tests

- [ ] Delivery zone lookup
- [ ] Pickup point selection
- [ ] Tracking event creation
- [ ] WebSocket connection for tracking
- [ ] ETA calculation
- [ ] Farm profile update
- [ ] Batch code lookup
- [ ] Regional campaign filtering
- [ ] Seasonal calendar accuracy

### Phase 3 Tests

- [ ] Impact calculation per order
- [ ] Customer impact aggregation
- [ ] Rescued produce listing and expiry
- [ ] Packaging return credit award
- [ ] Loyalty tier progression
- [ ] Referral code validation
- [ ] Referral completion and reward
- [ ] Multi-channel notification delivery

---

## Deployment Notes

### Environment Variables to Add

```bash
# WhatsApp Business API
WHATSAPP_API_URL=
WHATSAPP_ACCESS_TOKEN=
WHATSAPP_PHONE_NUMBER_ID=

# SMS Gateway
SMS_API_URL=
SMS_API_KEY=
SMS_SENDER_ID=

# Push Notifications
FIREBASE_PROJECT_ID=
FIREBASE_PRIVATE_KEY=
FIREBASE_CLIENT_EMAIL=

# WebSocket
REDIS_URL=  # For Socket.io adapter

# Maps
GOOGLE_MAPS_API_KEY=
```

### Database Indexes

Ensure these indexes are created for performance:
- `SubscriptionPause(subscriptionId)`
- `SubscriptionSkip(subscriptionId)`
- `QualityReport(orderId, customerId, status)`
- `CustomerCredit(customerId, expiresAt)`
- `DeliveryTracking(orderId)`
- `DeliveryRoute(date, zone)`
- `RescuedProduce(farmId, availableUntil)`

### Cron Jobs to Set Up

1. **Subscription reminder**: Daily at 09:00
   - Send reminders for upcoming deliveries

2. **Trial expiry**: Daily at 00:00
   - Mark expired trials

3. **Credit expiry**: Daily at 00:00
   - Mark expired credits

4. **Rescued produce cleanup**: Every 6 hours
   - Mark expired rescued produce as unavailable

5. **Survey trigger**: Hourly
   - Send surveys 24 hours after delivery

---

## Success Metrics Reference

### Phase 0 Metrics

| Feature | Key Metric | Target |
|---------|-----------|--------|
| Product Discovery | Clicks to cart | 2-3 (from 5+) |
| Product Discovery | Products viewed per session | >5 |
| Product Discovery | Search-to-purchase rate | >15% |
| Unified Orders | Cross-farm purchases | >30% of orders |
| Unified Orders | Cart abandonment rate | <40% |
| Category Subscriptions | Subscription conversion | >20% |
| Category Subscriptions | Retention rate | >90% |

### Phase 1-3 Metrics

| Feature | Key Metric | Target |
|---------|-----------|--------|
| Subscriptions | Monthly retention | >95% |
| Subscriptions | Trial conversion | >40% |
| Delivery | On-time rate | >98% |
| Delivery | Satisfaction rating | >4.5/5 |
| Quality | Report rate | <2% |
| Quality | Resolution time | <4 hours |
| Sourcing | Traceability scans | >30% |
| Sustainability | Rescued produce sales | >10% |
| Sustainability | Packaging returns | >40% |
| Loyalty | Referral completion | >20% |

---

*Guide Version: 2.0*
*Based on: ENGAGEMENT_FEATURES_DESIGN.md v1.0*
*Updated: December 2024 - Added Phase 0: Product-First Foundation*
