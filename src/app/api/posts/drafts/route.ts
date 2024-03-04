import { jwtVerify } from 'jose';
import { NextRequest, NextResponse } from 'next/server';

import { connect } from '@/db/db-config';
import Post from '@/models/post';

export async function POST(request: NextRequest) {
  try {
    // verify user authentication
    const session = request.cookies.get('session')?.value || '';

    if (session === '') {
      return NextResponse.json(
        { error: 'User is not authenticated' },
        { status: 401 },
      );
    }
    const secret = new TextEncoder().encode(process.env.TOKEN_SECRET!);
    const { payload } = await jwtVerify(session, secret);

    await connect();
    const reqBody = await request.json();

    const { currentPage } = reqBody;

    const pageSize = 5;

    // Calculate the number of documents to skip
    const skip = (currentPage - 1) * pageSize;
    // Fetch the total count of posts excluding drafts
    const totalCount = await Post.countDocuments({ isDraft: true });
    // Calculate total pages
    const totalPages = Math.ceil(totalCount / pageSize);

    const posts = await Post.find({ isDraft: true, author: payload.id })
      .select('title publishDate')
      .limit(pageSize)
      .skip(skip)
      .sort({ publishDate: -1 })
      .exec();

    const response = NextResponse.json({
      message: 'Drafts has been fetched',
      success: true,
      posts: posts,
      totalPages: totalPages,
    });

    return response;
  } catch (error) {
    if (error instanceof Error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }
    return NextResponse.json({ error: 'Unknown error' }, { status: 500 });
  }
}
