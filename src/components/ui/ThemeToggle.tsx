"use client";

import React, { useEffect, useState } from "react";
import { Sun, Moon } from "lucide-react";
import { useTheme } from "@/lib/theme";

interface ThemeToggleProps {
  className?: string;
  showLabel?: boolean;
}

export const ThemeToggle: React.FC<ThemeToggleProps> = ({
  className = "",
  showLabel = false,
}) => {
  const { theme, toggleTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    // Render placeholder to avoid hydration layout shift
    return (
      <div
        className={`w-8 h-8 rounded-xl border border-brand-border bg-brand-surface opacity-60 ${className}`}
        aria-hidden="true"
      />
    );
  }

  const isDark = theme === "dark";

  return (
    <button
      onClick={toggleTheme}
      type="button"
      className={`relative inline-flex items-center justify-center p-2 rounded-xl transition-all duration-200 border border-brand-border bg-brand-surface hover:bg-brand-hover text-brand-secondary hover:text-brand-white shadow-sm group ${className}`}
      title={isDark ? "Mudar para Tema Claro" : "Mudar para Tema Escuro"}
      aria-label={isDark ? "Ativar Tema Claro" : "Ativar Tema Escuro"}
    >
      {isDark ? (
        <Sun className="w-4 h-4 text-amber-300 group-hover:rotate-45 transition-transform duration-300" />
      ) : (
        <Moon className="w-4 h-4 text-neutral-800 group-hover:-rotate-12 transition-transform duration-300" />
      )}
      {showLabel && (
        <span className="ml-2 text-xs font-mono font-medium text-brand-secondary group-hover:text-brand-white">
          {isDark ? "Tema Claro" : "Tema Escuro"}
        </span>
      )}
    </button>
  );
};
