import { NextRequest, NextResponse } from "next/server";
import { getServerUserPlan } from "@/lib/serverPlanStore";
import { PlanId } from "@/lib/plans";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = req.nextUrl;
    let userId = searchParams.get("userId");
    let email = searchParams.get("email");

    // Se não veio por query param, tenta decodificar do cookie
    if (!userId && !email) {
      const cookie = req.cookies.get("phantom_token")?.value;
      if (cookie) {
        try {
          const decoded = JSON.parse(Buffer.from(cookie, "base64").toString("utf-8"));
          userId = decoded.id;
          email = decoded.email;
        } catch {
          // Token aleatório
        }
      }
    }

    const record = await getServerUserPlan(userId || email);

    // Se o plano estiver cancelado ou expirado, normaliza o plano operacional para free
    const effectivePlan: PlanId =
      record.planStatus === "canceled" || record.planStatus === "expired"
        ? "free"
        : record.plan;

    return NextResponse.json({
      success: true,
      plan: effectivePlan,
      rawPlan: record.plan,
      planStatus: record.planStatus,
      planActivatedAt: record.planActivatedAt,
      planExpiresAt: record.planExpiresAt,
      isTrial: effectivePlan === "free" || record.planStatus === "trial",
      isActive: record.planStatus === "active",
      isPaid: record.isPaid,
      timestamp: new Date().toISOString(),
    });
  } catch (err: any) {
    return NextResponse.json(
      { success: false, error: err?.message || "Erro ao sincronizar plano do operador." },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => ({}));
    let userId = body.userId;
    let email = body.email;

    if (!userId && !email) {
      const cookie = req.cookies.get("phantom_token")?.value;
      if (cookie) {
        try {
          const decoded = JSON.parse(Buffer.from(cookie, "base64").toString("utf-8"));
          userId = decoded.id;
          email = decoded.email;
        } catch {}
      }
    }

    const record = await getServerUserPlan(userId || email);

    const effectivePlan: PlanId =
      record.planStatus === "canceled" || record.planStatus === "expired"
        ? "free"
        : record.plan;

    return NextResponse.json({
      success: true,
      plan: effectivePlan,
      rawPlan: record.plan,
      planStatus: record.planStatus,
      planActivatedAt: record.planActivatedAt,
      planExpiresAt: record.planExpiresAt,
      isTrial: effectivePlan === "free" || record.planStatus === "trial",
      isActive: record.planStatus === "active",
      isPaid: record.isPaid,
      timestamp: new Date().toISOString(),
    });
  } catch (err: any) {
    return NextResponse.json(
      { success: false, error: err?.message || "Erro ao sincronizar plano do operador." },
      { status: 500 }
    );
  }
}
