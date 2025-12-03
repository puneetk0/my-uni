import mongoose, { Types } from 'mongoose';

const CommentSchema = new mongoose.Schema(
  {
    achievementId: { type: Types.ObjectId, ref: 'Achievement', required: true, index: true },
    userId: { type: Types.ObjectId, ref: 'User', required: true, index: true },
    body: { type: String, required: true },
  },
  { timestamps: true }
);

export const Comment = mongoose.model('Comment', CommentSchema);
