// File: server/src/services/notification.service.ts
import twilio from 'twilio';
import nodemailer from 'nodemailer';
import { logger } from '../utils/logger';

const MOCK_MODE = process.env.MOCK_MODE === 'true';

// Twilio configuration
const TWILIO_ACCOUNT_SID = process.env.TWILIO_ACCOUNT_SID;
const TWILIO_AUTH_TOKEN = process.env.TWILIO_AUTH_TOKEN;
const TWILIO_WHATSAPP_FROM = process.env.TWILIO_WHATSAPP_FROM;

let twilioClient: ReturnType<typeof twilio> | null = null;
if (TWILIO_ACCOUNT_SID && TWILIO_AUTH_TOKEN && !MOCK_MODE) {
  twilioClient = twilio(TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN);
}

// Email configuration
const SMTP_HOST = process.env.SMTP_HOST || 'smtp.gmail.com';
const SMTP_PORT = parseInt(process.env.SMTP_PORT || '587');
const SMTP_USER = process.env.SMTP_USER;
const SMTP_PASS = process.env.SMTP_PASS;

let emailTransporter: nodemailer.Transporter | null = null;
if (SMTP_USER && SMTP_PASS && !MOCK_MODE) {
  emailTransporter = nodemailer.createTransport({
    host: SMTP_HOST,
    port: SMTP_PORT,
    secure: false,
    auth: {
      user: SMTP_USER,
      pass: SMTP_PASS
    }
  });
}

export const sendWhatsAppMessage = async (
  to: string,
  message: string
): Promise<boolean> => {
  try {
    if (MOCK_MODE || !twilioClient) {
      logger.info(`Mock WhatsApp message to ${to}: ${message}`);
      return true;
    }

    const result = await twilioClient.messages.create({
      from: TWILIO_WHATSAPP_FROM,
      to: `whatsapp:${to}`,
      body: message
    });

    logger.info(`WhatsApp message sent: ${result.sid}`);
    return true;
  } catch (error) {
    logger.error('WhatsApp send error:', error);
    return false;
  }
};

export const sendEmail = async (
  to: string,
  subject: string,
  pdfPath?: string
): Promise<boolean> => {
  try {
    if (MOCK_MODE || !emailTransporter) {
      logger.info(`Mock email to ${to}: ${subject}`);
      return true;
    }

    const mailOptions: any = {
      from: `Climate Health Companion <${SMTP_USER}>`,
      to,
      subject,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #2563eb;">Your Daily Health Report</h2>
          <p>Hello,</p>
          <p>Your personalized climate-health report is attached. Please review the recommendations and take necessary precautions.</p>
          <p>Stay safe and healthy!</p>
          <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 20px 0;">
          <p style="color: #64748b; font-size: 12px;">
            This is an automated message from Climate-Health Companion.<br>
            For questions, visit our support center.
          </p>
        </div>
      `
    };

    if (pdfPath) {
      mailOptions.attachments = [{
        filename: 'health-report.pdf',
        path: pdfPath
      }];
    }

    await emailTransporter.sendMail(mailOptions);
    logger.info(`Email sent to ${to}`);
    return true;
  } catch (error) {
    logger.error('Email send error:', error);
    return false;
  }
};

export const sendSMS = async (
  to: string,
  message: string
): Promise<boolean> => {
  try {
    if (MOCK_MODE || !twilioClient) {
      logger.info(`Mock SMS to ${to}: ${message}`);
      return true;
    }

    const result = await twilioClient.messages.create({
      from: process.env.TWILIO_PHONE_FROM,
      to,
      body: message
    });

    logger.info(`SMS sent: ${result.sid}`);
    return true;
  } catch (error) {
    logger.error('SMS send error:', error);
    return false;
  }
};