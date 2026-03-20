"use client";

import { Sidebar } from "./Sidebar";

export function AppShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen bg-mesh">
      <Sidebar />
      <main className="flex-1 lg:overflow-y-auto w-full relative">
        <div className="p-6 md:p-8 lg:p-10 pb-36 lg:pb-10 max-w-6xl mx-auto min-h-screen">
          {children}
        </div>
      </main>
    </div>
  );
}
