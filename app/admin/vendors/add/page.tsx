"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { createClient } from "@/lib/supabase/client"
import { VENDOR_CATEGORIES } from "@/lib/constants"
import Link from "next/link"

export default function AddVendorPage() {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const router = useRouter()
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    // Validate required fields
    if (!formData.name || !formData.category || !formData.location) {
      setError("Please fill in all required fields")
      setLoading(false)
      return
    }

    const { data, error: insertError } = await supabase
      .from("vendors")
      .insert({
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
      })
      .select()

    if (insertError) {
      setError(insertError.message)
      setLoading(false)
      return
    }

    // Log activity
    const {
      data: { user },
    } = await supabase.auth.getUser()
    
    if (user) {
      await supabase.from("activity_logs").insert({
        user_id: user.id,
        action: "vendor_created",
        entity_type: "vendor",
        entity_id: data[0].id,
        details: {
          vendor_name: formData.name,
          category: formData.category,
        },
      })
    }

    setLoading(false)
    router.push("/admin/vendors")
  }

  return (
    <div className="min-h-screen bg-background py-8">
      <div className="max-w-4xl mx-auto px-4">
        <div className="mb-8">
          <Link href="/admin/vendors" className="text-primary hover:underline mb-4 inline-block">
            ← Back to Vendors
          </Link>
          <h1 className="text-4xl font-bold mb-2">Add New Vendor</h1>
          <p className="text-muted">Add a new restaurant, cafe, or business to the platform</p>
        </div>

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
                    placeholder="e.g., Kolachi Restaurant"
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
                    <option value="">Select category</option>
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
                    placeholder="Brief description of the vendor..."
                  />
                </div>
              </div>
            </div>

            {/* Location Information */}
            <div>
              <h3 className="text-xl font-bold mb-4">Location</h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-2">
                    Address <span className="text-red-400">*</span>
                  </label>
                  <input
                    type="text"
                    value={formData.location}
                    onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                    className="w-full bg-background border border-border rounded-lg px-4 py-2 text-foreground focus:outline-none focus:border-primary"
                    placeholder="e.g., Do Darya, DHA Phase 8, Karachi"
                    required
                  />
                </div>

                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-2">Latitude (Optional)</label>
                    <input
                      type="number"
                      step="0.000001"
                      value={formData.latitude}
                      onChange={(e) => setFormData({ ...formData, latitude: e.target.value })}
                      className="w-full bg-background border border-border rounded-lg px-4 py-2 text-foreground focus:outline-none focus:border-primary"
                      placeholder="24.8607"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">Longitude (Optional)</label>
                    <input
                      type="number"
                      step="0.000001"
                      value={formData.longitude}
                      onChange={(e) => setFormData({ ...formData, longitude: e.target.value })}
                      className="w-full bg-background border border-border rounded-lg px-4 py-2 text-foreground focus:outline-none focus:border-primary"
                      placeholder="67.0011"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Contact Information */}
            <div>
              <h3 className="text-xl font-bold mb-4">Contact Information</h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-2">Phone Number</label>
                  <input
                    type="tel"
                    value={formData.phone_number}
                    onChange={(e) => setFormData({ ...formData, phone_number: e.target.value })}
                    className="w-full bg-background border border-border rounded-lg px-4 py-2 text-foreground focus:outline-none focus:border-primary"
                    placeholder="+92-21-12345678"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">Email</label>
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="w-full bg-background border border-border rounded-lg px-4 py-2 text-foreground focus:outline-none focus:border-primary"
                    placeholder="info@vendor.com"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">Website</label>
                  <input
                    type="url"
                    value={formData.website}
                    onChange={(e) => setFormData({ ...formData, website: e.target.value })}
                    className="w-full bg-background border border-border rounded-lg px-4 py-2 text-foreground focus:outline-none focus:border-primary"
                    placeholder="https://vendor.com"
                  />
                </div>
              </div>
            </div>

            {/* Operating Hours */}
            <div>
              <h3 className="text-xl font-bold mb-4">Operating Hours</h3>
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-2">Opening Time</label>
                  <input
                    type="time"
                    value={formData.opening_time}
                    onChange={(e) => setFormData({ ...formData, opening_time: e.target.value })}
                    className="w-full bg-background border border-border rounded-lg px-4 py-2 text-foreground focus:outline-none focus:border-primary"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Closing Time</label>
                  <input
                    type="time"
                    value={formData.closing_time}
                    onChange={(e) => setFormData({ ...formData, closing_time: e.target.value })}
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
                    placeholder="https://example.com/logo.png"
                  />
                  <p className="text-muted text-xs mt-1">Direct URL to the vendor's logo image</p>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">Banner URL</label>
                  <input
                    type="url"
                    value={formData.banner_url}
                    onChange={(e) => setFormData({ ...formData, banner_url: e.target.value })}
                    className="w-full bg-background border border-border rounded-lg px-4 py-2 text-foreground focus:outline-none focus:border-primary"
                    placeholder="https://example.com/banner.jpg"
                  />
                  <p className="text-muted text-xs mt-1">Direct URL to the vendor's banner/cover image</p>
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
                <div>
                  <span className="font-medium">Active Vendor</span>
                  <p className="text-muted text-sm">
                    Active vendors will be visible to students
                  </p>
                </div>
              </label>
            </div>

            {error && (
              <div className="bg-red-900/20 border border-red-700 text-red-400 px-4 py-3 rounded-lg text-sm">
                {error}
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex gap-4 pt-4 border-t border-border">
              <button
                type="submit"
                disabled={loading}
                className="flex-1 btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? "Adding Vendor..." : "Add Vendor"}
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

        {/* Help Section */}
        <div className="mt-8 card bg-blue-900/20 border-blue-700">
          <h3 className="font-bold mb-3">💡 Tips for Adding Vendors</h3>
          <ul className="space-y-2 text-sm text-muted">
            <li>• Make sure the vendor name is spelled correctly</li>
            <li>• Choose the most appropriate category for better discoverability</li>
            <li>• Add complete contact information to help students reach the vendor</li>
            <li>• Use high-quality images for logo and banner (recommended: 1200x400px for banner)</li>
            <li>• You can add discount offers after creating the vendor</li>
            <li>• Uncheck "Active Vendor" if you want to add it as draft first</li>
          </ul>
        </div>
      </div>
    </div>
  )
}