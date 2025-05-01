import { supabase } from '../lib/supabase';

export interface DashboardStats {
  totalPlans: number;
  completedPlans: number;
  aiGenerations: number;
  avgCompletion: number;
}

export interface BusinessPlan {
  id: string;
  title: string;
  description: string | null;
  createdAt: string;
  updatedAt: string | null;
  templateId: string | null;
  templateName: string | null;
  progress: number;
  status: 'in_progress' | 'completed';
}

export interface Activity {
  id: string;
  type: string;
  description: string;
  timestamp: string;
  businessPlan: string;
}

// Helper function to create a fetch request with timeout
const fetchWithTimeout = async (promise, timeoutMs = 2000) => {
  let timeoutId;
  const timeoutPromise = new Promise((_, reject) => {
    timeoutId = setTimeout(() => {
      reject(new Error('Request timed out'));
    }, timeoutMs);
  });

  try {
    const result = await Promise.race([promise, timeoutPromise]);
    clearTimeout(timeoutId);
    return result;
  } catch (error) {
    clearTimeout(timeoutId);
    throw error;
  }
};

// Get dashboard statistics
export const getDashboardStats = async (userId: string): Promise<DashboardStats> => {
  try {
    // Skip edge function call for now since they're consistently failing
    // Instead, directly use client-side calculation
    // Get total business plans
    const { count: totalPlans, error: plansError } = await supabase
      .from('business_plans')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', userId);
      
    if (plansError) throw plansError;
    
    // Get completed plans (100% progress)
    const { data: planSections, error: sectionsError } = await supabase
      .from('business_plans')
      .select(`
        id,
        plan_sections (
          id,
          content
        )
      `)
      .eq('user_id', userId);
      
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
      .from('user_activities')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', userId)
      .eq('activity_type', 'ai_generation');
      
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
    console.error('Error getting dashboard stats:', error);
    // Return default values in case of error
    return {
      totalPlans: 0,
      completedPlans: 0,
      aiGenerations: 0,
      avgCompletion: 0
    };
  }
};

// Get business plans
export const getBusinessPlans = async (userId: string): Promise<BusinessPlan[]> => {
  try {
    // Skip edge function call and use client-side calculation directly
    const { data: plans, error } = await supabase
      .from('business_plans')
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
      .eq('user_id', userId)
      .order('updated_at', { ascending: false });
      
    if (error) throw error;
    
    // Calculate progress for each plan
    const plansWithProgress: BusinessPlan[] = [];
    
    for (const plan of plans) {
      // Get total sections
      const { data: sections, error: sectionsError } = await supabase
        .from('plan_sections')
        .select(`
          id,
          content,
          section_id,
          sections:section_id (
            title
          )
        `)
        .eq('business_plan_id', plan.id);
        
      if (sectionsError) throw sectionsError;
      
      // Calculate progress
      const totalSections = sections.length;
      const completedSections = sections.filter(s => s.content !== null && s.content !== "").length;
      const progress = totalSections > 0 ? Math.round((completedSections / totalSections) * 100) : 0;
      
      plansWithProgress.push({
        id: plan.id,
        title: plan.title,
        description: plan.description,
        createdAt: plan.created_at,
        updatedAt: plan.updated_at,
        templateId: plan.template_id,
        templateName: plan.templates?.name || null,
        progress,
        status: progress === 100 ? 'completed' : 'in_progress'
      });
    }
    
    return plansWithProgress;
  } catch (error) {
    console.error('Error getting business plans:', error);
    // Return empty array instead of throwing error
    return [];
  }
};

// Get recent activities
export const getRecentActivities = async (userId: string): Promise<Activity[]> => {
  try {
    // Skip edge function call and use client-side calculation directly
    const { data, error } = await supabase
      .from('user_activities')
      .select(`
        id,
        activity_type,
        description,
        created_at,
        business_plans:business_plan_id (
          title
        )
      `)
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(10);
      
    if (error) throw error;
    
    return data.map(activity => ({
      id: activity.id,
      type: activity.activity_type,
      description: activity.description,
      timestamp: activity.created_at,
      businessPlan: activity.business_plans?.title || 'Unknown'
    }));
  } catch (error) {
    console.error('Error getting recent activities:', error);
    // Return empty array instead of throwing error
    return [];
  }
};