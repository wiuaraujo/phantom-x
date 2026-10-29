import { NextRequest, NextResponse } from "next/server";
import { supabase, supabaseAdmin } from "@/lib/supabase";

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

    // Validação estrita do token OTP no Supabase Auth
    const { data, error } = await supabase.auth.verifyOtp({
      email: cleanEmail,
      token: cleanCode,
      type: "email",
    });

    if (error) {
      console.warn(`[Phantom-X Auth] Falha ao verificar OTP para ${cleanEmail}: ${error.message}`);
      return NextResponse.json(
        {
          success: false,
          error:
            "Código de verificação incorreto ou expirado. Por favor, verifique os 6 números recebidos no seu e-mail do Gmail.",
        },
        { status: 400 }
      );
    }

    // Se validado com sucesso, confirma o e-mail no perfil do Supabase
    try {
      if (data?.user?.id) {
        await supabaseAdmin.auth.admin.updateUserById(data.user.id, {
          email_confirm: true,
          user_metadata: {
            email_verified: true,
            verified_at: new Date().toISOString(),
          },
        });
      }
    } catch (e: any) {
      console.warn(`[Phantom-X Auth] Aviso ao atualizar metadata no Supabase: ${e?.message}`);
    }

    return NextResponse.json({
      success: true,
      message: "Código verificado com sucesso via Supabase Auth.",
      data,
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error?.message || "Erro interno ao validar o código." },
      { status: 500 }
    );
  }
}
