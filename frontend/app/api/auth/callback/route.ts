import { NextResponse } from 'next/server';

export async function GET(request: Request) {
	// Redirect to the frontend OAuth callback page which will read the
	// token or error from the querystring and finalize the session.
	try {
		const reqUrl = new URL(request.url);
		const redirectTo = `${reqUrl.origin}/auth/callback${reqUrl.search}`;
		return NextResponse.redirect(redirectTo);
	} catch (_error) {
		return NextResponse.json({ ok: false, error: 'Invalid request' }, { status: 400 });
	}
}
