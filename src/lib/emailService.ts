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
  // Gera código aleatório entre 100000 e 999999
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

  // Validação de expiração de 5 minutos
  const now = Date.now();
  if (now > record.expiresAt) {
    return {
      success: false,
      error: "Este código de verificação expirou (limite de 5 minutos). Clique em 'Reenviar código' para receber um novo token.",
    };
  }

  // Validação dos 6 dígitos
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
      error: "Código incorreto. Por favor, verifique os 6 números recebidos no seu e-mail.",
    };
  }

  // Sucesso: remove o token usado
  if (typeof window !== "undefined") {
    try {
      localStorage.removeItem(STORAGE_KEY);
    } catch {}
  }

  return { success: true };
}

/**
 * Renderiza o template HTML oficial do e-mail de verificação Phantom-X
 * Especificação do usuário:
 * - "Olá, [nome da pessoa]"
 * - "Seu token de verificação de conta é:"
 * - Quadrado preto com degradê branco leve com o código de 6 dígitos em destaque
 * - "Insira o seu código no campo de verificação para confirmar a sua conta. Se você não solicitou este código, por favor, ignore este e-mail."
 * - "Um abraço, Equipe Phantom-X."
 */
export function renderVerificationEmailHtml(name: string, code: string, origin?: string, email?: string): string {
  const cleanName = name || "Operador";
  const baseUrl = origin && origin.startsWith("http") ? origin : (process.env.NEXT_PUBLIC_APP_URL || "https://phantom-x.pro");
  const confirmationUrl = email
    ? `${baseUrl}/api/v1/auth/confirm?email=${encodeURIComponent(email)}&code=${encodeURIComponent(code)}`
    : `${baseUrl}/login?confirmed=1`;

  return `<!DOCTYPE html>
<html lang="pt-BR">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Seu Token de Verificação Phantom-X</title>
  <style>
    body {
      margin: 0;
      padding: 0;
      background-color: #050505;
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
      color: #ffffff;
      -webkit-font-smoothing: antialiased;
    }
    .wrapper {
      width: 100%;
      background-color: #050505;
      padding: 40px 15px;
      box-sizing: border-box;
    }
    .container {
      max-width: 520px;
      margin: 0 auto;
      background-color: #0c0c0e;
      border: 1px solid #27272a;
      border-radius: 20px;
      padding: 36px 30px;
      box-shadow: 0 20px 50px rgba(0,0,0,0.8);
    }
    .logo-badge {
      display: inline-block;
      padding: 6px 14px;
      background: #18181b;
      border: 1px solid #3f3f46;
      border-radius: 10px;
      font-size: 12px;
      font-family: monospace;
      color: #ffffff;
      font-weight: 700;
      letter-spacing: 2px;
      text-transform: uppercase;
      margin-bottom: 24px;
    }
    .greeting {
      font-size: 20px;
      font-weight: 700;
      color: #ffffff;
      margin: 0 0 14px 0;
      line-height: 1.3;
    }
    .subtext {
      font-size: 14px;
      color: #a1a1aa;
      margin: 0 0 24px 0;
      line-height: 1.5;
    }
    /* Quadrado preto no padrão do sistema com degradê branco leve */
    .otp-box {
      background: linear-gradient(145deg, #18181b 0%, #27272a 45%, #18181b 100%);
      border: 1px solid rgba(255, 255, 255, 0.22);
      border-radius: 16px;
      padding: 26px 20px;
      text-align: center;
      margin: 24px 0;
      box-shadow: 0 15px 35px rgba(0, 0, 0, 0.6), inset 0 1px 1px rgba(255, 255, 255, 0.25);
    }
    .otp-code {
      font-family: 'JetBrains Mono', Consolas, Monaco, monospace;
      font-size: 36px;
      font-weight: 800;
      letter-spacing: 10px;
      color: #ffffff;
      text-shadow: 0 0 20px rgba(255, 255, 255, 0.35);
      margin: 0;
      padding-left: 10px;
    }
    .otp-expiry {
      font-size: 11px;
      color: #71717a;
      font-family: monospace;
      margin-top: 10px;
      text-transform: uppercase;
      letter-spacing: 1px;
    }
    .instruction {
      font-size: 13px;
      color: #a1a1aa;
      line-height: 1.6;
      margin: 24px 0 30px 0;
    }
    .closing {
      font-size: 14px;
      color: #ffffff;
      font-weight: 600;
      margin: 0;
      border-top: 1px solid #27272a;
      padding-top: 24px;
    }
    .brand-sub {
      font-size: 12px;
      color: #71717a;
      margin-top: 4px;
    }
  </style>
</head>
<body>
  <div class="wrapper">
    <div class="container">
      <div class="logo-badge">🛡️ PHANTOM-X CLOAKER</div>
      <h1 class="greeting">Olá, ${cleanName}</h1>
      <p class="subtext">Sua conta na plataforma Phantom-X foi criada com sucesso.</p>

      <p class="instruction" style="margin-top: 0;">
        Para ativar o seu acesso de operador e iniciar seus testes no Plano Trial, confirme o seu e-mail clicando no botão abaixo:
      </p>

      <!-- Botão Oficial de Ativação de Conta -->
      <div style="text-align: center; margin: 28px 0;">
        <a href="${confirmationUrl}" style="display: inline-block; background-color: #ffffff; color: #000000; font-family: -apple-system, sans-serif; font-weight: 700; font-size: 14px; padding: 14px 32px; border-radius: 12px; text-decoration: none; box-shadow: 0 4px 20px rgba(255, 255, 255, 0.25);">
          Confirmar e Ativar Minha Conta &rarr;
        </a>
      </div>

      <!-- Quadrado preto com degradê branco leve com Token Opcional -->
      <div class="otp-box">
        <div class="otp-code">${code}</div>
        <div class="otp-expiry">⏳ Código de Ativação do Operador</div>
      </div>

      <p class="instruction">
        Se você não solicitou este cadastro, por favor, ignore esta mensagem.
      </p>

      <p class="closing">Um abraço,<br/>Equipe Phantom-X.</p>
      <div class="brand-sub">Infraestrutura Edge & Cibersegurança de Tráfego</div>
    </div>
  </div>
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

Para confirmar o seu e-mail e ativar sua conta, acesse o link:
${confirmationUrl}

Código de ativação: [ ${code} ]

Se você não solicitou este cadastro, por favor ignore este e-mail.

Um abraço,
Equipe Phantom-X.`;
}
