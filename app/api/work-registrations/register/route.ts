import { getEmployerBlockchainClient } from "@/lib/blockchain/client"
import { createClient } from "@/lib/supabase/server"
import { NextResponse } from "next/server"

// POST /api/work-registrations/register - Register a new work entry
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
      return NextResponse.json({ error: "Forbidden: Only employers can register work entries" }, { status: 403 })
    }

    const body = await request.json()
    const { employeeCNP, position, salary, startDate, endDate } = body

    // Validate required fields
    if (!employeeCNP || !position || !salary || !startDate) {
      return NextResponse.json(
        { error: "Employee CNP, position, salary, and start date are required" },
        { status: 400 },
      )
    }

    // Validate that employee exists for this employer
    const { data: employee, error: employeeError } = await supabase
      .from("employees")
      .select("*")
      .eq("employer_id", user.id)
      .eq("employee_cnp", employeeCNP)
      .single()

    if (employeeError || !employee) {
      return NextResponse.json({ error: "Employee not found or does not belong to this employer" }, { status: 404 })
    }

    //Register on blockchain
    const blockchainClient = getEmployerBlockchainClient()
    const transaction = await blockchainClient.registerWork({
      employeeCNP,
      employerAddress: user.id,
      position,
      salary: salary.toString(),
      startDate,
      endDate,
    })

    const mockTransactionHash = `0x${Date.now().toString(16)}${Math.random().toString(16).slice(2, 10)}`

    // Store metadata in database
    const { data: registration, error: insertError } = await supabase
      .from("work_registrations")
      .insert({
        employee_cnp: employeeCNP,
        employer_id: user.id,
        position,
        salary: Number.parseFloat(salary),
        start_date: startDate,
        end_date: endDate || null,
        tx_hash: mockTransactionHash,
        status: "pending",
      })
      .select()
      .single()

    if (insertError) {
      throw insertError
    }

    return NextResponse.json(
      {
        registration,
        transactionHash: mockTransactionHash,
      },
      { status: 201 },
    )
  } catch (error) {
    console.error("Error registering work:", error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Internal server error" },
      { status: 500 },
    )
  }
}
