import { NextRequest, NextResponse } from "next/server";
import { supabase, supabaseAdmin } from "@/lib/supabase";
import { setServerOtp } from "@/lib/serverOtpStore";
import { dispatchVerificationEmail, dispatchPasswordResetEmail } from "@/lib/mailer";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { email, name, type = "verification" } = body;

    if (!email || !email.includes("@")) {
      return NextResponse.json(
        { success: false, error: "Por favor, forneça um endereço de e-mail válido." },
        { status: 400 }
      );
    }

    const cleanEmail = email.trim().toLowerCase();
    const isPasswordReset = type === "password_reset";

    // Se for recuperação de senha, verifica primeiro se o usuário existe no Supabase
    let matchedUser: any = null;
    try {
      const { data: userList } = await supabaseAdmin.auth.admin.listUsers();
      matchedUser = userList?.users?.find((u) => u.email?.toLowerCase() === cleanEmail);
    } catch (e: any) {
      console.warn(`[Send Verification] Erro ao listar usuários no Supabase: ${e?.message}`);
    }

    if (isPasswordReset && !matchedUser) {
      return NextResponse.json(
        {
          success: false,
          error: "Nenhuma conta localizada com este e-mail. Verifique o endereço digitado ou cadastre-se.",
        },
        { status: 404 }
      );
    }

    // Busca o nome cadastrado na conta do usuário (tabela profiles ou auth.user_metadata)
    let resolvedName = (name || "").trim();

    if (!resolvedName && matchedUser?.id) {
      try {
        const { data: profile } = await supabaseAdmin
          .from("profiles")
          .select("name, nickname")
          .eq("id", matchedUser.id)
          .single();
        if (profile) {
          const profName = (profile.name || profile.nickname || "").trim();
          if (profName && profName.toLowerCase() !== cleanEmail.toLowerCase() && profName.toLowerCase() !== cleanEmail.split("@")[0].toLowerCase()) {
            resolvedName = profName;
          }
        }
      } catch (err) {
        console.warn("[Send Verification] Erro ao buscar profile:", err);
      }
    }

    if (!resolvedName && matchedUser?.user_metadata) {
      const metaName = (
        matchedUser.user_metadata.full_name ||
        matchedUser.user_metadata.name ||
        matchedUser.user_metadata.nickname ||
        ""
      ).trim();
      if (metaName && metaName.toLowerCase() !== cleanEmail.toLowerCase() && metaName.toLowerCase() !== cleanEmail.split("@")[0].toLowerCase()) {
        resolvedName = metaName;
      }
    }

    // Se ainda não encontrou ou é igual ao e-mail, garante um tratamento digno de operador
    if (!resolvedName || resolvedName.toLowerCase() === cleanEmail.split("@")[0].toLowerCase()) {
      if (cleanEmail === "wiaslan1999@gmail.com") {
        resolvedName = "Willian Araújo";
      } else {
        resolvedName = "Operador";
      }
    }

    // 1. Gera código OTP de 6 números no backend com expiração de 5 minutos
    const randomOtp = Math.floor(100000 + Math.random() * 900000).toString();
    const record = setServerOtp(cleanEmail, resolvedName, randomOtp);

    let emailSent = false;
    let emailProviderUsed = "resend";
    let emailError: string | null = null;

    // 2. Disparo Oficial (Password Reset ou Confirmação de Cadastro)
    const origin = req.headers.get("origin") || req.nextUrl.origin || undefined;

    try {
      if (isPasswordReset) {
        const resetRes = await dispatchPasswordResetEmail({
          to: cleanEmail,
          name: resolvedName,
          code: record.code,
          origin,
        });

        if (resetRes.success) {
          emailSent = true;
          emailProviderUsed = resetRes.provider;
        } else {
          emailError = resetRes.error || null;
        }
      } else {
        const verifyRes = await dispatchVerificationEmail({
          to: cleanEmail,
          name: resolvedName,
          code: record.code,
          origin,
        });

        if (verifyRes.success) {
          emailSent = true;
          emailProviderUsed = verifyRes.provider;
        } else {
          emailError = verifyRes.error || null;
        }
      }
    } catch (e: any) {
      console.warn(`[Send Verification] Erro no dispatch email: ${e?.message}`);
      emailError = e?.message;
    }

    // 3. Fallback adicional via Supabase APENAS para verificação de cadastro (NUNCA para reset de senha)
    if (!emailSent && !isPasswordReset) {
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

    // 4. Salva o OTP e expiração no metadata do usuário no Supabase se existir
    if (matchedUser) {
      try {
        await supabaseAdmin.auth.admin.updateUserById(matchedUser.id, {
          user_metadata: {
            ...matchedUser.user_metadata,
            email_otp: record.code,
            email_otp_expires_at: record.expiresAt,
            last_otp_type: type,
          },
        });
      } catch (e: any) {
        console.warn(`[Supabase Admin Metadata] Aviso: ${e?.message}`);
      }
    }

    if (!emailSent) {
      return NextResponse.json(
        {
          success: false,
          error:
            emailError ||
            (isPasswordReset
              ? "Não foi possível enviar o e-mail de recuperação de senha. Verifique as configurações de envio."
              : "Não foi possível enviar o e-mail de confirmação. Por favor, tente novamente em alguns instantes."),
        },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: isPasswordReset
        ? `Código de recuperação de 6 dígitos enviado com sucesso para ${cleanEmail}! Verifique sua caixa de entrada no Gmail.`
        : `E-mail de confirmação enviado com sucesso via ${emailProviderUsed.toUpperCase()}! Verifique sua caixa de entrada no Gmail.`,
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
