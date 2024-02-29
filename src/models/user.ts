import type { Document } from 'mongoose';
import mongoose from 'mongoose';

export interface UserInt extends Document {
  username: string;
  email: string;
  password: string;
  isVerified: boolean;
  bio: string;
  role: 'user' | 'admin';
  isBanned: boolean;
  forgotPasswordToken?: string;
  forgotPasswordTokenExpiry?: Date;
  lastForgotPasswordTokenRequest?: Date;
  verifyToken?: string;
  verifyTokenExpiry?: Date;
  lastVerifyTokenRequest?: Date;
}

const userSchema = new mongoose.Schema({
  username: {
    type: String,
    required: [true, 'Username is required'],
    unique: true,
  },
  email: { type: String, required: [true, 'Email is required'], unique: true },
  password: {
    type: String,
    required: [true, 'Password is required'],
    unique: false,
  },
  isVerified: {
    type: Boolean,
    default: false,
  },
  bio: { type: String, default: '' },
  role: {
    type: String,
    enum: ['user', 'admin'],
    default: 'user',
  },
  isBanned: {
    type: Boolean,
    default: false,
  },
  forgotPasswordToken: String,
  forgotPasswordTokenExpiry: Date,
  lastForgotPasswordTokenRequest: Date,
  verifyToken: String,
  verifyTokenExpiry: Date,
  lastVerifyTokenRequest: Date,
});

const User =
  mongoose.models.User || mongoose.model<UserInt>('User', userSchema);

export default User;
