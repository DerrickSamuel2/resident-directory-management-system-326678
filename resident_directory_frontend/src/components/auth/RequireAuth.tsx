"use client";

import React, { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth/AuthContext";

export function RequireAuth({ children }: { children: React.ReactNode }) {
  const { isLoading, token } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (isLoading) return;
    if (!token) router.replace("/login");
  }, [isLoading, token, router]);

  if (isLoading) {
    return (
      <div className="rounded-md border border-slate-200 bg-white p-6">
        <div className="h-4 w-40 animate-pulse rounded bg-slate-100" />
        <div className="mt-3 h-3 w-72 animate-pulse rounded bg-slate-100" />
      </div>
    );
  }

  if (!token) return null;

  return <>{children}</>;
}
