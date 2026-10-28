"use client";

import React, { useState, useEffect } from "react";
import { auth } from "@/lib/auth";
import { createVerificationToken } from "@/lib/emailService";
import { EmailVerificationModal } from "@/components/auth/EmailVerificationModal";
import { ShieldAlert, ShieldCheck, Mail, ArrowRight, CheckCircle2 } from "lucide-react";

export function EmailVerificationBanner() {
  const [session, setSession] = useState(() => auth.getSession());
  const [showModal, setShowModal] = useState(false);
  const [activeCode, setActiveCode] = useState("");
  const [expiresAt, setExpiresAt] = useState(0);
  const [loading, setLoading] = useState(false);
  const [justVerified, setJustVerified] = useState(false);

  useEffect(() => {
    // Sincroniza sessão ativa
    const current = auth.getSession();
    setSession(current);
  }, []);

  if (!session?.user) return null;

  // Se já está verificado e não acabou de verificar, não renderiza
  if (session.user.emailVerified === true && !justVerified) {
    return null;
  }

  // Notificação de Sucesso após verificação
  if (justVerified) {
    return (
      <div className="bg-emerald-950/80 border-b border-emerald-500/40 text-emerald-200 px-4 py-2.5 text-xs font-mono flex items-center justify-between animate-in fade-in slide-in-from-top-2 duration-300">
        <div className="flex items-center space-x-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>
            Conta e e-mail confirmados com sucesso! Terminal de operador Phantom-X 100% ativo.
          </span>
        </div>
        <button
          onClick={() => setJustVerified(false)}
          className="text-emerald-400 hover:text-white text-xs underline cursor-pointer"
        >
          Fechar
        </button>
      </div>
    );
  }

  const handleStartVerification = () => {
    const user = session.user;
    const record = createVerificationToken(user.email, user.name);
    setActiveCode(record.code);
    setExpiresAt(record.expiresAt);

    // Dispara e-mail de confirmação
    fetch("/api/v1/auth/send-verification", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        email: user.email,
        name: user.name,
      }),
    }).catch(() => {});

    setShowModal(true);
  };

  const handleConfirm = async (code: string) => {
    setLoading(true);
    try {
      const res = await auth.confirmEmailAndLogin(session.user.id, code, true);
      if (!res.success) {
        setLoading(false);
        throw new Error(res.error || "Código de verificação incorreto.");
      }

      setLoading(false);
      setShowModal(false);
      setJustVerified(true);
      setSession(auth.getSession());
      setTimeout(() => setJustVerified(false), 6000);
    } catch (err: any) {
      setLoading(false);
      throw err;
    }
  };

  const handleResend = async (): Promise<string> => {
    const user = session.user;
    const record = createVerificationToken(user.email, user.name);
    setActiveCode(record.code);
    setExpiresAt(record.expiresAt);

    fetch("/api/v1/auth/send-verification", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        email: user.email,
        name: user.name,
      }),
    }).catch(() => {});

    return record.code;
  };

  return (
    <>
      <div className="bg-gradient-to-r from-amber-950/90 via-neutral-900 to-amber-950/80 border-b border-amber-500/40 text-amber-200 px-3 sm:px-6 py-2.5 text-xs font-sans flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 shadow-md">
        <div className="flex items-center space-x-2.5 min-w-0">
          <div className="p-1 rounded bg-amber-500/20 text-amber-400 shrink-0">
            <ShieldAlert className="w-4 h-4" />
          </div>
          <div className="min-w-0">
            <span className="font-semibold text-amber-100 mr-1.5">
              Confirmação de Conta Pendente:
            </span>
            <span className="text-amber-200/90 text-[11px] sm:text-xs">
              Sua conta ainda não foi confirmada no Gmail ({session.user.email}). Confirme agora com seu token de 6 dígitos.
            </span>
          </div>
        </div>

        <button
          onClick={handleStartVerification}
          className="self-start sm:self-auto px-3 py-1.5 rounded-lg bg-amber-400 hover:bg-amber-300 text-black font-semibold text-xs font-mono transition flex items-center space-x-1.5 shrink-0 shadow-sm"
        >
          <Mail className="w-3.5 h-3.5" />
          <span>Confirmar E-mail</span>
          <ArrowRight className="w-3 h-3" />
        </button>
      </div>

      <EmailVerificationModal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        email={session.user.email}
        name={session.user.name}
        activeCode={activeCode}
        expiresAt={expiresAt}
        onConfirm={handleConfirm}
        onResend={handleResend}
        loading={loading}
      />
    </>
  );
}
