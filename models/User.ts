import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IUser extends Document {
  name: string;
  email: string;
  password: string;
  role: 'seeker' | 'recruiter' | 'admin';
  avatar?: string;
  title?: string;
  company?: string;
  bio?: string;
  skills?: string[];
  resumeUrl?: string;
  createdAt: Date;
}

const UserSchema: Schema = new Schema(
  {
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    password: { type: String, required: true },
    role: { type: String, enum: ['seeker', 'recruiter', 'admin'], default: 'seeker' },
    avatar: { type: String, default: '' },
    title: { type: String, default: '' },
    company: { type: String, default: '' },
    bio: { type: String, default: '' },
    skills: { type: [String], default: [] },
    resumeUrl: { type: String, default: '' },
  },
  { timestamps: true }
);

const User: Model<IUser> = mongoose.models.User || mongoose.model<IUser>('User', UserSchema);

export default User;
