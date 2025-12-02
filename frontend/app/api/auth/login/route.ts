import { NextResponse } from "next/server"

export async function POST(request: Request) {
  try {
    const body = await request.json().catch(() => ({}))

    // Fake authentication: accept any email/password and return success
    // In a real backend you'd validate credentials, create a session, etc.
    const { email } = body as { email?: string }

    const user = {
      id: email ? email : "local-user",
      name: "Utilisateur",
    }
    console.log("User logged in:", user)
    return NextResponse.json({ ok: true, user }, { status: 200 })
  } catch (err) {
    return NextResponse.json({ ok: false, error: "Invalid request" }, { status: 400 })
  }
}
