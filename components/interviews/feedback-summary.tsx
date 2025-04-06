'use client';

import React from 'react';
import { Button } from '@/components/ui/button';
import { Calendar, ChevronRight, BarChart2 } from 'lucide-react';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle
} from '@/components/ui/card';
import { useRouter } from 'next/navigation';
import { Badge } from '@/components/ui/badge';

interface FeedbackSummaryProps {
  commonImprovements: string[];
  summary?: string;
  sessionId?: string;
}

export function FeedbackSummary({ commonImprovements, summary, sessionId }: FeedbackSummaryProps) {
  const router = useRouter();
  
  // If we have a session-specific summary, show that instead of common improvements
  if (summary && sessionId) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Latest Feedback</CardTitle>
          <CardDescription>
            Assessment from your most recent completed interview
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="p-4 border rounded-lg bg-primary/5">
              <p className="text-sm">{summary}</p>
            </div>
          </div>
        </CardContent>
        <CardFooter>
          <Button 
            variant="outline" 
            className="w-full gap-2" 
            onClick={() => router.push(`/interviews/results/${sessionId}`)}
          >
            <BarChart2 className="h-4 w-4" />
            View Detailed Feedback
            <ChevronRight className="h-4 w-4 ml-auto" />
          </Button>
        </CardFooter>
      </Card>
    );
  }
  
  // Otherwise, show common improvements across interviews
  return (
    <Card>
      <CardHeader>
        <CardTitle>Common Feedback</CardTitle>
        <CardDescription>
          Frequently mentioned areas for improvement
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {commonImprovements.length > 0 ? (
            commonImprovements.map((improvement, index) => (
              <div key={index} className="p-3 border rounded-lg">
                <p className="text-sm font-medium">{improvement}</p>
                <div className="flex items-center gap-2 mt-1.5">
                  <Badge variant="outline" className="text-xs bg-amber-50 text-amber-700 dark:bg-amber-900/20 dark:text-amber-400 border-amber-200 dark:border-amber-800/30">
                    Frequent feedback
                  </Badge>
                </div>
              </div>
            ))
          ) : (
            <div className="text-center py-6 text-muted-foreground">
              Complete more interviews to see common feedback
            </div>
          )}
        </div>
      </CardContent>
      <CardFooter>
        <Button 
          variant="outline" 
          className="w-full gap-2" 
          onClick={() => router.push('/interviews')}
        >
          <Calendar className="h-4 w-4" />
          Practice Areas to Improve
        </Button>
      </CardFooter>
    </Card>
  );
}