'use server';

import { createClient } from '@/lib/supabase/server';
import { getUser } from '@/lib/supabase/server';
import { ResumeParserResponse } from '@/types/openai';

type GetResumeResult = 
  | { success: true; data: { 
      id: string;
      title: string;
      content: string; 
      parsed_skills: ResumeParserResponse['parsed_skills'];
      experience: ResumeParserResponse['experience'];
      education: ResumeParserResponse['education'];
      projects?: ResumeParserResponse['projects'];
      created_at: string;
    }}
  | { success: false; error: string };

export async function getResumeForCurrentUser(): Promise<GetResumeResult> {
  try {
    // Get the current user
    const { data: { user } } = await getUser();
    
    if (!user) {
      return { 
        success: false, 
        error: 'User not authenticated' 
      };
    }
    
    // Create Supabase client
    const supabase = await createClient();
    
    // Query for the most recent active resume
    const { data, error } = await supabase
      .from('resumes')
      .select('*')
      .eq('profile_id', user.id)
      .eq('is_active', true)
      .order('created_at', { ascending: false })
      .limit(1)
      .single();
    
    if (error) {
      // Handle case where no resume exists yet (not a true error)
      if (error.code === 'PGRST116') {
        console.log("No resume found for user with ID:", user.id);
        return { 
          success: false, 
          error: 'No resume found' 
        };
      }
      
      console.error('Error fetching resume from Supabase:', error);
      return { 
        success: false, 
        error: `Failed to fetch resume: ${error.message}` 
      };
    }
    
    // Extra check to make sure we have valid data
    if (!data || !data.parsed_skills) {
      console.log("Resume found but data is incomplete for user:", user.id);
      return {
        success: false,
        error: 'Resume data is incomplete'
      };
    }
    
    return { success: true, data };
    
  } catch (error) {
    console.error('Error retrieving resume:', error);
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Failed to retrieve resume' 
    };
  }
}