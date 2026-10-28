"use client";

import React, { useState, useEffect, Suspense } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { siteConfig } from "@/config/site";
import { auth } from "@/lib/auth";
import { Logo } from "@/components/ui/Logo";
import { RotatingGlobe } from "@/components/ui/RotatingGlobe";
import { ThemeToggle } from "@/components/ui/ThemeToggle";
import { TIMEZONE_REGIONS, DEFAULT_TIMEZONE } from "@/lib/timezones";
import {
  Lock,
  Mail,
  User,
  ArrowRight,
  Globe2,
  Eye,
  EyeOff,
  ShieldCheck,
  Zap,
  Activity,
  AlertTriangle,
  UserCheck,
} from "lucide-react";

function SignupFormInner() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [timezone, setTimezone] = useState(DEFAULT_TIMEZONE);
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [termsAccepted, setTermsAccepted] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isExistingUser, setIsExistingUser] = useState(false);

  useEffect(() => {
    const emailParam = searchParams.get("email");
    if (emailParam) {
      setEmail(emailParam);
    }
  }, [searchParams]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsExistingUser(false);

    if (!name || !email || !password || !confirmPassword) {
      setError("Preencha todos os campos obrigatórios.");
      return;
    }

    if (password.length < 8) {
      setError("A senha deve conter no mínimo 8 caracteres para garantir segurança em nível militar.");
      return;
    }

    if (password !== confirmPassword) {
      setError("As senhas informadas não coincidem.");
      return;
    }

    if (!termsAccepted) {
      setError("Você deve concordar com os Termos de Uso e Política de Privacidade.");
      return;
    }

    setLoading(true);

    try {
      const result = await auth.signup({
        name,
        email,
        password,
        timezone,
      });

      if (!result.success) {
        setError(result.error || "Falha ao provisionar a conta de operador.");
        if (result.error?.includes("Já existe uma conta")) {
          setIsExistingUser(true);
        }
        setLoading(false);
        return;
      }

      // Registro com sucesso e sessão já inicializada
      router.push("/dashboard");
    } catch {
      setError("Falha inesperada ao provisionar a conta. Tente novamente.");
      setLoading(false);
    }
  };

  return (
    <div className="w-full max-w-md my-auto space-y-6">
      {/* Box de Cadastro */}
      <div className="bg-gradient-to-b from-brand-surface/95 via-brand-dark/95 to-brand-black/95 border border-brand-border rounded-2xl p-6 sm:p-8 shadow-[0_20px_50px_rgba(0,0,0,0.6)] backdrop-blur-xl ring-1 ring-brand-border/40">
        {/* Top Logo & System Brand */}
        <div className="flex flex-col items-center text-center mb-6">
          <div className="relative mb-4">
            <div className="absolute inset-0 bg-neutral-200/50 dark:bg-white/10 rounded-2xl blur-lg animate-pulse" />
            <div className="relative w-16 h-16 rounded-2xl bg-brand-surface border border-brand-border p-2.5 flex items-center justify-center shadow-lg">
              <Logo size={48} />
            </div>
          </div>

          <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-brand-white font-poppins">
            Crie sua conta
          </h1>
          <p className="text-xs text-brand-secondary mt-1 max-w-xs">
            Configure seu acesso de operador e tenha visibilidade total sobre seu tráfego.
          </p>
        </div>

        {error && (
          <div className="mb-5 p-3.5 rounded-xl bg-neutral-900 border border-neutral-700 text-xs text-white font-mono space-y-2">
            <div className="flex items-start justify-between space-x-2">
              <div className="flex items-start space-x-2">
                <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                <span className="leading-snug">{error}</span>
              </div>
              <button
                onClick={() => setError(null)}
                className="text-brand-muted hover:text-white ml-2 text-sm shrink-0"
              >
                ✕
              </button>
            </div>
            {isExistingUser && (
              <div className="pt-2 border-t border-neutral-800">
                <Link
                  href={`/login?email=${encodeURIComponent(email)}`}
                  className="inline-flex items-center space-x-1.5 text-xs text-brand-white font-semibold underline hover:text-brand-secondary"
                >
                  <UserCheck className="w-3.5 h-3.5" />
                  <span>Acessar tela de login com este e-mail</span>
                </Link>
              </div>
            )}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Nome */}
          <div>
            <label className="block text-xs font-mono text-brand-secondary mb-1.5 font-medium">
              NOME DO OPERADOR
            </label>
            <div className="relative">
              <User className="w-4 h-4 text-brand-muted absolute left-3 top-3" />
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Seu nome ou apelido operacional"
                required
                autoComplete="name"
                className="w-full pl-9 pr-3 py-2.5 bg-brand-surface border border-brand-border rounded-xl text-xs text-brand-white placeholder-brand-muted focus:outline-none focus:border-brand-borderHighlight transition font-mono"
              />
            </div>
          </div>

          {/* Email */}
          <div>
            <label className="block text-xs font-mono text-brand-secondary mb-1.5 font-medium">
              E-MAIL PROFISSIONAL
            </label>
            <div className="relative">
              <Mail className="w-4 h-4 text-brand-muted absolute left-3 top-3" />
              <input
                type="email"
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value);
                  if (isExistingUser) setIsExistingUser(false);
                }}
                placeholder="operador@suaempresa.com"
                required
                autoComplete="email"
                className="w-full pl-9 pr-3 py-2.5 bg-brand-surface border border-brand-border rounded-xl text-xs text-brand-white placeholder-brand-muted focus:outline-none focus:border-brand-borderHighlight transition font-mono"
              />
            </div>
          </div>

          {/* SELEÇÃO DE FUSO HORÁRIO COM DEFAULT EM AMÉRICA/SÃO PAULO */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="block text-xs font-mono text-brand-secondary font-medium">
                FUSO HORÁRIO (TIMEZONE)
              </label>
              <span className="text-[10px] font-mono text-brand-muted">
                Horário da operação
              </span>
            </div>
            <div className="relative">
              <Globe2 className="w-4 h-4 text-brand-muted absolute left-3 top-3 pointer-events-none" />
              <select
                value={timezone}
                onChange={(e) => setTimezone(e.target.value)}
                className="w-full pl-9 pr-8 py-2.5 bg-brand-surface border border-brand-border rounded-xl text-xs text-brand-white focus:outline-none focus:border-brand-borderHighlight transition font-mono appearance-none cursor-pointer"
              >
                {TIMEZONE_REGIONS.map((group) => (
                  <optgroup
                    key={group.region}
                    label={`${group.flag} ${group.region}`}
                    className="bg-brand-surface text-brand-white font-mono"
                  >
                    {group.timezones.map((tz) => (
                      <option key={tz.value} value={tz.value} className="bg-brand-surface text-brand-white">
                        {tz.flag} {tz.label} ({tz.offset})
                      </option>
                    ))}
                  </optgroup>
                ))}
              </select>
              <div className="absolute right-3 top-3 pointer-events-none text-brand-muted text-[10px]">
                ▼
              </div>
            </div>
          </div>

          {/* Senha */}
          <div>
            <label className="block text-xs font-mono text-brand-secondary mb-1.5 font-medium">
              SENHA (MÍNIMO 8 CARACTERES)
            </label>
            <div className="relative">
              <Lock className="w-4 h-4 text-brand-muted absolute left-3 top-3" />
              <input
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••••••"
                required
                autoComplete="new-password"
                className="w-full pl-9 pr-9 py-2.5 bg-brand-surface border border-brand-border rounded-xl text-xs text-brand-white placeholder-brand-muted focus:outline-none focus:border-brand-borderHighlight transition font-mono"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-3 text-brand-muted hover:text-brand-white"
                title={showPassword ? "Ocultar senha" : "Exibir senha"}
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          {/* Confirmar Senha */}
          <div>
            <label className="block text-xs font-mono text-brand-secondary mb-1.5 font-medium">
              CONFIRMAR SENHA
            </label>
            <div className="relative">
              <Lock className="w-4 h-4 text-brand-muted absolute left-3 top-3" />
              <input
                type={showPassword ? "text" : "password"}
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="••••••••••••"
                required
                autoComplete="new-password"
                className="w-full pl-9 pr-3 py-2.5 bg-brand-surface border border-brand-border rounded-xl text-xs text-brand-white placeholder-brand-muted focus:outline-none focus:border-brand-borderHighlight transition font-mono"
              />
            </div>
          </div>

          {/* Termos */}
          <div className="pt-1">
            <label className="flex items-start space-x-2 text-xs text-brand-secondary cursor-pointer">
              <input
                type="checkbox"
                checked={termsAccepted}
                onChange={(e) => setTermsAccepted(e.target.checked)}
                className="rounded border-brand-border bg-brand-surface text-brand-white focus:ring-0 mt-0.5"
              />
              <span className="text-[11px] leading-tight">
                Concordo com os{" "}
                <Link href="/terms" className="text-brand-white underline hover:text-brand-secondary">
                  Termos de Serviço
                </Link>{" "}
                e com a{" "}
                <Link href="/privacy" className="text-brand-white underline hover:text-brand-secondary">
                  Política de Privacidade
                </Link>
                .
              </span>
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
                Provisionando credenciais criptografadas...
              </span>
            ) : (
              <>
                <span>Criar Minha Conta</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </form>

        {/* Alternar para Login */}
        <div className="mt-5 pt-4 border-t border-brand-border text-center text-xs text-brand-secondary font-mono">
          Já possui uma conta ativa?{" "}
          <Link href="/login" className="text-brand-white font-semibold underline hover:text-brand-secondary">
            Acessar console
          </Link>
        </div>
      </div>

      <div className="text-center text-[11px] font-mono text-brand-muted">
        Protegido por infraestrutura Phantom-X Edge • Criptografia SHA-256 + Salt
      </div>
    </div>
  );
}

export default function SignupPage() {
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
            <div className="hidden sm:flex items-center space-x-2 text-[11px] font-mono text-brand-muted bg-brand-surface px-2.5 py-1 rounded-full border border-brand-border">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
              <span>PoPs Operacionais Ativos</span>
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
              Infraestrutura de Tráfego Invisível em Escala Global.
            </h2>
            <p className="text-xs sm:text-sm text-brand-secondary font-sans leading-relaxed">
              Roteamento de precisão determinístico em borda com filtragem de bots em tempo real, proteção contra inspeção e preservação de atribuição.
            </p>
          </div>

          {/* Value Props / Instruções Claras */}
          <div className="mt-8 grid grid-cols-1 sm:grid-cols-3 gap-3 w-full max-w-lg text-left">
            <div className="p-3.5 rounded-xl bg-white/[0.03] border border-white/10 backdrop-blur-sm space-y-1">
              <div className="flex items-center space-x-1.5 text-xs font-semibold text-brand-white">
                <Zap className="w-3.5 h-3.5 text-brand-white" />
                <span>&lt; 18ms Latência</span>
              </div>
              <p className="text-[11px] text-brand-muted">
                Execução na borda sem intermediários ou redirects lentos.
              </p>
            </div>

            <div className="p-3.5 rounded-xl bg-white/[0.03] border border-white/10 backdrop-blur-sm space-y-1">
              <div className="flex items-center space-x-1.5 text-xs font-semibold text-brand-white">
                <ShieldCheck className="w-3.5 h-3.5 text-brand-white" />
                <span>Zero Footprint</span>
              </div>
              <p className="text-[11px] text-brand-muted">
                Assinatura estéril indetectável por crawlers e verificadores.
              </p>
            </div>

            <div className="p-3.5 rounded-xl bg-white/[0.03] border border-white/10 backdrop-blur-sm space-y-1">
              <div className="flex items-center space-x-1.5 text-xs font-semibold text-brand-white">
                <Activity className="w-3.5 h-3.5 text-brand-white" />
                <span>Click ID Único</span>
              </div>
              <p className="text-[11px] text-brand-muted">
                Atribuição idempotente e preservação estrita de UTMs.
              </p>
            </div>
          </div>
        </div>

        {/* Bottom Slogan / Footer Indicator */}
        <div className="relative z-10 pt-4 flex flex-wrap items-center justify-between text-[11px] font-mono text-brand-muted border-t border-white/10 gap-2">
          <span>SLA 99.99% • Criptografia Ponta a Ponta</span>
          <span>phantomx.pro</span>
        </div>
      </div>

      {/* 
        ========================================================================
        LADO DIREITO: FORMULÁRIO DE CADASTRO COM LOGO, FUSO HORÁRIO E ELEGÂNCIA
        ========================================================================
      */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-6 sm:p-10 lg:p-12 relative overflow-y-auto">
        <Suspense fallback={
          <div className="w-full max-w-md my-auto flex flex-col items-center justify-center p-12 text-center">
            <div className="w-8 h-8 rounded-full border-2 border-white border-t-transparent animate-spin mb-4" />
            <p className="text-xs font-mono text-brand-muted">Inicializando provisionador...</p>
          </div>
        }>
          <SignupFormInner />
        </Suspense>
      </div>
    </div>
  );
}