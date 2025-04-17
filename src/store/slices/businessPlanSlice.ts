import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface QuestionnaireSection {
  id: string;
  title: string;
  completed: boolean;
  questions: Array<{
    id: string;
    question: string;
    answer: string;
    type: 'text' | 'textarea' | 'select' | 'radio' | 'checkbox';
    options?: string[];
  }>;
}

interface BusinessPlanTemplate {
  id: string;
  name: string;
  description: string;
  sections: string[];
}

interface BusinessPlan {
  id: string;
  title: string;
  createdAt: string;
  updatedAt: string;
  template: BusinessPlanTemplate;
  content: Record<string, string>; // Section ID -> HTML content
  progress: number;
  questionnaireSections: QuestionnaireSection[];
}

interface BusinessPlanState {
  plans: BusinessPlan[];
  currentPlan: BusinessPlan | null;
  templates: BusinessPlanTemplate[];
  loading: boolean;
  error: string | null;
  autoSaveStatus: 'idle' | 'saving' | 'saved' | 'error';
}

const initialState: BusinessPlanState = {
  plans: [],
  currentPlan: null,
  templates: [],
  loading: false,
  error: null,
  autoSaveStatus: 'idle',
};

const businessPlanSlice = createSlice({
  name: 'businessPlan',
  initialState,
  reducers: {
    fetchPlansStart: (state) => {
      state.loading = true;
      state.error = null;
    },
    fetchPlansSuccess: (state, action: PayloadAction<BusinessPlan[]>) => {
      state.loading = false;
      state.plans = action.payload;
    },
    fetchPlansFailure: (state, action: PayloadAction<string>) => {
      state.loading = false;
      state.error = action.payload;
    },
    setCurrentPlan: (state, action: PayloadAction<BusinessPlan>) => {
      state.currentPlan = action.payload;
    },
    updateCurrentPlan: (state, action: PayloadAction<Partial<BusinessPlan>>) => {
      if (state.currentPlan) {
        state.currentPlan = { ...state.currentPlan, ...action.payload };
      }
    },
    updateSectionContent: (state, action: PayloadAction<{ sectionId: string; content: string }>) => {
      if (state.currentPlan) {
        state.currentPlan.content[action.payload.sectionId] = action.payload.content;
        state.currentPlan.updatedAt = new Date().toISOString();
        state.autoSaveStatus = 'saving';
      }
    },
    updateQuestionAnswer: (state, action: PayloadAction<{ 
      sectionId: string; 
      questionId: string; 
      answer: string 
    }>) => {
      if (state.currentPlan) {
        const section = state.currentPlan.questionnaireSections.find(s => s.id === action.payload.sectionId);
        if (section) {
          const question = section.questions.find(q => q.id === action.payload.questionId);
          if (question) {
            question.answer = action.payload.answer;
            state.currentPlan.updatedAt = new Date().toISOString();
            state.autoSaveStatus = 'saving';
          }
        }
      }
    },
    autoSaveDone: (state) => {
      state.autoSaveStatus = 'saved';
    },
    autoSaveError: (state) => {
      state.autoSaveStatus = 'error';
    },
    fetchTemplatesSuccess: (state, action: PayloadAction<BusinessPlanTemplate[]>) => {
      state.templates = action.payload;
    },
  },
});

export const {
  fetchPlansStart,
  fetchPlansSuccess,
  fetchPlansFailure,
  setCurrentPlan,
  updateCurrentPlan,
  updateSectionContent,
  updateQuestionAnswer,
  autoSaveDone,
  autoSaveError,
  fetchTemplatesSuccess,
} = businessPlanSlice.actions;

export default businessPlanSlice.reducer;