"use client"

import Link from "next/link"
import { useEffect, useState } from "react"
import { createClient } from "@/lib/supabase/client"
import { useRouter } from "next/navigation"

export default function Navbar() {
  const [user, setUser] = useState<any>(null)
  const router = useRouter()
  const supabase = createClient()

  useEffect(() => {
    const getUser = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser()
      setUser(user)
    }
    getUser()
  }, [])

  const handleLogout = async () => {
    await supabase.auth.signOut()
    setUser(null)
    router.push("/")
  }

  return (
    <nav className="bg-card border-b border-border sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <Link href="/" className="flex items-center gap-2">
            <img src="/logo.png" alt="StudentSave" className="h-8 w-8" />
            <span className="text-xl font-bold text-gradient">StudentSave</span>
          </Link>

          <div className="flex items-center gap-4">
            {user ? (
              <>
                <Link href="/dashboard" className="text-muted hover:text-foreground transition">
                  Dashboard
                </Link>
                <button onClick={handleLogout} className="btn-primary text-sm">
                  Logout
                </button>
              </>
            ) : (
              <>
                <Link href="/auth/login" className="text-muted hover:text-foreground transition">
                  Login
                </Link>
                <Link href="/auth/signup" className="btn-primary text-sm">
                  Sign Up
                </Link>
              </>
            )}
          </div>
        </div>
      </div>
    </nav>
  )
}

export { Navbar }
