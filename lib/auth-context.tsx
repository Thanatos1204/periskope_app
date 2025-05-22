"use client";
import React, { createContext, useContext, useEffect, useState } from 'react';
import { Session, User } from '@supabase/supabase-js';
import { createClient } from '@/utils/supabase/client';
import { useRouter } from 'next/navigation';

type AuthContextType = {
  session: Session | null;
  user: User | null;
  loading: boolean;
  signIn: (email: string) => Promise<{ error: any | null; data: any | null }>;
  verifyOTP: (email: string, token: string) => Promise<{ error: any | null; data: any | null }>;
  signOut: () => Promise<void>;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const supabase = createClient();

  useEffect(() => {
    // Get session from Supabase
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      setLoading(false);
    });

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        console.log('Auth state changed:', event, session);
        setSession(session);
        setUser(session?.user ?? null);
        setLoading(false);
        
        // Handle successful sign in
        if (event === 'SIGNED_IN' && session) {
          console.log('User signed in, redirecting...');
          router.push('/');
          router.refresh(); // Force a refresh to update middleware state
        }
        
        // Handle sign out
        if (event === 'SIGNED_OUT') {
          console.log('User signed out');
          router.push('/login');
        }
      }
    );

    return () => {
      subscription.unsubscribe();
    };
  }, [router, supabase]);

  const signIn = async (email: string) => {
    setLoading(true);
    try {
      const result = await supabase.auth.signInWithOtp({
        email,
        options: {
          emailRedirectTo: `${window.location.origin}/auth/callback`,
        }
      });
      setLoading(false);
      return result;
    } catch (error) {
      setLoading(false);
      return { error, data: null };
    }
  };

  const verifyOTP = async (email: string, token: string) => {
    setLoading(true);
    try {
      const result = await supabase.auth.verifyOtp({
        email,
        token,
        type: 'email',
      });
      setLoading(false);
      return result;
    } catch (error) {
      setLoading(false);
      return { error, data: null };
    }
  };

  const signOut = async () => {
    setLoading(true);
    await supabase.auth.signOut();
    setLoading(false);
  };

  const value = {
    session,
    user,
    loading,
    signIn,
    verifyOTP,
    signOut,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}