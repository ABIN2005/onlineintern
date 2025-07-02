import { requireCompanyAuth } from "@/lib/auth"
import { createClient } from "@/lib/supabase/server"
import { MainNav } from "@/components/navigation/main-nav"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Building2, Users, FileText, TrendingUp, Plus, Eye, CreditCard } from "lucide-react"
import Link from "next/link"

export default async function CompanyDashboard() {
  const user = await requireCompanyAuth()
  const supabase = createClient()

  // Get company data
  const { data: company } = await supabase.from("companies").select("*").eq("user_id", user.id).single()

  // Get company subscription
  const { data: subscription } = await supabase
    .from("company_subscriptions")
    .select(`
      *,
      subscription_plans (*)
    `)
    .eq("company_id", company?.id)
    .eq("status", "active")
    .single()

  // Get internships
  const { data: internships } = await supabase
    .from("internships")
    .select("*, applications(count)")
    .eq("company_id", company?.id)
    .order("created_at", { ascending: false })

  // Get recent applications
  const { data: recentApplications } = await supabase
    .from("applications")
    .select(`
      *,
      students (full_name, resume_score, skills),
      internships (title)
    `)
    .in("internship_id", internships?.map((i) => i.id) || [])
    .order("applied_at", { ascending: false })
    .limit(10)

  const stats = {
    totalInternships: internships?.length || 0,
    activeInternships: internships?.filter((i) => i.status === "approved").length || 0,
    totalApplications: recentApplications?.length || 0,
    connectsRemaining: subscription?.connects_remaining || 0,
  }

  return (
    <div className="min-h-screen bg-background">
      <MainNav user={user} />

      <div className="container mx-auto px-4 py-8">
        {/* Welcome Section */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Welcome, {company?.company_name}!</h1>
          <p className="text-muted-foreground">Manage your internships and find the best talent</p>
        </div>

        {/* Verification Alert */}
        {company?.verification_status === "pending" && (
          <Card className="mb-6 border-yellow-200 bg-yellow-50">
            <CardContent className="pt-6">
              <div className="flex items-center space-x-2">
                <Badge variant="secondary">Pending Verification</Badge>
                <span className="text-sm">
                  Your company is under review. You can post internships, but they won't be visible until verified.
                </span>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Stats Cards */}
        <div className="grid md:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Internships</CardTitle>
              <Building2 className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalInternships}</div>
              <p className="text-xs text-muted-foreground">{stats.activeInternships} active</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Applications</CardTitle>
              <FileText className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalApplications}</div>
              <p className="text-xs text-muted-foreground">Total received</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Connects Left</CardTitle>
              <CreditCard className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.connectsRemaining}</div>
              <p className="text-xs text-muted-foreground">{subscription?.subscription_plans?.name || "No plan"}</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Profile Views</CardTitle>
              <Eye className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">1,234</div>
              <p className="text-xs text-muted-foreground">This month</p>
            </CardContent>
          </Card>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Quick Actions */}
            <Card>
              <CardHeader>
                <CardTitle>Quick Actions</CardTitle>
                <CardDescription>Get started with common tasks</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid md:grid-cols-2 gap-4">
                  <Button className="h-20 flex-col space-y-2" asChild>
                    <Link href="/company/post-internship">
                      <Plus className="h-6 w-6" />
                      <span>Post New Internship</span>
                    </Link>
                  </Button>
                  <Button variant="outline" className="h-20 flex-col space-y-2 bg-transparent" asChild>
                    <Link href="/company/applications">
                      <Users className="h-6 w-6" />
                      <span>View Applications</span>
                    </Link>
                  </Button>
                  <Button variant="outline" className="h-20 flex-col space-y-2 bg-transparent" asChild>
                    <Link href="/company/subscription">
                      <CreditCard className="h-6 w-6" />
                      <span>Manage Subscription</span>
                    </Link>
                  </Button>
                  <Button variant="outline" className="h-20 flex-col space-y-2 bg-transparent" asChild>
                    <Link href="/company/analytics">
                      <TrendingUp className="h-6 w-6" />
                      <span>View Analytics</span>
                    </Link>
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Recent Internships */}
            <Card>
              <CardHeader>
                <CardTitle>Your Internships</CardTitle>
                <CardDescription>Manage your posted internships</CardDescription>
              </CardHeader>
              <CardContent>
                {internships && internships.length > 0 ? (
                  <div className="space-y-4">
                    {internships.slice(0, 5).map((internship) => (
                      <div key={internship.id} className="flex items-center justify-between p-4 border rounded-lg">
                        <div className="flex-1">
                          <h3 className="font-medium">{internship.title}</h3>
                          <div className="flex items-center space-x-4 mt-1 text-sm text-muted-foreground">
                            <span>{internship.location}</span>
                            <span>{internship.duration}</span>
                            <span>{internship.applications?.[0]?.count || 0} applications</span>
                          </div>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Badge
                            variant={
                              internship.status === "approved"
                                ? "default"
                                : internship.status === "pending"
                                  ? "secondary"
                                  : "destructive"
                            }
                          >
                            {internship.status}
                          </Badge>
                          <Button size="sm" variant="outline" asChild>
                            <Link href={`/company/internships/${internship.id}`}>Manage</Link>
                          </Button>
                        </div>
                      </div>
                    ))}
                    <Button variant="outline" className="w-full bg-transparent" asChild>
                      <Link href="/company/internships">View All Internships</Link>
                    </Button>
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <Building2 className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                    <h3 className="font-medium mb-2">No internships posted yet</h3>
                    <p className="text-sm text-muted-foreground mb-4">
                      Start by posting your first internship to attract talented students
                    </p>
                    <Button asChild>
                      <Link href="/company/post-internship">Post Your First Internship</Link>
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Subscription Status */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Subscription</CardTitle>
              </CardHeader>
              <CardContent>
                {subscription ? (
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <span className="font-medium">{subscription.subscription_plans?.name}</span>
                      <Badge>Active</Badge>
                    </div>
                    <div>
                      <div className="flex justify-between text-sm mb-1">
                        <span>Connects Used</span>
                        <span>
                          {subscription.connects_used}/{subscription.subscription_plans?.connects_monthly}
                        </span>
                      </div>
                      <Progress
                        value={(subscription.connects_used / subscription.subscription_plans?.connects_monthly) * 100}
                      />
                    </div>
                    <Button size="sm" variant="outline" className="w-full bg-transparent" asChild>
                      <Link href="/company/subscription">Manage Plan</Link>
                    </Button>
                  </div>
                ) : (
                  <div className="text-center">
                    <p className="text-sm text-muted-foreground mb-3">Subscribe to access candidate profiles</p>
                    <Button size="sm" asChild>
                      <Link href="/company/subscription">Choose Plan</Link>
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Recent Applications */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Recent Applications</CardTitle>
              </CardHeader>
              <CardContent>
                {recentApplications && recentApplications.length > 0 ? (
                  <div className="space-y-3">
                    {recentApplications.slice(0, 5).map((application) => (
                      <div key={application.id} className="flex items-center justify-between p-3 border rounded-lg">
                        <div className="flex-1 min-w-0">
                          <p className="font-medium text-sm truncate">{application.students?.full_name}</p>
                          <p className="text-xs text-muted-foreground">{application.internships?.title}</p>
                          <div className="flex items-center space-x-2 mt-1">
                            <Badge variant="outline" className="text-xs">
                              Score: {application.students?.resume_score}%
                            </Badge>
                          </div>
                        </div>
                        <Button size="sm" variant="outline" asChild>
                          <Link href={`/company/applications/${application.id}`}>View</Link>
                        </Button>
                      </div>
                    ))}
                    <Button variant="outline" size="sm" className="w-full bg-transparent" asChild>
                      <Link href="/company/applications">View All</Link>
                    </Button>
                  </div>
                ) : (
                  <div className="text-center py-6">
                    <Users className="h-8 w-8 mx-auto mb-2 text-muted-foreground" />
                    <p className="text-sm text-muted-foreground">No applications yet</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}
