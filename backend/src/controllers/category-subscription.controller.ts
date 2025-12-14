import { Response } from 'express';
import prisma from '../config/database';
import { AuthRequest } from '../middleware/auth.middleware';

// POST /api/category-subscriptions - Create subscription
export const createCategorySubscription = async (req: AuthRequest, res: Response) => {
  try {
    const {
      category,
      boxSize,
      frequency,
      deliveryDay,
      deliveryAddress,
      deliveryZone,
      preferences, // { excludeItems: string[], preferredFarms: string[], notes: string }
      maxFarmsPerBox = 3,
      startDate,
    } = req.body;

    // Validate required fields
    if (!category || !boxSize || !frequency || deliveryDay === undefined || !deliveryAddress || !deliveryZone) {
      return res.status(400).json({
        error: 'Category, box size, frequency, delivery day, address, and zone are required',
      });
    }

    // Validate box size
    const validBoxSizes = ['SMALL', 'MEDIUM', 'LARGE', 'FAMILY'];
    if (!validBoxSizes.includes(boxSize)) {
      return res.status(400).json({ error: 'Invalid box size' });
    }

    // Validate frequency
    const validFrequencies = ['WEEKLY', 'BIWEEKLY'];
    if (!validFrequencies.includes(frequency)) {
      return res.status(400).json({ error: 'Invalid frequency' });
    }

    // Validate delivery day (0-6, Sunday-Saturday)
    if (deliveryDay < 0 || deliveryDay > 6) {
      return res.status(400).json({ error: 'Delivery day must be between 0 (Sunday) and 6 (Saturday)' });
    }

    // Check if user already has an active subscription for this category
    const existingSubscription = await prisma.categorySubscription.findFirst({
      where: {
        customerId: req.user!.id,
        category,
        status: 'ACTIVE',
      },
    });

    if (existingSubscription) {
      return res.status(400).json({
        error: `You already have an active subscription for ${category}`,
      });
    }

    // Calculate next delivery date
    const subscriptionStartDate = startDate ? new Date(startDate) : new Date();
    const nextDelivery = calculateNextDeliveryDate(subscriptionStartDate, deliveryDay, frequency);

    const subscription = await prisma.categorySubscription.create({
      data: {
        customerId: req.user!.id,
        category,
        boxSize,
        frequency,
        deliveryDay,
        deliveryAddress,
        deliveryZone,
        preferences: preferences || {},
        maxFarmsPerBox,
        startDate: subscriptionStartDate,
        nextDelivery,
      },
      include: {
        customer: {
          select: { name: true, email: true, phone: true },
        },
      },
    });

    res.status(201).json(subscription);
  } catch (error) {
    console.error('Create category subscription error:', error);
    res.status(500).json({ error: 'Failed to create subscription' });
  }
};

// GET /api/category-subscriptions/my - List my subscriptions
export const getMyCategorySubscriptions = async (req: AuthRequest, res: Response) => {
  try {
    const { status } = req.query;

    const subscriptions = await prisma.categorySubscription.findMany({
      where: {
        customerId: req.user!.id,
        ...(status && { status: status as any }),
      },
      include: {
        pauses: {
          orderBy: { createdAt: 'desc' },
          take: 5,
        },
        skips: {
          orderBy: { skipDate: 'desc' },
          take: 5,
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    res.json(subscriptions);
  } catch (error) {
    console.error('Get my category subscriptions error:', error);
    res.status(500).json({ error: 'Failed to get subscriptions' });
  }
};

// GET /api/category-subscriptions/:id - Get details
export const getCategorySubscriptionById = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;

    const subscription = await prisma.categorySubscription.findFirst({
      where: {
        id,
        customerId: req.user!.id,
      },
      include: {
        customer: {
          select: { name: true, email: true, phone: true, address: true },
        },
        pauses: {
          orderBy: { createdAt: 'desc' },
        },
        skips: {
          orderBy: { skipDate: 'desc' },
        },
      },
    });

    if (!subscription) {
      return res.status(404).json({ error: 'Subscription not found' });
    }

    res.json(subscription);
  } catch (error) {
    console.error('Get category subscription error:', error);
    res.status(500).json({ error: 'Failed to get subscription' });
  }
};

// PATCH /api/category-subscriptions/:id - Update preferences
export const updateCategorySubscription = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const {
      boxSize,
      frequency,
      deliveryDay,
      deliveryAddress,
      deliveryZone,
      preferences,
      maxFarmsPerBox,
      autoRenew,
    } = req.body;

    // Verify ownership
    const subscription = await prisma.categorySubscription.findFirst({
      where: { id, customerId: req.user!.id },
    });

    if (!subscription) {
      return res.status(404).json({ error: 'Subscription not found' });
    }

    // Build update data
    const updateData: any = {};
    if (boxSize) updateData.boxSize = boxSize;
    if (frequency) {
      updateData.frequency = frequency;
      // Recalculate next delivery if frequency changes
      updateData.nextDelivery = calculateNextDeliveryDate(
        subscription.nextDelivery || new Date(),
        deliveryDay || subscription.deliveryDay,
        frequency
      );
    }
    if (deliveryDay !== undefined) updateData.deliveryDay = deliveryDay;
    if (deliveryAddress) updateData.deliveryAddress = deliveryAddress;
    if (deliveryZone) updateData.deliveryZone = deliveryZone;
    if (preferences) updateData.preferences = preferences;
    if (maxFarmsPerBox !== undefined) updateData.maxFarmsPerBox = maxFarmsPerBox;
    if (autoRenew !== undefined) updateData.autoRenew = autoRenew;

    const updated = await prisma.categorySubscription.update({
      where: { id },
      data: updateData,
    });

    res.json(updated);
  } catch (error) {
    console.error('Update category subscription error:', error);
    res.status(500).json({ error: 'Failed to update subscription' });
  }
};

// DELETE /api/category-subscriptions/:id - Cancel
export const cancelCategorySubscription = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const { reason } = req.body;

    const subscription = await prisma.categorySubscription.findFirst({
      where: { id, customerId: req.user!.id },
    });

    if (!subscription) {
      return res.status(404).json({ error: 'Subscription not found' });
    }

    await prisma.categorySubscription.update({
      where: { id },
      data: {
        status: 'CANCELLED',
        preferences: {
          ...(subscription.preferences as object || {}),
          cancellationReason: reason,
          cancelledAt: new Date().toISOString(),
        },
      },
    });

    res.json({ message: 'Subscription cancelled successfully' });
  } catch (error) {
    console.error('Cancel category subscription error:', error);
    res.status(500).json({ error: 'Failed to cancel subscription' });
  }
};

// POST /api/category-subscriptions/:id/pause - Pause subscription
export const pauseCategorySubscription = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const { startDate, endDate, reason } = req.body;

    if (!startDate || !endDate) {
      return res.status(400).json({ error: 'Start date and end date are required' });
    }

    const subscription = await prisma.categorySubscription.findFirst({
      where: { id, customerId: req.user!.id },
    });

    if (!subscription) {
      return res.status(404).json({ error: 'Subscription not found' });
    }

    if (subscription.status !== 'ACTIVE') {
      return res.status(400).json({ error: 'Only active subscriptions can be paused' });
    }

    // Check pause limits
    if (subscription.pausesUsedThisYear >= subscription.maxPausesPerYear) {
      return res.status(400).json({
        error: `You have used all ${subscription.maxPausesPerYear} pauses for this year`,
      });
    }

    // Create pause record and update subscription
    await prisma.$transaction(async (tx) => {
      await tx.categorySubscriptionPause.create({
        data: {
          subscriptionId: id,
          startDate: new Date(startDate),
          endDate: new Date(endDate),
          reason,
        },
      });

      await tx.categorySubscription.update({
        where: { id },
        data: {
          status: 'PAUSED',
          pausedUntil: new Date(endDate),
          pausesUsedThisYear: { increment: 1 },
        },
      });
    });

    res.json({ message: 'Subscription paused successfully' });
  } catch (error) {
    console.error('Pause category subscription error:', error);
    res.status(500).json({ error: 'Failed to pause subscription' });
  }
};

// DELETE /api/category-subscriptions/:id/pause - Resume (end pause early)
export const resumeCategorySubscription = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;

    const subscription = await prisma.categorySubscription.findFirst({
      where: { id, customerId: req.user!.id },
    });

    if (!subscription) {
      return res.status(404).json({ error: 'Subscription not found' });
    }

    if (subscription.status !== 'PAUSED') {
      return res.status(400).json({ error: 'Subscription is not paused' });
    }

    // Calculate next delivery from today
    const nextDelivery = calculateNextDeliveryDate(
      new Date(),
      subscription.deliveryDay,
      subscription.frequency
    );

    await prisma.categorySubscription.update({
      where: { id },
      data: {
        status: 'ACTIVE',
        pausedUntil: null,
        nextDelivery,
      },
    });

    res.json({ message: 'Subscription resumed successfully', nextDelivery });
  } catch (error) {
    console.error('Resume category subscription error:', error);
    res.status(500).json({ error: 'Failed to resume subscription' });
  }
};

// POST /api/category-subscriptions/:id/skip - Skip delivery
export const skipCategoryDelivery = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const { skipDate, reason } = req.body;

    if (!skipDate) {
      return res.status(400).json({ error: 'Skip date is required' });
    }

    const subscription = await prisma.categorySubscription.findFirst({
      where: { id, customerId: req.user!.id },
    });

    if (!subscription) {
      return res.status(404).json({ error: 'Subscription not found' });
    }

    // Check skip limits
    if (subscription.skipsThisMonth >= subscription.maxSkipsPerMonth) {
      return res.status(400).json({
        error: `You have used all ${subscription.maxSkipsPerMonth} skips for this month`,
      });
    }

    // Check if already skipping this date
    const existingSkip = await prisma.categorySubscriptionSkip.findUnique({
      where: {
        subscriptionId_skipDate: {
          subscriptionId: id,
          skipDate: new Date(skipDate),
        },
      },
    });

    if (existingSkip) {
      return res.status(400).json({ error: 'This delivery date is already skipped' });
    }

    await prisma.$transaction(async (tx) => {
      await tx.categorySubscriptionSkip.create({
        data: {
          subscriptionId: id,
          skipDate: new Date(skipDate),
          reason,
        },
      });

      await tx.categorySubscription.update({
        where: { id },
        data: {
          skipsThisMonth: { increment: 1 },
        },
      });
    });

    res.json({ message: 'Delivery skipped successfully' });
  } catch (error) {
    console.error('Skip category delivery error:', error);
    res.status(500).json({ error: 'Failed to skip delivery' });
  }
};

// DELETE /api/category-subscriptions/:id/skip/:date - Unskip
export const unskipCategoryDelivery = async (req: AuthRequest, res: Response) => {
  try {
    const { id, date } = req.params;

    const subscription = await prisma.categorySubscription.findFirst({
      where: { id, customerId: req.user!.id },
    });

    if (!subscription) {
      return res.status(404).json({ error: 'Subscription not found' });
    }

    const skip = await prisma.categorySubscriptionSkip.findUnique({
      where: {
        subscriptionId_skipDate: {
          subscriptionId: id,
          skipDate: new Date(date),
        },
      },
    });

    if (!skip) {
      return res.status(404).json({ error: 'Skip record not found' });
    }

    await prisma.$transaction(async (tx) => {
      await tx.categorySubscriptionSkip.delete({
        where: { id: skip.id },
      });

      await tx.categorySubscription.update({
        where: { id },
        data: {
          skipsThisMonth: { decrement: 1 },
        },
      });
    });

    res.json({ message: 'Skip removed successfully' });
  } catch (error) {
    console.error('Unskip category delivery error:', error);
    res.status(500).json({ error: 'Failed to unskip delivery' });
  }
};

// GET /api/category-subscriptions/:id/preview - Preview next box
export const previewNextBox = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;

    const subscription = await prisma.categorySubscription.findFirst({
      where: { id, customerId: req.user!.id },
    });

    if (!subscription) {
      return res.status(404).json({ error: 'Subscription not found' });
    }

    // Auto-select products based on subscription preferences
    const selectedProducts = await autoSelectProducts(subscription);

    // Calculate box value based on size
    const boxValues: Record<string, { min: number; max: number }> = {
      SMALL: { min: 25, max: 35 },
      MEDIUM: { min: 40, max: 55 },
      LARGE: { min: 60, max: 80 },
      FAMILY: { min: 90, max: 120 },
    };

    const targetValue = boxValues[subscription.boxSize];
    const totalValue = selectedProducts.reduce((sum, p) => sum + Number(p.price), 0);

    res.json({
      subscription: {
        id: subscription.id,
        category: subscription.category,
        boxSize: subscription.boxSize,
        nextDelivery: subscription.nextDelivery,
      },
      targetValue,
      actualValue: totalValue,
      products: selectedProducts,
      farmsIncluded: [...new Set(selectedProducts.map((p) => p.farm.name))],
    });
  } catch (error) {
    console.error('Preview next box error:', error);
    res.status(500).json({ error: 'Failed to preview box' });
  }
};

// GET /api/category-subscriptions/categories - Available categories
export const getSubscriptionCategories = async (req: AuthRequest, res: Response) => {
  try {
    const categories = [
      {
        id: 'vegetables',
        name: 'Légumes',
        nameAr: 'خضروات',
        description: 'Fresh seasonal vegetables from local farms',
        icon: '🥬',
        boxSizes: ['SMALL', 'MEDIUM', 'LARGE', 'FAMILY'],
      },
      {
        id: 'fruits',
        name: 'Fruits',
        nameAr: 'فواكه',
        description: 'Fresh seasonal fruits from Tunisian orchards',
        icon: '🍎',
        boxSizes: ['SMALL', 'MEDIUM', 'LARGE', 'FAMILY'],
      },
      {
        id: 'herbs',
        name: 'Herbes aromatiques',
        nameAr: 'أعشاب',
        description: 'Fresh herbs and aromatics',
        icon: '🌿',
        boxSizes: ['SMALL', 'MEDIUM'],
      },
      {
        id: 'mixed',
        name: 'Box Mixte',
        nameAr: 'صندوق مختلط',
        description: 'A mix of vegetables, fruits, and herbs',
        icon: '📦',
        boxSizes: ['SMALL', 'MEDIUM', 'LARGE', 'FAMILY'],
      },
    ];

    // Get box prices
    const boxPrices: Record<string, number> = {
      SMALL: 29,
      MEDIUM: 45,
      LARGE: 69,
      FAMILY: 99,
    };

    res.json({ categories, boxPrices });
  } catch (error) {
    console.error('Get subscription categories error:', error);
    res.status(500).json({ error: 'Failed to get categories' });
  }
};

// Helper function to calculate next delivery date
function calculateNextDeliveryDate(
  fromDate: Date,
  deliveryDay: number,
  frequency: string
): Date {
  const date = new Date(fromDate);
  const currentDay = date.getDay();

  // Find the next occurrence of the delivery day
  let daysUntilDelivery = deliveryDay - currentDay;
  if (daysUntilDelivery <= 0) {
    daysUntilDelivery += 7;
  }

  date.setDate(date.getDate() + daysUntilDelivery);

  // If biweekly, add another week if we're in the "off" week
  if (frequency === 'BIWEEKLY') {
    // Simple biweekly logic - always at least 7 days from now
    const today = new Date();
    const daysDiff = Math.ceil((date.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
    if (daysDiff < 7) {
      date.setDate(date.getDate() + 7);
    }
  }

  return date;
}

// Helper function to auto-select products for a box
async function autoSelectProducts(subscription: any): Promise<any[]> {
  const preferences = subscription.preferences as any || {};
  const excludeItems = preferences.excludeItems || [];
  const preferredFarms = preferences.preferredFarms || [];

  // Box value targets by size (in TND)
  const boxTargets: Record<string, number> = {
    SMALL: 30,
    MEDIUM: 47,
    LARGE: 70,
    FAMILY: 105,
  };

  const targetValue = boxTargets[subscription.boxSize] || 47;

  // Build query for available products
  let categoryFilter: any = { category: subscription.category };
  if (subscription.category === 'mixed') {
    categoryFilter = { category: { in: ['vegetables', 'fruits', 'herbs'] } };
  }

  // Get available products
  let products = await prisma.product.findMany({
    where: {
      ...categoryFilter,
      isAvailable: true,
      name: { notIn: excludeItems },
    },
    include: {
      farm: {
        select: { id: true, name: true, slug: true },
      },
      popularity: true,
    },
    orderBy: [
      { popularity: { score: 'desc' } },
      { createdAt: 'desc' },
    ],
  });

  // Prioritize preferred farms if specified
  if (preferredFarms.length > 0) {
    products = products.sort((a, b) => {
      const aPreferred = preferredFarms.includes(a.farmId) ? 0 : 1;
      const bPreferred = preferredFarms.includes(b.farmId) ? 0 : 1;
      return aPreferred - bPreferred;
    });
  }

  // Select products to meet target value, limiting farms
  const selectedProducts: any[] = [];
  const farmsUsed = new Set<string>();
  let currentValue = 0;

  for (const product of products) {
    // Stop if we've reached target value
    if (currentValue >= targetValue) break;

    // Skip if we've hit max farms and this is a new farm
    if (
      farmsUsed.size >= subscription.maxFarmsPerBox &&
      !farmsUsed.has(product.farmId)
    ) {
      continue;
    }

    // Add product
    selectedProducts.push(product);
    farmsUsed.add(product.farmId);
    currentValue += Number(product.price);
  }

  return selectedProducts;
}
