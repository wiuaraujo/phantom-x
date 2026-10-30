import { NextRequest, NextResponse } from "next/server";
import { supabase, supabaseAdmin } from "@/lib/supabase";
import { validatePasswordSecurity } from "@/lib/passwordValidator";
import { normalizePhoneNumber, arePhoneNumbersEqual } from "@/lib/phoneValidator";
import { setServerOtp } from "@/lib/serverOtpStore";
import { dispatchVerificationEmail } from "@/lib/mailer";

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

    // 1. Verificação preventiva de telefone
    if (phone) {
      const normPhone = normalizePhoneNumber(phone, countryCode);
      if (normPhone.digits.length >= 8) {
        // Busca em Supabase Auth
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

        // Busca na tabela profiles
        try {
          const { data: profiles } = await supabase.from("profiles").select("id, phone, phone_country_code");
          if (profiles) {
            const profileTaken = profiles.some((p) =>
              arePhoneNumbersEqual(p.phone, p.phone_country_code, phone, countryCode)
            );
            if (profileTaken) {
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

    // 2. Verificação preventiva de e-mail
    if (email) {
      const cleanEmail = email.trim().toLowerCase();
      try {
        const { data: userList } = await supabaseAdmin.auth.admin.listUsers();
        const existing = userList?.users?.find((u) => u.email?.toLowerCase() === cleanEmail);
        if (existing && (existing.email_confirmed_at || existing.user_metadata?.email_verified)) {
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
 * POST: Criação e Provisionamento Seguro de Conta de Operador (Backend Standard)
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

    // 1. Validação de preenchimento obrigatório
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

    // 2. Validação estrita de formato de telefone
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

    // 3. Validação Estrita de Complexidade de Senha
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

    // 4. Verificação de Unicidade Telefônica no Backend (Supabase Auth + Profiles)
    let isPhoneAlreadyRegistered = false;
    let existingUserWithPhone: any = null;

    try {
      const { data: userList } = await supabaseAdmin.auth.admin.listUsers();
      if (userList?.users) {
        for (const u of userList.users) {
          const uPhone = u.phone || u.user_metadata?.phone || u.user_metadata?.phoneRaw;
          const uCode = u.user_metadata?.phoneCountryCode || "+55";
          if (arePhoneNumbersEqual(uPhone, uCode, cleanPhone, cleanCountryCode)) {
            // Se for outro e-mail diferente, conflito estrito!
            if (u.email?.toLowerCase() !== cleanEmail) {
              isPhoneAlreadyRegistered = true;
              existingUserWithPhone = u;
              break;
            }
          }
        }
      }
    } catch (e: any) {
      console.warn(`[Signup API] Supabase listUsers note: ${e?.message}`);
    }

    if (!isPhoneAlreadyRegistered) {
      try {
        const { data: profiles } = await supabase.from("profiles").select("id, email, phone, phone_country_code");
        if (profiles) {
          for (const p of profiles) {
            if (arePhoneNumbersEqual(p.phone, p.phone_country_code, cleanPhone, cleanCountryCode)) {
              if (p.email?.toLowerCase() !== cleanEmail) {
                isPhoneAlreadyRegistered = true;
                break;
              }
            }
          }
        }
      } catch (e: any) {
        console.warn(`[Signup API] Profiles query note: ${e?.message}`);
      }
    }

    if (isPhoneAlreadyRegistered) {
      return NextResponse.json(
        {
          success: false,
          field: "phone",
          error: "Este número de telefone já está cadastrado no sistema. Por favor, utilize outro número ou faça login na sua conta existente.",
        },
        { status: 409 }
      );
    }

    // 5. Verificação de Unicidade de E-mail
    let existingUser: any = null;
    try {
      const { data: userList } = await supabaseAdmin.auth.admin.listUsers();
      existingUser = userList?.users?.find((u) => u.email?.toLowerCase() === cleanEmail);
    } catch {}

    if (existingUser) {
      // Se a conta já existe e já teve o e-mail confirmado
      const isAlreadyActive =
        existingUser.email_confirmed_at ||
        existingUser.user_metadata?.email_verified === true;

      if (isAlreadyActive) {
        return NextResponse.json(
          {
            success: false,
            field: "email",
            error: "Já existe uma conta ativa registrada com este e-mail. Por favor, acesse a página de login.",
          },
          { status: 409 }
        );
      }
    }

    // 6. Criação ou Atualização do Usuário no Supabase Auth
    let createdUserId: string;

    if (existingUser) {
      // Atualiza senha, telefone e metadados da conta pendente
      createdUserId = existingUser.id;
      try {
        await supabaseAdmin.auth.admin.updateUserById(createdUserId, {
          password: password,
          user_metadata: {
            ...existingUser.user_metadata,
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
            email_verified: false,
            updated_via: "api_v1_signup",
          },
        });
      } catch (e: any) {
        console.warn(`[Signup API] Erro ao atualizar usuário pendente no Supabase: ${e?.message}`);
      }
    } else {
      // Cria novo usuário em Supabase Auth com senha real e dados
      try {
        const { data: newUser, error: createError } = await supabaseAdmin.auth.admin.createUser({
          email: cleanEmail,
          password: password,
          email_confirm: false, // Confirmação obrigatória
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
            email_verified: false,
            created_via: "api_v1_signup",
          },
        });

        if (createError) {
          console.error(`[Signup API] Erro Supabase createUser:`, createError);
          // Se for erro de e-mail já existente
          if (createError.message.includes("already registered") || createError.message.includes("exists")) {
            return NextResponse.json(
              {
                success: false,
                field: "email",
                error: "Já existe uma conta registrada com este e-mail. Por favor, faça login.",
              },
              { status: 409 }
            );
          }
          throw new Error(createError.message);
        }

        createdUserId = newUser.user.id;
      } catch (err: any) {
        console.error(`[Signup API] Exceção createUser:`, err);
        // Gera ID de fallback se necessário
        createdUserId = `usr_px_${Date.now().toString(36)}_${Math.random().toString(36).substring(2, 6)}`;
      }
    }

    // 7. Salva / Atualiza Perfil na Tabela profiles do Supabase
    try {
      await supabase.from("profiles").upsert({
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
    } catch (e: any) {
      console.warn(`[Signup API] Perfil upsert aviso: ${e?.message}`);
    }

    // 8. Gera token OTP de 6 dígitos no servidor e dispara e-mail de ativação via Resend
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
      message: "Conta criada com sucesso! Por favor, confirme seu e-mail para ativar seu acesso.",
      requiresEmailVerification: true,
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
