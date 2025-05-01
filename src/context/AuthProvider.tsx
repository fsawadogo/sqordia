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
  const [initialLoadComplete, setInitialLoadComplete] = useState(false);
  
  const { user, isAuthenticated, loading } = useSelector((state: RootState) => state.auth);

  // Check for the current user on mount
  useEffect(() => {
    const initAuth = async () => {
      try {
        // Check if there's an active session
        const { data: { session } } = await supabase.auth.getSession();
        
        if (session) {
          // If we have a session, attempt to fetch the current user
          dispatch(fetchCurrentUser() as any);
        }
      } catch (error) {
        console.error('Error initializing auth:', error);
      } finally {
        setInitialLoadComplete(true);
      }
    };

    initAuth();

    // Listen for auth state changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        if (session) {
          dispatch(fetchCurrentUser() as any);
        } else {
          // If no session, make sure we're logged out
          setInitialLoadComplete(true);
        }
      }
    );

    return () => {
      subscription.unsubscribe();
    };
  }, [dispatch]);

  // Check session validity
  const checkSession = async (): Promise<boolean> => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      return !!session;
    } catch (error) {
      console.error('Error checking session:', error);
      return false;
    }
  };

  // Don't render children until initial auth check is complete
  if (!initialLoadComplete && loading) {
    return <div>Loading...</div>; // Or your custom loading component
  }

  const value = {
    user,
    isAuthenticated,
    loading,
    checkSession,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export default AuthProvider;