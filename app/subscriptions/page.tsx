"use client"

import { useEffect, useState } from "react"
import { createClient } from "@/lib/supabase/client"
import { useRouter } from "next/navigation"
import { SUBSCRIPTION_TIERS } from "@/lib/constants"

export default function SubscriptionsPage() {
  const [user, setUser] = useState<any>(null)
  const [currentSubscription, setCurrentSubscription] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const supabase = createClient()
  const router = useRouter()

  useEffect(() => {
    const loadData = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser()
      if (!user) {
        router.push("/auth/login")
        return
      }
      setUser(user)

      const { data: subscription } = await supabase
        .from("student_subscriptions")
        .select("*, subscription_plans(*)")
        .eq("user_id", user.id)
        .eq("is_active", true)
        .single()

      setCurrentSubscription(subscription)
      setLoading(false)
    }

    loadData()
  }, [])

  const handleSubscribe = async (planId: string) => {
    if (!user) {
      router.push("/auth/login")
      return
    }

    // In production, integrate with Stripe or payment gateway
    // For now, create subscription directly
    const plan = SUBSCRIPTION_TIERS.find((p) => p.id === planId)
    if (!plan) return

    const endDate = new Date()
    endDate.setDate(endDate.getDate() + plan.duration)

    const { error } = await supabase.from("student_subscriptions").insert({
      user_id: user.id,
      subscription_plan_id: planId,
      end_date: endDate.toISOString(),
      payment_status: "completed",
    })

    if (!error) {
      router.push("/dashboard")
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <p className="text-muted">Loading...</p>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background py-12 px-4">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="text-center mb-16">
          <h1 className="text-4xl font-bold mb-4">Choose Your Plan</h1>
          <p className="text-muted text-xl">Get unlimited access to exclusive student discounts</p>
        </div>

        {/* Current Subscription Info */}
        {currentSubscription && (
          <div className="bg-green-900/20 border border-green-700 text-green-400 px-6 py-4 rounded-lg mb-12 text-center">
            <p className="font-semibold">
              You currently have an active {currentSubscription.subscription_plans?.name} subscription
            </p>
          </div>
        )}

        {/* Subscription Plans */}
        <div className="grid md:grid-cols-4 gap-6">
          {SUBSCRIPTION_TIERS.map((plan) => (
            <div
              key={plan.id}
              className={`card flex flex-col justify-between ${plan.discount > 0 ? "border-2 border-primary" : ""}`}
            >
              {plan.discount > 0 && (
                <div className="absolute -top-3 left-1/2 transform -translate-x-1/2 bg-primary text-white px-3 py-1 rounded-full text-xs font-bold">
                  Save {plan.discount}%
                </div>
              )}

              <div>
                <h3 className="text-xl font-bold mb-2">{plan.name}</h3>
                <p className="text-muted text-sm mb-4">{plan.duration} days access</p>
                <div className="mb-6">
                  <span className="text-3xl font-bold">Rs. {plan.price}</span>
                  {plan.price > 0 && (
                    <span className="text-muted text-sm">
                      {" "}
                      / {plan.duration === 7 ? "week" : plan.duration === 30 ? "month" : "period"}
                    </span>
                  )}
                </div>
              </div>

              <button
                onClick={() => handleSubscribe(plan.id)}
                disabled={currentSubscription?.subscription_plans?.name === plan.name}
                className="w-full btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {plan.price === 0 ? "Start Free Trial" : "Subscribe Now"}
              </button>
            </div>
          ))}
        </div>

        {/* FAQ */}
        <div className="mt-20">
          <h2 className="text-2xl font-bold mb-8 text-center">Frequently Asked Questions</h2>

          <div className="grid md:grid-cols-2 gap-8">
            <div className="card">
              <h3 className="font-bold mb-3">Can I cancel anytime?</h3>
              <p className="text-muted text-sm">
                Yes, you can cancel your subscription at any time from your account settings. No questions asked.
              </p>
            </div>

            <div className="card">
              <h3 className="font-bold mb-3">What payment methods do you accept?</h3>
              <p className="text-muted text-sm">
                We accept all major credit cards, debit cards, and mobile payment methods.
              </p>
            </div>

            <div className="card">
              <h3 className="font-bold mb-3">Do I get a refund if I cancel?</h3>
              <p className="text-muted text-sm">
                Refunds are available within 30 days of purchase. Contact our support team for assistance.
              </p>
            </div>

            <div className="card">
              <h3 className="font-bold mb-3">Is there a free trial?</h3>
              <p className="text-muted text-sm">
                Yes! Start with our 7-day free trial to explore all the discounts available.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
