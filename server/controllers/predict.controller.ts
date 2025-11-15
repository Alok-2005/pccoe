// File: server/src/controllers/predict.controller.ts
import { Request, Response } from 'express';
import { validationResult } from 'express-validator';
import Prediction from '../models/Prediction';
import User from '../models/User';
import { getEnvironmentData } from '../services/weather.service';
import { getRiskPrediction } from '../services/rag.service';
import { logger } from '../utils/logger';
import { cacheGet, cacheSet } from '../config/redis';

export const getPrediction = async (req: Request, res: Response) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const userId = req.user?.userId;
        const { city, coordinates } = req.body || {}; // safe destructuring
        
    // Get user details
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Determine location
    const targetCity = city || user.location.city;
    const targetCoords = coordinates || user.location.coordinates;

    // Check cache
    const cacheKey = `prediction:${targetCity}:${userId}`;
    const cached = await cacheGet(cacheKey);
    if (cached) {
      logger.info(`Returning cached prediction for ${targetCity}`);
      return res.json(JSON.parse(cached));
    }

    // Get environment data
    const envData = await getEnvironmentData(targetCity, targetCoords);

    // Get AI risk prediction using RAG
    const prediction = await getRiskPrediction(user, envData);

    // Save prediction
    const savedPrediction = new Prediction({
      userId,
      location: {
        city: targetCity,
        coordinates: targetCoords
      },
      environmentData: envData,
      riskScores: prediction.riskScores,
      evidence: prediction.evidence,
      recommendations: prediction.recommendations,
      explanation: prediction.explanation
    });

    await savedPrediction.save();

    // Cache result for 5 minutes
    await cacheSet(cacheKey, JSON.stringify(savedPrediction), 300);

    logger.info(`Generated prediction for user ${userId} in ${targetCity}`);

    res.json(savedPrediction);
  } catch (error) {
    logger.error('Prediction error:', error);
    res.status(500).json({ error: 'Failed to generate prediction' });
  }
};

export const getHistory = async (req: Request, res: Response) => {
  try {
    const { userId } = req.params;
    const limit = parseInt(req.query.limit as string) || 10;

    // Verify access
    if (req.user?.userId !== userId && req.user?.role !== 'ngo_admin') {
      return res.status(403).json({ error: 'Access denied' });
    }

    const predictions = await Prediction.find({ userId })
      .sort({ createdAt: -1 })
      .limit(limit);

    res.json({ predictions, count: predictions.length });
  } catch (error) {
    logger.error('Get history error:', error);
    res.status(500).json({ error: 'Failed to get history' });
  }
};

export const getStats = async (req: Request, res: Response) => {
  try {
    const userId = req.user?.userId;

    const predictions = await Prediction.find({ userId })
      .sort({ createdAt: -1 })
      .limit(30);

    if (predictions.length === 0) {
      return res.json({
        averageRisk: 0,
        trend: 'stable',
        topRisks: [],
        recommendations: []
      });
    }

    const avgRisk = predictions.reduce((sum, p) => sum + p.riskScores.overall, 0) / predictions.length;
    
    // Calculate trend
    const recentAvg = predictions.slice(0, 7).reduce((sum, p) => sum + p.riskScores.overall, 0) / Math.min(7, predictions.length);
    const olderAvg = predictions.slice(7, 14).reduce((sum, p) => sum + p.riskScores.overall, 0) / Math.max(1, predictions.slice(7, 14).length);
    
    let trend = 'stable';
    if (recentAvg > olderAvg + 5) trend = 'increasing';
    if (recentAvg < olderAvg - 5) trend = 'decreasing';

    // Aggregate top risks
    const riskCounts: { [key: string]: number } = {};
    predictions.forEach(p => {
      if (p.riskScores.heatwave > 60) riskCounts['heatwave'] = (riskCounts['heatwave'] || 0) + 1;
      if (p.riskScores.airQuality > 60) riskCounts['airQuality'] = (riskCounts['airQuality'] || 0) + 1;
      if (p.riskScores.uvExposure > 60) riskCounts['uvExposure'] = (riskCounts['uvExposure'] || 0) + 1;
      if (p.riskScores.disease > 60) riskCounts['disease'] = (riskCounts['disease'] || 0) + 1;
    });

    const topRisks = Object.entries(riskCounts)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 3)
      .map(([risk]) => risk);

    res.json({
      averageRisk: Math.round(avgRisk),
      trend,
      topRisks,
      totalPredictions: predictions.length
    });
  } catch (error) {
    logger.error('Get stats error:', error);
    res.status(500).json({ error: 'Failed to get statistics' });
  }
};