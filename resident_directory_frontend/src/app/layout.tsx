import type { Metadata } from "next";
import "./globals.css";
import { AppProviders } from "@/components/providers/AppProviders";
import { AppShell } from "@/components/shell/AppShell";

export const metadata: Metadata = {
  title: "Resident Directory",
  description:
    "A resident directory with privacy controls, search/filter, messaging, notifications, and admin tools.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body suppressHydrationWarning className="min-h-screen bg-slate-50 text-slate-900">
        <AppProviders>
          <AppShell>{children}</AppShell>
        </AppProviders>
      </body>
    </html>
  );
}
