'use server';

import { createClient } from '@/lib/supabase/server';

// Type for interview session with related data
export type InterviewSessionWithRelations = {
  id: string;
  status: string;
  strategy: Record<string, unknown>;
  job_posting: {
    id: string;
    title: string;
    company: string | null;
  };
  questions: {
    id: string;
    question_text: string;
    question_type: string;
    question_order: number;
    related_skill: string | null;
    difficulty: string | null;
    focus_area: string | null;
  }[];
};

// Type for retrieving interview questions with session data
export type InterviewQuestionsResult = {
  title: string;
  questions: {
    id: string;
    question_text: string;
    question_type: string;
    question_order: number;
    related_skill: string;
    difficulty: string;
    focus_area: string;
  }[];
  answers?: {
    question_id: string;
    answer_text: string;
  }[];
};

// Type for submitting interview answers
export type SubmitAnswerParams = {
  sessionId: string;
  questionId: string;
  answer: string;
};

// Interface for interview result
export interface InterviewResult {
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

// Get interview session with related data
export async function getInterviewSession(sessionId: string): Promise<{ 
  data: InterviewSessionWithRelations | null; 
  error: string | null 
}> {
  try {
    const supabase = await createClient();
    
    // Get the session with job posting data
    const { data: session, error: sessionError } = await supabase
      .from('interview_sessions')
      .select(`
        id, 
        status, 
        strategy,
        job_posting:job_postings (
          id,
          title, 
          company
        )
      `)
      .eq('id', sessionId)
      .single();

    if (sessionError) {
      console.error('Error fetching interview session:', sessionError);
      return { data: null, error: 'Failed to fetch interview session' };
    }

    if (!session) {
      return { data: null, error: 'Interview session not found' };
    }

    // Get questions for this session
    const { data: questions, error: questionsError } = await supabase
      .from('interview_questions')
      .select('id, question_text, question_type, question_order, related_skill, difficulty, focus_area')
      .eq('session_id', sessionId)
      .order('question_order', { ascending: true });

    if (questionsError) {
      console.error('Error fetching interview questions:', questionsError);
      return { data: null, error: 'Failed to fetch interview questions' };
    }

    // Need to transform the Supabase result to match our expected type
    const jobPosting = Array.isArray(session.job_posting) && session.job_posting.length > 0 
      ? session.job_posting[0] 
      : { id: '', title: '', company: null };

    const sessionWithRelations: InterviewSessionWithRelations = {
      id: session.id,
      status: session.status,
      strategy: session.strategy || {},
      job_posting: {
        id: jobPosting.id || '',
        title: jobPosting.title || '',
        company: jobPosting.company
      },
      questions: questions || []
    };

    return { data: sessionWithRelations, error: null };
  } catch (error) {
    console.error('Unexpected error in getInterviewSession:', error);
    return { data: null, error: 'An unexpected error occurred' };
  }
}

// Get interview questions for a session
export async function getInterviewQuestions(sessionId: string): Promise<{
  success: boolean;
  data?: InterviewQuestionsResult;
  error?: string;
}> {
  try {
    const supabase = await createClient();
    
    // Get session info with job posting
    const { data: session, error: sessionError } = await supabase
      .from('interview_sessions')
      .select(`
        id,
        status,
        job_posting:job_postings (
          title
        )
      `)
      .eq('id', sessionId)
      .single();

    if (sessionError) {
      console.error('Error fetching session:', sessionError);
      return { success: false, error: 'Failed to fetch interview session' };
    }

    // Get questions for this session
    const { data: questions, error: questionsError } = await supabase
      .from('interview_questions')
      .select('id, question_text, question_type, question_order, related_skill, difficulty, focus_area')
      .eq('session_id', sessionId)
      .order('question_order', { ascending: true });

    if (questionsError) {
      console.error('Error fetching questions:', questionsError);
      return { success: false, error: 'Failed to fetch interview questions' };
    }

    // Get existing answers for this session
    const { data: answers, error: answersError } = await supabase
      .from('user_answers')
      .select('id, question_id, answer_text')
      .in('question_id', questions.map((q: {id: string}) => q.id) || []);

    if (answersError) {
      console.error('Error fetching answers:', answersError);
      // Continue without answers, not a critical error
    }

    return {
      success: true,
      data: {
        title: session.job_posting?.[0]?.title || 'Interview Session',
        questions: questions || [],
        answers: answers || []
      }
    };
  } catch (error) {
    console.error('Unexpected error in getInterviewQuestions:', error);
    return { success: false, error: 'An unexpected error occurred' };
  }
}

// Submit an answer to a question
export async function submitAnswer(questionId: string, answerText: string): Promise<{ 
  success: boolean; 
  data?: { answerId: string }; 
  error?: string 
}> {
  try {
    const supabase = await createClient();

    // Insert the answer
    const { data: answer, error: answerError } = await supabase
      .from('user_answers')
      .insert({
        question_id: questionId,
        answer_text: answerText
      })
      .select('id')
      .single();

    if (answerError) {
      console.error('Error submitting answer:', answerError);
      return { success: false, error: 'Failed to submit answer' };
    }

    return { 
      success: true, 
      data: { answerId: answer.id }
    };
  } catch (error) {
    console.error('Unexpected error in submitAnswer:', error);
    return { success: false, error: 'An unexpected error occurred' };
  }
}

// Submit an interview answer with evaluation
export async function submitInterviewAnswer(params: SubmitAnswerParams): Promise<{
  success: boolean;
  error?: string;
  feedback?: {
    summary: string;
    strengths: string[];
    improvements: string[];
  };
}> {
  const { questionId, answer } = params;
  try {
    const supabase = await createClient();

    // Insert the answer
    const { error: answerError } = await supabase
      .from('user_answers')
      .insert({
        question_id: questionId,
        answer_text: answer
      })
      .select('id')
      .single();

    if (answerError) {
      console.error('Error submitting answer:', answerError);
      return { success: false, error: 'Failed to submit answer' };
    }

    // In a real implementation, we would call the evaluator agent here
    // For now, just simulate a response
    const mockFeedback = {
      summary: "Good job addressing the key points. Try to be more specific with examples.",
      strengths: ["Clear communication", "Addressed main requirements"],
      improvements: ["Include specific examples", "Structure response more clearly"]
    };

    return {
      success: true,
      feedback: mockFeedback
    };
  } catch (error) {
    console.error('Unexpected error in submitInterviewAnswer:', error);
    return { success: false, error: 'An unexpected error occurred' };
  }
}

// Complete an interview session and generate results
export async function completeInterviewSession(sessionId: string): Promise<{
  success: boolean;
  error?: string;
}> {
  try {
    const supabase = await createClient();

    // Update session status
    const { error: updateError } = await supabase
      .from('interview_sessions')
      .update({ status: 'completed' })
      .eq('id', sessionId);

    if (updateError) {
      console.error('Error completing session:', updateError);
      return { success: false, error: 'Failed to complete interview session' };
    }

    // In a real implementation, we would call the evaluator agent to generate results
    // For now, just return success
    return { success: true };
  } catch (error) {
    console.error('Unexpected error in completeInterviewSession:', error);
    return { success: false, error: 'An unexpected error occurred' };
  }
}

// Get interview results
export async function getInterviewResults(sessionId: string): Promise<{
  success: boolean;
  data?: InterviewResult;
  error?: string;
}> {
  try {
    const supabase = await createClient();

    // Get session with job posting
    const { data: session, error: sessionError } = await supabase
      .from('interview_sessions')
      .select(`
        id,
        created_at,
        job_posting:job_postings (
          title
        )
      `)
      .eq('id', sessionId)
      .single();

    if (sessionError) {
      console.error('Error fetching interview session:', sessionError);
      return { success: false, error: 'Failed to fetch interview results' };
    }

    // In a real implementation, we would fetch actual evaluations
    // For now, return mock data
    const mockResult: InterviewResult = {
      sessionId,
      title: session.job_posting?.[0]?.title || 'Interview Session',
      date: new Date(session.created_at).toLocaleDateString(),
      overallScore: 3.7,
      scoreBreakdown: {
        technical: 3.5,
        communication: 4.0,
        problemSolving: 3.8,
        cultureFit: 3.5
      },
      strengths: [
        "Clear communication style",
        "Strong technical fundamentals",
        "Good problem-solving approach"
      ],
      weaknesses: [
        "Could provide more specific examples",
        "Some technical explanations lacked depth"
      ],
      recommendations: [
        "Practice with more technical questions",
        "Prepare specific examples from past work",
        "Structure answers using the STAR method"
      ],
      questions: [
        {
          id: "q1",
          text: "Tell me about a time you solved a difficult technical problem.",
          type: "behavioral",
          score: 3.8,
          answer: "I once had to debug a complex performance issue in our production system...",
          feedback: "Good explanation of the problem, but could have been more specific about your individual contribution."
        },
        {
          id: "q2",
          text: "How would you design a scalable web service?",
          type: "technical",
          score: 3.5,
          answer: "I would start by understanding the requirements and expected load...",
          feedback: "Solid architecture overview, but missing details on specific technologies and trade-offs."
        }
      ]
    };

    return { success: true, data: mockResult };
  } catch (error) {
    console.error('Unexpected error in getInterviewResults:', error);
    return { success: false, error: 'An unexpected error occurred' };
  }
}

// Update interview session status
export async function updateSessionStatus(sessionId: string, status: 'planned' | 'in_progress' | 'completed'): Promise<{ 
  success: boolean; 
  error?: string 
}> {
  try {
    const supabase = await createClient();

    const { error } = await supabase
      .from('interview_sessions')
      .update({ status })
      .eq('id', sessionId);

    if (error) {
      console.error('Error updating session status:', error);
      return { success: false, error: 'Failed to update session status' };
    }

    return { success: true };
  } catch (error) {
    console.error('Unexpected error in updateSessionStatus:', error);
    return { success: false, error: 'An unexpected error occurred' };
  }
}

// Delete an interview by deleting its associated job posting (will cascade)
export async function deleteInterview(jobPostingId: string): Promise<{ 
  success: boolean; 
  error?: string 
}> {
  try {
    const supabase = await createClient();

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