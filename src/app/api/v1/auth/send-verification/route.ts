import { NextRequest, NextResponse } from "next/server";
import { supabase, supabaseAdmin } from "@/lib/supabase";
import { setServerOtp } from "@/lib/serverOtpStore";
import { dispatchVerificationEmail } from "@/lib/mailer";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { email, name } = body;

    if (!email || !email.includes("@")) {
      return NextResponse.json(
        { success: false, error: "Por favor, forneça um endereço de e-mail válido." },
        { status: 400 }
      );
    }

    const cleanEmail = email.trim().toLowerCase();
    const cleanName = (name || "Operador").trim();

    // 1. Gera código OTP de 6 números no backend com expiração de 5 minutos
    const randomOtp = Math.floor(100000 + Math.random() * 900000).toString();
    const record = setServerOtp(cleanEmail, cleanName, randomOtp);

    let emailSent = false;
    let emailProviderUsed = "resend";
    let emailError: string | null = null;

    // 2. Disparo Oficial via Resend (com fallback automático: API REST Nativa + Resend SMTP Relay)
    const origin = req.headers.get("origin") || req.nextUrl.origin || undefined;

    try {
      const emailRes = await dispatchVerificationEmail({
        to: cleanEmail,
        name: cleanName,
        code: record.code,
        origin,
      });

      if (emailRes.success) {
        emailSent = true;
        emailProviderUsed = emailRes.provider;
      } else {
        emailError = emailRes.error || null;
      }
    } catch (e: any) {
      console.warn(`[Send Verification] Erro no dispatchVerificationEmail: ${e?.message}`);
      emailError = e?.message;
    }

    // 3. Fallback adicional de contingência via Supabase Auth caso o Resend tenha falhado
    if (!emailSent) {
      try {
        const { error: sbErr } = await supabase.auth.signInWithOtp({
          email: cleanEmail,
          options: {
            shouldCreateUser: true,
          },
        });

        if (!sbErr) {
          emailSent = true;
          emailProviderUsed = "supabase";
        }
      } catch (e: any) {
        console.warn(`[Supabase Auth Fallback] Exceção: ${e?.message}`);
      }
    }

    // 4. Atualiza metadata no Supabase se o usuário já existir
    try {
      const { data: userList } = await supabaseAdmin.auth.admin.listUsers();
      const existing = userList?.users?.find((u) => u.email?.toLowerCase() === cleanEmail);
      if (existing) {
        await supabaseAdmin.auth.admin.updateUserById(existing.id, {
          user_metadata: {
            ...existing.user_metadata,
            email_otp: record.code,
            email_otp_expires_at: record.expiresAt,
          },
        });
      }
    } catch (e: any) {
      console.warn(`[Supabase Admin Metadata] Aviso: ${e?.message}`);
    }

    if (!emailSent) {
      return NextResponse.json(
        {
          success: false,
          error:
            emailError ||
            "Não foi possível enviar o e-mail de confirmação. Por favor, tente novamente em alguns instantes.",
        },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: `E-mail de confirmação enviado com sucesso via ${emailProviderUsed.toUpperCase()}! Verifique sua caixa de entrada no Gmail.`,
      provider: emailProviderUsed,
      expiresAt: record.expiresAt,
    });
  } catch (error: any) {
    console.error("[Send Verification] Erro inesperado:", error);
    return NextResponse.json(
      { success: false, error: error?.message || "Erro interno ao processar envio de verificação." },
      { status: 500 }
    );
  }
}
