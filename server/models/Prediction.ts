// File: server/src/models/Prediction.ts
import mongoose, { Document, Schema } from 'mongoose';

export interface IRiskScore {
  overall: number;
  heatwave: number;
  airQuality: number;
  uvExposure: number;
  disease: number;
}

export interface IEvidence {
  source: string;
  content: string;
  relevanceScore: number;
}

export interface IRecommendation {
  category: string;
  action: string;
  priority: 'low' | 'medium' | 'high' | 'critical';
}

export interface IPrediction extends Document {
  userId: mongoose.Types.ObjectId;
  location: {
    city: string;
    coordinates?: {
      lat: number;
      lng: number;
    };
  };
  environmentData: {
    temperature: number;
    humidity: number;
    aqi: number;
    uvIndex: number;
    windSpeed: number;
    pressure: number;
    description: string;
  };
  riskScores: IRiskScore;
  evidence: IEvidence[];
  recommendations: IRecommendation[];
  explanation: string;
  generatedAt: Date;
  createdAt: Date;
}

const predictionSchema = new Schema<IPrediction>({
  userId: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  location: {
    city: { type: String, required: true },
    coordinates: {
      lat: Number,
      lng: Number
    }
  },
  environmentData: {
    temperature: Number,
    humidity: Number,
    aqi: Number,
    uvIndex: Number,
    windSpeed: Number,
    pressure: Number,
    description: String
  },
  riskScores: {
    overall: { type: Number, required: true },
    heatwave: Number,
    airQuality: Number,
    uvExposure: Number,
    disease: Number
  },
  evidence: [{
    source: String,
    content: String,
    relevanceScore: Number
  }],
  recommendations: [{
    category: String,
    action: String,
    priority: {
      type: String,
      enum: ['low', 'medium', 'high', 'critical']
    }
  }],
  explanation: String,
  generatedAt: { type: Date, default: Date.now }
}, {
  timestamps: true
});

predictionSchema.index({ userId: 1, createdAt: -1 });
predictionSchema.index({ 'location.city': 1 });

export default mongoose.model<IPrediction>('Prediction', predictionSchema);