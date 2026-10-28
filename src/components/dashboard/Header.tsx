"use client";

import React, { useState } from "react";
import { Bell, CheckCircle2, ChevronDown, Radio } from "lucide-react";
import { auth } from "@/lib/auth";
import { ThemeToggle } from "@/components/ui/ThemeToggle";

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
  const [showNotifications, setShowNotifications] = useState(false);
  const [domainDropdown, setDomainDropdown] = useState(false);

  return (
    <header className="h-16 border-b border-brand-border bg-brand-black/80 backdrop-blur-md px-6 flex items-center justify-between z-20">
      {/* Page Title & Subtitle */}
      <div>
        <h1 className="text-base font-semibold text-brand-white tracking-wide">{title}</h1>
        {subtitle && <p className="text-xs text-brand-secondary">{subtitle}</p>}
      </div>

      {/* Action Controls */}
      <div className="flex items-center space-x-3">
        {/* Theme Toggle (Dark / Light Mode) */}
        <ThemeToggle />

        {/* Real Backend Connection Badge */}
        <div className="hidden sm:flex items-center space-x-2 bg-brand-surface border border-brand-border px-2.5 py-1 rounded-md text-[11px] font-mono">
          <span className="w-2 h-2 rounded-full bg-neutral-900 dark:bg-white animate-pulse" />
          <span className="text-brand-white font-medium">LIVE</span>
          <span className="text-brand-muted">|</span>
          <span className="text-brand-secondary">Edge sync</span>
        </div>

        {/* Domain Selector Dropdown */}
        {domains && onSelectDomain && (
          <div className="relative">
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

        {/* Period Selector */}
        {onSelectPeriod && (
          <div className="flex items-center bg-brand-surface border border-brand-border rounded-lg p-0.5 text-xs font-mono">
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

        {/* Notification Bell */}
        <div className="relative">
          <button
            onClick={() => setShowNotifications(!showNotifications)}
            className="p-2 rounded-lg bg-brand-surface hover:bg-brand-hover border border-brand-border text-brand-secondary hover:text-white transition relative"
            title="Notificações do Sistema"
          >
            <Bell className="w-4 h-4" />
            <span className="absolute top-1.5 right-1.5 w-1.5 h-1.5 rounded-full bg-white" />
          </button>

          {showNotifications && (
            <div className="absolute right-0 mt-2 w-80 bg-brand-surface border border-brand-border rounded-xl shadow-glow p-4 z-50 text-xs">
              <div className="flex items-center justify-between border-b border-brand-border pb-2 mb-3">
                <span className="font-semibold text-white">Eventos do Sistema</span>
                <span className="text-[10px] text-brand-muted font-mono">3 recentes</span>
              </div>
              <div className="space-y-3 font-mono">
                <div className="flex items-start space-x-2">
                  <CheckCircle2 className="w-4 h-4 text-white shrink-0 mt-0.5" />
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
        <div className="flex items-center space-x-2.5 pl-2 border-l border-brand-border">
          <div className="w-7 h-7 rounded-full bg-white text-black font-mono font-bold text-xs flex items-center justify-center">
            {session?.user.name ? session.user.name[0].toUpperCase() : "A"}
          </div>
          <div className="hidden md:block text-left">
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
  );
};
