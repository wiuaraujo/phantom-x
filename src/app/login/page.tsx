"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { siteConfig } from "@/config/site";
import { auth } from "@/lib/auth";
import { Logo } from "@/components/ui/Logo";
import { RotatingGlobe } from "@/components/ui/RotatingGlobe";
import { ThemeToggle } from "@/components/ui/ThemeToggle";
import {
  Eye,
  EyeOff,
  Lock,
  Mail,
  ArrowRight,
  ShieldCheck,
  Zap,
  Activity,
} from "lucide-react";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!email || !password) {
      setError("Por favor, preencha todos os campos.");
      return;
    }

    if (password.length < 6) {
      setError("A senha deve ter no mínimo 6 caracteres.");
      return;
    }

    setLoading(true);

    try {
      await new Promise((resolve) => setTimeout(resolve, 600));
      auth.login(email, password);
      router.push("/dashboard");
    } catch {
      setError("Credenciais inválidas. Verifique os dados e tente novamente.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-full bg-brand-black text-brand-white flex flex-col lg:flex-row font-sans selection:bg-white selection:text-black">
      {/* 
        ========================================================================
        LADO ESQUERDO: SHOWCASE DINÂMICO COM GLOBO 3D, AUTORIDADE E RETENÇÃO
        ========================================================================
      */}
      <div className="w-full lg:w-1/2 relative bg-gradient-to-br from-brand-surface via-brand-dark to-brand-black border-b lg:border-b-0 lg:border-r border-brand-border p-6 sm:p-10 lg:p-12 flex flex-col justify-between overflow-hidden">
        {/* Subtle Ambient Glow Effect */}
        <div className="absolute top-1/4 left-1/4 w-80 h-80 bg-white/[0.03] rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-10 right-10 w-60 h-60 bg-white/[0.02] rounded-full blur-2xl pointer-events-none" />

        {/* Top Header Logo & Theme Toggle */}
        <div className="relative z-10 flex items-center justify-between">
          <Link href="/" className="flex items-center space-x-3 group">
            <Logo size={36} />
            <div className="flex flex-col">
              <span className="font-mono text-sm font-bold text-brand-white tracking-widest leading-none">
                {siteConfig.name}
              </span>
              <span className="text-[10px] text-brand-muted tracking-wider font-mono uppercase mt-0.5">
                Traffic Intelligence & Stealth Cloaking
              </span>
            </div>
          </Link>
          <div className="flex items-center space-x-2">
            <ThemeToggle />
            <div className="hidden sm:flex items-center space-x-2 text-[11px] font-mono text-brand-muted bg-brand-surface px-2.5 py-1 rounded-full border border-brand-border">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
              <span>Console Seguro</span>
            </div>
          </div>
        </div>

        {/* Center: Rotating 3D Globe & Dynamic Interactive Authority */}
        <div className="relative z-10 my-auto py-8 flex flex-col items-center text-center">
          <div className="relative flex items-center justify-center mb-6">
            <RotatingGlobe size={310} />
          </div>

          <div className="max-w-md mx-auto space-y-3">
            <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-brand-white leading-tight">
              Acesso ao Centro de Comando Phantom-X.
            </h2>
            <p className="text-xs sm:text-sm text-brand-secondary font-sans leading-relaxed">
              Monitore fluxos de tráfego em tempo real, configure regras determinísticas de borda e proteja suas ofertas com latência submilisegundo.
            </p>
          </div>

          {/* Value Props */}
          <div className="mt-8 grid grid-cols-1 sm:grid-cols-3 gap-3 w-full max-w-lg text-left">
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
        LADO DIREITO: FORMULÁRIO DE LOGIN COM LOGO, ELEGANTE E MINIMALISTA
        ========================================================================
      */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-6 sm:p-10 lg:p-12 relative overflow-y-auto">
        <div className="w-full max-w-md my-auto space-y-6">
          {/* Box de Login */}
          <div className="bg-gradient-to-b from-brand-surface/95 via-brand-dark/95 to-brand-black/95 border border-brand-border rounded-2xl p-6 sm:p-8 shadow-[0_20px_50px_rgba(0,0,0,0.6)] backdrop-blur-xl ring-1 ring-brand-border/40">
            {/* Top Logo & System Brand */}
            <div className="flex flex-col items-center text-center mb-6">
              <div className="relative mb-3">
                <div className="absolute inset-0 bg-neutral-200/50 dark:bg-white/10 rounded-2xl blur-lg animate-pulse" />
                <div className="relative w-14 h-14 rounded-2xl bg-brand-surface border border-brand-border p-2 flex items-center justify-center shadow-lg">
                  <Logo size={42} />
                </div>
              </div>

              <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-brand-white flex items-center space-x-2">
                <span>Entrar no</span>
                <span className="font-mono tracking-widest">PHANTOM X</span>
              </h1>
              <p className="text-xs text-brand-secondary mt-1">
                Acesse o console para gerenciar seus domínios e regras.
              </p>
            </div>

            {error && (
              <div className="mb-5 p-3 rounded-xl bg-neutral-900 border border-neutral-700 text-xs text-white font-mono flex items-center justify-between">
                <span>{error}</span>
                <button
                  onClick={() => setError(null)}
                  className="text-brand-muted hover:text-white ml-2 text-sm"
                >
                  ✕
                </button>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Email */}
              <div>
                <label className="block text-xs font-mono text-brand-secondary mb-1.5 font-medium">
                  E-MAIL DE ACESSO
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-brand-muted absolute left-3 top-3" />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="operador@suaempresa.com"
                    required
                    className="w-full pl-9 pr-3 py-2.5 bg-brand-surface border border-brand-border rounded-xl text-xs text-brand-white placeholder-brand-muted focus:outline-none focus:border-brand-borderHighlight transition font-mono"
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
                    className="w-full pl-9 pr-9 py-2.5 bg-brand-surface border border-brand-border rounded-xl text-xs text-brand-white placeholder-brand-muted focus:outline-none focus:border-brand-borderHighlight transition font-mono"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-3 text-brand-muted hover:text-brand-white"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {/* Manter Conectado */}
              <div className="pt-1">
                <label className="flex items-center space-x-2 text-xs text-brand-secondary cursor-pointer">
                  <input
                    type="checkbox"
                    checked={rememberMe}
                    onChange={(e) => setRememberMe(e.target.checked)}
                    className="rounded border-brand-border bg-brand-surface text-brand-white focus:ring-0"
                  />
                  <span className="text-[11px]">Manter sessão ativa neste terminal</span>
                </label>
              </div>

              {/* Botão Submit */}
              <button
                type="submit"
                disabled={loading}
                className="w-full mt-4 py-3 rounded-xl bg-neutral-900 dark:bg-white text-white dark:text-black font-semibold text-xs hover:bg-neutral-800 dark:hover:bg-neutral-200 transition shadow-sm flex items-center justify-center space-x-2 disabled:opacity-50"
              >
                {loading ? (
                  <span className="font-mono text-xs animate-pulse">
                    Autenticando sessão segura...
                  </span>
                ) : (
                  <>
                    <span>Entrar no Console</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </form>

            {/* Alternar para Cadastro */}
            <div className="mt-5 pt-4 border-t border-brand-border text-center text-xs text-brand-secondary font-mono">
              Não possui uma conta?{" "}
              <Link href="/signup" className="text-brand-white font-semibold underline hover:text-brand-secondary">
                Criar conta de operador
              </Link>
            </div>
          </div>

          <div className="text-center text-[11px] font-mono text-brand-muted">
            Terminal autenticado com criptografia ponta a ponta
          </div>
        </div>
      </div>
    </div>
  );
}
