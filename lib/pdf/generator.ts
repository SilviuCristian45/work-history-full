import { jsPDF } from "jspdf";
import autoTable from "jspdf-autotable";

export function generateWorkHistoryPdfDoc(history: any[], userFullName: string) {
  const doc = new jsPDF();

  // ---- Titlu ----
  doc.setFontSize(16);
  doc.text(`Istoric muncă - ${userFullName}`, 14, 20);

  // ---- Statistici ----
  const approved = history.filter((e) => e.status === "approved");

  // Total salariu
  const totalSalary = approved.reduce((sum, e) => sum + (parseFloat(e.salary) || 0), 0);

  // Total luni lucrate
  const totalMonths = approved.reduce((months, e) => {
    const start = new Date(e.start_date);
    const end = e.end_date ? new Date(e.end_date) : new Date();
    const diff = (end.getFullYear() - start.getFullYear()) * 12 + (end.getMonth() - start.getMonth());
    return months + Math.max(diff, 0);
  }, 0);

  const totalYears = (totalMonths / 12).toFixed(1);
  const avgMonthlySalary = totalMonths > 0 ? Math.round(totalSalary / totalMonths) : 0;

  doc.setFontSize(12);
  doc.text(`Total ani lucrați: ${totalYears}`, 14, 30);
  doc.text(`Total luni lucrați: ${totalMonths}`, 14, 40);
  doc.text(`Salariu mediu lunar: ${avgMonthlySalary.toLocaleString("ro-RO")} RON`, 14, 48);

  // ---- Tabel ----
  const tableData = history.map((entry) => [
    entry.employer?.full_name || "Unknown",
    entry.position || "",
    entry.salary ? parseFloat(entry.salary).toLocaleString("ro-RO") + " RON" : "",
    entry.start_date ? new Date(entry.start_date).toLocaleDateString("ro-RO") : "",
    entry.end_date ? new Date(entry.end_date).toLocaleDateString("ro-RO") : "Prezent",
    entry.status || "",
    entry.tx_hash ? entry.tx_hash.slice(0, 10) + "..." : "",
  ]);

  autoTable(doc, {
    startY: 55,
    head: [["Angajator", "Funcție", "Salariu", "Data început", "Data sfârșit", "Status", "Tx Hash"]],
    body: tableData,
    theme: "grid",
    headStyles: { fillColor: [40, 116, 166], textColor: 255 },
  });

  return doc;
}
