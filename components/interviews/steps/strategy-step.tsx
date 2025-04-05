'use client';

import { 
  MessageSquare, 
  BarChart4, 
  PlayCircle, 
  CheckCircle, 
  Clock, 
  Loader2,
  Bot
} from 'lucide-react';

import { Button } from '@/components/ui/button';
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardFooter, 
  CardHeader, 
  CardTitle 
} from '@/components/ui/card';

interface StrategyStepProps {
  startInterview: () => Promise<void>;
  isProcessing: boolean;
}

export function StrategyStep({ startInterview, isProcessing }: StrategyStepProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      <Card className="md:col-span-2">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Bot className="h-5 w-5 text-purple-500" />
              Interview Strategy
            </CardTitle>
            <div className="px-3 py-1 bg-purple-100 dark:bg-purple-900/30 text-purple-800 dark:text-purple-300 text-xs rounded-full">
              Strategist
            </div>
          </div>
          <CardDescription>
            Your personalized interview plan based on resume and job description
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-3">
            <h3 className="text-lg font-medium">Skills Match Analysis</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <Card className="border-green-200 dark:border-green-900">
                <CardHeader className="py-3 px-4">
                  <CardTitle className="text-sm font-medium text-green-600 dark:text-green-400">Strong Matches</CardTitle>
                </CardHeader>
                <CardContent className="py-2 px-4">
                  <ul className="space-y-1 text-sm">
                    <li className="flex items-center gap-2">
                      <CheckCircle className="h-3 w-3 text-green-500" />
                      <span>React development (3 years)</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle className="h-3 w-3 text-green-500" />
                      <span>TypeScript proficiency</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle className="h-3 w-3 text-green-500" />
                      <span>UI/UX implementation</span>
                    </li>
                  </ul>
                </CardContent>
              </Card>
              <Card className="border-amber-200 dark:border-amber-900">
                <CardHeader className="py-3 px-4">
                  <CardTitle className="text-sm font-medium text-amber-600 dark:text-amber-400">Areas to Highlight</CardTitle>
                </CardHeader>
                <CardContent className="py-2 px-4">
                  <ul className="space-y-1 text-sm">
                    <li className="flex items-center gap-2">
                      <Clock className="h-3 w-3 text-amber-500" />
                      <span>Next.js experience (newer)</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <Clock className="h-3 w-3 text-amber-500" />
                      <span>Performance optimization</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <Clock className="h-3 w-3 text-amber-500" />
                      <span>Team collaboration</span>
                    </li>
                  </ul>
                </CardContent>
              </Card>
            </div>
          </div>
          
          <div className="space-y-3">
            <h3 className="text-lg font-medium">Interview Focus Areas</h3>
            <div className="space-y-2">
              <div className="p-3 border rounded-lg">
                <p className="text-sm font-medium">Technical Competency (40%)</p>
                <p className="text-xs text-muted-foreground mt-1">
                  React component architecture, TypeScript typing, state management
                </p>
              </div>
              <div className="p-3 border rounded-lg">
                <p className="text-sm font-medium">Problem Solving (30%)</p>
                <p className="text-xs text-muted-foreground mt-1">
                  UI performance optimization, debugging, responsive design approaches
                </p>
              </div>
              <div className="p-3 border rounded-lg">
                <p className="text-sm font-medium">Project Experience (20%)</p>
                <p className="text-xs text-muted-foreground mt-1">
                  Past UI implementations, team collaboration, delivery timelines
                </p>
              </div>
              <div className="p-3 border rounded-lg">
                <p className="text-sm font-medium">Culture Fit (10%)</p>
                <p className="text-xs text-muted-foreground mt-1">
                  Communication style, team dynamics, approach to feedback
                </p>
              </div>
            </div>
          </div>
        </CardContent>
        <CardFooter>
          <Button onClick={startInterview} disabled={isProcessing} className="gap-2">
            {isProcessing ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Preparing...
              </>
            ) : (
              <>
                <PlayCircle className="h-4 w-4" />
                Start Interview Session
              </>
            )}
          </Button>
        </CardFooter>
      </Card>

      <div className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">
              <div className="flex items-center gap-2">
                <MessageSquare className="h-5 w-5 text-amber-500" />
                Interviewer Agent
              </div>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-sm text-muted-foreground">
              Ready to conduct your mock interview with questions based on the strategy.
            </p>
            
            <div className="p-3 bg-muted/30 rounded-lg">
              <p className="text-sm">Estimated duration: <span className="font-medium">20-25 minutes</span></p>
              <p className="text-xs text-muted-foreground mt-1">
                10-12 questions covering technical, problem-solving, and experience aspects
              </p>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">
              <div className="flex items-center gap-2">
                <BarChart4 className="h-5 w-5 text-green-500" />
                Evaluator Agent
              </div>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              Will provide scoring and constructive feedback on your interview responses after completion.
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}