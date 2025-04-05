-- Migration: Add detailed resume columns
-- This migration adds additional JSON columns to store parsed resume data

-- Add education, experience, and projects columns to resumes table
ALTER TABLE IF EXISTS resumes
  ADD COLUMN IF NOT EXISTS education JSONB,
  ADD COLUMN IF NOT EXISTS experience JSONB,
  ADD COLUMN IF NOT EXISTS projects JSONB;

-- Create indexes to improve query performance on JSON fields
CREATE INDEX IF NOT EXISTS idx_resumes_education ON resumes USING gin(education);
CREATE INDEX IF NOT EXISTS idx_resumes_experience ON resumes USING gin(experience);
CREATE INDEX IF NOT EXISTS idx_resumes_projects ON resumes USING gin(projects);

COMMENT ON COLUMN resumes.education IS 'JSON array of education details from the resume';
COMMENT ON COLUMN resumes.experience IS 'JSON array of work experience details from the resume';
COMMENT ON COLUMN resumes.projects IS 'JSON array of project details from the resume';