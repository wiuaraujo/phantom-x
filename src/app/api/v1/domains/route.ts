import { NextRequest, NextResponse } from "next/server";
import { store } from "@/lib/store";
import { checkDomainLimit, PlanId } from "@/lib/plans";
import { getServerUserPlan } from "@/lib/serverPlanStore";

export async function GET() {
  const domains = store.getDomains();
  return NextResponse.json({ success: true, domains });
}

export async function POST(req: NextRequest) {
  try {
    const { name } = await req.json();
    if (!name) {
      return NextResponse.json(
        { success: false, error: "Nome do domínio é obrigatório." },
        { status: 400 }
      );
    }

    // Resolve o plano real do operador no backend
    const planHeader = req.headers.get("x-user-plan") as PlanId | null;
    const cookie = req.cookies.get("phantom_token")?.value;
    let identifier: string | undefined = undefined;
    if (cookie) {
      try {
        const decoded = JSON.parse(Buffer.from(cookie, "base64").toString("utf-8"));
        identifier = decoded.id || decoded.email;
      } catch {}
    }

    const planRecord = await getServerUserPlan(identifier);
    const userPlan: PlanId =
      planRecord.planStatus === "canceled" || planRecord.planStatus === "expired"
        ? "free"
        : planHeader || planRecord.plan || "free";

    const currentDomains = store.getDomains();
    const limitCheck = checkDomainLimit(currentDomains.length, userPlan);
    if (!limitCheck.allowed) {
      return NextResponse.json(
        { success: false, error: limitCheck.reason, limitReached: true, activePlan: userPlan },
        { status: 403 }
      );
    }

    const newDomain = store.addDomain(name);
    return NextResponse.json({ success: true, domain: newDomain });
  } catch (err: any) {
    return NextResponse.json(
      { success: false, error: err.message || "Erro ao registrar domínio." },
      { status: 400 }
    );
  }
}

export async function PUT(req: NextRequest) {
  try {
    const { id } = await req.json();
    const verified = store.verifyDomainDNS(id);
    if (!verified) {
      return NextResponse.json(
        { success: false, error: "Domínio não encontrado." },
        { status: 404 }
      );
    }
    return NextResponse.json({ success: true, domain: verified });
  } catch {
    return NextResponse.json(
      { success: false, error: "Erro ao verificar DNS." },
      { status: 500 }
    );
  }
}

export async function DELETE(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const id = searchParams.get("id");
  if (!id) {
    return NextResponse.json(
      { success: false, error: "ID do domínio não informado." },
      { status: 400 }
    );
  }
  const deleted = store.deleteDomain(id);
  return NextResponse.json({ success: deleted });
}
