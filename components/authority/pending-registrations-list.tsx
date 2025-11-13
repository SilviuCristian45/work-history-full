"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { CheckCircle, XCircle, Clock } from "lucide-react"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"

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
  employer?: {
    full_name: string
    email: string
  }
}

interface PendingRegistrationsListProps {
  registrations: WorkRegistration[]
}

export function PendingRegistrationsList({ registrations }: PendingRegistrationsListProps) {
  const [selectedRegistration, setSelectedRegistration] = useState<WorkRegistration | null>(null)
  const [action, setAction] = useState<"approve" | "reject" | null>(null)
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  const handleAction = async (approved: boolean) => {
    if (!selectedRegistration) return

    setLoading(true)
    try {
      const response = await fetch("/api/work-registrations/authorize", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          registrationId: selectedRegistration.id,
          approved,
        }),
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || "Failed to process registration")
      }

      setSelectedRegistration(null)
      setAction(null)
      router.refresh()
    } catch (error) {
      console.error("Error processing registration:", error)
      alert(error instanceof Error ? error.message : "An error occurred")
    } finally {
      setLoading(false)
    }
  }

  if (registrations.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-center">
        <Clock className="mb-4 h-12 w-12 text-muted-foreground" />
        <h3 className="mb-2 text-lg font-semibold">No pending registrations</h3>
        <p className="text-sm text-muted-foreground">All work registrations have been reviewed</p>
      </div>
    )
  }

  return (
    <>
      <div className="overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Employee CNP</TableHead>
              <TableHead>Employer</TableHead>
              <TableHead>Position</TableHead>
              <TableHead>Salary</TableHead>
              <TableHead>Start Date</TableHead>
              <TableHead>End Date</TableHead>
              <TableHead>Tx Hash</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {registrations.map((registration) => (
              <TableRow key={registration.id}>
                <TableCell className="font-medium">{registration.employee_cnp}</TableCell>
                <TableCell>
                  <div className="font-medium">{registration.employer?.full_name || "Unknown"}</div>
                  <div className="text-xs text-muted-foreground">{registration.employer?.email}</div>
                </TableCell>
                <TableCell>{registration.position}</TableCell>
                <TableCell>{Number.parseFloat(registration.salary.toString()).toLocaleString("ro-RO")} RON</TableCell>
                <TableCell>{new Date(registration.start_date).toLocaleDateString("ro-RO")}</TableCell>
                <TableCell>
                  {registration.end_date ? new Date(registration.end_date).toLocaleDateString("ro-RO") : "Present"}
                </TableCell>
                <TableCell>
                  <code className="text-xs">{registration.tx_hash.slice(0, 10)}...</code>
                </TableCell>
                <TableCell>
                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      variant="default"
                      onClick={() => {
                        setSelectedRegistration(registration)
                        setAction("approve")
                      }}
                    >
                      <CheckCircle className="mr-1 h-3 w-3" />
                      Approve
                    </Button>
                    <Button
                      size="sm"
                      variant="destructive"
                      onClick={() => {
                        setSelectedRegistration(registration)
                        setAction("reject")
                      }}
                    >
                      <XCircle className="mr-1 h-3 w-3" />
                      Reject
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      <AlertDialog
        open={!!action}
        onOpenChange={(open) => {
          if (!open) {
            setAction(null)
            setSelectedRegistration(null)
          }
        }}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{action === "approve" ? "Approve" : "Reject"} Work Registration</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to {action} this work registration for employee {selectedRegistration?.employee_cnp}
              ?{action === "approve" && " This action will record the approval on the blockchain."}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={() => handleAction(action === "approve")} disabled={loading}>
              {loading ? "Processing..." : "Confirm"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}
