'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

// Component imports
import { PageHeader } from '@/components/interviews/page-header';
import { LoadingState } from '@/components/interviews/loading-state';
import { SetupStep } from '@/components/interviews/steps/setup-step';
import { StrategyStep } from '@/components/interviews/steps/strategy-step';
import { InterviewStep } from '@/components/interviews/steps/interview-step';
import { EvaluationStep } from '@/components/interviews/steps/evaluation-step';

// UI components
import { NavBar } from '@/components/ui/nav-bar';
import { Footer } from '@/components/ui/footer';

// Hooks
import { useAuth } from '@/lib/hooks/useAuth';
import { useInterviewSessions } from '@/lib/hooks/useInterviewSessions';
import { useInterviewWorkflow } from '@/lib/hooks/useInterviewWorkflow';
import { useResumeCheck } from '@/lib/hooks/useResumeCheck';

export default function InterviewsPage() {
  const { user, loading } = useAuth();
  const router = useRouter();
  
  // Custom hooks
  const { resumeUploaded, resumeData, resumeError } = useResumeCheck();
  const { 
    interviewSessions, 
    updateSessionStatus,
    addNewSession
  } = useInterviewSessions();
  const {
    currentStep,
    setCurrentStep,
    isProcessing,
    jobDescriptionEntered,
    setJobDescriptionEntered,
    jobDescription,
    setJobDescription,
    handleJobDescriptionSubmit,
    startInterview,
    completeInterview
  } = useInterviewWorkflow();
  
  useEffect(() => {
    // If not authenticated, redirect to sign-in
    if (!loading && !user) {
      router.push('/sign-in');
    }
  }, [user, loading, router]);

  // Wrapper for job description submission
  const handleJobSubmit = async () => {
    const result = await handleJobDescriptionSubmit();
    if (result?.success) {
      // Add new planned interview to sessions
      addNewSession({
        id: result.sessionId || `session-${Date.now()}`,
        title: result.strategy && typeof result.strategy === 'object' && 'job_analysis' in result.strategy 
          ? (result.strategy.job_analysis as { title?: string })?.title || 'Interview Session'
          : 'Interview Session',
        status: 'planned',
        date: new Date()
      });
    }
  };

  // Wrapper for starting interview
  const startInterviewSession = async () => {
    const success = await startInterview(interviewSessions);
    if (success && interviewSessions.length > 0) {
      // Update the session status locally
      updateSessionStatus(interviewSessions[0].id, 'in_progress');
    }
  };

  // Wrapper for completing interview
  const completeInterviewSession = async () => {
    const success = await completeInterview();
    if (success && interviewSessions.length > 0) {
      // Update the in-progress interview to completed
      updateSessionStatus(interviewSessions[0].id, 'completed', { score: 3.8 });
    }
  };

  if (loading) {
    return <LoadingState />;
  }

  // Content based on interview workflow step
  const renderContent = () => {
    switch (currentStep) {
      case 'setup':
        return (
          <SetupStep
            resumeUploaded={resumeUploaded}
            resumeError={resumeError}
            resumeData={resumeData}
            jobDescriptionEntered={jobDescriptionEntered}
            jobDescription={jobDescription}
            isProcessing={isProcessing}
            handleJobDescriptionSubmit={handleJobSubmit}
            startInterview={startInterviewSession}
            setJobDescription={setJobDescription}
          />
        );
      
      case 'strategy':
        return (
          <StrategyStep
            startInterview={startInterviewSession}
            isProcessing={isProcessing}
          />
        );
      
      case 'interview':
        return (
          <InterviewStep
            interviewSessions={interviewSessions}
            completeInterview={completeInterviewSession}
            setCurrentStep={setCurrentStep}
            isProcessing={isProcessing}
          />
        );
      
      case 'evaluation':
        return (
          <EvaluationStep
            setCurrentStep={setCurrentStep}
            setJobDescriptionEntered={setJobDescriptionEntered}
            setJobDescription={setJobDescription}
          />
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
          <PageHeader interviewSessions={interviewSessions} />

          {/* Main content - changes based on the interview step */}
          {renderContent()}
        </div>
      </main>

      <Footer />
    </div>
  );
}