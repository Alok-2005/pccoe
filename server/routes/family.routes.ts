// File: server/src/routes/family.routes.ts
import { Router } from 'express';
import { body } from 'express-validator';
import * as familyController from '../controllers/family.controller';
import { authenticate } from '../middleware/auth';

const router = Router();

// Create family
router.post('/',
  authenticate,
  [
    body('name').trim().notEmpty(),
    body('members').isArray()
  ],
  familyController.createFamily
);

// Get family details
router.get('/:familyId', authenticate, familyController.getFamily);

// Add family member
router.post('/:familyId/members',
  authenticate,
  [
    body('name').trim().notEmpty(),
    body('age').isInt({ min: 0, max: 150 }),
    body('relation').trim().notEmpty()
  ],
  familyController.addMember
);

// Update member
router.put('/:familyId/members/:memberId', authenticate, familyController.updateMember);

// Get family alerts
router.get('/:familyId/alerts', authenticate, familyController.getFamilyAlerts);

export default router;