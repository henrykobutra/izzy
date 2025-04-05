'use client';

import { useState, useCallback } from 'react';
import { useChat, type Message } from 'ai/react';
import { streamInterviewResponse } from '@/lib/actions/interview-stream';

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
  const [isFirstInteraction, setIsFirstInteraction] = useState(true);
  const [isResetting, setIsResetting] = useState(false);

  // Use Vercel AI SDK's useChat hook with our custom API
  const {
    messages,
    input,
    handleInputChange,
    setMessages,
    isLoading,
    error
  } = useChat({
    initialMessages,
    id: sessionId,
    api: {
      body: {
        sessionId,
        threadId,
        questionId: currentQuestion?.id
      }
    },
    onFinish: (message) => {
      // Check for data in the message
      const data = message.data;
      if (data) {
        // Update thread ID if available
        if (data.threadId) {
          setThreadId(data.threadId);
        }
        
        // Update current question if available
        if (data.nextQuestion) {
          setCurrentQuestion({
            id: data.nextQuestion.id || '',
            question_text: data.nextQuestion.question_text,
            question_type: data.nextQuestion.question_type,
            related_skill: data.nextQuestion.related_skill,
            difficulty: data.nextQuestion.difficulty,
            focus_area: data.nextQuestion.focus_area
          });
        }
        
        // Update interview status if available
        if (data.status) {
          setInterviewStatus(data.status);
        }
        
        // Update completion status
        if (data.isComplete) {
          setIsComplete(true);
        }
      }
    }
  });

  // Override the normal append behavior to use our streaming server action
  const sendMessage = useCallback(
    async (content: string) => {
      if (!sessionId) return;
      
      // Optimistically add message to UI
      const userMessage: Message = {
        id: Date.now().toString(),
        role: 'user',
        content,
      };
      
      // Add user message to UI
      setMessages((messages) => [...messages, userMessage]);
      
      try {
        // Add loading message
        const pendingMessage: Message = {
          id: Date.now().toString() + '-pending',
          role: 'assistant',
          content: '', // Will be filled by streaming
          isLoading: true,
        };
        
        setMessages((messages) => [...messages, pendingMessage]);
        
        // Call streaming server action
        const { stream, metadata } = await streamInterviewResponse({
          sessionId,
          threadId: threadId,
          message: content,
          questionId: currentQuestion?.id
        });
        
        // Create a new message to replace the pending one
        const responseMessage: Message = {
          id: Date.now().toString() + '-response',
          role: 'assistant',
          content: '',
        };
        
        // Handle streaming
        try {
          const reader = stream.getReader();
          const decoder = new TextDecoder();
          
          // Remove loading message and add the real one
          setMessages((messages) => messages.filter(m => m.id !== pendingMessage.id).concat(responseMessage));
          
          // Read and process stream chunks
          let done = false;
          let accumulatedContent = '';
          
          while (!done) {
            const { value, done: doneReading } = await reader.read();
            done = doneReading;
            
            if (value) {
              accumulatedContent += decoder.decode(value, { stream: true });
              // Update the message with latest content
              setMessages((messages) => 
                messages.map(m => 
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
              messages.map(m => 
                m.id === responseMessage.id 
                  ? { ...m, content: accumulatedContent } 
                  : m
              )
            );
          }
        } catch (streamError) {
          console.error("Error reading stream:", streamError);
        }
        
        // Process metadata
        if (metadata) {
          if (metadata.threadId) {
            setThreadId(metadata.threadId);
          }
          
          if (metadata.nextQuestion) {
            setCurrentQuestion({
              id: metadata.nextQuestion.id || '',
              question_text: metadata.nextQuestion.question_text,
              question_type: metadata.nextQuestion.question_type,
              related_skill: metadata.nextQuestion.related_skill,
              difficulty: metadata.nextQuestion.difficulty,
              focus_area: metadata.nextQuestion.focus_area
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
        console.error('Error in streaming interview response:', error);
        
        // Add error message
        setMessages((messages) => [
          ...messages,
          {
            id: Date.now().toString() + '-error',
            role: 'assistant',
            content: 'Sorry, there was an error processing your request. Please try again.'
          }
        ]);
      }
    },
    [sessionId, threadId, currentQuestion, setMessages]
  );

  // Start a new interview with streaming
  const startNewInterview = useCallback(async () => {
    if (!sessionId) return;
    
    try {
      // Set resetting flag
      setIsResetting(true);
      
      // Clear existing state
      setMessages([]);
      setThreadId(null);
      setCurrentQuestion(null);
      setInterviewStatus(null);
      setIsComplete(false);
      
      // Add loading message
      const pendingMessage: Message = {
        id: Date.now().toString() + '-pending',
        role: 'assistant',
        content: '', // Will be filled by streaming
        isLoading: true,
      };
      
      setMessages([pendingMessage]);
      
      // Call streaming server action
      const { stream, metadata } = await streamInterviewResponse({
        sessionId,
      });
      
      // Create a new message to replace the pending one
      const responseMessage: Message = {
        id: Date.now().toString() + '-response',
        role: 'assistant',
        content: '',
      };
      
      // Remove pending message and add the real one
      setMessages([responseMessage]);
      
      // Handle streaming
      try {
        const reader = stream.getReader();
        const decoder = new TextDecoder();
        
        let done = false;
        let accumulatedContent = '';
        
        while (!done) {
          const { value, done: doneReading } = await reader.read();
          done = doneReading;
          
          if (value) {
            accumulatedContent += decoder.decode(value, { stream: true });
            // Update the message with latest content
            setMessages([{ ...responseMessage, content: accumulatedContent }]);
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
      }
      
      // Process metadata
      if (metadata) {
        if (metadata.threadId) {
          setThreadId(metadata.threadId);
        }
        
        if (metadata.nextQuestion) {
          setCurrentQuestion({
            id: metadata.nextQuestion.id || '',
            question_text: metadata.nextQuestion.question_text,
            question_type: metadata.nextQuestion.question_type,
            related_skill: metadata.nextQuestion.related_skill,
            difficulty: metadata.nextQuestion.difficulty,
            focus_area: metadata.nextQuestion.focus_area
          });
        }
        
        if (metadata.status) {
          setInterviewStatus(metadata.status);
        }
      }
      
      setIsFirstInteraction(false);
    } catch (error) {
      console.error('Error starting interview:', error);
      
      // Add error message
      setMessages([
        {
          id: Date.now().toString() + '-error',
          role: 'assistant',
          content: 'Sorry, there was an error starting your interview. Please try again.'
        }
      ]);
    } finally {
      // Clear resetting flag
      setIsResetting(false);
    }
  }, [sessionId, setMessages]);

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
        handleInputChange({ target: { value: '' } } as React.ChangeEvent<HTMLInputElement>);
      }
    },
    [input, isLoading, isFirstInteraction, startNewInterview, sendMessage, handleInputChange]
  );

  return {
    // Chat state
    messages,
    input,
    handleInputChange,
    handleSubmit,
    isLoading,
    error,
    
    // Interview state
    threadId,
    currentQuestion,
    interviewStatus,
    isComplete,
    isResetting,
    
    // Actions
    startNewInterview,
  };
}