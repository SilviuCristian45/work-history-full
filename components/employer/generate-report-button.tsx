"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { FileText, Loader2 } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import jsPDF from "jspdf"
import autoTable from "jspdf-autotable"

export function GenerateReportButton() {
  const [isGenerating, setIsGenerating] = useState(false)
  const { toast } = useToast()

  const generatePDF = async () => {
    try {
      setIsGenerating(true)
      console.log("[v0] Fetching report data...")

      // Fetch report data
      const response = await fetch("/api/employer/report")
      if (!response.ok) {
        throw new Error("Failed to fetch report data")
      }

      const data = await response.json()
      console.log("[v0] Report data received:", data)

      // Create PDF
      const doc = new jsPDF()
      const pageWidth = doc.internal.pageSize.getWidth()

      // Title
      doc.setFontSize(20)
      doc.text("Work History Report", pageWidth / 2, 20, { align: "center" })

      // Employer info
      doc.setFontSize(12)
      doc.text(`Employer: ${data.employer.name}`, 20, 35)
      doc.text(`Email: ${data.employer.email}`, 20, 42)
      doc.text(`Generated: ${new Date().toLocaleDateString("ro-RO")}`, 20, 49)

      // Statistics
      doc.setFontSize(14)
      doc.text("Summary Statistics", 20, 60)
      doc.setFontSize(11)
      doc.text(`Total Work Registrations: ${data.statistics.totalRegistrations}`, 20, 68)
      doc.text(
        `Total Government Contribution (${data.statistics.taxRate}%): ${data.statistics.totalContribution.toLocaleString("ro-RO")} RON`,
        20,
        75,
      )

      // Yearly salary chart data
      let yPos = 90
      doc.setFontSize(14)
      doc.text("Average Salary by Year", 20, yPos)

      // Create bar chart manually
      const chartStartY = yPos + 10
      const chartHeight = 60
      const chartWidth = 150
      const barWidth = Math.min(30, chartWidth / data.statistics.yearlyData.length - 5)

      if (data.statistics.yearlyData.length > 0) {
        const maxSalary = Math.max(...data.statistics.yearlyData.map((d: any) => d.avgSalary))

        data.statistics.yearlyData.forEach((yearData: any, index: number) => {
          const barHeight = (yearData.avgSalary / maxSalary) * chartHeight
          const x = 20 + index * (barWidth + 5)
          const y = chartStartY + chartHeight - barHeight

          // Draw bar
          doc.setFillColor(59, 130, 246) // Blue
          doc.rect(x, y, barWidth, barHeight, "F")

          // Year label
          doc.setFontSize(9)
          doc.text(yearData.year.toString(), x + barWidth / 2, chartStartY + chartHeight + 8, { align: "center" })

          // Salary label
          doc.setFontSize(8)
          doc.text(`${(yearData.avgSalary / 1000).toFixed(1)}k`, x + barWidth / 2, y - 2, { align: "center" })
        })
      }

      yPos = chartStartY + chartHeight + 20

      // Work registrations table
      doc.setFontSize(14)
      doc.text("Work Registrations", 20, yPos)

      autoTable(doc, {
        startY: yPos + 5,
        head: [["Employee CNP", "Position", "Salary (RON)", "Start Date", "End Date", "Gov. Contrib."]],
        body: data.registrations.map((reg: any) => {
          const startDate = new Date(reg.startDate)
          const endDate = reg.endDate ? new Date(reg.endDate) : new Date()
          const monthsWorked = Math.max(1, (endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24 * 30))
          const contribution = Math.round(reg.salary * 0.42 * monthsWorked)

          return [
            reg.employeeCnp,
            reg.position,
            reg.salary.toLocaleString("ro-RO"),
            new Date(reg.startDate).toLocaleDateString("ro-RO"),
            reg.endDate ? new Date(reg.endDate).toLocaleDateString("ro-RO") : "Present",
            `${contribution.toLocaleString("ro-RO")} RON`,
          ]
        }),
        theme: "grid",
        headStyles: { fillColor: [59, 130, 246] },
        styles: { fontSize: 9 },
      })

      // Save PDF
      const fileName = `work-history-report-${new Date().toISOString().split("T")[0]}.pdf`
      doc.save(fileName)

      toast({
        title: "Report generated",
        description: "PDF report has been downloaded successfully",
      })

      console.log("[v0] PDF generated successfully")
    } catch (error) {
      console.error("[v0] Error generating PDF:", error)
      toast({
        title: "Error",
        description: "Failed to generate PDF report",
        variant: "destructive",
      })
    } finally {
      setIsGenerating(false)
    }
  }

  return (
    <Button onClick={generatePDF} disabled={isGenerating}>
      {isGenerating ? (
        <>
          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          Generating...
        </>
      ) : (
        <>
          <FileText className="mr-2 h-4 w-4" />
          Generate PDF Report
        </>
      )}
    </Button>
  )
}
