import { createClient } from "@/lib/supabase/server"
import { NextResponse } from "next/server"

// GET /api/employees - Get all employees for the current employer
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

    // Check if user is an employer
    const { data: userData, error: userError } = await supabase.from("users").select("role").eq("id", user.id).single()

    if (userError || userData?.role !== "employer") {
      return NextResponse.json({ error: "Forbidden: Only employers can access this endpoint" }, { status: 403 })
    }

    // Get all employees for this employer (RLS handles filtering)
    const { data: employees, error: employeesError } = await supabase
      .from("employees")
      .select("*")
      .order("created_at", { ascending: false })

    if (employeesError) {
      throw employeesError
    }

    return NextResponse.json({ employees })
  } catch (error) {
    console.error("Error fetching employees:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

// POST /api/employees - Add a new employee
export async function POST(request: Request) {
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

    // Check if user is an employer
    const { data: userData, error: userError } = await supabase.from("users").select("role").eq("id", user.id).single()

    if (userError || userData?.role !== "employer") {
      return NextResponse.json({ error: "Forbidden: Only employers can add employees" }, { status: 403 })
    }

    const body = await request.json()
    const { employeeCNP, employeeName, currentPosition, currentSalary, hireDate } = body

    // Validate required fields
    if (!employeeCNP || !employeeName) {
      return NextResponse.json({ error: "Employee CNP and name are required" }, { status: 400 })
    }

    // Insert employee (RLS handles employer_id)
    const { data: employee, error: insertError } = await supabase
      .from("employees")
      .insert({
        employer_id: user.id,
        employee_cnp: employeeCNP,
        employee_name: employeeName,
        current_position: currentPosition,
        current_salary: currentSalary,
        hire_date: hireDate,
        status: "active",
      })
      .select()
      .single()

    if (insertError) {
      throw insertError
    }

    return NextResponse.json({ employee }, { status: 201 })
  } catch (error) {
    console.error("Error adding employee:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
