import { NextResponse } from "next/server";

export async function GET(request: Request) {
  try {
    // Read cookie header and extract token
    const cookieHeader = request.headers.get("cookie") || "";
    const tokenMatch = cookieHeader.match(/(?:^|; )token=([^;]+)/);
    const token = tokenMatch ? tokenMatch[1] : null;

    if (!token) {
      return NextResponse.json({ ok: false, error: "No token" }, { status: 401 });
    }

    const graphqlEndpoint = process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:4000/graphql";
    const query = `query Me { me { id email name avatar createdAt updatedAt } }`;

    const res = await fetch(graphqlEndpoint, {
      method: "POST",
      headers: { "Content-Type": "application/json", "Authorization": `Bearer ${token}` },
      body: JSON.stringify({ query }),
    });

    const data = await res.json();
    if (!res.ok || data.errors) {
      const message = data?.errors?.[0]?.message || "Unable to fetch user";
      return NextResponse.json({ ok: false, error: message }, { status: 401 });
    }

    return NextResponse.json({ ok: true, user: data.data.me }, { status: 200 });
  } catch (err: any) {
    return NextResponse.json({ ok: false, error: err?.message || "Invalid request" }, { status: 400 });
  }
}
