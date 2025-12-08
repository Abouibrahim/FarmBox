import { Router } from 'express';
import authRoutes from './auth.routes';
import farmRoutes from './farm.routes';
import productRoutes from './product.routes';
import orderRoutes from './order.routes';

const router = Router();

// API Routes
router.use('/auth', authRoutes);
router.use('/farms', farmRoutes);
router.use('/products', productRoutes);
router.use('/orders', orderRoutes);

// API Info
router.get('/', (req, res) => {
  res.json({
    name: 'FarmBox API',
    version: '1.0.0',
    description: 'Local Organic CSA Marketplace API',
    endpoints: {
      auth: '/api/auth',
      farms: '/api/farms',
      products: '/api/products',
      orders: '/api/orders',
    },
  });
});

export default router;
