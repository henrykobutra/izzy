'use client';

import { CheckCircle, Loader2 } from 'lucide-react';
import InterviewInterface from '@/components/interviews/interview-interface';

import { Button } from '@/components/ui/button';
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardFooter, 
  CardHeader, 
  CardTitle 
} from '@/components/ui/card';

interface InterviewStepProps {
  interviewSessions: Array<{
    id: string;
    title: string;
    date: Date;
    status: string;
    score?: number;
  }>;
  completeInterview: () => Promise<void>;
  setCurrentStep: (step: 'setup' | 'strategy' | 'interview' | 'evaluation') => void;
  isProcessing: boolean;
}

export function InterviewStep({ 
  interviewSessions, 
  completeInterview, 
  setCurrentStep, 
  isProcessing 
}: InterviewStepProps) {
  return (
    <div className="grid grid-cols-1 gap-6">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Mock Interview</CardTitle>
            <div className="px-3 py-1 bg-amber-100 dark:bg-amber-900/30 text-amber-800 dark:text-amber-300 text-xs rounded-full">
              Interviewer
            </div>
          </div>
          <CardDescription>
            Answer questions from the interviewer as if in a real interview
          </CardDescription>
        </CardHeader>
        <CardContent className="min-h-[500px]">
          {interviewSessions && interviewSessions.length > 0 ? (
            <div className="h-[500px]">
              <InterviewInterface 
                sessionId={interviewSessions[0].id}
                onComplete={completeInterview}
              />
            </div>
          ) : (
            <div className="flex items-center justify-center h-full">
              <div className="text-center">
                <p className="text-sm text-muted-foreground">No active interview session found</p>
                <Button
                  onClick={() => setCurrentStep('setup' as const)}
                  variant="outline"
                  className="mt-4"
                >
                  Go Back to Setup
                </Button>
              </div>
            </div>
          )}
        </CardContent>
        <CardFooter>
          <Button onClick={completeInterview} disabled={isProcessing} className="gap-2">
            {isProcessing ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Finalizing...
              </>
            ) : (
              <>
                <CheckCircle className="h-4 w-4" />
                Complete Interview
              </>
            )}
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}