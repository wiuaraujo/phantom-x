"use client";

import React, { useState, useEffect, useRef } from "react";
import {
  ShieldCheck,
  Clock,
  RefreshCw,
  ArrowRight,
  AlertTriangle,
  Mail,
  X,
  Lock,
} from "lucide-react";
import { Logo } from "@/components/ui/Logo";

interface EmailVerificationModalProps {
  isOpen: boolean;
  onClose: () => void;
  email: string;
  name?: string;
  activeCode?: string;
  expiresAt: number;
  onConfirm: (code: string) => Promise<void>;
  onResend: () => Promise<string | void>;
  loading?: boolean;
}

export const EmailVerificationModal: React.FC<EmailVerificationModalProps> = ({
  isOpen,
  onClose,
  email,
  expiresAt,
  onConfirm,
  onResend,
  loading = false,
}) => {
  const [digits, setDigits] = useState<string[]>(["", "", "", "", "", ""]);
  const [secondsLeft, setSecondsLeft] = useState<number>(300);
  const [error, setError] = useState<string | null>(null);
  const [resending, setResending] = useState(false);
  const [resendSuccess, setResendSuccess] = useState(false);

  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  // Atualiza contador regressivo de 5 minutos
  useEffect(() => {
    if (!isOpen) return;

    const calculateRemaining = () => {
      const remainingMs = Math.max(0, expiresAt - Date.now());
      return Math.floor(remainingMs / 1000);
    };

    setSecondsLeft(calculateRemaining());

    const interval = setInterval(() => {
      const remaining = calculateRemaining();
      setSecondsLeft(remaining);
      if (remaining <= 0) {
        clearInterval(interval);
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [isOpen, expiresAt]);

  // Foco no primeiro campo quando abre o modal
  useEffect(() => {
    if (isOpen) {
      setError(null);
      setDigits(["", "", "", "", "", ""]);
      setTimeout(() => {
        inputRefs.current[0]?.focus();
      }, 150);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  // Formata o tempo restante (MM:SS)
  const formatTime = (totalSec: number) => {
    const mins = Math.floor(totalSec / 60);
    const secs = totalSec % 60;
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  };

  const isExpired = secondsLeft <= 0;

  // Gerenciador de digitação nas 6 caixas individuais
  const handleDigitChange = (index: number, val: string) => {
    setError(null);

    // Se o usuário colou múltiplos caracteres no input
    const cleaned = val.replace(/\D/g, "");
    if (cleaned.length > 1) {
      handlePasteCode(cleaned);
      return;
    }

    const newDigits = [...digits];
    newDigits[index] = cleaned;
    setDigits(newDigits);

    // Avança para o próximo campo automaticamente
    if (cleaned && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  // Gerenciador de Backspace para retornar ao campo anterior
  const handleKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Backspace" && !digits[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  // Gerenciador de colagem direta (Ctrl+V / Cmd+V)
  const handlePaste = (e: React.ClipboardEvent<HTMLInputElement>) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData("text");
    handlePasteCode(pastedData);
  };

  const handlePasteCode = (codeStr: string) => {
    const cleaned = codeStr.replace(/\D/g, "").slice(0, 6);
    if (!cleaned) return;

    const newDigits = ["", "", "", "", "", ""];
    for (let i = 0; i < cleaned.length; i++) {
      newDigits[i] = cleaned[i];
    }
    setDigits(newDigits);

    // Foca no próximo campo vazio ou no último
    const nextIndex = Math.min(cleaned.length, 5);
    inputRefs.current[nextIndex]?.focus();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const fullCode = digits.join("").trim();
    if (fullCode.length < 6) {
      setError("Por favor, preencha todos os 6 números do código.");
      return;
    }

    if (isExpired) {
      setError("Este código expirou (limite de 5 minutos). Clique em 'Reenviar código' para receber um novo token no seu e-mail.");
      return;
    }

    try {
      await onConfirm(fullCode);
    } catch (err: any) {
      setError(
        err?.message ||
          "Código de verificação incorreto ou expirado. Verifique os números recebidos na sua caixa de entrada do Gmail."
      );
    }
  };

  const handleResendClick = async () => {
    setError(null);
    setResending(true);
    setResendSuccess(false);
    try {
      await onResend();
      setDigits(["", "", "", "", "", ""]);
      setResendSuccess(true);
      setTimeout(() => setResendSuccess(false), 4000);
      inputRefs.current[0]?.focus();
    } catch (err: any) {
      setError(err?.message || "Falha ao reenviar código. Aguarde alguns instantes.");
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
          className="absolute right-4 top-4 p-1.5 text-brand-muted hover:text-white rounded-lg hover:bg-white/5 transition"
          title="Fechar"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Header HUD */}
        <div className="flex flex-col items-center text-center mb-5">
          <div className="w-12 h-12 rounded-xl bg-brand-surface border border-brand-border flex items-center justify-center mb-3 shadow-md">
            <Logo size={36} />
          </div>

          <div className="inline-flex items-center space-x-1.5 px-2.5 py-0.5 rounded-full bg-white/5 border border-white/10 text-[10px] font-mono text-brand-secondary mb-2">
            <ShieldCheck className="w-3 h-3 text-emerald-400" />
            <span>CONFIRMAÇÃO DE E-MAIL DO OPERADOR</span>
          </div>

          <h2 className="text-lg sm:text-xl font-bold text-brand-white font-poppins">
            Insira o Código de 6 Números
          </h2>

          <p className="text-xs text-brand-secondary mt-1 max-w-sm">
            Enviamos o token de verificação exclusivo para o seu e-mail:
          </p>

          <div className="mt-2 px-3 py-1 bg-brand-surface border border-brand-border rounded-lg text-xs font-mono text-brand-white font-semibold flex items-center space-x-2">
            <Mail className="w-3.5 h-3.5 text-brand-muted" />
            <span>{email}</span>
          </div>
        </div>

        {/* Informative Guidance Card */}
        <div className="mb-4 p-3 rounded-xl bg-blue-950/20 border border-blue-500/20 text-[11px] text-neutral-300 leading-relaxed font-sans flex items-start space-x-2.5">
          <Lock className="w-4 h-4 text-blue-400 shrink-0 mt-0.5" />
          <div>
            Acesse o seu aplicativo ou navegador do <strong>Gmail</strong>. Copie o código de 6 números que chegou e cole nos campos abaixo para confirmar sua conta.
            <span className="block text-[10px] text-neutral-400 mt-1">
              (Caso não veja na caixa de entrada, verifique também a pasta de <em>Spam / Lixo Eletrônico</em>).
            </span>
          </div>
        </div>

        {/* Alerta de Erro de Código Incorreto ou Expirado */}
        {error && (
          <div className="mb-4 p-3 rounded-xl bg-red-950/40 border border-red-500/40 text-xs text-red-200 font-mono flex items-start space-x-2 animate-in fade-in">
            <AlertTriangle className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
            <span className="leading-snug">{error}</span>
          </div>
        )}

        {/* Alerta de Sucesso ao Reenviar Código */}
        {resendSuccess && (
          <div className="mb-4 p-2.5 rounded-xl bg-emerald-950/40 border border-emerald-500/40 text-xs text-emerald-300 font-mono flex items-center space-x-2 animate-in fade-in">
            <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>Novo código enviado com sucesso para o seu e-mail!</span>
          </div>
        )}

        {/* Formulário com as 6 caixas de digitação */}
        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="flex items-center justify-center gap-2 sm:gap-2.5">
            {digits.map((digit, i) => (
              <input
                key={i}
                ref={(el) => {
                  inputRefs.current[i] = el;
                }}
                type="text"
                inputMode="numeric"
                pattern="[0-9]*"
                maxLength={1}
                value={digit}
                onChange={(e) => handleDigitChange(i, e.target.value)}
                onKeyDown={(e) => handleKeyDown(i, e)}
                onPaste={handlePaste}
                autoComplete="one-time-code"
                className={`w-11 h-13 sm:w-12 sm:h-14 text-center text-xl sm:text-2xl font-mono font-bold rounded-xl border bg-brand-surface transition focus:outline-none focus:ring-2 focus:ring-white/40 text-white ${
                  digit
                    ? "border-brand-borderHighlight bg-white/[0.08]"
                    : "border-brand-border placeholder-neutral-600"
                }`}
              />
            ))}
          </div>

          {/* Contador de Expiração de 5 Minutos */}
          <div className="flex items-center justify-between text-xs font-mono px-1">
            <div className="flex items-center space-x-1.5">
              <Clock className={`w-3.5 h-3.5 ${isExpired ? "text-rose-400" : "text-brand-muted"}`} />
              <span className={isExpired ? "text-rose-400 font-semibold" : "text-brand-secondary"}>
                {isExpired ? "Código expirado" : `Expira em ${formatTime(secondsLeft)}`}
              </span>
            </div>

            <button
              type="button"
              onClick={handleResendClick}
              disabled={resending}
              className="text-[11px] text-white hover:underline flex items-center space-x-1 disabled:opacity-50 font-semibold cursor-pointer"
            >
              <RefreshCw className={`w-3 h-3 ${resending ? "animate-spin" : ""}`} />
              <span>{resending ? "Enviando..." : "Reenviar código"}</span>
            </button>
          </div>

          {/* Botão de Confirmação */}
          <button
            type="submit"
            disabled={loading || digits.join("").length < 6 || isExpired}
            className="w-full py-3 rounded-xl bg-neutral-900 dark:bg-white text-white dark:text-black font-semibold text-xs hover:bg-neutral-800 dark:hover:bg-neutral-200 transition shadow-sm flex items-center justify-center space-x-2 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
          >
            {loading ? (
              <span className="font-mono text-xs animate-pulse">
                Validando token e ativando conta...
              </span>
            ) : (
              <>
                <span>Confirmar e Ativar Terminal</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </form>

        <div className="mt-4 pt-3 border-t border-brand-border/60 text-center text-[10px] font-mono text-brand-muted">
          Terminal protegido por SHA-256 e Autenticação de 2 Fatores Ativa
        </div>
      </div>
    </div>
  );
};
