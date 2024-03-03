import { NextRequest, NextResponse } from 'next/server';

import { connect } from '@/db/db-config';
import Comment from '@/models/comment';
import Post from '@/models/post';
import User from '@/models/user';

export async function POST(request: NextRequest) {
  try {
    connect();
    const reqBody = await request.json();

    const { username } = reqBody;

    const userData = await User.findOne({ username: username })
      .select('bio')
      .select('posts comments')
      .populate({
        path: 'posts',
        select: 'title _id publishDate',
        model: Post,
        options: { limit: 3, sort: { publishDate: -1 } },
      })
      .populate({
        path: 'comments',
        select: 'content _id publishDate',
        model: Comment,
        options: { limit: 3, sort: { publishDate: -1 } },
      });

    return NextResponse.json(
      { message: 'User found', userData },
      { status: 200 },
    );
  } catch (error) {
    if (error instanceof Error) {
      return NextResponse.json({ error: error.message }, { status: 404 });
    }
  }
}
