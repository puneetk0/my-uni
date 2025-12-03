import mongoose, { Types } from 'mongoose';

const UpvoteSchema = new mongoose.Schema(
  {
    achievementId: { type: Types.ObjectId, ref: 'Achievement', required: true, index: true },
    userId: { type: Types.ObjectId, ref: 'User', required: true, index: true },
  },
  { timestamps: true }
);

UpvoteSchema.index({ achievementId: 1, userId: 1 }, { unique: true });

export const Upvote = mongoose.model('Upvote', UpvoteSchema);
