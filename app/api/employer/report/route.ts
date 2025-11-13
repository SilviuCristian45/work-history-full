import { NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"

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

    // Get user data
    const { data: userData, error: userError } = await supabase.from("users").select("*").eq("id", user.id).single()

    if (userError || !userData || userData.role !== "employer") {
      return NextResponse.json({ error: "Forbidden - Employer role required" }, { status: 403 })
    }

    // Fetch all work registrations for this employer
    const { data: registrations, error: registrationsError } = await supabase
      .from("work_registrations")
      .select("*")
      .eq("employer_id", user.id)
      .eq("status", "approved") // Only approved registrations
      .order("start_date", { ascending: true })

    if (registrationsError) {
      console.error("[v0] Error fetching registrations:", registrationsError)
      return NextResponse.json({ error: "Failed to fetch work registrations" }, { status: 500 })
    }

    const registrationsList = registrations || []

    // Calculate statistics by year
    const statsByYear: Record<string, { totalSalary: number; count: number; avgSalary: number }> = {}
    let totalContribution = 0
    const GOVERNMENT_TAX_RATE = 0.42 // 42%

    registrationsList.forEach((reg) => {
      const year = new Date(reg.start_date).getFullYear()
      const salary = Number(reg.salary)

      if (!statsByYear[year]) {
        statsByYear[year] = { totalSalary: 0, count: 0, avgSalary: 0 }
      }

      statsByYear[year].totalSalary += salary
      statsByYear[year].count += 1

      // Calculate months worked for this registration
      const startDate = new Date(reg.start_date)
      const endDate = reg.end_date ? new Date(reg.end_date) : new Date()
      const monthsWorked = Math.max(1, (endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24 * 30))

      // Calculate government contribution (42% of salary * months)
      totalContribution += salary * GOVERNMENT_TAX_RATE * monthsWorked
    })

    // Calculate average salary per year
    Object.keys(statsByYear).forEach((year) => {
      statsByYear[year].avgSalary = statsByYear[year].totalSalary / statsByYear[year].count
    })

    // Format data for response
    const yearlyData = Object.keys(statsByYear)
      .sort()
      .map((year) => ({
        year: Number.parseInt(year),
        avgSalary: Math.round(statsByYear[year].avgSalary),
        totalSalary: Math.round(statsByYear[year].totalSalary),
        count: statsByYear[year].count,
      }))

    return NextResponse.json({
      employer: {
        name: userData.full_name,
        email: userData.email,
      },
      registrations: registrationsList.map((reg) => ({
        employeeCnp: reg.employee_cnp,
        position: reg.position,
        salary: Number(reg.salary),
        startDate: reg.start_date,
        endDate: reg.end_date,
        txHash: reg.blockchain_tx_hash,
      })),
      statistics: {
        totalRegistrations: registrationsList.length,
        totalContribution: Math.round(totalContribution),
        yearlyData,
        taxRate: GOVERNMENT_TAX_RATE * 100,
      },
    })
  } catch (error) {
    console.error("[v0] Error generating report:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
