import mongoose from 'mongoose';

const OpportunitySchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    description: { type: String, required: true },
    type: { type: String, enum: ['internship', 'job', 'hackathon', 'scholarship', 'event', 'competition', 'workshop', 'startup', 'other'], default: 'other' },
    organization: { type: String },
    location: { type: String },
    applyUrl: { type: String },
    detailsUrl: { type: String },
    joinTeamUrl: { type: String },
    deadline: { type: Date },
    tags: [{ type: String }],
    isFeatured: { type: Boolean, default: false },
    eligibility: { type: String },
    thumbnailUrl: { type: String },
    customTypeLabel: { type: String },
    isStartup: { type: Boolean, default: false },
    startupName: { type: String },
    // New moderation fields
    status: { type: String, enum: ['pending', 'approved', 'rejected'], default: 'pending' },
    rejectionReason: { type: String },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    // Legacy flag kept for compatibility with existing UI mapping
    isApproved: { type: Boolean, default: true },
  },
  { timestamps: true }
);

export const Opportunity = mongoose.model('Opportunity', OpportunitySchema);
