// File: server/src/routes/assistant.routes.ts
import { Router } from 'express';
import { body } from 'express-validator';
import * as assistantController from '../controllers/assistant.controller';
import { authenticate } from '../middleware/auth';

const router = Router();

// Chat with assistant
router.post('/chat',
  authenticate,
  [
    body('message').trim().notEmpty(),
    body('conversationId').optional().trim()
  ],
  assistantController.chat
);

// Get chat history
router.get('/history/:userId', authenticate, assistantController.getHistory);

// Clear conversation
router.delete('/conversation/:conversationId', authenticate, assistantController.clearConversation);

export default router;