"use client"

import { useState, useEffect, useRef } from "react"
import { createClient } from "@/lib/supabase/client"
import { useRouter } from "next/navigation"

export default function ScanPage() {
  const [scanning, setScanning] = useState(false)
  const [result, setResult] = useState<any>(null)
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const videoRef = useRef<HTMLVideoElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const supabase = createClient()
  const router = useRouter()

  // Check user has subscription
  useEffect(() => {
    const checkSubscription = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser()
      if (!user) {
        router.push("/auth/login")
        return
      }

      const { data: subscription } = await supabase
        .from("student_subscriptions")
        .select("*")
        .eq("user_id", user.id)
        .eq("is_active", true)
        .single()

      if (!subscription) {
        setError("You need an active subscription to redeem discounts")
      }
    }

    checkSubscription()
  }, [])

  const startScanning = async () => {
    setScanning(true)
    setError(null)
    setResult(null)

    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: "environment" },
      })

      if (videoRef.current) {
        videoRef.current.srcObject = stream
        scanQRCode()
      }
    } catch (err) {
      setError("Unable to access camera. Please check permissions.")
      setScanning(false)
    }
  }

  const scanQRCode = () => {
    if (!videoRef.current || !canvasRef.current || !scanning) return

    const video = videoRef.current
    const canvas = canvasRef.current
    const ctx = canvas.getContext("2d")

    canvas.width = video.videoWidth
    canvas.height = video.videoHeight

    if (ctx && video.videoWidth > 0) {
      ctx.drawImage(video, 0, 0)
      const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height)

      // Use jsQR library if available, otherwise show placeholder
      // In production, integrate with html5-qrcode or similar
      // For now, we'll use a simpler approach

      setTimeout(() => {
        scanQRCode()
      }, 500)
    }
  }

  const handleManualCodeInput = async (code: string) => {
    setLoading(true)
    setError(null)

    try {
      const {
        data: { user },
      } = await supabase.auth.getUser()
      if (!user) {
        setError("Please login first")
        setLoading(false)
        return
      }

      // Get QR code details
      const { data: qrCode } = await supabase
        .from("qr_codes")
        .select("*, discount_offers(*, vendors(name))")
        .eq("qr_code_data", code)
        .eq("is_active", true)
        .single()

      if (!qrCode) {
        setError("Invalid QR code")
        setLoading(false)
        return
      }

      const offer = qrCode.discount_offers

      // Check if offer is valid
      const now = new Date()
      const validFrom = new Date(offer.valid_from)
      const validUntil = new Date(offer.valid_until)

      if (now < validFrom || now > validUntil) {
        setError("This offer has expired")
        setLoading(false)
        return
      }

      if (offer.current_uses >= offer.max_uses) {
        setError("This offer has reached maximum uses")
        setLoading(false)
        return
      }

      // Record redemption
      const { error: redemptionError } = await supabase.from("discount_redemptions").insert({
        user_id: user.id,
        discount_offer_id: offer.id,
        qr_code_id: qrCode.id,
        discount_amount: offer.discount_value,
      })

      if (redemptionError) throw redemptionError

      // Update offer usage
      await supabase
        .from("discount_offers")
        .update({ current_uses: offer.current_uses + 1 })
        .eq("id", offer.id)

      setResult({
        success: true,
        vendor: offer.vendors?.name,
        discount: `${offer.discount_type === "percentage" ? offer.discount_value + "%" : "Rs. " + offer.discount_value} off`,
        title: offer.title,
      })
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to redeem discount")
    } finally {
      setLoading(false)
    }
  }

  const stopScanning = () => {
    setScanning(false)
    if (videoRef.current?.srcObject) {
      const tracks = (videoRef.current.srcObject as MediaStream).getTracks()
      tracks.forEach((track) => track.stop())
    }
  }

  return (
    <div className="min-h-screen bg-background flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        <div className="card">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold mb-2">Scan QR Code</h1>
            <p className="text-muted">Point your camera at a vendor QR code to redeem a discount</p>
          </div>

          {error && (
            <div className="bg-red-900/20 border border-red-700 text-red-400 px-4 py-3 rounded-lg mb-6 text-sm">
              {error}
            </div>
          )}

          {result?.success && (
            <div className="bg-green-900/20 border border-green-700 text-green-400 px-4 py-3 rounded-lg mb-6">
              <h3 className="font-bold mb-2">Discount Redeemed!</h3>
              <p className="text-sm mb-1">{result.vendor}</p>
              <p className="text-sm mb-1">{result.title}</p>
              <p className="text-lg font-bold">{result.discount}</p>
            </div>
          )}

          {scanning ? (
            <div className="mb-6">
              <video ref={videoRef} autoPlay playsInline className="w-full rounded-lg mb-4" />
              <canvas ref={canvasRef} className="hidden" />
              <button onClick={stopScanning} className="w-full btn-secondary">
                Stop Scanning
              </button>
            </div>
          ) : (
            <>
              <button
                onClick={startScanning}
                disabled={
                  loading || (!error === null && error !== "You need an active subscription to redeem discounts")
                }
                className="w-full btn-primary mb-4 disabled:opacity-50"
              >
                {loading ? "Processing..." : "Start Camera"}
              </button>

              <div className="relative mb-6">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-border"></div>
                </div>
                <div className="relative flex justify-center text-sm">
                  <span className="px-2 bg-card text-muted">Or enter code manually</span>
                </div>
              </div>

              <div>
                <input
                  type="text"
                  placeholder="Enter QR code"
                  onKeyPress={(e) => {
                    if (e.key === "Enter") {
                      handleManualCodeInput(e.currentTarget.value)
                      e.currentTarget.value = ""
                    }
                  }}
                  className="w-full bg-background border border-border rounded-lg px-4 py-2 text-foreground focus:outline-none focus:border-primary mb-2"
                />
                <p className="text-muted text-xs">Press Enter to submit the code</p>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  )
}
