import { NextRequest, NextResponse } from 'next/server';

import { connect } from '@/db/db-config';
import { extractId } from '@/helpers/extract-id';
import User from '@/models/user';

// Add additional data as needed, or consider new API paths for specific bits of user data

export async function GET(request: NextRequest) {
  try {
    connect();
    const userId = await extractId(request);
    const user = await User.findById({ _id: userId }).select(
      'username email bio',
    );
    return NextResponse.json(
      { message: 'User found', user: user },
      { status: 200 },
    );
  } catch (error) {
    if (error instanceof Error) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }
  }
}
