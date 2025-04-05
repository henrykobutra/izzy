'use client';

import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { 
  FileText, 
  ArrowRight, 
  PlayCircle, 
  CheckCircle, 
  Loader2, 
  AlertTriangle,
  Bot,
  Clock,
  Calendar,
  BadgeCheck,
  BarChart,
  ExternalLink
} from 'lucide-react';
import { ResumeSummary } from '@/components/interviews/resume-summary';

import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardFooter, 
  CardHeader, 
  CardTitle 
} from '@/components/ui/card';

import { ResumeData } from '@/components/resume/types';

import { InterviewSession } from '@/lib/hooks/useInterviewSessions';

interface SetupStepProps {
  resumeUploaded: boolean;
  resumeError: string | null;
  resumeData: ResumeData | null;
  jobDescriptionEntered: boolean;
  jobDescription: string;
  isProcessing: boolean;
  handleJobDescriptionSubmit: () => Promise<void>;
  startInterview: () => Promise<void>;
  setJobDescription: (text: string) => void;
  interviewSessions?: InterviewSession[];
}

// Helper function to format the date
function formatInterviewDate(date: Date): string {
  const now = new Date();
  const diffInDays = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24));
  
  if (diffInDays === 0) {
    return 'Today';
  } else if (diffInDays === 1) {
    return 'Yesterday';
  } else if (diffInDays < 7) {
    return `${diffInDays} days ago`;
  } else {
    return date.toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric',
      year: date.getFullYear() !== now.getFullYear() ? 'numeric' : undefined
    });
  }
}

// Helper to get status badge display
function getStatusBadge(status: string) {
  switch (status) {
    case 'completed':
      return <Badge variant="success" className="ml-2"><BadgeCheck className="h-3 w-3 mr-1" />Completed</Badge>;
    case 'in_progress':
      return <Badge variant="warning" className="ml-2"><Clock className="h-3 w-3 mr-1" />In Progress</Badge>;
    case 'planned':
      return <Badge variant="secondary" className="ml-2"><Calendar className="h-3 w-3 mr-1" />Planned</Badge>;
    default:
      return null;
  }
}

export function SetupStep({
  resumeUploaded,
  resumeError,
  resumeData,
  jobDescriptionEntered,
  jobDescription,
  isProcessing,
  handleJobDescriptionSubmit,
  startInterview,
  setJobDescription,
  interviewSessions = []
}: SetupStepProps) {
  const router = useRouter();
  
  // Get the 3 most recent interview sessions
  const recentSessions = interviewSessions.slice(0, 3);

  return (
    <div className="flex flex-col gap-8">
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
                    {resumeError || 'Please upload your resume before setting up an interview'}
                  </p>
                </div>
                <Button onClick={() => router.push('/resume')} variant="outline" className="mt-2 gap-2">
                  <FileText className="h-4 w-4" />
                  {resumeError ? 'Go to Resume Page' : 'Upload Resume'}
                </Button>
              </div>
            ) : !jobDescriptionEntered ? (
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
                    This helps our AI understand the job requirements and tailor the interview questions
                  </p>
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                {resumeData && <ResumeSummary resumeData={resumeData} />}
                
                <div className="p-4 border rounded-lg bg-muted/30 flex items-start gap-3">
                  <div className="mt-1">
                    <CheckCircle className="h-5 w-5 text-green-500" />
                  </div>
                  <div className="space-y-1">
                    <p className="text-sm font-medium">Job description processed</p>
                    <p className="text-xs text-muted-foreground">
                      {jobDescription.length > 100 
                        ? `${jobDescription.substring(0, 100)}...`
                        : jobDescription}
                    </p>
                  </div>
                </div>
              </div>
            )}
          </CardContent>
          <CardFooter>
            {!resumeUploaded ? (
              <Button onClick={() => router.push('/resume')} className="gap-2">
                <FileText className="h-4 w-4" />
                Upload Resume First
              </Button>
            ) : !jobDescriptionEntered ? (
              <Button 
                onClick={handleJobDescriptionSubmit} 
                disabled={!jobDescription.trim() || isProcessing}
                className="gap-2"
              >
                {isProcessing ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Processing...
                  </>
                ) : (
                  <>
                    <ArrowRight className="h-4 w-4" />
                    Continue
                  </>
                )}
              </Button>
            ) : (
              <Button onClick={startInterview} disabled={isProcessing} className="gap-2">
                {isProcessing ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Setting Up...
                  </>
                ) : (
                  <>
                    <PlayCircle className="h-4 w-4" />
                    Start Interview
                  </>
                )}
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
              Our Strategist agent maps your skills to job requirements and plans your interview.
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
                The Strategist ensures your interview focuses on relevant skills and experience, preparing you for questions that matter for the specific role.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recent Sessions Section */}
      {recentSessions.length > 0 && (
        <div>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold">Recent Interview Sessions</h2>
            <Link 
              href="/history" 
              className="inline-flex items-center text-sm text-primary hover:underline"
            >
              <span>View all</span>
              <ExternalLink className="ml-1 h-4 w-4" />
            </Link>
          </div>

          <div className="space-y-4">
            {recentSessions.map((session) => (
              <Card key={session.id} className="overflow-hidden bg-gradient-to-r from-background to-background via-muted/5 border">
                <div className="relative">
                  {/* Top Status Bar */}
                  <div className="absolute top-0 left-0 right-0 h-1">
                    <div className={`h-full ${
                      session.status === 'completed' ? 'bg-green-500' : 
                      session.status === 'in_progress' ? 'bg-amber-500' : 
                      'bg-blue-500'
                    }`}></div>
                  </div>
                  
                  <div className="p-4 pt-5 md:p-6 md:pt-7">
                    {/* Header Section */}
                    <div className="flex flex-wrap items-start justify-between mb-4 gap-2">
                      <div>
                        <div className="flex flex-wrap items-center gap-2 mb-1">
                          {getStatusBadge(session.status)}
                          <span className="text-xs text-muted-foreground">
                            {formatInterviewDate(session.date)}
                          </span>
                        </div>
                        <h3 className="text-lg font-medium">{session.title}</h3>
                      </div>
                      
                      {session.score !== undefined && (
                        <div className="bg-gradient-to-r from-green-50 to-green-100 dark:from-green-900/30 dark:to-green-800/20 rounded-full px-3 py-1.5 flex items-center gap-1.5 shadow-sm">
                          <BarChart className="h-4 w-4 text-green-600 dark:text-green-400" />
                          <span className="text-sm font-semibold text-green-700 dark:text-green-400">
                            {session.score.toFixed(1)}/5.0
                          </span>
                        </div>
                      )}
                    </div>
                    
                    {/* Strategy Content */}
                    {session.strategy ? (
                      <div className="space-y-4">
                        {/* Main Details Grid */}
                        <div className="grid grid-cols-12 gap-4">
                          {/* Left Column - Focus Areas */}
                          <div className="col-span-12 md:col-span-5 space-y-3">
                            <div className="flex items-center justify-between">
                              <h4 className="text-xs uppercase tracking-wider text-muted-foreground font-medium">Focus Areas</h4>
                              {session.strategy.interview_strategy?.focus_areas && 
                               session.strategy.interview_strategy.focus_areas.length > 3 && (
                                <span className="text-xs text-primary">
                                  +{session.strategy.interview_strategy.focus_areas.length - 3} more
                                </span>
                              )}
                            </div>
                            
                            {session.strategy.interview_strategy?.focus_areas && 
                            session.strategy.interview_strategy.focus_areas.length > 0 ? (
                              <div className="space-y-2">
                                {session.strategy.interview_strategy.focus_areas.slice(0, 3).map((area, index) => (
                                  <div key={index} 
                                    className={`relative pl-2 pr-3 py-2 rounded-md overflow-hidden
                                      ${index === 0 ? 'bg-primary/5 border-l-2 border-primary' : 
                                       index === 1 ? 'bg-muted/80 border-l border-muted-foreground/30' : 
                                       'bg-muted/50 border-l border-muted-foreground/20'}`}
                                  >
                                    <div className="flex items-center justify-between mb-1">
                                      <h5 className="text-xs font-medium">{area.name}</h5>
                                      <span className="text-xs font-semibold text-primary bg-primary/10 rounded-full px-1.5 py-0.5">
                                        {area.weight}%
                                      </span>
                                    </div>
                                    <p className="text-xs text-muted-foreground line-clamp-1">
                                      {area.description}
                                    </p>
                                  </div>
                                ))}
                              </div>
                            ) : (
                              <p className="text-xs text-muted-foreground">
                                No focus areas defined.
                              </p>
                            )}
                          </div>

                          {/* Right Column - Skills & Requirements */}
                          <div className="col-span-12 md:col-span-7">
                            <div className="space-y-3">
                              {/* Required Skills */}
                              <div>
                                <h4 className="text-xs uppercase tracking-wider text-muted-foreground font-medium mb-2">Key Skills</h4>
                                {session.strategy.job_analysis?.required_skills && 
                                session.strategy.job_analysis.required_skills.length > 0 ? (
                                  <div className="flex flex-wrap gap-1.5">
                                    {session.strategy.job_analysis.required_skills.slice(0, 5).map((skill, index) => (
                                      <span key={index} className="bg-muted/60 rounded-full px-2 py-1 text-xs inline-flex items-center">
                                        {typeof skill === 'string' ? skill : skill.skill}
                                        {(typeof skill !== 'string' && skill.importance === 'high') && (
                                          <span className="w-1.5 h-1.5 bg-primary rounded-full ml-1.5"></span>
                                        )}
                                      </span>
                                    ))}
                                    {session.strategy.job_analysis.required_skills.length > 5 && (
                                      <span className="text-xs text-muted-foreground flex items-center">
                                        +{session.strategy.job_analysis.required_skills.length - 5} more
                                      </span>
                                    )}
                                  </div>
                                ) : (
                                  <p className="text-xs text-muted-foreground">No required skills specified</p>
                                )}
                              </div>
                              
                              {/* Experience Level */}
                              {session.strategy.job_analysis?.experience_requirements && (
                                <div className="flex gap-6">
                                  <div>
                                    <h4 className="text-xs uppercase tracking-wider text-muted-foreground font-medium mb-1">Level</h4>
                                    <p className="text-sm">
                                      {session.strategy.job_analysis.experience_requirements.level || 'Not specified'}
                                    </p>
                                  </div>
                                  <div>
                                    <h4 className="text-xs uppercase tracking-wider text-muted-foreground font-medium mb-1">Experience</h4>
                                    <p className="text-sm">
                                      {session.strategy.job_analysis.experience_requirements.min_years} years min.
                                    </p>
                                  </div>
                                </div>
                              )}
                              
                              {/* Recommendation */}
                              {session.strategy.interview_strategy?.recommended_preparation && 
                               session.strategy.interview_strategy.recommended_preparation.length > 0 && (
                                <div>
                                  <h4 className="text-xs uppercase tracking-wider text-muted-foreground font-medium mb-1">Prep Tips</h4>
                                  <div className="border-l-2 border-primary/30 pl-3 text-xs text-muted-foreground">
                                    {session.strategy.interview_strategy.recommended_preparation[0]}
                                  </div>
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                        
                        {/* Footer with Button */}
                        <div className="flex justify-between items-center pt-2 mt-2 border-t">
                          <div className="text-xs text-muted-foreground">
                            {session.strategy.recommended_questions ? 
                              `${session.strategy.recommended_questions.length} questions` : 
                              'Questions prepared'}
                          </div>
                          <Button size="sm" className="gap-1.5" asChild>
                            <Link href={`/interviews/strategy?session=${session.id}`}>
                              <ExternalLink className="h-3.5 w-3.5" />
                              <span>View Strategy</span>
                            </Link>
                          </Button>
                        </div>
                      </div>
                    ) : (
                      <div className="py-8 text-center text-muted-foreground">
                        <p>Strategy details will be available once the interview is prepared.</p>
                        <Button size="sm" className="mt-4 gap-1.5" asChild>
                          <Link href={`/interviews/strategy?session=${session.id}`}>
                            <ExternalLink className="h-3.5 w-3.5" />
                            <span>View Strategy</span>
                          </Link>
                        </Button>
                      </div>
                    )}
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}