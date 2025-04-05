'use client';

import { ReactNode } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';

interface StatsCardProps {
  title: string;
  value: string | number;
  icon: ReactNode;
  suffix?: string;
}

export function StatsCard({ title, value, icon, suffix }: StatsCardProps) {
  return (
    <Card>
      <CardHeader className="p-4 pb-2">
        <CardTitle className="text-sm font-medium text-muted-foreground">
          {title}
        </CardTitle>
      </CardHeader>
      <CardContent className="p-4 pt-0">
        <div className="flex items-center justify-between">
          <div className="text-2xl font-bold">
            {value}
            {suffix && <span className="text-sm font-normal text-muted-foreground"> {suffix}</span>}
          </div>
          <div className="flex items-center justify-center h-8 w-8 rounded-full bg-primary/10">
            {icon}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}