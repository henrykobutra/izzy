-- Update the evaluations table to accommodate the new evaluator format

-- Modify the score constraints to allow 1-10 scale
ALTER TABLE evaluations
DROP CONSTRAINT IF EXISTS evaluations_clarity_score_check,
DROP CONSTRAINT IF EXISTS evaluations_relevance_score_check,
DROP CONSTRAINT IF EXISTS evaluations_overall_score_check;

-- Add new constraints with 1-10 scale
ALTER TABLE evaluations
ADD CONSTRAINT evaluations_clarity_score_check CHECK (clarity_score BETWEEN 1 AND 10),
ADD CONSTRAINT evaluations_relevance_score_check CHECK (relevance_score BETWEEN 1 AND 10),
ADD CONSTRAINT evaluations_overall_score_check CHECK (overall_score BETWEEN 1 AND 10);

-- Add column for suggested_response
ALTER TABLE evaluations
ADD COLUMN suggested_response TEXT;

-- Add column for strengths as array
ALTER TABLE evaluations
ADD COLUMN strengths TEXT[];

-- Add column for areas_for_improvement as array
ALTER TABLE evaluations
ADD COLUMN areas_for_improvement TEXT[];

-- Comment on the new columns
COMMENT ON COLUMN evaluations.suggested_response IS 'Example of an improved answer that could have been given';
COMMENT ON COLUMN evaluations.strengths IS 'Array of specific strengths identified in the answer';
COMMENT ON COLUMN evaluations.areas_for_improvement IS 'Array of specific areas that could be improved in the answer';