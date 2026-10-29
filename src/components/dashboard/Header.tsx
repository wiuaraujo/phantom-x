"use client";

import React, { useState, useEffect, useRef } from "react";
import Link from "next/link";
import {
  Bell,
  CheckCircle2,
  ChevronDown,
  Radio,
  Menu,
  Clock,
  LogOut,
  Settings,
  User,
  Zap,
  Sparkles,
} from "lucide-react";
import { auth } from "@/lib/auth";
import { getPlanDefinition, PlanId } from "@/lib/plans";
import { UpgradePlanModal } from "@/components/dashboard/UpgradePlanModal";
import { ThemeToggle } from "@/components/ui/ThemeToggle";
import { useDashboardNav } from "./DashboardNavContext";
import { getDashboardGreeting } from "@/lib/userGreeting";

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
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [showUpgradeModal, setShowUpgradeModal] = useState(false);
  const [currentPlan, setCurrentPlan] = useState<PlanId>(session?.user?.plan || "free");
  const planDef = getPlanDefinition(currentPlan);
  const userMenuRef = useRef<HTMLDivElement>(null);
  const notifRef = useRef<HTMLDivElement>(null);
  const domainRef = useRef<HTMLDivElement>(null);

  const [greeting, setGreeting] = useState(() => getDashboardGreeting(session?.user));

  useEffect(() => {
    auth.syncPlanWithBackend().then((res) => {
      if (res.plan) setCurrentPlan(res.plan);
    });

    const handlePlanChange = (e: any) => {
      if (e.detail?.plan) setCurrentPlan(e.detail.plan);
    };
    window.addEventListener("phantom_plan_changed", handlePlanChange);

    const interval = setInterval(() => {
      auth.syncPlanWithBackend().then((res) => {
        if (res.plan) setCurrentPlan(res.plan);
      });
    }, 20000);

    return () => {
      window.removeEventListener("phantom_plan_changed", handlePlanChange);
      clearInterval(interval);
    };
  }, []);

  useEffect(() => {
    setGreeting(getDashboardGreeting(session?.user));
    const interval = setInterval(() => {
      setGreeting(getDashboardGreeting(session?.user));
    }, 15000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const handleDocClick = (e: MouseEvent | TouchEvent) => {
      const target = e.target as Node;
      if (userMenuRef.current && !userMenuRef.current.contains(target)) {
        setShowUserMenu(false);
      }
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

  const handleLogout = () => {
    auth.logout();
    window.location.href = "/login";
  };

  const handleAvatarClick = () => {
    setShowUserMenu((prev) => !prev);
  };

  return (
    <>
      {/* 
        ========================================================================
        MAIN DASHBOARD HEADER (Responsivo e com formato de App)
        ========================================================================
      */}
      <header className="h-14 sm:h-16 border-b border-brand-border bg-brand-black/90 backdrop-blur-md px-3 sm:px-6 flex items-center justify-between relative z-40 shrink-0">
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
          {/* Live Clock Pill (Somente data e horário) */}
          <div className="hidden md:flex items-center space-x-2 bg-brand-surface border border-brand-border px-3 py-1.5 rounded-xl text-xs font-mono">
            <Clock className="w-3.5 h-3.5 text-brand-white shrink-0" />
            <span className="text-brand-white font-medium">{greeting.dayAndTime}</span>
          </div>

          {/* Desktop-only: Real Backend Connection Badge */}
          <div className="hidden xl:flex items-center space-x-2 bg-brand-surface border border-brand-border px-2.5 py-1 rounded-md text-[11px] font-mono">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span className="text-brand-white font-medium">LIVE</span>
            <span className="text-brand-muted">|</span>
            <span className="text-brand-secondary">Edge sync</span>
          </div>

          {/* Desktop-only: Domain Selector Dropdown */}
          {domains && onSelectDomain && (
            <div ref={domainRef} className="relative hidden lg:block">
              <button
                onClick={() => setDomainDropdown(!domainDropdown)}
                className="flex items-center space-x-2 bg-brand-surface hover:bg-brand-hover border border-brand-border px-3 py-1.5 rounded-lg text-xs font-mono text-brand-white transition"
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

          {/* Plan Badge / Upgrade Trigger */}
          <button
            onClick={() => setShowUpgradeModal(true)}
            className={`hidden sm:flex items-center space-x-2 px-3 py-1.5 rounded-lg text-xs font-mono font-bold transition border ${
              currentPlan === "free"
                ? "bg-amber-500/10 text-amber-400 border-amber-500/30 hover:bg-amber-500/20"
                : currentPlan === "starter"
                ? "bg-blue-500/10 text-blue-400 border-blue-500/30 hover:bg-blue-500/20"
                : currentPlan === "growth" || currentPlan === "pro"
                ? "bg-purple-950/70 text-purple-300 border-purple-500/50 hover:bg-purple-900/50"
                : "bg-emerald-500/15 text-emerald-300 border-emerald-500/40 hover:bg-emerald-500/25"
            }`}
            title="Gerenciar Plano Phantom-X"
          >
            <span>{currentPlan === "free" ? "PLANO TRIAL" : planDef.name.toUpperCase()}</span>
            <span className="text-[10px] bg-white text-black px-1.5 py-0.5 rounded font-black tracking-wide">
              VER PLANOS
            </span>
          </button>

          {/* Theme Toggle (Visible everywhere) */}
          <ThemeToggle />

          {/* Notification Bell */}
          <div ref={notifRef} className="relative">
            <button
              onClick={() => setShowNotifications(!showNotifications)}
              className="p-1.5 sm:p-2 rounded-lg bg-brand-surface hover:bg-brand-hover border border-brand-border text-brand-secondary hover:text-white transition relative"
              title="Notificações do Sistema"
            >
              <Bell className="w-4 h-4" />
              <span className="absolute top-1 right-1 w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
            </button>

            {showNotifications && (
              <div className="absolute right-0 mt-2 w-72 sm:w-80 max-w-[calc(100vw-24px)] bg-brand-surface border border-brand-border rounded-xl shadow-2xl p-4 z-50 text-xs font-sans">
                <div className="flex items-center justify-between border-b border-brand-border pb-2 mb-3">
                  <span className="font-semibold text-brand-white">Eventos do Sistema</span>
                  <span className="text-[10px] text-brand-muted font-mono">3 recentes</span>
                </div>
                <div className="space-y-3 font-mono">
                  <div className="flex items-start space-x-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                    <div>
                      <div className="text-brand-white text-[11px] font-medium">Mitigação de Tráfego Automático</div>
                      <div className="text-brand-muted text-[10px]">12 requisições isoladas com sucesso</div>
                    </div>
                  </div>
                  <div className="flex items-start space-x-2">
                    <Radio className="w-4 h-4 text-brand-secondary shrink-0 mt-0.5" />
                    <div>
                      <div className="text-brand-white text-[11px] font-medium">Novo pico de acessos (Brasil)</div>
                      <div className="text-brand-muted text-[10px]">Latência média mantida em 18ms</div>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Quick Logout Button (Visible on md+) */}
          <button
            onClick={handleLogout}
            className="p-1.5 sm:p-2 rounded-lg bg-brand-surface hover:bg-rose-500/10 border border-brand-border hover:border-rose-500/30 text-brand-secondary hover:text-rose-500 transition"
            title="Sair do Sistema / Desconectar"
            aria-label="Sair do Sistema"
          >
            <LogOut className="w-4 h-4" />
          </button>

          {/* User Avatar & Dropdown Menu */}
          <div ref={userMenuRef} className="relative">
            <div
              onClick={handleAvatarClick}
              className="flex items-center space-x-2 pl-1.5 sm:pl-2 border-l border-brand-border cursor-pointer select-none group"
              title="Perfil e Opções de Conta"
            >
              <div className="w-7 h-7 rounded-full bg-white text-black font-mono font-bold text-xs flex items-center justify-center shrink-0 shadow-sm group-hover:scale-105 transition-transform">
                {greeting.displayName[0] ? greeting.displayName[0].toUpperCase() : "A"}
              </div>
              <div className="hidden xl:block text-left">
                <div className="text-xs font-semibold text-brand-white truncate max-w-[120px]">
                  {greeting.displayName}
                </div>
                <div className="text-[10px] text-brand-muted font-mono truncate max-w-[120px]">
                  {greeting.dayAndTime}
                </div>
              </div>
              <ChevronDown className="w-3 h-3 text-brand-muted group-hover:text-brand-white hidden sm:block transition" />
            </div>

            {/* User Profile Popover (Works seamlessly on desktop & mobile) */}
            {showUserMenu && (
              <div className="absolute right-0 mt-2 w-64 sm:w-72 bg-brand-surface border border-brand-border rounded-xl shadow-2xl py-2 z-50 animate-in fade-in zoom-in-95 duration-150">
                <div className="px-4 py-2.5 border-b border-brand-borderSubtle">
                  <div className="text-xs font-semibold text-brand-white flex items-center space-x-1.5">
                    <User className="w-3.5 h-3.5 text-brand-secondary" />
                    <span>{session?.user?.name || "Operador Phantom"}</span>
                  </div>
                  <div className="text-[11px] text-brand-muted font-mono mt-0.5 truncate">
                    {session?.user?.email || "operador@phantomx.pro"}
                  </div>
                  <div className="text-[10px] text-brand-secondary font-mono mt-1">
                    Fuso: {session?.user?.timezone || "America/Sao_Paulo"}
                  </div>
                </div>

                <div className="p-1.5 space-y-0.5 text-xs font-sans">
                  {/* Plan Quick Info & Upgrade */}
                  <div className="p-2 mb-1 rounded-lg bg-brand-surface/70 border border-brand-borderSubtle">
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="text-[10px] text-brand-muted uppercase font-mono">Plano Atual</div>
                        <div className="text-xs font-bold font-mono">
                          <span className={currentPlan === "free" ? "text-amber-400 font-bold" : "text-emerald-400 font-bold"}>
                            {currentPlan === "free" ? "Plano Trial" : planDef.name}
                          </span>
                        </div>
                      </div>
                      <button
                        onClick={() => {
                          setShowUserMenu(false);
                          setShowUpgradeModal(true);
                        }}
                        className="px-2.5 py-1 rounded-md bg-white text-black text-[10px] font-bold hover:bg-neutral-200 transition cursor-pointer"
                      >
                        Ver Planos
                      </button>
                    </div>
                  </div>

                  <Link
                    href="/dashboard/settings?tab=profile"
                    onClick={() => setShowUserMenu(false)}
                    className="flex items-center space-x-2 px-3 py-2 rounded-lg text-brand-secondary hover:text-brand-white hover:bg-brand-hover transition font-medium"
                  >
                    <User className="w-3.5 h-3.5 text-brand-secondary" />
                    <span>Configurações do Perfil</span>
                  </Link>

                  <Link
                    href="/dashboard/settings?tab=cloaker"
                    onClick={() => setShowUserMenu(false)}
                    className="flex items-center space-x-2 px-3 py-2 rounded-lg text-brand-secondary hover:text-brand-white hover:bg-brand-hover transition font-medium"
                  >
                    <Settings className="w-3.5 h-3.5 text-brand-secondary" />
                    <span>Configurações do Cloaker</span>
                  </Link>

                  <Link
                    href="/dashboard/settings?tab=worker"
                    onClick={() => setShowUserMenu(false)}
                    className="flex items-center space-x-2 px-3 py-2 rounded-lg text-brand-secondary hover:text-brand-white hover:bg-brand-hover transition font-medium"
                  >
                    <Radio className="w-3.5 h-3.5 text-brand-secondary" />
                    <span>Cloudflare Worker &amp; Edge</span>
                  </Link>

                  <button
                    onClick={handleLogout}
                    className="w-full flex items-center space-x-2 px-3 py-2 rounded-lg text-rose-500 hover:text-white hover:bg-rose-600 transition text-left font-medium"
                  >
                    <LogOut className="w-3.5 h-3.5" />
                    <span>Sair do Sistema</span>
                  </button>
                </div>
              </div>
            )}
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

      {/* Upgrade Plan Modal */}
      <UpgradePlanModal
        isOpen={showUpgradeModal}
        onClose={() => setShowUpgradeModal(false)}
      />
    </>
  );
};
