"use client";

import React, { useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
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
  Settings,
  Menu,
  X,
  LogOut,
  ExternalLink,
  ChevronRight,
  ShieldCheck,
} from "lucide-react";

export const MobileAppNav: React.FC = () => {
  const pathname = usePathname();
  const { mobileDrawerOpen, setMobileDrawerOpen, openDrawer, closeDrawer } = useDashboardNav();
  const session = auth.getSession();

  // Fecha o drawer automaticamente ao mudar de rota
  useEffect(() => {
    closeDrawer();
  }, [pathname]);

  // Previne scroll do body quando o drawer estiver aberto
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
    { label: "Mapa", href: "/dashboard/map", icon: Globe },
    { label: "Campanhas", href: "/dashboard/campaigns", icon: Layers },
  ];

  const allNavItems = [
    { label: "Visão Geral", href: "/dashboard", icon: LayoutDashboard },
    { label: "Monitoramento Ao Vivo", href: "/dashboard/live", icon: Radio, pulse: true },
    { label: "Mapa Global", href: "/dashboard/map", icon: Globe },
    { label: "Campanhas", href: "/dashboard/campaigns", icon: Layers },
    { label: "Domínios", href: "/dashboard/domains", icon: Globe2 },
    { label: "Eventos", href: "/dashboard/events", icon: ListFilter },
    { label: "Relatórios", href: "/dashboard/reports", icon: BarChart3 },
    { label: "Configurações", href: "/dashboard/settings", icon: Settings },
  ];

  const isMoreActive =
    pathname.includes("/domains") ||
    pathname.includes("/events") ||
    pathname.includes("/reports") ||
    pathname.includes("/settings");

  return (
    <>
      {/* 
        ========================================================================
        1. NATIVE MOBILE BOTTOM APP BAR (Fixed at bottom on < lg)
        Estilo App Nativo iOS / Android: 100% responsivo, ergonômico e limpo
        ========================================================================
      */}
      <nav className="lg:hidden fixed bottom-0 left-0 right-0 z-40 bg-brand-surface/95 dark:bg-black/95 backdrop-blur-xl border-t border-brand-border h-16 flex items-center justify-around px-2 pb-[env(safe-area-inset-bottom)] shadow-[0_-4px_20px_rgba(0,0,0,0.3)]">
        {bottomNavItems.map((item) => {
          const Icon = item.icon;
          const isActive = pathname === item.href;

          return (
            <Link
              key={item.href}
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
              <span className="text-[10px] mt-1 font-sans tracking-tight">
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

      {/* 
        ========================================================================
        2. NATIVE MOBILE SLIDE-OVER DRAWER MENU (< lg)
        ========================================================================
      */}
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
              <div className="mt-4 p-3 rounded-xl bg-brand-black/60 border border-brand-border flex items-center space-x-3">
                <div className="w-9 h-9 rounded-full bg-white text-black font-mono font-bold text-sm flex items-center justify-center shrink-0">
                  {session?.user.name ? session.user.name[0].toUpperCase() : "A"}
                </div>
                <div className="min-w-0 flex-1">
                  <div className="text-xs font-semibold text-brand-white truncate">
                    {session?.user.name || "Operador Phantom-X"}
                  </div>
                  <div className="text-[11px] text-brand-muted font-mono truncate">
                    {session?.user.email || "admin@phantomx.pro"}
                  </div>
                </div>
              </div>

              {/* Navigation Links */}
              <nav className="mt-5 space-y-1">
                {allNavItems.map((item) => {
                  const Icon = item.icon;
                  const isActive = pathname === item.href;

                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      onClick={closeDrawer}
                      className={`flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-medium transition ${
                        isActive
                          ? "bg-neutral-900 text-white dark:bg-white dark:text-black font-semibold shadow-sm"
                          : "text-brand-secondary hover:text-brand-white hover:bg-brand-hover"
                      }`}
                    >
                      <div className="flex items-center space-x-3">
                        <div className="relative">
                          <Icon
                            className={`w-4 h-4 ${
                              isActive ? "text-white dark:text-black" : "text-brand-secondary"
                            }`}
                          />
                          {item.pulse && (
                            <span className="absolute -top-1 -right-1 w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
                          )}
                        </div>
                        <span>{item.label}</span>
                      </div>
                      <ChevronRight
                        className={`w-3.5 h-3.5 ${
                          isActive ? "text-white dark:text-black" : "text-brand-muted"
                        }`}
                      />
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
                className="w-full flex items-center space-x-2.5 px-3 py-2 text-xs text-red-400 hover:text-red-300 hover:bg-red-950/20 transition rounded-lg"
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
};
