import { NextRequest, NextResponse } from "next/server";
import { store } from "@/lib/store";
import { CloakerEngine } from "@/lib/cloakerEngine";
import { PlanId } from "@/lib/plans";
import { getServerUserPlan } from "@/lib/serverPlanStore";

async function resolveUserPlan(req: NextRequest): Promise<PlanId> {
  const { searchParams } = new URL(req.url);
  const planParam = searchParams.get("plan") as PlanId | null;
  const planHeader = req.headers.get("x-user-plan") as PlanId | null;
  const cookie = req.cookies.get("phantom_token")?.value;
  let identifier: string | undefined = undefined;
  if (cookie) {
    try {
      const decoded = JSON.parse(Buffer.from(cookie, "base64").toString("utf-8"));
      identifier = decoded.id || decoded.email;
    } catch {}
  }

  const record = await getServerUserPlan(identifier);
  if (record.planStatus === "canceled" || record.planStatus === "expired") {
    return "free";
  }
  return planParam || planHeader || record.plan || "free";
}

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const download = searchParams.get("download") === "1";

  const config = store.getPhantomCloakerConfig();
  const userPlan = await resolveUserPlan(req);
  const scriptContent = CloakerEngine.generateCloudflareWorkerCode(config, userPlan);

  const headers = new Headers();
  headers.set("Content-Type", "application/javascript; charset=utf-8");
  if (download) {
    headers.set("Content-Disposition", 'attachment; filename="cloudflare-worker.js"');
  }

  return new NextResponse(scriptContent, {
    status: 200,
    headers,
  });
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const updated = store.updatePhantomCloakerConfig(body);
    const userPlan = await resolveUserPlan(req);
    const scriptContent = CloakerEngine.generateCloudflareWorkerCode(updated, userPlan);
    return NextResponse.json({
      success: true,
      config: updated,
      script: scriptContent,
    });
  } catch (err: any) {
    return NextResponse.json(
      { success: false, error: err.message || "Erro ao atualizar configuração do Worker." },
      { status: 400 }
    );
  }
}
