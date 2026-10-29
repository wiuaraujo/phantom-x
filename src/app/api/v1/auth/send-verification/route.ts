import { NextRequest, NextResponse } from "next/server";
import {
  createVerificationToken,
  renderVerificationEmailHtml,
  renderVerificationEmailText,
} from "@/lib/emailService";
import { supabase } from "@/lib/supabase";

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
    const record = createVerificationToken(cleanEmail, name || "Operador");
    const htmlEmail = renderVerificationEmailHtml(record.name, record.code);
    const textEmail = renderVerificationEmailText(record.name, record.code);

    let supabaseDispatched = false;
    let supabaseErrorNotice: string | null = null;

    // Dispara o e-mail real via Supabase Auth para a caixa de entrada (Gmail, Outlook, etc.)
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
        supabaseErrorNotice = sbErr.message;
        console.warn(`[Supabase Auth Mailer] Aviso para ${cleanEmail}: ${sbErr.message}`);
      }
    } catch (e: any) {
      supabaseErrorNotice = e?.message || "Falha de rede ao disparar e-mail via Supabase";
      console.warn(`[Supabase Auth Mailer] Exceção para ${cleanEmail}: ${e?.message}`);
    }

    console.log(
      `[Phantom-X Mailer] Token gerado para ${record.email}: ${record.code} (Expira em 5 min | Supabase real email dispatched: ${supabaseDispatched})`
    );

    return NextResponse.json({
      success: true,
      message: "Token de verificação gerado e enviado com sucesso.",
      supabaseDispatched,
      supabaseNotice: supabaseErrorNotice,
      expiresAt: record.expiresAt,
      code: record.code, // Incluído para preview instantâneo na UI
      htmlPreview: htmlEmail,
      textPreview: textEmail,
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error?.message || "Erro ao gerar token de verificação." },
      { status: 500 }
    );
  }
}
