import { PlanId } from "./plans";
import { supabaseAdmin } from "./supabase";

export interface UserPlanRecord {
  userId: string;
  email: string;
  plan: PlanId;
  planStatus: "active" | "trial" | "expired" | "canceled";
  planActivatedAt: string;
  planExpiresAt?: string | null;
  updatedAt: string;
  updatedBy?: string;
}

// Cache global em memória no processo Node.js
const serverPlanMap = new Map<string, UserPlanRecord>();

/**
 * Obtém do cache síncrono em memória, se existir
 */
export function getServerUserPlanSync(userIdOrEmail?: string | null): UserPlanRecord | null {
  if (!userIdOrEmail) return null;
  const key = userIdOrEmail.trim().toLowerCase();
  return serverPlanMap.get(key) || serverPlanMap.get(userIdOrEmail) || null;
}

/**
 * Registra ou atualiza o plano do usuário no servidor
 */
export async function setServerUserPlan(
  userId: string,
  email: string,
  plan: PlanId,
  planStatus: "active" | "trial" | "expired" | "canceled" = "active",
  expiresAt?: string | null,
  updatedBy: string = "admin"
): Promise<UserPlanRecord> {
  const cleanId = userId.trim();
  const cleanEmail = email.trim().toLowerCase();
  const now = new Date().toISOString();

  const record: UserPlanRecord = {
    userId: cleanId,
    email: cleanEmail,
    plan,
    planStatus,
    planActivatedAt: now,
    planExpiresAt: expiresAt ?? null,
    updatedAt: now,
    updatedBy,
  };

  // Salva no mapa em memória por ID e por e-mail
  serverPlanMap.set(cleanId, record);
  if (cleanEmail) {
    serverPlanMap.set(cleanEmail, record);
  }

  // Tenta persistir no Supabase Auth e na tabela profiles
  try {
    if (cleanId) {
      await supabaseAdmin.auth.admin.updateUserById(cleanId, {
        user_metadata: {
          plan,
          plan_status: planStatus,
          plan_activated_at: now,
          plan_expires_at: expiresAt ?? null,
        },
      });

      await supabaseAdmin.from("profiles").upsert({
        id: cleanId,
        email: cleanEmail,
        plan,
        plan_status: planStatus,
        plan_activated_at: now,
        plan_expires_at: expiresAt ?? null,
        updated_at: now,
      });
    }
  } catch (err) {
    console.warn("[serverPlanStore] Erro ao sincronizar com Supabase:", err);
  }

  return record;
}

/**
 * Obtém o plano atual do usuário a partir do servidor
 */
export async function getServerUserPlan(
  userIdOrEmail?: string | null
): Promise<UserPlanRecord> {
  const defaultFree: UserPlanRecord = {
    userId: userIdOrEmail || "anonymous",
    email: "",
    plan: "free",
    planStatus: "trial",
    planActivatedAt: new Date().toISOString(),
    planExpiresAt: null,
    updatedAt: new Date().toISOString(),
  };

  if (!userIdOrEmail) return defaultFree;

  const key = userIdOrEmail.trim().toLowerCase();

  // 1. Verifica cache em memória
  if (serverPlanMap.has(key)) {
    return serverPlanMap.get(key)!;
  }
  if (serverPlanMap.has(userIdOrEmail)) {
    return serverPlanMap.get(userIdOrEmail)!;
  }

  // 2. Consulta no Supabase
  try {
    // Se for UUID, busca direto
    if (userIdOrEmail.includes("-") || userIdOrEmail.length > 20) {
      const { data: userResp } = await supabaseAdmin.auth.admin.getUserById(userIdOrEmail);
      if (userResp?.user) {
        const u = userResp.user;
        const meta = u.user_metadata || {};
        const plan = (meta.plan as PlanId) || "free";
        const status = (meta.plan_status as any) || "trial";
        const record: UserPlanRecord = {
          userId: u.id,
          email: u.email || "",
          plan,
          planStatus: status,
          planActivatedAt: meta.plan_activated_at || u.created_at,
          planExpiresAt: meta.plan_expires_at || null,
          updatedAt: new Date().toISOString(),
        };
        serverPlanMap.set(u.id, record);
        if (u.email) serverPlanMap.set(u.email.toLowerCase(), record);
        return record;
      }
    } else if (userIdOrEmail.includes("@")) {
      const { data: userList } = await supabaseAdmin.auth.admin.listUsers();
      const match = userList?.users?.find((u) => u.email?.toLowerCase() === key);
      if (match) {
        const meta = match.user_metadata || {};
        const plan = (meta.plan as PlanId) || "free";
        const status = (meta.plan_status as any) || "trial";
        const record: UserPlanRecord = {
          userId: match.id,
          email: match.email || "",
          plan,
          planStatus: status,
          planActivatedAt: meta.plan_activated_at || match.created_at,
          planExpiresAt: meta.plan_expires_at || null,
          updatedAt: new Date().toISOString(),
        };
        serverPlanMap.set(match.id, record);
        serverPlanMap.set(key, record);
        return record;
      }
    }
  } catch (err) {
    console.warn("[serverPlanStore] Falha ao consultar Supabase:", err);
  }

  return defaultFree;
}
