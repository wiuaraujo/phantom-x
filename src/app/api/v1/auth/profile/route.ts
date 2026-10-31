import { NextRequest, NextResponse } from "next/server";
import { supabase, supabaseAdmin } from "@/lib/supabase";
import { normalizePhoneNumber } from "@/lib/phoneValidator";

export const dynamic = "force-dynamic";

/**
 * GET: Retorna os dados cadastrais do operador
 */
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const userId = searchParams.get("userId");
    const email = searchParams.get("email");

    if (!userId && !email) {
      return NextResponse.json({ success: false, error: "Identificador de usuário não fornecido." }, { status: 400 });
    }

    let user: any = null;
    if (userId && userId.includes("-")) {
      const { data } = await supabaseAdmin.auth.admin.getUserById(userId);
      user = data?.user;
    }

    if (!user && email) {
      const { data } = await supabaseAdmin.auth.admin.listUsers();
      user = data?.users?.find((u) => u.email?.toLowerCase() === email.trim().toLowerCase());
    }

    // Busca perfil na tabela profiles
    let profile: any = null;
    if (user?.id) {
      const { data } = await supabase.from("profiles").select("*").eq("id", user.id).single();
      profile = data;
    }

    return NextResponse.json({
      success: true,
      user: {
        id: user?.id || userId,
        email: user?.email || email,
        name: profile?.name || user?.user_metadata?.name || "",
        nickname: profile?.nickname || user?.user_metadata?.nickname || "",
        phone: profile?.phone || user?.user_metadata?.phone || user?.user_metadata?.phoneRaw || "",
        phoneCountryCode: profile?.phone_country_code || user?.user_metadata?.phoneCountryCode || "+55",
        timezone: profile?.timezone || user?.user_metadata?.timezone || "America/Sao_Paulo",
      },
    });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error?.message || "Erro ao consultar perfil." }, { status: 500 });
  }
}

/**
 * POST / PUT: Atualiza perfil do operador (Nome, Apelido, Telefone, Fuso) no Supabase Auth e na tabela profiles
 */
export async function POST(req: NextRequest) {
  return handleUpdateProfile(req);
}

export async function PUT(req: NextRequest) {
  return handleUpdateProfile(req);
}

async function handleUpdateProfile(req: NextRequest) {
  try {
    const body = await req.json();
    const { userId, email, name, nickname, phone, phoneCountryCode = "+55", timezone = "America/Sao_Paulo" } = body;

    let targetUserId = userId;
    const cleanEmail = email ? email.trim().toLowerCase() : "";

    // Localiza o usuário no Supabase Auth
    if (!targetUserId || !targetUserId.includes("-")) {
      const { data: userList } = await supabaseAdmin.auth.admin.listUsers();
      const match = userList?.users?.find(
        (u) =>
          (cleanEmail && u.email?.toLowerCase() === cleanEmail) ||
          (targetUserId && (u.id === targetUserId || u.user_metadata?.id === targetUserId))
      );
      if (match) targetUserId = match.id;
    }

    if (!targetUserId && !cleanEmail) {
      return NextResponse.json(
        { success: false, error: "Identificador do operador não localizado." },
        { status: 400 }
      );
    }

    const cleanName = (name || "").trim();
    const cleanNickname = (nickname || "").trim() || (cleanName ? cleanName.split(" ")[0] : "");
    const cleanPhone = (phone || "").trim();
    const cleanCountryCode = (phoneCountryCode || "+55").trim();

    // 1. Atualiza metadados no Supabase Auth
    let updatedAuthUser: any = null;
    if (targetUserId) {
      try {
        const { data: existingUserRes } = await supabaseAdmin.auth.admin.getUserById(targetUserId);
        const existingMetadata = existingUserRes?.user?.user_metadata || {};

        const updatePayload: any = {
          user_metadata: {
            ...existingMetadata,
            name: cleanName || existingMetadata.name,
            nickname: cleanNickname || existingMetadata.nickname,
            phone: cleanPhone,
            phoneRaw: cleanPhone,
            phoneCountryCode: cleanCountryCode,
            timezone: timezone || existingMetadata.timezone || "America/Sao_Paulo",
            updated_at: new Date().toISOString(),
          },
        };

        const { data: updated, error: uErr } = await supabaseAdmin.auth.admin.updateUserById(targetUserId, updatePayload);
        if (uErr) {
          console.warn("[Profile API] Erro updateUserById:", uErr.message);
        } else {
          updatedAuthUser = updated.user;
        }
      } catch (err: any) {
        console.warn("[Profile API] Exceção Auth update:", err?.message);
      }
    }

    // 2. Atualiza ou insere na tabela profiles
    if (targetUserId || cleanEmail) {
      try {
        const profilePayload: any = {
          updated_at: new Date().toISOString(),
        };

        if (targetUserId) profilePayload.id = targetUserId;
        if (cleanEmail) profilePayload.email = cleanEmail;
        if (cleanName) profilePayload.name = cleanName;
        if (cleanNickname) profilePayload.nickname = cleanNickname;
        profilePayload.phone = cleanPhone || null;
        profilePayload.phone_country_code = cleanCountryCode;
        if (timezone) profilePayload.timezone = timezone;

        await supabase.from("profiles").upsert(profilePayload);
      } catch (pErr: any) {
        console.warn("[Profile API] Exceção profiles upsert:", pErr?.message);
      }
    }

    return NextResponse.json({
      success: true,
      message: "Perfil do operador atualizado com sucesso no cluster e sincronizado com o painel admin.",
      user: {
        id: targetUserId || updatedAuthUser?.id,
        email: cleanEmail || updatedAuthUser?.email,
        name: cleanName,
        nickname: cleanNickname,
        phone: cleanPhone,
        phoneCountryCode: cleanCountryCode,
        timezone,
      },
    });
  } catch (error: any) {
    console.error("[Profile API] Erro ao atualizar perfil:", error);
    return NextResponse.json(
      { success: false, error: error?.message || "Erro interno ao atualizar perfil do operador." },
      { status: 500 }
    );
  }
}
