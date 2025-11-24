"use client"

import { useState, useEffect } from "react"
import { createClient } from "@/lib/supabase/client"
import Link from "next/link"
import { VENDOR_CATEGORIES } from "@/lib/constants"

export default function AdminVendorsPage() {
  const [vendors, setVendors] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState<string>("all")
  const [searchTerm, setSearchTerm] = useState("")
  const [showAddModal, setShowAddModal] = useState(false)
  const supabase = createClient()

  useEffect(() => {
    loadVendors()
  }, [filter])

  const loadVendors = async () => {
    setLoading(true)
    let query = supabase
      .from("vendors")
      .select("*, discount_offers(id)")
      .order("created_at", { ascending: false })

    if (filter !== "all") {
      if (filter === "active") {
        query = query.eq("is_active", true)
      } else if (filter === "inactive") {
        query = query.eq("is_active", false)
      } else {
        query = query.eq("category", filter)
      }
    }

    const { data } = await query
    setVendors(data || [])
    setLoading(false)
  }

  const toggleVendorStatus = async (vendorId: string, currentStatus: boolean) => {
    const { error } = await supabase
      .from("vendors")
      .update({ 
        is_active: !currentStatus,
        updated_at: new Date().toISOString() 
      })
      .eq("id", vendorId)

    if (!error) {
      loadVendors()
    }
  }

  const deleteVendor = async (vendorId: string) => {
    if (!confirm("Are you sure you want to delete this vendor? This will also delete all associated offers and QR codes.")) {
      return
    }

    const { error } = await supabase
      .from("vendors")
      .delete()
      .eq("id", vendorId)

    if (!error) {
      loadVendors()
    }
  }

  const filteredVendors = vendors.filter((vendor) =>
    vendor.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    vendor.location?.toLowerCase().includes(searchTerm.toLowerCase())
  )

  return (
    <div className="min-h-screen bg-background py-8">
      <div className="max-w-7xl mx-auto px-4">
        <div className="mb-8 flex items-center justify-between">
          <div>
            <Link href="/admin/dashboard" className="text-primary hover:underline mb-4 inline-block">
              ← Back to Dashboard
            </Link>
            <h1 className="text-4xl font-bold mb-2">Vendor Management</h1>
            <p className="text-muted">Add and manage vendors</p>
          </div>
          <Link href="/admin/vendors/add" className="btn-primary">
            + Add New Vendor
          </Link>
        </div>

        {/* Filters */}
        <div className="card mb-8">
          <div className="flex flex-col md:flex-row gap-4 items-center justify-between mb-4">
            <div className="flex gap-2 flex-wrap">
              <button
                onClick={() => setFilter("all")}
                className={`px-4 py-2 rounded-lg transition ${
                  filter === "all"
                    ? "bg-primary text-white"
                    : "bg-background border border-border hover:border-primary"
                }`}
              >
                All
              </button>
              <button
                onClick={() => setFilter("active")}
                className={`px-4 py-2 rounded-lg transition ${
                  filter === "active"
                    ? "bg-primary text-white"
                    : "bg-background border border-border hover:border-primary"
                }`}
              >
                Active
              </button>
              <button
                onClick={() => setFilter("inactive")}
                className={`px-4 py-2 rounded-lg transition ${
                  filter === "inactive"
                    ? "bg-primary text-white"
                    : "bg-background border border-border hover:border-primary"
                }`}
              >
                Inactive
              </button>
              {VENDOR_CATEGORIES.map((cat) => (
                <button
                  key={cat.id}
                  onClick={() => setFilter(cat.id)}
                  className={`px-4 py-2 rounded-lg transition ${
                    filter === cat.id
                      ? "bg-primary text-white"
                      : "bg-background border border-border hover:border-primary"
                  }`}
                >
                  {cat.label}
                </button>
              ))}
            </div>

            <input
              type="text"
              placeholder="Search vendors..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full md:w-96 bg-background border border-border rounded-lg px-4 py-2 focus:outline-none focus:border-primary"
            />
          </div>
        </div>

        {/* Vendors Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {loading ? (
            <div className="col-span-full text-center py-12">
              <p className="text-muted">Loading vendors...</p>
            </div>
          ) : filteredVendors.length > 0 ? (
            filteredVendors.map((vendor) => (
              <div key={vendor.id} className="card">
                {vendor.banner_url && (
                  <img
                    src={vendor.banner_url}
                    alt={vendor.name}
                    className="w-full h-40 object-cover rounded-lg mb-4"
                  />
                )}
                <div className="flex items-start justify-between mb-3">
                  <div className="flex-1">
                    <h3 className="font-bold text-lg mb-1">{vendor.name}</h3>
                    <p className="text-muted text-sm">{vendor.location}</p>
                  </div>
                  {vendor.logo_url && (
                    <img
                      src={vendor.logo_url}
                      alt=""
                      className="h-10 w-10 rounded-full"
                    />
                  )}
                </div>

                <div className="flex items-center gap-2 mb-4">
                  <span className="px-2 py-1 bg-background rounded text-xs capitalize">
                    {vendor.category}
                  </span>
                  {vendor.is_active ? (
                    <span className="px-2 py-1 bg-green-900/20 border border-green-700 text-green-400 rounded text-xs font-semibold">
                      Active
                    </span>
                  ) : (
                    <span className="px-2 py-1 bg-red-900/20 border border-red-700 text-red-400 rounded text-xs font-semibold">
                      Inactive
                    </span>
                  )}
                </div>

                <p className="text-muted text-sm mb-4">
                  {vendor.discount_offers?.length || 0} active offers
                </p>

                <div className="flex gap-2">
                  <Link
                    href={`/admin/vendors/${vendor.id}`}
                    className="flex-1 px-3 py-2 bg-primary text-white rounded text-sm text-center hover:bg-primary/80 transition"
                  >
                    Edit
                  </Link>
                  <button
                    onClick={() => toggleVendorStatus(vendor.id, vendor.is_active)}
                    className="flex-1 px-3 py-2 bg-background border border-border rounded text-sm hover:border-primary transition"
                  >
                    {vendor.is_active ? "Deactivate" : "Activate"}
                  </button>
                  <button
                    onClick={() => deleteVendor(vendor.id)}
                    className="px-3 py-2 bg-red-900/20 border border-red-700 text-red-400 rounded text-sm hover:bg-red-900/30 transition"
                  >
                    Delete
                  </button>
                </div>
              </div>
            ))
          ) : (
            <div className="col-span-full text-center py-12">
              <p className="text-muted">No vendors found</p>
            </div>
          )}
        </div>

        {/* Stats Summary */}
        <div className="grid md:grid-cols-4 gap-6 mt-8">
          <div className="card">
            <h3 className="text-muted text-sm font-medium mb-2">Total Vendors</h3>
            <p className="text-3xl font-bold">{vendors.length}</p>
          </div>
          <div className="card">
            <h3 className="text-muted text-sm font-medium mb-2">Active</h3>
            <p className="text-3xl font-bold text-green-400">
              {vendors.filter((v) => v.is_active).length}
            </p>
          </div>
          <div className="card">
            <h3 className="text-muted text-sm font-medium mb-2">Inactive</h3>
            <p className="text-3xl font-bold text-red-400">
              {vendors.filter((v) => !v.is_active).length}
            </p>
          </div>
          <div className="card">
            <h3 className="text-muted text-sm font-medium mb-2">Total Offers</h3>
            <p className="text-3xl font-bold text-primary">
              {vendors.reduce((sum, v) => sum + (v.discount_offers?.length || 0), 0)}
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}