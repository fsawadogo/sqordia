import { supabase } from '../lib/supabase';

type AIGenerationParams = {
  businessPlanId: string;
  sectionId: string;
  userId: string;
  context?: string;
};

// Helper function to validate UUID
const isValidUuid = (id: string): boolean => {
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
  return uuidRegex.test(id);
};

/**
 * This is a mock implementation of AI content generation.
 * In a real application, this would connect to an AI service or API.
 */
export const generateAIContent = async (params: AIGenerationParams): Promise<{ content: string; error: Error | null }> => {
  try {
    const { businessPlanId, sectionId, userId, context } = params;
    
    // Validate IDs to prevent invalid input syntax errors
    if (!businessPlanId || !isValidUuid(businessPlanId)) {
      throw new Error("Invalid business plan ID provided");
    }
    
    if (!sectionId || !isValidUuid(sectionId)) {
      throw new Error("Invalid section ID provided");
    }
    
    // Get information about the business plan
    const { data: planData, error: planError } = await supabase
      .from('business_plans')
      .select(`
        title,
        template_id,
        templates:template_id (name)
      `)
      .eq('id', businessPlanId)
      .single();
    
    if (planError) throw planError;
    
    // Get the section information
    const { data: sectionData, error: sectionError } = await supabase
      .from('sections')
      .select('title')
      .eq('id', sectionId)
      .single();
    
    if (sectionError) throw sectionError;
    
    // Get questionnaire answers for this business plan
    const { data: answerData, error: answerError } = await supabase
      .from('question_answers')
      .select(`
        answer,
        questions:question_id (
          question
        )
      `)
      .eq('business_plan_id', businessPlanId);
    
    if (answerError) throw answerError;
    
    // In a real application, the answers and context would be sent to an AI service
    // For now, we're generating mock content based on the section
    
    // Log the AI generation activity
    await supabase
      .from('user_activities')
      .insert([{
        user_id: userId,
        business_plan_id: businessPlanId,
        activity_type: 'ai_generation',
        description: `Generated AI content for ${sectionData.title} in business plan: ${planData.title}`
      }]);
    
    // Return different mock content based on the section title
    const sectionTitle = sectionData.title;
    let content = '';
    
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 1500));
    
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
          <p><strong>Company Structure:</strong> We are structured as a ${answerData.find(a => a.questions.question.includes('type of business'))?.answer || 'Limited Liability Company (LLC)'}, providing the optimal balance of liability protection and operational flexibility.</p>
          <p><strong>Mission Statement:</strong> ${answerData.find(a => a.questions.question.includes('mission statement'))?.answer || 'To deliver exceptional value through innovative solutions that exceed customer expectations while maintaining the highest standards of integrity and service.'}</p>
          <p><strong>Vision Statement:</strong> ${answerData.find(a => a.questions.question.includes('vision statement'))?.answer || 'To become the industry leader recognized for innovation, quality, and customer satisfaction.'}</p>
          <p><strong>Company History:</strong> Though recently established, our founding team brings extensive industry experience and a track record of success in previous ventures.</p>`;
        break;
      case 'Products & Services':
        content = `<h2>Products & Services</h2>
          <p>${planData.title} offers a comprehensive suite of products and services designed to address specific customer needs in our target market.</p>
          <p><strong>Core Offering:</strong> ${answerData.find(a => a.questions.question.includes('main product or service'))?.answer || 'Our flagship product combines cutting-edge technology with intuitive design to solve key industry challenges.'}</p>
          <p><strong>Value Proposition:</strong> ${answerData.find(a => a.questions.question.includes('unique value proposition'))?.answer || 'Unlike competitors, our solution provides superior results with less complexity and at a lower total cost of ownership.'}</p>
          <p><strong>Pricing Strategy:</strong> We employ a ${answerData.find(a => a.questions.question.includes('pricing strategy'))?.answer || 'value-based pricing strategy'} that aligns with customer expectations while ensuring healthy margins.</p>
          <p><strong>Development Timeline:</strong> Our product is currently in the ${answerData.find(a => a.questions.question.includes('stage of development'))?.answer || 'beta/testing phase'} with full market release scheduled for Q4 of this year.</p>`;
        break;
      case 'Market Analysis':
        content = `<h2>Market Analysis</h2>
          <p>Our comprehensive market analysis reveals significant opportunities for ${planData.title} to establish and grow a strong market position.</p>
          <p><strong>Target Market:</strong> ${answerData.find(a => a.questions.question.includes('target customer'))?.answer || 'Our primary customers are mid-size businesses seeking efficient solutions to optimize their operations.'}</p>
          <p><strong>Market Size:</strong> We operate in a ${answerData.find(a => a.questions.question.includes('size of your target market'))?.answer || 'large market ($100M-$1B)'} with consistent annual growth of 7-10%.</p>
          <p><strong>Competitive Landscape:</strong> ${answerData.find(a => a.questions.question.includes('main competitors'))?.answer || 'The market includes several established players as well as emerging startups, creating a dynamic but fragmented competitive environment.'}</p>
          <p><strong>Market Trends:</strong> Key trends driving our market include increased digitization, growing demand for data-driven solutions, and rising customer expectations for personalized experiences.</p>
          <p><strong>Competitive Advantage:</strong> Our primary advantages include ${answerData.find(a => a.questions.question.includes('competitive advantage'))?.answer?.toString().replace(/[\[\]"]/g, '').replace(/,/g, ', ') || 'proprietary technology, superior customer service, and a more cost-effective solution compared to competitors'}.</p>`;
        break;
      case 'Business Strategy':
        content = `<h2>Business Strategy</h2>
          <p>The strategic plan for ${planData.title} is designed to establish market presence, build brand recognition, and achieve sustainable growth.</p>
          <p><strong>Mission:</strong> ${answerData.find(a => a.questions.question.includes('mission statement'))?.answer || 'To deliver exceptional value through innovative solutions that exceed customer expectations.'}</p>
          <p><strong>Vision:</strong> ${answerData.find(a => a.questions.question.includes('vision statement'))?.answer || 'To become the industry leader recognized for innovation, quality, and customer satisfaction.'}</p>
          <p><strong>Short-term Goals (1 Year):</strong> ${answerData.find(a => a.questions.question.includes('short-term goals'))?.answer || 'Launch flagship product, acquire initial 100 customers, establish brand presence in key markets, and achieve $500K in annual recurring revenue.'}</p>
          <p><strong>Long-term Goals (3-5 Years):</strong> ${answerData.find(a => a.questions.question.includes('long-term goals'))?.answer || 'Expand product offering, scale to 1,000+ customers, enter international markets, and achieve $5M in annual recurring revenue with sustainable profitability.'}</p>
          <p><strong>Growth Strategy:</strong> Our growth will be driven by a combination of direct sales, strategic partnerships, and targeted digital marketing campaigns. We'll initially focus on penetrating our core market segment before expanding to adjacent markets in years 2-3.</p>`;
        break;
      case 'Management & Team':
        content = `<h2>Management & Team</h2>
          <p>${planData.title} is led by an experienced team with complementary skills and a shared commitment to our mission and vision.</p>
          <p><strong>Leadership Structure:</strong> Our organization is led by a CEO with support from department heads in Product, Marketing, Sales, and Operations. This lean structure enables rapid decision-making while maintaining clear accountability.</p>
          <p><strong>Key Team Members:</strong></p>
          <ul>
            <li><strong>CEO/Founder:</strong> [Name] brings 15+ years of industry experience, previously served as [Position] at [Company].</li>
            <li><strong>CTO/Co-Founder:</strong> [Name] has led technical teams at [Companies] and holds patents in [Relevant Technology].</li>
            <li><strong>Head of Marketing:</strong> [Name] previously built marketing teams at [Companies] and specializes in B2B SaaS growth strategies.</li>
          </ul>
          <p><strong>Hiring Plan:</strong> Over the next 12 months, we plan to expand our team with key hires in product development, customer success, and sales to support our growth objectives.</p>
          <p><strong>Advisors:</strong> We've assembled an advisory board of industry experts who provide strategic guidance and expand our professional network.</p>`;
        break;
      case 'Financial Plan':
        content = `<h2>Financial Plan</h2>
          <p>Our financial projections demonstrate a clear path to profitability while supporting the growth initiatives outlined in this business plan.</p>
          <p><strong>Startup Costs:</strong> We estimate initial startup costs of ${answerData.find(a => a.questions.question.includes('startup costs'))?.answer || '$250,000'}, which includes product development, marketing, and operational expenses for the first six months.</p>
          <p><strong>Revenue Model:</strong> Our primary revenue stream is through ${answerData.find(a => a.questions.question.includes('revenue model'))?.answer || 'a subscription-based model'}, providing predictable recurring revenue that scales with our customer base.</p>
          <p><strong>Financial Projections:</strong></p>
          <table border="1" cellpadding="5">
            <tr><th></th><th>Year 1</th><th>Year 2</th><th>Year 3</th></tr>
            <tr><td>Revenue</td><td>$250,000</td><td>$1,200,000</td><td>$3,500,000</td></tr>
            <tr><td>Expenses</td><td>$600,000</td><td>$1,000,000</td><td>$2,100,000</td></tr>
            <tr><td>Net Income</td><td>-$350,000</td><td>$200,000</td><td>$1,400,000</td></tr>
          </table>
          <p><strong>Breakeven Projection:</strong> We expect to reach breakeven in ${answerData.find(a => a.questions.question.includes('break even'))?.answer || '18-24 months'}.</p>
          <p><strong>Funding Requirements:</strong> ${answerData.find(a => a.questions.question.includes('external funding'))?.answer || 'We are seeking $500,000 in seed investment to fund our first 18 months of operations, after which we expect to reach profitability.'}</p>
          <p><strong>Use of Funds:</strong> Investment capital will be allocated approximately as follows: 40% product development, 30% sales and marketing, 20% operations, 10% contingency reserve.</p>`;
        break;
      case 'Appendix':
        content = `<h2>Appendix</h2>
          <p>This appendix contains supporting documentation and additional details referenced throughout the business plan for ${planData.title}.</p>
          <p><strong>Included Documents:</strong></p>
          <ul>
            <li>Detailed financial projections (monthly for Year 1, quarterly for Years 2-3)</li>
            <li>Market research reports and data sources</li>
            <li>Competitive analysis matrix</li>
            <li>Product development roadmap</li>
            <li>Organizational chart</li>
            <li>Resumes of key team members</li>
            <li>Letters of intent from potential customers (if applicable)</li>
            <li>Legal documents and compliance information</li>
            <li>Patents and intellectual property information (if applicable)</li>
          </ul>
          <p><strong>Additional Resources:</strong></p>
          <ul>
            <li>Customer persona profiles</li>
            <li>Pricing model details</li>
            <li>Marketing materials and brand guidelines</li>
            <li>Technical specifications and architecture</li>
          </ul>`;
        break;
      default:
        content = `<h2>${sectionTitle}</h2><p>This section will contain information about ${sectionTitle.toLowerCase()} for your business plan. You can edit this AI-generated content or write your own.</p>`;
    }
    
    return { content, error: null };
  } catch (error) {
    console.error('Error generating AI content:', error);
    return { content: '', error: error as Error };
  }
};