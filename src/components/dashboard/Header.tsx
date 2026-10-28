"use client";

import React, { useState } from "react";
import { Bell, CheckCircle2, ChevronDown, Radio, Menu } from "lucide-react";
import { auth } from "@/lib/auth";
import { ThemeToggle } from "@/components/ui/ThemeToggle";
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
  const { openDrawer } = useDashboardNav();
  const [showNotifications, setShowNotifications] = useState(false);
  const [domainDropdown, setDomainDropdown] = useState(false);

  return (
    <>
      {/* 
        ========================================================================
        MAIN DASHBOARD HEADER (Responsivo e com formato de App)
        ========================================================================
      */}
      <header className="h-14 sm:h-16 border-b border-brand-border bg-brand-black/90 backdrop-blur-md px-3 sm:px-6 flex items-center justify-between z-20 shrink-0">
        {/* Left: Mobile Menu Trigger + Page Title */}
        <div className="flex items-center space-x-2 sm:space-x-3 min-w-0">
          <button
            onClick={openDrawer}
            className="lg:hidden p-1.5 rounded-lg bg-brand-surface hover:bg-brand-hover border border-brand-border text-brand-secondary hover:text-white transition shrink-0"
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

        {/* Right: Actions & Controls */}
        <div className="flex items-center space-x-2 sm:space-x-3 shrink-0">
          {/* Desktop-only: Real Backend Connection Badge */}
          <div className="hidden lg:flex items-center space-x-2 bg-brand-surface border border-brand-border px-2.5 py-1 rounded-md text-[11px] font-mono">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span className="text-brand-white font-medium">LIVE</span>
            <span className="text-brand-muted">|</span>
            <span className="text-brand-secondary">Edge sync</span>
          </div>

          {/* Desktop-only: Domain Selector Dropdown */}
          {domains && onSelectDomain && (
            <div className="relative hidden lg:block">
              <button
                onClick={() => setDomainDropdown(!domainDropdown)}
                className="flex items-center space-x-2 bg-brand-surface hover:bg-brand-hover border border-brand-border px-3 py-1.5 rounded-lg text-xs font-mono text-brand-white transition"
              >
                <span className="truncate max-w-[140px]">{selectedDomain}</span>
                <ChevronDown className="w-3.5 h-3.5 text-brand-secondary" />
              </button>

              {domainDropdown && (
                <div className="absolute right-0 mt-2 w-56 bg-brand-surface border border-brand-border rounded-lg shadow-glow py-1 z-50 font-mono text-xs">
                  {domains.map((dom) => (
                    <button
                      key={dom}
                      onClick={() => {
                        onSelectDomain(dom);
                        setDomainDropdown(false);
                      }}
                      className={`w-full text-left px-3 py-2 hover:bg-brand-hover transition flex items-center justify-between ${
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

          {/* Desktop-only: Period Selector */}
          {onSelectPeriod && (
            <div className="hidden lg:flex items-center bg-brand-surface border border-brand-border rounded-lg p-0.5 text-xs font-mono">
              {["24h", "7d", "30d"].map((p) => (
                <button
                  key={p}
                  onClick={() => onSelectPeriod(p)}
                  className={`px-2.5 py-1 rounded-md transition ${
                    selectedPeriod === p
                      ? "bg-neutral-900 text-white dark:bg-white dark:text-black font-semibold"
                      : "text-brand-secondary hover:text-brand-white"
                  }`}
                >
                  {p}
                </button>
              ))}
            </div>
          )}

          {/* Theme Toggle (Visible everywhere) */}
          <ThemeToggle />

          {/* Notification Bell */}
          <div className="relative">
            <button
              onClick={() => setShowNotifications(!showNotifications)}
              className="p-1.5 sm:p-2 rounded-lg bg-brand-surface hover:bg-brand-hover border border-brand-border text-brand-secondary hover:text-white transition relative"
              title="Notificações do Sistema"
            >
              <Bell className="w-4 h-4" />
              <span className="absolute top-1 right-1 w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
            </button>

            {showNotifications && (
              <div className="absolute right-0 mt-2 w-72 sm:w-80 bg-brand-surface border border-brand-border rounded-xl shadow-glow p-4 z-50 text-xs font-sans">
                <div className="flex items-center justify-between border-b border-brand-border pb-2 mb-3">
                  <span className="font-semibold text-white">Eventos do Sistema</span>
                  <span className="text-[10px] text-brand-muted font-mono">3 recentes</span>
                </div>
                <div className="space-y-3 font-mono">
                  <div className="flex items-start space-x-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                    <div>
                      <div className="text-white text-[11px]">Mitigação de Tráfego Automático</div>
                      <div className="text-brand-muted text-[10px]">12 requisições isoladas com sucesso</div>
                    </div>
                  </div>
                  <div className="flex items-start space-x-2">
                    <Radio className="w-4 h-4 text-brand-secondary shrink-0 mt-0.5" />
                    <div>
                      <div className="text-white text-[11px]">Novo pico de acessos (Brasil)</div>
                      <div className="text-brand-muted text-[10px]">Latência média mantida em 18ms</div>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* User Avatar */}
          <div
            onClick={openDrawer}
            className="flex items-center space-x-2 pl-1.5 sm:pl-2 border-l border-brand-border cursor-pointer"
            title="Abrir perfil de operador"
          >
            <div className="w-7 h-7 rounded-full bg-white text-black font-mono font-bold text-xs flex items-center justify-center shrink-0 shadow-sm">
              {session?.user.name ? session.user.name[0].toUpperCase() : "A"}
            </div>
            <div className="hidden xl:block text-left">
              <div className="text-xs font-medium text-white truncate max-w-[120px]">
                {session?.user.name || "Operador"}
              </div>
              <div className="text-[10px] text-brand-muted font-mono truncate max-w-[120px]">
                {session?.user.organizationName || "Phantom-X Lab"}
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* 
        ========================================================================
        MOBILE SUB-HEADER FILTER BAR (Aparece no mobile apenas se houver filtros)
        Proporciona ergonomia de app nativo sem quebrar layout nem cortar nada
        ========================================================================
      */}
      {((domains && onSelectDomain) || onSelectPeriod) && (
        <div className="lg:hidden flex items-center justify-between gap-2 px-3 py-2 bg-brand-surface/50 border-b border-brand-border/60 overflow-x-auto shrink-0 text-xs font-mono">
          {domains && onSelectDomain && (
            <div className="relative shrink-0">
              <button
                onClick={() => setDomainDropdown(!domainDropdown)}
                className="flex items-center space-x-1.5 bg-brand-surface hover:bg-brand-hover border border-brand-border px-2.5 py-1 rounded-lg text-[11px] text-brand-white"
              >
                <span className="truncate max-w-[130px]">{selectedDomain}</span>
                <ChevronDown className="w-3 h-3 text-brand-secondary" />
              </button>

              {domainDropdown && (
                <div className="absolute left-0 mt-1.5 w-60 bg-brand-surface border border-brand-border rounded-xl shadow-glow py-1 z-50 text-[11px]">
                  {domains.map((dom) => (
                    <button
                      key={dom}
                      onClick={() => {
                        onSelectDomain(dom);
                        setDomainDropdown(false);
                      }}
                      className={`w-full text-left px-3 py-2 hover:bg-brand-hover transition flex items-center justify-between ${
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

          {onSelectPeriod && (
            <div className="flex items-center bg-brand-surface border border-brand-border rounded-lg p-0.5 text-[11px] shrink-0">
              {["24h", "7d", "30d"].map((p) => (
                <button
                  key={p}
                  onClick={() => onSelectPeriod(p)}
                  className={`px-2 py-0.5 rounded-md transition ${
                    selectedPeriod === p
                      ? "bg-neutral-900 text-white dark:bg-white dark:text-black font-semibold"
                      : "text-brand-secondary"
                  }`}
                >
                  {p}
                </button>
              ))}
            </div>
          )}

          <div className="flex items-center space-x-1 text-[10px] text-brand-muted shrink-0 pl-1">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
            <span>&lt; 18ms</span>
          </div>
        </div>
      )}
    </>
  );
};
