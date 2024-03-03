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

    const { postId, isEdit } = reqBody;

    const secret = new TextEncoder().encode(process.env.TOKEN_SECRET!);
    let additionalData = {};

    if (session !== '') {
      try {
        const { payload } = await jwtVerify(session, secret);
        additionalData = { user: payload.user, role: payload.role }; // Example of adding user data
      } catch (error) {}
    }

    // if it comes from edit page, fetch and send less data
    if (isEdit) {
      const post = await Post.findOne({ _id: postId })
        .select('content title isDraft')
        .exec();
      const response = NextResponse.json({
        message: 'Post has been fetched',
        success: true,
        post: post,
      });
      return response;
    }

    // retrieve the post populating the author with the username and the comments with the required fields, populating their authors too with usernames
    const post = await Post.findOne({ _id: postId })
      .select('content title publishDate isDraft')
      .populate({ path: 'author', select: 'username', model: User })
      .populate({
        path: 'comments',
        select: 'author content publishDate',
        model: Comment,
        options: { sort: { publishDate: -1 } },
        populate: { path: 'author', select: 'username', model: User },
      })
      .exec();

    const response = NextResponse.json({
      message: 'Post has been fetched',
      success: true,
      post: post,
      isSession: isSession,
      ...additionalData,
    });

    // if the user is anonymous but the post isn't a draft, allow the response
    if (session === '' && !post.isDraft) {
      return response;
    }

    return response;
  } catch (error) {
    if (error instanceof Error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }
    return NextResponse.json({ error: 'Unknown error' }, { status: 500 });
  }
}
