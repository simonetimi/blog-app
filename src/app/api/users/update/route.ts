import { genSalt, hash } from 'bcrypt';
import { jwtVerify, SignJWT } from 'jose';
import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';
import { object, string } from 'yup';

import {
  lowercaseRegex,
  numberRegex,
  specialCharRegex,
  uppercaseRegex,
} from '@/lib/regex';
import { connect } from '@/db/db-config';
import { sendEmail } from '@/helpers/mailer';
import User from '@/models/user';

interface ReqBody {
  username?: string;
  bio?: string;
  email?: string;
  password?: string;
}

const inputSchema = object({
  email: string().email().lowercase().trim().min(4).max(254),
  password: string()
    .trim()
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
    ),
  username: string().min(3).max(32),
  bio: string().min(1).max(320),
});

export async function PUT(request: NextRequest) {
  try {
    // get session from cookies
    const session = request.cookies.get('session')?.value;
    if (!session) {
      return NextResponse.json(
        { message: 'Please log in first' },
        { status: 401 },
      );
    }

    // connect do db
    await connect();

    const secret = new TextEncoder().encode(process.env.TOKEN_SECRET!);

    // decode session
    const { payload } = await jwtVerify(session, secret);
    let idFromSession = '';
    if (typeof payload !== 'string' && 'id' in payload) {
      idFromSession = payload.id as string;
    }

    // extract form data from request validate and sanitize user data
    const reqBody = (await request.json()) as ReqBody;
    const { username, email, password, bio } =
      await inputSchema.validate(reqBody);

    // check if user exists
    const user = await User.findOne({ _id: idFromSession }).exec();

    // depending on data from form, update user
    if (username) {
      if (typeof payload !== 'string' && 'username' in payload) {
        payload.username = username;
      }
      user.username = username;
      await user.save();
    }
    if (email) {
      if (typeof payload !== 'string' && 'email' in payload) {
        payload.email = email;
      }
      user.email = email;
      user.isVerified = false;
      user.lastVerifyTokenRequest = undefined;
      await user.save();
      // send verification email
      await sendEmail(email, 'verify', idFromSession);
    }
    if (bio) {
      if (typeof payload !== 'string' && 'bio' in payload) {
        payload.bio = bio;
      }
      user.bio = bio;
      await user.save();
    }
    if (password) {
      // hash & salt password
      const salt = await genSalt(12);
      const hashedPassword = await hash(password, salt);
      user.password = hashedPassword;
      await user.save();
    }

    const newToken = {
      id: idFromSession,
      username: user.username,
      email: user.email,
      role: user.role,
    };

    const alg = 'HS256';
    const newSession: string = await new SignJWT(newToken)
      .setProtectedHeader({ alg })
      .setExpirationTime('1h')
      .sign(secret);

    // after making the requesed changes to user data, send an updated token/cookie
    const response = NextResponse.json({
      message: 'Data updated successfully',
    });
    response.cookies.set('session', newSession, {
      httpOnly: true,
      sameSite: 'strict',
      maxAge: 3600, // 1 hour
      secure: true,
    });
    return response;
  } catch (error) {
    if (error instanceof Error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }
    return NextResponse.json({ error: 'Unknown error' }, { status: 500 });
  }
}
