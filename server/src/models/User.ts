import mongoose from 'mongoose';

const UserSchema = new mongoose.Schema(
  {
    email: { type: String, required: true, unique: true, index: true },
    passwordHash: { type: String, required: true },
    name: { type: String },
    avatarUrl: { type: String },
    role: { type: String, enum: ['user', 'faculty', 'admin'], default: 'user', index: true },
  },
  { timestamps: true }
);

export const User = mongoose.model('User', UserSchema);
