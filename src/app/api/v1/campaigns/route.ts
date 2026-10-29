import { NextRequest, NextResponse } from "next/server";
import { store } from "@/lib/store";
import { checkCampaignLimit, PlanId } from "@/lib/plans";
import { getServerUserPlan } from "@/lib/serverPlanStore";

export async function GET() {
  const campaigns = store.getCampaigns();
  return NextResponse.json({ success: true, campaigns });
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    if (!body.name || !body.targetUrl) {
      return NextResponse.json(
        { success: false, error: "Nome e URL de destino são obrigatórios." },
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

    const currentCampaigns = store.getCampaigns();
    const limitCheck = checkCampaignLimit(currentCampaigns.length, userPlan);
    if (!limitCheck.allowed) {
      return NextResponse.json(
        { success: false, error: limitCheck.reason, limitReached: true, activePlan: userPlan },
        { status: 403 }
      );
    }

    const created = store.createCampaign(body);
    return NextResponse.json({ success: true, campaign: created });
  } catch (err: any) {
    return NextResponse.json(
      { success: false, error: err.message || "Erro ao criar campanha." },
      { status: 400 }
    );
  }
}

export async function PUT(req: NextRequest) {
  try {
    const { id, ...data } = await req.json();
    const updated = store.updateCampaign(id, data);
    if (!updated) {
      return NextResponse.json(
        { success: false, error: "Campanha não encontrada." },
        { status: 404 }
      );
    }
    return NextResponse.json({ success: true, campaign: updated });
  } catch {
    return NextResponse.json(
      { success: false, error: "Erro ao atualizar campanha." },
      { status: 500 }
    );
  }
}

export async function DELETE(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const id = searchParams.get("id");
  if (!id) {
    return NextResponse.json(
      { success: false, error: "ID da campanha não informado." },
      { status: 400 }
    );
  }
  const deleted = store.deleteCampaign(id);
  return NextResponse.json({ success: deleted });
}
