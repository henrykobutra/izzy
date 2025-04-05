// Interview step types
export type InterviewStep = 'setup' | 'strategy' | 'interview' | 'evaluation';

// Interview status types
export type InterviewStatus = 'not_started' | 'in_progress' | 'completed' | 'planned';

// Interview session interface
export interface InterviewSession {
  id: string;
  title: string;
  date: Date;
  status: InterviewStatus;
  score?: number;
}

// Resume data interface
export interface ResumeData {
  id: string;
  technical_skills_count: number;
  soft_skills_count: number;
  total_years_experience: number;
  education: {
    degree: string;
    institution: string;
    year?: number;
  } | null;
  full_resume: Record<string, unknown>;
}