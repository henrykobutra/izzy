'use server';

import { createClient } from '@/lib/supabase/server';
import { getUser } from '@/lib/supabase/server';

// Get resume for current user (used by client components)
export async function getActiveResume() {
  try {
    // Get the current user
    const { data: { user } } = await getUser();
    
    if (!user) {
      return { success: false, error: 'User not authenticated' };
    }
    
    // Create Supabase client
    const supabase = await createClient();
    
    // Fetch the active resume
    const { data: resume, error } = await supabase
      .from('resumes')
      .select('*')
      .eq('profile_id', user.id)
      .eq('is_active', true)
      .single();
      
    if (error) {
      console.error('Error fetching active resume:', error);
      return { 
        success: false, 
        error: 'No active resume found. Please upload your resume first.' 
      };
    }
    
    // Get the count of technical and soft skills
    const technicalSkillsCount = resume.parsed_skills?.technical?.length || 0;
    const softSkillsCount = resume.parsed_skills?.soft?.length || 0;
    
    // Calculate total years of experience (using the most recent experience entry)
    let totalYearsExperience = 0;
    if (resume.experience && resume.experience.length > 0) {
      // Sort by most recent first (if any have end dates)
      const sortedExperience = [...resume.experience].sort((a, b) => {
        // Use duration years as a proxy for recency if no end dates available
        return (b.duration?.years || 0) - (a.duration?.years || 0);
      });
      
      // Sum up the years from all experiences
      totalYearsExperience = sortedExperience.reduce((total, exp) => 
        total + (exp.duration?.years || 0), 0);
    }
    
    // Get education details
    const education = resume.education && resume.education.length > 0 
      ? resume.education[0] 
      : null;
    
    // Return a simplified version with the key information
    return {
      success: true,
      data: {
        id: resume.id,
        content: resume.content,
        parsed_skills: resume.parsed_skills,
        experience: resume.experience,
        education: resume.education,
        projects: resume.projects,
        technical_skills_count: technicalSkillsCount,
        soft_skills_count: softSkillsCount,
        total_years_experience: totalYearsExperience,
        education_summary: education ? {
          degree: education.degree,
          institution: education.institution,
          year: education.year
        } : null,
        created_at: resume.created_at
      }
    };
    
  } catch (error) {
    console.error('Error fetching active resume:', error);
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Failed to fetch resume information' 
    };
  }
}

// Get resume by profile ID (used by server components and agents)
export async function getActiveResumeByProfileId(profileId: string) {
  if (!profileId) {
    return { data: null, error: 'Profile ID is required' };
  }

  try {
    const supabase = await createClient();
    
    // Query for the active resume for this profile
    const { data, error } = await supabase
      .from('resumes')
      .select('*')
      .eq('profile_id', profileId)
      .eq('is_active', true)
      .order('created_at', { ascending: false })
      .limit(1)
      .single();
      
    if (error) {
      console.error('Error fetching active resume:', error);
      
      // If no active resume found, get the most recent one
      const { data: latestResume, error: latestError } = await supabase
        .from('resumes')
        .select('*')
        .eq('profile_id', profileId)
        .order('created_at', { ascending: false })
        .limit(1)
        .single();
        
      if (latestError) {
        return { 
          data: null, 
          error: `No resume found for profile: ${latestError.message}` 
        };
      }
      
      return { data: latestResume, error: null };
    }
    
    return { data, error: null };
  } catch (error) {
    console.error('Error in getActiveResumeByProfileId:', error);
    return { 
      data: null, 
      error: error instanceof Error ? error.message : 'Unknown error retrieving resume' 
    };
  }
}