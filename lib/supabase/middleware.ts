import { createServerClient } from "@supabase/ssr"
import { NextResponse, type NextRequest } from "next/server"

export async function updateSession(request: NextRequest) {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || process.env.SUPABASE_ANON_KEY

  if (!supabaseUrl || !supabaseAnonKey) {
    console.error(
      `[v0] Supabase environment variables are missing in middleware! URL: ${!!supabaseUrl}, Key: ${!!supabaseAnonKey}`,
    )
    // Allow request to proceed without auth if env vars are missing to prevent crash
    return NextResponse.next({ request })
  }

  let supabaseResponse = NextResponse.next({
    request,
  })

  const supabase = createServerClient(supabaseUrl, supabaseAnonKey, {
    cookies: {
      getAll() {
        return request.cookies.getAll()
      },
      setAll(cookiesToSet) {
        cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value))
        supabaseResponse = NextResponse.next({
          request,
        })
        cookiesToSet.forEach(({ name, value, options }) => supabaseResponse.cookies.set(name, value, options))
      },
    },
  })

  const {
    data: { user },
  } = await supabase.auth.getUser()

  const isAuthPage = request.nextUrl.pathname === "/auth" || request.nextUrl.pathname.startsWith("/auth/")

  // Redirect unauthenticated users to login
  if (!user && !isAuthPage && request.nextUrl.pathname !== "/") {
    const url = request.nextUrl.clone()
    url.pathname = "/auth/login"
    return NextResponse.redirect(url)
  }

  // Redirect authenticated users from auth pages to their dashboard
  if (user && isAuthPage) {
    const { data: userData } = await supabase.from("users").select("role").eq("id", user.id).single()

    if (userData) {
      const url = request.nextUrl.clone()
      url.pathname = `/${userData.role}`
      return NextResponse.redirect(url)
    }
  }

  return supabaseResponse
}
