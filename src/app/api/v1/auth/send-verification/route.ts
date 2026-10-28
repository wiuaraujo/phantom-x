import { NextRequest, NextResponse } from "next/server";
import {
  createVerificationToken,
  renderVerificationEmailHtml,
  renderVerificationEmailText,
} from "@/lib/emailService";

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

    const record = createVerificationToken(email, name || "Operador");
    const htmlEmail = renderVerificationEmailHtml(record.name, record.code);
    const textEmail = renderVerificationEmailText(record.name, record.code);

    // Em produção com Resend / Sendgrid / Supabase Auth, o e-mail real é despachado via SMTP/API aqui.
    console.log(`[Phantom-X Mailer] Token gerado para ${record.email}: ${record.code} (Expira em 5 min)`);

    return NextResponse.json({
      success: true,
      message: "Token de verificação enviado com sucesso.",
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
