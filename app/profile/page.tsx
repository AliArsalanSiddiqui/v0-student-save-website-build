import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import Link from "next/link"

export default async function ProfilePage() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect("/auth/login")
  }

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

  // Get total redemptions count
  const { count: redemptionsCount } = await supabase
    .from("discount_redemptions")
    .select("*", { count: "exact", head: true })
    .eq("user_id", user.id)

  // Get favorite vendors count
  const { count: favoritesCount } = await supabase
    .from("favorite_vendors")
    .select("*", { count: "exact", head: true })
    .eq("user_id", user.id)

  return (
    <div className="min-h-screen bg-background py-8">
      <div className="max-w-4xl mx-auto px-4">
        <div className="mb-8 flex items-center justify-between">
          <h1 className="text-3xl font-bold">My Profile</h1>
          <Link href="/profile/edit" className="btn-primary text-sm">
            Edit Profile
          </Link>
        </div>

        {/* Profile Card */}
        <div className="card mb-8">
          <div className="flex items-start gap-6 mb-6">
            <div className="h-24 w-24 rounded-full bg-gradient-primary flex items-center justify-center text-white text-3xl font-bold">
              {profile?.full_name?.charAt(0)?.toUpperCase() || "U"}
            </div>
            <div className="flex-1">
              <h2 className="text-2xl font-bold mb-2">{profile?.full_name || "User"}</h2>
              <p className="text-muted mb-1">{profile?.email}</p>
              <div className="flex items-center gap-2 mt-3">
                {profile?.is_verified ? (
                  <span className="px-3 py-1 bg-green-900/20 border border-green-700 text-green-400 rounded-full text-sm font-semibold">
                    ✓ Verified Student
                  </span>
                ) : (
                  <span className="px-3 py-1 bg-yellow-900/20 border border-yellow-700 text-yellow-400 rounded-full text-sm font-semibold">
                    ⚠ Verification Pending
                  </span>
                )}
                {profile?.student_id_verified && (
                  <span className="px-3 py-1 bg-blue-900/20 border border-blue-700 text-blue-400 rounded-full text-sm font-semibold">
                    ✓ ID Verified
                  </span>
                )}
              </div>
            </div>
          </div>

          <div className="grid md:grid-cols-2 gap-6 border-t border-border pt-6">
            <div>
              <label className="block text-sm font-medium mb-2 text-muted">University</label>
              <p className="text-lg">{profile?.university || "Not specified"}</p>
            </div>
            <div>
              <label className="block text-sm font-medium mb-2 text-muted">Student ID</label>
              <p className="text-lg">{profile?.student_id || "Not provided"}</p>
            </div>
            <div>
              <label className="block text-sm font-medium mb-2 text-muted">Phone Number</label>
              <p className="text-lg">{profile?.phone_number || "Not provided"}</p>
            </div>
            <div>
              <label className="block text-sm font-medium mb-2 text-muted">Date of Birth</label>
              <p className="text-lg">
                {profile?.date_of_birth 
                  ? new Date(profile.date_of_birth).toLocaleDateString() 
                  : "Not provided"}
              </p>
            </div>
            <div>
              <label className="block text-sm font-medium mb-2 text-muted">Gender</label>
              <p className="text-lg capitalize">{profile?.gender || "Not specified"}</p>
            </div>
            <div>
              <label className="block text-sm font-medium mb-2 text-muted">Account Type</label>
              <p className="text-lg capitalize">{profile?.user_type || "Student"}</p>
            </div>
          </div>
        </div>

        {/* Statistics Grid */}
        <div className="grid md:grid-cols-3 gap-6 mb-8">
          <div className="card">
            <h3 className="text-muted text-sm font-medium mb-2">Discounts Redeemed</h3>
            <p className="text-3xl font-bold text-primary">{redemptionsCount || 0}</p>
          </div>
          <div className="card">
            <h3 className="text-muted text-sm font-medium mb-2">Favorite Vendors</h3>
            <p className="text-3xl font-bold text-primary">{favoritesCount || 0}</p>
          </div>
          <div className="card">
            <h3 className="text-muted text-sm font-medium mb-2">Member Since</h3>
            <p className="text-lg font-bold">
              {new Date(profile?.created_at || "").toLocaleDateString("en-US", { 
                month: "short", 
                year: "numeric" 
              })}
            </p>
          </div>
        </div>

        {/* Current Subscription */}
        <div className="card mb-8">
          <h3 className="text-xl font-bold mb-4">Current Subscription</h3>
          {subscription ? (
            <div className="flex items-center justify-between">
              <div>
                <p className="text-lg font-semibold mb-1">{subscription.subscription_plans?.name}</p>
                <p className="text-muted text-sm">
                  Valid until {new Date(subscription.end_date).toLocaleDateString()}
                </p>
              </div>
              <Link href="/subscriptions" className="btn-secondary text-sm">
                Manage Plan
              </Link>
            </div>
          ) : (
            <div className="text-center py-6">
              <p className="text-muted mb-4">You don't have an active subscription</p>
              <Link href="/subscriptions" className="btn-primary">
                Choose a Plan
              </Link>
            </div>
          )}
        </div>

        {/* Account Actions */}
        <div className="grid md:grid-cols-2 gap-6">
          <Link href="/profile/security" className="card hover:border-primary transition cursor-pointer">
            <h3 className="font-bold mb-2">🔒 Security Settings</h3>
            <p className="text-muted text-sm">Change password and manage security</p>
          </Link>
          <Link href="/profile/notifications" className="card hover:border-primary transition cursor-pointer">
            <h3 className="font-bold mb-2">🔔 Notifications</h3>
            <p className="text-muted text-sm">Manage your notification preferences</p>
          </Link>
        </div>
      </div>
    </div>
  )
}
