"use client";

import React, { useState, useRef, useEffect } from "react";
import { useLanguage, Language } from "@/lib/i18n";
import { ChevronUp, ChevronDown } from "lucide-react";

// Crisp SVG Flags matching the reference design
export const FlagBR: React.FC<{ className?: string }> = ({ className = "w-5 h-3.5" }) => (
  <svg viewBox="0 0 32 22" className={`${className} rounded-sm overflow-hidden shrink-0 shadow-sm`}>
    <rect width="32" height="22" fill="#009b3a" />
    <polygon points="16,2.5 30,11 16,19.5 2,11" fill="#fedf00" />
    <circle cx="16" cy="11" r="5" fill="#002776" />
    <path
      d="M 11.5 12.5 C 13.5 10.5, 18.5 10.5, 20.5 12"
      stroke="#ffffff"
      strokeWidth="0.8"
      fill="none"
    />
  </svg>
);

export const FlagUS: React.FC<{ className?: string }> = ({ className = "w-5 h-3.5" }) => (
  <svg viewBox="0 0 32 22" className={`${className} rounded-sm overflow-hidden shrink-0 shadow-sm`}>
    <rect width="32" height="22" fill="#b22234" />
    <line x1="0" y1="3.38" x2="32" y2="3.38" stroke="#ffffff" strokeWidth="1.69" />
    <line x1="0" y1="6.77" x2="32" y2="6.77" stroke="#ffffff" strokeWidth="1.69" />
    <line x1="0" y1="10.15" x2="32" y2="10.15" stroke="#ffffff" strokeWidth="1.69" />
    <line x1="0" y1="13.54" x2="32" y2="13.54" stroke="#ffffff" strokeWidth="1.69" />
    <line x1="0" y1="16.92" x2="32" y2="16.92" stroke="#ffffff" strokeWidth="1.69" />
    <line x1="0" y1="20.31" x2="32" y2="20.31" stroke="#ffffff" strokeWidth="1.69" />
    <rect width="13" height="11.8" fill="#3c3b6e" />
    <circle cx="3.2" cy="3" r="0.8" fill="#ffffff" />
    <circle cx="6.5" cy="3" r="0.8" fill="#ffffff" />
    <circle cx="9.8" cy="3" r="0.8" fill="#ffffff" />
    <circle cx="4.8" cy="6" r="0.8" fill="#ffffff" />
    <circle cx="8.2" cy="6" r="0.8" fill="#ffffff" />
    <circle cx="3.2" cy="9" r="0.8" fill="#ffffff" />
    <circle cx="6.5" cy="9" r="0.8" fill="#ffffff" />
    <circle cx="9.8" cy="9" r="0.8" fill="#ffffff" />
  </svg>
);

export const FlagES: React.FC<{ className?: string }> = ({ className = "w-5 h-3.5" }) => (
  <svg viewBox="0 0 32 22" className={`${className} rounded-sm overflow-hidden shrink-0 shadow-sm`}>
    <rect width="32" height="5.5" fill="#aa151b" />
    <rect y="5.5" width="32" height="11" fill="#f1bf00" />
    <rect y="16.5" width="32" height="5.5" fill="#aa151b" />
    <rect x="7" y="8" width="3" height="5" fill="#aa151b" opacity="0.6" />
  </svg>
);

export const AVAILABLE_LANGUAGES: {
  code: Language;
  label: string;
  nativeLabel: string;
  country: string;
  Flag: React.FC<{ className?: string }>;
}[] = [
  { code: "pt", label: "Português", nativeLabel: "Português (Brasil)", country: "Brasil", Flag: FlagBR },
  { code: "en", label: "English", nativeLabel: "English (US)", country: "United States", Flag: FlagUS },
  { code: "es", label: "Español", nativeLabel: "Español (España)", country: "España", Flag: FlagES },
];

export const LanguageSelector: React.FC<{ className?: string }> = ({ className = "" }) => {
  const { language, setLanguage } = useLanguage();
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const current = AVAILABLE_LANGUAGES.find((l) => l.code === language) || AVAILABLE_LANGUAGES[0];
  const CurrentFlag = current.Flag;

  // Close when clicking outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleSelect = (code: Language) => {
    setLanguage(code);
    setIsOpen(false);
  };

  return (
    <div ref={containerRef} className={`relative inline-flex items-center ${className}`}>
      {/* Interactive Flag Capsule (Exact style from reference screenshot) */}
      <div className="flex items-center space-x-1.5 transition-all duration-300">
        {/* Main Pill: Selected Flag + Subtle Chevron Toggle */}
        <button
          type="button"
          onClick={() => setIsOpen(!isOpen)}
          className={`h-8 px-2.5 rounded-xl border flex items-center space-x-1.5 transition-all duration-200 cursor-pointer ${
            isOpen
              ? "bg-brand-surface border-sky-400/90 ring-2 ring-sky-400/40 shadow-glow-sm"
              : "bg-brand-black hover:bg-brand-surface border-brand-border hover:border-neutral-700"
          }`}
          title={`Idioma atual: ${current.nativeLabel} (Clique para alterar)`}
          aria-label="Selecionar idioma"
          aria-expanded={isOpen}
        >
          {isOpen ? (
            <ChevronUp className="w-3 h-3 text-neutral-300" />
          ) : (
            <ChevronDown className="w-3 h-3 text-brand-secondary" />
          )}
          <CurrentFlag className="w-5 h-3.5" />
        </button>

        {/* Expanded Options: Reveals other flags side-by-side cleanly */}
        {isOpen && (
          <div className="flex items-center space-x-1.5 animate-in fade-in zoom-in-95 duration-150">
            {AVAILABLE_LANGUAGES.filter((l) => l.code !== language).map((item) => {
              const ItemFlag = item.Flag;
              return (
                <button
                  key={item.code}
                  type="button"
                  onClick={() => handleSelect(item.code)}
                  className="h-8 px-2 rounded-xl bg-brand-surface hover:bg-brand-hover border border-brand-border hover:border-neutral-500 transition-all flex items-center justify-center hover:scale-105 active:scale-95 cursor-pointer shadow-sm"
                  title={`${item.nativeLabel} (${item.country})`}
                  aria-label={item.label}
                >
                  <ItemFlag className="w-5 h-3.5" />
                </button>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};
