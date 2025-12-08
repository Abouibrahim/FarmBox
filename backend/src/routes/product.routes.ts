import { Router } from 'express';
import {
  getProducts,
  getProductById,
  createProduct,
  updateProduct,
  deleteProduct,
  toggleProductAvailability,
  getMyProducts,
  getCategories,
} from '../controllers/product.controller';
import { authenticate, requireRole } from '../middleware/auth.middleware';

const router = Router();

// Public routes
router.get('/', getProducts);
router.get('/categories', getCategories);
router.get('/:id', getProductById);

// Protected routes (farmers only)
router.get('/me/products', authenticate, requireRole('FARMER'), getMyProducts);
router.post('/', authenticate, requireRole('FARMER'), createProduct);
router.put('/:id', authenticate, requireRole('FARMER'), updateProduct);
router.patch('/:id/toggle', authenticate, requireRole('FARMER'), toggleProductAvailability);
router.delete('/:id', authenticate, requireRole('FARMER'), deleteProduct);

export default router;
