import mongoose, { Schema, Document, Model } from 'mongoose';
import { ResumeData } from '@/types/resume';

export interface IResume extends Document {
  userId: mongoose.Types.ObjectId;
  title: string;
  resumeData: ResumeData;
  source: 'upload' | 'builder' | 'import';
  fileName?: string;
  rawText?: string;
  atsScore?: number;
  isCurrent: boolean;
  version: number;
  createdAt: Date;
  updatedAt: Date;
}

const ResumeSchema: Schema = new Schema(
  {
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    title: { type: String, default: 'My Resume', trim: true },
    resumeData: { type: Schema.Types.Mixed, required: true },
    source: {
      type: String,
      enum: ['upload', 'builder', 'import'],
      default: 'builder',
    },
    fileName: { type: String, default: '' },
    rawText: { type: String, default: '' },
    atsScore: { type: Number, default: 85 },
    isCurrent: { type: Boolean, default: true, index: true },
    version: { type: Number, default: 1 },
  },
  { timestamps: true }
);

const Resume: Model<IResume> = mongoose.models.Resume || mongoose.model<IResume>('Resume', ResumeSchema);

export default Resume;
