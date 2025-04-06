"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase";
import { useAuth } from "@/lib/hooks/useAuth";
import { HistoryItemSession } from "@/components/interviews/history-item";

export interface SkillScore {
  skill: string;
  averageScore: number;
}

export function useHistorySessions() {
  const [interviewSessions, setInterviewSessions] = useState<
    HistoryItemSession[]
  >([]);
  const [isDataLoading, setIsDataLoading] = useState(true);
  const { user } = useAuth();
  const supabase = createClient();

  // Load interview sessions
  useEffect(() => {
    const loadInterviewSessions = async () => {
      if (!user) return;

      setIsDataLoading(true);

      try {
        // Fetch interview sessions with related data
        const { data: sessions, error } = await supabase
          .from("interview_sessions")
          .select(
            `
            id,
            created_at,
            status,
            strategy,
            job_posting:job_postings(id, title, company, parsed_requirements)
          `
          )
          .eq("profile_id", user.id)
          .order("created_at", { ascending: false });

        if (error) {
          console.error("Error fetching interview sessions:", error);
          setInterviewSessions([]);
          setIsDataLoading(false);
          return;
        }

        // For each session, fetch questions, answers and evaluations
        const sessionsWithDetails = await Promise.all(
          sessions.map(async (session) => {
            const { data: questions, error: questionsError } = await supabase
              .from("interview_questions")
              .select(
                `
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
              `
              )
              .eq("session_id", session.id)
              .order("question_order", { ascending: true });

            if (questionsError) {
              console.error("Error fetching questions:", questionsError);
              return {
                ...session,
                questions: [],
              };
            }

            return {
              ...session,
              questions: questions || [],
            };
          })
        );

        // Cast to HistoryItemSession[] with type assertion after ensuring data has the right shape
        setInterviewSessions(
          sessionsWithDetails.map((session) => {
            // Handle job posting data correctly
            const jobPosting = Array.isArray(session.job_posting)
              ? session.job_posting[0]
              : session.job_posting;

            return {
              id: session.id,
              created_at: session.created_at,
              status: session.status,
              strategy: session.strategy,
              job_posting: {
                id: jobPosting?.id || "",
                title: jobPosting?.title || "Interview Session",
                company: jobPosting?.company || null,
                parsed_requirements: jobPosting?.parsed_requirements || null,
              },
              questions: session.questions || [],
            } as HistoryItemSession;
          }) as HistoryItemSession[]
        );
      } catch (error) {
        console.error("Error loading interview history:", error);
        setInterviewSessions([]);
      } finally {
        setIsDataLoading(false);
      }
    };

    if (user) {
      loadInterviewSessions();
    }
  }, [user, supabase]);

  // All sessions
  const filteredSessions = interviewSessions;

  // Calculate average score across completed interviews
  const averageScore = (() => {
    const completedSessions = filteredSessions.filter(
      (session) => session.status === "completed"
    );

    if (completedSessions.length === 0) return 0;

    const total = completedSessions.reduce((sum, session) => {
      let sessionTotal = 0;
      let sessionCount = 0;

      session.questions.forEach((question) => {
        if (!question.answers) return;

        question.answers.forEach((answer) => {
          if (!answer.evaluations) return;

          answer.evaluations.forEach((evaluation) => {
            if (evaluation.overall_score) {
              sessionTotal += evaluation.overall_score;
              sessionCount++;
            }
          });
        });
      });

      return sum + (sessionCount > 0 ? sessionTotal / sessionCount : 0);
    }, 0);

    return Number((total / completedSessions.length).toFixed(1));
  })();

  // Get all skills assessed across interviews
  const topSkills = (() => {
    const skills: Record<string, number> = {};

    filteredSessions.forEach((session) => {
      // Get skills from job posting requirements
      const technicalSkills =
        session.job_posting?.parsed_requirements?.technical || [];
      const softSkills = session.job_posting?.parsed_requirements?.soft || [];

      [...technicalSkills, ...softSkills].forEach((skill) => {
        skills[skill] = (skills[skill] || 0) + 1;
      });

      // Get skills from questions
      session.questions?.forEach((question) => {
        if (question.related_skill) {
          skills[question.related_skill] =
            (skills[question.related_skill] || 0) + 1;
        }
      });
    });

    return Object.entries(skills)
      .sort((a, b) => b[1] - a[1])
      .map(([skill]) => skill);
  })();

  // Get common improvement areas
  const commonImprovements = (() => {
    const improvements: Record<string, number> = {};

    filteredSessions.forEach((session) => {
      session.questions?.forEach((question) => {
        question.answers?.forEach((answer) => {
          answer.evaluations?.forEach((evaluation) => {
            if (evaluation.improvement_suggestions) {
              const suggestions = evaluation.improvement_suggestions
                .split(/[.,;]/)
                .map((s) => s.trim())
                .filter((s) => s.length > 0);

              suggestions.forEach((suggestion) => {
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
  })();

  // Calculate skill scores
  const skillScores = (() => {
    const skills: Record<string, { score: number; count: number }> = {};

    filteredSessions.forEach((session) => {
      session.questions?.forEach((question) => {
        if (question.related_skill) {
          const skill = question.related_skill;

          if (!skills[skill]) {
            skills[skill] = { score: 0, count: 0 };
          }

          question.answers?.forEach((answer) => {
            answer.evaluations?.forEach((evaluation) => {
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
        averageScore: count > 0 ? score / count : 0,
      }))
      .sort((a, b) => b.averageScore - a.averageScore)
      .slice(0, 4);
  })();

  // Handle delete session
  const deleteSession = async (sessionId: string) => {
    try {
      // Find the session to get the job posting ID
      const session = interviewSessions.find((s) => s.id === sessionId);

      if (session && session.job_posting && session.job_posting.id) {
        // Import the delete function
        const { deleteInterviewClient } = await import(
          "@/lib/actions/interview-client"
        );

        // Call the delete function
        const result = await deleteInterviewClient(session.job_posting.id);

        if (result.success) {
          // Update the local state
          setInterviewSessions((prev) =>
            prev.filter((s) => s.id !== sessionId)
          );
        } else {
          console.error("Failed to delete interview session:", result.error);
        }
      } else {
        console.error(
          "Cannot delete session - missing job posting ID",
          session
        );
      }
    } catch (error) {
      console.error("Error deleting session:", error);
    }
  };

  return {
    isDataLoading,
    filteredSessions,
    averageScore,
    topSkills,
    commonImprovements,
    skillScores,
    deleteSession,
  };
}
