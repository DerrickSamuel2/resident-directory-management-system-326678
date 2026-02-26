"use client";

import React from "react";
import { AuthProvider } from "@/lib/auth/AuthContext";
import { ToastProvider } from "@/lib/toast/ToastContext";

export function AppProviders({ children }: { children: React.ReactNode }) {
  return (
    <ToastProvider>
      <AuthProvider>{children}</AuthProvider>
    </ToastProvider>
  );
}
