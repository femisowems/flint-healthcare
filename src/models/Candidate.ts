import mongoose, { Schema, Document } from 'mongoose';

export interface ICandidate extends Document {
  name: string;
  email: string;
  country: string;
  stage: string;
  tags: string[];
  resumeText?: string;
  experience?: number;
  specialization?: string;
  status: string;
  createdAt: Date;
  updatedAt: Date;
}

const CandidateSchema: Schema = new Schema(
  {
    name: { type: String, required: true },
    email: { type: String, required: true },
    country: { type: String, required: true },
    stage: {
      type: String,
      required: true,
      enum: ['Applied', 'Screening', 'Interview', 'Offer', 'Visa Processing', 'Placed'],
      default: 'Applied',
    },
    tags: [{ type: String }],
    resumeText: { type: String },
    experience: { type: Number },
    specialization: { type: String },
    status: {
      type: String,
      enum: ['Active', 'Rejected', 'On Hold'],
      default: 'Active',
    },
  },
  {
    timestamps: true,
  }
);

// To handle hot-reloading in Next.js development
export default mongoose.models.Candidate || mongoose.model<ICandidate>('Candidate', CandidateSchema);
