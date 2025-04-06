-- Add thread_id column to interview_sessions table to store OpenAI thread ID for session continuity
ALTER TABLE interview_sessions
ADD COLUMN thread_id TEXT;

-- Add metadata column to user_answers to store additional metadata
ALTER TABLE user_answers
ADD COLUMN metadata JSONB;

-- Comment on the new columns
COMMENT ON COLUMN interview_sessions.thread_id IS 'OpenAI Assistant thread ID for continuing interview sessions';
COMMENT ON COLUMN user_answers.metadata IS 'Additional metadata about the answer, such as question_type, related_skill, etc.';
