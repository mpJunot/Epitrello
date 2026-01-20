import { NextResponse } from "next/server";

export async function GET(request: Request) {
  console.log('[API Me] Request received');

  try {
    // Read cookie header and extract token
    const cookieHeader = request.headers.get("cookie") || "";
    const tokenMatch = cookieHeader.match(/(?:^|; )token=([^;]+)/);
    const token = tokenMatch ? tokenMatch[1] : null;

    console.log('[API Me] Token check', {
      hasCookieHeader: !!cookieHeader,
      hasToken: !!token,
      tokenLength: token?.length,
    });

    if (!token) {
      console.warn('[API Me] No token found');
      return NextResponse.json({ ok: false, error: "No token" }, { status: 401 });
    }

    const graphqlEndpoint = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000/graphql";
    console.log('[API Me] GraphQL endpoint', {
      endpoint: graphqlEndpoint,
      envVar: process.env.NEXT_PUBLIC_API_URL,
    });

    const query = `query Me { me { id email name avatar createdAt updatedAt } }`;

    console.log('[API Me] Sending GraphQL request', {
      endpoint: graphqlEndpoint,
      hasToken: !!token,
    });

    const res = await fetch(graphqlEndpoint, {
      method: "POST",
      headers: { "Content-Type": "application/json", "Authorization": `Bearer ${token}` },
      body: JSON.stringify({ query }),
    });

    console.log('[API Me] GraphQL response', {
      status: res.status,
      statusText: res.statusText,
      ok: res.ok,
    });

    const data = await res.json();
    console.log('[API Me] Response data', {
      hasData: !!data.data,
      hasErrors: !!data.errors,
      errors: data.errors,
      hasUser: !!data.data?.me,
    });

    if (!res.ok || data.errors) {
      const message = data?.errors?.[0]?.message || "Unable to fetch user";
      console.error('[API Me] Failed to fetch user', {
        status: res.status,
        errors: data.errors,
        message,
      });
      return NextResponse.json({ ok: false, error: message }, { status: 401 });
    }

    console.log('[API Me] User fetched successfully', {
      userId: data.data.me?.id,
      email: data.data.me?.email,
    });

    return NextResponse.json({ ok: true, user: data.data.me }, { status: 200 });
  } catch (err) {
    const error = err instanceof Error ? err.message : "Invalid request";
    console.error('[API Me] Error occurred', {
      error: err,
      message: error,
      stack: err instanceof Error ? err.stack : undefined,
    });
    return NextResponse.json({ ok: false, error }, { status: 400 });
  }
}
