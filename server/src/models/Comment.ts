import mongoose, { Document, Schema, Types } from 'mongoose';

export interface IComment extends Document {
  content: string;
  ticket: Types.ObjectId;
  author: Types.ObjectId;
  createdAt: Date;
}

const commentSchema = new Schema<IComment>({
  content: { type: String, required: true, maxlength: 2000 },
  ticket: { type: Schema.Types.ObjectId, ref: 'Ticket', required: true },
  author: { type: Schema.Types.ObjectId, ref: 'User', required: true },
}, { timestamps: true });

commentSchema.index({ ticket: 1, createdAt: 1 });

export default mongoose.model<IComment>('Comment', commentSchema);
