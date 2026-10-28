import { NextRequest, NextResponse } from "next/server";
import { store } from "@/lib/store";
import { CloakerEngine } from "@/lib/cloakerEngine";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const download = searchParams.get("download") === "1";

  const config = store.getPhantomCloakerConfig();
  const scriptContent = CloakerEngine.generateCloudflareWorkerCode(config);

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
    const scriptContent = CloakerEngine.generateCloudflareWorkerCode(updated);
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
