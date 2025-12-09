import { Router } from 'express';
import { authenticate } from '../middleware/auth.middleware';
import {
  createTrialBox,
  getMyTrialBoxes,
  getTrialBoxById,
  checkTrialAvailability,
  convertTrialToSubscription,
  getAvailableFarmsForTrial,
} from '../controllers/trial.controller';

const router = Router();

// All routes require authentication
router.use(authenticate);

// Trial box operations
router.post('/', createTrialBox);
router.get('/my', getMyTrialBoxes);
router.get('/available-farms', getAvailableFarmsForTrial);
router.get('/check/:farmId', checkTrialAvailability);
router.get('/:id', getTrialBoxById);
router.post('/:id/convert', convertTrialToSubscription);

export default router;
