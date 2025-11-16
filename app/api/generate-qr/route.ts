import { NextResponse } from "next/server"
import QRCode from "qrcode"
import { jsPDF } from "jspdf";
import autoTable from "jspdf-autotable";
import { createClient as createSupabaseClient } from "@supabase/supabase-js"
import { generateWorkHistoryPdfDoc } from "@/lib/pdf/generator";

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
  const doc = generateWorkHistoryPdfDoc(history, userFullName);
  return Buffer.from(doc.output("arraybuffer"));
}
