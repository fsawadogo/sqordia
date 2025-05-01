/*
  # Insert demo users and business plans

  This migration creates demo users and business plans for the application.
  Since we can't directly use ON CONFLICT with auth.users, we'll use 
  a different approach to safely insert users.
*/

-- Create a function to help insert demo data safely
CREATE OR REPLACE FUNCTION insert_demo_data() 
RETURNS void AS $$
DECLARE
  hoson_id UUID;
  jane_id UUID;
  marc_id UUID;
  faical_id UUID;
  giovanni_id UUID;
  email_exists BOOLEAN;
BEGIN
  -- For Hoson David
  SELECT EXISTS(SELECT 1 FROM auth.users WHERE email = 'dhoson19@gmail.com') INTO email_exists;
  IF NOT email_exists THEN
    -- Create user and get ID
    hoson_id := gen_random_uuid();
    INSERT INTO auth.users (id, email, raw_user_meta_data)
    VALUES (
      hoson_id,
      'dhoson19@gmail.com',
      jsonb_build_object(
        'first_name', 'Hoson',
        'last_name', 'David',
        'role', 'administrator'
      )
    );
    -- Update profile (created by trigger)
    UPDATE public.profiles
    SET 
      subscription_tier = 'enterprise',
      company = 'Sqordia Inc.',
      job_title = 'CEO',
      updated_at = now()
    WHERE id = hoson_id;
    
    -- Create business plans for Hoson David (3 plans)
    INSERT INTO public.business_plans (user_id, title, description, created_at, updated_at)
    VALUES
      (hoson_id, 'Tech Startup', 'AI-powered software startup business plan', now() - interval '20 days', now() - interval '2 days'),
      (hoson_id, 'E-commerce Platform', 'Online marketplace business strategy', now() - interval '15 days', now() - interval '1 day'),
      (hoson_id, 'Mobile App', 'Fitness tracking application business plan', now() - interval '10 days', now() - interval '3 days');
  ELSE
    SELECT id INTO hoson_id FROM auth.users WHERE email = 'dhoson19@gmail.com';
    -- Update existing profile
    UPDATE public.profiles
    SET 
      subscription_tier = 'enterprise',
      company = 'Sqordia Inc.',
      job_title = 'CEO',
      updated_at = now()
    WHERE id = hoson_id;
  END IF;
  
  -- For Jane Smith
  SELECT EXISTS(SELECT 1 FROM auth.users WHERE email = 'jane.smith@example.com') INTO email_exists;
  IF NOT email_exists THEN
    jane_id := gen_random_uuid();
    INSERT INTO auth.users (id, email, raw_user_meta_data)
    VALUES (
      jane_id,
      'jane.smith@example.com',
      jsonb_build_object(
        'first_name', 'Jane',
        'last_name', 'Smith',
        'role', 'user'
      )
    );
    -- Update profile
    UPDATE public.profiles
    SET 
      subscription_tier = 'professional',
      company = 'Smith Consulting',
      job_title = 'Consultant',
      updated_at = now()
    WHERE id = jane_id;
    
    -- Create business plan for Jane Smith
    INSERT INTO public.business_plans (user_id, title, description, created_at, updated_at)
    VALUES
      (jane_id, 'Consulting Agency', 'Business strategy consulting firm', now() - interval '18 days', now() - interval '4 days');
  ELSE
    SELECT id INTO jane_id FROM auth.users WHERE email = 'jane.smith@example.com';
    -- Update existing profile
    UPDATE public.profiles
    SET 
      subscription_tier = 'professional',
      company = 'Smith Consulting',
      job_title = 'Consultant',
      updated_at = now()
    WHERE id = jane_id;
  END IF;
  
  -- For Marc Larochelle
  SELECT EXISTS(SELECT 1 FROM auth.users WHERE email = 'tanskymanagement@gmail.com') INTO email_exists;
  IF NOT email_exists THEN
    marc_id := gen_random_uuid();
    INSERT INTO auth.users (id, email, raw_user_meta_data)
    VALUES (
      marc_id,
      'tanskymanagement@gmail.com',
      jsonb_build_object(
        'first_name', 'Marc',
        'last_name', 'Larochelle',
        'role', 'user'
      )
    );
    -- Update profile
    UPDATE public.profiles
    SET 
      subscription_tier = 'professional',
      company = 'Tansky Management',
      job_title = 'Director',
      updated_at = now()
    WHERE id = marc_id;
    
    -- Create business plans for Marc Larochelle
    INSERT INTO public.business_plans (user_id, title, description, created_at, updated_at)
    VALUES
      (marc_id, 'Property Management', 'Real estate property management business', now() - interval '16 days', now() - interval '5 days'),
      (marc_id, 'Investment Fund', 'Private equity investment fund', now() - interval '12 days', now() - interval '2 days');
  ELSE
    SELECT id INTO marc_id FROM auth.users WHERE email = 'tanskymanagement@gmail.com';
    -- Update existing profile
    UPDATE public.profiles
    SET 
      subscription_tier = 'professional',
      company = 'Tansky Management',
      job_title = 'Director',
      updated_at = now()
    WHERE id = marc_id;
  END IF;
  
  -- For Faïçal Sawadogo
  SELECT EXISTS(SELECT 1 FROM auth.users WHERE email = 'afaicals@gmail.com') INTO email_exists;
  IF NOT email_exists THEN
    faical_id := gen_random_uuid();
    INSERT INTO auth.users (id, email, raw_user_meta_data)
    VALUES (
      faical_id,
      'afaicals@gmail.com',
      jsonb_build_object(
        'first_name', 'Faïçal',
        'last_name', 'Sawadogo',
        'role', 'consultant'
      )
    );
    -- Update profile
    UPDATE public.profiles
    SET 
      subscription_tier = 'enterprise',
      company = 'Digital Consultancy',
      job_title = 'Lead Consultant',
      updated_at = now()
    WHERE id = faical_id;
    
    -- Create business plans for Faïçal Sawadogo
    INSERT INTO public.business_plans (user_id, title, description, created_at, updated_at)
    VALUES
      (faical_id, 'Digital Marketing', 'Full-service marketing agency', now() - interval '25 days', now() - interval '6 days'),
      (faical_id, 'Web Development', 'Custom software development firm', now() - interval '22 days', now() - interval '7 days'),
      (faical_id, 'IT Consulting', 'Information technology consulting', now() - interval '19 days', now() - interval '3 days'),
      (faical_id, 'Data Analytics', 'Business intelligence services', now() - interval '15 days', now() - interval '2 days'),
      (faical_id, 'Cloud Solutions', 'Cloud infrastructure services', now() - interval '10 days', now() - interval '1 day');
  ELSE
    SELECT id INTO faical_id FROM auth.users WHERE email = 'afaicals@gmail.com';
    -- Update existing profile
    UPDATE public.profiles
    SET 
      subscription_tier = 'enterprise',
      company = 'Digital Consultancy',
      job_title = 'Lead Consultant',
      updated_at = now()
    WHERE id = faical_id;
  END IF;
  
  -- For Giovanni Bengalis
  SELECT EXISTS(SELECT 1 FROM auth.users WHERE email = 'giovanni.bengalis@gmail.com') INTO email_exists;
  IF NOT email_exists THEN
    giovanni_id := gen_random_uuid();
    INSERT INTO auth.users (id, email, raw_user_meta_data)
    VALUES (
      giovanni_id,
      'giovanni.bengalis@gmail.com',
      jsonb_build_object(
        'first_name', 'Giovanni',
        'last_name', 'Bengalis',
        'role', 'user'
      )
    );
    -- Update profile
    UPDATE public.profiles
    SET 
      subscription_tier = 'free',
      company = 'Freelancer',
      job_title = 'Entrepreneur',
      updated_at = now()
    WHERE id = giovanni_id;
    
    -- No business plans for Giovanni (inactive user)
  ELSE
    SELECT id INTO giovanni_id FROM auth.users WHERE email = 'giovanni.bengalis@gmail.com';
    -- Update existing profile
    UPDATE public.profiles
    SET 
      subscription_tier = 'free',
      company = 'Freelancer',
      job_title = 'Entrepreneur',
      updated_at = now()
    WHERE id = giovanni_id;
  END IF;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Execute the function to insert demo data
SELECT insert_demo_data();

-- Clean up (remove the function since we don't need it anymore)
DROP FUNCTION insert_demo_data();