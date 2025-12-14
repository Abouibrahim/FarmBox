import { Router } from 'express';
import {
  createCategorySubscription,
  getMyCategorySubscriptions,
  getCategorySubscriptionById,
  updateCategorySubscription,
  cancelCategorySubscription,
  pauseCategorySubscription,
  resumeCategorySubscription,
  skipCategoryDelivery,
  unskipCategoryDelivery,
  previewNextBox,
  getSubscriptionCategories,
} from '../controllers/category-subscription.controller';
import { authenticate } from '../middleware/auth.middleware';

const router = Router();

// Public routes
router.get('/categories', getSubscriptionCategories);

// Authenticated routes
router.post('/', authenticate, createCategorySubscription);
router.get('/my', authenticate, getMyCategorySubscriptions);
router.get('/:id', authenticate, getCategorySubscriptionById);
router.patch('/:id', authenticate, updateCategorySubscription);
router.delete('/:id', authenticate, cancelCategorySubscription);

// Pause/Resume
router.post('/:id/pause', authenticate, pauseCategorySubscription);
router.delete('/:id/pause', authenticate, resumeCategorySubscription);

// Skip/Unskip
router.post('/:id/skip', authenticate, skipCategoryDelivery);
router.delete('/:id/skip/:date', authenticate, unskipCategoryDelivery);

// Preview
router.get('/:id/preview', authenticate, previewNextBox);

export default router;
