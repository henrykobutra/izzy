'use client';

import {
  Tabs,
  TabsList,
  TabsTrigger
} from '@/components/ui/tabs';

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
        <Tabs defaultValue="current" className="w-full sm:w-auto">
          <TabsList>
            <TabsTrigger value="current">Current</TabsTrigger>
            <TabsTrigger value="past">Past Interviews</TabsTrigger>
          </TabsList>
        </Tabs>
      )}
    </div>
  );
}