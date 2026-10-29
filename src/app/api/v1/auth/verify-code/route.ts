import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

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
        { success: false, error: "O código deve conter exatamente 6 números." },
        { status: 400 }
      );
    }

    // Tenta validar o OTP no Supabase Auth (caso o usuário tenha recebido via e-mail real do Supabase)
    const { data, error } = await supabase.auth.verifyOtp({
      email: cleanEmail,
      token: cleanCode,
      type: "email",
    });

    if (error) {
      return NextResponse.json({
        success: false,
        error: error.message || "Código inválido ou expirado.",
      });
    }

    return NextResponse.json({
      success: true,
      message: "Código verificado com sucesso via Supabase Auth.",
      data,
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error?.message || "Erro ao verificar código." },
      { status: 500 }
    );
  }
}
