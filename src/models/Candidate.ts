import mongoose, { Schema, Document } from 'mongoose';

export interface ICandidate extends Document {
  name: string;
  email: string;
  country: string;
  stage: string;
  tags: string[];
  assignedRecruiter?: string;
  assignedRecruiterEmail?: string;
  interviewDate?: Date;
  documents?: {
    resume?: { received: boolean; updatedAt?: Date };
    nursingLicense?: { received: boolean; updatedAt?: Date };
    passport?: { received: boolean; updatedAt?: Date };
    visaPacket?: { received: boolean; updatedAt?: Date };
  };
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
    assignedRecruiter: { type: String, default: 'Unassigned' },
    assignedRecruiterEmail: { type: String },
    interviewDate: { type: Date },
    documents: {
      resume: {
        received: { type: Boolean, default: false },
        updatedAt: { type: Date },
      },
      nursingLicense: {
        received: { type: Boolean, default: false },
        updatedAt: { type: Date },
      },
      passport: {
        received: { type: Boolean, default: false },
        updatedAt: { type: Date },
      },
      visaPacket: {
        received: { type: Boolean, default: false },
        updatedAt: { type: Date },
      },
    },
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
if (mongoose.models.Candidate) {
  mongoose.deleteModel('Candidate');
}

export default mongoose.model<ICandidate>('Candidate', CandidateSchema);
