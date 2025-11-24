"use client"

import { useState, useEffect } from "react"
import { useRouter, useParams } from "next/navigation"
import { createClient } from "@/lib/supabase/client"
import { VENDOR_CATEGORIES } from "@/lib/constants"
import Link from "next/link"

export default function EditVendorPage() {
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)
  const router = useRouter()
  const params = useParams()
  const supabase = createClient()

  const [formData, setFormData] = useState({
    name: "",
    description: "",
    category: "",
    location: "",
    latitude: "",
    longitude: "",
    opening_time: "",
    closing_time: "",
    phone_number: "",
    email: "",
    website: "",
    logo_url: "",
    banner_url: "",
    is_active: true,
  })

  const [offers, setOffers] = useState<any[]>([])
  const [qrCodes, setQrCodes] = useState<any[]>([])

  useEffect(() => {
    loadVendor()
    loadOffers()
    loadQRCodes()
  }, [])

  const loadVendor = async () => {
    const { data } = await supabase
      .from("vendors")
      .select("*")
      .eq("id", params.id)
      .single()

    if (data) {
      setFormData({
        name: data.name || "",
        description: data.description || "",
        category: data.category || "",
        location: data.location || "",
        latitude: data.latitude?.toString() || "",
        longitude: data.longitude?.toString() || "",
        opening_time: data.opening_time || "",
        closing_time: data.closing_time || "",
        phone_number: data.phone_number || "",
        email: data.email || "",
        website: data.website || "",
        logo_url: data.logo_url || "",
        banner_url: data.banner_url || "",
        is_active: data.is_active ?? true,
      })
      setLoading(false)
    }
  }

  const loadOffers = async () => {
    const { data } = await supabase
      .from("discount_offers")
      .select("*")
      .eq("vendor_id", params.id)
      .order("created_at", { ascending: false })

    setOffers(data || [])
  }

  const loadQRCodes = async () => {
    const { data } = await supabase
      .from("qr_codes")
      .select("*")
      .eq("vendor_id", params.id)

    setQrCodes(data || [])
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)
    setError(null)
    setSuccess(false)

    const { error: updateError } = await supabase
      .from("vendors")
      .update({
        name: formData.name,
        description: formData.description || null,
        category: formData.category,
        location: formData.location,
        latitude: formData.latitude ? parseFloat(formData.latitude) : null,
        longitude: formData.longitude ? parseFloat(formData.longitude) : null,
        opening_time: formData.opening_time || null,
        closing_time: formData.closing_time || null,
        phone_number: formData.phone_number || null,
        email: formData.email || null,
        website: formData.website || null,
        logo_url: formData.logo_url || null,
        banner_url: formData.banner_url || null,
        is_active: formData.is_active,
        updated_at: new Date().toISOString(),
      })
      .eq("id", params.id)

    if (updateError) {
      setError(updateError.message)
      setSaving(false)
      return
    }

    // Log activity
    const {
      data: { user },
    } = await supabase.auth.getUser()
    
    if (user) {
      await supabase.from("activity_logs").insert({
        user_id: user.id,
        action: "vendor_updated",
        entity_type: "vendor",
        entity_id: params.id as string,
        details: {
          vendor_name: formData.name,
        },
      })
    }

    setSuccess(true)
    setSaving(false)
    setTimeout(() => {
      router.push("/admin/vendors")
    }, 1500)
  }

  const deleteOffer = async (offerId: string) => {
    if (!confirm("Are you sure you want to delete this offer?")) return

    const { error } = await supabase
      .from("discount_offers")
      .delete()
      .eq("id", offerId)

    if (!error) {
      loadOffers()
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <p className="text-muted">Loading vendor...</p>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background py-8">
      <div className="max-w-6xl mx-auto px-4">
        <div className="mb-8">
          <Link href="/admin/vendors" className="text-primary hover:underline mb-4 inline-block">
            ← Back to Vendors
          </Link>
          <h1 className="text-4xl font-bold mb-2">Edit Vendor</h1>
          <p className="text-muted">Update vendor information and manage offers</p>
        </div>

        <div className="grid md:grid-cols-3 gap-8">
          {/* Main Form */}
          <div className="md:col-span-2">
            <form onSubmit={handleSubmit} className="card">
              <div className="space-y-6">
                {/* Basic Information */}
                <div>
                  <h3 className="text-xl font-bold mb-4">Basic Information</h3>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium mb-2">
                        Vendor Name <span className="text-red-400">*</span>
                      </label>
                      <input
                        type="text"
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        className="w-full bg-background border border-border rounded-lg px-4 py-2 text-foreground focus:outline-none focus:border-primary"
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium mb-2">
                        Category <span className="text-red-400">*</span>
                      </label>
                      <select
                        value={formData.category}
                        onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                        className="w-full bg-background border border-border rounded-lg px-4 py-2 text-foreground focus:outline-none focus:border-primary"
                        required
                      >
                        {VENDOR_CATEGORIES.map((cat) => (
                          <option key={cat.id} value={cat.id}>
                            {cat.label}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium mb-2">Description</label>
                      <textarea
                        value={formData.description}
                        onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                        className="w-full bg-background border border-border rounded-lg px-4 py-2 text-foreground focus:outline-none focus:border-primary"
                        rows={4}
                      />
                    </div>
                  </div>
                </div>

                {/* Location */}
                <div>
                  <h3 className="text-xl font-bold mb-4">Location</h3>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium mb-2">Address</label>
                      <input
                        type="text"
                        value={formData.location}
                        onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                        className="w-full bg-background border border-border rounded-lg px-4 py-2 text-foreground focus:outline-none focus:border-primary"
                        required
                      />
                    </div>
                  </div>
                </div>

                {/* Contact */}
                <div>
                  <h3 className="text-xl font-bold mb-4">Contact</h3>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium mb-2">Phone</label>
                      <input
                        type="tel"
                        value={formData.phone_number}
                        onChange={(e) => setFormData({ ...formData, phone_number: e.target.value })}
                        className="w-full bg-background border border-border rounded-lg px-4 py-2 text-foreground focus:outline-none focus:border-primary"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-2">Website</label>
                      <input
                        type="url"
                        value={formData.website}
                        onChange={(e) => setFormData({ ...formData, website: e.target.value })}
                        className="w-full bg-background border border-border rounded-lg px-4 py-2 text-foreground focus:outline-none focus:border-primary"
                      />
                    </div>
                  </div>
                </div>

                {/* Images */}
                <div>
                  <h3 className="text-xl font-bold mb-4">Images</h3>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium mb-2">Logo URL</label>
                      <input
                        type="url"
                        value={formData.logo_url}
                        onChange={(e) => setFormData({ ...formData, logo_url: e.target.value })}
                        className="w-full bg-background border border-border rounded-lg px-4 py-2 text-foreground focus:outline-none focus:border-primary"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-2">Banner URL</label>
                      <input
                        type="url"
                        value={formData.banner_url}
                        onChange={(e) => setFormData({ ...formData, banner_url: e.target.value })}
                        className="w-full bg-background border border-border rounded-lg px-4 py-2 text-foreground focus:outline-none focus:border-primary"
                      />
                    </div>
                  </div>
                </div>

                {/* Status */}
                <div>
                  <label className="flex items-center gap-3 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formData.is_active}
                      onChange={(e) => setFormData({ ...formData, is_active: e.target.checked })}
                      className="w-5 h-5 rounded border-border"
                    />
                    <span className="font-medium">Active Vendor</span>
                  </label>
                </div>

                {error && (
                  <div className="bg-red-900/20 border border-red-700 text-red-400 px-4 py-3 rounded-lg text-sm">
                    {error}
                  </div>
                )}

                {success && (
                  <div className="bg-green-900/20 border border-green-700 text-green-400 px-4 py-3 rounded-lg text-sm">
                    Vendor updated successfully! Redirecting...
                  </div>
                )}

                {/* Action Buttons */}
                <div className="flex gap-4 pt-4 border-t border-border">
                  <button
                    type="submit"
                    disabled={saving}
                    className="flex-1 btn-primary disabled:opacity-50"
                  >
                    {saving ? "Saving..." : "Save Changes"}
                  </button>
                  <button
                    type="button"
                    onClick={() => router.push("/admin/vendors")}
                    className="flex-1 btn-secondary"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            </form>
          </div>

          {/* Sidebar - Offers & QR Codes */}
          <div className="space-y-6">
            {/* Discount Offers */}
            <div className="card">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-bold">Discount Offers</h3>
                <Link
                  href={`/admin/offers/add?vendor_id=${params.id}`}
                  className="text-primary text-sm hover:underline"
                >
                  + Add
                </Link>
              </div>
              {offers.length > 0 ? (
                <div className="space-y-3">
                  {offers.map((offer) => (
                    <div key={offer.id} className="p-3 bg-background rounded-lg">
                      <p className="font-semibold text-sm mb-1">{offer.title}</p>
                      <p className="text-primary font-bold text-sm mb-2">
                        {offer.discount_type === "percentage"
                          ? `${offer.discount_value}% OFF`
                          : `Rs. ${offer.discount_value} OFF`}
                      </p>
                      <div className="flex gap-2">
                        <Link
                          href={`/admin/offers/${offer.id}`}
                          className="text-xs text-primary hover:underline"
                        >
                          Edit
                        </Link>
                        <button
                          onClick={() => deleteOffer(offer.id)}
                          className="text-xs text-red-400 hover:underline"
                        >
                          Delete
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-muted text-sm">No offers yet</p>
              )}
            </div>

            {/* QR Codes */}
            <div className="card">
              <h3 className="font-bold mb-4">QR Codes</h3>
              <p className="text-muted text-sm mb-3">{qrCodes.length} QR codes generated</p>
              {qrCodes.length > 0 && (
                <Link
                  href={`/admin/qr-codes?vendor_id=${params.id}`}
                  className="text-primary text-sm hover:underline"
                >
                  View All QR Codes →
                </Link>
              )}
            </div>

            {/* Quick Stats */}
            <div className="card">
              <h3 className="font-bold mb-4">Quick Stats</h3>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-muted text-sm">Total Offers</span>
                  <span className="font-bold">{offers.length}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted text-sm">Active Offers</span>
                  <span className="font-bold text-green-400">
                    {offers.filter((o) => o.is_active).length}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted text-sm">QR Codes</span>
                  <span className="font-bold">{qrCodes.length}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}