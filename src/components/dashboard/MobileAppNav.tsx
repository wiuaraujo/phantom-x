"use client";

import React, { useEffect, Suspense } from "react";
import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";
import { useDashboardNav } from "./DashboardNavContext";
import { Logo } from "@/components/ui/Logo";
import { ThemeToggle } from "@/components/ui/ThemeToggle";
import { auth } from "@/lib/auth";
import { siteConfig } from "@/config/site";
import {
  LayoutDashboard,
  Radio,
  Globe,
  Layers,
  Globe2,
  ListFilter,
  BarChart3,
  Sliders,
  Menu,
  X,
  LogOut,
  ExternalLink,
  ChevronRight,
  ShieldCheck,
  Code,
  User,
} from "lucide-react";

function MobileAppNavContent() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const { mobileDrawerOpen, openDrawer, closeDrawer } = useDashboardNav();
  const session = auth.getSession();
  const currentTab = searchParams?.get("tab");

  useEffect(() => {
    closeDrawer();
  }, [pathname, currentTab]);

  useEffect(() => {
    if (mobileDrawerOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [mobileDrawerOpen]);

  const bottomNavItems = [
    { label: "Visão Geral", href: "/dashboard", icon: LayoutDashboard },
    { label: "Ao Vivo", href: "/dashboard/live", icon: Radio, pulse: true },
    { label: "Globo 360º", href: "/dashboard/map", icon: Globe },
    { label: "Cloaker", href: "/dashboard/settings?tab=cloaker", icon: Sliders },
  ];

  const isAdmin = session?.user?.role === "admin" || session?.user?.email?.toLowerCase() === "wiuaraujo@gmail.com";

  const allNavItems = [
    { label: "Visão Geral & Matriz", href: "/dashboard", icon: LayoutDashboard },
    { label: "Auditoria Ao Vivo", href: "/dashboard/live", icon: Radio, pulse: true },
    { label: "Globo 360º", href: "/dashboard/map", icon: Globe },
    { label: "Campanhas", href: "/dashboard/campaigns", icon: Layers },
    { label: "Domínios", href: "/dashboard/domains", icon: Globe2 },
    { label: "Eventos", href: "/dashboard/events", icon: ListFilter },
    { label: "Cloudflare Worker", href: "/dashboard/settings?tab=worker", icon: Code, badge: "Edge" },
    { label: "Configurações do Cloaker", href: "/dashboard/settings?tab=cloaker", icon: Sliders },
    { label: "Configurações do Perfil", href: "/dashboard/settings?tab=profile", icon: User },
    ...(isAdmin ? [{ label: "Painel Admin Master", href: "/admin", icon: ShieldCheck, badge: "Master" }] : []),
  ];

  const isMoreActive =
    pathname.includes("/campaigns") ||
    pathname.includes("/domains") ||
    pathname.includes("/events") ||
    (pathname.includes("/settings") && currentTab !== "cloaker");

  return (
    <>
      {/* 1. NATIVE MOBILE BOTTOM APP BAR (Fixed at bottom on < lg) */}
      <nav className="lg:hidden fixed bottom-0 left-0 right-0 z-40 bg-brand-surface/95 dark:bg-black/95 backdrop-blur-xl border-t border-brand-border h-16 flex items-center justify-around px-2 pb-[env(safe-area-inset-bottom)] shadow-[0_-4px_20px_rgba(0,0,0,0.3)]">
        {bottomNavItems.map((item) => {
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
              className={`flex-1 flex flex-col items-center justify-center py-1 transition-all relative ${
                isActive
                  ? "text-brand-white font-semibold"
                  : "text-brand-muted hover:text-brand-secondary"
              }`}
            >
              <div className="relative">
                <Icon
                  className={`w-5 h-5 transition-transform ${
                    isActive ? "scale-110 text-brand-white" : ""
                  }`}
                />
                {item.pulse && (
                  <span className="absolute -top-1 -right-1 w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
                )}
              </div>
              <span className="text-[10px] mt-1 font-sans tracking-tight truncate max-w-[64px]">
                {item.label}
              </span>
              {isActive && (
                <span className="absolute -top-[1px] w-6 h-[2px] bg-white rounded-full" />
              )}
            </Link>
          );
        })}

        {/* Tab 5: Botão "Mais" que abre o Drawer com todas as ferramentas */}
        <button
          onClick={openDrawer}
          className={`flex-1 flex flex-col items-center justify-center py-1 transition-all relative ${
            isMoreActive || mobileDrawerOpen
              ? "text-brand-white font-semibold"
              : "text-brand-muted hover:text-brand-secondary"
          }`}
          aria-label="Abrir menu de navegação"
        >
          <div className="relative">
            <Menu className="w-5 h-5" />
            {isMoreActive && (
              <span className="absolute -top-1 -right-1 w-1.5 h-1.5 rounded-full bg-white" />
            )}
          </div>
          <span className="text-[10px] mt-1 font-sans tracking-tight">
            Mais
          </span>
          {(isMoreActive || mobileDrawerOpen) && (
            <span className="absolute -top-[1px] w-6 h-[2px] bg-white rounded-full" />
          )}
        </button>
      </nav>

      {/* 2. NATIVE MOBILE SLIDE-OVER DRAWER MENU (< lg) */}
      {mobileDrawerOpen && (
        <div className="lg:hidden fixed inset-0 z-50 flex">
          {/* Backdrop Blur */}
          <div
            className="fixed inset-0 bg-black/80 backdrop-blur-sm transition-opacity"
            onClick={closeDrawer}
          />

          {/* Drawer Slide-in Container */}
          <div className="relative w-80 max-w-[85vw] h-full bg-brand-surface border-r border-brand-border flex flex-col justify-between p-5 z-10 shadow-2xl animate-in slide-in-from-left duration-200 overflow-y-auto">
            {/* Top Brand & Close */}
            <div>
              <div className="flex items-center justify-between pb-4 border-b border-brand-border">
                <Link
                  href="/dashboard"
                  onClick={closeDrawer}
                  className="flex items-center space-x-2.5"
                >
                  <Logo size={36} />
                  <div>
                    <div className="font-poppins font-bold text-base text-brand-white tracking-tight">
                      {siteConfig.name}
                    </div>
                    <div className="text-[10px] font-mono text-brand-muted uppercase">
                      Console Mobile
                    </div>
                  </div>
                </Link>

                <button
                  onClick={closeDrawer}
                  className="p-1.5 rounded-lg bg-brand-hover text-brand-muted hover:text-white transition"
                  aria-label="Fechar menu"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* User Account Snippet */}
              <Link
                href="/dashboard/settings?tab=profile"
                onClick={closeDrawer}
                className="mt-4 p-3 rounded-xl bg-brand-black/60 border border-brand-border flex items-center space-x-3 hover:bg-brand-hover transition block"
              >
                <div className="w-9 h-9 rounded-full bg-white text-black font-mono font-bold text-sm flex items-center justify-center shrink-0 shadow-sm">
                  {session?.user.nickname
                    ? session.user.nickname[0].toUpperCase()
                    : session?.user.name
                    ? session.user.name[0].toUpperCase()
                    : "W"}
                </div>
                <div className="min-w-0 flex-1">
                  <div className="text-xs font-semibold text-brand-white truncate">
                    {session?.user.nickname ? `${session.user.nickname} (${session.user.name})` : session?.user.name || "Will (Operador)"}
                  </div>
                  <div className="text-[11px] text-brand-muted font-mono truncate">
                    {session?.user.timezone || "America/Sao_Paulo"}
                  </div>
                </div>
              </Link>

              {/* Navigation Links */}
              <nav className="mt-5 space-y-1">
                {allNavItems.map((item) => {
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
                      onClick={closeDrawer}
                      className={`flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-medium transition ${
                        isActive
                          ? "bg-neutral-900 text-white dark:bg-white dark:text-black font-semibold shadow-sm"
                          : "text-brand-secondary hover:text-brand-white hover:bg-brand-hover"
                      }`}
                    >
                      <div className="flex items-center space-x-3 truncate">
                        <div className="relative shrink-0">
                          <Icon
                            className={`w-4 h-4 ${
                              isActive ? "text-white dark:text-black" : "text-brand-secondary"
                            }`}
                          />
                          {item.pulse && (
                            <span className="absolute -top-1 -right-1 w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
                          )}
                        </div>
                        <span className="truncate">{item.label}</span>
                      </div>
                      <div className="flex items-center space-x-1 shrink-0 ml-2">
                        {item.badge && (
                          <span className="text-[9px] font-mono px-1.5 py-0.2 rounded border border-brand-border text-brand-muted bg-brand-surface">
                            {item.badge}
                          </span>
                        )}
                        <ChevronRight
                          className={`w-3.5 h-3.5 ${
                            isActive ? "text-white dark:text-black" : "text-brand-muted"
                          }`}
                        />
                      </div>
                    </Link>
                  );
                })}
              </nav>
            </div>

            {/* Bottom Actions */}
            <div className="pt-4 border-t border-brand-border space-y-3 mt-6">
              {/* Theme Toggle in Drawer */}
              <div className="flex items-center justify-between p-2 rounded-xl bg-brand-black/40 border border-brand-border">
                <span className="text-xs text-brand-secondary font-medium">Tema da Interface</span>
                <ThemeToggle showLabel />
              </div>

              {/* Status PoPs */}
              <div className="flex items-center space-x-2 text-[11px] font-mono text-brand-muted px-2">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                <span>14 PoPs operacionais • &lt; 18ms</span>
              </div>

              {/* External Link */}
              <Link
                href="/"
                onClick={closeDrawer}
                className="flex items-center space-x-2.5 px-3 py-2 text-xs text-brand-secondary hover:text-white transition rounded-lg"
              >
                <ExternalLink className="w-4 h-4" />
                <span>Ir para a Página Inicial</span>
              </Link>

              {/* Logout */}
              <button
                onClick={() => {
                  auth.logout();
                  window.location.href = "/login";
                }}
                className="w-full flex items-center space-x-2.5 px-3 py-2 text-xs text-rose-500 hover:text-white hover:bg-rose-600 transition rounded-lg font-medium"
              >
                <LogOut className="w-4 h-4" />
                <span>Desconectar Sessão</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

export const MobileAppNav: React.FC = () => {
  return (
    <Suspense fallback={null}>
      <MobileAppNavContent />
    </Suspense>
  );
};
