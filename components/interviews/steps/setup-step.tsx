'use client';

import { useRouter } from 'next/navigation';
import { 
  FileText, 
  ArrowRight, 
  PlayCircle, 
  CheckCircle, 
  Loader2, 
  AlertTriangle,
  Bot
} from 'lucide-react';
import { ResumeSummary } from '@/components/interviews/resume-summary';

import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardFooter, 
  CardHeader, 
  CardTitle 
} from '@/components/ui/card';

import { ResumeData } from '@/components/resume/types';

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
  setJobDescription
}: SetupStepProps) {
  const router = useRouter();

  return (
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
  );
}