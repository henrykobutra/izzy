'use client';

import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { SessionData } from '@/types/strategy';

interface PageHeaderProps {
  sessionData: SessionData | null;
}

export function StrategyPageHeader({ sessionData }: PageHeaderProps) {
  return (
    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
      <div className="space-y-1">
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="sm" className="gap-1" asChild>
            <Link href="/interviews">
              <ArrowLeft className="h-4 w-4" />
              <span>Back</span>
            </Link>
          </Button>
        </div>
        <h1 className="text-3xl font-bold tracking-tight">Interview Strategy</h1>
        {sessionData && (
          <p className="text-muted-foreground">
            {sessionData.title} <span className="text-sm">• {sessionData.date}</span>
          </p>
        )}
      </div>
    </div>
  );
}