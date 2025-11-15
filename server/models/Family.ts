// File: server/src/models/Family.ts
import mongoose, { Document, Schema } from 'mongoose';

export interface IFamilyMember {
  _id?: mongoose.Types.ObjectId; // <-- add this
  name: string;
  age: number;
  relation: string;
  healthProfile: {
    comorbidities: string[];
    allergies: string[];
    specialNeeds?: string;
  };
  userId?: mongoose.Types.ObjectId;
}


export interface IFamily extends Document {
  name: string;
  adminUserId: mongoose.Types.ObjectId;
  members: IFamilyMember[];
  sharedLocation: {
    city: string;
    coordinates?: {
      lat: number;
      lng: number;
    };
  };
  createdAt: Date;
  updatedAt: Date;
}

const familyMemberSchema = new Schema({
  name: { type: String, required: true },
  age: { type: Number, required: true },
  relation: { type: String, required: true },
  healthProfile: {
    comorbidities: [String],
    allergies: [String],
    specialNeeds: String
  },
  userId: {
    type: Schema.Types.ObjectId,
    ref: 'User'
  }
}, { _id: true });

const familySchema = new Schema<IFamily>({
  name: {
    type: String,
    required: true,
    trim: true
  },
  adminUserId: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  members: [familyMemberSchema],
  sharedLocation: {
    city: String,
    coordinates: {
      lat: Number,
      lng: Number
    }
  }
}, {
  timestamps: true
});

familySchema.index({ adminUserId: 1 });

export default mongoose.model<IFamily>('Family', familySchema);