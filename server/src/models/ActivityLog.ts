import mongoose, { Document, Schema, Types } from 'mongoose';

export interface IActivityLog extends Document {
  event: string;
  description: string;
  ticket?: Types.ObjectId;
  performedBy: Types.ObjectId;
  metadata?: Record<string, unknown>;
  createdAt: Date;
}

const activityLogSchema = new Schema<IActivityLog>({
  event: { type: String, required: true },
  description: { type: String, required: true },
  ticket: { type: Schema.Types.ObjectId, ref: 'Ticket' },
  performedBy: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  metadata: { type: Schema.Types.Mixed },
}, { timestamps: true });

activityLogSchema.index({ ticket: 1 });
activityLogSchema.index({ performedBy: 1 });
activityLogSchema.index({ createdAt: -1 });

export default mongoose.model<IActivityLog>('ActivityLog', activityLogSchema);
