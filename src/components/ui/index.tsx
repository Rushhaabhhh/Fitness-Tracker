"use client";

import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { ReactNode } from "react";

// ---- Card ----
interface CardProps {
  children: ReactNode;
  className?: string;
  animate?: boolean;
  delay?: number;
  onClick?: () => void;
}

export function Card({ children, className, animate = true, delay = 0, onClick }: CardProps) {
  if (!animate) {
    return (
      <div className={cn("glass rounded-2xl p-5", className)} onClick={onClick}>
        {children}
      </div>
    );
  }
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay, duration: 0.35, ease: "easeOut" }}
      className={cn("glass rounded-2xl p-5", className)}
      onClick={onClick}
    >
      {children}
    </motion.div>
  );
}

// ---- ProgressBar ----
interface ProgressBarProps {
  value: number;
  max: number;
  label?: string;
  sublabel?: string;
  color?: string;
  height?: string;
  showPercent?: boolean;
}

export function ProgressBar({ value, max, label, sublabel, color, height = "h-2", showPercent }: ProgressBarProps) {
  const pct = max > 0 ? Math.min((value / max) * 100, 100) : 0;
  const gradientColor = color ?? (pct >= 100 ? "from-emerald-400 to-green-500" : pct >= 75 ? "from-green-400 to-teal-500" : pct >= 50 ? "from-yellow-400 to-amber-500" : "from-orange-400 to-red-500");

  return (
    <div className="space-y-1.5">
      {(label || sublabel || showPercent) && (
        <div className="flex justify-between text-xs">
          <span className="text-[rgb(var(--text-secondary))] font-medium">{label}</span>
          <span className="text-[rgb(var(--text-muted))]">
            {showPercent ? `${Math.round(pct)}%` : sublabel}
          </span>
        </div>
      )}
      <div className={cn("progress-bar w-full", height)}>
        <motion.div
          className={cn("progress-fill bg-gradient-to-r", gradientColor)}
          initial={{ width: "0%" }}
          animate={{ width: `${pct}%` }}
          transition={{ duration: 0.7, ease: "easeOut" }}
        />
      </div>
    </div>
  );
}

// ---- Badge ----
interface BadgeProps {
  children: ReactNode;
  variant?: "green" | "orange" | "blue" | "red" | "gray";
}

export function Badge({ children, variant = "green" }: BadgeProps) {
  const variants = {
    green: "bg-green-500/15 text-green-400 border-green-500/20",
    orange: "bg-orange-500/15 text-orange-400 border-orange-500/20",
    blue: "bg-blue-500/15 text-blue-400 border-blue-500/20",
    red: "bg-red-500/15 text-red-400 border-red-500/20",
    gray: "bg-[rgb(var(--border-glass))] text-[rgb(var(--text-muted))] border-[rgb(var(--border-glass))]",
  };
  return (
    <span className={cn("inline-flex items-center px-2.5 py-0.5 rounded-lg text-xs font-medium border", variants[variant])}>
      {children}
    </span>
  );
}

// ---- Stat ----
interface StatProps {
  label: string;
  value: string | number;
  unit?: string;
  sub?: string;
  icon?: ReactNode;
}

export function Stat({ label, value, unit, sub, icon }: StatProps) {
  return (
    <div className="space-y-1">
      <div className="flex items-center gap-1.5 text-xs text-[rgb(var(--text-muted))] font-medium uppercase tracking-wider">
        {icon}
        {label}
      </div>
      <div className="flex items-baseline gap-1">
        <span className="text-2xl font-display font-bold text-[rgb(var(--text-primary))]">{value}</span>
        {unit && <span className="text-sm text-[rgb(var(--text-muted))]">{unit}</span>}
      </div>
      {sub && <p className="text-xs text-[rgb(var(--text-muted))]">{sub}</p>}
    </div>
  );
}

// ---- Modal ----
interface ModalProps {
  open: boolean;
  onClose: () => void;
  title: string;
  children: ReactNode;
  maxWidth?: string;
}

export function Modal({ open, onClose, title, children, maxWidth = "max-w-lg" }: ModalProps) {
  if (!open) return null;
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.9, opacity: 0, y: 20 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        exit={{ scale: 0.9, opacity: 0, y: 20 }}
        transition={{ type: "spring", damping: 25, stiffness: 300 }}
        className={cn("w-full glass-strong rounded-2xl overflow-hidden", maxWidth)}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between px-6 py-4 border-b border-[rgb(var(--border-glass))]/20">
          <h3 className="font-display font-semibold text-lg text-[rgb(var(--text-primary))]">{title}</h3>
          <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-white/10 transition-colors text-[rgb(var(--text-muted))]">
            ✕
          </button>
        </div>
        <div className="p-6">{children}</div>
      </motion.div>
    </motion.div>
  );
}

// ---- Loading Skeleton ----
export function Skeleton({ className }: { className?: string }) {
  return <div className={cn("shimmer rounded-xl", className)} />;
}

// ---- Section Header ----
export function SectionHeader({ title, subtitle, action }: { title: string; subtitle?: string; action?: ReactNode }) {
  return (
    <div className="flex items-start justify-between mb-6">
      <div>
        <h2 className="font-display font-bold text-xl text-[rgb(var(--text-primary))]">{title}</h2>
        {subtitle && <p className="text-sm text-[rgb(var(--text-muted))] mt-0.5">{subtitle}</p>}
      </div>
      {action && <div>{action}</div>}
    </div>
  );
}

// ---- Input ----
interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  icon?: ReactNode;
}

export function Input({ label, error, icon, className, ...props }: InputProps) {
  return (
    <div className="space-y-1.5">
      {label && <label className="block text-xs font-medium text-[rgb(var(--text-secondary))] uppercase tracking-wider">{label}</label>}
      <div className="relative">
        {icon && <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[rgb(var(--text-muted))]">{icon}</span>}
        <input
          className={cn(
            "input-glass transition-shadow duration-200 outline-none",
            icon ? "pl-9" : "",
            error ? "border-red-500/50 focus:border-red-500 focus:ring-2 focus:ring-red-500/20" : "focus:ring-2 focus:ring-green-500/20 focus:border-green-500/50",
            className
          )}
          {...props}
          onFocus={(e) => {
            // Automatically select '0' or all content in numeric fields on click for fast UX
            if (e.target.type === "number" || e.target.value === "0") {
              e.target.select();
            }
            if (props.onFocus) props.onFocus(e);
          }}
        />
      </div>
      {error && <p className="text-xs text-red-400">{error}</p>}
    </div>
  );
}

// ---- Select ----
interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  error?: string;
  options: { value: string; label: string }[];
}

export function Select({ label, error, options, className, ...props }: SelectProps) {
  return (
    <div className="space-y-1.5">
      {label && <label className="block text-xs font-medium text-[rgb(var(--text-secondary))] uppercase tracking-wider">{label}</label>}
      <select className={cn("input-glass appearance-none cursor-pointer", error ? "border-red-500/50" : "", className)} {...props}>
        <option value="">Select...</option>
        {options.map((o) => (
          <option key={o.value} value={o.value} style={{ background: "rgb(var(--surface))" }}>
            {o.label}
          </option>
        ))}
      </select>
      {error && <p className="text-xs text-red-400">{error}</p>}
    </div>
  );
}

// ---- Toggle Button ----
interface ToggleButtonProps {
  checked: boolean;
  onChange: (v: boolean) => void;
  label?: string;
  disabled?: boolean;
}

export function ToggleButton({ checked, onChange, label, disabled }: ToggleButtonProps) {
  return (
    <button
      type="button"
      onClick={() => !disabled && onChange(!checked)}
      disabled={disabled}
      className={cn(
        "relative inline-flex h-6 w-11 items-center rounded-full transition-all duration-300",
        checked ? "bg-green-500" : "bg-[rgb(var(--border))]",
        disabled ? "opacity-50 cursor-not-allowed" : "cursor-pointer"
      )}
    >
      <motion.span
        animate={{ x: checked ? 22 : 2 }}
        transition={{ type: "spring", stiffness: 400, damping: 30 }}
        className="inline-block h-5 w-5 transform rounded-full bg-white shadow-md"
      />
      {label && <span className="sr-only">{label}</span>}
    </button>
  );
}
