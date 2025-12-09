import { Router } from 'express';
import { authenticate, requireRole } from '../middleware/auth.middleware';
import {
  createQualityReport,
  getMyQualityReports,
  getQualityReportById,
  getMyCredits,
  getCreditHistory,
  submitSurvey,
  getMySurveys,
  getOrdersPendingSurvey,
  getAdminQualityReports,
  resolveQualityReport,
} from '../controllers/quality.controller';

const router = Router();

// All routes require authentication
router.use(authenticate);

// Quality reports
router.post('/reports', createQualityReport);
router.get('/reports/my', getMyQualityReports);
router.get('/reports/:id', getQualityReportById);

// Credits
router.get('/credits/my', getMyCredits);
router.get('/credits/history', getCreditHistory);

// Surveys
router.post('/surveys', submitSurvey);
router.get('/surveys/my', getMySurveys);
router.get('/surveys/pending', getOrdersPendingSurvey);

// Admin routes
router.get('/admin/reports', requireRole('ADMIN'), getAdminQualityReports);
router.patch('/admin/reports/:id', requireRole('ADMIN'), resolveQualityReport);

export default router;
