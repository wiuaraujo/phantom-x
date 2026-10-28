import { NextRequest, NextResponse } from "next/server";
import { store } from "@/lib/store";
import { CloakerEngine } from "@/lib/cloakerEngine";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  const config = store.getCloakilioConfig();
  const scriptContent = CloakerEngine.generateClientFingerprintSnippet(config);

  // Extract pure JS code without <script> tags for standalone .js serving
  const jsOnly = scriptContent
    .replace(/^<!--.*?-->\s*/m, "")
    .replace(/^<script>\s*/m, "")
    .replace(/<\/script>\s*$/m, "");

  return new NextResponse(jsOnly, {
    status: 200,
    headers: {
      "Content-Type": "application/javascript; charset=utf-8",
      "Cache-Control": "public, max-age=3600, stale-while-revalidate=86400",
      "Access-Control-Allow-Origin": "*",
    },
  });
}
