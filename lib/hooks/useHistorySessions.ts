'use client';

import { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase';
import { useAuth } from '@/lib/hooks/useAuth';
import { HistoryItemSession } from '@/components/interviews/history-item';

export interface SkillScore {
  skill: string;
  averageScore: number;
}

export function useHistorySessions() {
  const [interviewSessions, setInterviewSessions] = useState<HistoryItemSession[]>([]);
  const [isDataLoading, setIsDataLoading] = useState(true);
  const [selectedPeriod, setSelectedPeriod] = useState<'week' | 'month' | 'all'>('month');
  const { user } = useAuth();
  const supabase = createClient();

  // Load interview sessions
  useEffect(() => {
    // Load interview sessions
    const loadInterviewSessions = async () => {
      if (!user) return;
      
      setIsDataLoading(true);
      
      try {
        // Fetch interview sessions with related data
        const { data: sessions, error } = await supabase
          .from('interview_sessions')
          .select(`
            id,
            created_at,
            status,
            strategy,
            job_posting_id,
            job_posting:job_postings(id, title, company, parsed_requirements)
          `)
          .eq('profile_id', user.id)
          .order('created_at', { ascending: false });
          
        if (error) {
          console.error('Error fetching interview sessions:', error);
          setInterviewSessions([]);
          setIsDataLoading(false);
          return;
        }
        
        // For each session, fetch questions, answers and evaluations
        const sessionsWithDetails = await Promise.all(
          sessions.map(async (session) => {
            const { data: questions, error: questionsError } = await supabase
              .from('interview_questions')
              .select(`
                id,
                question_text,
                question_type,
                related_skill,
                answers:user_answers(
                  id,
                  answer_text,
                  evaluations:evaluations(
                    overall_score,
                    clarity_score,
                    relevance_score,
                    feedback,
                    improvement_suggestions
                  )
                )
              `)
              .eq('session_id', session.id)
              .order('question_order', { ascending: true });
              
            if (questionsError) {
              console.error('Error fetching questions:', questionsError);
              return {
                ...session,
                questions: []
              };
            }
            
            return {
              ...session,
              questions: questions || []
            };
          })
        );
        
        // Cast to HistoryItemSession[] with type assertion after ensuring data has the right shape
        setInterviewSessions(sessionsWithDetails.map(session => {
          // Extract job posting from array if it exists
          const jobPosting = Array.isArray(session.job_posting) && session.job_posting.length > 0 
            ? session.job_posting[0] 
            : { id: '', title: '', company: null, parsed_requirements: null };
            
          return {
            ...session,
            job_posting: {
              id: jobPosting.id || '',
              title: jobPosting.title || '',
              company: jobPosting.company || null,
              parsed_requirements: jobPosting.parsed_requirements || null
            }
          };
        }) as unknown as HistoryItemSession[]);
      } catch (error) {
        console.error('Error loading interview history:', error);
        setInterviewSessions([]);
      } finally {
        setIsDataLoading(false);
      }
    };
    
    if (user) {
      loadInterviewSessions();
    }
  }, [user, supabase]);

  // Filter history based on selected period
  const getFilteredSessions = () => {
    return interviewSessions.filter(session => {
      const now = new Date();
      const sessionDate = new Date(session.created_at);
      
      switch (selectedPeriod) {
        case 'week':
          const weekAgo = new Date(now);
          weekAgo.setDate(now.getDate() - 7);
          return sessionDate >= weekAgo;
        case 'month':
          const monthAgo = new Date(now);
          monthAgo.setDate(now.getDate() - 30);
          return sessionDate >= monthAgo;
        case 'all':
        default:
          return true;
      }
    });
  };

  // Calculate average score across completed interviews
  const getAverageScore = (sessions: HistoryItemSession[]) => {
    const completedSessions = sessions.filter(session => session.status === 'completed');
    
    // Calculate average score across all sessions
    return completedSessions.length > 0
      ? Number((completedSessions.reduce((sum, session) => {
          return sum + getSessionAverageScore(session);
        }, 0) / completedSessions.length).toFixed(1))
      : 0;
  };

  // Helper function to calculate average score for a session
  const getSessionAverageScore = (session: HistoryItemSession): number => {
    let totalScore = 0;
    let totalEvaluations = 0;
    
    session.questions.forEach(question => {
      question.answers.forEach(answer => {
        answer.evaluations.forEach(evaluation => {
          if (evaluation.overall_score) {
            totalScore += evaluation.overall_score;
            totalEvaluations++;
          }
        });
      });
    });
    
    return totalEvaluations > 0 ? totalScore / totalEvaluations : 0;
  };

  // Get all skills assessed across interviews
  const getAllSkills = (sessions: HistoryItemSession[]) => {
    const skills: Record<string, number> = {};
    
    sessions.forEach(session => {
      // Get skills from job posting requirements
      const technicalSkills = session.job_posting?.parsed_requirements?.technical || [];
      const softSkills = session.job_posting?.parsed_requirements?.soft || [];
      
      [...technicalSkills, ...softSkills].forEach(skill => {
        skills[skill] = (skills[skill] || 0) + 1;
      });
      
      // Get skills from questions
      session.questions.forEach(question => {
        if (question.related_skill) {
          skills[question.related_skill] = (skills[question.related_skill] || 0) + 1;
        }
      });
    });
    
    return Object.entries(skills)
      .sort((a, b) => b[1] - a[1])
      .map(([skill]) => skill);
  };

  // Get common improvement areas
  const getCommonImprovements = (sessions: HistoryItemSession[]) => {
    const improvements: Record<string, number> = {};
    
    sessions.forEach(session => {
      session.questions.forEach(question => {
        question.answers.forEach(answer => {
          answer.evaluations.forEach(evaluation => {
            if (evaluation.improvement_suggestions) {
              const suggestions = evaluation.improvement_suggestions.split(/[.,;]/)
                .map(s => s.trim())
                .filter(s => s.length > 0);
                
              suggestions.forEach(suggestion => {
                improvements[suggestion] = (improvements[suggestion] || 0) + 1;
              });
            }
          });
        });
      });
    });
    
    return Object.entries(improvements)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 3)
      .map(([improvement]) => improvement);
  };

  // Calculate skill scores
  const getSkillScores = (sessions: HistoryItemSession[]) => {
    const skills: Record<string, { score: number, count: number }> = {};
    
    sessions.forEach(session => {
      session.questions.forEach(question => {
        if (question.related_skill) {
          const skill = question.related_skill;
          
          if (!skills[skill]) {
            skills[skill] = { score: 0, count: 0 };
          }
          
          question.answers.forEach(answer => {
            answer.evaluations.forEach(evaluation => {
              if (evaluation.overall_score) {
                skills[skill].score += evaluation.overall_score;
                skills[skill].count += 1;
              }
            });
          });
        }
      });
    });
    
    // Calculate average score for each skill
    return Object.entries(skills)
      .map(([skill, { score, count }]) => ({
        skill,
        averageScore: count > 0 ? score / count : 0
      }))
      .sort((a, b) => b.averageScore - a.averageScore)
      .slice(0, 4);
  };

  // Handle delete session
  const deleteSession = (sessionId: string) => {
    setInterviewSessions(prev => prev.filter(s => s.id !== sessionId));
  };

  const filteredSessions = getFilteredSessions();
  const averageScore = getAverageScore(filteredSessions);
  const topSkills = getAllSkills(filteredSessions);
  const commonImprovements = getCommonImprovements(filteredSessions);
  const skillScores = getSkillScores(filteredSessions);

  return {
    isDataLoading,
    interviewSessions,
    filteredSessions,
    selectedPeriod,
    setSelectedPeriod,
    averageScore,
    topSkills,
    commonImprovements,
    skillScores,
    deleteSession
  };
}