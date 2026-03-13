import { createServerClient } from "@supabase/ssr"
import { NextResponse, type NextRequest } from "next/server"

const IDLE_TIMEOUT_MS = 2 * 60 * 60 * 1000 // 2 hours

export async function updateSession(request: NextRequest) {
  let supabaseResponse = NextResponse.next({
    request,
  })

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

  if (!supabaseUrl || !supabaseKey) {
    return supabaseResponse
  }

  const supabase = createServerClient(
    supabaseUrl,
    supabaseKey,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value)
          )
          supabaseResponse = NextResponse.next({
            request,
          })
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          )
        },
      },
    }
  )

  // Refresh the session - important for Server Components
  const { data: { user } } = await supabase.auth.getUser()

  // Idle timeout: sign out if inactive for 2+ hours (unless "remember me" is set)
  if (user) {
    const rememberMe = request.cookies.get("remember_me")?.value === "true"
    const lastActivity = request.cookies.get("last_activity")?.value

    if (!rememberMe && lastActivity) {
      const elapsed = Date.now() - parseInt(lastActivity, 10)
      if (elapsed > IDLE_TIMEOUT_MS) {
        // Session expired due to inactivity -- sign out
        await supabase.auth.signOut()
        supabaseResponse.cookies.delete("last_activity")
        supabaseResponse.cookies.delete("remember_me")

        // Redirect to sign-in if they were trying to access a protected page
        const path = request.nextUrl.pathname
        if (path.startsWith("/dashboard")) {
          const signInUrl = new URL("/sign-in", request.url)
          signInUrl.searchParams.set("reason", "session_expired")
          const redirectResponse = NextResponse.redirect(signInUrl)
          // Transfer all cookie changes (sign-out + deletions) to the redirect response
          supabaseResponse.cookies.getAll().forEach((cookie) => {
            redirectResponse.cookies.set(cookie)
          })
          redirectResponse.cookies.delete("last_activity")
          redirectResponse.cookies.delete("remember_me")
          return redirectResponse
        }
        return supabaseResponse
      }
    }

    // Update last activity timestamp on every request
    supabaseResponse.cookies.set("last_activity", Date.now().toString(), {
      path: "/",
      httpOnly: true,
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
      // No maxAge = session cookie (cleared when browser closes) unless remember me
      ...(rememberMe ? { maxAge: 30 * 24 * 60 * 60 } : {}), // 30 days if remembered
    })
  }

  return supabaseResponse
}
