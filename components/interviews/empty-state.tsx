'use client';

import { Button } from '@/components/ui/button';
import { Calendar, Clock } from 'lucide-react';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle
} from '@/components/ui/card';

export function EmptyState() {
  return (
    <Card className="border-2 border-dashed">
      <CardHeader className="text-center pb-2">
        <CardTitle>No Interview History Yet</CardTitle>
        <CardDescription>
          Complete your first mock interview to see your performance history
        </CardDescription>
      </CardHeader>
      <CardContent className="pb-2">
        <div className="flex justify-center py-8">
          <div className="flex flex-col items-center gap-6 max-w-md text-center">
            <div className="flex items-center justify-center h-24 w-24 rounded-full bg-muted">
              <Clock className="h-12 w-12 text-muted-foreground/60" />
            </div>
            <div className="space-y-2">
              <h3 className="text-xl font-semibold">Get Started with Interview Practice</h3>
              <p className="text-muted-foreground">
                After completing interviews, you&apos;ll see your scores, feedback, and progress over time in this dashboard.
              </p>
            </div>
          </div>
        </div>
      </CardContent>
      <CardFooter className="justify-center pt-2 pb-6">
        <Button asChild>
          <a href="/interviews" className="gap-2">
            <Calendar className="h-4 w-4" />
            Schedule a Mock Interview
          </a>
        </Button>
      </CardFooter>
    </Card>
  );
}