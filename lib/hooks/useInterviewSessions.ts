import { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase';
import { useAuth } from '@/lib/hooks/useAuth';

export type InterviewStatus = 'not_started' | 'in_progress' | 'completed' | 'planned';

export interface InterviewSession {
  id: string;
  title: string;
  date: Date;
  status: InterviewStatus;
  score?: number;
  strategy?: {
    job_analysis?: {
      title?: string;
      company?: string;
      required_skills?: Array<{
        skill: string;
        context: string;
        importance: string;
      }>;
      preferred_skills?: Array<{
        skill: string;
        context: string;
        importance: string;
      }>;
      experience_requirements?: {
        level: string;
        min_years: number;
        preferred_years: number;
      };
    };
    interview_strategy?: {
      focus_areas?: Array<{
        name: string;
        weight: number;
        description: string;
      }>;
      weaknesses_to_address?: Array<{
        skill: string;
        suggestion: string;
      }>;
      strengths_to_highlight?: Array<{
        skill: string;
        context: string;
      }>;
      recommended_preparation?: string[];
    };
    recommended_questions?: Array<{
      difficulty: string;
      focus_area: string;
      question_text: string;
      question_type: string;
      related_skill: string;
    }>;
  };
}

export function useInterviewSessions() {
  const [interviewSessions, setInterviewSessions] = useState<InterviewSession[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();
  const supabase = createClient();

  useEffect(() => {
    // Load interview sessions from Supabase
    const loadInterviewSessions = async () => {
      if (!user) {
        setLoading(false);
        return;
      }

      setLoading(true);

      try {
        // Get interview sessions with related job postings
        const { data: sessions, error } = await supabase
          .from('interview_sessions')
          .select(`
            *,
            job_postings (
              title,
              company
            )
          `)
          .eq('profile_id', user.id)
          .order('created_at', { ascending: false })
          .limit(10);

        if (error) {
          console.error('Error fetching interview sessions:', error);
          return;
        }

        // Get overall scores
        let sessionsWithScores: InterviewSession[] = [];
        if (sessions && sessions.length > 0) {
          sessionsWithScores = sessions.map((session) => {
            // Extract job title from the job posting or use a fallback
            const jobTitle = session.job_postings?.title || 'Interview Session';
            const company = session.job_postings?.company;
            const sessionTitle = company ? `${jobTitle} at ${company}` : jobTitle;
            
            // Convert from Supabase format to our app format
            return {
              id: session.id,
              title: sessionTitle,
              date: new Date(session.created_at),
              status: (session.status as InterviewStatus) || 'planned',
              score: session.strategy?.overall_score || undefined,
              strategy: session.strategy
            };
          });
        }

        setInterviewSessions(sessionsWithScores);
      } catch (error) {
        console.error('Error in loadInterviewSessions:', error);
      } finally {
        setLoading(false);
      }
    };

    loadInterviewSessions();
  }, [user, supabase]);

  const updateSessionStatus = async (
    sessionId: string, 
    status: InterviewStatus, 
    additionalData: Partial<InterviewSession> = {}
  ) => {
    // Update local state
    setInterviewSessions(prev => {
      const sessionIndex = prev.findIndex(session => session.id === sessionId);
      if (sessionIndex === -1) return prev;
      
      const updatedSessions = [...prev];
      updatedSessions[sessionIndex] = {
        ...updatedSessions[sessionIndex],
        status,
        ...additionalData
      };
      
      return updatedSessions;
    });

    // Update in database
    if (user) {
      try {
        const { error } = await supabase
          .from('interview_sessions')
          .update({ 
            status,
            // If we're updating with a score, store it in the strategy JSON
            ...(additionalData.score ? { 
              strategy: { overall_score: additionalData.score } 
            } : {})
          })
          .eq('id', sessionId)
          .eq('profile_id', user.id);

        if (error) {
          console.error('Error updating session status:', error);
        }
      } catch (error) {
        console.error('Error in updateSessionStatus:', error);
      }
    }
  };

  const addNewSession = async (sessionData: Partial<InterviewSession> & { id: string }) => {
    // Add to local state first for immediate UI update
    setInterviewSessions(prev => [
      {
        id: sessionData.id,
        title: sessionData.title || 'Interview Session',
        date: sessionData.date || new Date(),
        status: sessionData.status || 'planned',
        score: sessionData.score
      },
      ...prev
    ]);

    // Note: In this application, sessions are typically created by the strategist agent
    // in the backend, not directly through this hook. This function is primarily for
    // updating the local state after a session has been created.
  };

  return {
    interviewSessions,
    setInterviewSessions,
    updateSessionStatus,
    addNewSession,
    loading
  };
}