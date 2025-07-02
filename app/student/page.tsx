import { requireStudentAuth } from "@/lib/auth"
import { createClient } from "@/lib/supabase/server"
import { MainNav } from "@/components/navigation/main-nav"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { BookOpen, FileText, TrendingUp, Users, Calendar, MapPin, Clock } from "lucide-react"
import Link from "next/link"

export default async function StudentDashboard() {
  const user = await requireStudentAuth()
  const supabase = createClient()

  // Get student data
  const { data: student } = await supabase.from("students").select("*").eq("user_id", user.id).single()

  // Get recent applications
  const { data: applications } = await supabase
    .from("applications")
    .select(`
      *,
      internships (
        title,
        companies (company_name, logo_url)
      )
    `)
    .eq("student_id", student?.id)
    .order("applied_at", { ascending: false })
    .limit(5)

  // Get recommended internships
  const { data: recommendations } = await supabase
    .from("internships")
    .select(`
      *,
      companies (company_name, logo_url, verification_status)
    `)
    .eq("status", "approved")
    .limit(6)

  const profileCompleteness = calculateProfileCompleteness(student)

  return (
    <div className="min-h-screen bg-background">
      <MainNav user={user} />

      <div className="container mx-auto px-4 py-8">
        {/* Welcome Section */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Welcome back, {student?.full_name || "Student"}!</h1>
          <p className="text-muted-foreground">Here's what's happening with your internship journey</p>
        </div>

        {/* Stats Cards */}
        <div className="grid md:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Applications</CardTitle>
              <FileText className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{applications?.length || 0}</div>
              <p className="text-xs text-muted-foreground">Total applications</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Resume Score</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{student?.resume_score || 0}%</div>
              <p className="text-xs text-muted-foreground">AI-powered analysis</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Profile</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{profileCompleteness}%</div>
              <p className="text-xs text-muted-foreground">Completeness</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">ATS Score</CardTitle>
              <BookOpen className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{student?.ats_score || 0}%</div>
              <p className="text-xs text-muted-foreground">Resume compatibility</p>
            </CardContent>
          </Card>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Profile Completion */}
            {profileCompleteness < 100 && (
              <Card>
                <CardHeader>
                  <CardTitle>Complete Your Profile</CardTitle>
                  <CardDescription>
                    A complete profile increases your chances of getting noticed by companies
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">Profile Completeness</span>
                    <span className="text-sm text-muted-foreground">{profileCompleteness}%</span>
                  </div>
                  <Progress value={profileCompleteness} />
                  <div className="flex space-x-2">
                    <Button size="sm" asChild>
                      <Link href="/student/profile">Complete Profile</Link>
                    </Button>
                    <Button size="sm" variant="outline" asChild>
                      <Link href="/resume-analyzer">Analyze Resume</Link>
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Recommended Internships */}
            <Card>
              <CardHeader>
                <CardTitle>Recommended for You</CardTitle>
                <CardDescription>Internships matching your skills and preferences</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {recommendations?.map((internship) => (
                    <div
                      key={internship.id}
                      className="flex items-start space-x-4 p-4 border rounded-lg hover:bg-muted/50 transition-colors"
                    >
                      <div className="h-12 w-12 bg-primary/10 rounded-lg flex items-center justify-center flex-shrink-0">
                        {internship.companies?.logo_url ? (
                          <img
                            src={internship.companies.logo_url || "/placeholder.svg"}
                            alt={internship.companies.company_name}
                            className="h-8 w-8 rounded"
                          />
                        ) : (
                          <span className="text-sm font-medium">{internship.companies?.company_name?.charAt(0)}</span>
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between">
                          <div>
                            <h3 className="font-medium truncate">{internship.title}</h3>
                            <p className="text-sm text-muted-foreground">{internship.companies?.company_name}</p>
                            <div className="flex items-center space-x-4 mt-2 text-xs text-muted-foreground">
                              <div className="flex items-center space-x-1">
                                <MapPin className="h-3 w-3" />
                                <span>{internship.location}</span>
                              </div>
                              <div className="flex items-center space-x-1">
                                <Clock className="h-3 w-3" />
                                <span>{internship.duration}</span>
                              </div>
                            </div>
                          </div>
                          <div className="flex items-center space-x-2">
                            {internship.companies?.verification_status === "verified" && (
                              <Badge variant="secondary" className="text-xs">
                                Verified
                              </Badge>
                            )}
                            <Button size="sm" asChild>
                              <Link href={`/internships/${internship.id}`}>View</Link>
                            </Button>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
                <div className="mt-4">
                  <Button variant="outline" className="w-full bg-transparent" asChild>
                    <Link href="/internships">View All Internships</Link>
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Recent Applications */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Recent Applications</CardTitle>
              </CardHeader>
              <CardContent>
                {applications && applications.length > 0 ? (
                  <div className="space-y-3">
                    {applications.map((application) => (
                      <div key={application.id} className="flex items-center justify-between p-3 border rounded-lg">
                        <div className="flex-1 min-w-0">
                          <p className="font-medium text-sm truncate">{application.internships?.title}</p>
                          <p className="text-xs text-muted-foreground">
                            {application.internships?.companies?.company_name}
                          </p>
                        </div>
                        <Badge
                          variant={
                            application.status === "selected"
                              ? "default"
                              : application.status === "rejected"
                                ? "destructive"
                                : "secondary"
                          }
                          className="text-xs"
                        >
                          {application.status}
                        </Badge>
                      </div>
                    ))}
                    <Button variant="outline" size="sm" className="w-full bg-transparent" asChild>
                      <Link href="/student/applications">View All</Link>
                    </Button>
                  </div>
                ) : (
                  <div className="text-center py-6">
                    <FileText className="h-8 w-8 mx-auto mb-2 text-muted-foreground" />
                    <p className="text-sm text-muted-foreground mb-3">No applications yet</p>
                    <Button size="sm" asChild>
                      <Link href="/internships">Browse Internships</Link>
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Quick Actions */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Quick Actions</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <Button variant="outline" className="w-full justify-start bg-transparent" asChild>
                  <Link href="/resume-analyzer">
                    <TrendingUp className="h-4 w-4 mr-2" />
                    Analyze Resume
                  </Link>
                </Button>
                <Button variant="outline" className="w-full justify-start bg-transparent" asChild>
                  <Link href="/student/profile">
                    <Users className="h-4 w-4 mr-2" />
                    Update Profile
                  </Link>
                </Button>
                <Button variant="outline" className="w-full justify-start bg-transparent" asChild>
                  <Link href="/internships">
                    <BookOpen className="h-4 w-4 mr-2" />
                    Browse Internships
                  </Link>
                </Button>
                <Button variant="outline" className="w-full justify-start bg-transparent" asChild>
                  <Link href="/student/applications">
                    <Calendar className="h-4 w-4 mr-2" />
                    My Applications
                  </Link>
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}

function calculateProfileCompleteness(student: any): number {
  if (!student) return 0

  let completeness = 0
  const fields = [
    student.full_name,
    student.phone,
    student.bio,
    student.location,
    student.resume_url,
    student.skills?.length > 0,
    student.education,
    student.experience,
  ]

  fields.forEach((field) => {
    if (field) completeness += 12.5
  })

  return Math.round(completeness)
}
