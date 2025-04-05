'use server';

import { createClient } from '@/lib/supabase/server';
import { getUser } from '@/lib/supabase/server';

// Define the structure of a recommended question
interface RecommendedQuestion {
  question_text: string;
  question_type: string;
  related_skill: string;
  difficulty: string;
  focus_area: string;
}

// Get interview questions for a session
export async function getInterviewQuestions(sessionId: string) {
  try {
    // Get the current user
    const { data: { user } } = await getUser();
    
    if (!user) {
      return { success: false, error: 'User not authenticated' };
    }
    
    // Create Supabase client
    const supabase = await createClient();
    
    // Verify the session belongs to the user
    const { data: session, error: sessionError } = await supabase
      .from('interview_sessions')
      .select(`
        *,
        job_postings (
          title,
          company
        )
      `)
      .eq('id', sessionId)
      .eq('profile_id', user.id)
      .single();
      
    if (sessionError || !session) {
      return { 
        success: false, 
        error: 'Interview session not found or access denied' 
      };
    }
    
    // Get session strategy to extract questions
    if (!session.strategy || !session.strategy.recommended_questions) {
      return { 
        success: false, 
        error: 'No interview questions available for this session' 
      };
    }
    
    // Format the title
    const title = session.job_postings 
      ? `${session.job_postings.title}${session.job_postings.company ? ` at ${session.job_postings.company}` : ''}`
      : session.title || 'Interview Session';
    
    // Define the structure of a recommended question
    interface RecommendedQuestion {
      question_text: string;
      question_type: string;
      related_skill: string;
      difficulty: string;
      focus_area: string;
    }

    // Transform the questions
    const questions = session.strategy.recommended_questions.map((q: RecommendedQuestion, index: number) => ({
      id: `q-${sessionId}-${index}`,
      question_text: q.question_text,
      question_type: q.question_type,
      related_skill: q.related_skill,
      difficulty: q.difficulty,
      focus_area: q.focus_area
    }));
    
    // Get the answers that have been submitted so far
    const { data: existingAnswers, error: answersError } = await supabase
      .from('interview_answers')
      .select('*')
      .eq('session_id', sessionId)
      .order('created_at', { ascending: true });
    
    if (answersError) {
      console.error('Error fetching answers:', answersError);
    }
    
    // Format answers
    const answers = existingAnswers ? existingAnswers.map(answer => ({
      question_id: answer.question_id,
      answer_text: answer.answer_text,
      feedback: answer.feedback
    })) : [];
    
    return { 
      success: true, 
      data: {
        title,
        questions,
        answers
      }
    };
    
  } catch (error) {
    console.error('Error getting interview questions:', error);
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Failed to get interview questions' 
    };
  }
}

// Submit an answer to an interview question
export async function submitInterviewAnswer({ 
  sessionId, 
  questionId, 
  answer 
}: { 
  sessionId: string; 
  questionId: string; 
  answer: string; 
}) {
  try {
    // Get the current user
    const { data: { user } } = await getUser();
    
    if (!user) {
      return { success: false, error: 'User not authenticated' };
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
      return { 
        success: false, 
        error: 'Interview session not found or access denied' 
      };
    }
    
    // Generate quick feedback for the answer
    // In a real application, this would call an agent or API
    const feedback = generateFeedback(answer);
    
    // Save the answer
    const { error } = await supabase
      .from('interview_answers')
      .insert({
        session_id: sessionId,
        question_id: questionId,
        answer_text: answer,
        profile_id: user.id,
        feedback
      })
      .select()
      .single();
      
    if (error) {
      throw new Error(`Failed to save answer: ${error.message}`);
    }
    
    // If this was the last question, update the session status
    const { data: answers } = await supabase
      .from('interview_answers')
      .select('*')
      .eq('session_id', sessionId);
      
    const totalQuestions = session.strategy?.recommended_questions?.length || 0;
    
    if (answers && answers.length === totalQuestions) {
      await supabase
        .from('interview_sessions')
        .update({ status: 'completed' })
        .eq('id', sessionId);
    }
    
    return { 
      success: true, 
      feedback
    };
    
  } catch (error) {
    console.error('Error submitting answer:', error);
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Failed to submit answer' 
    };
  }
}

// Complete the interview session and prepare results
export async function completeInterviewSession(sessionId: string) {
  try {
    // Get the current user
    const { data: { user } } = await getUser();
    
    if (!user) {
      return { success: false, error: 'User not authenticated' };
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
      return { 
        success: false, 
        error: 'Interview session not found or access denied' 
      };
    }
    
    // Get all answers for this session
    const { data: answers, error: answersError } = await supabase
      .from('interview_answers')
      .select('*')
      .eq('session_id', sessionId);
      
    if (answersError) {
      throw new Error(`Failed to get answers: ${answersError.message}`);
    }
    
    // Generate evaluation results
    // In a real application, this would call the evaluator agent
    const evaluation = generateEvaluation(answers || []);
    
    // Update session with evaluation results
    await supabase
      .from('interview_sessions')
      .update({
        status: 'completed',
        evaluation_results: evaluation
      })
      .eq('id', sessionId);
    
    return { 
      success: true,
      evaluation
    };
    
  } catch (error) {
    console.error('Error completing interview session:', error);
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Failed to complete interview session' 
    };
  }
}

// Get interview results
export async function getInterviewResults(sessionId: string) {
  try {
    // Get the current user
    const { data: { user } } = await getUser();
    
    if (!user) {
      return { success: false, error: 'User not authenticated' };
    }
    
    // Create Supabase client
    const supabase = await createClient();
    
    // Verify the session belongs to the user
    const { data: session, error: sessionError } = await supabase
      .from('interview_sessions')
      .select(`
        *,
        job_postings (
          title,
          company
        )
      `)
      .eq('id', sessionId)
      .eq('profile_id', user.id)
      .single();
      
    if (sessionError || !session) {
      return { 
        success: false, 
        error: 'Interview session not found or access denied' 
      };
    }
    
    // Get all answers for this session
    const { data: answers, error: answersError } = await supabase
      .from('interview_answers')
      .select('*')
      .eq('session_id', sessionId);
      
    if (answersError) {
      throw new Error(`Failed to get answers: ${answersError.message}`);
    }
    
    // If evaluation hasn't been done yet, or we need real-time results
    if (!session.evaluation_results) {
      // Generate evaluation results
      const evaluation = generateEvaluation(answers || []);
      
      // Update session with evaluation results
      await supabase
        .from('interview_sessions')
        .update({
          evaluation_results: evaluation
        })
        .eq('id', sessionId);
        
      session.evaluation_results = evaluation;
    }
    
    // Format the data for the UI
    const title = session.job_postings 
      ? `${session.job_postings.title}${session.job_postings.company ? ` at ${session.job_postings.company}` : ''}`
      : session.title || 'Interview Session';
      
    const result = {
      sessionId,
      title,
      date: new Date(session.created_at).toLocaleDateString(),
      overallScore: session.evaluation_results.overall_score || 3.5,
      scoreBreakdown: session.evaluation_results.score_breakdown || {
        technical: 3.5,
        communication: 3.5,
        problemSolving: 3.5,
        cultureFit: 3.5
      },
      strengths: session.evaluation_results.strengths || [],
      weaknesses: session.evaluation_results.areas_to_improve || [],
      recommendations: session.evaluation_results.recommendations || [],
      questions: []
    };
    
    // Add questions and answers
    if (session.strategy && session.strategy.recommended_questions) {
      result.questions = session.strategy.recommended_questions.map((q: RecommendedQuestion, index: number) => {
        const matchingAnswer = answers?.find(a => a.question_id === `q-${sessionId}-${index}`);
        return {
          id: `q-${sessionId}-${index}`,
          text: q.question_text,
          type: q.question_type,
          score: matchingAnswer?.feedback?.score || 3.0,
          answer: matchingAnswer?.answer_text || "No answer provided",
          feedback: matchingAnswer?.feedback?.summary || "No feedback available"
        };
      });
    }
    
    return { 
      success: true, 
      data: result
    };
    
  } catch (error) {
    console.error('Error getting interview results:', error);
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Failed to get interview results' 
    };
  }
}

// Dummy function to generate feedback for an answer
// In a real application, this would call an AI agent
function generateFeedback(answer: string) {
  const strengths = [];
  const improvements = [];
  let score = 3.0;
  
  // Very basic dummy feedback generation
  if (answer.length > 200) {
    strengths.push("Provided a detailed response");
    score += 0.5;
  } else {
    improvements.push("Consider providing more details in your answer");
    score -= 0.3;
  }
  
  if (answer.includes("example") || answer.includes("instance") || answer.includes("case")) {
    strengths.push("Used specific examples to illustrate points");
    score += 0.4;
  } else {
    improvements.push("Include concrete examples to support your answers");
  }
  
  if (answer.split('.').length > 3) {
    strengths.push("Well-structured response with multiple points");
    score += 0.3;
  }
  
  // Ensure score is between 1 and 5
  score = Math.min(5, Math.max(1, score));
  
  return {
    strengths,
    improvements,
    score,
    summary: strengths.length > improvements.length 
      ? "Good answer with clear points. " + (improvements.length > 0 ? improvements[0] : "")
      : "Consider improving this answer. " + (strengths.length > 0 ? strengths[0] : "")
  };
}

// Dummy function to generate evaluation for all answers
// In a real application, this would call the evaluator agent
function generateEvaluation(answers: Array<{ feedback?: { score?: number, strengths?: string[], improvements?: string[] } }>) {
  // Calculate average score
  const totalScore = answers.reduce((sum, answer) => sum + (answer.feedback?.score || 3.0), 0);
  const overallScore = answers.length > 0 ? totalScore / answers.length : 3.5;
  
  // Count strengths and weaknesses
  const strengthsMap = new Map();
  const weaknessesMap = new Map();
  
  answers.forEach(answer => {
    if (answer.feedback?.strengths) {
      answer.feedback.strengths.forEach((strength: string) => {
        strengthsMap.set(strength, (strengthsMap.get(strength) || 0) + 1);
      });
    }
    if (answer.feedback?.improvements) {
      answer.feedback.improvements.forEach((improvement: string) => {
        weaknessesMap.set(improvement, (weaknessesMap.get(improvement) || 0) + 1);
      });
    }
  });
  
  // Sort by frequency
  const strengths = Array.from(strengthsMap.entries())
    .sort((a, b) => b[1] - a[1])
    .slice(0, 3)
    .map(([strength]) => strength);
    
  const areasToImprove = Array.from(weaknessesMap.entries())
    .sort((a, b) => b[1] - a[1])
    .slice(0, 3)
    .map(([weakness]) => weakness);
  
  // Generate recommendations
  const recommendations = [
    "Practice structuring your answers using the STAR method",
    "Include specific examples from your experience to strengthen your responses",
    "Research the company and position more thoroughly before the interview",
    "Prepare concise answers for common technical questions in your field"
  ];
  
  // Calculate score breakdown
  const scoreBreakdown = {
    technical: Math.min(5, Math.max(1, overallScore + (Math.random() * 0.6 - 0.3))),
    communication: Math.min(5, Math.max(1, overallScore + (Math.random() * 0.6 - 0.3))),
    problemSolving: Math.min(5, Math.max(1, overallScore + (Math.random() * 0.6 - 0.3))),
    cultureFit: Math.min(5, Math.max(1, overallScore + (Math.random() * 0.6 - 0.3)))
  };
  
  return {
    overall_score: overallScore,
    score_breakdown: scoreBreakdown,
    strengths,
    areas_to_improve: areasToImprove,
    recommendations: recommendations.slice(0, 3)
  };
}