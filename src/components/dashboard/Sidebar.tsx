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
        <div className="h-16 flex items-center justify-between px-4 border-b border-brand-border">
          <Link href="/dashboard" className="flex items-center space-x-3 overflow-hidden group">
            <Logo size={36} className="group-hover:scale-105 transition-transform shrink-0" />
            {!collapsed && (
              <span className="font-poppins text-base font-bold tracking-tight text-brand-white truncate">
                {siteConfig.name}
              </span>
            )}
          </Link>
          <button
            onClick={() => setCollapsed(!collapsed)}
            className="p-1 rounded-md hover:bg-brand-surface text-brand-secondary hover:text-brand-white transition shrink-0"
            title={collapsed ? "Expandir menu" : "Recolher menu"}
          >
            {collapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
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
                className={`flex items-center px-3 py-2.5 rounded-xl text-xs font-medium transition-all group ${
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

        {!collapsed && (
          <Link
            href="/dashboard/settings"
            className="p-2.5 rounded-xl bg-brand-surface border border-brand-border flex items-center space-x-2.5 hover:bg-brand-hover transition block"
            title="Acessar Perfil e Configurações"
          >
            <div className="w-8 h-8 rounded-full bg-white text-black font-mono font-bold text-xs flex items-center justify-center shrink-0 shadow-sm">
              {displayName[0] ? displayName[0].toUpperCase() : "W"}
            </div>
            <div className="min-w-0 flex-1">
              <div className="text-xs font-semibold text-brand-white truncate">
                {displayName}
              </div>
              <div className="text-[10px] text-brand-muted font-mono truncate">
                {session?.user?.timezone || "America/Sao_Paulo"}
              </div>
            </div>
          </Link>
        )}

        <Link
          href="/"
          className="flex items-center px-3 py-2 rounded-xl text-xs text-brand-secondary hover:text-white hover:bg-brand-surface transition"
          title={collapsed ? "Landing Page" : undefined}
        >
          <ExternalLink className="w-4 h-4 shrink-0" />
          {!collapsed && <span className="ml-3">Landing Page</span>}
        </Link>

        <button
          onClick={() => {
            auth.logout();
            window.location.href = "/login";
          }}
          className="w-full flex items-center px-3 py-2 rounded-xl text-xs text-brand-secondary hover:text-white hover:bg-brand-surface transition"
          title={collapsed ? "Desconectar" : undefined}
        >
          <LogOut className="w-4 h-4 shrink-0" />
          {!collapsed && <span className="ml-3">Desconectar</span>}
        </button>
      </div>
    </aside>
  );
};
