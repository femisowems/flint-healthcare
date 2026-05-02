import mongoose, { Schema, Document } from 'mongoose';

export interface IActivity extends Document {
  candidateId: mongoose.Types.ObjectId;
  type: string;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  payload: any;
  timestamp: Date;
  userId?: string;
}

const ActivitySchema: Schema = new Schema({
  candidateId: { type: Schema.Types.ObjectId, ref: 'Candidate', required: true },
  type: {
    type: String,
    required: true,
    enum: ['stage_change', 'note', 'upload', 'email', 'status_change'],
  },
  payload: { type: Schema.Types.Mixed }, // Flexible payload for different types
  timestamp: { type: Date, default: Date.now },
  userId: { type: String, default: 'system' }, // Mock user for now
});

export default mongoose.models.Activity || mongoose.model<IActivity>('Activity', ActivitySchema);
