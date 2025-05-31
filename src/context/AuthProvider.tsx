import React, { createContext, useContext, useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchCurrentUser } from '../store/slices/authSlice';
import { RootState } from '../store';
import { supabase } from '../lib/supabase';
import { User } from '../api/auth';

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  loading: boolean;
  checkSession: () => Promise<boolean>;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  isAuthenticated: false,
  loading: false,
  checkSession: async () => false,
});

export const useAuth = () => useContext(AuthContext);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const dispatch = useDispatch();
  const [initialLoadComplete, setInitialLoadComplete] = useState(true);
  
  const { user, isAuthenticated, loading } = useSelector((state: RootState) => state.auth);

  // Skip auth checks and always return authenticated state
  const checkSession = async (): Promise<boolean> => {
    return true;
  };

  const value = {
    user,
    isAuthenticated: true,
    loading: false,
    checkSession,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export default AuthProvider;