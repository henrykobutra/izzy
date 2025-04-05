'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { 
  ArrowLeft,
  Bot,
  Send,
  Loader2,
  CheckCircle,
  AlertCircle,
  User
} from 'lucide-react';

import { useAuth } from '@/lib/hooks/useAuth';
import { useInterviewChat } from '@/lib/hooks/useInterviewChat';
import { NavBar } from '@/components/ui/nav-bar';
import { Footer } from '@/components/ui/footer';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { 
  Card, 
  CardContent, 
  CardFooter, 
  CardHeader, 
  CardTitle 
} from '@/components/ui/card';

export default function InterviewSessionPage() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const params = useParams();
  const sessionId = params.id as string;
  
  const [sessionTitle, setSessionTitle] = useState('Interview Session');
  const [error, setError] = useState<string | null>(null);

  // Use our custom interview chat hook
  const {
    messages,
    input,
    handleInputChange,
    handleSubmit,
    isLoading,
    currentQuestion,
    interviewStatus,
    isComplete,
    startNewInterview
  } = useInterviewChat({
    sessionId
  });

  // Effect to redirect if not authenticated
  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/sign-in');
    }
  }, [user, authLoading, router]);

  // Effect to load the session title (could be expanded to fetch more session data)
  useEffect(() => {
    async function loadSessionInfo() {
      try {
        // For now, just set a placeholder title
        // This could fetch the real title from the database
        setSessionTitle('Interview Session');
      } catch (err) {
        console.error('Error loading session info:', err);
        setError(err instanceof Error ? err.message : 'Failed to load session data');
      }
    }
    
    if (sessionId) {
      loadSessionInfo();
    }
  }, [sessionId]);

  // Effect to start the interview when the component loads
  useEffect(() => {
    if (sessionId && user && !authLoading && messages.length === 0) {
      startNewInterview();
    }
  }, [sessionId, user, authLoading, messages.length, startNewInterview]);

  // Handle keypress to submit answer with Ctrl+Enter
  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && (e.ctrlKey || e.metaKey) && !isLoading && input.trim()) {
      e.preventDefault();
      handleSubmit(new SubmitEvent('submit'));
    }
  };

  // Display loading state
  if (authLoading) {
    return (
      <div className="flex min-h-screen flex-col">
        <NavBar activePath="/interviews" />
        
        <main className="flex-1 flex items-center justify-center py-12">
          <div className="flex flex-col items-center gap-4">
            <Loader2 className="h-12 w-12 animate-spin text-primary" />
            <p className="text-lg font-medium">Loading interview session...</p>
          </div>
        </main>
        
        <Footer />
      </div>
    );
  }

  // Display error state
  if (error) {
    return (
      <div className="flex min-h-screen flex-col">
        <NavBar activePath="/interviews" />
        
        <main className="flex-1 container max-w-screen-xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex flex-col items-center gap-4">
            <AlertCircle className="h-12 w-12 text-red-500" />
            <h1 className="text-xl font-medium">Error Loading Interview</h1>
            <p className="text-muted-foreground">{error}</p>
            <Button onClick={() => router.push('/interviews')} variant="outline">
              Return to Interviews
            </Button>
          </div>
        </main>
        
        <Footer />
      </div>
    );
  }

  return (
    <div className="flex min-h-screen flex-col">
      <NavBar activePath="/interviews" />
      
      <main className="flex-1 container max-w-screen-xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="space-y-6">
          {/* Header with navigation and progress */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="space-y-1">
              <Button 
                variant="ghost" 
                size="sm" 
                className="gap-1 -ml-2"
                onClick={() => {
                  if (messages.length > 1 && !isComplete) {
                    if (confirm('Your progress will be saved, but you will exit the current interview. Continue?')) {
                      router.push('/interviews');
                    }
                  } else {
                    router.push('/interviews');
                  }
                }}
              >
                <ArrowLeft className="h-4 w-4" />
                <span>Back</span>
              </Button>
              <h1 className="text-3xl font-bold tracking-tight">Interview Session</h1>
              <p className="text-muted-foreground">{sessionTitle}</p>
            </div>

            {interviewStatus && (
              <div className="flex items-center gap-2">
                <div className="text-sm font-medium">
                  Question {interviewStatus.current_question_index + 1} of {interviewStatus.total_questions}
                </div>
                <div className="w-24 h-2 bg-muted rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-primary" 
                    style={{ width: `${interviewStatus.estimated_completion_percentage}%` }}
                  ></div>
                </div>
              </div>
            )}
          </div>

          {/* Interview interface */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card className="md:col-span-2">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center gap-2">
                    <Bot className="h-5 w-5 text-amber-500" />
                    Interviewer
                  </CardTitle>
                  {currentQuestion && (
                    <div className="flex items-center gap-2">
                      {currentQuestion.difficulty && (
                        <div className={`px-3 py-1 text-xs rounded-full ${currentQuestion.difficulty === 'easy' 
                          ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400'
                          : currentQuestion.difficulty === 'medium'
                          ? 'bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400'
                          : 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400'
                        }`}>
                          {currentQuestion.difficulty.charAt(0).toUpperCase() + currentQuestion.difficulty.slice(1)}
                        </div>
                      )}
                      {currentQuestion.question_type && (
                        <div className="px-3 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-300 text-xs rounded-full">
                          {currentQuestion.question_type.charAt(0).toUpperCase() + currentQuestion.question_type.slice(1)}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </CardHeader>
              <CardContent>
                {/* Conversation display */}
                <div className="space-y-4 mb-6">
                  {messages.map((message) => (
                    <div 
                      key={message.id} 
                      className={`flex ${message.role === 'assistant' ? 'justify-start' : 'justify-end'}`}
                    >
                      <div 
                        className={`max-w-[80%] p-3 rounded-lg ${
                          message.role === 'assistant' 
                            ? 'bg-muted/30 rounded-tl-none' 
                            : 'bg-primary/10 text-primary-foreground rounded-tr-none'
                        }`}
                      >
                        <div className="flex items-center gap-2 mb-1">
                          {message.role === 'assistant' ? (
                            <Bot className="h-4 w-4 text-amber-500" />
                          ) : (
                            <User className="h-4 w-4 text-blue-500" />
                          )}
                          <span className="text-xs font-medium">
                            {message.role === 'assistant' ? 'Interviewer' : 'You'}
                          </span>
                        </div>
                        <p className="text-sm whitespace-pre-line">{message.content}</p>
                      </div>
                    </div>
                  ))}
                  
                  {isLoading && (
                    <div className="flex justify-start">
                      <div className="max-w-[80%] p-3 rounded-lg bg-muted/30 rounded-tl-none">
                        <div className="flex items-center gap-2">
                          <Bot className="h-4 w-4 text-amber-500" />
                          <Loader2 className="h-3 w-3 animate-spin text-primary" />
                          <span className="text-xs font-medium">Interviewer is typing...</span>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
                
                {/* Current question info */}
                {currentQuestion && (
                  <div className="p-4 bg-muted/30 rounded-lg mt-4 mb-6">
                    <p className="text-lg">{currentQuestion.question_text}</p>
                    <div className="mt-2 flex flex-wrap gap-2">
                      {currentQuestion.focus_area && (
                        <span className="text-xs text-muted-foreground bg-background px-2 py-1 rounded-md">
                          Focus: {currentQuestion.focus_area}
                        </span>
                      )}
                      {currentQuestion.related_skill && (
                        <span className="text-xs text-muted-foreground bg-background px-2 py-1 rounded-md">
                          Skill: {currentQuestion.related_skill}
                        </span>
                      )}
                    </div>
                  </div>
                )}

                {/* Input area */}
                <form onSubmit={handleSubmit}>
                  <Textarea
                    placeholder="Type your answer here..."
                    value={input}
                    onChange={handleInputChange}
                    onKeyDown={handleKeyPress}
                    className="min-h-32 w-full"
                    disabled={isLoading || isComplete}
                  />
                  <p className="text-xs text-muted-foreground mt-2">
                    Press Ctrl+Enter to submit your answer
                  </p>
                </form>
              </CardContent>
              <CardFooter>
                <Button 
                  type="submit"
                  onClick={() => handleSubmit(new SubmitEvent('submit'))}
                  disabled={!input.trim() || isLoading || isComplete} 
                  className="gap-2"
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Processing...
                    </>
                  ) : isComplete ? (
                    <>
                      <CheckCircle className="h-4 w-4" />
                      Interview Complete
                    </>
                  ) : (
                    <>
                      <Send className="h-4 w-4" />
                      Submit Answer
                    </>
                  )}
                </Button>
                
                {isComplete && (
                  <Button 
                    variant="outline" 
                    onClick={() => router.push(`/interviews/results/${sessionId}`)}
                    className="ml-2"
                  >
                    View Results
                  </Button>
                )}
              </CardFooter>
            </Card>

            {/* Sidebar */}
            <div className="space-y-6">
              {interviewStatus && (
                <Card>
                  <CardHeader>
                    <CardTitle className="text-sm font-medium">Interview Progress</CardTitle>
                  </CardHeader>
                  <CardContent className="pb-2">
                    <div className="mb-4">
                      <div className="text-xs text-muted-foreground mb-1">Completion</div>
                      <div className="w-full h-2 bg-muted rounded-full overflow-hidden">
                        <div 
                          className="h-full bg-primary" 
                          style={{ width: `${interviewStatus.estimated_completion_percentage}%` }}
                        ></div>
                      </div>
                      <div className="text-xs text-right mt-1">{Math.round(interviewStatus.estimated_completion_percentage)}%</div>
                    </div>
                    
                    {interviewStatus.areas_covered.length > 0 && (
                      <div className="mb-4">
                        <div className="text-xs font-medium mb-1">Areas Covered</div>
                        <div className="flex flex-wrap gap-1">
                          {interviewStatus.areas_covered.map((area, index) => (
                            <span key={index} className="text-xs bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-400 px-2 py-0.5 rounded-full">
                              {area}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                    
                    {interviewStatus.remaining_areas.length > 0 && (
                      <div>
                        <div className="text-xs font-medium mb-1">Remaining Areas</div>
                        <div className="flex flex-wrap gap-1">
                          {interviewStatus.remaining_areas.map((area, index) => (
                            <span key={index} className="text-xs bg-muted text-muted-foreground px-2 py-0.5 rounded-full">
                              {area}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>
              )}

              <Card>
                <CardHeader>
                  <CardTitle className="text-sm font-medium">Interview Tips</CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="text-xs space-y-2 text-muted-foreground">
                    <li className="flex items-start gap-2">
                      <div className="min-w-4 pt-0.5">•</div>
                      <div>Be concise but thorough in your answers</div>
                    </li>
                    <li className="flex items-start gap-2">
                      <div className="min-w-4 pt-0.5">•</div>
                      <div>Provide specific examples from your experience</div>
                    </li>
                    <li className="flex items-start gap-2">
                      <div className="min-w-4 pt-0.5">•</div>
                      <div>Structure technical responses with your approach first, then details</div>
                    </li>
                    <li className="flex items-start gap-2">
                      <div className="min-w-4 pt-0.5">•</div>
                      <div>For behavioral questions, use the STAR method (Situation, Task, Action, Result)</div>
                    </li>
                  </ul>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}