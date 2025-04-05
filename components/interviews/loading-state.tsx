'use client';

import { Loader2 } from 'lucide-react';
import { NavBar } from '@/components/ui/nav-bar';
import { Footer } from '@/components/ui/footer';

export function LoadingState() {
  return (
    <div className="flex min-h-screen flex-col">
      <NavBar activePath="/interviews" />
      
      <main className="flex-1 flex items-center justify-center py-12">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="h-12 w-12 animate-spin text-primary" />
          <p className="text-lg font-medium">Loading your interview data...</p>
        </div>
      </main>

      <Footer />
    </div>
  );
}