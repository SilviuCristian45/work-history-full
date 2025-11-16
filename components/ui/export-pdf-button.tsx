"use client"

import { Button } from "@/components/ui/button"
import jsPDF from "jspdf"
import autoTable from "jspdf-autotable"
import { generateWorkHistoryPdfDoc } from "@/lib/pdf/generator";



export default function ExportPdfButton({ history, userFullName }: { history: any[], userFullName: string }) {

  const handleExportWorkHistoryAsPdf = () => {
    console.log("Export PDF clicked!")
    console.log("History entries:", history)
    const doc = generateWorkHistoryPdfDoc(history, userFullName);
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
