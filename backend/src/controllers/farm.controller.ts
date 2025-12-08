import { Request, Response } from 'express';
import prisma from '../config/database';
import { AuthRequest } from '../middleware/auth.middleware';
import { slugify } from '../utils/helpers';

export const getAllFarms = async (req: Request, res: Response) => {
  try {
    const { zone, search, limit = '20', offset = '0' } = req.query;

    const farms = await prisma.farm.findMany({
      where: {
        isActive: true,
        ...(zone && { deliveryZones: { has: zone as any } }),
        ...(search && {
          OR: [
            { name: { contains: search as string, mode: 'insensitive' } },
            { description: { contains: search as string, mode: 'insensitive' } },
            { city: { contains: search as string, mode: 'insensitive' } },
          ],
        }),
      },
      include: {
        products: {
          where: { isAvailable: true },
          take: 4,
          select: {
            id: true,
            name: true,
            price: true,
            unit: true,
            images: true,
          },
        },
        _count: {
          select: { products: true, reviews: true, orders: true },
        },
      },
      orderBy: { createdAt: 'desc' },
      take: parseInt(limit as string),
      skip: parseInt(offset as string),
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
        owner: {
          select: { name: true },
        },
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
    const {
      name,
      description,
      story,
      address,
      city,
      phone,
      whatsapp,
      email,
      deliveryZones,
      coordinates,
    } = req.body;

    if (!name || !address || !city) {
      return res.status(400).json({ error: 'Name, address, and city are required' });
    }

    // Check if user already has a farm
    const existingFarm = await prisma.farm.findUnique({
      where: { ownerId: req.user!.id },
    });

    if (existingFarm) {
      return res.status(400).json({ error: 'You already have a farm registered' });
    }

    // Generate slug from name
    let slug = slugify(name);

    // Check if slug exists and make unique
    const existingSlug = await prisma.farm.findUnique({ where: { slug } });
    if (existingSlug) {
      slug = `${slug}-${Date.now().toString(36)}`;
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
        email,
        deliveryZones: deliveryZones || [],
        coordinates,
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

    // Remove fields that shouldn't be updated directly
    delete updateData.id;
    delete updateData.slug;
    delete updateData.ownerId;
    delete updateData.createdAt;

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
        products: {
          orderBy: { createdAt: 'desc' },
        },
        _count: {
          select: { orders: true, subscriptions: true, reviews: true, products: true },
        },
      },
    });

    if (!farm) {
      return res.status(404).json({ error: 'No farm found. Please create one first.' });
    }

    // Get recent orders count
    const recentOrders = await prisma.order.count({
      where: {
        farmId: farm.id,
        createdAt: {
          gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000), // Last 7 days
        },
      },
    });

    // Calculate average rating
    const avgRating = await prisma.review.aggregate({
      where: { farmId: farm.id },
      _avg: { rating: true },
    });

    res.json({
      ...farm,
      recentOrdersCount: recentOrders,
      averageRating: avgRating._avg.rating || 0,
    });
  } catch (error) {
    console.error('Get my farm error:', error);
    res.status(500).json({ error: 'Failed to get farm' });
  }
};

export const getFarmStats = async (req: AuthRequest, res: Response) => {
  try {
    const farm = await prisma.farm.findUnique({
      where: { ownerId: req.user!.id },
    });

    if (!farm) {
      return res.status(404).json({ error: 'Farm not found' });
    }

    // Get order stats
    const totalOrders = await prisma.order.count({
      where: { farmId: farm.id },
    });

    const pendingOrders = await prisma.order.count({
      where: { farmId: farm.id, status: 'PENDING' },
    });

    const completedOrders = await prisma.order.count({
      where: { farmId: farm.id, status: 'DELIVERED' },
    });

    // Get revenue
    const revenue = await prisma.order.aggregate({
      where: { farmId: farm.id, status: 'DELIVERED' },
      _sum: { total: true },
    });

    // Get this month's revenue
    const startOfMonth = new Date();
    startOfMonth.setDate(1);
    startOfMonth.setHours(0, 0, 0, 0);

    const monthlyRevenue = await prisma.order.aggregate({
      where: {
        farmId: farm.id,
        status: 'DELIVERED',
        deliveredAt: { gte: startOfMonth },
      },
      _sum: { total: true },
    });

    // Active subscriptions
    const activeSubscriptions = await prisma.subscription.count({
      where: { farmId: farm.id, status: 'ACTIVE' },
    });

    res.json({
      totalOrders,
      pendingOrders,
      completedOrders,
      totalRevenue: revenue._sum.total || 0,
      monthlyRevenue: monthlyRevenue._sum.total || 0,
      activeSubscriptions,
    });
  } catch (error) {
    console.error('Get farm stats error:', error);
    res.status(500).json({ error: 'Failed to get stats' });
  }
};
