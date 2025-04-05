'use client';

import { NavBar } from '@/components/ui/nav-bar';
import { Footer } from '@/components/ui/footer';
import { Skeleton } from '@/components/ui/skeleton';

export function PageSkeleton() {
  return (
    <div className="flex min-h-screen flex-col">
      <NavBar activePath="/resume" />
      
      <main className="flex-1 container max-w-screen-xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex flex-col gap-8">
          {/* Page header skeleton */}
          <div className="flex flex-col gap-2">
            <Skeleton className="h-9 w-64" />
            <Skeleton className="h-5 w-96" />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Main content skeleton */}
            <div className="md:col-span-2">
              <Skeleton className="h-[600px] w-full rounded-lg" />
            </div>

            {/* Info card skeleton */}
            <div className="md:col-span-1">
              <Skeleton className="h-[400px] w-full rounded-lg" />
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}