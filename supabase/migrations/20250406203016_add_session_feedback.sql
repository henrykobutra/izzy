-- Add session_feedback column to interview_sessions table to store overall evaluation
ALTER TABLE interview_sessions
ADD COLUMN session_feedback JSONB;

-- Create index to improve query performance
CREATE INDEX idx_interview_sessions_feedback ON interview_sessions USING gin(session_feedback);

-- Comment on the new column
COMMENT ON COLUMN interview_sessions.session_feedback IS 'Overall session evaluation data including scores, feedback, strengths, and areas for improvement';