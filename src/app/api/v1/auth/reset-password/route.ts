import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase";
import { verifyServerOtp } from "@/lib/serverOtpStore";
import { validatePasswordSecurity } from "@/lib/passwordValidator";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  try {
    const { email, code, newPassword } = await req.json();
    const cleanEmail = (email || "").trim().toLowerCase();
    const cleanCode = (code || "").replace(/\D/g, "").trim();

    if (!cleanEmail || !cleanCode || !newPassword) {
      return NextResponse.json(
        { success: false, error: "E-mail, código de verificação e nova senha são obrigatórios." },
        { status: 400 }
      );
    }

    // 1. Valida o código OTP
    const otpResult = verifyServerOtp(cleanEmail, cleanCode);
    if (!otpResult.success) {
      return NextResponse.json(
        { success: false, error: otpResult.error || "Código de verificação incorreto ou expirado." },
        { status: 400 }
      );
    }

    // 2. Valida os requisitos de segurança da nova senha
    const pwdValidation = validatePasswordSecurity(newPassword);
    if (!pwdValidation.isValid) {
      return NextResponse.json(
        {
          success: false,
          error: pwdValidation.errors[0] || "A senha não atende aos requisitos de segurança do sistema.",
        },
        { status: 400 }
      );
    }

    // 3. Localiza o usuário no Supabase Auth
    const { data: userList } = await supabaseAdmin.auth.admin.listUsers();
    const existing = userList?.users?.find((u) => u.email?.toLowerCase() === cleanEmail);

    if (!existing) {
      return NextResponse.json(
        { success: false, error: "Usuário não localizado no sistema." },
        { status: 404 }
      );
    }

    // 4. Atualiza a senha no Supabase Auth
    await supabaseAdmin.auth.admin.updateUserById(existing.id, {
      password: newPassword,
      email_confirm: true,
      user_metadata: {
        ...existing.user_metadata,
        email_verified: true,
        password_updated_at: new Date().toISOString(),
      },
    });

    return NextResponse.json({
      success: true,
      message: "Senha atualizada com sucesso! Você já pode fazer login com suas novas credenciais.",
    });
  } catch (err: any) {
    console.error("[Reset Password API] Erro:", err);
    return NextResponse.json(
      { success: false, error: err?.message || "Erro interno ao redefinir senha." },
      { status: 500 }
    );
  }
}
