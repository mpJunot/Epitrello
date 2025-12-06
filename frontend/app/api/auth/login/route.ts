import { NextResponse } from "next/server";

export async function POST(request: Request) {
  try {
    const body = await request.json().catch(() => ({}));
    const { email, password, rememberMe } = body as {
      email?: string;
      password?: string;
      rememberMe?: boolean;
    };

    const graphqlEndpoint = process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:4000/graphql";
    const query = `mutation Login($input: LoginInput!) { login(input: $input) { token user { id email name avatar } } }`;

    const res = await fetch(graphqlEndpoint, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        query,
        variables: { input: { email, password, rememberMe } },
      }),
    });

    const data = await res.json();

    if (!res.ok || data.errors) {
      const message = data?.errors?.[0]?.message || "Identifiants invalides";
      return NextResponse.json({ ok: false, error: message }, { status: 400 });
    }

    const auth = data.data?.login;
    if (!auth || !auth.token) {
      return NextResponse.json({ ok: false, error: "Réponse d'authentification invalide" }, { status: 500 });
    }

    // Set httpOnly cookie with token. Max-Age based on rememberMe (30d vs 7d)
    const maxAge = rememberMe ? 60 * 60 * 24 * 30 : 60 * 60 * 24 * 7;
    const cookie = `token=${auth.token}; Path=/; HttpOnly; SameSite=Lax; Max-Age=${maxAge}`;

  const response = NextResponse.json({ ok: true, user: auth.user, token: auth.token }, { status: 200 });
    response.headers.append("Set-Cookie", cookie);
    return response;
  } catch (err: any) {
    return NextResponse.json({ ok: false, error: err?.message || "Invalid request" }, { status: 400 });
  }
}
