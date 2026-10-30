/**
 * Normalizador e Validador de Unicidade Telefônica Phantom-X
 * Impede cadastros duplicados com diferentes formatações (com/sem DDD, com/sem DDI, espaços, hífens, parênteses)
 */

export interface NormalizedPhone {
  raw: string;
  digits: string;
  nationalDigits: string;
  countryCode: string;
  canonical: string;
}

export function normalizePhoneNumber(
  phone: string | null | undefined,
  countryCode: string | null | undefined = "+55"
): NormalizedPhone {
  const raw = (phone || "").trim();
  const digits = raw.replace(/\D/g, "");
  const cleanCode = (countryCode || "+55").trim();
  const codeDigits = cleanCode.replace(/\D/g, "");

  if (!digits) {
    return {
      raw,
      digits: "",
      nationalDigits: "",
      countryCode: cleanCode,
      canonical: "",
    };
  }

  // Se o número digitado já começa com o código do país (ex: 5511999999999)
  let national = digits;
  if (codeDigits && digits.startsWith(codeDigits) && digits.length > codeDigits.length + 7) {
    national = digits.slice(codeDigits.length);
  }

  const canonical = codeDigits ? `+${codeDigits}${national}` : `+${digits}`;

  return {
    raw,
    digits,
    nationalDigits: national,
    countryCode: cleanCode,
    canonical,
  };
}

/**
 * Compara dois telefones considerando qualquer variação de formatação
 */
export function arePhoneNumbersEqual(
  phoneA: string | null | undefined,
  countryCodeA: string | null | undefined,
  phoneB: string | null | undefined,
  countryCodeB: string | null | undefined
): boolean {
  if (!phoneA || !phoneB) return false;

  const a = normalizePhoneNumber(phoneA, countryCodeA);
  const b = normalizePhoneNumber(phoneB, countryCodeB);

  if (!a.digits || !b.digits) return false;

  // 1. Comparação direta canônica internacional (ex: +5511999999999 === +5511999999999)
  if (a.canonical && b.canonical && a.canonical === b.canonical) {
    return true;
  }

  // 2. Comparação de dígitos puros
  if (a.digits === b.digits) {
    return true;
  }

  // 3. Comparação de dígitos nacionais (DDD + número)
  if (
    a.nationalDigits &&
    b.nationalDigits &&
    a.nationalDigits.length >= 8 &&
    b.nationalDigits.length >= 8 &&
    a.nationalDigits === b.nationalDigits
  ) {
    return true;
  }

  // 4. Comparação por sufixo de número nacional (caso um inclua DDI no campo de telefone)
  if (a.digits.length >= 10 && b.digits.length >= 10) {
    if (a.digits.endsWith(b.digits) || b.digits.endsWith(a.digits)) {
      return true;
    }
  }

  return false;
}
