import Stripe from "stripe";
import { PlanId } from "./plans";

// Instância do Stripe Server-Side
export const stripe = process.env.STRIPE_SECRET_KEY
  ? new Stripe(process.env.STRIPE_SECRET_KEY, {
      apiVersion: "2025-02-24.acacia" as any,
      appInfo: {
        name: "Phantom-X Cloaker Platform",
        version: "1.0.0",
      },
    })
  : null;

const STARTER_PRICE = {
  unitAmount: 14900, // R$ 149,00
  name: "Phantom-X Starter",
  description: "Plano Starter — 10.000 cliques/mês, 3 domínios, 3 camuflagens, Brasil (1)",
  priceEnvVar: process.env.STRIPE_PRICE_STARTER,
};

const GROWTH_PRICE = {
  unitAmount: 38900, // R$ 389,00
  name: "Phantom-X Growth",
  description: "Plano Growth — 100.000 cliques/mês, 12 domínios, 12 camuflagens, Latam (20 países)",
  priceEnvVar: process.env.STRIPE_PRICE_GROWTH,
};

const SCALE_PRICE = {
  unitAmount: 52900, // R$ 529,00
  name: "Phantom-X Scale",
  description: "Plano Scale — Cliques Ilimitados, 60 domínios, 60 camuflagens, 247 Países Globais, Kill-Switch",
  priceEnvVar: process.env.STRIPE_PRICE_SCALE,
};

export const STRIPE_PRICES: Record<
  Exclude<PlanId, "free">,
  {
    unitAmount: number; // Em centavos de BRL (ex: 14900 = R$ 149,00)
    name: string;
    description: string;
    priceEnvVar?: string;
  }
> = {
  starter: STARTER_PRICE,
  growth: GROWTH_PRICE,
  scale: SCALE_PRICE,
  pro: GROWTH_PRICE,
  global: SCALE_PRICE,
};

export interface CreateCheckoutParams {
  planId: Exclude<PlanId, "free">;
  userId?: string;
  userEmail?: string;
  userName?: string;
  successUrl?: string;
  cancelUrl?: string;
}

/**
 * Cria uma Sessão Oficial do Stripe Checkout para Assinatura Recorrente Mensal
 */
export async function createStripeCheckoutSession(params: CreateCheckoutParams) {
  const { planId, userId, userEmail, userName, successUrl, cancelUrl } = params;
  const planConfig = STRIPE_PRICES[planId];
  if (!planConfig) {
    throw new Error(`Plano inválido para checkout Stripe: ${planId}`);
  }

  const appUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
  const defaultSuccess = `${appUrl}/dashboard?session_id={CHECKOUT_SESSION_ID}&plan=${planId}&upgraded=1`;
  const defaultCancel = `${appUrl}/dashboard?canceled=1`;

  // Se a chave secreta da Stripe estiver configurada
  if (
    stripe &&
    process.env.STRIPE_SECRET_KEY &&
    (process.env.STRIPE_SECRET_KEY.startsWith("sk_") || process.env.STRIPE_SECRET_KEY.startsWith("rk_"))
  ) {
    let customerId: string | undefined;

    if (userEmail && userEmail.trim().length > 0) {
      try {
        const existingCustomers = await stripe.customers.list({
          email: userEmail.trim().toLowerCase(),
          limit: 1,
        });

        if (existingCustomers.data.length > 0) {
          customerId = existingCustomers.data[0].id;
        } else {
          const newCustomer = await stripe.customers.create({
            email: userEmail.trim().toLowerCase(),
            name: userName || userEmail.split("@")[0],
            metadata: userId ? { userId } : {},
          });
          customerId = newCustomer.id;
        }
      } catch (err) {
        console.warn("[Stripe] Falha ao sincronizar Customer:", err);
      }
    }

    let lineItems: Stripe.Checkout.SessionCreateParams.LineItem[];

    if (planConfig.priceEnvVar) {
      lineItems = [{ price: planConfig.priceEnvVar, quantity: 1 }];
    } else {
      lineItems = [
        {
          price_data: {
            currency: "brl",
            product_data: {
              name: planConfig.name,
              description: planConfig.description,
              metadata: { planId },
            },
            unit_amount: planConfig.unitAmount,
            recurring: { interval: "month" },
          },
          quantity: 1,
        },
      ];
    }

    const sessionMeta: Record<string, string> = { planId };
    if (userId) sessionMeta.userId = userId;
    if (userEmail) sessionMeta.userEmail = userEmail;

    const session = await stripe.checkout.sessions.create({
      customer: customerId,
      customer_email: customerId ? undefined : (userEmail || undefined),
      mode: "subscription",
      line_items: lineItems,
      subscription_data: {
        metadata: sessionMeta,
      },
      metadata: sessionMeta,
      allow_promotion_codes: true,
      billing_address_collection: "auto",
      success_url:
        successUrl ||
        (userId
          ? defaultSuccess
          : `${appUrl}/signup?session_id={CHECKOUT_SESSION_ID}&plan=${planId}&paid=1`),
      cancel_url: cancelUrl || (userId ? defaultCancel : `${appUrl}/#pricing`),
    });

    return {
      success: true,
      url: session.url,
      sessionId: session.id,
      simulated: false,
    };
  }

  // Modo Sandbox Integrado (Sem chaves da Stripe configuradas)
  return {
    success: true,
    url: `${defaultSuccess}&simulated_stripe=1`,
    sessionId: `sim_stripe_${Date.now().toString(36)}`,
    simulated: true,
    notice:
      "Stripe em modo de demonstração ativa. Para pagamentos reais, configure STRIPE_SECRET_KEY no .env.local.",
  };
}

/**
 * Cria Sessão do Portal de Faturamento do Cliente na Stripe (Customer Portal)
 */
export async function createCustomerPortalSession(params: {
  customerId?: string;
  userEmail?: string;
  returnUrl?: string;
}) {
  const { customerId, userEmail, returnUrl } = params;
  const appUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
  const defaultReturn = `${appUrl}/dashboard/settings?tab=billing`;

  if (
    stripe &&
    process.env.STRIPE_SECRET_KEY &&
    (process.env.STRIPE_SECRET_KEY.startsWith("sk_") || process.env.STRIPE_SECRET_KEY.startsWith("rk_"))
  ) {
    let targetCustomerId = customerId;

    if (!targetCustomerId && userEmail) {
      const customers = await stripe.customers.list({ email: userEmail, limit: 1 });
      if (customers.data.length > 0) {
        targetCustomerId = customers.data[0].id;
      }
    }

    if (!targetCustomerId) {
      throw new Error("Cliente Stripe ainda não possui assinatura registrada.");
    }

    const portal = await stripe.billingPortal.sessions.create({
      customer: targetCustomerId,
      return_url: returnUrl || defaultReturn,
    });

    return { success: true, url: portal.url };
  }

  return {
    success: true,
    url: `${defaultReturn}&notice=portal_sandbox`,
    simulated: true,
  };
}
