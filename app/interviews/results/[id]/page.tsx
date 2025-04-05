'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Link from 'next/link';
import { 
  ArrowLeft,
  BarChart4,
  Share2,
  Download,
  Loader2,
  AlertCircle,
  CheckCircle, 
  XCircle,
  TrendingUp,
  Calendar
} from 'lucide-react';

import { useAuth } from '@/lib/hooks/useAuth';
import { NavBar } from '@/components/ui/nav-bar';
import { Footer } from '@/components/ui/footer';
import { Button } from '@/components/ui/button';
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardFooter, 
  CardHeader, 
  CardTitle 
} from '@/components/ui/card';

// Interface for interview result
interface InterviewResult {
  sessionId: string;
  title: string;
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
  questions: {
    id: string;
    text: string;
    type: string;
    score: number;
    answer: string;
    feedback: string;
  }[];
}

export default function InterviewResultsPage() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const params = useParams();
  const sessionId = params.id as string;

  const [result, setResult] = useState<InterviewResult | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // If not authenticated, redirect to sign-in
    if (!authLoading && !user) {
      router.push('/sign-in');
      return;
    }

    async function loadInterviewResults() {
      if (!sessionId || !user) return;

      try {
        setLoading(true);

        // Load interview results using server action
        const { getInterviewResults } = await import('@/lib/actions/interview-handler');
        const response = await getInterviewResults(sessionId);

        if (response.success && response.data) {
          setResult(response.data);
        } else {
          setError(response.error || 'Failed to load interview results');
        }
      } catch (err) {
        console.error('Error loading interview results:', err);
        setError(err instanceof Error ? err.message : 'An error occurred');
      } finally {
        setLoading(false);
      }
    }

    loadInterviewResults();
  }, [sessionId, user, authLoading, router]);

  // Display loading state
  if (authLoading || loading) {
    return (
      <div className="flex min-h-screen flex-col">
        <NavBar activePath="/interviews" />
        
        <main className="flex-1 flex items-center justify-center py-12">
          <div className="flex flex-col items-center gap-4">
            <Loader2 className="h-12 w-12 animate-spin text-primary" />
            <p className="text-lg font-medium">Loading your results...</p>
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
            <h1 className="text-xl font-medium">Error Loading Results</h1>
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

  // If no result available
  if (!result) {
    return (
      <div className="flex min-h-screen flex-col">
        <NavBar activePath="/interviews" />
        
        <main className="flex-1 container max-w-screen-xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex flex-col items-center gap-4">
            <AlertCircle className="h-12 w-12 text-amber-500" />
            <h1 className="text-xl font-medium">No Results Available</h1>
            <p className="text-muted-foreground">No interview results found for this session.</p>
            <Button onClick={() => router.push('/interviews')} variant="outline">
              Return to Interviews
            </Button>
          </div>
        </main>
        
        <Footer />
      </div>
    );
  }

  // Calculate performance level
  const getPerformanceLevel = (score: number) => {
    if (score >= 4.5) return 'Exceptional';
    if (score >= 4.0) return 'Excellent';
    if (score >= 3.5) return 'Very Good';
    if (score >= 3.0) return 'Good';
    if (score >= 2.5) return 'Satisfactory';
    if (score >= 2.0) return 'Fair';
    return 'Needs Improvement';
  };

  // Get color based on score
  const getScoreColor = (score: number) => {
    if (score >= 4.0) return 'text-green-600 dark:text-green-400';
    if (score >= 3.0) return 'text-amber-600 dark:text-amber-400';
    return 'text-red-600 dark:text-red-400';
  };

  return (
    <div className="flex min-h-screen flex-col">
      <NavBar activePath="/interviews" />
      
      <main className="flex-1 container max-w-screen-xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="space-y-6">
          {/* Header with navigation */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="space-y-1">
              <Button 
                variant="ghost" 
                size="sm" 
                className="gap-1 -ml-2"
                asChild
              >
                <Link href="/interviews">
                  <ArrowLeft className="h-4 w-4" />
                  <span>Back</span>
                </Link>
              </Button>
              <h1 className="text-3xl font-bold tracking-tight">Interview Results</h1>
              <p className="text-muted-foreground">{result.title} • {result.date}</p>
            </div>

            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm" className="gap-1">
                <Share2 className="h-4 w-4" />
                <span>Share</span>
              </Button>
              <Button variant="outline" size="sm" className="gap-1">
                <Download className="h-4 w-4" />
                <span>Download</span>
              </Button>
              <Button size="sm" className="gap-1" asChild>
                <Link href={`/interviews/session/${sessionId}`}>
                  <Calendar className="h-4 w-4" />
                  <span>Practice Again</span>
                </Link>
              </Button>
            </div>
          </div>

          {/* Overall performance card */}
          <Card className="overflow-hidden">
            <div className="relative">
              {/* Top status bar colored based on score */}
              <div className="absolute top-0 left-0 right-0 h-1">
                <div className={`h-full ${result.overallScore >= 4.0 ? 'bg-green-500' : 
                  result.overallScore >= 3.0 ? 'bg-amber-500' : 'bg-red-500'}`}></div>
              </div>
              
              <div className="pt-5 p-6">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div>
                    <h2 className="text-2xl font-bold">{getPerformanceLevel(result.overallScore)}</h2>
                    <p className="text-muted-foreground">Overall Performance Assessment</p>
                  </div>
                  
                  <div className="flex items-center gap-3">
                    <div className={`text-4xl font-bold ${getScoreColor(result.overallScore)}`}>
                      {result.overallScore.toFixed(1)}
                    </div>
                    <div className="text-xl text-muted-foreground">/5.0</div>
                  </div>
                </div>
              </div>
            </div>
          </Card>

          {/* Score breakdown and strengths/weaknesses */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Score breakdown */}
            <Card>
              <CardHeader>
                <CardTitle>
                  <div className="flex items-center gap-2">
                    <BarChart4 className="h-5 w-5 text-primary" />
                    Score Breakdown
                  </div>
                </CardTitle>
                <CardDescription>
                  Performance across different assessment areas
                </CardDescription>
              </CardHeader>
              <CardContent className="pb-2">
                <div className="space-y-4">
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <p className="text-sm font-medium">Technical Skills</p>
                      <p className="text-sm font-medium">{result.scoreBreakdown.technical.toFixed(1)}/5</p>
                    </div>
                    <div className="h-2 rounded-full bg-muted">
                      <div 
                        className={`h-full rounded-full ${result.scoreBreakdown.technical >= 4.0 ? 'bg-green-500' : 
                          result.scoreBreakdown.technical >= 3.0 ? 'bg-amber-500' : 'bg-red-500'}`} 
                        style={{ width: `${result.scoreBreakdown.technical * 20}%` }}
                      ></div>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <p className="text-sm font-medium">Communication</p>
                      <p className="text-sm font-medium">{result.scoreBreakdown.communication.toFixed(1)}/5</p>
                    </div>
                    <div className="h-2 rounded-full bg-muted">
                      <div 
                        className={`h-full rounded-full ${result.scoreBreakdown.communication >= 4.0 ? 'bg-green-500' : 
                          result.scoreBreakdown.communication >= 3.0 ? 'bg-amber-500' : 'bg-red-500'}`}
                        style={{ width: `${result.scoreBreakdown.communication * 20}%` }}
                      ></div>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <p className="text-sm font-medium">Problem Solving</p>
                      <p className="text-sm font-medium">{result.scoreBreakdown.problemSolving.toFixed(1)}/5</p>
                    </div>
                    <div className="h-2 rounded-full bg-muted">
                      <div 
                        className={`h-full rounded-full ${result.scoreBreakdown.problemSolving >= 4.0 ? 'bg-green-500' : 
                          result.scoreBreakdown.problemSolving >= 3.0 ? 'bg-amber-500' : 'bg-red-500'}`}
                        style={{ width: `${result.scoreBreakdown.problemSolving * 20}%` }}
                      ></div>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <p className="text-sm font-medium">Cultural Fit</p>
                      <p className="text-sm font-medium">{result.scoreBreakdown.cultureFit.toFixed(1)}/5</p>
                    </div>
                    <div className="h-2 rounded-full bg-muted">
                      <div 
                        className={`h-full rounded-full ${result.scoreBreakdown.cultureFit >= 4.0 ? 'bg-green-500' : 
                          result.scoreBreakdown.cultureFit >= 3.0 ? 'bg-amber-500' : 'bg-red-500'}`}
                        style={{ width: `${result.scoreBreakdown.cultureFit * 20}%` }}
                      ></div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Strengths and weaknesses */}
            <Card>
              <CardHeader>
                <CardTitle>
                  <div className="flex items-center gap-2">
                    <TrendingUp className="h-5 w-5 text-primary" />
                    Analysis
                  </div>
                </CardTitle>
                <CardDescription>
                  Key strengths and areas for improvement
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-5">
                  <div>
                    <h3 className="text-sm font-medium flex items-center gap-1.5 mb-2">
                      <CheckCircle className="h-4 w-4 text-green-500" />
                      Strengths
                    </h3>
                    <ul className="space-y-1">
                      {result.strengths.map((strength, idx) => (
                        <li key={idx} className="text-sm pl-5 relative">
                          <span className="absolute left-0 top-1.5 w-1.5 h-1.5 rounded-full bg-green-500"></span>
                          {strength}
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div>
                    <h3 className="text-sm font-medium flex items-center gap-1.5 mb-2">
                      <XCircle className="h-4 w-4 text-amber-500" />
                      Areas to Improve
                    </h3>
                    <ul className="space-y-1">
                      {result.weaknesses.map((weakness, idx) => (
                        <li key={idx} className="text-sm pl-5 relative">
                          <span className="absolute left-0 top-1.5 w-1.5 h-1.5 rounded-full bg-amber-500"></span>
                          {weakness}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </CardContent>
              <CardFooter className="flex flex-col items-start pt-0">
                <h3 className="text-sm font-medium mb-2">Recommendations</h3>
                <ul className="text-sm space-y-1 text-muted-foreground w-full">
                  {result.recommendations.map((rec, idx) => (
                    <li key={idx} className="flex items-start gap-2">
                      <div className="min-w-4 pt-0.5">•</div>
                      <div>{rec}</div>
                    </li>
                  ))}
                </ul>
              </CardFooter>
            </Card>
          </div>

          {/* Questions and answers */}
          <Card>
            <CardHeader>
              <CardTitle>Questions & Answers</CardTitle>
              <CardDescription>
                Your responses with feedback
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                {result.questions.map((question, idx) => (
                  <div key={question.id} className="pb-6 border-b last:border-b-0 last:pb-0">
                    <div className="flex justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <span className="inline-flex items-center justify-center h-6 w-6 text-xs font-medium rounded-full bg-primary/10 text-primary">
                          {idx + 1}
                        </span>
                        <span className="text-sm font-medium">{question.type}</span>
                      </div>
                      <div className={`text-sm font-medium ${getScoreColor(question.score)}`}>
                        {question.score.toFixed(1)}/5
                      </div>
                    </div>

                    <p className="text-base mb-3">{question.text}</p>

                    <div className="p-3 border rounded-lg bg-muted/10 mb-3">
                      <h4 className="text-xs uppercase tracking-wider text-muted-foreground mb-1">Your Answer</h4>
                      <p className="text-sm">{question.answer}</p>
                    </div>

                    <div className="p-3 border-l-2 border-primary/40 bg-primary/5 rounded-sm">
                      <h4 className="text-xs uppercase tracking-wider text-primary mb-1">Feedback</h4>
                      <p className="text-sm text-muted-foreground">{question.feedback}</p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
            <CardFooter>
              <Button asChild>
                <Link href={`/interviews?session=${sessionId}`}>
                  Practice Similar Interview
                </Link>
              </Button>
            </CardFooter>
          </Card>
        </div>
      </main>

      <Footer />
    </div>
  );
}