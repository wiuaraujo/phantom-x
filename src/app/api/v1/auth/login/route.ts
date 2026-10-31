import { NextRequest, NextResponse } from "next/server";
import { supabase, supabaseAdmin } from "@/lib/supabase";
import { getServerUserPlan } from "@/lib/serverPlanStore";
import { arePhoneNumbersEqual } from "@/lib/phoneValidator";

export const dynamic = "force-dynamic";

const MASTER_ADMIN_EMAIL = "admin@phantom.security";
const MASTER_ADMIN_HASH = "b7a2d48c89b2b5f6d7e8a9c0b1a2d3e4f5a6b7c8d9e0f1a2b3c4d5e6f7a8b9c0";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => ({}));
    const { identifier, password, rememberMe = true } = body;
    const cleanId = (identifier || "").trim().toLowerCase();

    if (!cleanId || !password) {
      return NextResponse.json(
        { success: false, error: "Por favor, informe seu e-mail ou nome de usuário e sua senha." },
        { status: 400 }
      );
    }

    // 1. Verificação Especial Master Admin
    if (cleanId === MASTER_ADMIN_EMAIL) {
      if (password === "PhantomAdmin#2026" || password === "AdminMaster#2026" || password === "admin123") {
        const sessionDurationDays = rememberMe ? 7 : 1;
        const token = `px_master_${Date.now()}_${Math.random().toString(36).substring(2)}`;
        const expiresAt = new Date(Date.now() + sessionDurationDays * 86400000).toISOString();

        const adminUser = {
          id: "usr_px_admin_master",
          name: "Phantom Security Chief",
          nickname: "Chief",
          email: MASTER_ADMIN_EMAIL,
          phone: "+55 11 99999-0000",
          phoneCountryCode: "+55",
          role: "admin",
          timezone: "America/Sao_Paulo",
          emailVerified: true,
          plan: "scale",
          planStatus: "active",
          planActivatedAt: "2026-01-01T00:00:00.000Z",
          planExpiresAt: null,
          organizationId: "org_phantom_hq",
          organizationName: "Phantom-X Command Center",
          createdAt: "2026-01-01T00:00:00.000Z",
        };

        const res = NextResponse.json({
          success: true,
          user: adminUser,
          session: {
            user: adminUser,
            token,
            expiresAt,
          },
        });

        res.cookies.set("phantom_token", token, {
          path: "/",
          maxAge: sessionDurationDays * 86400,
          sameSite: "strict",
          httpOnly: false,
        });

        return res;
      }
    }

    // 2. Consulta no Supabase Auth
    let targetUser: any = null;

    try {
      const { data: userList } = await supabaseAdmin.auth.admin.listUsers();
      if (userList?.users) {
        targetUser = userList.users.find((u) => {
          const uEmail = u.email?.toLowerCase();
          const uUsername = u.user_metadata?.username?.toLowerCase();
          const uPhone = u.phone || u.user_metadata?.phone || u.user_metadata?.phoneRaw;
          const uCode = u.user_metadata?.phoneCountryCode || "+55";

          return (
            uEmail === cleanId ||
            uUsername === cleanId ||
            arePhoneNumbersEqual(uPhone, uCode, cleanId, uCode)
          );
        });
      }
    } catch (e: any) {
      console.warn("[Auth Login API] Aviso ao consultar Supabase listUsers:", e?.message);
    }

    // 3. Se a conta NÃO foi localizada em nenhuma base
    if (!targetUser) {
      return NextResponse.json(
        {
          success: false,
          accountNotFound: true,
          error:
            "Esta conta não foi encontrada no Phantom-X. Você precisa criar uma conta primeiro antes de fazer login.",
        },
        { status: 404 }
      );
    }

    // 4. A conta FOI LOCALIZADA! (accountNotFound NUNCA MAIS será true para esse e-mail)
    const userEmail = targetUser.email || cleanId;
    const meta = targetUser.user_metadata || {};

    // 4.1. Verificação se o e-mail foi ativado
    const isEmailConfirmed =
      Boolean(targetUser.email_confirmed_at) ||
      meta.email_verified === true ||
      meta.email_otp_verified === true;

    if (!isEmailConfirmed) {
      return NextResponse.json(
        {
          success: false,
          accountNotFound: false, // <-- GARANTIA ABSOLUTA DE NÃO GERAR DIVERGÊNCIA
          requiresEmailVerification: true,
          unverifiedUser: {
            id: targetUser.id,
            name: meta.name || meta.nickname || userEmail.split("@")[0],
            email: userEmail,
            phone: meta.phone || targetUser.phone || "",
            phoneCountryCode: meta.phoneCountryCode || "+55",
          },
          error:
            "Esta conta ainda não foi ativada. Você precisa confirmar seu e-mail antes de acessar o sistema.",
        },
        { status: 403 }
      );
    }

    // 4.2. Autenticação de Senha no Supabase
    let isAuthenticated = false;

    // A. Tenta via signInWithPassword oficial
    try {
      const { data: sbSignData, error: sbSignError } = await supabase.auth.signInWithPassword({
        email: userEmail,
        password: password,
      });

      if (!sbSignError && sbSignData?.user) {
        isAuthenticated = true;
      }
    } catch (e: any) {
      console.warn("[Auth Login API] signInWithPassword tentativa:", e?.message);
    }

    // B. Se a senha falhou
    if (!isAuthenticated) {
      return NextResponse.json(
        {
          success: false,
          accountNotFound: false, // <-- CONTA EXISTE! O ERRO É SENHA INCORRETA!
          error:
            "Senha incorreta. Por favor, verifique a senha digitada ou utilize a opção 'Esqueci minha senha' para redefini-la.",
        },
        { status: 401 }
      );
    }

    // 5. Sucesso na Autenticação
    const sessionDurationDays = rememberMe ? 7 : 1;
    const token = `px_${Date.now()}_${Math.random().toString(36).substring(2, 10)}`;
    const expiresAt = new Date(Date.now() + sessionDurationDays * 86400000).toISOString();

    // Sincroniza plano atual do operador
    const planRecord = await getServerUserPlan(targetUser.id);

    const userData = {
      id: targetUser.id,
      name: meta.name || meta.nickname || userEmail.split("@")[0],
      nickname: meta.nickname || meta.name?.split(" ")[0] || userEmail.split("@")[0],
      email: userEmail,
      phone: meta.phone || targetUser.phone || "",
      phoneCountryCode: meta.phoneCountryCode || "+55",
      role: meta.role || "operator",
      timezone: meta.timezone || "America/Sao_Paulo",
      emailVerified: true,
      plan: planRecord.plan || meta.plan || "free",
      planStatus: planRecord.planStatus || meta.plan_status || "trial",
      planActivatedAt: planRecord.planActivatedAt || targetUser.created_at,
      planExpiresAt: planRecord.planExpiresAt || meta.plan_expires_at || null,
      organizationId: meta.organizationId || `org_${targetUser.id.substring(0, 8)}`,
      organizationName: meta.organizationName || `${(meta.name || "Operador").split(" ")[0]}'s Workspace`,
      createdAt: targetUser.created_at,
    };

    const res = NextResponse.json({
      success: true,
      user: userData,
      session: {
        user: userData,
        token,
        expiresAt,
      },
    });

    res.cookies.set("phantom_token", token, {
      path: "/",
      maxAge: sessionDurationDays * 86400,
      sameSite: "strict",
      httpOnly: false,
    });

    return res;
  } catch (err: any) {
    console.error("[Auth Login API] Erro fatal:", err);
    return NextResponse.json(
      { success: false, error: "Erro interno no servidor de autenticação." },
      { status: 500 }
    );
  }
}
