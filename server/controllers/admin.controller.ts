// File: server/src/controllers/admin.controller.ts
import { Request, Response } from 'express';
import User from '../models/User';
import Prediction from '../models/Prediction';
import Report from '../models/Report';
import Family from '../models/Family';
import { addDocumentsToVectorStore } from '../services/rag.service';
import { logger } from '../utils/logger';

export const getDashboard = async (req: Request, res: Response) => {
  try {
    // Aggregate statistics
    const totalUsers = await User.countDocuments();
    const totalFamilies = await Family.countDocuments();
    const totalPredictions = await Prediction.countDocuments();
    const totalReports = await Report.countDocuments();

    // Recent activity
    const recentPredictions = await Prediction.find()
      .sort({ createdAt: -1 })
      .limit(10)
      .populate('userId', 'name email location');

    // High risk alerts
    const highRiskAlerts = await Prediction.find({
      'riskScores.overall': { $gte: 75 },
      createdAt: { $gte: new Date(Date.now() - 24 * 60 * 60 * 1000) }
    })
      .sort({ 'riskScores.overall': -1 })
      .limit(20)
      .populate('userId', 'name location');

    // City-wise risk aggregation
    const cityRisks = await Prediction.aggregate([
      {
        $match: {
          createdAt: { $gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) }
        }
      },
      {
        $group: {
          _id: '$location.city',
          avgRisk: { $avg: '$riskScores.overall' },
          maxRisk: { $max: '$riskScores.overall' },
          count: { $sum: 1 }
        }
      },
      {
        $sort: { avgRisk: -1 }
      },
      {
        $limit: 10
      }
    ]);

    res.json({
      statistics: {
        totalUsers,
        totalFamilies,
        totalPredictions,
        totalReports
      },
      recentActivity: recentPredictions,
      highRiskAlerts,
      cityRisks
    });
  } catch (error) {
    logger.error('Get dashboard error:', error);
    res.status(500).json({ error: 'Failed to get dashboard data' });
  }
};

export const getRiskHeatmap = async (req: Request, res: Response) => {
  try {
    const { startDate, endDate } = req.query;

    const dateFilter: any = {};
    if (startDate) dateFilter.$gte = new Date(startDate as string);
    if (endDate) dateFilter.$lte = new Date(endDate as string);

    const query = Object.keys(dateFilter).length > 0 
      ? { createdAt: dateFilter }
      : { createdAt: { $gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) } };

    const heatmapData = await Prediction.aggregate([
      { $match: query },
      {
        $group: {
          _id: {
            city: '$location.city',
            lat: '$location.coordinates.lat',
            lng: '$location.coordinates.lng'
          },
          avgOverallRisk: { $avg: '$riskScores.overall' },
          avgHeatwave: { $avg: '$riskScores.heatwave' },
          avgAirQuality: { $avg: '$riskScores.airQuality' },
          avgUvExposure: { $avg: '$riskScores.uvExposure' },
          avgDisease: { $avg: '$riskScores.disease' },
          count: { $sum: 1 }
        }
      },
      {
        $project: {
          _id: 0,
          city: '$_id.city',
          lat: '$_id.lat',
          lng: '$_id.lng',
          riskScores: {
            overall: { $round: ['$avgOverallRisk', 1] },
            heatwave: { $round: ['$avgHeatwave', 1] },
            airQuality: { $round: ['$avgAirQuality', 1] },
            uvExposure: { $round: ['$avgUvExposure', 1] },
            disease: { $round: ['$avgDisease', 1] }
          },
          dataPoints: '$count'
        }
      },
      {
        $sort: { 'riskScores.overall': -1 }
      }
    ]);

    res.json({ heatmapData, count: heatmapData.length });
  } catch (error) {
    logger.error('Get risk heatmap error:', error);
    res.status(500).json({ error: 'Failed to get heatmap data' });
  }
};

export const uploadDataset = async (req: Request, res: Response) => {
  try {
    const { documents, source } = req.body;

    if (!documents || !Array.isArray(documents)) {
      return res.status(400).json({ error: 'Documents array is required' });
    }

    // Add documents to vector store
    const result = await addDocumentsToVectorStore(documents, source);

    logger.info(`Dataset uploaded: ${documents.length} documents from ${source}`);

    res.json({
      message: 'Dataset uploaded successfully',
      documentsAdded: result.count,
      source
    });
  } catch (error) {
    logger.error('Upload dataset error:', error);
    res.status(500).json({ error: 'Failed to upload dataset' });
  }
};

export const getLogs = async (req: Request, res: Response) => {
  try {
    const { level, limit = 100 } = req.query;

    // In a production system, logs would be stored in a database or log management system
    // For this implementation, we'll return a placeholder
    res.json({
      message: 'Logs endpoint - implement with your logging infrastructure',
      note: 'Connect to Winston transports or external logging service',
      query: { level, limit }
    });
  } catch (error) {
    logger.error('Get logs error:', error);
    res.status(500).json({ error: 'Failed to get logs' });
  }
};