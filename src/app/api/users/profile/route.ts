import { NextRequest, NextResponse } from 'next/server';

import { connect } from '@/db/db-config';
import User from '@/models/user';

export async function POST(request: NextRequest) {
  try {
    connect();
    const reqBody = await request.json();
    const { bio } = await User.findOne({ username: reqBody.username }).select(
      'bio',
    );
    return NextResponse.json({ message: 'User found', bio }, { status: 200 });
  } catch (error) {
    if (error instanceof Error) {
      return NextResponse.json({ error: error.message }, { status: 404 });
    }
  }
}
