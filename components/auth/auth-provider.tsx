"use client";

import { createContext, useContext, useEffect, useState } from "react";
import { Session, User } from "@supabase/supabase-js";
import { createClient } from "@/lib/supabase";

type AuthState = {
  user: User | null;
  session: Session | null;
  isLoading: boolean;
};

type AuthContextType = AuthState & {
  requestEmailOtp: (email: string) => Promise<{ success: boolean; error?: Error }>;
  verifyEmailOtp: (email: string, otp: string) => Promise<{ success: boolean; error?: Error }>;
  signInAnonymously: () => Promise<void>;
  signOut: () => Promise<void>;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [authState, setAuthState] = useState<AuthState>({
    user: null,
    session: null,
    isLoading: true,
  });

  useEffect(() => {
    const supabase = createClient();
    
    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setAuthState(prev => ({
        ...prev,
        user: session?.user ?? null,
        session,
        isLoading: false,
      }));
    });

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        setAuthState(prev => ({
          ...prev,
          user: session?.user ?? null,
          session,
          isLoading: false,
        }));
      }
    );

    return () => {
      subscription.unsubscribe();
    };
  }, []);


  const requestEmailOtp = async (email: string): Promise<{ success: boolean; error?: Error }> => {
    const supabase = createClient();
    try {
      const { error } = await supabase.auth.signInWithOtp({
        email,
        options: {
          shouldCreateUser: true,
        }
      });
      
      if (error) throw error;
      return { success: true };
    } catch (error) {
      console.error('Error requesting email OTP:', error);
      return { success: false, error: error as Error };
    }
  };
  
  const verifyEmailOtp = async (email: string, otp: string): Promise<{ success: boolean; error?: Error }> => {
    const supabase = createClient();
    try {
      const { error } = await supabase.auth.verifyOtp({
        email,
        token: otp,
        type: 'email',
      });
      
      if (error) throw error;
      return { success: true };
    } catch (error) {
      console.error('Error verifying email OTP:', error);
      return { success: false, error: error as Error };
    }
  };

  const signInAnonymously = async () => {
    const supabase = createClient();
    await supabase.auth.signInAnonymously();
  };

  const signOut = async () => {
    const supabase = createClient();
    await supabase.auth.signOut();
  };

  return (
    <AuthContext.Provider
      value={{
        ...authState,
        requestEmailOtp,
        verifyEmailOtp,
        signInAnonymously,
        signOut,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
