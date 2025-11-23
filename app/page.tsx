"use client"

import Link from "next/link"
import { useEffect, useState } from "react"
import { createClient } from "@/lib/supabase/client"
import { Navbar } from "@/components/navbar"

export default function HomePage() {
  const [user, setUser] = useState<any>(null)
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

  return (
    <>
      <Navbar />
      <main className="min-h-screen">
        {/* Hero Section */}
        <section className="relative min-h-screen flex items-center justify-center px-4 overflow-hidden">
          <div className="absolute inset-0 opacity-20">
            <div className="absolute top-20 right-10 w-72 h-72 bg-primary rounded-full blur-3xl"></div>
            <div className="absolute bottom-20 left-10 w-72 h-72 bg-secondary rounded-full blur-3xl"></div>
          </div>

          <div className="relative max-w-4xl mx-auto text-center z-10">
            <img src="/logo.png" alt="StudentSave" className="h-24 w-24 mx-auto mb-8 opacity-90" />

            <h1 className="text-5xl md:text-7xl font-bold mb-6 text-gradient">
              Unlock Exclusive <br />
              Student Discounts
            </h1>

            <p className="text-xl md:text-2xl text-muted mb-12 max-w-2xl mx-auto">
              Connect with your favorite restaurants and cafes. Enjoy verified discounts designed exclusively for
              students at your university.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center mb-16">
              {user ? (
                <>
                  <Link href="/dashboard" className="btn-primary">
                    Go to Dashboard
                  </Link>
                  <Link href="/vendors" className="btn-secondary">
                    Browse Discounts
                  </Link>
                </>
              ) : (
                <>
                  <Link href="/auth/signup" className="btn-primary">
                    I'm a Student
                  </Link>
                  <Link href="/auth/login" className="btn-secondary">
                    Already a Member
                  </Link>
                </>
              )}
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section className="py-20 px-4">
          <div className="max-w-6xl mx-auto">
            <h2 className="text-4xl font-bold text-center mb-16 text-gradient">Why Choose StudentSave?</h2>

            <div className="grid md:grid-cols-3 gap-8">
              <div className="card hover:border-primary transition">
                <div className="text-4xl mb-4">✓</div>
                <h3 className="text-xl font-bold mb-3">Verified Discounts</h3>
                <p className="text-muted">Authentic offers from verified restaurants and cafes near your university</p>
              </div>

              <div className="card hover:border-primary transition">
                <div className="text-4xl mb-4">🎓</div>
                <h3 className="text-xl font-bold mb-3">Exclusive Offers</h3>
                <p className="text-muted">Special deals available only to verified students at your university</p>
              </div>

              <div className="card hover:border-primary transition">
                <div className="text-4xl mb-4">⚡</div>
                <h3 className="text-xl font-bold mb-3">Easy Redemption</h3>
                <p className="text-muted">QR code scanning for instant activation and tracking of your discounts</p>
              </div>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-20 px-4 gradient-primary">
          <div className="max-w-4xl mx-auto text-center">
            <h2 className="text-4xl font-bold mb-6 text-white">Start Saving Today</h2>
            <p className="text-xl text-white/80 mb-8 max-w-2xl mx-auto">
              Join verified students enjoying exclusive discounts at top restaurants and cafes across Pakistan.
            </p>
            {!user && (
              <Link
                href="/auth/signup"
                className="inline-block bg-white text-primary font-bold px-8 py-4 rounded-lg hover:bg-gray-100 transition"
              >
                Create Free Account
              </Link>
            )}
          </div>
        </section>

        {/* Footer */}
        <footer className="bg-card border-t border-border py-12 px-4">
          <div className="max-w-6xl mx-auto">
            <div className="grid md:grid-cols-4 gap-8 mb-8">
              <div>
                <div className="flex items-center gap-2 mb-4">
                  <img src="/logo.png" alt="StudentSave" className="h-6 w-6" />
                  <span className="font-bold">StudentSave</span>
                </div>
                <p className="text-muted text-sm">Exclusive discounts for verified students</p>
              </div>

              <div>
                <h4 className="font-bold mb-4">Product</h4>
                <ul className="space-y-2 text-muted text-sm">
                  <li>
                    <Link href="/vendors" className="hover:text-foreground">
                      Browse Discounts
                    </Link>
                  </li>
                  <li>
                    <Link href="/auth/signup" className="hover:text-foreground">
                      Student Signup
                    </Link>
                  </li>
                </ul>
              </div>

              <div>
                <h4 className="font-bold mb-4">For Vendors</h4>
                <ul className="space-y-2 text-muted text-sm">
                  <li>
                    <Link href="/vendors/partner" className="hover:text-foreground">
                      Partner With Us
                    </Link>
                  </li>
                  <li>
                    <Link href="/admin" className="hover:text-foreground">
                      Vendor Login
                    </Link>
                  </li>
                </ul>
              </div>

              <div>
                <h4 className="font-bold mb-4">Admin</h4>
                <ul className="space-y-2 text-muted text-sm">
                  <li>
                    <Link href="/admin/login" className="hover:text-foreground">
                      Admin Login
                    </Link>
                  </li>
                </ul>
              </div>
            </div>

            <div className="border-t border-border pt-8 text-center text-muted text-sm">
              <p>&copy; 2025 StudentSave. All rights reserved.</p>
            </div>
          </div>
        </footer>
      </main>
    </>
  )
}
