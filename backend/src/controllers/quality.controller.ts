import { Response } from 'express';
import { PrismaClient, QualityIssue } from '@prisma/client';
import { AuthRequest } from '../middleware/auth.middleware';

const prisma = new PrismaClient();

// Auto-credit rules based on issue type (percentage of item value)
const AUTO_CREDIT_RULES: Record<QualityIssue, number> = {
  DAMAGED: 1.0,         // 100% of item value
  NOT_FRESH: 1.0,       // 100% of item value
  WRONG_ITEM: 1.0,      // 100% of item value
  MISSING_ITEM: 1.0,    // 100% of item value
  QUANTITY_SHORT: 0.5,  // 50% of item value
  TASTE_QUALITY: 0.5,   // 50% of item value (subjective)
  OTHER: 0,             // Manual review required
};

// Submit quality report
export const createQualityReport = async (req: AuthRequest, res: Response) => {
  try {
    const { orderId, productId, issueType, description, photoUrls } = req.body;
    const customerId = req.user!.id;

    // Verify order belongs to customer and is delivered
    const order = await prisma.order.findFirst({
      where: { id: orderId, customerId },
      include: { items: { include: { product: true } } },
    });

    if (!order) {
      return res.status(404).json({
        success: false,
        error: { message: 'Order not found', messageAr: 'الطلب غير موجود' },
      });
    }

    // Check if order was delivered within last 7 days
    const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
    if (order.deliveredAt && order.deliveredAt < sevenDaysAgo) {
      return res.status(400).json({
        success: false,
        error: {
          message: 'Quality reports can only be submitted within 7 days of delivery',
          messageAr: 'يمكن تقديم تقارير الجودة خلال 7 أيام من التوصيل فقط',
        },
      });
    }

    // Create quality report
    const report = await prisma.qualityReport.create({
      data: {
        orderId,
        customerId,
        productId,
        issueType: issueType as QualityIssue,
        description,
        photoUrls: photoUrls || [],
        status: 'PENDING',
      },
    });

    // Calculate and issue automatic credit
    const creditMultiplier = AUTO_CREDIT_RULES[issueType as QualityIssue] || 0;
    let creditAmount = 0;

    if (creditMultiplier > 0) {
      if (productId) {
        // Credit for specific product
        const item = order.items.find(i => i.productId === productId);
        if (item) {
          creditAmount = Number(item.totalPrice) * creditMultiplier;
        }
      } else {
        // Credit for general issue - 10% of order total
        creditAmount = Number(order.total) * 0.1 * creditMultiplier;
      }

      if (creditAmount > 0) {
        // Round to 3 decimal places (TND has millimes)
        creditAmount = Math.round(creditAmount * 1000) / 1000;

        await prisma.customerCredit.create({
          data: {
            customerId,
            amount: creditAmount,
            reason: 'QUALITY_ISSUE',
            referenceId: report.id,
            expiresAt: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000), // 90 days
          },
        });

        // Update report with credit amount and mark as resolved
        await prisma.qualityReport.update({
          where: { id: report.id },
          data: { creditAmount, status: 'RESOLVED', handledAt: new Date() },
        });
      }
    }

    res.status(201).json({
      success: true,
      data: {
        report: { ...report, creditAmount },
        creditAwarded: creditAmount > 0,
        message: creditAmount > 0
          ? `${creditAmount.toFixed(3)} TND credit has been added to your account`
          : 'Report submitted for review. We will respond within 24 hours.',
        messageAr: creditAmount > 0
          ? `تمت إضافة ${creditAmount.toFixed(3)} دينار إلى حسابك`
          : 'تم تقديم التقرير للمراجعة. سنرد خلال 24 ساعة.',
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
        order: { select: { orderNumber: true, createdAt: true, deliveryDate: true } },
        product: { select: { name: true, nameAr: true, images: true } },
      },
      orderBy: { createdAt: 'desc' },
    });

    res.json({ success: true, data: reports });
  } catch (error) {
    console.error('Get quality reports error:', error);
    res.status(500).json({ success: false, error: { message: 'Failed to fetch reports' } });
  }
};

// Get quality report by ID
export const getQualityReportById = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const customerId = req.user!.id;

    const report = await prisma.qualityReport.findFirst({
      where: { id, customerId },
      include: {
        order: { select: { orderNumber: true, createdAt: true, deliveryDate: true, total: true } },
        product: { select: { name: true, nameAr: true, images: true, price: true } },
      },
    });

    if (!report) {
      return res.status(404).json({ success: false, error: { message: 'Report not found' } });
    }

    res.json({ success: true, data: report });
  } catch (error) {
    console.error('Get quality report error:', error);
    res.status(500).json({ success: false, error: { message: 'Failed to fetch report' } });
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

    // Get credits expiring soon (within 14 days)
    const fourteenDaysFromNow = new Date(Date.now() + 14 * 24 * 60 * 60 * 1000);
    const expiringSoon = credits.filter(c => c.expiresAt && c.expiresAt <= fourteenDaysFromNow);
    const expiringSoonTotal = expiringSoon.reduce((sum, c) => sum + c.amount, 0);

    res.json({
      success: true,
      data: {
        credits,
        available: Math.round(totalAvailable * 1000) / 1000,
        total: Math.round(totalAvailable * 1000) / 1000,
        expiringSoon: {
          count: expiringSoon.length,
          total: Math.round(expiringSoonTotal * 1000) / 1000,
        },
      },
    });
  } catch (error) {
    console.error('Get credits error:', error);
    res.status(500).json({ success: false, error: { message: 'Failed to fetch credits' } });
  }
};

// Get credit history (including used credits)
export const getCreditHistory = async (req: AuthRequest, res: Response) => {
  try {
    const customerId = req.user!.id;
    const { limit = 20, offset = 0 } = req.query;

    const credits = await prisma.customerCredit.findMany({
      where: { customerId },
      orderBy: { createdAt: 'desc' },
      take: Number(limit),
      skip: Number(offset),
    });

    const total = await prisma.customerCredit.count({ where: { customerId } });

    res.json({
      success: true,
      data: credits,
      meta: {
        total,
        limit: Number(limit),
        offset: Number(offset),
      },
    });
  } catch (error) {
    console.error('Get credit history error:', error);
    res.status(500).json({ success: false, error: { message: 'Failed to fetch credit history' } });
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

    // Validate ratings (1-5)
    const ratings = [overallRating, freshnessRating, deliveryRating, packagingRating];
    if (ratings.some(r => r < 1 || r > 5)) {
      return res.status(400).json({
        success: false,
        error: { message: 'Ratings must be between 1 and 5' },
      });
    }

    // Verify order belongs to customer and is delivered
    const order = await prisma.order.findFirst({
      where: { id: orderId, customerId, status: 'DELIVERED' },
    });

    if (!order) {
      return res.status(404).json({
        success: false,
        error: { message: 'Delivered order not found', messageAr: 'الطلب المسلم غير موجود' },
      });
    }

    // Check if survey already submitted
    const existing = await prisma.deliverySurvey.findUnique({
      where: { orderId },
    });

    if (existing) {
      return res.status(400).json({
        success: false,
        error: {
          message: 'Survey already submitted for this order',
          messageAr: 'تم تقديم الاستطلاع لهذا الطلب بالفعل',
        },
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
    const creditAmount = 5;
    await prisma.customerCredit.create({
      data: {
        customerId,
        amount: creditAmount,
        reason: 'LOYALTY',
        referenceId: survey.id,
        expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days
      },
    });

    // Update farm's average delivery rating
    const avgRatings = await prisma.deliverySurvey.aggregate({
      where: {
        order: { farmId: order.farmId },
      },
      _avg: {
        deliveryRating: true,
      },
    });

    if (avgRatings._avg.deliveryRating) {
      await prisma.farm.update({
        where: { id: order.farmId },
        data: { avgDeliveryRating: avgRatings._avg.deliveryRating },
      });
    }

    res.status(201).json({
      success: true,
      data: {
        survey,
        creditAwarded: creditAmount,
        message: `Thank you! ${creditAmount} TND credit added to your account`,
        messageAr: `شكرا لك! تمت إضافة ${creditAmount} دينار إلى حسابك`,
      },
    });
  } catch (error) {
    console.error('Submit survey error:', error);
    res.status(500).json({ success: false, error: { message: 'Failed to submit survey' } });
  }
};

// Get my surveys
export const getMySurveys = async (req: AuthRequest, res: Response) => {
  try {
    const customerId = req.user!.id;

    const surveys = await prisma.deliverySurvey.findMany({
      where: { customerId },
      include: {
        order: {
          select: {
            orderNumber: true,
            deliveryDate: true,
            farm: { select: { name: true, slug: true } },
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    res.json({ success: true, data: surveys });
  } catch (error) {
    console.error('Get surveys error:', error);
    res.status(500).json({ success: false, error: { message: 'Failed to fetch surveys' } });
  }
};

// Get orders pending survey (delivered but no survey yet)
export const getOrdersPendingSurvey = async (req: AuthRequest, res: Response) => {
  try {
    const customerId = req.user!.id;

    const orders = await prisma.order.findMany({
      where: {
        customerId,
        status: 'DELIVERED',
        deliverySurvey: null,
        // Only show orders delivered in the last 14 days
        deliveredAt: { gte: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000) },
      },
      select: {
        id: true,
        orderNumber: true,
        deliveryDate: true,
        deliveredAt: true,
        farm: { select: { name: true, slug: true, logo: true } },
      },
      orderBy: { deliveredAt: 'desc' },
    });

    res.json({ success: true, data: orders });
  } catch (error) {
    console.error('Get orders pending survey error:', error);
    res.status(500).json({ success: false, error: { message: 'Failed to fetch orders' } });
  }
};

// Admin: Get all quality reports
export const getAdminQualityReports = async (req: AuthRequest, res: Response) => {
  try {
    const { status, farmId, limit = 20, offset = 0 } = req.query;

    const where: any = {};
    if (status) where.status = status;
    if (farmId) where.order = { farmId };

    const [reports, total] = await Promise.all([
      prisma.qualityReport.findMany({
        where,
        include: {
          customer: { select: { name: true, email: true, phone: true } },
          order: {
            select: {
              orderNumber: true,
              farm: { select: { name: true, slug: true } },
            },
          },
          product: { select: { name: true, nameAr: true } },
        },
        orderBy: { createdAt: 'desc' },
        take: Number(limit),
        skip: Number(offset),
      }),
      prisma.qualityReport.count({ where }),
    ]);

    res.json({
      success: true,
      data: reports,
      meta: { total, limit: Number(limit), offset: Number(offset) },
    });
  } catch (error) {
    console.error('Get admin quality reports error:', error);
    res.status(500).json({ success: false, error: { message: 'Failed to fetch reports' } });
  }
};

// Admin: Resolve quality report
export const resolveQualityReport = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const { resolution, creditAmount, status } = req.body;
    const adminId = req.user!.id;

    const report = await prisma.qualityReport.findUnique({
      where: { id },
    });

    if (!report) {
      return res.status(404).json({ success: false, error: { message: 'Report not found' } });
    }

    const updated = await prisma.qualityReport.update({
      where: { id },
      data: {
        status,
        resolution,
        creditAmount,
        handledBy: adminId,
        handledAt: new Date(),
      },
    });

    // Issue additional credit if specified and status is RESOLVED
    if (status === 'RESOLVED' && creditAmount && creditAmount > 0) {
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

    res.json({ success: true, data: updated });
  } catch (error) {
    console.error('Resolve quality report error:', error);
    res.status(500).json({ success: false, error: { message: 'Failed to resolve report' } });
  }
};
