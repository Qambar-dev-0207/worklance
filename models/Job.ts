import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IJob extends Document {
  title: string;
  company: string;
  companyLogo?: string;
  companyAbout?: string;
  companyIndustry?: string;
  companySize?: string;
  companyWebsite?: string;
  location: string;
  type: 'Full-time' | 'Part-time' | 'Contract' | 'Remote' | 'Hybrid';
  salary: string;
  description: string;
  responsibilities?: string[];
  requirements: string[];
  benefits?: string[];
  tags: string[];
  postedBy?: any;
  applicantCount: number;
  createdAt: Date;
}

const JobSchema: Schema = new Schema(
  {
    title: { type: String, required: true },
    company: { type: String, required: true },
    companyLogo: { type: String, default: '' },
    companyAbout: { type: String, default: '' },
    companyIndustry: { type: String, default: '' },
    companySize: { type: String, default: '' },
    companyWebsite: { type: String, default: '' },
    location: { type: String, required: true },
    type: {
      type: String,
      enum: ['Full-time', 'Part-time', 'Contract', 'Remote', 'Hybrid'],
      default: 'Full-time',
    },
    salary: { type: String, required: true },
    description: { type: String, required: true },
    responsibilities: { type: [String], default: [] },
    requirements: { type: [String], default: [] },
    benefits: { type: [String], default: [] },
    tags: { type: [String], default: [] },
    postedBy: { type: Schema.Types.Mixed, default: 'worklance_curator' },
    applicantCount: { type: Number, default: 0 },
  },
  { timestamps: true }
);

JobSchema.index({ title: 'text', company: 'text', location: 'text', tags: 'text' });

const Job: Model<IJob> = mongoose.models.Job || mongoose.model<IJob>('Job', JobSchema);

export default Job;
