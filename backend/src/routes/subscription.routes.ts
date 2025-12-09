import { Router } from 'express';
import { authenticate } from '../middleware/auth.middleware';
import {
  createSubscription,
  getMySubscriptions,
  getSubscriptionById,
  updateSubscription,
  pauseSubscription,
  resumeSubscription,
  skipDelivery,
  unskipDelivery,
  cancelSubscription,
} from '../controllers/subscription.controller';

const router = Router();

// All routes require authentication
router.use(authenticate);

// CRUD operations
router.post('/', createSubscription);
router.get('/my', getMySubscriptions);
router.get('/:id', getSubscriptionById);
router.patch('/:id', updateSubscription);
router.delete('/:id', cancelSubscription);

// Pause/Resume
router.post('/:id/pause', pauseSubscription);
router.delete('/:id/pause', resumeSubscription);

// Skip/Unskip
router.post('/:id/skip', skipDelivery);
router.delete('/:id/skip/:date', unskipDelivery);

export default router;
