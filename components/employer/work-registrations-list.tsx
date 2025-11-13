"use client"

import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Briefcase } from "lucide-react"

interface WorkRegistration {
  id: string
  employee_cnp: string
  position: string
  salary: number
  start_date: string
  end_date?: string
  tx_hash: string
  status: string
  created_at: string
  authority?: {
    full_name: string
  }
}

interface WorkRegistrationsListProps {
  registrations: WorkRegistration[]
}

export function WorkRegistrationsList({ registrations }: WorkRegistrationsListProps) {
  if (registrations.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-center">
        <Briefcase className="mb-4 h-12 w-12 text-muted-foreground" />
        <h3 className="mb-2 text-lg font-semibold">No work registrations yet</h3>
        <p className="text-sm text-muted-foreground">Register work entries for your employees</p>
      </div>
    )
  }

  return (
    <div className="overflow-x-auto">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Employee CNP</TableHead>
            <TableHead>Position</TableHead>
            <TableHead>Salary</TableHead>
            <TableHead>Start Date</TableHead>
            <TableHead>End Date</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Tx Hash</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {registrations.map((registration) => (
            <TableRow key={registration.id}>
              <TableCell className="font-medium">{registration.employee_cnp}</TableCell>
              <TableCell>{registration.position}</TableCell>
              <TableCell>{Number.parseFloat(registration.salary.toString()).toLocaleString("ro-RO")} RON</TableCell>
              <TableCell>{new Date(registration.start_date).toLocaleDateString("ro-RO")}</TableCell>
              <TableCell>
                {registration.end_date ? new Date(registration.end_date).toLocaleDateString("ro-RO") : "Present"}
              </TableCell>
              <TableCell>
                <Badge
                  variant={
                    registration.status === "approved"
                      ? "default"
                      : registration.status === "pending"
                        ? "secondary"
                        : "destructive"
                  }
                >
                  {registration.status}
                </Badge>
              </TableCell>
              <TableCell>
                <code className="text-xs">{registration.tx_hash.slice(0, 10)}...</code>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  )
}
