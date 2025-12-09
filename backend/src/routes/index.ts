import { Router } from 'express';
import authRoutes from './auth.routes';
import farmRoutes from './farm.routes';
import productRoutes from './product.routes';
import orderRoutes from './order.routes';
import subscriptionRoutes from './subscription.routes';
import qualityRoutes from './quality.routes';
import trialRoutes from './trial.routes';

const router = Router();

// API Routes
router.use('/auth', authRoutes);
router.use('/farms', farmRoutes);
router.use('/products', productRoutes);
router.use('/orders', orderRoutes);
router.use('/subscriptions', subscriptionRoutes);
router.use('/quality', qualityRoutes);
router.use('/trial-boxes', trialRoutes);

// API Info
router.get('/', (req, res) => {
  res.json({
    name: 'FarmBox API',
    version: '1.0.0',
    description: 'Local Organic CSA Marketplace API - Tunisia',
    endpoints: {
      auth: '/api/auth',
      farms: '/api/farms',
      products: '/api/products',
      orders: '/api/orders',
      subscriptions: '/api/subscriptions',
      quality: '/api/quality',
      trialBoxes: '/api/trial-boxes',
    },
  });
});

export default router;
