-- Sample templates
INSERT INTO public.templates (id, name, description, icon) 
VALUES
  ('00000000-0000-0000-0000-000000000001', 'Tech Startup', 'Perfect for software, SaaS, or tech product companies', 'computer'),
  ('00000000-0000-0000-0000-000000000002', 'Retail Business', 'For shops, boutiques, and retail stores', 'store'),
  ('00000000-0000-0000-0000-000000000003', 'Service Business', 'Ideal for consulting, professional services, agencies', 'business_center'),
  ('00000000-0000-0000-0000-000000000004', 'Restaurant', 'For restaurants, cafes, food trucks, or catering businesses', 'restaurant'),
  ('00000000-0000-0000-0000-000000000005', 'Non-Profit', 'Customized for charitable and non-profit organizations', 'volunteer_activism')
ON CONFLICT (id) DO NOTHING;

-- Sample sections
INSERT INTO public.sections (id, title, description, icon) 
VALUES
  ('00000000-0000-0000-0000-000000000001', 'Executive Summary', 'A brief overview of your business plan and its key points', 'summarize'),
  ('00000000-0000-0000-0000-000000000002', 'Company Overview', 'Description of your company, legal structure, and history', 'business'),
  ('00000000-0000-0000-0000-000000000003', 'Products & Services', 'Detailed information about what your company offers', 'inventory_2'),
  ('00000000-0000-0000-0000-000000000004', 'Market Analysis', 'Analysis of your industry, target market, and competitors', 'analytics'),
  ('00000000-0000-0000-0000-000000000005', 'Marketing & Sales Strategy', 'Your strategy to attract and retain customers', 'campaign'),
  ('00000000-0000-0000-0000-000000000006', 'Management & Organization', 'Your company structure and key team members', 'groups'),
  ('00000000-0000-0000-0000-000000000007', 'Financial Plan', 'Financial projections, funding requirements, and plans', 'attach_money'),
  ('00000000-0000-0000-0000-000000000008', 'Appendix', 'Additional supporting documents and information', 'attachment')
ON CONFLICT (id) DO NOTHING;

-- Template sections mapping (Tech Startup)
INSERT INTO public.template_sections (template_id, section_id, section_order) 
VALUES
  ('00000000-0000-0000-0000-000000000001', '00000000-0000-0000-0000-000000000001', 1),
  ('00000000-0000-0000-0000-000000000001', '00000000-0000-0000-0000-000000000002', 2),
  ('00000000-0000-0000-0000-000000000001', '00000000-0000-0000-0000-000000000003', 3),
  ('00000000-0000-0000-0000-000000000001', '00000000-0000-0000-0000-000000000004', 4),
  ('00000000-0000-0000-0000-000000000001', '00000000-0000-0000-0000-000000000005', 5),
  ('00000000-0000-0000-0000-000000000001', '00000000-0000-0000-0000-000000000006', 6),
  ('00000000-0000-0000-0000-000000000001', '00000000-0000-0000-0000-000000000007', 7),
  ('00000000-0000-0000-0000-000000000001', '00000000-0000-0000-0000-000000000008', 8)
ON CONFLICT (template_id, section_id) DO NOTHING;

-- Template sections mapping (Retail Business)
INSERT INTO public.template_sections (template_id, section_id, section_order) 
VALUES
  ('00000000-0000-0000-0000-000000000002', '00000000-0000-0000-0000-000000000001', 1),
  ('00000000-0000-0000-0000-000000000002', '00000000-0000-0000-0000-000000000002', 2),
  ('00000000-0000-0000-0000-000000000002', '00000000-0000-0000-0000-000000000003', 3),
  ('00000000-0000-0000-0000-000000000002', '00000000-0000-0000-0000-000000000004', 4),
  ('00000000-0000-0000-0000-000000000002', '00000000-0000-0000-0000-000000000005', 5),
  ('00000000-0000-0000-0000-000000000002', '00000000-0000-0000-0000-000000000006', 6),
  ('00000000-0000-0000-0000-000000000002', '00000000-0000-0000-0000-000000000007', 7)
ON CONFLICT (template_id, section_id) DO NOTHING;

-- Sample questionnaire questions (Business Basics)
INSERT INTO public.questions (section_id, question, type, required, placeholder, options) 
VALUES
  ('00000000-0000-0000-0000-000000000002', 'What is the name of your business?', 'text', true, 'e.g., Acme Corporation', NULL),
  ('00000000-0000-0000-0000-000000000002', 'What is your business tagline or slogan?', 'text', false, 'e.g., Innovation for a better tomorrow', NULL),
  ('00000000-0000-0000-0000-000000000002', 'What type of business are you creating?', 'select', true, NULL, '["Sole Proprietorship", "Partnership", "Limited Liability Company (LLC)", "Corporation", "S Corporation", "Non-profit"]'),
  ('00000000-0000-0000-0000-000000000002', 'What stage is your business in?', 'radio', true, NULL, '["Idea/Concept", "Startup (0-2 years)", "Growth (2-5 years)", "Established (5+ years)"]')
ON CONFLICT (id) DO NOTHING;

-- Sample questionnaire questions (Products & Services)
INSERT INTO public.questions (section_id, question, type, required, placeholder, options) 
VALUES
  ('00000000-0000-0000-0000-000000000003', 'Describe your main product or service in detail.', 'textarea', true, 'Provide a comprehensive description of what you sell or offer', NULL),
  ('00000000-0000-0000-0000-000000000003', 'What is your unique value proposition? What makes your offering different?', 'textarea', true, 'Explain what sets you apart from competitors', NULL),
  ('00000000-0000-0000-0000-000000000003', 'What is your pricing strategy?', 'select', true, NULL, '["Premium/Luxury", "Mid-market", "Budget/Economy", "Freemium", "Subscription-based", "Value-based", "Cost-plus", "Other"]'),
  ('00000000-0000-0000-0000-000000000003', 'What stage of development is your product/service in?', 'radio', true, NULL, '["Concept/Idea", "Prototype/MVP", "Beta/Testing", "Launched/Available", "Established with iterative improvements"]')
ON CONFLICT (id) DO NOTHING;

-- Sample questionnaire questions (Market Analysis)
INSERT INTO public.questions (section_id, question, type, required, placeholder, options) 
VALUES
  ('00000000-0000-0000-0000-000000000004', 'Who is your target customer or audience?', 'textarea', true, 'Describe your ideal customer in detail (demographics, behaviors, needs)', NULL),
  ('00000000-0000-0000-0000-000000000004', 'What is the size of your target market?', 'select', true, NULL, '["Small niche market (Under $10M)", "Medium market ($10M-$100M)", "Large market ($100M-$1B)", "Massive market (Over $1B)"]'),
  ('00000000-0000-0000-0000-000000000004', 'Who are your main competitors?', 'textarea', true, 'List your top competitors and briefly describe them', NULL),
  ('00000000-0000-0000-0000-000000000004', 'What is your competitive advantage?', 'checkbox', true, NULL, '["Proprietary technology", "Unique features", "Lower price", "Better quality", "Superior customer service", "Stronger brand", "Better location", "Exclusive partnerships", "Other"]')
ON CONFLICT (id) DO NOTHING;

-- Sample questionnaire questions (Marketing & Sales)
INSERT INTO public.questions (section_id, question, type, required, placeholder, options) 
VALUES
  ('00000000-0000-0000-0000-000000000005', 'What marketing channels will you use to reach customers?', 'checkbox', true, NULL, '["Social media", "Content marketing/SEO", "Email marketing", "Paid advertising", "PR/Media", "Referrals/Word of mouth", "Events/Trade shows", "Direct sales", "Partner marketing"]'),
  ('00000000-0000-0000-0000-000000000005', 'Describe your sales process.', 'textarea', true, 'How will you convert prospects into customers?', NULL),
  ('00000000-0000-0000-0000-000000000005', 'How will you retain customers and encourage repeat business?', 'textarea', true, 'Describe your customer retention strategies', NULL)
ON CONFLICT (id) DO NOTHING;

-- Sample questionnaire questions (Financial Plan)
INSERT INTO public.questions (section_id, question, type, required, placeholder, options) 
VALUES
  ('00000000-0000-0000-0000-000000000007', 'What are your estimated startup costs?', 'text', true, 'e.g., $50,000', NULL),
  ('00000000-0000-0000-0000-000000000007', 'What is your revenue model?', 'select', true, NULL, '["Direct sales", "Subscription", "Freemium", "Licensing", "Advertising", "Affiliate marketing", "Marketplace/Commission", "Mixed model", "Other"]'),
  ('00000000-0000-0000-0000-000000000007', 'When do you expect to break even?', 'select', true, NULL, '["Less than 6 months", "6-12 months", "12-18 months", "18-24 months", "2-3 years", "3-5 years", "More than 5 years"]'),
  ('00000000-0000-0000-0000-000000000007', 'Do you need external funding?', 'radio', true, NULL, '["No, self-funded/bootstrapped", "Yes, seeking seed/angel investment", "Yes, seeking venture capital", "Yes, seeking bank loans", "Yes, seeking government grants", "Yes, crowdfunding", "Other"]')
ON CONFLICT (id) DO NOTHING;

-- Create some sample data for activities if not exists
DO $$ 
DECLARE
  user_ids UUID[];
  plan_ids UUID[];
  current_user_id UUID;
  current_plan_id UUID;
  i INT;
BEGIN
  -- Get user IDs from profiles
  SELECT array_agg(id) INTO user_ids FROM profiles LIMIT 5;
  
  -- Only proceed if we have users
  IF array_length(user_ids, 1) > 0 THEN
    -- For each user
    FOREACH current_user_id IN ARRAY user_ids
    LOOP
      -- Get business plan IDs for this user
      SELECT array_agg(id) INTO plan_ids FROM business_plans WHERE business_plans.user_id = current_user_id;
      
      -- Only proceed if user has plans
      IF plan_ids IS NOT NULL AND array_length(plan_ids, 1) > 0 THEN
        -- For each plan, create some sample activities
        FOREACH current_plan_id IN ARRAY plan_ids
        LOOP
          -- Create a few activities with different types
          FOR i IN 1..5 LOOP
            -- Skip if we already have activities for this user and plan
            IF NOT EXISTS (
              SELECT 1 FROM user_activities 
              WHERE user_activities.user_id = current_user_id AND user_activities.business_plan_id = current_plan_id
              LIMIT 1
            ) THEN
              INSERT INTO user_activities (
                user_id, 
                business_plan_id, 
                activity_type, 
                description,
                created_at
              )
              VALUES
                (
                  current_user_id,
                  current_plan_id,
                  CASE 
                    WHEN i = 1 THEN 'create'
                    WHEN i = 2 THEN 'edit'
                    WHEN i = 3 THEN 'ai_generation'
                    WHEN i = 4 THEN 'questionnaire'
                    ELSE 'export'
                  END,
                  CASE 
                    WHEN i = 1 THEN 'Created business plan'
                    WHEN i = 2 THEN 'Updated business plan content'
                    WHEN i = 3 THEN 'Generated content with AI'
                    WHEN i = 4 THEN 'Completed questionnaire sections'
                    ELSE 'Exported business plan as PDF'
                  END,
                  now() - (i || ' days')::interval
                );
            END IF;
          END LOOP;
        END LOOP;
      END IF;
    END LOOP;
  END IF;
END $$;