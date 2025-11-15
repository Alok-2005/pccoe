// File: server/src/models/Conversation.ts
import mongoose, { Document, Schema } from 'mongoose';

export interface IMessage {
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
  evidence?: Array<{
    source: string;
    snippet: string;
  }>;
}

export interface IConversation extends Document {
  userId: mongoose.Types.ObjectId;
  messages: IMessage[];
  context: {
    location?: string;
    recentRisk?: number;
    userHealth?: string[];
  };
  createdAt: Date;
  updatedAt: Date;
}

const conversationSchema = new Schema<IConversation>({
  userId: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  messages: [{
    role: {
      type: String,
      enum: ['user', 'assistant'],
      required: true
    },
    content: {
      type: String,
      required: true
    },
    timestamp: {
      type: Date,
      default: Date.now
    },
    evidence: [{
      source: String,
      snippet: String
    }]
  }],
  context: {
    location: String,
    recentRisk: Number,
    userHealth: [String]
  }
}, {
  timestamps: true
});

conversationSchema.index({ userId: 1, createdAt: -1 });

export default mongoose.model<IConversation>('Conversation', conversationSchema);