import { useState } from 'react';
import { useRouter } from 'next/navigation';

export type InterviewStep = 'setup' | 'strategy' | 'interview' | 'evaluation';

export function useInterviewWorkflow() {
  useRouter(); // Keep for future implementations that might need router
  const [currentStep, setCurrentStep] = useState<InterviewStep>('setup');
  const [isProcessing, setIsProcessing] = useState(false);
  const [jobDescriptionEntered, setJobDescriptionEntered] = useState(false);
  const [jobDescription, setJobDescription] = useState('');

  // Handle job description submission
  const handleJobDescriptionSubmit = async () => {
    if (!jobDescription.trim()) return;
    
    setIsProcessing(true);
    
    try {
      // Call the server action to process the job description using the strategist agent
      const { processJobDescription } = await import('@/agents/process-job-description');
      const result = await processJobDescription(jobDescription);
      
      if (result.success) {
        console.log('Job and resume analysis complete:', result.data);
        setJobDescriptionEntered(true);
        setCurrentStep('strategy');
        
        return {
          success: true,
          sessionId: result.data?.sessionId || '',
          strategy: result.data?.strategy || {}
        };
      } else {
        console.error('Failed to process job description:', result.error);
        alert(`Error: ${result.error}`);
        return { success: false, error: result.error };
      }
    } catch (error) {
      console.error('Error submitting job description:', error);
      alert('Failed to process job description. Please try again.');
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Unknown error' 
      };
    } finally {
      setIsProcessing(false);
    }
  };

  // Start a new interview session
  const startInterview = async (interviewSessions: Array<{ id: string }>) => {
    // If we don't have an active session ID, we can't start the interview
    if (!interviewSessions || interviewSessions.length === 0) {
      console.error('No active interview session found');
      return false;
    }
    
    setIsProcessing(true);
    
    try {
      // Move to the interview step
      setCurrentStep('interview');
      return true;
    } catch (error) {
      console.error('Error starting interview:', error);
      alert('Failed to start the interview. Please try again.');
      return false;
    } finally {
      setIsProcessing(false);
    }
  };

  // Complete the interview and show evaluation
  const completeInterview = async () => {
    setIsProcessing(true);
    
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    setCurrentStep('evaluation');
    setIsProcessing(false);
    
    return true;
  };

  return {
    currentStep,
    setCurrentStep,
    isProcessing,
    setIsProcessing,
    jobDescriptionEntered,
    setJobDescriptionEntered,
    jobDescription,
    setJobDescription,
    handleJobDescriptionSubmit,
    startInterview,
    completeInterview
  };
}