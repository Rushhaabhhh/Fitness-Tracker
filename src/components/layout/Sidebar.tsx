"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { signOut, useSession } from "next-auth/react";
import { motion } from "framer-motion";
import {
  LayoutDashboard, Utensils, Moon, User, History,
  LogOut, Sun, Zap
} from "lucide-react";
import { useTheme } from "./ThemeProvider";

const navItems = [
  { href: "/dashboard", icon: LayoutDashboard, label: "Dashboard" },
  { href: "/history", icon: History, label: "History" },
  { href: "/nutrition", icon: Utensils, label: "Nutrition" },
  { href: "/profile", icon: User, label: "Profile" },
];

export function Sidebar() {
  const pathname = usePathname();
  const { data: session } = useSession();
  const { theme, toggleTheme } = useTheme();

  return (
    <>
      {/* Desktop Sidebar (Floating Glass Pane) */}
      <aside className="hidden lg:flex flex-col w-[260px] h-[calc(100vh-2rem)] sticky top-4 mx-4 glass-strong rounded-[2rem] shadow-2xl z-40 overflow-hidden shrink-0">
        
        {/* Brand / Logo */}
        <div className="flex items-center gap-3 px-8 py-8 mb-4">
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-green-400 to-green-600 flex items-center justify-center shadow-lg shadow-green-500/30">
            <Zap className="w-5 h-5 text-white" fill="white" />
          </div>
          <span className="font-display font-black text-xl tracking-tight text-[rgb(var(--text-primary))]">
            Fit<span className="text-green-500">Track</span>
          </span>
        </div>

        {/* Nav Links */}
        <nav className="flex-1 px-5 space-y-2">
          {navItems.map(({ href, icon: Icon, label }) => {
            const active = pathname === href || pathname.startsWith(href + "/");
            return (
              <Link key={href} href={href} className="block relative focus:outline-none group">
                <div className={`relative px-4 py-3.5 flex items-center gap-3.5 rounded-2xl transition-all duration-300 z-10 ${
                  active ? "text-white" : "text-[rgb(var(--text-secondary))] group-hover:text-[rgb(var(--text-primary))] group-hover:translate-x-1"
                }`}>
                  <Icon className="w-5 h-5 relative z-10" />
                  <span className="font-semibold text-[15px] relative z-10">{label}</span>
                </div>
                {active && (
                  <motion.div
                    layoutId="desktopActiveTab"
                    className="absolute inset-0 bg-gradient-to-r from-green-500 to-green-600 rounded-2xl shadow-lg shadow-green-500/25 z-0"
                    transition={{ type: "spring", bounce: 0.15, duration: 0.5 }}
                  />
                )}
              </Link>
            );
          })}
        </nav>

        {/* Bottom actions */}
        <div className="p-5">
          {/* Theme & User */}
          <div className="glass rounded-[20px] p-4 flex flex-col gap-4 border border-[rgb(var(--border-glass))]/40 relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent pointer-events-none" />
            
            {session?.user && (
              <div className="flex items-center gap-3 relative z-10">
                <div className="w-9 h-9 rounded-full bg-gradient-to-br from-green-400/20 to-green-600/20 text-green-500 flex items-center justify-center font-black text-sm uppercase shadow-inner">
                  {session.user.name?.[0] || "U"}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-bold text-[rgb(var(--text-primary))] truncate">{session.user.name}</p>
                </div>
              </div>
            )}
            
            <div className="h-px bg-[rgb(var(--border-glass))]/30 flex-shrink-0" />
            
            <div className="flex items-center justify-between relative z-10">
              <button onClick={toggleTheme} className="p-2.5 rounded-xl text-[rgb(var(--text-secondary))] hover:text-green-500 hover:bg-green-500/10 transition-all group">
                {theme === "dark" ? <Sun size={18} className="group-hover:rotate-45 transition-transform" /> : <Moon size={18} className="group-hover:-rotate-12 transition-transform" />}
              </button>
              <button onClick={() => signOut({ callbackUrl: "/auth/login" })} className="p-2.5 rounded-xl text-red-400/80 hover:text-red-500 hover:bg-red-500/10 transition-all">
                <LogOut size={18} />
              </button>
            </div>
          </div>
        </div>
      </aside>

      {/* Mobile Bottom Dock */}
      <div className="lg:hidden fixed bottom-6 left-1/2 -translate-x-1/2 z-50 w-[92%] max-w-sm glass-strong rounded-[2rem] p-2 flex justify-between items-center shadow-2xl border border-[rgb(var(--border-glass))]/50">
        {navItems.map(({ href, icon: Icon }) => {
          const active = pathname === href || pathname.startsWith(href + "/");
          return (
            <Link key={href} href={href} className="relative flex-1 flex justify-center py-3.5 focus:outline-none group">
              <div className={`relative z-10 transition-all duration-300 ${active ? "text-white" : "text-[rgb(var(--text-secondary))] group-hover:text-[rgb(var(--text-primary))] group-hover:-translate-y-1"}`}>
                <Icon className="w-6 h-6" />
              </div>
              {active && (
                <motion.div
                  layoutId="mobileActiveTab"
                  className="absolute inset-y-1 inset-x-2 bg-gradient-to-t from-green-500 to-green-600 rounded-[1.5rem] shadow-lg shadow-green-500/40 z-0"
                  transition={{ type: "spring", bounce: 0.25, duration: 0.5 }}
                />
              )}
            </Link>
          );
        })}
      </div>
    </>
  );
}
