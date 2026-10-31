import { NextRequest, NextResponse } from "next/server";
import { stripe } from "@/lib/stripe";
import { supabaseAdmin, supabase } from "@/lib/supabase";
import { setServerUserPlan } from "@/lib/serverPlanStore";
import { PlanId } from "@/lib/plans";

export const dynamic = "force-dynamic";

/**
 * Localiza o operador no Supabase de forma resiliente por:
 * 1. userId direto
 * 2. stripe_customer_id na tabela profiles ou auth metadata
 * 3. e-mail do cliente
 */
async function resolvePlatformUser(params: {
  userId?: string | null;
  customerId?: string | null;
  customerEmail?: string | null;
}): Promise<{ id: string; email: string; userMetadata: any } | null> {
  const { userId, customerId, customerEmail } = params;

  // 1. Tenta pelo userId direto
  if (userId && !userId.startsWith("usr_sim_") && !userId.startsWith("sim_")) {
    try {
      const { data } = await supabaseAdmin.auth.admin.getUserById(userId);
      if (data?.user) {
        return {
          id: data.user.id,
          email: data.user.email || customerEmail || "",
          userMetadata: data.user.user_metadata || {},
        };
      }
    } catch {}
  }

  // 2. Tenta pela tabela profiles pelo stripe_customer_id
  if (customerId) {
    try {
      const { data: profile } = await supabaseAdmin
        .from("profiles")
        .select("id, email")
        .eq("stripe_customer_id", customerId)
        .maybeSingle();

      if (profile && profile.id) {
        const { data: uData } = await supabaseAdmin.auth.admin.getUserById(profile.id);
        return {
          id: profile.id,
          email: profile.email || customerEmail || "",
          userMetadata: uData?.user?.user_metadata || {},
        };
      }
    } catch {}
  }

  // 3. Tenta por e-mail ou metadata stripe_customer_id na lista geral
  const cleanEmail = customerEmail ? customerEmail.trim().toLowerCase() : "";
  if (cleanEmail || customerId) {
    try {
      const { data: userList } = await supabaseAdmin.auth.admin.listUsers();
      if (userList?.users) {
        const match = userList.users.find(
          (u) =>
            (cleanEmail && u.email?.toLowerCase() === cleanEmail) ||
            (customerId && u.user_metadata?.stripe_customer_id === customerId)
        );
        if (match) {
          return {
            id: match.id,
            email: match.email || cleanEmail,
            userMetadata: match.user_metadata || {},
          };
        }
      }
    } catch {}
  }

  return null;
}

export async function POST(req: NextRequest) {
  try {
    const bodyText = await req.text();
    const sig = req.headers.get("stripe-signature");
    const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

    let event: any;

    if (stripe && webhookSecret && sig) {
      try {
        event = stripe.webhooks.constructEvent(bodyText, sig, webhookSecret);
      } catch (err: any) {
        console.error("[Stripe Webhook] Erro de validação da assinatura:", err.message);
        return NextResponse.json(
          { error: `Webhook Signature Error: ${err.message}` },
          { status: 400 }
        );
      }
    } else {
      // Processamento de contingência para ambiente local ou sem secret explícito
      try {
        event = JSON.parse(bodyText);
      } catch {
        return NextResponse.json({ error: "Payload JSON inválido" }, { status: 400 });
      }
    }

    const eventType = event.type;
    const dataObject = event.data?.object;

    console.log(`[Stripe Webhook] Evento recebido: ${eventType}`);

    switch (eventType) {
      // =====================================================================
      // 1. CHECKOUT CONCLUÍDO (PAGAMENTO INICIAL DO ASSINANTE CONFIRMADO)
      // =====================================================================
      case "checkout.session.completed": {
        const session = dataObject;
        const userId = session.metadata?.userId;
        const planId = (session.metadata?.planId as PlanId) || "growth";
        const customerId = session.customer as string;
        const subscriptionId = session.subscription as string;
        const customerEmail = session.customer_details?.email || session.customer_email;

        const targetUser = await resolvePlatformUser({
          userId,
          customerId,
          customerEmail,
        });

        if (targetUser && planId && planId !== "free") {
          // Determina a data de expiração (fim do período de 30 dias)
          let expiresAt: string | null = null;
          if (stripe && subscriptionId) {
            try {
              const sub: any = await stripe.subscriptions.retrieve(subscriptionId);
              if (sub && sub.current_period_end) {
                expiresAt = new Date(sub.current_period_end * 1000).toISOString();
              }
              // Anexa metadados na assinatura da Stripe para rastreamento futuro
              await stripe.subscriptions.update(subscriptionId, {
                metadata: {
                  userId: targetUser.id,
                  userEmail: targetUser.email,
                  planId,
                },
              });
            } catch (err) {
              console.warn("[Stripe Webhook] Não foi possível obter current_period_end da subscription:", err);
            }
          }

          if (!expiresAt) {
            // Fallback de 30 dias corridos
            expiresAt = new Date(Date.now() + 30 * 24 * 3600 * 1000).toISOString();
          }

          const now = new Date().toISOString();

          // A. Atualiza Auth Metadata do Supabase
          try {
            await supabaseAdmin.auth.admin.updateUserById(targetUser.id, {
              user_metadata: {
                ...targetUser.userMetadata,
                plan: planId,
                plan_status: "active",
                plan_activated_at: now,
                plan_expires_at: expiresAt,
                stripe_customer_id: customerId,
                stripe_subscription_id: subscriptionId,
                plan_source: "stripe",
                granted_by: "stripe",
                is_paid: true,
              },
            });
          } catch (e) {
            console.warn("[Stripe Webhook] Falha ao atualizar auth metadata:", e);
          }

          // B. Atualiza Tabela profiles
          try {
            await supabaseAdmin.from("profiles").upsert({
              id: targetUser.id,
              email: targetUser.email,
              plan: planId,
              plan_status: "active",
              plan_source: "stripe",
              granted_by: "stripe",
              is_paid: true,
              stripe_customer_id: customerId,
              stripe_subscription_id: subscriptionId,
              plan_activated_at: now,
              plan_expires_at: expiresAt,
              updated_at: now,
            });
          } catch (e) {
            console.warn("[Stripe Webhook] Falha ao atualizar tabela profiles:", e);
          }

          // C. Sincroniza Cache em Memória do Servidor
          await setServerUserPlan(
            targetUser.id,
            targetUser.email,
            planId,
            "active",
            expiresAt,
            "stripe",
            "stripe"
          );

          console.log(`[Stripe Webhook] Plano ${planId.toUpperCase()} ativado com sucesso para ${targetUser.email}`);
        }
        break;
      }

      // =====================================================================
      // 2. ATUALIZAÇÃO DA ASSINATURA (RENOVAÇÃO DE 30 DIAS OU MUDANÇA DE STATUS)
      // =====================================================================
      case "customer.subscription.updated": {
        const subscription = dataObject;
        const status = subscription.status; // 'active', 'past_due', 'unpaid', 'canceled', 'incomplete_expired'
        const customerId = subscription.customer as string;
        const subscriptionId = subscription.id;
        const planId = (subscription.metadata?.planId as PlanId) || undefined;
        const userId = subscription.metadata?.userId;

        const targetUser = await resolvePlatformUser({
          userId,
          customerId,
        });

        if (targetUser) {
          const now = new Date().toISOString();
          const currentPlan: PlanId =
            planId || (targetUser.userMetadata?.plan as PlanId) || "growth";

          let normalizedStatus: "active" | "trial" | "expired" | "canceled" = "active";
          let isPaid = true;
          let expiresAt: string | null = null;

          if (status === "active") {
            // Assinatura renovada ou ativa
            normalizedStatus = "active";
            isPaid = true;
            if (subscription.current_period_end) {
              expiresAt = new Date(subscription.current_period_end * 1000).toISOString();
            }
          } else if (status === "past_due" || status === "unpaid") {
            // Pagamento falhou após 30 dias — bloqueia benefícios
            normalizedStatus = "expired";
            isPaid = false;
          } else if (status === "canceled") {
            // Assinatura cancelada — revoga benefícios
            normalizedStatus = "canceled";
            isPaid = false;
          }

          const effectivePlan: PlanId = isPaid ? currentPlan : "free";

          try {
            await supabaseAdmin.auth.admin.updateUserById(targetUser.id, {
              user_metadata: {
                ...targetUser.userMetadata,
                plan: effectivePlan,
                plan_status: normalizedStatus,
                plan_expires_at: expiresAt,
                is_paid: isPaid,
                plan_source: isPaid ? "stripe" : "free",
              },
            });

            await supabaseAdmin.from("profiles").update({
              plan: effectivePlan,
              plan_status: normalizedStatus,
              plan_expires_at: expiresAt,
              is_paid: isPaid,
              plan_source: isPaid ? "stripe" : "free",
              updated_at: now,
            }).eq("id", targetUser.id);

            await setServerUserPlan(
              targetUser.id,
              targetUser.email,
              effectivePlan,
              normalizedStatus,
              expiresAt,
              "stripe",
              isPaid ? "stripe" : "free"
            );

            console.log(
              `[Stripe Webhook] Subscription atualizada: ${targetUser.email} -> Status: ${normalizedStatus}, Plano: ${effectivePlan}`
            );
          } catch (e) {
            console.warn("[Stripe Webhook] Falha ao atualizar status da subscription:", e);
          }
        }
        break;
      }

      // =====================================================================
      // 3. ASSINATURA CANCELADA / EXPIRADA (BLOQUEIO TOTAL DOS BENEFÍCIOS)
      // =====================================================================
      case "customer.subscription.deleted": {
        const subscription = dataObject;
        const customerId = subscription.customer as string;
        const userId = subscription.metadata?.userId;

        const targetUser = await resolvePlatformUser({
          userId,
          customerId,
        });

        if (targetUser) {
          const now = new Date().toISOString();

          try {
            // Rebaixa estritamente para free e bloqueia benefícios
            await supabaseAdmin.auth.admin.updateUserById(targetUser.id, {
              user_metadata: {
                ...targetUser.userMetadata,
                plan: "free",
                plan_status: "canceled",
                is_paid: false,
                plan_source: "free",
                plan_expires_at: null,
              },
            });

            await supabaseAdmin.from("profiles").update({
              plan: "free",
              plan_status: "canceled",
              is_paid: false,
              plan_source: "free",
              plan_expires_at: null,
              updated_at: now,
            }).eq("id", targetUser.id);

            await setServerUserPlan(
              targetUser.id,
              targetUser.email,
              "free",
              "canceled",
              null,
              "stripe",
              "free"
            );

            console.log(`[Stripe Webhook] Assinatura cancelada. Benefícios bloqueados para ${targetUser.email}`);
          } catch (e) {
            console.warn("[Stripe Webhook] Falha ao processar subscription.deleted:", e);
          }
        }
        break;
      }

      // =====================================================================
      // 4. PAGAMENTO DE FATURA BEM-SUCEDIDO (RENOVAÇÃO AUTOMÁTICA DE 30 DIAS)
      // =====================================================================
      case "invoice.payment_succeeded": {
        const invoice = dataObject;
        const customerId = invoice.customer as string;
        const customerEmail = invoice.customer_email;
        const subscriptionId = invoice.subscription as string;

        // Se for fatura vinculada a uma assinatura
        if (subscriptionId) {
          const targetUser = await resolvePlatformUser({
            customerId,
            customerEmail,
          });

          if (targetUser) {
            let expiresAt: string | null = null;
            let planId: PlanId = (targetUser.userMetadata?.plan as PlanId) || "growth";

            // Obtém período final da fatura (próxima data de renovação daqui a 30 dias)
            const periodEnd = invoice.lines?.data?.[0]?.period?.end;
            if (periodEnd) {
              expiresAt = new Date(periodEnd * 1000).toISOString();
            } else {
              expiresAt = new Date(Date.now() + 30 * 24 * 3600 * 1000).toISOString();
            }

            const now = new Date().toISOString();

            try {
              await supabaseAdmin.auth.admin.updateUserById(targetUser.id, {
                user_metadata: {
                  ...targetUser.userMetadata,
                  plan: planId,
                  plan_status: "active",
                  plan_expires_at: expiresAt,
                  is_paid: true,
                  plan_source: "stripe",
                },
              });

              await supabaseAdmin.from("profiles").update({
                plan: planId,
                plan_status: "active",
                plan_expires_at: expiresAt,
                is_paid: true,
                plan_source: "stripe",
                updated_at: now,
              }).eq("id", targetUser.id);

              await setServerUserPlan(
                targetUser.id,
                targetUser.email,
                planId,
                "active",
                expiresAt,
                "stripe",
                "stripe"
              );

              console.log(
                `[Stripe Webhook] Fatura de renovação paga com sucesso. Plano ${planId} prorrogado até ${expiresAt} para ${targetUser.email}`
              );
            } catch (e) {
              console.warn("[Stripe Webhook] Erro ao renovar assinatura via invoice.payment_succeeded:", e);
            }
          }
        }
        break;
      }

      // =====================================================================
      // 5. FALHA NO PAGAMENTO DA FATURA DE 30 DIAS (BLOQUEIO IMEDIATO)
      // =====================================================================
      case "invoice.payment_failed": {
        const invoice = dataObject;
        const customerId = invoice.customer as string;
        const customerEmail = invoice.customer_email;
        const subscriptionId = invoice.subscription as string;

        console.warn(`[Stripe Webhook] Pagamento de fatura falhou para customer: ${customerId} / ${customerEmail}`);

        if (subscriptionId) {
          const targetUser = await resolvePlatformUser({
            customerId,
            customerEmail,
          });

          if (targetUser) {
            const now = new Date().toISOString();

            try {
              // Marca status como expired e desativa benefícios pagos
              await supabaseAdmin.auth.admin.updateUserById(targetUser.id, {
                user_metadata: {
                  ...targetUser.userMetadata,
                  plan_status: "expired",
                  is_paid: false,
                },
              });

              await supabaseAdmin.from("profiles").update({
                plan_status: "expired",
                is_paid: false,
                updated_at: now,
              }).eq("id", targetUser.id);

              await setServerUserPlan(
                targetUser.id,
                targetUser.email,
                targetUser.userMetadata?.plan || "free",
                "expired",
                null,
                "stripe",
                "free"
              );

              console.log(
                `[Stripe Webhook] Benefícios suspensos devido a falha de pagamento para ${targetUser.email}`
              );
            } catch (e) {
              console.warn("[Stripe Webhook] Erro ao suspender benefícios por falha no pagamento:", e);
            }
          }
        }
        break;
      }

      default:
        console.log(`[Stripe Webhook] Evento não mapeado: ${eventType}`);
    }

    return NextResponse.json({ received: true });
  } catch (err: any) {
    console.error("[Stripe Webhook] Erro inesperado:", err);
    return NextResponse.json(
      { error: err.message || "Erro no processamento do webhook." },
      { status: 500 }
    );
  }
}
