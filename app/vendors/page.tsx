"use client"

import { useEffect, useState } from "react"
import { createClient } from "@/lib/supabase/client"
import { VENDOR_CATEGORIES } from "@/lib/constants"
import Link from "next/link"

export default function VendorsPage() {
  const [vendors, setVendors] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null)
  const [searchTerm, setSearchTerm] = useState("")
  const supabase = createClient()

  useEffect(() => {
    const fetchVendors = async () => {
      setLoading(true)
      let query = supabase.from("vendors").select("*, discount_offers(id)").eq("is_active", true)

      if (selectedCategory) {
        query = query.eq("category", selectedCategory)
      }

      if (searchTerm) {
        query = query.ilike("name", `%${searchTerm}%`)
      }

      const { data } = await query
      setVendors(data || [])
      setLoading(false)
    }

    fetchVendors()
  }, [selectedCategory, searchTerm])

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-6xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-12">
          <h1 className="text-4xl font-bold mb-4">Browse Vendors</h1>
          <p className="text-muted">Discover restaurants, cafes, and more with exclusive student discounts</p>
        </div>

        {/* Search and Filters */}
        <div className="mb-8 space-y-6">
          <input
            type="text"
            placeholder="Search vendors..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-card border border-border rounded-lg px-4 py-3 text-foreground focus:outline-none focus:border-primary"
          />

          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => setSelectedCategory(null)}
              className={`px-4 py-2 rounded-lg transition ${
                selectedCategory === null
                  ? "bg-primary text-white"
                  : "bg-card text-foreground hover:border-primary border border-border"
              }`}
            >
              All
            </button>
            {VENDOR_CATEGORIES.map((category) => (
              <button
                key={category.id}
                onClick={() => setSelectedCategory(category.id)}
                className={`px-4 py-2 rounded-lg transition ${
                  selectedCategory === category.id
                    ? "bg-primary text-white"
                    : "bg-card text-foreground hover:border-primary border border-border"
                }`}
              >
                {category.label}
              </button>
            ))}
          </div>
        </div>

        {/* Vendors Grid */}
        {loading ? (
          <div className="text-center py-12">
            <p className="text-muted">Loading vendors...</p>
          </div>
        ) : vendors.length > 0 ? (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {vendors.map((vendor) => (
              <Link
                key={vendor.id}
                href={`/vendors/${vendor.id}`}
                className="card hover:border-primary transition cursor-pointer group"
              >
                {vendor.banner_url && (
                  <img
                    src={vendor.banner_url || "/placeholder.svg"}
                    alt={vendor.name}
                    className="w-full h-40 object-cover rounded-lg mb-4 group-hover:scale-105 transition"
                  />
                )}
                <div className="flex items-start justify-between mb-2">
                  <h3 className="font-bold text-lg">{vendor.name}</h3>
                  {vendor.logo_url && (
                    <img src={vendor.logo_url || "/placeholder.svg"} alt="" className="h-8 w-8 rounded-full" />
                  )}
                </div>
                <p className="text-muted text-sm mb-3">{vendor.location}</p>
                {vendor.discount_offers && vendor.discount_offers.length > 0 && (
                  <div className="text-primary font-semibold text-sm">
                    {vendor.discount_offers.length} offers available
                  </div>
                )}
              </Link>
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <p className="text-muted">No vendors found</p>
          </div>
        )}
      </div>
    </div>
  )
}
