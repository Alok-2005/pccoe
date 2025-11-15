// File: server/src/routes/predict.routes.ts
import { Router } from 'express';
import { body } from 'express-validator';
import * as predictController from '../controllers/predict.controller';
import { authenticate } from '../middleware/auth';

const router = Router();

// Get risk prediction
router.post('/',
  authenticate,
  [
    body('city').optional().trim(),
    body('coordinates').optional().isObject()
  ],
  predictController.getPrediction
);

// Get prediction history
router.get('/history/:userId', authenticate, predictController.getHistory);

// Get aggregated statistics
router.get('/stats', authenticate, predictController.getStats);

export default router;