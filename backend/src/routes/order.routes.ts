import { Router } from 'express';
import {
  createOrder,
  getMyOrders,
  getOrderById,
  getFarmOrders,
  updateOrderStatus,
  cancelOrder,
  getDeliverySchedule,
} from '../controllers/order.controller';
import { authenticate, requireRole } from '../middleware/auth.middleware';

const router = Router();

// Public routes
router.get('/delivery-schedule', getDeliverySchedule);

// Customer routes
router.post('/', authenticate, createOrder);
router.get('/my-orders', authenticate, getMyOrders);
router.get('/:id', authenticate, getOrderById);
router.post('/:id/cancel', authenticate, cancelOrder);

// Farmer routes
router.get('/farm/orders', authenticate, requireRole('FARMER'), getFarmOrders);
router.patch('/:id/status', authenticate, requireRole('FARMER'), updateOrderStatus);

export default router;
