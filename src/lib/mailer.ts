import nodemailer from "nodemailer";
import { renderVerificationEmailHtml, renderVerificationEmailText } from "./emailService";
import { sendEmailViaResend, resolveResendApiKey, OFFICIAL_FROM_EMAIL, OFFICIAL_REPLY_TO } from "./resend";

export interface SendEmailResult {
  success: boolean;
  provider: "resend" | "smtp" | "supabase" | "none";
  error?: string;
  messageId?: string;
}

/**
 * Cria o transporte SMTP se configurado nas variáveis de ambiente customizadas
 */
function getCustomSmtpTransporter() {
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

  return null;
}

/**
 * Dispara o e-mail de verificação oficial Phantom-X
 * 1. Resend Primário: API REST HTTP Nativa (Direto na API da Resend, < 300ms)
 * 2. Segunda Alternativa Resend: Resend SMTP Relay (smtp.resend.com:465 SSL)
 * 3. Terceira Alternativa: Resend SDK Oficial
 * 4. Fallback SMTP Customizado (se configurado no ambiente)
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

  // 1 & 2. DISPARO COM RESEND (Com orquestração automática: API REST HTTP Nativa + Segunda Alternativa Resend SMTP Relay)
  try {
    const resendResult = await sendEmailViaResend({
      to: cleanEmail,
      subject,
      html,
      text,
      from: process.env.RESEND_FROM || OFFICIAL_FROM_EMAIL,
      replyTo: OFFICIAL_REPLY_TO,
      apiKey: resolveResendApiKey(apiKey),
    });

    if (resendResult.success) {
      console.log(
        `[Phantom-X Mailer] E-mail entregue com SUCESSO via Resend [${resendResult.method || "auto"}] para ${cleanEmail} (ID: ${resendResult.messageId})`
      );
      return {
        success: true,
        provider: "resend",
        messageId: resendResult.messageId,
      };
    } else {
      console.warn(
        `[Phantom-X Mailer] Resend relatou falha: ${resendResult.error}. Verificando transporte SMTP customizado...`
      );
    }
  } catch (err: any) {
    console.warn(`[Phantom-X Mailer] Exceção na orquestração Resend: ${err?.message}`);
  }

  // 3. FALLBACK: TRANSPORTE SMTP CUSTOMIZADO
  const customTransporter = getCustomSmtpTransporter();
  if (customTransporter) {
    try {
      const from = process.env.SMTP_FROM || `Phantom-X <${process.env.SMTP_USER || "contato@phantom-x.pro"}>`;
      const info = await customTransporter.sendMail({
        from,
        to: cleanEmail,
        subject,
        html,
        text,
      });

      console.log(`[Phantom-X Mailer] E-mail enviado com sucesso via SMTP Customizado para ${cleanEmail} (ID: ${info.messageId})`);
      return {
        success: true,
        provider: "smtp",
        messageId: info.messageId,
      };
    } catch (err: any) {
      console.warn(`[Phantom-X Mailer] Falha no transporte SMTP customizado: ${err?.message}`);
    }
  }

  return {
    success: false,
    provider: "none",
    error: "Falha na entrega via Resend (HTTP e SMTP Relay). Por favor, verifique a chave de API ou tente novamente.",
  };
}
