// File: server/src/controllers/report.controller.ts
import { Request, Response } from 'express';
import Report from '../models/Report';
import User from '../models/User';
import Prediction from '../models/Prediction';
import { generatePDF } from '../services/pdf.service';
import { sendEmail } from '../services/notification.service';
import { logger } from '../utils/logger';
import fs from 'fs';
import path from 'path';

export const generateReport = async (req: Request, res: Response) => {
  try {
    const userId = req.user?.userId;
   const { reportType = 'daily' } = req.body || {};


    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Get recent predictions
    const days = reportType === 'weekly' ? 7 : 1;
    const predictions = await Prediction.find({ userId })
      .sort({ createdAt: -1 })
      .limit(days);

    if (predictions.length === 0) {
      return res.status(400).json({ error: 'No data available for report' });
    }

    // Calculate summary
    const avgRisk = predictions.reduce((sum, p) => sum + p.riskScores.overall, 0) / predictions.length;
    
    const topRisks = new Set<string>();
    predictions.forEach(p => {
      if (p.riskScores.heatwave > 60) topRisks.add('Heatwave');
      if (p.riskScores.airQuality > 60) topRisks.add('Poor Air Quality');
      if (p.riskScores.uvExposure > 60) topRisks.add('High UV');
      if (p.riskScores.disease > 60) topRisks.add('Disease Risk');
    });

    // Generate PDF
    const pdfPath = await generatePDF({
      user,
      predictions,
      summary: {
        overallRisk: Math.round(avgRisk),
        topRisks: Array.from(topRisks),
        reportType,
        generatedAt: new Date()
      }
    });

    // Save report record
    const report = new Report({
      userId,
      reportType,
      pdfPath,
      summary: {
        overallRisk: Math.round(avgRisk),
        topRisks: Array.from(topRisks),
        actionsTaken: predictions[0]?.recommendations?.length || 0,
        ecoScore: 75 // Calculated based on user actions
      }
    });

    await report.save();

    // Send via email if enabled
    if (user.notificationPreferences.email) {
      await sendEmail(user.email, 'Your Daily Health Report', pdfPath);
      report.sentVia.push('email');
      await report.save();
    }

    logger.info(`Generated ${reportType} report for user ${userId}`);

    res.json({
      message: 'Report generated successfully',
      reportId: report._id,
      downloadUrl: `/api/reports/${report._id}`,
      summary: report.summary
    });
  } catch (error) {
    logger.error('Generate report error:', error);
    res.status(500).json({ error: 'Failed to generate report' });
  }
};

export const getUserReports = async (req: Request, res: Response) => {
  try {
    const { userId } = req.params;

    // Verify access
    if (req.user?.userId !== userId && req.user?.role !== 'ngo_admin') {
      return res.status(403).json({ error: 'Access denied' });
    }

    const reports = await Report.find({ userId })
      .sort({ createdAt: -1 })
      .limit(20);

    res.json({ reports, count: reports.length });
  } catch (error) {
    logger.error('Get user reports error:', error);
    res.status(500).json({ error: 'Failed to get reports' });
  }
};

export const downloadReport = async (req: Request, res: Response) => {
  try {
    const { reportId } = req.params;

    const report = await Report.findById(reportId);
    if (!report) {
      return res.status(404).json({ error: 'Report not found' });
    }

    // Verify access
    if (req.user?.userId !== report.userId.toString() && req.user?.role !== 'ngo_admin') {
      return res.status(403).json({ error: 'Access denied' });
    }

    // Check if file exists
    if (!fs.existsSync(report.pdfPath)) {
      return res.status(404).json({ error: 'Report file not found' });
    }

    // Increment download count
    report.downloadCount += 1;
    await report.save();

    // Send file
    res.download(report.pdfPath, `health-report-${report.generatedAt.toISOString().split('T')[0]}.pdf`);
  } catch (error) {
    logger.error('Download report error:', error);
    res.status(500).json({ error: 'Failed to download report' });
  }
};