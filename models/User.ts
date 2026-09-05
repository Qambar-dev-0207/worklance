import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IExperienceItem {
  id?: string;
  company: string;
  role: string;
  location?: string;
  startDate?: string;
  endDate?: string;
  current?: boolean;
  description?: string;
}

export interface IEducationItem {
  id?: string;
  school: string;
  degree: string;
  fieldOfStudy?: string;
  startYear?: string;
  endYear?: string;
  grade?: string;
}

export interface IProjectItem {
  id?: string;
  title: string;
  description: string;
  liveUrl?: string;
  githubUrl?: string;
  techStack?: string[];
}

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
  phone?: string;
  location?: string;
  githubUrl?: string;
  linkedinUrl?: string;
  portfolioUrl?: string;
  twitterUrl?: string;
  targetRole?: string;
  expectedSalary?: string;
  experienceYears?: string;
  availability?: string;
  workPreference?: 'Remote' | 'Hybrid' | 'On-site' | 'Any';
  experience?: IExperienceItem[];
  education?: IEducationItem[];
  projects?: IProjectItem[];
  atsScore?: number;
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
    phone: { type: String, default: '' },
    location: { type: String, default: '' },
    githubUrl: { type: String, default: '' },
    linkedinUrl: { type: String, default: '' },
    portfolioUrl: { type: String, default: '' },
    twitterUrl: { type: String, default: '' },
    targetRole: { type: String, default: '' },
    expectedSalary: { type: String, default: '' },
    experienceYears: { type: String, default: '' },
    availability: { type: String, default: 'Immediately' },
    workPreference: { type: String, enum: ['Remote', 'Hybrid', 'On-site', 'Any'], default: 'Any' },
    experience: { type: [Schema.Types.Mixed], default: [] },
    education: { type: [Schema.Types.Mixed], default: [] },
    projects: { type: [Schema.Types.Mixed], default: [] },
    atsScore: { type: Number, default: 85 },
  },
  { timestamps: true }
);

const User: Model<IUser> = mongoose.models.User || mongoose.model<IUser>('User', UserSchema);

export default User;

