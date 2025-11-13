"use client"

import { Button } from "@/components/ui/button"
import { LogOut } from "lucide-react"

interface DashboardHeaderProps {
  title: string
  subtitle: string
  onLogout: () => void
}

export function DashboardHeader({ title, subtitle, onLogout }: DashboardHeaderProps) {
  return (
    <header className="border-b bg-card">
      <div className="container mx-auto flex items-center justify-between p-4">
        <div>
          <h1 className="text-2xl font-semibold">{title}</h1>
          <p className="text-sm text-muted-foreground">{subtitle}</p>
        </div>
        <Button variant="outline" size="sm" onClick={onLogout}>
          <LogOut className="mr-2 h-4 w-4" />
          Logout
        </Button>
      </div>
    </header>
  )
}
