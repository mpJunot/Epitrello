import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const body = await request.json().catch(() => ({}));
    const { token, rememberMe } = body as { token?: string; rememberMe?: boolean };

    if (!token) {
      return NextResponse.json({ ok: false, error: 'Token is required' }, { status: 400 });
    }

    // Set httpOnly cookie with token. Max-Age based on rememberMe (30d vs 7d)
    const maxAge = rememberMe ? 60 * 60 * 24 * 30 : 60 * 60 * 24 * 7;
    const cookie = `token=${token}; Path=/; HttpOnly; SameSite=Lax; Max-Age=${maxAge}`;

    const response = NextResponse.json({ ok: true }, { status: 200 });
    response.headers.append('Set-Cookie', cookie);
    return response;
  } catch (err) {
    const error = err instanceof Error ? err.message : 'Invalid request';
    return NextResponse.json({ ok: false, error }, { status: 400 });
  }
}
