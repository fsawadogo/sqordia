import { configureStore } from '@reduxjs/toolkit';
import authReducer from './slices/authSlice';
import businessPlanReducer from './slices/businessPlanSlice';
import uiReducer from './slices/uiSlice';

export const store = configureStore({
  reducer: {
    auth: authReducer,
    businessPlan: businessPlanReducer,
    ui: uiReducer,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;