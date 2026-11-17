import { NextRequest, NextResponse } from "next/server";
import { dispatchVerificationEmail } from "@/lib/mailer";
import { resolveResendApiKey } from "@/lib/resend";
import {
  ALLOWED_ADMIN_EMAILS,
  AUTHORIZED_MASTER_KEYS,
  verifyMasterAdminAuth,
} from "@/lib/adminAuth";

export const dynamic = "force-dynamic";

let globalKillSwitchActive = false;

export async function GET(req: NextRequest) {
  // O console admin requer token mestre legítimo
  const isOperatorAdmin = verifyMasterAdminAuth(req);
  const adminEmail = isOperatorAdmin ? "admin@phantom.security" : null;

  const resolvedKey = resolveResendApiKey();
  const hasResend = Boolean(resolvedKey);
  const resendFrom = process.env.RESEND_FROM || "Phantom-X <contato@phantom-x.pro>";

  return NextResponse.json({
    success: true,
    isOperatorAdmin,
    adminEmail,
    data: {
      globalKillSwitchActive,
      edgeEngineVersion: "Phantom-X Edge Core v2.4 (Isolated Security)",
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
    const body = await req.json().catch(() => ({}));
    const { action, passkey, email, password } = body;

    // 0. VERIFICAÇÃO ESTREITA DE SESSÃO ADMIN ATIVA (VIA TOKEN px_master_)
    if (action === "check_session") {
      const isAuth = verifyMasterAdminAuth(req);
      if (!isAuth) {
        return NextResponse.json({ success: false, isAdmin: false });
      }

      const cookieToken =
        req.cookies.get("phantom_admin_token")?.value ||
        req.headers.get("x-phantom-admin-token") ||
        "";
      return NextResponse.json({
        success: true,
        isAdmin: true,
        message: "Sessão de Master Administrador ativa e validada.",
        adminSession: {
          token: cookieToken.startsWith("px_master_")
            ? cookieToken
            : `px_master_${Date.now().toString(36)}`,
          role: "master_administrator",
          name: "Master Administrator",
          email: "admin@phantom.security",
          authenticatedAt: new Date().toISOString(),
          expiresAt: new Date(Date.now() + 24 * 3600 * 1000).toISOString(),
        },
      });
    }

    // 1. AUTENTICAÇÃO MESTRE PARA O PAINEL ADMIN (ROTA E E-MAIL EXCLUSIVOS)
    if (action === "auth_admin") {
      const cleanEmail = (email || "").trim().toLowerCase();

      // Bloqueio rigoroso: apenas e-mails mestres oficiais da Phantom Security podem acessar
      if (!ALLOWED_ADMIN_EMAILS.includes(cleanEmail)) {
        return NextResponse.json(
          {
            success: false,
            error: "Acesso restrito. Este e-mail não possui autorização de Master Admin.",
          },
          { status: 403 }
        );
      }

      const input = (passkey || password || "").trim();
      const isAuthorized = AUTHORIZED_MASTER_KEYS.includes(input);

      if (!isAuthorized) {
        return NextResponse.json(
          {
            success: false,
            error: "Credenciais de Acesso Inválidas. Insira a Chave Mestra autorizada para o console.",
          },
          { status: 401 }
        );
      }

      // Gera token de sessão mestre de alta entropia
      const adminToken = `px_master_${Date.now().toString(36)}_${Math.random().toString(36).substring(2, 10)}`;

      const response = NextResponse.json({
        success: true,
        message: "Acesso Mestre Concedido ao Centro de Governança Phantom-X.",
        adminSession: {
          token: adminToken,
          role: "master_administrator",
          name: "Phantom Security Chief",
          email: cleanEmail,
          authenticatedAt: new Date().toISOString(),
          expiresAt: new Date(Date.now() + 24 * 3600 * 1000).toISOString(),
        },
      });

      // Define cookie exclusivo do Master Admin
      response.cookies.set("phantom_admin_token", adminToken, {
        path: "/",
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        maxAge: 24 * 3600,
      });

      return response;
    }

    // 2. TOGGLE DO KILL-SWITCH DE EMERGÊNCIA GLOBAL (REQUER AUTH MASTER)
    if (action === "toggle_killswitch") {
      if (!verifyMasterAdminAuth(req)) {
        return NextResponse.json(
          { success: false, error: "Acesso não autorizado. Chave mestre necessária." },
          { status: 403 }
        );
      }

      globalKillSwitchActive = !globalKillSwitchActive;
      return NextResponse.json({
        success: true,
        globalKillSwitchActive,
        message: globalKillSwitchActive
          ? "KILL-SWITCH DE EMERGÊNCIA ATIVADO: Todo o tráfego do cluster agora é forçado 100% para a Safe Page."
          : "KILL-SWITCH DESATIVADO: Tráfego normalizado com filtragem heurística de borda ativa.",
      });
    }

    // 3. TESTE DE DISPARO DE E-MAIL (RESEND / SMTP) (REQUER AUTH MASTER)
    if (action === "test_email") {
      if (!verifyMasterAdminAuth(req)) {
        return NextResponse.json(
          { success: false, error: "Acesso não autorizado. Chave mestre necessária." },
          { status: 403 }
        );
      }

      const targetEmail = body.to || email || "admin@phantom.security";
      const origin =
        req.headers.get("origin") || req.nextUrl.origin || "https://phantom-x.pro";
      const providedKey = body.resendApiKey || body.apiKey;

      if (providedKey && typeof providedKey === "string" && providedKey.trim().startsWith("re_")) {
        process.env.RESEND_API_KEY = providedKey.trim();
        try {
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
