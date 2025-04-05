-- Add insert policy for interview_questions table
CREATE POLICY "Users can insert questions for own sessions" 
  ON interview_questions FOR INSERT 
  WITH CHECK (EXISTS (
    SELECT 1 FROM interview_sessions
    WHERE interview_sessions.id = interview_questions.session_id
    AND interview_sessions.profile_id = auth.uid()
  ));

-- Add update policy for interview_questions table
CREATE POLICY "Users can update questions from own sessions" 
  ON interview_questions FOR UPDATE
  USING (EXISTS (
    SELECT 1 FROM interview_sessions
    WHERE interview_sessions.id = interview_questions.session_id
    AND interview_sessions.profile_id = auth.uid()
  ));

-- Add delete policy for interview_questions table
CREATE POLICY "Users can delete questions from own sessions" 
  ON interview_questions FOR DELETE
  USING (EXISTS (
    SELECT 1 FROM interview_sessions
    WHERE interview_sessions.id = interview_questions.session_id
    AND interview_sessions.profile_id = auth.uid()
  ));