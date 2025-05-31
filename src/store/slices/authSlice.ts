import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { signIn, signUp, signOut, getCurrentUser, updateProfile, changePassword, UserCredentials, UserRegistration, User } from '../../api/auth';

interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  loading: boolean;
  error: string | null;
}

const initialState: AuthState = {
  user: {
    id: 'default-user',
    email: 'admin@example.com',
    firstName: 'Admin',
    lastName: 'User',
    role: 'administrator',
    avatarUrl: null,
    subscriptionTier: 'premium',
    company: 'Default Company',
    jobTitle: 'Administrator',
    bio: '',
    phone: ''
  },
  token: 'mock-jwt-token',
  isAuthenticated: true,
  loading: false,
  error: null,
};

// Async thunks
export const loginUser = createAsyncThunk(
  'auth/login',
  async (credentials: UserCredentials, { rejectWithValue }) => {
    try {
      const { user, error } = await signIn(credentials);
      if (error) throw error;
      if (!user) throw new Error('Failed to login');
      return user;
    } catch (error) {
      if (error instanceof Error) {
        return rejectWithValue(error.message);
      }
      return rejectWithValue('An unexpected error occurred');
    }
  }
);

export const registerUser = createAsyncThunk(
  'auth/register',
  async (userData: UserRegistration, { rejectWithValue }) => {
    try {
      const { user, error } = await signUp(userData);
      if (error) throw error;
      if (!user) throw new Error('Failed to register');
      return user;
    } catch (error) {
      if (error instanceof Error) {
        return rejectWithValue(error.message);
      }
      return rejectWithValue('An unexpected error occurred');
    }
  }
);

export const logoutUser = createAsyncThunk(
  'auth/logout',
  async (_, { rejectWithValue }) => {
    try {
      const { error } = await signOut();
      if (error) throw error;
      return;
    } catch (error) {
      if (error instanceof Error) {
        return rejectWithValue(error.message);
      }
      return rejectWithValue('An unexpected error occurred');
    }
  }
);

export const fetchCurrentUser = createAsyncThunk(
  'auth/fetchCurrentUser',
  async (_, { rejectWithValue }) => {
    try {
      const { user, error } = await getCurrentUser();
      if (error) throw error;
      return user;
    } catch (error) {
      if (error instanceof Error) {
        return rejectWithValue(error.message);
      }
      return rejectWithValue('An unexpected error occurred');
    }
  }
);

export const updateUserProfile = createAsyncThunk(
  'auth/updateProfile',
  async ({ userId, updates }: { userId: string; updates: Partial<User> }, { rejectWithValue }) => {
    try {
      const { user, error } = await updateProfile(userId, updates);
      if (error) throw error;
      if (!user) throw new Error('Failed to update profile');
      return user;
    } catch (error) {
      if (error instanceof Error) {
        return rejectWithValue(error.message);
      }
      return rejectWithValue('An unexpected error occurred');
    }
  }
);

export const changeUserPassword = createAsyncThunk(
  'auth/changePassword',
  async ({ currentPassword, newPassword }: { currentPassword: string; newPassword: string }, { rejectWithValue }) => {
    try {
      const { error } = await changePassword(currentPassword, newPassword);
      if (error) throw error;
      return true;
    } catch (error) {
      if (error instanceof Error) {
        return rejectWithValue(error.message);
      }
      return rejectWithValue('An unexpected error occurred');
    }
  }
);

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    // Keep this action for manual auth in demo or testing
    loginSuccess: (state, action: PayloadAction<{ user: User; token: string }>) => {
      state.loading = false;
      state.isAuthenticated = true;
      state.user = action.payload.user;
      state.token = action.payload.token;
      localStorage.setItem('token', action.payload.token);
      localStorage.setItem('auth', 'true');
    },
    loginStart: (state) => {
      state.loading = true;
      state.error = null;
    },
    loginFailure: (state, action: PayloadAction<string>) => {
      state.loading = false;
      state.error = action.payload;
    },
    logout: (state) => {
      state.isAuthenticated = false;
      state.user = null;
      state.token = null;
      localStorage.removeItem('token');
      localStorage.removeItem('auth');
    },
    clearError: (state) => {
      state.error = null;
    }
  },
  extraReducers: (builder) => {
    builder
      // Login
      .addCase(loginUser.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(loginUser.fulfilled, (state, action) => {
        state.loading = false;
        state.isAuthenticated = true;
        state.user = action.payload;
        // In a real app, this would come from the API
        state.token = 'mock-jwt-token';
        localStorage.setItem('token', 'mock-jwt-token');
        localStorage.setItem('auth', 'true');
      })
      .addCase(loginUser.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      
      // Register
      .addCase(registerUser.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(registerUser.fulfilled, (state, action) => {
        state.loading = false;
        // Usually we wouldn't auto-login after registration (especially with email verification)
        // But for this demo we can
        state.isAuthenticated = true;
        state.user = action.payload;
        state.token = 'mock-jwt-token';
        localStorage.setItem('token', 'mock-jwt-token');
        localStorage.setItem('auth', 'true');
      })
      .addCase(registerUser.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      
      // Logout
      .addCase(logoutUser.pending, (state) => {
        state.loading = true;
      })
      .addCase(logoutUser.fulfilled, (state) => {
        state.loading = false;
        state.isAuthenticated = false;
        state.user = null;
        state.token = null;
        localStorage.removeItem('token');
        localStorage.removeItem('auth');
      })
      .addCase(logoutUser.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      
      // Fetch current user
      .addCase(fetchCurrentUser.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchCurrentUser.fulfilled, (state, action) => {
        state.loading = false;
        if (action.payload) {
          state.isAuthenticated = true;
          state.user = action.payload;
        } else {
          state.isAuthenticated = false;
        }
      })
      .addCase(fetchCurrentUser.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
        state.isAuthenticated = false;
        state.user = null;
        state.token = null;
        localStorage.removeItem('token');
        localStorage.removeItem('auth');
      })
      
      // Update profile
      .addCase(updateUserProfile.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateUserProfile.fulfilled, (state, action) => {
        state.loading = false;
        state.user = action.payload;
      })
      .addCase(updateUserProfile.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      
      // Change password
      .addCase(changeUserPassword.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(changeUserPassword.fulfilled, (state) => {
        state.loading = false;
      })
      .addCase(changeUserPassword.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });
  },
});

export const { loginStart, loginSuccess, loginFailure, logout, clearError } = authSlice.actions;
export default authSlice.reducer;