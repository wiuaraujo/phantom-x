/**
 * Phantom-X Server-Side OTP Store
 * Armazenamento seguro de tokens OTP de verificação no backend com expiração de 5 minutos.
 * Fonte única da verdade entre servidor e Supabase.
 */

export interface ServerOtpRecord {
  email: string;
  name: string;
  code: string;
  expiresAt: number;
  createdAt: number;
  attempts: number;
}

// Armazenamento em memória no servidor (persistido durante o ciclo de vida do processo Node.js)
const otpStore = new Map<string, ServerOtpRecord>();

/**
 * Salva um novo token OTP com expiração estrita de 5 minutos (300.000 ms)
 */
export function setServerOtp(email: string, name: string, code: string): ServerOtpRecord {
  const cleanEmail = email.trim().toLowerCase();
  const now = Date.now();
  const expiresAt = now + 5 * 60 * 1000; // 5 minutos

  const record: ServerOtpRecord = {
    email: cleanEmail,
    name: name || "Operador",
    code: code.trim(),
    expiresAt,
    createdAt: now,
    attempts: 0,
  };

  otpStore.set(cleanEmail, record);

  // Limpeza automática após 10 minutos
  setTimeout(() => {
    const existing = otpStore.get(cleanEmail);
    if (existing && existing.createdAt === now) {
      otpStore.delete(cleanEmail);
    }
  }, 10 * 60 * 1000);

  return record;
}

/**
 * Obtém o registro de OTP do e-mail
 */
export function getServerOtp(email: string): ServerOtpRecord | null {
  const cleanEmail = email.trim().toLowerCase();
  return otpStore.get(cleanEmail) || null;
}

/**
 * Valida o código digitado contra o registro no servidor
 */
export function verifyServerOtp(
  email: string,
  inputCode: string
): { success: boolean; error?: string } {
  const cleanEmail = email.trim().toLowerCase();
  const cleanCode = inputCode.replace(/\D/g, "").trim();

  const record = otpStore.get(cleanEmail);
  if (!record) {
    return {
      success: false,
      error: "Nenhum código ativo encontrado para este e-mail. Solicite um novo código.",
    };
  }

  // Validação de expiração de 5 minutos
  if (Date.now() > record.expiresAt) {
    otpStore.delete(cleanEmail);
    return {
      success: false,
      error: "Este código expirou (limite de 5 minutos). Solicite um novo código no terminal.",
    };
  }

  // Validação de tentativas (limite de 5)
  record.attempts += 1;
  if (record.attempts > 5) {
    otpStore.delete(cleanEmail);
    return {
      success: false,
      error: "Limite de 5 tentativas excedido. Por motivos de segurança, solicite um novo código.",
    };
  }

  // Validação dos 6 dígitos
  if (cleanCode.length !== 6) {
    return {
      success: false,
      error: "O código deve conter exatamente 6 números.",
    };
  }

  if (cleanCode !== record.code) {
    const remaining = 5 - record.attempts;
    return {
      success: false,
      error: `Código incorreto. Você possui mais ${remaining} tentativa(s). Verifique seu Gmail.`,
    };
  }

  // Sucesso: consome o token para não ser reutilizado
  otpStore.delete(cleanEmail);
  return { success: true };
}

/**
 * Remove token manualmente
 */
export function clearServerOtp(email: string): void {
  const cleanEmail = email.trim().toLowerCase();
  otpStore.delete(cleanEmail);
}
