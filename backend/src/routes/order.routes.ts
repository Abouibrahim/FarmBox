import { Router } from 'express';
import {
  createOrder,
  getMyOrders,
  getOrderById,
  getFarmOrders,
  updateOrderStatus,
  cancelOrder,
  getDeliverySchedule,
  // Unified order endpoints
  createUnifiedOrder,
  getMyUnifiedOrders,
  getUnifiedOrderById,
  getUnifiedOrderByNumber,
  cancelUnifiedOrder,
} from '../controllers/order.controller';
import { authenticate, requireRole } from '../middleware/auth.middleware';

const router = Router();

// Public routes
router.get('/delivery-schedule', getDeliverySchedule);

// Unified order routes (multi-farm orders)
router.post('/unified', authenticate, createUnifiedOrder);
router.get('/unified/my', authenticate, getMyUnifiedOrders);
router.get('/unified/number/:orderNumber', authenticate, getUnifiedOrderByNumber);
router.get('/unified/:id', authenticate, getUnifiedOrderById);
router.patch('/unified/:id/cancel', authenticate, cancelUnifiedOrder);

// Legacy single-farm order routes (kept for backwards compatibility)
router.post('/', authenticate, createOrder);
router.get('/my-orders', authenticate, getMyOrders);
router.get('/:id', authenticate, getOrderById);
router.post('/:id/cancel', authenticate, cancelOrder);

// Farmer routes
router.get('/farm/orders', authenticate, requireRole('FARMER'), getFarmOrders);
router.patch('/:id/status', authenticate, requireRole('FARMER'), updateOrderStatus);

export default router;
