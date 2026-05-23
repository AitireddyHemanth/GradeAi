"use client";

import {
  createContext,
  useContext,
  useState,
  useCallback,
  useMemo,
  type ReactNode,
} from "react";
import type { User, UserRole, AuthState } from "@/lib/types";
import { authenticateUser, registerUser } from "@/lib/store";

// -------------------------------------------------------
// Context shape
// -------------------------------------------------------

interface AuthContextValue extends AuthState {
  login: (email: string, password: string) => { success: boolean; error?: string };
  register: (
    name: string,
    email: string,
    password: string,
    role: UserRole
  ) => { success: boolean; error?: string };
  logout: () => void;
  switchUser: (user: User) => void;
}

const AuthContext = createContext<AuthContextValue | null>(null);

// -------------------------------------------------------
// Provider
// -------------------------------------------------------

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);

  const login = useCallback(
    (email: string, password: string): { success: boolean; error?: string } => {
      if (!email.trim() || !password.trim()) {
        return { success: false, error: "Email and password are required." };
      }
      const found = authenticateUser(email.trim(), password);
      if (!found) {
        return { success: false, error: "Invalid email or password." };
      }
      setUser(found);
      return { success: true };
    },
    []
  );

  const register = useCallback(
    (
      name: string,
      email: string,
      password: string,
      role: UserRole
    ): { success: boolean; error?: string } => {
      if (!name.trim() || !email.trim() || !password.trim()) {
        return { success: false, error: "All fields are required." };
      }
      if (password.length < 6) {
        return {
          success: false,
          error: "Password must be at least 6 characters.",
        };
      }
      const created = registerUser(name.trim(), email.trim(), password, role);
      if (!created) {
        return { success: false, error: "An account with this email already exists." };
      }
      setUser(created);
      return { success: true };
    },
    []
  );

  const logout = useCallback(() => {
    setUser(null);
  }, []);

  const switchUser = useCallback((u: User) => {
    setUser(u);
  }, []);

  const value = useMemo<AuthContextValue>(
    () => ({
      user,
      isAuthenticated: user !== null,
      login,
      register,
      logout,
      switchUser,
    }),
    [user, login, register, logout, switchUser]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

// -------------------------------------------------------
// Hook
// -------------------------------------------------------

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return ctx;
}
