-- Initialize Izzy database schema (v1)

-- Enable security features
-- UUID and cryptographic extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- User Profiles Table
CREATE TABLE IF NOT EXISTS profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
  full_name TEXT,
  avatar_url TEXT,
  email TEXT,
  is_anonymous BOOLEAN DEFAULT false,
  CONSTRAINT proper_email CHECK (email IS NULL OR email ~* '^[A-Za-z0-9._+%-]+@[A-Za-z0-9.-]+[.][A-Za-z]+$')
);

-- Resumes Table
CREATE TABLE IF NOT EXISTS resumes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
  profile_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  parsed_skills JSONB,  -- Stores skills extracted by Parser agent
  is_active BOOLEAN DEFAULT true
);

-- Job Postings Table
CREATE TABLE IF NOT EXISTS job_postings (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
  profile_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  title TEXT NOT NULL, 
  company TEXT,
  description TEXT NOT NULL,
  parsed_requirements JSONB, -- Stores requirements extracted by Parser agent
  is_active BOOLEAN DEFAULT true
);

-- Interview Sessions Table
CREATE TABLE IF NOT EXISTS interview_sessions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
  profile_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  resume_id UUID REFERENCES resumes(id) ON DELETE CASCADE NOT NULL,
  job_posting_id UUID REFERENCES job_postings(id) ON DELETE CASCADE NOT NULL,
  strategy JSONB, -- Strategy developed by Strategist agent
  status TEXT CHECK (status IN ('planned', 'in_progress', 'completed')) DEFAULT 'planned'
);

-- Interview Questions Table
CREATE TABLE IF NOT EXISTS interview_questions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
  session_id UUID REFERENCES interview_sessions(id) ON DELETE CASCADE NOT NULL,
  question_text TEXT NOT NULL,
  question_type TEXT CHECK (question_type IN ('technical', 'behavioral', 'situational', 'general')),
  question_order INTEGER NOT NULL,
  related_skill TEXT, -- Which skill/requirement this question is targeting
  source TEXT -- Where this question came from (e.g., 'web_search', 'strategist', 'cache')
);

-- User Answers Table
CREATE TABLE IF NOT EXISTS user_answers (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
  question_id UUID REFERENCES interview_questions(id) ON DELETE CASCADE NOT NULL,
  answer_text TEXT NOT NULL,
  voice_recording_url TEXT -- Optional URL to voice recording
);

-- Evaluations Table
CREATE TABLE IF NOT EXISTS evaluations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
  answer_id UUID REFERENCES user_answers(id) ON DELETE CASCADE NOT NULL,
  clarity_score INTEGER CHECK (clarity_score BETWEEN 1 AND 5),
  relevance_score INTEGER CHECK (relevance_score BETWEEN 1 AND 5),
  overall_score INTEGER CHECK (overall_score BETWEEN 1 AND 5),
  feedback TEXT NOT NULL,
  improvement_suggestions TEXT
);

-- Agent Logs Table (for debugging and improvement)
CREATE TABLE IF NOT EXISTS agent_logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
  session_id UUID REFERENCES interview_sessions(id) ON DELETE SET NULL,
  agent_type TEXT CHECK (agent_type IN ('parser', 'strategist', 'interviewer', 'evaluator')),
  input JSONB,
  output JSONB,
  processing_time FLOAT,
  error_message TEXT
);

-- Anonymous Session Data (for users not logged in)
CREATE TABLE IF NOT EXISTS anonymous_sessions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
  session_data JSONB, -- Stores temporary session data
  expires_at TIMESTAMP WITH TIME ZONE DEFAULT (now() + interval '7 days') NOT NULL
);

-- Secure tables by enabling Row Level Security
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE resumes ENABLE ROW LEVEL SECURITY;
ALTER TABLE job_postings ENABLE ROW LEVEL SECURITY;
ALTER TABLE interview_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE interview_questions ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_answers ENABLE ROW LEVEL SECURITY;
ALTER TABLE evaluations ENABLE ROW LEVEL SECURITY;
ALTER TABLE agent_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE anonymous_sessions ENABLE ROW LEVEL SECURITY;

-- Create policies for Row Level Security
-- Profiles - users can only view and edit their own profiles
CREATE POLICY "Users can view own profile" 
  ON profiles FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update own profile" 
  ON profiles FOR UPDATE USING (auth.uid() = id);

-- Resumes
CREATE POLICY "Users can CRUD own resumes" 
  ON resumes FOR ALL USING (auth.uid() = profile_id);

-- Job Postings
CREATE POLICY "Users can CRUD own job postings" 
  ON job_postings FOR ALL USING (auth.uid() = profile_id);

-- Interview Sessions
CREATE POLICY "Users can CRUD own interview sessions" 
  ON interview_sessions FOR ALL USING (auth.uid() = profile_id);

-- Interview Questions
CREATE POLICY "Users can view questions from own sessions" 
  ON interview_questions FOR SELECT 
  USING (EXISTS (
    SELECT 1 FROM interview_sessions
    WHERE interview_sessions.id = interview_questions.session_id
    AND interview_sessions.profile_id = auth.uid()
  ));

-- User Answers
CREATE POLICY "Users can CRUD own answers" 
  ON user_answers FOR ALL 
  USING (EXISTS (
    SELECT 1 FROM interview_questions
    JOIN interview_sessions ON interview_sessions.id = interview_questions.session_id
    WHERE interview_questions.id = user_answers.question_id
    AND interview_sessions.profile_id = auth.uid()
  ));

-- Evaluations
CREATE POLICY "Users can view evaluations of own answers" 
  ON evaluations FOR SELECT
  USING (EXISTS (
    SELECT 1 FROM user_answers
    JOIN interview_questions ON interview_questions.id = user_answers.question_id
    JOIN interview_sessions ON interview_sessions.id = interview_questions.session_id
    WHERE user_answers.id = evaluations.answer_id
    AND interview_sessions.profile_id = auth.uid()
  ));

-- Agent Logs
CREATE POLICY "Users can view logs from own sessions" 
  ON agent_logs FOR SELECT
  USING (EXISTS (
    SELECT 1 FROM interview_sessions
    WHERE interview_sessions.id = agent_logs.session_id
    AND interview_sessions.profile_id = auth.uid()
  ));

-- Anonymous sessions
CREATE POLICY "Anonymous sessions are accessible by token"
  ON anonymous_sessions FOR ALL USING (true);

-- Create function to update timestamps
CREATE OR REPLACE FUNCTION update_modified_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Add update triggers for all tables
CREATE TRIGGER update_profiles_modtime
BEFORE UPDATE ON profiles
FOR EACH ROW EXECUTE FUNCTION update_modified_column();

CREATE TRIGGER update_resumes_modtime
BEFORE UPDATE ON resumes
FOR EACH ROW EXECUTE FUNCTION update_modified_column();

CREATE TRIGGER update_job_postings_modtime
BEFORE UPDATE ON job_postings
FOR EACH ROW EXECUTE FUNCTION update_modified_column();

CREATE TRIGGER update_interview_sessions_modtime
BEFORE UPDATE ON interview_sessions
FOR EACH ROW EXECUTE FUNCTION update_modified_column();

CREATE TRIGGER update_anonymous_sessions_modtime
BEFORE UPDATE ON anonymous_sessions
FOR EACH ROW EXECUTE FUNCTION update_modified_column();

-- Public functions for profile management
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name, avatar_url, email, is_anonymous)
  VALUES (
    NEW.id, 
    NEW.raw_user_meta_data->>'full_name', 
    NEW.raw_user_meta_data->>'avatar_url', 
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'is_anonymous', 'false')::boolean
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Handle anonymous sign-ins
CREATE OR REPLACE FUNCTION public.handle_anonymous_signin()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.raw_user_meta_data->>'provider' = 'anonymous' THEN
    UPDATE public.profiles 
    SET is_anonymous = true
    WHERE id = NEW.id;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger for new user creation
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Trigger for anonymous sign-ins
CREATE TRIGGER on_auth_user_signin
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_anonymous_signin();

-- Function to clean up expired anonymous sessions
CREATE OR REPLACE FUNCTION public.cleanup_expired_anonymous_sessions()
RETURNS void AS $$
BEGIN
  DELETE FROM public.anonymous_sessions
  WHERE expires_at < now();
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Ensure anonymous auth is enabled in auth.config