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
  planSource: "stripe" | "admin" | "free";
  isPaid: boolean;
}

// Cache global em memória no processo Node.js
const serverPlanMap = new Map<string, UserPlanRecord>();

function normalizeRecordIfExpired(record: UserPlanRecord): UserPlanRecord {
  if (
    record.planSource === "stripe" &&
    record.planExpiresAt &&
    new Date(record.planExpiresAt).getTime() < Date.now()
  ) {
    return {
      ...record,
      planStatus: "expired",
      isPaid: false,
    };
  }
  return record;
}

/**
 * Obtém do cache síncrono em memória, se existir
 */
export function getServerUserPlanSync(userIdOrEmail?: string | null): UserPlanRecord | null {
  if (!userIdOrEmail) return null;
  const key = userIdOrEmail.trim().toLowerCase();
  const rec = serverPlanMap.get(key) || serverPlanMap.get(userIdOrEmail) || null;
  return rec ? normalizeRecordIfExpired(rec) : null;
}

/**
 * Remove usuário do cache em memória do servidor
 */
export function removeServerUserPlan(userIdOrEmail?: string | null): boolean {
  if (!userIdOrEmail) return false;
  const key = userIdOrEmail.trim().toLowerCase();
  const deletedById = serverPlanMap.delete(userIdOrEmail);
  const deletedByKey = serverPlanMap.delete(key);
  return deletedById || deletedByKey;
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
  updatedBy: string = "admin",
  planSourceParam?: "stripe" | "admin" | "free",
  customerId?: string | null
): Promise<UserPlanRecord> {
  const cleanId = userId.trim();
  const cleanEmail = email.trim().toLowerCase();
  const now = new Date().toISOString();

  // Define fonte do plano e se é assinante pagante real
  const planSource: "stripe" | "admin" | "free" =
    planSourceParam ||
    (plan === "free" ? "free" : updatedBy === "stripe" ? "stripe" : "admin");
  const isPaid = planSource === "stripe" && plan !== "free" && planStatus === "active";

  const record: UserPlanRecord = {
    userId: cleanId,
    email: cleanEmail,
    plan,
    planStatus,
    planActivatedAt: now,
    planExpiresAt: expiresAt ?? null,
    updatedAt: now,
    updatedBy,
    planSource,
    isPaid,
  };

  // Salva no mapa em memória por ID, por e-mail e por customerId
  if (cleanId) {
    serverPlanMap.set(cleanId, record);
  }
  if (cleanEmail) {
    serverPlanMap.set(cleanEmail, record);
  }
  if (customerId) {
    serverPlanMap.set(customerId.trim(), record);
  }

  // Tenta persistir no Supabase Auth e na tabela profiles se for UUID válido
  try {
    const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(cleanId);
    if (cleanId && isUuid) {
      try {
        await supabaseAdmin.auth.admin.updateUserById(cleanId, {
          user_metadata: {
            plan,
            plan_status: planStatus,
            plan_activated_at: now,
            plan_expires_at: expiresAt ?? null,
            plan_source: planSource,
            granted_by: updatedBy,
            is_paid: isPaid,
          },
        });
      } catch (authErr) {
        console.warn("[serverPlanStore] updateUserById warning:", authErr);
      }

      try {
        await supabaseAdmin.from("profiles").upsert({
          id: cleanId,
          email: cleanEmail,
          plan,
          plan_status: planStatus,
          plan_activated_at: now,
          plan_expires_at: expiresAt ?? null,
          plan_source: planSource,
          granted_by: updatedBy,
          is_paid: isPaid,
          updated_at: now,
        });
      } catch (dbErr) {
        console.warn("[serverPlanStore] profiles.upsert warning:", dbErr);
      }
    }
  } catch (err) {
    console.warn("[serverPlanStore] Erro geral ao sincronizar com Supabase:", err);
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
    planSource: "free",
    isPaid: false,
  };

  if (!userIdOrEmail) return defaultFree;

  const key = userIdOrEmail.trim().toLowerCase();

  // 1. Verifica cache em memória
  if (serverPlanMap.has(key)) {
    return normalizeRecordIfExpired(serverPlanMap.get(key)!);
  }
  if (serverPlanMap.has(userIdOrEmail)) {
    return normalizeRecordIfExpired(serverPlanMap.get(userIdOrEmail)!);
  }

  // 2. Consulta no Supabase
  try {
    const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(userIdOrEmail);
    if (isUuid) {
      const { data: userResp } = await supabaseAdmin.auth.admin.getUserById(userIdOrEmail);
      if (userResp?.user) {
        const u = userResp.user;
        const meta = u.user_metadata || {};
        const plan = (meta.plan as PlanId) || "free";
        const status = (meta.plan_status as any) || "trial";
        const planSource: "stripe" | "admin" | "free" =
          meta.plan_source ||
          (meta.stripe_subscription_id ? "stripe" : meta.granted_by === "admin" ? "admin" : "free");
        const isPaid = planSource === "stripe" && plan !== "free" && status === "active";

        const record: UserPlanRecord = {
          userId: u.id,
          email: u.email || "",
          plan,
          planStatus: status,
          planActivatedAt: meta.plan_activated_at || u.created_at,
          planExpiresAt: meta.plan_expires_at || null,
          updatedAt: new Date().toISOString(),
          updatedBy: meta.granted_by || (planSource === "stripe" ? "stripe" : "admin"),
          planSource,
          isPaid,
        };
        serverPlanMap.set(u.id, record);
        if (u.email) serverPlanMap.set(u.email.toLowerCase(), record);
        return normalizeRecordIfExpired(record);
      }
    } else if (userIdOrEmail.includes("@")) {
      const { data: userList } = await supabaseAdmin.auth.admin.listUsers();
      const match = userList?.users?.find((u) => u.email?.toLowerCase() === key);
      if (match) {
        const meta = match.user_metadata || {};
        const plan = (meta.plan as PlanId) || "free";
        const status = (meta.plan_status as any) || "trial";
        const planSource: "stripe" | "admin" | "free" =
          meta.plan_source ||
          (meta.stripe_subscription_id ? "stripe" : meta.granted_by === "admin" ? "admin" : "free");
        const isPaid = planSource === "stripe" && plan !== "free" && status === "active";

        const record: UserPlanRecord = {
          userId: match.id,
          email: match.email || "",
          plan,
          planStatus: status,
          planActivatedAt: meta.plan_activated_at || match.created_at,
          planExpiresAt: meta.plan_expires_at || null,
          updatedAt: new Date().toISOString(),
          updatedBy: meta.granted_by || (planSource === "stripe" ? "stripe" : "admin"),
          planSource,
          isPaid,
        };
        serverPlanMap.set(match.id, record);
        serverPlanMap.set(key, record);
        return normalizeRecordIfExpired(record);
      }
    }
  } catch (err) {
    console.warn("[serverPlanStore] Falha ao consultar Supabase:", err);
  }

  return defaultFree;
}
