import type { Document } from 'mongoose';
import mongoose from 'mongoose';

import type { UserInt } from './user';

export interface PostInt extends Document {
  title: string;
  content: string;
  author: UserInt['_id'];
  isDraft: boolean;
  publishDate: Date;
  comments: [''];
}

const postSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Title is required'],
    unique: true,
  },
  content: { type: String, required: [true, 'Content is required'] },
  author: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  isDraft: { type: Boolean },
  publishDate: { type: Date },
  comments: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Comment' }],
});

const Post =
  mongoose.models.Post || mongoose.model<PostInt>('Post', postSchema);

export default Post;
