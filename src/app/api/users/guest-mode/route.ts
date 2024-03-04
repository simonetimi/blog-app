import { SignJWT } from 'jose';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    const session = request.cookies.get('session')?.value || '';

    if (session !== '') {
      return NextResponse.json(
        { error: 'User is already authenticated! Log out first' },
        { status: 400 },
      );
    }

    // create a token for authenticating the user
    const tokenData = {
      id: '65e4ec76354645b93cdaebbf',
      username: 'Guest',
      email: 'guest.dev@dev.com',
      role: 'admin',
    };
    const secret = new TextEncoder().encode(process.env.TOKEN_SECRET!);
    const alg = 'HS256';
    const token: string = await new SignJWT(tokenData)
      .setProtectedHeader({ alg })
      .setExpirationTime('20m')
      .sign(secret);

    const response = NextResponse.json({
      message: 'Login successful',
      success: true,
    });
    response.cookies.set('session', token, {
      httpOnly: true,
      sameSite: 'strict',
      maxAge: 1200, // 20 minutes
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
