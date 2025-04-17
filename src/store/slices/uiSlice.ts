import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface UIState {
  darkMode: boolean;
  sidebarOpen: boolean;
  notification: {
    open: boolean;
    message: string;
    type: 'success' | 'error' | 'info' | 'warning';
  };
  loading: {
    global: boolean;
    ai: boolean;
  };
}

const initialState: UIState = {
  darkMode: false,
  sidebarOpen: true,
  notification: {
    open: false,
    message: '',
    type: 'info',
  },
  loading: {
    global: false,
    ai: false,
  },
};

const uiSlice = createSlice({
  name: 'ui',
  initialState,
  reducers: {
    toggleDarkMode: (state) => {
      state.darkMode = !state.darkMode;
      localStorage.setItem('darkMode', String(state.darkMode));
    },
    toggleSidebar: (state) => {
      state.sidebarOpen = !state.sidebarOpen;
    },
    showNotification: (state, action: PayloadAction<{ message: string; type: 'success' | 'error' | 'info' | 'warning' }>) => {
      state.notification = {
        open: true,
        message: action.payload.message,
        type: action.payload.type,
      };
    },
    hideNotification: (state) => {
      state.notification.open = false;
    },
    setLoading: (state, action: PayloadAction<{ key: 'global' | 'ai'; value: boolean }>) => {
      state.loading[action.payload.key] = action.payload.value;
    },
  },
});

export const {
  toggleDarkMode,
  toggleSidebar,
  showNotification,
  hideNotification,
  setLoading,
} = uiSlice.actions;

export default uiSlice.reducer;