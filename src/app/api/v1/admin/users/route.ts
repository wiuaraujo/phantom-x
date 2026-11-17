import { NextRequest, NextResponse } from "next/server";
import { supabase, supabaseAdmin } from "@/lib/supabase";
import { getServerOtp, setServerOtp, clearServerOtp } from "@/lib/serverOtpStore";
import { setServerUserPlan, getServerUserPlanSync, removeServerUserPlan } from "@/lib/serverPlanStore";
import { getAllServerUsers, findServerUser, saveServerUser } from "@/lib/serverUserStore";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export async function GET(req: NextRequest) {
  try {
    // 1. Busca todos os usuários do cofre resiliente do servidor
    const localUsers = getAllServerUsers();
    const usersMap = new Map<string, any>();

    // Popula o mapa inicial com o cofre do servidor
    localUsers.forEach((u) => {
      usersMap.set(u.id, {
        id: u.id,
        email: u.email,
        name: u.name,
        nickname: u.nickname,
        phone: u.phone || "",
        phoneCountryCode: u.phoneCountryCode || "+55",
        role: u.role,
        timezone: u.timezone,
        emailVerified: u.emailVerified,
        emailConfirmedAt: u.emailConfirmedAt,
        plan: u.plan,
        planStatus: u.planStatus,
        planSource: "admin",
        isPaid: u.plan !== "free" && u.planStatus === "active",
        grantedBy: "admin",
        stripeSubscriptionId: null,
        planActivatedAt: u.planActivatedAt,
        planExpiresAt: u.planExpiresAt || null,
        createdAt: u.createdAt,
        lastSignInAt: u.updatedAt || null,
        activeOtp: null,
      });
      usersMap.set(u.email.toLowerCase(), usersMap.get(u.id));
    });

    // 2. Tenta enriquecer com dados do Supabase Auth (se online)
    try {
      const { data: userListData, error: uErr } = await supabaseAdmin.auth.admin.listUsers();
      if (!uErr && userListData?.users) {
        userListData.users.forEach((u) => {
          const email = u.email?.toLowerCase() || "";
          const meta = u.user_metadata || {};
          const existing = usersMap.get(u.id) || usersMap.get(email);

          const isVerified =
            Boolean(u.email_confirmed_at) ||
            meta.email_verified === true ||
            existing?.emailVerified === true;

          const currentPlan = meta.plan || existing?.plan || "free";
          const currentPlanStatus = meta.plan_status || existing?.planStatus || "trial";

          const merged = {
            id: u.id,
            email: email,
            name: meta.name || existing?.name || email.split("@")[0],
            nickname: meta.nickname || existing?.nickname || (meta.name ? meta.name.split(" ")[0] : "Operador"),
            phone: meta.phone || meta.phoneRaw || u.phone || existing?.phone || "",
            phoneCountryCode: meta.phoneCountryCode || existing?.phoneCountryCode || "+55",
            role: meta.role || existing?.role || "operator",
            timezone: meta.timezone || existing?.timezone || "America/Sao_Paulo",
            emailVerified: isVerified,
            emailConfirmedAt: u.email_confirmed_at || existing?.emailConfirmedAt || null,
            plan: currentPlan,
            planStatus: currentPlanStatus,
            planSource: meta.plan_source || existing?.planSource || "free",
            isPaid: currentPlan !== "free" && currentPlanStatus === "active",
            grantedBy: meta.granted_by || existing?.grantedBy || "system",
            stripeSubscriptionId: meta.stripe_subscription_id || null,
            planActivatedAt: meta.plan_activated_at || existing?.planActivatedAt || u.created_at,
            planExpiresAt: meta.plan_expires_at || existing?.planExpiresAt || null,
            createdAt: u.created_at || existing?.createdAt,
            lastSignInAt: u.last_sign_in_at || existing?.lastSignInAt || null,
            activeOtp: null,
          };

          usersMap.set(u.id, merged);
          if (email) usersMap.set(email, merged);
        });
      }
    } catch (e: any) {
      console.warn("[Admin users GET] Supabase offline/inacessível:", e?.message);
    }

    // 3. Adiciona status de OTP ativo e planos sincronizados
    const uniqueUsers = Array.from(new Set(usersMap.values()));
    const finalUsers = uniqueUsers.map((u) => {
      const activeOtpRecord = getServerOtp(u.email);
      const cachedPlan = getServerUserPlanSync(u.id) || getServerUserPlanSync(u.email);

      return {
        ...u,
        plan: cachedPlan?.plan || u.plan,
        planStatus: cachedPlan?.planStatus || u.planStatus,
        planSource: cachedPlan?.planSource || u.planSource,
        isPaid: cachedPlan?.isPaid ?? u.isPaid,
        activeOtp: activeOtpRecord
          ? {
              code: activeOtpRecord.code,
              expiresAt: activeOtpRecord.expiresAt,
              remainingSeconds: Math.max(0, Math.floor((activeOtpRecord.expiresAt - Date.now()) / 1000)),
              attempts: activeOtpRecord.attempts,
            }
          : null,
      };
    });

    return NextResponse.json(
      {
        success: true,
        count: finalUsers.length,
        users: finalUsers,
      },
      {
        headers: {
          "Cache-Control": "no-store, no-cache, must-revalidate, proxy-revalidate, max-age=0",
          Pragma: "no-cache",
          Expires: "0",
        },
      }
    );
  } catch (err: any) {
    return NextResponse.json(
      { success: false, error: err?.message || "Falha ao listar operadores." },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { action, userId, email, role } = body;

    if (!action || (!userId && !email)) {
      return NextResponse.json(
        { success: false, error: "Ação e identificador do usuário são obrigatórios." },
        { status: 400 }
      );
    }

    const cleanEmail = email ? email.trim().toLowerCase() : "";
    const targetUserId = userId || (cleanEmail ? findServerUser(cleanEmail)?.id : "");

    switch (action) {
      // 1. CONFIRMA O E-MAIL DO OPERADOR
      case "verify_email": {
        if (cleanEmail) {
          saveServerUser({
            email: cleanEmail,
            emailVerified: true,
            emailConfirmedAt: new Date().toISOString(),
          });
        }
        if (targetUserId) {
          try {
            await supabaseAdmin.auth.admin.updateUserById(targetUserId, {
              email_confirm: true,
              user_metadata: { email_verified: true, verified_at: new Date().toISOString() },
            });
          } catch {}
        }
        return NextResponse.json({
          success: true,
          message: "Conta e e-mail do operador confirmados manualmente com sucesso!",
        });
      }

      // 2. ALTERA O CARGO DO OPERADOR
      case "change_role": {
        const newRole = role === "admin" ? "admin" : "operator";
        if (cleanEmail) {
          saveServerUser({ email: cleanEmail, role: newRole });
        }
        if (targetUserId) {
          try {
            await supabaseAdmin.auth.admin.updateUserById(targetUserId, {
              user_metadata: { role: newRole },
            });
          } catch {}
        }
        return NextResponse.json({
          success: true,
          message: `Cargo do operador alterado para '${newRole}'.`,
        });
      }

      // 3. GERA TOKEN OTP NO PAINEL ADMIN
      case "generate_otp": {
        if (!cleanEmail) {
          return NextResponse.json({ success: false, error: "E-mail é obrigatório." }, { status: 400 });
        }
        const randomOtp = Math.floor(100000 + Math.random() * 900000).toString();
        const record = setServerOtp(cleanEmail, "Operador", randomOtp);
        return NextResponse.json({
          success: true,
          message: "Novo token OTP gerado com sucesso.",
          otp: { code: record.code, expiresAt: record.expiresAt, expiresInMinutes: 5 },
        });
      }

      // 4. ATUALIZAÇÃO DE PLANO
      case "update_plan": {
        const targetPlan = body.plan || "free";
        const targetStatus = body.planStatus || body.status || "active";
        const expiresAt = body.planExpiresAt || null;

        if (cleanEmail) {
          saveServerUser({
            email: cleanEmail,
            plan: targetPlan,
            planStatus: targetStatus,
            planExpiresAt: expiresAt,
          });
        }

        const record = await setServerUserPlan(
          targetUserId || cleanEmail,
          cleanEmail,
          targetPlan,
          targetStatus,
          expiresAt,
          "admin",
          targetPlan === "free" ? "free" : "admin"
        );

        return NextResponse.json({
          success: true,
          message: `Plano '${targetPlan.toUpperCase()}' atualizado com sucesso.`,
          planRecord: record,
        });
      }

      // 5. ATUALIZAÇÃO DE PERFIL
      case "update_profile": {
        const { name, nickname, phone, phoneCountryCode, timezone } = body;
        const cleanName = (name || "").trim();
        const cleanNickname = (nickname || "").trim() || (cleanName ? cleanName.split(" ")[0] : "");
        const cleanPhone = (phone || "").trim();
        const cleanCode = (phoneCountryCode || "+55").trim();

        if (cleanEmail) {
          saveServerUser({
            email: cleanEmail,
            name: cleanName,
            nickname: cleanNickname,
            phone: cleanPhone,
            phoneCountryCode: cleanCode,
            timezone,
          });
        }

        if (targetUserId) {
          try {
            await supabaseAdmin.auth.admin.updateUserById(targetUserId, {
              user_metadata: {
                name: cleanName,
                nickname: cleanNickname,
                phone: cleanPhone,
                phoneCountryCode: cleanCode,
                timezone,
              },
            });
          } catch {}
        }

        return NextResponse.json({
          success: true,
          message: "Dados do operador atualizados com sucesso.",
        });
      }

      default:
        return NextResponse.json({ success: false, error: "Ação não reconhecida." }, { status: 400 });
    }
  } catch (err: any) {
    return NextResponse.json(
      { success: false, error: err?.message || "Erro ao processar ação administrativa." },
      { status: 500 }
    );
  }
}
