import { jwtVerify } from 'jose';
import { NextRequest, NextResponse } from 'next/server';
import { boolean, object, string } from 'yup';

import { connect } from '@/db/db-config';
import Post from '@/models/post';

// edit validation schema
const inputSchema = object({
  title: string().trim().min(2).max(60).required(),
  content: string().trim().min(4).max(5000).required(),
  isDraft: boolean(),
  postId: string(),
});

export async function POST(request: NextRequest) {
  try {
    const session = request.cookies.get('session')?.value || '';

    if (session === '') {
      return NextResponse.json(
        { error: 'User not authorized' },
        { status: 403 },
      );
    }

    const secret = new TextEncoder().encode(process.env.TOKEN_SECRET!);
    const { payload } = await jwtVerify(session, secret);
    if (
      typeof payload !== 'string' &&
      'role' in payload &&
      payload.role !== 'admin'
    ) {
      return NextResponse.json(
        { error: 'User not authorized' },
        { status: 403 },
      );
    }

    const reqBody = await request.json();

    // validate and sanitize user data
    const { title, content, isDraft, postId } =
      await inputSchema.validate(reqBody);

    await connect();

    await Post.findByIdAndUpdate(
      postId,
      {
        title: title,
        content: content,
        isDraft: isDraft,
      },
      { new: true },
    );

    const response = NextResponse.json({
      message: 'Post has been edited!',
      success: true,
    });

    return response;
  } catch (error) {
    if (error instanceof Error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }
    return NextResponse.json({ error: 'Unknown error' }, { status: 500 });
  }
}
