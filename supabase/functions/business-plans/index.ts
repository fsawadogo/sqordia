import { createClient } from "npm:@supabase/supabase-js@2.39.7";

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

Deno.serve(async (req: Request) => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, {
      status: 200,
      headers: corsHeaders,
    });
  }

  try {
    const url = new URL(req.url);
    const path = url.pathname.split("/").pop();
    
    // Create Supabase client
    const supabaseUrl = Deno.env.get("SUPABASE_URL") || "";
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") || "";
    const supabase = createClient(supabaseUrl, supabaseKey);
    
    // Handle different endpoints
    if (path === "create") {
      // Create new business plan
      if (req.method !== "POST") {
        return new Response(
          JSON.stringify({ error: "Method not allowed" }),
          {
            status: 405,
            headers: { ...corsHeaders, "Content-Type": "application/json" },
          }
        );
      }

      const body = await req.json();
      const { userId, templateId, title, description } = body;
      
      if (!userId || !templateId || !title) {
        return new Response(
          JSON.stringify({ error: "Missing required fields" }),
          {
            status: 400,
            headers: { ...corsHeaders, "Content-Type": "application/json" },
          }
        );
      }
      
      const plan = await createBusinessPlan(supabase, userId, templateId, title, description);
      
      return new Response(
        JSON.stringify(plan),
        {
          status: 200,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    } else if (path === "sections") {
      // Get or update business plan sections
      if (req.method === "GET") {
        const planId = url.searchParams.get("planId");
        
        if (!planId) {
          return new Response(
            JSON.stringify({ error: "Business plan ID is required" }),
            {
              status: 400,
              headers: { ...corsHeaders, "Content-Type": "application/json" },
            }
          );
        }
        
        // Validate planId
        if (!isValidUuid(planId)) {
          return new Response(
            JSON.stringify({ error: "Invalid business plan ID format" }),
            {
              status: 400,
              headers: { ...corsHeaders, "Content-Type": "application/json" },
            }
          );
        }
        
        const sections = await getPlanSections(supabase, planId);
        
        return new Response(
          JSON.stringify(sections),
          {
            status: 200,
            headers: { ...corsHeaders, "Content-Type": "application/json" },
          }
        );
      } else if (req.method === "PUT") {
        const body = await req.json();
        const { sectionId, content } = body;
        
        if (!sectionId || content === undefined) {
          return new Response(
            JSON.stringify({ error: "Missing required fields" }),
            {
              status: 400,
              headers: { ...corsHeaders, "Content-Type": "application/json" },
            }
          );
        }
        
        // Validate sectionId
        if (!isValidUuid(sectionId)) {
          return new Response(
            JSON.stringify({ error: "Invalid section ID format" }),
            {
              status: 400,
              headers: { ...corsHeaders, "Content-Type": "application/json" },
            }
          );
        }
        
        const result = await updatePlanSection(supabase, sectionId, content);
        
        return new Response(
          JSON.stringify(result),
          {
            status: 200,
            headers: { ...corsHeaders, "Content-Type": "application/json" },
          }
        );
      } else {
        return new Response(
          JSON.stringify({ error: "Method not allowed" }),
          {
            status: 405,
            headers: { ...corsHeaders, "Content-Type": "application/json" },
          }
        );
      }
    } else if (path === "templates") {
      // Get business plan templates
      if (req.method !== "GET") {
        return new Response(
          JSON.stringify({ error: "Method not allowed" }),
          {
            status: 405,
            headers: { ...corsHeaders, "Content-Type": "application/json" },
          }
        );
      }
      
      const templates = await getTemplates(supabase);
      
      return new Response(
        JSON.stringify(templates),
        {
          status: 200,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    } else if (path === "questionnaire") {
      // Save questionnaire answers
      if (req.method !== "POST") {
        return new Response(
          JSON.stringify({ error: "Method not allowed" }),
          {
            status: 405,
            headers: { ...corsHeaders, "Content-Type": "application/json" },
          }
        );
      }
      
      const body = await req.json();
      const { businessPlanId, answers } = body;
      
      if (!businessPlanId || !answers) {
        return new Response(
          JSON.stringify({ error: "Missing required fields" }),
          {
            status: 400,
            headers: { ...corsHeaders, "Content-Type": "application/json" },
          }
        );
      }
      
      // Validate businessPlanId
      if (!isValidUuid(businessPlanId)) {
        return new Response(
          JSON.stringify({ error: "Invalid business plan ID format" }),
          {
            status: 400,
            headers: { ...corsHeaders, "Content-Type": "application/json" },
          }
        );
      }
      
      const result = await saveQuestionnaireAnswers(supabase, businessPlanId, answers);
      
      return new Response(
        JSON.stringify(result),
        {
          status: 200,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    } else if (path === "get") {
      // Get a specific business plan
      if (req.method !== "GET") {
        return new Response(
          JSON.stringify({ error: "Method not allowed" }),
          {
            status: 405,
            headers: { ...corsHeaders, "Content-Type": "application/json" },
          }
        );
      }
      
      const planId = url.searchParams.get("planId");
      
      if (!planId) {
        return new Response(
          JSON.stringify({ error: "Business plan ID is required" }),
          {
            status: 400,
            headers: { ...corsHeaders, "Content-Type": "application/json" },
          }
        );
      }
      
      // Validate planId
      if (!isValidUuid(planId)) {
        return new Response(
          JSON.stringify({ error: "Invalid business plan ID format" }),
          {
            status: 400,
            headers: { ...corsHeaders, "Content-Type": "application/json" },
          }
        );
      }
      
      const plan = await getBusinessPlan(supabase, planId);
      
      return new Response(
        JSON.stringify(plan),
        {
          status: 200,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    } else if (path === "delete") {
      // Delete a business plan
      if (req.method !== "DELETE") {
        return new Response(
          JSON.stringify({ error: "Method not allowed" }),
          {
            status: 405,
            headers: { ...corsHeaders, "Content-Type": "application/json" },
          }
        );
      }
      
      const planId = url.searchParams.get("planId");
      
      if (!planId) {
        return new Response(
          JSON.stringify({ error: "Business plan ID is required" }),
          {
            status: 400,
            headers: { ...corsHeaders, "Content-Type": "application/json" },
          }
        );
      }
      
      // Validate planId
      if (!isValidUuid(planId)) {
        return new Response(
          JSON.stringify({ error: "Invalid business plan ID format" }),
          {
            status: 400,
            headers: { ...corsHeaders, "Content-Type": "application/json" },
          }
        );
      }
      
      const result = await deleteBusinessPlan(supabase, planId);
      
      return new Response(
        JSON.stringify(result),
        {
          status: 200,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    } else {
      return new Response(
        JSON.stringify({ error: "Invalid endpoint" }),
        {
          status: 404,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }
  } catch (error) {
    console.error("Error processing request:", error);
    return new Response(
      JSON.stringify({ error: error.message || "Internal server error" }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});

// Create a new business plan
async function createBusinessPlan(supabase, userId, templateId, title, description = null) {
  try {
    // 1. Create business plan record
    const { data: planData, error: planError } = await supabase
      .from('business_plans')
      .insert([{ 
        user_id: userId,
        template_id: templateId,
        title,
        description
      }])
      .select('*')
      .single();
    
    if (planError) throw planError;
    
    // 2. Get template sections
    const { data: templateSections, error: sectionsError } = await supabase
      .from('template_sections')
      .select(`
        section_id,
        section_order
      `)
      .eq('template_id', templateId)
      .order('section_order');
    
    if (sectionsError) throw sectionsError;
    
    if (!templateSections || templateSections.length === 0) {
      throw new Error("Template has no sections");
    }
    
    // 3. Create plan sections
    const planSections = templateSections.map((section) => ({
      business_plan_id: planData.id,
      section_id: section.section_id,
      section_order: section.section_order
    }));
    
    const { error: createSectionsError } = await supabase
      .from('plan_sections')
      .insert(planSections);
    
    if (createSectionsError) throw createSectionsError;
    
    // 4. Log the creation activity
    await supabase
      .from('user_activities')
      .insert([{
        user_id: userId,
        business_plan_id: planData.id,
        activity_type: 'create',
        description: `Created new business plan: ${title}`
      }]);
    
    // 5. Return the business plan with progress information
    return {
      id: planData.id,
      title: planData.title,
      description: planData.description,
      createdAt: planData.created_at,
      updatedAt: planData.updated_at,
      templateId: planData.template_id,
      progress: 0, // New plan has 0% progress
      status: 'in_progress'
    };
  } catch (error) {
    console.error("Error creating business plan:", error);
    throw new Error(`Failed to create business plan: ${error.message}`);
  }
}

// Get plan sections
async function getPlanSections(supabase, planId) {
  try {
    // Get the plan sections with content
    const { data: sectionsData, error: sectionsError } = await supabase
      .from('plan_sections')
      .select(`
        id,
        section_id,
        content,
        section_order,
        sections:section_id (
          title,
          description,
          icon
        )
      `)
      .eq('business_plan_id', planId)
      .order('section_order');
    
    if (sectionsError) throw sectionsError;
    
    return sectionsData.map(section => ({
      id: section.id,
      sectionId: section.section_id,
      title: section.sections.title,
      description: section.sections.description,
      icon: section.sections.icon,
      content: section.content,
      order: section.section_order
    }));
  } catch (error) {
    console.error("Error getting plan sections:", error);
    throw new Error(`Failed to get plan sections: ${error.message}`);
  }
}

// Update plan section
async function updatePlanSection(supabase, sectionId, content) {
  try {
    // Update the section content
    const { error: updateError } = await supabase
      .from('plan_sections')
      .update({ 
        content,
        updated_at: new Date().toISOString()
      })
      .eq('id', sectionId);
    
    if (updateError) throw updateError;
    
    // Get the business plan id for this section
    const { data: sectionData, error: sectionError } = await supabase
      .from('plan_sections')
      .select('business_plan_id')
      .eq('id', sectionId)
      .single();
      
    if (sectionError) throw sectionError;
    
    // Update the business plan's updated_at timestamp
    await supabase
      .from('business_plans')
      .update({ updated_at: new Date().toISOString() })
      .eq('id', sectionData.business_plan_id);
      
    // Get the user ID from the business plan
    const { data: planData, error: planError } = await supabase
      .from('business_plans')
      .select('user_id, title')
      .eq('id', sectionData.business_plan_id)
      .single();
      
    if (planError) throw planError;
    
    // Log the activity
    await supabase
      .from('user_activities')
      .insert([{
        user_id: planData.user_id,
        business_plan_id: sectionData.business_plan_id,
        activity_type: 'edit',
        description: `Updated business plan: ${planData.title}`
      }]);
      
    return { updated: true };
  } catch (error) {
    console.error("Error updating plan section:", error);
    throw new Error(`Failed to update section: ${error.message}`);
  }
}

// Get templates
async function getTemplates(supabase) {
  try {
    // Get all templates
    const { data: templatesData, error: templatesError } = await supabase
      .from('templates')
      .select('*')
      .order('name');
    
    if (templatesError) throw templatesError;
    
    const templates = [];
    
    // For each template, get its sections
    for (const template of templatesData) {
      const { data: sectionData, error: sectionError } = await supabase
        .from('template_sections')
        .select(`
          section_order,
          sections:section_id (
            id,
            title,
            description,
            icon
          )
        `)
        .eq('template_id', template.id)
        .order('section_order');
      
      if (sectionError) throw sectionError;
      
      templates.push({
        id: template.id,
        name: template.name,
        description: template.description,
        icon: template.icon,
        sections: sectionData.map((item) => ({
          sectionId: item.sections.id,
          title: item.sections.title,
          description: item.sections.description,
          icon: item.sections.icon,
          order: item.section_order
        }))
      });
    }
    
    return templates;
  } catch (error) {
    console.error("Error getting templates:", error);
    throw new Error(`Failed to get templates: ${error.message}`);
  }
}

// Save questionnaire answers
async function saveQuestionnaireAnswers(supabase, businessPlanId, answers) {
  try {
    // Format answers for batch insert
    const answerEntries = Object.entries(answers).map(([questionId, answer]) => ({
      business_plan_id: businessPlanId,
      question_id: questionId,
      answer: typeof answer === 'string' ? answer : JSON.stringify(answer),
      updated_at: new Date().toISOString()
    }));
    
    // Upsert answers (insert or update)
    for (const entry of answerEntries) {
      // Check if answer already exists
      const { data: existingAnswer, error: checkError } = await supabase
        .from('question_answers')
        .select('id')
        .eq('business_plan_id', businessPlanId)
        .eq('question_id', entry.question_id)
        .maybeSingle();
        
      if (checkError) throw checkError;
      
      if (existingAnswer) {
        // Update existing answer
        const { error: updateError } = await supabase
          .from('question_answers')
          .update({ 
            answer: entry.answer,
            updated_at: entry.updated_at
          })
          .eq('id', existingAnswer.id);
          
        if (updateError) throw updateError;
      } else {
        // Insert new answer
        const { error: insertError } = await supabase
          .from('question_answers')
          .insert([entry]);
          
        if (insertError) throw insertError;
      }
    }
    
    // Update business plan's updated_at timestamp
    const { error: updatePlanError } = await supabase
      .from('business_plans')
      .update({ updated_at: new Date().toISOString() })
      .eq('id', businessPlanId);
      
    if (updatePlanError) throw updatePlanError;
    
    // Get user ID for activity log
    const { data: planData, error: planError } = await supabase
      .from('business_plans')
      .select('user_id, title')
      .eq('id', businessPlanId)
      .single();
      
    if (planError) throw planError;
    
    // Log the activity
    await supabase
      .from('user_activities')
      .insert([{
        user_id: planData.user_id,
        business_plan_id: businessPlanId,
        activity_type: 'questionnaire',
        description: `Updated questionnaire for business plan: ${planData.title}`
      }]);
    
    return { saved: true };
  } catch (error) {
    console.error("Error saving questionnaire answers:", error);
    throw new Error(`Failed to save questionnaire answers: ${error.message}`);
  }
}

// Get a specific business plan with sections
async function getBusinessPlan(supabase, planId) {
  try {
    // Get the business plan
    const { data: planData, error: planError } = await supabase
      .from('business_plans')
      .select(`
        id,
        title,
        description,
        template_id,
        user_id,
        created_at,
        updated_at,
        templates:template_id (
          name,
          description
        )
      `)
      .eq('id', planId)
      .single();
    
    if (planError) throw planError;
    
    // Get the plan sections with content
    const { data: sectionsData, error: sectionsError } = await supabase
      .from('plan_sections')
      .select(`
        id,
        section_id,
        content,
        section_order,
        sections:section_id (
          title,
          description,
          icon
        )
      `)
      .eq('business_plan_id', planId)
      .order('section_order');
    
    if (sectionsError) throw sectionsError;
    
    // Calculate progress
    const totalSections = sectionsData.length;
    const completedSections = sectionsData.filter(section => section.content).length;
    const progress = totalSections > 0 ? Math.round((completedSections / totalSections) * 100) : 0;
    
    // Get questionnaire answers
    const { data: answersData, error: answersError } = await supabase
      .from('question_answers')
      .select(`
        id,
        question_id,
        answer,
        updated_at
      `)
      .eq('business_plan_id', planId);
      
    if (answersError) throw answersError;
    
    // Format answers
    const answers = {};
    answersData.forEach(answer => {
      answers[answer.question_id] = answer.answer;
    });
    
    return {
      id: planData.id,
      title: planData.title,
      description: planData.description,
      templateId: planData.template_id,
      templateName: planData.templates?.name,
      userId: planData.user_id,
      createdAt: planData.created_at,
      updatedAt: planData.updated_at,
      progress,
      sections: sectionsData.map(section => ({
        id: section.id,
        sectionId: section.section_id,
        title: section.sections.title,
        description: section.sections.description,
        icon: section.sections.icon,
        content: section.content,
        order: section.section_order
      })),
      answers
    };
  } catch (error) {
    console.error("Error getting business plan:", error);
    throw new Error(`Failed to get business plan: ${error.message}`);
  }
}

// Delete a business plan
async function deleteBusinessPlan(supabase, planId) {
  try {
    // Check if the business plan exists
    const { data: plan, error: planError } = await supabase
      .from('business_plans')
      .select('user_id, title')
      .eq('id', planId)
      .single();
      
    if (planError) throw planError;
    
    // Delete will cascade to plan_sections, question_answers, and activities
    const { error } = await supabase
      .from('business_plans')
      .delete()
      .eq('id', planId);
    
    if (error) throw error;
    
    return { deleted: true };
  } catch (error) {
    console.error("Error deleting business plan:", error);
    throw new Error(`Failed to delete business plan: ${error.message}`);
  }
}