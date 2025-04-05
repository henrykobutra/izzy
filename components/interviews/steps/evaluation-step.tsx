'use client';

import { useRouter } from 'next/navigation';
import { BarChart4, PlayCircle } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardFooter, 
  CardHeader, 
  CardTitle 
} from '@/components/ui/card';

interface EvaluationStepProps {
  setCurrentStep: (step: 'setup' | 'strategy' | 'interview' | 'evaluation') => void;
  setJobDescriptionEntered: (value: boolean) => void;
  setJobDescription: (value: string) => void;
}

export function EvaluationStep({ 
  setCurrentStep, 
  setJobDescriptionEntered, 
  setJobDescription 
}: EvaluationStepProps) {
  const router = useRouter();
  
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      <Card className="md:col-span-2">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Interview Evaluation</CardTitle>
            <div className="px-3 py-1 bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300 text-xs rounded-full">
              Evaluator
            </div>
          </div>
          <CardDescription>
            Performance assessment and improvement suggestions
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex items-center justify-between p-4 bg-muted/30 rounded-lg">
            <div className="space-y-1">
              <h3 className="font-medium">Frontend Developer Interview</h3>
              <p className="text-xs text-muted-foreground">
                Completed {new Date().toLocaleDateString()}
              </p>
            </div>
            <div className="flex flex-col items-center">
              <div className="text-2xl font-bold text-primary">3.8</div>
              <div className="text-xs text-muted-foreground">out of 5</div>
            </div>
          </div>
          
          <div className="space-y-4">
            <h3 className="text-lg font-medium">Performance Breakdown</h3>
            
            <div className="space-y-3">
              <div className="space-y-1">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Technical Knowledge</span>
                  <span className="text-sm">4.2/5</span>
                </div>
                <div className="h-2 rounded-full bg-muted">
                  <div className="h-full rounded-full bg-green-500" style={{ width: '84%' }}></div>
                </div>
                <p className="text-xs text-muted-foreground">Strong understanding of React and TypeScript fundamentals</p>
              </div>
              
              <div className="space-y-1">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Communication</span>
                  <span className="text-sm">3.5/5</span>
                </div>
                <div className="h-2 rounded-full bg-muted">
                  <div className="h-full rounded-full bg-amber-500" style={{ width: '70%' }}></div>
                </div>
                <p className="text-xs text-muted-foreground">Clear explanations but could be more concise</p>
              </div>
              
              <div className="space-y-1">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Problem Solving</span>
                  <span className="text-sm">3.8/5</span>
                </div>
                <div className="h-2 rounded-full bg-muted">
                  <div className="h-full rounded-full bg-amber-500" style={{ width: '76%' }}></div>
                </div>
                <p className="text-xs text-muted-foreground">Good approach but could explore multiple solutions</p>
              </div>
              
              <div className="space-y-1">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Experience Relevance</span>
                  <span className="text-sm">4.0/5</span>
                </div>
                <div className="h-2 rounded-full bg-muted">
                  <div className="h-full rounded-full bg-green-500" style={{ width: '80%' }}></div>
                </div>
                <p className="text-xs text-muted-foreground">Examples aligned well with job requirements</p>
              </div>
            </div>
          </div>
          
          <div className="space-y-3">
            <h3 className="text-lg font-medium">Improvement Suggestions</h3>
            
            <div className="p-3 border rounded-lg">
              <p className="text-sm font-medium">Be more specific about outcomes</p>
              <p className="text-xs text-muted-foreground mt-1">
                When discussing project experiences, quantify the impact of your contributions where possible. For example, mention performance improvements by percentage or user engagement metrics.
              </p>
            </div>
            
            <div className="p-3 border rounded-lg">
              <p className="text-sm font-medium">Structure answers with STAR method</p>
              <p className="text-xs text-muted-foreground mt-1">
                For behavioral questions, use the Situation, Task, Action, Result framework to make your examples more compelling and complete.
              </p>
            </div>
            
            <div className="p-3 border rounded-lg">
              <p className="text-sm font-medium">Highlight Next.js experience more</p>
              <p className="text-xs text-muted-foreground mt-1">
                Since the job requires Next.js, emphasize your experience with server components, routing, and data fetching patterns early in your answers.
              </p>
            </div>
          </div>
        </CardContent>
        <CardFooter className="flex flex-wrap gap-3">
          <Button 
            onClick={() => router.push('/history')} 
            className="gap-2"
          >
            <BarChart4 className="h-4 w-4" />
            View History
          </Button>
          <Button 
            onClick={() => {
              setCurrentStep('setup' as const);
              setJobDescriptionEntered(false);
              setJobDescription('');
            }} 
            variant="outline"
            className="gap-2"
          >
            <PlayCircle className="h-4 w-4" />
            Start New Interview
          </Button>
        </CardFooter>
      </Card>

      <div className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Next Steps</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="p-3 bg-muted/30 rounded-lg">
              <p className="text-sm font-medium">Practice Makes Perfect</p>
              <p className="text-xs text-muted-foreground mt-1">
                Create a new interview with a different job description to practice for various roles
              </p>
            </div>
            
            <div className="p-3 bg-muted/30 rounded-lg">
              <p className="text-sm font-medium">Focus on Weak Areas</p>
              <p className="text-xs text-muted-foreground mt-1">
                Review suggested improvements and practice those specific aspects
              </p>
            </div>
            
            <div className="p-3 bg-muted/30 rounded-lg">
              <p className="text-sm font-medium">Track Progress</p>
              <p className="text-xs text-muted-foreground mt-1">
                Monitor your scores over time in your interview history
              </p>
            </div>
          </CardContent>
          <CardFooter>
            <Button 
              variant="outline" 
              className="w-full gap-2" 
              onClick={() => {
                setCurrentStep('setup' as const);
                setJobDescriptionEntered(false);
                setJobDescription('');
              }}
            >
              <PlayCircle className="h-4 w-4" />
              New Interview
            </Button>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
}