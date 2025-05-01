import { supabase } from '../lib/supabase';
import { v4 as uuidv4 } from 'uuid';

// User types
export interface UserCredentials {
  email: string;
  password: string;
}

export interface UserRegistration extends UserCredentials {
  firstName: string;
  lastName: string;
  accountType: 'user' | 'consultant' | 'obnl' | 'administrator';
  companyName?: string;
  jobTitle?: string;
}

export interface User {
  id: string;
  email: string;
  firstName: string | null;
  lastName: string | null;
  role: string | null;
  avatarUrl: string | null;
  subscriptionTier: string | null;
  company: string | null;
  jobTitle: string | null;
  bio: string | null;
  phone: string | null;
  lastPasswordChange?: string;
}

// Sign up a new user
export const signUp = async (data: UserRegistration): Promise<{ user: User | null; error: Error | null }> => {
  try {
    const { email, password, firstName, lastName, accountType, companyName, jobTitle } = data;
    
    // Create a new user in Supabase Auth
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          first_name: firstName,
          last_name: lastName,
          role: accountType,
          company: companyName,
          job_title: jobTitle
        }
      }
    });

    if (authError) throw authError;
    
    // Return the user or null if something went wrong
    if (authData && authData.user) {
      const user: User = {
        id: authData.user.id,
        email: authData.user.email || '',
        firstName,
        lastName,
        role: accountType,
        avatarUrl: null,
        subscriptionTier: 'free',
        company: companyName || null,
        jobTitle: jobTitle || null,
        bio: null,
        phone: null
      };
      return { user, error: null };
    }
    
    return { user: null, error: new Error('Failed to create user') };
  } catch (error) {
    return { user: null, error: error as Error };
  }
};

// Sign in an existing user
export const signIn = async (credentials: UserCredentials): Promise<{ user: User | null; error: Error | null }> => {
  try {
    const { email, password } = credentials;
    
    // Sign in with Supabase Auth
    const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
      email,
      password
    });

    if (authError) throw authError;
    
    if (authData && authData.user) {
      // Fetch user profile from the profiles table
      const { data: profileData, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', authData.user.id)
        .single();
      
      if (profileError) throw profileError;
      
      if (profileData) {
        const user: User = {
          id: profileData.id,
          email: profileData.email,
          firstName: profileData.first_name,
          lastName: profileData.last_name,
          role: profileData.role,
          avatarUrl: profileData.avatar_url,
          subscriptionTier: profileData.subscription_tier,
          company: profileData.company,
          jobTitle: profileData.job_title,
          bio: profileData.bio,
          phone: profileData.phone
        };
        
        return { user, error: null };
      }
    }
    
    return { user: null, error: new Error('Failed to retrieve user information') };
  } catch (error) {
    return { user: null, error: error as Error };
  }
};

// Sign out the current user
export const signOut = async (): Promise<{ error: Error | null }> => {
  try {
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
    return { error: null };
  } catch (error) {
    return { error: error as Error };
  }
};

// Reset password
export const resetPassword = async (email: string): Promise<{ error: Error | null }> => {
  try {
    const { error } = await supabase.auth.resetPasswordForEmail(email);
    if (error) throw error;
    return { error: null };
  } catch (error) {
    return { error: error as Error };
  }
};

// Get current user
export const getCurrentUser = async (): Promise<{ user: User | null; error: Error | null }> => {
  try {
    // Get current session
    const { data: { session }, error: sessionError } = await supabase.auth.getSession();
    
    if (sessionError) throw sessionError;
    
    if (!session) return { user: null, error: null };
    
    // Get user from profiles table
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', session.user.id)
      .single();
    
    if (profileError) throw profileError;
    
    if (profile) {
      const user: User = {
        id: profile.id,
        email: profile.email,
        firstName: profile.first_name,
        lastName: profile.last_name,
        role: profile.role,
        avatarUrl: profile.avatar_url,
        subscriptionTier: profile.subscription_tier,
        company: profile.company,
        jobTitle: profile.job_title,
        bio: profile.bio,
        phone: profile.phone
      };
      
      return { user, error: null };
    }
    
    return { user: null, error: new Error('User profile not found') };
  } catch (error) {
    return { user: null, error: error as Error };
  }
};

// Update user profile
export const updateProfile = async (userId: string, updates: Partial<User>): Promise<{ user: User | null; error: Error | null }> => {
  try {
    // Prepare the data for Supabase
    const profileUpdates = {
      first_name: updates.firstName,
      last_name: updates.lastName,
      avatar_url: updates.avatarUrl,
      company: updates.company,
      job_title: updates.jobTitle,
      bio: updates.bio,
      phone: updates.phone,
      updated_at: new Date().toISOString()
    };
    
    // Update profile
    const { data: updatedProfile, error: updateError } = await supabase
      .from('profiles')
      .update(profileUpdates)
      .eq('id', userId)
      .select('*')
      .single();
    
    if (updateError) throw updateError;
    
    if (updatedProfile) {
      const user: User = {
        id: updatedProfile.id,
        email: updatedProfile.email,
        firstName: updatedProfile.first_name,
        lastName: updatedProfile.last_name,
        role: updatedProfile.role,
        avatarUrl: updatedProfile.avatar_url,
        subscriptionTier: updatedProfile.subscription_tier,
        company: updatedProfile.company,
        jobTitle: updatedProfile.job_title,
        bio: updatedProfile.bio,
        phone: updatedProfile.phone
      };
      
      return { user, error: null };
    }
    
    return { user: null, error: new Error('Failed to update profile') };
  } catch (error) {
    return { user: null, error: error as Error };
  }
};

// Change password
export const changePassword = async (currentPassword: string, newPassword: string): Promise<{ error: Error | null }> => {
  try {
    // First, verify current password by signing in
    const { data: { session }, error: authError } = await supabase.auth.getSession();
    
    if (authError) throw authError;
    if (!session) throw new Error('Not authenticated');

    const email = session.user.email;
    if (!email) throw new Error('User email not found');
    
    // Verify current password
    const { error: signInError } = await supabase.auth.signInWithPassword({
      email,
      password: currentPassword
    });
    
    if (signInError) throw new Error('Current password is incorrect');
    
    // Update password
    const { error: updateError } = await supabase.auth.updateUser({
      password: newPassword
    });
    
    if (updateError) throw updateError;
    
    return { error: null };
  } catch (error) {
    return { error: error as Error };
  }
};