"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { BarChart4, Calendar, Loader2 } from "lucide-react";

import { useAuth } from "@/lib/hooks/useAuth";
import { useHistorySessions } from "@/lib/hooks/useHistorySessions";
import { NavBar } from "@/components/ui/nav-bar";
import { Footer } from "@/components/ui/footer";
import { LoadingState } from "@/components/interviews/loading-state";
import { EmptyState } from "@/components/interviews/empty-state";
import { HistoryHeader } from "@/components/interviews/history-header";
import { HistoryItem } from "@/components/interviews/history-item";
import { StatsCard } from "@/components/interviews/stats-card";

export default function HistoryPage() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const {
    isDataLoading,
    filteredSessions,
    averageScore,
    deleteSession,
  } = useHistorySessions();

  useEffect(() => {
    // If not authenticated, redirect to sign-in
    if (!loading && !user) {
      router.push("/sign-in");
    }
  }, [user, loading, router]);

  if (loading) {
    return <LoadingState />;
  }

  return (
    <div className="flex min-h-screen flex-col">
      <NavBar activePath="/history" />

      <main className="flex-1 container max-w-screen-xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex flex-col gap-8">
          {/* Page header */}
          <HistoryHeader />

          {isDataLoading ? (
            <div className="flex items-center justify-center py-12">
              <div className="flex flex-col items-center gap-4">
                <Loader2 className="h-12 w-12 animate-spin text-primary" />
                <p className="text-lg font-medium">
                  Loading interview history...
                </p>
              </div>
            </div>
          ) : filteredSessions.length === 0 ? (
            <EmptyState />
          ) : (
            // History and performance data
            <>
              {/* Stats overview */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <StatsCard
                  title="Total Interviews"
                  value={filteredSessions.length}
                  icon={<Calendar className="h-4 w-4 text-primary" />}
                />
                <StatsCard
                  title="Average Score"
                  value={averageScore}
                  suffix="/10"
                  icon={<BarChart4 className="h-4 w-4 text-primary" />}
                />
              </div>

              {/* Interview history */}
              <div>
                <h2 className="text-xl font-semibold mb-4">
                  Interview History
                </h2>

                <div className="space-y-4">
                  {filteredSessions.map((session) => (
                    <HistoryItem
                      key={session.id}
                      session={session}
                      onDelete={deleteSession}
                    />
                  ))}
                </div>
              </div>
            </>
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
}