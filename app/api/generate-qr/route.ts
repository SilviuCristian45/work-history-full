import { NextResponse } from "next/server"
import QRCode from "qrcode"
import { jsPDF } from "jspdf";
import autoTable from "jspdf-autotable";
import { createClient as createSupabaseClient } from "@supabase/supabase-js"

/**
 * @swagger
 * /generate-qr:
 *   post:
 *     summary: Generate QR code for user work history PDF
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               userFullName:
 *                 type: string
 *                 example: "John Doe"
 *               history:
 *                 type: array
 *                 items:
 *                   type: object
 *                   properties:
 *                     id:
 *                       type: string
 *                       example: "ff491473-ab65-4485-a32e-174ce7f53913"
 *                     employee_cnp:
 *                       type: string
 *                       example: "5000612124949"
 *                     employer_id:
 *                       type: string
 *                       example: "3cd0d5e8-5ef3-4de6-9d91-d5fb8e492030"
 *                     position:
 *                       type: string
 *                       example: "DEVELOPER"
 *                     salary:
 *                       type: number
 *                       example: 1233231
 *                     start_date:
 *                       type: string
 *                       format: date
 *                       example: "2025-11-06"
 *                     end_date:
 *                       type: string
 *                       format: date
 *                       example: "2025-11-28"
 *                     tx_hash:
 *                       type: string
 *                       example: "21313"
 *                     status:
 *                       type: string
 *                       example: "approved"
 *                     employer:
 *                       type: object
 *                       properties:
 *                         full_name:
 *                           type: string
 *                           example: "firma x"
 *                         email:
 *                           type: string
 *                           example: "silviu.dinca1206@stud.acs.upb.ro"
 *                     authority:
 *                       type: object
 *                       properties:
 *                         full_name:
 *                           type: string
 *                           example: "21e2e1 sadqw"
 *     responses:
 *       200:
 *         description: QR code base64
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 qrBase64:
 *                   type: string
 *                   example: "data:image/png;base64,iVBORw0KGgo..."
 *       500:
 *         description: Internal server error
 */

export async function POST(req: Request) {
  try {
  const data  = await req.json()
  console.log(data)
  const { userFullName, history } = data;
  const pdfBuffer = await generatePdf(history, userFullName)

  const supabase = createSupabaseClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )

  const filePath = `history_pdfs/${userFullName.replace(/ /g, "_")}_${Date.now()}.pdf`

  const upload = await supabase.storage
    .from("pdfs")
    .upload(filePath, pdfBuffer, {
      contentType: "application/pdf",
      upsert: true,
    })

  console.log("Upload result:", upload)


  if (upload.error) {
    return NextResponse.json({ error: upload.error.message }, { status: 500 })
  }

  const { data: publicUrlData } = supabase.storage
    .from("pdfs")
    .getPublicUrl(filePath)
console.log("Public URL data:", publicUrlData)

  const pdfUrl = publicUrlData.publicUrl

  const qrBase64 = await QRCode.toDataURL(pdfUrl)

  return NextResponse.json({ qrBase64 })
}
  catch(error) {
    console.error("Error in /api/generate-qr:", error);
    return new Response(JSON.stringify({ error: (error as Error).message }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
}

async function generatePdf(history: any[], userFullName: string): Promise<Buffer> {
  const doc = new jsPDF();

  doc.setFontSize(16);
  doc.text(`Istoric muncă - ${userFullName}`, 14, 20);

  const tableData = history.map((entry) => [
    entry.employer?.full_name || "Unknown",
    entry.position || "",
    entry.salary || "",
    entry.start_date || "",
    entry.end_date || "Prezent",
    entry.status || "",
    entry.tx_hash?.slice(0, 10) + "...",
  ]);

  autoTable(doc, {
    startY: 30,
    head: [["Angajator", "Funcție", "Salariu", "Data început", "Data sfârșit", "Status", "Tx Hash"]],
    body: tableData,
  });

  return Buffer.from(doc.output("arraybuffer"));
}
