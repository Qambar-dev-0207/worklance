import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IHackathon extends Document {
  title: string;
  organizer: string;
  organizerBadge?: string;
  description: string;
  prizePool: string;
  status: 'Live' | 'Upcoming' | 'Completed';
  teamSize: string;
  tags: string[];
  duration: string;
  participantsCount: number;
  teamsCount: number;
  deadline: string;
  createdAt: Date;
}

const HackathonSchema: Schema = new Schema(
  {
    title: { type: String, required: true },
    organizer: { type: String, required: true },
    organizerBadge: { type: String, default: 'HL' },
    description: { type: String, required: true },
    prizePool: { type: String, required: true },
    status: { type: String, enum: ['Live', 'Upcoming', 'Completed'], default: 'Upcoming' },
    teamSize: { type: String, default: 'Up to 4' },
    tags: { type: [String], default: [] },
    duration: { type: String, default: '48 hrs' },
    participantsCount: { type: Number, default: 0 },
    teamsCount: { type: Number, default: 0 },
    deadline: { type: String, default: '3 days left' },
  },
  { timestamps: true }
);

const Hackathon: Model<IHackathon> =
  mongoose.models.Hackathon || mongoose.model<IHackathon>('Hackathon', HackathonSchema);

export default Hackathon;
