"use client";

import React, { createContext, useCallback, useContext, useMemo, useState } from "react";

export type ToastKind = "success" | "error" | "info";

export type Toast = {
  id: string;
  kind: ToastKind;
  title: string;
  message?: string;
  createdAt: number;
};

type ToastContextValue = {
  toasts: Toast[];
  // PUBLIC_INTERFACE
  pushToast: (t: Omit<Toast, "id" | "createdAt">) => void;
  // PUBLIC_INTERFACE
  removeToast: (id: string) => void;
};

const ToastContext = createContext<ToastContextValue | null>(null);

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const removeToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const pushToast = useCallback(
    (t: Omit<Toast, "id" | "createdAt">) => {
      const id = `${Date.now()}-${Math.random().toString(16).slice(2)}`;
      const toast: Toast = { ...t, id, createdAt: Date.now() };
      setToasts((prev) => [toast, ...prev].slice(0, 5));

      // Auto-dismiss after 5s
      window.setTimeout(() => removeToast(id), 5000);
    },
    [removeToast],
  );

  const value = useMemo(() => ({ toasts, pushToast, removeToast }), [toasts, pushToast, removeToast]);

  return (
    <ToastContext.Provider value={value}>
      {children}
      <div className="fixed right-4 top-16 z-50 flex w-[min(360px,calc(100vw-2rem))] flex-col gap-2">
        {toasts.map((t) => (
          <div
            key={t.id}
            className={[
              "rounded-md border p-3 shadow-sm",
              "bg-white",
              t.kind === "success"
                ? "border-emerald-200"
                : t.kind === "error"
                  ? "border-red-200"
                  : "border-slate-200",
            ].join(" ")}
            role="status"
            aria-live="polite"
          >
            <div className="flex items-start justify-between gap-2">
              <div>
                <div className="text-sm font-semibold text-slate-900">{t.title}</div>
                {t.message ? <div className="mt-0.5 text-xs text-slate-600">{t.message}</div> : null}
              </div>
              <button
                className="rounded p-1 text-slate-500 hover:bg-slate-100 hover:text-slate-700"
                onClick={() => removeToast(t.id)}
                aria-label="Dismiss notification"
              >
                ✕
              </button>
            </div>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}

// PUBLIC_INTERFACE
export function useToast() {
  /** Hook to push and manage user-visible toast messages. */
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error("useToast must be used within ToastProvider");
  return ctx;
}
