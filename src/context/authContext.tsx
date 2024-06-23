"use client";

import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from "react";
import { useRouter } from "next/navigation";
import { login, logout } from "@/auth/actions"; // Adjust the import path based on your project
import { SessionPayload, getSession } from "@/auth/auth";

interface AuthContextType {
  session: SessionPayload | null;
  login: (username: string, password: string) => Promise<boolean>;
  logout: () => Promise<void>;
  loading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({
  children,
}) => {
  const [session, setSession] = useState<SessionPayload | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const loadSession = async () => {
      try {
        const session = await getSession();
        setSession(session);
        setLoading(false);
      } catch (error) {
        console.error("Error loading session:", error);
        setLoading(false);
      }
    };

    loadSession();
  }, []);

  const handleLogin = async (
    username: string,
    password: string
  ): Promise<boolean> => {
    setLoading(true);
    try {
      const result = await login(username, password); // Implement your login logic
      if (!result) {
        setLoading(false);
        return false;
      }
      const session = await getSession();
      if (!session) {
        setLoading(false);
        return false;
      }
      setSession(session);
      setLoading(false);
      router.push("/"); // Redirect to home page after login
      return true;
    } catch (error) {
      console.error("Login failed:", error);
      setLoading(false);
      return false;
    }
  };

  const handleLogout = async () => {
    setLoading(true);
    try {
      await logout(); // Implement your logout logic
      setSession(null);
      setLoading(false);
      router.push("/login"); // Redirect to login page after logout
    } catch (error) {
      console.error("Logout failed:", error);
      setLoading(false);
      // Handle logout error (e.g., display error message)
    }
  };

  return (
    <AuthContext.Provider
      value={{ session, login: handleLogin, logout: handleLogout, loading }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
