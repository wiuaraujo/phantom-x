import { NextRequest, NextResponse } from "next/server";
import { createCustomerPortalSession } from "@/lib/stripe";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { userEmail, customerId, returnUrl } = body;

    const origin = req.headers.get("origin") || req.nextUrl.origin || undefined;

    const portal = await createCustomerPortalSession({
      customerId,
      userEmail,
      returnUrl,
      origin,
    });

    return NextResponse.json(portal);
  } catch (err: any) {
    return NextResponse.json(
      { success: false, error: err.message || "Erro ao abrir portal da Stripe." },
      { status: 500 }
    );
  }
}
