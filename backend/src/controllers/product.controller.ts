import { Request, Response } from 'express';
import prisma from '../config/database';
import { AuthRequest } from '../middleware/auth.middleware';

export const getProducts = async (req: Request, res: Response) => {
  try {
    const { farmId, category, available, search, limit = '50', offset = '0' } = req.query;

    const products = await prisma.product.findMany({
      where: {
        ...(farmId && { farmId: farmId as string }),
        ...(category && { category: category as string }),
        ...(available === 'true' && { isAvailable: true }),
        ...(search && {
          OR: [
            { name: { contains: search as string, mode: 'insensitive' } },
            { nameAr: { contains: search as string, mode: 'insensitive' } },
            { description: { contains: search as string, mode: 'insensitive' } },
          ],
        }),
      },
      include: {
        farm: {
          select: { id: true, name: true, slug: true },
        },
      },
      orderBy: [{ category: 'asc' }, { name: 'asc' }],
      take: parseInt(limit as string),
      skip: parseInt(offset as string),
    });

    res.json(products);
  } catch (error) {
    console.error('Get products error:', error);
    res.status(500).json({ error: 'Failed to get products' });
  }
};

export const getProductById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const product = await prisma.product.findUnique({
      where: { id },
      include: {
        farm: {
          select: {
            id: true,
            name: true,
            slug: true,
            phone: true,
            whatsapp: true,
            city: true,
          },
        },
      },
    });

    if (!product) {
      return res.status(404).json({ error: 'Product not found' });
    }

    res.json(product);
  } catch (error) {
    console.error('Get product error:', error);
    res.status(500).json({ error: 'Failed to get product' });
  }
};

export const createProduct = async (req: AuthRequest, res: Response) => {
  try {
    const {
      name,
      nameAr,
      description,
      price,
      unit,
      category,
      subcategory,
      minQuantity,
      seasonStart,
      seasonEnd,
      stockQuantity,
      images,
    } = req.body;

    if (!name || !price || !unit || !category) {
      return res.status(400).json({ error: 'Name, price, unit, and category are required' });
    }

    // Get farmer's farm
    const farm = await prisma.farm.findUnique({
      where: { ownerId: req.user!.id },
    });

    if (!farm) {
      return res.status(400).json({ error: 'You must create a farm first' });
    }

    const product = await prisma.product.create({
      data: {
        name,
        nameAr,
        description,
        price,
        unit,
        category,
        subcategory,
        minQuantity: minQuantity || 1,
        seasonStart,
        seasonEnd,
        stockQuantity,
        images: images || [],
        farmId: farm.id,
      },
    });

    res.status(201).json(product);
  } catch (error) {
    console.error('Create product error:', error);
    res.status(500).json({ error: 'Failed to create product' });
  }
};

export const updateProduct = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const updateData = req.body;

    // Verify ownership
    const product = await prisma.product.findFirst({
      where: { id },
      include: { farm: true },
    });

    if (!product || product.farm.ownerId !== req.user!.id) {
      return res.status(404).json({ error: 'Product not found or unauthorized' });
    }

    // Remove fields that shouldn't be updated directly
    delete updateData.id;
    delete updateData.farmId;
    delete updateData.createdAt;

    const updatedProduct = await prisma.product.update({
      where: { id },
      data: updateData,
    });

    res.json(updatedProduct);
  } catch (error) {
    console.error('Update product error:', error);
    res.status(500).json({ error: 'Failed to update product' });
  }
};

export const deleteProduct = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;

    // Verify ownership
    const product = await prisma.product.findFirst({
      where: { id },
      include: { farm: true },
    });

    if (!product || product.farm.ownerId !== req.user!.id) {
      return res.status(404).json({ error: 'Product not found or unauthorized' });
    }

    // Check if product is in any pending orders
    const pendingOrderItems = await prisma.orderItem.count({
      where: {
        productId: id,
        order: {
          status: { in: ['PENDING', 'CONFIRMED', 'PREPARING'] },
        },
      },
    });

    if (pendingOrderItems > 0) {
      return res.status(400).json({
        error: 'Cannot delete product with pending orders. Disable it instead.',
      });
    }

    await prisma.product.delete({ where: { id } });

    res.json({ message: 'Product deleted successfully' });
  } catch (error) {
    console.error('Delete product error:', error);
    res.status(500).json({ error: 'Failed to delete product' });
  }
};

export const toggleProductAvailability = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;

    // Verify ownership
    const product = await prisma.product.findFirst({
      where: { id },
      include: { farm: true },
    });

    if (!product || product.farm.ownerId !== req.user!.id) {
      return res.status(404).json({ error: 'Product not found or unauthorized' });
    }

    const updatedProduct = await prisma.product.update({
      where: { id },
      data: { isAvailable: !product.isAvailable },
    });

    res.json(updatedProduct);
  } catch (error) {
    console.error('Toggle availability error:', error);
    res.status(500).json({ error: 'Failed to toggle availability' });
  }
};

export const getMyProducts = async (req: AuthRequest, res: Response) => {
  try {
    const farm = await prisma.farm.findUnique({
      where: { ownerId: req.user!.id },
    });

    if (!farm) {
      return res.status(404).json({ error: 'Farm not found' });
    }

    const products = await prisma.product.findMany({
      where: { farmId: farm.id },
      orderBy: [{ category: 'asc' }, { name: 'asc' }],
    });

    res.json(products);
  } catch (error) {
    console.error('Get my products error:', error);
    res.status(500).json({ error: 'Failed to get products' });
  }
};

export const getCategories = async (req: Request, res: Response) => {
  try {
    const categories = [
      { id: 'vegetables', name: 'Légumes', nameAr: 'خضروات' },
      { id: 'herbs', name: 'Herbes aromatiques', nameAr: 'أعشاب' },
      { id: 'fruits', name: 'Fruits', nameAr: 'فواكه' },
      { id: 'eggs', name: 'Oeufs', nameAr: 'بيض' },
      { id: 'honey', name: 'Miel', nameAr: 'عسل' },
      { id: 'olive-oil', name: 'Huile d\'olive', nameAr: 'زيت زيتون' },
      { id: 'dairy', name: 'Produits laitiers', nameAr: 'منتجات الألبان' },
      { id: 'other', name: 'Autres', nameAr: 'أخرى' },
    ];

    res.json(categories);
  } catch (error) {
    console.error('Get categories error:', error);
    res.status(500).json({ error: 'Failed to get categories' });
  }
};
