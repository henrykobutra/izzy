"use client";

import { useStrategyPage } from "@/lib/hooks/useStrategyPage";
import { NavBar } from "@/components/ui/nav-bar";
import { Footer } from "@/components/ui/footer";
import { StrategyPageHeader } from "@/components/interviews/strategy/page-header";
import { StrategyCard } from "@/components/interviews/strategy/strategy-card";
import { AgentCards } from "@/components/interviews/strategy/agent-cards";
import { ErrorState } from "@/components/interviews/strategy/loading-error-states";

export default function StrategyPage() {
  const {
    authLoading,
    router,
    sessionId,
    strategy,
    sessionData,
    loading,
    error,
    processStrategyData
  } = useStrategyPage();

  if (authLoading) {
    return <div className="flex min-h-screen flex-col">
      <NavBar activePath="/interviews" />
      <main className="flex-1 flex items-center justify-center py-12">
        <div className="flex flex-col items-center gap-4">
          <div className="animate-spin h-12 w-12 border-4 border-primary rounded-full border-t-transparent" />
          <p className="text-lg font-medium">Loading your profile...</p>
        </div>
      </main>
      <Footer />
    </div>;
  }

  return (
    <div className="flex min-h-screen flex-col">
      <NavBar activePath="/interviews" />

      <main className="flex-1 container max-w-screen-xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="space-y-6">
          {/* Page header with back button */}
          <StrategyPageHeader sessionData={sessionData} />

          {loading ? (
            <div className="flex items-center justify-center py-12">
              <div className="flex flex-col items-center gap-4">
                <div className="animate-spin h-12 w-12 border-4 border-primary rounded-full border-t-transparent" />
                <p className="text-lg font-medium">Loading strategy data...</p>
              </div>
            </div>
          ) : error ? (
            <ErrorState error={error} onReturn={() => router.push("/interviews")} />
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Use processStrategyData once and reuse the result */}
              {(() => {
                const processedStrategy = processStrategyData();
                return (
                  <>
                    {/* Strategy Card */}
                    <StrategyCard 
                      sessionId={sessionId} 
                      strategy={processedStrategy} 
                    />

                    {/* Agent Cards */}
                    <AgentCards
                      estimatedDuration={processedStrategy.interviewPlan.estimated_duration}
                      questionCount={processedStrategy.interviewPlan.question_count}
                      preparationTips={strategy.interview_strategy?.recommended_preparation}
                      skillGaps={processedStrategy.skillsMatch.gaps}
                    />
                  </>
                );
              })()}
            </div>
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
}