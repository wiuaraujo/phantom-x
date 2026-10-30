import { Resend } from "resend";

/**
 * Obtém instância do cliente Resend dinamicamente a cada requisição
 */
export function getResendClient(customApiKey?: string): Resend | null {
  const key = customApiKey?.trim() || process.env.RESEND_API_KEY?.trim();
  if (!key) return null;
  return new Resend(key);
}

export interface SendResendEmailParams {
  to: string | string[];
  subject: string;
  html: string;
  text?: string;
  from?: string;
  replyTo?: string;
  apiKey?: string;
}

export interface ResendResponse {
  success: boolean;
  messageId?: string;
  error?: string;
  provider: "resend";
}

/**
 * Envia e-mail oficial usando a API oficial da Resend (HTTP)
 * Prioriza o domínio oficial de produção contato@phantom-x.pro
 * Suporta fallback inteligente para onboarding@resend.dev se o DNS ainda estiver propagando
 */
export async function sendEmailViaResend(params: SendResendEmailParams): Promise<ResendResponse> {
  const client = getResendClient(params.apiKey);
  if (!client) {
    return {
      success: false,
      provider: "resend",
      error: "RESEND_API_KEY não configurada nas variáveis de ambiente.",
    };
  }

  const defaultFrom = process.env.RESEND_FROM || "Phantom-X <contato@phantom-x.pro>";
  const from = params.from || defaultFrom;
  const replyTo = params.replyTo || "suporte@phantom-x.pro";

  try {
    const { data, error } = await client.emails.send({
      from,
      to: params.to,
      subject: params.subject,
      html: params.html,
      text: params.text,
      replyTo,
    });

    if (error) {
      console.warn(`[Resend Mailer] Aviso/Erro retornado pela API Resend:`, error);

      // Se o domínio ainda não concluiu a propagação de DNS no Resend, tenta fallback para onboarding@resend.dev
      if (
        (error.message?.toLowerCase().includes("domain") ||
          error.message?.toLowerCase().includes("verify") ||
          error.name === "validation_error") &&
        !from.includes("onboarding@resend.dev")
      ) {
        console.log(`[Resend Mailer] Tentando envio de contingência via onboarding@resend.dev...`);
        const fallbackRes = await client.emails.send({
          from: "Phantom-X <onboarding@resend.dev>",
          to: params.to,
          subject: params.subject,
          html: params.html,
          text: params.text,
          replyTo,
        });

        if (!fallbackRes.error && fallbackRes.data) {
          return {
            success: true,
            provider: "resend",
            messageId: fallbackRes.data.id,
          };
        }
      }

      return {
        success: false,
        provider: "resend",
        error: error.message || "Erro retornado pela Resend.",
      };
    }

    return {
      success: true,
      provider: "resend",
      messageId: data?.id,
    };
  } catch (err: any) {
    console.error(`[Resend Mailer] Exceção ao chamar Resend:`, err);
    return {
      success: false,
      provider: "resend",
      error: err?.message || "Exceção de rede na API da Resend.",
    };
  }
}
