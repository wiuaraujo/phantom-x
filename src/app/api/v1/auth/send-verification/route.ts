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

    // 1. Gera código de 6 números no backend com expiração de 5 minutos
    const randomOtp = Math.floor(100000 + Math.random() * 900000).toString();
    const record = setServerOtp(cleanEmail, cleanName, randomOtp);

    let emailSentViaSmtp = false;
    let supabaseDispatched = false;
    let errorMessage: string | null = null;

    // 2. Disparo direto via SMTP / Resend se configurado
    try {
      const smtpRes = await dispatchVerificationEmail({
        to: cleanEmail,
        name: cleanName,
        code: record.code,
      });
      if (smtpRes.success) {
        emailSentViaSmtp = true;
      }
    } catch (e: any) {
      console.warn(`[Send Verification] Erro no SMTP: ${e?.message}`);
    }

    // 3. Disparo via Supabase Auth OTP (para entregar na caixa de entrada do Gmail)
    try {
      const { error: sbErr } = await supabase.auth.signInWithOtp({
        email: cleanEmail,
        options: {
          shouldCreateUser: true,
        },
      });

      if (!sbErr) {
        supabaseDispatched = true;
      } else {
        errorMessage = sbErr.message;
        console.warn(`[Supabase Auth Mailer] Erro ao enviar OTP para ${cleanEmail}: ${sbErr.message}`);
      }
    } catch (e: any) {
      errorMessage = e?.message || "Falha de rede ao conectar com Supabase Auth.";
      console.warn(`[Supabase Auth Mailer] Exceção para ${cleanEmail}: ${e?.message}`);
    }

    // 4. Atualiza metadata no Supabase se usuário já existir
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

    // Se nenhum canal de e-mail conseguiu disparar e houve erro de rate limit do Supabase
    if (!emailSentViaSmtp && !supabaseDispatched) {
      if (errorMessage && errorMessage.includes("60 seconds")) {
        return NextResponse.json(
          {
            success: false,
            error:
              "Um código de verificação já foi enviado recentemente. Por favor, aguarde 60 segundos antes de solicitar um novo token.",
          },
          { status: 429 }
        );
      }

      if (errorMessage && errorMessage.includes("rate limit")) {
        return NextResponse.json(
          {
            success: false,
            error:
              "Limite de envios de e-mail atingido temporariamente. Por favor, aguarde alguns minutos ou verifique a sua caixa de entrada e Spam do Gmail.",
          },
          { status: 429 }
        );
      }

      return NextResponse.json(
        {
          success: false,
          error:
            errorMessage ||
            "Não foi possível enviar o e-mail de verificação no momento. Verifique sua conexão e tente novamente.",
        },
        { status: 500 }
      );
    }

    console.log(
      `[Phantom-X Mailer] Token gerado para ${cleanEmail} (Expira em 5 min | SMTP: ${emailSentViaSmtp} | Supabase: ${supabaseDispatched})`
    );

    // Retorna APENAS confirmação e timestamp de expiração (NUNCA O TOKEN!)
    return NextResponse.json({
      success: true,
      message: "Token de verificação enviado para o seu e-mail com sucesso.",
      expiresAt: record.expiresAt,
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error?.message || "Erro interno ao gerar token de verificação." },
      { status: 500 }
    );
  }
}
