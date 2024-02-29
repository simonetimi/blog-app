import { NextRequest, NextResponse } from 'next/server';

import { connect } from '@/db/db-config';
import User from '@/models/user';

export async function POST(request: NextRequest) {
  try {
    await connect();
    const reqBody = await request.json();
    const { token } = reqBody;

    // look for a user with the given token and check if expired
    const user = await User.findOne({
      verifyToken: token,
      verifyTokenExpiry: { $gt: Date.now() },
    });
    if (!user) {
      return NextResponse.json(
        { error: 'Invalid verification token' },
        { status: 400 },
      );
    }

    // verified, remove the token from the db entry
    user.isVerified = true;
    user.verifyToken = undefined;
    user.verifyTokenExpiry = undefined;
    await user.save();
    return NextResponse.json(
      { message: 'Email verified successfully', success: true },
      { status: 200 },
    );
  } catch (error) {
    if (error instanceof Error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }
  }
}
