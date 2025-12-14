import { Router } from 'express';
import {
  getFeaturedProducts,
  getPopularProducts,
  getSeasonalProducts,
  searchProducts,
  getProductsByCategory,
  recordProductView,
  recordCartAdd,
  getSimilarProducts,
  getProductsByFarm,
} from '../controllers/product-discovery.controller';

const router = Router();

// Product Discovery Endpoints (public)
router.get('/featured', getFeaturedProducts);
router.get('/popular', getPopularProducts);
router.get('/seasonal', getSeasonalProducts);
router.get('/search', searchProducts);
router.get('/category/:slug', getProductsByCategory);
router.get('/farm/:farmId', getProductsByFarm);
router.get('/:id/similar', getSimilarProducts);

// Analytics (can be called by anyone, no auth required)
router.post('/:id/view', recordProductView);
router.post('/:id/cart-add', recordCartAdd);

export default router;
