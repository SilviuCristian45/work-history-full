import { createClient as createServerClient } from "@/lib/supabase/server"

export type UserRole = "employee" | "employer" | "authority"

export interface User {
  id: string
  email: string
  full_name: string | null
  cnp: string | null
  role: UserRole
  created_at: string
  updated_at: string
}

export async function getCurrentUser(): Promise<User | null> {
  const supabase = await createServerClient()

  const {
    data: { user: authUser },
    error: authError,
  } = await supabase.auth.getUser()

  if (authError || !authUser) {
    return null
  }

  const { data: user, error: userError } = await supabase.from("users").select("*").eq("id", authUser.id).single()

  if (userError || !user) {
    return null
  }

  return user as User
}

export async function requireAuth(): Promise<User> {
  const user = await getCurrentUser()

  if (!user) {
    throw new Error("Unauthorized")
  }

  return user
}

export async function requireRole(allowedRoles: UserRole[]): Promise<User> {
  const user = await requireAuth()

  if (!allowedRoles.includes(user.role)) {
    throw new Error(`Forbidden: requires role ${allowedRoles.join(" or ")}`)
  }

  return user
}
