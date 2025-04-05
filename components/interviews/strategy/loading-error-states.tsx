'use client';

import { Loader2, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { NavBar } from '@/components/ui/nav-bar';
import { Footer } from '@/components/ui/footer';

interface LoadingStateProps {
  message?: string;
}

export function LoadingState({ message = 'Loading your profile...' }: LoadingStateProps) {
  return (
    <div className="flex min-h-screen flex-col">
      <NavBar activePath="/interviews" />

      <main className="flex-1 flex items-center justify-center py-12">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="h-12 w-12 animate-spin text-primary" />
          <p className="text-lg font-medium">{message}</p>
        </div>
      </main>

      <Footer />
    </div>
  );
}

interface ErrorStateProps {
  error: string;
  onReturn: () => void;
}

export function ErrorState({ error, onReturn }: ErrorStateProps) {
  return (
    <Card className="border-red-200">
      <CardHeader>
        <div className="flex items-center gap-2 text-red-500">
          <AlertCircle className="h-5 w-5" />
          <CardTitle>Strategy Error</CardTitle>
        </div>
      </CardHeader>
      <CardContent>
        <p>There was a problem loading your strategy data. {error}</p>
        <Button onClick={onReturn} variant="outline" className="mt-4">
          Return to Interviews
        </Button>
      </CardContent>
    </Card>
  );
}