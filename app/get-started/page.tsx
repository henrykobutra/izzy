'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Loader2 } from 'lucide-react';

import { useAuth } from '@/lib/hooks/useAuth';
import { NavBar } from '@/components/ui/nav-bar';
import { Footer } from '@/components/ui/footer';

export default function GetStartedPage() {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    // If not authenticated, redirect to sign-in
    if (!loading && !user) {
      router.push('/sign-in');
    }
  }, [user, loading, router]);

  return (
    <div className="flex min-h-screen flex-col">
      <NavBar activePath="/get-started" />
      
      <main className="flex-1 flex items-center justify-center py-12">
        {loading ? (
          <div className="flex flex-col items-center gap-4">
            <Loader2 className="h-12 w-12 animate-spin text-primary" />
            <p className="text-lg font-medium">Loading your profile...</p>
          </div>
        ) : (
          <div className="container max-w-screen-xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex flex-col items-center justify-center space-y-8 text-center">
              <div className="space-y-3 max-w-3xl mx-auto">
                <h1 className="text-3xl font-bold tracking-tighter sm:text-4xl">
                  Welcome{user?.email ? `, ${user.email.split('@')[0]}` : ''}!
                </h1>
                <p className="mx-auto max-w-[700px] text-muted-foreground text-lg">
                  This is where you&apos;ll upload your resume and job description to begin your interview preparation.
                </p>
                <p className="text-muted-foreground">
                  Coming soon: Resume upload functionality
                </p>
              </div>
            </div>
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
}