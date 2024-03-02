import type { Document } from 'mongoose';
import mongoose from 'mongoose';

import type { UserInt } from './user';

export interface CommentInt extends Document {
  content: string;
  author: UserInt['_id'];
  publishDate: Date;
}

const commentSchema = new mongoose.Schema({
  content: { type: String, required: [true, 'Content is required'] },
  author: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  publishDate: { type: Date },
});

const Comment =
  mongoose.models.Comment ||
  mongoose.model<CommentInt>('Comment', commentSchema);

export default Comment;
