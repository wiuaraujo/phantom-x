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
import { TIMEZONE_REGIONS, DEFAULT_TIMEZONE } from "@/lib/timezones";
import {
  COUNTRY_CALLING_CODES,
  DEFAULT_COUNTRY_CALLING_CODE,
  CountryCallingCode,
  formatPhoneNumber,
} from "@/lib/countryCodes";
import { EmailVerificationModal } from "@/components/auth/EmailVerificationModal";
import {
  Lock,
  Mail,
  User,
  Phone,
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
  const [phone, setPhone] = useState("");
  const [selectedCountry, setSelectedCountry] = useState<CountryCallingCode>(DEFAULT_COUNTRY_CALLING_CODE);
  const [timezone, setTimezone] = useState(DEFAULT_TIMEZONE);
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [termsAccepted, setTermsAccepted] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isExistingUser, setIsExistingUser] = useState(false);

  // Email Verification OTP State (Código de 6 Números com expiração de 5 min)
  const [showVerificationModal, setShowVerificationModal] = useState(false);
  const [expiresAt, setExpiresAt] = useState(0);
  const [verificationLoading, setVerificationLoading] = useState(false);

  const [paidBanner, setPaidBanner] = useState<string | null>(null);

  useEffect(() => {
    const emailParam = searchParams.get("email");
    if (emailParam) {
      setEmail(emailParam);
    }
    const isPaid = searchParams.get("paid") === "1" || !!searchParams.get("session_id");
    const planParam = searchParams.get("plan");
    if (isPaid && planParam) {
      setPaidBanner(
        `Pagamento do Plano ${planParam.toUpperCase()} aprovado na Stripe! Defina seus dados abaixo para acessar o painel imediatamente.`
      );
    }
  }, [searchParams]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsExistingUser(false);

    if (!name || !email || !phone || !password || !confirmPassword) {
      setError("Preencha todos os campos obrigatórios.");
      return;
    }

    const cleanEmail = email.trim().toLowerCase();
    const cleanName = name.trim();

    // Validação preventiva: verifica se a conta já existe
    const existingUsers = auth.getUsers();
    if (existingUsers.some((u) => u.email.toLowerCase() === cleanEmail)) {
      setError("Já existe uma conta registrada com este e-mail. Por favor, faça login ou use outro e-mail.");
      setIsExistingUser(true);
      return;
    }

    const rawPhoneDigits = phone.replace(/\D/g, "");
    if (rawPhoneDigits.length < selectedCountry.minDigits) {
      setError(
        `Por favor, informe um número de telefone válido com DDD (${selectedCountry.minDigits} a ${selectedCountry.maxDigits} dígitos).`
      );
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

    // Dispara envio do e-mail de confirmação oficial com expiração de 5 min
    setLoading(true);
    try {
      const res = await fetch("/api/v1/auth/send-verification", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: cleanEmail, name: cleanName }),
      });
      const data = await res.json();

      if (!data.success) {
        setError(data.error || "Falha ao enviar e-mail de verificação.");
        setLoading(false);
        return;
      }

      setExpiresAt(data?.expiresAt || (Date.now() + 5 * 60 * 1000));
      setShowVerificationModal(true);
    } catch {
      setError("Erro de conexão ao solicitar código. Verifique sua rede e tente novamente.");
    } finally {
      setLoading(false);
    }
  };

  const handleConfirmVerification = async (inputCode: string) => {
    setVerificationLoading(true);

    const cleanEmail = email.trim().toLowerCase();

    // Validação estrita do código enviado para o Gmail
    try {
      const remoteRes = await fetch("/api/v1/auth/verify-code", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: cleanEmail, code: inputCode }),
      });
      const remoteData = await remoteRes.json();

      if (!remoteData.success) {
        setVerificationLoading(false);
        throw new Error(
          remoteData.error ||
            "Código de verificação incorreto ou expirado. Verifique os números recebidos na sua caixa de entrada do Gmail."
        );
      }
    } catch (err: any) {
      setVerificationLoading(false);
      throw err;
    }

    // Token verificado com sucesso via e-mail real! Finaliza o provisionamento e login da conta
    try {
      const result = await auth.signup({
        name,
        email: cleanEmail,
        phone,
        phoneCountryCode: selectedCountry.code,
        password,
        timezone,
      });

      if (!result.success) {
        setVerificationLoading(false);
        throw new Error(result.error || "Falha ao provisionar a conta de operador.");
      }

      setShowVerificationModal(false);
      const planParam = searchParams.get("plan");
      const isPaid = searchParams.get("paid") === "1" || !!searchParams.get("session_id");

      if (planParam && ["starter", "growth", "scale"].includes(planParam)) {
        if (isPaid) {
          router.push(`/dashboard?upgraded=1&plan=${planParam}`);
        } else {
          router.push(`/dashboard?upgrade_prompt=${planParam}`);
        }
      } else {
        router.push("/dashboard");
      }
    } catch (err: any) {
      setVerificationLoading(false);
      throw err;
    }
  };

  const handleResendVerification = async (): Promise<void> => {
    const cleanEmail = email.trim().toLowerCase();
    const cleanName = name.trim();

    const res = await fetch("/api/v1/auth/send-verification", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email: cleanEmail, name: cleanName }),
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
          Provisionamento de Cluster Phantom-X
        </h2>
        <p className="text-[11px] text-brand-secondary mt-0.5">
          Cadastre seu acesso de operador com fuso horário e telemetria
        </p>
      </div>

      {/* Box de Cadastro */}
      <div className="bg-gradient-to-b from-brand-surface/95 via-brand-dark/95 to-brand-black/95 border border-brand-border rounded-2xl p-5 sm:p-8 shadow-[0_20px_50px_rgba(0,0,0,0.6)] backdrop-blur-xl ring-1 ring-brand-border/40">
        {/* Top Logo & System Brand */}
        <div className="flex flex-col items-center text-center mb-5 sm:mb-6">
          <div className="relative mb-3 sm:mb-4">
            <div className="absolute inset-0 bg-neutral-200/50 dark:bg-white/10 rounded-2xl blur-lg animate-pulse" />
            <div className="relative w-14 h-14 sm:w-16 sm:h-16 rounded-2xl bg-brand-surface border border-brand-border p-2 sm:p-2.5 flex items-center justify-center shadow-lg">
              <Logo size={44} />
            </div>
          </div>

          <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-brand-white font-poppins">
            Crie sua conta
          </h1>
          <p className="text-xs text-brand-secondary mt-1 max-w-xs">
            Configure seu acesso de operador e tenha visibilidade total sobre seu tráfego.
          </p>
        </div>

        {paidBanner && (
          <div className="mb-4 sm:mb-5 p-3.5 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-xs text-emerald-400 font-mono flex items-center space-x-2">
            <ShieldCheck className="w-4 h-4 shrink-0 text-emerald-400" />
            <span>{paidBanner}</span>
          </div>
        )}

        {error && (
          <div className="mb-4 sm:mb-5 p-3.5 rounded-xl bg-neutral-900 border border-neutral-700 text-xs text-white font-mono space-y-2">
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

        <form onSubmit={handleSubmit} className="space-y-3.5 sm:space-y-4">
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
                placeholder="seu.email@exemplo.com"
                required
                autoComplete="email"
                className="w-full pl-9 pr-3 py-2.5 bg-brand-surface border border-brand-border rounded-xl text-xs text-brand-white placeholder-brand-muted focus:outline-none focus:border-brand-borderHighlight transition font-mono"
              />
            </div>
          </div>

          {/* TELEFONE COM SELETOR DE DDD/PAÍS COM BANDEIRA */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="block text-xs font-mono text-brand-secondary font-medium">
                NÚMERO DE TELEFONE (WHATSAPP)
              </label>
              <span className="text-[10px] font-mono text-brand-muted">
                DDD Obrigatório
              </span>
            </div>
            <div className="flex items-center space-x-2">
              {/* Dropdown com Bandeira do País e DDI */}
              <div className="relative shrink-0 w-[110px] sm:w-[124px]">
                <select
                  value={`${selectedCountry.code}_${selectedCountry.iso}`}
                  onChange={(e) => {
                    const [code, iso] = e.target.value.split("_");
                    const found =
                      COUNTRY_CALLING_CODES.find((c) => c.code === code && c.iso === iso) ||
                      DEFAULT_COUNTRY_CALLING_CODE;
                    setSelectedCountry(found);
                    setPhone(formatPhoneNumber(phone, found.code));
                  }}
                  aria-label="Código do País e DDD"
                  className="w-full h-[38px] sm:h-[40px] pl-2.5 pr-6 bg-brand-surface border border-brand-border rounded-xl text-xs text-brand-white focus:outline-none focus:border-brand-borderHighlight transition font-mono appearance-none cursor-pointer flex items-center"
                >
                  {COUNTRY_CALLING_CODES.map((country) => (
                    <option
                      key={`${country.iso}-${country.code}`}
                      value={`${country.code}_${country.iso}`}
                      className="bg-brand-surface text-brand-white py-1"
                    >
                      {country.flag} {country.name} ({country.code})
                    </option>
                  ))}
                </select>
                <div className="absolute right-2 top-3 pointer-events-none text-brand-muted text-[10px]">
                  ▼
                </div>
              </div>

              {/* Input com Máscara e Ícone de Telefone */}
              <div className="relative flex-1">
                <Phone className="w-4 h-4 text-brand-muted absolute left-3 top-3 pointer-events-none" />
                <input
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(formatPhoneNumber(e.target.value, selectedCountry.code))}
                  placeholder={selectedCountry.placeholder}
                  required
                  autoComplete="tel"
                  className="w-full h-[38px] sm:h-[40px] pl-9 pr-3 py-2 bg-brand-surface border border-brand-border rounded-xl text-xs text-brand-white placeholder-brand-muted focus:outline-none focus:border-brand-borderHighlight transition font-mono"
                />
              </div>
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
                className="absolute right-3 top-3 text-brand-muted hover:text-brand-white p-0.5"
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
          <div className="pt-0.5">
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
            className="w-full mt-3 sm:mt-4 py-3 rounded-xl bg-neutral-900 dark:bg-white text-white dark:text-black font-semibold text-xs hover:bg-neutral-800 dark:hover:bg-neutral-200 transition shadow-sm flex items-center justify-center space-x-2 disabled:opacity-50"
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
        <div className="mt-4 sm:mt-5 pt-3 sm:pt-4 border-t border-brand-border text-center text-xs text-brand-secondary font-mono">
          Já possui uma conta ativa?{" "}
          <Link href="/login" className="text-brand-white font-semibold underline hover:text-brand-secondary">
            Acessar console
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
          <div className="text-[10px] font-semibold text-brand-white">Zero Footprint</div>
          <div className="text-[9px] text-brand-muted">Assinatura Estéril</div>
        </div>
        <div className="p-2 rounded-xl bg-brand-surface/60 border border-brand-border">
          <Activity className="w-3.5 h-3.5 text-brand-white mx-auto mb-1" />
          <div className="text-[10px] font-semibold text-brand-white">Click ID</div>
          <div className="text-[9px] text-brand-muted">Atribuição Real</div>
        </div>
      </div>

      <div className="text-center text-[10px] sm:text-[11px] font-mono text-brand-muted">
        Protegido por infraestrutura Phantom-X Edge • Criptografia SHA-256 + Salt
      </div>

      {/* Pop-up Modal de Verificação de E-mail com Token de 6 Números */}
      <EmailVerificationModal
        isOpen={showVerificationModal}
        onClose={() => setShowVerificationModal(false)}
        email={email}
        name={name}
        expiresAt={expiresAt}
        onConfirm={handleConfirmVerification}
        onResend={handleResendVerification}
        loading={verificationLoading}
      />
    </div>
  );
}

export default function SignupPage() {
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
              Infraestrutura de Tráfego Invisível em Escala Global.
            </h2>
            <p className="text-xs sm:text-sm text-brand-secondary font-sans leading-relaxed">
              Roteamento de precisão determinístico em borda com filtragem de bots em tempo real, proteção contra inspeção e preservação de atribuição.
            </p>
          </div>

          {/* Value Props / Instruções Claras */}
          <div className="mt-8 grid grid-cols-3 gap-3 w-full max-w-lg text-left">
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
        FORMULÁRIO DE CADASTRO (100% Responsivo, Mobile App First no Mobile)
        ========================================================================
      */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-4 sm:p-8 lg:p-12 relative overflow-y-auto">
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
