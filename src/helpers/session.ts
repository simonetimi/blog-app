import { jwtVerify } from 'jose';
import { NextRequest, NextResponse } from 'next/server';

// this is a reference. when needed, build appropriate API routes

const secret = new TextEncoder().encode(process.env.TOKEN_SECRET!);

export async function compareId(request: NextRequest, paramId: string) {
  try {
    const session = request.cookies.get('session')?.value || '';
    const { payload } = await jwtVerify(session, secret);
    let idFromSession = '';
    if (typeof payload !== 'string' && 'id' in payload) {
      idFromSession = payload.id as string;
    }
    if (idFromSession !== paramId) {
      return NextResponse.json(
        { error: 'User not authorized' },
        { status: 403 },
      );
    }
    const response = NextResponse.json({
      message: 'The ID matches with the token. User authorized',
      success: true,
    });
    return response;
  } catch (error) {
    if (error instanceof Error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }
    return NextResponse.json({ error: 'Unknown error' }, { status: 500 });
  }
}

export async function checkRole(request: NextRequest, paramRole: string) {
  try {
    const session = request.cookies.get('session')?.value || '';
    const { payload } = await jwtVerify(session, secret);
    let roleFromToken = '';
    if (typeof payload !== 'string' && 'role' in payload) {
      roleFromToken = payload.role as string;
    }
    if (roleFromToken !== paramRole) {
      return NextResponse.json(
        { error: 'User not authorized' },
        { status: 403 },
      );
    }
    const response = NextResponse.json({
      message: 'The role matches with the token. User authorized',
      success: true,
    });
    return response;
  } catch (error) {
    if (error instanceof Error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }
    return NextResponse.json({ error: 'Unknown error' }, { status: 500 });
  }
}
