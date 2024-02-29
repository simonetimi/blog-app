import type { Document } from 'mongoose';
import mongoose from 'mongoose';

import type { UserInt } from './user';

export interface CommentInt extends Document {
  content: string;
  _author: UserInt['_id'];
  publishDate: Date;
}

const commentSchema = new mongoose.Schema({
  content: { type: String, required: [true, 'Content is required'] },
  _author: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  publishDate: { type: Date },
});

const Comment =
  mongoose.models.Post || mongoose.model<CommentInt>('Post', commentSchema);

export default Comment;
