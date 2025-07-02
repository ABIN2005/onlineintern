import { type NextRequest, NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"
import { SubscriptionService } from "@/lib/subscription-service"
import { stripe } from "@/lib/stripe"

export async function POST(request: NextRequest) {
  try {
    const { planId, billingCycle } = await request.json()
    const supabase = createClient()

    // Get current user
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Get company details
    const { data: company, error: companyError } = await supabase
      .from("companies")
      .select("*")
      .eq("user_id", user.id)
      .single()

    if (companyError || !company) {
      return NextResponse.json({ error: "Company not found" }, { status: 404 })
    }

    // Get subscription plan
    const { data: plan, error: planError } = await supabase
      .from("subscription_plans")
      .select("*")
      .eq("id", planId)
      .single()

    if (planError || !plan) {
      return NextResponse.json({ error: "Plan not found" }, { status: 404 })
    }

    const subscriptionService = new SubscriptionService()

    // Create or get Stripe customer
    let customerId = company.stripe_customer_id
    if (!customerId) {
      const customer = await subscriptionService.createCustomer(
        company.id,
        company.official_email,
        company.company_name,
      )
      customerId = customer.id

      // Update company with customer ID
      await supabase.from("companies").update({ stripe_customer_id: customerId }).eq("id", company.id)
    }

    // Create checkout session
    const priceId = billingCycle === "yearly" ? plan.stripe_price_id_yearly : plan.stripe_price_id_monthly

    const session = await stripe.checkout.sessions.create({
      customer: customerId,
      payment_method_types: ["card"],
      line_items: [
        {
          price: priceId,
          quantity: 1,
        },
      ],
      mode: "subscription",
      success_url: `${process.env.NEXT_PUBLIC_URL}/company/subscription/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.NEXT_PUBLIC_URL}/company/subscription`,
      metadata: {
        companyId: company.id,
        planId: plan.id,
      },
    })

    return NextResponse.json({ sessionId: session.id })
  } catch (error) {
    console.error("Subscription creation error:", error)
    return NextResponse.json({ error: "Failed to create subscription" }, { status: 500 })
  }
}
