"use server";

import { startInterview, continueInterview } from "@/agents/interviewer/agent";
import { createClient } from "@/lib/supabase/server";

/**
 * Helper function to reset all answers and evaluations for a session
 * This is called when starting a new interview to ensure a clean slate
 */
async function resetSessionAnswers(sessionId: string) {
  try {
    console.log(`Resetting interview session ${sessionId} before starting a new interview`);
    const supabase = await createClient();
    
    // Get all questions for this session
    const { data: questions, error: questionsError } = await supabase
      .from("interview_questions")
      .select("id")
      .eq("session_id", sessionId);
      
    if (questionsError) {
      console.error("Error fetching questions for reset:", questionsError);
      return; // Continue with the interview even if reset fails
    }
    
    if (!questions || questions.length === 0) {
      return; // No questions to reset
    }
    
    // Delete all user answers for questions in this session
    // This will cascade to delete evaluations as well due to foreign key constraints
    const { error: deleteAnswersError, count: deletedCount } = await supabase
      .from("user_answers")
      .delete({ count: 'exact' })
      .in(
        "question_id",
        questions.map(q => q.id)
      );
      
    if (deleteAnswersError) {
      console.error("Error deleting answers during reset:", deleteAnswersError);
    } else {
      console.log(`Successfully reset session ${sessionId}, deleted ${deletedCount || 0} answers`);
    }
    
    // Also reset the session status and feedback
    await supabase
      .from("interview_sessions")
      .update({
        status: "planned",
        session_feedback: null
      })
      .eq("id", sessionId);
      
  } catch (error) {
    console.error("Error in resetSessionAnswers:", error);
    // Continue with the interview even if reset fails
  }
}

/**
 * Server action that streams interview responses from the interviewer agent
 */
export async function streamInterviewResponse({
  sessionId,
  threadId = null,
  message,
  questionId = null,
}: {
  sessionId: string;
  threadId?: string | null;
  message?: string | null;
  questionId?: string | null;
}) {
  try {
    let response;

    if (!threadId) {
      // For a new interview, first reset the session by clearing old answers
      await resetSessionAnswers(sessionId);
      
      // Then start a new interview
      response = await startInterview(sessionId);
    } else if (message) {
      // Continue an existing interview with the user's message
      response = await continueInterview(
        sessionId,
        threadId,
        message,
        questionId
      );
    } else {
      throw new Error("Invalid request parameters");
    }

    if (!response.success) {
      throw new Error(response.error || "Failed to process interview");
    }

    if (!response.data) {
      throw new Error("No response data received");
    }

    // Prepare metadata
    const metadata = {
      threadId: response.data.thread_id,
      nextQuestion: response.data.next_question,
      status: response.data.status,
      isComplete: false,
    };

    // Get response text
    const responseText = response.data.message;

    // Create manually streamable text
    const encoder = new TextEncoder();
    const stream = new ReadableStream({
      async start(controller) {
        // Break the text into chunks for streaming
        const chunks = createTextChunks(responseText);

        for (const chunk of chunks) {
          // Add a small delay between chunks to simulate typing
          await new Promise((resolve) => setTimeout(resolve, 15));
          controller.enqueue(encoder.encode(chunk));
        }

        controller.close();
      },
    });

    return {
      stream,
      metadata: JSON.parse(JSON.stringify(metadata)), // Ensure it's serializable
    };
  } catch (error) {
    console.error("Error in interview stream:", error);

    // Return error as a stream
    const encoder = new TextEncoder();
    const errorStream = new ReadableStream({
      start(controller) {
        controller.enqueue(
          encoder.encode(
            "Sorry, there was an error processing your interview. Please try again."
          )
        );
        controller.close();
      },
    });

    return {
      stream: errorStream,
      metadata: {
        error: error instanceof Error ? error.message : "Unknown error",
      },
    };
  }
}

/**
 * Helper function to break text into small chunks for streaming
 */
function createTextChunks(text: string, avgChunkSize: number = 3): string[] {
  const result: string[] = [];

  // Split by sentences first
  const sentences = text.split(/(?<=[.!?])\s+/);

  for (const sentence of sentences) {
    // For very short sentences, keep them whole
    if (sentence.length <= avgChunkSize * 2) {
      result.push(sentence + " ");
      continue;
    }

    // Split longer sentences into chunks with slight variation in size
    const words = sentence.split(" ");
    let currentChunk = "";

    for (const word of words) {
      if (
        currentChunk.length + word.length >
        avgChunkSize + Math.random() * avgChunkSize
      ) {
        result.push(currentChunk + " ");
        currentChunk = word;
      } else {
        currentChunk += (currentChunk ? " " : "") + word;
      }
    }

    if (currentChunk) {
      result.push(currentChunk + " ");
    }
  }

  return result;
}
