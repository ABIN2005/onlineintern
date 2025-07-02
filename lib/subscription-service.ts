import { createClient } from "@/lib/supabase/server"
import { stripe } from "./stripe"

export class SubscriptionService {
  private supabase = createClient()

  async createCustomer(companyId: string, email: string, companyName: string) {
    const customer = await stripe.customers.create({
      email,
      metadata: {
        companyId,
        companyName,
      },
    })

    return customer
  }

  async createSubscription(customerId: string, priceId: string, companyId: string, planId: string) {
    const subscription = await stripe.subscriptions.create({
      customer: customerId,
      items: [{ price: priceId }],
      payment_behavior: "default_incomplete",
      payment_settings: { save_default_payment_method: "on_subscription" },
      expand: ["latest_invoice.payment_intent"],
      metadata: {
        companyId,
        planId,
      },
    })

    return subscription
  }

  async updateSubscriptionInDB(subscriptionData: any) {
    const { data, error } = await this.supabase
      .from("company_subscriptions")
      .upsert({
        company_id: subscriptionData.metadata.companyId,
        plan_id: subscriptionData.metadata.planId,
        stripe_subscription_id: subscriptionData.id,
        stripe_customer_id: subscriptionData.customer,
        status: subscriptionData.status,
        current_period_start: new Date(subscriptionData.current_period_start * 1000),
        current_period_end: new Date(subscriptionData.current_period_end * 1000),
        updated_at: new Date(),
      })
      .select()

    if (error) throw error
    return data
  }

  async getCompanySubscription(companyId: string) {
    const { data, error } = await this.supabase
      .from("company_subscriptions")
      .select(`
        *,
        subscription_plans (*)
      `)
      .eq("company_id", companyId)
      .eq("status", "active")
      .single()

    if (error && error.code !== "PGRST116") throw error
    return data
  }

  async useConnect(companyId: string, studentId: string, actionType: string, internshipId?: string) {
    // Check if company has enough connects
    const subscription = await this.getCompanySubscription(companyId)
    if (!subscription || subscription.connects_remaining <= 0) {
      throw new Error("Insufficient connects")
    }

    // Record the usage
    const { error: usageError } = await this.supabase.from("connect_usage").insert({
      company_id: companyId,
      student_id: studentId,
      internship_id: internshipId,
      action_type: actionType,
    })

    if (usageError) throw usageError

    // Update remaining connects
    const { error: updateError } = await this.supabase
      .from("company_subscriptions")
      .update({
        connects_remaining: subscription.connects_remaining - 1,
        connects_used: subscription.connects_used + 1,
      })
      .eq("id", subscription.id)

    if (updateError) throw updateError

    return true
  }
}
