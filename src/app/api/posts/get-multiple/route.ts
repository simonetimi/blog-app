import { NextRequest, NextResponse } from 'next/server';

import { connect } from '@/db/db-config';
import Post from '@/models/post';
import User from '@/models/user';

export async function POST(request: NextRequest) {
  try {
    await connect();
    const reqBody = await request.json();

    const { currentPage } = reqBody;

    const pageSize = 5;

    // Calculate the number of documents to skip
    const skip = (currentPage - 1) * pageSize;
    // Fetch the total count of posts excluding drafts
    const totalCount = await Post.countDocuments({ isDraft: false });
    // Calculate total pages
    const totalPages = Math.ceil(totalCount / pageSize);

    const posts = await Post.find({ isDraft: false })
      .select('title author publishDate')
      .limit(pageSize)
      .skip(skip)
      .populate({ path: 'author', select: 'username', model: User })
      .exec();

    const response = NextResponse.json({
      message: 'Posts has been fetched',
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
