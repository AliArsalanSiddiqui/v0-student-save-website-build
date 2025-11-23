import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import Link from "next/link"

export default async function DashboardPage() {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect("/auth/login")
  }

  // Get user profile
  const { data: profile } = await supabase.from("profiles").select("*").eq("id", user.id).single()

  // Get active subscription
  const { data: subscription } = await supabase
    .from("student_subscriptions")
    .select("*, subscription_plans(*)")
    .eq("user_id", user.id)
    .eq("is_active", true)
    .order("end_date", { ascending: false })
    .limit(1)
    .single()

  // Get recent redemptions
  const { data: redemptions } = await supabase
    .from("discount_redemptions")
    .select("*, discount_offers(title, discount_value, discount_type), vendors(name)")
    .eq("user_id", user.id)
    .order("redeemed_at", { ascending: false })
    .limit(5)

  const daysUntilExpiry = subscription
    ? Math.ceil((new Date(subscription.end_date).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24))
    : 0

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-6xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-12">
          <h1 className="text-4xl font-bold mb-2">Welcome, {profile?.full_name || "Student"}</h1>
          <p className="text-muted">Manage your discounts and subscriptions</p>
        </div>

        {/* Subscription Status */}
        <div className="grid md:grid-cols-2 gap-8 mb-12">
          <div className="card border-2 border-primary">
            <h3 className="text-lg font-bold mb-4">Subscription Status</h3>
            {subscription ? (
              <>
                <p className="text-foreground font-semibold mb-2">{subscription.subscription_plans?.name}</p>
                <p className="text-muted text-sm mb-4">
                  {daysUntilExpiry > 0 ? `${daysUntilExpiry} days remaining` : "Subscription expired"}
                </p>
                <div className="w-full bg-border rounded-full h-2 mb-4">
                  <div
                    className="bg-gradient-primary h-2 rounded-full"
                    style={{
                      width: `${Math.max(0, (daysUntilExpiry / 365) * 100)}%`,
                    }}
                  ></div>
                </div>
                <Link href="/subscriptions" className="text-primary hover:underline text-sm">
                  Manage Subscription
                </Link>
              </>
            ) : (
              <>
                <p className="text-muted mb-4">No active subscription</p>
                <Link href="/subscriptions" className="inline-block btn-primary text-sm">
                  Get Subscription
                </Link>
              </>
            )}
          </div>

          <div className="card">
            <h3 className="text-lg font-bold mb-4">Quick Stats</h3>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-muted">Discounts Redeemed</span>
                <span className="font-bold">{redemptions?.length || 0}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted">Favorite Vendors</span>
                <span className="font-bold">--</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted">Account Status</span>
                <span className="font-bold text-success">{profile?.is_verified ? "Verified" : "Pending"}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Recent Redemptions */}
        <div className="card mb-12">
          <h3 className="text-lg font-bold mb-6">Recent Redemptions</h3>
          {redemptions && redemptions.length > 0 ? (
            <div className="space-y-4">
              {redemptions.map((redemption: any) => (
                <div key={redemption.id} className="flex items-center justify-between p-4 bg-background rounded-lg">
                  <div>
                    <p className="font-semibold">{redemption.discount_offers?.title}</p>
                    <p className="text-muted text-sm">{redemption.vendors?.name}</p>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-primary">
                      {redemption.discount_offers?.discount_type === "percentage"
                        ? `${redemption.discount_offers?.discount_value}%`
                        : `Rs. ${redemption.discount_offers?.discount_value}`}
                    </p>
                    <p className="text-muted text-sm">{new Date(redemption.redeemed_at).toLocaleDateString()}</p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-muted text-center py-8">No discounts redeemed yet. Start exploring vendors!</p>
          )}
        </div>

        {/* Quick Actions */}
        <div className="grid md:grid-cols-3 gap-8">
          <Link href="/vendors" className="card text-center hover:border-primary transition cursor-pointer">
            <div className="text-4xl mb-4">🏪</div>
            <h3 className="font-bold mb-2">Browse Vendors</h3>
            <p className="text-muted text-sm">Explore restaurants and cafes</p>
          </Link>

          <Link href="/scan" className="card text-center hover:border-primary transition cursor-pointer">
            <div className="text-4xl mb-4">📱</div>
            <h3 className="font-bold mb-2">Scan QR Code</h3>
            <p className="text-muted text-sm">Redeem a discount offer</p>
          </Link>

          <Link href="/profile" className="card text-center hover:border-primary transition cursor-pointer">
            <div className="text-4xl mb-4">👤</div>
            <h3 className="font-bold mb-2">My Profile</h3>
            <p className="text-muted text-sm">Manage your account</p>
          </Link>
        </div>
      </div>
    </div>
  )
}
