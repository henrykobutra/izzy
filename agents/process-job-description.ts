'use server';

import { analyzeJobAndResume } from '@/agents/strategist/agent';
import { createClient, createServiceClient } from '@/lib/supabase/server';
import { getUser } from '@/lib/supabase/server';
import { getActiveResume } from '@/lib/actions/get-active-resume';

export async function processJobDescription(jobDescriptionText: string) {
  try {
    // Get the current user
    const { data: { user } } = await getUser();
    
    if (!user) {
      throw new Error('User not authenticated');
    }
    
    // Create Supabase client
    const supabase = await createClient();
    
    // Get the active resume for this user
    const resumeResult = await getActiveResume();
    if (!resumeResult.success) {
      throw new Error(resumeResult.error || 'No active resume found');
    }
    
    // Parse job description with strategist agent
    const result = await analyzeJobAndResume(jobDescriptionText, resumeResult.data?.id);
    
    if (!result.success || !result.data) {
      throw new Error(result.error || 'Failed to analyze job and resume');
    }
    
    // Save job posting and interview session
    const { data: jobPosting, error: jobError } = await supabase
      .from('job_postings')
      .insert({
        profile_id: user.id,
        title: result.data.strategy.job_analysis.title,
        company: result.data.strategy.job_analysis.company || 'Not specified',
        description: jobDescriptionText,
        parsed_requirements: result.data.strategy.job_analysis
      })
      .select()
      .single();
    
    if (jobError) throw jobError;
    
    // Create interview session
    const { data: session, error: sessionError } = await supabase
      .from('interview_sessions')
      .insert({
        profile_id: user.id,
        job_posting_id: jobPosting.id,
        resume_id: resumeResult.data?.id,
        strategy: result.data.strategy,
        status: 'planned',
        created_at: new Date().toISOString()
      })
      .select()
      .single();
    
    if (sessionError) throw sessionError;
    
    // Create interview questions from the strategy
    const questions = result.data.strategy.recommended_questions.map((q, index) => ({
      session_id: session.id,
      question_text: q.question_text,
      question_type: q.question_type,
      related_skill: q.related_skill,
      difficulty: q.difficulty,
      focus_area: q.focus_area,
      question_order: index + 1,
      source: 'strategist'
    }));
    
    // Use service role client for interview questions (to bypass RLS)
    try {
      const serviceClient = await createServiceClient();
      
      // Insert all questions
      const { error: questionsError } = await serviceClient
        .from('interview_questions')
        .insert(questions);
      
      if (questionsError) throw questionsError;
    } catch (serviceError) {
      console.error('Error using service client:', serviceError);
      // Continue even if questions insert fails - log it but don't fail the whole operation
    }
    
    return { 
      success: true, 
      data: {
        sessionId: session.id,
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