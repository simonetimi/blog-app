import { jwtVerify } from 'jose';
import { NextRequest, NextResponse } from 'next/server';
import { object, string } from 'yup';

import { connect } from '@/db/db-config';
import Comment from '@/models/comment';
import Post from '@/models/post';
import User from '@/models/user';

const inputSchema = object({
  comment: string().trim().min(3).max(500).required(),
});

export async function POST(request: NextRequest) {
  try {
    const session = request.cookies.get('session')?.value || '';

    if (session === '') {
      return NextResponse.json(
        { error: 'User is not authenticated' },
        { status: 401 },
      );
    }

    const reqBody = await request.json();
    const secret = new TextEncoder().encode(process.env.TOKEN_SECRET!);
    const { payload } = await jwtVerify(session, secret);

    // validate and get comment
    const { comment } = await inputSchema.validate(reqBody);
    // get postId
    const { postId } = reqBody;
    //get username and id from the decoded token
    const { id, username } = payload;
    // save date
    const time = new Date();

    await connect();

    const newComment = new Comment({
      content: comment,
      author: id,
      publishDate: time,
    });

    const post = await Post.findById(postId);
    const user = await User.findById(id);

    // insert comment id on related post's array of comments
    post.comments.push(newComment._id);
    // insert comment id on related user's array of comments
    user.comments.push(newComment._id);

    await Promise.all([newComment.save(), post.save(), user.save()]);

    const response = NextResponse.json({
      message: 'Comment has been added!',
      success: true,
      comment: newComment,
      username: username,
    });

    return response;
  } catch (error) {
    if (error instanceof Error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }
    return NextResponse.json({ error: 'Unknown error' }, { status: 500 });
  }
}
