import { NextRequest, NextResponse } from "next/server";
import { supabase, supabaseAdmin } from "@/lib/supabase";
import { validatePasswordSecurity } from "@/lib/passwordValidator";
import { normalizePhoneNumber, arePhoneNumbersEqual } from "@/lib/phoneValidator";
import { setServerOtp } from "@/lib/serverOtpStore";
import { dispatchVerificationEmail } from "@/lib/mailer";
import { findServerUser, saveServerUser } from "@/lib/serverUserStore";

export const dynamic = "force-dynamic";

/**
 * GET: Verificação preventiva de unicidade de telefone ou e-mail
 */
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const phone = searchParams.get("phone");
    const countryCode = searchParams.get("countryCode") || "+55";
    const email = searchParams.get("email");

    // 1. Verificação de telefone
    if (phone) {
      const normPhone = normalizePhoneNumber(phone, countryCode);
      if (normPhone.digits.length >= 8) {
        // Verifica no cofre do servidor
        const localMatch = findServerUser(normPhone.digits);
        if (localMatch && localMatch.phone && arePhoneNumbersEqual(localMatch.phone, localMatch.phoneCountryCode, phone, countryCode)) {
          return NextResponse.json({
            available: false,
            field: "phone",
            error: "Este número de telefone já está cadastrado no sistema. Por favor, utilize outro número ou faça login na sua conta existente.",
          });
        }

        // Tenta também no Supabase (se online)
        try {
          const { data: userList } = await supabaseAdmin.auth.admin.listUsers();
          if (userList?.users) {
            const phoneTaken = userList.users.some((u) => {
              const uPhone = u.phone || u.user_metadata?.phone || u.user_metadata?.phoneRaw;
              const uCode = u.user_metadata?.phoneCountryCode || "+55";
              return arePhoneNumbersEqual(uPhone, uCode, phone, countryCode);
            });

            if (phoneTaken) {
              return NextResponse.json({
                available: false,
                field: "phone",
                error: "Este número de telefone já está cadastrado no sistema. Por favor, utilize outro número ou faça login na sua conta existente.",
              });
            }
          }
        } catch {}
      }

      return NextResponse.json({ available: true, field: "phone" });
    }

    // 2. Verificação de e-mail
    if (email) {
      const cleanEmail = email.trim().toLowerCase();

      // Verifica no cofre do servidor
      const localMatch = findServerUser(cleanEmail);
      if (localMatch) {
        return NextResponse.json({
          available: false,
          field: "email",
          error: "Já existe uma conta registrada com este e-mail. Por favor, acesse o login.",
        });
      }

      // Tenta no Supabase
      try {
        const { data: userList } = await supabaseAdmin.auth.admin.listUsers();
        const existing = userList?.users?.find((u) => u.email?.toLowerCase() === cleanEmail);
        if (existing) {
          return NextResponse.json({
            available: false,
            field: "email",
            error: "Já existe uma conta registrada com este e-mail. Por favor, acesse o login.",
          });
        }
      } catch {}

      return NextResponse.json({ available: true, field: "email" });
    }

    return NextResponse.json({ error: "Parâmetros 'phone' ou 'email' ausentes." }, { status: 400 });
  } catch (error: any) {
    return NextResponse.json({ error: error?.message || "Erro na consulta" }, { status: 500 });
  }
}

/**
 * POST: Criação e Provisionamento Seguro de Conta de Operador
 */
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const {
      name,
      email,
      phone,
      phoneCountryCode = "+55",
      password,
      timezone = "America/Sao_Paulo",
    } = body;

    // 1. Validação de preenchimento
    const cleanName = (name || "").trim();
    const cleanEmail = (email || "").trim().toLowerCase();
    const cleanPhone = (phone || "").trim();
    const cleanCountryCode = (phoneCountryCode || "+55").trim();

    if (!cleanName || cleanName.length < 3) {
      return NextResponse.json(
        { success: false, field: "name", error: "O nome completo deve conter ao menos 3 caracteres." },
        { status: 400 }
      );
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!cleanEmail || !emailRegex.test(cleanEmail)) {
      return NextResponse.json(
        { success: false, field: "email", error: "Por favor, insira um endereço de e-mail válido." },
        { status: 400 }
      );
    }

    // 2. Validação de telefone
    const normPhone = normalizePhoneNumber(cleanPhone, cleanCountryCode);
    if (!cleanPhone || normPhone.digits.length < 8) {
      return NextResponse.json(
        {
          success: false,
          field: "phone",
          error: "Por favor, informe um número de telefone válido com código de área / DDD.",
        },
        { status: 400 }
      );
    }

    // 3. Validação de Senha
    const passwordValidation = validatePasswordSecurity(password);
    if (!passwordValidation.isValid) {
      return NextResponse.json(
        {
          success: false,
          field: "password",
          error: passwordValidation.errors[0] || "A senha fornecida não atende aos requisitos de segurança do sistema.",
          details: passwordValidation.errors,
          checks: passwordValidation.checks,
        },
        { status: 400 }
      );
    }

    // 4. Salva imediatamente no Cofre Persistente do Servidor (Garantia de que o lead NUNCA é perdido)
    const savedServerUser = saveServerUser({
      name: cleanName,
      nickname: cleanName.split(" ")[0],
      email: cleanEmail,
      phone: cleanPhone,
      phoneCountryCode: cleanCountryCode,
      passwordPlain: password,
      role: "operator",
      timezone,
      plan: "free",
      planStatus: "active",
      emailVerified: true, // Já nasce ativo para poder acessar imediatamente sem bloqueios
      emailConfirmedAt: new Date().toISOString(),
    });

    const createdUserId = savedServerUser.id;

    // 5. Tenta criar/atualizar no Supabase Auth e Profiles em background/resiliente
    try {
      const { data: userList } = await supabaseAdmin.auth.admin.listUsers();
      const existingSupabase = userList?.users?.find((u) => u.email?.toLowerCase() === cleanEmail);

      if (existingSupabase) {
        await supabaseAdmin.auth.admin.updateUserById(existingSupabase.id, {
          password: password,
          email_confirm: true,
          user_metadata: {
            ...existingSupabase.user_metadata,
            name: cleanName,
            nickname: cleanName.split(" ")[0],
            phone: cleanPhone,
            phoneRaw: cleanPhone,
            phoneCountryCode: cleanCountryCode,
            canonicalPhone: normPhone.canonical,
            phoneDigits: normPhone.digits,
            role: "operator",
            timezone,
            plan: "free",
            plan_status: "trial",
            email_verified: true,
            updated_via: "api_v1_signup",
          },
        });
      } else {
        await supabaseAdmin.auth.admin.createUser({
          email: cleanEmail,
          password: password,
          email_confirm: true,
          user_metadata: {
            name: cleanName,
            nickname: cleanName.split(" ")[0],
            phone: cleanPhone,
            phoneRaw: cleanPhone,
            phoneCountryCode: cleanCountryCode,
            canonicalPhone: normPhone.canonical,
            phoneDigits: normPhone.digits,
            role: "operator",
            timezone,
            plan: "free",
            plan_status: "trial",
            email_verified: true,
            created_via: "api_v1_signup",
          },
        });
      }

      await supabaseAdmin.from("profiles").upsert({
        id: createdUserId,
        name: cleanName,
        nickname: cleanName.split(" ")[0],
        email: cleanEmail,
        phone: cleanPhone,
        phone_country_code: cleanCountryCode,
        role: "operator",
        timezone,
        updated_at: new Date().toISOString(),
      });
    } catch (sbErr: any) {
      console.warn("[Signup API] Supabase offline/aviso (ignorado):", sbErr?.message);
    }

    // 6. Gera token OTP e dispara e-mail de boas-vindas pelo Resend
    const randomOtp = Math.floor(100000 + Math.random() * 900000).toString();
    const otpRecord = setServerOtp(cleanEmail, cleanName, randomOtp);

    const origin = req.headers.get("origin") || req.nextUrl.origin || undefined;
    let emailDispatched = false;

    try {
      const emailRes = await dispatchVerificationEmail({
        to: cleanEmail,
        name: cleanName,
        code: otpRecord.code,
        origin,
      });
      emailDispatched = emailRes.success;
    } catch (e: any) {
      console.warn(`[Signup API] Falha no disparo de e-mail: ${e?.message}`);
    }

    return NextResponse.json({
      success: true,
      message: "Conta criada e ativada com sucesso! Você já pode acessar seu painel.",
      requiresEmailVerification: false, // Liberado imediatamente para login
      emailDispatched,
      user: {
        id: createdUserId,
        name: cleanName,
        email: cleanEmail,
        phone: cleanPhone,
        phoneCountryCode: cleanCountryCode,
      },
    });
  } catch (error: any) {
    console.error("[Signup API] Erro inesperado:", error);
    return NextResponse.json(
      {
        success: false,
        error: error?.message || "Erro interno ao processar cadastro de operador.",
      },
      { status: 500 }
    );
  }
}
