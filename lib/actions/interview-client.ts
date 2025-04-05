'use client';

import { createClient } from '@/lib/supabase';

// Client-side function for deleting an interview via its job posting
export async function deleteInterviewClient(jobPostingId: string): Promise<{ 
  success: boolean; 
  error?: string 
}> {
  const supabase = createClient();

  try {
    // Delete the job posting, which will cascade to interview_sessions and related data
    const { error } = await supabase
      .from('job_postings')
      .delete()
      .eq('id', jobPostingId);

    if (error) {
      console.error('Error deleting interview:', error);
      return { success: false, error: 'Failed to delete interview' };
    }

    return { success: true };
  } catch (error) {
    console.error('Unexpected error in deleteInterview:', error);
    return { success: false, error: 'An unexpected error occurred' };
  }
}