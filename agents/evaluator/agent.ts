"use server";

import OpenAI from "openai";
import { createClient } from "@/lib/supabase/server";
import { getUser } from "@/lib/supabase/server";

// Initialize OpenAI client server-side with API key from environment
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

interface JobPosting {
  title: string;
  company: string;
  description: string;
  parsed_requirements: string[];
}

// Combined evaluation response interface
interface CombinedEvaluationResponse {
  session_evaluation: {
    overall_score: number; // 1-10 scale
    technical_score: number;
    communication_score: number;
    problem_solving_score: number;
    culture_fit_score: number;
    strengths: string[];
    weaknesses: string[];
    recommendations: string[];
    summary: string;
  };
  answer_evaluations: {
    question_id: string;
    answer_quality: number; // 1-10 scale
    feedback: string;
    strengths: string[];
    areas_for_improvement: string[];
    suggested_response: string;
  }[];
}

/**
 * Evaluates all answers in a session at once and provides both
 * individual answer evaluations and an overall session evaluation
 */
export async function evaluateSession(sessionId: string) {
  try {
    const startTime = Date.now();

    // Get the current user
    const {
      data: { user },
    } = await getUser();

    if (!user) {
      throw new Error("User not authenticated");
    }

    // Create Supabase client
    const supabase = await createClient();

    // Get session data with job posting and strategy
    const { data: session, error: sessionError } = await supabase
      .from("interview_sessions")
      .select(
        `
        id,
        status,
        job_posting:job_postings (
          title,
          company,
          description,
          parsed_requirements
        ),
        strategy
      `
      )
      .eq("id", sessionId)
      .single();

    if (sessionError || !session) {
      throw new Error("Failed to fetch session data");
    }

    // Get all questions for this session
    const { data: questions, error: questionsError } = await supabase
      .from("interview_questions")
      .select("*")
      .eq("session_id", sessionId)
      .order("question_order", { ascending: true });

    if (questionsError) {
      throw new Error("Failed to fetch questions");
    }

    // Get all answers for these questions
    const { data: answers, error: answersError } = await supabase
      .from("user_answers")
      .select("id, question_id, answer_text, created_at")
      .in(
        "question_id",
        questions.map((q) => q.id)
      );

    if (answersError) {
      throw new Error("Failed to fetch answers");
    }

    if (!answers || answers.length === 0) {
      throw new Error("No answers found for evaluation");
    }

    // Prepare context for OpenAI evaluation
    // Handle job_posting which might be returned as an array or a single object
    const jobPosting = Array.isArray(session.job_posting)
      ? session.job_posting[0] as JobPosting
      : session.job_posting as JobPosting;

    const evaluationContext = {
      job_info: {
        title: jobPosting.title,
        company: jobPosting.company,
        description: jobPosting.description,
        requirements: jobPosting.parsed_requirements,
      },
      strategy: session.strategy,
      questions_and_answers: questions
        .map((question) => {
          const answer = answers.find((a) => a.question_id === question.id);

          return {
            question: {
              id: question.id,
              text: question.question_text,
              type: question.question_type,
              related_skill: question.related_skill,
              difficulty: question.difficulty,
              focus_area: question.focus_area,
              order: question.question_order,
            },
            answer: answer
              ? {
                  id: answer.id,
                  text: answer.answer_text,
                  created_at: answer.created_at,
                }
              : null,
          };
        })
        .filter((qa) => qa.answer !== null), // Only include questions that have answers
    };

    // Check if OpenAI evaluator is configured
    const assistantId = process.env.OPENAI_EVALUATOR_ASSISTANT_ID;

    if (!assistantId) {
      throw new Error("OpenAI Evaluator Assistant ID not configured");
    }

    console.log("Using OpenAI Assistant for session evaluation");

    // Create thread and send message to OpenAI Assistant
    const thread = await openai.beta.threads.create();

    await openai.beta.threads.messages.create(thread.id, {
      role: "user",
      content: `Please provide a comprehensive evaluation of this interview session. Analyze each individual answer AND provide an overall session evaluation. Return your response in a structured JSON format that includes both the session-level evaluation and individual answer evaluations.\n\nContext:\n${JSON.stringify(
        evaluationContext
      )}`,
    });

    // Run the assistant
    const run = await openai.beta.threads.runs.create(thread.id, {
      assistant_id: assistantId,
    });

    // Poll for completion
    let runStatus = await openai.beta.threads.runs.retrieve(thread.id, run.id);

    while (runStatus.status !== "completed" && runStatus.status !== "failed") {
      await new Promise((resolve) => setTimeout(resolve, 1000));
      runStatus = await openai.beta.threads.runs.retrieve(thread.id, run.id);
    }

    if (runStatus.status === "failed") {
      throw new Error("Assistant processing failed");
    }

    // Get assistant response
    const messages = await openai.beta.threads.messages.list(thread.id);
    const assistantMessages = messages.data.filter(
      (message) => message.role === "assistant"
    );

    if (assistantMessages.length === 0) {
      throw new Error("No response from assistant");
    }

    // Parse JSON from the message
    const lastMessage = assistantMessages[0];
    const messageContent = lastMessage.content[0];

    if (messageContent.type !== "text") {
      throw new Error("Expected text response from assistant");
    }

    // Extract JSON from the text response
    const textContent = messageContent.text.value;
    let jsonMatch = textContent.match(/```json\n([\s\S]*?)\n```/);

    if (!jsonMatch) {
      jsonMatch = textContent.match(/\{[\s\S]*\}/);
    }

    if (!jsonMatch) {
      throw new Error("Could not parse JSON response from assistant");
    }

    // Parse the JSON response
    let combinedEvaluation: CombinedEvaluationResponse;
    try {
      combinedEvaluation = JSON.parse(jsonMatch[1] || jsonMatch[0]);
    } catch (error) {
      console.error("Error parsing JSON:", error);
      throw new Error("Failed to parse JSON response");
    }

    // Log evaluation counts for debugging
    console.log(
      `Processing evaluations for ${combinedEvaluation.answer_evaluations.length} answers`
    );

    // We'll now always create fresh evaluations, since the completeInterviewSession function
    // handles clearing existing evaluations when needed.
    console.log(`Creating fresh evaluations for all ${answers.length} answers`);

    // Store individual answer evaluations in the database
    const evaluationPromises = combinedEvaluation.answer_evaluations.map(
      async (evaluation) => {
        const questionId = evaluation.question_id;
        const answer = answers.find((a) => a.question_id === questionId);

        if (!answer) {
          console.error(`Could not find answer for question ${questionId}`);
          return null;
        }

        console.log(`Creating evaluation for answer ${answer.id}`);
        // Insert new evaluation
        const { data: newEval, error: insertError } = await supabase
          .from("evaluations")
          .insert({
            answer_id: answer.id,
            clarity_score: Math.round(evaluation.answer_quality),
            relevance_score: Math.round(evaluation.answer_quality),
            overall_score: Math.round(evaluation.answer_quality),
            feedback: evaluation.feedback,
            strengths: evaluation.strengths,
            areas_for_improvement: evaluation.areas_for_improvement,
            suggested_response: evaluation.suggested_response,
            improvement_suggestions:
              evaluation.areas_for_improvement.join("\n"),
          })
          .select("id")
          .single();

        if (insertError) {
          console.error(
            `Error inserting evaluation for answer ${answer.id}:`,
            insertError
          );
          return null;
        }

        return newEval.id;
      }
    );

    // Wait for all evaluation inserts/updates to complete
    await Promise.all(evaluationPromises);

    // Save session evaluation to the database
    const { error: updateError } = await supabase
      .from("interview_sessions")
      .update({
        session_feedback: combinedEvaluation.session_evaluation,
        status: "completed", // Ensure session is marked as completed
      })
      .eq("id", sessionId);

    if (updateError) {
      console.error("Error saving session evaluation:", updateError);
      throw new Error("Failed to save session evaluation");
    }

    // Log the agent activity
    await supabase.from("agent_logs").insert({
      agent_type: "evaluator",
      session_id: sessionId,
      input: {
        action: "evaluate_session",
        answers_count: answers.length,
        questions_count: questions.length,
      },
      output: {
        success: true,
        overall_score: combinedEvaluation.session_evaluation.overall_score,
        processing_time: Date.now() - startTime,
      },
      processing_time: Date.now() - startTime,
    });

    return {
      success: true,
      data: combinedEvaluation,
    };
  } catch (error) {
    console.error("Error in session evaluation:", error);
    return {
      success: false,
      error:
        error instanceof Error ? error.message : "Failed to evaluate session",
    };
  }
}
