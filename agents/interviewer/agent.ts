'use server';

import OpenAI from 'openai';
import { createClient } from '@/lib/supabase/server';
import { getUser } from '@/lib/supabase/server';

// Initialize OpenAI client server-side with API key from environment
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

interface InterviewerResponse {
  interviewer_response: {
    message: string;
    reaction_type: 'greeting' | 'clarification' | 'acknowledgment' | 'transition_to_next' | 'follow_up' | 'conclusion';
    next_question?: {
      question_text: string;
      question_type: string;
      related_skill: string;
      difficulty: string;
      focus_area: string;
      id?: string;
    };
    interview_status: {
      current_question_index: number;
      total_questions: number;
      estimated_completion_percentage: number;
      areas_covered: string[];
      remaining_areas: string[];
    };
  };
}

export async function startInterview(sessionId: string) {
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
    
    // Fetch interview session with strategy
    const { data: session, error: sessionError } = await supabase
      .from('interview_sessions')
      .select(`
        *,
        job_posting:job_postings(title, company, description, parsed_requirements),
        resume:resumes(parsed_skills, experience, education, projects)
      `)
      .eq('id', sessionId)
      .eq('profile_id', user.id)
      .single();
      
    if (sessionError || !session) {
      throw new Error('Interview session not found or access denied');
    }
    
    // Fetch interview questions
    const { data: questions, error: questionsError } = await supabase
      .from('interview_questions')
      .select('*')
      .eq('session_id', sessionId)
      .order('question_order', { ascending: true });
      
    if (questionsError) {
      throw new Error('Failed to fetch interview questions');
    }
    
    // If no questions, return an error
    if (!questions || questions.length === 0) {
      throw new Error('No interview questions found for this session');
    }
    
    // Process with OpenAI Assistant
    const assistantId = process.env.OPENAI_INTERVIEWER_ASSISTANT_ID;
    
    if (!assistantId) {
      throw new Error('Interviewer assistant ID not configured');
    }
    
    // Create thread and send message to OpenAI Assistant
    const thread = await openai.beta.threads.create();
    
    // Prepare the context for the interviewer
    const contextData = {
      job_info: {
        title: session.job_posting.title,
        company: session.job_posting.company,
        description: session.job_posting.description,
        requirements: session.job_posting.parsed_requirements
      },
      strategy: session.strategy,
      questions: questions,
      session_status: {
        is_first_interaction: true,
        current_question_index: 0
      }
    };
    
    await openai.beta.threads.messages.create(
      thread.id,
      {
        role: "user",
        content: `I'm ready to start my interview preparation. This is the first message, please greet me and start the interview based on this context:\n\n${JSON.stringify(contextData)}`
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
    let interviewerResponse: InterviewerResponse;
    try {
      interviewerResponse = JSON.parse(jsonMatch[1] || jsonMatch[0]);
    } catch (error) {
      console.error("Error parsing JSON:", error);
      throw new Error('Failed to parse JSON response');
    }
    
    // Update session status to in_progress if it's not already
    if (session.status !== 'in_progress') {
      await supabase
        .from('interview_sessions')
        .update({ status: 'in_progress' })
        .eq('id', sessionId);
    }
    
    // Store the first question asked
    if (interviewerResponse.interviewer_response.next_question) {
      const firstQuestionData = {
        session_id: sessionId,
        question_text: interviewerResponse.interviewer_response.next_question.question_text,
        question_type: interviewerResponse.interviewer_response.next_question.question_type,
        related_skill: interviewerResponse.interviewer_response.next_question.related_skill,
        difficulty: interviewerResponse.interviewer_response.next_question.difficulty,
        focus_area: interviewerResponse.interviewer_response.next_question.focus_area,
        question_order: 1,
        source: 'interviewer'
      };
      
      // Check if this exact question already exists to avoid duplicates
      const { data: existingQuestion } = await supabase
        .from('interview_questions')
        .select('id')
        .eq('session_id', sessionId)
        .eq('question_text', firstQuestionData.question_text)
        .single();
        
      if (!existingQuestion) {
        await supabase
          .from('interview_questions')
          .insert(firstQuestionData);
      }
    }
    
    // Calculate processing time
    const processingTime = Date.now() - startTime;
    
    // Log the agent activity
    await supabase
      .from('agent_logs')
      .insert({
        agent_type: 'interviewer',
        session_id: sessionId,
        input: { start_interview: true },
        output: { 
          success: true,
          message_type: interviewerResponse.interviewer_response.reaction_type
        },
        processing_time: processingTime
      });
    
    // Store thread ID in local storage or database for continuing the conversation
    return { 
      success: true, 
      data: {
        thread_id: thread.id,
        message: interviewerResponse.interviewer_response.message,
        next_question: interviewerResponse.interviewer_response.next_question,
        status: interviewerResponse.interviewer_response.interview_status
      }
    };
    
  } catch (error) {
    console.error('Error starting interview:', error);
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Failed to start interview' 
    };
  }
}

export async function continueInterview(
  sessionId: string, 
  threadId: string, 
  userAnswer: string, 
  currentQuestionId: string | null = null
) {
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
    
    // Save user's answer if we have a question ID
    if (currentQuestionId) {
      await supabase
        .from('user_answers')
        .insert({
          question_id: currentQuestionId,
          answer_text: userAnswer
        });
    }
    
    // Process with OpenAI Assistant
    const assistantId = process.env.OPENAI_INTERVIEWER_ASSISTANT_ID;
    
    if (!assistantId) {
      throw new Error('Interviewer assistant ID not configured');
    }
    
    // Send user's answer to the existing thread
    await openai.beta.threads.messages.create(
      threadId,
      {
        role: "user",
        content: userAnswer
      }
    );
    
    // Run the assistant
    const run = await openai.beta.threads.runs.create(
      threadId,
      {
        assistant_id: assistantId
      }
    );
    
    // Poll for completion
    let runStatus = await openai.beta.threads.runs.retrieve(
      threadId,
      run.id
    );
    
    // Simple polling mechanism - in production, use a more sophisticated approach
    while (runStatus.status !== "completed" && runStatus.status !== "failed") {
      // Wait 1 second between polls
      await new Promise(resolve => setTimeout(resolve, 1000));
      runStatus = await openai.beta.threads.runs.retrieve(
        threadId,
        run.id
      );
    }
    
    if (runStatus.status === "failed") {
      throw new Error('Assistant processing failed');
    }
    
    // Get assistant response
    const messages = await openai.beta.threads.messages.list(threadId);
    
    // Find the assistant's response (newest first)
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
    let interviewerResponse: InterviewerResponse;
    try {
      interviewerResponse = JSON.parse(jsonMatch[1] || jsonMatch[0]);
    } catch (error) {
      console.error("Error parsing JSON:", error);
      throw new Error('Failed to parse JSON response');
    }
    
    // Check if this is a conclusion or if we have another question
    if (interviewerResponse.interviewer_response.reaction_type === 'conclusion') {
      // Update session status to completed
      await supabase
        .from('interview_sessions')
        .update({ status: 'completed' })
        .eq('id', sessionId);
    } 
    // If we have a new question, store it
    else if (interviewerResponse.interviewer_response.next_question) {
      const nextQuestionData = {
        session_id: sessionId,
        question_text: interviewerResponse.interviewer_response.next_question.question_text,
        question_type: interviewerResponse.interviewer_response.next_question.question_type,
        related_skill: interviewerResponse.interviewer_response.next_question.related_skill,
        difficulty: interviewerResponse.interviewer_response.next_question.difficulty,
        focus_area: interviewerResponse.interviewer_response.next_question.focus_area,
        question_order: interviewerResponse.interviewer_response.interview_status.current_question_index + 1,
        source: 'interviewer'
      };
      
      // Check if this exact question already exists to avoid duplicates
      const { data: existingQuestion } = await supabase
        .from('interview_questions')
        .select('id')
        .eq('session_id', sessionId)
        .eq('question_text', nextQuestionData.question_text)
        .single();
        
      if (!existingQuestion) {
        const { data: newQuestion } = await supabase
          .from('interview_questions')
          .insert(nextQuestionData)
          .select()
          .single();
          
        if (newQuestion) {
          // Return the new question ID for the next iteration
          interviewerResponse.interviewer_response.next_question.id = newQuestion.id;
        }
      } else {
        // If question already exists, use that ID
        interviewerResponse.interviewer_response.next_question.id = existingQuestion.id;
      }
    }
    
    // Calculate processing time
    const processingTime = Date.now() - startTime;
    
    // Log the agent activity
    await supabase
      .from('agent_logs')
      .insert({
        agent_type: 'interviewer',
        session_id: sessionId,
        input: { 
          answer_length: userAnswer.length,
          current_question_index: interviewerResponse.interviewer_response.interview_status.current_question_index
        },
        output: { 
          success: true,
          message_type: interviewerResponse.interviewer_response.reaction_type,
          completion_percentage: interviewerResponse.interviewer_response.interview_status.estimated_completion_percentage
        },
        processing_time: processingTime
      });
    
    return { 
      success: true, 
      data: {
        thread_id: threadId,
        message: interviewerResponse.interviewer_response.message,
        next_question: interviewerResponse.interviewer_response.next_question,
        status: interviewerResponse.interviewer_response.interview_status,
        is_complete: interviewerResponse.interviewer_response.reaction_type === 'conclusion'
      }
    };
    
  } catch (error) {
    console.error('Error continuing interview:', error);
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Failed to continue interview' 
    };
  }
}