'use client';

import { useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { 
  Upload,
  FileText, 
  MessageSquare, 
  BarChart4, 
  CheckCircle,
  ArrowRight,
  Loader2,
  Calendar,
  Clock
} from 'lucide-react';

import { useAuth } from '@/lib/hooks/useAuth';
import { useResumeCheck } from '@/lib/hooks/useResumeCheck';
import { useInterviewSessions, InterviewStatus } from '@/lib/hooks/useInterviewSessions';
import { NavBar } from '@/components/ui/nav-bar';
import { Footer } from '@/components/ui/footer';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardFooter, 
  CardHeader, 
  CardTitle 
} from '@/components/ui/card';

export default function DashboardPage() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const { resumeUploaded, resumeData } = useResumeCheck();
  const { interviewSessions, loading: sessionsLoading } = useInterviewSessions();

  useEffect(() => {
    // If not authenticated, redirect to sign-in
    if (!loading && !user) {
      router.push('/sign-in');
    }
  }, [user, loading, router]);

  if (loading || sessionsLoading) {
    return (
      <div className="flex min-h-screen flex-col">
        <NavBar activePath="/dashboard" />
        
        <main className="flex-1 flex items-center justify-center py-12">
          <div className="flex flex-col items-center gap-4">
            <Loader2 className="h-12 w-12 animate-spin text-primary" />
            <p className="text-lg font-medium">Loading your dashboard...</p>
          </div>
        </main>

        <Footer />
      </div>
    );
  }

  // Get interview stats
  const completedInterviews = interviewSessions.filter(session => session.status === 'completed');
  const inProgressInterviews = interviewSessions.filter(session => session.status === 'in_progress');
  const totalInterviews = interviewSessions.length;
  const averageScore = completedInterviews.length > 0 
    ? completedInterviews.reduce((sum, session) => sum + (session.score || 0), 0) / completedInterviews.length 
    : 0;

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric', 
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getStatusBadge = (status: InterviewStatus) => {
    switch (status) {
      case 'completed':
        return <Badge className="bg-green-100 text-green-700 dark:bg-green-900/20 dark:text-green-400">Completed</Badge>;
      case 'in_progress':
        return <Badge className="bg-amber-100 text-amber-700 dark:bg-amber-900/20 dark:text-amber-400">In Progress</Badge>;
      default:
        return <Badge className="bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-400">Planned</Badge>;
    }
  };

  return (
    <div className="flex min-h-screen flex-col">
      <NavBar activePath="/dashboard" />
      
      <main className="flex-1 container max-w-screen-xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex flex-col gap-8">
          {/* Dashboard header */}
          <div className="flex flex-col gap-2">
            <h1 className="text-3xl font-bold tracking-tight">
              Welcome{user?.email ? `, ${user.email.split('@')[0]}` : ''}!
            </h1>
            <p className="text-muted-foreground">
              Your personal interview preparation hub
            </p>
          </div>

          {!resumeUploaded ? (
            // Resume not uploaded state
            <Card className="border-2 border-dashed">
              <CardHeader className="text-center pb-2">
                <CardTitle>Upload Your Resume to Begin</CardTitle>
                <CardDescription>
                  The first step to prepare for your interviews
                </CardDescription>
              </CardHeader>
              <CardContent className="pb-2">
                <div className="flex justify-center py-8">
                  <div className="flex flex-col items-center gap-6 max-w-md text-center">
                    <div className="flex items-center justify-center h-24 w-24 rounded-full bg-primary/10">
                      <Image
                        src="/file.svg"
                        alt="Upload resume"
                        width={48}
                        height={48}
                        className="opacity-70"
                      />
                    </div>
                    <div className="space-y-2">
                      <h3 className="text-xl font-semibold">Begin Your Interview Prep Journey</h3>
                      <p className="text-muted-foreground">
                        Upload your resume to unlock personalized interview coaching from our AI squad.
                      </p>
                    </div>
                  </div>
                </div>
              </CardContent>
              <CardFooter className="justify-center pt-2 pb-6">
                <Button asChild>
                  <Link href="/resume" className="gap-2">
                    <Upload className="h-4 w-4" />
                    Upload Your Resume
                  </Link>
                </Button>
              </CardFooter>
            </Card>
          ) : (
            // Resume uploaded - show status and quick actions
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="flex items-center gap-2">
                  <CheckCircle className="h-5 w-5 text-green-500" /> 
                  Resume Ready
                </CardTitle>
                <CardDescription>
                  Your resume has been processed and is ready for interviews
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex flex-col gap-4">
                  <div className="bg-muted/30 p-3 rounded-lg">
                    <div className="flex flex-wrap gap-2 mb-2">
                      <span className="text-sm font-medium">Skills: </span>
                      <span className="text-sm">{resumeData?.technical_skills_count || 0} technical skills</span>
                      <span className="text-muted-foreground">•</span>
                      <span className="text-sm">{resumeData?.soft_skills_count || 0} soft skills</span>
                    </div>
                    <div className="text-sm">
                      <span className="font-medium">Experience: </span>
                      <span>{resumeData?.total_years_experience || 0} years</span>
                    </div>
                  </div>

                  <div className="flex flex-wrap gap-2">
                    <Button size="sm" asChild>
                      <Link href="/interviews" className="gap-2">
                        <MessageSquare className="h-4 w-4" />
                        Start Practice Interview
                      </Link>
                    </Button>
                    <Button size="sm" variant="outline" asChild>
                      <Link href="/resume" className="gap-2">
                        <FileText className="h-4 w-4" />
                        View Resume Details
                      </Link>
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Stats overview */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-lg flex items-center gap-2">
                  <Calendar className="h-5 w-5 text-primary" />
                  Interview Stats
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-muted-foreground">Total Interviews</span>
                    <span className="text-2xl font-bold">{totalInterviews}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-muted-foreground">Completed</span>
                    <span className="text-lg font-medium">{completedInterviews.length}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-muted-foreground">In Progress</span>
                    <span className="text-lg font-medium">{inProgressInterviews.length}</span>
                  </div>
                  {completedInterviews.length > 0 && (
                    <div className="flex justify-between items-center pt-2 border-t">
                      <span className="text-sm text-muted-foreground">Average Score</span>
                      <span className="text-lg font-medium text-primary">{averageScore.toFixed(1)}/10</span>
                    </div>
                  )}
                  
                  {/* Show latest feedback metrics if available */}
                  {completedInterviews.length > 0 && completedInterviews[0].session_feedback && (
                    <div className="mt-3 pt-3 border-t space-y-2">
                      <span className="text-xs font-medium text-muted-foreground">Latest Interview Scores:</span>
                      <div className="space-y-1">
                        <div className="flex justify-between text-xs">
                          <span>Technical</span>
                          <span>{completedInterviews[0].session_feedback.technical_score.toFixed(1)}</span>
                        </div>
                        <div className="flex justify-between text-xs">
                          <span>Communication</span>
                          <span>{completedInterviews[0].session_feedback.communication_score.toFixed(1)}</span>
                        </div>
                        <div className="flex justify-between text-xs">
                          <span>Problem Solving</span>
                          <span>{completedInterviews[0].session_feedback.problem_solving_score.toFixed(1)}</span>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </CardContent>
              <CardFooter className="pt-0">
                <Button variant="outline" size="sm" asChild className="w-full">
                  <Link href="/history">
                    View History
                  </Link>
                </Button>
              </CardFooter>
            </Card>

            <Card className="md:col-span-2">
              <CardHeader className="pb-2">
                <CardTitle className="text-lg flex items-center gap-2">
                  <Clock className="h-5 w-5 text-amber-500" />
                  Recent Interviews
                </CardTitle>
              </CardHeader>
              <CardContent>
                {interviewSessions.length > 0 ? (
                  <div className="space-y-3 max-h-[240px] overflow-y-auto pr-2">
                    {interviewSessions.slice(0, 5).map((session) => (
                      <div key={session.id} className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 p-3 border rounded-lg">
                        <div className="space-y-1">
                          <div className="flex items-center gap-2">
                            <h3 className="font-medium">{session.title}</h3>
                            {getStatusBadge(session.status)}
                          </div>
                          <div className="flex items-center gap-2">
                            <p className="text-xs text-muted-foreground">{formatDate(session.date)}</p>
                            {session.status === 'completed' && session.score && (
                              <span className="text-xs font-medium px-1.5 py-0.5 bg-primary/10 text-primary rounded-full">
                                Score: {session.score.toFixed(1)}
                              </span>
                            )}
                          </div>
                        </div>
                        <Button variant="ghost" size="sm" asChild className="self-end sm:self-auto">
                          <Link href={`/interviews/session/${session.id}`}>
                            Continue <ArrowRight className="ml-1 h-3 w-3" />
                          </Link>
                        </Button>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <p className="text-muted-foreground">No interviews yet</p>
                    <Button variant="outline" size="sm" className="mt-4" asChild>
                      <Link href="/interviews">Start your first practice</Link>
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Quick actions */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-lg flex items-center gap-2">
                  <FileText className="h-5 w-5 text-blue-500" />
                  Resume Analysis
                </CardTitle>
              </CardHeader>
              <CardContent className="pb-2">
                <p className="text-sm text-muted-foreground">
                  Upload or update your resume to refine your interview preparation strategy.
                </p>
              </CardContent>
              <CardFooter className="pt-2">
                <Button variant="outline" size="sm" asChild className="w-full">
                  <Link href="/resume" className="justify-between">
                    {resumeUploaded ? 'View Resume' : 'Upload Resume'}
                    <ArrowRight className="h-4 w-4" />
                  </Link>
                </Button>
              </CardFooter>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-lg flex items-center gap-2">
                  <MessageSquare className="h-5 w-5 text-amber-500" />
                  Mock Interviews
                </CardTitle>
              </CardHeader>
              <CardContent className="pb-2">
                <p className="text-sm text-muted-foreground">
                  Practice with tailored interview questions based on your resume and target job.
                </p>
              </CardContent>
              <CardFooter className="pt-2">
                <Button variant="outline" size="sm" asChild className="w-full">
                  <Link href="/interviews" className="justify-between">
                    Start Interview
                    <ArrowRight className="h-4 w-4" />
                  </Link>
                </Button>
              </CardFooter>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-lg flex items-center gap-2">
                  <BarChart4 className="h-5 w-5 text-green-500" />
                  Performance Tracking
                </CardTitle>
              </CardHeader>
              <CardContent className="pb-2">
                <p className="text-sm text-muted-foreground">
                  Review feedback and track your interview performance improvements.
                </p>
              </CardContent>
              <CardFooter className="pt-2">
                <Button variant="outline" size="sm" asChild className="w-full">
                  <Link href="/history" className="justify-between">
                    View History
                    <ArrowRight className="h-4 w-4" />
                  </Link>
                </Button>
              </CardFooter>
            </Card>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}