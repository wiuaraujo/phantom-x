import { User } from "@/types";

export interface DashboardGreetingInfo {
  dayOfWeek: string; // e.g. "Quinta-feira"
  time: string; // e.g. "14:00"
  dayAndTime: string; // e.g. "Quinta-feira 14:00"
  salutation: string; // e.g. "Olá"
  displayName: string; // e.g. "Will"
  fullGreeting: string; // e.g. "Quinta-feira 14:00, Olá, Will"
  timezone: string; // e.g. "America/Sao_Paulo"
  periodGreeting: string; // e.g. "Boa tarde"
}

export function getDashboardGreeting(user?: User | null): DashboardGreetingInfo {
  const timezone = user?.timezone || "America/Sao_Paulo";
  const rawDisplayName = user?.nickname?.trim() || (user?.name ? user.name.trim().split(" ")[0] : "Operador");
  const displayName = rawDisplayName.charAt(0).toUpperCase() + rawDisplayName.slice(1);

  const now = new Date();

  // 1. Dia da Semana (pt-BR com fuso-horário do usuário)
  let dayOfWeek = "Quinta-feira";
  try {
    const dayFormatter = new Intl.DateTimeFormat("pt-BR", {
      timeZone: timezone,
      weekday: "long",
    });
    const rawDay = dayFormatter.format(now);
    dayOfWeek = rawDay.charAt(0).toUpperCase() + rawDay.slice(1);
  } catch {
    dayOfWeek = "Hoje";
  }

  // 2. Horário HH:mm
  let time = "14:00";
  let hour = 14;
  try {
    const timeFormatter = new Intl.DateTimeFormat("pt-BR", {
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

  // 3. Saudação baseada no horário
  let periodGreeting = "Olá";
  if (hour >= 5 && hour < 12) {
    periodGreeting = "Bom dia";
  } else if (hour >= 12 && hour < 18) {
    periodGreeting = "Boa tarde";
  } else {
    periodGreeting = "Boa noite";
  }

  const dayAndTime = `${dayOfWeek} ${time}`;
  const fullGreeting = `${dayAndTime}, Olá, ${displayName}!`;

  return {
    dayOfWeek,
    time,
    dayAndTime,
    salutation: "Olá",
    periodGreeting,
    displayName,
    fullGreeting,
    timezone,
  };
}
