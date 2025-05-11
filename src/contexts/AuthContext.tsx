
import { createContext, useContext, useEffect, useState } from "react";
import { Session, User } from "@supabase/supabase-js";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate } from "react-router-dom";

type AuthContextType = {
  user: User | null;
  session: Session | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<{
    error: Error | null;
    success: boolean;
  }>;
  signUp: (
    email: string, 
    password: string, 
    userData: {
      firstName: string;
      lastName?: string;
      displayName: string;
      city?: string;
      country?: string;
      ageCategory: string;
    }
  ) => Promise<{
    error: Error | null;
    success: boolean;
  }>;
  signOut: () => Promise<void>;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    // Set up auth state listener FIRST
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, newSession) => {
        console.log("Auth state changed:", event);
        setSession(newSession);
        setUser(newSession?.user ?? null);
        
        // Only handle explicit sign-in and sign-out events, not the initial session check
        if (event === 'SIGNED_IN' && newSession) {
          // Don't redirect from within onAuthStateChange to avoid infinite loops
          setTimeout(() => {
            navigate('/dashboard');
          }, 0);
        } else if (event === 'SIGNED_OUT') {
          // Don't redirect from within onAuthStateChange to avoid infinite loops
          setTimeout(() => {
            navigate('/login');
          }, 0);
        }
      }
    );

    // THEN check for existing session
    supabase.auth.getSession().then(({ data: { session: currentSession } }) => {
      setSession(currentSession);
      setUser(currentSession?.user ?? null);
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, [navigate]);

  const signIn = async (email: string, password: string) => {
    try {
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) throw error;
      return { error: null, success: true };
    } catch (error) {
      console.error("Error signing in:", error);
      return { error: error as Error, success: false };
    }
  };

  const signUp = async (
    email: string, 
    password: string, 
    userData: {
      firstName: string;
      lastName?: string;
      displayName: string;
      city?: string;
      country?: string;
      ageCategory: string;
    }
  ) => {
    try {
      const { error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            first_name: userData.firstName,
            last_name: userData.lastName || "",
            display_name: userData.displayName,
            city: userData.city || "",
            country: userData.country || "",
            age_category: userData.ageCategory,
          }
        }
      });

      if (error) throw error;
      return { error: null, success: true };
    } catch (error) {
      console.error("Error signing up:", error);
      return { error: error as Error, success: false };
    }
  };

  const signOut = async () => {
    await supabase.auth.signOut();
  };

  return (
    <AuthContext.Provider value={{ user, session, loading, signIn, signUp, signOut }}>
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
