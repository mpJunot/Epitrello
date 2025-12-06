import { NextResponse } from "next/server";

export async function POST() {
  // Clear the cookie by setting Max-Age=0
  const cookie = `token=; Path=/; HttpOnly; SameSite=Lax; Max-Age=0`;
  const response = NextResponse.json({ ok: true }, { status: 200 });
  response.headers.append("Set-Cookie", cookie);
  return response;
}
