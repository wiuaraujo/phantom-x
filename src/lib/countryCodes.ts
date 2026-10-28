export interface CountryCallingCode {
  iso: string;
  name: string;
  code: string;
  flag: string;
  placeholder: string;
  minDigits: number;
  maxDigits: number;
}

export const COUNTRY_CALLING_CODES: CountryCallingCode[] = [
  {
    iso: "BR",
    name: "Brasil",
    code: "+55",
    flag: "🇧🇷",
    placeholder: "(11) 98765-4321",
    minDigits: 10,
    maxDigits: 11,
  },
  {
    iso: "US",
    name: "Estados Unidos",
    code: "+1",
    flag: "🇺🇸",
    placeholder: "(555) 123-4567",
    minDigits: 10,
    maxDigits: 10,
  },
  {
    iso: "PT",
    name: "Portugal",
    code: "+351",
    flag: "🇵🇹",
    placeholder: "912 345 678",
    minDigits: 9,
    maxDigits: 9,
  },
  {
    iso: "ES",
    name: "Espanha",
    code: "+34",
    flag: "🇪🇸",
    placeholder: "612 345 678",
    minDigits: 9,
    maxDigits: 9,
  },
  {
    iso: "GB",
    name: "Reino Unido",
    code: "+44",
    flag: "🇬🇧",
    placeholder: "7911 123456",
    minDigits: 10,
    maxDigits: 11,
  },
  {
    iso: "DE",
    name: "Alemanha",
    code: "+49",
    flag: "🇩🇪",
    placeholder: "151 12345678",
    minDigits: 10,
    maxDigits: 11,
  },
  {
    iso: "FR",
    name: "França",
    code: "+33",
    flag: "🇫🇷",
    placeholder: "6 12 34 56 78",
    minDigits: 9,
    maxDigits: 9,
  },
  {
    iso: "IT",
    name: "Itália",
    code: "+39",
    flag: "🇮🇹",
    placeholder: "312 345 6789",
    minDigits: 9,
    maxDigits: 10,
  },
  {
    iso: "AR",
    name: "Argentina",
    code: "+54",
    flag: "🇦🇷",
    placeholder: "11 2345-6789",
    minDigits: 10,
    maxDigits: 11,
  },
  {
    iso: "CL",
    name: "Chile",
    code: "+56",
    flag: "🇨🇱",
    placeholder: "9 1234 5678",
    minDigits: 9,
    maxDigits: 9,
  },
  {
    iso: "CO",
    name: "Colômbia",
    code: "+57",
    flag: "🇨🇴",
    placeholder: "300 123 4567",
    minDigits: 10,
    maxDigits: 10,
  },
  {
    iso: "MX",
    name: "México",
    code: "+52",
    flag: "🇲🇽",
    placeholder: "55 1234 5678",
    minDigits: 10,
    maxDigits: 10,
  },
  {
    iso: "PY",
    name: "Paraguai",
    code: "+595",
    flag: "🇵🇾",
    placeholder: "981 123 456",
    minDigits: 9,
    maxDigits: 9,
  },
  {
    iso: "UY",
    name: "Uruguai",
    code: "+598",
    flag: "🇺🇾",
    placeholder: "99 123 456",
    minDigits: 8,
    maxDigits: 8,
  },
  {
    iso: "CA",
    name: "Canadá",
    code: "+1",
    flag: "🇨🇦",
    placeholder: "(555) 123-4567",
    minDigits: 10,
    maxDigits: 10,
  },
  {
    iso: "JP",
    name: "Japão",
    code: "+81",
    flag: "🇯🇵",
    placeholder: "90 1234 5678",
    minDigits: 10,
    maxDigits: 11,
  },
  {
    iso: "AU",
    name: "Austrália",
    code: "+61",
    flag: "🇦🇺",
    placeholder: "412 345 678",
    minDigits: 9,
    maxDigits: 9,
  },
  {
    iso: "CH",
    name: "Suíça",
    code: "+41",
    flag: "🇨🇭",
    placeholder: "78 123 45 67",
    minDigits: 9,
    maxDigits: 9,
  },
  {
    iso: "IE",
    name: "Irlanda",
    code: "+353",
    flag: "🇮🇪",
    placeholder: "85 123 4567",
    minDigits: 9,
    maxDigits: 9,
  },
  {
    iso: "NL",
    name: "Holanda",
    code: "+31",
    flag: "🇳🇱",
    placeholder: "6 12345678",
    minDigits: 9,
    maxDigits: 9,
  },
  {
    iso: "AE",
    name: "Emirados Árabes",
    code: "+971",
    flag: "🇦🇪",
    placeholder: "50 123 4567",
    minDigits: 9,
    maxDigits: 9,
  },
];

export const DEFAULT_COUNTRY_CALLING_CODE = COUNTRY_CALLING_CODES[0]; // 🇧🇷 Brasil +55

/**
 * Formata um número de telefone com base no DDI/código do país selecionado
 */
export function formatPhoneNumber(rawValue: string, countryCode: string = "+55"): string {
  const digits = rawValue.replace(/\D/g, "");

  // Brasil (+55) - (DD) 9XXXX-XXXX ou (DD) XXXX-XXXX
  if (countryCode === "+55") {
    const limited = digits.slice(0, 11);
    if (!limited) return "";
    if (limited.length <= 2) {
      return `(${limited}`;
    }
    if (limited.length <= 6) {
      return `(${limited.slice(0, 2)}) ${limited.slice(2)}`;
    }
    if (limited.length <= 10) {
      return `(${limited.slice(0, 2)}) ${limited.slice(2, 6)}-${limited.slice(6)}`;
    }
    return `(${limited.slice(0, 2)}) ${limited.slice(2, 7)}-${limited.slice(7, 11)}`;
  }

  // Estados Unidos / Canadá (+1) - (XXX) XXX-XXXX
  if (countryCode === "+1") {
    const limited = digits.slice(0, 10);
    if (!limited) return "";
    if (limited.length <= 3) {
      return `(${limited}`;
    }
    if (limited.length <= 6) {
      return `(${limited.slice(0, 3)}) ${limited.slice(3)}`;
    }
    return `(${limited.slice(0, 3)}) ${limited.slice(3, 6)}-${limited.slice(6, 10)}`;
  }

  // Portugal (+351), Espanha (+34) - 9 dígitos divididos em 3 grupos de 3 (XXX XXX XXX)
  if (countryCode === "+351" || countryCode === "+34") {
    const limited = digits.slice(0, 9);
    if (!limited) return "";
    if (limited.length <= 3) return limited;
    if (limited.length <= 6) return `${limited.slice(0, 3)} ${limited.slice(3)}`;
    return `${limited.slice(0, 3)} ${limited.slice(3, 6)} ${limited.slice(6, 9)}`;
  }

  // Reino Unido (+44) / Alemanha (+49) / Japão (+81)
  if (countryCode === "+44" || countryCode === "+49" || countryCode === "+81") {
    const limited = digits.slice(0, 11);
    if (!limited) return "";
    if (limited.length <= 4) return limited;
    if (limited.length <= 7) return `${limited.slice(0, 4)} ${limited.slice(4)}`;
    return `${limited.slice(0, 4)} ${limited.slice(4, 7)} ${limited.slice(7)}`;
  }

  // Padrão genérico: grupos de 3 ou 4 dígitos
  const limited = digits.slice(0, 12);
  if (!limited) return "";
  if (limited.length <= 3) return limited;
  if (limited.length <= 6) return `${limited.slice(0, 3)} ${limited.slice(3)}`;
  if (limited.length <= 9) return `${limited.slice(0, 3)} ${limited.slice(3, 6)} ${limited.slice(6)}`;
  return `${limited.slice(0, 3)} ${limited.slice(3, 6)} ${limited.slice(6, 9)} ${limited.slice(9)}`;
}
