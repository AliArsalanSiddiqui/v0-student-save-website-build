import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"

export default async function ProfilePage() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect("/auth/login")
  }

  const { data: profile } = await supabase.from("profiles").select("*").eq("id", user.id).single()

  return (
    <div className="min-h-screen bg-background py-8">
      <div className="max-w-2xl mx-auto px-4">
        <h1 className="text-3xl font-bold mb-8">My Profile</h1>
        <div className="card">
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium mb-2 text-muted">Full Name</label>
              <p className="text-lg">{profile?.full_name}</p>
            </div>
            <div>
              <label className="block text-sm font-medium mb-2 text-muted">Email</label>
              <p className="text-lg">{profile?.email}</p>
            </div>
            <div>
              <label className="block text-sm font-medium mb-2 text-muted">University</label>
              <p className="text-lg">{profile?.university}</p>
            </div>
            <div>
              <label className="block text-sm font-medium mb-2 text-muted">Verification Status</label>
              <p className="text-lg">
                {profile?.is_verified ? (
                  <span className="text-success">Verified</span>
                ) : (
                  <span className="text-muted">Pending Verification</span>
                )}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
