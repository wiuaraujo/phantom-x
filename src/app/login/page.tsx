"use client";

import React, { useState, useEffect, Suspense } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { siteConfig } from "@/config/site";
import { auth } from "@/lib/auth";
import { Logo } from "@/components/ui/Logo";
import { RotatingGlobe } from "@/components/ui/RotatingGlobe";
import { ThemeToggle } from "@/components/ui/ThemeToggle";
import { LanguageSelector } from "@/components/ui/LanguageSelector";
import {
  Eye,
  EyeOff,
  Lock,
  User,
  ArrowRight,
  ShieldCheck,
  ShieldAlert,
  AlertTriangle,
  Zap,
  Activity,
  KeyRound,
  UserPlus,
} from "lucide-react";
import { EmailVerificationModal } from "@/components/auth/EmailVerificationModal";

function LoginFormInner() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [identifier, setIdentifier] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [accountNotFound, setAccountNotFound] = useState(false);
  const [authRequiredNotice, setAuthRequiredNotice] = useState(false);

  // Email Verification OTP Modal State
  const [showVerificationModal, setShowVerificationModal] = useState(false);
  const [unverifiedUser, setUnverifiedUser] = useState<{ id: string; name: string; email: string } | null>(null);
  const [expiresAt, setExpiresAt] = useState(0);
  const [verificationLoading, setVerificationLoading] = useState(false);

  useEffect(() => {
    const emailParam = searchParams.get("email");
    if (emailParam) {
      setIdentifier(emailParam);
    }
    if (searchParams.get("auth_required") === "1") {
      setAuthRequiredNotice(true);
    }
  }, [searchParams]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setAccountNotFound(false);

    const cleanId = identifier.trim();
    if (!cleanId || !password) {
      setError("Por favor, preencha todos os campos obrigatórios.");
      return;
    }

    if (password.length < 6) {
      setError("A senha deve conter no mínimo 6 caracteres.");
      return;
    }

    setLoading(true);

    try {
      const result = await auth.login(cleanId, password, rememberMe);

      if (!result.success) {
        // Se a conta existe e a senha está correta, mas O E-MAIL AINDA NÃO FOI CONFIRMADO
        if (result.requiresEmailVerification && result.unverifiedUser) {
          setUnverifiedUser(result.unverifiedUser);
          setExpiresAt(Date.now() + 5 * 60 * 1000);

          // Dispara o e-mail de confirmação para o Gmail
          try {
            const res = await fetch("/api/v1/auth/send-verification", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                email: result.unverifiedUser.email,
                name: result.unverifiedUser.name,
              }),
            });
            const data = await res.json();
            if (!data.success) {
              setError(data.error || "Falha ao enviar e-mail de confirmação.");
              setLoading(false);
              return;
            }
          } catch {}

          // Abre o Pop-up Modal imediatamente!
          setShowVerificationModal(true);
          setLoading(false);
          return;
        }

        setError(result.error || "Credenciais inválidas. Verifique os dados e tente novamente.");
        if (result.accountNotFound) {
          setAccountNotFound(true);
        }
        setLoading(false);
        return;
      }

      const redirectTarget = searchParams.get("redirect") || "/dashboard";
      router.push(redirectTarget);
    } catch {
      setError("Ocorreu um erro no terminal de autenticação. Tente novamente.");
      setLoading(false);
    }
  };

  const handleConfirmVerification = async (inputCode: string) => {
    if (!unverifiedUser) return;
    setVerificationLoading(true);

    try {
      const res = await auth.confirmEmailAndLogin(unverifiedUser.id, inputCode, rememberMe);
      if (!res.success) {
        setVerificationLoading(false);
        throw new Error(res.error || "Código de verificação incorreto ou expirado.");
      }

      setShowVerificationModal(false);
      const redirectTarget = searchParams.get("redirect") || "/dashboard";
      router.push(redirectTarget);
    } catch (err: any) {
      setVerificationLoading(false);
      throw err;
    }
  };

  const handleResendVerification = async (): Promise<void> => {
    if (!unverifiedUser) return;

    const res = await fetch("/api/v1/auth/send-verification", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        email: unverifiedUser.email,
        name: unverifiedUser.name,
      }),
    });
    const data = await res.json();
    if (!data.success) {
      throw new Error(data.error || "Falha ao reenviar código. Aguarde alguns instantes.");
    }
    setExpiresAt(data.expiresAt || (Date.now() + 5 * 60 * 1000));
  };

  return (
    <div className="w-full max-w-md mx-auto space-y-5">
      {/* Mobile-only compact Globe & Headline (< lg) */}
      <div className="lg:hidden flex flex-col items-center text-center pt-2 pb-1">
        <div className="relative flex items-center justify-center mb-3">
          <RotatingGlobe size={150} />
        </div>
        <h2 className="text-lg font-bold text-brand-white font-poppins">
          Centro de Comando Phantom-X
        </h2>
        <p className="text-[11px] text-brand-secondary mt-0.5">
          Roteamento em borda e telemetria de tráfego em tempo real
        </p>
      </div>

      {/* Box de Login */}
      <div className="bg-gradient-to-b from-brand-surface/95 via-brand-dark/95 to-brand-black/95 border border-brand-border rounded-2xl p-5 sm:p-8 shadow-[0_20px_50px_rgba(0,0,0,0.6)] backdrop-blur-xl ring-1 ring-brand-border/40">
        {/* Top Logo & System Brand */}
        <div className="flex flex-col items-center text-center mb-5 sm:mb-6">
          <div className="relative mb-3 sm:mb-4">
            <div className="absolute inset-0 bg-neutral-200/50 dark:bg-white/10 rounded-2xl blur-lg animate-pulse" />
            <div className="relative w-14 h-14 sm:w-16 sm:h-16 rounded-2xl bg-brand-surface border border-brand-border p-2 sm:p-2.5 flex items-center justify-center shadow-lg">
              <Logo size={44} />
            </div>
          </div>

          <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-brand-white font-poppins flex items-center space-x-2">
            <span>Entrar no</span>
            <span className="font-poppins font-extrabold tracking-tight">PHANTOM-X</span>
          </h1>
          <p className="text-xs text-brand-secondary mt-1">
            Terminal seguro de controle de tráfego e regras de borda.
          </p>
        </div>

        {/* Notificação de Sessão Requerida */}
        {authRequiredNotice && !error && (
          <div className="mb-4 sm:mb-5 p-3.5 sm:p-4 rounded-xl bg-gradient-to-b from-white/[0.08] via-neutral-950 to-black border border-white/15 text-xs text-neutral-300 font-sans shadow-lg shadow-black/50 ring-1 ring-white/5 animate-in fade-in duration-300">
            <div className="space-y-0.5">
              <span className="font-semibold block text-white text-xs tracking-tight">
                Autenticação Requerida
              </span>
              <p className="text-[11px] text-neutral-400 leading-normal">
                Acesso restrito. Identifique-se com sua conta ou cadastre-se primeiro.
              </p>
            </div>
          </div>
        )}

        {/* Alerta de Cibersegurança: CONTA NÃO EXISTE */}
        {accountNotFound && (
          <div className="mb-4 sm:mb-5 p-3.5 sm:p-4 rounded-xl bg-red-950/30 border border-red-500/40 text-xs space-y-2.5 animate-in fade-in duration-300">
            <div className="flex items-start space-x-2.5">
              <ShieldAlert className="w-5 h-5 text-red-400 shrink-0 mt-0.5" />
              <div className="space-y-1">
                <p className="font-bold text-red-200 text-xs tracking-tight">
                  CONTA NÃO CADASTRADA NO SISTEMA
                </p>
                <p className="text-neutral-300 text-[11px] leading-relaxed">
                  O e-mail ou usuário <span className="font-mono text-white font-semibold">"{identifier}"</span> não possui cadastro. É obrigatório registrar-se antes de entrar.
                </p>
              </div>
            </div>

            <Link
              href={`/signup?email=${encodeURIComponent(identifier)}`}
              className="inline-flex items-center justify-center space-x-2 w-full py-2.5 px-3 rounded-lg bg-white text-black font-semibold text-xs hover:bg-neutral-200 transition shadow-sm"
            >
              <UserPlus className="w-3.5 h-3.5" />
              <span>Criar Minha Conta Agora</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        )}

        {/* Erro Genérico ou de Bloqueio */}
        {error && !accountNotFound && (
          <div className="mb-4 sm:mb-5 p-3 sm:p-3.5 rounded-xl bg-neutral-900 border border-neutral-700 text-xs text-white font-mono flex items-start justify-between space-x-2">
            <div className="flex items-start space-x-2">
              <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
              <span className="leading-snug">{error}</span>
            </div>
            <button
              onClick={() => setError(null)}
              className="text-brand-muted hover:text-white ml-2 text-sm shrink-0"
              title="Fechar"
            >
              ✕
            </button>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-3.5 sm:space-y-4">
          {/* Email ou Nome de Usuário */}
          <div>
            <label className="block text-xs font-mono text-brand-secondary mb-1.5 font-medium">
              E-MAIL OU NOME DE USUÁRIO
            </label>
            <div className="relative">
              <User className="w-4 h-4 text-brand-muted absolute left-3 top-3" />
              <input
                type="text"
                value={identifier}
                onChange={(e) => {
                  setIdentifier(e.target.value);
                  if (accountNotFound) setAccountNotFound(false);
                }}
                placeholder="seu.email@exemplo.com"
                required
                autoComplete="username"
                className="w-full pl-9 pr-3 py-2.5 bg-brand-surface border border-brand-border rounded-xl text-xs sm:text-xs text-brand-white placeholder-brand-muted focus:outline-none focus:border-brand-borderHighlight transition font-mono"
              />
            </div>
          </div>

          {/* Senha */}
          <div>
            <div className="flex justify-between items-center mb-1.5">
              <label className="text-xs font-mono text-brand-secondary font-medium">
                SENHA
              </label>
              <Link
                href="/forgot-password"
                className="text-[11px] font-mono text-brand-muted hover:text-brand-white transition"
              >
                Esqueceu?
              </Link>
            </div>
            <div className="relative">
              <Lock className="w-4 h-4 text-brand-muted absolute left-3 top-3" />
              <input
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••••••"
                required
                autoComplete="current-password"
                className="w-full pl-9 pr-9 py-2.5 bg-brand-surface border border-brand-border rounded-xl text-xs sm:text-xs text-brand-white placeholder-brand-muted focus:outline-none focus:border-brand-borderHighlight transition font-mono"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-3 text-brand-muted hover:text-brand-white p-0.5"
                title={showPassword ? "Ocultar senha" : "Exibir senha"}
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          {/* Manter Conectado */}
          <div className="pt-0.5">
            <label className="flex items-center space-x-2 text-xs text-brand-secondary cursor-pointer">
              <input
                type="checkbox"
                checked={rememberMe}
                onChange={(e) => setRememberMe(e.target.checked)}
                className="rounded border-brand-border bg-brand-surface text-brand-white focus:ring-0"
              />
              <span className="text-[11px]">Manter sessão ativa neste terminal (7 dias)</span>
            </label>
          </div>

          {/* Botão Submit */}
          <button
            type="submit"
            disabled={loading}
            className="w-full mt-3 sm:mt-4 py-3 rounded-xl bg-neutral-900 dark:bg-white text-white dark:text-black font-semibold text-xs hover:bg-neutral-800 dark:hover:bg-neutral-200 transition shadow-sm flex items-center justify-center space-x-2 disabled:opacity-50"
          >
            {loading ? (
              <span className="font-mono text-xs animate-pulse flex items-center space-x-2">
                <KeyRound className="w-3.5 h-3.5 animate-spin" />
                <span>Autenticando sessão criptografada...</span>
              </span>
            ) : (
              <>
                <span>Acessar Console Phantom-X</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </form>

        {/* Alternar para Cadastro */}
        <div className="mt-4 sm:mt-5 pt-3 sm:pt-4 border-t border-brand-border text-center text-xs text-brand-secondary font-mono">
          Não possui uma conta?{" "}
          <Link
            href={identifier ? `/signup?email=${encodeURIComponent(identifier)}` : "/signup"}
            className="text-brand-white font-semibold underline hover:text-brand-secondary"
          >
            Criar conta de operador
          </Link>
        </div>
      </div>

      {/* Mobile Value Proposition Badges */}
      <div className="lg:hidden grid grid-cols-3 gap-2 pt-1 text-center">
        <div className="p-2 rounded-xl bg-brand-surface/60 border border-brand-border">
          <Zap className="w-3.5 h-3.5 text-brand-white mx-auto mb-1" />
          <div className="text-[10px] font-semibold text-brand-white">&lt; 18ms</div>
          <div className="text-[9px] text-brand-muted">Borda Global</div>
        </div>
        <div className="p-2 rounded-xl bg-brand-surface/60 border border-brand-border">
          <ShieldCheck className="w-3.5 h-3.5 text-brand-white mx-auto mb-1" />
          <div className="text-[10px] font-semibold text-brand-white">Anti-Bot</div>
          <div className="text-[9px] text-brand-muted">Filtragem Ativa</div>
        </div>
        <div className="p-2 rounded-xl bg-brand-surface/60 border border-brand-border">
          <Activity className="w-3.5 h-3.5 text-brand-white mx-auto mb-1" />
          <div className="text-[10px] font-semibold text-brand-white">SHA-256</div>
          <div className="text-[9px] text-brand-muted">Cofre Seguro</div>
        </div>
      </div>

      <div className="text-center text-[10px] sm:text-[11px] font-mono text-brand-muted">
        Terminal protegido por SHA-256 com Salting e Detecção de Força Bruta
      </div>

      {/* Modal de Confirmação de Conta via Gmail */}
      <EmailVerificationModal
        isOpen={showVerificationModal}
        onClose={() => setShowVerificationModal(false)}
        email={unverifiedUser?.email || ""}
        name={unverifiedUser?.name || ""}
        onResend={handleResendVerification}
      />
    </div>
  );
}

export default function LoginPage() {
  return (
    <div className="min-h-screen w-full bg-brand-black text-brand-white flex flex-col lg:flex-row font-sans selection:bg-white selection:text-black">
      {/* 
        ========================================================================
        MOBILE TOP BAR (< lg)
        ========================================================================
      */}
      <div className="lg:hidden flex items-center justify-between p-4 border-b border-brand-border bg-brand-surface/60 backdrop-blur-md sticky top-0 z-30">
        <Link href="/" className="flex items-center space-x-2">
          <Logo size={32} />
          <span className="font-poppins font-bold text-sm text-brand-white tracking-tight">
            {siteConfig.name}
          </span>
        </Link>
        <div className="flex items-center space-x-2">
          <ThemeToggle />
          <LanguageSelector />
        </div>
      </div>

      {/* 
        ========================================================================
        DESKTOP SHOWCASE (Lado Esquerdo, visível apenas em telas >= lg)
        ========================================================================
      */}
      <div className="hidden lg:flex w-1/2 relative bg-gradient-to-br from-brand-surface via-brand-dark to-brand-black border-r border-brand-border p-8 lg:p-12 flex-col justify-between overflow-hidden">
        {/* Subtle Ambient Glow Effect */}
        <div className="absolute top-1/4 left-1/4 w-80 h-80 bg-white/[0.03] rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-10 right-10 w-60 h-60 bg-white/[0.02] rounded-full blur-2xl pointer-events-none" />

        {/* Top Header Logo & Theme Toggle */}
        <div className="relative z-10 flex items-center justify-between">
          <Link href="/" className="flex items-center space-x-3 group">
            <Logo size={40} className="group-hover:scale-105 transition-transform shrink-0" />
            <div className="flex flex-col">
              <span className="font-poppins text-lg font-bold tracking-tight text-brand-white leading-none">
                {siteConfig.name}
              </span>
              <span className="text-[10px] text-brand-muted tracking-wider font-sans uppercase mt-1">
                Traffic Intelligence & Stealth Cloaking
              </span>
            </div>
          </Link>
          <div className="flex items-center space-x-2">
            <ThemeToggle />
            <LanguageSelector />
          </div>
        </div>

        {/* Center: Rotating 3D Globe & Dynamic Interactive Authority */}
        <div className="relative z-10 my-auto py-8 flex flex-col items-center text-center">
          <div className="relative flex items-center justify-center mb-6">
            <RotatingGlobe size={310} />
          </div>

          <div className="max-w-md mx-auto space-y-3">
            <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-brand-white leading-tight font-poppins">
              Acesso ao Centro de Comando Phantom-X.
            </h2>
            <p className="text-xs sm:text-sm text-brand-secondary font-sans leading-relaxed">
              Monitore fluxos de tráfego em tempo real, configure regras determinísticas de borda e proteja suas ofertas com latência submilisegundo.
            </p>
          </div>

          {/* Value Props */}
          <div className="mt-8 grid grid-cols-3 gap-3 w-full max-w-lg text-left">
            <div className="p-3.5 rounded-xl bg-white/[0.03] border border-white/10 backdrop-blur-sm space-y-1">
              <div className="flex items-center space-x-1.5 text-xs font-semibold text-brand-white">
                <Zap className="w-3.5 h-3.5 text-brand-white" />
                <span>Roteamento Borda</span>
              </div>
              <p className="text-[11px] text-brand-muted">
                Execução local distribuída em mais de 14 data centers.
              </p>
            </div>

            <div className="p-3.5 rounded-xl bg-white/[0.03] border border-white/10 backdrop-blur-sm space-y-1">
              <div className="flex items-center space-x-1.5 text-xs font-semibold text-brand-white">
                <ShieldCheck className="w-3.5 h-3.5 text-brand-white" />
                <span>Filtragem Ativa</span>
              </div>
              <p className="text-[11px] text-brand-muted">
                Heurísticas de inspeção contra bots de ad networks.
              </p>
            </div>

            <div className="p-3.5 rounded-xl bg-white/[0.03] border border-white/10 backdrop-blur-sm space-y-1">
              <div className="flex items-center space-x-1.5 text-xs font-semibold text-brand-white">
                <Activity className="w-3.5 h-3.5 text-brand-white" />
                <span>Telemetria Real</span>
              </div>
              <p className="text-[11px] text-brand-muted">
                Métricas precisas de cliques, IPs e decisões de tráfego.
              </p>
            </div>
          </div>
        </div>

        {/* Bottom Slogan / Footer Indicator */}
        <div className="relative z-10 pt-4 flex flex-wrap items-center justify-between text-[11px] font-mono text-brand-muted border-t border-white/10 gap-2">
          <span>Sessão Criptografada • TLS 1.3</span>
          <span>phantomx.pro</span>
        </div>
      </div>

      {/* 
        ========================================================================
        FORMULÁRIO DE LOGIN (100% Responsivo, Mobile App First no Mobile)
        ========================================================================
      */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-4 sm:p-8 lg:p-12 relative overflow-y-auto">
        <Suspense fallback={
          <div className="w-full max-w-md my-auto flex flex-col items-center justify-center p-12 text-center">
            <div className="w-8 h-8 rounded-full border-2 border-white border-t-transparent animate-spin mb-4" />
            <p className="text-xs font-mono text-brand-muted">Carregando console seguro...</p>
          </div>
        }>
          <LoginFormInner />
        </Suspense>
      </div>
    </div>
  );
}
