"use client"

import { useEffect, useState } from "react"
import { useParams } from "next/navigation"
import { createClient } from "@/lib/supabase/client"
import Link from "next/link"

export default function VendorDetailPage() {
  const [vendor, setVendor] = useState<any>(null)
  const [offers, setOffers] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [isFavorite, setIsFavorite] = useState(false)
  const params = useParams()
  const supabase = createClient()

  useEffect(() => {
    const loadData = async () => {
      const { data: vendor } = await supabase.from("vendors").select("*").eq("id", params.id).single()

      const { data: offers } = await supabase
        .from("discount_offers")
        .select("*")
        .eq("vendor_id", params.id)
        .eq("is_active", true)
        .order("valid_until", { ascending: false })

      const {
        data: { user },
      } = await supabase.auth.getUser()
      if (user) {
        const { data: favorite } = await supabase
          .from("favorite_vendors")
          .select("*")
          .eq("user_id", user.id)
          .eq("vendor_id", params.id)
          .single()

        setIsFavorite(!!favorite)
      }

      setVendor(vendor)
      setOffers(offers || [])
      setLoading(false)
    }

    loadData()
  }, [params.id])

  const toggleFavorite = async () => {
    const {
      data: { user },
    } = await supabase.auth.getUser()
    if (!user) return

    if (isFavorite) {
      await supabase.from("favorite_vendors").delete().eq("user_id", user.id).eq("vendor_id", params.id)
    } else {
      await supabase.from("favorite_vendors").insert({
        user_id: user.id,
        vendor_id: params.id,
      })
    }

    setIsFavorite(!isFavorite)
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <p className="text-muted">Loading...</p>
      </div>
    )
  }

  if (!vendor) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <p className="text-muted mb-4">Vendor not found</p>
          <Link href="/vendors" className="btn-primary">
            Back to Vendors
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Banner */}
      {vendor.banner_url && (
        <div className="h-64 md:h-80 relative overflow-hidden">
          <img src={vendor.banner_url || "/placeholder.svg"} alt={vendor.name} className="w-full h-full object-cover" />
        </div>
      )}

      <div className="max-w-4xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex items-start justify-between mb-8">
          <div className="flex items-start gap-4">
            {vendor.logo_url && (
              <img src={vendor.logo_url || "/placeholder.svg"} alt={vendor.name} className="h-16 w-16 rounded-lg" />
            )}
            <div>
              <h1 className="text-3xl font-bold">{vendor.name}</h1>
              <p className="text-muted mt-1">{vendor.location}</p>
              {vendor.phone_number && <p className="text-muted text-sm mt-1">{vendor.phone_number}</p>}
            </div>
          </div>
          <button onClick={toggleFavorite} className={`text-2xl ${isFavorite ? "text-secondary" : "text-muted"}`}>
            {isFavorite ? "❤️" : "🤍"}
          </button>
        </div>

        {/* Info */}
        {vendor.description && (
          <div className="card mb-8">
            <p className="text-foreground">{vendor.description}</p>
          </div>
        )}

        {/* Opening Hours */}
        {(vendor.opening_time || vendor.closing_time) && (
          <div className="card mb-8">
            <h3 className="font-bold mb-2">Opening Hours</h3>
            <p className="text-foreground">
              {vendor.opening_time} - {vendor.closing_time}
            </p>
          </div>
        )}

        {/* Offers */}
        <div>
          <h2 className="text-2xl font-bold mb-6">Available Offers</h2>
          {offers.length > 0 ? (
            <div className="grid gap-6">
              {offers.map((offer) => (
                <div key={offer.id} className="card">
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <h3 className="text-xl font-bold">{offer.title}</h3>
                      <p className="text-muted text-sm mt-1">{offer.description}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-3xl font-bold text-primary">
                        {offer.discount_type === "percentage"
                          ? `${offer.discount_value}%`
                          : `Rs. ${offer.discount_value}`}
                      </p>
                      <p className="text-muted text-xs mt-1">
                        {offer.discount_type === "percentage" ? "Off" : "Discount"}
                      </p>
                    </div>
                  </div>

                  {offer.terms_and_conditions && (
                    <p className="text-muted text-sm mb-4">Terms: {offer.terms_and_conditions}</p>
                  )}

                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted">Valid until {new Date(offer.valid_until).toLocaleDateString()}</span>
                    <Link href="/scan" className="btn-primary text-sm">
                      Redeem Discount
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="card text-center py-8">
              <p className="text-muted">No active offers from this vendor right now</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
