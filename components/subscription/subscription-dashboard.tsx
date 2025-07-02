"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Calendar, CreditCard, Users, TrendingUp } from "lucide-react"

interface SubscriptionData {
  plan: {
    name: string
    connects_monthly: number
  }
  connects_remaining: number
  connects_used: number
  current_period_end: string
  status: string
}

interface SubscriptionDashboardProps {
  subscription: SubscriptionData
}

export function SubscriptionDashboard({ subscription }: SubscriptionDashboardProps) {
  const [usage, setUsage] = useState<any[]>([])

  const connectsUsagePercentage = (subscription.connects_used / subscription.plan.connects_monthly) * 100
  const daysUntilRenewal = Math.ceil(
    (new Date(subscription.current_period_end).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24),
  )

  return (
    <div className="space-y-6">
      {/* Overview Cards */}
      <div className="grid md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Current Plan</CardTitle>
            <CreditCard className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{subscription.plan.name}</div>
            <Badge variant={subscription.status === "active" ? "default" : "secondary"}>{subscription.status}</Badge>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Connects Remaining</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{subscription.connects_remaining}</div>
            <p className="text-xs text-muted-foreground">of {subscription.plan.connects_monthly} total</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Usage This Month</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{subscription.connects_used}</div>
            <Progress value={connectsUsagePercentage} className="mt-2" />
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Renewal Date</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{daysUntilRenewal}</div>
            <p className="text-xs text-muted-foreground">days remaining</p>
          </CardContent>
        </Card>
      </div>

      {/* Usage Details */}
      <Card>
        <CardHeader>
          <CardTitle>Connect Usage</CardTitle>
          <CardDescription>Track how you're using your monthly connects</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <span>Profile Views</span>
              <Badge variant="outline">25 connects used</Badge>
            </div>
            <div className="flex justify-between items-center">
              <span>Resume Downloads</span>
              <Badge variant="outline">15 connects used</Badge>
            </div>
            <div className="flex justify-between items-center">
              <span>Contact Information</span>
              <Badge variant="outline">10 connects used</Badge>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Actions */}
      <div className="flex space-x-4">
        <Button variant="outline">Upgrade Plan</Button>
        <Button variant="outline">View Billing History</Button>
        <Button variant="outline">Manage Payment Methods</Button>
      </div>
    </div>
  )
}
