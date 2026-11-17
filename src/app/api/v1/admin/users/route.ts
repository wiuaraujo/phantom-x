import { NextRequest, NextResponse } from "next/server";
import { supabase, supabaseAdmin } from "@/lib/supabase";
import { getServerOtp, setServerOtp, clearServerOtp } from "@/lib/serverOtpStore";
import { setServerUserPlan, getServerUserPlanSync, removeServerUserPlan } from "@/lib/serverPlanStore";
import { getAllServerUsers, findServerUser, saveServerUser, deleteServerUser, isUserDeleted } from "@/lib/serverUserStore";
import { formatPhoneNumber } from "@/lib/countryCodes";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export async function GET(req: NextRequest) {
  try {
    const usersMap = new Map<string, any>();

    // 1. Busca perfis na tabela profiles do Supabase (onde estão os dados reais de telefone e nome)
    let profilesMap = new Map<string, any>();
    try {
      const { data: profiles } = await supabaseAdmin.from("profiles").select("*");
      if (profiles) {
        profiles.forEach((p) => {
          if (p.id) profilesMap.set(p.id, p);
          if (p.email) profilesMap.set(p.email.toLowerCase(), p);
        });
      }
    } catch {}

    // 2. Busca todos os usuários do cofre resiliente do servidor
    const localUsers = getAllServerUsers();

    // Popula o mapa inicial com o cofre do servidor
    localUsers.forEach((u) => {
      if (isUserDeleted(u.id) || isUserDeleted(u.email)) return;

      const prof = profilesMap.get(u.id) || profilesMap.get(u.email.toLowerCase());
      const rawPhone = prof?.phone || u.phone || "";
      const countryCode = prof?.phone_country_code || u.phoneCountryCode || "+55";
      const cleanPhone = rawPhone ? formatPhoneNumber(rawPhone, countryCode) : "";

      const userEntry = {
        id: u.id,
        email: u.email,
        name: prof?.name || u.name,
        nickname: prof?.nickname || u.nickname,
        phone: cleanPhone,
        phoneCountryCode: countryCode,
        role: prof?.role || u.role,
        timezone: prof?.timezone || u.timezone,
        emailVerified: u.emailVerified,
        emailConfirmedAt: u.emailConfirmedAt,
        plan: prof?.plan || u.plan,
        planStatus: prof?.plan_status || u.planStatus,
        planSource: "admin",
        isPaid: u.plan !== "free" && u.planStatus === "active",
        grantedBy: "admin",
        stripeSubscriptionId: null,
        planActivatedAt: u.planActivatedAt,
        planExpiresAt: u.planExpiresAt || null,
        createdAt: u.createdAt,
        lastSignInAt: u.updatedAt || null,
        activeOtp: null,
      };

      usersMap.set(u.id, userEntry);
      usersMap.set(u.email.toLowerCase(), userEntry);
    });

    // 3. Tenta enriquecer com dados do Supabase Auth (se online)
    try {
      const { data: userListData, error: uErr } = await supabaseAdmin.auth.admin.listUsers();
      if (!uErr && userListData?.users) {
        userListData.users.forEach((u) => {
          const email = u.email?.toLowerCase() || "";
          if (isUserDeleted(u.id) || isUserDeleted(email)) return;

          const meta = u.user_metadata || {};
          const prof = profilesMap.get(u.id) || (email ? profilesMap.get(email) : null);
          const existing = usersMap.get(u.id) || (email ? usersMap.get(email) : null);

          const isVerified =
            Boolean(u.email_confirmed_at) ||
            meta.email_verified === true ||
            existing?.emailVerified === true;

          const currentPlan = meta.plan || prof?.plan || existing?.plan || "free";
          const currentPlanStatus = meta.plan_status || prof?.plan_status || existing?.planStatus || "trial";

          const rawPhone = prof?.phone || meta.phone || meta.phoneRaw || u.phone || existing?.phone || "";
          const countryCode = prof?.phone_country_code || meta.phoneCountryCode || existing?.phoneCountryCode || "+55";
          const cleanPhone = rawPhone ? formatPhoneNumber(rawPhone, countryCode) : "";

          const merged = {
            id: u.id,
            email: email,
            name: prof?.name || meta.name || existing?.name || email.split("@")[0],
            nickname: prof?.nickname || meta.nickname || existing?.nickname || (prof?.name ? prof.name.split(" ")[0] : "Operador"),
            phone: cleanPhone,
            phoneCountryCode: countryCode,
            role: prof?.role || meta.role || existing?.role || "operator",
            timezone: prof?.timezone || meta.timezone || existing?.timezone || "America/Sao_Paulo",
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

    // 4. Adiciona status de OTP ativo e planos sincronizados, filtrando excluídos
    const uniqueUsers = Array.from(new Set(usersMap.values())).filter(
      (u) => !isUserDeleted(u.id) && !isUserDeleted(u.email)
    );

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
      // 1. EXCLUI O USUÁRIO PERMANENTEMENTE (NUNCA MAIS VOLTA)
      case "delete": {
        // A. Remove do cofre do servidor com tombstone permanente
        if (targetUserId) deleteServerUser(targetUserId);
        if (cleanEmail) deleteServerUser(cleanEmail);

        // B. Remove de planos e OTP em memória
        if (targetUserId) removeServerUserPlan(targetUserId);
        if (cleanEmail) {
          removeServerUserPlan(cleanEmail);
          clearServerOtp(cleanEmail);
        }

        // C. Remove do Supabase Auth e da tabela profiles
        if (targetUserId && targetUserId.includes("-")) {
          try {
            await supabaseAdmin.auth.admin.deleteUser(targetUserId);
          } catch {}
          try {
            await supabaseAdmin.from("profiles").delete().eq("id", targetUserId);
          } catch {}
        }

        if (cleanEmail) {
          try {
            await supabaseAdmin.from("profiles").delete().eq("email", cleanEmail);
          } catch {}
        }

        return NextResponse.json({
          success: true,
          message: "Operador excluído permanentemente do cluster e da base de dados.",
        });
      }

      // 2. CONFIRMA O E-MAIL DO OPERADOR
      case "verify_email": {
        if (cleanEmail) {
          saveServerUser({
            email: cleanEmail,
            emailVerified: true,
            emailConfirmedAt: new Date().toISOString(),
          });
        }
        if (targetUserId && targetUserId.includes("-")) {
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

      // 3. ALTERA O CARGO DO OPERADOR
      case "change_role": {
        const newRole = role === "admin" ? "admin" : "operator";
        if (cleanEmail) {
          saveServerUser({ email: cleanEmail, role: newRole });
        }
        if (targetUserId && targetUserId.includes("-")) {
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

      // 4. GERA TOKEN OTP NO PAINEL ADMIN
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

      // 5. ATUALIZAÇÃO DE PLANO
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

      // 6. ATUALIZAÇÃO DE PERFIL
      case "update_profile": {
        const { name, nickname, phone, phoneCountryCode, timezone } = body;
        const cleanName = (name || "").trim();
        const cleanNickname = (nickname || "").trim() || (cleanName ? cleanName.split(" ")[0] : "");
        const cleanPhone = (phone || "").trim();
        const cleanCode = (phoneCountryCode || "+55").trim();
        const formatted = cleanPhone ? formatPhoneNumber(cleanPhone, cleanCode) : "";

        if (cleanEmail) {
          saveServerUser({
            email: cleanEmail,
            name: cleanName,
            nickname: cleanNickname,
            phone: formatted,
            phoneCountryCode: cleanCode,
            timezone,
          });
        }

        if (targetUserId && targetUserId.includes("-")) {
          try {
            await supabaseAdmin.auth.admin.updateUserById(targetUserId, {
              user_metadata: {
                name: cleanName,
                nickname: cleanNickname,
                phone: formatted,
                phoneRaw: cleanPhone,
                phoneCountryCode: cleanCode,
                timezone,
              },
            });
          } catch {}
        }

        try {
          await supabaseAdmin.from("profiles").upsert({
            id: targetUserId,
            email: cleanEmail,
            name: cleanName,
            nickname: cleanNickname,
            phone: formatted || null,
            phone_country_code: cleanCode,
            timezone,
            updated_at: new Date().toISOString(),
          });
        } catch {}

        return NextResponse.json({
          success: true,
          message: "Dados do operador (nome, apelido, telefone) atualizados com sucesso.",
          user: {
            id: targetUserId,
            name: cleanName,
            nickname: cleanNickname,
            phone: formatted,
            phoneCountryCode: cleanCode,
          },
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
