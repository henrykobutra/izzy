'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { 
  BarChart4,
  Calendar,
  CheckCircle,
  Download,
  Loader2,
  TrendingUp
} from 'lucide-react';

import { useAuth } from '@/lib/hooks/useAuth';
import { useHistorySessions } from '@/lib/hooks/useHistorySessions';
import { NavBar } from '@/components/ui/nav-bar';
import { Footer } from '@/components/ui/footer';
import { Button } from '@/components/ui/button';
import { LoadingState } from '@/components/interviews/loading-state';
import { EmptyState } from '@/components/interviews/empty-state';
import { HistoryHeader } from '@/components/interviews/history-header';
import { HistoryItem } from '@/components/interviews/history-item';
import { StatsCard } from '@/components/interviews/stats-card';
import { SkillProgress } from '@/components/interviews/skill-progress';
import { FeedbackSummary } from '@/components/interviews/feedback-summary';

export default function HistoryPage() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const {
    isDataLoading,
    filteredSessions,
    selectedPeriod,
    setSelectedPeriod,
    averageScore,
    topSkills,
    commonImprovements,
    skillScores,
    deleteSession
  } = useHistorySessions();

  useEffect(() => {
    // If not authenticated, redirect to sign-in
    if (!loading && !user) {
      router.push('/sign-in');
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
          <HistoryHeader 
            totalInterviews={filteredSessions.length}
            selectedPeriod={selectedPeriod}
            onPeriodChange={setSelectedPeriod}
          />

          {isDataLoading ? (
            <div className="flex items-center justify-center py-12">
              <div className="flex flex-col items-center gap-4">
                <Loader2 className="h-12 w-12 animate-spin text-primary" />
                <p className="text-lg font-medium">Loading interview history...</p>
              </div>
            </div>
          ) : filteredSessions.length === 0 ? (
            <EmptyState />
          ) : (
            // History and performance data
            <>
              {/* Performance overview cards */}
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
                <StatsCard 
                  title="Total Interviews"
                  value={filteredSessions.length}
                  icon={<Calendar className="h-4 w-4 text-primary" />}
                />
                <StatsCard 
                  title="Average Score"
                  value={averageScore}
                  suffix="/ 5"
                  icon={<BarChart4 className="h-4 w-4 text-primary" />}
                />
                <StatsCard 
                  title="Top Skill"
                  value={topSkills[0] || 'N/A'}
                  icon={<CheckCircle className="h-4 w-4 text-green-600 dark:text-green-400" />}
                />
                <StatsCard 
                  title="To Improve"
                  value={commonImprovements[0] || 'N/A'}
                  icon={<TrendingUp className="h-4 w-4 text-amber-600 dark:text-amber-400" />}
                />
              </div>

              {/* Interview history */}
              <div>
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-xl font-semibold">Recent Interviews</h2>
                  <Button variant="outline" size="sm" className="gap-2">
                    <Download className="h-4 w-4" />
                    <span className="sr-only sm:not-sr-only">Export</span>
                  </Button>
                </div>

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

              {/* Skills and progress analysis */}
              {filteredSessions.filter(session => session.status === 'completed').length > 0 && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <SkillProgress skillScores={skillScores} />
                  <FeedbackSummary commonImprovements={commonImprovements} />
                </div>
              )}
            </>
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
}