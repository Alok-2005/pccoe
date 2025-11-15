// File: server/src/routes/admin.routes.ts
import { Router } from 'express';
import * as adminController from '../controllers/admin.controller';
import { authenticate, requireRole } from '../middleware/auth';

const router = Router();

// All admin routes require ngo_admin role
router.use(authenticate, requireRole(['ngo_admin']));

// Get dashboard statistics
router.get('/dashboard', adminController.getDashboard);

// Get risk heatmap data
router.get('/risk-heatmap', adminController.getRiskHeatmap);

// Upload dataset for RAG
router.post('/datasets', adminController.uploadDataset);

// Get system logs
router.get('/logs', adminController.getLogs);

export default router;