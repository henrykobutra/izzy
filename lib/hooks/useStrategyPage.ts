import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { useAuth } from '@/lib/hooks/useAuth';
import { createClient } from '@/lib/supabase';
import { Strategy, ProcessedStrategyData, SessionData } from '@/types/strategy';
import { 
  DEFAULT_FOCUS_AREAS,
  DEFAULT_INTERVIEW_DURATION,
  DEFAULT_QUESTION_COUNT
} from '@/components/interviews/strategy/constants';

export function useStrategyPage() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const params = useParams();
  const sessionId = params.id as string;

  const [strategy, setStrategy] = useState<Strategy>({});
  const [sessionData, setSessionData] = useState<SessionData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // If not authenticated, redirect to sign-in
    if (!authLoading && !user) {
      router.push('/sign-in');
    }
  }, [user, authLoading, router]);

  useEffect(() => {
    async function fetchStrategy() {
      if (!sessionId || !user) {
        return;
      }

      try {
        setLoading(true);
        // Fetch the latest strategy from the session using server action
        const { getInterviewStrategy } = await import('@/lib/actions/get-interview-strategy');
        const result = await getInterviewStrategy(sessionId);

        if (result.success && result.strategy) {
          setStrategy(result.strategy);

          // Fetch session metadata
          const supabase = createClient();
          const { data } = await supabase
            .from('interview_sessions')
            .select('created_at, title, job_postings(title, company)')
            .eq('id', sessionId)
            .single();

          if (data) {
            // Format session data
            // Define the type for job_postings
            interface JobPosting {
              title: string;
              company?: string;
            }

            // Handle job_postings safely
            let jobPosting: JobPosting | null = null;

            // First convert to unknown to safely cast
            if (data.job_postings) {
              // Handle possible array or object format
              if (Array.isArray(data.job_postings) && data.job_postings.length > 0) {
                jobPosting = {
                  title: data.job_postings[0].title,
                  company: data.job_postings[0].company,
                };
              } else if (typeof data.job_postings === 'object') {
                jobPosting = data.job_postings as unknown as JobPosting;
              }
            }
            const title =
              data.title ||
              (jobPosting
                ? jobPosting.company
                  ? `${jobPosting.title} at ${jobPosting.company}`
                  : jobPosting.title
                : 'Interview Session');

            setSessionData({
              title,
              date: new Date(data.created_at).toLocaleDateString('en-US', {
                year: 'numeric',
                month: 'short',
                day: 'numeric',
              }),
            });
          }
        } else {
          throw new Error(result.error || 'Failed to load strategy');
        }
      } catch (err) {
        console.error('Error fetching strategy:', err);
        setError(err instanceof Error ? err.message : 'Failed to load strategy data');
      } finally {
        setLoading(false);
      }
    }

    fetchStrategy();
  }, [sessionId, user]);

  // Process the strategy data to handle different formats
  const processStrategyData = (): ProcessedStrategyData => {
    // Normalize job analysis data
    const jobAnalysis = {
      title: strategy.job_analysis?.title || sessionData?.title || 'Role Analysis',
      // Convert null to undefined to match the expected type
      company: strategy.job_analysis?.company === null ? undefined : strategy.job_analysis?.company,
      level:
        strategy.job_analysis?.experience_requirements?.level ||
        strategy.job_analysis?.level ||
        'Mid-Level',
      requirements: strategy.job_analysis?.required_skills?.map((r) => r.skill) ||
        strategy.job_analysis?.requirements || [
          'Technical skills',
          'Communication',
          'Problem solving',
        ],
      skills_needed: strategy.job_analysis?.preferred_skills?.map(
        (s) => s.skill
      ) ||
        strategy.job_analysis?.skills_needed || ['Job-specific skills'],
    };

    // Normalize skills match data
    const skillsMatch = {
      strong_matches: (strategy.skills_mapping?.strong_matches || []).map(
        (match) => ({
          skill: `${match.resume_skill} → ${match.job_skill}`,
          experience: match.experience_years
            ? `${match.experience_years} years`
            : undefined,
        })
      ),
      areas_to_highlight: (strategy.skills_mapping?.partial_matches || []).map(
        (match) => ({
          skill: match.resume_skill,
          note: match.gap_description,
        })
      ),
      gaps: (strategy.skills_mapping?.gaps || []).map((gap) => ({
        skill: gap.job_skill,
        mitigation: gap.recommendation,
      })),
    };

    // If we don't have the new format data, use the old format
    if (skillsMatch.strong_matches.length === 0 && strategy.skills_match) {
      skillsMatch.strong_matches = (
        strategy.skills_match.strong_matches || []
      ).map((match) => ({
        skill: match.skill,
        experience: match.experience || undefined,
      }));
      skillsMatch.areas_to_highlight = (
        strategy.skills_match.areas_to_highlight || []
      ).map((area) => ({
        skill: area.skill,
        note: area.note || '',
      }));
      skillsMatch.gaps = (strategy.skills_match.gaps || []).map((gap) => ({
        skill: gap.skill,
        mitigation: gap.mitigation || '',
      }));
    }

    // Normalize interview plan data
    const interviewPlan = {
      focus_areas: strategy.interview_strategy?.focus_areas ||
        strategy.interview_plan?.focus_areas || DEFAULT_FOCUS_AREAS,
      estimated_duration:
        strategy.interview_plan?.estimated_duration || DEFAULT_INTERVIEW_DURATION,
      question_count:
        strategy.recommended_questions?.length ||
        strategy.interview_plan?.question_count ||
        DEFAULT_QUESTION_COUNT,
    };

    return {
      jobAnalysis,
      skillsMatch,
      interviewPlan
    };
  };

  return {
    user,
    authLoading,
    router,
    sessionId,
    strategy,
    sessionData,
    loading,
    error,
    processStrategyData
  };
}