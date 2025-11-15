// File: server/src/controllers/assistant.controller.ts
import { Request, Response } from 'express';
import { validationResult } from 'express-validator';
import Conversation from '../models/Conversation';
import User from '../models/User';
import { getChatResponse } from '../services/rag.service';
import { logger } from '../utils/logger';

export const chat = async (req: Request, res: Response) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const userId = req.user?.userId;
    const { message, conversationId } = req.body;

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Get or create conversation
    let conversation;
    if (conversationId) {
      conversation = await Conversation.findById(conversationId);
      if (!conversation || conversation.userId.toString() !== userId) {
        return res.status(404).json({ error: 'Conversation not found' });
      }
    } else {
      conversation = new Conversation({
        userId,
        messages: [],
        context: {
          location: user.location.city,
          userHealth: user.healthProfile.comorbidities
        }
      });
    }

    // Add user message
    conversation.messages.push({
      role: 'user',
      content: message,
      timestamp: new Date()
    });

    // Get AI response using RAG
    const response = await getChatResponse(user, conversation, message);

    // Add assistant message
    conversation.messages.push({
      role: 'assistant',
      content: response.content,
      timestamp: new Date(),
      evidence: response.evidence
    });

    await conversation.save();

    logger.info(`Chat response generated for user ${userId}`);

    res.json({
      conversationId: conversation._id,
      response: response.content,
      evidence: response.evidence,
      timestamp: new Date()
    });
  } catch (error) {
    logger.error('Chat error:', error);
    res.status(500).json({ error: 'Failed to process chat' });
  }
};

export const getHistory = async (req: Request, res: Response) => {
  try {
    const { userId } = req.params;

    // Verify access
    if (req.user?.userId !== userId && req.user?.role !== 'ngo_admin') {
      return res.status(403).json({ error: 'Access denied' });
    }

    const conversations = await Conversation.find({ userId })
      .sort({ updatedAt: -1 })
      .limit(10);

    res.json({ conversations, count: conversations.length });
  } catch (error) {
    logger.error('Get history error:', error);
    res.status(500).json({ error: 'Failed to get history' });
  }
};

export const clearConversation = async (req: Request, res: Response) => {
  try {
    const { conversationId } = req.params;

    const conversation = await Conversation.findById(conversationId);
    if (!conversation) {
      return res.status(404).json({ error: 'Conversation not found' });
    }

    // Verify access
    if (conversation.userId.toString() !== req.user?.userId) {
      return res.status(403).json({ error: 'Access denied' });
    }

    await conversation.deleteOne();

    res.json({ message: 'Conversation deleted successfully' });
  } catch (error) {
    logger.error('Clear conversation error:', error);
    res.status(500).json({ error: 'Failed to clear conversation' });
  }
};