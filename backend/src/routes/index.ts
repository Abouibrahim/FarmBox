import { Router } from 'express';
import authRoutes from './auth.routes';
import farmRoutes from './farm.routes';
import productRoutes from './product.routes';
import productDiscoveryRoutes from './product-discovery.routes';
import orderRoutes from './order.routes';
import subscriptionRoutes from './subscription.routes';
import categorySubscriptionRoutes from './category-subscription.routes';
import qualityRoutes from './quality.routes';
import trialRoutes from './trial.routes';

const router = Router();

// API Routes
router.use('/auth', authRoutes);
router.use('/farms', farmRoutes);
// Product discovery routes MUST come before generic product routes
// to ensure /featured, /popular, etc. are matched before /:id
router.use('/products', productDiscoveryRoutes); // Product discovery endpoints
router.use('/products', productRoutes);
router.use('/orders', orderRoutes);
router.use('/subscriptions', subscriptionRoutes); // Legacy farm-based subscriptions
router.use('/category-subscriptions', categorySubscriptionRoutes); // New category-based subscriptions
router.use('/quality', qualityRoutes);
router.use('/trial-boxes', trialRoutes);

// API Info
router.get('/', (req, res) => {
  res.json({
    name: 'FarmBox API',
    version: '2.0.0',
    description: 'Local Organic CSA Marketplace API - Tunisia (Product-First)',
    endpoints: {
      auth: '/api/auth',
      farms: '/api/farms',
      products: '/api/products',
      productDiscovery: {
        featured: '/api/products/featured',
        popular: '/api/products/popular',
        seasonal: '/api/products/seasonal',
        search: '/api/products/search',
        category: '/api/products/category/:slug',
      },
      orders: '/api/orders',
      unifiedOrders: {
        create: 'POST /api/orders/unified',
        myOrders: 'GET /api/orders/unified/my',
        getById: 'GET /api/orders/unified/:id',
        cancel: 'PATCH /api/orders/unified/:id/cancel',
      },
      subscriptions: '/api/subscriptions',
      categorySubscriptions: {
        categories: 'GET /api/category-subscriptions/categories',
        create: 'POST /api/category-subscriptions',
        my: 'GET /api/category-subscriptions/my',
        pause: 'POST /api/category-subscriptions/:id/pause',
        skip: 'POST /api/category-subscriptions/:id/skip',
        preview: 'GET /api/category-subscriptions/:id/preview',
      },
      quality: '/api/quality',
      trialBoxes: '/api/trial-boxes',
    },
  });
});

export default router;
