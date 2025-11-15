// File: server/src/controllers/auth.controller.ts
import { Request, Response } from 'express';
import { validationResult } from 'express-validator';
import jwt, { Secret, SignOptions } from 'jsonwebtoken';
import User from '../models/User';
import { logger } from '../utils/logger';

const JWT_SECRET: Secret = process.env.JWT_SECRET || 'your-secret-key';
const JWT_EXPIRES_IN =  '7d';

export const register = async (req: Request, res: Response) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { email, password, name, location, role, healthProfile } = req.body;

    // Check if user exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ error: 'User already exists' });
    }

    // Create user
    const user = new User({
      email,
      password,
      name,
      location,
      role: role || 'citizen',
      healthProfile: healthProfile || {
        comorbidities: [],
        allergies: [],
        medications: []
      }
    });

    await user.save();

    // Generate token
    const signOptions: SignOptions = { expiresIn: JWT_EXPIRES_IN };
    const token = jwt.sign(
      { userId: user._id, role: user.role },
      JWT_SECRET,
      signOptions
    );

    logger.info(`User registered: ${email}`);

    res.status(201).json({
      token,
      user: {
        id: user._id,
        email: user.email,
        name: user.name,
        role: user.role,
        location: user.location
      }
    });
  } catch (error) {
    logger.error('Registration error:', error);
    res.status(500).json({ error: 'Registration failed' });
  }
};

export const login = async (req: Request, res: Response) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { email, password } = req.body;

    // Find user
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    // Check password
    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }
    // Generate token
    const signOptions: SignOptions = { expiresIn: JWT_EXPIRES_IN  };
    const token = jwt.sign(
      { userId: user._id, role: user.role },
      JWT_SECRET,
      signOptions
    );

    logger.info(`User logged in: ${email}`);

    res.json({
      token,
      user: {
        id: user._id,
        email: user.email,
        name: user.name,
        role: user.role,
        location: user.location,
        familyId: user.familyId
      }
    });
  } catch (error) {
    logger.error('Login error:', error);
    res.status(500).json({ error: 'Login failed' });
  }
};

export const getCurrentUser = async (req: Request, res: Response) => {
  try {
    const user = await User.findById(req.user?.userId)
      .select('-password')
      .populate('familyId');

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.json({ user });
  } catch (error) {
    logger.error('Get current user error:', error);
    res.status(500).json({ error: 'Failed to get user' });
  }
};

export const updateProfile = async (req: Request, res: Response) => {
  try {
    const { name, location, healthProfile, notificationPreferences } = req.body;

    const user = await User.findById(req.user?.userId);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    if (name) user.name = name;
    if (location) user.location = location;
    if (healthProfile) user.healthProfile = { ...user.healthProfile, ...healthProfile };
    if (notificationPreferences) {
      user.notificationPreferences = { ...user.notificationPreferences, ...notificationPreferences };
    }

    await user.save();

    res.json({
      message: 'Profile updated successfully',
      user: {
        id: user._id,
        email: user.email,
        name: user.name,
        location: user.location,
        healthProfile: user.healthProfile
      }
    });
  } catch (error) {
    logger.error('Update profile error:', error);
    res.status(500).json({ error: 'Failed to update profile' });
  }
};