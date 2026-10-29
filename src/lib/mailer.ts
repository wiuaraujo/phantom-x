import nodemailer from "nodemailer";
import { renderVerificationEmailHtml, renderVerificationEmailText } from "./emailService";

export interface SendEmailResult {
  success: boolean;
  provider: "smtp" | "supabase" | "resend" | "none";
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

  // Suporte direto para Resend SMTP se a chave RESEND_API_KEY estiver configurada
  const resendKey = process.env.RESEND_API_KEY;
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
 */
export async function dispatchVerificationEmail(params: {
  to: string;
  name: string;
  code: string;
}): Promise<SendEmailResult> {
  const { to, name, code } = params;
  const cleanEmail = to.trim().toLowerCase();
  const cleanName = name.trim() || "Operador";

  const html = renderVerificationEmailHtml(cleanName, code);
  const text = renderVerificationEmailText(cleanName, code);
  const subject = `🛡️ [Phantom-X] Seu Token de Verificação: ${code}`;

  // 1. Tenta envio direto via SMTP / Resend se configurado
  const transporter = getSmtpTransporter();
  if (transporter) {
    try {
      const from = process.env.SMTP_FROM || `Phantom-X <${process.env.SMTP_USER || "noreply@phantomx.pro"}>`;
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

  // 2. Se não houver SMTP configurado, o Supabase Auth será o canal principal
  return {
    success: false,
    provider: "none",
    error: "Nenhum provedor SMTP ativo no momento. Disparo delegado ao Supabase Auth.",
  };
}
