-- Product-First Foundation Migration
-- Adds unified orders, product popularity, featured products, and category subscriptions

-- CreateTable
CREATE TABLE "CustomerOrder" (
    "id" TEXT NOT NULL,
    "orderNumber" TEXT NOT NULL,
    "customerId" TEXT NOT NULL,
    "deliveryType" "DeliveryType" NOT NULL,
    "deliveryDate" TIMESTAMP(3) NOT NULL,
    "deliveryWindow" TEXT,
    "deliveryAddress" TEXT,
    "deliveryZone" "DeliveryZone",
    "subtotal" DECIMAL(10,3) NOT NULL,
    "deliveryFee" DECIMAL(10,3) NOT NULL,
    "creditsUsed" DECIMAL(10,3) NOT NULL DEFAULT 0,
    "total" DECIMAL(10,3) NOT NULL,
    "paymentMethod" TEXT NOT NULL DEFAULT 'cash',
    "isPaid" BOOLEAN NOT NULL DEFAULT false,
    "status" "OrderStatus" NOT NULL DEFAULT 'PENDING',
    "customerNotes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "CustomerOrder_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ProductPopularity" (
    "id" TEXT NOT NULL,
    "productId" TEXT NOT NULL,
    "viewCount" INTEGER NOT NULL DEFAULT 0,
    "orderCount" INTEGER NOT NULL DEFAULT 0,
    "cartAddCount" INTEGER NOT NULL DEFAULT 0,
    "score" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ProductPopularity_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "FeaturedProduct" (
    "id" TEXT NOT NULL,
    "productId" TEXT NOT NULL,
    "position" INTEGER NOT NULL DEFAULT 0,
    "featuredUntil" TIMESTAMP(3),
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "FeaturedProduct_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CategorySubscription" (
    "id" TEXT NOT NULL,
    "customerId" TEXT NOT NULL,
    "category" TEXT NOT NULL,
    "boxSize" "BoxSize" NOT NULL,
    "frequency" "SubscriptionFrequency" NOT NULL,
    "deliveryDay" INTEGER NOT NULL,
    "deliveryAddress" TEXT NOT NULL,
    "deliveryZone" "DeliveryZone" NOT NULL,
    "preferences" JSONB,
    "maxFarmsPerBox" INTEGER NOT NULL DEFAULT 3,
    "status" "SubscriptionStatus" NOT NULL DEFAULT 'ACTIVE',
    "startDate" TIMESTAMP(3) NOT NULL,
    "nextDelivery" TIMESTAMP(3),
    "pausedUntil" TIMESTAMP(3),
    "pausesUsedThisYear" INTEGER NOT NULL DEFAULT 0,
    "maxPausesPerYear" INTEGER NOT NULL DEFAULT 4,
    "skipsThisMonth" INTEGER NOT NULL DEFAULT 0,
    "maxSkipsPerMonth" INTEGER NOT NULL DEFAULT 2,
    "autoRenew" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "CategorySubscription_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CategorySubscriptionPause" (
    "id" TEXT NOT NULL,
    "subscriptionId" TEXT NOT NULL,
    "startDate" TIMESTAMP(3) NOT NULL,
    "endDate" TIMESTAMP(3) NOT NULL,
    "reason" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "CategorySubscriptionPause_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CategorySubscriptionSkip" (
    "id" TEXT NOT NULL,
    "subscriptionId" TEXT NOT NULL,
    "skipDate" TIMESTAMP(3) NOT NULL,
    "reason" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "CategorySubscriptionSkip_pkey" PRIMARY KEY ("id")
);

-- AlterTable - Add customerOrderId to Order for linking sub-orders
ALTER TABLE "Order" ADD COLUMN "customerOrderId" TEXT;

-- CreateIndex
CREATE UNIQUE INDEX "CustomerOrder_orderNumber_key" ON "CustomerOrder"("orderNumber");

-- CreateIndex
CREATE INDEX "CustomerOrder_customerId_idx" ON "CustomerOrder"("customerId");

-- CreateIndex
CREATE INDEX "CustomerOrder_status_idx" ON "CustomerOrder"("status");

-- CreateIndex
CREATE INDEX "CustomerOrder_orderNumber_idx" ON "CustomerOrder"("orderNumber");

-- CreateIndex
CREATE UNIQUE INDEX "ProductPopularity_productId_key" ON "ProductPopularity"("productId");

-- CreateIndex
CREATE INDEX "ProductPopularity_score_idx" ON "ProductPopularity"("score");

-- CreateIndex
CREATE INDEX "FeaturedProduct_isActive_position_idx" ON "FeaturedProduct"("isActive", "position");

-- CreateIndex
CREATE INDEX "CategorySubscription_customerId_idx" ON "CategorySubscription"("customerId");

-- CreateIndex
CREATE INDEX "CategorySubscription_category_idx" ON "CategorySubscription"("category");

-- CreateIndex
CREATE INDEX "CategorySubscription_status_idx" ON "CategorySubscription"("status");

-- CreateIndex
CREATE INDEX "CategorySubscriptionPause_subscriptionId_idx" ON "CategorySubscriptionPause"("subscriptionId");

-- CreateIndex
CREATE INDEX "CategorySubscriptionSkip_subscriptionId_idx" ON "CategorySubscriptionSkip"("subscriptionId");

-- CreateIndex
CREATE UNIQUE INDEX "CategorySubscriptionSkip_subscriptionId_skipDate_key" ON "CategorySubscriptionSkip"("subscriptionId", "skipDate");

-- CreateIndex
CREATE INDEX "Order_customerOrderId_idx" ON "Order"("customerOrderId");

-- AddForeignKey
ALTER TABLE "CustomerOrder" ADD CONSTRAINT "CustomerOrder_customerId_fkey" FOREIGN KEY ("customerId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProductPopularity" ADD CONSTRAINT "ProductPopularity_productId_fkey" FOREIGN KEY ("productId") REFERENCES "Product"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "FeaturedProduct" ADD CONSTRAINT "FeaturedProduct_productId_fkey" FOREIGN KEY ("productId") REFERENCES "Product"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CategorySubscription" ADD CONSTRAINT "CategorySubscription_customerId_fkey" FOREIGN KEY ("customerId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CategorySubscriptionPause" ADD CONSTRAINT "CategorySubscriptionPause_subscriptionId_fkey" FOREIGN KEY ("subscriptionId") REFERENCES "CategorySubscription"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CategorySubscriptionSkip" ADD CONSTRAINT "CategorySubscriptionSkip_subscriptionId_fkey" FOREIGN KEY ("subscriptionId") REFERENCES "CategorySubscription"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Order" ADD CONSTRAINT "Order_customerOrderId_fkey" FOREIGN KEY ("customerOrderId") REFERENCES "CustomerOrder"("id") ON DELETE SET NULL ON UPDATE CASCADE;
