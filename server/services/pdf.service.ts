// File: server/src/services/pdf.service.ts
import PDFDocument from 'pdfkit';
import fs from 'fs';
import path from 'path';
import { IUser } from '../models/User';
import { IPrediction } from '../models/Prediction';
import { logger } from '../utils/logger';

interface PDFData {
  user: IUser;
  predictions: IPrediction[];
  summary: {
    overallRisk: number;
    topRisks: string[];
    reportType: string;
    generatedAt: Date;
  };
}

export const generatePDF = async (data: PDFData): Promise<string> => {
  return new Promise((resolve, reject) => {
    try {
      const { user, predictions, summary } = data;

      // Ensure reports directory exists
      const reportsDir = path.join(__dirname, '../../reports');
      if (!fs.existsSync(reportsDir)) {
        fs.mkdirSync(reportsDir, { recursive: true });
      }

      // Create unique filename
      const filename = `health-report-${user._id}-${Date.now()}.pdf`;
      const filepath = path.join(reportsDir, filename);

      // Create PDF document
      const doc = new PDFDocument({ margin: 50 });
      const stream = fs.createWriteStream(filepath);

      doc.pipe(stream);

      // Header
      doc.fontSize(24)
         .fillColor('#2563eb')
         .text('Climate-Health Report', { align: 'center' })
         .moveDown(0.5);

      doc.fontSize(12)
         .fillColor('#64748b')
         .text(`Generated on ${summary.generatedAt.toLocaleDateString('en-IN')}`, { align: 'center' })
         .moveDown(2);

      // User Info
      doc.fontSize(16)
         .fillColor('#1e293b')
         .text('Personal Information', { underline: true })
         .moveDown(0.5);

      doc.fontSize(11)
         .fillColor('#475569')
         .text(`Name: ${user.name}`)
         .text(`Location: ${user.location.city}`)
         .text(`Report Type: ${summary.reportType.toUpperCase()}`)
         .moveDown(1.5);

      // Risk Summary
      doc.fontSize(16)
         .fillColor('#1e293b')
         .text('Risk Assessment Summary', { underline: true })
         .moveDown(0.5);

      // Overall risk with color coding
      const riskColor = summary.overallRisk > 70 ? '#dc2626' : 
                        summary.overallRisk > 50 ? '#f59e0b' : '#16a34a';
      
      doc.fontSize(14)
         .fillColor(riskColor)
         .text(`Overall Risk Score: ${summary.overallRisk}/100`, { bold: true })
         .moveDown(0.5);

      doc.fontSize(11)
         .fillColor('#475569')
         .text(`Risk Level: ${summary.overallRisk > 70 ? 'HIGH' : summary.overallRisk > 50 ? 'MODERATE' : 'LOW'}`)
         .moveDown(1);

      // Top Risks
      if (summary.topRisks.length > 0) {
        doc.fontSize(14)
           .fillColor('#1e293b')
           .text('Key Risk Factors:', { underline: true })
           .moveDown(0.3);

        summary.topRisks.forEach((risk, index) => {
          doc.fontSize(11)
             .fillColor('#475569')
             .text(`${index + 1}. ${risk}`, { indent: 20 })
             .moveDown(0.2);
        });
        doc.moveDown(1);
      }

      // Latest Prediction Details
      if (predictions.length > 0) {
        const latest = predictions[0];
        
        doc.addPage();
        
        doc.fontSize(16)
           .fillColor('#1e293b')
           .text('Detailed Risk Analysis', { underline: true })
           .moveDown(0.5);

        // Environment Data
        doc.fontSize(12)
           .fillColor('#1e293b')
           .text('Environmental Conditions:')
           .moveDown(0.3);

        doc.fontSize(10)
           .fillColor('#475569')
           .text(`Temperature: ${latest.environmentData.temperature}°C`)
           .text(`Air Quality Index: ${latest.environmentData.aqi}`)
           .text(`UV Index: ${latest.environmentData.uvIndex}`)
           .text(`Humidity: ${latest.environmentData.humidity}%`)
           .text(`Conditions: ${latest.environmentData.description}`)
           .moveDown(1);

        // Individual Risk Scores
        doc.fontSize(12)
           .fillColor('#1e293b')
           .text('Risk Breakdown:')
           .moveDown(0.3);

        const risks = [
          { label: 'Heatwave Risk', score: latest.riskScores.heatwave },
          { label: 'Air Quality Risk', score: latest.riskScores.airQuality },
          { label: 'UV Exposure Risk', score: latest.riskScores.uvExposure },
          { label: 'Disease Risk', score: latest.riskScores.disease }
        ];

        risks.forEach(risk => {
          const color = risk.score > 70 ? '#dc2626' : risk.score > 50 ? '#f59e0b' : '#16a34a';
          doc.fontSize(10)
             .fillColor('#475569')
             .text(`${risk.label}: `, { continued: true })
             .fillColor(color)
             .text(`${risk.score}/100`)
             .moveDown(0.2);
        });
        doc.moveDown(1);

        // Recommendations
        doc.fontSize(14)
           .fillColor('#1e293b')
           .text('Personalized Recommendations:', { underline: true })
           .moveDown(0.5);

        latest.recommendations.forEach((rec, index) => {
          const priorityColor = rec.priority === 'critical' ? '#dc2626' :
                                rec.priority === 'high' ? '#f59e0b' :
                                rec.priority === 'medium' ? '#3b82f6' : '#64748b';

          doc.fontSize(11)
             .fillColor(priorityColor)
             .text(`${index + 1}. [${rec.priority.toUpperCase()}] ${rec.category}`, { bold: true })
             .fontSize(10)
             .fillColor('#475569')
             .text(`   ${rec.action}`, { indent: 20 })
             .moveDown(0.5);
        });
      }

      // Health Tips
      doc.addPage();
      
      doc.fontSize(16)
         .fillColor('#1e293b')
         .text('Daily Health Tips', { underline: true })
         .moveDown(0.5);

      const tips = [
        '💧 Stay hydrated - Drink at least 8-10 glasses of water daily',
        '🏃 Exercise wisely - Choose indoor activities during high-risk periods',
        '🌱 Eat fresh - Include seasonal fruits and vegetables in your diet',
        '😴 Rest well - Ensure 7-8 hours of quality sleep',
        '🧘 Manage stress - Practice meditation or yoga regularly',
        '🌍 Be eco-friendly - Reduce carbon footprint with sustainable choices'
      ];

      tips.forEach(tip => {
        doc.fontSize(11)
           .fillColor('#475569')
           .text(tip, { indent: 20 })
           .moveDown(0.4);
      });

      doc.moveDown(1);

      // Footer
      doc.fontSize(8)
         .fillColor('#94a3b8')
         .text('Disclaimer: This report is for informational purposes only and should not replace professional medical advice.', 
               { align: 'center', width: 500 })
         .moveDown(0.3)
         .text('Consult a healthcare provider for personalized medical guidance.', 
               { align: 'center', width: 500 })
         .moveDown(1)
         .fillColor('#2563eb')
         .text('Climate-Health Companion © 2024', { align: 'center' });

      // Finalize PDF
      doc.end();

      stream.on('finish', () => {
        logger.info(`PDF generated: ${filename}`);
        resolve(filepath);
      });

      stream.on('error', (error) => {
        logger.error('PDF generation error:', error);
        reject(error);
      });

    } catch (error) {
      logger.error('PDF generation error:', error);
      reject(error);
    }
  });
};