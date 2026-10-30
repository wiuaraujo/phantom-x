import { User } from "@/types";
import { Language } from "./i18n";

export interface DashboardGreetingInfo {
  dayOfWeek: string; // e.g. "Quinta-feira" / "Thursday" / "Jueves"
  time: string; // e.g. "14:00"
  dayAndTime: string; // e.g. "Quinta-feira 14:00"
  salutation: string; // e.g. "Olá" / "Hello" / "Hola"
  displayName: string; // e.g. "Will"
  fullGreeting: string; // e.g. "Quinta-feira 14:00, Olá, Will!"
  timezone: string; // e.g. "America/Sao_Paulo"
  periodGreeting: string; // e.g. "Boa tarde"
}

export function getDashboardGreeting(user?: User | null, lang: Language = "pt"): DashboardGreetingInfo {
  const timezone = user?.timezone || "America/Sao_Paulo";
  const rawDisplayName = user?.nickname?.trim() || (user?.name ? user.name.trim().split(" ")[0] : "Operador");
  const displayName = rawDisplayName.charAt(0).toUpperCase() + rawDisplayName.slice(1);

  const now = new Date();

  const localeMap: Record<Language, string> = {
    pt: "pt-BR",
    en: "en-US",
    es: "es-ES",
  };
  const activeLocale = localeMap[lang] || "pt-BR";

  // 1. Dia da Semana com fuso-horário do usuário e idioma ativo
  let dayOfWeek = "Hoje";
  try {
    const dayFormatter = new Intl.DateTimeFormat(activeLocale, {
      timeZone: timezone,
      weekday: "long",
    });
    const rawDay = dayFormatter.format(now);
    dayOfWeek = rawDay.charAt(0).toUpperCase() + rawDay.slice(1);
  } catch {
    dayOfWeek = lang === "en" ? "Today" : lang === "es" ? "Hoy" : "Hoje";
  }

  // 2. Horário HH:mm
  let time = "14:00";
  let hour = 14;
  try {
    const timeFormatter = new Intl.DateTimeFormat(activeLocale, {
      timeZone: timezone,
      hour: "2-digit",
      minute: "2-digit",
      hour12: false,
    });
    time = timeFormatter.format(now);

    const hourFormatter = new Intl.DateTimeFormat("en-US", {
      timeZone: timezone,
      hour: "numeric",
      hour12: false,
    });
    hour = parseInt(hourFormatter.format(now), 10);
  } catch {
    time = `${now.getHours().toString().padStart(2, "0")}:${now.getMinutes().toString().padStart(2, "0")}`;
    hour = now.getHours();
  }

  // 3. Saudação baseada no horário e idioma
  let periodGreeting = "Olá";
  let salutation = "Olá";

  if (lang === "en") {
    salutation = "Hello";
    if (hour >= 5 && hour < 12) {
      periodGreeting = "Good morning";
    } else if (hour >= 12 && hour < 18) {
      periodGreeting = "Good afternoon";
    } else {
      periodGreeting = "Good evening";
    }
  } else if (lang === "es") {
    salutation = "Hola";
    if (hour >= 5 && hour < 12) {
      periodGreeting = "Buenos días";
    } else if (hour >= 12 && hour < 18) {
      periodGreeting = "Buenas tardes";
    } else {
      periodGreeting = "Buenas noches";
    }
  } else {
    // pt
    salutation = "Olá";
    if (hour >= 5 && hour < 12) {
      periodGreeting = "Bom dia";
    } else if (hour >= 12 && hour < 18) {
      periodGreeting = "Boa tarde";
    } else {
      periodGreeting = "Boa noite";
    }
  }

  const dayAndTime = `${dayOfWeek} ${time}`;
  const fullGreeting =
    lang === "es"
      ? `${dayAndTime}, ¡Hola, ${displayName}!`
      : `${dayAndTime}, ${salutation}, ${displayName}!`;

  return {
    dayOfWeek,
    time,
    dayAndTime,
    salutation,
    periodGreeting,
    displayName,
    fullGreeting,
    timezone,
  };
}
