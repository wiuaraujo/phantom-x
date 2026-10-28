"use client";

import React, { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
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
  Settings,
  ChevronLeft,
  ChevronRight,
  LogOut,
  ExternalLink,
} from "lucide-react";
import { auth } from "@/lib/auth";
import { ThemeToggle } from "@/components/ui/ThemeToggle";

export const Sidebar: React.FC = () => {
  const pathname = usePathname();
  const [collapsed, setCollapsed] = useState(false);
  const session = auth.getSession();
  const displayName = session?.user?.nickname || session?.user?.name?.split(" ")[0] || "Operador";

  const navItems = [
    { label: "Visão Geral", href: "/dashboard", icon: LayoutDashboard },
    { label: "Monitoramento Ao Vivo", href: "/dashboard/live", icon: Radio, pulse: true },
    { label: "Mapa Global", href: "/dashboard/map", icon: Globe },
    { label: "Campanhas", href: "/dashboard/campaigns", icon: Layers },
    { label: "Domínios", href: "/dashboard/domains", icon: Globe2 },
    { label: "Eventos", href: "/dashboard/events", icon: ListFilter },
    { label: "Relatórios", href: "/dashboard/reports", icon: BarChart3 },
    { label: "Configurações", href: "/dashboard/settings", icon: Settings },
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
            className={`transition shrink-0 ${
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
            const isActive = pathname === item.href;

            return (
              <Link
                key={item.href}
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
                {!collapsed && <span className="ml-3 truncate">{item.label}</span>}
              </Link>
            );
          })}
        </nav>
      </div>

      {/* Bottom Section */}
      <div className="p-3 border-t border-brand-border space-y-2">
        <div className="flex items-center">
          <ThemeToggle className="w-full flex justify-center py-2" showLabel={!collapsed} />
        </div>

        {!collapsed && (
          <div className="px-3 py-2 rounded-xl bg-gradient-to-r from-neutral-900 to-brand-surface border border-brand-borderSubtle text-[11px] font-sans">
            <div className="text-brand-muted text-[10px] uppercase font-mono tracking-wider">Cluster</div>
            <div className="text-white font-medium flex items-center space-x-1.5 mt-0.5">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
              <span>edge-phantom-01</span>
            </div>
          </div>
        )}

        {/* User Profile Card */}
        <Link
          href="/dashboard/settings"
          className={`rounded-xl bg-brand-surface border border-brand-border flex items-center ${
            collapsed ? "justify-center p-2" : "p-2.5 space-x-2.5"
          } hover:bg-brand-hover transition block`}
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
          } rounded-xl text-xs text-rose-500 hover:text-white hover:bg-rose-600 transition group font-medium`}
          title="Sair do Sistema / Desconectar"
        >
          <LogOut className="w-4 h-4 shrink-0 transition-transform group-hover:scale-110" />
          {!collapsed && <span className="ml-3 font-semibold">Sair do Sistema</span>}
        </button>
      </div>
    </aside>
  );
};
