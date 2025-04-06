"use client";

import { useState, useCallback } from "react";
import { streamInterviewResponse } from "@/lib/actions/interview-stream";

interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
}

interface InterviewQuestion {
  id: string;
  question_text: string;
  question_type: string;
  related_skill: string | null;
  difficulty: string | null;
  focus_area: string | null;
}

interface InterviewStatus {
  current_question_index: number;
  total_questions: number;
  estimated_completion_percentage: number;
  areas_covered: string[];
  remaining_areas: string[];
}

interface InterviewChatOptions {
  sessionId: string;
  initialMessages?: Message[];
  forceNewSession?: boolean;
}

export function useInterviewChat({
  sessionId,
  initialMessages = [],
  forceNewSession = false,
}: InterviewChatOptions) {
  // State for tracking interview progress
  const [threadId, setThreadId] = useState<string | null>(null);
  const [currentQuestion, setCurrentQuestion] =
    useState<InterviewQuestion | null>(null);
  const [interviewStatus, setInterviewStatus] =
    useState<InterviewStatus | null>(null);
  const [isComplete, setIsComplete] = useState(false);
  const [isFirstInteraction, setIsFirstInteraction] = useState(true);
  const [isResetting, setIsResetting] = useState(false);
  const [isStreaming, setIsStreaming] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isEndingInterview, setIsEndingInterview] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [messages, setMessages] = useState<Message[]>(initialMessages);
  const [input, setInput] = useState("");

  // No session recovery - all interviews start fresh

  const handleInputChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
      setInput(e.target.value);
    },
    []
  );

  // Override the normal append behavior to use our streaming server action
  const sendMessage = useCallback(
    async (content: string) => {
      if (!sessionId) return;

      // Set streaming state
      setIsStreaming(true);
      setIsLoading(true);

      // Optimistically add message to UI
      const userMessage: Message = {
        id: Date.now().toString(),
        role: "user",
        content,
      };

      // Add user message to UI
      setMessages((messages) => [...messages, userMessage]);

      try {
        // Add loading message
        const pendingMessage: Message = {
          id: Date.now().toString() + "-pending",
          role: "assistant",
          content: "", // Will be filled by streaming
        };

        setMessages((messages) => [...messages, pendingMessage]);

        console.log("Sending message with question ID:", currentQuestion?.id);

        // Call streaming server action
        const { stream, metadata } = await streamInterviewResponse({
          sessionId,
          threadId: threadId,
          message: content,
          questionId: currentQuestion?.id,
        });

        // Create a new message to replace the pending one
        const responseMessage: Message = {
          id: Date.now().toString() + "-response",
          role: "assistant",
          content: "",
        };

        // Remove loading message and add the real one
        setMessages((messages) =>
          messages
            .filter((m) => m.id !== pendingMessage.id)
            .concat(responseMessage)
        );

        // Handle streaming
        try {
          const reader = stream.getReader();
          const decoder = new TextDecoder();

          // Read and process stream chunks
          let done = false;
          let accumulatedContent = "";

          while (!done) {
            const { value, done: doneReading } = await reader.read();
            done = doneReading;

            if (value) {
              accumulatedContent += decoder.decode(value, { stream: true });
              // Update the message with latest content
              setMessages((messages) =>
                messages.map((m) =>
                  m.id === responseMessage.id
                    ? { ...m, content: accumulatedContent }
                    : m
                )
              );
            }
          }

          // Ensure we decode any remaining stream content
          const finalContent = decoder.decode();
          if (finalContent) {
            accumulatedContent += finalContent;
            setMessages((messages) =>
              messages.map((m) =>
                m.id === responseMessage.id
                  ? { ...m, content: accumulatedContent }
                  : m
              )
            );
          }
        } catch (streamError) {
          console.error("Error reading stream:", streamError);
          setError("Error reading stream response");
        }

        // Process metadata
        if (metadata) {
          if (metadata.threadId) {
            setThreadId(metadata.threadId);
          }

          if (metadata.nextQuestion) {
            if (!metadata.nextQuestion.id) {
              console.warn(
                "Received question without ID:",
                metadata.nextQuestion
              );
            } else {
              console.log(
                "Setting current question with ID:",
                metadata.nextQuestion.id
              );
            }

            setCurrentQuestion({
              id: metadata.nextQuestion.id || "",
              question_text: metadata.nextQuestion.question_text,
              question_type: metadata.nextQuestion.question_type,
              related_skill: metadata.nextQuestion.related_skill,
              difficulty: metadata.nextQuestion.difficulty,
              focus_area: metadata.nextQuestion.focus_area,
            });
          }

          if (metadata.status) {
            setInterviewStatus(metadata.status);
          }

          if (metadata.isComplete) {
            setIsComplete(true);
          }
        }
      } catch (error) {
        console.error("Error in streaming interview response:", error);
        setError("Error processing your request. Please try again.");

        // Add error message
        setMessages((messages) => [
          ...messages,
          {
            id: Date.now().toString() + "-error",
            role: "assistant",
            content:
              "Sorry, there was an error processing your request. Please try again.",
          },
        ]);
      } finally {
        // Clear streaming state
        setIsStreaming(false);
        setIsLoading(false);
      }
    },
    [sessionId, threadId, currentQuestion]
  );

  // Start a new interview with streaming
  const startNewInterview = useCallback(
    async (forceReset = false) => {
      if (!sessionId) return;

      try {
        // Set resetting flag
        setIsResetting(true);
        setIsLoading(true);

        // Always force a new session if forceNewSession is true
        // Otherwise, skip recovery/reset if we already have a valid thread and it's not a forced reset
        if (
          !forceNewSession &&
          threadId &&
          messages.length > 0 &&
          !forceReset
        ) {
          setIsResetting(false);
          setIsLoading(false);
          return;
        }

        // Clear existing state for a fresh start or forced reset
        setMessages([]);
        setThreadId(null);
        setCurrentQuestion(null);
        setInterviewStatus(null);
        setIsComplete(false);
        setError(null);

        // Add loading message
        const pendingMessage: Message = {
          id: Date.now().toString() + "-pending",
          role: "assistant",
          content: "", // Will be filled by streaming
        };

        setMessages([pendingMessage]);

        // Call streaming server action
        const { stream, metadata } = await streamInterviewResponse({
          sessionId,
        });

        // Create a new message to replace the pending one
        const responseMessage: Message = {
          id: Date.now().toString() + "-response",
          role: "assistant",
          content: "",
        };

        // Remove pending message and add the real one
        setMessages([responseMessage]);

        // Handle streaming
        try {
          const reader = stream.getReader();
          const decoder = new TextDecoder();

          let done = false;
          let accumulatedContent = "";

          while (!done) {
            const { value, done: doneReading } = await reader.read();
            done = doneReading;

            if (value) {
              accumulatedContent += decoder.decode(value, { stream: true });
              // Update the message with latest content
              setMessages([
                { ...responseMessage, content: accumulatedContent },
              ]);
            }
          }

          // Ensure we decode any remaining stream content
          const finalContent = decoder.decode();
          if (finalContent) {
            accumulatedContent += finalContent;
            setMessages([{ ...responseMessage, content: accumulatedContent }]);
          }
        } catch (streamError) {
          console.error("Error reading stream:", streamError);
          setError("Error reading stream response");
        }

        // Process metadata
        if (metadata) {
          if (metadata.threadId) {
            setThreadId(metadata.threadId);
          }

          if (metadata.nextQuestion) {
            setCurrentQuestion({
              id: metadata.nextQuestion.id || "",
              question_text: metadata.nextQuestion.question_text,
              question_type: metadata.nextQuestion.question_type,
              related_skill: metadata.nextQuestion.related_skill,
              difficulty: metadata.nextQuestion.difficulty,
              focus_area: metadata.nextQuestion.focus_area,
            });
          }

          if (metadata.status) {
            setInterviewStatus(metadata.status);
          }
        }

        setIsFirstInteraction(false);
      } catch (error) {
        console.error("Error starting interview:", error);
        setError("Error starting interview. Please try again.");

        // Add error message
        setMessages([
          {
            id: Date.now().toString() + "-error",
            role: "assistant",
            content:
              "Sorry, there was an error starting your interview. Please try again.",
          },
        ]);
      } finally {
        // Clear resetting flag
        setIsResetting(false);
        setIsLoading(false);
      }
    },
    [sessionId, threadId, messages.length, forceNewSession]
  );

  // Custom submit handler for the interview chat
  const handleSubmit = useCallback(
    async (e: React.FormEvent<HTMLFormElement>) => {
      e.preventDefault();

      if (!input.trim() || isLoading) return;

      if (isFirstInteraction) {
        await startNewInterview();
      } else {
        await sendMessage(input);
        // Clear input field after sending
        setInput("");
      }
    },
    [input, isLoading, isFirstInteraction, startNewInterview, sendMessage]
  );

  // Initialization is now handled by the parent component
  // No need for automatic initialization here as it causes duplicate messages

  // Handle ending the interview and generating results
  const endInterview = useCallback(async () => {
    if (!sessionId) return;

    try {
      setIsEndingInterview(true);
      setIsLoading(true);

      // Import the server action dynamically
      const { completeInterviewSession } = await import(
        "@/lib/actions/interview-handler"
      );

      // Save any current input as an answer if there's a current question
      // This ensures the last answer is saved even if the user hasn't clicked submit
      const lastInputText = input.trim();
      const lastQuestionId = currentQuestion?.id;

      // Add a "processing" message
      setMessages((prevMessages) => [
        ...prevMessages,
        {
          id: Date.now().toString() + "-processing",
          role: "assistant",
          content:
            "Processing your interview responses... This may take a moment while the evaluator analyzes your answers.",
        },
      ]);

      // Call the server action to complete the interview
      // Pass the current question ID and answer text if available
      const result = await completeInterviewSession(
        sessionId,
        lastQuestionId && lastInputText ? lastQuestionId : null,
        lastInputText || null
      );

      if (result.success) {
        // Add the user's last unsaved answer to the message list if it exists
        if (lastInputText && lastQuestionId) {
          const lastUserMessage: Message = {
            id: Date.now().toString() + "-last-answer",
            role: "user",
            content: lastInputText,
          };
          setMessages((prevMessages) => [...prevMessages, lastUserMessage]);

          // Clear the input field
          setInput("");
        }

        // Implement polling to check for evaluation completion
        const checkEvaluationStatus = async () => {
          try {
            const { getInterviewSession } = await import(
              "@/lib/actions/interview-handler"
            );
            const sessionResult = await getInterviewSession(sessionId);

            if (
              sessionResult.data &&
              sessionResult.data.status === "completed"
            ) {
              // Evaluation is complete, update UI
              setIsComplete(true);
              setIsEndingInterview(false);
              setIsLoading(false);

              // Add a completion message from the assistant
              setMessages((prevMessages) => {
                // Filter out the processing message
                const filteredMessages = prevMessages.filter(
                  (m) => !m.id.includes("-processing")
                );

                // Add completion message
                return [
                  ...filteredMessages,
                  {
                    id: Date.now().toString() + "-completion",
                    role: "assistant",
                    content:
                      "Thank you for completing the interview! Your answers have been evaluated. You are being redirected to the results page...",
                  },
                ];
              });

              // Redirect to results page after a short delay to let the user see the message
              setTimeout(() => {
                window.location.href = `/interviews/results/${sessionId}`;
              }, 1500);
            } else {
              // Still processing, update the message and continue polling
              setMessages((prevMessages) => {
                return prevMessages.map((m) => {
                  if (m.id.includes("-processing")) {
                    return {
                      ...m,
                      content:
                        "Your interview is being evaluated. Please wait while we analyze your answers...",
                    };
                  }
                  return m;
                });
              });

              // Continue polling after a delay
              setTimeout(checkEvaluationStatus, 2000);
            }
          } catch (checkError) {
            console.error("Error checking evaluation status:", checkError);
            // After several retries, allow the user to proceed anyway
            setIsComplete(true);
            setIsEndingInterview(false);
            setIsLoading(false);
          }
        };

        // Start the polling after a short delay to give the evaluation time to begin
        setTimeout(checkEvaluationStatus, 2000);
      } else {
        setError(result.error || "Failed to complete interview");
        setIsEndingInterview(false);
        setIsLoading(false);
      }
    } catch (error) {
      console.error("Error ending interview:", error);
      setError(
        error instanceof Error
          ? error.message
          : "An error occurred while ending the interview"
      );
      setIsEndingInterview(false);
      setIsLoading(false);
    }
  }, [sessionId, currentQuestion, input]);

  return {
    // Chat state
    messages,
    input,
    handleInputChange,
    handleSubmit,
    isLoading: isLoading || isStreaming || isEndingInterview,
    error,

    // Interview state
    threadId,
    currentQuestion,
    interviewStatus,
    isComplete,
    isResetting,
    isEndingInterview,

    // Actions
    startNewInterview: () => startNewInterview(true), // Always force reset when called explicitly
    endInterview, // Added new action to end the interview
  };
}
