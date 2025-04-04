'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { 
  Bot,
  MessageSquare, 
  BarChart4,
  FileText,
  ArrowRight,
  PlayCircle,
  CheckCircle,
  Clock,
  Loader2
} from 'lucide-react';

import { useAuth } from '@/lib/hooks/useAuth';
import { NavBar } from '@/components/ui/nav-bar';
import { Footer } from '@/components/ui/footer';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardFooter, 
  CardHeader, 
  CardTitle 
} from '@/components/ui/card';
import {
  Tabs,
  TabsList,
  TabsTrigger
} from '@/components/ui/tabs';

// Interview types
type InterviewStep = 'setup' | 'strategy' | 'interview' | 'evaluation';
type InterviewStatus = 'not_started' | 'in_progress' | 'completed';

export default function InterviewsPage() {
  const { user, loading } = useAuth();
  const router = useRouter();
  
  const [resumeUploaded, setResumeUploaded] = useState(false);
  const [jobDescriptionEntered, setJobDescriptionEntered] = useState(false);
  const [jobDescription, setJobDescription] = useState('');
  const [currentStep, setCurrentStep] = useState<InterviewStep>('setup');
  const [isProcessing, setIsProcessing] = useState(false);
  
  // Mock interview sessions
  const [interviewSessions, setInterviewSessions] = useState<
    Array<{
      id: string;
      title: string;
      date: Date;
      status: InterviewStatus;
      score?: number;
    }>
  >([]);

  useEffect(() => {
    // If not authenticated, redirect to sign-in
    if (!loading && !user) {
      router.push('/sign-in');
    }

    // Check for resume upload status (would be from API in real implementation)
    const checkResumeStatus = async () => {
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 500));
      setResumeUploaded(true);
    };

    checkResumeStatus();

    // Load mock interview sessions (would be from API in real implementation)
    const loadInterviewSessions = async () => {
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 800));
      
      // Add a previously completed interview for demo
      setInterviewSessions([
        {
          id: '1',
          title: 'Frontend Developer Interview',
          date: new Date(Date.now() - 86400000 * 3), // 3 days ago
          status: 'completed',
          score: 4.2
        }
      ]);
    };

    loadInterviewSessions();
  }, [user, loading, router]);

  // Handle job description submission
  const handleJobDescriptionSubmit = async () => {
    if (!jobDescription.trim()) return;
    
    setIsProcessing(true);
    
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    setJobDescriptionEntered(true);
    setIsProcessing(false);
    setCurrentStep('strategy');
  };

  // Start a new interview session
  const startInterview = async () => {
    setIsProcessing(true);
    
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    setCurrentStep('interview');
    setIsProcessing(false);
    
    // Add new in-progress interview
    setInterviewSessions(prev => [
      {
        id: Math.random().toString(36).substring(2, 11),
        title: 'Frontend Developer Interview',
        date: new Date(),
        status: 'in_progress'
      },
      ...prev
    ]);
  };

  // Complete the interview and show evaluation
  const completeInterview = async () => {
    setIsProcessing(true);
    
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    setCurrentStep('evaluation');
    setIsProcessing(false);
    
    // Update the in-progress interview to completed
    setInterviewSessions(prev => [
      {
        ...prev[0],
        status: 'completed',
        score: 3.8
      },
      ...prev.slice(1)
    ]);
  };

  if (loading) {
    return (
      <div className="flex min-h-screen flex-col">
        <NavBar activePath="/interviews" />
        
        <main className="flex-1 flex items-center justify-center py-12">
          <div className="flex flex-col items-center gap-4">
            <Loader2 className="h-12 w-12 animate-spin text-primary" />
            <p className="text-lg font-medium">Loading your interview data...</p>
          </div>
        </main>

        <Footer />
      </div>
    );
  }

  // Content based on interview workflow step
  const renderContent = () => {
    switch (currentStep) {
      case 'setup':
        return (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card className="md:col-span-2">
              <CardHeader>
                <CardTitle>Set Up Your Interview</CardTitle>
                <CardDescription>
                  Enter a job description to customize your interview
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {!resumeUploaded ? (
                  <div className="p-4 border-2 border-dashed rounded-lg flex flex-col items-center gap-4">
                    <div className="flex items-center justify-center h-16 w-16 rounded-full bg-amber-100 dark:bg-amber-900/30">
                      <FileText className="h-8 w-8 text-amber-600 dark:text-amber-400" />
                    </div>
                    <div className="text-center space-y-2">
                      <h3 className="text-lg font-medium">Resume Required</h3>
                      <p className="text-muted-foreground max-w-sm">
                        Please upload your resume before setting up an interview
                      </p>
                    </div>
                    <Button onClick={() => router.push('/resume')} variant="outline" className="mt-2 gap-2">
                      <FileText className="h-4 w-4" />
                      Upload Resume
                    </Button>
                  </div>
                ) : !jobDescriptionEntered ? (
                  <div className="space-y-4">
                    <div className="p-4 border rounded-lg bg-muted/30 flex items-start gap-3">
                      <div className="mt-1">
                        <CheckCircle className="h-5 w-5 text-green-500" />
                      </div>
                      <div className="space-y-1">
                        <p className="text-sm font-medium">Resume processed</p>
                        <p className="text-xs text-muted-foreground">
                          8 skills identified and 3 years of experience detected
                        </p>
                      </div>
                    </div>
                    
                    <div className="space-y-3">
                      <Label htmlFor="job-description">Job Description</Label>
                      <textarea
                        id="job-description"
                        className="flex min-h-32 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                        placeholder="Paste the job description here..."
                        value={jobDescription}
                        onChange={(e) => setJobDescription(e.target.value)}
                        disabled={isProcessing}
                      />
                      <p className="text-xs text-muted-foreground">
                        This helps our AI understand the job requirements and tailor the interview questions
                      </p>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <div className="p-4 border rounded-lg bg-muted/30 flex items-start gap-3">
                      <div className="mt-1">
                        <CheckCircle className="h-5 w-5 text-green-500" />
                      </div>
                      <div className="space-y-1">
                        <p className="text-sm font-medium">Resume processed</p>
                        <p className="text-xs text-muted-foreground">
                          8 skills identified and 3 years of experience detected
                        </p>
                      </div>
                    </div>
                    
                    <div className="p-4 border rounded-lg bg-muted/30 flex items-start gap-3">
                      <div className="mt-1">
                        <CheckCircle className="h-5 w-5 text-green-500" />
                      </div>
                      <div className="space-y-1">
                        <p className="text-sm font-medium">Job description processed</p>
                        <p className="text-xs text-muted-foreground">
                          Frontend Developer role with React, TypeScript, and UI/UX requirements
                        </p>
                      </div>
                    </div>
                  </div>
                )}
              </CardContent>
              <CardFooter>
                {!resumeUploaded ? (
                  <Button onClick={() => router.push('/resume')} className="gap-2">
                    <FileText className="h-4 w-4" />
                    Upload Resume First
                  </Button>
                ) : !jobDescriptionEntered ? (
                  <Button 
                    onClick={handleJobDescriptionSubmit} 
                    disabled={!jobDescription.trim() || isProcessing}
                    className="gap-2"
                  >
                    {isProcessing ? (
                      <>
                        <Loader2 className="h-4 w-4 animate-spin" />
                        Processing...
                      </>
                    ) : (
                      <>
                        <ArrowRight className="h-4 w-4" />
                        Continue
                      </>
                    )}
                  </Button>
                ) : (
                  <Button onClick={startInterview} disabled={isProcessing} className="gap-2">
                    {isProcessing ? (
                      <>
                        <Loader2 className="h-4 w-4 animate-spin" />
                        Setting Up...
                      </>
                    ) : (
                      <>
                        <PlayCircle className="h-4 w-4" />
                        Start Interview
                      </>
                    )}
                  </Button>
                )}
              </CardFooter>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg">
                  <div className="flex items-center gap-2">
                    <Bot className="h-5 w-5 text-purple-500" />
                    Strategist Agent
                  </div>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-sm text-muted-foreground">
                  Our Strategist agent maps your skills to job requirements and plans your interview.
                </p>
                
                <ul className="space-y-2 text-sm">
                  <li className="flex items-start gap-2">
                    <div className="rounded-full bg-primary/10 p-1 mt-0.5">
                      <Bot className="h-3 w-3 text-primary" />
                    </div>
                    <span>Analyzes job requirements</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <div className="rounded-full bg-primary/10 p-1 mt-0.5">
                      <Bot className="h-3 w-3 text-primary" />
                    </div>
                    <span>Identifies skill matches and gaps</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <div className="rounded-full bg-primary/10 p-1 mt-0.5">
                      <Bot className="h-3 w-3 text-primary" />
                    </div>
                    <span>Creates tailored question plan</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <div className="rounded-full bg-primary/10 p-1 mt-0.5">
                      <Bot className="h-3 w-3 text-primary" />
                    </div>
                    <span>Adapts to your experience level</span>
                  </li>
                </ul>

                <div className="pt-4">
                  <p className="text-sm font-medium">How it helps</p>
                  <p className="text-sm text-muted-foreground mt-1">
                    The Strategist ensures your interview focuses on relevant skills and experience, preparing you for questions that matter for the specific role.
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        );
      
      case 'strategy':
        return (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card className="md:col-span-2">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle>Interview Strategy</CardTitle>
                  <div className="px-3 py-1 bg-purple-100 dark:bg-purple-900/30 text-purple-800 dark:text-purple-300 text-xs rounded-full">
                    Strategist
                  </div>
                </div>
                <CardDescription>
                  Your personalized interview plan based on resume and job description
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-3">
                  <h3 className="text-lg font-medium">Skills Match Analysis</h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <Card className="border-green-200 dark:border-green-900">
                      <CardHeader className="py-3 px-4">
                        <CardTitle className="text-sm font-medium text-green-600 dark:text-green-400">Strong Matches</CardTitle>
                      </CardHeader>
                      <CardContent className="py-2 px-4">
                        <ul className="space-y-1 text-sm">
                          <li className="flex items-center gap-2">
                            <CheckCircle className="h-3 w-3 text-green-500" />
                            <span>React development (3 years)</span>
                          </li>
                          <li className="flex items-center gap-2">
                            <CheckCircle className="h-3 w-3 text-green-500" />
                            <span>TypeScript proficiency</span>
                          </li>
                          <li className="flex items-center gap-2">
                            <CheckCircle className="h-3 w-3 text-green-500" />
                            <span>UI/UX implementation</span>
                          </li>
                        </ul>
                      </CardContent>
                    </Card>
                    <Card className="border-amber-200 dark:border-amber-900">
                      <CardHeader className="py-3 px-4">
                        <CardTitle className="text-sm font-medium text-amber-600 dark:text-amber-400">Areas to Highlight</CardTitle>
                      </CardHeader>
                      <CardContent className="py-2 px-4">
                        <ul className="space-y-1 text-sm">
                          <li className="flex items-center gap-2">
                            <Clock className="h-3 w-3 text-amber-500" />
                            <span>Next.js experience (newer)</span>
                          </li>
                          <li className="flex items-center gap-2">
                            <Clock className="h-3 w-3 text-amber-500" />
                            <span>Performance optimization</span>
                          </li>
                          <li className="flex items-center gap-2">
                            <Clock className="h-3 w-3 text-amber-500" />
                            <span>Team collaboration</span>
                          </li>
                        </ul>
                      </CardContent>
                    </Card>
                  </div>
                </div>
                
                <div className="space-y-3">
                  <h3 className="text-lg font-medium">Interview Focus Areas</h3>
                  <div className="space-y-2">
                    <div className="p-3 border rounded-lg">
                      <p className="text-sm font-medium">Technical Competency (40%)</p>
                      <p className="text-xs text-muted-foreground mt-1">
                        React component architecture, TypeScript typing, state management
                      </p>
                    </div>
                    <div className="p-3 border rounded-lg">
                      <p className="text-sm font-medium">Problem Solving (30%)</p>
                      <p className="text-xs text-muted-foreground mt-1">
                        UI performance optimization, debugging, responsive design approaches
                      </p>
                    </div>
                    <div className="p-3 border rounded-lg">
                      <p className="text-sm font-medium">Project Experience (20%)</p>
                      <p className="text-xs text-muted-foreground mt-1">
                        Past UI implementations, team collaboration, delivery timelines
                      </p>
                    </div>
                    <div className="p-3 border rounded-lg">
                      <p className="text-sm font-medium">Culture Fit (10%)</p>
                      <p className="text-xs text-muted-foreground mt-1">
                        Communication style, team dynamics, approach to feedback
                      </p>
                    </div>
                  </div>
                </div>
              </CardContent>
              <CardFooter>
                <Button onClick={startInterview} disabled={isProcessing} className="gap-2">
                  {isProcessing ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Preparing...
                    </>
                  ) : (
                    <>
                      <PlayCircle className="h-4 w-4" />
                      Start Interview Session
                    </>
                  )}
                </Button>
              </CardFooter>
            </Card>

            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">
                    <div className="flex items-center gap-2">
                      <MessageSquare className="h-5 w-5 text-amber-500" />
                      Interviewer Agent
                    </div>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <p className="text-sm text-muted-foreground">
                    Ready to conduct your mock interview with questions based on the strategy.
                  </p>
                  
                  <div className="p-3 bg-muted/30 rounded-lg">
                    <p className="text-sm">Estimated duration: <span className="font-medium">20-25 minutes</span></p>
                    <p className="text-xs text-muted-foreground mt-1">
                      10-12 questions covering technical, problem-solving, and experience aspects
                    </p>
                  </div>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">
                    <div className="flex items-center gap-2">
                      <BarChart4 className="h-5 w-5 text-green-500" />
                      Evaluator Agent
                    </div>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground">
                    Will provide scoring and constructive feedback on your interview responses after completion.
                  </p>
                </CardContent>
              </Card>
            </div>
          </div>
        );
      
      case 'interview':
        return (
          <div className="grid grid-cols-1 gap-6">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle>Mock Interview</CardTitle>
                  <div className="px-3 py-1 bg-amber-100 dark:bg-amber-900/30 text-amber-800 dark:text-amber-300 text-xs rounded-full">
                    Interviewer
                  </div>
                </div>
                <CardDescription>
                  Answer questions from the interviewer as if in a real interview
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="p-4 bg-muted/30 rounded-lg text-center">
                  <p className="text-sm font-medium">Interview in progress</p>
                  <p className="text-muted-foreground text-sm mt-1">
                    This is where the actual interview Q&A would take place
                  </p>
                </div>
                
                <div className="space-y-4">
                  <div className="flex items-start gap-3">
                    <div className="flex-shrink-0 mt-1">
                      <div className="flex items-center justify-center h-8 w-8 rounded-full bg-amber-100 dark:bg-amber-900/30">
                        <MessageSquare className="h-4 w-4 text-amber-600 dark:text-amber-400" />
                      </div>
                    </div>
                    <div className="flex-1 p-3 bg-muted/30 rounded-lg">
                      <p className="text-sm font-medium">Tell me about your experience with React component architecture.</p>
                    </div>
                  </div>
                  
                  <div className="flex items-start gap-3 flex-row-reverse">
                    <div className="flex-shrink-0 mt-1">
                      <div className="flex items-center justify-center h-8 w-8 rounded-full bg-primary/20">
                        <User className="h-4 w-4 text-primary" />
                      </div>
                    </div>
                    <div className="flex-1 p-3 bg-primary/5 rounded-lg">
                      <p className="text-sm">I have 3 years of experience building React applications with a focus on reusable component architecture. I typically structure my components following atomic design principles, creating atoms, molecules, and organisms to build complex interfaces while maintaining consistency and reusability.</p>
                    </div>
                  </div>
                  
                  <div className="flex items-start gap-3">
                    <div className="flex-shrink-0 mt-1">
                      <div className="flex items-center justify-center h-8 w-8 rounded-full bg-amber-100 dark:bg-amber-900/30">
                        <MessageSquare className="h-4 w-4 text-amber-600 dark:text-amber-400" />
                      </div>
                    </div>
                    <div className="flex-1 p-3 bg-muted/30 rounded-lg">
                      <p className="text-sm font-medium">How do you handle state management in large applications?</p>
                    </div>
                  </div>
                  
                  <div className="flex items-start gap-3 flex-row-reverse">
                    <div className="flex-shrink-0 mt-1">
                      <div className="flex items-center justify-center h-8 w-8 rounded-full bg-primary/20">
                        <User className="h-4 w-4 text-primary" />
                      </div>
                    </div>
                    <div className="flex-1 p-3 bg-primary/5 rounded-lg">
                      <p className="text-sm">For state management in larger applications, I take a layered approach. For local component state, I use React&apos;s useState and useReducer hooks. For shared state across related components, I use Context API. For complex global state, I&apos;ve worked with Redux and more recently with libraries like Zustand and Jotai for a more lightweight approach.</p>
                    </div>
                  </div>
                </div>
              </CardContent>
              <CardFooter>
                <Button onClick={completeInterview} disabled={isProcessing} className="gap-2">
                  {isProcessing ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Finalizing...
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
          </div>
        );
      
      case 'evaluation':
        return (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card className="md:col-span-2">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle>Interview Evaluation</CardTitle>
                  <div className="px-3 py-1 bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300 text-xs rounded-full">
                    Evaluator
                  </div>
                </div>
                <CardDescription>
                  Performance assessment and improvement suggestions
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="flex items-center justify-between p-4 bg-muted/30 rounded-lg">
                  <div className="space-y-1">
                    <h3 className="font-medium">Frontend Developer Interview</h3>
                    <p className="text-xs text-muted-foreground">
                      Completed {new Date().toLocaleDateString()}
                    </p>
                  </div>
                  <div className="flex flex-col items-center">
                    <div className="text-2xl font-bold text-primary">3.8</div>
                    <div className="text-xs text-muted-foreground">out of 5</div>
                  </div>
                </div>
                
                <div className="space-y-4">
                  <h3 className="text-lg font-medium">Performance Breakdown</h3>
                  
                  <div className="space-y-3">
                    <div className="space-y-1">
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium">Technical Knowledge</span>
                        <span className="text-sm">4.2/5</span>
                      </div>
                      <div className="h-2 rounded-full bg-muted">
                        <div className="h-full rounded-full bg-green-500" style={{ width: '84%' }}></div>
                      </div>
                      <p className="text-xs text-muted-foreground">Strong understanding of React and TypeScript fundamentals</p>
                    </div>
                    
                    <div className="space-y-1">
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium">Communication</span>
                        <span className="text-sm">3.5/5</span>
                      </div>
                      <div className="h-2 rounded-full bg-muted">
                        <div className="h-full rounded-full bg-amber-500" style={{ width: '70%' }}></div>
                      </div>
                      <p className="text-xs text-muted-foreground">Clear explanations but could be more concise</p>
                    </div>
                    
                    <div className="space-y-1">
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium">Problem Solving</span>
                        <span className="text-sm">3.8/5</span>
                      </div>
                      <div className="h-2 rounded-full bg-muted">
                        <div className="h-full rounded-full bg-amber-500" style={{ width: '76%' }}></div>
                      </div>
                      <p className="text-xs text-muted-foreground">Good approach but could explore multiple solutions</p>
                    </div>
                    
                    <div className="space-y-1">
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium">Experience Relevance</span>
                        <span className="text-sm">4.0/5</span>
                      </div>
                      <div className="h-2 rounded-full bg-muted">
                        <div className="h-full rounded-full bg-green-500" style={{ width: '80%' }}></div>
                      </div>
                      <p className="text-xs text-muted-foreground">Examples aligned well with job requirements</p>
                    </div>
                  </div>
                </div>
                
                <div className="space-y-3">
                  <h3 className="text-lg font-medium">Improvement Suggestions</h3>
                  
                  <div className="p-3 border rounded-lg">
                    <p className="text-sm font-medium">Be more specific about outcomes</p>
                    <p className="text-xs text-muted-foreground mt-1">
                      When discussing project experiences, quantify the impact of your contributions where possible. For example, mention performance improvements by percentage or user engagement metrics.
                    </p>
                  </div>
                  
                  <div className="p-3 border rounded-lg">
                    <p className="text-sm font-medium">Structure answers with STAR method</p>
                    <p className="text-xs text-muted-foreground mt-1">
                      For behavioral questions, use the Situation, Task, Action, Result framework to make your examples more compelling and complete.
                    </p>
                  </div>
                  
                  <div className="p-3 border rounded-lg">
                    <p className="text-sm font-medium">Highlight Next.js experience more</p>
                    <p className="text-xs text-muted-foreground mt-1">
                      Since the job requires Next.js, emphasize your experience with server components, routing, and data fetching patterns early in your answers.
                    </p>
                  </div>
                </div>
              </CardContent>
              <CardFooter className="flex flex-wrap gap-3">
                <Button 
                  onClick={() => router.push('/history')} 
                  className="gap-2"
                >
                  <BarChart4 className="h-4 w-4" />
                  View History
                </Button>
                <Button 
                  onClick={() => {
                    setCurrentStep('setup');
                    setJobDescriptionEntered(false);
                    setJobDescription('');
                  }} 
                  variant="outline"
                  className="gap-2"
                >
                  <PlayCircle className="h-4 w-4" />
                  Start New Interview
                </Button>
              </CardFooter>
            </Card>

            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Next Steps</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="p-3 bg-muted/30 rounded-lg">
                    <p className="text-sm font-medium">Practice Makes Perfect</p>
                    <p className="text-xs text-muted-foreground mt-1">
                      Create a new interview with a different job description to practice for various roles
                    </p>
                  </div>
                  
                  <div className="p-3 bg-muted/30 rounded-lg">
                    <p className="text-sm font-medium">Focus on Weak Areas</p>
                    <p className="text-xs text-muted-foreground mt-1">
                      Review suggested improvements and practice those specific aspects
                    </p>
                  </div>
                  
                  <div className="p-3 bg-muted/30 rounded-lg">
                    <p className="text-sm font-medium">Track Progress</p>
                    <p className="text-xs text-muted-foreground mt-1">
                      Monitor your scores over time in your interview history
                    </p>
                  </div>
                </CardContent>
                <CardFooter>
                  <Button 
                    variant="outline" 
                    className="w-full gap-2" 
                    onClick={() => {
                      setCurrentStep('setup');
                      setJobDescriptionEntered(false);
                      setJobDescription('');
                    }}
                  >
                    <PlayCircle className="h-4 w-4" />
                    New Interview
                  </Button>
                </CardFooter>
              </Card>
            </div>
          </div>
        );
      
      default:
        return null;
    }
  };

  return (
    <div className="flex min-h-screen flex-col">
      <NavBar activePath="/interviews" />
      
      <main className="flex-1 container max-w-screen-xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex flex-col gap-8">
          {/* Page header */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="space-y-1">
              <h1 className="text-3xl font-bold tracking-tight">Interview Prep</h1>
              <p className="text-muted-foreground">
                Practice with realistic interview questions tailored to your skills
              </p>
            </div>
            
            {interviewSessions.length > 0 && (
              <Tabs defaultValue="current" className="w-full sm:w-auto">
                <TabsList>
                  <TabsTrigger value="current">Current</TabsTrigger>
                  <TabsTrigger value="past">Past Interviews</TabsTrigger>
                </TabsList>
              </Tabs>
            )}
          </div>

          {/* Main content - changes based on the interview step */}
          {renderContent()}
        </div>
      </main>

      <Footer />
    </div>
  );
}

// User icon component
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