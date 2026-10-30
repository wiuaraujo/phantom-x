/**
 * Validador de Segurança de Senhas de Padrão Corporativo Phantom-X
 * Regras estritas:
 * - Mínimo de 8 caracteres
 * - Pelo menos uma letra maiúscula (A-Z)
 * - Pelo menos uma letra minúscula (a-z)
 * - Pelo menos um número (0-9)
 * - Pelo menos um caractere especial (!@#$%^&*...)
 * - Bloqueio de senhas puramente numéricas
 * - Bloqueio de senhas puramente alfabéticas
 * - Bloqueio de padrões comuns e sequências fracas
 */

export interface PasswordChecks {
  minLength: boolean;
  hasUpper: boolean;
  hasLower: boolean;
  hasNumber: boolean;
  hasSpecial: boolean;
  notOnlyNumbers: boolean;
  notOnlyLetters: boolean;
  notCommon: boolean;
}

export interface PasswordValidationResult {
  isValid: boolean;
  score: number; // 0 a 100
  strengthLabel: "fraca" | "moderada" | "forte" | "blindada";
  errors: string[];
  checks: PasswordChecks;
}

const COMMON_WEAK_PASSWORDS = new Set([
  "12345678",
  "123456789",
  "1234567890",
  "password",
  "password123",
  "admin123",
  "phantom123",
  "phantom2026",
  "qwerty123",
  "qwertyuiop",
  "abcdefgh",
  "11111111",
  "00000000",
  "senha123",
  "mudar123",
  "brasil123",
]);

export function validatePasswordSecurity(password: string): PasswordValidationResult {
  const p = password || "";
  const errors: string[] = [];

  const minLength = p.length >= 8;
  const hasUpper = /[A-Z]/.test(p);
  const hasLower = /[a-z]/.test(p);
  const hasNumber = /[0-9]/.test(p);
  const hasSpecial = /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?~`#]/.test(p);
  const notOnlyNumbers = !/^\d+$/.test(p);
  const notOnlyLetters = !/^[a-zA-Z]+$/.test(p);
  const notCommon = !COMMON_WEAK_PASSWORDS.has(p.toLowerCase());

  if (!p) {
    return {
      isValid: false,
      score: 0,
      strengthLabel: "fraca",
      errors: ["A senha de acesso é obrigatória."],
      checks: {
        minLength: false,
        hasUpper: false,
        hasLower: false,
        hasNumber: false,
        hasSpecial: false,
        notOnlyNumbers: false,
        notOnlyLetters: false,
        notCommon: true,
      },
    };
  }

  // 1. Bloqueio sumário de senhas puramente numéricas
  if (!notOnlyNumbers) {
    errors.push("A senha não pode ser exclusivamente numérica. Ela deve conter letras maiúsculas, minúsculas e símbolos especiais.");
  }

  // 2. Comprimento mínimo
  if (!minLength) {
    errors.push("A senha deve conter no mínimo 8 caracteres.");
  }

  // 3. Letra maiúscula
  if (!hasUpper) {
    errors.push("A senha deve conter pelo menos uma letra maiúscula (A-Z).");
  }

  // 4. Letra minúscula
  if (!hasLower) {
    errors.push("A senha deve conter pelo menos uma letra minúscula (a-z).");
  }

  // 5. Número
  if (!hasNumber) {
    errors.push("A senha deve conter pelo menos um número (0-9).");
  }

  // 6. Caractere especial
  if (!hasSpecial) {
    errors.push("A senha deve conter pelo menos um caractere especial (!@#$%^&*...).");
  }

  // 7. Não apenas letras
  if (!notOnlyLetters && notOnlyNumbers) {
    errors.push("A senha não pode ser formada apenas por letras. Ela deve conter números e caracteres especiais.");
  }

  // 8. Senha comum
  if (!notCommon) {
    errors.push("Esta senha é muito comum ou trivial. Escolha uma senha mais segura.");
  }

  // Cálculo da pontuação de entropia
  let passedCount = 0;
  if (minLength) passedCount++;
  if (p.length >= 12) passedCount++;
  if (hasUpper) passedCount++;
  if (hasLower) passedCount++;
  if (hasNumber) passedCount++;
  if (hasSpecial) passedCount++;
  if (notOnlyNumbers) passedCount++;
  if (notOnlyLetters) passedCount++;
  if (notCommon) passedCount++;

  const score = Math.min(100, Math.round((passedCount / 9) * 100));

  let strengthLabel: "fraca" | "moderada" | "forte" | "blindada" = "fraca";
  if (score >= 90) strengthLabel = "blindada";
  else if (score >= 70) strengthLabel = "forte";
  else if (score >= 45) strengthLabel = "moderada";

  const isValid =
    minLength &&
    hasUpper &&
    hasLower &&
    hasNumber &&
    hasSpecial &&
    notOnlyNumbers &&
    notOnlyLetters &&
    notCommon;

  return {
    isValid,
    score,
    strengthLabel,
    errors,
    checks: {
      minLength,
      hasUpper,
      hasLower,
      hasNumber,
      hasSpecial,
      notOnlyNumbers,
      notOnlyLetters,
      notCommon,
    },
  };
}
