import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { LogOut, Briefcase, DollarSign, Calendar } from "lucide-react"
import ExportPdfButton from "@/components/ui/export-pdf-button"


export default async function EmployeePage() {
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

  if (userError || !userData || userData.role !== "employee") {
    redirect("/auth/login")
  }

  // Fetch work history
  const { data: workHistory, error: historyError } = await supabase
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
    .eq("employee_cnp", userData.cnp)
    .order("start_date", { ascending: false })

  const history = workHistory || []

  // Calculate statistics
  const approvedRegistrations = history.filter((r) => r.status === "approved")
  const pendingRegistrations = history.filter((r) => r.status === "pending")
  const totalSalary = approvedRegistrations.reduce((sum, r) => sum + Number.parseFloat(r.salary || "0"), 0)

 

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b bg-card">
        <div className="container mx-auto flex items-center justify-between p-4">
          <div>
            <h1 className="text-2xl font-semibold">Employee Dashboard</h1>
            <p className="text-sm text-muted-foreground">
              {userData.full_name} - CNP: {userData.cnp}
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
              <CardTitle className="text-sm font-medium">Total Work Entries</CardTitle>
              <Briefcase className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{history.length}</div>
              <p className="text-xs text-muted-foreground">{approvedRegistrations.length} approved</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Pending Approvals</CardTitle>
              <Calendar className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{pendingRegistrations.length}</div>
              <p className="text-xs text-muted-foreground">Awaiting authority review</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Earnings</CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{totalSalary.toLocaleString("ro-RO")} RON</div>
              <p className="text-xs text-muted-foreground">From approved entries</p>
            </CardContent>
          </Card>
        </div>

        {/* Work History Table */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
  <div>
    <CardTitle>Work History</CardTitle>
    <CardDescription>Your complete work registration history stored on blockchain</CardDescription>
  </div>
 <ExportPdfButton history={history} userFullName={userData.full_name} />

</CardHeader>
          <CardContent>
            {history.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12 text-center">
                <Briefcase className="mb-4 h-12 w-12 text-muted-foreground" />
                <h3 className="mb-2 text-lg font-semibold">No work history yet</h3>
                <p className="text-sm text-muted-foreground">
                  Your work registrations will appear here once your employer adds them
                </p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Employer</TableHead>
                      <TableHead>Position</TableHead>
                      <TableHead>Salary</TableHead>
                      <TableHead>Start Date</TableHead>
                      <TableHead>End Date</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Tx Hash</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {history.map((entry) => (
                      <TableRow key={entry.id}>
                        <TableCell>
                          <div className="font-medium">{entry.employer?.full_name || "Unknown"}</div>
                          <div className="text-xs text-muted-foreground">{entry.employer?.email}</div>
                        </TableCell>
                        <TableCell>{entry.position}</TableCell>
                        <TableCell>{Number.parseFloat(entry.salary).toLocaleString("ro-RO")} RON</TableCell>
                        <TableCell>{new Date(entry.start_date).toLocaleDateString("ro-RO")}</TableCell>
                        <TableCell>
                          {entry.end_date ? new Date(entry.end_date).toLocaleDateString("ro-RO") : "Present"}
                        </TableCell>
                        <TableCell>
                          <Badge
                            variant={
                              entry.status === "approved"
                                ? "default"
                                : entry.status === "pending"
                                  ? "secondary"
                                  : "destructive"
                            }
                          >
                            {entry.status}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <code className="text-xs">{entry.tx_hash.slice(0, 10)}...</code>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>
        </Card>
      </main>
    </div>
  )
}
