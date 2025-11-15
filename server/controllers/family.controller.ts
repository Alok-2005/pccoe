// File: server/src/controllers/family.controller.ts
import { Request, Response } from 'express';
import { validationResult } from 'express-validator';
import Family from '../models/Family';
import User from '../models/User';
import Prediction from '../models/Prediction';
import { logger } from '../utils/logger';

export const createFamily = async (req: Request, res: Response) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const userId = req.user?.userId;
    const { name, members, sharedLocation } = req.body;

    // Check if user already has a family
    const existingFamily = await Family.findOne({ adminUserId: userId });
    if (existingFamily) {
      return res.status(400).json({ error: 'User already has a family group' });
    }

    const family = new Family({
      name,
      adminUserId: userId,
      members: members || [],
      sharedLocation
    });

    await family.save();

    // Update user's familyId
    await User.findByIdAndUpdate(userId, { familyId: family._id });

    logger.info(`Family created by user ${userId}`);

    res.status(201).json({ family });
  } catch (error) {
    logger.error('Create family error:', error);
    res.status(500).json({ error: 'Failed to create family' });
  }
};

export const getFamily = async (req: Request, res: Response) => {
  try {
    const { familyId } = req.params;

    const family = await Family.findById(familyId)
      .populate('adminUserId', 'name email')
      .populate('members.userId', 'name email');

    if (!family) {
      return res.status(404).json({ error: 'Family not found' });
    }

    // Verify access
    if (family.adminUserId._id.toString() !== req.user?.userId && req.user?.role !== 'ngo_admin') {
      return res.status(403).json({ error: 'Access denied' });
    }

    res.json({ family });
  } catch (error) {
    logger.error('Get family error:', error);
    res.status(500).json({ error: 'Failed to get family' });
  }
};

export const addMember = async (req: Request, res: Response) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { familyId } = req.params;
    const { name, age, relation, healthProfile } = req.body;

    const family = await Family.findById(familyId);
    if (!family) {
      return res.status(404).json({ error: 'Family not found' });
    }

    // Verify admin access
    if (family.adminUserId.toString() !== req.user?.userId) {
      return res.status(403).json({ error: 'Only family admin can add members' });
    }

    family.members.push({
      name,
      age,
      relation,
      healthProfile: healthProfile || {
        comorbidities: [],
        allergies: []
      }
    });

    await family.save();

    logger.info(`Member added to family ${familyId}`);

    res.status(201).json({ family });
  } catch (error) {
    logger.error('Add member error:', error);
    res.status(500).json({ error: 'Failed to add member' });
  }
};

export const updateMember = async (req: Request, res: Response) => {
  try {
    const { familyId, memberId } = req.params;
    const updates = req.body;

    const family = await Family.findById(familyId);
    if (!family) {
      return res.status(404).json({ error: 'Family not found' });
    }

    // Verify admin access
    if (family.adminUserId.toString() !== req.user?.userId) {
      return res.status(403).json({ error: 'Only family admin can update members' });
    }

    const member = family.members.find(m => m._id?.toString() === memberId);
    if (!member) {
      return res.status(404).json({ error: 'Member not found' });
    }

    Object.assign(member, updates);
    await family.save();

    res.json({ family });
  } catch (error) {
    logger.error('Update member error:', error);
    res.status(500).json({ error: 'Failed to update member' });
  }
};

export const getFamilyAlerts = async (req: Request, res: Response) => {
  try {
    const { familyId } = req.params;

    const family = await Family.findById(familyId);
    if (!family) {
      return res.status(404).json({ error: 'Family not found' });
    }

    // Verify access
    if (family.adminUserId.toString() !== req.user?.userId && req.user?.role !== 'ngo_admin') {
      return res.status(403).json({ error: 'Access denied' });
    }

    // Get predictions for family location
    const predictions = await Prediction.find({
      'location.city': family.sharedLocation?.city || family.adminUserId
    })
      .sort({ createdAt: -1 })
      .limit(10);

    // Generate alerts based on family members' needs
    const alerts = predictions
      .filter(p => p.riskScores.overall > 60)
      .map(p => {
        const affectedMembers = family.members.filter(member => {
          // Children and elderly are more vulnerable
          if (member.age < 12 || member.age > 65) return true;
          // Members with comorbidities
          if (member.healthProfile.comorbidities.length > 0) return true;
          return false;
        });

        return {
          predictionId: p._id,
          riskLevel: p.riskScores.overall,
          affectedMembers: affectedMembers.map(m => ({ name: m.name, age: m.age })),
          recommendations: p.recommendations.filter(r => r.priority === 'high' || r.priority === 'critical'),
          timestamp: p.createdAt
        };
      });

    res.json({ alerts, count: alerts.length });
  } catch (error) {
    logger.error('Get family alerts error:', error);
    res.status(500).json({ error: 'Failed to get family alerts' });
  }
};