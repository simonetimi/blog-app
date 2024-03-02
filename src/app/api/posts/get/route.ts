import { jwtVerify } from 'jose';
import { NextRequest, NextResponse } from 'next/server';

import { connect } from '@/db/db-config';
import Comment from '@/models/comment';
import Post from '@/models/post';
import User from '@/models/user';

export async function POST(request: NextRequest) {
  try {
    const session = request.cookies.get('session')?.value || '';
    let isSession = false;
    if (session !== '') {
      isSession = true;
    }

    await connect();
    const reqBody = await request.json();

    const { postId } = reqBody;
    // retrieve the post populating the author with the username and the comments with the required fields, populating their authors too with usernames
    const post = await Post.findOne({ _id: postId })
      .select('content title publishDate isDraft')
      .populate({ path: 'author', select: 'username', model: User })
      .populate({
        path: 'comments',
        select: 'author content publishDate',
        model: Comment,
        populate: { path: 'author', select: 'username', model: User },
      })
      .exec();

    const response = NextResponse.json({
      message: 'Post has been fetched',
      success: true,
      post: post,
      isSession: isSession,
    });

    if (session === '' && !post.isDraft) {
      return response;
    }

    const secret = new TextEncoder().encode(process.env.TOKEN_SECRET!);
    const { payload } = await jwtVerify(session, secret);
    // if the user isn't the post author and the post is a draft, return an error (only the author should be able to see the draft)
    if (post.author !== payload.username && post.isDraft) {
      return NextResponse.json(
        { error: 'User is not authorized' },
        { status: 403 },
      );
    }

    return response;
  } catch (error) {
    if (error instanceof Error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }
    return NextResponse.json({ error: 'Unknown error' }, { status: 500 });
  }
}
