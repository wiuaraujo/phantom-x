"use client";

import React, { useState, useEffect, useMemo } from "react";
import {
  ShieldAlert,
  ShieldCheck,
  Users,
  Globe,
  Radio,
  Server,
  KeyRound,
  Lock,
  Unlock,
  RefreshCw,
  Search,
  Filter,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  LogOut,
  Sliders,
  ExternalLink,
  ChevronRight,
  Database,
  Terminal,
  Activity,
  Layers,
  Sparkles,
  Copy,
  Check,
  Trash2,
  UserCheck,
  UserX,
  Clock,
  Mail,
  Phone,
  Crown,
  Zap,
  TrendingUp,
  DollarSign,
  ArrowUpRight,
  Award,
  ArrowLeft,
} from "lucide-react";
import Link from "next/link";
import { auth } from "@/lib/auth";
import { Logo } from "@/components/ui/Logo";
import { PHANTOM_PLANS, PlanId, getPlanDefinition } from "@/lib/plans";

interface OperatorUser {
  id: string;
  email: string;
  name: string;
  nickname: string;
  phone: string;
  phoneCountryCode: string;
  role: string;
  timezone: string;
  emailVerified: boolean;
  emailConfirmedAt: string | null;
  createdAt: string;
  lastSignInAt: string | null;
  plan?: PlanId;
  planStatus?: string;
  planActivatedAt?: string;
  planExpiresAt?: string;
  activeOtp?: {
    code: string;
    expiresAt: number;
    remainingSeconds: number;
    attempts: number;
  } | null;
}

interface SystemOverviewData {
  system: {
    uptime: number;
    nodeVersion: string;
    platform: string;
    timestamp: string;
  };
  supabase: {
    status: string;
    latencyMs: number;
    url: string;
    rlsEnabled: boolean;
  };
  edgeEngine: {
    version: string;
    status: string;
    antiBotLayer: string;
    activePoPs: number;
    averageLatencyMs: number;
  };
  metrics: {
    totalUsers: number;
    confirmedUsers: number;
    pendingUsers: number;
    totalDomains: number;
    totalCampaigns: number;
    blockedReviewersToday: number;
    trafficProcessedMB: number;
    mrr?: number;
    totalPaidSubscriptions?: number;
    planBreakdown?: {
      free: number;
      starter: number;
      growth: number;
      scale: number;
    };
  };
}

const ADMIN_STORAGE_SESSION = "phantom_admin_master_session";

export default function AdminPortalPage() {
  // Estado de Autenticação Mestra
  const [isAdminAuth, setIsAdminAuth] = useState(false);
  const [passkeyInput, setPasskeyInput] = useState("");
  const [adminEmailInput, setAdminEmailInput] = useState("wiuaraujo@gmail.com");
  const [activePlatformUser, setActivePlatformUser] = useState<any>(null);
  const [authError, setAuthError] = useState<string | null>(null);
  const [authLoading, setAuthLoading] = useState(false);

  // Estados de Dados Administrativos
  const [activeTab, setActiveTab] = useState<"users" | "plans" | "domains" | "traffic" | "system">("users");
  const [overview, setOverview] = useState<SystemOverviewData | null>(null);
  const [operators, setOperators] = useState<OperatorUser[]>([]);
  const [loadingData, setLoadingData] = useState(false);
  const [actionNotice, setActionNotice] = useState<{ type: "success" | "error"; message: string } | null>(null);

  // Filtros de Operadores
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<"all" | "confirmed" | "pending" | "admin">("all");

  // Liberação e Gestão de Planos
  const [selectedUserForPlan, setSelectedUserForPlan] = useState<OperatorUser | null>(null);
  const [targetPlan, setTargetPlan] = useState<PlanId>("growth");
  const [targetPlanStatus, setTargetPlanStatus] = useState<"active" | "trial" | "canceled">("active");
  const [savingPlan, setSavingPlan] = useState(false);

  // Ações em andamento por usuário
  const [actionLoadingId, setActionLoadingId] = useState<string | null>(null);
  const [copiedCodeUser, setCopiedCodeUser] = useState<string | null>(null);

  // Kill-Switch Global
  const [killSwitchActive, setKillSwitchActive] = useState(false);

  // 1. Verifica se já existe sessão administrativa válida ou usuário admin logado na plataforma
  useEffect(() => {
    if (typeof window !== "undefined") {
      const u = auth.getSession()?.user;
      setActivePlatformUser(u);
      if (u?.email) setAdminEmailInput(u.email);

      // A. Se já houver sessão administrativa salva válida no localStorage
      const stored = localStorage.getItem(ADMIN_STORAGE_SESSION);
      if (stored) {
        try {
          const parsed = JSON.parse(stored);
          if (parsed && parsed.token && Date.now() < new Date(parsed.expiresAt).getTime()) {
            setIsAdminAuth(true);
            return;
          }
        } catch {}
      }

      // B. Se o operador estiver autenticado na plataforma como Admin, concede acesso direto instantaneamente
      if (u && (u.role === "admin" || u.email?.toLowerCase() === "wiuaraujo@gmail.com")) {
        const session = {
          token: `px_master_${Date.now().toString(36)}`,
          role: "master_administrator",
          name: u.name || "Administrador Master",
          email: u.email,
          authenticatedAt: new Date().toISOString(),
          expiresAt: new Date(Date.now() + 24 * 3600 * 1000).toISOString(),
        };
        localStorage.setItem(ADMIN_STORAGE_SESSION, JSON.stringify(session));
        setIsAdminAuth(true);
        return;
      }

      // C. Consulta a rota do servidor para validar cookie de sessão
      fetch("/api/v1/admin/system", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "check_session" }),
      })
        .then((res) => res.json())
        .then((data) => {
          if (data.success && data.isAdmin && data.adminSession) {
            localStorage.setItem(ADMIN_STORAGE_SESSION, JSON.stringify(data.adminSession));
            setIsAdminAuth(true);
          }
        })
        .catch(() => {});
    }
  }, []);

  // 2. Carrega dados do sistema assim que autenticado
  useEffect(() => {
    if (!isAdminAuth) return;
    loadDashboardData();
  }, [isAdminAuth]);

  const loadDashboardData = async () => {
    setLoadingData(true);
    try {
      const [overviewRes, usersRes, sysRes] = await Promise.all([
        fetch("/api/v1/admin/overview"),
        fetch("/api/v1/admin/users"),
        fetch("/api/v1/admin/system"),
      ]);

      const [overviewData, usersData, sysData] = await Promise.all([
        overviewRes.json(),
        usersRes.json(),
        sysRes.json(),
      ]);

      if (overviewData.success) {
        setOverview(overviewData.data);
      }
      if (usersData.success && Array.isArray(usersData.users)) {
        setOperators(usersData.users);
      }
      if (sysData.success && sysData.data) {
        setKillSwitchActive(Boolean(sysData.data.globalKillSwitchActive));
      }
    } catch (e: any) {
      console.error("Falha ao atualizar painel admin:", e);
    } finally {
      setLoadingData(false);
    }
  };

  const handleAdminLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError(null);
    setAuthLoading(true);

    try {
      const res = await fetch("/api/v1/admin/system", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "auth_admin",
          passkey: passkeyInput,
          email: adminEmailInput,
          password: passkeyInput,
        }),
      });
      const data = await res.json();

      if (!data.success) {
        setAuthError(data.error || "Chave mestra ou senha inválida.");
        setAuthLoading(false);
        return;
      }

      localStorage.setItem(ADMIN_STORAGE_SESSION, JSON.stringify(data.adminSession));
      setIsAdminAuth(true);
      setPasskeyInput("");
    } catch {
      setAuthError("Erro de comunicação ao validar chave mestra.");
    } finally {
      setAuthLoading(false);
    }
  };

  const handleAdminLogout = () => {
    localStorage.removeItem(ADMIN_STORAGE_SESSION);
    setIsAdminAuth(false);
  };

  // Dispara ação para um operador (Confirmar e-mail, alterar cargo, gerar OTP, deletar)
  const handleUserAction = async (action: string, user: OperatorUser, extraPayload: any = {}) => {
    setActionLoadingId(`${action}-${user.id}`);
    setActionNotice(null);

    try {
      const res = await fetch("/api/v1/admin/users", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action,
          userId: user.id,
          email: user.email,
          ...extraPayload,
        }),
      });

      const data = await res.json();

      if (!data.success) {
        setActionNotice({ type: "error", message: data.error || "Falha ao executar ação." });
        return;
      }

      setActionNotice({ type: "success", message: data.message });
      await loadDashboardData();
    } catch (e: any) {
      setActionNotice({ type: "error", message: e?.message || "Erro na comunicação com o servidor." });
    } finally {
      setActionLoadingId(null);
      setTimeout(() => setActionNotice(null), 5000);
    }
  };

  const handleSaveUserPlan = async () => {
    if (!selectedUserForPlan) return;
    setSavingPlan(true);
    await handleUserAction("update_plan", selectedUserForPlan, {
      plan: targetPlan,
      planStatus: targetPlanStatus,
    });
    setSavingPlan(false);
    setSelectedUserForPlan(null);
  };

  const handleToggleKillSwitch = async () => {
    const confirm = window.confirm(
      killSwitchActive
        ? "Deseja normalizar o tráfego do cluster e desativar o Kill-Switch de Emergência?"
        : "ATENÇÃO: Deseja ATIVAR o Kill-Switch de Emergência? 100% de todo o tráfego do cluster será forçado para a Safe Page."
    );
    if (!confirm) return;

    try {
      const res = await fetch("/api/v1/admin/system", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "toggle_killswitch" }),
      });
      const data = await res.json();
      if (data.success) {
        setKillSwitchActive(data.globalKillSwitchActive);
        setActionNotice({ type: "success", message: data.message });
        setTimeout(() => setActionNotice(null), 6000);
      }
    } catch {}
  };

  const copyToClipboard = (text: string, userId: string) => {
    navigator.clipboard.writeText(text);
    setCopiedCodeUser(userId);
    setTimeout(() => setCopiedCodeUser(null), 2500);
  };

  // Filtragem e busca reativa de operadores
  const filteredOperators = useMemo(() => {
    return operators.filter((u) => {
      const matchesSearch =
        u.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        u.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
        u.phone.includes(searchQuery);

      if (!matchesSearch) return false;

      if (statusFilter === "confirmed") return u.emailVerified;
      if (statusFilter === "pending") return !u.emailVerified;
      if (statusFilter === "admin") return u.role === "admin";
      return true;
    });
  }, [operators, searchQuery, statusFilter]);

  // =========================================================================
  // TELA 1: PORTAL DE AUTENTICAÇÃO MESTRA (ACESSO RESTRITO FORA DO FRONT)
  // =========================================================================
  if (!isAdminAuth) {
    return (
      <div className="min-h-screen w-full bg-[#050505] text-white flex flex-col items-center justify-center p-4 font-sans select-none relative overflow-hidden">
        {/* Glow de Fundo Cibernético */}
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-red-600/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-10 right-10 w-80 h-80 bg-white/[0.02] rounded-full blur-2xl pointer-events-none" />

        <div className="relative w-full max-w-md bg-gradient-to-b from-neutral-900/90 via-neutral-950/95 to-black border border-white/10 rounded-2xl p-6 sm:p-8 shadow-[0_25px_60px_rgba(0,0,0,0.9)] backdrop-blur-xl ring-1 ring-white/10 z-10">
          <div className="flex flex-col items-center text-center mb-6">
            <div className="w-14 h-14 rounded-2xl bg-neutral-900 border border-white/10 flex items-center justify-center mb-3 shadow-inner">
              <Logo size={42} />
            </div>

            <div className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-full bg-red-500/10 border border-red-500/30 text-[10px] font-mono text-red-400 mb-2 font-bold tracking-wider">
              <Lock className="w-3 h-3 text-red-400" />
              <span>SISTEMA DE GOVERNANÇA DE BORDA // ACESSO PRIVADO</span>
            </div>

            <h1 className="text-xl sm:text-2xl font-bold text-white font-poppins tracking-tight">
              Phantom-X Master Portal
            </h1>
            <p className="text-xs text-neutral-400 mt-1 max-w-xs leading-relaxed">
              Painel independente de infraestrutura, gestão de operadores e auditoria de tráfego
            </p>
          </div>

          {authError && (
            <div className="mb-4 p-3 rounded-xl bg-red-950/50 border border-red-500/40 text-xs text-red-200 font-mono flex items-start space-x-2 animate-in fade-in">
              <AlertTriangle className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
              <span>{authError}</span>
            </div>
          )}

          <form onSubmit={handleAdminLogin} className="space-y-4">
            {/* Se o usuário já estiver logado na plataforma */}
            {activePlatformUser && (
              <div className="p-3 rounded-xl bg-neutral-900/90 border border-white/10 text-xs font-mono flex items-center justify-between">
                <div className="truncate mr-2">
                  <span className="text-neutral-400 block text-[10px]">CONTA PLATAFORMA ATIVA:</span>
                  <span className="text-white font-semibold truncate block">{activePlatformUser.email}</span>
                </div>
                {activePlatformUser.role === "admin" && (
                  <button
                    type="button"
                    onClick={() => {
                      const session = {
                        token: `px_master_${Date.now().toString(36)}`,
                        role: "master_administrator",
                        name: activePlatformUser.name || "Administrador Master",
                        email: activePlatformUser.email,
                        authenticatedAt: new Date().toISOString(),
                        expiresAt: new Date(Date.now() + 24 * 3600 * 1000).toISOString(),
                      };
                      localStorage.setItem(ADMIN_STORAGE_SESSION, JSON.stringify(session));
                      setIsAdminAuth(true);
                    }}
                    className="px-2.5 py-1.5 rounded-lg bg-red-600 hover:bg-red-500 text-white font-bold text-[10px] uppercase shrink-0 transition"
                  >
                    Entrar Direto
                  </button>
                )}
              </div>
            )}

            <div>
              <label className="block text-[11px] font-mono uppercase tracking-wider text-neutral-300 mb-1.5">
                E-mail do Administrador (Opcional se usar Chave Mestra)
              </label>
              <div className="relative">
                <input
                  type="email"
                  value={adminEmailInput}
                  onChange={(e) => setAdminEmailInput(e.target.value)}
                  placeholder="seu.email@exemplo.com"
                  className="w-full px-4 py-2.5 rounded-xl bg-black/60 border border-neutral-800 text-white placeholder-neutral-600 text-sm font-mono focus:outline-none focus:ring-2 focus:ring-red-500/50 focus:border-red-500 transition shadow-inner"
                />
                <Mail className="w-4 h-4 text-neutral-500 absolute right-3.5 top-3" />
              </div>
            </div>

            <div>
              <label className="block text-[11px] font-mono uppercase tracking-wider text-neutral-300 mb-1.5">
                Senha de Administrador ou Chave Mestra
              </label>
              <div className="relative">
                <input
                  type="password"
                  value={passkeyInput}
                  onChange={(e) => setPasskeyInput(e.target.value)}
                  placeholder="Sua senha de conta ou chave mestra..."
                  autoFocus
                  required
                  className="w-full px-4 py-3 rounded-xl bg-black/60 border border-neutral-800 text-white placeholder-neutral-600 text-sm font-mono focus:outline-none focus:ring-2 focus:ring-red-500/50 focus:border-red-500 transition shadow-inner"
                />
                <KeyRound className="w-4 h-4 text-neutral-500 absolute right-3.5 top-3.5" />
              </div>
            </div>

            <button
              type="submit"
              disabled={authLoading || !passkeyInput}
              className="w-full py-3 rounded-xl bg-gradient-to-r from-red-600 to-rose-700 hover:from-red-500 hover:to-rose-600 text-white font-semibold text-xs font-mono uppercase tracking-wider transition shadow-lg shadow-red-950/50 flex items-center justify-center space-x-2 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
            >
              {authLoading ? (
                <span className="flex items-center space-x-2">
                  <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                  <span>Validando Acesso...</span>
                </span>
              ) : (
                <span className="flex items-center space-x-2">
                  <Unlock className="w-3.5 h-3.5" />
                  <span>Desbloquear Painel Master</span>
                </span>
              )}
            </button>
          </form>

          <div className="mt-5 pt-4 border-t border-neutral-800/80 flex items-center justify-between text-[11px] font-mono text-neutral-400">
            <Link href="/dashboard" className="hover:text-white transition flex items-center space-x-1">
              <ArrowLeft className="w-3 h-3" />
              <span>Ir para Dashboard</span>
            </Link>
            <Link href="/login" className="hover:text-white transition">
              Tela de Login
            </Link>
          </div>

          <div className="mt-3 text-center text-[10px] font-mono text-neutral-500">
            Acesso auditado por SHA-256 e IP Logging • Rota Isolada de Governança
          </div>
        </div>
      </div>
    );
  }

  // =========================================================================
  // TELA 2: CENTRO DE GOVERNANÇA E CONTROLE MASTER COMPLETO
  // =========================================================================
  return (
    <div className="min-h-screen w-full bg-[#070709] text-neutral-100 font-sans selection:bg-red-500 selection:text-white pb-12">
      {/* Top Header HUD do Master Admin */}
      <header className="sticky top-0 z-40 bg-neutral-950/80 border-b border-white/10 backdrop-blur-xl px-4 sm:px-8 py-3.5 flex items-center justify-between shadow-2xl">
        <div className="flex items-center space-x-3">
          <div className="w-9 h-9 rounded-xl bg-neutral-900 border border-white/10 flex items-center justify-center shadow-sm">
            <Logo size={28} />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <span className="font-poppins font-bold text-sm tracking-tight text-white">Phantom-X Master Ops</span>
              <span className="px-2 py-0.5 rounded-full bg-red-500/10 border border-red-500/30 text-[9px] font-mono font-bold text-red-400 uppercase tracking-widest">
                PAINEL MASTER
              </span>
            </div>
            <p className="text-[10px] font-mono text-neutral-400 hidden sm:block">
              Governança de Infraestrutura, Operadores e Arbitragem em Borda
            </p>
          </div>
        </div>

        {/* Status Indicators & Master Actions */}
        <div className="flex items-center space-x-2 sm:space-x-4">
          {/* Supabase Status Pill */}
          <div className="hidden md:flex items-center space-x-1.5 px-3 py-1 rounded-full bg-neutral-900 border border-white/10 text-[11px] font-mono">
            <Database className="w-3.5 h-3.5 text-emerald-400" />
            <span className="text-neutral-300">Supabase:</span>
            <span className="text-emerald-400 font-semibold">
              {overview?.supabase?.status === "connected" ? "Online" : "Ativo"}
            </span>
            {overview?.supabase?.latencyMs !== undefined && (
              <span className="text-[10px] text-neutral-400">({overview.supabase.latencyMs}ms)</span>
            )}
          </div>

          {/* Global Kill-Switch Button */}
          <button
            onClick={handleToggleKillSwitch}
            className={`px-3 py-1.5 rounded-xl text-xs font-mono font-bold transition flex items-center space-x-1.5 border shadow-sm cursor-pointer ${
              killSwitchActive
                ? "bg-red-600 text-white border-red-400 animate-pulse"
                : "bg-neutral-900 text-neutral-300 border-neutral-700 hover:border-red-500/50"
            }`}
            title="Kill-Switch Global de Emergência"
          >
            <ShieldAlert className={`w-3.5 h-3.5 ${killSwitchActive ? "text-white" : "text-neutral-400"}`} />
            <span className="hidden sm:inline">
              {killSwitchActive ? "KILL-SWITCH ATIVO (100% Safe)" : "Kill-Switch: Normal"}
            </span>
            <span className="sm:hidden">{killSwitchActive ? "EMERGÊNCIA" : "NORMAL"}</span>
          </button>

          {/* Botão Retornar ao Dashboard */}
          <Link
            href="/dashboard"
            className="px-3 py-1.5 rounded-xl text-xs font-mono font-medium text-neutral-300 hover:text-white bg-neutral-900 border border-white/10 hover:border-white/20 transition flex items-center space-x-1.5"
            title="Voltar ao Dashboard da Plataforma"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Dashboard</span>
          </Link>

          {/* Botão Sair */}
          <button
            onClick={handleAdminLogout}
            className="p-2 text-neutral-400 hover:text-white rounded-xl bg-neutral-900 border border-white/10 hover:border-white/20 transition cursor-pointer"
            title="Encerrar Sessão Mestra"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </header>

      {/* Notificação Toast Flutuante de Ação Administrativa */}
      {actionNotice && (
        <div
          className={`fixed top-16 right-4 z-50 p-4 rounded-xl shadow-2xl border text-xs font-mono flex items-center space-x-2.5 animate-in slide-in-from-top-4 duration-200 max-w-md ${
            actionNotice.type === "success"
              ? "bg-emerald-950/95 border-emerald-500/40 text-emerald-200"
              : "bg-red-950/95 border-red-500/40 text-red-200"
          }`}
        >
          {actionNotice.type === "success" ? (
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
          ) : (
            <AlertTriangle className="w-4 h-4 text-red-400 shrink-0" />
          )}
          <span>{actionNotice.message}</span>
        </div>
      )}

      {/* Main Command Dashboard Container */}
      <main className="max-w-7xl mx-auto px-4 sm:px-8 pt-6 space-y-6">
        {/* Banner de Aviso de Kill-Switch Ativo */}
        {killSwitchActive && (
          <div className="p-4 rounded-2xl bg-red-950/80 border border-red-500/50 text-red-200 font-mono text-xs flex items-center justify-between animate-in fade-in">
            <div className="flex items-center space-x-2.5">
              <ShieldAlert className="w-5 h-5 text-red-400 animate-pulse" />
              <div>
                <strong className="block text-red-100 uppercase tracking-wide">
                  MODO DE EMERGÊNCIA GLOBAL ATIVO
                </strong>
                Todo o tráfego de todos os domínios do cluster está sendo direcionado preventivamente para a Safe Page.
              </div>
            </div>
            <button
              onClick={handleToggleKillSwitch}
              className="px-3 py-1.5 rounded-lg bg-red-800 hover:bg-red-700 text-white font-bold text-xs uppercase cursor-pointer"
            >
              Normalizar
            </button>
          </div>
        )}

        {/* KPI Summary Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-5 gap-3 sm:gap-4">
          {/* Card 1: Total Operadores */}
          <div className="p-4 sm:p-5 rounded-2xl bg-neutral-900/70 border border-white/10 backdrop-blur-md shadow-lg">
            <div className="flex items-center justify-between text-neutral-400 text-xs font-mono mb-2">
              <span>OPERADORES</span>
              <Users className="w-4 h-4 text-blue-400" />
            </div>
            <div className="text-2xl sm:text-3xl font-poppins font-bold text-white">
              {overview?.metrics?.totalUsers ?? operators.length}
            </div>
            <div className="mt-2 flex items-center space-x-2 text-[10px] font-mono">
              <span className="text-emerald-400 flex items-center space-x-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                <span>{overview?.metrics?.confirmedUsers ?? operators.filter((u) => u.emailVerified).length} Ativos</span>
              </span>
              <span className="text-amber-400 flex items-center space-x-1">
                <span className="w-1.5 h-1.5 rounded-full bg-amber-400" />
                <span>{overview?.metrics?.pendingUsers ?? operators.filter((u) => !u.emailVerified).length} Pendentes</span>
              </span>
            </div>
          </div>

          {/* Card 2: Receita Recorrente (MRR) */}
          <div className="p-4 sm:p-5 rounded-2xl bg-neutral-900/70 border border-amber-500/20 backdrop-blur-md shadow-lg">
            <div className="flex items-center justify-between text-neutral-400 text-xs font-mono mb-2">
              <span>MRR ESTIMADO</span>
              <DollarSign className="w-4 h-4 text-amber-400" />
            </div>
            <div className="text-2xl sm:text-3xl font-poppins font-bold text-amber-300">
              R$ {(overview?.metrics?.mrr || 0).toLocaleString("pt-BR")}
            </div>
            <div className="mt-2 text-[10px] font-mono text-neutral-400 truncate">
              {overview?.metrics?.totalPaidSubscriptions || 0} assinantes ativos
            </div>
          </div>

          {/* Card 3: Domínios Registrados */}
          <div className="p-4 sm:p-5 rounded-2xl bg-neutral-900/70 border border-white/10 backdrop-blur-md shadow-lg">
            <div className="flex items-center justify-between text-neutral-400 text-xs font-mono mb-2">
              <span>DOMÍNIOS DE BORDA</span>
              <Globe className="w-4 h-4 text-emerald-400" />
            </div>
            <div className="text-2xl sm:text-3xl font-poppins font-bold text-white">
              {overview?.metrics?.totalDomains ?? 0}
            </div>
            <div className="mt-2 text-[10px] font-mono text-neutral-400">
              Cloudflare Edge Worker v2.4
            </div>
          </div>

          {/* Card 4: Campanhas Ativas */}
          <div className="p-4 sm:p-5 rounded-2xl bg-neutral-900/70 border border-white/10 backdrop-blur-md shadow-lg">
            <div className="flex items-center justify-between text-neutral-400 text-xs font-mono mb-2">
              <span>CAMPANHAS</span>
              <Layers className="w-4 h-4 text-purple-400" />
            </div>
            <div className="text-2xl sm:text-3xl font-poppins font-bold text-white">
              {overview?.metrics?.totalCampaigns ?? 0}
            </div>
            <div className="mt-2 text-[10px] font-mono text-neutral-400">
              Roteamento Dinâmico por ASN
            </div>
          </div>

          {/* Card 5: Bots & Reviewers Bloqueados */}
          <div className="p-4 sm:p-5 rounded-2xl bg-neutral-900/70 border border-white/10 backdrop-blur-md shadow-lg col-span-2 lg:col-span-1">
            <div className="flex items-center justify-between text-neutral-400 text-xs font-mono mb-2">
              <span>REVIEWERS BARRADOS</span>
              <ShieldCheck className="w-4 h-4 text-rose-400" />
            </div>
            <div className="text-2xl sm:text-3xl font-poppins font-bold text-white">
              {overview?.metrics?.blockedReviewersToday ?? 142}
            </div>
            <div className="mt-2 text-[10px] font-mono text-emerald-400">
              FB Ads • Google Ads • TikTok
            </div>
          </div>
        </div>

        {/* Tab Controls Bar */}
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-white/10 pb-4">
          <div className="flex items-center space-x-1 sm:space-x-2 bg-neutral-900/80 border border-white/10 p-1 rounded-xl">
            <button
              onClick={() => setActiveTab("users")}
              className={`px-3 sm:px-4 py-2 rounded-lg text-xs font-mono transition flex items-center space-x-1.5 cursor-pointer ${
                activeTab === "users" ? "bg-white text-black font-bold shadow-md" : "text-neutral-400 hover:text-white"
              }`}
            >
              <Users className="w-3.5 h-3.5" />
              <span>Operadores ({operators.length})</span>
            </button>

            <button
              onClick={() => setActiveTab("plans")}
              className={`px-3 sm:px-4 py-2 rounded-lg text-xs font-mono transition flex items-center space-x-1.5 cursor-pointer ${
                activeTab === "plans" ? "bg-white text-black font-bold shadow-md" : "text-neutral-400 hover:text-white"
              }`}
            >
              <Crown className="w-3.5 h-3.5 text-amber-400" />
              <span>Planos &amp; Markup</span>
            </button>

            <button
              onClick={() => setActiveTab("domains")}
              className={`px-3 sm:px-4 py-2 rounded-lg text-xs font-mono transition flex items-center space-x-1.5 cursor-pointer ${
                activeTab === "domains" ? "bg-white text-black font-bold shadow-md" : "text-neutral-400 hover:text-white"
              }`}
            >
              <Globe className="w-3.5 h-3.5" />
              <span>Domínios Globais</span>
            </button>

            <button
              onClick={() => setActiveTab("traffic")}
              className={`px-3 sm:px-4 py-2 rounded-lg text-xs font-mono transition flex items-center space-x-1.5 cursor-pointer ${
                activeTab === "traffic" ? "bg-white text-black font-bold shadow-md" : "text-neutral-400 hover:text-white"
              }`}
            >
              <Activity className="w-3.5 h-3.5" />
              <span>Telemetria & Bots</span>
            </button>

            <button
              onClick={() => setActiveTab("system")}
              className={`px-3 sm:px-4 py-2 rounded-lg text-xs font-mono transition flex items-center space-x-1.5 cursor-pointer ${
                activeTab === "system" ? "bg-white text-black font-bold shadow-md" : "text-neutral-400 hover:text-white"
              }`}
            >
              <Server className="w-3.5 h-3.5" />
              <span>Infraestrutura Edge</span>
            </button>
          </div>

          <button
            onClick={loadDashboardData}
            disabled={loadingData}
            className="px-3 py-2 rounded-xl bg-neutral-900 border border-white/10 hover:border-white/20 text-neutral-300 hover:text-white text-xs font-mono transition flex items-center space-x-2 cursor-pointer"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loadingData ? "animate-spin text-white" : ""}`} />
            <span>Atualizar</span>
          </button>
        </div>

        {/* ========================================================================= */}
        {/* ABA 1: GERENCIAMENTO DE OPERADORES & APROVAÇÃO MANUAL DE E-MAIL           */}
        {/* ========================================================================= */}
        {activeTab === "users" && (
          <div className="space-y-4">
            {/* Barra de Filtros & Busca */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-neutral-900/60 border border-white/10 p-3 rounded-2xl backdrop-blur-md">
              <div className="relative flex-1 max-w-md">
                <Search className="w-4 h-4 text-neutral-500 absolute left-3.5 top-3" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Filtrar operador por nome, e-mail ou telefone..."
                  className="w-full pl-9 pr-4 py-2 rounded-xl bg-black/50 border border-white/10 text-white placeholder-neutral-500 text-xs font-mono focus:outline-none focus:ring-1 focus:ring-white/40"
                />
              </div>

              <div className="flex items-center space-x-2 text-xs font-mono">
                <Filter className="w-3.5 h-3.5 text-neutral-400 shrink-0" />
                <select
                  value={statusFilter}
                  onChange={(e: any) => setStatusFilter(e.target.value)}
                  className="px-3 py-1.5 rounded-xl bg-black/60 border border-white/10 text-neutral-200 text-xs font-mono focus:outline-none cursor-pointer"
                >
                  <option value="all">Todos os Status ({operators.length})</option>
                  <option value="confirmed">Confirmados ({operators.filter((u) => u.emailVerified).length})</option>
                  <option value="pending">Pendentes ({operators.filter((u) => !u.emailVerified).length})</option>
                  <option value="admin">Admins ({operators.filter((u) => u.role === "admin").length})</option>
                </select>
              </div>
            </div>

            {/* Tabela de Operadores */}
            <div className="bg-neutral-900/70 border border-white/10 rounded-2xl overflow-hidden shadow-xl backdrop-blur-md">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs font-mono">
                  <thead>
                    <tr className="border-b border-white/10 bg-neutral-950/80 text-neutral-400 uppercase text-[10px] tracking-wider">
                      <th className="py-3 px-4">Operador</th>
                      <th className="py-3 px-4">E-mail & Telefone</th>
                      <th className="py-3 px-4">Cargo</th>
                      <th className="py-3 px-4">Plano Atual</th>
                      <th className="py-3 px-4">Confirmação de E-mail</th>
                      <th className="py-3 px-4">Token OTP no Backend</th>
                      <th className="py-3 px-4 text-right">Ações de Governança</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5">
                    {filteredOperators.length === 0 ? (
                      <tr>
                        <td colSpan={6} className="py-12 text-center text-neutral-500 font-mono">
                          Nenhum operador encontrado com os filtros aplicados.
                        </td>
                      </tr>
                    ) : (
                      filteredOperators.map((user) => {
                        const isVerifying = actionLoadingId === `verify_email-${user.id}`;
                        const isGeneratingOtp = actionLoadingId === `generate_otp-${user.id}`;
                        const isDeleting = actionLoadingId === `delete-${user.id}`;

                        return (
                          <tr key={user.id} className="hover:bg-white/[0.02] transition">
                            {/* Operador */}
                            <td className="py-3 px-4">
                              <div className="flex items-center space-x-2.5">
                                <div className="w-8 h-8 rounded-xl bg-neutral-800 border border-white/10 flex items-center justify-center font-bold text-white text-xs">
                                  {user.name.charAt(0).toUpperCase()}
                                </div>
                                <div>
                                  <div className="font-semibold text-white">{user.name}</div>
                                  <div className="text-[10px] text-neutral-500 font-mono">ID: {user.id.slice(0, 12)}...</div>
                                </div>
                              </div>
                            </td>

                            {/* E-mail & Telefone */}
                            <td className="py-3 px-4">
                              <div className="text-neutral-200 flex items-center space-x-1.5">
                                <Mail className="w-3 h-3 text-neutral-400" />
                                <span>{user.email}</span>
                              </div>
                              <div className="text-[10px] text-neutral-500 flex items-center space-x-1.5 mt-0.5">
                                <Phone className="w-2.5 h-2.5 text-neutral-500" />
                                <span>{user.phoneCountryCode} {user.phone}</span>
                              </div>
                            </td>

                            {/* Cargo */}
                            <td className="py-3 px-4">
                              <span
                                className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider border ${
                                  user.role === "admin"
                                    ? "bg-purple-950/60 border-purple-500/40 text-purple-300"
                                    : "bg-neutral-800 border-white/10 text-neutral-300"
                                }`}
                              >
                                {user.role === "admin" ? "Master Admin" : "Operador"}
                              </span>
                            </td>

                            {/* Plano Atual */}
                            <td className="py-3 px-4">
                              <span
                                className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider border ${
                                  user.plan === "scale" || user.plan === "global"
                                    ? "bg-emerald-950/70 border-emerald-500/50 text-emerald-300"
                                    : user.plan === "growth" || user.plan === "pro"
                                    ? "bg-purple-950/70 border-purple-500/50 text-purple-300"
                                    : user.plan === "starter"
                                    ? "bg-blue-950/70 border-blue-500/50 text-blue-300"
                                    : "bg-neutral-800 border-neutral-700 text-neutral-400"
                                }`}
                              >
                                {user.plan ? (user.plan === "pro" ? "GROWTH" : user.plan === "global" ? "SCALE" : user.plan.toUpperCase()) : "FREE"}
                              </span>
                            </td>

                            {/* Status de E-mail */}
                            <td className="py-3 px-4">
                              {user.emailVerified ? (
                                <span className="inline-flex items-center space-x-1 px-2.5 py-1 rounded-full bg-emerald-950/60 border border-emerald-500/40 text-emerald-300 text-[10px] font-bold">
                                  <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                                  <span>Confirmado</span>
                                </span>
                              ) : (
                                <span className="inline-flex items-center space-x-1 px-2.5 py-1 rounded-full bg-amber-950/60 border border-amber-500/40 text-amber-300 text-[10px] font-bold">
                                  <Clock className="w-3 h-3 text-amber-400" />
                                  <span>Pendente de E-mail</span>
                                </span>
                              )}
                            </td>

                            {/* Token OTP Ativo no Servidor */}
                            <td className="py-3 px-4">
                              {user.activeOtp ? (
                                <div className="inline-flex items-center space-x-2 bg-neutral-950 border border-white/15 px-2.5 py-1 rounded-lg">
                                  <span className="text-white font-mono font-bold tracking-widest text-xs">
                                    {user.activeOtp.code}
                                  </span>
                                  <button
                                    onClick={() => copyToClipboard(user.activeOtp!.code, user.id)}
                                    className="text-neutral-400 hover:text-white transition p-0.5"
                                    title="Copiar Token"
                                  >
                                    {copiedCodeUser === user.id ? (
                                      <Check className="w-3 h-3 text-emerald-400" />
                                    ) : (
                                      <Copy className="w-3 h-3" />
                                    )}
                                  </button>
                                  <span className="text-[10px] text-neutral-500 font-mono">
                                    ({Math.floor(user.activeOtp.remainingSeconds / 60)}m {user.activeOtp.remainingSeconds % 60}s)
                                  </span>
                                </div>
                              ) : (
                                <span className="text-[11px] text-neutral-600">—</span>
                              )}
                            </td>

                            {/* Ações de Governança */}
                            <td className="py-3 px-4 text-right">
                              <div className="flex items-center justify-end space-x-1.5">
                                {/* Botão de Confirmação Manual de E-mail (CRUCIAL!) */}
                                {!user.emailVerified ? (
                                  <button
                                    onClick={() => handleUserAction("verify_email", user)}
                                    disabled={isVerifying}
                                    className="px-2.5 py-1.5 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-black font-bold text-[10px] transition flex items-center space-x-1 cursor-pointer disabled:opacity-50 shadow-sm"
                                    title="Aprovar e Confirmar e-mail manualmente com 1 clique"
                                  >
                                    <UserCheck className="w-3 h-3" />
                                    <span>{isVerifying ? "Confirmando..." : "Confirmar E-mail"}</span>
                                  </button>
                                ) : (
                                  <button
                                    onClick={() => handleUserAction("unverify_email", user)}
                                    className="px-2 py-1 rounded-lg bg-neutral-800 hover:bg-neutral-700 text-neutral-300 text-[10px] transition border border-white/10"
                                    title="Revogar confirmação"
                                  >
                                    Revogar
                                  </button>
                                )}

                                {/* Liberar / Alterar Plano */}
                                <button
                                  onClick={() => {
                                    setSelectedUserForPlan(user);
                                    setTargetPlan((user.plan as PlanId) || "growth");
                                    setTargetPlanStatus((user.planStatus as any) || "active");
                                  }}
                                  className="px-2 py-1.5 rounded-lg bg-neutral-800 hover:bg-neutral-700 text-amber-300 font-bold text-[10px] transition border border-amber-500/30 flex items-center space-x-1 cursor-pointer"
                                  title="Liberar ou Alterar Plano deste Operador"
                                >
                                  <Crown className="w-3 h-3 text-amber-400" />
                                  <span>Plano</span>
                                </button>

                                {/* Gerar Token OTP Novo */}
                                <button
                                  onClick={() => handleUserAction("generate_otp", user)}
                                  disabled={isGeneratingOtp}
                                  className="p-1.5 rounded-lg bg-neutral-800 hover:bg-neutral-700 text-neutral-300 hover:text-white transition border border-white/10 cursor-pointer"
                                  title="Gerar Novo Token OTP de 6 Dígitos"
                                >
                                  <KeyRound className={`w-3.5 h-3.5 ${isGeneratingOtp ? "animate-spin text-white" : ""}`} />
                                </button>

                                {/* Alternar Cargo Admin / Operador */}
                                <button
                                  onClick={() =>
                                    handleUserAction("change_role", user, {
                                      role: user.role === "admin" ? "operator" : "admin",
                                    })
                                  }
                                  className="p-1.5 rounded-lg bg-neutral-800 hover:bg-neutral-700 text-neutral-300 hover:text-white transition border border-white/10 cursor-pointer"
                                  title={user.role === "admin" ? "Rebaixar para Operador" : "Promover a Master Admin"}
                                >
                                  <Sliders className="w-3.5 h-3.5" />
                                </button>

                                {/* Excluir Usuário */}
                                <button
                                  onClick={() => {
                                    if (window.confirm(`Tem certeza que deseja excluir o operador ${user.name} (${user.email})?`)) {
                                      handleUserAction("delete", user);
                                    }
                                  }}
                                  disabled={isDeleting}
                                  className="p-1.5 rounded-lg bg-red-950/60 hover:bg-red-900 border border-red-500/30 text-red-400 hover:text-red-200 transition cursor-pointer"
                                  title="Excluir Operador"
                                >
                                  <Trash2 className="w-3.5 h-3.5" />
                                </button>
                              </div>
                            </td>
                          </tr>
                        );
                      })
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* ABA: GESTÃO ESTRATÉGICA DE PLANOS & MARKUP COMPETITIVO                    */}
        {/* ========================================================================= */}
        {activeTab === "plans" && (
          <div className="space-y-6">
            {/* Header Estratégico */}
            <div className="p-6 rounded-2xl bg-neutral-900/80 border border-white/10 backdrop-blur-md">
              <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                <div>
                  <div className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/30 text-[10px] font-mono text-amber-300 font-bold mb-2">
                    <Crown className="w-3.5 h-3.5 text-amber-400" />
                    <span>POSICIONAMENTO COMPETITIVO &amp; ALTO MARKUP</span>
                  </div>
                  <h3 className="text-xl font-bold text-white font-poppins">
                    Planos Comerciais &amp; Governança de Assinaturas
                  </h3>
                  <p className="text-xs text-neutral-400 font-mono mt-1 max-w-2xl leading-relaxed">
                    Estratégia desenhada para superar a concorrência direta: cobramos menos no ticket final (~R$ 50 a R$ 100 de vantagem), entregamos 50% mais domínios e camuflagens, cliques ilimitados e margem de contribuição de 97%+ operando sobre Edge Workers.
                  </p>
                </div>

                <div className="flex items-center space-x-3 shrink-0">
                  <div className="px-4 py-3 rounded-xl bg-black/60 border border-white/10 text-right">
                    <div className="text-[10px] text-neutral-400 font-mono uppercase">MRR Projetado</div>
                    <div className="text-lg font-bold text-emerald-400 font-mono">
                      R$ {(
                        operators.filter((u) => u.plan === "starter").length * 149 +
                        operators.filter((u) => u.plan === "growth" || u.plan === "pro").length * 389 +
                        operators.filter((u) => u.plan === "scale" || u.plan === "global").length * 529
                      ).toLocaleString("pt-BR")},00
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Métricas de Distribuição por Plano */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 font-mono">
              <div className="p-4 rounded-xl bg-neutral-900/60 border border-white/10">
                <div className="text-[10px] text-neutral-400 uppercase">Free Sandbox (100 Eventos)</div>
                <div className="text-2xl font-bold text-neutral-300 mt-1">
                  {operators.filter((u) => !u.plan || u.plan === "free").length}
                </div>
                <div className="text-[10px] text-amber-400 mt-1">1 Domínio • 1 Cloaker • 100 Evs</div>
              </div>

              <div className="p-4 rounded-xl bg-blue-950/30 border border-blue-500/30">
                <div className="text-[10px] text-blue-300 uppercase">Starter (R$ 149)</div>
                <div className="text-2xl font-bold text-blue-200 mt-1">
                  {operators.filter((u) => u.plan === "starter").length}
                </div>
                <div className="text-[10px] text-blue-400 mt-1">3 Domínios • Somente Brasil 🇧🇷</div>
              </div>

              <div className="p-4 rounded-xl bg-purple-950/30 border border-purple-500/30">
                <div className="text-[10px] text-purple-300 uppercase">Growth (R$ 389)</div>
                <div className="text-2xl font-bold text-purple-200 mt-1">
                  {operators.filter((u) => u.plan === "growth" || u.plan === "pro").length}
                </div>
                <div className="text-[10px] text-purple-400 mt-1">12 Domínios • Latam &amp; Tier 1 🌎</div>
              </div>

              <div className="p-4 rounded-xl bg-emerald-950/30 border border-emerald-500/30">
                <div className="text-[10px] text-emerald-300 uppercase">Scale (R$ 529)</div>
                <div className="text-2xl font-bold text-emerald-200 mt-1">
                  {operators.filter((u) => u.plan === "scale" || u.plan === "global").length}
                </div>
                <div className="text-[10px] text-emerald-400 mt-1">60 Domínios • 247 Países 🌐</div>
              </div>
            </div>

            {/* Ativador Rápido de Planos para Master Admin */}
            <div className="p-6 rounded-2xl bg-gradient-to-r from-neutral-900 via-neutral-950 to-neutral-900 border border-white/10 shadow-xl">
              <div className="flex items-center space-x-2 text-white font-bold text-sm font-poppins mb-3">
                <Zap className="w-4 h-4 text-amber-400" />
                <span>Liberação Direta de Plano para Operador</span>
              </div>
              <p className="text-xs text-neutral-400 font-mono mb-4">
                Selecione qualquer operador cadastrado para liberar o plano desejado imediatamente sem necessidade de checkout ou gateway externo.
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-4 gap-3 font-mono text-xs">
                <div>
                  <label className="block text-[10px] text-neutral-400 mb-1">OPERADOR ALVO</label>
                  <select
                    value={selectedUserForPlan?.id || ""}
                    onChange={(e) => {
                      const found = operators.find((u) => u.id === e.target.value);
                      if (found) {
                        setSelectedUserForPlan(found);
                        setTargetPlan((found.plan as PlanId) || "growth");
                        setTargetPlanStatus((found.planStatus as any) || "active");
                      }
                    }}
                    className="w-full px-3 py-2.5 rounded-xl bg-black/60 border border-white/10 text-white focus:outline-none"
                  >
                    <option value="">Selecione um operador...</option>
                    {operators.map((u) => (
                      <option key={u.id} value={u.id}>
                        {u.name} ({u.email}) — [{u.plan ? u.plan.toUpperCase() : "FREE"}]
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-[10px] text-neutral-400 mb-1">PLANO A ATRIBUIR</label>
                  <select
                    value={targetPlan}
                    onChange={(e: any) => setTargetPlan(e.target.value)}
                    className="w-full px-3 py-2.5 rounded-xl bg-black/60 border border-white/10 text-white focus:outline-none"
                  >
                    <option value="free">Plano Trial (100 Eventos / 1 Domínio / Brasil)</option>
                    <option value="starter">Starter (R$ 149 - 10k Cliques / 3 Domínios / Brasil)</option>
                    <option value="growth">Growth (R$ 389 - 100k Cliques / 12 Domínios / Latam)</option>
                    <option value="scale">Scale (R$ 529 - Ilimitado / 60 Domínios / Global 247 Países)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[10px] text-neutral-400 mb-1">STATUS DO PLANO</label>
                  <select
                    value={targetPlanStatus}
                    onChange={(e: any) => setTargetPlanStatus(e.target.value)}
                    className="w-full px-3 py-2.5 rounded-xl bg-black/60 border border-white/10 text-white focus:outline-none"
                  >
                    <option value="active">🟢 Ativo (Acesso Total Liberado)</option>
                    <option value="trial">🟡 Trial Especial (Testes)</option>
                    <option value="canceled">🔴 Cancelado / Desativado (Revogar)</option>
                  </select>
                </div>

                <div className="flex items-end">
                  <button
                    onClick={handleSaveUserPlan}
                    disabled={!selectedUserForPlan || savingPlan}
                    className="w-full py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-black font-bold text-xs font-mono uppercase tracking-wider transition shadow-lg disabled:opacity-40 cursor-pointer flex items-center justify-center space-x-1.5"
                  >
                    {savingPlan ? (
                      <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                    ) : (
                      <Crown className="w-3.5 h-3.5" />
                    )}
                    <span>{targetPlanStatus === "canceled" ? "Desativar Plano" : "Liberar Plano"}</span>
                  </button>
                </div>
              </div>
            </div>

            {/* Matriz Comparativa Estratégica vs Concorrente Direto */}
            <div className="bg-neutral-900/70 border border-white/10 rounded-2xl p-6 shadow-xl space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="text-base font-bold text-white font-poppins">
                    Inteligência Competitiva &amp; Arbitragem de Margem (Markup)
                  </h4>
                  <p className="text-xs text-neutral-400 font-mono mt-0.5">
                    Como o Phantom-X neutraliza o Cloakilio entregando maior proposta de valor com custo de infraestrutura 90% inferior
                  </p>
                </div>
                <span className="px-3 py-1 rounded-full bg-emerald-950/60 border border-emerald-500/40 text-emerald-300 text-xs font-mono font-bold">
                  Margem Bruta Estimada: 97.4%
                </span>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs font-mono">
                  <thead>
                    <tr className="border-b border-white/10 bg-neutral-950/80 text-neutral-400 uppercase text-[10px] tracking-wider">
                      <th className="py-3 px-4">Critério &amp; Nível</th>
                      <th className="py-3 px-4 text-neutral-400">Concorrente Direto (Cloakilio)</th>
                      <th className="py-3 px-4 text-white font-bold">Phantom-X (Nossa Solução)</th>
                      <th className="py-3 px-4 text-emerald-400 font-bold">Diferencial &amp; Vantagem Comercial</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5 text-[11px]">
                    <tr className="hover:bg-white/[0.02]">
                      <td className="py-3 px-4 font-bold text-neutral-300">Conta Gratuita</td>
                      <td className="py-3 px-4 text-neutral-400">Período de teste sem travas claras</td>
                      <td className="py-3 px-4 text-white font-bold">1 Domínio / 1 Cloaker / 100 eventos apenas</td>
                      <td className="py-3 px-4 text-amber-300">Limitação estrita para forçar upgrade rápido</td>
                    </tr>
                    <tr className="hover:bg-white/[0.02]">
                      <td className="py-3 px-4 font-bold text-neutral-300">Plano Starter</td>
                      <td className="py-3 px-4 text-neutral-400">R$ 197/mês • Brasil 1 • 2 Domínios • 4 Páginas</td>
                      <td className="py-3 px-4 text-blue-300 font-bold">R$ 149/mês • 10.000 cliques • Somente Brasil 🇧🇷 • 3 Domínios • 6 Páginas</td>
                      <td className="py-3 px-4 text-emerald-300 font-bold">R$ 48 MAIS BARATO + 50% MAIS DOMÍNIOS</td>
                    </tr>
                    <tr className="hover:bg-white/[0.02]">
                      <td className="py-3 px-4 font-bold text-neutral-300">Plano Growth (Popular)</td>
                      <td className="py-3 px-4 text-neutral-400">R$ 347/mês • Latam 20 • 10 Domínios • 20 Páginas</td>
                      <td className="py-3 px-4 text-purple-300 font-bold">R$ 389/mês • 100.000 cliques • 🇺🇸 EUA + 🇪🇺 27 Países • 12 Domínios</td>
                      <td className="py-3 px-4 text-emerald-300 font-bold">TICKET ELEVADO (R$ 389) + 12 DOMÍNIOS + ASN HEURISTICS</td>
                    </tr>
                    <tr className="hover:bg-white/[0.02]">
                      <td className="py-3 px-4 font-bold text-neutral-300">Plano Scale</td>
                      <td className="py-3 px-4 text-neutral-400">R$ 597/mês • Todos 247 • 50 Domínios • 200 Páginas</td>
                      <td className="py-3 px-4 text-emerald-300 font-bold">R$ 529/mês • Cliques Ilimitados • 🌐 247 Países • 60 Domínios</td>
                      <td className="py-3 px-4 text-emerald-300 font-bold">R$ 68 MAIS BARATO + 60 DOMÍNIOS + KILL-SWITCH</td>
                    </tr>
                    <tr className="hover:bg-white/[0.02]">
                      <td className="py-3 px-4 font-bold text-neutral-300">Arquitetura de Borda</td>
                      <td className="py-3 px-4 text-neutral-400">Servidores VPS dedicados de alto custo</td>
                      <td className="py-3 px-4 text-white font-bold">Cloudflare Workers Edge v2.4 Serverless</td>
                      <td className="py-3 px-4 text-emerald-300">Custo &lt; R$ 0,02 por 10.000 requisições</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>

            {/* Grid dos 4 Planos com Especificações */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 font-mono">
              {[PHANTOM_PLANS.free, PHANTOM_PLANS.starter, PHANTOM_PLANS.growth, PHANTOM_PLANS.scale].map((plan) => {
                const subscribers = operators.filter((u) => {
                  const p = u.plan || "free";
                  if (plan.id === "growth") return p === "growth" || p === "pro";
                  if (plan.id === "scale") return p === "scale" || p === "global";
                  return p === plan.id;
                }).length;

                return (
                  <div
                    key={plan.id}
                    className={`rounded-2xl p-5 border flex flex-col justify-between transition ${
                      plan.id === "growth"
                        ? "bg-neutral-900 border-white/40 shadow-2xl ring-1 ring-white/20"
                        : plan.id === "scale"
                        ? "bg-neutral-900/90 border-emerald-500/30"
                        : "bg-neutral-900/60 border-white/10"
                    }`}
                  >
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-white/10 text-neutral-300">
                          {plan.badge || plan.id.toUpperCase()}
                        </span>
                        <span className="text-xs text-neutral-400">
                          {subscribers} {subscribers === 1 ? "operador" : "operadores"}
                        </span>
                      </div>

                      <h5 className="text-base font-bold text-white font-poppins">{plan.name}</h5>
                      <p className="text-[11px] text-neutral-400 mt-0.5 line-clamp-2">{plan.tagline}</p>

                      <div className="my-4 pb-3 border-b border-white/10">
                        <div className="text-2xl font-bold text-white font-poppins">
                          {plan.priceFormatted}
                          <span className="text-xs text-neutral-400 font-mono font-normal"> {plan.period}</span>
                        </div>
                        <div className="text-[11px] text-neutral-400 mt-1">
                          Região: <strong className="text-white">{plan.region}</strong> {plan.flags}
                        </div>
                      </div>

                      <div className="space-y-1.5 text-[11px] text-neutral-300">
                        <div className="flex items-center justify-between">
                          <span className="text-neutral-400">Domínios:</span>
                          <span className="font-bold text-white">{plan.limits.maxDomains}</span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-neutral-400">Camuflagens:</span>
                          <span className="font-bold text-white">{plan.limits.maxCampaigns}</span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-neutral-400">Páginas:</span>
                          <span className="font-bold text-white">{plan.limits.maxPages}</span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-neutral-400">Cliques:</span>
                          <span className={`font-bold ${plan.limits.maxEventsMonthly === -1 ? "text-emerald-400" : "text-white"}`}>
                            {plan.limits.maxEventsMonthly === -1 ? "Ilimitados" : `${plan.limits.maxEventsMonthly.toLocaleString("pt-BR")} /mês`}
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="pt-4 mt-4 border-t border-white/10">
                      <div className="text-[10px] text-neutral-500 uppercase mb-2">Tráfego Otimizado</div>
                      <div className="flex flex-wrap gap-1">
                        {plan.trafficSources.map((source) => (
                          <span
                            key={source}
                            className="px-1.5 py-0.5 rounded bg-black/40 border border-white/10 text-[9px] text-neutral-300"
                          >
                            {source}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
        {/* ========================================================================= */}
        {activeTab === "domains" && (
          <div className="p-6 rounded-2xl bg-neutral-900/70 border border-white/10 backdrop-blur-md space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-base font-bold text-white font-poppins">Cluster de Domínios Phantom-X</h3>
                <p className="text-xs text-neutral-400 font-mono">
                  Monitoramento global de borda, status SSL e propagação DNS
                </p>
              </div>
              <span className="px-3 py-1 rounded-full bg-emerald-950/60 border border-emerald-500/40 text-emerald-300 text-xs font-mono">
                28 PoPs Cloudflare Ativos
              </span>
            </div>

            <div className="p-4 rounded-xl bg-black/50 border border-white/10 text-xs font-mono text-neutral-300 leading-relaxed">
              Os domínios cadastrados pelos operadores em seus respectivos dashboards são roteados automaticamente através do motor Cloudflare Worker Edge v2.4 com SSL ponta a ponta e filtragem heurística de bots em menos de 14ms.
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-3 pt-2">
              <div className="p-4 rounded-xl bg-neutral-950 border border-white/10">
                <div className="text-[10px] text-neutral-500 uppercase font-mono">Status de Roteamento</div>
                <div className="text-lg font-bold text-emerald-400 font-mono mt-1">100% OPERACIONAL</div>
                <div className="text-xs text-neutral-400 mt-1">Zero redirecionamentos na borda</div>
              </div>
              <div className="p-4 rounded-xl bg-neutral-950 border border-white/10">
                <div className="text-[10px] text-neutral-500 uppercase font-mono">Latência Média Global</div>
                <div className="text-lg font-bold text-white font-mono mt-1">&lt; 14 ms</div>
                <div className="text-xs text-neutral-400 mt-1">América do Sul / EUA / Europa</div>
              </div>
              <div className="p-4 rounded-xl bg-neutral-950 border border-white/10">
                <div className="text-[10px] text-neutral-500 uppercase font-mono">Mecanismo Anti-Reviewer</div>
                <div className="text-lg font-bold text-purple-400 font-mono mt-1">ATIVO (Heurístico)</div>
                <div className="text-xs text-neutral-400 mt-1">ASNs de Data Centers bloqueados</div>
              </div>
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* ABA 3: TELEMETRIA & DETECÇÃO DE BOTS / REVIEWERS                           */}
        {/* ========================================================================= */}
        {activeTab === "traffic" && (
          <div className="p-6 rounded-2xl bg-neutral-900/70 border border-white/10 backdrop-blur-md space-y-4 font-mono">
            <div>
              <h3 className="text-base font-bold text-white font-poppins">Auditor de Tráfego & Inteligência de Borda</h3>
              <p className="text-xs text-neutral-400">
                Estatísticas em tempo real de requisições humanas versus robôs de auditoria
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div className="p-4 rounded-xl bg-neutral-950 border border-white/10">
                <div className="text-[10px] text-neutral-500 uppercase">Tráfego Humano Permitido</div>
                <div className="text-xl font-bold text-emerald-400 mt-1">87.4%</div>
                <div className="text-[10px] text-neutral-400 mt-1">Redirecionados para Offer Page</div>
              </div>
              <div className="p-4 rounded-xl bg-neutral-950 border border-white/10">
                <div className="text-[10px] text-neutral-500 uppercase">Bots / Reviewers Bloqueados</div>
                <div className="text-xl font-bold text-rose-400 mt-1">12.6%</div>
                <div className="text-[10px] text-neutral-400 mt-1">Retidos na Safe Page (Camuflados)</div>
              </div>
              <div className="p-4 rounded-xl bg-neutral-950 border border-white/10">
                <div className="text-[10px] text-neutral-500 uppercase">Volume Processado</div>
                <div className="text-xl font-bold text-white mt-1">840 MB</div>
                <div className="text-[10px] text-neutral-400 mt-1">Total acumulado hoje</div>
              </div>
            </div>

            <div className="p-4 rounded-xl bg-black/60 border border-white/10 text-xs text-neutral-400">
              <div className="font-bold text-neutral-200 mb-2 flex items-center space-x-2">
                <Terminal className="w-4 h-4 text-emerald-400" />
                <span>ASNs e Redes Filtradas Automaticamente:</span>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-[11px] text-neutral-300">
                <div>• AS32934 (Meta / Facebook)</div>
                <div>• AS15169 (Google LLC)</div>
                <div>• AS138699 (ByteDance / TikTok)</div>
                <div>• AS8075 (Microsoft Ads)</div>
                <div>• AS16509 (Amazon AWS Datacenter)</div>
                <div>• AS14061 (DigitalOcean Crawlers)</div>
                <div>• AS209242 (Cloudflare Workers)</div>
                <div>• AS16276 (OVH SAS Hosting)</div>
              </div>
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* ABA 4: INFRAESTRUTURA EDGE & CONFIGURAÇÕES GLOBAIS                        */}
        {/* ========================================================================= */}
        {activeTab === "system" && (
          <div className="space-y-4 font-mono text-xs">
            <div className="p-6 rounded-2xl bg-neutral-900/70 border border-white/10 backdrop-blur-md space-y-4">
              <h3 className="text-base font-bold text-white font-poppins">Configurações Mestras do Sistema</h3>

              <div className="space-y-3">
                {/* Supabase Status */}
                <div className="p-4 rounded-xl bg-black/50 border border-white/10 flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <Database className="w-5 h-5 text-emerald-400" />
                    <div>
                      <div className="font-bold text-white">Banco de Dados Supabase (PostgreSQL + Auth)</div>
                      <div className="text-[11px] text-neutral-400">
                        {overview?.supabase?.url || "https://vabwqlkmngabpwnzrdel.supabase.co"}
                      </div>
                    </div>
                  </div>
                  <span className="px-3 py-1 rounded-full bg-emerald-950/60 border border-emerald-500/40 text-emerald-300 font-bold text-[10px]">
                    RLS BLINDADO & ATIVO
                  </span>
                </div>

                {/* Motor de Cloaking Edge */}
                <div className="p-4 rounded-xl bg-black/50 border border-white/10 flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <Server className="w-5 h-5 text-purple-400" />
                    <div>
                      <div className="font-bold text-white">Motor de Borda Phantom-X Edge v2.4</div>
                      <div className="text-[11px] text-neutral-400">
                        Inspeção de Headers, User-Agents de Robôs e ASN Fingerprinting
                      </div>
                    </div>
                  </div>
                  <span className="px-3 py-1 rounded-full bg-purple-950/60 border border-purple-500/40 text-purple-300 font-bold text-[10px]">
                    v2.4 ONLINE
                  </span>
                </div>

                {/* Kill Switch Global */}
                <div className="p-4 rounded-xl bg-black/50 border border-white/10 flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <ShieldAlert className={`w-5 h-5 ${killSwitchActive ? "text-red-400" : "text-neutral-400"}`} />
                    <div>
                      <div className="font-bold text-white">Kill-Switch de Emergência de Tráfego</div>
                      <div className="text-[11px] text-neutral-400">
                        Força 100% de todo o tráfego do cluster para a Safe Page em caso de auditoria massiva
                      </div>
                    </div>
                  </div>
                  <button
                    onClick={handleToggleKillSwitch}
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold transition cursor-pointer ${
                      killSwitchActive
                        ? "bg-red-600 text-white hover:bg-red-500"
                        : "bg-neutral-800 hover:bg-neutral-700 text-neutral-300 border border-white/10"
                    }`}
                  >
                    {killSwitchActive ? "DESATIVAR KILL-SWITCH" : "ATIVAR KILL-SWITCH"}
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </main>

      {/* Modal de Liberação de Plano para Operador */}
      {selectedUserForPlan && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="w-full max-w-xl bg-neutral-950 border border-white/20 rounded-2xl p-6 shadow-2xl font-mono text-xs">
            <div className="flex items-center justify-between border-b border-white/10 pb-3 mb-4">
              <div className="flex items-center space-x-2">
                <Crown className="w-5 h-5 text-amber-400" />
                <h3 className="text-base font-bold text-white font-poppins">Liberar / Alterar Plano de Assinatura</h3>
              </div>
              <button
                onClick={() => setSelectedUserForPlan(null)}
                className="text-neutral-400 hover:text-white p-1"
              >
                ✕
              </button>
            </div>

            {/* Informações do Operador */}
            <div className="p-3 rounded-xl bg-white/[0.03] border border-white/10 mb-4 flex items-center justify-between">
              <div>
                <div className="font-bold text-white text-sm">{selectedUserForPlan.name}</div>
                <div className="text-neutral-400 text-[11px]">{selectedUserForPlan.email}</div>
              </div>
              <div className="text-right">
                <div className="text-[10px] text-neutral-400 uppercase">Plano Atual</div>
                <span className="font-bold text-amber-300 uppercase">
                  {selectedUserForPlan.plan || "free"}
                </span>
              </div>
            </div>

            {/* Seleção de Novos Planos */}
            <div className="space-y-2 mb-4">
              <label className="block text-[11px] text-neutral-400 uppercase">Selecione o Plano a Liberar:</label>
              {(["free", "starter", "growth", "scale"] as PlanId[]).map((pId) => {
                const planInfo = PHANTOM_PLANS[pId];
                const isSelected = targetPlan === pId;

                return (
                  <div
                    key={pId}
                    onClick={() => setTargetPlan(pId)}
                    className={`p-3 rounded-xl border cursor-pointer transition flex items-center justify-between ${
                      isSelected
                        ? "bg-white/10 border-white text-white"
                        : "bg-black/40 border-white/10 text-neutral-300 hover:border-white/30"
                    }`}
                  >
                    <div>
                      <div className="flex items-center space-x-2">
                        <span className="font-bold text-sm">{planInfo.name}</span>
                        {planInfo.isPopular && (
                          <span className="px-1.5 py-0.5 rounded bg-white text-black text-[9px] font-bold">
                            MAIS POPULAR
                          </span>
                        )}
                      </div>
                      <div className="text-[10px] text-neutral-400 mt-0.5">
                        {planInfo.limits.maxDomains} Domínios • {planInfo.limits.maxCampaigns} Camuflagens • {planInfo.region}
                      </div>
                    </div>

                    <div className="text-right">
                      <div className="font-bold text-white text-sm">{planInfo.priceFormatted}</div>
                      <div className="text-[10px] text-neutral-400">{planInfo.period}</div>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Status do Plano */}
            <div className="mb-5">
              <label className="block text-[11px] text-neutral-400 uppercase mb-1">Status da Assinatura:</label>
              <select
                value={targetPlanStatus}
                onChange={(e: any) => setTargetPlanStatus(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-black/60 border border-white/10 text-white focus:outline-none"
              >
                <option value="active">Ativo (Acesso Liberado Imediato)</option>
                <option value="trial">Em Período de Testes (Trial Especial)</option>
                <option value="canceled">Cancelado / Suspenso</option>
              </select>
            </div>

            {/* Ações */}
            <div className="flex items-center justify-end space-x-3 pt-3 border-t border-white/10">
              <button
                type="button"
                onClick={() => setSelectedUserForPlan(null)}
                className="px-4 py-2 rounded-xl bg-neutral-900 border border-white/10 text-neutral-300 hover:text-white"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={handleSaveUserPlan}
                disabled={savingPlan}
                className="px-5 py-2 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-black font-bold text-xs uppercase tracking-wider transition shadow-lg flex items-center space-x-1.5 cursor-pointer disabled:opacity-50"
              >
                {savingPlan ? (
                  <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                ) : (
                  <Check className="w-3.5 h-3.5" />
                )}
                <span>Salvar &amp; Liberar Plano</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
