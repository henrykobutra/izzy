'use client';

import React from 'react';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';

interface HistoryHeaderProps {
  totalInterviews: number;
  selectedPeriod: 'week' | 'month' | 'all';
  onPeriodChange: (value: 'week' | 'month' | 'all') => void;
}

export function HistoryHeader({ 
  selectedPeriod, 
  onPeriodChange 
}: HistoryHeaderProps) {
  return (
    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
      <div className="space-y-1">
        <h1 className="text-3xl font-bold tracking-tight">Interview History</h1>
        <p className="text-muted-foreground">
          Track your performance and progress over time
        </p>
      </div>
      
      <div className="flex items-center gap-2">
        <Tabs 
          value={selectedPeriod}
          onValueChange={(value) => onPeriodChange(value as 'week' | 'month' | 'all')}
          className="w-full sm:w-auto"
        >
          <TabsList>
            <TabsTrigger value="week">This Week</TabsTrigger>
            <TabsTrigger value="month">30 Days</TabsTrigger>
            <TabsTrigger value="all">All Time</TabsTrigger>
          </TabsList>
        </Tabs>
      </div>
    </div>
  );
}