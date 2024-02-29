import { genSalt, hash } from 'bcrypt';
import { NextRequest, NextResponse } from 'next/server';
import { string } from 'yup';

import { connect } from '@/db/db-config';
import User from '@/models/user';

const specialCharRegex = /[^A-Za-z0-9]/; // Matches special characters
const numberRegex = /\d/; // Matches numbers
const lowercaseRegex = /[a-z]/; // Matches lowercase letters
const uppercaseRegex = /[A-Z]/; // Matches uppercase letters

const inputSchema = string()
  .min(6)
  .max(256)
  .matches(
    specialCharRegex,
    'Password must contain at least one special character',
  )
  .matches(numberRegex, 'Password must contain at least one number')
  .matches(
    lowercaseRegex,
    'Password must contain at least one lowercase letter',
  )
  .matches(
    uppercaseRegex,
    'Password must contain at least one uppercase letter',
  )
  .required();

export async function POST(request: NextRequest) {
  try {
    await connect();
    const reqBody = await request.json();
    const { token, password } = reqBody;

    const parsedPassword = await inputSchema.validate(password);

    // look for a user with the given token and check if expired
    const user = await User.findOne({
      forgotPasswordToken: token,
      forgotPasswordTokenExpiry: { $gt: Date.now() },
    });
    if (!user) {
      return NextResponse.json(
        { error: 'Invalid password reset token' },
        { status: 400 },
      );
    }

    // hash and salt password
    const salt = await genSalt(12);
    const hashedPassword = await hash(parsedPassword, salt);

    // remove the token from the db entry and update password
    user.forgotPasswordToken = undefined;
    user.forgotPasswordTokenExpiry = undefined;
    user.password = hashedPassword;
    await user.save();
    return NextResponse.json(
      { message: 'Password reset successfully', success: true },
      { status: 200 },
    );
  } catch (error) {
    if (error instanceof Error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }
  }
}
