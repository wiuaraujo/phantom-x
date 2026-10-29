import { NextRequest, NextResponse } from "next/server";
import { createStripeCheckoutSession } from "@/lib/stripe";
import { PlanId } from "@/lib/plans";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { planId, userId, userEmail, userName, successUrl, cancelUrl } = body;

    if (!planId || planId === "free") {
      return NextResponse.json(
        { success: false, error: "Plano comercial inválido selecionado para checkout." },
        { status: 400 }
      );
    }

    // Detecta usuário autenticado pelos cookies, se houver
    const cookieToken = req.cookies.get("phantom_token")?.value;
    let loggedUserId: string | undefined = userId;
    let loggedUserEmail: string | undefined = userEmail;

    if (!loggedUserId && cookieToken) {
      try {
        const decoded = JSON.parse(Buffer.from(cookieToken, "base64").toString("utf-8"));
        loggedUserId = decoded.id;
        loggedUserEmail = loggedUserEmail || decoded.email;
      } catch {
        // Ignora formato inválido
      }
    }

    const checkout = await createStripeCheckoutSession({
      planId: planId as Exclude<PlanId, "free">,
      userId: loggedUserId,
      userEmail: loggedUserEmail,
      userName: userName || (loggedUserEmail ? loggedUserEmail.split("@")[0] : undefined),
      successUrl,
      cancelUrl,
    });

    return NextResponse.json(checkout);
  } catch (err: any) {
    return NextResponse.json(
      { success: false, error: err.message || "Erro ao gerar checkout na Stripe." },
      { status: 500 }
    );
  }
}
