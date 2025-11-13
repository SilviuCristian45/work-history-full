"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Plus } from "lucide-react"

interface Employee {
  id: string
  employee_cnp: string
  employee_name: string
}

interface RegisterWorkDialogProps {
  employees: Employee[]
}

export function RegisterWorkDialog({ employees }: RegisterWorkDialogProps) {
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [selectedCNP, setSelectedCNP] = useState<string>("")
  const router = useRouter()

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    const formData = new FormData(e.currentTarget)
    const data = {
      employeeCNP: selectedCNP,
      position: formData.get("position") as string,
      salary: Number.parseFloat(formData.get("salary") as string),
      startDate: formData.get("startDate") as string,
      endDate: (formData.get("endDate") as string) || undefined,
    }

    try {
      const response = await fetch("/api/work-registrations/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || "Failed to register work")
      }

      setOpen(false)
      router.refresh()
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred")
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>
          <Plus className="mr-2 h-4 w-4" />
          Register Work
        </Button>
      </DialogTrigger>
      <DialogContent>
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>Register Work Entry</DialogTitle>
            <DialogDescription>Register a work entry on the blockchain</DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="employee">Employee</Label>
              <Select value={selectedCNP} onValueChange={setSelectedCNP} required>
                <SelectTrigger>
                  <SelectValue placeholder="Select employee" />
                </SelectTrigger>
                <SelectContent>
                  {employees.map((employee) => (
                    <SelectItem key={employee.id} value={employee.employee_cnp}>
                      {employee.employee_name} ({employee.employee_cnp})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="position">Position</Label>
              <Input id="position" name="position" required />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="salary">Salary (RON)</Label>
              <Input id="salary" name="salary" type="number" step="0.01" required />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="startDate">Start Date</Label>
              <Input id="startDate" name="startDate" type="date" required />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="endDate">End Date (Optional)</Label>
              <Input id="endDate" name="endDate" type="date" />
            </div>
            {error && <p className="text-sm text-red-500">{error}</p>}
          </div>
          <DialogFooter>
            <Button type="submit" disabled={loading || !selectedCNP}>
              {loading ? "Registering..." : "Register on Blockchain"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
