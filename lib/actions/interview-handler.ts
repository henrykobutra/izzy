"use server";

import { createClient } from "@/lib/supabase/server";

// Type for interview session with related data
export type InterviewSessionWithRelations = {
  id: string;
  status: string;
  strategy: Record<string, unknown>;
  job_posting: {
    id: string;
    title: string;
    company: string | null;
  };
  questions: {
    id: string;
    question_text: string;
    question_type: string;
    question_order: number;
    related_skill: string | null;
    difficulty: string | null;
    focus_area: string | null;
  }[];
};

// Type for retrieving interview questions with session data
export type InterviewQuestionsResult = {
  title: string;
  questions: {
    id: string;
    question_text: string;
    question_type: string;
    question_order: number;
    related_skill: string;
    difficulty: string | null;
    focus_area: string | null;
  }[];
  answers?: {
    question_id: string;
    answer_text: string;
  }[];
};

// Type for submitting interview answers
export type SubmitAnswerParams = {
  sessionId: string;
  questionId: string;
  answer: string;
};

// Interface for answer evaluation in results
export interface AnswerEvaluationResult {
  id: string;
  text: string;
  type: string;
  score: number;
  answer: string;
  feedback: string;
  strengths?: string[];
  areas_for_improvement?: string[];
  suggested_response?: string;
}

// Interface for interview result
export interface InterviewResult {
  sessionId: string;
  title: string;
  company?: string;
  position?: string;
  date: string;
  overallScore: number;
  scoreBreakdown: {
    technical: number;
    communication: number;
    problemSolving: number;
    cultureFit: number;
  };
  strengths: string[];
  weaknesses: string[];
  recommendations: string[];
  summary: string; // Overall session summary is now required
  questions: AnswerEvaluationResult[];
}

interface SessionWithAnswers extends InterviewSessionWithRelations {
  answers: {
    id: string;
    question_id: string;
    answer_text: string;
  }[];
}

// Get interview session with related data
export async function getInterviewSession(sessionId: string): Promise<{
  data: InterviewSessionWithRelations | null;
  error: string | null;
}> {
  try {
    const supabase = await createClient();

    // Get the session with job posting data
    const { data: session, error: sessionError } = await supabase
      .from("interview_sessions")
      .select(
        `
        id, 
        status, 
        strategy,
        job_posting:job_postings (
          id,
          title, 
          company
        )
      `
      )
      .eq("id", sessionId)
      .single();

    if (sessionError) {
      console.error("Error fetching interview session:", sessionError);
      return { data: null, error: "Failed to fetch interview session" };
    }

    if (!session) {
      return { data: null, error: "Interview session not found" };
    }

    // Get questions for this session
    const { data: questions, error: questionsError } = await supabase
      .from("interview_questions")
      .select(
        "id, question_text, question_type, question_order, related_skill, difficulty, focus_area"
      )
      .eq("session_id", sessionId)
      .order("question_order", { ascending: true });

    if (questionsError) {
      console.error("Error fetching interview questions:", questionsError);
      return { data: null, error: "Failed to fetch interview questions" };
    }

    // Need to transform the Supabase result to match our expected type
    const jobPosting =
      Array.isArray(session.job_posting) && session.job_posting.length > 0
        ? session.job_posting[0]
        : { id: "", title: "", company: null };

    const sessionWithRelations: InterviewSessionWithRelations = {
      id: session.id,
      status: session.status,
      strategy: session.strategy || {},
      job_posting: {
        id: jobPosting.id || "",
        title: jobPosting.title || "",
        company: jobPosting.company,
      },
      questions: questions || [],
    };

    return { data: sessionWithRelations, error: null };
  } catch (error) {
    console.error("Unexpected error in getInterviewSession:", error);
    return { data: null, error: "An unexpected error occurred" };
  }
}

// Get interview questions for a session
export async function getInterviewQuestions(sessionId: string): Promise<{
  success: boolean;
  data?: InterviewQuestionsResult;
  error?: string;
}> {
  try {
    const supabase = await createClient();

    // Get session info with job posting
    const { data: session, error: sessionError } = await supabase
      .from("interview_sessions")
      .select(
        `
        id,
        status,
        job_posting:job_postings (
          title
        )
      `
      )
      .eq("id", sessionId)
      .single();

    if (sessionError) {
      console.error("Error fetching session:", sessionError);
      return { success: false, error: "Failed to fetch interview session" };
    }

    // Get questions for this session
    const { data: questions, error: questionsError } = await supabase
      .from("interview_questions")
      .select(
        "id, question_text, question_type, question_order, related_skill, difficulty, focus_area"
      )
      .eq("session_id", sessionId)
      .order("question_order", { ascending: true });

    if (questionsError) {
      console.error("Error fetching questions:", questionsError);
      return { success: false, error: "Failed to fetch interview questions" };
    }

    // Get existing answers for this session
    const { data: answers, error: answersError } = await supabase
      .from("user_answers")
      .select("id, question_id, answer_text")
      .in("question_id", questions.map((q: { id: string }) => q.id) || []);

    if (answersError) {
      console.error("Error fetching answers:", answersError);
      // Continue without answers, not a critical error
    }

    return {
      success: true,
      data: {
        title: session.job_posting?.[0]?.title || "Interview Session",
        questions: questions || [],
        answers: answers || [],
      },
    };
  } catch (error) {
    console.error("Unexpected error in getInterviewQuestions:", error);
    return { success: false, error: "An unexpected error occurred" };
  }
}

// Submit an answer to a question
export async function submitAnswer(
  questionId: string,
  answerText: string
): Promise<{
  success: boolean;
  data?: { answerId: string };
  error?: string;
}> {
  try {
    const supabase = await createClient();

    // Insert the answer
    const { data: answer, error: answerError } = await supabase
      .from("user_answers")
      .insert({
        question_id: questionId,
        answer_text: answerText,
      })
      .select("id")
      .single();

    if (answerError) {
      console.error("Error submitting answer:", answerError);
      return { success: false, error: "Failed to submit answer" };
    }

    return {
      success: true,
      data: { answerId: answer.id },
    };
  } catch (error) {
    console.error("Unexpected error in submitAnswer:", error);
    return { success: false, error: "An unexpected error occurred" };
  }
}

// Submit an interview answer with evaluation
export async function submitInterviewAnswer(
  params: SubmitAnswerParams
): Promise<{
  success: boolean;
  error?: string;
  feedback?: {
    summary: string;
    strengths: string[];
    improvements: string[];
  };
}> {
  const { sessionId, questionId, answer } = params;
  try {
    const supabase = await createClient();
    // First, get the question details for evaluation context
    const { data: question, error: questionError } = await supabase
      .from("interview_questions")
      .select(
        "question_text, question_type, related_skill, difficulty, focus_area"
      )
      .eq("id", questionId)
      .single();

    if (questionError) {
      console.error("Error fetching question:", questionError);
      return { success: false, error: "Failed to fetch question details" };
    }

    // Insert the answer with additional metadata
    const { data: answerData, error: answerError } = await supabase
      .from("user_answers")
      .insert({
        question_id: questionId,
        answer_text: answer,
        metadata: {
          question_type: question.question_type,
          related_skill: question.related_skill,
          difficulty: question.difficulty,
          focus_area: question.focus_area,
          submitted_at: new Date().toISOString(),
        },
      })
      .select("id")
      .single();

    if (answerError) {
      console.error("Error submitting answer:", answerError);
      return { success: false, error: "Failed to submit answer" };
    }

    // Update session status to in_progress if it's still planned
    await supabase
      .from("interview_sessions")
      .update({ status: "in_progress" })
      .eq("id", sessionId)
      .eq("status", "planned");

    // Generate quick feedback for immediate UI response
    const quickFeedback = generateQuickFeedback(answer, question.question_type);

    // We won't perform evaluations here anymore - evaluations will happen in batch
    // when completeInterviewSession is called
    console.log(
      `Answer saved with ID: ${answerData.id}, evaluations will be batch processed at session completion`
    );

    return {
      success: true,
      feedback: quickFeedback,
    };
  } catch (error) {
    console.error("Unexpected error in submitInterviewAnswer:", error);
    return { success: false, error: "An unexpected error occurred" };
  }
}

// Helper function to generate quick feedback
function generateQuickFeedback(
  answer: string,
  questionType: string
): {
  summary: string;
  strengths: string[];
  improvements: string[];
} {
  // This is a simplified feedback generator for immediate response
  // The detailed evaluation happens in background and is used in the results page

  const wordCount = answer.split(/\s+/).length;

  const strengths: string[] = [];
  const improvements: string[] = [];
  let summary = "";

  // Very basic heuristics for quick feedback
  if (wordCount > 50) {
    strengths.push("Provided a detailed response");
  } else if (wordCount < 20) {
    improvements.push("Consider elaborating more on your answer");
  }

  if (
    answer.includes("example") ||
    answer.includes("instance") ||
    answer.includes("case")
  ) {
    strengths.push("Used concrete examples");
  } else {
    improvements.push("Consider including specific examples");
  }

  // Question type specific feedback
  if (questionType.toLowerCase().includes("technical")) {
    strengths.push("Addressed technical concepts");
  } else if (questionType.toLowerCase().includes("behavioral")) {
    if (
      answer.toLowerCase().includes("i") ||
      answer.toLowerCase().includes("my")
    ) {
      strengths.push("Shared personal experiences");
    } else {
      improvements.push("Consider sharing more personal experiences");
    }
  }

  // Generate summary based on word count
  if (wordCount > 80) {
    summary =
      "Good depth in your answer. The evaluator will analyze it in detail.";
  } else if (wordCount > 30) {
    summary =
      "Reasonable response. The evaluator will provide detailed feedback.";
  } else {
    summary = "Brief response. Consider adding more details in future answers.";
  }

  return {
    summary,
    strengths: strengths.length ? strengths : ["Response recorded"],
    improvements: improvements.length
      ? improvements
      : ["Wait for detailed evaluation"],
  };
}

// Complete an interview session and generate results
export async function completeInterviewSession(
  sessionId: string,
  lastQuestionId?: string | null,
  lastAnswer?: string | null
): Promise<{
  success: boolean;
  error?: string;
}> {
  try {
    const supabase = await createClient();
    const startTime = Date.now();

    // If we have a last answer to save, save it first
    if (lastQuestionId && lastAnswer) {
      try {
        // Check if answer already exists for this question
        const { data: existingAnswers } = await supabase
          .from("user_answers")
          .select("id")
          .eq("question_id", lastQuestionId);

        if (existingAnswers && existingAnswers.length > 0) {
          // Update existing answer
          await supabase
            .from("user_answers")
            .update({ answer_text: lastAnswer })
            .eq("question_id", lastQuestionId);
          console.log(`Updated existing answer for question ${lastQuestionId}`);
        } else {
          // Insert new answer
          await supabase.from("user_answers").insert({
            question_id: lastQuestionId,
            answer_text: lastAnswer,
          });
          console.log(`Saved new answer for question ${lastQuestionId}`);
        }
      } catch (saveError) {
        console.error("Error saving last answer:", saveError);
        // Continue with the process even if saving fails
      }
    }

    // Update session status to in-progress if it was planned
    // The evaluateSession function will set it to completed when done
    const { error: updateError } = await supabase
      .from("interview_sessions")
      .update({ status: "in_progress" })
      .eq("id", sessionId)
      .eq("status", "planned");

    if (updateError) {
      console.error("Error updating session status:", updateError);
      // Continue with the process even if status update fails
    }

    // Get all questions for this session to check if there are answers to evaluate
    const { data: sessionData, error: sessionError } = await supabase
      .from("interview_sessions")
      .select(
        `
        id,
        status,
        questions:interview_questions(id)
      `
      )
      .eq("id", sessionId)
      .single();

    if (sessionError || !sessionData) {
      console.error("Error fetching session data:", sessionError);
      return { success: false, error: "Failed to fetch session data" };
    }

    if (!sessionData.questions || sessionData.questions.length === 0) {
      console.log(
        `No questions found for session ${sessionId}, marking as completed`
      );
      await supabase
        .from("interview_sessions")
        .update({ status: "completed" })
        .eq("id", sessionId);
      return { success: true };
    }

    // Get count of answers
    const { count, error: countError } = await supabase
      .from("user_answers")
      .select("id", { count: "exact", head: true })
      .in(
        "question_id",
        sessionData.questions.map((q: { id: string }) => q.id)
      );

    if (countError) {
      console.error("Error counting answers:", countError);
      return { success: false, error: "Failed to count answers" };
    }

    const hasAnswers = count && count > 0;

    // Get the evaluator agent and run evaluation in the background
    (async () => {
      try {
        // Only proceed if we have answers to evaluate
        if (hasAnswers) {
          console.log(
            `Starting session evaluation for session ${sessionId} with ${count} answers`
          );

          // At evaluation time, we just ensure there are no leftover evaluations
          // Most clearing happens when starting a new interview session
          console.log(
            `Checking for any existing evaluations for session ${sessionId}`
          );

          // Find any existing evaluations for answers to this session's questions
          const { data: allSessionAnswers } = await supabase
            .from("user_answers")
            .select("id")
            .in(
              "question_id",
              sessionData.questions.map((q: { id: string }) => q.id)
            );

          if (allSessionAnswers && allSessionAnswers.length > 0) {
            // Check if there are any evaluations to clean up
            const { count: evaluationCount } = await supabase
              .from("evaluations")
              .select("id", { count: 'exact', head: true })
              .in(
                "answer_id",
                allSessionAnswers.map((a) => a.id)
              );
              
            if (evaluationCount && evaluationCount > 0) {
              console.log(`Found ${evaluationCount} existing evaluations to clean up`);
              
              // Delete any remaining evaluations
              const { error: deleteError, count: deletedCount } = await supabase
                .from("evaluations")
                .delete({ count: 'exact' })
                .in(
                  "answer_id",
                  allSessionAnswers.map((a) => a.id)
                );

              if (deleteError) {
                console.error(
                  "Error clearing existing evaluations:",
                  deleteError
                );
              } else {
                console.log(
                  `Successfully cleared ${deletedCount || 0} existing evaluations`
                );
              }
            } else {
              console.log("No existing evaluations found, starting with clean slate");
            }
          }
          
          // Also reset the session feedback
          await supabase
            .from("interview_sessions")
            .update({
              session_feedback: null,
              status: "in_progress", // Set back to in progress for evaluation
            })
            .eq("id", sessionId);

          // Run the evaluation
          const { evaluateSession } = await import("@/agents/evaluator/agent");
          const result = await evaluateSession(sessionId);

          if (result.success) {
            console.log(
              `Session evaluation completed successfully with overall score: ${result.data?.session_evaluation.overall_score}`
            );
          } else {
            console.error(`Session evaluation failed: ${result.error}`);

            // If the evaluation failed, mark the session as completed anyway
            await supabase
              .from("interview_sessions")
              .update({ status: "completed" })
              .eq("id", sessionId);
          }
        } else {
          console.log(
            `No answers found for session ${sessionId}, marking as completed`
          );

          // If there are no answers, just mark the session as completed
          await supabase
            .from("interview_sessions")
            .update({ status: "completed" })
            .eq("id", sessionId);
        }

        console.log(
          `Session completion process finished in ${
            (Date.now() - startTime) / 1000
          }s`
        );
      } catch (bgError) {
        console.error("Error in background evaluation process:", bgError);

        // Ensure session is marked as completed even if evaluation fails
        try {
          await supabase
            .from("interview_sessions")
            .update({ status: "completed" })
            .eq("id", sessionId);
        } catch (finalError) {
          console.error("Failed to mark session as completed:", finalError);
        }
      }
    })();

    return { success: true };
  } catch (error) {
    console.error("Unexpected error in completeInterviewSession:", error);
    return { success: false, error: "An unexpected error occurred" };
  }
}

// Helper function to create an empty result when no evaluations are available
function createEmptyResult(session: SessionWithAnswers): InterviewResult {
  return {
    sessionId: session.id,
    title: Array.isArray(session.job_posting)
      ? session.job_posting[0]?.title || "Interview Session"
      : session.job_posting?.title || "Interview Session",
    company: Array.isArray(session.job_posting)
      ? session.job_posting[0]?.company
      : session.job_posting?.company,
    date: new Date().toISOString(),
    overallScore: 0,
    scoreBreakdown: {
      technical: 0,
      communication: 0,
      problemSolving: 0,
      cultureFit: 0,
    },
    strengths: [],
    weaknesses: [],
    recommendations: [],
    summary:
      "Your interview session is still being evaluated. Detailed feedback will be available soon. Please check back in a few minutes.",
    questions: session.questions.map((q) => ({
      id: q.id,
      text: q.question_text,
      type: q.question_type,
      score: 0,
      answer: "",
      feedback: "",
    })),
  };
}

// Get interview results
export async function getInterviewResults(sessionId: string): Promise<{
  success: boolean;
  data?: InterviewResult;
  error?: string;
}> {
  try {
    const supabase = await createClient();

    // Get the session with related job posting and questions data
    const { data: session, error: sessionError } = await supabase
      .from("interview_sessions")
      .select(
        `
        *,
        job_posting:job_postings (*),
        questions:interview_questions (*)
      `
      )
      .eq("id", sessionId)
      .single();

    if (sessionError) {
      console.error("Error fetching session:", sessionError);
      return {
        success: false,
        error: "Failed to fetch interview session",
      };
    }

    if (!session) {
      return {
        success: false,
        error: "Session not found",
      };
    }

    // Get all answers for questions in this session
    const { data: answers, error: answersError } = await supabase
      .from("user_answers")
      .select("*")
      .in(
        "question_id", 
        session.questions ? session.questions.map((q: { id: string }) => q.id) : []
      );

    if (answersError) {
      console.error("Error fetching answers:", answersError);
      return {
        success: false,
        error: "Failed to fetch answers",
      };
    }

    // Add answers to the session data
    const sessionWithAnswers: SessionWithAnswers = {
      ...session,
      answers: answers || [],
    };

    // Check if we have any answers
    if (
      !sessionWithAnswers.answers ||
      sessionWithAnswers.answers.length === 0
    ) {
      return {
        success: true,
        data: createEmptyResult(sessionWithAnswers),
      };
    }

    // Get evaluations for individual questions with the new additional fields
    const { data: evaluations, error: evaluationsError } = await supabase
      .from("evaluations")
      .select("*, answer:answer_id(*)")
      .in(
        "answer_id",
        sessionWithAnswers.answers.map((a) => a.id)
      );

    if (evaluationsError) {
      console.error("Error fetching evaluations:", evaluationsError);
      // Continue without individual evaluations, we still have session-level feedback
    }

    // Create mapping of question_id to evaluation
    const evaluationsByQuestionId: Record<
      string,
      {
        id: string;
        answer_id: string;
        overall_score: number;
        clarity_score: number;
        relevance_score: number;
        feedback: string;
        improvement_suggestions?: string;
        strengths?: string[];
        areas_for_improvement?: string[];
        suggested_response?: string;
      }
    > = {};
    if (evaluations && evaluations.length > 0) {
      for (const evaluation of evaluations) {
        const answer = sessionWithAnswers.answers.find(
          (a: { id: string; question_id: string }) =>
            a.id === evaluation.answer_id
        );
        if (answer) {
          evaluationsByQuestionId[answer.question_id] = evaluation;
        }
      }
    }

    // Check if we have session-level feedback (from evaluateSession)
    if (session.session_feedback) {
      console.log("Using session-level feedback from database");
      // Use the session feedback data for overall results
      const feedback = session.session_feedback;

      // Create the result object
      // Fix for Supabase data structure - job_posting might not be an array
      const jobPosting = Array.isArray(session.job_posting)
        ? session.job_posting[0]
        : session.job_posting;

      const result: InterviewResult = {
        sessionId,
        title: "Interview Results",
        company: jobPosting?.company || undefined,
        position: jobPosting?.title || undefined,
        date: new Date(session.created_at).toLocaleDateString(),
        overallScore: feedback.overall_score, // Now using 1-10 scale directly
        scoreBreakdown: {
          technical: feedback.technical_score,
          communication: feedback.communication_score,
          problemSolving: feedback.problem_solving_score,
          cultureFit: feedback.culture_fit_score,
        },
        strengths: feedback.strengths || [],
        weaknesses: feedback.weaknesses || [],
        recommendations: feedback.recommendations || [],
        summary: feedback.summary || "",
        questions: session.questions.map(
          (q: { id: string; question_text: string; question_type: string }) => {
            const answer = sessionWithAnswers.answers.find(
              (a: { question_id: string; answer_text: string }) =>
                a.question_id === q.id
            );
            const evaluation = evaluationsByQuestionId[q.id];

            return {
              id: q.id,
              text: q.question_text,
              type: q.question_type,
              score: evaluation ? evaluation.overall_score : 0, // Now using 1-10 scale directly
              answer: answer?.answer_text || "",
              feedback: evaluation?.feedback || "",
              strengths: evaluation?.strengths || [],
              areas_for_improvement: evaluation?.areas_for_improvement || [],
              suggested_response: evaluation?.suggested_response || "",
            };
          }
        ),
      };

      return { success: true, data: result };
    }

    // If no session feedback, we need to display an incomplete evaluation message
    console.log("No session-level feedback available");

    // Create a basic result with available data
    // Fix for Supabase data structure - job_posting might not be an array
    const jobPosting = Array.isArray(session.job_posting)
      ? session.job_posting[0]
      : session.job_posting;

    const incompleteResult: InterviewResult = {
      sessionId,
      title: "Interview Results",
      company: jobPosting?.company || undefined,
      position: jobPosting?.title || undefined,
      date: new Date(session.created_at).toLocaleDateString(),
      overallScore: 0,
      scoreBreakdown: {
        technical: 0,
        communication: 0,
        problemSolving: 0,
        cultureFit: 0,
      },
      strengths: ["Evaluation in progress"],
      weaknesses: ["Please check back later"],
      recommendations: ["Your interview is still being evaluated"],
      summary:
        "Your interview session is still being evaluated. Detailed feedback will be available soon. Please check back in a few minutes.",
      questions: session.questions.map(
        (q: { id: string; question_text: string; question_type: string }) => {
          const answer = sessionWithAnswers.answers.find(
            (a: { question_id: string; answer_text: string }) =>
              a.question_id === q.id
          );
          const evaluation = evaluationsByQuestionId[q.id];

          return {
            id: q.id,
            text: q.question_text,
            type: q.question_type,
            score: evaluation ? evaluation.overall_score : 0,
            answer: answer?.answer_text || "",
            feedback: evaluation?.feedback || "Evaluation in progress",
            strengths: evaluation?.strengths || [],
            areas_for_improvement: evaluation?.areas_for_improvement || [],
            suggested_response: evaluation?.suggested_response || "",
          };
        }
      ),
    };

    return { success: true, data: incompleteResult };
  } catch (error) {
    console.error("Unexpected error in getInterviewResults:", error);
    return { success: false, error: "An unexpected error occurred" };
  }
}

// Update interview session status
export async function updateSessionStatus(
  sessionId: string,
  status: "planned" | "in_progress" | "completed"
): Promise<{
  success: boolean;
  error?: string;
}> {
  try {
    const supabase = await createClient();

    const { error } = await supabase
      .from("interview_sessions")
      .update({ status })
      .eq("id", sessionId);

    if (error) {
      console.error("Error updating session status:", error);
      return { success: false, error: "Failed to update session status" };
    }

    return { success: true };
  } catch (error) {
    console.error("Unexpected error in updateSessionStatus:", error);
    return { success: false, error: "An unexpected error occurred" };
  }
}

// Delete an interview by deleting its associated job posting (will cascade)
export async function deleteInterview(jobPostingId: string): Promise<{
  success: boolean;
  error?: string;
}> {
  try {
    const supabase = await createClient();

    // Delete the job posting, which will cascade to interview_sessions and related data
    const { error } = await supabase
      .from("job_postings")
      .delete()
      .eq("id", jobPostingId);

    if (error) {
      console.error("Error deleting interview:", error);
      return { success: false, error: "Failed to delete interview" };
    }

    return { success: true };
  } catch (error) {
    console.error("Unexpected error in deleteInterview:", error);
    return { success: false, error: "An unexpected error occurred" };
  }
}

/**
 * Resets an interview session by clearing all user answers
 * This is used when starting a new practice round with the same session
 */
export async function resetInterviewSession(sessionId: string): Promise<{
  success: boolean;
  error?: string;
}> {
  try {
    const supabase = await createClient();
    
    console.log(`Resetting interview session ${sessionId}`);
    
    // Get all questions for this session
    const { data: questions, error: questionsError } = await supabase
      .from("interview_questions")
      .select("id")
      .eq("session_id", sessionId);
      
    if (questionsError) {
      console.error("Error fetching questions for reset:", questionsError);
      return { success: false, error: "Failed to fetch questions" };
    }
    
    if (!questions || questions.length === 0) {
      return { success: true }; // No questions to reset
    }
    
    // Delete all user answers for questions in this session
    // This will cascade to delete evaluations as well
    const { error: deleteAnswersError, count: deletedCount } = await supabase
      .from("user_answers")
      .delete({ count: 'exact' })
      .in(
        "question_id",
        questions.map(q => q.id)
      );
      
    if (deleteAnswersError) {
      console.error("Error deleting answers during reset:", deleteAnswersError);
      return { success: false, error: "Failed to reset answers" };
    }
    
    console.log(`Successfully reset session ${sessionId}, deleted ${deletedCount || 0} answers`);
    
    // Also reset the session status and feedback
    const { error: updateError } = await supabase
      .from("interview_sessions")
      .update({
        status: "planned",
        session_feedback: null
      })
      .eq("id", sessionId);
      
    if (updateError) {
      console.error("Error updating session status during reset:", updateError);
      // Not critical, still consider reset successful
    }
    
    return { success: true };
  } catch (error) {
    console.error("Unexpected error in resetInterviewSession:", error);
    return { success: false, error: "An unexpected error occurred" };
  }
}
