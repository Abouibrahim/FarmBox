import { Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { AuthRequest } from '../middleware/auth.middleware';

const prisma = new PrismaClient();

// Create trial box request
export const createTrialBox = async (req: AuthRequest, res: Response) => {
  try {
    const { farmId, boxSize } = req.body;
    const customerId = req.user!.id;

    // Check if customer already has trial with this farm
    const existing = await prisma.trialBox.findUnique({
      where: { customerId_farmId: { customerId, farmId } },
    });

    if (existing) {
      return res.status(400).json({
        success: false,
        error: {
          message: 'You have already used your trial with this farm',
          messageAr: 'لقد استخدمت بالفعل فترة التجربة مع هذه المزرعة',
        },
      });
    }

    // Check if farm exists and is active
    const farm = await prisma.farm.findFirst({
      where: { id: farmId, isActive: true },
      select: { name: true, slug: true, logo: true },
    });

    if (!farm) {
      return res.status(404).json({
        success: false,
        error: { message: 'Farm not found', messageAr: 'المزرعة غير موجودة' },
      });
    }

    // Create trial box with 7-day expiry
    const trialBox = await prisma.trialBox.create({
      data: {
        customerId,
        farmId,
        boxSize,
        discountPercent: 25, // 25% off first box
        expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days
      },
      include: {
        farm: { select: { name: true, slug: true, logo: true } },
      },
    });

    res.status(201).json({
      success: true,
      data: trialBox,
      message: 'Trial box created! Order within 7 days to get 25% off.',
      messageAr: 'تم إنشاء صندوق التجربة! اطلب خلال 7 أيام للحصول على خصم 25%.',
    });
  } catch (error) {
    console.error('Create trial box error:', error);
    res.status(500).json({ success: false, error: { message: 'Failed to create trial box' } });
  }
};

// Get my trial boxes
export const getMyTrialBoxes = async (req: AuthRequest, res: Response) => {
  try {
    const customerId = req.user!.id;

    const trialBoxes = await prisma.trialBox.findMany({
      where: { customerId },
      include: {
        farm: { select: { name: true, slug: true, logo: true } },
        order: { select: { id: true, orderNumber: true, status: true, total: true } },
      },
      orderBy: { createdAt: 'desc' },
    });

    // Check for expired trials and update status
    const now = new Date();
    for (const trial of trialBoxes) {
      if (trial.status === 'PENDING' && trial.expiresAt < now) {
        await prisma.trialBox.update({
          where: { id: trial.id },
          data: { status: 'EXPIRED' },
        });
        trial.status = 'EXPIRED';
      }
    }

    res.json({ success: true, data: trialBoxes });
  } catch (error) {
    console.error('Get trial boxes error:', error);
    res.status(500).json({ success: false, error: { message: 'Failed to fetch trial boxes' } });
  }
};

// Get trial box by ID
export const getTrialBoxById = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const customerId = req.user!.id;

    const trialBox = await prisma.trialBox.findFirst({
      where: { id, customerId },
      include: {
        farm: {
          select: {
            name: true,
            slug: true,
            logo: true,
            description: true,
            products: {
              where: { isAvailable: true },
              take: 6,
              select: { id: true, name: true, nameAr: true, images: true, price: true },
            },
          },
        },
        order: { select: { id: true, orderNumber: true, status: true, total: true } },
      },
    });

    if (!trialBox) {
      return res.status(404).json({ success: false, error: { message: 'Trial box not found' } });
    }

    res.json({ success: true, data: trialBox });
  } catch (error) {
    console.error('Get trial box error:', error);
    res.status(500).json({ success: false, error: { message: 'Failed to fetch trial box' } });
  }
};

// Check if trial available for farm
export const checkTrialAvailability = async (req: AuthRequest, res: Response) => {
  try {
    const { farmId } = req.params;
    const customerId = req.user!.id;

    const existing = await prisma.trialBox.findUnique({
      where: { customerId_farmId: { customerId, farmId } },
    });

    res.json({
      success: true,
      data: {
        available: !existing,
        existingTrial: existing ? {
          status: existing.status,
          createdAt: existing.createdAt,
          expiresAt: existing.expiresAt,
        } : null,
      },
    });
  } catch (error) {
    console.error('Check trial availability error:', error);
    res.status(500).json({ success: false, error: { message: 'Failed to check availability' } });
  }
};

// Convert trial to subscription
export const convertTrialToSubscription = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const { frequency, deliveryDay, deliveryAddress, deliveryZone, preferences } = req.body;
    const customerId = req.user!.id;

    const trialBox = await prisma.trialBox.findFirst({
      where: { id, customerId, status: 'DELIVERED' },
    });

    if (!trialBox) {
      return res.status(404).json({
        success: false,
        error: {
          message: 'Delivered trial box not found. You can only convert after receiving your trial box.',
          messageAr: 'لم يتم العثور على صندوق التجربة المسلم. يمكنك التحويل فقط بعد استلام صندوق التجربة.',
        },
      });
    }

    if (trialBox.convertedToSub) {
      return res.status(400).json({
        success: false,
        error: {
          message: 'This trial has already been converted to a subscription',
          messageAr: 'تم تحويل هذه التجربة بالفعل إلى اشتراك',
        },
      });
    }

    // Calculate next delivery date
    const nextDelivery = calculateNextDeliveryDate(deliveryDay, frequency);

    // Create subscription from trial
    const subscription = await prisma.subscription.create({
      data: {
        customerId,
        farmId: trialBox.farmId,
        boxSize: trialBox.boxSize,
        frequency,
        deliveryDay,
        deliveryAddress,
        deliveryZone,
        preferences,
        status: 'ACTIVE',
        startDate: new Date(),
        nextDelivery,
        trialConverted: true,
      },
      include: {
        farm: { select: { name: true, slug: true, logo: true } },
      },
    });

    // Update trial box
    await prisma.trialBox.update({
      where: { id },
      data: { convertedToSub: true, status: 'CONVERTED' },
    });

    res.json({
      success: true,
      data: subscription,
      message: 'Successfully converted to subscription!',
      messageAr: 'تم التحويل إلى اشتراك بنجاح!',
    });
  } catch (error) {
    console.error('Convert trial error:', error);
    res.status(500).json({ success: false, error: { message: 'Failed to convert trial' } });
  }
};

// Get available farms for trial (farms user hasn't tried yet)
export const getAvailableFarmsForTrial = async (req: AuthRequest, res: Response) => {
  try {
    const customerId = req.user!.id;
    const { zone } = req.query;

    // Get farms user has already tried
    const triedFarms = await prisma.trialBox.findMany({
      where: { customerId },
      select: { farmId: true },
    });
    const triedFarmIds = triedFarms.map(t => t.farmId);

    // Get available farms
    const farms = await prisma.farm.findMany({
      where: {
        isActive: true,
        id: { notIn: triedFarmIds },
        ...(zone && { deliveryZones: { has: zone as any } }),
      },
      select: {
        id: true,
        name: true,
        slug: true,
        logo: true,
        description: true,
        city: true,
        deliveryZones: true,
        _count: { select: { products: true, reviews: true } },
      },
      orderBy: { createdAt: 'desc' },
    });

    res.json({ success: true, data: farms });
  } catch (error) {
    console.error('Get available farms error:', error);
    res.status(500).json({ success: false, error: { message: 'Failed to fetch farms' } });
  }
};

// Helper function
function calculateNextDeliveryDate(deliveryDay: number, frequency: string): Date {
  const today = new Date();
  const currentDay = today.getDay();

  let daysUntilDelivery = deliveryDay - currentDay;
  if (daysUntilDelivery <= 0) {
    daysUntilDelivery += 7;
  }

  if (frequency === 'BIWEEKLY' && daysUntilDelivery < 7) {
    daysUntilDelivery += 7;
  }

  const nextDelivery = new Date(today);
  nextDelivery.setDate(today.getDate() + daysUntilDelivery);
  nextDelivery.setHours(0, 0, 0, 0);

  return nextDelivery;
}
