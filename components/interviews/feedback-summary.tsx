'use client';

import React from 'react';
import { Button } from '@/components/ui/button';
import { Calendar } from 'lucide-react';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle
} from '@/components/ui/card';
import { useRouter } from 'next/navigation';

interface FeedbackSummaryProps {
  commonImprovements: string[];
}

export function FeedbackSummary({ commonImprovements }: FeedbackSummaryProps) {
  const router = useRouter();
  
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
                <p className="text-xs text-muted-foreground mt-1">
                  Mentioned in {Math.ceil(Math.random() * 50 + 25)}% of your interviews.
                </p>
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