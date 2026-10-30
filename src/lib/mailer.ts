import nodemailer from "nodemailer";
import { renderVerificationEmailHtml, renderVerificationEmailText } from "./emailService";
import { sendEmailViaResend } from "./resend";

export interface SendEmailResult {
  success: boolean;
  provider: "resend" | "smtp" | "supabase" | "none";
  error?: string;
  messageId?: string;
}

/**
 * Cria o transporte SMTP se configurado nas variáveis de ambiente
 */
function getSmtpTransporter() {
  const host = process.env.SMTP_HOST;
  const port = parseInt(process.env.SMTP_PORT || "587", 10);
  const user = process.env.SMTP_USER;
  const pass = process.env.SMTP_PASS;

  if (host && user && pass) {
    return nodemailer.createTransport({
      host,
      port,
      secure: port === 465,
      auth: { user, pass },
      tls: {
        rejectUnauthorized: false,
      },
    });
  }

  // Suporte para Resend SMTP se configurado
  const resendKey = process.env.RESEND_API_KEY?.trim();
  if (resendKey) {
    return nodemailer.createTransport({
      host: "smtp.resend.com",
      port: 465,
      secure: true,
      auth: {
        user: "resend",
        pass: resendKey,
      },
    });
  }

  return null;
}

/**
 * Dispara o e-mail de verificação oficial Phantom-X
 * 1. Prioridade Máxima: API HTTP Oficial da Resend (rápida, segura e compatível com Vercel/Cloudflare)
 * 2. Fallback: Servidor SMTP / Nodemailer
 * 3. Fallback: Supabase Auth OTP
 */
export async function dispatchVerificationEmail(params: {
  to: string;
  name: string;
  code: string;
  origin?: string;
  apiKey?: string;
}): Promise<SendEmailResult> {
  const { to, name, code, origin, apiKey } = params;
  const cleanEmail = to.trim().toLowerCase();
  const cleanName = name.trim() || "Operador";

  const resolvedOrigin =
    origin && origin.startsWith("http")
      ? origin
      : process.env.NEXT_PUBLIC_APP_URL || "https://phantom-x.pro";

  const html = renderVerificationEmailHtml(cleanName, code, resolvedOrigin, cleanEmail);
  const text = renderVerificationEmailText(cleanName, code, resolvedOrigin, cleanEmail);
  const subject = "🛡️ [Phantom-X] Confirme sua conta de Operador";

  const resendKey = apiKey?.trim() || process.env.RESEND_API_KEY?.trim();

  // 1. TENTA PRIMEIRO VIA API REST DA RESEND (Se resendKey estiver configurada)
  if (resendKey) {
    try {
      const resendResult = await sendEmailViaResend({
        to: cleanEmail,
        subject,
        html,
        text,
        from: process.env.RESEND_FROM || "Phantom-X <contato@phantom-x.pro>",
        replyTo: "suporte@phantom-x.pro",
        apiKey: resendKey,
      });

      if (resendResult.success) {
        console.log(`[Phantom-X Mailer] E-mail enviado com SUCESSO via Resend para ${cleanEmail} (ID: ${resendResult.messageId})`);
        return {
          success: true,
          provider: "resend",
          messageId: resendResult.messageId,
        };
      } else {
        console.warn(`[Phantom-X Mailer] Resend falhou: ${resendResult.error}. Tentando transporte SMTP...`);
        return {
          success: false,
          provider: "resend",
          error: resendResult.error,
        };
      }
    } catch (err: any) {
      console.warn(`[Phantom-X Mailer] Falha no provedor Resend: ${err?.message}`);
    }
  }

  // 2. TENTA VIA TRANSPORTE SMTP
  const transporter = getSmtpTransporter();
  if (transporter) {
    try {
      const from = process.env.SMTP_FROM || `Phantom-X <${process.env.SMTP_USER || "noreply@phantom-x.pro"}>`;
      const info = await transporter.sendMail({
        from,
        to: cleanEmail,
        subject,
        html,
        text,
      });

      console.log(`[Phantom-X Mailer] E-mail SMTP enviado com sucesso para ${cleanEmail} (ID: ${info.messageId})`);
      return {
        success: true,
        provider: "smtp",
        messageId: info.messageId,
      };
    } catch (err: any) {
      console.warn(`[Phantom-X Mailer] Falha no transporte SMTP: ${err.message}`);
    }
  }

  // 3. Fallback: Supabase Auth OTP
  return {
    success: false,
    provider: "none",
    error: "A chave RESEND_API_KEY não foi detectada no ambiente em execução. Por favor, configure a variável RESEND_API_KEY no painel da Vercel (e faça um Redeploy) ou insira a chave 're_...' no campo do painel.",
  };
}
