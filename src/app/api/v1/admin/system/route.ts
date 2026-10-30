import { NextRequest, NextResponse } from "next/server";
import { supabase, supabaseAdmin } from "@/lib/supabase";
import { dispatchVerificationEmail } from "@/lib/mailer";
import { resolveResendApiKey } from "@/lib/resend";

export const dynamic = "force-dynamic";

let globalKillSwitchActive = false;

// Chaves mestras autorizadas para o Painel Admin Independente
const AUTHORIZED_MASTER_KEYS = [
  "Analivia@13@#",
  "PhantomX@2026!",
  "admin",
  "master_px_secret_key_2026",
];

export async function GET(req: NextRequest) {
  // Verifica se o usuário possui cookie de sessão administrativa ativo
  let isOperatorAdmin = false;
  let adminEmail = "admin@phantom-x.pro";

  const cookieToken = req.cookies.get("phantom_token")?.value;
  if (cookieToken) {
    try {
      const decoded = JSON.parse(Buffer.from(cookieToken, "base64").toString("utf-8"));
      if (decoded && (decoded.role === "admin" || decoded.email?.toLowerCase() === "wiuaraujo@gmail.com")) {
        isOperatorAdmin = true;
        adminEmail = decoded.email;
      }
    } catch {}
  }

  const resolvedKey = resolveResendApiKey();
  const hasResend = Boolean(resolvedKey);
  const resendFrom = process.env.RESEND_FROM || "Phantom-X <contato@phantom-x.pro>";

  return NextResponse.json({
    success: true,
    isOperatorAdmin,
    adminEmail,
    data: {
      globalKillSwitchActive,
      edgeEngineVersion: "Phantom-X Edge Core v2.4",
      cloakerMode: globalKillSwitchActive ? "EMERGENCY_SAFE_ALL" : "ACTIVE_FILTERING",
      timestamp: new Date().toISOString(),
      emailService: {
        provider: "resend",
        resendConfigured: hasResend,
        fromAddress: resendFrom,
        domain: "phantom-x.pro",
        methods: ["http_rest", "smtp_relay"],
      },
    },
  });
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { action, passkey, email, password } = body;

    // 0. VERIFICAÇÃO AUTOMÁTICA DE SESSÃO ADMIN ATIVA (VIA COOKIE)
    if (action === "check_session") {
      const cookieToken = req.cookies.get("phantom_token")?.value;
      if (cookieToken) {
        try {
          const decoded = JSON.parse(Buffer.from(cookieToken, "base64").toString("utf-8"));
          if (decoded && (decoded.role === "admin" || decoded.email?.toLowerCase() === "wiuaraujo@gmail.com")) {
            const adminToken = `px_master_${Date.now().toString(36)}_${Math.random().toString(36).substring(2, 8)}`;
            return NextResponse.json({
              success: true,
              isAdmin: true,
              message: "Sessão de Administrador detectada automaticamente.",
              adminSession: {
                token: adminToken,
                role: "master_administrator",
                name: decoded.name || "Administrador Master",
                email: decoded.email,
                authenticatedAt: new Date().toISOString(),
                expiresAt: new Date(Date.now() + 24 * 3600 * 1000).toISOString(),
              },
            });
          }
        } catch {}
      }

      return NextResponse.json({ success: false, isAdmin: false });
    }

    // 1. AUTENTICAÇÃO MESTRE PARA O PAINEL ADMIN
    if (action === "auth_admin") {
      const input = (passkey || password || "").trim();
      let isAuthorized = AUTHORIZED_MASTER_KEYS.includes(input);
      let resolvedEmail = email || "admin@phantom-x.pro";
      let resolvedName = "Engenheiro Chefe de Operações";

      // Se não bateu com a chave mestra direta, tenta validar via credenciais do Supabase
      if (!isAuthorized && input) {
        const candidateEmail = email?.trim() || "wiuaraujo@gmail.com";
        try {
          const { data: authData, error: aErr } = await supabase.auth.signInWithPassword({
            email: candidateEmail,
            password: input,
          });

          if (!aErr && authData?.user) {
            const userRole = authData.user.user_metadata?.role || "admin";
            if (userRole === "admin" || candidateEmail.toLowerCase() === "wiuaraujo@gmail.com") {
              isAuthorized = true;
              resolvedEmail = authData.user.email || candidateEmail;
              resolvedName = authData.user.user_metadata?.name || "Administrador Master";
            }
          }
        } catch {}
      }

      // Também verifica se tem cookie de admin ativo no momento do envio
      if (!isAuthorized) {
        const cookieToken = req.cookies.get("phantom_token")?.value;
        if (cookieToken) {
          try {
            const decoded = JSON.parse(Buffer.from(cookieToken, "base64").toString("utf-8"));
            if (decoded && (decoded.role === "admin" || decoded.email?.toLowerCase() === "wiuaraujo@gmail.com")) {
              isAuthorized = true;
              resolvedEmail = decoded.email;
              resolvedName = decoded.name || "Administrador Master";
            }
          } catch {}
        }
      }

      if (!isAuthorized) {
        return NextResponse.json(
          {
            success: false,
            error: "Credenciais de Acesso Inválidas. Insira a Chave Mestra ou a Senha da sua Conta de Administrador.",
          },
          { status: 401 }
        );
      }

      // Gera token de sessão administrativa
      const adminToken = `px_master_${Date.now().toString(36)}_${Math.random().toString(36).substring(2, 8)}`;

      return NextResponse.json({
        success: true,
        message: "Acesso Mestre Concedido ao Centro de Governança Phantom-X.",
        adminSession: {
          token: adminToken,
          role: "master_administrator",
          name: resolvedName,
          email: resolvedEmail,
          authenticatedAt: new Date().toISOString(),
          expiresAt: new Date(Date.now() + 24 * 3600 * 1000).toISOString(),
        },
      });
    }

    // 2. TOGGLE DO KILL-SWITCH DE EMERGÊNCIA GLOBAL
    if (action === "toggle_killswitch") {
      globalKillSwitchActive = !globalKillSwitchActive;
      return NextResponse.json({
        success: true,
        globalKillSwitchActive,
        message: globalKillSwitchActive
          ? "KILL-SWITCH DE EMERGÊNCIA ATIVADO: Todo o tráfego do cluster agora é forçado 100% para a Safe Page."
          : "KILL-SWITCH DESATIVADO: Tráfego normalizado com filtragem heurística de borda ativa.",
      });
    }

    // 3. TESTE DE DISPARO DE E-MAIL (RESEND / SMTP)
    if (action === "test_email") {
      const targetEmail = body.to || email || "wiuaraujo@gmail.com";
      const origin = req.headers.get("origin") || req.nextUrl.origin || "https://phantom-x.pro";
      const providedKey = body.resendApiKey || body.apiKey;

      if (providedKey && typeof providedKey === "string" && providedKey.trim().startsWith("re_")) {
        process.env.RESEND_API_KEY = providedKey.trim();
        try {
          // Atualiza também no .env.local se estiver rodando localmente
          const fs = await import("fs");
          const path = await import("path");
          const envPath = path.resolve(process.cwd(), ".env.local");
          if (fs.existsSync(envPath)) {
            let content = fs.readFileSync(envPath, "utf-8");
            content = content.replace(/RESEND_API_KEY=.*/, `RESEND_API_KEY=${providedKey.trim()}`);
            fs.writeFileSync(envPath, content, "utf-8");
          }
        } catch {}
      }

      const res = await dispatchVerificationEmail({
        to: targetEmail,
        name: "Administrador Master",
        code: Math.floor(100000 + Math.random() * 900000).toString(),
        origin,
        apiKey: providedKey,
      });

      return NextResponse.json({
        success: res.success,
        provider: res.provider,
        messageId: res.messageId,
        error: res.error,
        message: res.success
          ? `E-mail de teste enviado com sucesso via ${res.provider.toUpperCase()} para ${targetEmail}!`
          : `Falha ao enviar e-mail: ${res.error || "Provedor indisponível"}`,
      });
    }

    return NextResponse.json({ success: false, error: "Ação não suportada." }, { status: 400 });
  } catch (err: any) {
    return NextResponse.json(
      { success: false, error: err?.message || "Erro no processador de sistema." },
      { status: 500 }
    );
  }
}
