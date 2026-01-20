import { NextResponse } from "next/server";

export async function POST(request: Request) {
  try {
    const body = await request.json().catch(() => ({}));
    const { company, name, email, password } = body as {
      company?: string;
      name?: string;
      email?: string;
      password?: string;
    };

    const graphqlEndpoint = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000/graphql";
    const query = `mutation Register($input: RegisterInput!) { register(input: $input) { token user { id email name avatar } } }`;

    const res = await fetch(graphqlEndpoint, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        query,
        variables: { input: { companyName: company, name, email, password } },
      }),
    });

    const data = await res.json();
    if (!res.ok || data.errors) {
      const message = data?.errors?.[0]?.message || "Unable to create account";
      return NextResponse.json({ ok: false, error: message }, { status: 400 });
    }

    const auth = data.data?.register;
    if (!auth || !auth.token) {
      return NextResponse.json({ ok: false, error: "Invalid registration response" }, { status: 500 });
    }

    const maxAge = 60 * 60 * 24 * 7;
    const cookie = `token=${auth.token}; Path=/; HttpOnly; SameSite=Lax; Max-Age=${maxAge}`;

    const response = NextResponse.json({ ok: true, user: auth.user, token: auth.token }, { status: 201 });
    response.headers.append("Set-Cookie", cookie);
    return response;
  } catch (err) {
    const error = err instanceof Error ? err.message : "Invalid request";
    return NextResponse.json({ ok: false, error }, { status: 400 });
  }
}
