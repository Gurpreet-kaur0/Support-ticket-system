import mongoose, { Document, Schema, Types } from 'mongoose';

export interface ITicket extends Document {
  title: string;
  description: string;
  category: 'bug' | 'feature' | 'general' | 'account' | 'billing';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  status: 'open' | 'in_progress' | 'resolved' | 'closed';
  createdBy: Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const ticketSchema = new Schema<ITicket>({
  title: { type: String, required: true, trim: true, maxlength: 200 },
  description: { type: String, required: true, maxlength: 5000 },
  category: {
    type: String,
    enum: ['bug', 'feature', 'general', 'account', 'billing'],
    default: 'general',
  },
  priority: {
    type: String,
    enum: ['low', 'medium', 'high', 'urgent'],
    default: 'medium',
  },
  status: {
    type: String,
    enum: ['open', 'in_progress', 'resolved', 'closed'],
    default: 'open',
  },
  createdBy: { type: Schema.Types.ObjectId, ref: 'User', required: true },
}, { timestamps: true });

ticketSchema.index({ createdBy: 1 });
ticketSchema.index({ status: 1, priority: 1 });

export default mongoose.model<ITicket>('Ticket', ticketSchema);
