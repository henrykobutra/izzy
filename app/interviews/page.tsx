"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  FileText,
  ArrowRight,
  AlertTriangle,
  Bot,
  Calendar,
  BrainCircuit,
  FileSearch,
  BarChart,
} from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";

// Components
import { NavBar } from "@/components/ui/nav-bar";
import { Footer } from "@/components/ui/footer";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { HistoryItem } from "@/components/interviews/history-item";
import { ResumeSummary } from "@/components/interviews/resume-summary";
import { MultiStepLoader } from "@/components/ui/multi-step-loader";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

// Hooks
import { useAuth } from "@/lib/hooks/useAuth";
import { useResumeCheck } from "@/lib/hooks/useResumeCheck";
import { useInterviewSessions } from "@/lib/hooks/useInterviewSessions";
import { deleteInterviewClient } from "@/lib/actions/interview-client";

// Types are imported in the components

export default function InterviewsPage() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();

  // Custom hooks
  const {
    resumeUploaded,
    resumeData,
    resumeError,
    loading: resumeLoading,
  } = useResumeCheck();
  const { interviewSessions, setInterviewSessions } = useInterviewSessions();

  // Local state
  const [jobDescription, setJobDescription] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);

  // Loading states for multi-step loader
  const processingSteps = [
    { 
      text: "Skimming through your resume like a recruiter with coffee...",
      icon: <FileSearch className="h-6 w-6 text-primary" />,
    },
    { 
      text: "Figuring out what skills you actually have vs what you claim...",
      icon: <FileSearch className="h-6 w-6 text-primary" />,
    },
    { 
      text: "Checking if your experience is as impressive as it sounds...",
      icon: <FileSearch className="h-6 w-6 text-primary" />,
    },
    { 
      text: "Decoding corporate speak in the job description...",
      icon: <FileText className="h-6 w-6 text-primary" />,
    },
    { 
      text: "Translating 'team player' into actual requirements...",
      icon: <FileText className="h-6 w-6 text-primary" />,
    },
    { 
      text: "Checking if 'competitive salary' means anything...",
      icon: <FileText className="h-6 w-6 text-primary" />,
    },
    { 
      text: "Matching your skills to job requirements (fingers crossed)...",
      icon: <BrainCircuit className="h-6 w-6 text-primary" />,
    },
    { 
      text: "Calculating your chance of getting past the ATS...",
      icon: <BrainCircuit className="h-6 w-6 text-primary" />,
    },
    { 
      text: "Determining if you're actually qualified or just confident...",
      icon: <BrainCircuit className="h-6 w-6 text-primary" />,
    },
    { 
      text: "Training AI to ask questions just like that awkward interviewer...",
      icon: <Bot className="h-6 w-6 text-primary" />,
    },
    { 
      text: "Preparing for the inevitable 'tell me about yourself' question...",
      icon: <Bot className="h-6 w-6 text-primary" />,
    },
    { 
      text: "Crafting questions that will make you think on your feet...",
      icon: <Bot className="h-6 w-6 text-primary" />,
    },
    { 
      text: "Creating backup questions for when you say 'good question'...",
      icon: <Bot className="h-6 w-6 text-primary" />,
    },
    { 
      text: "Teaching AI to nod thoughtfully while you answer...",
      icon: <Bot className="h-6 w-6 text-primary" />,
    },
    { 
      text: "Preparing follow-up questions to keep you on your toes...",
      icon: <BarChart className="h-6 w-6 text-primary" />,
    },
    { 
      text: "Almost ready! Just need to perfect that poker face...",
      icon: <BarChart className="h-6 w-6 text-primary" />,
    },
    { 
      text: "Finalizing your personalized interview experience...",
      icon: <BarChart className="h-6 w-6 text-primary" />,
    },
  ];

  // Check if user is authenticated
  useEffect(() => {
    if (!authLoading && !user) {
      router.push("/sign-in");
    }
  }, [user, authLoading, router]);

  // Handle job description submission and create new interview
  const handleJobSubmit = async () => {
    if (!jobDescription.trim()) return;

    try {
      setIsProcessing(true);

      // Process job description
      const { processJobDescription } = await import(
        "@/lib/actions/process-job-description"
      );
      const result = await processJobDescription(jobDescription);

      if (result.success && result.data?.sessionId) {
        // Navigate to strategy page
        router.push(`/interviews/strategy/${result.data.sessionId}`);
      } else {
        console.error("Failed to process job description:", result.error);
        alert(`Error: ${result.error || "Failed to process job description"}`);
      }
    } catch (error) {
      console.error("Error submitting job description:", error);
      alert("Failed to process job description. Please try again.");
    } finally {
      setIsProcessing(false);
    }
  };

  // Handle interview deletion
  const handleDeleteInterview = async (sessionId: string) => {
    const session = interviewSessions.find((s) => s.id === sessionId);
    if (!session?.jobPostingId) {
      console.error("Job posting ID not found");
      return;
    }

    try {
      const result = await deleteInterviewClient(session.jobPostingId);
      if (result.success) {
        // Update local state to reflect deletion
        setInterviewSessions((prevSessions) =>
          prevSessions.filter((s) => s.id !== sessionId)
        );
      } else {
        console.error("Failed to delete interview:", result.error);
        alert("Failed to delete interview. Please try again.");
      }
    } catch (error) {
      console.error("Error deleting interview:", error);
      alert("An error occurred while deleting the interview.");
    }
  };

  // Display loading state
  if (authLoading || resumeLoading) {
    return (
      <div className="flex min-h-screen flex-col">
        <NavBar activePath="/interviews" />

        <main className="flex-1 container max-w-screen-xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex flex-col gap-8">
            {/* Page header skeleton */}
            <div className="flex flex-col gap-2">
              <Skeleton className="h-9 w-64" />
              <Skeleton className="h-5 w-96" />
            </div>

            {/* Main setup section skeleton */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="md:col-span-2">
                <Card>
                  <CardHeader>
                    <Skeleton className="h-6 w-48" />
                    <Skeleton className="h-4 w-64" />
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="p-4 border-2 border-dashed rounded-lg flex flex-col items-center gap-4">
                      <Skeleton className="h-16 w-16 rounded-full" />
                      <div className="text-center space-y-2">
                        <Skeleton className="h-5 w-32" />
                        <Skeleton className="h-4 w-64" />
                      </div>
                      <Skeleton className="h-9 w-36" />
                    </div>
                  </CardContent>
                  <CardFooter>
                    <Skeleton className="h-9 w-36" />
                  </CardFooter>
                </Card>
              </div>

              <div>
                <Card>
                  <CardHeader>
                    <div className="flex items-center gap-2">
                      <Skeleton className="h-5 w-5" />
                      <Skeleton className="h-6 w-32" />
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <Skeleton className="h-4 w-full" />
                    <div className="space-y-2">
                      {[1, 2, 3, 4].map((i) => (
                        <div key={i} className="flex items-start gap-2">
                          <Skeleton className="h-5 w-5 rounded-full" />
                          <Skeleton className="h-4 w-48" />
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>

            {/* Recent sessions skeleton */}
            <div>
              <div className="flex items-center justify-between mb-4">
                <Skeleton className="h-6 w-48" />
                <Skeleton className="h-4 w-24" />
              </div>
              <div className="space-y-4">
                {[1, 2, 3].map((i) => (
                  <Card key={i}>
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between">
                        <div className="space-y-2">
                          <Skeleton className="h-5 w-48" />
                          <Skeleton className="h-4 w-32" />
                        </div>
                        <Skeleton className="h-8 w-24" />
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          </div>
        </main>

        <Footer />
      </div>
    );
  }

  // Get recent sessions
  const recentSessions = interviewSessions.slice(0, 3);

  return (
    <div className="flex min-h-screen flex-col">
      <NavBar activePath="/interviews" />

      {/* Multi-step loader */}
      <MultiStepLoader
        loadingStates={processingSteps}
        loading={isProcessing}
        duration={3000}
      />

      <main className="flex-1 container max-w-screen-xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex flex-col gap-8">
          {/* Page header */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="space-y-1">
              <h1 className="text-3xl font-bold tracking-tight">
                Interview Prep
              </h1>
              <p className="text-muted-foreground">
                Practice with realistic interview questions tailored to your
                skills
              </p>
            </div>

            {interviewSessions.length > 0 && (
              <Button variant="outline" size="sm" asChild>
                <Link href="/history" className="flex items-center gap-2">
                  View History
                </Link>
              </Button>
            )}
          </div>

          {/* Main setup section */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card className="md:col-span-2">
              <CardHeader>
                <CardTitle>Set Up Your Interview</CardTitle>
                <CardDescription>
                  Enter a job description to customize your interview
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {!resumeUploaded ? (
                  <div className="p-4 border-2 border-dashed rounded-lg flex flex-col items-center gap-4">
                    <div className="flex items-center justify-center h-16 w-16 rounded-full bg-amber-100 dark:bg-amber-900/30">
                      {resumeError ? (
                        <AlertTriangle className="h-8 w-8 text-amber-600 dark:text-amber-400" />
                      ) : (
                        <FileText className="h-8 w-8 text-amber-600 dark:text-amber-400" />
                      )}
                    </div>
                    <div className="text-center space-y-2">
                      <h3 className="text-lg font-medium">Resume Required</h3>
                      <p className="text-muted-foreground max-w-sm">
                        {resumeError ||
                          "Please upload your resume before setting up an interview"}
                      </p>
                    </div>
                    <Button
                      onClick={() => router.push("/resume")}
                      variant="outline"
                      className="mt-2 gap-2"
                    >
                      <FileText className="h-4 w-4" />
                      {resumeError ? "Go to Resume Page" : "Upload Resume"}
                    </Button>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {resumeData && <ResumeSummary resumeData={resumeData} />}

                    <div className="space-y-3">
                      <Label htmlFor="job-description">Job Description</Label>
                      <textarea
                        id="job-description"
                        className="flex min-h-32 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                        placeholder="Paste the job description here..."
                        value={jobDescription}
                        onChange={(e) => setJobDescription(e.target.value)}
                        disabled={isProcessing}
                      />
                      <p className="text-xs text-muted-foreground">
                        This helps our AI understand the job requirements and
                        tailor the interview questions
                      </p>
                    </div>
                  </div>
                )}
              </CardContent>
              <CardFooter>
                {!resumeUploaded ? (
                  <Button
                    onClick={() => router.push("/resume")}
                    className="gap-2"
                  >
                    <FileText className="h-4 w-4" />
                    Upload Resume First
                  </Button>
                ) : (
                  <Button
                    onClick={handleJobSubmit}
                    disabled={!jobDescription.trim() || isProcessing}
                    className="gap-2"
                  >
                    <ArrowRight className="h-4 w-4" />
                    Create Interview
                  </Button>
                )}
              </CardFooter>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg">
                  <div className="flex items-center gap-2">
                    <Bot className="h-5 w-5 text-purple-500" />
                    Strategist Agent
                  </div>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-sm text-muted-foreground">
                  Our Strategist agent maps your skills to job requirements and
                  plans your interview.
                </p>

                <ul className="space-y-2 text-sm">
                  <li className="flex items-start gap-2">
                    <div className="rounded-full bg-primary/10 p-1 mt-0.5">
                      <Bot className="h-3 w-3 text-primary" />
                    </div>
                    <span>Analyzes job requirements</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <div className="rounded-full bg-primary/10 p-1 mt-0.5">
                      <Bot className="h-3 w-3 text-primary" />
                    </div>
                    <span>Identifies skill matches and gaps</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <div className="rounded-full bg-primary/10 p-1 mt-0.5">
                      <Bot className="h-3 w-3 text-primary" />
                    </div>
                    <span>Creates tailored question plan</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <div className="rounded-full bg-primary/10 p-1 mt-0.5">
                      <Bot className="h-3 w-3 text-primary" />
                    </div>
                    <span>Adapts to your experience level</span>
                  </li>
                </ul>

                <div className="pt-4">
                  <p className="text-sm font-medium">How it helps</p>
                  <p className="text-sm text-muted-foreground mt-1">
                    The Strategist ensures your interview focuses on relevant
                    skills and experience, preparing you for questions that
                    matter for the specific role.
                  </p>
                </div>
              </CardContent>
              {interviewSessions.length > 0 &&
                interviewSessions[0].status === "in_progress" && (
                  <CardFooter>
                    <Button size="sm" className="gap-2" asChild>
                      <Link
                        href={`/interviews/session/${interviewSessions[0].id}`}
                      >
                        <Calendar className="h-4 w-4" />
                        Resume Active Interview
                      </Link>
                    </Button>
                  </CardFooter>
                )}
            </Card>
          </div>

          {/* Recent Sessions Section */}
          {recentSessions.length > 0 && (
            <div>
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-semibold">
                  Recent Interview Sessions
                </h2>
                <Link
                  href="/history"
                  className="inline-flex items-center text-sm text-primary hover:underline"
                >
                  <span>View all</span>
                  <ArrowRight className="ml-1 h-4 w-4" />
                </Link>
              </div>

              <div className="space-y-4">
                {recentSessions.map((session) => {
                  try {
                    // Transform data and render HistoryItem
                    return (
                      <HistoryItem
                        key={session.id}
                        session={{
                          id: session.id,
                          created_at:
                            session.date instanceof Date
                              ? session.date.toISOString()
                              : session.date,
                          job_posting: {
                            id: session.jobPostingId || "",
                            title: session.title,
                            company:
                              session.strategy?.job_analysis?.company || null,
                          },
                          status:
                            session.status === "not_started"
                              ? "planned"
                              : session.status,
                          strategy: session.strategy?.interview_strategy
                            ? {
                                focus_areas:
                                  session.strategy.interview_strategy.focus_areas?.map(
                                    (a) => a.name
                                  ) || [],
                                skill_mapping: Object.fromEntries(
                                  session.strategy.interview_strategy.focus_areas?.map(
                                    (area) => [
                                      area.name,
                                      session.strategy?.recommended_questions
                                        ?.filter(
                                          (q) => q.focus_area === area.name
                                        )
                                        ?.map((q) => q.related_skill) || [],
                                    ]
                                  ) || []
                                ),
                              }
                            : null,
                          questions:
                            session.strategy?.recommended_questions?.map(
                              (q) => ({
                                id: q.question_type,
                                question_text: q.question_text,
                                question_type: q.question_type,
                                related_skill: q.related_skill,
                                answers: [],
                              })
                            ) || [],
                        }}
                        onDelete={handleDeleteInterview}
                      />
                    );
                  } catch (error) {
                    console.error(
                      "Error rendering interview item:",
                      error,
                      session
                    );
                    // Fallback UI for errored sessions
                    return (
                      <div
                        key={session.id}
                        className="p-4 border rounded-md bg-red-50 text-red-800"
                      >
                        <p className="font-medium">
                          Failed to display interview session
                        </p>
                        <p className="text-sm">{session.title}</p>
                      </div>
                    );
                  }
                })}
              </div>
            </div>
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
}
