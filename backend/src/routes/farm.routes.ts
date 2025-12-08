import { Router } from 'express';
import {
  getAllFarms,
  getFarmBySlug,
  createFarm,
  updateFarm,
  getMyFarm,
  getFarmStats,
} from '../controllers/farm.controller';
import { authenticate, requireRole } from '../middleware/auth.middleware';

const router = Router();

// Public routes
router.get('/', getAllFarms);
router.get('/:slug', getFarmBySlug);

// Protected routes
router.post('/', authenticate, createFarm);

// Farmer routes
router.get('/me/farm', authenticate, getMyFarm);
router.get('/me/stats', authenticate, requireRole('FARMER'), getFarmStats);
router.put('/:id', authenticate, requireRole('FARMER'), updateFarm);

export default router;
