import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { 
  getTemplates, 
  getUserBusinessPlans, 
  getBusinessPlan, 
  createBusinessPlan, 
  updateBusinessPlanSection,
  saveQuestionnaireAnswers,
  generateAIContent,
  BusinessPlan,
  BusinessPlanDetail,
  Template
} from '../../api';

interface BusinessPlanState {
  plans: BusinessPlan[];
  currentPlan: BusinessPlanDetail | null;
  templates: Template[];
  loading: {
    plans: boolean;
    templates: boolean;
    currentPlan: boolean;
    save: boolean;
    ai: boolean;
  };
  error: {
    plans: string | null;
    templates: string | null;
    currentPlan: string | null;
    save: string | null;
    ai: string | null;
  };
  autoSaveStatus: 'idle' | 'saving' | 'saved' | 'error';
}

const initialState: BusinessPlanState = {
  plans: [],
  currentPlan: null,
  templates: [],
  loading: {
    plans: false,
    templates: false,
    currentPlan: false,
    save: false,
    ai: false
  },
  error: {
    plans: null,
    templates: null,
    currentPlan: null,
    save: null,
    ai: null
  },
  autoSaveStatus: 'idle',
};

// Async thunks
export const fetchTemplates = createAsyncThunk(
  'businessPlan/fetchTemplates',
  async (_, { rejectWithValue }) => {
    try {
      const { templates, error } = await getTemplates();
      if (error) throw error;
      return templates;
    } catch (error) {
      if (error instanceof Error) {
        return rejectWithValue(error.message);
      }
      return rejectWithValue('An unexpected error occurred');
    }
  }
);

export const fetchUserBusinessPlans = createAsyncThunk(
  'businessPlan/fetchUserBusinessPlans',
  async (userId: string, { rejectWithValue }) => {
    try {
      const { plans, error } = await getUserBusinessPlans(userId);
      if (error) throw error;
      return plans;
    } catch (error) {
      if (error instanceof Error) {
        return rejectWithValue(error.message);
      }
      return rejectWithValue('An unexpected error occurred');
    }
  }
);

export const fetchBusinessPlanById = createAsyncThunk(
  'businessPlan/fetchBusinessPlanById',
  async (planId: string, { rejectWithValue }) => {
    try {
      const { plan, error } = await getBusinessPlan(planId);
      if (error) throw error;
      if (!plan) throw new Error('Business plan not found');
      return plan;
    } catch (error) {
      if (error instanceof Error) {
        return rejectWithValue(error.message);
      }
      return rejectWithValue('An unexpected error occurred');
    }
  }
);

export const createNewBusinessPlan = createAsyncThunk(
  'businessPlan/createNewBusinessPlan',
  async ({ 
    userId, 
    templateId, 
    title, 
    description 
  }: { 
    userId: string; 
    templateId: string; 
    title: string; 
    description?: string 
  }, { rejectWithValue }) => {
    try {
      const { plan, error } = await createBusinessPlan(userId, templateId, title, description);
      if (error) throw error;
      if (!plan) throw new Error('Failed to create business plan');
      return plan;
    } catch (error) {
      if (error instanceof Error) {
        return rejectWithValue(error.message);
      }
      return rejectWithValue('An unexpected error occurred');
    }
  }
);

export const updateSectionContent = createAsyncThunk(
  'businessPlan/updateSectionContent',
  async ({ 
    planSectionId, 
    content 
  }: { 
    planSectionId: string; 
    content: string 
  }, { rejectWithValue }) => {
    try {
      const { updated, error } = await updateBusinessPlanSection(planSectionId, content);
      if (error) throw error;
      if (!updated) throw new Error('Failed to update section');
      return { planSectionId, content };
    } catch (error) {
      if (error instanceof Error) {
        return rejectWithValue(error.message);
      }
      return rejectWithValue('An unexpected error occurred');
    }
  }
);

export const saveAnswers = createAsyncThunk(
  'businessPlan/saveAnswers',
  async ({ 
    businessPlanId, 
    answers 
  }: { 
    businessPlanId: string; 
    answers: Record<string, any> 
  }, { rejectWithValue }) => {
    try {
      const { saved, error } = await saveQuestionnaireAnswers(businessPlanId, answers);
      if (error) throw error;
      if (!saved) throw new Error('Failed to save answers');
      return answers;
    } catch (error) {
      if (error instanceof Error) {
        return rejectWithValue(error.message);
      }
      return rejectWithValue('An unexpected error occurred');
    }
  }
);

export const generateContent = createAsyncThunk(
  'businessPlan/generateContent',
  async ({ 
    businessPlanId, 
    sectionId, 
    userId,
    context 
  }: { 
    businessPlanId: string; 
    sectionId: string;
    userId: string;
    context?: string;
  }, { rejectWithValue }) => {
    try {
      const { content, error } = await generateAIContent({
        businessPlanId,
        sectionId,
        userId,
        context
      });
      
      if (error) throw error;
      if (!content) throw new Error('Failed to generate content');
      
      return { sectionId, content };
    } catch (error) {
      if (error instanceof Error) {
        return rejectWithValue(error.message);
      }
      return rejectWithValue('An unexpected error occurred');
    }
  }
);

const businessPlanSlice = createSlice({
  name: 'businessPlan',
  initialState,
  reducers: {
    updateQuestionAnswer: (state, action: PayloadAction<{ 
      sectionId: string; 
      questionId: string; 
      answer: string 
    }>) => {
      state.autoSaveStatus = 'saving';
      // Note: This doesn't do anything yet, because we need the full plan structure
    },
    autoSaveDone: (state) => {
      state.autoSaveStatus = 'saved';
    },
    autoSaveError: (state) => {
      state.autoSaveStatus = 'error';
    },
    clearCurrentPlan: (state) => {
      state.currentPlan = null;
    },
    // This would normally be an async action, but here it's local for demo
    setLocalPlanContent: (state, action: PayloadAction<{ sectionId: string; content: string }>) => {
      if (state.currentPlan) {
        const sectionIndex = state.currentPlan.sections.findIndex(
          section => section.sectionId === action.payload.sectionId
        );
        
        if (sectionIndex !== -1) {
          state.currentPlan.sections[sectionIndex].content = action.payload.content;
          state.currentPlan.updatedAt = new Date().toISOString();
        }
      }
    }
  },
  extraReducers: (builder) => {
    builder
      // Fetch templates
      .addCase(fetchTemplates.pending, (state) => {
        state.loading.templates = true;
        state.error.templates = null;
      })
      .addCase(fetchTemplates.fulfilled, (state, action) => {
        state.loading.templates = false;
        state.templates = action.payload;
      })
      .addCase(fetchTemplates.rejected, (state, action) => {
        state.loading.templates = false;
        state.error.templates = action.payload as string;
      })
      
      // Fetch user business plans
      .addCase(fetchUserBusinessPlans.pending, (state) => {
        state.loading.plans = true;
        state.error.plans = null;
      })
      .addCase(fetchUserBusinessPlans.fulfilled, (state, action) => {
        state.loading.plans = false;
        state.plans = action.payload;
      })
      .addCase(fetchUserBusinessPlans.rejected, (state, action) => {
        state.loading.plans = false;
        state.error.plans = action.payload as string;
      })
      
      // Fetch business plan by ID
      .addCase(fetchBusinessPlanById.pending, (state) => {
        state.loading.currentPlan = true;
        state.error.currentPlan = null;
      })
      .addCase(fetchBusinessPlanById.fulfilled, (state, action) => {
        state.loading.currentPlan = false;
        state.currentPlan = action.payload;
      })
      .addCase(fetchBusinessPlanById.rejected, (state, action) => {
        state.loading.currentPlan = false;
        state.error.currentPlan = action.payload as string;
      })
      
      // Create new business plan
      .addCase(createNewBusinessPlan.pending, (state) => {
        state.loading.save = true;
        state.error.save = null;
      })
      .addCase(createNewBusinessPlan.fulfilled, (state, action) => {
        state.loading.save = false;
        state.plans.unshift(action.payload);
      })
      .addCase(createNewBusinessPlan.rejected, (state, action) => {
        state.loading.save = false;
        state.error.save = action.payload as string;
      })
      
      // Update section content
      .addCase(updateSectionContent.pending, (state) => {
        state.loading.save = true;
        state.error.save = null;
        state.autoSaveStatus = 'saving';
      })
      .addCase(updateSectionContent.fulfilled, (state, action) => {
        state.loading.save = false;
        state.autoSaveStatus = 'saved';
        
        if (state.currentPlan) {
          // Update the section in the current plan
          const section = state.currentPlan.sections.find(
            s => s.id === action.payload.planSectionId
          );
          
          if (section) {
            section.content = action.payload.content;
            state.currentPlan.updatedAt = new Date().toISOString();
          }
        }
      })
      .addCase(updateSectionContent.rejected, (state, action) => {
        state.loading.save = false;
        state.error.save = action.payload as string;
        state.autoSaveStatus = 'error';
      })
      
      // Save questionnaire answers
      .addCase(saveAnswers.pending, (state) => {
        state.loading.save = true;
        state.error.save = null;
        state.autoSaveStatus = 'saving';
      })
      .addCase(saveAnswers.fulfilled, (state) => {
        state.loading.save = false;
        state.autoSaveStatus = 'saved';
      })
      .addCase(saveAnswers.rejected, (state, action) => {
        state.loading.save = false;
        state.error.save = action.payload as string;
        state.autoSaveStatus = 'error';
      })
      
      // Generate AI content
      .addCase(generateContent.pending, (state) => {
        state.loading.ai = true;
        state.error.ai = null;
      })
      .addCase(generateContent.fulfilled, (state, action) => {
        state.loading.ai = false;
        
        if (state.currentPlan) {
          // Find the section that needs updating
          const sectionIndex = state.currentPlan.sections.findIndex(
            section => section.sectionId === action.payload.sectionId
          );
          
          if (sectionIndex !== -1) {
            // Update content
            state.currentPlan.sections[sectionIndex].content = action.payload.content;
            state.currentPlan.updatedAt = new Date().toISOString();
          }
        }
      })
      .addCase(generateContent.rejected, (state, action) => {
        state.loading.ai = false;
        state.error.ai = action.payload as string;
      });
  },
});

export const { 
  updateQuestionAnswer, 
  autoSaveDone, 
  autoSaveError, 
  clearCurrentPlan,
  setLocalPlanContent
} = businessPlanSlice.actions;

export default businessPlanSlice.reducer;