// Define resume-related types in a central location

export type UploadState = 'idle' | 'checking-db' | 'uploading' | 'processing' | 'saving' | 'success' | 'error';

// Helper functions for type checking
export const isCheckingDb = (state: UploadState): state is 'checking-db' => state === 'checking-db';
export const isUploading = (state: UploadState): state is 'uploading' => state === 'uploading';
export const isProcessing = (state: UploadState): state is 'processing' => state === 'processing';
export const isSaving = (state: UploadState): state is 'saving' => state === 'saving';
export const isSuccess = (state: UploadState): state is 'success' => state === 'success';
export const isError = (state: UploadState): state is 'error' => state === 'error';
export const isIdle = (state: UploadState): state is 'idle' => state === 'idle';

export interface Skill {
  skill: string;
  level?: string;
  years?: number;
  context?: string;
}

export interface Experience {
  title: string;
  company: string;
  duration?: {
    years: number;
    months: number;
  };
  highlights?: string[];
}

export interface Education {
  degree: string;
  institution: string;
  year?: number;
}

export interface Project {
  name: string;
  description: string;
  technologies: string[];
}

export interface ParsedSkills {
  technical?: Skill[];
  soft?: Skill[];
}

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
  full_resume: {
    parsed_skills?: ParsedSkills;
    experience?: Experience[];
    education?: Education[];
    projects?: Project[];
    [key: string]: unknown;
  };
}
