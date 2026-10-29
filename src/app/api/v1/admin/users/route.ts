import { NextRequest, NextResponse } from "next/server";
import { supabase, supabaseAdmin } from "@/lib/supabase";
import { getServerOtp, setServerOtp } from "@/lib/serverOtpStore";
import { setServerUserPlan, getServerUserPlanSync } from "@/lib/serverPlanStore";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  try {
    // 1. Busca lista de usuários do Supabase Auth
    const { data: userListData, error: uErr } = await supabaseAdmin.auth.admin.listUsers();
    if (uErr) {
      return NextResponse.json({ success: false, error: uErr.message }, { status: 500 });
    }

    // 2. Busca perfis da tabela profiles
    let profilesMap = new Map<string, any>();
    try {
      const { data: profiles } = await supabase.from("profiles").select("*");
      if (profiles) {
        profiles.forEach((p) => profilesMap.set(p.id, p));
        profiles.forEach((p) => {
          if (p.email) profilesMap.set(p.email.toLowerCase(), p);
        });
      }
    } catch {}

    // 3. Monta lista unificada de operadores com status de OTP
    const users = (userListData?.users || []).map((u) => {
      const email = u.email?.toLowerCase() || "";
      const profile = profilesMap.get(u.id) || profilesMap.get(email);
      const activeOtpRecord = getServerOtp(email);

      const isEmailVerified =
        Boolean(u.email_confirmed_at) ||
        u.user_metadata?.email_verified === true ||
        profile?.email_verified === true;

      return {
        id: u.id,
        email: u.email || "",
        name: profile?.name || u.user_metadata?.name || email.split("@")[0],
        nickname: profile?.nickname || u.user_metadata?.nickname || profile?.name?.split(" ")[0] || "Operador",
        phone: profile?.phone || u.user_metadata?.phone || u.phone || "—",
        phoneCountryCode: profile?.phone_country_code || u.user_metadata?.phoneCountryCode || "+55",
        role: profile?.role || u.user_metadata?.role || "operator",
        timezone: profile?.timezone || u.user_metadata?.timezone || "America/Sao_Paulo",
        emailVerified: isEmailVerified,
        emailConfirmedAt: u.email_confirmed_at || u.user_metadata?.verified_at || null,
        plan:
          getServerUserPlanSync(u.id)?.plan ||
          (email ? getServerUserPlanSync(email)?.plan : null) ||
          profile?.plan ||
          u.user_metadata?.plan ||
          "free",
        planStatus:
          getServerUserPlanSync(u.id)?.planStatus ||
          (email ? getServerUserPlanSync(email)?.planStatus : null) ||
          profile?.plan_status ||
          u.user_metadata?.plan_status ||
          "trial",
        planActivatedAt:
          getServerUserPlanSync(u.id)?.planActivatedAt ||
          profile?.plan_activated_at ||
          u.user_metadata?.plan_activated_at ||
          u.created_at,
        planExpiresAt:
          getServerUserPlanSync(u.id)?.planExpiresAt ||
          profile?.plan_expires_at ||
          u.user_metadata?.plan_expires_at ||
          null,
        createdAt: u.created_at,
        lastSignInAt: u.last_sign_in_at || null,
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

    return NextResponse.json({
      success: true,
      count: users.length,
      users,
    });
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

    let targetUserId = userId;

    // Se passou apenas e-mail, descobre o userId
    if (!targetUserId && email) {
      const { data: userList } = await supabaseAdmin.auth.admin.listUsers();
      const match = userList?.users?.find((u) => u.email?.toLowerCase() === email.toLowerCase());
      if (match) targetUserId = match.id;
    }

    switch (action) {
      // 1. CONFIRMA O E-MAIL DO OPERADOR MANUALMENTE (Aprovação com 1 clique)
      case "verify_email": {
        if (!targetUserId) {
          return NextResponse.json({ success: false, error: "Usuário não localizado." }, { status: 404 });
        }

        const { data: updated, error: vErr } = await supabaseAdmin.auth.admin.updateUserById(targetUserId, {
          email_confirm: true,
          user_metadata: {
            email_verified: true,
            manually_verified_by_admin: true,
            verified_at: new Date().toISOString(),
          },
        });

        if (vErr) {
          return NextResponse.json({ success: false, error: vErr.message }, { status: 500 });
        }

        // Atualiza na tabela profiles se existir
        try {
          await supabase.from("profiles").update({ updated_at: new Date().toISOString() }).eq("id", targetUserId);
        } catch {}

        return NextResponse.json({
          success: true,
          message: "Conta e e-mail do operador confirmados manualmente com sucesso!",
          user: updated.user,
        });
      }

      // 2. DESCONFIRMA O E-MAIL DO OPERADOR
      case "unverify_email": {
        if (!targetUserId) {
          return NextResponse.json({ success: false, error: "Usuário não localizado." }, { status: 404 });
        }

        const { error: uvErr } = await supabaseAdmin.auth.admin.updateUserById(targetUserId, {
          user_metadata: {
            email_verified: false,
            verified_at: null,
          },
        });

        if (uvErr) {
          return NextResponse.json({ success: false, error: uvErr.message }, { status: 500 });
        }

        return NextResponse.json({
          success: true,
          message: "Confirmação de e-mail do operador revogada.",
        });
      }

      // 3. ALTERA O CARGO DO OPERADOR (admin ou operator)
      case "change_role": {
        if (!targetUserId) {
          return NextResponse.json({ success: false, error: "Usuário não localizado." }, { status: 404 });
        }

        const newRole = role === "admin" ? "admin" : "operator";

        await supabaseAdmin.auth.admin.updateUserById(targetUserId, {
          user_metadata: { role: newRole },
        });

        try {
          await supabase.from("profiles").update({ role: newRole }).eq("id", targetUserId);
        } catch {}

        return NextResponse.json({
          success: true,
          message: `Cargo do operador alterado para '${newRole}'.`,
        });
      }

      // 4. GERA UM TOKEN OTP DE 6 DÍGITOS PARA O OPERADOR DIRETAMENTE PELO PAINEL
      case "generate_otp": {
        const cleanEmail = email?.trim().toLowerCase();
        if (!cleanEmail) {
          return NextResponse.json({ success: false, error: "E-mail é obrigatório para gerar token." }, { status: 400 });
        }

        const randomOtp = Math.floor(100000 + Math.random() * 900000).toString();
        const record = setServerOtp(cleanEmail, "Operador", randomOtp);

        return NextResponse.json({
          success: true,
          message: "Novo token OTP gerado com sucesso para este operador.",
          otp: {
            code: record.code,
            expiresAt: record.expiresAt,
            expiresInMinutes: 5,
          },
        });
      }

      // 5. EXCLUI O USUÁRIO DO SISTEMA
      case "delete": {
        if (!targetUserId) {
          return NextResponse.json({ success: false, error: "Usuário não localizado." }, { status: 404 });
        }

        const { error: dErr } = await supabaseAdmin.auth.admin.deleteUser(targetUserId);
        if (dErr) {
          return NextResponse.json({ success: false, error: dErr.message }, { status: 500 });
        }

        try {
          await supabase.from("profiles").delete().eq("id", targetUserId);
        } catch {}

        return NextResponse.json({
          success: true,
          message: "Usuário excluído permanentemente do cluster.",
        });
      }

      // 6. LIBERAÇÃO OU ALTERAÇÃO DE PLANO DE ASSINATURA PELO MASTER ADMIN
      case "update_plan": {
        if (!targetUserId) {
          return NextResponse.json({ success: false, error: "Usuário não localizado." }, { status: 404 });
        }

        const targetPlan = body.plan || "free";
        const targetStatus = body.planStatus || body.status || "active";
        const expiresAt = body.planExpiresAt || null;

        // Atualiza 100% no backend (Memória + Supabase Auth + Profiles)
        const record = await setServerUserPlan(
          targetUserId,
          email || body.email || "",
          targetPlan,
          targetStatus,
          expiresAt,
          "admin_master"
        );

        return NextResponse.json({
          success: true,
          message:
            targetStatus === "canceled"
              ? `Plano suspenso com sucesso. Acesso e limites do operador retornados para Free Trial.`
              : `Plano '${targetPlan.toUpperCase()}' ativado com sucesso para o operador com 100% de efeito no backend!`,
          planRecord: record,
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
