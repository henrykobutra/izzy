"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import Link from "next/link";
import {
  BarChart4,
  Calendar,
  CheckCircle,
  XCircle,
  TrendingUp,
  Lightbulb,
  Loader2,
  AlertCircle,
  ChevronDown,
  ChevronUp,
  PlusCircle,
  ListTodo,
} from "lucide-react";

import { useAuth } from "@/lib/hooks/useAuth";
import { NavBar } from "@/components/ui/nav-bar";
import { Footer } from "@/components/ui/footer";
import { Button } from "@/components/ui/button";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";

// Type definition for individual answer evaluation
interface AnswerEvaluation {
  id: string;
  text: string;
  type: string;
  score: number;
  answer: string;
  feedback: string;
  strengths?: string[];
  areas_for_improvement?: string[];
  suggested_response?: string;
}

// Interface for interview result
interface InterviewResult {
  sessionId: string;
  title: string;
  company?: string;
  position?: string;
  date: string;
  overallScore: number;
  scoreBreakdown: {
    technical: number;
    communication: number;
    problemSolving: number;
    cultureFit: number;
  };
  strengths: string[];
  weaknesses: string[];
  recommendations: string[];
  summary: string;
  questions: AnswerEvaluation[];
}

export default function InterviewResultsPage() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const params = useParams();
  const sessionId = params.id as string;

  const [result, setResult] = useState<InterviewResult | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [expandedQuestions, setExpandedQuestions] = useState<
    Record<string, boolean>
  >({});

  useEffect(() => {
    // If not authenticated, redirect to sign-in
    if (!authLoading && !user) {
      router.push("/sign-in");
      return;
    }

    async function loadInterviewResults() {
      if (!sessionId || !user) return;

      try {
        setLoading(true);

        // Load interview results using server action
        const { getInterviewResults } = await import(
          "@/lib/actions/interview-handler"
        );
        const response = await getInterviewResults(sessionId);

        if (response.success && response.data) {
          setResult(response.data);

          // Initialize expanded state for questions (first one expanded, rest collapsed)
          if (response.data.questions && response.data.questions.length > 0) {
            const initialExpandedState: Record<string, boolean> = {};
            response.data.questions.forEach((question, index) => {
              initialExpandedState[question.id] = index === 0;
            });
            setExpandedQuestions(initialExpandedState);
          }
        } else {
          setError(response.error || "Failed to load interview results");
        }
      } catch (err) {
        console.error("Error loading interview results:", err);
        setError(err instanceof Error ? err.message : "An error occurred");
      } finally {
        setLoading(false);
      }
    }

    loadInterviewResults();
  }, [sessionId, user, authLoading, router]);

  // Toggle question expanded state
  const toggleQuestion = (questionId: string) => {
    setExpandedQuestions((prev) => ({
      ...prev,
      [questionId]: !prev[questionId],
    }));
  };

  // Display loading state
  if (authLoading || loading) {
    return (
      <div className="flex min-h-screen flex-col">
        <NavBar activePath="/interviews" />

        <main className="flex-1 flex items-center justify-center py-12">
          <div className="flex flex-col items-center gap-4">
            <Loader2 className="h-12 w-12 animate-spin text-primary" />
            <p className="text-lg font-medium">Loading your results...</p>
          </div>
        </main>

        <Footer />
      </div>
    );
  }

  // Display error state
  if (error) {
    return (
      <div className="flex min-h-screen flex-col">
        <NavBar activePath="/interviews" />

        <main className="flex-1 container max-w-screen-xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex flex-col items-center gap-4">
            <AlertCircle className="h-12 w-12 text-red-500" />
            <h1 className="text-xl font-medium">Error Loading Results</h1>
            <p className="text-muted-foreground">{error}</p>
            <Button
              onClick={() => router.push("/interviews")}
              variant="outline"
            >
              Return to Interviews
            </Button>
          </div>
        </main>

        <Footer />
      </div>
    );
  }

  // If no result available
  if (!result) {
    return (
      <div className="flex min-h-screen flex-col">
        <NavBar activePath="/interviews" />

        <main className="flex-1 container max-w-screen-xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex flex-col items-center gap-4">
            <AlertCircle className="h-12 w-12 text-amber-500" />
            <h1 className="text-xl font-medium">No Results Available</h1>
            <p className="text-muted-foreground">
              No interview results found for this session.
            </p>
            <Button
              onClick={() => router.push("/interviews")}
              variant="outline"
            >
              Return to Interviews
            </Button>
          </div>
        </main>

        <Footer />
      </div>
    );
  }

  // Calculate performance level
  const getPerformanceLevel = (score: number) => {
    if (score >= 9) return "Exceptional";
    if (score >= 8) return "Excellent";
    if (score >= 7) return "Very Good";
    if (score >= 6) return "Good";
    if (score >= 5) return "Satisfactory";
    if (score >= 4) return "Fair";
    return "Needs Improvement";
  };

  // Get color based on score (now on 1-10 scale)
  const getScoreColor = (score: number) => {
    if (score >= 8) return "text-green-600 dark:text-green-400";
    if (score >= 6) return "text-amber-600 dark:text-amber-400";
    return "text-red-600 dark:text-red-400";
  };

  return (
    <div className="flex min-h-screen flex-col">
      <NavBar activePath="/interviews" />

      <main className="flex-1 container max-w-screen-xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="space-y-6">
          {/* Header with navigation */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="space-y-1">
              <h1 className="text-3xl font-bold tracking-tight">
                Interview Results
              </h1>
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <h2 className="text-xl font-medium">
                    {result.position || "Interview"}
                  </h2>
                  {result.company && (
                    <span className="px-2 py-0.5 bg-primary/10 text-primary rounded-full text-xs font-medium">
                      {result.company}
                    </span>
                  )}
                </div>
                <p className="text-muted-foreground">{result.date}</p>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                className="gap-2 transition-colors hover:bg-primary/5"
                asChild
              >
                <Link href="/history">
                  <ListTodo className="h-4 w-4 text-primary" />
                  <span>All interviews</span>
                </Link>
              </Button>
              <Button
                variant="outline"
                size="sm"
                className="gap-2 transition-colors hover:bg-primary/5"
                asChild
              >
                <Link href="/interviews">
                  <PlusCircle className="h-4 w-4 text-primary" />
                  <span>New practice interview</span>
                </Link>
              </Button>
              <Button size="sm" className="gap-1" asChild>
                <Link href={`/interviews/session/${sessionId}`}>
                  <Calendar className="h-4 w-4" />
                  <span>Practice Again</span>
                </Link>
              </Button>
            </div>
          </div>

          {/* Overall performance card */}
          <Card className="overflow-hidden">
            <div className="relative">
              {/* Top status bar colored based on score */}
              <div className="absolute top-0 left-0 right-0 h-1">
                <div
                  className={`h-full ${
                    result.overallScore >= 8
                      ? "bg-green-500"
                      : result.overallScore >= 6
                      ? "bg-amber-500"
                      : "bg-red-500"
                  }`}
                ></div>
              </div>

              <div className="pt-5 p-6">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div>
                    <h2 className="text-2xl font-bold">
                      {getPerformanceLevel(result.overallScore)}
                    </h2>
                    <p className="text-muted-foreground">
                      Overall Performance Assessment
                    </p>
                  </div>

                  <div className="flex items-center gap-3">
                    <div
                      className={`text-4xl font-bold ${getScoreColor(
                        result.overallScore
                      )}`}
                    >
                      {result.overallScore.toFixed(1)}
                    </div>
                    <div className="text-xl text-muted-foreground">/10.0</div>
                  </div>
                </div>

                {/* Session summary from evaluator */}
                <div className="mt-4 pt-4 border-t">
                  <h3 className="text-sm font-medium mb-2">
                    Overall Evaluation
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    {result.summary}
                  </p>
                </div>
              </div>
            </div>
          </Card>

          {/* Score breakdown */}
          <Card>
            <CardHeader>
              <CardTitle>
                <div className="flex items-center gap-2">
                  <BarChart4 className="h-5 w-5 text-primary" />
                  Score Breakdown
                </div>
              </CardTitle>
              <CardDescription>
                Performance across different assessment areas
              </CardDescription>
            </CardHeader>
            <CardContent className="pb-2">
              <div className="space-y-4">
                {/* Technical Skills */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <p className="text-sm font-medium">Technical Skills</p>
                    <p className="text-sm font-medium">
                      {result.scoreBreakdown.technical.toFixed(1)}/10
                    </p>
                  </div>
                  <div className="h-2 rounded-full bg-muted">
                    <div
                      className={`h-full rounded-full ${
                        result.scoreBreakdown.technical >= 8
                          ? "bg-green-500"
                          : result.scoreBreakdown.technical >= 6
                          ? "bg-amber-500"
                          : "bg-red-500"
                      }`}
                      style={{
                        width: `${result.scoreBreakdown.technical * 10}%`,
                      }}
                    ></div>
                  </div>
                </div>

                {/* Communication */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <p className="text-sm font-medium">Communication</p>
                    <p className="text-sm font-medium">
                      {result.scoreBreakdown.communication.toFixed(1)}/10
                    </p>
                  </div>
                  <div className="h-2 rounded-full bg-muted">
                    <div
                      className={`h-full rounded-full ${
                        result.scoreBreakdown.communication >= 8
                          ? "bg-green-500"
                          : result.scoreBreakdown.communication >= 6
                          ? "bg-amber-500"
                          : "bg-red-500"
                      }`}
                      style={{
                        width: `${result.scoreBreakdown.communication * 10}%`,
                      }}
                    ></div>
                  </div>
                </div>

                {/* Problem Solving */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <p className="text-sm font-medium">Problem Solving</p>
                    <p className="text-sm font-medium">
                      {result.scoreBreakdown.problemSolving.toFixed(1)}/10
                    </p>
                  </div>
                  <div className="h-2 rounded-full bg-muted">
                    <div
                      className={`h-full rounded-full ${
                        result.scoreBreakdown.problemSolving >= 8
                          ? "bg-green-500"
                          : result.scoreBreakdown.problemSolving >= 6
                          ? "bg-amber-500"
                          : "bg-red-500"
                      }`}
                      style={{
                        width: `${result.scoreBreakdown.problemSolving * 10}%`,
                      }}
                    ></div>
                  </div>
                </div>

                {/* Cultural Fit */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <p className="text-sm font-medium">Cultural Fit</p>
                    <p className="text-sm font-medium">
                      {result.scoreBreakdown.cultureFit.toFixed(1)}/10
                    </p>
                  </div>
                  <div className="h-2 rounded-full bg-muted">
                    <div
                      className={`h-full rounded-full ${
                        result.scoreBreakdown.cultureFit >= 8
                          ? "bg-green-500"
                          : result.scoreBreakdown.cultureFit >= 6
                          ? "bg-amber-500"
                          : "bg-red-500"
                      }`}
                      style={{
                        width: `${result.scoreBreakdown.cultureFit * 10}%`,
                      }}
                    ></div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Analysis row with 3 columns */}
          <div className="py-2">
            <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-primary" />
              Interview Analysis
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Strengths card */}
              <Card className="overflow-hidden border-l-4 border-l-green-500">
                <CardHeader className="pb-2">
                  <CardTitle className="text-base flex items-center gap-1.5">
                    <CheckCircle className="h-4 w-4 text-green-500" />
                    Strengths
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ScrollArea className="h-[180px]">
                    <ul className="space-y-2 pr-4">
                      {result.strengths.map((strength, idx) => (
                        <li key={idx} className="text-sm pl-5 relative">
                          <span className="absolute left-0 top-1.5 w-1.5 h-1.5 rounded-full bg-green-500"></span>
                          {strength}
                        </li>
                      ))}
                    </ul>
                  </ScrollArea>
                </CardContent>
              </Card>

              {/* Areas to improve card */}
              <Card className="overflow-hidden border-l-4 border-l-amber-500">
                <CardHeader className="pb-2">
                  <CardTitle className="text-base flex items-center gap-1.5">
                    <XCircle className="h-4 w-4 text-amber-500" />
                    Areas to Improve
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ScrollArea className="h-[180px]">
                    <ul className="space-y-2 pr-4">
                      {result.weaknesses.map((weakness, idx) => (
                        <li key={idx} className="text-sm pl-5 relative">
                          <span className="absolute left-0 top-1.5 w-1.5 h-1.5 rounded-full bg-amber-500"></span>
                          {weakness}
                        </li>
                      ))}
                    </ul>
                  </ScrollArea>
                </CardContent>
              </Card>

              {/* Recommendations card */}
              <Card className="overflow-hidden border-l-4 border-l-blue-500">
                <CardHeader className="pb-2">
                  <CardTitle className="text-base flex items-center gap-1.5">
                    <Lightbulb className="h-4 w-4 text-blue-500" />
                    Recommendations
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ScrollArea className="h-[180px]">
                    <ul className="text-sm space-y-2.5 pr-4">
                      {result.recommendations.map((rec, idx) => (
                        <li key={idx} className="flex items-start gap-2">
                          <div className="min-w-4 pt-0.5 text-blue-500">•</div>
                          <div>{rec}</div>
                        </li>
                      ))}
                    </ul>
                  </ScrollArea>
                </CardContent>
              </Card>
            </div>
          </div>

          {/* Questions and answers - now collapsible */}
          <Card>
            <CardHeader>
              <CardTitle>Questions & Answers</CardTitle>
              <CardDescription>
                Your responses with feedback (click to expand)
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {result.questions.map((question, idx) => (
                  <Collapsible
                    key={question.id}
                    open={expandedQuestions[question.id]}
                    onOpenChange={() => toggleQuestion(question.id)}
                    className="border rounded-lg p-3"
                  >
                    <div className="flex justify-between items-center">
                      <div className="flex items-center gap-3">
                        <span className="inline-flex items-center justify-center h-6 w-6 text-xs font-medium rounded-full bg-primary/10 text-primary">
                          {idx + 1}
                        </span>
                        <div className="flex flex-col gap-1">
                          <span className="text-sm font-medium">
                            {question.text}
                          </span>
                          <span
                            className={`text-xs font-medium ${getScoreColor(
                              question.score
                            )}`}
                          >
                            Score: {question.score.toFixed(1)}/10
                          </span>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-primary/10 text-primary capitalize">
                          {question.type}
                        </span>
                        <CollapsibleTrigger asChild>
                          <Button variant="ghost" size="sm" className="w-9 p-0">
                            {expandedQuestions[question.id] ? (
                              <ChevronUp className="h-4 w-4" />
                            ) : (
                              <ChevronDown className="h-4 w-4" />
                            )}
                          </Button>
                        </CollapsibleTrigger>
                      </div>
                    </div>

                    <CollapsibleContent className="mt-3 space-y-3">
                      <div>
                        <h4 className="text-xs uppercase tracking-wider text-muted-foreground mb-1">
                          Question Details
                        </h4>
                        <p className="text-sm">{question.text}</p>
                      </div>

                      <div className="p-3 border rounded-md bg-muted/10">
                        <h4 className="text-xs uppercase tracking-wider text-muted-foreground mb-1">
                          Your Answer
                        </h4>
                        <p className="text-sm">{question.answer}</p>
                      </div>

                      <div className="p-3 border-l-2 border-primary/40 bg-primary/5 rounded-sm">
                        <h4 className="text-xs uppercase tracking-wider text-primary mb-1">
                          Feedback
                        </h4>
                        <p className="text-sm text-muted-foreground">
                          {question.feedback}
                        </p>
                      </div>

                      {/* New: Key strengths in answer */}
                      {question.strengths && question.strengths.length > 0 && (
                        <div>
                          <h4 className="text-xs uppercase tracking-wider text-green-600 mb-1">
                            Strengths
                          </h4>
                          <ul className="text-sm space-y-1">
                            {question.strengths.map((strength, i) => (
                              <li key={i} className="flex items-start gap-2">
                                <CheckCircle className="h-3.5 w-3.5 text-green-500 mt-0.5" />
                                <span>{strength}</span>
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}

                      {/* New: Areas for improvement */}
                      {question.areas_for_improvement &&
                        question.areas_for_improvement.length > 0 && (
                          <div>
                            <h4 className="text-xs uppercase tracking-wider text-amber-600 mb-1">
                              Areas for Improvement
                            </h4>
                            <ul className="text-sm space-y-1">
                              {question.areas_for_improvement.map((area, i) => (
                                <li key={i} className="flex items-start gap-2">
                                  <XCircle className="h-3.5 w-3.5 text-amber-500 mt-0.5" />
                                  <span>{area}</span>
                                </li>
                              ))}
                            </ul>
                          </div>
                        )}

                      {/* New: Suggested response */}
                      {question.suggested_response && (
                        <div className="p-3 border rounded-md bg-green-50 dark:bg-green-950/20">
                          <h4 className="text-xs uppercase tracking-wider text-green-600 mb-1">
                            Suggested Response
                          </h4>
                          <p className="text-sm">
                            {question.suggested_response}
                          </p>
                        </div>
                      )}
                    </CollapsibleContent>
                  </Collapsible>
                ))}
              </div>
            </CardContent>
            {/* CardFooter removed */}
          </Card>
        </div>
      </main>

      <Footer />
    </div>
  );
}
