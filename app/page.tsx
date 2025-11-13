import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Shield, Briefcase, Users } from "lucide-react"

export default function HomePage() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-background p-6">
      <div className="w-full max-w-4xl space-y-8">
        <div className="text-center">
          <h1 className="mb-4 text-4xl font-bold">Work History Registry</h1>
          <p className="text-lg text-muted-foreground">Blockchain-powered work registration system for Romania</p>
        </div>

        <div className="grid gap-6 md:grid-cols-3">
          <Card>
            <CardHeader>
              <Users className="mb-2 h-8 w-8 text-primary" />
              <CardTitle>Employee</CardTitle>
              <CardDescription>View your complete work history</CardDescription>
            </CardHeader>
            <CardContent>
              <Link href="/auth/login">
                <Button className="w-full">Access Dashboard</Button>
              </Link>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <Briefcase className="mb-2 h-8 w-8 text-primary" />
              <CardTitle>Employer</CardTitle>
              <CardDescription>Register work entries for employees</CardDescription>
            </CardHeader>
            <CardContent>
              <Link href="/auth/login">
                <Button className="w-full">Access Dashboard</Button>
              </Link>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <Shield className="mb-2 h-8 w-8 text-primary" />
              <CardTitle>Authority</CardTitle>
              <CardDescription>Review and approve registrations</CardDescription>
            </CardHeader>
            <CardContent>
              <Link href="/auth/login">
                <Button className="w-full">Access Dashboard</Button>
              </Link>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>About the System</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 text-sm text-muted-foreground">
            <p>
              This system provides a secure, blockchain-based work history registry for Romanian employees, employers,
              and authorities.
            </p>
            <ul className="list-inside list-disc space-y-2">
              <li>
                <strong>Employees</strong> can view their complete work history with all registered positions, salaries,
                and employment periods
              </li>
              <li>
                <strong>Employers</strong> can register work entries for their employees on the blockchain
              </li>
              <li>
                <strong>Authorities</strong> (ANAF, Casa de Pensii, ITM) can review and approve work registrations
              </li>
            </ul>
            <p>
              All work registrations are stored immutably on the blockchain, with metadata securely managed in the
              database.
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
