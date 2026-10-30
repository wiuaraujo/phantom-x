"use client";

import React, { useState, useEffect, useRef } from "react";
import Link from "next/link";
import {
  Bell,
  CheckCircle2,
  ChevronDown,
  Radio,
  Menu,
} from "lucide-react";
import { auth } from "@/lib/auth";
import { ThemeToggle } from "@/components/ui/ThemeToggle";
import { LanguageSelector } from "@/components/ui/LanguageSelector";
import { useLanguage } from "@/lib/i18n";
import { useDashboardNav } from "./DashboardNavContext";

interface HeaderProps {
  title: string;
  subtitle?: string;
  domains?: string[];
  selectedDomain?: string;
  onSelectDomain?: (dom: string) => void;
  selectedPeriod?: string;
  onSelectPeriod?: (period: string) => void;
}

export const Header: React.FC<HeaderProps> = ({
  title,
  subtitle,
  domains = ["Todos os Domínios"],
  selectedDomain = "Todos os Domínios",
  onSelectDomain,
  selectedPeriod = "24h",
  onSelectPeriod,
}) => {
  const session = auth.getSession();
  const { t } = useLanguage();
  const { openDrawer } = useDashboardNav();
  const [showNotifications, setShowNotifications] = useState(false);
  const [domainDropdown, setDomainDropdown] = useState(false);
  const notifRef = useRef<HTMLDivElement>(null);
  const domainRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleDocClick = (e: MouseEvent | TouchEvent) => {
      const target = e.target as Node;
      if (notifRef.current && !notifRef.current.contains(target)) {
        setShowNotifications(false);
      }
      if (domainRef.current && !domainRef.current.contains(target)) {
        setDomainDropdown(false);
      }
    };
    document.addEventListener("mousedown", handleDocClick);
    document.addEventListener("touchstart", handleDocClick);
    return () => {
      document.removeEventListener("mousedown", handleDocClick);
      document.removeEventListener("touchstart", handleDocClick);
    };
  }, []);

  return (
    <>
      {/* 
        ========================================================================
        MAIN DASHBOARD HEADER (Clean, Minimalist, Ultra-Responsive)
        ========================================================================
      */}
      <header className="h-14 sm:h-16 border-b border-brand-border bg-brand-black/90 backdrop-blur-md px-3 sm:px-6 flex items-center justify-between relative z-40 shrink-0">
        {/* Left: Mobile Menu Trigger + Page Title */}
        <div className="flex items-center space-x-2 sm:space-x-3 min-w-0">
          <button
            onClick={openDrawer}
            className="lg:hidden p-1.5 rounded-lg bg-brand-surface hover:bg-brand-hover border border-brand-border text-brand-secondary hover:text-white transition shrink-0 cursor-pointer"
            aria-label="Abrir menu lateral"
          >
            <Menu className="w-4 h-4" />
          </button>

          <div className="min-w-0">
            <h1 className="text-sm sm:text-base font-semibold text-brand-white tracking-wide truncate">
              {title}
            </h1>
            {subtitle && (
              <p className="text-[11px] text-brand-secondary truncate hidden md:block">
                {subtitle}
              </p>
            )}
          </div>
        </div>

        {/* Right: Clean, Uncluttered Controls */}
        <div className="flex items-center space-x-2 sm:space-x-3 shrink-0">
          {/* Domain Selector Dropdown (Desktop) */}
          {domains && onSelectDomain && (
            <div ref={domainRef} className="relative hidden lg:block">
              <button
                onClick={() => setDomainDropdown(!domainDropdown)}
                className="flex items-center space-x-2 bg-brand-surface hover:bg-brand-hover border border-brand-border px-3 py-1.5 rounded-lg text-xs font-mono text-brand-white transition cursor-pointer"
              >
                <span className="truncate max-w-[140px]">{selectedDomain}</span>
                <ChevronDown className="w-3.5 h-3.5 text-brand-secondary" />
              </button>

              {domainDropdown && (
                <div className="absolute right-0 mt-2 w-56 bg-brand-surface border border-brand-border rounded-xl shadow-2xl py-1 z-50 font-mono text-xs">
                  {domains.map((dom) => (
                    <button
                      key={dom}
                      onClick={() => {
                        onSelectDomain(dom);
                        setDomainDropdown(false);
                      }}
                      className={`w-full text-left px-3 py-2 hover:bg-brand-hover transition flex items-center justify-between cursor-pointer ${
                        selectedDomain === dom ? "text-brand-white font-bold" : "text-brand-secondary"
                      }`}
                    >
                      <span className="truncate">{dom}</span>
                      {selectedDomain === dom && <CheckCircle2 className="w-3.5 h-3.5 text-brand-white" />}
                    </button>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Period Selector (Desktop) */}
          {onSelectPeriod && (
            <div className="hidden lg:flex items-center bg-brand-surface border border-brand-border rounded-lg p-0.5 text-xs font-mono">
              {[
                { key: "24h", label: t.dashboard.period24h },
                { key: "7d", label: t.dashboard.period7d },
                { key: "30d", label: t.dashboard.period30d },
              ].map((p) => (
                <button
                  key={p.key}
                  onClick={() => onSelectPeriod(p.key)}
                  className={`px-2.5 py-1 rounded-md transition cursor-pointer ${
                    selectedPeriod === p.key
                      ? "bg-neutral-900 text-white dark:bg-white dark:text-black font-semibold"
                      : "text-brand-secondary hover:text-brand-white"
                  }`}
                >
                  {p.label}
                </button>
              ))}
            </div>
          )}

          {/* Admin Badge Shortcut (Minimalist) */}
          {(session?.user?.role === "admin" || session?.user?.email?.toLowerCase() === "wiuaraujo@gmail.com") && (
            <Link
              href="/admin"
              className="inline-flex items-center space-x-1.5 px-2.5 py-1 rounded-full bg-red-500/10 border border-red-500/30 text-[10px] font-mono text-red-400 hover:bg-red-500/20 transition font-bold"
              title="Acessar Painel Master Admin"
            >
              <span className="w-1.5 h-1.5 rounded-full bg-red-400 animate-pulse" />
              <span>ADMIN</span>
            </Link>
          )}

          {/* Theme Toggle */}
          <ThemeToggle />

          {/* Language Selector */}
          <LanguageSelector />

          {/* Notification Bell */}
          <div ref={notifRef} className="relative">
            <button
              onClick={() => setShowNotifications(!showNotifications)}
              className="p-1.5 sm:p-2 rounded-lg bg-brand-surface hover:bg-brand-hover border border-brand-border text-brand-secondary hover:text-white transition relative cursor-pointer"
              title={t.dashboard.notifications}
              aria-label={t.dashboard.notifications}
            >
              <Bell className="w-4 h-4" />
              <span className="absolute top-1 right-1 w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
            </button>

            {showNotifications && (
              <div className="absolute right-0 mt-2 w-72 sm:w-80 max-w-[calc(100vw-24px)] bg-brand-surface border border-brand-border rounded-xl shadow-2xl p-4 z-50 text-xs font-sans">
                <div className="flex items-center justify-between border-b border-brand-border pb-2 mb-3">
                  <span className="font-semibold text-brand-white">{t.dashboard.systemEvents}</span>
                  <span className="text-[10px] text-brand-muted font-mono">2 recentes</span>
                </div>
                <div className="space-y-3 font-mono">
                  <div className="flex items-start space-x-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                    <div>
                      <div className="text-brand-white text-[11px] font-medium">{t.dashboard.systemMitigationTitle}</div>
                      <div className="text-brand-muted text-[10px]">{t.dashboard.systemMitigationDesc}</div>
                    </div>
                  </div>
                  <div className="flex items-start space-x-2">
                    <Radio className="w-4 h-4 text-brand-secondary shrink-0 mt-0.5" />
                    <div>
                      <div className="text-brand-white text-[11px] font-medium">{t.dashboard.trafficPeakTitle}</div>
                      <div className="text-brand-muted text-[10px]">{t.dashboard.trafficPeakDesc}</div>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* 
        ========================================================================
        MOBILE SUB-HEADER FILTER BAR (Aparece no mobile apenas se houver filtros)
        ========================================================================
      */}
      {((domains && onSelectDomain) || onSelectPeriod) && (
        <div className="lg:hidden flex items-center justify-between gap-2 px-3 py-2 bg-brand-surface/50 border-b border-brand-border/60 overflow-x-auto shrink-0 text-xs font-mono">
          {domains && onSelectDomain && (
            <select
              value={selectedDomain}
              onChange={(e) => onSelectDomain(e.target.value)}
              className="bg-brand-surface border border-brand-border rounded-lg px-2.5 py-1 text-brand-white text-xs font-mono focus:outline-none"
              aria-label="Selecionar Domínio"
            >
              {domains.map((dom) => (
                <option key={dom} value={dom} className="bg-brand-black text-white">
                  {dom}
                </option>
              ))}
            </select>
          )}

          {onSelectPeriod && (
            <div className="flex items-center space-x-1">
              {[
                { key: "24h", label: t.dashboard.period24h },
                { key: "7d", label: t.dashboard.period7d },
                { key: "30d", label: t.dashboard.period30d },
              ].map((p) => (
                <button
                  key={p.key}
                  onClick={() => onSelectPeriod(p.key)}
                  className={`px-2 py-1 rounded-md text-[11px] transition ${
                    selectedPeriod === p.key
                      ? "bg-neutral-900 text-white dark:bg-white dark:text-black font-semibold"
                      : "text-brand-secondary hover:text-white"
                  }`}
                >
                  {p.label}
                </button>
              ))}
            </div>
          )}
        </div>
      )}
    </>
  );
};
