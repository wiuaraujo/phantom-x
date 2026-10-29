import { NextRequest, NextResponse } from "next/server";
import { supabase, supabaseAdmin } from "@/lib/supabase";
import { verifyServerOtp, getServerOtp } from "@/lib/serverOtpStore";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { email, code } = body;

    if (!email || !code) {
      return NextResponse.json(
        { success: false, error: "E-mail e código de verificação são obrigatórios." },
        { status: 400 }
      );
    }

    const cleanEmail = email.trim().toLowerCase();
    const cleanCode = code.replace(/\D/g, "").trim();

    if (cleanCode.length !== 6) {
      return NextResponse.json(
        { success: false, error: "O código de verificação deve conter exatamente 6 números." },
        { status: 400 }
      );
    }

    let isVerified = false;
    let failureReason = "Código de verificação incorreto ou expirado. Verifique os números recebidos na sua caixa de entrada do Gmail.";

    // 1. Testa contra o token armazenado no servidor backend (expiração estrita de 5 min)
    const serverResult = verifyServerOtp(cleanEmail, cleanCode);
    if (serverResult.success) {
      isVerified = true;
    } else if (serverResult.error) {
      failureReason = serverResult.error;
    }

    // 2. Se não bateu no servidor, testa também contra o Supabase Auth OTP (para códigos disparados pelo mailer nativo do Supabase)
    if (!isVerified) {
      try {
        const { data: sbData, error: sbError } = await supabase.auth.verifyOtp({
          email: cleanEmail,
          token: cleanCode,
          type: "email",
        });

        if (!sbError && sbData?.user) {
          isVerified = true;
        }
      } catch (e: any) {
        console.warn(`[Verify Code] Supabase verifyOtp exceção: ${e?.message}`);
      }
    }

    // 3. Se nenhuma das duas autoridades validou o código: FALHA ESTRITA!
    if (!isVerified) {
      return NextResponse.json(
        {
          success: false,
          error:
            "Código de verificação incorreto ou expirado. Por favor, verifique os 6 números recebidos no seu e-mail do Gmail.",
        },
        { status: 400 }
      );
    }

    // 4. Sucesso: atualiza perfil no Supabase Auth como confirmado
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
      console.warn(`[Verify Code] Aviso ao atualizar Supabase metadata: ${e?.message}`);
    }

    return NextResponse.json({
      success: true,
      message: "Código verificado e conta confirmada com sucesso!",
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error?.message || "Erro interno ao validar código." },
      { status: 500 }
    );
  }
}
