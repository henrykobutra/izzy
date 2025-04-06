'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Loader2 } from 'lucide-react';

import { NavBar } from '@/components/ui/nav-bar';
import { Footer } from '@/components/ui/footer';

export default function StrategyRedirectPage() {
  const router = useRouter();

  useEffect(() => {
    // Always redirect to the interviews page since we don't need search params anymore
    router.replace('/interviews');
  }, [router]);

  return (
    <div className="flex min-h-screen flex-col">
      <NavBar activePath="/interviews" />
      
      <main className="flex-1 flex items-center justify-center py-12">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="h-12 w-12 animate-spin text-primary" />
          <p className="text-lg font-medium">Redirecting...</p>
        </div>
      </main>
      
      <Footer />
    </div>
  );
}