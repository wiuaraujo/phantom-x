"use client";

import React, { useState, useEffect, useRef } from "react";
import Link from "next/link";
import {
  Bell,
  BellOff,
  CheckCircle2,
  ChevronDown,
  Radio,
  Menu,
  ShieldAlert,
} from "lucide-react";
import { auth } from "@/lib/auth";
import { store } from "@/lib/store";
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

interface SystemNotificationItem {
  id: string;
  title: string;
  desc: string;
  time: string;
  type: "threat" | "domain" | "campaign" | "info";
  timestamp: number;
}

function formatTimeAgo(date: Date): string {
  const diffSec = Math.floor((Date.now() - date.getTime()) / 1000);
  if (isNaN(diffSec) || diffSec < 60) return "Agora";
  if (diffSec < 3600) return `Há ${Math.floor(diffSec / 60)}m`;
  if (diffSec < 86400) return `Há ${Math.floor(diffSec / 3600)}h`;
  return `Há ${Math.floor(diffSec / 86400)}d`;
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
  const isAllDomains = (d?: string) => !d || d === "Todos os Domínios" || d === "All Domains" || d === "Todos los Dominios";
  const formatDomainLabel = (d?: string) => (isAllDomains(d) ? t.dashboard.allDomains : d || t.dashboard.allDomains);
  const { openDrawer } = useDashboardNav();
  const [showNotifications, setShowNotifications] = useState(false);
  const [notifications, setNotifications] = useState<SystemNotificationItem[]>([]);
  const [hasUnread, setHasUnread] = useState(false);
  const [domainDropdown, setDomainDropdown] = useState(false);
  const notifRef = useRef<HTMLDivElement>(null);
  const domainRef = useRef<HTMLDivElement>(null);

  const loadNotifications = () => {
    try {
      const userDomains = store.getDomains();
      const userCampaigns = store.getCampaigns();
      const userEvents = store.getEvents({ limit: 50 });

      // Em contas novas ou sem dados cadastrados, não há notificações
      if (userDomains.length === 0 && userCampaigns.length === 0 && userEvents.length === 0) {
        setNotifications([]);
        setHasUnread(false);
        return;
      }

      const items: SystemNotificationItem[] = [];

      // 1. Ameaças e mitigações de tráfego reais
      const threatEvents = userEvents.filter(
        (e) => e.isThreat || e.riskScore >= 60 || e.riskCategory === "bot" || e.decision === "mitigated_safe" || e.decision === "blocked"
      );

      threatEvents.slice(0, 3).forEach((e) => {
        const d = new Date(e.timestamp);
        items.push({
          id: `threat_${e.id}`,
          title: t.dashboard.systemMitigationTitle || "Mitigação de Tráfego Automático",
          desc: `${e.ipMasked} • ${e.countryCode || "BR"} • ${e.browser || "Bot/Crawler"} isolado na Whitepage`,
          time: formatTimeAgo(d),
          type: "threat",
          timestamp: d.getTime(),
        });
      });

      // 2. Domínios ativos/configurados
      userDomains.slice(0, 2).forEach((dom) => {
        const d = new Date(dom.updatedAt || dom.createdAt || Date.now());
        items.push({
          id: `dom_${dom.id}`,
          title: `Domínio: ${dom.name}`,
          desc: dom.status === "active" ? "Proxy Cloudflare ativo e operacional" : "Pendente de apontamento DNS",
          time: formatTimeAgo(d),
          type: "domain",
          timestamp: d.getTime(),
        });
      });

      // 3. Campanhas ativas
      userCampaigns.slice(0, 2).forEach((camp) => {
        const d = new Date(camp.updatedAt || camp.createdAt || Date.now());
        items.push({
          id: `camp_${camp.id}`,
          title: `Campanha: ${camp.name}`,
          desc: `Roteamento ativo (${camp.status === "active" ? "Protegida" : "Pausada"})`,
          time: formatTimeAgo(d),
          type: "campaign",
          timestamp: d.getTime(),
        });
      });

      items.sort((a, b) => b.timestamp - a.timestamp);

      // Verificação de leitura no localStorage
      const clearedKey = `phantom_user_${session?.user?.id || "guest"}_notifs_cleared`;
      let lastReadTime = 0;
      if (typeof window !== "undefined") {
        lastReadTime = Number(localStorage.getItem(clearedKey) || 0);
      }

      const unreadItems = items.filter((item) => item.timestamp > lastReadTime);
      setNotifications(items);
      setHasUnread(unreadItems.length > 0);
    } catch {
      setNotifications([]);
      setHasUnread(false);
    }
  };

  useEffect(() => {
    loadNotifications();
    const interval = setInterval(loadNotifications, 15000);
    return () => clearInterval(interval);
  }, [session?.user?.id]);

  const handleToggleNotifications = () => {
    const nextState = !showNotifications;
    setShowNotifications(nextState);
    if (nextState) {
      loadNotifications();
      if (hasUnread) {
        const clearedKey = `phantom_user_${session?.user?.id || "guest"}_notifs_cleared`;
        if (typeof window !== "undefined") {
          localStorage.setItem(clearedKey, Date.now().toString());
        }
        setHasUnread(false);
      }
    }
  };

  const handleClearAll = (e: React.MouseEvent) => {
    e.stopPropagation();
    const clearedKey = `phantom_user_${session?.user?.id || "guest"}_notifs_cleared`;
    if (typeof window !== "undefined") {
      localStorage.setItem(clearedKey, Date.now().toString());
    }
    setNotifications([]);
    setHasUnread(false);
  };

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
                <span className="truncate max-w-[140px]">{formatDomainLabel(selectedDomain)}</span>
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
                      <span className="truncate">{formatDomainLabel(dom)}</span>
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
              onClick={handleToggleNotifications}
              className="p-1.5 sm:p-2 rounded-lg bg-brand-surface hover:bg-brand-hover border border-brand-border text-brand-secondary hover:text-white transition relative cursor-pointer"
              title={t.dashboard.notifications}
              aria-label={t.dashboard.notifications}
            >
              <Bell className="w-4 h-4" />
              {hasUnread && (
                <span className="absolute top-1 right-1 w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
              )}
            </button>

            {showNotifications && (
              <div className="absolute right-0 mt-2 w-72 sm:w-80 max-w-[calc(100vw-24px)] bg-brand-surface border border-brand-border rounded-xl shadow-2xl p-4 z-50 text-xs font-sans">
                <div className="flex items-center justify-between border-b border-brand-border pb-2 mb-3">
                  <span className="font-semibold text-brand-white">{t.dashboard.systemEvents}</span>
                  {notifications.length > 0 ? (
                    <div className="flex items-center space-x-2">
                      <span className="text-[10px] text-brand-muted font-mono">
                        {notifications.length} {notifications.length === 1 ? "recente" : "recentes"}
                      </span>
                      <button
                        onClick={handleClearAll}
                        className="text-[10px] text-brand-muted hover:text-brand-white transition cursor-pointer underline"
                      >
                        {t.dashboard.clearNotifications}
                      </button>
                    </div>
                  ) : (
                    <span className="text-[10px] text-brand-muted font-mono">0 recentes</span>
                  )}
                </div>

                {notifications.length === 0 ? (
                  <div className="py-6 px-3 text-center space-y-2">
                    <div className="w-9 h-9 rounded-full bg-slate-100 dark:bg-white/5 border border-slate-200 dark:border-white/10 flex items-center justify-center mx-auto text-brand-muted">
                      <BellOff className="w-4 h-4 opacity-60" />
                    </div>
                    <div className="text-xs font-semibold text-brand-white">
                      {t.dashboard.noNotificationsTitle}
                    </div>
                    <p className="text-[11px] text-brand-muted leading-relaxed max-w-[240px] mx-auto">
                      {t.dashboard.noNotificationsDesc}
                    </p>
                  </div>
                ) : (
                  <div className="space-y-3 font-mono">
                    {notifications.map((notif) => {
                      const Icon =
                        notif.type === "threat"
                          ? ShieldAlert
                          : notif.type === "domain"
                          ? CheckCircle2
                          : Radio;
                      const iconColor =
                        notif.type === "threat"
                          ? "text-amber-500"
                          : notif.type === "domain"
                          ? "text-emerald-500"
                          : "text-sky-500";

                      return (
                        <div key={notif.id} className="flex items-start space-x-2.5">
                          <Icon className={`w-4 h-4 ${iconColor} shrink-0 mt-0.5`} />
                          <div className="min-w-0 flex-1">
                            <div className="flex items-center justify-between">
                              <span className="text-brand-white text-[11px] font-medium truncate">
                                {notif.title}
                              </span>
                              <span className="text-[9px] text-brand-muted shrink-0 ml-1">
                                {notif.time}
                              </span>
                            </div>
                            <div className="text-brand-muted text-[10px] leading-tight mt-0.5 truncate">
                              {notif.desc}
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
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
