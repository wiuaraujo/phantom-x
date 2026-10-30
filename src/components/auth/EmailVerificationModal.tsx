"use client";

import React, { useState } from "react";
import {
  RefreshCw,
  ArrowRight,
  Mail,
  X,
  ExternalLink,
  CheckCircle2,
  AlertTriangle,
} from "lucide-react";
import { Logo } from "@/components/ui/Logo";
import { useLanguage } from "@/lib/i18n";

interface EmailVerificationModalProps {
  isOpen: boolean;
  onClose: () => void;
  email: string;
  name?: string;
  expiresAt?: number;
  onConfirm?: (code: string) => Promise<void> | void;
  onResend?: () => Promise<string | void>;
  loading?: boolean;
}

export const EmailVerificationModal: React.FC<EmailVerificationModalProps> = ({
  isOpen,
  onClose,
  email,
  onResend,
}) => {
  const { t } = useLanguage();
  const [resending, setResending] = useState(false);
  const [resendSuccess, setResendSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleOpenGmail = () => {
    // Abre a busca direta pelo remetente ou caixa de entrada no Gmail
    window.open("https://mail.google.com/mail/u/0/#inbox", "_blank", "noopener,noreferrer");
  };

  const handleResendClick = async () => {
    if (resending || !onResend) return;
    setResending(true);
    setError(null);

    try {
      await onResend();
      setResendSuccess(true);
      setTimeout(() => setResendSuccess(false), 5000);
    } catch (err: any) {
      setError(err?.message || t.auth.resendError);
    } finally {
      setResending(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/85 backdrop-blur-md animate-in fade-in duration-200 overflow-y-auto">
      <div className="relative w-full max-w-md my-auto bg-gradient-to-b from-brand-surface/95 via-brand-dark/95 to-brand-black/95 border border-brand-border rounded-2xl p-5 sm:p-7 shadow-[0_25px_60px_rgba(0,0,0,0.8)] backdrop-blur-xl ring-1 ring-brand-border/40 font-sans">
        {/* Botão Fechar Modal */}
        <button
          onClick={onClose}
          className="absolute right-4 top-4 p-1.5 text-brand-muted hover:text-white rounded-lg hover:bg-white/5 transition cursor-pointer"
          title={t.auth.close}
        >
          <X className="w-4 h-4" />
        </button>

        {/* Header HUD */}
        <div className="flex flex-col items-center text-center mb-5">
          <div className="w-12 h-12 rounded-xl bg-brand-surface border border-brand-border flex items-center justify-center mb-3 shadow-md">
            <Logo size={36} />
          </div>

          <div className="inline-flex items-center px-2.5 py-0.5 rounded-full bg-white/5 border border-white/10 text-[10px] font-mono text-brand-secondary mb-2 tracking-wider">
            <span>{t.auth.confirmAccountBadge}</span>
          </div>

          <h2 className="text-lg sm:text-xl font-bold text-brand-white font-poppins">
            {t.auth.confirmEmailTitle}
          </h2>

          <p className="text-xs text-brand-secondary mt-1 max-w-sm">
            {t.auth.confirmEmailSubtitle}
          </p>

          <div className="mt-2.5 px-3 py-1 bg-brand-surface border border-brand-border rounded-lg text-xs font-mono text-brand-white font-semibold flex items-center space-x-2 shadow-inner">
            <Mail className="w-3.5 h-3.5 text-brand-muted" />
            <span className="truncate max-w-[280px]">{email}</span>
          </div>
        </div>

        {/* Card Informativo com UI Preta com Degradê Suave */}
        <div className="mb-5 p-4 rounded-xl bg-gradient-to-b from-white/[0.08] via-neutral-950 to-black border border-white/15 text-[11px] text-neutral-300 leading-relaxed font-sans flex items-start space-x-3 shadow-lg shadow-black/50 ring-1 ring-white/5">
          <Mail className="w-4 h-4 text-white/90 shrink-0 mt-0.5" />
          <div className="space-y-1">
            <p className="font-semibold text-white text-xs">
              {t.auth.gmailCardTitle}
            </p>
            <p className="text-neutral-300 leading-normal">
              {t.auth.gmailCardDesc}
            </p>
            <span className="block text-[10px] text-neutral-400 pt-1 font-mono">
              {t.auth.spamNotice}
            </span>
          </div>
        </div>

        {/* Alerta de Erro de Reenvio */}
        {error && (
          <div className="mb-4 p-3 rounded-xl bg-red-950/40 border border-red-500/40 text-xs text-red-200 font-mono flex items-start space-x-2 animate-in fade-in">
            <AlertTriangle className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
            <span className="leading-snug">{error}</span>
          </div>
        )}

        {/* Notificação de Sucesso ao Reenviar */}
        {resendSuccess && (
          <div className="mb-4 p-2.5 rounded-xl bg-emerald-950/40 border border-emerald-500/40 text-xs text-emerald-300 font-mono flex items-center space-x-2 animate-in fade-in">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>{t.auth.resendSuccess}</span>
          </div>
        )}

        {/* Botão de Ação Primária: Abrir o Gmail Diretamente */}
        <div className="space-y-3">
          <button
            type="button"
            onClick={handleOpenGmail}
            className="w-full py-3 rounded-xl bg-neutral-900 dark:bg-white text-white dark:text-black font-semibold text-xs hover:bg-neutral-800 dark:hover:bg-neutral-200 transition shadow-sm flex items-center justify-center space-x-2 cursor-pointer"
          >
            <span>{t.auth.openGmailBtn}</span>
            <ExternalLink className="w-3.5 h-3.5" />
          </button>

          {/* Ações Secundárias: Reenviar e Fechar/Login */}
          <div className="flex items-center justify-between text-xs font-mono pt-1 px-1">
            {onResend && (
              <button
                type="button"
                onClick={handleResendClick}
                disabled={resending}
                className="text-[11px] text-neutral-400 hover:text-white flex items-center space-x-1.5 transition cursor-pointer disabled:opacity-50"
              >
                <RefreshCw className={`w-3 h-3 ${resending ? "animate-spin" : ""}`} />
                <span>{resending ? t.auth.resending : t.auth.resendPrompt}</span>
              </button>
            )}

            <button
              type="button"
              onClick={onClose}
              className="text-[11px] text-white font-semibold hover:underline flex items-center space-x-1 ml-auto cursor-pointer"
            >
              <span>{t.auth.goToLogin}</span>
              <ArrowRight className="w-3 h-3" />
            </button>
          </div>
        </div>

        <div className="mt-5 pt-3.5 border-t border-brand-border/60 text-center text-[10px] font-mono text-brand-muted">
          {t.auth.secureActivationFooter}
        </div>
      </div>
    </div>
  );
};
