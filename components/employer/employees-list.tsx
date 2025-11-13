"use client"

import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Users } from "lucide-react"

interface Employee {
  id: string
  employee_cnp: string
  employee_name: string
  current_position?: string
  current_salary?: number
  hire_date?: string
  status: string
}

interface EmployeesListProps {
  employees: Employee[]
}

export function EmployeesList({ employees }: EmployeesListProps) {
  if (employees.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-center">
        <Users className="mb-4 h-12 w-12 text-muted-foreground" />
        <h3 className="mb-2 text-lg font-semibold">No employees yet</h3>
        <p className="text-sm text-muted-foreground">Add your first employee to get started</p>
      </div>
    )
  }

  return (
    <div className="overflow-x-auto">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Name</TableHead>
            <TableHead>CNP</TableHead>
            <TableHead>Position</TableHead>
            <TableHead>Salary</TableHead>
            <TableHead>Hire Date</TableHead>
            <TableHead>Status</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {employees.map((employee) => (
            <TableRow key={employee.id}>
              <TableCell className="font-medium">{employee.employee_name}</TableCell>
              <TableCell>{employee.employee_cnp}</TableCell>
              <TableCell>{employee.current_position || "-"}</TableCell>
              <TableCell>
                {employee.current_salary ? `${employee.current_salary.toLocaleString("ro-RO")} RON` : "-"}
              </TableCell>
              <TableCell>
                {employee.hire_date ? new Date(employee.hire_date).toLocaleDateString("ro-RO") : "-"}
              </TableCell>
              <TableCell>
                <Badge variant={employee.status === "active" ? "default" : "secondary"}>{employee.status}</Badge>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  )
}
