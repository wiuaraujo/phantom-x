"use client";

import React, { useState, useEffect, useRef } from "react";
import {
  ShieldCheck,
  Clock,
  RefreshCw,
  ArrowRight,
  AlertTriangle,
  Mail,
  Copy,
  Check,
  X,
  ExternalLink,
} from "lucide-react";
import { Logo } from "@/components/ui/Logo";

interface EmailVerificationModalProps {
  isOpen: boolean;
  onClose: () => void;
  email: string;
  name: string;
  activeCode: string;
  expiresAt: number;
  onConfirm: (code: string) => Promise<void>;
  onResend: () => Promise<string>; // Retorna o novo código
  loading?: boolean;
}

export const EmailVerificationModal: React.FC<EmailVerificationModalProps> = ({
  isOpen,
  onClose,
  email,
  name,
  activeCode,
  expiresAt,
  onConfirm,
  onResend,
  loading = false,
}) => {
  const [digits, setDigits] = useState<string[]>(["", "", "", "", "", ""]);
  const [secondsLeft, setSecondsLeft] = useState<number>(300);
  const [error, setError] = useState<string | null>(null);
  const [copiedCode, setCopiedCode] = useState(false);
  const [showEmailPreview, setShowEmailPreview] = useState(true);
  const [resending, setResending] = useState(false);

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

  // Foco no primeiro campo quando abre
  useEffect(() => {
    if (isOpen) {
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

  // Gerenciador de digitação nas 6 caixas
  const handleDigitChange = (index: number, val: string) => {
    setError(null);

    // Permite colar múltiplos caracteres (ex: 6 dígitos de uma vez)
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

  // Gerenciador de Backspace
  const handleKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Backspace" && !digits[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  // Gerenciador de colagem de código completo (ex: copia e cola do e-mail)
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

    const fullCode = digits.join("");
    if (fullCode.length < 6) {
      setError("Por favor, preencha todos os 6 dígitos do código de verificação.");
      return;
    }

    if (isExpired) {
      setError("Este código expirou (limite de 5 minutos). Clique em 'Reenviar código' para receber um novo token.");
      return;
    }

    try {
      await onConfirm(fullCode);
    } catch (err: any) {
      setError(err?.message || "Código incorreto. Por favor, confira os números recebidos.");
    }
  };

  const handleResendClick = async () => {
    setError(null);
    setResending(true);
    try {
      await onResend();
      setDigits(["", "", "", "", "", ""]);
      inputRefs.current[0]?.focus();
    } catch {
      setError("Falha ao reenviar código. Aguarde alguns instantes.");
    } finally {
      setResending(false);
    }
  };

  const handleCopyCodeFromEmail = () => {
    if (!activeCode) return;
    navigator.clipboard.writeText(activeCode);
    setCopiedCode(true);
    handlePasteCode(activeCode);
    setTimeout(() => setCopiedCode(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200 overflow-y-auto">
      <div className="relative w-full max-w-lg my-auto bg-gradient-to-b from-brand-surface/95 via-brand-dark/95 to-brand-black/95 border border-brand-border rounded-2xl p-5 sm:p-7 shadow-[0_25px_60px_rgba(0,0,0,0.8)] backdrop-blur-xl ring-1 ring-brand-border/40 font-sans">
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
            Enviamos um token de verificação único e renovável para o e-mail:
          </p>
          <div className="mt-1.5 px-3 py-1 bg-brand-surface border border-brand-border rounded-lg text-xs font-mono text-brand-white font-semibold flex items-center space-x-2">
            <Mail className="w-3.5 h-3.5 text-brand-muted" />
            <span>{email}</span>
          </div>
        </div>

        {error && (
          <div className="mb-4 p-3 rounded-xl bg-neutral-900 border border-neutral-700 text-xs text-white font-mono flex items-start space-x-2 animate-in fade-in">
            <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
            <span className="leading-snug">{error}</span>
          </div>
        )}

        {/* Formulário com as 6 caixas de digitação */}
        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="flex items-center justify-center gap-2 sm:gap-3">
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
                className={`w-11 h-13 sm:w-13 sm:h-15 text-center text-xl sm:text-2xl font-mono font-bold rounded-xl border bg-brand-surface transition focus:outline-none focus:ring-2 focus:ring-white/30 text-white ${
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
              className="text-[11px] text-white hover:underline flex items-center space-x-1 disabled:opacity-50 font-semibold"
            >
              <RefreshCw className={`w-3 h-3 ${resending ? "animate-spin" : ""}`} />
              <span>{resending ? "Enviando..." : "Reenviar código"}</span>
            </button>
          </div>

          {/* Botão de Confirmação */}
          <button
            type="submit"
            disabled={loading || digits.join("").length < 6 || isExpired}
            className="w-full py-3 rounded-xl bg-neutral-900 dark:bg-white text-white dark:text-black font-semibold text-xs hover:bg-neutral-800 dark:hover:bg-neutral-200 transition shadow-sm flex items-center justify-center space-x-2 disabled:opacity-40 disabled:cursor-not-allowed"
          >
            {loading ? (
              <span className="font-mono text-xs animate-pulse">
                Validando token e provisionando cluster...
              </span>
            ) : (
              <>
                <span>Confirmar e Ativar Terminal</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </form>

        {/* ================================================================= */}
        {/* SIMULADOR / PRÉVIA DO E-MAIL RECEBIDO (EXATAMENTE COMO SOLICITADO) */}
        {/* ================================================================= */}
        <div className="mt-5 pt-4 border-t border-brand-border">
          <div className="flex items-center justify-between mb-2">
            <button
              type="button"
              onClick={() => setShowEmailPreview(!showEmailPreview)}
              className="text-[11px] font-mono text-brand-secondary hover:text-white flex items-center space-x-1"
            >
              <span>{showEmailPreview ? "▼ Ocultar prévia do e-mail" : "▶ Ver e-mail como chegou na caixa de entrada"}</span>
            </button>

            <button
              type="button"
              onClick={handleCopyCodeFromEmail}
              className="text-[11px] font-mono text-white bg-white/10 hover:bg-white/20 px-2.5 py-1 rounded-md flex items-center space-x-1 transition"
              title="Copiar código gerado e preencher os campos"
            >
              {copiedCode ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
              <span>{copiedCode ? "Copiado & Preenchido!" : "Copiar código"}</span>
            </button>
          </div>

          {showEmailPreview && (
            <div className="rounded-xl bg-[#09090b] border border-brand-border p-4 sm:p-5 text-left text-xs font-sans text-neutral-300 shadow-inner space-y-3">
              <div className="text-[10px] font-mono text-neutral-500 uppercase tracking-wider flex items-center justify-between border-b border-neutral-800 pb-2">
                <span>Remetente: seguranca@phantomx.pro</span>
                <span>Assunto: Seu token de verificação</span>
              </div>

              {/* Saudação com o nome da pessoa */}
              <div className="text-sm font-semibold text-white pt-1">
                Olá, {name || "Operador"}
              </div>

              <div className="text-xs text-neutral-300">
                Seu token de verificação de conta é:
              </div>

              {/* QUADRADO PRETO NO PADRÃO DO SISTEMA COM DEGRADÊ BRANCO LEVE */}
              <div className="relative rounded-xl p-4 sm:p-5 text-center bg-gradient-to-br from-[#18181b] via-[#27272a] to-[#18181b] border border-white/20 shadow-[0_10px_25px_rgba(0,0,0,0.6)] ring-1 ring-white/10 my-3">
                <div className="font-mono text-2xl sm:text-3xl font-extrabold tracking-[8px] sm:tracking-[10px] text-white select-all">
                  {activeCode || "------"}
                </div>
                <div className="text-[10px] font-mono text-neutral-400 mt-1 uppercase">
                  Válido por 5 minutos • Não compartilhe este código
                </div>
              </div>

              <div className="text-[11px] text-neutral-400 leading-relaxed">
                Insira o seu código no campo de verificação para confirmar a sua conta. Se você não solicitou este código, por favor, ignore este e-mail.
              </div>

              <div className="text-xs text-white font-medium border-t border-neutral-800 pt-2.5">
                Um abraço,<br />
                <span className="font-bold">Equipe Phantom-X.</span>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
