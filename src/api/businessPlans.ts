import { supabase } from '../lib/supabase';
import { v4 as uuidv4 } from 'uuid';

export interface BusinessPlan {
  id: string;
  title: string;
  description: string | null;
  templateId: string | null;
  userId: string;
  createdAt: string;
  updatedAt: string | null;
  progress: number;
}

export interface BusinessPlanDetail extends BusinessPlan {
  sections: {
    id: string;
    sectionId: string;
    title: string;
    description?: string | null;
    icon?: string | null;
    content: string | null;
    order: number;
  }[];
  answers?: Record<string, any>;
}

export interface BusinessPlanSection {
  id: string;
  businessPlanId: string;
  sectionId: string;
  content: string | null;
  order: number;
}

export interface Template {
  id: string;
  name: string;
  description: string | null;
  icon: string | null;
  sections: {
    sectionId: string;
    title: string;
    description: string | null;
    icon: string | null;
    order: number;
  }[];
}

export interface QuestionnaireSection {
  id: string;
  title: string;
  description: string | null;
  questions: Question[];
}

export interface Question {
  id: string;
  sectionId: string;
  question: string;
  type: 'text' | 'textarea' | 'select' | 'radio' | 'checkbox';
  required: boolean;
  placeholder?: string | null;
  options?: string[] | null;
}

// Helper function to validate UUID
const isValidUuid = (id: string): boolean => {
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
  return uuidRegex.test(id);
};

// Get all templates
export const getTemplates = async (): Promise<{ templates: Template[]; error: Error | null }> => {
  try {
    // Skip edge function call and use client-side implementation directly
    // Edge functions are failing with "Failed to fetch" errors
    
    const { data: templatesData, error: templatesError } = await supabase
      .from('templates')
      .select('*')
      .order('name');
    
    if (templatesError) throw templatesError;
    
    const templates: Template[] = [];
    
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
        sections: sectionData.map((item: any) => ({
          sectionId: item.sections.id,
          title: item.sections.title,
          description: item.sections.description,
          icon: item.sections.icon,
          order: item.section_order
        }))
      });
    }
    
    return { templates, error: null };
  } catch (error) {
    console.error('Error getting templates:', error);
    return { templates: [], error: error as Error };
  }
};

// Get all business plans for a user
export const getUserBusinessPlans = async (userId: string): Promise<{ plans: BusinessPlan[]; error: Error | null }> => {
  try {
    // Skip edge function call and use client-side implementation directly
    
    // Get all business plans
    const { data: plansData, error: plansError } = await supabase
      .from('business_plans')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });
    
    if (plansError) throw plansError;
    
    const plans: BusinessPlan[] = [];
    
    // Calculate progress for each plan
    for (const plan of plansData) {
      // Get total sections
      const { count: totalSections, error: totalError } = await supabase
        .from('plan_sections')
        .select('*', { count: 'exact', head: true })
        .eq('business_plan_id', plan.id);
        
      if (totalError) throw totalError;
      
      // Get completed sections
      const { count: completedSections, error: completedError } = await supabase
        .from('plan_sections')
        .select('*', { count: 'exact', head: true })
        .eq('business_plan_id', plan.id)
        .not('content', 'is', null);
      
      if (completedError) throw completedError;
      
      // Calculate progress
      const progress = totalSections > 0
        ? Math.round((completedSections / totalSections) * 100)
        : 0;
      
      plans.push({
        id: plan.id,
        title: plan.title,
        description: plan.description,
        templateId: plan.template_id,
        userId: plan.user_id,
        createdAt: plan.created_at,
        updatedAt: plan.updated_at,
        progress
      });
    }
    
    return { plans, error: null };
  } catch (error) {
    console.error('Error getting business plans:', error);
    return { plans: [], error: error as Error };
  }
};

// Get a specific business plan with its sections
export const getBusinessPlan = async (planId: string): Promise<{ plan: BusinessPlanDetail | null; error: Error | null }> => {
  try {
    // Skip edge function call and use client-side implementation directly
    
    // Validate planId to prevent invalid input syntax errors
    if (!planId || !isValidUuid(planId)) {
      throw new Error("Invalid business plan ID provided");
    }
  
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
        question_id,
        answer
      `)
      .eq('business_plan_id', planId);
      
    if (answersError) throw answersError;
    
    // Format answers
    const answers: Record<string, any> = {};
    answersData.forEach(item => {
      try {
        // Try to parse JSON answers
        const parsedAnswer = JSON.parse(item.answer);
        answers[item.question_id] = parsedAnswer;
      } catch (e) {
        // If not JSON, use raw answer
        answers[item.question_id] = item.answer;
      }
    });
    
    const plan: BusinessPlanDetail = {
      id: planData.id,
      title: planData.title,
      description: planData.description,
      templateId: planData.template_id,
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
    
    return { plan, error: null };
  } catch (error) {
    console.error('Error getting business plan:', error);
    return { plan: null, error: error as Error };
  }
};

// Create a new business plan from a template
export const createBusinessPlan = async (
  userId: string, 
  templateId: string, 
  title: string, 
  description?: string
): Promise<{ plan: BusinessPlan | null; error: Error | null }> => {
  try {
    // Skip edge function call and use client-side implementation directly
    
    // Start a transaction
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
    
    // Get template sections
    const { data: templateSections, error: sectionsError } = await supabase
      .from('template_sections')
      .select(`
        section_id,
        section_order
      `)
      .eq('template_id', templateId)
      .order('section_order');
    
    if (sectionsError) throw sectionsError;
    
    // Create plan sections
    const planSections = templateSections.map((section: any) => ({
      business_plan_id: planData.id,
      section_id: section.section_id,
      section_order: section.section_order
    }));
    
    const { error: createSectionsError } = await supabase
      .from('plan_sections')
      .insert(planSections);
    
    if (createSectionsError) throw createSectionsError;
    
    // Log the activity
    await supabase
      .from('user_activities')
      .insert([{
        user_id: userId,
        business_plan_id: planData.id,
        activity_type: 'create',
        description: `Created new business plan: ${title}`
      }]);
    
    const plan: BusinessPlan = {
      id: planData.id,
      title: planData.title,
      description: planData.description,
      templateId: planData.template_id,
      userId: planData.user_id,
      createdAt: planData.created_at,
      updatedAt: planData.updated_at,
      progress: 0 // New plan has 0% progress
    };
    
    return { plan, error: null };
  } catch (error) {
    console.error('Error creating business plan:', error);
    return { plan: null, error: error as Error };
  }
};

// Update a business plan section
export const updateBusinessPlanSection = async (
  planSectionId: string,
  content: string
): Promise<{ updated: boolean; error: Error | null }> => {
  try {
    // Validate planSectionId to prevent invalid input syntax errors
    if (!planSectionId || planSectionId === "undefined" || !isValidUuid(planSectionId)) {
      throw new Error("Invalid section ID provided");
    }
    
    // Skip edge function call and use client-side implementation directly
    
    // Update the section content
    const { error: updateError } = await supabase
      .from('plan_sections')
      .update({ 
        content,
        updated_at: new Date().toISOString()
      })
      .eq('id', planSectionId);
    
    if (updateError) throw updateError;
    
    // Get the business plan id for this section
    const { data: sectionData, error: sectionError } = await supabase
      .from('plan_sections')
      .select('business_plan_id')
      .eq('id', planSectionId)
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
        
    return { updated: true, error: null };
  } catch (error) {
    console.error('Error updating business plan section:', error);
    return { updated: false, error: error as Error };
  }
};

// Delete a business plan
export const deleteBusinessPlan = async (planId: string): Promise<{ deleted: boolean; error: Error | null }> => {
  try {
    // Validate planId to prevent invalid input syntax errors
    if (!planId || !isValidUuid(planId)) {
      throw new Error("Invalid business plan ID provided");
    }
    
    // Skip edge function call and use client-side implementation directly
    
    // Delete will cascade to plan_sections and question_answers
    const { error } = await supabase
      .from('business_plans')
      .delete()
      .eq('id', planId);
    
    if (error) throw error;
    
    return { deleted: true, error: null };
  } catch (error) {
    console.error('Error deleting business plan:', error);
    return { deleted: false, error: error as Error };
  }
};

// Save questionnaire answers
export const saveQuestionnaireAnswers = async (
  businessPlanId: string, 
  answers: Record<string, any>
): Promise<{ saved: boolean; error: Error | null }> => {
  try {
    // Validate businessPlanId to prevent invalid input syntax errors
    if (!businessPlanId || !isValidUuid(businessPlanId)) {
      throw new Error("Invalid business plan ID provided");
    }
    
    // Skip edge function call and use client-side implementation directly
    
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
      
    return { saved: true, error: null };
  } catch (error) {
    console.error('Error saving questionnaire answers:', error);
    return { saved: false, error: error as Error };
  }
};

// Get questionnaire sections and questions
export const getQuestionnaireSections = async (templateId: string): Promise<{ sections: QuestionnaireSection[]; error: Error | null }> => {
  try {
    // Get template sections
    const { data: templateSections, error: templateError } = await supabase
      .from('template_sections')
      .select(`
        sections:section_id (
          id,
          title,
          description
        ),
        section_order
      `)
      .eq('template_id', templateId)
      .order('section_order');
      
    if (templateError) throw templateError;
    
    // Get questions for each section
    const sections: QuestionnaireSection[] = [];
    
    for (const templateSection of templateSections) {
      const sectionId = templateSection.sections.id;
      
      // Get questions for this section
      const { data: questions, error: questionsError } = await supabase
        .from('questions')
        .select('*')
        .eq('section_id', sectionId)
        .order('id');
        
      if (questionsError) throw questionsError;
      
      // Format questions
      const formattedQuestions = questions.map(q => {
        let options = null;
        if (q.options) {
          try {
            options = JSON.parse(q.options);
          } catch (e) {
            console.error(`Failed to parse options for question ${q.id}:`, e);
          }
        }
        
        return {
          id: q.id,
          sectionId: q.section_id,
          question: q.question,
          type: q.type as 'text' | 'textarea' | 'select' | 'radio' | 'checkbox',
          required: q.required,
          placeholder: q.placeholder,
          options
        };
      });
      
      sections.push({
        id: templateSection.sections.id,
        title: templateSection.sections.title,
        description: templateSection.sections.description,
        questions: formattedQuestions
      });
    }
    
    return { sections, error: null };
  } catch (error) {
    console.error('Error getting questionnaire sections:', error);
    return { sections: [], error: error as Error };
  }
};