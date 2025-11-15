// File: server/src/routes/environment.routes.ts
import { Router } from 'express';
import { query } from 'express-validator';
import * as environmentController from '../controllers/environment.controller';
import { authenticate } from '../middleware/auth';

const router = Router();

// Get environment data by city
router.get('/:city', authenticate, environmentController.getByCity);

// Get environment data by coordinates
router.get('/coords',
  authenticate,
  [
    query('lat').isFloat(),
    query('lng').isFloat()
  ],
  environmentController.getByCoordinates
);

export default router;