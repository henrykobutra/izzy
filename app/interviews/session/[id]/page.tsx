'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { 
  ArrowLeft,
  Bot,
  Send,
  Loader2,
  CheckCircle,
  AlertCircle
} from 'lucide-react';

import { useAuth } from '@/lib/hooks/useAuth';
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

// Interface for interview questions
interface InterviewQuestion {
  id: string;
  question_text: string;
  question_type: string; // More flexible to match what comes from the API
  related_skill: string | null;
  difficulty: string | null;
  focus_area: string | null;
}

// Interface for interview answers
interface InterviewAnswer {
  question_id: string;
  answer_text: string;
  feedback?: {
    summary?: string;
    strengths: string[];
    improvements: string[];
    score?: number;
  };
}

export default function InterviewSessionPage() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const params = useParams();
  const sessionId = params.id as string;

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [questions, setQuestions] = useState<InterviewQuestion[]>([]);
  const [answers, setAnswers] = useState<InterviewAnswer[]>([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [currentAnswer, setCurrentAnswer] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [sessionTitle, setSessionTitle] = useState('Interview Session');

  // Load session data
  useEffect(() => {
    // If not authenticated, redirect to sign-in
    if (!authLoading && !user) {
      router.push('/sign-in');
      return;
    }

    async function loadInterviewSession() {
      if (!sessionId || !user) return;

      try {
        setLoading(true);

        // Load interview session data
        const { getInterviewQuestions } = await import('@/lib/actions/interview-handler');
        const result = await getInterviewQuestions(sessionId);

        if (result.success && result.data) {
          setQuestions(result.data.questions);
          setAnswers(result.data.answers || []);
          setSessionTitle(result.data.title || 'Interview Session');

          // If we have existing answers, start from the next unanswered question
          if (result.data.answers && result.data.answers.length > 0) {
            setCurrentQuestionIndex(result.data.answers.length);
          }
        } else {
          setError(result.error || 'Failed to load interview questions');
        }
      } catch (err) {
        console.error('Error loading interview session:', err);
        setError(err instanceof Error ? err.message : 'An error occurred');
      } finally {
        setLoading(false);
      }
    }

    loadInterviewSession();
  }, [sessionId, user, authLoading, router]);

  // Submit answer to current question
  const submitAnswer = async () => {
    if (!currentAnswer.trim() || currentQuestionIndex >= questions.length) return;

    try {
      setSubmitting(true);

      const { submitInterviewAnswer } = await import('@/lib/actions/interview-handler');
      const result = await submitInterviewAnswer({
        sessionId,
        questionId: questions[currentQuestionIndex].id,
        answer: currentAnswer
      });

      if (result.success) {
        // Add answer to local state
        const newAnswer: InterviewAnswer = {
          question_id: questions[currentQuestionIndex].id,
          answer_text: currentAnswer,
          feedback: result.feedback || undefined
        };

        setAnswers([...answers, newAnswer]);
        setCurrentAnswer('');

        // Move to next question or complete interview
        if (currentQuestionIndex < questions.length - 1) {
          setCurrentQuestionIndex(currentQuestionIndex + 1);
        } else {
          // Complete interview
          await completeInterview();
        }
      } else {
        console.error('Failed to submit answer:', result.error);
        alert(result.error || 'Failed to submit your answer. Please try again.');
      }
    } catch (error) {
      console.error('Error submitting answer:', error);
      alert('An error occurred while submitting your answer. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  // Complete the interview and navigate to results
  const completeInterview = async () => {
    try {
      const { completeInterviewSession } = await import('@/lib/actions/interview-handler');
      const result = await completeInterviewSession(sessionId);

      if (result.success) {
        // Navigate to results page
        router.push(`/interviews/results/${sessionId}`);
      } else {
        console.error('Failed to complete interview:', result.error);
        alert(result.error || 'Failed to complete the interview. Please try again.');
      }
    } catch (error) {
      console.error('Error completing interview:', error);
      alert('An error occurred while completing the interview. Please try again.');
    }
  };

  // Handle keypress to submit answer with Ctrl+Enter
  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && (e.ctrlKey || e.metaKey) && !submitting) {
      e.preventDefault();
      submitAnswer();
    }
  };

  // Display loading state
  if (authLoading || loading) {
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

  // Check if we have questions to display
  if (questions.length === 0) {
    return (
      <div className="flex min-h-screen flex-col">
        <NavBar activePath="/interviews" />
        
        <main className="flex-1 container max-w-screen-xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex flex-col items-center gap-4">
            <AlertCircle className="h-12 w-12 text-amber-500" />
            <h1 className="text-xl font-medium">No Questions Available</h1>
            <p className="text-muted-foreground">No interview questions found for this session.</p>
            <Button onClick={() => router.push('/interviews')} variant="outline">
              Return to Interviews
            </Button>
          </div>
        </main>
        
        <Footer />
      </div>
    );
  }

  // Get current question
  const currentQuestion = questions[currentQuestionIndex];

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
                  // Show confirmation if in the middle of an interview
                  if (answers.length > 0 && answers.length < questions.length) {
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

            <div className="flex items-center gap-2">
              <div className="text-sm font-medium">
                Question {currentQuestionIndex + 1} of {questions.length}
              </div>
              <div className="w-24 h-2 bg-muted rounded-full overflow-hidden">
                <div 
                  className="h-full bg-primary" 
                  style={{ width: `${(currentQuestionIndex / questions.length) * 100}%` }}
                ></div>
              </div>
            </div>
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
                    <div className="px-3 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-300 text-xs rounded-full">
                      {currentQuestion.question_type.charAt(0).toUpperCase() + currentQuestion.question_type.slice(1)}
                    </div>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="p-4 bg-muted/30 rounded-lg">
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

                <div className="mt-6">
                  <Textarea
                    placeholder="Enter your answer here..."
                    value={currentAnswer}
                    onChange={(e) => setCurrentAnswer(e.target.value)}
                    onKeyDown={handleKeyPress}
                    className="min-h-32 w-full"
                    disabled={submitting}
                  />
                  <p className="text-xs text-muted-foreground mt-2">
                    Press Ctrl+Enter to submit your answer
                  </p>
                </div>

                {/* Previous question and answer */}
                {answers.length > 0 && currentQuestionIndex > 0 && 
                  questions.length > currentQuestionIndex - 1 && 
                  answers.length > currentQuestionIndex - 1 && (
                  <div className="mt-8 space-y-4">
                    <h3 className="text-sm font-medium">Previous Question</h3>
                    <div className="p-3 bg-muted/20 rounded-lg">
                      <p className="text-sm">{questions[currentQuestionIndex - 1]?.question_text}</p>
                    </div>

                    <h3 className="text-sm font-medium">Your Answer</h3>
                    <div className="p-3 border rounded-lg">
                      <p className="text-sm">{answers[currentQuestionIndex - 1]?.answer_text}</p>
                    </div>

                    {/* Feedback if available */}
                    {(() => {
                      // Safely get the answer and its feedback 
                      const answer = answers[currentQuestionIndex - 1];
                      const feedback = answer?.feedback;
                      
                      if (!feedback) return null;
                      
                      // Safely extract strengths and improvements arrays
                      const strengths = feedback.strengths || [];
                      const improvements = feedback.improvements || [];
                      
                      return (
                        <div className="p-3 bg-green-50 dark:bg-green-900/10 border border-green-200 dark:border-green-900/50 rounded-lg">
                          <h4 className="text-sm font-medium text-green-800 dark:text-green-400 mb-2">Quick Feedback</h4>
                          <div className="space-y-2 text-xs">
                            {strengths.length > 0 && (
                              <div>
                                <p className="font-medium">Strengths:</p>
                                <ul className="list-disc pl-4 text-muted-foreground">
                                  {strengths.map((strength, idx) => (
                                    <li key={idx}>{strength}</li>
                                  ))}
                                </ul>
                              </div>
                            )}
                            {improvements.length > 0 && (
                              <div>
                                <p className="font-medium">To improve:</p>
                                <ul className="list-disc pl-4 text-muted-foreground">
                                  {improvements.map((improvement, idx) => (
                                    <li key={idx}>{improvement}</li>
                                  ))}
                                </ul>
                              </div>
                            )}
                          </div>
                        </div>
                      );
                    })()}
                  </div>
                )}
              </CardContent>
              <CardFooter>
                <Button 
                  onClick={submitAnswer} 
                  disabled={!currentAnswer.trim() || submitting} 
                  className="gap-2"
                >
                  {submitting ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Processing...
                    </>
                  ) : currentQuestionIndex < questions.length - 1 ? (
                    <>
                      <Send className="h-4 w-4" />
                      Submit & Continue
                    </>
                  ) : (
                    <>
                      <CheckCircle className="h-4 w-4" />
                      Complete Interview
                    </>
                  )}
                </Button>
              </CardFooter>
            </Card>

            {/* Sidebar */}
            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="text-sm font-medium">Interview Progression</CardTitle>
                </CardHeader>
                <CardContent className="pb-2">
                  <div className="space-y-2">
                    {questions.map((question, index) => {
                      const isAnswered = answers.some(a => a.question_id === question.id);
                      const isActive = index === currentQuestionIndex;

                      return (
                        <div 
                          key={question.id}
                          className={`flex items-center gap-2 p-2 rounded-md ${isActive ? 'bg-primary/10' : ''}`}
                        >
                          <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs ${isAnswered 
                            ? 'bg-green-100 text-green-800 dark:bg-green-900/50 dark:text-green-400' 
                            : isActive 
                            ? 'bg-blue-100 text-blue-800 dark:bg-blue-900/50 dark:text-blue-400'
                            : 'bg-muted text-muted-foreground'
                          }`}>
                            {index + 1}
                          </div>
                          <div className="text-xs truncate flex-1">
                            {question.question_text.length > 40 
                              ? question.question_text.substring(0, 40) + '...'
                              : question.question_text}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-sm font-medium">Tips</CardTitle>
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