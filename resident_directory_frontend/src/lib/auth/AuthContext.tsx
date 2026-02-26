"use client";

import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import { apiRequest, ApiError } from "@/lib/api/apiClient";

type AuthUser = {
  id?: string;
  email?: string;
  name?: string;
  role?: string;
};

type AuthState = {
  isLoading: boolean;
  token: string | null;
  user: AuthUser | null;
};

type AuthContextValue = AuthState & {
  // PUBLIC_INTERFACE
  login: (params: { email: string; password: string }) => Promise<void>;
  // PUBLIC_INTERFACE
  register: (params: { email: string; password: string; name?: string }) => Promise<void>;
  // PUBLIC_INTERFACE
  logout: () => void;
};

const TOKEN_STORAGE_KEY = "rdms.auth.token";

const AuthContext = createContext<AuthContextValue | null>(null);

async function tryDecodeJwt(token: string): Promise<AuthUser | null> {
  // Lightweight decode for UI hints only; backend is source of truth.
  try {
    const parts = token.split(".");
    if (parts.length < 2) return null;
    const payloadJson = atob(parts[1].replace(/-/g, "+").replace(/_/g, "/"));
    const payload = JSON.parse(payloadJson);
    return {
      id: payload.sub,
      email: payload.email,
      name: payload.name,
      role: payload.role,
    };
  } catch {
    return null;
  }
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState<AuthState>({
    isLoading: true,
    token: null,
    user: null,
  });

  // On boot, load token from localStorage.
  useEffect(() => {
    const token = typeof window !== "undefined" ? window.localStorage.getItem(TOKEN_STORAGE_KEY) : null;
    if (!token) {
      setState({ isLoading: false, token: null, user: null });
      return;
    }
    void (async () => {
      const user = await tryDecodeJwt(token);
      setState({ isLoading: false, token, user });
    })();
  }, []);

  const logout = useCallback(() => {
    if (typeof window !== "undefined") window.localStorage.removeItem(TOKEN_STORAGE_KEY);
    setState({ isLoading: false, token: null, user: null });
  }, []);

  const login = useCallback(async ({ email, password }: { email: string; password: string }) => {
    setState((s) => ({ ...s, isLoading: true }));
    try {
      // NOTE: Backend OpenAPI is currently only a health-check in provided spec.
      // We wire to conventional endpoints; backend must implement these.
      const res = await apiRequest<{ access_token: string; token_type?: string; user?: AuthUser }>({
        method: "POST",
        path: "/auth/login",
        body: { email, password },
      });

      const token = res.access_token;
      if (!token) throw new ApiError({ message: "Login response missing access_token." });

      if (typeof window !== "undefined") window.localStorage.setItem(TOKEN_STORAGE_KEY, token);
      const decoded = await tryDecodeJwt(token);
      setState({ isLoading: false, token, user: res.user ?? decoded });
    } catch (e) {
      setState((s) => ({ ...s, isLoading: false }));
      throw e;
    }
  }, []);

  const register = useCallback(
    async ({ email, password, name }: { email: string; password: string; name?: string }) => {
      setState((s) => ({ ...s, isLoading: true }));
      try {
        const res = await apiRequest<{ access_token?: string; user?: AuthUser }>({
          method: "POST",
          path: "/auth/register",
          body: { email, password, name },
        });

        // If backend returns token, auto-login. Otherwise require explicit login.
        if (res.access_token) {
          if (typeof window !== "undefined") window.localStorage.setItem(TOKEN_STORAGE_KEY, res.access_token);
          const decoded = await tryDecodeJwt(res.access_token);
          setState({ isLoading: false, token: res.access_token, user: res.user ?? decoded });
        } else {
          setState({ isLoading: false, token: null, user: null });
        }
      } catch (e) {
        setState((s) => ({ ...s, isLoading: false }));
        throw e;
      }
    },
    [],
  );

  const value = useMemo<AuthContextValue>(
    () => ({
      ...state,
      login,
      register,
      logout,
    }),
    [state, login, register, logout],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

// PUBLIC_INTERFACE
export function useAuth() {
  /** Hook exposing canonical authentication flow and identity state. */
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
