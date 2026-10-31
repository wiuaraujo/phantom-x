import { NextRequest, NextResponse } from "next/server";
import { CreativeCamouflageEngine } from "@/lib/creativeCamouflageEngine";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => ({}));
    const { copy, headline, niche, platform } = body;

    if (!copy || typeof copy !== "string" || copy.trim().length === 0) {
      return NextResponse.json(
        { success: false, error: "Por favor, informe o texto do criativo ou da oferta para camuflar." },
        { status: 400 }
      );
    }

    const result = CreativeCamouflageEngine.processCamouflage({
      copy,
      headline,
      niche,
      platform,
    });

    return NextResponse.json(result);
  } catch (error: any) {
    console.error("[Creative Camouflage API Error]:", error);
    return NextResponse.json(
      { success: false, error: "Falha ao processar camuflagem de anúncio." },
      { status: 500 }
    );
  }
}
