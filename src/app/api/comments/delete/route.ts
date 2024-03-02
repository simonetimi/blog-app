import { jwtVerify } from 'jose';
import mongoose from 'mongoose';
import { NextRequest, NextResponse } from 'next/server';

import { connect } from '@/db/db-config';
import Comment from '@/models/comment';
import Post from '@/models/post';
import User from '@/models/user';

export async function POST(request: NextRequest) {
  await connect();
  // use a transaction (we want them to all succeed or all fail). option: dbSession
  const dbSession = await mongoose.startSession();
  dbSession.startTransaction();

  const session = request.cookies.get('session')?.value || '';

  if (session === '') {
    return NextResponse.json(
      { error: 'User is not authenticated' },
      { status: 401 },
    );
  }

  try {
    const reqBody = await request.json();
    const secret = new TextEncoder().encode(process.env.TOKEN_SECRET!);
    const { payload } = await jwtVerify(session, secret);

    // get postId
    const { postId, commentId } = reqBody;
    //get username and id from the decoded token
    const { id, role } = payload;

    const user = await User.findById(id);
    if (id !== user._id.toString() || role !== 'admin') {
      return NextResponse.json(
        { error: 'User is not authorized' },
        { status: 403 },
      );
    }

    // delete comment
    await Comment.findByIdAndDelete(commentId, { dbSession });

    // delete comment reference from post
    await Post.findByIdAndUpdate(
      postId,
      {
        $pull: { comments: commentId },
      },
      { dbSession },
    );

    // delete comment reference from user and save (it's been called already to check if the user having the token is the same as the user who commented)
    user.comments = user.comments.filter((currentCommentId: string) => {
      return currentCommentId !== commentId;
    });
    await user.save({ dbSession });

    // commit transaction
    await dbSession.commitTransaction();

    const response = NextResponse.json({
      message: 'Comment has been deleted!',
      success: true,
    });

    return response;
  } catch (error) {
    if (error instanceof Error) {
      // abort transaction in case of error
      await dbSession.abortTransaction();
      return NextResponse.json({ error: error.message }, { status: 500 });
    }
    return NextResponse.json({ error: 'Unknown error' }, { status: 500 });
  } finally {
    // end the session whether transaction was successful or not
    dbSession.endSession();
  }
}
