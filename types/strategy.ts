// Types for interview strategy and related data

export interface FocusArea {
  name: string;
  weight: number;
  description: string;
}

export interface SkillRequirement {
  skill: string;
  importance: 'low' | 'medium' | 'high';
  context: string;
}

export interface ExperienceRequirements {
  min_years: number;
  preferred_years: number;
  level: 'entry-level' | 'mid-level' | 'senior' | 'lead';
}

export interface SkillMatch {
  job_skill: string;
  resume_skill: string;
  experience_years?: number;
  level?: string;
  confidence: number;
}

export interface SkillGap {
  job_skill: string;
  missing_context: string;
  importance: 'low' | 'medium' | 'high';
  recommendation: string;
}

export interface PartialMatch {
  job_skill: string;
  resume_skill: string;
  transferable: boolean;
  gap_description: string;
  confidence: number;
}

export interface StrengthToHighlight {
  skill: string;
  context: string;
}

export interface WeaknessToAddress {
  skill: string;
  suggestion: string;
}

export interface InterviewQuestion {
  question_text: string;
  question_type: 'technical' | 'behavioral' | 'situational' | 'general';
  related_skill: string;
  difficulty: 'easy' | 'medium' | 'hard';
  focus_area: string;
}

export interface Strategy {
  job_analysis?: {
    title: string;
    company?: string | null;
    required_skills?: SkillRequirement[];
    preferred_skills?: SkillRequirement[];
    experience_requirements?: ExperienceRequirements;
    level?: string;
    requirements?: string[]; // For backwards compatibility
    skills_needed?: string[]; // For backwards compatibility
  };
  skills_mapping?: {
    strong_matches?: SkillMatch[];
    partial_matches?: PartialMatch[];
    gaps?: SkillGap[];
  };
  skills_match?: { // For backwards compatibility
    strong_matches?: { skill: string; experience?: string; }[];
    areas_to_highlight?: { skill: string; note?: string; }[];
    gaps?: { skill: string; mitigation?: string; }[];
  };
  interview_strategy?: {
    focus_areas?: FocusArea[];
    recommended_preparation?: string[];
    strengths_to_highlight?: StrengthToHighlight[];
    weaknesses_to_address?: WeaknessToAddress[];
  };
  interview_plan?: { // For backwards compatibility
    focus_areas?: FocusArea[];
    estimated_duration?: string;
    question_count?: number;
  };
  recommended_questions?: InterviewQuestion[];
}

export interface ProcessedStrategyData {
  jobAnalysis: {
    title: string;
    company?: string;
    level: string;
    requirements: string[];
    skills_needed: string[];
  };
  skillsMatch: {
    strong_matches: { skill: string; experience?: string }[];
    areas_to_highlight: { skill: string; note: string }[];
    gaps: { skill: string; mitigation: string }[];
  };
  interviewPlan: {
    focus_areas: FocusArea[];
    estimated_duration: string;
    question_count: number;
  };
}

export interface SessionData {
  title: string;
  date: string;
}

// Alias for strategist agent response
export type StrategistResponse = Strategy;