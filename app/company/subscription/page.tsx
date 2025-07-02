import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import { SubscriptionPlans } from "@/components/subscription/subscription-plans"
import { SubscriptionDashboard } from "@/components/subscription/subscription-dashboard"

export default async function SubscriptionPage() {
  const supabase = createClient()

  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser()
  if (authError || !user) {
    redirect("/login")
  }

  // Get company details
  const { data: company } = await supabase.from("companies").select("*").eq("user_id", user.id).single()

  if (!company) {
    redirect("/company/setup")
  }

  // Get current subscription
  const { data: subscription } = await supabase
    .from("company_subscriptions")
    .select(`
      *,
      subscription_plans (*)
    `)
    .eq("company_id", company.id)
    .eq("status", "active")
    .single()

  const handleSelectPlan = async (planId: string, billingCycle: "monthly" | "yearly") => {
    "use server"

    const response = await fetch(`${process.env.NEXT_PUBLIC_URL}/api/subscription/create`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ planId, billingCycle }),
    })

    const { sessionId } = await response.json()

    // Redirect to Stripe Checkout
    redirect(`https://checkout.stripe.com/pay/${sessionId}`)
  }

  return (
    <div className="container mx-auto py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold">Subscription Management</h1>
        <p className="text-muted-foreground mt-2">Manage your subscription and connect usage</p>
      </div>

      {subscription ? (
        <SubscriptionDashboard subscription={subscription} />
      ) : (
        <div>
          <div className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">Choose Your Plan</h2>
            <p className="text-muted-foreground">Select a subscription plan to start accessing candidate profiles</p>
          </div>
          <SubscriptionPlans onSelectPlan={handleSelectPlan} />
        </div>
      )}
    </div>
  )
}
