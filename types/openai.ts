// No imports needed for this interface

export interface ResumeParserResponse {
  parsed_skills: {
    technical: {
      skill: string;
      level?: "beginner" | "intermediate" | "proficient" | "expert";
      years?: number;
    }[];
    soft: {
      skill: string;
      context?: string;
    }[];
    certifications?: {
      name: string;
      year?: number;
    }[];
  };
  experience: {
    title: string;
    company: string;
    duration: {
      years: number;
      months: number;
    };
    highlights: string[];
  }[];
  education: {
    degree: string;
    institution: string;
    year?: number;
  }[];
  projects?: {
    name: string;
    technologies: string[];
    description: string;
  }[];
}