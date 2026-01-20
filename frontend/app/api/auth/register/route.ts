import { NextResponse } from "next/server";

export async function POST(request: Request) {
  console.log('[API Register] Request received');

  try {
    const body = await request.json().catch(() => ({}));
    const { company, name, email, password } = body as {
      company?: string;
      name?: string;
      email?: string;
      password?: string;
    };

    console.log('[API Register] Request body', {
      hasCompany: !!company,
      hasName: !!name,
      hasEmail: !!email,
      hasPassword: !!password,
    });

    const graphqlEndpoint = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000/graphql";
    console.log('[API Register] GraphQL endpoint', {
      endpoint: graphqlEndpoint,
      envVar: process.env.NEXT_PUBLIC_API_URL,
    });

    const query = `mutation Register($input: RegisterInput!) { register(input: $input) { token user { id email name avatar } } }`;
    const requestBody = {
      query,
      variables: { input: { companyName: company, name, email, password } },
    };

    console.log('[API Register] Sending GraphQL request', {
      endpoint: graphqlEndpoint,
      query: query.substring(0, 100) + '...',
    });

    const res = await fetch(graphqlEndpoint, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(requestBody),
    });

    console.log('[API Register] GraphQL response', {
      status: res.status,
      statusText: res.statusText,
      ok: res.ok,
    });

    const data = await res.json();
    console.log('[API Register] Response data', {
      hasData: !!data.data,
      hasErrors: !!data.errors,
      errors: data.errors,
    });

    if (!res.ok || data.errors) {
      const message = data?.errors?.[0]?.message || "Unable to create account";
      console.error('[API Register] Registration failed', {
        status: res.status,
        errors: data.errors,
        message,
      });
      return NextResponse.json({ ok: false, error: message }, { status: 400 });
    }

    const auth = data.data?.register;
    if (!auth || !auth.token) {
      console.error('[API Register] Invalid registration response', { auth, data });
      return NextResponse.json({ ok: false, error: "Invalid registration response" }, { status: 500 });
    }

    const maxAge = 60 * 60 * 24 * 7;
    const cookie = `token=${auth.token}; Path=/; HttpOnly; SameSite=Lax; Max-Age=${maxAge}`;

    console.log('[API Register] Registration successful', {
      userId: auth.user?.id,
      email: auth.user?.email,
      hasToken: !!auth.token,
    });

    const response = NextResponse.json({ ok: true, user: auth.user, token: auth.token }, { status: 201 });
    response.headers.append("Set-Cookie", cookie);
    return response;
  } catch (err) {
    const error = err instanceof Error ? err.message : "Invalid request";
    console.error('[API Register] Error occurred', {
      error: err,
      message: error,
      stack: err instanceof Error ? err.stack : undefined,
    });
    return NextResponse.json({ ok: false, error }, { status: 400 });
  }
}
