"use client"

import type React from "react"

import { useState } from "react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Search } from "lucide-react"

interface WorkRegistration {
  id: string
  employee_cnp: string
  position: string
  salary: number
  start_date: string
  end_date?: string
  tx_hash: string
  status: string
  employer?: {
    full_name: string
    email: string
  }
  authority?: {
    full_name: string
  }
}

export function EmployeeHistorySearch() {
  const [cnp, setCnp] = useState("")
  const [loading, setLoading] = useState(false)
  const [history, setHistory] = useState<WorkRegistration[] | null>(null)
  const [error, setError] = useState<string | null>(null)

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!cnp || cnp.length !== 13) {
      setError("Please enter a valid 13-digit CNP")
      return
    }

    setLoading(true)
    setError(null)

    try {
      const response = await fetch(`/api/work-registrations/history/${cnp}`)

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || "Failed to fetch history")
      }

      const data = await response.json()
      setHistory(data.history)
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred")
      setHistory(null)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-6">
      <form onSubmit={handleSearch} className="flex gap-4">
        <div className="flex-1">
          <Label htmlFor="cnp" className="sr-only">
            Employee CNP
          </Label>
          <Input
            id="cnp"
            placeholder="Enter employee CNP (13 digits)"
            value={cnp}
            onChange={(e) => setCnp(e.target.value.replace(/\D/g, ""))}
            maxLength={13}
          />
        </div>
        <Button type="submit" disabled={loading}>
          <Search className="mr-2 h-4 w-4" />
          {loading ? "Searching..." : "Search"}
        </Button>
      </form>

      {error && <p className="text-sm text-red-500">{error}</p>}

      {history !== null && (
        <div className="overflow-x-auto">
          {history.length === 0 ? (
            <div className="py-8 text-center text-muted-foreground">No work history found for this CNP</div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Employer</TableHead>
                  <TableHead>Position</TableHead>
                  <TableHead>Salary</TableHead>
                  <TableHead>Start Date</TableHead>
                  <TableHead>End Date</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Approved By</TableHead>
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
                    <TableCell>{Number.parseFloat(entry.salary.toString()).toLocaleString("ro-RO")} RON</TableCell>
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
                    <TableCell>{entry.authority?.full_name || "-"}</TableCell>
                    <TableCell>
                      <code className="text-xs">{entry.tx_hash.slice(0, 10)}...</code>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </div>
      )}
    </div>
  )
}
