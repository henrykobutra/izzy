'use server';

import { startInterview, continueInterview } from '@/agents/interviewer/agent';
import { createClient } from '@/lib/supabase/server';
import { getUser } from '@/lib/supabase/server';

export async function beginInterviewSession(sessionId: string) {
  try {
    // Get the current user
    const { data: { user } } = await getUser();
    
    if (!user) {
      throw new Error('User not authenticated');
    }
    
    // Create Supabase client
    const supabase = await createClient();
    
    // Verify the session belongs to the user
    const { data: session, error: sessionError } = await supabase
      .from('interview_sessions')
      .select('*')
      .eq('id', sessionId)
      .eq('profile_id', user.id)
      .single();
      
    if (sessionError || !session) {
      throw new Error('Interview session not found or access denied');
    }
    
    // Start the interview with the interviewer agent
    const result = await startInterview(sessionId);
    
    if (!result.success) {
      throw new Error(result.error || 'Failed to start interview session');
    }
    
    return { 
      success: true, 
      data: result.data
    };
    
  } catch (error) {
    console.error('Error beginning interview session:', error);
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Failed to begin interview session' 
    };
  }
}

export async function submitAnswer(
  sessionId: string, 
  threadId: string, 
  answer: string,
  currentQuestionId: string | null = null
) {
  try {
    // Get the current user
    const { data: { user } } = await getUser();
    
    if (!user) {
      throw new Error('User not authenticated');
    }
    
    // Create Supabase client
    const supabase = await createClient();
    
    // Verify the session belongs to the user
    const { data: session, error: sessionError } = await supabase
      .from('interview_sessions')
      .select('*')
      .eq('id', sessionId)
      .eq('profile_id', user.id)
      .single();
      
    if (sessionError || !session) {
      throw new Error('Interview session not found or access denied');
    }
    
    // Continue the interview with the interviewer agent
    const result = await continueInterview(sessionId, threadId, answer, currentQuestionId);
    
    if (!result.success || !result.data) {
      throw new Error(result.error || 'Failed to process answer');
    }
    
    // If the interview is now complete, update the session status
    if (result.data && result.data.is_complete) {
      await supabase
        .from('interview_sessions')
        .update({ status: 'completed' })
        .eq('id', sessionId);
    }
    
    return { 
      success: true, 
      data: result.data
    };
    
  } catch (error) {
    console.error('Error submitting answer:', error);
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Failed to submit answer' 
    };
  }
}

export async function getInterviewHistory(sessionId: string) {
  try {
    // Get the current user
    const { data: { user } } = await getUser();
    
    if (!user) {
      throw new Error('User not authenticated');
    }
    
    // Create Supabase client
    const supabase = await createClient();
    
    // Verify the session belongs to the user
    const { data: session, error: sessionError } = await supabase
      .from('interview_sessions')
      .select('*')
      .eq('id', sessionId)
      .eq('profile_id', user.id)
      .single();
      
    if (sessionError || !session) {
      throw new Error('Interview session not found or access denied');
    }
    
    // Get all questions and answers for this session
    const { data: questions, error: questionsError } = await supabase
      .from('interview_questions')
      .select(`
        *,
        answers:user_answers(*)
      `)
      .eq('session_id', sessionId)
      .order('question_order', { ascending: true });
      
    if (questionsError) {
      throw new Error('Failed to fetch interview questions and answers');
    }
    
    return { 
      success: true, 
      data: {
        session,
        questions
      }
    };
    
  } catch (error) {
    console.error('Error fetching interview history:', error);
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Failed to fetch interview history' 
    };
  }
}