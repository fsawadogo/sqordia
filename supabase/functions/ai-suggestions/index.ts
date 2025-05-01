// Follow Supabase Edge Functions format
import { createClient } from 'npm:@supabase/supabase-js@2.39.7';

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization",
};

// Helper function to validate UUID
const isValidUuid = (id: string): boolean => {
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
  return uuidRegex.test(id);
};

// Handle OPTIONS request for CORS
const handleOptions = () => {
  return new Response(null, {
    status: 204,
    headers: corsHeaders,
  });
};

// Create Supabase client with service role key - giving admin access within the function
const supabase = createClient(
  Deno.env.get('SUPABASE_URL') ?? '',
  Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
);

interface AIRequestPayload {
  businessPlanId: string;
  sectionId: string;
  userId: string;
  prompt?: string;
}

Deno.serve(async (req) => {
  // Handle CORS
  if (req.method === 'OPTIONS') {
    return handleOptions();
  }

  try {
    // Only allow POST requests
    if (req.method !== 'POST') {
      return new Response(JSON.stringify({ error: 'Method not allowed' }), {
        status: 405,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Get request payload
    const { businessPlanId, sectionId, userId, prompt }: AIRequestPayload = await req.json();

    // Validate required parameters
    if (!businessPlanId || !sectionId || !userId) {
      return new Response(JSON.stringify({ error: 'Missing required parameters' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }
    
    // Validate UUIDs
    if (!isValidUuid(businessPlanId)) {
      return new Response(JSON.stringify({ error: 'Invalid business plan ID format' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }
    
    if (!isValidUuid(sectionId)) {
      return new Response(JSON.stringify({ error: 'Invalid section ID format' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Verify the business plan exists and belongs to the user
    const { data: planData, error: planError } = await supabase
      .from('business_plans')
      .select(`
        title,
        template_id,
        templates:template_id (name)
      `)
      .eq('id', businessPlanId)
      .eq('user_id', userId)
      .single();

    if (planError || !planData) {
      return new Response(JSON.stringify({ error: 'Business plan not found or access denied' }), {
        status: 404,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Get the section information
    const { data: sectionData, error: sectionError } = await supabase
      .from('sections')
      .select('title, description')
      .eq('id', sectionId)
      .single();

    if (sectionError || !sectionData) {
      return new Response(JSON.stringify({ error: 'Section not found' }), {
        status: 404,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Get questionnaire answers for this business plan
    const { data: answerData, error: answerError } = await supabase
      .from('question_answers')
      .select(`
        answer,
        questions:question_id (
          question,
          type
        )
      `)
      .eq('business_plan_id', businessPlanId);

    if (answerError) {
      console.error('Error fetching answers:', answerError);
      // Continue even if we don't have answers
    }

    // MOCK AI CONTENT GENERATION
    // In a real implementation, we would call an AI API here
    // This is a placeholder implementation that returns different mock content based on section
    let content = '';
    const sectionTitle = sectionData.title;
    
    // Format answers for better context
    const formattedAnswers = answerData?.map(item => {
      let answer = item.answer;
      
      // Handle JSON answers for checkboxes
      if (item.questions.type === 'checkbox' && answer) {
        try {
          const parsed = JSON.parse(answer);
          if (Array.isArray(parsed)) {
            answer = parsed.join(', ');
          }
        } catch (e) {
          // Keep original answer if parsing fails
        }
      }
      
      return `${item.questions.question}: ${answer}`;
    }).join('\n') || 'No answers provided';

    // Log the AI action
    await supabase
      .from('user_activities')
      .insert([{
        user_id: userId,
        business_plan_id: businessPlanId,
        activity_type: 'ai_generation',
        description: `Generated AI content for ${sectionTitle} in business plan: ${planData.title}`
      }]);
      
    // Generate different content based on the section
    switch (sectionTitle) {
      case 'Executive Summary':
        content = `<h2>Executive Summary</h2>
          <p>${planData.title} is an innovative business focused on delivering exceptional value to customers. This business plan outlines our vision, mission, strategies, and financial projections for the next 5 years.</p>
          <p>Our team combines decades of industry experience with a passion for excellence, positioning us to capture significant market share in a growing industry. With a target market size exceeding $100M and an innovative approach to solving customer pain points, we project profitability within 18 months of operation.</p>
          <p>This plan details our go-to-market strategy, competitive analysis, operational plans, and financial projections that demonstrate our path to sustainable growth.</p>`;
        break;
      case 'Company Overview':
        content = `<h2>Company Overview</h2>
          <p>${planData.title} was founded in ${new Date().getFullYear()} with a mission to revolutionize the industry through innovative solutions and exceptional service.</p>
          <p><strong>Company Structure:</strong> We are structured as a Limited Liability Company (LLC), providing the optimal balance of liability protection and operational flexibility.</p>
          <p><strong>Mission Statement:</strong> To deliver exceptional value through innovative solutions that exceed customer expectations while maintaining the highest standards of integrity and service.</p>
          <p><strong>Vision Statement:</strong> To become the industry leader recognized for innovation, quality, and customer satisfaction.</p>
          <p><strong>Company History:</strong> Though recently established, our founding team brings extensive industry experience and a track record of success in previous ventures.</p>`;
        break;
      // Additional cases for other sections would be implemented here
      default:
        content = `<h2>${sectionTitle}</h2><p>This section will contain information about ${sectionTitle.toLowerCase()} for your business plan. You can edit this AI-generated content or write your own.</p>`;
    }

    // Delay to simulate AI processing time
    await new Promise(resolve => setTimeout(resolve, 1000));

    return new Response(JSON.stringify({ content }), {
      status: 200,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
    
  } catch (error) {
    console.error('Error in AI suggestions function:', error);
    return new Response(JSON.stringify({ error: 'Internal server error' }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});