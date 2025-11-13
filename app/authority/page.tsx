import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { LogOut, CheckCircle, Clock, XCircle } from "lucide-react"
import { PendingRegistrationsList } from "@/components/authority/pending-registrations-list"
import { EmployeeHistorySearch } from "@/components/authority/employee-history-search"

export default async function AuthorityPage() {
  const supabase = await createClient()

  console.log("[v0] Authority page loading...")

  // Check authentication
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser()

  console.log("[v0] Auth check:", { user: user?.id, error: authError })

  if (authError || !user) {
    redirect("/auth/login")
  }

  // Get user data
  const { data: userData, error: userError } = await supabase.from("users").select("*").eq("id", user.id).single()

  console.log("[v0] User data:", { userData, error: userError })

  if (userError || !userData || userData.role !== "authority") {
    redirect("/auth/login")
  }

  // Fetch all work registrations without joins first
  const { data: registrations, error: registrationsError } = await supabase
    .from("work_registrations")
    .select("*")
    .order("created_at", { ascending: false })

  console.log("[v0] Registrations fetched:", {
    count: registrations?.length,
    error: registrationsError,
  })

  const registrationsList = registrations || []

  // Calculate statistics
  const pendingCount = registrationsList.filter((r) => r.status === "pending").length
  const approvedCount = registrationsList.filter((r) => r.status === "approved").length
  const rejectedCount = registrationsList.filter((r) => r.status === "rejected").length

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b bg-card">
        <div className="container mx-auto flex items-center justify-between p-4">
          <div>
            <h1 className="text-2xl font-semibold">Authority Dashboard</h1>
            <p className="text-sm text-muted-foreground">
              {userData.full_name} - {userData.email}
            </p>
          </div>
          <form
            action={async () => {
              "use server"
              const supabase = await createClient()
              await supabase.auth.signOut()
              redirect("/auth/login")
            }}
          >
            <Button variant="outline" size="sm">
              <LogOut className="mr-2 h-4 w-4" />
              Logout
            </Button>
          </form>
        </div>
      </header>

      <main className="container mx-auto p-6">
        {/* Statistics Cards */}
        <div className="mb-8 grid gap-4 md:grid-cols-3">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Pending Reviews</CardTitle>
              <Clock className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{pendingCount}</div>
              <p className="text-xs text-muted-foreground">Awaiting your review</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Approved</CardTitle>
              <CheckCircle className="h-4 w-4 text-green-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{approvedCount}</div>
              <p className="text-xs text-muted-foreground">Total approved registrations</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Rejected</CardTitle>
              <XCircle className="h-4 w-4 text-red-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{rejectedCount}</div>
              <p className="text-xs text-muted-foreground">Total rejected registrations</p>
            </CardContent>
          </Card>
        </div>

        {/* Tabs */}
        <Tabs defaultValue="pending" className="space-y-4">
          <TabsList>
            <TabsTrigger value="pending">Pending Reviews</TabsTrigger>
            <TabsTrigger value="search">Employee History Search</TabsTrigger>
          </TabsList>

          <TabsContent value="pending" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Pending Work Registrations</CardTitle>
                <CardDescription>Review and approve or reject work registrations</CardDescription>
              </CardHeader>
              <CardContent>
                <PendingRegistrationsList registrations={registrationsList.filter((r) => r.status === "pending")} />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="search" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Employee History Search</CardTitle>
                <CardDescription>Search work history by employee CNP</CardDescription>
              </CardHeader>
              <CardContent>
                <EmployeeHistorySearch />
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  )
}
