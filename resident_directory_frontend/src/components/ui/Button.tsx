"use client";

import React from "react";

type ButtonVariant = "primary" | "secondary" | "danger" | "ghost";

export function Button({
  children,
  variant = "primary",
  className = "",
  ...props
}: React.ButtonHTMLAttributes<HTMLButtonElement> & { variant?: ButtonVariant }) {
  const base =
    "inline-flex items-center justify-center rounded-md px-3 py-2 text-sm font-medium transition-colors disabled:cursor-not-allowed disabled:opacity-60";
  const styles: Record<ButtonVariant, string> = {
    primary: "bg-blue-600 text-white hover:bg-blue-700",
    secondary: "bg-slate-100 text-slate-900 hover:bg-slate-200",
    danger: "bg-red-600 text-white hover:bg-red-700",
    ghost: "bg-transparent text-slate-700 hover:bg-slate-100",
  };

  return (
    <button {...props} className={[base, styles[variant], className].join(" ")}>
      {children}
    </button>
  );
}
