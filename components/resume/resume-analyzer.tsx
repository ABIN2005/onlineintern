"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Upload, FileText, CheckCircle, AlertCircle, TrendingUp, Target } from "lucide-react"

interface AnalysisResult {
  overall_score: number
  ats_score: number
  sections: {
    [key: string]: {
      score: number
      feedback: string
    }
  }
  strengths: string[]
  improvements: string[]
  ats_recommendations: string[]
  missing_keywords: string[]
  recommended_skills: string[]
}

export function ResumeAnalyzer({ studentId }: { studentId?: string }) {
  const [file, setFile] = useState<File | null>(null)
  const [analyzing, setAnalyzing] = useState(false)
  const [result, setResult] = useState<AnalysisResult | null>(null)
  const [error, setError] = useState("")

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = event.target.files?.[0]
    if (selectedFile) {
      if (selectedFile.type === "application/pdf" || selectedFile.type.includes("document")) {
        setFile(selectedFile)
        setError("")
      } else {
        setError("Please upload a PDF or Word document")
      }
    }
  }

  const analyzeResume = async () => {
    if (!file) return

    setAnalyzing(true)
    setError("")

    try {
      // In a real implementation, you would extract text from the PDF/Word file
      // For this demo, we'll simulate with placeholder text
      const resumeText = `
        John Doe
        Software Developer
        john.doe@email.com | +91-9876543210
        
        SUMMARY
        Passionate software developer with 2 years of experience in web development.
        
        EXPERIENCE
        Software Developer at Tech Corp (2022-2024)
        - Developed web applications using React and Node.js
        - Collaborated with cross-functional teams
        
        EDUCATION
        B.Tech in Computer Science, ABC University (2018-2022)
        
        SKILLS
        JavaScript, React, Node.js, Python, SQL
      `

      const response = await fetch("/api/resume/analyze", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          resumeText,
          studentId,
        }),
      })

      if (!response.ok) {
        throw new Error("Failed to analyze resume")
      }

      const analysisResult = await response.json()
      setResult(analysisResult)
    } catch (error) {
      setError("Failed to analyze resume. Please try again.")
    } finally {
      setAnalyzing(false)
    }
  }

  const getScoreColor = (score: number) => {
    if (score >= 80) return "text-green-600"
    if (score >= 60) return "text-yellow-600"
    return "text-red-600"
  }

  const getScoreBadgeVariant = (score: number) => {
    if (score >= 80) return "default"
    if (score >= 60) return "secondary"
    return "destructive"
  }

  return (
    <div className="space-y-6">
      {/* Upload Section */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Upload className="h-5 w-5" />
            <span>Upload Your Resume</span>
          </CardTitle>
          <CardDescription>Upload your resume in PDF or Word format to get instant AI-powered feedback</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="border-2 border-dashed border-muted-foreground/25 rounded-lg p-6 text-center">
            <input
              type="file"
              accept=".pdf,.doc,.docx"
              onChange={handleFileUpload}
              className="hidden"
              id="resume-upload"
            />
            <label htmlFor="resume-upload" className="cursor-pointer">
              <FileText className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
              <p className="text-sm text-muted-foreground mb-2">Click to upload or drag and drop your resume</p>
              <p className="text-xs text-muted-foreground">PDF, DOC, DOCX up to 10MB</p>
            </label>
          </div>

          {file && (
            <div className="flex items-center justify-between p-3 bg-muted rounded-lg">
              <div className="flex items-center space-x-2">
                <FileText className="h-4 w-4" />
                <span className="text-sm font-medium">{file.name}</span>
              </div>
              <Button onClick={analyzeResume} disabled={analyzing}>
                {analyzing ? "Analyzing..." : "Analyze Resume"}
              </Button>
            </div>
          )}

          {error && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}
        </CardContent>
      </Card>

      {/* Results Section */}
      {result && (
        <div className="space-y-6">
          {/* Overall Scores */}
          <div className="grid md:grid-cols-2 gap-4">
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-lg">Overall Score</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center space-x-4">
                  <div className={`text-3xl font-bold ${getScoreColor(result.overall_score)}`}>
                    {result.overall_score}%
                  </div>
                  <div className="flex-1">
                    <Progress value={result.overall_score} className="h-2" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-lg">ATS Compatibility</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center space-x-4">
                  <div className={`text-3xl font-bold ${getScoreColor(result.ats_score)}`}>{result.ats_score}%</div>
                  <div className="flex-1">
                    <Progress value={result.ats_score} className="h-2" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Detailed Analysis */}
          <Card>
            <CardHeader>
              <CardTitle>Detailed Analysis</CardTitle>
            </CardHeader>
            <CardContent>
              <Tabs defaultValue="sections" className="w-full">
                <TabsList className="grid w-full grid-cols-4">
                  <TabsTrigger value="sections">Sections</TabsTrigger>
                  <TabsTrigger value="strengths">Strengths</TabsTrigger>
                  <TabsTrigger value="improvements">Improvements</TabsTrigger>
                  <TabsTrigger value="keywords">Keywords</TabsTrigger>
                </TabsList>

                <TabsContent value="sections" className="space-y-4">
                  {Object.entries(result.sections).map(([section, data]) => (
                    <div key={section} className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="flex-1">
                        <div className="flex items-center space-x-2 mb-1">
                          <h4 className="font-medium capitalize">{section.replace("_", " ")}</h4>
                          <Badge variant={getScoreBadgeVariant(data.score)}>{data.score}%</Badge>
                        </div>
                        <p className="text-sm text-muted-foreground">{data.feedback}</p>
                      </div>
                      <Progress value={data.score} className="w-20 h-2" />
                    </div>
                  ))}
                </TabsContent>

                <TabsContent value="strengths" className="space-y-2">
                  {result.strengths.map((strength, index) => (
                    <div key={index} className="flex items-center space-x-2 p-3 bg-green-50 rounded-lg">
                      <CheckCircle className="h-4 w-4 text-green-600" />
                      <span className="text-sm">{strength}</span>
                    </div>
                  ))}
                </TabsContent>

                <TabsContent value="improvements" className="space-y-2">
                  {result.improvements.map((improvement, index) => (
                    <div key={index} className="flex items-center space-x-2 p-3 bg-yellow-50 rounded-lg">
                      <TrendingUp className="h-4 w-4 text-yellow-600" />
                      <span className="text-sm">{improvement}</span>
                    </div>
                  ))}
                </TabsContent>

                <TabsContent value="keywords" className="space-y-4">
                  <div>
                    <h4 className="font-medium mb-2 flex items-center space-x-2">
                      <Target className="h-4 w-4" />
                      <span>Missing Keywords</span>
                    </h4>
                    <div className="flex flex-wrap gap-2">
                      {result.missing_keywords.map((keyword, index) => (
                        <Badge key={index} variant="outline">
                          {keyword}
                        </Badge>
                      ))}
                    </div>
                  </div>
                  <div>
                    <h4 className="font-medium mb-2">Recommended Skills</h4>
                    <div className="flex flex-wrap gap-2">
                      {result.recommended_skills.map((skill, index) => (
                        <Badge key={index} variant="secondary">
                          {skill}
                        </Badge>
                      ))}
                    </div>
                  </div>
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  )
}
