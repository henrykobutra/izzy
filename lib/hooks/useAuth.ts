"use client";

import { useEffect, useState } from "react";
import { User } from "@supabase/supabase-js";
import { createClient } from "@/lib/supabase";
import { useRouter } from "next/navigation";

export function useAuth() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [isRedirecting, setIsRedirecting] = useState(false);
  const router = useRouter();
  const supabase = createClient();

  useEffect(() => {
    // Get initial session
    const getInitialSession = async () => {
      setLoading(true);

      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (session?.user) {
        setUser(session.user);
      } else {
        setUser(null);
      }

      setLoading(false);
    };

    getInitialSession();

    // Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user || null);
      setLoading(false);
      router.refresh();
    });

    return () => {
      subscription.unsubscribe();
    };
  }, [router, supabase.auth]);

  // Email OTP Sign-in - Step 1: Request OTP
  const requestEmailOtp = async (
    email: string
  ): Promise<{ success: boolean; error?: Error }> => {
    try {
      const { error } = await supabase.auth.signInWithOtp({
        email,
        options: {
          // No redirect URL needed since we're verifying with OTP code
          shouldCreateUser: true,
        },
      });

      if (error) throw error;
      return { success: true };
    } catch (error) {
      console.error("Error requesting email OTP:", error);
      return { success: false, error: error as Error };
    }
  };

  // Email OTP Sign-in - Step 2: Verify OTP
  const verifyEmailOtp = async (
    email: string,
    otp: string
  ): Promise<{ success: boolean; error?: Error }> => {
    try {
      setIsRedirecting(true);
      const { error } = await supabase.auth.verifyOtp({
        email,
        token: otp,
        type: "email",
      });

      if (error) throw error;

      // Get the current session immediately after verification
      const {
        data: { session },
      } = await supabase.auth.getSession();
      if (session?.user) {
        setUser(session.user);
        router.push("/dashboard");
      }
      return { success: true };
    } catch (error) {
      console.error("Error verifying email OTP:", error);
      return { success: false, error: error as Error };
    } finally {
      setIsRedirecting(false);
    }
  };

  const signInAnonymously = async () => {
    try {
      setIsRedirecting(true);
      const { error } = await supabase.auth.signInAnonymously();
      if (error) throw error;

      // Get the current session immediately after anonymous sign in
      const {
        data: { session },
      } = await supabase.auth.getSession();
      if (session?.user) {
        setUser(session.user);
        router.push("/dashboard");
      }
    } catch (error) {
      console.error("Error signing in anonymously:", error);
    } finally {
      setIsRedirecting(false);
    }
  };

  const signOut = async () => {
    await supabase.auth.signOut();
    router.push("/");
  };

  return {
    user,
    loading,
    isRedirecting,
    requestEmailOtp,
    verifyEmailOtp,
    signInAnonymously,
    signOut,
  };
}
