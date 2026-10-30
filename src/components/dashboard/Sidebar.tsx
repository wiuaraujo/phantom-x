"use client";

import React, { useState, useEffect, Suspense } from "react";
import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";
import { siteConfig } from "@/config/site";
import { Logo } from "@/components/ui/Logo";
import {
  LayoutDashboard,
  Radio,
  Globe,
  Layers,
  Globe2,
  ListFilter,
  BarChart3,
  Sliders,
  ChevronLeft,
  ChevronRight,
  LogOut,
  ExternalLink,
  ShieldCheck,
  Code,
  User,
} from "lucide-react";
import { auth } from "@/lib/auth";
import { getPlanDefinition, PlanId } from "@/lib/plans";
import { UpgradePlanModal } from "@/components/dashboard/UpgradePlanModal";
import { useLanguage } from "@/lib/i18n";

function SidebarContent() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const { t } = useLanguage();
  const [collapsed, setCollapsed] = useState(false);
  const [showUpgradeModal, setShowUpgradeModal] = useState(false);
  const session = auth.getSession();
  const [currentPlan, setCurrentPlan] = useState<PlanId>(session?.user?.plan || "free");
  const planDef = getPlanDefinition(currentPlan);
  const displayName = session?.user?.nickname || session?.user?.name?.split(" ")[0] || "Operador";

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

  const currentTab = searchParams?.get("tab");
  const isAdmin = session?.user?.role === "admin" || session?.user?.email?.toLowerCase() === "wiuaraujo@gmail.com";

  const navItems = [
    { label: t.dashboard.overview, href: "/dashboard", icon: LayoutDashboard },
    { label: t.dashboard.liveAudit, href: "/dashboard/live", icon: Radio, pulse: true },
    { label: t.dashboard.globe360, href: "/dashboard/map", icon: Globe },
    { label: t.dashboard.campaigns, href: "/dashboard/campaigns", icon: Layers },
    { label: t.dashboard.domains, href: "/dashboard/domains", icon: Globe2 },
    { label: t.dashboard.events, href: "/dashboard/events", icon: ListFilter },
    { label: t.dashboard.cloudflareWorker, href: "/dashboard/settings?tab=worker", icon: Code, badge: "Edge" },
    { label: t.dashboard.cloakerSettings, href: "/dashboard/settings?tab=cloaker", icon: Sliders },
    { label: t.dashboard.profileSettings, href: "/dashboard/settings?tab=profile", icon: User },
    ...(isAdmin ? [{ label: t.dashboard.adminPanel, href: "/admin", icon: ShieldCheck, badge: "Master" }] : []),
  ];

  return (
    <aside
      className={`hidden lg:flex relative flex-col justify-between border-r border-brand-border bg-brand-black transition-all duration-300 z-30 font-sans ${
        collapsed ? "w-20" : "w-64"
      } min-h-screen shrink-0`}
    >
      {/* Top Section */}
      <div>
        {/* Brand Header */}
        <div
          className={`h-16 flex items-center border-b border-brand-border relative transition-all duration-200 ${
            collapsed ? "justify-center px-2" : "justify-between px-4"
          }`}
        >
          <Link
            href="/dashboard"
            className="flex items-center space-x-3 group min-w-0"
            title={siteConfig.name}
          >
            <Logo
              size={36}
              className="group-hover:scale-105 transition-transform shrink-0"
            />
            {!collapsed && (
              <span className="font-poppins text-base font-bold tracking-tight text-brand-white truncate">
                {siteConfig.name}
              </span>
            )}
          </Link>

          {/* Minimize / Expand Toggle Button */}
          <button
            onClick={() => setCollapsed(!collapsed)}
            className={`transition shrink-0 cursor-pointer ${
              collapsed
                ? "absolute -right-3 top-1/2 -translate-y-1/2 w-6 h-6 rounded-full bg-brand-surface border border-brand-border flex items-center justify-center text-brand-secondary hover:text-brand-white shadow-md z-40 hover:scale-110"
                : "p-1.5 rounded-lg hover:bg-brand-surface text-brand-secondary hover:text-brand-white"
            }`}
            title={collapsed ? "Expandir menu" : "Recolher menu"}
            aria-label={collapsed ? "Expandir menu lateral" : "Recolher menu lateral"}
          >
            {collapsed ? <ChevronRight className="w-3.5 h-3.5" /> : <ChevronLeft className="w-4 h-4" />}
          </button>
        </div>

        {/* Navigation Items */}
        <nav className="p-3 space-y-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isTabRoute = item.href.includes("?tab=");
            const tabName = isTabRoute ? item.href.split("tab=")[1] : null;

            const isActive = isTabRoute
              ? pathname === "/dashboard/settings" && currentTab === tabName
              : pathname === item.href && (!currentTab || pathname !== "/dashboard/settings");

            return (
              <Link
                key={item.href + item.label}
                href={item.href}
                className={`flex items-center ${
                  collapsed ? "justify-center px-0 py-2.5" : "px-3 py-2.5"
                } rounded-xl text-xs font-medium transition-all group ${
                  isActive
                    ? "bg-neutral-900 text-white dark:bg-white dark:text-black font-semibold shadow-sm"
                    : "text-brand-secondary hover:text-brand-white hover:bg-brand-surface"
                }`}
                title={collapsed ? item.label : undefined}
              >
                <div className="relative shrink-0">
                  <Icon
                    className={`w-4 h-4 ${
                      isActive ? "text-white dark:text-black" : "text-brand-secondary group-hover:text-brand-white"
                    }`}
                  />
                  {item.pulse && (
                    <span className="absolute -top-1 -right-1 w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
                  )}
                </div>
                {!collapsed && (
                  <div className="ml-3 flex-1 flex items-center justify-between truncate">
                    <span className="truncate">{item.label}</span>
                    {item.badge && (
                      <span className={`text-[9px] font-mono px-1.5 py-0.2 rounded border ml-1.5 ${
                        isActive
                          ? "border-current opacity-80"
                          : "border-brand-border text-brand-muted bg-brand-surface"
                      }`}>
                        {item.badge}
                      </span>
                    )}
                  </div>
                )}
              </Link>
            );
          })}
        </nav>
      </div>

      {/* Bottom Section */}
      <div className="p-3 border-t border-brand-border space-y-2">
        {!collapsed && (
          <div className="px-3 py-2 rounded-xl bg-gradient-to-r from-neutral-900 to-brand-surface border border-brand-borderSubtle text-[11px] font-sans">
            <div className="text-brand-muted text-[10px] uppercase font-mono tracking-wider">Cluster</div>
            <div className="text-white font-medium flex items-center space-x-1.5 mt-0.5">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
              <span>edge-phantom-01</span>
            </div>
          </div>
        )}

        {/* User Profile Card & Plan Status */}
        <div className="rounded-xl bg-brand-surface border border-brand-border p-2.5 space-y-2">
          <Link
            href="/dashboard/settings?tab=profile"
            className={`flex items-center ${
              collapsed ? "justify-center p-0" : "space-x-2.5"
            } hover:opacity-90 transition`}
            title={`Perfil: ${displayName} (${session?.user?.timezone || "America/Sao_Paulo"})`}
          >
            <div className="w-8 h-8 rounded-full bg-white text-black font-mono font-bold text-xs flex items-center justify-center shrink-0 shadow-sm">
              {displayName[0] ? displayName[0].toUpperCase() : "W"}
            </div>
            {!collapsed && (
              <div className="min-w-0 flex-1">
                <div className="text-xs font-semibold text-brand-white truncate">
                  {displayName}
                </div>
                <div className="text-[10px] text-brand-muted font-mono truncate">
                  {session?.user?.timezone || "America/Sao_Paulo"}
                </div>
              </div>
            )}
          </Link>

          {/* Tag do Plano & Botão Ver Planos */}
          {!collapsed ? (
            <div className="pt-2 border-t border-brand-border flex items-center justify-between gap-1.5">
              <span
                className={`text-[10px] font-mono px-2 py-0.5 rounded-md font-bold uppercase tracking-wider ${
                  currentPlan === "free"
                    ? "bg-amber-500/15 text-amber-400 border border-amber-500/30"
                    : "bg-emerald-500/15 text-emerald-400 border border-emerald-500/30"
                }`}
              >
                {currentPlan === "free" ? t.dashboard.trialPlan : planDef.name}
              </span>
              <button
                type="button"
                onClick={() => setShowUpgradeModal(true)}
                className="text-[10px] font-mono font-bold px-2.5 py-1 rounded-md bg-white text-black hover:bg-neutral-200 transition shadow-sm cursor-pointer"
              >
                {t.dashboard.viewPlans}
              </button>
            </div>
          ) : (
            <button
              type="button"
              onClick={() => setShowUpgradeModal(true)}
              className="w-full py-1 rounded bg-amber-500/20 text-amber-400 text-[9px] font-mono font-bold flex items-center justify-center border border-amber-500/30 cursor-pointer"
              title={t.dashboard.viewPlans}
            >
              Planos
            </button>
          )}
        </div>

        <Link
          href="/"
          className={`flex items-center ${
            collapsed ? "justify-center px-0 py-2" : "px-3 py-2"
          } rounded-xl text-xs text-brand-secondary hover:text-white hover:bg-brand-surface transition`}
          title={collapsed ? "Landing Page" : undefined}
        >
          <ExternalLink className="w-4 h-4 shrink-0" />
          {!collapsed && <span className="ml-3">Landing Page</span>}
        </Link>

        {/* Sair do Sistema / Desconectar */}
        <button
          onClick={() => {
            auth.logout();
            window.location.href = "/login";
          }}
          className={`w-full flex items-center ${
            collapsed ? "justify-center px-0 py-2.5" : "px-3 py-2.5"
          } rounded-xl text-xs text-rose-500 hover:text-white hover:bg-rose-600 transition group font-medium cursor-pointer`}
          title={t.dashboard.logout}
        >
          <LogOut className="w-4 h-4 shrink-0 transition-transform group-hover:scale-110" />
          {!collapsed && <span className="ml-3 font-semibold">{t.dashboard.logout}</span>}
        </button>
      </div>

      <UpgradePlanModal
        isOpen={showUpgradeModal}
        onClose={() => setShowUpgradeModal(false)}
        reason="Conheça nossos planos comerciais e escale suas camuflagens com limites ampliados."
      />
    </aside>
  );
}

export const Sidebar: React.FC = () => {
  return (
    <Suspense fallback={<aside className="hidden lg:flex w-64 min-h-screen bg-brand-black border-r border-brand-border" />}>
      <SidebarContent />
    </Suspense>
  );
};
