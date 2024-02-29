import { NextRequest, NextResponse } from 'next/server';
import { object, string } from 'yup';

import { connect } from '@/db/db-config';
import { sendEmail } from '@/helpers/mailer';
import User from '@/models/user';

const inputSchema = object({
  email: string().email().lowercase().trim().min(4).max(254).required(),
});

export async function POST(request: NextRequest) {
  try {
    await connect();
    const reqBody = await request.json();
    const { email } = await inputSchema.validate(reqBody);
    const user = await User.findOne({ email });
    if (user) {
      await sendEmail(user.email, 'reset', user._id);
    }
    return NextResponse.json(
      {
        message: 'Password reset has been sent!',
        success: true,
      },
      { status: 200 },
    );
  } catch (error) {
    if (error instanceof Error) {
      return NextResponse.json({ message: error.message }, { status: 500 });
    }
  }
}
