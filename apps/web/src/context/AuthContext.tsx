import React, { createContext, useContext, useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";

export interface AuthUser {
  id: string;
  email: string;
  fullName: string;
  role: "admin" | "manager" | "staff" | "cashier";
}

interface AuthContextType {
  user: AuthUser | null;
  token: string | null;
  isAuthenticated: boolean;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  signup: (email: string, password: string, fullName: string) => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchUserProfile = async (
    userId: string,
    email: string,
    metaName?: string,
  ): Promise<AuthUser> => {
    try {
      const { data: profile } = await supabase
        .from("profiles")
        .select("id, full_name, role")
        .eq("id", userId)
        .maybeSingle();

      return {
        id: userId,
        email,
        fullName: profile?.full_name || metaName || email.split("@")[0],
        role: (profile?.role as AuthUser["role"]) || "staff",
      };
    } catch {
      return {
        id: userId,
        email,
        fullName: metaName || email.split("@")[0],
        role: "staff",
      };
    }
  };

  useEffect(() => {
    const initAuth = async () => {
      try {
        const {
          data: { session },
        } = await supabase.auth.getSession();
        if (session?.user) {
          setToken(session.access_token);
          const authUser = await fetchUserProfile(
            session.user.id,
            session.user.email || "",
            session.user.user_metadata?.full_name,
          );
          setUser(authUser);
        } else {
          setUser(null);
          setToken(null);
        }
      } catch (err) {
        console.error("Auth initialization error:", err);
        setUser(null);
        setToken(null);
      } finally {
        setLoading(false);
      }
    };

    initAuth();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (_event, session) => {
      if (session?.user) {
        setToken(session.access_token);
        const authUser = await fetchUserProfile(
          session.user.id,
          session.user.email || "",
          session.user.user_metadata?.full_name,
        );
        setUser(authUser);
      } else {
        setUser(null);
        setToken(null);
      }
      setLoading(false);
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const login = async (email: string, password: string) => {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    if (error) {
      throw new Error(error.message);
    }
    if (data.session && data.user) {
      setToken(data.session.access_token);
      const authUser = await fetchUserProfile(
        data.user.id,
        data.user.email || email,
        data.user.user_metadata?.full_name,
      );
      setUser(authUser);
    }
  };

  const signup = async (email: string, password: string, fullName: string) => {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          full_name: fullName,
        },
      },
    });
    if (error) {
      throw new Error(error.message);
    }
    if (data.session && data.user) {
      setToken(data.session.access_token);
      const authUser = await fetchUserProfile(
        data.user.id,
        data.user.email || email,
        fullName,
      );
      setUser(authUser);
    }
  };

  const logout = async () => {
    try {
      await supabase.auth.signOut();
    } finally {
      setUser(null);
      setToken(null);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isAuthenticated: Boolean(user && token),
        loading,
        login,
        signup,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

// eslint-disable-next-line react-refresh/only-export-components
export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
