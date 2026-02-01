import { NextResponse } from "next/server";

export async function POST(request: Request) {
  console.log('[API Login] Request received');

  try {
    const body = await request.json().catch(() => ({}));
    const { email, password, rememberMe } = body as {
      email?: string;
      password?: string;
      rememberMe?: boolean;
    };

    console.log('[API Login] Request body', {
      hasEmail: !!email,
      hasPassword: !!password,
      rememberMe,
    });

    const graphqlEndpoint = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000/graphql";
    console.log('[API Login] GraphQL endpoint', {
      endpoint: graphqlEndpoint,
      envVar: process.env.NEXT_PUBLIC_API_URL,
    });

    const query = `mutation Login($input: LoginInput!) { login(input: $input) { token user { id email name avatar } } }`;
    const requestBody = {
      query,
      variables: { input: { email, password, rememberMe } },
    };

    console.log('[API Login] Sending GraphQL request', {
      endpoint: graphqlEndpoint,
      query: query.substring(0, 100) + '...',
    });

    const res = await fetch(graphqlEndpoint, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(requestBody),
    });

    console.log('[API Login] GraphQL response', {
      status: res.status,
      statusText: res.statusText,
      ok: res.ok,
    });

    const data = await res.json();

    console.log('[API Login] Response data', {
      hasData: !!data.data,
      hasErrors: !!data.errors,
      errors: data.errors,
    });

    if (!res.ok || data.errors) {
      const message = data?.errors?.[0]?.message || "Invalid credentials";
      console.error('[API Login] Login failed', {
        status: res.status,
        errors: data.errors,
        message,
      });
      return NextResponse.json({ ok: false, error: message }, { status: 400 });
    }

    const auth = data.data?.login;
    if (!auth || !auth.token) {
      console.error('[API Login] Invalid auth response', { auth, data });
      return NextResponse.json({ ok: false, error: "Invalid authentication response" }, { status: 500 });
    }

    // Set httpOnly cookie with token. Max-Age based on rememberMe (30d vs 7d)
    const maxAge = rememberMe ? 60 * 60 * 24 * 30 : 60 * 60 * 24 * 7;
    const cookie = `token=${auth.token}; Path=/; HttpOnly; SameSite=Lax; Max-Age=${maxAge}`;

    console.log('[API Login] Login successful', {
      userId: auth.user?.id,
      email: auth.user?.email,
      hasToken: !!auth.token,
      maxAge,
    });

    const response = NextResponse.json({ ok: true, user: auth.user, token: auth.token }, { status: 200 });
    response.headers.append("Set-Cookie", cookie);
    return response;
  } catch (err) {
    const error = err instanceof Error ? err.message : "Invalid request";
    console.error('[API Login] Error occurred', {
      error: err,
      message: error,
      stack: err instanceof Error ? err.stack : undefined,
    });
    return NextResponse.json({ ok: false, error }, { status: 400 });
  }
}
