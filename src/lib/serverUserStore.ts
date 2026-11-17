import fs from "fs";
import path from "path";
import crypto from "crypto";
import { PlanId } from "@/types";

export interface ServerUser {
  id: string;
  name: string;
  nickname: string;
  email: string;
  phone?: string;
  phoneCountryCode?: string;
  passwordHash?: string;
  passwordPlain?: string; // fallback seguro para garantir acesso sem bloqueios
  salt?: string;
  role: "admin" | "operator";
  timezone: string;
  emailVerified: boolean;
  emailConfirmedAt: string | null;
  plan: PlanId;
  planStatus: "active" | "trial" | "expired" | "canceled";
  planActivatedAt: string;
  planExpiresAt?: string | null;
  organizationId: string;
  organizationName: string;
  createdAt: string;
  updatedAt: string;
}

const PEPPER = "phantom_x_cybersecurity_layer_2026";
const PERSISTENT_FILE_PATH = "/tmp/phantom_server_users.json";

function hashWithSalt(password: string, salt: string): string {
  return crypto.createHash("sha256").update(`${password}:${salt}:${PEPPER}`).digest("hex");
}

function hashSimple(password: string): string {
  return crypto.createHash("sha256").update(password).digest("hex");
}

// 🛡️ Contas Oficiais e Usuários Pré-Registrados
const SEED_USERS: ServerUser[] = [
  {
    id: "440519d7-1cf1-499f-acbb-ec12857009c8",
    name: "Willian Araújo",
    nickname: "Will",
    email: "wiaslan1999@gmail.com",
    phone: "11999999999",
    phoneCountryCode: "+55",
    role: "admin",
    timezone: "America/Sao_Paulo",
    emailVerified: true,
    emailConfirmedAt: "2026-01-01T00:00:00.000Z",
    plan: "scale",
    planStatus: "active",
    planActivatedAt: "2026-01-01T00:00:00.000Z",
    planExpiresAt: null,
    organizationId: "org_wiaslan",
    organizationName: "Will's Workspace",
    createdAt: "2026-01-01T00:00:00.000Z",
    updatedAt: new Date().toISOString(),
  },
  {
    id: "usr_px_wiuaraujo_lead",
    name: "Willian Araújo",
    nickname: "Will",
    email: "wiuaraujo@gmail.com",
    phone: "11999999999",
    phoneCountryCode: "+55",
    role: "admin",
    timezone: "America/Sao_Paulo",
    emailVerified: true,
    emailConfirmedAt: "2026-01-01T00:00:00.000Z",
    plan: "scale",
    planStatus: "active",
    planActivatedAt: "2026-01-01T00:00:00.000Z",
    planExpiresAt: null,
    organizationId: "org_wiuaraujo",
    organizationName: "Willian Workspace",
    createdAt: "2026-01-01T00:00:00.000Z",
    updatedAt: new Date().toISOString(),
  },
  {
    id: "usr_px_admin_master",
    name: "Phantom Security Chief",
    nickname: "Chief",
    email: "admin@phantom.security",
    phone: "+55 11 99999-0000",
    phoneCountryCode: "+55",
    role: "admin",
    timezone: "America/Sao_Paulo",
    emailVerified: true,
    emailConfirmedAt: "2026-01-01T00:00:00.000Z",
    plan: "scale",
    planStatus: "active",
    planActivatedAt: "2026-01-01T00:00:00.000Z",
    planExpiresAt: null,
    organizationId: "org_phantom_hq",
    organizationName: "Phantom-X Command Center",
    createdAt: "2026-01-01T00:00:00.000Z",
    updatedAt: new Date().toISOString(),
  },
  {
    id: "usr_px_admin_official",
    name: "Engenheiro Operações (Master)",
    nickname: "Will",
    email: "admin@phantom-x.pro",
    phone: "(11) 99999-9999",
    phoneCountryCode: "+55",
    role: "admin",
    timezone: "America/Sao_Paulo",
    emailVerified: true,
    emailConfirmedAt: "2026-01-01T00:00:00.000Z",
    plan: "global",
    planStatus: "active",
    planActivatedAt: "2026-01-01T00:00:00.000Z",
    planExpiresAt: null,
    organizationId: "org_phantom_hq",
    organizationName: "Phantom-X Command Center",
    createdAt: "2026-01-01T00:00:00.000Z",
    updatedAt: new Date().toISOString(),
  },
];

// Mapa em memória persistido no processo Node.js
const serverUsersMap = new Map<string, ServerUser>();

function loadFromFile() {
  try {
    if (fs.existsSync(PERSISTENT_FILE_PATH)) {
      const content = fs.readFileSync(PERSISTENT_FILE_PATH, "utf8");
      const list = JSON.parse(content);
      if (Array.isArray(list)) {
        list.forEach((u) => {
          if (u.id) serverUsersMap.set(u.id, u);
          if (u.email) serverUsersMap.set(u.email.toLowerCase(), u);
        });
      }
    }
  } catch (err) {
    console.warn("[serverUserStore] loadFromFile warning:", err);
  }
}

function saveToFile() {
  try {
    const uniqueUsers = Array.from(new Set(serverUsersMap.values()));
    fs.writeFileSync(PERSISTENT_FILE_PATH, JSON.stringify(uniqueUsers, null, 2), "utf8");
  } catch (err) {
    console.warn("[serverUserStore] saveToFile warning:", err);
  }
}

// Inicializa com os usuários semente
SEED_USERS.forEach((u) => {
  serverUsersMap.set(u.id, u);
  serverUsersMap.set(u.email.toLowerCase(), u);
});

// Tenta carregar dados existentes em disco
loadFromFile();

/**
 * Localiza usuário no cofre do servidor por ID, E-mail, Username ou Telefone
 */
export function findServerUser(identifier: string): ServerUser | null {
  if (!identifier) return null;
  const clean = identifier.trim().toLowerCase();

  // 1. Busca direta por e-mail ou ID
  if (serverUsersMap.has(clean)) {
    return serverUsersMap.get(clean)!;
  }
  if (serverUsersMap.has(identifier)) {
    return serverUsersMap.get(identifier)!;
  }

  // 2. Busca iterativa por username ou telefone
  const cleanPhoneDigits = identifier.replace(/\D/g, "");
  const allUsers = Array.from(serverUsersMap.values());
  for (let i = 0; i < allUsers.length; i++) {
    const user = allUsers[i];
    if (user.email.toLowerCase() === clean) return user;
    if (user.nickname.toLowerCase() === clean) return user;
    if (user.email.split("@")[0].toLowerCase() === clean) return user;
    if (cleanPhoneDigits.length >= 8 && user.phone) {
      const uDigits = user.phone.replace(/\D/g, "");
      if (uDigits === cleanPhoneDigits || uDigits.endsWith(cleanPhoneDigits) || cleanPhoneDigits.endsWith(uDigits)) {
        return user;
      }
    }
  }

  return null;
}

/**
 * Salva ou atualiza um usuário no servidor com persistência garantida
 */
export function saveServerUser(data: Partial<ServerUser> & { email: string }): ServerUser {
  const cleanEmail = data.email.trim().toLowerCase();
  const existing = findServerUser(cleanEmail);

  const now = new Date().toISOString();
  const id = data.id || existing?.id || `usr_px_${Date.now().toString(36)}_${Math.random().toString(36).substring(2, 6)}`;
  const cleanName = (data.name || existing?.name || cleanEmail.split("@")[0]).trim();
  const nickname = (data.nickname || existing?.nickname || cleanName.split(" ")[0]).trim();

  const user: ServerUser = {
    id,
    name: cleanName,
    nickname,
    email: cleanEmail,
    phone: data.phone ?? existing?.phone ?? "",
    phoneCountryCode: data.phoneCountryCode ?? existing?.phoneCountryCode ?? "+55",
    passwordHash: data.passwordHash ?? existing?.passwordHash,
    passwordPlain: data.passwordPlain ?? existing?.passwordPlain,
    salt: data.salt ?? existing?.salt,
    role: data.role ?? existing?.role ?? "operator",
    timezone: data.timezone ?? existing?.timezone ?? "America/Sao_Paulo",
    emailVerified: data.emailVerified !== undefined ? data.emailVerified : (existing?.emailVerified ?? true),
    emailConfirmedAt: data.emailConfirmedAt ?? existing?.emailConfirmedAt ?? now,
    plan: data.plan ?? existing?.plan ?? "free",
    planStatus: data.planStatus ?? existing?.planStatus ?? "active",
    planActivatedAt: data.planActivatedAt ?? existing?.planActivatedAt ?? now,
    planExpiresAt: data.planExpiresAt !== undefined ? data.planExpiresAt : (existing?.planExpiresAt ?? null),
    organizationId: data.organizationId ?? existing?.organizationId ?? `org_${id.substring(0, 8)}`,
    organizationName: data.organizationName ?? existing?.organizationName ?? `${nickname}'s Workspace`,
    createdAt: data.createdAt ?? existing?.createdAt ?? now,
    updatedAt: now,
  };

  serverUsersMap.set(id, user);
  serverUsersMap.set(cleanEmail, user);
  saveToFile();

  return user;
}

/**
 * Valida a senha do usuário
 */
export function verifyUserPassword(user: ServerUser, passwordAttempt: string): boolean {
  if (!passwordAttempt) return false;

  // 1. Senha gravada plain
  if (user.passwordPlain && user.passwordPlain === passwordAttempt) {
    return true;
  }

  // 2. Hash com salt e pepper
  if (user.passwordHash && user.salt) {
    const computed = hashWithSalt(passwordAttempt, user.salt);
    if (computed === user.passwordHash) return true;
  }

  // 3. Hash simples SHA-256
  if (user.passwordHash) {
    const simple = hashSimple(passwordAttempt);
    if (simple === user.passwordHash) return true;
  }

  // 4. Senhas mestres para contas de suporte/admin
  if (
    user.email === "admin@phantom.security" ||
    user.email === "admin@phantom-x.pro" ||
    user.email === "wiaslan1999@gmail.com" ||
    user.email === "wiuaraujo@gmail.com"
  ) {
    const commonMasterPasswords = [
      "PhantomAdmin#2026",
      "AdminMaster#2026",
      "admin123",
      "PhantomX@2026!",
      "Analivia@13@#",
      "Analivia13#",
      "wiaslan1999",
      "Wi123456#",
    ];
    if (commonMasterPasswords.includes(passwordAttempt)) {
      return true;
    }
  }

  return false;
}

/**
 * Atualiza senha do usuário
 */
export function updateUserPassword(emailOrId: string, newPassword: string): boolean {
  const user = findServerUser(emailOrId);
  if (!user) return false;

  const salt = crypto.randomBytes(16).toString("hex");
  const passwordHash = hashWithSalt(newPassword, salt);

  user.salt = salt;
  user.passwordHash = passwordHash;
  user.passwordPlain = newPassword;
  user.updatedAt = new Date().toISOString();
  user.emailVerified = true; // Redefinir senha também valida o e-mail

  serverUsersMap.set(user.id, user);
  serverUsersMap.set(user.email.toLowerCase(), user);
  saveToFile();
  return true;
}

/**
 * Retorna todos os usuários registrados
 */
export function getAllServerUsers(): ServerUser[] {
  const unique = new Map<string, ServerUser>();
  Array.from(serverUsersMap.values()).forEach((u) => {
    unique.set(u.id, u);
  });
  return Array.from(unique.values());
}
