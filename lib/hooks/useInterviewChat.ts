'use client';

import { useState, useCallback } from 'react';
import { useChat, type Message } from 'ai/react';
import { startInterview, continueInterview } from '@/agents/interviewer/agent';

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
}

export function useInterviewChat({ sessionId, initialMessages = [] }: InterviewChatOptions) {
  // State for tracking interview progress
  const [threadId, setThreadId] = useState<string | null>(null);
  const [currentQuestion, setCurrentQuestion] = useState<InterviewQuestion | null>(null);
  const [interviewStatus, setInterviewStatus] = useState<InterviewStatus | null>(null);
  const [isComplete, setIsComplete] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  // Use Vercel AI SDK's useChat hook for UI state management
  const {
    messages,
    input,
    handleInputChange,
    setMessages,
    isLoading: aiIsLoading,
    error
  } = useChat({
    initialMessages,
    id: sessionId
  });

  // Custom submit handler that integrates with our agent
  const handleSubmit = useCallback(
    async (e: React.FormEvent<HTMLFormElement>) => {
      e.preventDefault();
      
      if (!input.trim() || isLoading) return;
      
      setIsLoading(true);
      
      try {
        // Add user message to the UI immediately
        const userMessage: Message = {
          id: Date.now().toString(),
          role: 'user',
          content: input,
        };
        
        // Update messages locally first for immediate feedback
        setMessages((messages) => [...messages, userMessage]);
        
        // Clear input
        handleInputChange({ target: { value: '' } } as React.ChangeEvent<HTMLInputElement>);
        
        let response;
        
        if (!threadId) {
          // Start a new interview if no threadId exists
          response = await startInterview(sessionId);
          
          if (!response.success) {
            throw new Error(response.error || 'Failed to start interview');
          }
          
          setThreadId(response.data.thread_id);
          
          if (response.data.next_question) {
            setCurrentQuestion({
              id: response.data.next_question.id || '',
              question_text: response.data.next_question.question_text,
              question_type: response.data.next_question.question_type,
              related_skill: response.data.next_question.related_skill,
              difficulty: response.data.next_question.difficulty,
              focus_area: response.data.next_question.focus_area
            });
          }
          
          if (response.data.status) {
            setInterviewStatus(response.data.status);
          }
        } else {
          // Continue existing interview
          response = await continueInterview(
            sessionId,
            threadId,
            input,
            currentQuestion?.id || null
          );
          
          if (!response.success) {
            throw new Error(response.error || 'Failed to continue interview');
          }
          
          if (response.data.next_question) {
            setCurrentQuestion({
              id: response.data.next_question.id || '',
              question_text: response.data.next_question.question_text,
              question_type: response.data.next_question.question_type,
              related_skill: response.data.next_question.related_skill,
              difficulty: response.data.next_question.difficulty,
              focus_area: response.data.next_question.focus_area
            });
          } else {
            setCurrentQuestion(null);
          }
          
          if (response.data.status) {
            setInterviewStatus(response.data.status);
          }
          
          if (response.data.is_complete) {
            setIsComplete(true);
          }
        }
        
        // Add assistant response to messages
        const assistantMessage: Message = {
          id: Date.now().toString(),
          role: 'assistant',
          content: response.data.message,
        };
        
        setMessages((messages) => [...messages, assistantMessage]);
        
      } catch (error) {
        console.error('Error in interview handling:', error);
        // Add error message
        const errorMessage: Message = {
          id: Date.now().toString(),
          role: 'assistant',
          content: 'Sorry, there was an error processing your interview. Please try again.',
        };
        setMessages((messages) => [...messages, errorMessage]);
      } finally {
        setIsLoading(false);
      }
    },
    [input, sessionId, threadId, currentQuestion, setMessages, handleInputChange, isLoading]
  );

  // Helper to start a new interview
  const startNewInterview = useCallback(async () => {
    setIsLoading(true);
    try {
      // Clear existing state
      setMessages([]);
      setThreadId(null);
      setCurrentQuestion(null);
      setInterviewStatus(null);
      setIsComplete(false);
      
      // Start new interview
      const response = await startInterview(sessionId);
      
      if (!response.success) {
        throw new Error(response.error || 'Failed to start interview');
      }
      
      setThreadId(response.data.thread_id);
      
      if (response.data.next_question) {
        setCurrentQuestion({
          id: response.data.next_question.id || '',
          question_text: response.data.next_question.question_text,
          question_type: response.data.next_question.question_type,
          related_skill: response.data.next_question.related_skill,
          difficulty: response.data.next_question.difficulty,
          focus_area: response.data.next_question.focus_area
        });
      }
      
      if (response.data.status) {
        setInterviewStatus(response.data.status);
      }
      
      // Add greeting message
      const assistantMessage: Message = {
        id: Date.now().toString(),
        role: 'assistant',
        content: response.data.message,
      };
      
      setMessages([assistantMessage]);
      
    } catch (error) {
      console.error('Error starting interview:', error);
      // Add error message
      const errorMessage: Message = {
        id: Date.now().toString(),
        role: 'assistant',
        content: 'Sorry, there was an error starting your interview. Please try again.',
      };
      setMessages([errorMessage]);
    } finally {
      setIsLoading(false);
    }
  }, [sessionId, setMessages]);

  return {
    // Chat state
    messages,
    input,
    handleInputChange,
    handleSubmit,
    isLoading: isLoading || aiIsLoading,
    error,
    
    // Interview state
    threadId,
    currentQuestion,
    interviewStatus,
    isComplete,
    
    // Actions
    startNewInterview,
  };
}