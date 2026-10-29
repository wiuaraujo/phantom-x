import { NextRequest, NextResponse } from "next/server";
import { stripe } from "@/lib/stripe";
import { supabaseAdmin, supabase } from "@/lib/supabase";

export const dynamic = "force-dynamic";

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
        console.error("[Stripe Webhook] Erro de assinatura:", err.message);
        return NextResponse.json(
          { error: `Webhook Signature Error: ${err.message}` },
          { status: 400 }
        );
      }
    } else {
      // Processamento sem validação estrita de assinatura (útil em testes locais / dev)
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
      // 1. Assinatura Concluída com Sucesso no Checkout
      case "checkout.session.completed": {
        const session = dataObject;
        const userId = session.metadata?.userId;
        const planId = session.metadata?.planId;
        const customerId = session.customer as string;
        const subscriptionId = session.subscription as string;
        const customerEmail = session.customer_details?.email || session.customer_email;

        if (planId) {
          // Atualiza usuário no Supabase se userId ou customerEmail estiver disponível
          if (userId && !userId.startsWith("usr_sim_")) {
            try {
              await supabaseAdmin.auth.admin.updateUserById(userId, {
                user_metadata: {
                  plan: planId,
                  plan_status: "active",
                  plan_activated_at: new Date().toISOString(),
                  stripe_customer_id: customerId,
                  stripe_subscription_id: subscriptionId,
                },
              });

              await supabase.from("profiles").update({
                plan: planId,
                plan_status: "active",
                updated_at: new Date().toISOString(),
              }).eq("id", userId);
            } catch (err) {
              console.warn("[Stripe Webhook] Falha ao atualizar perfil no Supabase:", err);
            }
          } else if (customerEmail) {
            try {
              const { data: userList } = await supabaseAdmin.auth.admin.listUsers();
              const match = userList?.users?.find(
                (u) => u.email?.toLowerCase() === customerEmail.toLowerCase()
              );
              if (match) {
                await supabaseAdmin.auth.admin.updateUserById(match.id, {
                  user_metadata: {
                    plan: planId,
                    plan_status: "active",
                    plan_activated_at: new Date().toISOString(),
                    stripe_customer_id: customerId,
                    stripe_subscription_id: subscriptionId,
                  },
                });
              }
            } catch {}
          }
        }
        break;
      }

      // 2. Atualização de Status da Assinatura
      case "customer.subscription.updated": {
        const subscription = dataObject;
        const status = subscription.status; // 'active', 'past_due', 'canceled', 'unpaid'
        const planId = subscription.metadata?.planId;
        const userId = subscription.metadata?.userId;

        let normalizedStatus: "active" | "trial" | "expired" | "canceled" = "active";
        if (status === "canceled" || status === "unpaid") {
          normalizedStatus = "canceled";
        } else if (status === "past_due") {
          normalizedStatus = "expired";
        }

        if (userId && !userId.startsWith("usr_sim_")) {
          try {
            await supabaseAdmin.auth.admin.updateUserById(userId, {
              user_metadata: {
                ...(planId ? { plan: planId } : {}),
                plan_status: normalizedStatus,
              },
            });
          } catch {}
        }
        break;
      }

      // 3. Assinatura Cancelada
      case "customer.subscription.deleted": {
        const subscription = dataObject;
        const userId = subscription.metadata?.userId;

        if (userId && !userId.startsWith("usr_sim_")) {
          try {
            await supabaseAdmin.auth.admin.updateUserById(userId, {
              user_metadata: {
                plan: "free",
                plan_status: "canceled",
              },
            });
          } catch {}
        }
        break;
      }

      // 4. Pagamento de Fatura Bem-Sucedido
      case "invoice.payment_succeeded": {
        const invoice = dataObject;
        const customerId = invoice.customer as string;
        console.log(`[Stripe Webhook] Fatura paga para customer: ${customerId}`);
        break;
      }

      // 5. Pagamento de Fatura Falhou
      case "invoice.payment_failed": {
        const invoice = dataObject;
        const customerId = invoice.customer as string;
        console.warn(`[Stripe Webhook] Falha no pagamento da fatura para customer: ${customerId}`);
        break;
      }

      default:
        console.log(`[Stripe Webhook] Evento não processado: ${eventType}`);
    }

    return NextResponse.json({ received: true });
  } catch (err: any) {
    console.error("[Stripe Webhook] Erro geral:", err);
    return NextResponse.json(
      { error: err.message || "Erro no processamento do webhook." },
      { status: 500 }
    );
  }
}
