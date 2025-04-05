'use server';

import { createClient } from '@/lib/supabase/server';
import { getUser } from '@/lib/supabase/server';

export async function getInterviewStrategy(sessionId: string) {
  try {
    // Validate sessionId
    if (!sessionId) {
      return {
        success: false,
        error: 'Session ID is required'
      };
    }

    // Get the current user for authorization
    const { data: { user } } = await getUser();
    
    if (!user) {
      return {
        success: false,
        error: 'User not authenticated'
      };
    }
    
    // Create Supabase client
    const supabase = await createClient();
    
    // Query interview session with profile_id check for security
    const { data: session, error } = await supabase
      .from('interview_sessions')
      .select('strategy, profile_id')
      .eq('id', sessionId)
      .single();
      
    if (error) {
      console.error('Error fetching interview strategy:', error);
      return {
        success: false,
        error: 'Interview session not found'
      };
    }
    
    // Ensure the user has access to this session
    if (session.profile_id !== user.id) {
      return {
        success: false,
        error: 'Access denied'
      };
    }
    
    // Return the strategy data
    return {
      success: true,
      strategy: session.strategy || {}
    };
    
  } catch (error) {
    console.error('Error in getInterviewStrategy:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to retrieve interview strategy'
    };
  }
}