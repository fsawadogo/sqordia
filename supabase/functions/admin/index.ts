import { createClient } from 'npm:@supabase/supabase-js@2.39.7';

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization",
};

// Create Supabase client with service role key (admin access)
const supabase = createClient(
  Deno.env.get('SUPABASE_URL') ?? '',
  Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
);

// Handle CORS preflight requests
function handleCors(req: Request) {
  if (req.method === 'OPTIONS') {
    return new Response(null, {
      status: 204,
      headers: corsHeaders
    });
  }
}

Deno.serve(async (req: Request) => {
  // Handle CORS
  const corsResponse = handleCors(req);
  if (corsResponse) return corsResponse;
  
  // Only allow GET requests
  if (req.method !== 'GET') {
    return new Response(JSON.stringify({ error: 'Method not allowed' }), {
      status: 405,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }
  
  try {
    // Get users from profiles table
    const { data: profiles, error: profilesError } = await supabase
      .from('profiles')
      .select(`
        id,
        email,
        first_name,
        last_name,
        role,
        subscription_tier,
        avatar_url,
        company,
        job_title,
        created_at,
        updated_at
      `)
      .order('created_at', { ascending: false });
    
    if (profilesError) throw profilesError;
    
    // Format users and get their business plan counts
    const formattedUsers = [];
    
    for (const profile of profiles) {
      // Count business plans for each user
      const { count: planCount, error: countError } = await supabase
        .from('business_plans')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', profile.id);
      
      if (countError) throw countError;
      
      // Get user's last activity timestamp
      const { data: lastActivity, error: activityError } = await supabase
        .from('user_activities')
        .select('created_at')
        .eq('user_id', profile.id)
        .order('created_at', { ascending: false })
        .limit(1)
        .maybeSingle();
      
      formattedUsers.push({
        id: profile.id,
        name: `${profile.first_name || ''} ${profile.last_name || ''}`.trim(),
        email: profile.email,
        role: profile.role,
        status: 'active', // Default to active, could be calculated based on activity
        plans: planCount || 0,
        lastLogin: lastActivity?.created_at || profile.created_at,
        subscription: profile.subscription_tier ? profile.subscription_tier.charAt(0).toUpperCase() + profile.subscription_tier.slice(1) : 'Free',
        company: profile.company,
        jobTitle: profile.job_title,
        avatarUrl: profile.avatar_url
      });
    }
    
    return new Response(JSON.stringify({ users: formattedUsers }), {
      status: 200,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  } catch (error) {
    console.error('Error fetching admin data:', error);
    
    return new Response(JSON.stringify({ 
      error: 'Error fetching admin data', 
      details: error.message 
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }
});