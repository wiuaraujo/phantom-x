"use client";

import React, { useState } from "react";
import Link from "next/link";
import { siteConfig } from "@/config/site";
import { Logo } from "@/components/ui/Logo";
import { Mail, ArrowLeft, CheckCircle2 } from "lucide-react";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [sent, setSent] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;

    setLoading(true);
    await new Promise((resolve) => setTimeout(resolve, 800));
    setLoading(false);
    setSent(true);
  };

  return (
    <div className="min-h-screen bg-brand-black flex flex-col justify-between p-6">
      {/* Top Header */}
      <div className="flex justify-between items-center max-w-5xl mx-auto w-full">
        <Link href="/" className="flex items-center space-x-3">
          <Logo size={28} />
          <span className="font-mono text-sm font-bold text-white tracking-widest">
            {siteConfig.name}
          </span>
        </Link>
        <Link
          href="/login"
          className="text-xs font-mono text-brand-secondary hover:text-white transition flex items-center space-x-1"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Voltar ao login</span>
        </Link>
      </div>

      {/* Card Form */}
      <div className="w-full max-w-md mx-auto my-auto py-8 font-sans">
        <div className="bg-brand-surface border border-brand-border rounded-2xl p-8 shadow-sm">
          <div className="mb-6 text-center">
            <h1 className="text-2xl font-bold text-white tracking-tight">
              Vamos recuperar seu acesso.
            </h1>
            <p className="text-xs text-brand-secondary mt-1">
              Informe seu e-mail cadastrado para receber as instruções de recuperação.
            </p>
          </div>

          {sent ? (
            <div className="p-4 rounded-xl bg-neutral-900 border border-brand-border text-center space-y-3 font-mono">
              <CheckCircle2 className="w-8 h-8 text-white mx-auto" />
              <div className="text-xs text-white font-medium">Instruções enviadas!</div>
              <p className="text-[11px] text-brand-secondary">
                Caso haja uma conta associada a <strong className="text-white">{email}</strong>,
                você receberá um link seguro para redefinição de credenciais em instantes.
              </p>
              <div className="pt-2">
                <Link
                  href="/login"
                  className="text-xs text-white underline hover:text-neutral-300"
                >
                  Retornar para a tela de login
                </Link>
              </div>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-mono text-brand-secondary mb-1.5">
                  E-MAIL CADASTRADO
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-brand-muted absolute left-3 top-3" />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="operador@suaempresa.com"
                    required
                    className="w-full pl-9 pr-3 py-2.5 bg-brand-black border border-brand-border rounded-xl text-xs text-white placeholder-neutral-600 focus:outline-none focus:border-white transition font-mono"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full mt-4 py-3 rounded-xl bg-white text-black font-semibold text-xs hover:bg-neutral-200 transition shadow-glow-sm disabled:opacity-50"
              >
                {loading ? "Processando envio..." : "Enviar instruções"}
              </button>
            </form>
          )}
        </div>
      </div>

      <div className="text-center text-[11px] font-mono text-brand-muted max-w-md mx-auto">
        Caso não receba o e-mail em até 5 minutos, verifique a pasta de spam.
      </div>
    </div>
  );
}
