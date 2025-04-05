import { useState, useEffect } from 'react';
import { getActiveResume } from '@/lib/actions/get-active-resume';

import { ResumeData } from '@/lib/constants/interview-types';

export function useResumeCheck() {
  const [resumeUploaded, setResumeUploaded] = useState(false);
  const [resumeData, setResumeData] = useState<ResumeData | null>(null);
  const [resumeError, setResumeError] = useState<string | null>(null);
  
  useEffect(() => {
    // Fetch the user's active resume
    const fetchResumeData = async () => {
      try {
        const result = await getActiveResume();
        if (result.success) {
          if (result.data) {
            setResumeData({
              ...result.data,
              full_resume: result.data.parsed_skills ? {
                parsed_skills: result.data.parsed_skills,
                experience: result.data.experience,
                education: result.data.education,
                projects: result.data.projects
              } : {}
            });
            setResumeUploaded(true);
            setResumeError(null);
          }
        } else {
          setResumeUploaded(false);
          setResumeError(result.error || 'No resume found');
          console.log("Resume not found:", result.error);
        }
      } catch (error) {
        setResumeUploaded(false);
        setResumeError('Error fetching resume data');
        console.error("Error checking resume status:", error);
      }
    };

    fetchResumeData();
  }, []);

  return {
    resumeUploaded,
    resumeData,
    resumeError
  };
}