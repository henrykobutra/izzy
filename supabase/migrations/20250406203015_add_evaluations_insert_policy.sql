-- Add insert policy for evaluations table to allow server operations
CREATE POLICY "Server can insert evaluations" 
  ON public.evaluations 
  FOR INSERT 
  WITH CHECK (true);

-- Also add a more specific policy for users if needed
CREATE POLICY "Users can insert evaluations for their own answers" 
  ON public.evaluations 
  FOR INSERT 
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM user_answers
      JOIN interview_questions ON interview_questions.id = user_answers.question_id
      JOIN interview_sessions ON interview_sessions.id = interview_questions.session_id
      WHERE user_answers.id = evaluations.answer_id
      AND interview_sessions.profile_id = auth.uid()
    )
  );