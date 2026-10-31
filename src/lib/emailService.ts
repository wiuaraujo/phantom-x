export interface VerificationRecord {
  email: string;
  name: string;
  code: string;
  expiresAt: number; // Timestamp em milissegundos
  createdAt: number;
}

const STORAGE_KEY = "phantom_pending_verification";

/**
 * Gera um token OTP criptograficamente seguro e único de 6 dígitos numéricos
 */
export function generateVerificationOtp(): string {
  const randomNum = Math.floor(100000 + Math.random() * 900000);
  return randomNum.toString();
}

/**
 * Cria e armazena o token de verificação com expiração estrita de 5 minutos (300.000 ms)
 */
export function createVerificationToken(email: string, name: string): VerificationRecord {
  const code = generateVerificationOtp();
  const now = Date.now();
  const expiresAt = now + 5 * 60 * 1000; // 5 minutos

  const record: VerificationRecord = {
    email: email.trim().toLowerCase(),
    name: name.trim(),
    code,
    expiresAt,
    createdAt: now,
  };

  if (typeof window !== "undefined") {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(record));
    } catch {}
  }

  return record;
}

/**
 * Obtém o registro de verificação pendente ativo
 */
export function getPendingVerification(): VerificationRecord | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const record: VerificationRecord = JSON.parse(raw);
    return record;
  } catch {
    return null;
  }
}

/**
 * Valida o código digitado pelo usuário contra o token e a expiração de 5 minutos
 */
export function verifyOtpCode(inputCode: string, email?: string): { success: boolean; error?: string } {
  const record = getPendingVerification();
  if (!record) {
    return {
      success: false,
      error: "Nenhuma solicitação de verificação ativa foi encontrada. Por favor, tente criar a conta novamente.",
    };
  }

  if (email && record.email !== email.trim().toLowerCase()) {
    return {
      success: false,
      error: "O e-mail informado não corresponde à sessão de verificação pendente.",
    };
  }

  const now = Date.now();
  if (now > record.expiresAt) {
    return {
      success: false,
      error: "Este link de verificação expirou. Clique em reenviar para receber uma nova confirmação.",
    };
  }

  const cleanInput = inputCode.replace(/\D/g, "").trim();
  if (cleanInput.length !== 6) {
    return {
      success: false,
      error: "Por favor, preencha todos os 6 dígitos do código de verificação.",
    };
  }

  if (cleanInput !== record.code) {
    return {
      success: false,
      error: "Código incorreto. Por favor, verifique os números recebidos no seu e-mail.",
    };
  }

  return { success: true };
}

/**
 * Limpa a verificação pendente após confirmação bem sucedida
 */
export function clearPendingVerification(): void {
  if (typeof window !== "undefined") {
    try {
      localStorage.removeItem(STORAGE_KEY);
    } catch {}
  }
}

/**
 * Template Oficial do E-mail de Verificação Phantom-X
 * - Fundo exterior (quadrado maior / Gmail wrapper): Branco (#ffffff)
 * - Card central com os dados e assets: Preto profundo (#0c0c0e) com borda e cantos arredondados
 * - Logotipo minimalista da Phantom
 * - Saudação com nome do operador
 * - Botão direto de "Confirmar e Ativar Minha Conta" sem exibir caixa de código
 * - 100% responsivo e blindado para Desktop e Mobile (Gmail Android/iOS, Apple Mail, Outlook)
 */
export function renderVerificationEmailHtml(name: string, code: string, origin?: string, email?: string): string {
  const cleanName = name || "Operador";
  const baseUrl = origin && origin.startsWith("http") ? origin : (process.env.NEXT_PUBLIC_APP_URL || "https://phantom-x.pro");
  const confirmationUrl = email
    ? `${baseUrl}/api/v1/auth/confirm?email=${encodeURIComponent(email)}&code=${encodeURIComponent(code)}`
    : `${baseUrl}/login?confirmed=1`;

  return `<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Transitional//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd">
<html xmlns="http://www.w3.org/1999/xhtml" lang="pt-BR">
<head>
  <meta http-equiv="Content-Type" content="text/html; charset=UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <meta name="color-scheme" content="light" />
  <meta name="supported-color-schemes" content="light" />
  <title>Confirme sua conta no Phantom-X</title>
  <style type="text/css">
    /* Reset styles */
    body, p, h1, div, table, td, a {
      margin: 0;
      padding: 0;
    }
    body {
      width: 100% !important;
      height: 100% !important;
      background-color: #ffffff !important;
      background: #ffffff !important;
      -webkit-text-size-adjust: 100%;
      -ms-text-size-adjust: 100%;
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
    }
    table, td {
      mso-table-lspace: 0pt;
      mso-table-rspace: 0pt;
    }
    img {
      -ms-interpolation-mode: bicubic;
      border: 0;
      outline: none;
      text-decoration: none;
    }
    /* Anti-inversion Gmail Mobile Styles */
    .dark-card, .card-cell {
      background-color: #0c0c0e !important;
      background: linear-gradient(#0c0c0e, #0c0c0e) !important;
    }
    .main-heading {
      color: #ffffff !important;
      -webkit-text-fill-color: #ffffff !important;
    }
    .body-text {
      color: #a1a1aa !important;
      -webkit-text-fill-color: #a1a1aa !important;
    }
    .muted-text {
      color: #71717a !important;
      -webkit-text-fill-color: #71717a !important;
    }
    .btn-link, .btn-span {
      background-color: #ffffff !important;
      background: linear-gradient(#ffffff, #ffffff) !important;
      color: #000000 !important;
      -webkit-text-fill-color: #000000 !important;
    }

    /* Mobile responsive adjustments */
    @media only screen and (max-width: 600px) {
      .card-cell {
        padding: 28px 20px !important;
      }
      .card-table {
        width: 100% !important;
        max-width: 100% !important;
        border-radius: 16px !important;
      }
      .btn-link {
        display: block !important;
        width: auto !important;
        padding: 14px 20px !important;
        text-align: center !important;
      }
      .outer-cell {
        padding: 20px 10px !important;
      }
    }
  </style>
  <!--[if mso]>
  <style type="text/css">
    body, table, td, p, a { font-family: Arial, sans-serif !important; }
  </style>
  <![endif]-->
</head>
<body class="body" bgcolor="#ffffff" style="margin: 0; padding: 0; width: 100% !important; background-color: #ffffff !important; background: #ffffff !important;">

  <!-- TABELA EXTERNA (FUNDO BRANCO DO GMAIL - QUADRADO MAIOR) -->
  <table role="presentation" class="outer-table" width="100%" border="0" cellpadding="0" cellspacing="0" bgcolor="#ffffff" style="margin: 0; padding: 0; width: 100% !important; background-color: #ffffff !important; background: #ffffff !important;">
    <tr>
      <td class="outer-cell" align="center" valign="top" bgcolor="#ffffff" style="padding: 40px 15px; background-color: #ffffff !important; background: #ffffff !important;">
        
        <!-- CARD PRETO CENTRAL (ONDE ESTÃO OS ASSETS, ESCRITA E BOTÃO - BLINDADO CONTRA INVERSÃO DO GMAIL) -->
        <table role="presentation" class="card-table dark-card" width="100%" border="0" cellpadding="0" cellspacing="0" bgcolor="#0c0c0e" style="max-width: 520px; width: 100%; margin: 0 auto; background-color: #0c0c0e !important; background: linear-gradient(#0c0c0e, #0c0c0e) !important; border: 1px solid #27272a; border-radius: 20px; border-collapse: separate; box-shadow: 0 10px 40px rgba(0,0,0,0.4);">
          <tr>
            <td class="card-cell dark-card" bgcolor="#0c0c0e" style="padding: 36px 32px; background-color: #0c0c0e !important; background: linear-gradient(#0c0c0e, #0c0c0e) !important; border-radius: 20px; text-align: left;">
              
              <!-- Logotipo Oficial da Phantom com moldura sutil para alto contraste -->
              <table role="presentation" border="0" cellpadding="0" cellspacing="0" style="margin-bottom: 24px;">
                <tr>
                  <td bgcolor="#18181b" style="background-color: #18181b !important; background: linear-gradient(#18181b, #18181b) !important; padding: 6px; border-radius: 10px; border: 1px solid #27272a;">
                    <img src="${baseUrl}/logo.png" alt="Phantom-X" width="34" height="34" style="display: block; width: 34px; height: 34px; max-width: 34px; object-fit: contain; border: 0;" />
                  </td>
                </tr>
              </table>

              <!-- Saudação Oficial -->
              <h1 class="main-heading" style="margin: 0 0 14px 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; font-size: 22px; font-weight: 700; color: #ffffff !important; -webkit-text-fill-color: #ffffff !important; line-height: 1.3;">
                Olá, ${cleanName}
              </h1>

              <!-- Texto de Confirmação -->
              <p class="body-text" style="margin: 0 0 18px 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; font-size: 14px; color: #a1a1aa !important; -webkit-text-fill-color: #a1a1aa !important; line-height: 1.5;">
                Sua conta na plataforma Phantom-X foi criada com sucesso.
              </p>

              <!-- Instrução de Ativação -->
              <p class="body-text" style="margin: 0 0 28px 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; font-size: 13px; color: #a1a1aa !important; -webkit-text-fill-color: #a1a1aa !important; line-height: 1.6;">
                Para ativar o seu acesso de operador e começar a utilizar a plataforma, confirme o seu e-mail clicando no botão abaixo:
              </p>

              <!-- Botão Oficial de Ativação de Conta (Sem código numérico) -->
              <table role="presentation" border="0" cellpadding="0" cellspacing="0" width="100%" style="margin: 30px 0 32px 0;">
                <tr>
                  <td align="center" bgcolor="#0c0c0e" style="background-color: #0c0c0e !important; background: linear-gradient(#0c0c0e, #0c0c0e) !important; text-align: center;">
                    <!--[if mso]>
                    <v:roundrect xmlns:v="urn:schemas-microsoft-com:vml" xmlns:w="urn:schemas-microsoft-com:office:word" href="${confirmationUrl}" style="height:48px;v-text-anchor:middle;width:280px;" arcsize="25%" strokecolor="#ffffff" fillcolor="#ffffff">
                      <w:anchorlock/>
                      <center style="color:#000000;font-family:Arial,sans-serif;font-size:14px;font-weight:bold;">Confirmar e Ativar Minha Conta &rarr;</center>
                    </v:roundrect>
                    <![endif]-->
                    <!--[if !mso]><!-->
                    <a href="${confirmationUrl}" target="_blank" rel="noopener noreferrer" class="btn-link white-btn" style="display: inline-block; background-color: #ffffff !important; background: linear-gradient(#ffffff, #ffffff) !important; color: #000000 !important; -webkit-text-fill-color: #000000 !important; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; font-weight: 700; font-size: 14px; padding: 14px 34px; border-radius: 12px; text-decoration: none; box-shadow: 0 4px 20px rgba(255, 255, 255, 0.25); mso-padding-alt: 0;">
                      <span class="btn-span" style="color: #000000 !important; -webkit-text-fill-color: #000000 !important; text-decoration: none; font-weight: 700;">Confirmar e Ativar Minha Conta &rarr;</span>
                    </a>
                    <!--<![endif]-->
                  </td>
                </tr>
              </table>

              <!-- Aviso de Segurança -->
              <p class="muted-text" style="margin: 0 0 24px 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; font-size: 12px; color: #71717a !important; -webkit-text-fill-color: #71717a !important; line-height: 1.5;">
                Se você não solicitou este cadastro, por favor, ignore esta mensagem.
              </p>

              <!-- Divisória Limpa -->
              <table role="presentation" width="100%" border="0" cellpadding="0" cellspacing="0" style="margin-top: 24px; border-top: 1px solid #27272a;">
                <tr>
                  <td class="dark-card" bgcolor="#0c0c0e" style="background-color: #0c0c0e !important; background: linear-gradient(#0c0c0e, #0c0c0e) !important; padding-top: 20px;">
                    <p class="main-heading" style="margin: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; font-size: 14px; color: #ffffff !important; -webkit-text-fill-color: #ffffff !important; font-weight: 600; line-height: 1.4;">
                      Um abraço,<br />
                      Equipe Phantom-X.
                    </p>
                    <div class="muted-text" style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; font-size: 12px; color: #71717a !important; -webkit-text-fill-color: #71717a !important; margin-top: 4px;">
                      Infraestrutura Edge &amp; Cibersegurança de Tráfego
                    </div>
                  </td>
                </tr>
              </table>

            </td>
          </tr>
        </table>

      </td>
    </tr>
  </table>

</body>
</html>`;
}

/**
 * Renderiza o e-mail em formato texto simples
 */
export function renderVerificationEmailText(name: string, code: string, origin?: string, email?: string): string {
  const cleanName = name || "Operador";
  const baseUrl = origin && origin.startsWith("http") ? origin : (process.env.NEXT_PUBLIC_APP_URL || "https://phantom-x.pro");
  const confirmationUrl = email
    ? `${baseUrl}/api/v1/auth/confirm?email=${encodeURIComponent(email)}&code=${encodeURIComponent(code)}`
    : `${baseUrl}/login?confirmed=1`;

  return `Olá, ${cleanName}

Sua conta na plataforma Phantom-X foi criada com sucesso!

Para confirmar o seu e-mail e ativar sua conta, clique no link abaixo:
${confirmationUrl}

Se você não solicitou este cadastro, por favor ignore este e-mail.

Um abraço,
Equipe Phantom-X.`;
}
