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
    .select("*, discount_offers(title, discount_value, discount_type), vendors:discount_offers(vendor_id, vendors(name))")
    .eq("user_id", user.id)
    .order("redeemed_at", { ascending: false })
    .limit(5)

  // Get favorite vendors
  const { data: favorites } = await supabase
    .from("favorite_vendors")
    .select("*, vendors(name, category, logo_url)")
    .eq("user_id", user.id)
    .limit(3)

  // Get active announcements
  const { data: announcements } = await supabase
    .from("announcements")
    .select("*")
    .eq("is_active", true)
    .order("created_at", { ascending: false })
    .limit(3)

  const daysUntilExpiry = subscription
    ? Math.ceil((new Date(subscription.end_date).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24))
    : 0

  const totalSavings = redemptions?.reduce((sum, r: any) => sum + (r.discount_amount || 0), 0) || 0

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-6xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-12">
          <h1 className="text-4xl font-bold mb-2">Welcome back, {profile?.full_name || "Student"}! 👋</h1>
          <p className="text-muted">Here's your StudentSave dashboard</p>
        </div>

        {/* Verification Alert */}
        {!profile?.is_verified && (
          <div className="bg-yellow-900/20 border border-yellow-700 text-yellow-400 px-6 py-4 rounded-lg mb-8">
            <h3 className="font-bold mb-2">⚠️ Account Verification Pending</h3>
            <p className="text-sm mb-3">
              Your account is pending verification. Please check your email for the verification link. Once verified,
              you'll have full access to all features.
            </p>
            <Link href="/profile" className="text-yellow-300 underline text-sm font-semibold">
              View Profile →
            </Link>
          </div>
        )}

        {/* Announcements */}
        {announcements && announcements.length > 0 && (
          <div className="bg-blue-900/20 border border-blue-700 rounded-lg p-6 mb-8">
            <h3 className="font-bold mb-4 flex items-center gap-2">
              📢 Latest Announcements
            </h3>
            <div className="space-y-3">
              {announcements.map((announcement: any) => (
                <div key={announcement.id} className="text-sm">
                  <p className="font-semibold text-blue-200">{announcement.title}</p>
                  <p className="text-blue-300">{announcement.message}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Subscription & Stats Grid */}
        <div className="grid md:grid-cols-2 gap-8 mb-12">
          <div className="card border-2 border-primary">
            <h3 className="text-lg font-bold mb-4">💳 Subscription Status</h3>
            {subscription ? (
              <>
                <p className="text-foreground font-semibold mb-2">{subscription.subscription_plans?.name}</p>
                <p className="text-muted text-sm mb-4">
                  {daysUntilExpiry > 0 
                    ? `${daysUntilExpiry} days remaining` 
                    : "Subscription expired"}
                </p>
                <div className="w-full bg-border rounded-full h-2 mb-4">
                  <div
                    className="bg-gradient-primary h-2 rounded-full transition-all"
                    style={{
                      width: `${Math.max(0, Math.min(100, (daysUntilExpiry / 365) * 100))}%`,
                    }}
                  ></div>
                </div>
                <div className="flex gap-2">
                  <Link href="/subscriptions" className="text-primary hover:underline text-sm font-semibold">
                    Manage Subscription →
                  </Link>
                </div>
              </>
            ) : (
              <>
                <p className="text-muted mb-4">No active subscription</p>
                <p className="text-sm mb-4">
                  Subscribe now to unlock exclusive discounts at all partner vendors!
                </p>
                <Link href="/subscriptions" className="inline-block btn-primary text-sm">
                  Choose a Plan
                </Link>
              </>
            )}
          </div>

          <div className="card">
            <h3 className="text-lg font-bold mb-4">📊 Your Stats</h3>
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-muted">Total Savings</span>
                <span className="font-bold text-2xl text-green-400">Rs. {totalSavings.toLocaleString()}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-muted">Discounts Redeemed</span>
                <span className="font-bold text-xl">{redemptions?.length || 0}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-muted">Favorite Vendors</span>
                <span className="font-bold text-xl">{favorites?.length || 0}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-muted">Account Status</span>
                <span className={`font-bold ${profile?.is_verified ? 'text-green-400' : 'text-yellow-400'}`}>
                  {profile?.is_verified ? "✓ Verified" : "⏳ Pending"}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Favorite Vendors */}
        {favorites && favorites.length > 0 && (
          <div className="mb-12">
            <h3 className="text-2xl font-bold mb-6">❤️ Your Favorite Vendors</h3>
            <div className="grid md:grid-cols-3 gap-6">
              {favorites.map((fav: any) => (
                <Link
                  key={fav.id}
                  href={`/vendors/${fav.vendor_id}`}
                  className="card hover:border-primary transition cursor-pointer"
                >
                  {fav.vendors?.logo_url && (
                    <img
                      src={fav.vendors.logo_url}
                      alt={fav.vendors?.name}
                      className="h-16 w-16 rounded-full mb-3 object-cover"
                    />
                  )}
                  <h4 className="font-bold mb-1">{fav.vendors?.name}</h4>
                  <p className="text-muted text-sm capitalize">{fav.vendors?.category}</p>
                </Link>
              ))}
            </div>
          </div>
        )}

        {/* Recent Redemptions */}
        <div className="card mb-12">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-bold">🎟️ Recent Redemptions</h3>
            <Link href="/history" className="text-primary text-sm hover:underline">
              View All →
            </Link>
          </div>
          {redemptions && redemptions.length > 0 ? (
            <div className="space-y-4">
              {redemptions.map((redemption: any) => (
                <div key={redemption.id} className="flex items-center justify-between p-4 bg-background rounded-lg">
                  <div>
                    <p className="font-semibold">{redemption.discount_offers?.title}</p>
                    <p className="text-muted text-sm">{redemption.vendors?.vendors?.name}</p>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-primary">
                      {redemption.discount_offers?.discount_type === "percentage"
                        ? `${redemption.discount_offers?.discount_value}% OFF`
                        : `Rs. ${redemption.discount_offers?.discount_value} OFF`}
                    </p>
                    <p className="text-muted text-sm">{new Date(redemption.redeemed_at).toLocaleDateString()}</p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <p className="text-4xl mb-4">🎯</p>
              <p className="text-muted mb-4">No discounts redeemed yet</p>
              <Link href="/vendors" className="btn-primary">
                Explore Vendors
              </Link>
            </div>
          )}
        </div>

        {/* Quick Actions */}
        <div className="grid md:grid-cols-3 gap-8">
          <Link href="/vendors" className="card text-center hover:border-primary transition cursor-pointer">
            <div className="text-4xl mb-4">🏪</div>
            <h3 className="font-bold mb-2">Browse Vendors</h3>
            <p className="text-muted text-sm">Discover restaurants, cafes & more</p>
          </Link>

          <Link href="/scan" className="card text-center hover:border-primary transition cursor-pointer">
            <div className="text-4xl mb-4">📱</div>
            <h3 className="font-bold mb-2">Scan QR Code</h3>
            <p className="text-muted text-sm">Redeem your discount instantly</p>
          </Link>

          <Link href="/profile" className="card text-center hover:border-primary transition cursor-pointer">
            <div className="text-4xl mb-4">👤</div>
            <h3 className="font-bold mb-2">My Profile</h3>
            <p className="text-muted text-sm">Manage your account settings</p>
          </Link>
        </div>
      </div>
    </div>
  )
}
