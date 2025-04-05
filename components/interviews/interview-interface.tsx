'use client';

import { useState, useEffect, useRef } from 'react';
import { getInterviewQuestions, submitInterviewAnswer } from '@/lib/actions/interview-handler';
import { Loader2, Send, MessageSquare, Clock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';

// User avatar component
function User(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2" />
      <circle cx="12" cy="7" r="4" />
    </svg>
  )
}

interface Message {
  role: 'user' | 'interviewer';
  content: string;
  questionId?: string;
}

interface InterviewStatus {
  current_question_index: number;
  total_questions: number;
  estimated_completion_percentage: number;
  areas_covered: string[];
  remaining_areas: string[];
}

interface InterviewInterfaceProps {
  sessionId: string;
  onComplete: () => void;
}

export default function InterviewInterface({ sessionId, onComplete }: InterviewInterfaceProps) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [userInput, setUserInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [threadId, setThreadId] = useState<string | null>(null);
  const [status, setStatus] = useState<InterviewStatus | null>(null);
  const [currentQuestionId, setCurrentQuestionId] = useState<string | null>(null);
  const [isComplete, setIsComplete] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Start the interview on component mount
  useEffect(() => {
    const initInterview = async () => {
      setIsLoading(true);
      try {
        const result = await getInterviewQuestions(sessionId);
        if (result.success && result.data) {
          // Create mock thread ID since we're using the Supabase version instead of OpenAI
          const mockThreadId = `thread-${sessionId}`;
          setThreadId(mockThreadId);
          
          // Create welcome message if questions exist
          if (result.data.questions && result.data.questions.length > 0) {
            const firstQuestion = result.data.questions[0];
            setMessages([{
              role: 'interviewer',
              content: `Welcome to your interview! Let's begin with the first question: ${firstQuestion.question_text}`
            }]);
            setCurrentQuestionId(firstQuestion.id || null);
          } else {
            setMessages([{
              role: 'interviewer',
              content: 'Welcome to your interview! Unfortunately, no questions are available.'
            }]);
          }
          
          // Create mock status
          setStatus({
            current_question_index: 1,
            total_questions: result.data.questions?.length || 0,
            estimated_completion_percentage: result.data.questions?.length > 0 ? (1 / result.data.questions.length) * 100 : 0,
            areas_covered: ['Introduction'],
            remaining_areas: ['Technical Skills', 'Experience', 'Problem Solving']
          });
        } else {
          console.error('Failed to start interview:', result.error);
        }
      } catch (error) {
        console.error('Error starting interview:', error);
      } finally {
        setIsLoading(false);
      }
    };

    initInterview();
  }, [sessionId]);

  // Scroll to bottom of messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSubmit = async () => {
    if (!userInput.trim() || !threadId || isLoading) return;
    
    const userMessage = userInput.trim();
    setUserInput('');
    setIsLoading(true);
    
    // Add user message to state
    setMessages(prev => [...prev, { role: 'user', content: userMessage }]);
    
    try {
      const result = await submitInterviewAnswer({ 
        sessionId, 
        questionId: currentQuestionId || '', 
        answer: userMessage 
      });
      if (result.success) {
        // Add feedback as interviewer response
        const feedbackMessage = result.feedback?.summary || "Thank you for your answer.";
        setMessages(prev => [...prev, { role: 'interviewer', content: feedbackMessage }]);
        
        // Find current question index
        const currentIndex = status ? status.current_question_index : 0;
        const totalQuestions = status ? status.total_questions : 0;
        
        // Move to next question if there are more
        if (currentIndex < totalQuestions) {
          // Get questions from state or fetch them again if needed
          const nextIndex = currentIndex + 1;
          const nextQuestion = await getInterviewQuestions(sessionId);
          
          if (nextQuestion.success && nextQuestion.data?.questions && nextQuestion.data.questions[nextIndex - 1]) {
            const questionObj = nextQuestion.data.questions[nextIndex - 1];
            setCurrentQuestionId(questionObj.id);
            
            // Add next question as message
            setMessages(prev => [...prev, { 
              role: 'interviewer', 
              content: `Next question: ${questionObj.question_text}`
            }]);
            
            // Update status
            setStatus(prev => prev ? {
              ...prev,
              current_question_index: nextIndex,
              estimated_completion_percentage: (nextIndex / totalQuestions) * 100,
              areas_covered: [...prev.areas_covered, questionObj.focus_area || 'General']
            } : null);
          }
        } else {
          // Interview is complete
          setCurrentQuestionId(null);
          setIsComplete(true);
          
          // Add completion message
          setMessages(prev => [...prev, { 
            role: 'interviewer', 
            content: "That completes our interview. Thank you for your time and responses!"
          }]);
          
          onComplete();
        }
      } else {
        console.error('Failed to submit answer:', result.error);
        // Add error message
        setMessages(prev => [...prev, { 
          role: 'interviewer', 
          content: 'Sorry, I encountered an error processing your response. Let\'s continue with the next question.' 
        }]);
      }
    } catch (error) {
      console.error('Error submitting answer:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-full">
      {/* Progress indicator */}
      {status && (
        <div className="mb-4">
          <div className="flex items-center justify-between mb-1 text-sm">
            <span>Interview Progress</span>
            <span>{Math.round(status.estimated_completion_percentage)}%</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2 dark:bg-gray-700">
            <div
              className="bg-primary h-2 rounded-full"
              style={{ width: `${status.estimated_completion_percentage}%` }}
            ></div>
          </div>
          <div className="flex items-center justify-between mt-2 text-xs text-muted-foreground">
            <div className="flex items-center gap-1">
              <Clock className="w-3 h-3" />
              <span>Question {status.current_question_index} of {status.total_questions}</span>
            </div>
            {status.remaining_areas.length > 0 && (
              <span>Coming up: {status.remaining_areas.join(', ')}</span>
            )}
          </div>
        </div>
      )}
      
      {/* Messages area */}
      <div className="flex-grow overflow-y-auto mb-4 space-y-4 p-2">
        {messages.length === 0 && isLoading ? (
          <div className="flex items-center justify-center h-full">
            <div className="flex flex-col items-center gap-2">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
              <p className="text-sm text-muted-foreground">Starting interview...</p>
            </div>
          </div>
        ) : (
          messages.map((message, index) => (
            <div 
              key={index} 
              className={`flex items-start gap-3 ${message.role === 'user' ? 'flex-row-reverse' : ''}`}
            >
              <div className="flex-shrink-0 mt-1">
                <div 
                  className={`flex items-center justify-center h-8 w-8 rounded-full ${
                    message.role === 'user' 
                      ? 'bg-primary/20' 
                      : 'bg-amber-100 dark:bg-amber-900/30'
                  }`}
                >
                  {message.role === 'user' ? (
                    <User className="h-4 w-4 text-primary" />
                  ) : (
                    <MessageSquare className="h-4 w-4 text-amber-600 dark:text-amber-400" />
                  )}
                </div>
              </div>
              <div 
                className={`flex-1 p-3 rounded-lg ${
                  message.role === 'user' 
                    ? 'bg-primary/5' 
                    : 'bg-muted/30'
                }`}
              >
                <p className={`text-sm ${message.role === 'interviewer' ? 'font-medium' : ''}`}>
                  {message.content}
                </p>
              </div>
            </div>
          ))
        )}
        <div ref={messagesEndRef} />
      </div>
      
      {/* Input area */}
      <div className="mt-auto">
        <div className="flex items-end gap-2">
          <Textarea
            value={userInput}
            onChange={(e) => setUserInput(e.target.value)}
            placeholder="Type your response..."
            className="flex-grow resize-none"
            rows={3}
            disabled={isLoading || isComplete}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                handleSubmit();
              }
            }}
          />
          <Button 
            onClick={handleSubmit}
            disabled={!userInput.trim() || isLoading || isComplete}
            className="mb-1"
            size="icon"
          >
            {isLoading ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Send className="h-4 w-4" />
            )}
          </Button>
        </div>
        <p className="text-xs text-muted-foreground mt-2">
          Press Enter to send your answer. Use Shift+Enter for a new line.
        </p>
      </div>
    </div>
  );
}