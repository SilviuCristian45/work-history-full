import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { LogOut, Users, Briefcase, Clock } from "lucide-react"
import { EmployeesList } from "@/components/employer/employees-list"
import { AddEmployeeDialog } from "@/components/employer/add-employee-dialog"
import { WorkRegistrationsList } from "@/components/employer/work-registrations-list"
import { RegisterWorkDialog } from "@/components/employer/register-work-dialog"
import { GenerateReportButton } from "@/components/employer/generate-report-button"

export default async function EmployerPage() {
  const supabase = await createClient()

  // Check authentication
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser()

  if (authError || !user) {
    redirect("/auth/login")
  }

  // Get user data
  const { data: userData, error: userError } = await supabase.from("users").select("*").eq("id", user.id).single()

  if (userError || !userData || userData.role !== "employer") {
    redirect("/auth/login")
  }

  // Fetch employees
  const { data: employees, error: employeesError } = await supabase
    .from("employees")
    .select("*")
    .order("created_at", { ascending: false })

  // Fetch work registrations
  const { data: registrations, error: registrationsError } = await supabase
    .from("work_registrations")
    .select(`
      *,
      authority:approved_by (
        full_name
      )
    `)
    .order("created_at", { ascending: false })

  const employeesList = employees || []
  const registrationsList = registrations || []

  // Calculate statistics
  const activeEmployees = employeesList.filter((e) => e.status === "active")
  const pendingRegistrations = registrationsList.filter((r) => r.status === "pending")

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b bg-card">
        <div className="container mx-auto flex items-center justify-between p-4">
          <div>
            <h1 className="text-2xl font-semibold">Employer Dashboard</h1>
            <p className="text-sm text-muted-foreground">
              {userData.full_name} - {userData.email}
            </p>
          </div>
          <div className="flex gap-2">
            <GenerateReportButton />
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
        </div>
      </header>

      <main className="container mx-auto p-6">
        {/* Statistics Cards */}
        <div className="mb-8 grid gap-4 md:grid-cols-3">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Active Employees</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{activeEmployees.length}</div>
              <p className="text-xs text-muted-foreground">{employeesList.length} total</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Work Registrations</CardTitle>
              <Briefcase className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{registrationsList.length}</div>
              <p className="text-xs text-muted-foreground">Total registrations</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Pending Approvals</CardTitle>
              <Clock className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{pendingRegistrations.length}</div>
              <p className="text-xs text-muted-foreground">Awaiting authority review</p>
            </CardContent>
          </Card>
        </div>

        {/* Tabs */}
        <Tabs defaultValue="employees" className="space-y-4">
          <TabsList>
            <TabsTrigger value="employees">Employees</TabsTrigger>
            <TabsTrigger value="registrations">Work Registrations</TabsTrigger>
          </TabsList>

          <TabsContent value="employees" className="space-y-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <div>
                  <CardTitle>Employees</CardTitle>
                  <CardDescription>Manage your employee list</CardDescription>
                </div>
                <AddEmployeeDialog />
              </CardHeader>
              <CardContent>
                <EmployeesList employees={employeesList} />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="registrations" className="space-y-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <div>
                  <CardTitle>Work Registrations</CardTitle>
                  <CardDescription>Register work entries on blockchain</CardDescription>
                </div>
                <RegisterWorkDialog employees={employeesList} />
              </CardHeader>
              <CardContent>
                <WorkRegistrationsList registrations={registrationsList} />
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  )
}
