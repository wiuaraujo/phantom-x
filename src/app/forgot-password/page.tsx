"use client";

import React, { useState, useEffect, Suspense } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { siteConfig } from "@/config/site";
import { Logo } from "@/components/ui/Logo";
import { Mail, ArrowLeft, CheckCircle2, Lock, KeyRound, ShieldAlert, AlertTriangle, ArrowRight } from "lucide-react";
import { validatePasswordSecurity } from "@/lib/passwordValidator";

function ForgotPasswordInner() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [email, setEmail] = useState("");
  const [step, setStep] = useState<"request" | "reset">("request");
  const [code, setCode] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  useEffect(() => {
    const emailParam = searchParams.get("email");
    const codeParam = searchParams.get("code");

    if (emailParam) {
      setEmail(emailParam);
    }
    if (codeParam) {
      const cleanCode = codeParam.replace(/\D/g, "").slice(0, 6);
      setCode(cleanCode);
      if (cleanCode.length === 6) {
        setStep("reset");
      }
    }
  }, [searchParams]);

  const handleRequestCode = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    const cleanEmail = email.trim().toLowerCase();
    if (!cleanEmail) {
      setError("Por favor, informe seu e-mail cadastrado.");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch("/api/v1/auth/send-verification", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: cleanEmail, type: "password_reset" }),
      });
      const data = await res.json();
      if (!data.success) {
        setError(data.error || "Erro ao enviar código de recuperação.");
        setLoading(false);
        return;
      }

      setStep("reset");
    } catch {
      setError("Erro de conexão ao solicitar recuperação de senha.");
    } finally {
      setLoading(false);
    }
  };

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const cleanEmail = email.trim().toLowerCase();
    const cleanCode = code.replace(/\D/g, "").trim();

    if (cleanCode.length !== 6) {
      setError("O código de verificação deve conter 6 dígitos.");
      return;
    }

    if (newPassword !== confirmPassword) {
      setError("As senhas digitadas não coincidem.");
      return;
    }

    const validation = validatePasswordSecurity(newPassword);
    if (!validation.isValid) {
      setError(validation.errors[0] || "A senha não atende aos requisitos de segurança.");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch("/api/v1/auth/reset-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: cleanEmail,
          code: cleanCode,
          newPassword,
        }),
      });
      const data = await res.json();
      if (!data.success) {
        setError(data.error || "Falha ao redefinir senha.");
        setLoading(false);
        return;
      }

      setSuccessMessage(data.message || "Senha atualizada com sucesso!");
      setTimeout(() => {
        router.push(`/login?email=${encodeURIComponent(cleanEmail)}`);
      }, 2000);
    } catch {
      setError("Erro de comunicação ao redefinir a senha.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-brand-black flex flex-col justify-between p-6">
      {/* Top Header */}
      <div className="flex justify-between items-center max-w-5xl mx-auto w-full">
        <Link href="/" className="flex items-center space-x-3 group">
          <Logo size={36} className="group-hover:scale-105 transition-transform" />
          <span className="font-poppins text-base sm:text-lg font-bold tracking-tight text-brand-white">
            {siteConfig.name}
          </span>
        </Link>
        <Link
          href="/login"
          className="text-xs font-mono text-brand-secondary hover:text-brand-white transition flex items-center space-x-1"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Voltar ao login</span>
        </Link>
      </div>

      {/* Card Form */}
      <div className="w-full max-w-md mx-auto my-auto py-8 font-sans">
        <div className="bg-brand-surface border border-brand-border rounded-2xl p-6 sm:p-8 shadow-sm">
          <div className="mb-6 text-center">
            <h1 className="text-xl sm:text-2xl font-bold text-brand-white tracking-tight">
              {step === "request" ? "Recuperação de Acesso" : "Definir Nova Senha"}
            </h1>
            <p className="text-xs text-brand-secondary mt-1">
              {step === "request"
                ? "Informe o e-mail da sua conta para receber o código seguro de 6 dígitos."
                : `Digite o código enviado para ${email} e crie sua nova senha.`}
            </p>
          </div>

          {error && (
            <div className="mb-4 p-3 rounded-xl bg-neutral-900 border border-neutral-700 text-xs text-amber-400 font-mono flex items-start space-x-2">
              <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          {successMessage && (
            <div className="mb-4 p-4 rounded-xl bg-emerald-950/40 border border-emerald-500/40 text-center space-y-2 font-mono">
              <CheckCircle2 className="w-8 h-8 text-emerald-400 mx-auto" />
              <div className="text-xs text-emerald-300 font-semibold">{successMessage}</div>
              <p className="text-[11px] text-emerald-200">
                Redirecionando para o login...
              </p>
            </div>
          )}

          {step === "request" && !successMessage && (
            <form onSubmit={handleRequestCode} className="space-y-4">
              <div>
                <label className="block text-xs font-mono text-brand-secondary mb-1.5 font-medium">
                  E-MAIL DA CONTA
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-brand-muted absolute left-3 top-3" />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="seu.email@exemplo.com"
                    required
                    className="w-full pl-9 pr-3 py-2.5 bg-brand-surface border border-brand-border rounded-xl text-xs text-brand-white placeholder-brand-muted focus:outline-none focus:border-brand-borderHighlight transition font-mono"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-2.5 px-4 rounded-xl bg-white text-black font-semibold text-xs hover:bg-neutral-200 transition disabled:opacity-50 flex items-center justify-center space-x-2 shadow-sm"
              >
                {loading ? (
                  <span>Enviando código...</span>
                ) : (
                  <>
                    <span>Enviar Código de Recuperação</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </>
                )}
              </button>
            </form>
          )}

          {step === "reset" && !successMessage && (
            <form onSubmit={handleResetPassword} className="space-y-4">
              <div>
                <label className="block text-xs font-mono text-brand-secondary mb-1.5 font-medium">
                  CÓDIGO DE 6 DÍGITOS (RECEBIDO NO GMAIL)
                </label>
                <div className="relative">
                  <KeyRound className="w-4 h-4 text-brand-muted absolute left-3 top-3" />
                  <input
                    type="text"
                    value={code}
                    onChange={(e) => setCode(e.target.value.replace(/\D/g, "").slice(0, 6))}
                    placeholder="123456"
                    required
                    maxLength={6}
                    className="w-full pl-9 pr-3 py-2.5 bg-brand-surface border border-brand-border rounded-xl text-xs text-brand-white placeholder-brand-muted focus:outline-none focus:border-brand-borderHighlight transition font-mono tracking-widest text-center text-sm"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-mono text-brand-secondary mb-1.5 font-medium">
                  NOVA SENHA SEGURA
                </label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-brand-muted absolute left-3 top-3" />
                  <input
                    type="password"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder="Nova senha (mínimo 8 caracteres, maiúscula, número, símbolo)"
                    required
                    className="w-full pl-9 pr-3 py-2.5 bg-brand-surface border border-brand-border rounded-xl text-xs text-brand-white placeholder-brand-muted focus:outline-none focus:border-brand-borderHighlight transition font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-mono text-brand-secondary mb-1.5 font-medium">
                  CONFIRME A NOVA SENHA
                </label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-brand-muted absolute left-3 top-3" />
                  <input
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="Repita a nova senha"
                    required
                    className="w-full pl-9 pr-3 py-2.5 bg-brand-surface border border-brand-border rounded-xl text-xs text-brand-white placeholder-brand-muted focus:outline-none focus:border-brand-borderHighlight transition font-mono"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-2.5 px-4 rounded-xl bg-white text-black font-semibold text-xs hover:bg-neutral-200 transition disabled:opacity-50 flex items-center justify-center space-x-2 shadow-sm"
              >
                {loading ? (
                  <span>Atualizando senha...</span>
                ) : (
                  <>
                    <KeyRound className="w-3.5 h-3.5" />
                    <span>Redefinir Senha e Acessar</span>
                  </>
                )}
              </button>

              <button
                type="button"
                onClick={() => setStep("request")}
                className="w-full text-center text-[11px] text-brand-muted hover:text-white pt-1"
              >
                Reenviar código ou trocar de e-mail
              </button>
            </form>
          )}
        </div>
      </div>

      {/* Footer */}
      <div className="text-center text-xs text-brand-muted font-mono">
        © {new Date().getFullYear()} {siteConfig.name} Security Defense.
      </div>
    </div>
  );
}

export default function ForgotPasswordPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-brand-black" />}>
      <ForgotPasswordInner />
    </Suspense>
  );
}
