"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"

export default function GetQrButton({ history, userFullName }: { history: any[], userFullName: string }) {
  const [open, setOpen] = useState(false)
  const [qrBase64, setQrBase64] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  const handleGetQr = async () => {
    setLoading(true)

    try {
      const res = await fetch("/api/generate-qr", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userFullName,
          history,
        }),
      })

      const data = await res.json()

      if (data.qrBase64) {
        setQrBase64(data.qrBase64)
        setOpen(true)
      }
    } catch (err) {
      console.error("Failed to load QR:", err)
    }

    setLoading(false)
  }

  return (
    <>
      <Button
        className="bg-red-600 hover:bg-red-700 text-white mr-2"
        onClick={handleGetQr}
        disabled={loading}
      >
        {loading ? "Generating..." : "Get QR"}
      </Button>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>QR code for Work History</DialogTitle>
          </DialogHeader>

          {qrBase64 ? (
            <img src={`${qrBase64}`} alt="QR Code" className="mx-auto" />
          ) : (
            <p>Loading QR...</p>
          )}
        </DialogContent>
      </Dialog>
    </>
  )
}
