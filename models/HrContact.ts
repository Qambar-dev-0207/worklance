import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IHrContact extends Document {
  name: string;
  company: string;
  designation: string;
  email: string;
  linkedIn: string;
  industry: string;
  city: string;
  verified: boolean;
  avatar?: string;
  createdAt: Date;
}

const HrContactSchema: Schema = new Schema(
  {
    name: { type: String, required: true },
    company: { type: String, required: true },
    designation: { type: String, required: true },
    email: { type: String, required: true },
    linkedIn: { type: String, default: '#' },
    industry: { type: String, required: true },
    city: { type: String, required: true },
    verified: { type: Boolean, default: true },
    avatar: { type: String, default: '' },
  },
  { timestamps: true }
);

HrContactSchema.index({ company: 1, city: 1, industry: 1 });

const HrContact: Model<IHrContact> =
  mongoose.models.HrContact || mongoose.model<IHrContact>('HrContact', HrContactSchema);

export default HrContact;
