import { NextRequest, NextResponse } from 'next/server';

import { connect } from '@/db/db-config';
import Post from '@/models/post';
import User from '@/models/user';

export async function POST(request: NextRequest) {
  try {
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
        populate: { path: 'author', select: 'username', model: User },
      })
      .exec();
    const response = NextResponse.json({
      message: 'Post has been added!',
      success: true,
      post: post,
    });

    return response;
  } catch (error) {
    if (error instanceof Error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }
    return NextResponse.json({ error: 'Unknown error' }, { status: 500 });
  }
}
