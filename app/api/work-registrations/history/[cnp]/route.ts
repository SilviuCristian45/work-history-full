import { createClient } from "@/lib/supabase/server"
import { NextResponse } from "next/server"

// GET /api/work-registrations/history/:cnp - Get work history for an employee
export async function GET(request: Request, { params }: { params: Promise<{ cnp: string }> }) {
  try {
    const { cnp } = await params
    const supabase = await createClient()

    // Check authentication
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Check user role and permissions
    const { data: userData, error: userError } = await supabase
      .from("users")
      .select("role, cnp")
      .eq("id", user.id)
      .single()

    if (userError) {
      throw userError
    }

    // Employees can only view their own history
    if (userData.role === "employee" && userData.cnp !== cnp) {
      return NextResponse.json({ error: "Forbidden: You can only view your own work history" }, { status: 403 })
    }

    // Authorities can view any history, employees can view their own
    if (userData.role !== "employee" && userData.role !== "authority") {
      return NextResponse.json(
        { error: "Forbidden: Only employees and authorities can view work history" },
        { status: 403 },
      )
    }

    // Get work registrations from database (RLS handles filtering)
    const { data: registrations, error: registrationsError } = await supabase
      .from("work_registrations")
      .select(`
        *,
        employer:employer_id (
          full_name,
          email
        ),
        authority:approved_by (
          full_name
        )
      `)
      .eq("employee_cnp", cnp)
      .order("start_date", { ascending: false })

    if (registrationsError) {
      throw registrationsError
    }

    return NextResponse.json({ history: registrations })
  } catch (error) {
    console.error("Error fetching work history:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
