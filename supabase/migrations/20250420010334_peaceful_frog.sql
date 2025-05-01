-- Create profiles table that extends the built-in auth.users table
CREATE TABLE IF NOT EXISTS profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL UNIQUE,
  first_name TEXT,
  last_name TEXT,
  avatar_url TEXT,
  role TEXT CHECK (role IN ('user', 'consultant', 'obnl', 'administrator')),
  subscription_tier TEXT DEFAULT 'free',
  company TEXT,
  job_title TEXT,
  phone TEXT,
  bio TEXT,
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL,
  updated_at TIMESTAMPTZ
);

-- Templates for business plans
CREATE TABLE IF NOT EXISTS templates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  description TEXT,
  icon TEXT,
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

-- Sections that can be included in business plans
CREATE TABLE IF NOT EXISTS sections (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  description TEXT,
  icon TEXT,
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

-- Mapping of sections to templates
CREATE TABLE IF NOT EXISTS template_sections (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  template_id UUID NOT NULL REFERENCES templates(id) ON DELETE CASCADE,
  section_id UUID NOT NULL REFERENCES sections(id) ON DELETE CASCADE,
  section_order INT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL,
  UNIQUE (template_id, section_id)
);

-- Business plans created by users
CREATE TABLE IF NOT EXISTS business_plans (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  template_id UUID REFERENCES templates(id),
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL,
  updated_at TIMESTAMPTZ
);

-- Content of business plan sections
CREATE TABLE IF NOT EXISTS plan_sections (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  business_plan_id UUID NOT NULL REFERENCES business_plans(id) ON DELETE CASCADE,
  section_id UUID NOT NULL REFERENCES sections(id) ON DELETE CASCADE,
  content TEXT,
  section_order INT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL,
  updated_at TIMESTAMPTZ,
  UNIQUE (business_plan_id, section_id)
);

-- Questions for business plan questionnaire
CREATE TABLE IF NOT EXISTS questions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  section_id UUID NOT NULL REFERENCES sections(id) ON DELETE CASCADE,
  question TEXT NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('text', 'textarea', 'select', 'radio', 'checkbox')),
  required BOOLEAN DEFAULT true,
  placeholder TEXT,
  options JSONB,
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

-- User responses to questionnaire questions
CREATE TABLE IF NOT EXISTS question_answers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  business_plan_id UUID NOT NULL REFERENCES business_plans(id) ON DELETE CASCADE,
  question_id UUID NOT NULL REFERENCES questions(id) ON DELETE CASCADE,
  answer TEXT,
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL,
  updated_at TIMESTAMPTZ,
  UNIQUE (business_plan_id, question_id)
);

-- User activities for action history
CREATE TABLE IF NOT EXISTS user_activities (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  business_plan_id UUID REFERENCES business_plans(id) ON DELETE CASCADE,
  activity_type TEXT NOT NULL CHECK (activity_type IN ('create', 'edit', 'ai_generation', 'questionnaire', 'export', 'share')),
  description TEXT,
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

-- Set up Row Level Security (RLS)
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE sections ENABLE ROW LEVEL SECURITY;
ALTER TABLE template_sections ENABLE ROW LEVEL SECURITY;
ALTER TABLE business_plans ENABLE ROW LEVEL SECURITY;
ALTER TABLE plan_sections ENABLE ROW LEVEL SECURITY;
ALTER TABLE questions ENABLE ROW LEVEL SECURITY;
ALTER TABLE question_answers ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_activities ENABLE ROW LEVEL SECURITY;

-- Create row security policies
-- Profiles policies
CREATE POLICY "Users can view their own profile"
  ON profiles FOR SELECT
  TO authenticated
  USING (auth.uid() = id);

CREATE POLICY "Users can update their own profile"
  ON profiles FOR UPDATE
  TO authenticated
  USING (auth.uid() = id);

-- Templates policies (readable by all users)
CREATE POLICY "Templates are viewable by all authenticated users"
  ON templates FOR SELECT
  TO authenticated
  USING (true);

-- Sections policies (readable by all users)
CREATE POLICY "Sections are viewable by all authenticated users"
  ON sections FOR SELECT
  TO authenticated
  USING (true);

-- Template sections (readable by all users)
CREATE POLICY "Template sections are viewable by all authenticated users"
  ON template_sections FOR SELECT
  TO authenticated
  USING (true);

-- Business plans policies
CREATE POLICY "Users can create their own business plans"
  ON business_plans FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can view their own business plans"
  ON business_plans FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own business plans"
  ON business_plans FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own business plans"
  ON business_plans FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- Plan sections policies
CREATE POLICY "Users can insert sections to their own business plans"
  ON plan_sections FOR INSERT
  TO authenticated
  WITH CHECK (
    auth.uid() = (SELECT user_id FROM business_plans WHERE id = business_plan_id)
  );

CREATE POLICY "Users can view sections of their own business plans"
  ON plan_sections FOR SELECT
  TO authenticated
  USING (
    auth.uid() = (SELECT user_id FROM business_plans WHERE id = business_plan_id)
  );

CREATE POLICY "Users can update sections of their own business plans"
  ON plan_sections FOR UPDATE
  TO authenticated
  USING (
    auth.uid() = (SELECT user_id FROM business_plans WHERE id = business_plan_id)
  );

CREATE POLICY "Users can delete sections from their own business plans"
  ON plan_sections FOR DELETE
  TO authenticated
  USING (
    auth.uid() = (SELECT user_id FROM business_plans WHERE id = business_plan_id)
  );

-- Questions policies (viewable by all authenticated users)
CREATE POLICY "Questions are viewable by all authenticated users"
  ON questions FOR SELECT
  TO authenticated
  USING (true);

-- Question answers policies
CREATE POLICY "Users can insert answers to their own business plans"
  ON question_answers FOR INSERT
  TO authenticated
  WITH CHECK (
    auth.uid() = (SELECT user_id FROM business_plans WHERE id = business_plan_id)
  );

CREATE POLICY "Users can view answers to their own business plans"
  ON question_answers FOR SELECT
  TO authenticated
  USING (
    auth.uid() = (SELECT user_id FROM business_plans WHERE id = business_plan_id)
  );

CREATE POLICY "Users can update answers to their own business plans"
  ON question_answers FOR UPDATE
  TO authenticated
  USING (
    auth.uid() = (SELECT user_id FROM business_plans WHERE id = business_plan_id)
  );

-- User activities policies
CREATE POLICY "Users can view their own activities"
  ON user_activities FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own activities"
  ON user_activities FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

-- Create function to handle user creation
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.profiles (id, email, first_name, last_name, role, subscription_tier)
  VALUES (
    NEW.id, 
    NEW.email, 
    NEW.raw_user_meta_data->>'first_name', 
    NEW.raw_user_meta_data->>'last_name', 
    COALESCE(NEW.raw_user_meta_data->>'role', 'user'),
    'free'
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to create profile after user signup
CREATE OR REPLACE TRIGGER on_auth_user_created
AFTER INSERT ON auth.users
FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Create function to update profile when user details change
CREATE OR REPLACE FUNCTION public.handle_user_update()
RETURNS trigger AS $$
BEGIN
  UPDATE public.profiles
  SET 
    email = NEW.email,
    updated_at = now()
  WHERE id = NEW.id;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to update profile when user updates in auth.users
CREATE OR REPLACE TRIGGER on_auth_user_updated
AFTER UPDATE ON auth.users
FOR EACH ROW EXECUTE FUNCTION public.handle_user_update();

-- Index for performance
CREATE INDEX IF NOT EXISTS idx_business_plans_user_id ON business_plans(user_id);
CREATE INDEX IF NOT EXISTS idx_plan_sections_business_plan_id ON plan_sections(business_plan_id);
CREATE INDEX IF NOT EXISTS idx_question_answers_business_plan_id ON question_answers(business_plan_id);
CREATE INDEX IF NOT EXISTS idx_user_activities_user_id ON user_activities(user_id);