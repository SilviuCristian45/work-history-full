import { createClient } from "@/lib/supabase/server"
import { getBlockchainClient } from "@/lib/blockchain/client"
import { NextResponse } from "next/server"

// POST /api/work-registrations/authorize - Authorize a work registration
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

    // Check if user is an authority
    const { data: userData, error: userError } = await supabase.from("users").select("role, full_name").eq("id", user.id).single()

    if (userError || userData?.role !== "authority") {
      return NextResponse.json(
        { error: "Forbidden: Only authorities can authorize work registrations" },
        { status: 403 },
      )
    }

    const body = await request.json()
    const { registrationId, approved } = body

    // Validate required fields
    if (!registrationId || typeof approved !== "boolean") {
      return NextResponse.json({ error: "Registration ID and approval status are required" }, { status: 400 })
    }

    // Get the registration
    const { data: registration, error: registrationError } = await supabase
      .from("work_registrations")
      .select("*")
      .eq("id", registrationId)
      .single()

    if (registrationError || !registration) {
      return NextResponse.json({ error: "Work registration not found" }, { status: 404 })
    }

    // Check if already authorized
    if (registration.status !== "pending") {
      return NextResponse.json({ error: "This registration has already been processed" }, { status: 400 })
    }

    // Authorize on blockchain
   // const blockchainClient = getBlockchainClient()
   // const transaction = await blockchainClient.authorizeWorkRegistration(registration.tx_hash, , userData.full_name)

    // Update registration in database
    const { data: updatedRegistration, error: updateError } = await supabase
      .from("work_registrations")
      .update({
        status: approved ? "approved" : "rejected",
        approved_by: user.id,
        approved_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
      .eq("id", registrationId)
      .select()
      .single()

    if (updateError) {
      throw updateError
    }

    return NextResponse.json({
      registration: updatedRegistration,
      authorizationHash: '123132',
    })
  } catch (error) {
    console.error("Error authorizing work registration:", error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Internal server error" },
      { status: 500 },
    )
  }
}
