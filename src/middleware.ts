import { jwtVerify, SignJWT } from 'jose';
import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';

export async function middleware(request: NextRequest) {
  const path = request.nextUrl.pathname;
  const session = request.cookies.get('session')?.value;
  const secret = new TextEncoder().encode(process.env.TOKEN_SECRET!);

  // check if user is logged in or not (has token) and redirect to appropriate paths
  const authPaths = [
    '/auth/login',
    '/auth/signup',
    '/auth/verify-email',
    '/auth/password-reset',
    '/auth/request-password-reset',
  ];
  const isAuthPath = authPaths.includes(path);

  const publicPaths = ['/', '/blog'];
  const isBlog = publicPaths.includes(path) && !path.startsWith('/blog/user');

  // redirect everyone to blog if they visit '/'
  if (path === '/') {
    return NextResponse.redirect(new URL('/blog', request.nextUrl));
  }

  // anonymous user should be redirected to login if trying to access app resources
  if (!isAuthPath && !isBlog && !session) {
    return NextResponse.redirect(new URL('/auth/login', request.nextUrl));
  }

  if (session) {
    // decode token
    const { payload } = await jwtVerify(session, secret);
    const newToken = {
      id: payload.id,
      username: payload.username,
      email: payload.email,
      role: payload.role,
    };
    // create refreshed token
    const alg = 'HS256';
    const newSession: string = await new SignJWT(newToken)
      .setProtectedHeader({ alg })
      .setExpirationTime('1h')
      .sign(secret);

    // if logged user is accessing a public resource, redirect to the main app resource
    if (isAuthPath) {
      const response = NextResponse.redirect(new URL('/blog', request.nextUrl));
      return response;
    }

    // if logged user is accessing a private resource, refresh the session without redirecting
    if (!isAuthPath) {
      const response = NextResponse.next();

      // set the cookie using response
      response.cookies.set('session', newSession, {
        httpOnly: true,
        sameSite: 'strict',
        maxAge: 3600, // 1 hour
        secure: true,
      });

      return response;
    }
  }
}

// it runs on every route except for api, next static, next image

export const config = {
  matcher: ['/', '/((?!api|_next/static|_next/image|favicon.ico|icon.png).*)'],
};
