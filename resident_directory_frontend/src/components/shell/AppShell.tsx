"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import React from "react";
import { useAuth } from "@/lib/auth/AuthContext";
import { Button } from "@/components/ui/Button";

function NavLink({
  href,
  children,
}: {
  href: string;
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const active = pathname === href || pathname?.startsWith(href + "/");

  return (
    <Link
      href={href}
      className={[
        "rounded-md px-3 py-2 text-sm font-medium",
        active
          ? "bg-slate-900 text-white"
          : "text-slate-700 hover:bg-slate-100 hover:text-slate-900",
      ].join(" ")}
    >
      {children}
    </Link>
  );
}

export function AppShell({ children }: { children: React.ReactNode }) {
  const { user, logout, isLoading } = useAuth();
  const router = useRouter();

  return (
    <div className="min-h-screen">
      <header className="sticky top-0 z-20 border-b border-slate-200 bg-white/90 backdrop-blur">
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-3 px-4 py-3">
          <div className="flex items-center gap-3">
            <Link href="/" className="text-base font-semibold text-slate-900">
              Resident Directory
            </Link>
            <nav className="hidden items-center gap-1 md:flex" aria-label="Primary">
              <NavLink href="/directory">Directory</NavLink>
              <NavLink href="/messages">Messages</NavLink>
              <NavLink href="/notifications">Notifications</NavLink>
              <NavLink href="/admin">Admin</NavLink>
            </nav>
          </div>

          <div className="flex items-center gap-2">
            {isLoading ? (
              <div className="h-9 w-24 animate-pulse rounded-md bg-slate-100" />
            ) : user ? (
              <>
                <span className="hidden text-sm text-slate-600 sm:inline">
                  {user.email ?? user.name ?? "Signed in"}
                </span>
                <Button
                  variant="secondary"
                  onClick={() => {
                    logout();
                    router.push("/login");
                  }}
                >
                  Sign out
                </Button>
              </>
            ) : (
              <>
                <Button variant="secondary" onClick={() => router.push("/login")}>
                  Sign in
                </Button>
                <Button onClick={() => router.push("/register")}>Create account</Button>
              </>
            )}
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-6xl px-4 py-6">{children}</main>

      <footer className="border-t border-slate-200 bg-white">
        <div className="mx-auto max-w-6xl px-4 py-4 text-xs text-slate-500">
          © {new Date().getFullYear()} Resident Directory
        </div>
      </footer>
    </div>
  );
}
