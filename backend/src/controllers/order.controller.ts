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

    // Validate item quantities (BUG-001, BUG-002 fix)
    const MAX_QUANTITY_PER_ITEM = 100;
    for (const item of items) {
      if (item.quantity === undefined || item.quantity === null) {
        return res.status(400).json({
          error: 'Quantity is required for each item',
        });
      }
      if (typeof item.quantity !== 'number' || !Number.isInteger(item.quantity)) {
        return res.status(400).json({
          error: 'Quantity must be an integer',
        });
      }
      if (item.quantity <= 0) {
        return res.status(400).json({
          error: 'Quantity must be a positive number greater than 0',
        });
      }
      if (item.quantity > MAX_QUANTITY_PER_ITEM) {
        return res.status(400).json({
          error: `Maximum quantity per item is ${MAX_QUANTITY_PER_ITEM}`,
        });
      }
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

// ============ UNIFIED ORDER ENDPOINTS ============

// Generate a unified customer order number
function generateCustomerOrderNumber(): string {
  const timestamp = Date.now().toString(36).toUpperCase();
  const random = Math.random().toString(36).substring(2, 6).toUpperCase();
  return `CO-${timestamp}-${random}`;
}

// POST /api/orders/unified - Create unified multi-farm order
export const createUnifiedOrder = async (req: AuthRequest, res: Response) => {
  try {
    const {
      items, // Array of { productId, quantity }
      deliveryType,
      deliveryDate,
      deliveryWindow,
      deliveryAddress,
      deliveryZone,
      customerNotes,
      creditsToUse = 0,
    } = req.body;

    // Validate required fields
    if (!items || !items.length || !deliveryType || !deliveryDate) {
      return res.status(400).json({
        error: 'Items, delivery type, and delivery date are required',
      });
    }

    if (deliveryType === 'DELIVERY' && (!deliveryAddress || !deliveryZone)) {
      return res.status(400).json({
        error: 'Delivery address and zone are required for delivery orders',
      });
    }

    // Validate item quantities (BUG-001, BUG-002 fix)
    const MAX_QUANTITY_PER_ITEM = 100;
    for (const item of items) {
      if (item.quantity === undefined || item.quantity === null) {
        return res.status(400).json({
          error: 'Quantity is required for each item',
        });
      }
      if (typeof item.quantity !== 'number' || !Number.isInteger(item.quantity)) {
        return res.status(400).json({
          error: 'Quantity must be an integer',
        });
      }
      if (item.quantity <= 0) {
        return res.status(400).json({
          error: 'Quantity must be a positive number greater than 0',
        });
      }
      if (item.quantity > MAX_QUANTITY_PER_ITEM) {
        return res.status(400).json({
          error: `Maximum quantity per item is ${MAX_QUANTITY_PER_ITEM}`,
        });
      }
    }

    // Validate and fetch all products, group by farm
    const productIds = items.map((item: any) => item.productId);
    const products = await prisma.product.findMany({
      where: { id: { in: productIds } },
      include: { farm: true },
    });

    // Create a lookup map
    const productMap = new Map(products.map((p) => [p.id, p]));

    // Validate all products exist and are available
    for (const item of items) {
      const product = productMap.get(item.productId);
      if (!product) {
        return res.status(400).json({ error: `Product not found: ${item.productId}` });
      }
      if (!product.isAvailable) {
        return res.status(400).json({ error: `Product ${product.name} is not available` });
      }
      if (!product.farm.isActive) {
        return res.status(400).json({ error: `Farm ${product.farm.name} is not active` });
      }
    }

    // Group items by farm
    const itemsByFarm: Record<string, Array<{ productId: string; quantity: number; product: any }>> = {};
    for (const item of items) {
      const product = productMap.get(item.productId)!;
      if (!itemsByFarm[product.farmId]) {
        itemsByFarm[product.farmId] = [];
      }
      itemsByFarm[product.farmId].push({
        productId: item.productId,
        quantity: item.quantity,
        product,
      });
    }

    // Calculate subtotals per farm and overall subtotal
    let overallSubtotal = 0;
    const farmSubtotals: Record<string, number> = {};

    for (const [farmId, farmItems] of Object.entries(itemsByFarm)) {
      let farmSubtotal = 0;
      for (const item of farmItems) {
        const totalPrice = Number(item.product.price) * item.quantity;
        farmSubtotal += totalPrice;
      }
      farmSubtotals[farmId] = farmSubtotal;
      overallSubtotal += farmSubtotal;
    }

    // Calculate delivery fee ONCE (based on overall order, not per farm)
    let deliveryFee = 0;
    if (deliveryType === 'DELIVERY') {
      deliveryFee = calculateDeliveryFee(deliveryZone, overallSubtotal);
    }

    // Apply credits (if any)
    let actualCreditsUsed = 0;
    if (creditsToUse > 0) {
      // Check customer's available credits
      const availableCredits = await prisma.customerCredit.aggregate({
        where: {
          customerId: req.user!.id,
          usedAt: null,
          OR: [
            { expiresAt: null },
            { expiresAt: { gte: new Date() } },
          ],
        },
        _sum: { amount: true },
      });

      const totalAvailable = availableCredits._sum.amount || 0;
      actualCreditsUsed = Math.min(creditsToUse, totalAvailable, overallSubtotal + deliveryFee);
    }

    const total = overallSubtotal + deliveryFee - actualCreditsUsed;

    // Create the unified CustomerOrder and sub-orders in a transaction
    const result = await prisma.$transaction(async (tx) => {
      // Create the CustomerOrder
      const customerOrder = await tx.customerOrder.create({
        data: {
          orderNumber: generateCustomerOrderNumber(),
          customerId: req.user!.id,
          deliveryType,
          deliveryDate: new Date(deliveryDate),
          deliveryWindow,
          deliveryAddress,
          deliveryZone,
          subtotal: overallSubtotal,
          deliveryFee,
          creditsUsed: actualCreditsUsed,
          total,
          customerNotes,
        },
      });

      // Create sub-orders for each farm
      const subOrders = [];
      for (const [farmId, farmItems] of Object.entries(itemsByFarm)) {
        const farmSubtotal = farmSubtotals[farmId];

        const orderItems = farmItems.map((item) => ({
          productId: item.productId,
          quantity: item.quantity,
          unitPrice: item.product.price,
          totalPrice: Number(item.product.price) * item.quantity,
        }));

        const subOrder = await tx.order.create({
          data: {
            orderNumber: generateOrderNumber(),
            customerId: req.user!.id,
            farmId,
            customerOrderId: customerOrder.id,
            deliveryType,
            deliveryDate: new Date(deliveryDate),
            deliveryWindow,
            deliveryAddress,
            deliveryZone,
            deliveryFee: 0, // Delivery fee is on CustomerOrder, not sub-orders
            subtotal: farmSubtotal,
            total: farmSubtotal,
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
              select: { id: true, name: true, slug: true, phone: true, whatsapp: true },
            },
          },
        });

        subOrders.push(subOrder);

        // Update product popularity (order count)
        for (const item of farmItems) {
          await tx.productPopularity.upsert({
            where: { productId: item.productId },
            create: {
              productId: item.productId,
              orderCount: 1,
              score: 5, // Order is worth most points
            },
            update: {
              orderCount: { increment: 1 },
              score: { increment: 2 }, // Significant score boost per order
            },
          });
        }
      }

      // Mark credits as used (if any)
      if (actualCreditsUsed > 0) {
        let remainingToUse = actualCreditsUsed;
        const credits = await tx.customerCredit.findMany({
          where: {
            customerId: req.user!.id,
            usedAt: null,
            OR: [
              { expiresAt: null },
              { expiresAt: { gte: new Date() } },
            ],
          },
          orderBy: { expiresAt: 'asc' }, // Use expiring credits first
        });

        for (const credit of credits) {
          if (remainingToUse <= 0) break;
          if (credit.amount <= remainingToUse) {
            await tx.customerCredit.update({
              where: { id: credit.id },
              data: {
                usedAt: new Date(),
                usedInOrderId: customerOrder.id,
              },
            });
            remainingToUse -= credit.amount;
          }
        }
      }

      return { customerOrder, subOrders };
    });

    // Return the customer-facing unified order with all details
    const fullOrder = await prisma.customerOrder.findUnique({
      where: { id: result.customerOrder.id },
      include: {
        customer: {
          select: { name: true, phone: true, email: true },
        },
        subOrders: {
          include: {
            items: {
              include: {
                product: {
                  select: { id: true, name: true, nameAr: true, unit: true, images: true },
                },
              },
            },
            farm: {
              select: { id: true, name: true, slug: true, phone: true, whatsapp: true },
            },
          },
        },
      },
    });

    res.status(201).json(fullOrder);
  } catch (error) {
    console.error('Create unified order error:', error);
    res.status(500).json({ error: 'Failed to create order' });
  }
};

// GET /api/orders/unified/my - Customer's unified orders
export const getMyUnifiedOrders = async (req: AuthRequest, res: Response) => {
  try {
    const { status, limit = '20', offset = '0' } = req.query;

    const orders = await prisma.customerOrder.findMany({
      where: {
        customerId: req.user!.id,
        ...(status && { status: status as any }),
      },
      include: {
        subOrders: {
          include: {
            items: {
              include: {
                product: {
                  select: { id: true, name: true, unit: true, images: true },
                },
              },
            },
            farm: {
              select: { id: true, name: true, slug: true },
            },
          },
        },
      },
      orderBy: { createdAt: 'desc' },
      take: parseInt(limit as string),
      skip: parseInt(offset as string),
    });

    // Get total count for pagination
    const total = await prisma.customerOrder.count({
      where: {
        customerId: req.user!.id,
        ...(status && { status: status as any }),
      },
    });

    res.json({
      orders,
      pagination: {
        total,
        limit: parseInt(limit as string),
        offset: parseInt(offset as string),
        hasMore: parseInt(offset as string) + orders.length < total,
      },
    });
  } catch (error) {
    console.error('Get my unified orders error:', error);
    res.status(500).json({ error: 'Failed to get orders' });
  }
};

// GET /api/orders/unified/:id - Single unified order detail
export const getUnifiedOrderById = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;

    const order = await prisma.customerOrder.findFirst({
      where: {
        id,
        customerId: req.user!.id,
      },
      include: {
        customer: {
          select: { name: true, phone: true, email: true, address: true },
        },
        subOrders: {
          include: {
            items: {
              include: {
                product: {
                  select: { id: true, name: true, nameAr: true, unit: true, images: true, category: true },
                },
              },
            },
            farm: {
              select: { id: true, name: true, slug: true, phone: true, whatsapp: true, address: true, city: true },
            },
          },
        },
      },
    });

    if (!order) {
      return res.status(404).json({ error: 'Order not found' });
    }

    res.json(order);
  } catch (error) {
    console.error('Get unified order error:', error);
    res.status(500).json({ error: 'Failed to get order' });
  }
};

// GET /api/orders/unified/number/:orderNumber - Get by order number
export const getUnifiedOrderByNumber = async (req: AuthRequest, res: Response) => {
  try {
    const { orderNumber } = req.params;

    const order = await prisma.customerOrder.findFirst({
      where: {
        orderNumber,
        customerId: req.user!.id,
      },
      include: {
        customer: {
          select: { name: true, phone: true, email: true },
        },
        subOrders: {
          include: {
            items: {
              include: {
                product: {
                  select: { id: true, name: true, unit: true, images: true },
                },
              },
            },
            farm: {
              select: { id: true, name: true, slug: true, phone: true },
            },
          },
        },
      },
    });

    if (!order) {
      return res.status(404).json({ error: 'Order not found' });
    }

    res.json(order);
  } catch (error) {
    console.error('Get unified order by number error:', error);
    res.status(500).json({ error: 'Failed to get order' });
  }
};

// PATCH /api/orders/unified/:id/cancel - Cancel unified order
export const cancelUnifiedOrder = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const { reason } = req.body;

    const order = await prisma.customerOrder.findFirst({
      where: { id, customerId: req.user!.id },
      include: { subOrders: true },
    });

    if (!order) {
      return res.status(404).json({ error: 'Order not found' });
    }

    if (order.status !== 'PENDING') {
      return res.status(400).json({
        error: 'Only pending orders can be cancelled',
      });
    }

    // Cancel the unified order and all sub-orders
    await prisma.$transaction(async (tx) => {
      await tx.customerOrder.update({
        where: { id },
        data: {
          status: 'CANCELLED',
          customerNotes: reason ? `${order.customerNotes || ''}\n[Cancelled: ${reason}]` : order.customerNotes,
        },
      });

      // Cancel all sub-orders
      for (const subOrder of order.subOrders) {
        await tx.order.update({
          where: { id: subOrder.id },
          data: {
            status: 'CANCELLED',
            internalNotes: reason ? `Customer cancelled: ${reason}` : 'Customer cancelled',
          },
        });
      }

      // Restore used credits
      if (Number(order.creditsUsed) > 0) {
        await tx.customerCredit.updateMany({
          where: { usedInOrderId: id },
          data: {
            usedAt: null,
            usedInOrderId: null,
          },
        });
      }
    });

    res.json({ message: 'Order cancelled successfully' });
  } catch (error) {
    console.error('Cancel unified order error:', error);
    res.status(500).json({ error: 'Failed to cancel order' });
  }
};
