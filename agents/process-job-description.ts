'use server';

import { analyzeJobAndResume } from '@/agents/strategist/agent';
import { getUser } from '@/lib/supabase/server';
import { getActiveResume } from '@/lib/actions/get-active-resume';

export async function processJobDescription(jobDescriptionText: string) {
  try {
    // Get the current user
    const { data: { user } } = await getUser();
    
    if (!user) {
      throw new Error('User not authenticated');
    }
    
    // We don't need the Supabase client anymore since database operations are handled by strategist agent
    
    // Get the active resume for this user
    const resumeResult = await getActiveResume();
    if (!resumeResult.success) {
      throw new Error(resumeResult.error || 'No active resume found');
    }
    
    // Parse job description with strategist agent - this will create the job posting and interview session
    const result = await analyzeJobAndResume(jobDescriptionText, resumeResult.data?.id);
    
    if (!result.success || !result.data) {
      throw new Error(result.error || 'Failed to analyze job and resume');
    }
    
    return { 
      success: true, 
      data: {
        sessionId: result.data.sessionId,
        strategy: result.data.strategy
      }
    };
    
  } catch (error) {
    console.error('Error processing job description:', error);
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Failed to process job description' 
    };
  }
}