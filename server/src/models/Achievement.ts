import mongoose, { Types } from 'mongoose';

const AchievementSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    shortDescription: { type: String },
    description: { type: String },
    type: { type: String, enum: ['hackathon','research','internship','project','competition','other'], default: 'other' },
    tags: [{ type: String }],
    achievementDate: { type: Date },
    status: { type: String, enum: ['pending','approved','rejected'], default: 'pending' },
    isFeatured: { type: Boolean, default: false },
    photos: [{ type: String }],
    mediaUrl: { type: String },
    howItStarted: { type: String },
    howWeBuiltIt: { type: String },
    whatWeAchieved: { type: String },
    whatWeLearned: { type: String },
    userId: { type: Types.ObjectId, ref: 'User', required: true, index: true },
    rejectionReason: { type: String },
  },
  { timestamps: true }
);

export const Achievement = mongoose.model('Achievement', AchievementSchema);
