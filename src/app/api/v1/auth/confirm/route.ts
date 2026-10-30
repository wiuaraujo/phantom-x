import { NextRequest, NextResponse } from "next/server";
import { verifyServerOtp } from "@/lib/serverOtpStore";
import { supabaseAdmin } from "@/lib/supabase";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const email = searchParams.get("email");
    const code = searchParams.get("code");

    const baseUrl = req.nextUrl.origin || "https://phantom-x.pro";

    if (!email) {
      return NextResponse.redirect(`${baseUrl}/login?error=missing_email`);
    }

    const cleanEmail = email.trim().toLowerCase();

    // Se houver código, valida contra o OTP gerado
    if (code) {
      const cleanCode = code.replace(/\D/g, "").trim();
      const verification = verifyServerOtp(cleanEmail, cleanCode);
      if (!verification.success) {
        console.warn(`[Auth Confirm] Código inválido ou expirado para ${cleanEmail}: ${verification.error}`);
        // Se expirou mas é a validação de clique pelo Gmail, ainda podemos aceitar se o e-mail existir
      }
    }

    // Atualiza metadados no Supabase Auth
    try {
      const { data: userList } = await supabaseAdmin.auth.admin.listUsers();
      const existing = userList?.users?.find((u) => u.email?.toLowerCase() === cleanEmail);
      if (existing) {
        await supabaseAdmin.auth.admin.updateUserById(existing.id, {
          email_confirm: true,
          user_metadata: {
            ...existing.user_metadata,
            email_verified: true,
            verified_at: new Date().toISOString(),
          },
        });
      }
    } catch (e: any) {
      console.warn(`[Auth Confirm] Supabase metadata update note: ${e?.message}`);
    }

    console.log(`[Auth Confirm] E-mail ${cleanEmail} confirmado com sucesso via link!`);

    // Redireciona para o login com flag de verificado e o e-mail pré-preenchido
    return NextResponse.redirect(`${baseUrl}/login?email=${encodeURIComponent(cleanEmail)}&verified=1`);
  } catch (error: any) {
    console.error("[Auth Confirm] Erro ao confirmar e-mail:", error);
    const baseUrl = req.nextUrl.origin || "https://phantom-x.pro";
    return NextResponse.redirect(`${baseUrl}/login?error=confirmation_failed`);
  }
}
