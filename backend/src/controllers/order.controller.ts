import { Request, Response } from 'express';
import prisma from '../config/database';
import { AuthRequest } from '../middleware/auth.middleware';
import { generateOrderNumber, calculateDeliveryFee } from '../utils/helpers';

export const createOrder = async (req: AuthRequest, res: Response) => {
  try {
    const {
      farmId,
      items,
      deliveryType,
      deliveryDate,
      deliveryWindow,
      deliveryAddress,
      deliveryZone,
      customerNotes,
    } = req.body;

    // Validate required fields
    if (!farmId || !items || !items.length || !deliveryType || !deliveryDate) {
      return res.status(400).json({
        error: 'Farm ID, items, delivery type, and delivery date are required',
      });
    }

    if (deliveryType === 'DELIVERY' && (!deliveryAddress || !deliveryZone)) {
      return res.status(400).json({
        error: 'Delivery address and zone are required for delivery orders',
      });
    }

    // Validate farm exists
    const farm = await prisma.farm.findUnique({
      where: { id: farmId },
    });

    if (!farm || !farm.isActive) {
      return res.status(400).json({ error: 'Farm not found or inactive' });
    }

    // Validate items and calculate totals
    let subtotal = 0;
    const orderItems = [];

    for (const item of items) {
      const product = await prisma.product.findUnique({
        where: { id: item.productId },
      });

      if (!product) {
        return res.status(400).json({ error: `Product not found: ${item.productId}` });
      }

      if (product.farmId !== farmId) {
        return res.status(400).json({
          error: `Product ${product.name} does not belong to this farm`,
        });
      }

      if (!product.isAvailable) {
        return res.status(400).json({
          error: `Product ${product.name} is not available`,
        });
      }

      const totalPrice = Number(product.price) * item.quantity;
      subtotal += totalPrice;

      orderItems.push({
        productId: item.productId,
        quantity: item.quantity,
        unitPrice: product.price,
        totalPrice,
      });
    }

    // Calculate delivery fee
    let deliveryFee = 0;
    if (deliveryType === 'DELIVERY') {
      deliveryFee = calculateDeliveryFee(deliveryZone, subtotal);
    }

    const total = subtotal + deliveryFee;

    // Create order
    const order = await prisma.order.create({
      data: {
        orderNumber: generateOrderNumber(),
        customerId: req.user!.id,
        farmId,
        deliveryType,
        deliveryDate: new Date(deliveryDate),
        deliveryWindow,
        deliveryAddress,
        deliveryZone,
        deliveryFee,
        subtotal,
        total,
        customerNotes,
        items: {
          create: orderItems,
        },
      },
      include: {
        items: {
          include: {
            product: {
              select: { name: true, unit: true, images: true },
            },
          },
        },
        farm: {
          select: { name: true, phone: true, whatsapp: true },
        },
        customer: {
          select: { name: true, phone: true },
        },
      },
    });

    // TODO: Send notification to farmer via WhatsApp

    res.status(201).json(order);
  } catch (error) {
    console.error('Create order error:', error);
    res.status(500).json({ error: 'Failed to create order' });
  }
};

export const getMyOrders = async (req: AuthRequest, res: Response) => {
  try {
    const { status, limit = '20', offset = '0' } = req.query;

    const orders = await prisma.order.findMany({
      where: {
        customerId: req.user!.id,
        ...(status && { status: status as any }),
      },
      include: {
        items: {
          include: {
            product: {
              select: { name: true, unit: true, images: true },
            },
          },
        },
        farm: {
          select: { name: true, slug: true, phone: true },
        },
      },
      orderBy: { createdAt: 'desc' },
      take: parseInt(limit as string),
      skip: parseInt(offset as string),
    });

    res.json(orders);
  } catch (error) {
    console.error('Get my orders error:', error);
    res.status(500).json({ error: 'Failed to get orders' });
  }
};

export const getOrderById = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;

    const order = await prisma.order.findFirst({
      where: {
        id,
        OR: [
          { customerId: req.user!.id },
          { farm: { ownerId: req.user!.id } },
        ],
      },
      include: {
        items: {
          include: {
            product: {
              select: { name: true, nameAr: true, unit: true, images: true },
            },
          },
        },
        farm: {
          select: { name: true, slug: true, phone: true, whatsapp: true, address: true },
        },
        customer: {
          select: { name: true, phone: true, email: true, address: true },
        },
      },
    });

    if (!order) {
      return res.status(404).json({ error: 'Order not found' });
    }

    res.json(order);
  } catch (error) {
    console.error('Get order error:', error);
    res.status(500).json({ error: 'Failed to get order' });
  }
};

export const getFarmOrders = async (req: AuthRequest, res: Response) => {
  try {
    const farm = await prisma.farm.findUnique({
      where: { ownerId: req.user!.id },
    });

    if (!farm) {
      return res.status(404).json({ error: 'Farm not found' });
    }

    const { status, date, limit = '50', offset = '0' } = req.query;

    const orders = await prisma.order.findMany({
      where: {
        farmId: farm.id,
        ...(status && { status: status as any }),
        ...(date && {
          deliveryDate: {
            gte: new Date(date as string),
            lt: new Date(new Date(date as string).getTime() + 24 * 60 * 60 * 1000),
          },
        }),
      },
      include: {
        items: {
          include: {
            product: {
              select: { name: true, unit: true },
            },
          },
        },
        customer: {
          select: { name: true, phone: true, address: true, city: true },
        },
      },
      orderBy: [{ deliveryDate: 'asc' }, { createdAt: 'asc' }],
      take: parseInt(limit as string),
      skip: parseInt(offset as string),
    });

    res.json(orders);
  } catch (error) {
    console.error('Get farm orders error:', error);
    res.status(500).json({ error: 'Failed to get orders' });
  }
};

export const updateOrderStatus = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    const validStatuses = ['PENDING', 'CONFIRMED', 'PREPARING', 'OUT_FOR_DELIVERY', 'DELIVERED', 'CANCELLED'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({ error: 'Invalid status' });
    }

    // Verify farmer ownership
    const order = await prisma.order.findFirst({
      where: { id },
      include: { farm: true, customer: true },
    });

    if (!order) {
      return res.status(404).json({ error: 'Order not found' });
    }

    // Only farmer can update order status (except cancel)
    if (order.farm.ownerId !== req.user!.id) {
      // Customer can only cancel pending orders
      if (order.customerId === req.user!.id && status === 'CANCELLED' && order.status === 'PENDING') {
        // Allow customer cancellation
      } else {
        return res.status(403).json({ error: 'Unauthorized to update this order' });
      }
    }

    const updatedOrder = await prisma.order.update({
      where: { id },
      data: {
        status,
        ...(status === 'CONFIRMED' && { confirmedAt: new Date() }),
        ...(status === 'DELIVERED' && { deliveredAt: new Date(), isPaid: true }),
      },
      include: {
        items: {
          include: { product: true },
        },
        farm: {
          select: { name: true, phone: true },
        },
        customer: {
          select: { name: true, phone: true },
        },
      },
    });

    // TODO: Send notification to customer via WhatsApp

    res.json(updatedOrder);
  } catch (error) {
    console.error('Update order status error:', error);
    res.status(500).json({ error: 'Failed to update order' });
  }
};

export const cancelOrder = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const { reason } = req.body;

    const order = await prisma.order.findFirst({
      where: { id, customerId: req.user!.id },
    });

    if (!order) {
      return res.status(404).json({ error: 'Order not found' });
    }

    if (order.status !== 'PENDING') {
      return res.status(400).json({
        error: 'Only pending orders can be cancelled',
      });
    }

    const updatedOrder = await prisma.order.update({
      where: { id },
      data: {
        status: 'CANCELLED',
        internalNotes: reason ? `Customer cancelled: ${reason}` : 'Customer cancelled',
      },
    });

    res.json(updatedOrder);
  } catch (error) {
    console.error('Cancel order error:', error);
    res.status(500).json({ error: 'Failed to cancel order' });
  }
};

export const getDeliverySchedule = async (req: Request, res: Response) => {
  try {
    const schedules = await prisma.deliverySchedule.findMany({
      where: { isActive: true },
      orderBy: [{ zone: 'asc' }, { dayOfWeek: 'asc' }],
    });

    res.json(schedules);
  } catch (error) {
    console.error('Get delivery schedule error:', error);
    res.status(500).json({ error: 'Failed to get delivery schedule' });
  }
};
