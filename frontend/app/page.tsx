// Redirect root to /login
import { redirect } from "next/navigation"

export default function RootPage() {
  // Simple server-side redirect to the login page
  redirect('/login')
}
