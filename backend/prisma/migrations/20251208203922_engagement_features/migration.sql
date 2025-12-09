-- CreateEnum
CREATE TYPE "UserRole" AS ENUM ('CUSTOMER', 'FARMER', 'ADMIN');

-- CreateEnum
CREATE TYPE "OrderStatus" AS ENUM ('PENDING', 'CONFIRMED', 'PREPARING', 'OUT_FOR_DELIVERY', 'DELIVERED', 'CANCELLED');

-- CreateEnum
CREATE TYPE "DeliveryType" AS ENUM ('DELIVERY', 'PICKUP');

-- CreateEnum
CREATE TYPE "SubscriptionStatus" AS ENUM ('ACTIVE', 'PAUSED', 'CANCELLED');

-- CreateEnum
CREATE TYPE "SubscriptionFrequency" AS ENUM ('WEEKLY', 'BIWEEKLY');

-- CreateEnum
CREATE TYPE "BoxSize" AS ENUM ('SMALL', 'MEDIUM', 'LARGE', 'FAMILY');

-- CreateEnum
CREATE TYPE "DeliveryZone" AS ENUM ('ZONE_A', 'ZONE_B', 'ZONE_C');

-- CreateEnum
CREATE TYPE "TrialStatus" AS ENUM ('PENDING', 'ORDERED', 'DELIVERED', 'CONVERTED', 'EXPIRED');

-- CreateEnum
CREATE TYPE "QualityIssue" AS ENUM ('DAMAGED', 'NOT_FRESH', 'WRONG_ITEM', 'MISSING_ITEM', 'QUANTITY_SHORT', 'TASTE_QUALITY', 'OTHER');

-- CreateEnum
CREATE TYPE "ReportStatus" AS ENUM ('PENDING', 'REVIEWING', 'RESOLVED', 'REJECTED');

-- CreateEnum
CREATE TYPE "CreditReason" AS ENUM ('QUALITY_ISSUE', 'PACKAGING_RETURN', 'REFERRAL', 'LOYALTY', 'APOLOGY', 'PROMOTION');

-- CreateEnum
CREATE TYPE "NotificationType" AS ENUM ('ORDER_CONFIRMED', 'ORDER_PREPARING', 'ORDER_OUT_FOR_DELIVERY', 'ORDER_DELIVERED', 'ORDER_CANCELLED', 'SUBSCRIPTION_REMINDER', 'SUBSCRIPTION_PAUSED', 'SUBSCRIPTION_RESUMED', 'DELIVERY_APPROACHING', 'QUALITY_REPORT_UPDATE', 'CREDIT_AWARDED', 'PROMOTION', 'FARM_UPDATE', 'SEASONAL_ALERT');

-- CreateEnum
CREATE TYPE "NotificationChannel" AS ENUM ('IN_APP', 'SMS', 'WHATSAPP', 'EMAIL', 'PUSH');

-- CreateEnum
CREATE TYPE "RouteStatus" AS ENUM ('PLANNED', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED');

-- CreateEnum
CREATE TYPE "StopStatus" AS ENUM ('PENDING', 'ARRIVED', 'DELIVERED', 'FAILED', 'SKIPPED');

-- CreateEnum
CREATE TYPE "TrackingStatus" AS ENUM ('ORDER_PLACED', 'ORDER_CONFIRMED', 'BEING_PACKED', 'OUT_FOR_DELIVERY', 'NEARBY', 'DELIVERED', 'PICKUP_READY', 'PICKED_UP');

-- CreateEnum
CREATE TYPE "TunisianRegion" AS ENUM ('CAP_BON', 'SAHEL', 'SOUTH', 'NORTH', 'CENTRAL', 'TUNIS_SUBURBS');

-- CreateEnum
CREATE TYPE "QualityGrade" AS ENUM ('A_PLUS', 'A', 'B');

-- CreateEnum
CREATE TYPE "RescueReason" AS ENUM ('COSMETIC_IMPERFECTION', 'SURPLUS', 'NEAR_EXPIRY', 'SIZE_VARIATION');

-- CreateEnum
CREATE TYPE "LoyaltyTier" AS ENUM ('BRONZE', 'SILVER', 'GOLD', 'PLATINUM');

-- CreateEnum
CREATE TYPE "ReferralStatus" AS ENUM ('PENDING', 'COMPLETED', 'EXPIRED');

-- CreateEnum
CREATE TYPE "MessageDirection" AS ENUM ('INBOUND', 'OUTBOUND');

-- CreateEnum
CREATE TYPE "WhatsAppMessageType" AS ENUM ('TEMPLATE', 'TEXT', 'IMAGE', 'DOCUMENT');

-- CreateEnum
CREATE TYPE "MessageStatus" AS ENUM ('PENDING', 'SENT', 'DELIVERED', 'READ', 'FAILED');

-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "phone" TEXT,
    "passwordHash" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "role" "UserRole" NOT NULL DEFAULT 'CUSTOMER',
    "address" TEXT,
    "city" TEXT,
    "zone" "DeliveryZone",
    "coordinates" JSONB,
    "whatsappNumber" TEXT,
    "preferredLanguage" TEXT NOT NULL DEFAULT 'fr',
    "lastActiveAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Farm" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "description" TEXT,
    "story" TEXT,
    "address" TEXT NOT NULL,
    "city" TEXT NOT NULL,
    "coordinates" JSONB,
    "phone" TEXT,
    "whatsapp" TEXT,
    "email" TEXT,
    "logo" TEXT,
    "coverImage" TEXT,
    "images" TEXT[],
    "deliveryZones" "DeliveryZone"[],
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "isVerified" BOOLEAN NOT NULL DEFAULT false,
    "tier" TEXT NOT NULL DEFAULT 'basic',
    "region" "TunisianRegion",
    "sustainabilityScore" INTEGER DEFAULT 0,
    "avgDeliveryRating" DOUBLE PRECISION,
    "totalFoodSavedKg" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "ownerId" TEXT NOT NULL,

    CONSTRAINT "Farm_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Product" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "nameAr" TEXT,
    "description" TEXT,
    "price" DECIMAL(10,3) NOT NULL,
    "unit" TEXT NOT NULL,
    "minQuantity" DECIMAL(10,2) NOT NULL DEFAULT 1,
    "category" TEXT NOT NULL,
    "subcategory" TEXT,
    "isAvailable" BOOLEAN NOT NULL DEFAULT true,
    "seasonStart" INTEGER,
    "seasonEnd" INTEGER,
    "stockQuantity" DECIMAL(10,2),
    "images" TEXT[],
    "isRescued" BOOLEAN NOT NULL DEFAULT false,
    "rescueDiscount" INTEGER,
    "harvestRegion" "TunisianRegion",
    "traceabilityEnabled" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "farmId" TEXT NOT NULL,

    CONSTRAINT "Product_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Order" (
    "id" TEXT NOT NULL,
    "orderNumber" TEXT NOT NULL,
    "status" "OrderStatus" NOT NULL DEFAULT 'PENDING',
    "deliveryType" "DeliveryType" NOT NULL,
    "deliveryDate" TIMESTAMP(3) NOT NULL,
    "deliveryWindow" TEXT,
    "deliveryAddress" TEXT,
    "deliveryZone" "DeliveryZone",
    "deliveryFee" DECIMAL(10,3) NOT NULL DEFAULT 0,
    "subtotal" DECIMAL(10,3) NOT NULL,
    "total" DECIMAL(10,3) NOT NULL,
    "paymentMethod" TEXT NOT NULL DEFAULT 'cash',
    "isPaid" BOOLEAN NOT NULL DEFAULT false,
    "customerNotes" TEXT,
    "internalNotes" TEXT,
    "estimatedDeliveryTime" TIMESTAMP(3),
    "actualDeliveryTime" TIMESTAMP(3),
    "deliveryInstructions" TEXT,
    "isRescueBox" BOOLEAN NOT NULL DEFAULT false,
    "creditsUsed" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "confirmedAt" TIMESTAMP(3),
    "deliveredAt" TIMESTAMP(3),
    "customerId" TEXT NOT NULL,
    "farmId" TEXT NOT NULL,
    "subscriptionId" TEXT,
    "pickupPointId" TEXT,

    CONSTRAINT "Order_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "OrderItem" (
    "id" TEXT NOT NULL,
    "quantity" DECIMAL(10,2) NOT NULL,
    "unitPrice" DECIMAL(10,3) NOT NULL,
    "totalPrice" DECIMAL(10,3) NOT NULL,
    "orderId" TEXT NOT NULL,
    "productId" TEXT NOT NULL,

    CONSTRAINT "OrderItem_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Subscription" (
    "id" TEXT NOT NULL,
    "boxSize" "BoxSize" NOT NULL,
    "frequency" "SubscriptionFrequency" NOT NULL,
    "deliveryDay" INTEGER NOT NULL,
    "status" "SubscriptionStatus" NOT NULL DEFAULT 'ACTIVE',
    "deliveryAddress" TEXT NOT NULL,
    "deliveryZone" "DeliveryZone" NOT NULL,
    "preferences" JSONB,
    "startDate" TIMESTAMP(3) NOT NULL,
    "nextDelivery" TIMESTAMP(3),
    "pausedUntil" TIMESTAMP(3),
    "pausesUsedThisYear" INTEGER NOT NULL DEFAULT 0,
    "maxPausesPerYear" INTEGER NOT NULL DEFAULT 4,
    "skipsThisMonth" INTEGER NOT NULL DEFAULT 0,
    "maxSkipsPerMonth" INTEGER NOT NULL DEFAULT 2,
    "autoRenew" BOOLEAN NOT NULL DEFAULT true,
    "reminderDaysBefore" INTEGER NOT NULL DEFAULT 2,
    "trialConverted" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "customerId" TEXT NOT NULL,
    "farmId" TEXT NOT NULL,

    CONSTRAINT "Subscription_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Review" (
    "id" TEXT NOT NULL,
    "rating" INTEGER NOT NULL,
    "comment" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "customerId" TEXT NOT NULL,
    "farmId" TEXT NOT NULL,

    CONSTRAINT "Review_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "DeliverySchedule" (
    "id" TEXT NOT NULL,
    "zone" "DeliveryZone" NOT NULL,
    "dayOfWeek" INTEGER NOT NULL,
    "timeWindows" TEXT[],
    "isActive" BOOLEAN NOT NULL DEFAULT true,

    CONSTRAINT "DeliverySchedule_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SubscriptionPause" (
    "id" TEXT NOT NULL,
    "subscriptionId" TEXT NOT NULL,
    "startDate" TIMESTAMP(3) NOT NULL,
    "endDate" TIMESTAMP(3) NOT NULL,
    "reason" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "SubscriptionPause_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SubscriptionSkip" (
    "id" TEXT NOT NULL,
    "subscriptionId" TEXT NOT NULL,
    "skipDate" TIMESTAMP(3) NOT NULL,
    "reason" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "SubscriptionSkip_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "TrialBox" (
    "id" TEXT NOT NULL,
    "customerId" TEXT NOT NULL,
    "farmId" TEXT NOT NULL,
    "boxSize" "BoxSize" NOT NULL,
    "status" "TrialStatus" NOT NULL DEFAULT 'PENDING',
    "orderId" TEXT,
    "discountPercent" INTEGER NOT NULL DEFAULT 25,
    "convertedToSub" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "expiresAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "TrialBox_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "QualityReport" (
    "id" TEXT NOT NULL,
    "orderId" TEXT NOT NULL,
    "customerId" TEXT NOT NULL,
    "productId" TEXT,
    "issueType" "QualityIssue" NOT NULL,
    "description" TEXT NOT NULL,
    "photoUrls" TEXT[],
    "status" "ReportStatus" NOT NULL DEFAULT 'PENDING',
    "resolution" TEXT,
    "refundAmount" DOUBLE PRECISION,
    "creditAmount" DOUBLE PRECISION,
    "handledBy" TEXT,
    "handledAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "QualityReport_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CustomerCredit" (
    "id" TEXT NOT NULL,
    "customerId" TEXT NOT NULL,
    "amount" DOUBLE PRECISION NOT NULL,
    "reason" "CreditReason" NOT NULL,
    "referenceId" TEXT,
    "expiresAt" TIMESTAMP(3),
    "usedAt" TIMESTAMP(3),
    "usedInOrderId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "CustomerCredit_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "DeliverySurvey" (
    "id" TEXT NOT NULL,
    "orderId" TEXT NOT NULL,
    "customerId" TEXT NOT NULL,
    "overallRating" INTEGER NOT NULL,
    "freshnessRating" INTEGER NOT NULL,
    "deliveryRating" INTEGER NOT NULL,
    "packagingRating" INTEGER NOT NULL,
    "wouldRecommend" BOOLEAN NOT NULL,
    "feedback" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "DeliverySurvey_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Notification" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "type" "NotificationType" NOT NULL,
    "title" TEXT NOT NULL,
    "titleAr" TEXT NOT NULL,
    "message" TEXT NOT NULL,
    "messageAr" TEXT NOT NULL,
    "data" JSONB,
    "channel" "NotificationChannel"[],
    "isRead" BOOLEAN NOT NULL DEFAULT false,
    "readAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Notification_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "NotificationPreference" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "orderUpdates" BOOLEAN NOT NULL DEFAULT true,
    "deliveryAlerts" BOOLEAN NOT NULL DEFAULT true,
    "promotions" BOOLEAN NOT NULL DEFAULT true,
    "farmUpdates" BOOLEAN NOT NULL DEFAULT true,
    "subscriptionReminders" BOOLEAN NOT NULL DEFAULT true,
    "smsEnabled" BOOLEAN NOT NULL DEFAULT true,
    "whatsappEnabled" BOOLEAN NOT NULL DEFAULT true,
    "emailEnabled" BOOLEAN NOT NULL DEFAULT true,
    "pushEnabled" BOOLEAN NOT NULL DEFAULT true,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "NotificationPreference_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "WhatsAppMessage" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "direction" "MessageDirection" NOT NULL,
    "messageType" "WhatsAppMessageType" NOT NULL,
    "content" TEXT NOT NULL,
    "templateName" TEXT,
    "status" "MessageStatus" NOT NULL DEFAULT 'PENDING',
    "externalId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "WhatsAppMessage_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "DeliveryRoute" (
    "id" TEXT NOT NULL,
    "date" TIMESTAMP(3) NOT NULL,
    "zone" "DeliveryZone" NOT NULL,
    "farmId" TEXT NOT NULL,
    "driverId" TEXT,
    "status" "RouteStatus" NOT NULL DEFAULT 'PLANNED',
    "startedAt" TIMESTAMP(3),
    "completedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "DeliveryRoute_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "DeliveryStop" (
    "id" TEXT NOT NULL,
    "routeId" TEXT NOT NULL,
    "orderId" TEXT NOT NULL,
    "sequence" INTEGER NOT NULL,
    "estimatedTime" TIMESTAMP(3),
    "actualTime" TIMESTAMP(3),
    "status" "StopStatus" NOT NULL DEFAULT 'PENDING',
    "notes" TEXT,
    "photoProof" TEXT,
    "signature" TEXT,

    CONSTRAINT "DeliveryStop_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PickupPoint" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "nameAr" TEXT NOT NULL,
    "address" TEXT NOT NULL,
    "addressAr" TEXT NOT NULL,
    "city" TEXT NOT NULL,
    "zone" "DeliveryZone" NOT NULL,
    "lat" DOUBLE PRECISION NOT NULL,
    "lng" DOUBLE PRECISION NOT NULL,
    "partnerName" TEXT NOT NULL,
    "partnerPhone" TEXT NOT NULL,
    "operatingHours" JSONB NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "PickupPoint_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "DeliveryTracking" (
    "id" TEXT NOT NULL,
    "orderId" TEXT NOT NULL,
    "status" "TrackingStatus" NOT NULL,
    "location" JSONB,
    "message" TEXT NOT NULL,
    "messageAr" TEXT NOT NULL,
    "timestamp" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "DeliveryTracking_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ImpactMetrics" (
    "id" TEXT NOT NULL,
    "orderId" TEXT NOT NULL,
    "foodSavedKg" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "co2SavedKg" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "kmFromFarm" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "farmersSupported" INTEGER NOT NULL DEFAULT 1,
    "packagingReturned" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ImpactMetrics_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CustomerImpact" (
    "id" TEXT NOT NULL,
    "customerId" TEXT NOT NULL,
    "totalFoodSavedKg" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "totalCo2SavedKg" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "totalOrders" INTEGER NOT NULL DEFAULT 0,
    "totalFarmersSupported" INTEGER NOT NULL DEFAULT 0,
    "packagingsReturned" INTEGER NOT NULL DEFAULT 0,
    "memberSince" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "CustomerImpact_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "RescuedProduce" (
    "id" TEXT NOT NULL,
    "farmId" TEXT NOT NULL,
    "productName" TEXT NOT NULL,
    "productNameAr" TEXT NOT NULL,
    "weightKg" DOUBLE PRECISION NOT NULL,
    "reason" "RescueReason" NOT NULL,
    "discountPercent" INTEGER NOT NULL DEFAULT 30,
    "availableUntil" TIMESTAMP(3) NOT NULL,
    "isAvailable" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "RescuedProduce_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PackagingReturn" (
    "id" TEXT NOT NULL,
    "customerId" TEXT NOT NULL,
    "itemsReturned" INTEGER NOT NULL,
    "creditAwarded" DOUBLE PRECISION NOT NULL,
    "returnedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "PackagingReturn_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "FarmProfile" (
    "id" TEXT NOT NULL,
    "farmId" TEXT NOT NULL,
    "story" TEXT NOT NULL,
    "storyAr" TEXT NOT NULL,
    "farmingMethods" TEXT[],
    "certifications" TEXT[],
    "foundedYear" INTEGER,
    "familyGeneration" INTEGER,
    "farmSize" DOUBLE PRECISION,
    "specialties" TEXT[],
    "videoUrl" TEXT,
    "galleryImages" TEXT[],
    "socialMedia" JSONB,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "FarmProfile_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ProductBatch" (
    "id" TEXT NOT NULL,
    "productId" TEXT NOT NULL,
    "batchCode" TEXT NOT NULL,
    "harvestDate" TIMESTAMP(3) NOT NULL,
    "harvestLocation" TEXT,
    "farmerId" TEXT NOT NULL,
    "quantityKg" DOUBLE PRECISION NOT NULL,
    "qualityGrade" "QualityGrade" NOT NULL DEFAULT 'A',
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ProductBatch_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "RegionalCampaign" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "nameAr" TEXT NOT NULL,
    "region" "TunisianRegion" NOT NULL,
    "description" TEXT NOT NULL,
    "descriptionAr" TEXT NOT NULL,
    "heroImage" TEXT NOT NULL,
    "products" TEXT[],
    "startDate" TIMESTAMP(3) NOT NULL,
    "endDate" TIMESTAMP(3) NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "RegionalCampaign_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CustomerLoyalty" (
    "id" TEXT NOT NULL,
    "customerId" TEXT NOT NULL,
    "points" INTEGER NOT NULL DEFAULT 0,
    "tier" "LoyaltyTier" NOT NULL DEFAULT 'BRONZE',
    "totalSpent" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "totalOrders" INTEGER NOT NULL DEFAULT 0,
    "referralCode" TEXT NOT NULL,
    "referralsCount" INTEGER NOT NULL DEFAULT 0,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "CustomerLoyalty_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Referral" (
    "id" TEXT NOT NULL,
    "referrerId" TEXT NOT NULL,
    "referredId" TEXT NOT NULL,
    "status" "ReferralStatus" NOT NULL DEFAULT 'PENDING',
    "rewardAmount" DOUBLE PRECISION NOT NULL DEFAULT 10,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "completedAt" TIMESTAMP(3),

    CONSTRAINT "Referral_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE UNIQUE INDEX "User_phone_key" ON "User"("phone");

-- CreateIndex
CREATE INDEX "User_email_idx" ON "User"("email");

-- CreateIndex
CREATE INDEX "User_role_idx" ON "User"("role");

-- CreateIndex
CREATE UNIQUE INDEX "Farm_slug_key" ON "Farm"("slug");

-- CreateIndex
CREATE UNIQUE INDEX "Farm_ownerId_key" ON "Farm"("ownerId");

-- CreateIndex
CREATE INDEX "Farm_slug_idx" ON "Farm"("slug");

-- CreateIndex
CREATE INDEX "Farm_isActive_idx" ON "Farm"("isActive");

-- CreateIndex
CREATE INDEX "Farm_city_idx" ON "Farm"("city");

-- CreateIndex
CREATE INDEX "Product_farmId_idx" ON "Product"("farmId");

-- CreateIndex
CREATE INDEX "Product_category_idx" ON "Product"("category");

-- CreateIndex
CREATE INDEX "Product_isAvailable_idx" ON "Product"("isAvailable");

-- CreateIndex
CREATE UNIQUE INDEX "Order_orderNumber_key" ON "Order"("orderNumber");

-- CreateIndex
CREATE INDEX "Order_customerId_idx" ON "Order"("customerId");

-- CreateIndex
CREATE INDEX "Order_farmId_idx" ON "Order"("farmId");

-- CreateIndex
CREATE INDEX "Order_status_idx" ON "Order"("status");

-- CreateIndex
CREATE INDEX "Order_deliveryDate_idx" ON "Order"("deliveryDate");

-- CreateIndex
CREATE INDEX "Order_orderNumber_idx" ON "Order"("orderNumber");

-- CreateIndex
CREATE INDEX "OrderItem_orderId_idx" ON "OrderItem"("orderId");

-- CreateIndex
CREATE INDEX "OrderItem_productId_idx" ON "OrderItem"("productId");

-- CreateIndex
CREATE INDEX "Subscription_customerId_idx" ON "Subscription"("customerId");

-- CreateIndex
CREATE INDEX "Subscription_farmId_idx" ON "Subscription"("farmId");

-- CreateIndex
CREATE INDEX "Subscription_status_idx" ON "Subscription"("status");

-- CreateIndex
CREATE INDEX "Review_farmId_idx" ON "Review"("farmId");

-- CreateIndex
CREATE INDEX "Review_rating_idx" ON "Review"("rating");

-- CreateIndex
CREATE UNIQUE INDEX "Review_customerId_farmId_key" ON "Review"("customerId", "farmId");

-- CreateIndex
CREATE UNIQUE INDEX "DeliverySchedule_zone_dayOfWeek_key" ON "DeliverySchedule"("zone", "dayOfWeek");

-- CreateIndex
CREATE INDEX "SubscriptionPause_subscriptionId_idx" ON "SubscriptionPause"("subscriptionId");

-- CreateIndex
CREATE INDEX "SubscriptionSkip_subscriptionId_idx" ON "SubscriptionSkip"("subscriptionId");

-- CreateIndex
CREATE UNIQUE INDEX "SubscriptionSkip_subscriptionId_skipDate_key" ON "SubscriptionSkip"("subscriptionId", "skipDate");

-- CreateIndex
CREATE UNIQUE INDEX "TrialBox_orderId_key" ON "TrialBox"("orderId");

-- CreateIndex
CREATE INDEX "TrialBox_customerId_idx" ON "TrialBox"("customerId");

-- CreateIndex
CREATE INDEX "TrialBox_farmId_idx" ON "TrialBox"("farmId");

-- CreateIndex
CREATE UNIQUE INDEX "TrialBox_customerId_farmId_key" ON "TrialBox"("customerId", "farmId");

-- CreateIndex
CREATE INDEX "QualityReport_orderId_idx" ON "QualityReport"("orderId");

-- CreateIndex
CREATE INDEX "QualityReport_customerId_idx" ON "QualityReport"("customerId");

-- CreateIndex
CREATE INDEX "QualityReport_status_idx" ON "QualityReport"("status");

-- CreateIndex
CREATE INDEX "CustomerCredit_customerId_idx" ON "CustomerCredit"("customerId");

-- CreateIndex
CREATE INDEX "CustomerCredit_expiresAt_idx" ON "CustomerCredit"("expiresAt");

-- CreateIndex
CREATE UNIQUE INDEX "DeliverySurvey_orderId_key" ON "DeliverySurvey"("orderId");

-- CreateIndex
CREATE INDEX "DeliverySurvey_customerId_idx" ON "DeliverySurvey"("customerId");

-- CreateIndex
CREATE INDEX "Notification_userId_idx" ON "Notification"("userId");

-- CreateIndex
CREATE INDEX "Notification_isRead_idx" ON "Notification"("isRead");

-- CreateIndex
CREATE INDEX "Notification_createdAt_idx" ON "Notification"("createdAt");

-- CreateIndex
CREATE UNIQUE INDEX "NotificationPreference_userId_key" ON "NotificationPreference"("userId");

-- CreateIndex
CREATE INDEX "WhatsAppMessage_userId_idx" ON "WhatsAppMessage"("userId");

-- CreateIndex
CREATE INDEX "WhatsAppMessage_createdAt_idx" ON "WhatsAppMessage"("createdAt");

-- CreateIndex
CREATE INDEX "DeliveryRoute_date_zone_idx" ON "DeliveryRoute"("date", "zone");

-- CreateIndex
CREATE INDEX "DeliveryRoute_farmId_idx" ON "DeliveryRoute"("farmId");

-- CreateIndex
CREATE UNIQUE INDEX "DeliveryStop_orderId_key" ON "DeliveryStop"("orderId");

-- CreateIndex
CREATE INDEX "DeliveryStop_routeId_idx" ON "DeliveryStop"("routeId");

-- CreateIndex
CREATE INDEX "PickupPoint_zone_idx" ON "PickupPoint"("zone");

-- CreateIndex
CREATE INDEX "DeliveryTracking_orderId_idx" ON "DeliveryTracking"("orderId");

-- CreateIndex
CREATE UNIQUE INDEX "ImpactMetrics_orderId_key" ON "ImpactMetrics"("orderId");

-- CreateIndex
CREATE UNIQUE INDEX "CustomerImpact_customerId_key" ON "CustomerImpact"("customerId");

-- CreateIndex
CREATE INDEX "RescuedProduce_farmId_idx" ON "RescuedProduce"("farmId");

-- CreateIndex
CREATE INDEX "RescuedProduce_availableUntil_idx" ON "RescuedProduce"("availableUntil");

-- CreateIndex
CREATE INDEX "PackagingReturn_customerId_idx" ON "PackagingReturn"("customerId");

-- CreateIndex
CREATE UNIQUE INDEX "FarmProfile_farmId_key" ON "FarmProfile"("farmId");

-- CreateIndex
CREATE UNIQUE INDEX "ProductBatch_batchCode_key" ON "ProductBatch"("batchCode");

-- CreateIndex
CREATE INDEX "ProductBatch_productId_idx" ON "ProductBatch"("productId");

-- CreateIndex
CREATE INDEX "ProductBatch_harvestDate_idx" ON "ProductBatch"("harvestDate");

-- CreateIndex
CREATE INDEX "RegionalCampaign_region_idx" ON "RegionalCampaign"("region");

-- CreateIndex
CREATE INDEX "RegionalCampaign_startDate_endDate_idx" ON "RegionalCampaign"("startDate", "endDate");

-- CreateIndex
CREATE UNIQUE INDEX "CustomerLoyalty_customerId_key" ON "CustomerLoyalty"("customerId");

-- CreateIndex
CREATE UNIQUE INDEX "CustomerLoyalty_referralCode_key" ON "CustomerLoyalty"("referralCode");

-- CreateIndex
CREATE INDEX "Referral_referrerId_idx" ON "Referral"("referrerId");

-- CreateIndex
CREATE UNIQUE INDEX "Referral_referrerId_referredId_key" ON "Referral"("referrerId", "referredId");

-- AddForeignKey
ALTER TABLE "Farm" ADD CONSTRAINT "Farm_ownerId_fkey" FOREIGN KEY ("ownerId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Product" ADD CONSTRAINT "Product_farmId_fkey" FOREIGN KEY ("farmId") REFERENCES "Farm"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Order" ADD CONSTRAINT "Order_customerId_fkey" FOREIGN KEY ("customerId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Order" ADD CONSTRAINT "Order_farmId_fkey" FOREIGN KEY ("farmId") REFERENCES "Farm"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Order" ADD CONSTRAINT "Order_subscriptionId_fkey" FOREIGN KEY ("subscriptionId") REFERENCES "Subscription"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Order" ADD CONSTRAINT "Order_pickupPointId_fkey" FOREIGN KEY ("pickupPointId") REFERENCES "PickupPoint"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "OrderItem" ADD CONSTRAINT "OrderItem_orderId_fkey" FOREIGN KEY ("orderId") REFERENCES "Order"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "OrderItem" ADD CONSTRAINT "OrderItem_productId_fkey" FOREIGN KEY ("productId") REFERENCES "Product"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Subscription" ADD CONSTRAINT "Subscription_customerId_fkey" FOREIGN KEY ("customerId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Subscription" ADD CONSTRAINT "Subscription_farmId_fkey" FOREIGN KEY ("farmId") REFERENCES "Farm"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Review" ADD CONSTRAINT "Review_customerId_fkey" FOREIGN KEY ("customerId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Review" ADD CONSTRAINT "Review_farmId_fkey" FOREIGN KEY ("farmId") REFERENCES "Farm"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SubscriptionPause" ADD CONSTRAINT "SubscriptionPause_subscriptionId_fkey" FOREIGN KEY ("subscriptionId") REFERENCES "Subscription"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SubscriptionSkip" ADD CONSTRAINT "SubscriptionSkip_subscriptionId_fkey" FOREIGN KEY ("subscriptionId") REFERENCES "Subscription"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TrialBox" ADD CONSTRAINT "TrialBox_customerId_fkey" FOREIGN KEY ("customerId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TrialBox" ADD CONSTRAINT "TrialBox_farmId_fkey" FOREIGN KEY ("farmId") REFERENCES "Farm"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TrialBox" ADD CONSTRAINT "TrialBox_orderId_fkey" FOREIGN KEY ("orderId") REFERENCES "Order"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "QualityReport" ADD CONSTRAINT "QualityReport_orderId_fkey" FOREIGN KEY ("orderId") REFERENCES "Order"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "QualityReport" ADD CONSTRAINT "QualityReport_customerId_fkey" FOREIGN KEY ("customerId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "QualityReport" ADD CONSTRAINT "QualityReport_productId_fkey" FOREIGN KEY ("productId") REFERENCES "Product"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CustomerCredit" ADD CONSTRAINT "CustomerCredit_customerId_fkey" FOREIGN KEY ("customerId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DeliverySurvey" ADD CONSTRAINT "DeliverySurvey_orderId_fkey" FOREIGN KEY ("orderId") REFERENCES "Order"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DeliverySurvey" ADD CONSTRAINT "DeliverySurvey_customerId_fkey" FOREIGN KEY ("customerId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Notification" ADD CONSTRAINT "Notification_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "NotificationPreference" ADD CONSTRAINT "NotificationPreference_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "WhatsAppMessage" ADD CONSTRAINT "WhatsAppMessage_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DeliveryRoute" ADD CONSTRAINT "DeliveryRoute_farmId_fkey" FOREIGN KEY ("farmId") REFERENCES "Farm"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DeliveryRoute" ADD CONSTRAINT "DeliveryRoute_driverId_fkey" FOREIGN KEY ("driverId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DeliveryStop" ADD CONSTRAINT "DeliveryStop_routeId_fkey" FOREIGN KEY ("routeId") REFERENCES "DeliveryRoute"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DeliveryStop" ADD CONSTRAINT "DeliveryStop_orderId_fkey" FOREIGN KEY ("orderId") REFERENCES "Order"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DeliveryTracking" ADD CONSTRAINT "DeliveryTracking_orderId_fkey" FOREIGN KEY ("orderId") REFERENCES "Order"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ImpactMetrics" ADD CONSTRAINT "ImpactMetrics_orderId_fkey" FOREIGN KEY ("orderId") REFERENCES "Order"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CustomerImpact" ADD CONSTRAINT "CustomerImpact_customerId_fkey" FOREIGN KEY ("customerId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RescuedProduce" ADD CONSTRAINT "RescuedProduce_farmId_fkey" FOREIGN KEY ("farmId") REFERENCES "Farm"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PackagingReturn" ADD CONSTRAINT "PackagingReturn_customerId_fkey" FOREIGN KEY ("customerId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "FarmProfile" ADD CONSTRAINT "FarmProfile_farmId_fkey" FOREIGN KEY ("farmId") REFERENCES "Farm"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProductBatch" ADD CONSTRAINT "ProductBatch_productId_fkey" FOREIGN KEY ("productId") REFERENCES "Product"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CustomerLoyalty" ADD CONSTRAINT "CustomerLoyalty_customerId_fkey" FOREIGN KEY ("customerId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Referral" ADD CONSTRAINT "Referral_referrerId_fkey" FOREIGN KEY ("referrerId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Referral" ADD CONSTRAINT "Referral_referredId_fkey" FOREIGN KEY ("referredId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
