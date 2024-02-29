import { jwtVerify } from 'jose';
import { NextRequest } from 'next/server';

export async function extractId(request: NextRequest) {
  try {
    const session = request.cookies.get('session')?.value || '';
    const secret = new TextEncoder().encode(process.env.TOKEN_SECRET!);
    const { payload } = await jwtVerify(session, secret);
    if (typeof payload !== 'string' && 'id' in payload) {
      return payload.id;
    }
  } catch (error) {
    if (error instanceof Error) {
      throw new Error(error.message);
    }
  }
}
