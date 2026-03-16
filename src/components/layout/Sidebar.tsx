"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { signOut, useSession } from "next-auth/react";
import { motion } from "framer-motion";
import {
  LayoutDashboard, Utensils, Moon, User, History,
  LogOut, Sun, Zap, Menu, X
} from "lucide-react";
import { useTheme } from "./ThemeProvider";
import { useState } from "react";

const navItems = [
  { href: "/dashboard", icon: LayoutDashboard, label: "Dashboard" },
  { href: "/nutrition", icon: Utensils, label: "Nutrition" },
  { href: "/history", icon: History, label: "History" },
  { href: "/profile", icon: User, label: "Profile" },
];

export function Sidebar() {
  const pathname = usePathname();
  const { data: session } = useSession();
  const { theme, toggleTheme } = useTheme();
  const [mobileOpen, setMobileOpen] = useState(false);

  const NavContent = () => (
    <>
      {/* Logo */}
      <div className="flex items-center gap-3 px-4 py-6 mb-2">
        <div className="w-9 h-9 rounded-xl bg-green-500 flex items-center justify-center shadow-lg"
          style={{ boxShadow: "0 0 20px rgba(34,197,94,0.4)" }}>
          <Zap className="w-5 h-5 text-white" fill="white" />
        </div>
        <span className="font-display font-bold text-lg gradient-text">Fitness-Tracker</span>
      </div>

      {/* Nav Links */}
      <nav className="flex-1 px-3 space-y-1">
        {navItems.map(({ href, icon: Icon, label }) => {
          const active = pathname === href || pathname.startsWith(href + "/");
          return (
            <Link key={href} href={href} onClick={() => setMobileOpen(false)}>
              <motion.div
                whileHover={{ x: 4 }}
                whileTap={{ scale: 0.97 }}
                className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all duration-200 ${
                  active
                    ? "bg-green-500/10 text-green-400 border border-green-500/20"
                    : "text-[rgb(var(--text-secondary))] hover:bg-white/5 hover:text-[rgb(var(--text-primary))]"
                }`}
              >
                <Icon className={`w-4.5 h-4.5 ${active ? "text-green-400" : ""}`} size={18} />
                {label}
                {active && (
                  <motion.div
                    layoutId="activeIndicator"
                    className="ml-auto w-1.5 h-1.5 rounded-full bg-green-400"
                  />
                )}
              </motion.div>
            </Link>
          );
        })}
      </nav>

      {/* Bottom actions */}
      <div className="px-3 pb-6 space-y-1 mt-4 border-t border-[rgb(var(--border-glass))]/20 pt-4">
        {/* User info */}
        {session?.user && (
          <div className="px-4 py-3 rounded-xl glass mb-3">
            <p className="text-xs font-medium text-[rgb(var(--text-primary))] truncate">{session.user.name}</p>
            <p className="text-xs text-[rgb(var(--text-muted))] truncate">{session.user.email}</p>
          </div>
        )}

        {/* Theme toggle */}
        <motion.button
          whileTap={{ scale: 0.95 }}
          onClick={toggleTheme}
          className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm text-[rgb(var(--text-secondary))] hover:bg-white/5 transition-all"
        >
          {theme === "dark" ? <Sun size={18} /> : <Moon size={18} />}
          {theme === "dark" ? "Light Mode" : "Dark Mode"}
        </motion.button>

        {/* Sign out */}
        <motion.button
          whileTap={{ scale: 0.95 }}
          onClick={() => signOut({ callbackUrl: "/auth/login" })}
          className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm text-red-400/80 hover:bg-red-500/10 hover:text-red-400 transition-all"
        >
          <LogOut size={18} />
          Sign Out
        </motion.button>
      </div>
    </>
  );

  return (
    <>
      {/* Desktop Sidebar */}
      <aside className="hidden lg:flex flex-col w-64 h-screen sticky top-0 glass border-r border-[rgb(var(--border-glass))]/30">
        <NavContent />
      </aside>

      {/* Mobile Header */}
      <header className="lg:hidden fixed top-0 left-0 right-0 z-50 glass border-b border-[rgb(var(--border-glass))]/30 px-4 h-14 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-green-500 flex items-center justify-center">
            <Zap className="w-4 h-4 text-white" fill="white" />
          </div>
          <span className="font-display font-bold text-base gradient-text">Fitness-Tracker</span>
        </div>
        <button onClick={() => setMobileOpen(!mobileOpen)} className="p-2 rounded-xl hover:bg-white/10 transition-colors">
          {mobileOpen ? <X size={20} /> : <Menu size={20} />}
        </button>
      </header>

      {/* Mobile Drawer */}
      {mobileOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="lg:hidden fixed inset-0 z-40 bg-black/50 backdrop-blur-sm"
          onClick={() => setMobileOpen(false)}
        >
          <motion.aside
            initial={{ x: -280 }}
            animate={{ x: 0 }}
            exit={{ x: -280 }}
            transition={{ type: "spring", damping: 25, stiffness: 300 }}
            className="absolute left-0 top-0 bottom-0 w-72 flex flex-col"
            style={{ background: "rgb(var(--bg-secondary))" }}
            onClick={(e) => e.stopPropagation()}
          >
            <NavContent />
          </motion.aside>
        </motion.div>
      )}
    </>
  );
}
