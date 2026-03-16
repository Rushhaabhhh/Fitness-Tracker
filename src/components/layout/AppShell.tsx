"use client";

import { Sidebar } from "./Sidebar";

export function AppShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen bg-mesh">
      <Sidebar />
      <main className="flex-1 lg:overflow-y-auto">
        <div className="lg:hidden h-14" /> {/* mobile header spacer */}
        <div className="p-4 md:p-6 lg:p-8 max-w-6xl mx-auto">
          {children}
        </div>
      </main>
    </div>
  );
}
