import Stripe from "stripe"

if (!process.env.STRIPE_SECRET_KEY) {
  throw new Error("STRIPE_SECRET_KEY is not set")
}

export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
  apiVersion: "2024-06-20",
  typescript: true,
})

export const STRIPE_CONFIG = {
  publishableKey: process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!,
  webhookSecret: process.env.STRIPE_WEBHOOK_SECRET!,
}

// Subscription plan configurations
export const SUBSCRIPTION_PLANS = {
  STARTER: {
    name: "Starter",
    priceMonthly: 999,
    priceYearly: 9990,
    connects: 50,
    features: ["50 Profile Views", "25 Resume Downloads", "Basic Analytics", "Email Support"],
  },
  PROFESSIONAL: {
    name: "Professional",
    priceMonthly: 2499,
    priceYearly: 24990,
    connects: 150,
    features: [
      "150 Profile Views",
      "100 Resume Downloads",
      "Advanced Analytics",
      "Priority Support",
      "3 Featured Job Posts",
    ],
  },
  ENTERPRISE: {
    name: "Enterprise",
    priceMonthly: 4999,
    priceYearly: 49990,
    connects: 500,
    features: [
      "500 Profile Views",
      "300 Resume Downloads",
      "Premium Analytics",
      "Dedicated Account Manager",
      "10 Featured Job Posts",
      "API Access",
    ],
  },
}
