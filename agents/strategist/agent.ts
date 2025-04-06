'use server';

import OpenAI from 'openai';
import { createClient } from '@/lib/supabase/server';
import { getUser } from '@/lib/supabase/server';

// Initialize OpenAI client server-side with API key from environment
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

interface StrategistResponse {
  job_analysis: {
    title: string;
    company: string | null;
    required_skills: Array<{
      skill: string;
      importance: 'low' | 'medium' | 'high';
      context: string;
    }>;
    preferred_skills: Array<{
      skill: string;
      importance: 'low' | 'medium' | 'high';
      context: string;
    }>;
    experience_requirements: {
      min_years: number;
      preferred_years: number;
      level: 'entry-level' | 'mid-level' | 'senior' | 'lead';
    };
  };
  skills_mapping: {
    strong_matches: Array<{
      job_skill: string;
      resume_skill: string;
      experience_years?: number;
      level?: string;
      confidence: number;
    }>;
    partial_matches: Array<{
      job_skill: string;
      resume_skill: string;
      transferable: boolean;
      gap_description: string;
      confidence: number;
    }>;
    gaps: Array<{
      job_skill: string;
      missing_context: string;
      importance: 'low' | 'medium' | 'high';
      recommendation: string;
    }>;
  };
  interview_strategy: {
    focus_areas: Array<{
      name: string;
      weight: number;
      description: string;
    }>;
    recommended_preparation: string[];
    strengths_to_highlight: Array<{
      skill: string;
      context: string;
    }>;
    weaknesses_to_address: Array<{
      skill: string;
      suggestion: string;
    }>;
  };
  recommended_questions: Array<{
    question_text: string;
    question_type: 'technical' | 'behavioral' | 'situational' | 'general';
    related_skill: string;
    difficulty: 'easy' | 'medium' | 'hard';
    focus_area: string;
  }>;
}

export async function analyzeJobAndResume(jobDescription: string, resumeId: string) {
  try {
    // Start timing for performance tracking
    const startTime = Date.now();
    
    // Get the current user
    const { data: { user } } = await getUser();
    
    if (!user) {
      throw new Error('User not authenticated');
    }
    
    // Create Supabase client
    const supabase = await createClient();
    
    // Fetch resume data
    const { data: resumeData, error: resumeError } = await supabase
      .from('resumes')
      .select('*')
      .eq('id', resumeId)
      .eq('profile_id', user.id)
      .single();
      
    if (resumeError || !resumeData) {
      throw new Error('Resume not found or access denied');
    }
    
    // Process with OpenAI Assistant
    const assistantId = process.env.OPENAI_STRATEGY_ASSISTANT_ID;
    
    if (!assistantId) {
      throw new Error('Strategy assistant ID not configured');
    }
    
    // Ensure resume data is available
    if (!resumeData.parsed_skills || !resumeData.experience || !resumeData.education) {
      throw new Error('Resume data is incomplete. Please ensure your resume is properly processed.');
    }
    
    // Create thread and send message to OpenAI Assistant
    const thread = await openai.beta.threads.create();
    
    // Prepare the resume data and job description for the assistant
    // Format properly for the expected shape by the assistant
    const resumeJson = JSON.stringify({
      parsed_skills: resumeData.parsed_skills || {},
      experience: resumeData.experience || [],
      education: resumeData.education || [],
      projects: resumeData.projects || []
    });
    
    await openai.beta.threads.messages.create(
      thread.id,
      {
        role: "user",
        content: `I need to prepare for a job interview. Here is my resume data in JSON format:\n\n${resumeJson}\n\nAnd here is the job description:\n\n${jobDescription}\n\nPlease analyze these and create an interview strategy.`
      }
    );
    
    // Run the assistant
    const run = await openai.beta.threads.runs.create(
      thread.id,
      {
        assistant_id: assistantId
      }
    );
    
    // Poll for completion
    let runStatus = await openai.beta.threads.runs.retrieve(
      thread.id,
      run.id
    );
    
    // Simple polling mechanism - in production, use a more sophisticated approach
    while (runStatus.status !== "completed" && runStatus.status !== "failed") {
      // Wait 1 second between polls
      await new Promise(resolve => setTimeout(resolve, 1000));
      runStatus = await openai.beta.threads.runs.retrieve(
        thread.id,
        run.id
      );
    }
    
    if (runStatus.status === "failed") {
      throw new Error('Assistant processing failed');
    }
    
    // Get assistant response
    const messages = await openai.beta.threads.messages.list(thread.id);
    
    // Find the assistant's response
    const assistantMessages = messages.data.filter(
      (message) => message.role === "assistant"
    );
    
    if (assistantMessages.length === 0) {
      throw new Error('No response from assistant');
    }
    
    // Parse JSON from the message
    const lastMessage = assistantMessages[0];
    const messageContent = lastMessage.content[0];
    
    if (messageContent.type !== "text") {
      throw new Error('Expected text response from assistant');
    }
    
    // Extract JSON from the text response
    const textContent = messageContent.text.value;
    let jsonMatch = textContent.match(/```json\n([\s\S]*?)\n```/);
    
    if (!jsonMatch) {
      // Try to find any JSON-like structure
      jsonMatch = textContent.match(/\{[\s\S]*\}/);
    }
    
    if (!jsonMatch) {
      throw new Error('Could not parse JSON response from assistant');
    }
    
    // Parse the JSON response
    let strategistResponse: StrategistResponse;
    try {
      strategistResponse = JSON.parse(jsonMatch[1] || jsonMatch[0]);
    } catch (error) {
      console.error("Error parsing JSON:", error);
      throw new Error('Failed to parse JSON response');
    }
    
    // Save job posting and create interview session
    const { data: jobPosting, error: jobError } = await supabase
      .from('job_postings')
      .insert({
        profile_id: user.id,
        title: strategistResponse.job_analysis.title,
        company: strategistResponse.job_analysis.company,
        description: jobDescription,
        parsed_requirements: strategistResponse.job_analysis,
        is_active: true
      })
      .select()
      .single();
      
    if (jobError || !jobPosting) {
      throw new Error(`Failed to save job posting: ${jobError?.message || 'Unknown error'}`);
    }
    
    // Create interview session
    const { data: interviewSession, error: sessionError } = await supabase
      .from('interview_sessions')
      .insert({
        profile_id: user.id,
        resume_id: resumeId,
        job_posting_id: jobPosting.id,
        strategy: strategistResponse,
        status: 'planned'
      })
      .select()
      .single();
      
    if (sessionError || !interviewSession) {
      throw new Error(`Failed to create interview session: ${sessionError?.message || 'Unknown error'}`);
    }
    
    // Insert recommended questions
    const questionInserts = strategistResponse.recommended_questions.map((q, index) => ({
      session_id: interviewSession.id,
      question_text: q.question_text,
      question_type: q.question_type,
      related_skill: q.related_skill,
      difficulty: q.difficulty,
      focus_area: q.focus_area,
      question_order: index + 1,
      source: 'strategist'
    }));
    
    const { error: questionsError } = await supabase
      .from('interview_questions')
      .insert(questionInserts);
      
    if (questionsError) {
      console.error('Error saving interview questions:', questionsError);
      // Not throwing here, as we still want to return the session
    }
    
    // Calculate processing time
    const processingTime = Date.now() - startTime;
    
    // Log the agent activity
    await supabase
      .from('agent_logs')
      .insert({
        agent_type: 'strategist',
        session_id: interviewSession.id,
        input: { 
          job_description_length: jobDescription.length,
          resume_id: resumeId
        },
        output: { 
          success: true, 
          session_id: interviewSession.id,
          question_count: strategistResponse.recommended_questions.length
        },
        processing_time: processingTime
      });
    
    return { 
      success: true, 
      data: {
        sessionId: interviewSession.id,
        strategy: strategistResponse
      }
    };
    
  } catch (error) {
    console.error('Error in strategist agent:', error);
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Failed to analyze job and resume' 
    };
  }
}