"use client"

import { Button } from "@/components/ui/button"
import jsPDF from "jspdf"
import autoTable from "jspdf-autotable"


export default function ExportPdfButton({ history, userFullName }: { history: any[], userFullName: string }) {

  const handleExportWorkHistoryAsPdf = () => {
   console.log("Export PDF clicked!")
    console.log("History entries:", history)
    // Aici poți genera PDF folosind jspdf/autotable
     const doc = new jsPDF()

    // Titlu
    doc.setFontSize(16)
    doc.text(`Istoric muncă - ${userFullName}`, 14, 20)

    // Tabel
    const tableData = history.map((entry) => [
      entry.employer?.full_name || "Unknown",
      entry.position || "",
      entry.salary ? parseFloat(entry.salary).toLocaleString("ro-RO") + " RON" : "",
      entry.start_date ? new Date(entry.start_date).toLocaleDateString("ro-RO") : "",
      entry.end_date ? new Date(entry.end_date).toLocaleDateString("ro-RO") : "Prezent",
      entry.status || "",
      entry.tx_hash ? entry.tx_hash.slice(0, 10) + "..." : "",
    ])

    autoTable(doc, {
      startY: 30,
      head: [
        ["Angajator", "Funcție", "Salariu", "Data început", "Data sfârșit", "Status", "Tx Hash"]
      ],
      body: tableData,
      theme: "grid",
      headStyles: { fillColor: [40, 116, 166], textColor: 255 },
    })

    // Nume fișier
    const fileName = `istoric-munca-${userFullName.replace(" ", "-")}.pdf`

    doc.save(fileName)
  }

  return (
    <Button
      className="bg-blue-600 hover:bg-blue-700 text-white"
      onClick={handleExportWorkHistoryAsPdf}
    >
      Export PDF
    </Button>
  )
}
