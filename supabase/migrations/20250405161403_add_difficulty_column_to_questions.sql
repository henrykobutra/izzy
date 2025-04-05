-- Add missing difficulty column to interview_questions table
ALTER TABLE interview_questions 
ADD COLUMN difficulty TEXT;

-- Add missing focus_area column to interview_questions table
ALTER TABLE interview_questions 
ADD COLUMN focus_area TEXT;