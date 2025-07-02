import { type NextRequest, NextResponse } from "next/server"
import { stripe, STRIPE_CONFIG } from "@/lib/stripe"
import { SubscriptionService } from "@/lib/subscription-service"
import { createClient } from "@/lib/supabase/server"

export async function POST(request: NextRequest) {
  const body = await request.text()
  const signature = request.headers.get("stripe-signature")!

  let event

  try {
    event = stripe.webhooks.constructEvent(body, signature, STRIPE_CONFIG.webhookSecret)
  } catch (err) {
    console.error("Webhook signature verification failed:", err)
    return NextResponse.json({ error: "Invalid signature" }, { status: 400 })
  }

  const subscriptionService = new SubscriptionService()
  const supabase = createClient()

  try {
    switch (event.type) {
      case "checkout.session.completed":
        const session = event.data.object
        if (session.mode === "subscription") {
          // Handle successful subscription creation
          const subscription = await stripe.subscriptions.retrieve(session.subscription as string)
          await subscriptionService.updateSubscriptionInDB(subscription)

          // Add initial connects based on plan
          const { data: plan } = await supabase
            .from("subscription_plans")
            .select("connects_monthly")
            .eq("id", subscription.metadata.planId)
            .single()

          if (plan) {
            await supabase
              .from("company_subscriptions")
              .update({ connects_remaining: plan.connects_monthly })
              .eq("stripe_subscription_id", subscription.id)
          }
        }
        break

      case "invoice.payment_succeeded":
        const invoice = event.data.object
        if (invoice.subscription) {
          // Renew connects for the new billing period
          const subscription = await stripe.subscriptions.retrieve(invoice.subscription as string)
          const { data: plan } = await supabase
            .from("subscription_plans")
            .select("connects_monthly")
            .eq("id", subscription.metadata.planId)
            .single()

          if (plan) {
            await supabase
              .from("company_subscriptions")
              .update({
                connects_remaining: plan.connects_monthly,
                connects_used: 0,
              })
              .eq("stripe_subscription_id", subscription.id)
          }
        }
        break

      case "customer.subscription.updated":
      case "customer.subscription.deleted":
        const updatedSubscription = event.data.object
        await subscriptionService.updateSubscriptionInDB(updatedSubscription)
        break

      default:
        console.log(`Unhandled event type: ${event.type}`)
    }

    return NextResponse.json({ received: true })
  } catch (error) {
    console.error("Webhook handler error:", error)
    return NextResponse.json({ error: "Webhook handler failed" }, { status: 500 })
  }
}
