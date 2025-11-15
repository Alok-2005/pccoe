// File: server/src/models/User.ts
import mongoose, { Document, Schema } from 'mongoose';
import bcrypt from 'bcryptjs';

export interface IUser extends Document {
  email: string;
  password: string;
  name: string;
  role: 'citizen' | 'family_admin' | 'ngo_admin';
  location: {
    city: string;
    coordinates?: {
      lat: number;
      lng: number;
    };
  };
  healthProfile: {
    age?: number;
    gender?: string;
    comorbidities: string[];
    allergies: string[];
    medications: string[];
  };
  notificationPreferences: {
    email: boolean;
    whatsapp: boolean;
    sms: boolean;
    pushEnabled: boolean;
  };
  familyId?: mongoose.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
  comparePassword(candidatePassword: string): Promise<boolean>;
}

const userSchema = new Schema<IUser>({
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true
  },
  password: {
    type: String,
    required: true,
    minlength: 6
  },
  name: {
    type: String,
    required: true,
    trim: true
  },
  role: {
    type: String,
    enum: ['citizen', 'family_admin', 'ngo_admin'],
    default: 'citizen'
  },
  location: {
    city: {
      type: String,
      required: true
    },
    coordinates: {
      lat: Number,
      lng: Number
    }
  },
  healthProfile: {
    age: Number,
    gender: String,
    comorbidities: [String],
    allergies: [String],
    medications: [String]
  },
  notificationPreferences: {
    email: { type: Boolean, default: true },
    whatsapp: { type: Boolean, default: false },
    sms: { type: Boolean, default: false },
    pushEnabled: { type: Boolean, default: true }
  },
  familyId: {
    type: Schema.Types.ObjectId,
    ref: 'Family'
  }
}, {
  timestamps: true
});

// Index for faster queries
userSchema.index({ email: 1 });
userSchema.index({ familyId: 1 });

// Hash password before saving
userSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();
  
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

// Compare password method
userSchema.methods.comparePassword = async function(candidatePassword: string): Promise<boolean> {
  return bcrypt.compare(candidatePassword, this.password);
};

export default mongoose.model<IUser>('User', userSchema);