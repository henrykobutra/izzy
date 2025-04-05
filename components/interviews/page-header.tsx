'use client';

import { Button } from '@/components/ui/button';

interface PageHeaderProps {
  interviewSessions: Array<{
    id: string;
    title: string;
    date: Date;
    status: string;
    score?: number;
  }>;
}

export function PageHeader({ interviewSessions }: PageHeaderProps) {
  return (
    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
      <div className="space-y-1">
        <h1 className="text-3xl font-bold tracking-tight">Interview Prep</h1>
        <p className="text-muted-foreground">
          Practice with realistic interview questions tailored to your skills
        </p>
      </div>
      
      {interviewSessions.length > 0 && (
        <Button variant="outline" size="sm" asChild>
          <a href="/history" className="flex items-center gap-2">
            View History
          </a>
        </Button>
      )}
    </div>
  );
}