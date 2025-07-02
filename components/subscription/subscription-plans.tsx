"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Switch } from "@/components/ui/switch"
import { Check, Star } from "lucide-react"
import { SUBSCRIPTION_PLANS } from "@/lib/stripe"

interface SubscriptionPlansProps {
  currentPlan?: string
  onSelectPlan: (planId: string, billingCycle: "monthly" | "yearly") => void
}

export function SubscriptionPlans({ currentPlan, onSelectPlan }: SubscriptionPlansProps) {
  const [billingCycle, setBillingCycle] = useState<"monthly" | "yearly">("monthly")
  const [loading, setLoading] = useState<string | null>(null)

  const handleSelectPlan = async (planKey: string) => {
    setLoading(planKey)
    try {
      await onSelectPlan(planKey, billingCycle)
    } finally {
      setLoading(null)
    }
  }

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      minimumFractionDigits: 0,
    }).format(price)
  }

  return (
    <div className="space-y-8">
      {/* Billing Toggle */}
      <div className="flex items-center justify-center space-x-4">
        <span className={billingCycle === "monthly" ? "font-medium" : "text-muted-foreground"}>Monthly</span>
        <Switch
          checked={billingCycle === "yearly"}
          onCheckedChange={(checked) => setBillingCycle(checked ? "yearly" : "monthly")}
        />
        <span className={billingCycle === "yearly" ? "font-medium" : "text-muted-foreground"}>Yearly</span>
        {billingCycle === "yearly" && (
          <Badge variant="secondary" className="ml-2">
            Save 17%
          </Badge>
        )}
      </div>

      {/* Plans Grid */}
      <div className="grid md:grid-cols-3 gap-6">
        {Object.entries(SUBSCRIPTION_PLANS).map(([key, plan]) => {
          const price = billingCycle === "yearly" ? plan.priceYearly : plan.priceMonthly
          const monthlyPrice = billingCycle === "yearly" ? plan.priceYearly / 12 : plan.priceMonthly
          const isPopular = key === "PROFESSIONAL"
          const isCurrent = currentPlan === key

          return (
            <Card key={key} className={`relative ${isPopular ? "border-primary shadow-lg" : ""}`}>
              {isPopular && (
                <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                  <Badge className="bg-primary text-primary-foreground">
                    <Star className="w-3 h-3 mr-1" />
                    Most Popular
                  </Badge>
                </div>
              )}

              <CardHeader className="text-center">
                <CardTitle className="text-xl">{plan.name}</CardTitle>
                <CardDescription>
                  <div className="mt-4">
                    <span className="text-3xl font-bold">{formatPrice(monthlyPrice)}</span>
                    <span className="text-muted-foreground">/month</span>
                  </div>
                  {billingCycle === "yearly" && (
                    <div className="text-sm text-muted-foreground mt-1">Billed annually ({formatPrice(price)})</div>
                  )}
                </CardDescription>
              </CardHeader>

              <CardContent className="space-y-4">
                <div className="text-center">
                  <div className="text-2xl font-bold text-primary">{plan.connects}</div>
                  <div className="text-sm text-muted-foreground">Connects per month</div>
                </div>

                <ul className="space-y-2">
                  {plan.features.map((feature, index) => (
                    <li key={index} className="flex items-center space-x-2">
                      <Check className="w-4 h-4 text-green-500 flex-shrink-0" />
                      <span className="text-sm">{feature}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>

              <CardFooter>
                <Button
                  className="w-full"
                  variant={isCurrent ? "outline" : isPopular ? "default" : "outline"}
                  disabled={isCurrent || loading === key}
                  onClick={() => handleSelectPlan(key)}
                >
                  {loading === key ? "Processing..." : isCurrent ? "Current Plan" : "Choose Plan"}
                </Button>
              </CardFooter>
            </Card>
          )
        })}
      </div>
    </div>
  )
}
