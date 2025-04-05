'use server';

import { createClient } from '@/lib/supabase/server';
import { getUser } from '@/lib/supabase/server';

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
        technical_skills_count: technicalSkillsCount,
        soft_skills_count: softSkillsCount,
        total_years_experience: totalYearsExperience,
        education: education ? {
          degree: education.degree,
          institution: education.institution,
          year: education.year
        } : null,
        created_at: resume.created_at,
        full_resume: resume
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