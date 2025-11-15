// File: server/src/models/Report.ts
import mongoose, { Document, Schema } from 'mongoose';

export interface IReport extends Document {
  userId: mongoose.Types.ObjectId;
  reportType: 'daily' | 'weekly' | 'custom';
  pdfPath: string;
  pdfUrl?: string;
  summary: {
    overallRisk: number;
    topRisks: string[];
    actionsTaken: number;
    ecoScore: number;
  };
  generatedAt: Date;
  sentVia: string[];
  downloadCount: number;
  createdAt: Date;
}

const reportSchema = new Schema<IReport>({
  userId: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  reportType: {
    type: String,
    enum: ['daily', 'weekly', 'custom'],
    default: 'daily'
  },
  pdfPath: {
    type: String,
    required: true
  },
  pdfUrl: String,
  summary: {
    overallRisk: Number,
    topRisks: [String],
    actionsTaken: Number,
    ecoScore: Number
  },
  generatedAt: {
    type: Date,
    default: Date.now
  },
  sentVia: [String],
  downloadCount: {
    type: Number,
    default: 0
  }
}, {
  timestamps: true
});

reportSchema.index({ userId: 1, createdAt: -1 });

export default mongoose.model<IReport>('Report', reportSchema);