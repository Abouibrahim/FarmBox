import { Request, Response } from 'express';
import prisma from '../config/database';

// GET /api/products/featured - Homepage featured products
export const getFeaturedProducts = async (req: Request, res: Response) => {
  try {
    const { limit = '8' } = req.query;

    const featuredProducts = await prisma.featuredProduct.findMany({
      where: {
        isActive: true,
        OR: [
          { featuredUntil: null },
          { featuredUntil: { gte: new Date() } },
        ],
      },
      include: {
        product: {
          include: {
            farm: {
              select: { id: true, name: true, slug: true, city: true },
            },
          },
        },
      },
      orderBy: { position: 'asc' },
      take: parseInt(limit as string),
    });

    // If not enough featured products, fill with popular ones
    const products = featuredProducts.map((fp) => fp.product);

    if (products.length < parseInt(limit as string)) {
      const additionalProducts = await prisma.product.findMany({
        where: {
          isAvailable: true,
          id: { notIn: products.map((p) => p.id) },
        },
        include: {
          farm: {
            select: { id: true, name: true, slug: true, city: true },
          },
          popularity: true,
        },
        orderBy: { popularity: { score: 'desc' } },
        take: parseInt(limit as string) - products.length,
      });

      products.push(...additionalProducts);
    }

    res.json(products);
  } catch (error) {
    console.error('Get featured products error:', error);
    res.status(500).json({ error: 'Failed to get featured products' });
  }
};

// GET /api/products/popular - Best sellers by popularity score
export const getPopularProducts = async (req: Request, res: Response) => {
  try {
    const { limit = '20', category } = req.query;

    const products = await prisma.product.findMany({
      where: {
        isAvailable: true,
        ...(category && { category: category as string }),
      },
      include: {
        farm: {
          select: { id: true, name: true, slug: true, city: true },
        },
        popularity: true,
      },
      orderBy: [
        { popularity: { score: 'desc' } },
        { createdAt: 'desc' },
      ],
      take: parseInt(limit as string),
    });

    res.json(products);
  } catch (error) {
    console.error('Get popular products error:', error);
    res.status(500).json({ error: 'Failed to get popular products' });
  }
};

// GET /api/products/seasonal - Currently in-season products
export const getSeasonalProducts = async (req: Request, res: Response) => {
  try {
    const { limit = '20', category } = req.query;
    const currentMonth = new Date().getMonth() + 1; // 1-12

    const products = await prisma.product.findMany({
      where: {
        isAvailable: true,
        ...(category && { category: category as string }),
        OR: [
          // Products with no season defined (always available)
          {
            seasonStart: null,
            seasonEnd: null,
          },
          // Products within their season (handles wrap-around like Nov-Feb)
          {
            AND: [
              { seasonStart: { not: null } },
              { seasonEnd: { not: null } },
              {
                OR: [
                  // Normal range (e.g., Mar-Sep)
                  {
                    seasonStart: { lte: currentMonth },
                    seasonEnd: { gte: currentMonth },
                  },
                  // Wrap-around range (e.g., Nov-Feb)
                  {
                    seasonStart: { gt: prisma.product.fields.seasonEnd },
                    OR: [
                      { seasonStart: { lte: currentMonth } },
                      { seasonEnd: { gte: currentMonth } },
                    ],
                  },
                ],
              },
            ],
          },
        ],
      },
      include: {
        farm: {
          select: { id: true, name: true, slug: true, city: true },
        },
        popularity: true,
      },
      orderBy: [{ popularity: { score: 'desc' } }, { name: 'asc' }],
      take: parseInt(limit as string),
    });

    res.json(products);
  } catch (error) {
    console.error('Get seasonal products error:', error);
    res.status(500).json({ error: 'Failed to get seasonal products' });
  }
};

// GET /api/products/search - Full-text search with filters
export const searchProducts = async (req: Request, res: Response) => {
  try {
    const {
      q,
      category,
      priceMin,
      priceMax,
      farmId,
      sort = 'relevance',
      limit = '20',
      offset = '0',
    } = req.query;

    const searchQuery = q as string | undefined;

    // Build sort order
    let orderBy: any[] = [];
    switch (sort) {
      case 'price_asc':
        orderBy = [{ price: 'asc' }];
        break;
      case 'price_desc':
        orderBy = [{ price: 'desc' }];
        break;
      case 'newest':
        orderBy = [{ createdAt: 'desc' }];
        break;
      case 'popularity':
        orderBy = [{ popularity: { score: 'desc' } }];
        break;
      default: // relevance - newest with popularity boost
        orderBy = [{ popularity: { score: 'desc' } }, { createdAt: 'desc' }];
    }

    const products = await prisma.product.findMany({
      where: {
        isAvailable: true,
        ...(searchQuery && {
          OR: [
            { name: { contains: searchQuery, mode: 'insensitive' } },
            { nameAr: { contains: searchQuery, mode: 'insensitive' } },
            { description: { contains: searchQuery, mode: 'insensitive' } },
            { category: { contains: searchQuery, mode: 'insensitive' } },
          ],
        }),
        ...(category && { category: category as string }),
        ...(farmId && { farmId: farmId as string }),
        ...(priceMin || priceMax
          ? {
              price: {
                ...(priceMin && { gte: parseFloat(priceMin as string) }),
                ...(priceMax && { lte: parseFloat(priceMax as string) }),
              },
            }
          : {}),
      },
      include: {
        farm: {
          select: { id: true, name: true, slug: true, city: true },
        },
        popularity: true,
      },
      orderBy,
      take: parseInt(limit as string),
      skip: parseInt(offset as string),
    });

    // Get total count for pagination
    const total = await prisma.product.count({
      where: {
        isAvailable: true,
        ...(searchQuery && {
          OR: [
            { name: { contains: searchQuery, mode: 'insensitive' } },
            { nameAr: { contains: searchQuery, mode: 'insensitive' } },
            { description: { contains: searchQuery, mode: 'insensitive' } },
            { category: { contains: searchQuery, mode: 'insensitive' } },
          ],
        }),
        ...(category && { category: category as string }),
        ...(farmId && { farmId: farmId as string }),
        ...(priceMin || priceMax
          ? {
              price: {
                ...(priceMin && { gte: parseFloat(priceMin as string) }),
                ...(priceMax && { lte: parseFloat(priceMax as string) }),
              },
            }
          : {}),
      },
    });

    res.json({
      products,
      pagination: {
        total,
        limit: parseInt(limit as string),
        offset: parseInt(offset as string),
        hasMore: parseInt(offset as string) + products.length < total,
      },
    });
  } catch (error) {
    console.error('Search products error:', error);
    res.status(500).json({ error: 'Failed to search products' });
  }
};

// GET /api/products/category/:slug - Category listing with pagination
export const getProductsByCategory = async (req: Request, res: Response) => {
  try {
    const { slug } = req.params;
    const {
      sort = 'popularity',
      limit = '20',
      offset = '0',
      priceMin,
      priceMax,
      farmId,
    } = req.query;

    // Build sort order
    let orderBy: any[] = [];
    switch (sort) {
      case 'price_asc':
        orderBy = [{ price: 'asc' }];
        break;
      case 'price_desc':
        orderBy = [{ price: 'desc' }];
        break;
      case 'newest':
        orderBy = [{ createdAt: 'desc' }];
        break;
      default: // popularity
        orderBy = [{ popularity: { score: 'desc' } }, { name: 'asc' }];
    }

    const products = await prisma.product.findMany({
      where: {
        category: slug,
        isAvailable: true,
        ...(farmId && { farmId: farmId as string }),
        ...(priceMin || priceMax
          ? {
              price: {
                ...(priceMin && { gte: parseFloat(priceMin as string) }),
                ...(priceMax && { lte: parseFloat(priceMax as string) }),
              },
            }
          : {}),
      },
      include: {
        farm: {
          select: { id: true, name: true, slug: true, city: true },
        },
        popularity: true,
      },
      orderBy,
      take: parseInt(limit as string),
      skip: parseInt(offset as string),
    });

    // Get total count for pagination
    const total = await prisma.product.count({
      where: {
        category: slug,
        isAvailable: true,
        ...(farmId && { farmId: farmId as string }),
        ...(priceMin || priceMax
          ? {
              price: {
                ...(priceMin && { gte: parseFloat(priceMin as string) }),
                ...(priceMax && { lte: parseFloat(priceMax as string) }),
              },
            }
          : {}),
      },
    });

    res.json({
      category: slug,
      products,
      pagination: {
        total,
        limit: parseInt(limit as string),
        offset: parseInt(offset as string),
        hasMore: parseInt(offset as string) + products.length < total,
      },
    });
  } catch (error) {
    console.error('Get products by category error:', error);
    res.status(500).json({ error: 'Failed to get products by category' });
  }
};

// POST /api/products/:id/view - Record view for analytics
export const recordProductView = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    // Upsert popularity record
    await prisma.productPopularity.upsert({
      where: { productId: id },
      create: {
        productId: id,
        viewCount: 1,
        score: 1, // Initial score from view
      },
      update: {
        viewCount: { increment: 1 },
        score: { increment: 0.1 }, // Small score boost per view
      },
    });

    res.json({ success: true });
  } catch (error) {
    console.error('Record product view error:', error);
    res.status(500).json({ error: 'Failed to record product view' });
  }
};

// POST /api/products/:id/cart-add - Record cart add for analytics
export const recordCartAdd = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    // Upsert popularity record
    await prisma.productPopularity.upsert({
      where: { productId: id },
      create: {
        productId: id,
        cartAddCount: 1,
        score: 2, // Cart add is worth more than view
      },
      update: {
        cartAddCount: { increment: 1 },
        score: { increment: 0.5 }, // Medium score boost per cart add
      },
    });

    res.json({ success: true });
  } catch (error) {
    console.error('Record cart add error:', error);
    res.status(500).json({ error: 'Failed to record cart add' });
  }
};

// GET /api/products/:id/similar - Get similar products
export const getSimilarProducts = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { limit = '4' } = req.query;

    // Get the original product
    const product = await prisma.product.findUnique({
      where: { id },
      select: { category: true, farmId: true },
    });

    if (!product) {
      return res.status(404).json({ error: 'Product not found' });
    }

    // Find similar products (same category, different product)
    const similarProducts = await prisma.product.findMany({
      where: {
        id: { not: id },
        category: product.category,
        isAvailable: true,
      },
      include: {
        farm: {
          select: { id: true, name: true, slug: true, city: true },
        },
        popularity: true,
      },
      orderBy: [{ popularity: { score: 'desc' } }],
      take: parseInt(limit as string),
    });

    res.json(similarProducts);
  } catch (error) {
    console.error('Get similar products error:', error);
    res.status(500).json({ error: 'Failed to get similar products' });
  }
};

// GET /api/products/farm/:farmId - Products from same farm
export const getProductsByFarm = async (req: Request, res: Response) => {
  try {
    const { farmId } = req.params;
    const { excludeId, limit = '4' } = req.query;

    const products = await prisma.product.findMany({
      where: {
        farmId,
        isAvailable: true,
        ...(excludeId && { id: { not: excludeId as string } }),
      },
      include: {
        farm: {
          select: { id: true, name: true, slug: true, city: true },
        },
        popularity: true,
      },
      orderBy: [{ popularity: { score: 'desc' } }],
      take: parseInt(limit as string),
    });

    res.json(products);
  } catch (error) {
    console.error('Get products by farm error:', error);
    res.status(500).json({ error: 'Failed to get products by farm' });
  }
};
