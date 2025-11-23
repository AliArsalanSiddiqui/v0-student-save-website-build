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

  // Get dashboard stats
  const { count: vendorsCount } = await supabase
    .from("vendors")
    .select("*", { count: "exact", head: true })
    .eq("is_active", true)

  const { count: studentCount } = await supabase
    .from("profiles")
    .select("*", { count: "exact", head: true })
    .eq("user_type", "student")
    .eq("is_verified", true)

  const { count: subscriptionCount } = await supabase
    .from("student_subscriptions")
    .select("*", { count: "exact", head: true })
    .eq("is_active", true)

  const { count: redemptionCount } = await supabase
    .from("discount_redemptions")
    .select("*", { count: "exact", head: true })

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-12 flex justify-between items-center">
          <div>
            <h1 className="text-4xl font-bold mb-2">Admin Dashboard</h1>
            <p className="text-muted-foreground">Manage vendors, students, and discounts</p>
          </div>
          <div className="text-right">
            <p className="text-muted-foreground text-sm">Logged in as Admin</p>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid md:grid-cols-4 gap-6 mb-12">
          <div className="bg-card border border-border rounded-lg p-6">
            <h3 className="text-muted-foreground text-sm font-medium mb-2">Active Vendors</h3>
            <p className="text-3xl font-bold">{vendorsCount || 0}</p>
          </div>

          <div className="bg-card border border-border rounded-lg p-6">
            <h3 className="text-muted-foreground text-sm font-medium mb-2">Verified Students</h3>
            <p className="text-3xl font-bold">{studentCount || 0}</p>
          </div>

          <div className="bg-card border border-border rounded-lg p-6">
            <h3 className="text-muted-foreground text-sm font-medium mb-2">Active Subscriptions</h3>
            <p className="text-3xl font-bold">{subscriptionCount || 0}</p>
          </div>

          <div className="bg-card border border-border rounded-lg p-6">
            <h3 className="text-muted-foreground text-sm font-medium mb-2">Total Redemptions</h3>
            <p className="text-3xl font-bold">{redemptionCount || 0}</p>
          </div>
        </div>

        {/* Management Sections */}
        <div className="grid md:grid-cols-3 gap-8">
          <Link href="/admin/vendors" className="bg-card border border-border rounded-lg p-6 hover:border-primary transition cursor-pointer">
            <h3 className="text-xl font-bold mb-2">Vendor Management</h3>
            <p className="text-muted-foreground text-sm mb-4">Add, edit, and manage vendors</p>
            <div className="text-primary font-semibold text-sm">Manage Vendors →</div>
          </Link>

          <Link href="/admin/students" className="bg-card border border-border rounded-lg p-6 hover:border-primary transition cursor-pointer">
            <h3 className="text-xl font-bold mb-2">Student Management</h3>
            <p className="text-muted-foreground text-sm mb-4">Verify and manage student accounts</p>
            <div className="text-primary font-semibold text-sm">Manage Students →</div>
          </Link>

          <Link href="/admin/offers" className="bg-card border border-border rounded-lg p-6 hover:border-primary transition cursor-pointer">
            <h3 className="text-xl font-bold mb-2">Discount Offers</h3>
            <p className="text-muted-foreground text-sm mb-4">Create and manage discount offers</p>
            <div className="text-primary font-semibold text-sm">Manage Offers →</div>
          </Link>

          <Link href="/admin/subscriptions" className="bg-card border border-border rounded-lg p-6 hover:border-primary transition cursor-pointer">
            <h3 className="text-xl font-bold mb-2">Subscription Plans</h3>
            <p className="text-muted-foreground text-sm mb-4">Configure subscription tiers and pricing</p>
            <div className="text-primary font-semibold text-sm">Manage Plans →</div>
          </Link>

          <Link href="/admin/announcements" className="bg-card border border-border rounded-lg p-6 hover:border-primary transition cursor-pointer">
            <h3 className="text-xl font-bold mb-2">Announcements</h3>
            <p className="text-muted-foreground text-sm mb-4">Send notifications to students</p>
            <div className="text-primary font-semibold text-sm">Send Announcement →</div>
          </Link>

          <Link href="/admin/analytics" className="bg-card border border-border rounded-lg p-6 hover:border-primary transition cursor-pointer">
            <h3 className="text-xl font-bold mb-2">Analytics</h3>
            <p className="text-muted-foreground text-sm mb-4">View detailed analytics and reports</p>
            <div className="text-primary font-semibold text-sm">View Analytics →</div>
          </Link>
        </div>
      </div>
    </div>
  )
}
