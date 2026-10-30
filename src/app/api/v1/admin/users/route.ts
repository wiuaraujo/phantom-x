import { NextRequest, NextResponse } from "next/server";
import { supabase, supabaseAdmin } from "@/lib/supabase";
import { getServerOtp, setServerOtp, clearServerOtp } from "@/lib/serverOtpStore";
import { setServerUserPlan, getServerUserPlanSync, removeServerUserPlan } from "@/lib/serverPlanStore";

export const dynamic = "force-dynamic";
export const revalidate = 0;

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

    // 3. Monta lista unificada de operadores com status de OTP, plano e fonte do plano
    const users = (userListData?.users || []).map((u) => {
      const email = u.email?.toLowerCase() || "";
      const profile = profilesMap.get(u.id) || profilesMap.get(email);
      const activeOtpRecord = getServerOtp(email);

      const isEmailVerified =
        Boolean(u.email_confirmed_at) ||
        u.user_metadata?.email_verified === true ||
        profile?.email_verified === true;

      const cachedPlan = getServerUserPlanSync(u.id) || (email ? getServerUserPlanSync(email) : null);
      const currentPlan =
        cachedPlan?.plan ||
        profile?.plan ||
        u.user_metadata?.plan ||
        "free";

      const currentPlanStatus =
        cachedPlan?.planStatus ||
        profile?.plan_status ||
        u.user_metadata?.plan_status ||
        "trial";

      // Fonte da assinatura: "stripe" (paga real), "admin" (liberada por admin / cortesia) ou "free"
      const planSource: "stripe" | "admin" | "free" =
        cachedPlan?.planSource ||
        profile?.plan_source ||
        u.user_metadata?.plan_source ||
        (u.user_metadata?.stripe_subscription_id ? "stripe" : (cachedPlan?.updatedBy === "admin" || u.user_metadata?.granted_by === "admin") ? "admin" : "free");

      const isPaid =
        currentPlan !== "free" &&
        currentPlanStatus === "active" &&
        (planSource === "stripe" || Boolean(u.user_metadata?.stripe_subscription_id));

      const grantedBy =
        cachedPlan?.updatedBy ||
        profile?.granted_by ||
        u.user_metadata?.granted_by ||
        (planSource === "admin" ? "admin" : "system");

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
        plan: currentPlan,
        planStatus: currentPlanStatus,
        planSource,
        isPaid,
        grantedBy,
        stripeSubscriptionId: u.user_metadata?.stripe_subscription_id || null,
        planActivatedAt:
          cachedPlan?.planActivatedAt ||
          profile?.plan_activated_at ||
          u.user_metadata?.plan_activated_at ||
          u.created_at,
        planExpiresAt:
          cachedPlan?.planExpiresAt ||
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

    return NextResponse.json(
      {
        success: true,
        count: users.length,
        users,
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

    let targetUserId = userId;
    const cleanEmail = email ? email.trim().toLowerCase() : "";

    // Se passou apenas e-mail ou se o targetUserId não é UUID válido, descobre o userId no Supabase Auth
    if (!targetUserId || !targetUserId.includes("-")) {
      const { data: userList } = await supabaseAdmin.auth.admin.listUsers();
      const match = userList?.users?.find(
        (u) =>
          (cleanEmail && u.email?.toLowerCase() === cleanEmail) ||
          (targetUserId && u.id === targetUserId)
      );
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

        return NextResponse.json(
          {
            success: true,
            message: "Conta e e-mail do operador confirmados manualmente com sucesso!",
            user: updated.user,
          },
          {
            headers: {
              "Cache-Control": "no-store, no-cache, must-revalidate, proxy-revalidate, max-age=0",
            },
          }
        );
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

        return NextResponse.json(
          {
            success: true,
            message: "Confirmação de e-mail do operador revogada.",
          },
          {
            headers: {
              "Cache-Control": "no-store, no-cache, must-revalidate, proxy-revalidate, max-age=0",
            },
          }
        );
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

        return NextResponse.json(
          {
            success: true,
            message: `Cargo do operador alterado para '${newRole}'.`,
          },
          {
            headers: {
              "Cache-Control": "no-store, no-cache, must-revalidate, proxy-revalidate, max-age=0",
            },
          }
        );
      }

      // 4. GERA UM TOKEN OTP DE 6 DÍGITOS PARA O OPERADOR DIRETAMENTE PELO PAINEL
      case "generate_otp": {
        if (!cleanEmail) {
          return NextResponse.json({ success: false, error: "E-mail é obrigatório para gerar token." }, { status: 400 });
        }

        const randomOtp = Math.floor(100000 + Math.random() * 900000).toString();
        const record = setServerOtp(cleanEmail, "Operador", randomOtp);

        return NextResponse.json(
          {
            success: true,
            message: "Novo token OTP gerado com sucesso para este operador.",
            otp: {
              code: record.code,
              expiresAt: record.expiresAt,
              expiresInMinutes: 5,
            },
          },
          {
            headers: {
              "Cache-Control": "no-store, no-cache, must-revalidate, proxy-revalidate, max-age=0",
            },
          }
        );
      }

      // 5. EXCLUI O USUÁRIO DO SISTEMA (100% LIMPO EM TODAS AS CAMADAS)
      case "delete": {
        let deletedSuccessfully = false;

        if (targetUserId) {
          try {
            const { error: dErr } = await supabaseAdmin.auth.admin.deleteUser(targetUserId);
            if (!dErr) deletedSuccessfully = true;
          } catch (e) {
            console.warn("[Admin deleteUser] Aviso Supabase Auth:", e);
          }

          try {
            await supabase.from("profiles").delete().eq("id", targetUserId);
          } catch {}

          removeServerUserPlan(targetUserId);
        }

        if (cleanEmail) {
          try {
            await supabase.from("profiles").delete().eq("email", cleanEmail);
          } catch {}

          clearServerOtp(cleanEmail);
          removeServerUserPlan(cleanEmail);
        }

        if (userId && userId !== targetUserId) {
          removeServerUserPlan(userId);
        }

        return NextResponse.json(
          {
            success: true,
            message: "Usuário excluído permanentemente do cluster e da base de dados.",
          },
          {
            headers: {
              "Cache-Control": "no-store, no-cache, must-revalidate, proxy-revalidate, max-age=0",
            },
          }
        );
      }

      // 6. LIBERAÇÃO OU ALTERAÇÃO DE PLANO DE ASSINATURA PELO MASTER ADMIN
      case "update_plan": {
        if (!targetUserId && !cleanEmail) {
          return NextResponse.json({ success: false, error: "Identificador do usuário não localizado." }, { status: 404 });
        }

        const targetPlan = body.plan || "free";
        const targetStatus = body.planStatus || body.status || "active";
        const expiresAt = body.planExpiresAt || null;

        // Atualiza 100% no backend marcado como LIBERADO POR ADMIN (Cortesia - Não contabiliza no MRR)
        const record = await setServerUserPlan(
          targetUserId || cleanEmail,
          cleanEmail || body.email || "",
          targetPlan,
          targetStatus,
          expiresAt,
          "admin",
          targetPlan === "free" ? "free" : "admin"
        );

        return NextResponse.json(
          {
            success: true,
            message:
              targetStatus === "canceled"
                ? `Plano suspenso com sucesso. Operador retornado para o Plano Trial gratuito.`
                : `Plano '${targetPlan.toUpperCase()}' liberado com sucesso pelo Administrador (Plano cortesia/não-faturável no MRR).`,
            planRecord: record,
          },
          {
            headers: {
              "Cache-Control": "no-store, no-cache, must-revalidate, proxy-revalidate, max-age=0",
            },
          }
        );
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
