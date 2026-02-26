"use client";

import React from "react";

export function Input({
  label,
  error,
  ...props
}: React.InputHTMLAttributes<HTMLInputElement> & {
  label?: string;
  error?: string;
}) {
  return (
    <label className="block">
      {label ? (
        <span className="mb-1 block text-sm font-medium text-slate-700">
          {label}
        </span>
      ) : null}
      <input
        {...props}
        className={[
          "w-full rounded-md border px-3 py-2 text-sm outline-none",
          error ? "border-red-400 focus:border-red-500" : "border-slate-300 focus:border-blue-500",
          "bg-white text-slate-900 placeholder:text-slate-400",
        ].join(" ")}
      />
      {error ? <span className="mt-1 block text-xs text-red-600">{error}</span> : null}
    </label>
  );
}
