"use client";

import React, { useState, useEffect, useRef, Suspense } from "react";
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
  Sliders,
  ChevronDown,
  LogOut,
  ShieldCheck,
  Code,
  User,
  HelpCircle,
  Sparkles,
} from "lucide-react";
import { auth } from "@/lib/auth";
import { getPlanDefinition, PlanId } from "@/lib/plans";
import { UpgradePlanModal } from "@/components/dashboard/UpgradePlanModal";
import { useLanguage } from "@/lib/i18n";
import { ThemeToggle } from "@/components/ui/ThemeToggle";

function SidebarContent() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const { t } = useLanguage();
  const [collapsed, setCollapsed] = useState(false);
  const [showUpgradeModal, setShowUpgradeModal] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const userMenuRef = useRef<HTMLDivElement>(null);

  const session = auth.getSession();
  const [currentPlan, setCurrentPlan] = useState<PlanId>(session?.user?.plan || "free");
  const planDef = getPlanDefinition(currentPlan);

  // Deriva o nome do operador para exibição no estilo do Resend (Image 2)
  const rawDisplayName =
    session?.user?.nickname?.trim() ||
    (session?.user?.name ? session.user.name.trim().split(" ")[0] : "") ||
    (session?.user?.email ? session.user.email.split("@")[0] : "operador");
  const displayName = rawDisplayName.toLowerCase();

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

  // Fechar dropdown de usuário ao clicar fora
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (userMenuRef.current && !userMenuRef.current.contains(e.target as Node)) {
        setShowUserMenu(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleLogout = () => {
    auth.logout();
    window.location.href = "/login";
  };

  const currentTab = searchParams?.get("tab");
  const isAdmin = session?.user?.role === "admin" || session?.user?.email?.toLowerCase() === "wiuaraujo@gmail.com";

  // Grupos de Navegação Minimalistas (Conforme Image 2 / Resend)
  const navGroups = [
    {
      id: "telemetry",
      items: [
        { label: t.dashboard.overview, href: "/dashboard", icon: LayoutDashboard },
        { label: t.dashboard.liveAudit, href: "/dashboard/live", icon: Radio, pulse: true },
        { label: t.dashboard.globe360, href: "/dashboard/map", icon: Globe },
      ],
    },
    {
      id: "traffic",
      items: [
        { label: t.dashboard.campaigns, href: "/dashboard/campaigns", icon: Layers },
        { label: t.dashboard.domains, href: "/dashboard/domains", icon: Globe2 },
        { label: t.dashboard.events, href: "/dashboard/events", icon: ListFilter },
      ],
    },
    {
      id: "hub",
      items: [
        { label: t.dashboard.areaPhantom, href: "/dashboard/area-phantom", icon: Sparkles, badge: "Hub" },
      ],
    },
    {
      id: "system",
      items: [
        { label: t.dashboard.cloudflareWorker, href: "/dashboard/settings?tab=worker", icon: Code, badge: "Edge" },
        { label: t.dashboard.cloakerSettings, href: "/dashboard/settings?tab=cloaker", icon: Sliders },
        { label: t.dashboard.profileSettings, href: "/dashboard/settings?tab=profile", icon: User },
        ...(isAdmin ? [{ label: t.dashboard.adminPanel, href: "/admin", icon: ShieldCheck, badge: "Master" }] : []),
      ],
    },
  ];

  return (
    <aside
      className={`hidden lg:flex relative flex-col justify-between border-r border-brand-border bg-brand-black transition-all duration-200 z-30 font-sans ${
        collapsed ? "w-16" : "w-60"
      } min-h-screen shrink-0`}
    >
      {/* Top Section */}
      <div className="flex flex-col">
        {/* Phantom-X Logo (Mantido como solicitado pelo usuário) */}
        <div className="h-14 flex items-center px-3.5 border-b border-brand-border/40">
          <Link href="/dashboard" className="flex items-center space-x-2.5 group min-w-0" title={siteConfig.name}>
            <Logo size={28} className="group-hover:scale-105 transition-transform shrink-0" />
            {!collapsed && (
              <span className="font-poppins font-bold text-sm tracking-tight text-brand-white truncate">
                {siteConfig.name}
              </span>
            )}
          </Link>
        </div>

        {/* User Workspace Dropdown (Identidade Fiel à Imagem 2 Enviada pelo Usuário) */}
        <div ref={userMenuRef} className="relative px-2.5 pt-2.5 pb-1">
          <button
            type="button"
            onClick={() => setShowUserMenu(!showUserMenu)}
            className={`w-full flex items-center ${
              collapsed ? "justify-center p-1.5" : "justify-between px-2.5 py-2"
            } rounded-xl bg-neutral-900/60 hover:bg-neutral-800/80 border border-neutral-800/80 text-left transition cursor-pointer group`}
            title={`Conectado como ${displayName}`}
          >
            <div className="flex items-center space-x-2.5 min-w-0">
              {/* Quadrado do Usuário com Cantos Arredondados (Igual Image 2) */}
              <div className="w-7 h-7 rounded-lg bg-neutral-800 border border-neutral-700/80 text-white font-mono font-bold text-xs flex items-center justify-center shrink-0 shadow-sm">
                {displayName[0] ? displayName[0].toUpperCase() : "W"}
              </div>
              {!collapsed && (
                <div className="min-w-0 flex-1">
                  <div className="text-xs font-semibold text-neutral-100 truncate">
                    {displayName}
                  </div>
                </div>
              )}
            </div>
            {!collapsed && (
              <ChevronDown
                className={`w-3.5 h-3.5 text-neutral-400 group-hover:text-white transition-transform duration-200 shrink-0 ml-1 ${
                  showUserMenu ? "rotate-180" : "rotate-0"
                }`}
              />
            )}
          </button>

          {/* Popover Minimalista de Opções do Usuário */}
          {showUserMenu && (
            <div className="absolute left-2.5 right-2.5 mt-1.5 bg-neutral-950 border border-neutral-800 rounded-xl shadow-2xl py-1.5 z-50 text-xs font-sans animate-in fade-in zoom-in-95 duration-150">
              <div className="px-3 py-2 border-b border-neutral-800/60">
                <div className="font-semibold text-white truncate text-xs">
                  {session?.user?.name || "Operador Phantom"}
                </div>
                <div className="text-[11px] text-neutral-400 font-mono truncate mt-0.5">
                  {session?.user?.email || "operador@phantom-x.pro"}
                </div>
              </div>

              <div className="p-1 space-y-0.5">
                <Link
                  href="/dashboard/settings?tab=profile"
                  onClick={() => setShowUserMenu(false)}
                  className="flex items-center space-x-2 px-2.5 py-1.5 rounded-lg text-neutral-300 hover:text-white hover:bg-neutral-900 transition"
                >
                  <User className="w-3.5 h-3.5 text-neutral-400" />
                  <span>Configurações do Perfil</span>
                </Link>
                <Link
                  href="/dashboard/settings?tab=cloaker"
                  onClick={() => setShowUserMenu(false)}
                  className="flex items-center space-x-2 px-2.5 py-1.5 rounded-lg text-neutral-300 hover:text-white hover:bg-neutral-900 transition"
                >
                  <Sliders className="w-3.5 h-3.5 text-neutral-400" />
                  <span>Configurações do Cloaker</span>
                </Link>
                <Link
                  href="/dashboard/settings?tab=worker"
                  onClick={() => setShowUserMenu(false)}
                  className="flex items-center space-x-2 px-2.5 py-1.5 rounded-lg text-neutral-300 hover:text-white hover:bg-neutral-900 transition"
                >
                  <Code className="w-3.5 h-3.5 text-neutral-400" />
                  <span>Cloudflare Worker</span>
                </Link>
                {isAdmin && (
                  <Link
                    href="/admin"
                    onClick={() => setShowUserMenu(false)}
                    className="flex items-center space-x-2 px-2.5 py-1.5 rounded-lg text-red-400 hover:text-white hover:bg-red-500/10 border border-red-500/20 transition font-semibold"
                  >
                    <ShieldCheck className="w-3.5 h-3.5 text-red-400" />
                    <span>Painel Admin Master</span>
                  </Link>
                )}
                <div className="border-t border-neutral-800/60 my-1" />
                <button
                  onClick={handleLogout}
                  className="w-full flex items-center space-x-2 px-2.5 py-1.5 rounded-lg text-rose-400 hover:text-white hover:bg-rose-950/60 transition text-left cursor-pointer"
                >
                  <LogOut className="w-3.5 h-3.5" />
                  <span>Sair do Sistema</span>
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Grupos de Navegação com Linhas Divisórias Discretas (Image 2) */}
        <nav className="p-2 space-y-2">
          {navGroups.map((group, groupIdx) => (
            <div key={group.id} className="space-y-0.5">
              {groupIdx > 0 && <div className="my-1.5 border-t border-neutral-800/60" />}
              {group.items.map((item) => {
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
                      collapsed ? "justify-center px-0 py-2" : "px-2.5 py-1.5"
                    } rounded-lg text-xs font-medium transition-colors group ${
                      isActive
                        ? "bg-neutral-800 text-white font-semibold"
                        : "text-neutral-400 hover:text-neutral-100 hover:bg-neutral-900/60"
                    }`}
                    title={collapsed ? item.label : undefined}
                  >
                    <div className="relative shrink-0">
                      <Icon
                        className={`w-4 h-4 ${
                          isActive ? "text-white" : "text-neutral-400 group-hover:text-neutral-200"
                        }`}
                      />
                      {(item as any).pulse && (
                        <span className="absolute -top-1 -right-1 w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
                      )}
                    </div>
                    {!collapsed && (
                      <div className="ml-2.5 flex-1 flex items-center justify-between truncate">
                        <span className="truncate">{item.label}</span>
                        {(item as any).badge && (
                          <span className="text-[9px] font-mono px-1.5 py-0.2 rounded border border-neutral-700 text-neutral-400 bg-neutral-900 ml-1.5">
                            {(item as any).badge}
                          </span>
                        )}
                      </div>
                    )}
                  </Link>
                );
              })}
            </div>
          ))}

          {/* Seção do Plano do Usuário no Menu Lateral (Sem Amarelo, Sem Coroinhas, Minimalista) */}
          <div className="pt-2 border-t border-neutral-800/60">
            {!collapsed ? (
              <div className="p-2.5 rounded-xl bg-neutral-900/50 border border-neutral-800 text-xs font-sans">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-[10px] text-neutral-400 uppercase font-mono tracking-wider">
                      Plano Ativo
                    </div>
                    <div className="text-xs font-semibold text-white mt-0.5">
                      {currentPlan === "free" ? "Plano Trial" : planDef.name}
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => setShowUpgradeModal(true)}
                    className="px-2.5 py-1 rounded-lg bg-neutral-800 hover:bg-neutral-700 text-neutral-200 hover:text-white text-[11px] font-medium border border-neutral-700/60 transition cursor-pointer"
                  >
                    Ver Planos
                  </button>
                </div>
              </div>
            ) : (
              <button
                type="button"
                onClick={() => setShowUpgradeModal(true)}
                className="w-full py-1.5 rounded-lg bg-neutral-800/60 hover:bg-neutral-800 text-neutral-300 text-[9px] font-mono font-medium border border-neutral-800 text-center cursor-pointer"
                title="Ver Planos"
              >
                Planos
              </button>
            )}
          </div>
        </nav>
      </div>

      {/* Pinned Bottom Footer (Barra de Ícones Minimalista da Imagem 2) */}
      <div className="p-2.5 border-t border-brand-border/40">
        <div className={`flex items-center ${collapsed ? "flex-col space-y-2" : "justify-between px-1"}`}>
          {/* Theme Display / Toggle */}
          <ThemeToggle />

          {/* Help / Central de Suporte */}
          <Link
            href="/dashboard/settings?tab=profile"
            className="p-1.5 rounded-lg text-neutral-400 hover:text-white hover:bg-neutral-900 transition"
            title="Ajuda & Suporte"
          >
            <HelpCircle className="w-4 h-4" />
          </Link>

          {/* Sair do Sistema / Logout */}
          <button
            onClick={handleLogout}
            className="p-1.5 rounded-lg text-neutral-400 hover:text-rose-400 hover:bg-neutral-900 transition cursor-pointer"
            title="Sair do Sistema"
            aria-label="Sair do Sistema"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Modal Minimalista de Upgrade de Planos */}
      <UpgradePlanModal
        isOpen={showUpgradeModal}
        onClose={() => setShowUpgradeModal(false)}
        currentPlan={currentPlan}
      />
    </aside>
  );
}

export const Sidebar: React.FC = () => {
  return (
    <Suspense
      fallback={<aside className="hidden lg:flex w-60 min-h-screen bg-brand-black border-r border-brand-border" />}
    >
      <SidebarContent />
    </Suspense>
  );
};
