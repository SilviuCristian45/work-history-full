import { createClient } from "@/lib/supabase/server"
import { NextResponse } from "next/server"

// GET /api/work-registrations/pending - Get all pending work registrations for authorities
export async function GET() {
  try {
    const supabase = await createClient()

    // Check authentication
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Check if user is an authority
    const { data: userData, error: userError } = await supabase.from("users").select("role").eq("id", user.id).single()

    if (userError || userData?.role !== "authority") {
      return NextResponse.json({ error: "Forbidden: Only authorities can view pending registrations" }, { status: 403 })
    }

    // Get pending registrations (RLS handles filtering)
    const { data: registrations, error: registrationsError } = await supabase
      .from("work_registrations")
      .select(`
        *,
        employer:employer_id (
          full_name,
          email
        )
      `)
      .eq("status", "pending")
      .order("created_at", { ascending: false })

    if (registrationsError) {
      throw registrationsError
    }

    return NextResponse.json({ registrations })
  } catch (error) {
    console.error("Error fetching pending registrations:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
