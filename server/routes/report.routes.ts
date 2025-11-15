// File: server/src/routes/report.routes.ts
import { Router } from 'express';
import * as reportController from '../controllers/report.controller';
import { authenticate } from '../middleware/auth';

const router = Router();

// Generate report
router.post('/generate', authenticate, reportController.generateReport);

// Get user reports
router.get('/user/:userId', authenticate, reportController.getUserReports);

// Download specific report
router.get('/:reportId', authenticate, reportController.downloadReport);

export default router;