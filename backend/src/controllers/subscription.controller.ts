import { Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { AuthRequest } from '../middleware/auth.middleware';

const prisma = new PrismaClient();

// Create subscription
export const createSubscription = async (req: AuthRequest, res: Response) => {
  try {
    const { farmId, boxSize, frequency, deliveryDay, deliveryAddress, deliveryZone, preferences } = req.body;
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

    // Calculate next delivery date
    const nextDelivery = calculateNextDeliveryDate(deliveryDay, frequency);

    const subscription = await prisma.subscription.create({
      data: {
        customerId,
        farmId,
        boxSize,
        frequency,
        deliveryDay,
        deliveryAddress,
        deliveryZone,
        preferences,
        status: 'ACTIVE',
        startDate: new Date(),
        nextDelivery,
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
        pauses: {
          where: { endDate: { gte: new Date() } },
          orderBy: { startDate: 'desc' },
          take: 1,
        },
        skips: {
          where: { skipDate: { gte: new Date() } },
          orderBy: { skipDate: 'asc' },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    res.json({ success: true, data: subscriptions });
  } catch (error) {
    console.error('Get subscriptions error:', error);
    res.status(500).json({ success: false, error: { message: 'Failed to fetch subscriptions' } });
  }
};

// Get subscription by ID
export const getSubscriptionById = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const customerId = req.user!.id;

    const subscription = await prisma.subscription.findFirst({
      where: { id, customerId },
      include: {
        farm: { select: { name: true, slug: true, logo: true, phone: true, whatsapp: true } },
        pauses: { orderBy: { createdAt: 'desc' } },
        skips: { orderBy: { skipDate: 'desc' } },
        orders: {
          orderBy: { createdAt: 'desc' },
          take: 5,
          select: { id: true, orderNumber: true, status: true, total: true, deliveryDate: true },
        },
      },
    });

    if (!subscription) {
      return res.status(404).json({ success: false, error: { message: 'Subscription not found' } });
    }

    res.json({ success: true, data: subscription });
  } catch (error) {
    console.error('Get subscription error:', error);
    res.status(500).json({ success: false, error: { message: 'Failed to fetch subscription' } });
  }
};

// Update subscription
export const updateSubscription = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const { boxSize, frequency, deliveryDay, deliveryAddress, deliveryZone, preferences } = req.body;
    const customerId = req.user!.id;

    const subscription = await prisma.subscription.findFirst({
      where: { id, customerId },
    });

    if (!subscription) {
      return res.status(404).json({ success: false, error: { message: 'Subscription not found' } });
    }

    const updated = await prisma.subscription.update({
      where: { id },
      data: {
        ...(boxSize && { boxSize }),
        ...(frequency && { frequency }),
        ...(deliveryDay !== undefined && { deliveryDay }),
        ...(deliveryAddress && { deliveryAddress }),
        ...(deliveryZone && { deliveryZone }),
        ...(preferences !== undefined && { preferences }),
      },
      include: {
        farm: { select: { name: true, slug: true, logo: true } },
      },
    });

    res.json({ success: true, data: updated });
  } catch (error) {
    console.error('Update subscription error:', error);
    res.status(500).json({ success: false, error: { message: 'Failed to update subscription' } });
  }
};

// Pause subscription
export const pauseSubscription = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const { weeks, startDate: providedStartDate, endDate: providedEndDate, reason } = req.body;
    const customerId = req.user!.id;

    const subscription = await prisma.subscription.findFirst({
      where: { id, customerId },
    });

    if (!subscription) {
      return res.status(404).json({ success: false, error: { message: 'Subscription not found' } });
    }

    if (subscription.status === 'PAUSED') {
      return res.status(400).json({
        success: false,
        error: { message: 'Subscription is already paused' },
      });
    }

    if (subscription.status === 'CANCELLED') {
      return res.status(400).json({
        success: false,
        error: { message: 'Cannot pause a cancelled subscription' },
      });
    }

    // Check pause limits (max 4 per year)
    if (subscription.pausesUsedThisYear >= subscription.maxPausesPerYear) {
      return res.status(400).json({
        success: false,
        error: {
          message: `Maximum pauses for this year reached (${subscription.maxPausesPerYear})`,
          messageAr: `تم الوصول للحد الأقصى من التوقفات هذا العام (${subscription.maxPausesPerYear})`,
        },
      });
    }

    // Calculate dates from weeks if provided, otherwise use explicit dates
    let start: Date;
    let end: Date;

    if (weeks) {
      // Frontend sends weeks parameter
      if (weeks < 1 || weeks > 4) {
        return res.status(400).json({
          success: false,
          error: { message: 'Pause duration must be between 1 and 4 weeks' },
        });
      }
      start = new Date();
      end = new Date();
      end.setDate(end.getDate() + (weeks * 7));
    } else if (providedStartDate && providedEndDate) {
      // Backend/explicit dates provided
      start = new Date(providedStartDate);
      end = new Date(providedEndDate);
    } else {
      return res.status(400).json({
        success: false,
        error: { message: 'Either weeks or startDate/endDate must be provided' },
      });
    }

    // Validate pause duration (max 4 weeks = 28 days)
    const diffDays = Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24));

    if (diffDays > 28) {
      return res.status(400).json({
        success: false,
        error: {
          message: 'Pause duration cannot exceed 4 weeks',
          messageAr: 'لا يمكن أن تتجاوز فترة التوقف 4 أسابيع',
        },
      });
    }

    if (diffDays < 1) {
      return res.status(400).json({
        success: false,
        error: { message: 'End date must be after start date' },
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
          pausedUntil: end,
          pausesUsedThisYear: { increment: 1 },
        },
      }),
    ]);

    res.json({
      success: true,
      data: pause,
      message: `Subscription paused until ${end.toLocaleDateString()}`,
    });
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

    // End current pause early and resume subscription
    await prisma.$transaction([
      prisma.subscriptionPause.updateMany({
        where: { subscriptionId: id, endDate: { gte: new Date() } },
        data: { endDate: new Date() },
      }),
      prisma.subscription.update({
        where: { id },
        data: {
          status: 'ACTIVE',
          pausedUntil: null,
          nextDelivery: calculateNextDeliveryDate(subscription.deliveryDay, subscription.frequency),
        },
      }),
    ]);

    res.json({ success: true, message: 'Subscription resumed successfully' });
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

    if (subscription.status !== 'ACTIVE') {
      return res.status(400).json({
        success: false,
        error: { message: 'Can only skip deliveries for active subscriptions' },
      });
    }

    // Check skip limits (max 2 per month)
    if (subscription.skipsThisMonth >= subscription.maxSkipsPerMonth) {
      return res.status(400).json({
        success: false,
        error: {
          message: `Maximum skips for this month reached (${subscription.maxSkipsPerMonth})`,
          messageAr: `تم الوصول للحد الأقصى من التخطي هذا الشهر (${subscription.maxSkipsPerMonth})`,
        },
      });
    }

    // Validate skip date is at least 48 hours away
    const skip = new Date(skipDate);
    const minSkipDate = new Date(Date.now() + 48 * 60 * 60 * 1000);

    if (skip < minSkipDate) {
      return res.status(400).json({
        success: false,
        error: {
          message: 'Must skip at least 48 hours before delivery',
          messageAr: 'يجب تخطي التوصيل قبل 48 ساعة على الأقل',
        },
      });
    }

    // Check if already skipped this date
    const existingSkip = await prisma.subscriptionSkip.findUnique({
      where: { subscriptionId_skipDate: { subscriptionId: id, skipDate: skip } },
    });

    if (existingSkip) {
      return res.status(400).json({
        success: false,
        error: { message: 'This delivery date is already skipped' },
      });
    }

    const subscriptionSkip = await prisma.subscriptionSkip.create({
      data: { subscriptionId: id, skipDate: skip, reason },
    });

    await prisma.subscription.update({
      where: { id },
      data: { skipsThisMonth: { increment: 1 } },
    });

    res.json({
      success: true,
      data: subscriptionSkip,
      message: `Delivery for ${skip.toLocaleDateString()} has been skipped`,
    });
  } catch (error) {
    console.error('Skip delivery error:', error);
    res.status(500).json({ success: false, error: { message: 'Failed to skip delivery' } });
  }
};

// Unskip delivery
export const unskipDelivery = async (req: AuthRequest, res: Response) => {
  try {
    const { id, date } = req.params;
    const customerId = req.user!.id;

    const subscription = await prisma.subscription.findFirst({
      where: { id, customerId },
    });

    if (!subscription) {
      return res.status(404).json({ success: false, error: { message: 'Subscription not found' } });
    }

    const skipDate = new Date(date);

    const skip = await prisma.subscriptionSkip.findUnique({
      where: { subscriptionId_skipDate: { subscriptionId: id, skipDate } },
    });

    if (!skip) {
      return res.status(404).json({ success: false, error: { message: 'Skip not found' } });
    }

    await prisma.$transaction([
      prisma.subscriptionSkip.delete({
        where: { id: skip.id },
      }),
      prisma.subscription.update({
        where: { id },
        data: { skipsThisMonth: { decrement: 1 } },
      }),
    ]);

    res.json({ success: true, message: 'Delivery has been restored' });
  } catch (error) {
    console.error('Unskip delivery error:', error);
    res.status(500).json({ success: false, error: { message: 'Failed to restore delivery' } });
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

    if (subscription.status === 'CANCELLED') {
      return res.status(400).json({
        success: false,
        error: { message: 'Subscription is already cancelled' },
      });
    }

    await prisma.subscription.update({
      where: { id },
      data: {
        status: 'CANCELLED',
        nextDelivery: null,
      },
    });

    res.json({ success: true, message: 'Subscription cancelled successfully. You can resubscribe anytime!' });
  } catch (error) {
    console.error('Cancel subscription error:', error);
    res.status(500).json({ success: false, error: { message: 'Failed to cancel subscription' } });
  }
};

// Helper function to calculate next delivery date
function calculateNextDeliveryDate(deliveryDay: number, frequency: string): Date {
  const today = new Date();
  const currentDay = today.getDay();

  let daysUntilDelivery = deliveryDay - currentDay;
  if (daysUntilDelivery <= 0) {
    daysUntilDelivery += 7;
  }

  // For biweekly, if less than 7 days away, add another week
  if (frequency === 'BIWEEKLY' && daysUntilDelivery < 7) {
    daysUntilDelivery += 7;
  }

  const nextDelivery = new Date(today);
  nextDelivery.setDate(today.getDate() + daysUntilDelivery);
  nextDelivery.setHours(0, 0, 0, 0);

  return nextDelivery;
}

// Reset monthly skips (to be called by cron job)
export const resetMonthlySkips = async () => {
  try {
    await prisma.subscription.updateMany({
      where: { status: 'ACTIVE' },
      data: { skipsThisMonth: 0 },
    });
    console.log('Monthly skips reset successfully');
  } catch (error) {
    console.error('Failed to reset monthly skips:', error);
  }
};

// Reset yearly pauses (to be called by cron job)
export const resetYearlyPauses = async () => {
  try {
    await prisma.subscription.updateMany({
      data: { pausesUsedThisYear: 0 },
    });
    console.log('Yearly pauses reset successfully');
  } catch (error) {
    console.error('Failed to reset yearly pauses:', error);
  }
};
