// File: server/src/routes/index.ts
import { Router } from 'express';
import authRoutes from './auth.routes';
import predictRoutes from './predict.routes';
import reportRoutes from './report.routes';
import familyRoutes from './family.routes';
import assistantRoutes from './assistant.routes';
import environmentRoutes from './environment.routes';
import adminRoutes from './admin.routes';

const router = Router();

router.use('/auth', authRoutes);
router.use('/predict', predictRoutes);
router.use('/reports', reportRoutes);
router.use('/families', familyRoutes);
router.use('/assistant', assistantRoutes);
router.use('/environment', environmentRoutes);
router.use('/admin', adminRoutes);

export default router;