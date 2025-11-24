import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import Link from "next/link"

export default async function AdminDashboardPage() {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect("/admin/login")
  }

  // Get user profile to check if admin
  const { data: profile } = await supabase.from("profiles").select("*").eq("id", user.id).single()

  if (profile?.user_type !== "admin") {
    redirect("/")
  }

  // Get comprehensive dashboard stats
  const { count: vendorsCount } = await supabase
    .from("vendors")
    .select("*", { count: "exact", head: true })
    .eq("is_active", true)

  const { count: totalVendorsCount } = await supabase
    .from("vendors")
    .select("*", { count: "exact", head: true })

  const { count: studentCount } = await supabase
    .from("profiles")
    .select("*", { count: "exact", head: true })
    .eq("user_type", "student")
    .eq("is_verified", true)

  const { count: pendingVerificationCount } = await supabase
    .from("profiles")
    .select("*", { count: "exact", head: true })
    .eq("user_type", "student")
    .eq("is_verified", false)

  const { count: subscriptionCount } = await supabase
    .from("student_subscriptions")
    .select("*", { count: "exact", head: true })
    .eq("is_active", true)

  const { count: redemptionCount } = await supabase
    .from("discount_redemptions")
    .select("*", { count: "exact", head: true })

  const { count: activeOffersCount } = await supabase
    .from("discount_offers")
    .select("*", { count: "exact", head: true })
    .eq("is_active", true)
    .gte("valid_until", new Date().toISOString())

  // Get recent activity
  const { data: recentRedemptions } = await supabase
    .from("discount_redemptions")
    .select(`
      *,
      profiles!discount_redemptions_user_id_fkey(full_name, email),
      discount_offers(title),
      vendors:discount_offers(vendor_id, vendors(name))
    `)
    .order("redeemed_at", { ascending: false })
    .limit(5)

  // Get revenue stats (from subscriptions)
  const { data: revenueData } = await supabase
    .from("student_subscriptions")
    .select("subscription_plans(price)")
    .eq("payment_status", "completed")

  const totalRevenue = revenueData?.reduce((sum, item) => {
    return sum + (item.subscription_plans?.price || 0)
  }, 0) || 0

  // Get category breakdown
  const { data: categoryData } = await supabase
    .from("vendors")
    .select("category")
    .eq("is_active", true)

  const categoryCount = categoryData?.reduce((acc: any, vendor) => {
    acc[vendor.category] = (acc[vendor.category] || 0) + 1
    return acc
  }, {}) || {}

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-12 flex justify-between items-center">
          <div>
            <h1 className="text-4xl font-bold mb-2">Admin Dashboard</h1>
            <p className="text-muted-foreground">Manage StudentSave platform</p>
          </div>
          <div className="text-right">
            <p className="text-muted-foreground text-sm">Logged in as Admin</p>
            <p className="font-semibold">{profile?.email}</p>
          </div>
        </div>

        {/* Main Stats Grid */}
        <div className="grid md:grid-cols-4 gap-6 mb-12">
          <div className="bg-gradient-to-br from-blue-900/30 to-blue-800/20 border border-blue-700/50 rounded-lg p-6">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-blue-200 text-sm font-medium">Active Vendors</h3>
              <span className="text-2xl">🏪</span>
            </div>
            <p className="text-3xl font-bold text-blue-100">{vendorsCount || 0}</p>
            <p className="text-blue-300 text-xs mt-1">{totalVendorsCount} total vendors</p>
          </div>

          <div className="bg-gradient-to-br from-green-900/30 to-green-800/20 border border-green-700/50 rounded-lg p-6">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-green-200 text-sm font-medium">Verified Students</h3>
              <span className="text-2xl">🎓</span>
            </div>
            <p className="text-3xl font-bold text-green-100">{studentCount || 0}</p>
            <p className="text-green-300 text-xs mt-1">{pendingVerificationCount} pending</p>
          </div>

          <div className="bg-gradient-to-br from-purple-900/30 to-purple-800/20 border border-purple-700/50 rounded-lg p-6">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-purple-200 text-sm font-medium">Active Subscriptions</h3>
              <span className="text-2xl">💳</span>
            </div>
            <p className="text-3xl font-bold text-purple-100">{subscriptionCount || 0}</p>
            <p className="text-purple-300 text-xs mt-1">Rs. {totalRevenue.toLocaleString()} revenue</p>
          </div>

          <div className="bg-gradient-to-br from-orange-900/30 to-orange-800/20 border border-orange-700/50 rounded-lg p-6">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-orange-200 text-sm font-medium">Total Redemptions</h3>
              <span className="text-2xl">🎟️</span>
            </div>
            <p className="text-3xl font-bold text-orange-100">{redemptionCount || 0}</p>
            <p className="text-orange-300 text-xs mt-1">{activeOffersCount} active offers</p>
          </div>
        </div>

        {/* Category Breakdown */}
        <div className="card mb-12">
          <h3 className="text-xl font-bold mb-6">Vendor Categories</h3>
          <div className="grid grid-cols-2 md:grid-cols-6 gap-4">
            {Object.entries(categoryCount).map(([category, count]) => (
              <div key={category} className="text-center p-4 bg-background rounded-lg">
                <p className="text-2xl font-bold text-primary">{count as number}</p>
                <p className="text-sm text-muted capitalize mt-1">{category}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Recent Activity */}
        <div className="card mb-12">
          <h3 className="text-xl font-bold mb-6">Recent Redemptions</h3>
          {recentRedemptions && recentRedemptions.length > 0 ? (
            <div className="space-y-4">
              {recentRedemptions.map((redemption: any) => (
                <div key={redemption.id} className="flex items-center justify-between p-4 bg-background rounded-lg">
                  <div className="flex-1">
                    <p className="font-semibold">{redemption.profiles?.full_name}</p>
                    <p className="text-muted text-sm">{redemption.discount_offers?.title}</p>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-primary">Rs. {redemption.discount_amount}</p>
                    <p className="text-muted text-sm">
                      {new Date(redemption.redeemed_at).toLocaleDateString()}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-muted text-center py-8">No recent redemptions</p>
          )}
        </div>

        {/* Management Sections */}
        <div className="grid md:grid-cols-3 gap-8">
          <Link
            href="/admin/vendors"
            className="bg-card border border-border rounded-lg p-6 hover:border-primary transition cursor-pointer"
          >
            <div className="text-4xl mb-4">🏪</div>
            <h3 className="text-xl font-bold mb-2">Vendor Management</h3>
            <p className="text-muted-foreground text-sm mb-4">Add, edit, and manage vendors</p>
            <div className="text-primary font-semibold text-sm">Manage Vendors →</div>
          </Link>

          <Link
            href="/admin/students"
            className="bg-card border border-border rounded-lg p-6 hover:border-primary transition cursor-pointer"
          >
            <div className="text-4xl mb-4">🎓</div>
            <h3 className="text-xl font-bold mb-2">Student Management</h3>
            <p className="text-muted-foreground text-sm mb-4">Verify and manage student accounts</p>
            <div className="text-primary font-semibold text-sm">Manage Students →</div>
          </Link>

          <Link
            href="/admin/offers"
            className="bg-card border border-border rounded-lg p-6 hover:border-primary transition cursor-pointer"
          >
            <div className="text-4xl mb-4">🎟️</div>
            <h3 className="text-xl font-bold mb-2">Discount Offers</h3>
            <p className="text-muted-foreground text-sm mb-4">Create and manage discount offers</p>
            <div className="text-primary font-semibold text-sm">Manage Offers →</div>
          </Link>

          <Link
            href="/admin/subscriptions"
            className="bg-card border border-border rounded-lg p-6 hover:border-primary transition cursor-pointer"
          >
            <div className="text-4xl mb-4">💳</div>
            <h3 className="text-xl font-bold mb-2">Subscription Plans</h3>
            <p className="text-muted-foreground text-sm mb-4">Configure subscription tiers and pricing</p>
            <div className="text-primary font-semibold text-sm">Manage Plans →</div>
          </Link>

          <Link
            href="/admin/announcements"
            className="bg-card border border-border rounded-lg p-6 hover:border-primary transition cursor-pointer"
          >
            <div className="text-4xl mb-4">📢</div>
            <h3 className="text-xl font-bold mb-2">Announcements</h3>
            <p className="text-muted-foreground text-sm mb-4">Send notifications to students</p>
            <div className="text-primary font-semibold text-sm">Send Announcement →</div>
          </Link>

          <Link
            href="/admin/analytics"
            className="bg-card border border-border rounded-lg p-6 hover:border-primary transition cursor-pointer"
          >
            <div className="text-4xl mb-4">📊</div>
            <h3 className="text-xl font-bold mb-2">Analytics</h3>
            <p className="text-muted-foreground text-sm mb-4">View detailed analytics and reports</p>
            <div className="text-primary font-semibold text-sm">View Analytics →</div>
          </Link>
        </div>

        {/* Quick Actions */}
        <div className="mt-12 grid md:grid-cols-2 gap-6">
          <Link href="/admin/students/pending" className="card hover:border-yellow-500 transition">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-bold mb-1">⚠️ Pending Verifications</h3>
                <p className="text-muted text-sm">Review student verification requests</p>
              </div>
              <span className="text-2xl font-bold text-yellow-500">{pendingVerificationCount}</span>
            </div>
          </Link>

          <Link href="/admin/reports" className="card hover:border-primary transition">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-bold mb-1">📈 Generate Reports</h3>
                <p className="text-muted text-sm">Download usage and revenue reports</p>
              </div>
              <span className="text-2xl">→</span>
            </div>
          </Link>
        </div>
      </div>
    </div>
  )
}
