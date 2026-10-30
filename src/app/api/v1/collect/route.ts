import { NextRequest, NextResponse } from "next/server";
import { store } from "@/lib/store";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    const domain = body.domain || "checkout.phantom-x.pro";
    const targetUrl = body.targetUrl || "https://meusite.com/oferta";
    const campaignId = body.campaignId;
    const referrer = body.referrer || req.headers.get("referer") || "Direto";
    const userAgent = body.userAgent || req.headers.get("user-agent") || "Mozilla/5.0";
    const ip = req.headers.get("x-forwarded-for") || req.headers.get("cf-connecting-ip") || "177.18.99.12";

    const event = store.ingestEvent({
      domain,
      targetUrl,
      campaignId,
      referrer,
      userAgent,
      ip,
      utmParams: body.utmParams,
    });

    return NextResponse.json({
      success: true,
      clickId: event.clickId || event.id,
      routedTo: event.routedTo,
      decision: event.decision || "routed_offer",
      classification: event.classification || "human-like",
      riskScore: event.riskScore,
      riskCategory: event.riskCategory,
      webglRenderer: event.webglRenderer,
      isHeadless: event.isHeadless,
      threatReasons: event.threatReasons || [],
      latencyMs: event.latencyMs,
    });
  } catch {
    return NextResponse.json(
      { success: false, error: "Falha ao processar requisição de cloaker." },
      { status: 400 }
    );
  }
}

// Support GET for direct tracking link redirects
export async function GET(req: NextRequest) {
  const url = new URL(req.url);
  const campaignId = url.searchParams.get("c") || undefined;
  const targetUrl = url.searchParams.get("dest") || "https://meusite.com/oferta";
  const domain = url.host || "trk.phantom-x.pro";
  const referrer = req.headers.get("referer") || "Direto";
  const userAgent = req.headers.get("user-agent") || "Mozilla/5.0";
  const ip = req.headers.get("x-forwarded-for") || req.headers.get("cf-connecting-ip") || "177.18.99.12";

  const utmParams: Record<string, string> = {};
  ["utm_source", "utm_medium", "utm_campaign", "utm_content", "utm_term", "gclid", "fbclid"].forEach((k) => {
    const v = url.searchParams.get(k);
    if (v) utmParams[k] = v;
  });

  const event = store.ingestEvent({
    domain,
    targetUrl,
    campaignId,
    referrer,
    userAgent,
    ip,
    utmParams,
  });

  // Fast 302 Edge Redirect
  return NextResponse.redirect(event.routedTo, 302);
}
