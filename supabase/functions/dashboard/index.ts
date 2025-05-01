import { createClient } from "npm:@supabase/supabase-js@2.39.7";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization",
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
    
    // Get user ID from query parameter
    const userId = url.searchParams.get("userId");
    
    if (!userId) {
      return new Response(
        JSON.stringify({ error: "User ID is required" }),
        {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }
    
    // Handle different endpoints
    if (path === "stats") {
      // Get dashboard stats
      const stats = await getDashboardStats(supabase, userId);
      return new Response(
        JSON.stringify(stats),
        {
          status: 200,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    } else if (path === "plans") {
      // Get business plans
      const plans = await getBusinessPlans(supabase, userId);
      return new Response(
        JSON.stringify(plans),
        {
          status: 200,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    } else if (path === "activities") {
      // Get recent activities
      const activities = await getRecentActivities(supabase, userId);
      return new Response(
        JSON.stringify(activities),
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

// Get dashboard statistics
async function getDashboardStats(supabase, userId) {
  try {
    // Get total business plans
    const { count: totalPlans, error: plansError } = await supabase
      .from("business_plans")
      .select("*", { count: "exact", head: true })
      .eq("user_id", userId);
      
    if (plansError) throw plansError;
    
    // Get completed plans (100% progress)
    const { data: planSections, error: sectionsError } = await supabase
      .from("business_plans")
      .select(`
        id,
        plan_sections!inner (
          id,
          content
        )
      `)
      .eq("user_id", userId);
      
    if (sectionsError) throw sectionsError;
    
    // Calculate completed plans
    let completedPlans = 0;
    
    if (planSections && planSections.length > 0) {
      for (const plan of planSections) {
        const sections = plan.plan_sections;
        if (sections.length > 0) {
          const completedSections = sections.filter(s => s.content !== null && s.content !== "").length;
          if (completedSections === sections.length) {
            completedPlans++;
          }
        }
      }
    }
    
    // Get AI generations count
    const { count: aiGenerations, error: aiError } = await supabase
      .from("user_activities")
      .select("*", { count: "exact", head: true })
      .eq("user_id", userId)
      .eq("activity_type", "ai_generation");
      
    if (aiError) throw aiError;
    
    // Calculate average completion percentage
    let avgCompletion = 0;
    
    if (planSections && planSections.length > 0) {
      let totalPercentage = 0;
      
      for (const plan of planSections) {
        const sections = plan.plan_sections;
        if (sections.length > 0) {
          const completedSections = sections.filter(s => s.content !== null && s.content !== "").length;
          const percentage = (completedSections / sections.length) * 100;
          totalPercentage += percentage;
        }
      }
      
      avgCompletion = totalPercentage / planSections.length;
    }
    
    return {
      totalPlans: totalPlans || 0,
      completedPlans: completedPlans || 0,
      aiGenerations: aiGenerations || 0,
      avgCompletion: Math.round(avgCompletion) || 0
    };
  } catch (error) {
    console.error("Error getting dashboard stats:", error);
    throw new Error("Failed to get dashboard statistics");
  }
}

// Get business plans
async function getBusinessPlans(supabase, userId) {
  try {
    const { data: plans, error } = await supabase
      .from("business_plans")
      .select(`
        id,
        title,
        description,
        created_at,
        updated_at,
        template_id,
        templates:template_id (
          name,
          description
        )
      `)
      .eq("user_id", userId)
      .order("updated_at", { ascending: false });
      
    if (error) throw error;
    
    // Calculate progress for each plan
    const plansWithProgress = [];
    
    for (const plan of plans) {
      // Get total sections
      const { data: sections, error: sectionsError } = await supabase
        .from("plan_sections")
        .select(`
          id,
          content,
          section_id,
          sections:section_id (
            title
          )
        `)
        .eq("business_plan_id", plan.id);
        
      if (sectionsError) throw sectionsError;
      
      // Calculate progress
      const totalSections = sections.length;
      const completedSections = sections.filter(s => s.content !== null && s.content !== "").length;
      const progress = totalSections > 0 ? Math.round((completedSections / totalSections) * 100) : 0;
      
      plansWithProgress.push({
        ...plan,
        progress,
        status: progress === 100 ? "completed" : "in_progress"
      });
    }
    
    return plansWithProgress;
  } catch (error) {
    console.error("Error getting business plans:", error);
    throw new Error("Failed to get business plans");
  }
}

// Get recent activities
async function getRecentActivities(supabase, userId) {
  try {
    const { data, error } = await supabase
      .from("user_activities")
      .select(`
        id,
        activity_type,
        description,
        created_at,
        business_plans:business_plan_id (
          title
        )
      `)
      .eq("user_id", userId)
      .order("created_at", { ascending: false })
      .limit(10);
      
    if (error) throw error;
    
    return data.map(activity => ({
      id: activity.id,
      type: activity.activity_type,
      description: activity.description,
      timestamp: activity.created_at,
      businessPlan: activity.business_plans?.title || "Unknown"
    }));
  } catch (error) {
    console.error("Error getting recent activities:", error);
    throw new Error("Failed to get recent activities");
  }
}