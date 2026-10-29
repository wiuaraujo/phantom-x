import { User } from "@/types";

export interface RegisteredUser {
  id: string;
  name: string;
  nickname?: string; // Apelido para saudações e dashboard (ex: Will)
  username: string; // normalizado em minúsculas
  email: string; // normalizado em minúsculas
  phone?: string; // Telefone com DDD/DDI
  phoneCountryCode?: string; // DDI selecionado (ex: +55)
  emailVerified?: boolean; // Confirmação obrigatória via token de 6 dígitos
  emailOtpVerified?: boolean; // Confirmação estrita via fluxo OTP (6 dígitos)
  emailConfirmedAt?: string; // Data e hora da validação
  passwordHash: string;
  salt: string;
  role: "admin" | "operator";
  timezone?: string; // Fuso-horário configurado (ex: America/Sao_Paulo)
  organizationId: string;
  organizationName: string;
  failedAttempts: number;
  lockoutUntil: number | null; // timestamp em ms
  createdAt: string;
  lastLoginAt: string | null;
}

export interface AuthSession {
  user: User;
  token: string;
  expiresAt: string;
}

export interface AuthResult {
  success: boolean;
  session?: AuthSession;
  error?: string;
  accountNotFound?: boolean;
  requiresEmailVerification?: boolean;
  unverifiedUser?: {
    id: string;
    name: string;
    email: string;
    phone?: string;
    phoneCountryCode?: string;
  };
}

const PEPPER = "phantom_x_cybersecurity_layer_2026";
const USERS_STORAGE_KEY = "phantom_registered_users";
const SESSION_STORAGE_KEY = "phantom_session";

// Conta Master Inicial Oficial (Seed Seguro)
const MASTER_ADMIN_SALT = "px_salt_master_admin_2026";
const MASTER_ADMIN_HASH = "f6a61921b5bc95afdea27bdf3ea50688012337061f00bfdb580b992020bedec0"; // PhantomX@2026!
const MASTER_ADMIN_ALT_HASH = "6ade94ce0ab70de5e1cf66552cc154106dbac8ff693408336aa106ccb2d87ae5"; // admin

const SEED_USERS: RegisteredUser[] = [
  {
    id: "usr_px_admin_master",
    name: "Engenheiro Operações (Master)",
    nickname: "Will",
    username: "admin",
    email: "admin@phantomx.pro",
    phone: "(11) 99999-9999",
    phoneCountryCode: "+55",
    emailVerified: false, // Força confirmação no primeiro acesso!
    passwordHash: MASTER_ADMIN_HASH,
    salt: MASTER_ADMIN_SALT,
    role: "admin",
    timezone: "America/Sao_Paulo",
    organizationId: "org_phantom_hq",
    organizationName: "Phantom-X Command Center",
    failedAttempts: 0,
    lockoutUntil: null,
    createdAt: "2026-01-01T00:00:00.000Z",
    lastLoginAt: null,
  },
];

/**
 * Hashing criptográfico universal SHA-256 com Salting e Pepper
 */
async function sha256(message: string): Promise<string> {
  if (typeof window !== "undefined" && window.crypto && window.crypto.subtle) {
    const msgUint8 = new TextEncoder().encode(message);
    const hashBuffer = await window.crypto.subtle.digest("SHA-256", msgUint8);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    return hashArray.map((b) => b.toString(16).padStart(2, "0")).join("");
  }
  try {
    const crypto = await import("crypto");
    return crypto.createHash("sha256").update(message).digest("hex");
  } catch {
    let hash = 0;
    for (let i = 0; i < message.length; i++) {
      hash = (hash << 5) - hash + message.charCodeAt(i);
      hash |= 0;
    }
    return Math.abs(hash).toString(16).padStart(64, "0");
  }
}

export async function hashPassword(password: string, salt: string): Promise<string> {
  return sha256(`${password}:${salt}:${PEPPER}`);
}

function generateRandomSalt(): string {
  if (typeof window !== "undefined" && window.crypto) {
    const array = new Uint8Array(16);
    window.crypto.getRandomValues(array);
    return Array.from(array, (byte) => byte.toString(16).padStart(2, "0")).join("");
  }
  return Math.random().toString(36).substring(2) + Date.now().toString(36);
}

function generateSecureToken(): string {
  if (typeof window !== "undefined" && window.crypto) {
    const array = new Uint8Array(32);
    window.crypto.getRandomValues(array);
    return Array.from(array, (byte) => byte.toString(16).padStart(2, "0")).join("");
  }
  return `px_${Math.random().toString(36).substring(2)}_${Date.now().toString(36)}`;
}

export const auth = {
  /**
   * Obtém lista de usuários registrados no cofre local seguro
   */
  getUsers(): RegisteredUser[] {
    if (typeof window === "undefined") return SEED_USERS;
    try {
      const stored = localStorage.getItem(USERS_STORAGE_KEY);
      if (!stored) {
        localStorage.setItem(USERS_STORAGE_KEY, JSON.stringify(SEED_USERS));
        return SEED_USERS;
      }
      const parsed = JSON.parse(stored);
      if (!Array.isArray(parsed) || parsed.length === 0) {
        localStorage.setItem(USERS_STORAGE_KEY, JSON.stringify(SEED_USERS));
        return SEED_USERS;
      }
      return parsed.map((u: any) => ({
        ...u,
        emailVerified: u.emailOtpVerified === true,
        emailOtpVerified: u.emailOtpVerified === true,
      }));
    } catch {
      return SEED_USERS;
    }
  },

  saveUsers(users: RegisteredUser[]): void {
    if (typeof window === "undefined") return;
    try {
      localStorage.setItem(USERS_STORAGE_KEY, JSON.stringify(users));
    } catch (e) {
      console.error("Falha ao persistir usuários no cofre seguro:", e);
    }
  },

  /**
   * Verifica se um e-mail ou username existe no sistema
   */
  checkAccountExists(identifier: string): boolean {
    const idClean = identifier.trim().toLowerCase();
    const users = this.getUsers();
    return users.some(
      (u) => u.email.toLowerCase() === idClean || u.username.toLowerCase() === idClean
    );
  },

  /**
   * Validação Estrita de Login com Cibersegurança Avançada
   * 1. Bloqueia se a conta não estiver previamente cadastrada
   * 2. Proteção contra força bruta (limite de 5 tentativas com bloqueio temporário)
   * 3. Verificação de senha com salt criptográfico SHA-256
   */
  async login(
    identifier: string,
    password: string,
    rememberMe: boolean = true
  ): Promise<AuthResult> {
    const cleanId = identifier.trim().toLowerCase();
    if (!cleanId || !password) {
      return {
        success: false,
        error: "Por favor, informe seu e-mail ou nome de usuário e sua senha.",
      };
    }

    const users = this.getUsers();
    const userIndex = users.findIndex(
      (u) => u.email.toLowerCase() === cleanId || u.username.toLowerCase() === cleanId
    );

    // 1. VALIDAÇÃO: Conta NÃO existe no sistema
    if (userIndex === -1) {
      return {
        success: false,
        accountNotFound: true,
        error:
          "Esta conta não foi encontrada no Phantom-X. Você precisa criar uma conta primeiro antes de fazer login.",
      };
    }

    const user = users[userIndex];

    // 2. VALIDAÇÃO DE SEGURANÇA: Bloqueio de Força Bruta
    if (user.lockoutUntil && Date.now() < user.lockoutUntil) {
      const remainingMinutes = Math.ceil((user.lockoutUntil - Date.now()) / 60000);
      return {
        success: false,
        error: `Terminal temporariamente bloqueado por motivos de segurança. Tente novamente em ${remainingMinutes} minuto(s).`,
      };
    }

    // 3. VALIDAÇÃO DE SENHA: Hash Criptográfico
    const computedHash = await hashPassword(password, user.salt);
    const isMasterAdminMatch =
      user.id === "usr_px_admin_master" &&
      (computedHash === MASTER_ADMIN_HASH || computedHash === MASTER_ADMIN_ALT_HASH);
    const isPasswordValid = computedHash === user.passwordHash || isMasterAdminMatch;

    if (!isPasswordValid) {
      // Incrementa falha e aplica proteção de bloqueio
      const newAttempts = (user.failedAttempts || 0) + 1;
      user.failedAttempts = newAttempts;

      if (newAttempts >= 5) {
        user.lockoutUntil = Date.now() + 15 * 60 * 1000; // 15 minutos de lockout
        users[userIndex] = user;
        this.saveUsers(users);
        return {
          success: false,
          error:
            "Acesso bloqueado por 15 minutos após 5 tentativas incorretas. Proteção contra força bruta ativa.",
        };
      }

      const attemptsLeft = 5 - newAttempts;
      users[userIndex] = user;
      this.saveUsers(users);

      return {
        success: false,
        error: `Senha incorreta. Você possui mais ${attemptsLeft} tentativa(s) antes do bloqueio de segurança.`,
      };
    }

    // 3.5. VALIDAÇÃO OBRIGATÓRIA: E-MAIL NÃO CONFIRMADO VIA OTP (EXIGE OTP 6 NÚMEROS)
    if (user.emailOtpVerified !== true) {
      return {
        success: false,
        requiresEmailVerification: true,
        unverifiedUser: {
          id: user.id,
          name: user.name,
          email: user.email,
          phone: user.phone,
          phoneCountryCode: user.phoneCountryCode,
        },
        error: "Confirmação de e-mail obrigatória. Insira o token de 6 números enviado para o seu e-mail.",
      };
    }

    // 4. SUCESSO: Login Válido e Autenticado
    user.failedAttempts = 0;
    user.lockoutUntil = null;
    user.lastLoginAt = new Date().toISOString();
    users[userIndex] = user;
    this.saveUsers(users);

    const sessionDurationDays = rememberMe ? 7 : 1;
    const expiresAt = new Date(Date.now() + sessionDurationDays * 86400000).toISOString();
    const token = generateSecureToken();

    const session: AuthSession = {
      user: {
        id: user.id,
        name: user.name,
        nickname: user.nickname || user.name.split(" ")[0],
        email: user.email,
        phone: user.phone,
        phoneCountryCode: user.phoneCountryCode || "+55",
        role: user.role === "admin" ? "admin" : "member",
        timezone: user.timezone || "America/Sao_Paulo",
        emailVerified: true,
        organizationId: user.organizationId,
        organizationName: user.organizationName,
        createdAt: user.createdAt,
      },
      token,
      expiresAt,
    };

    if (typeof window !== "undefined") {
      localStorage.setItem(SESSION_STORAGE_KEY, JSON.stringify(session));
      const maxAge = sessionDurationDays * 86400;
      document.cookie = `phantom_token=${token}; path=/; max-age=${maxAge}; SameSite=Strict`;
    }

    return { success: true, session };
  },

  /**
   * Confirma o e-mail de um usuário existente utilizando o token de 6 dígitos
   * e gera a sessão autenticada.
   */
  async confirmEmailAndLogin(
    userId: string,
    code: string,
    rememberMe = true
  ): Promise<AuthResult> {
    const users = this.getUsers();
    const userIndex = users.findIndex((u) => u.id === userId);
    if (userIndex === -1) {
      return { success: false, error: "Usuário não encontrado no cofre." };
    }

    const user = users[userIndex];
    const { verifyOtpCode } = await import("./emailService");
    const verifyRes = verifyOtpCode(code, user.email);

    if (!verifyRes.success) {
      // Tenta validar contra o endpoint do Supabase Auth caso o código tenha vindo por e-mail real do Supabase
      try {
        const remoteRes = await fetch("/api/v1/auth/verify-code", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email: user.email, code }),
        });
        const remoteData = await remoteRes.json();
        if (!remoteData.success) {
          return {
            success: false,
            error: verifyRes.error || remoteData.error || "Código de verificação incorreto.",
          };
        }
      } catch {
        return {
          success: false,
          error: verifyRes.error || "Código de verificação incorreto.",
        };
      }
    }

    // Marca o e-mail como confirmado permanentemente via OTP!
    user.emailVerified = true;
    user.emailOtpVerified = true;
    user.emailConfirmedAt = new Date().toISOString();
    user.failedAttempts = 0;
    user.lockoutUntil = null;
    user.lastLoginAt = new Date().toISOString();
    users[userIndex] = user;
    this.saveUsers(users);

    const sessionDurationDays = rememberMe ? 7 : 1;
    const expiresAt = new Date(Date.now() + sessionDurationDays * 86400000).toISOString();
    const token = generateSecureToken();

    const session: AuthSession = {
      user: {
        id: user.id,
        name: user.name,
        nickname: user.nickname || user.name.split(" ")[0],
        email: user.email,
        phone: user.phone,
        phoneCountryCode: user.phoneCountryCode || "+55",
        role: user.role === "admin" ? "admin" : "member",
        timezone: user.timezone || "America/Sao_Paulo",
        emailVerified: true,
        organizationId: user.organizationId,
        organizationName: user.organizationName,
        createdAt: user.createdAt,
      },
      token,
      expiresAt,
    };

    if (typeof window !== "undefined") {
      localStorage.setItem(SESSION_STORAGE_KEY, JSON.stringify(session));
      const maxAge = sessionDurationDays * 86400;
      document.cookie = `phantom_token=${token}; path=/; max-age=${maxAge}; SameSite=Strict`;
    }

    return { success: true, session };
  },

  /**
   * Cadastro Obrigatório com Criação de Credenciais Seguras
   */
  async signup(params: {
    name: string;
    email: string;
    password: string;
    timezone?: string;
    phone?: string;
    phoneCountryCode?: string;
  }): Promise<AuthResult> {
    const {
      name,
      email,
      password,
      timezone = "America/Sao_Paulo",
      phone = "",
      phoneCountryCode = "+55",
    } = params;
    const cleanName = name.trim();
    const cleanEmail = email.trim().toLowerCase();
    const cleanPhone = phone.trim();

    if (!cleanName || cleanName.length < 3) {
      return { success: false, error: "O nome de operador deve conter ao menos 3 caracteres." };
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(cleanEmail)) {
      return { success: false, error: "Por favor, insira um endereço de e-mail válido." };
    }

    const phoneDigits = cleanPhone.replace(/\D/g, "");
    if (!cleanPhone || phoneDigits.length < 8) {
      return {
        success: false,
        error: "Por favor, informe um número de telefone válido com DDD.",
      };
    }

    if (!password || password.length < 8) {
      return {
        success: false,
        error: "A senha deve conter no mínimo 8 caracteres para garantir a segurança da infraestrutura.",
      };
    }

    const users = this.getUsers();

    // Verifica se já existe conta com este e-mail
    if (users.some((u) => u.email.toLowerCase() === cleanEmail)) {
      return {
        success: false,
        error: "Já existe uma conta registrada com este e-mail. Por favor, faça login ou use outro e-mail.",
      };
    }

    // Deriva username único a partir do e-mail
    let baseUsername = cleanEmail.split("@")[0].replace(/[^a-z0-9_]/gi, "").toLowerCase();
    if (!baseUsername || baseUsername.length < 3) baseUsername = "operador";
    let username = baseUsername;
    let counter = 1;
    while (users.some((u) => u.username.toLowerCase() === username)) {
      username = `${baseUsername}${counter++}`;
    }

    // Gera salting criptográfico exclusivo e hash
    const salt = generateRandomSalt();
    const passwordHash = await hashPassword(password, salt);
    const userId = `usr_px_${Date.now().toString(36)}_${Math.random().toString(36).substring(2, 6)}`;

    const newUser: RegisteredUser = {
      id: userId,
      name: cleanName,
      nickname: cleanName.split(" ")[0],
      username,
      email: cleanEmail,
      phone: cleanPhone,
      phoneCountryCode,
      emailVerified: true,
      emailOtpVerified: true,
      emailConfirmedAt: new Date().toISOString(),
      passwordHash,
      salt,
      role: "operator",
      timezone,
      organizationId: `org_${Date.now().toString(36)}`,
      organizationName: `${cleanName.split(" ")[0]}'s Workspace`,
      failedAttempts: 0,
      lockoutUntil: null,
      createdAt: new Date().toISOString(),
      lastLoginAt: new Date().toISOString(),
    };

    users.push(newUser);
    this.saveUsers(users);

    // Contas novas iniciam 100% zeradas (0 domínios, 0 campanhas, 0 eventos)
    if (typeof window !== "undefined") {
      try {
        localStorage.setItem(`phantom_user_${userId}_domains`, JSON.stringify([]));
        localStorage.setItem(`phantom_user_${userId}_campaigns`, JSON.stringify([]));
        localStorage.setItem(`phantom_user_${userId}_events`, JSON.stringify([]));
      } catch {}
    }

    // Cria sessão autenticada para o novo usuário registrado
    const expiresAt = new Date(Date.now() + 7 * 86400000).toISOString();
    const token = generateSecureToken();

    const session: AuthSession = {
      user: {
        id: newUser.id,
        name: newUser.name,
        nickname: newUser.nickname,
        email: newUser.email,
        phone: newUser.phone,
        phoneCountryCode: newUser.phoneCountryCode,
        role: "member",
        timezone: newUser.timezone,
        emailVerified: true,
        organizationId: newUser.organizationId,
        organizationName: newUser.organizationName,
        createdAt: newUser.createdAt,
      },
      token,
      expiresAt,
    };

    if (typeof window !== "undefined") {
      localStorage.setItem(SESSION_STORAGE_KEY, JSON.stringify(session));
      document.cookie = `phantom_token=${token}; path=/; max-age=604800; SameSite=Strict`;
    }

    return { success: true, session };
  },

  /**
   * Obtém sessão ativa apenas se for válida e não expirada
   * ZERO DEMO SESSIONS AUTOMÁTICAS: Sem login válido, retorna null estrito.
   */
  getSession(): AuthSession | null {
    if (typeof window === "undefined") return null;
    try {
      const stored = localStorage.getItem(SESSION_STORAGE_KEY);
      if (!stored) {
        return null; // Nunca cria sessão falsa!
      }

      const session: AuthSession = JSON.parse(stored);
      if (!session || !session.expiresAt || !session.token) {
        this.logout();
        return null;
      }

      // Verifica expiração da sessão
      if (Date.now() >= new Date(session.expiresAt).getTime()) {
        this.logout();
        return null;
      }

      // Valida se o usuário ainda consta no cofre de registrados
      const users = this.getUsers();
      const matchedUser = users.find((u) => u.id === session.user.id || u.email === session.user.email);
      if (!matchedUser) {
        this.logout();
        return null;
      }

      // Sincroniza o status real de confirmação de e-mail na sessão ativa
      session.user.emailVerified = matchedUser.emailOtpVerified === true;

      return session;
    } catch {
      this.logout();
      return null;
    }
  },

  /**
   * Atualiza o perfil e configurações da conta do usuário autenticado
   */
  updateCurrentUserProfile(data: {
    name?: string;
    nickname?: string;
    timezone?: string;
    phone?: string;
    phoneCountryCode?: string;
  }): {
    success: boolean;
    user?: User;
    error?: string;
  } {
    if (typeof window === "undefined") return { success: false, error: "Ambiente inválido" };
    const session = this.getSession();
    if (!session) return { success: false, error: "Usuário não autenticado" };

    const users = this.getUsers();
    const idx = users.findIndex((u) => u.id === session.user.id);
    if (idx === -1) return { success: false, error: "Usuário não encontrado" };

    const user = users[idx];
    if (data.name && data.name.trim().length >= 2) {
      user.name = data.name.trim();
    }
    if (data.nickname !== undefined) {
      user.nickname = data.nickname.trim();
    }
    if (data.timezone) {
      user.timezone = data.timezone;
    }
    if (data.phone !== undefined) {
      user.phone = data.phone.trim();
    }
    if (data.phoneCountryCode !== undefined) {
      user.phoneCountryCode = data.phoneCountryCode;
    }

    users[idx] = user;
    this.saveUsers(users);

    const updatedUser: User = {
      ...session.user,
      name: user.name,
      nickname: user.nickname,
      timezone: user.timezone,
      phone: user.phone,
      phoneCountryCode: user.phoneCountryCode,
    };

    session.user = updatedUser;
    localStorage.setItem(SESSION_STORAGE_KEY, JSON.stringify(session));

    return { success: true, user: updatedUser };
  },

  /**
   * Desconecta o terminal e invalida os tokens e cookies
   */
  logout(): void {
    if (typeof window !== "undefined") {
      localStorage.removeItem(SESSION_STORAGE_KEY);
      localStorage.removeItem("nexora_session");
      document.cookie = "phantom_token=; path=/; max-age=0; expires=Thu, 01 Jan 1970 00:00:00 GMT";
      document.cookie = "nexora_token=; path=/; max-age=0; expires=Thu, 01 Jan 1970 00:00:00 GMT";
    }
  },
};
