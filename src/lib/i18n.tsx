"use client";

import React, { createContext, useContext, useState, useEffect } from "react";

export type Language = "pt" | "en" | "es";

export interface Translations {
  nav: {
    features: string;
    howItWorks: string;
    demo: string;
    pricing: string;
    signIn: string;
    getStarted: string;
  };
  hero: {
    eyebrow: string;
    titleLine1: string;
    titleLine2: string;
    subtitle: string;
    startFree: string;
    explore: string;
    latency: string;
    cluster: string;
    cleanTraffic: string;
    proxyBadge: string;
  };
  demo: {
    title: string;
    subtitle: string;
    demoEnv: string;
    createAccount: string;
    matrixTitle: string;
    filterBy: string;
    clickToFilter: string;
  };
}

const translations: Record<Language, Translations> = {
  pt: {
    nav: {
      features: "Funcionalidades",
      howItWorks: "Como Funciona",
      demo: "Demonstração",
      pricing: "Preços",
      signIn: "Entrar",
      getStarted: "Começar grátis",
    },
    hero: {
      eyebrow: "ARQUITETURA DE BORDA • CLOAKILIOSHIELD V2.4",
      titleLine1: "Infraestrutura de Tráfego Invisível.",
      titleLine2: "Em Escala Global.",
      subtitle:
        "Roteamento determinístico em borda com filtragem de bots em tempo real, entrega via Proxy Reverso transparente (HTTP 200 OK sem redirects) e blindagem contra moderadores de anúncios.",
      startFree: "Criar Conta Gratuita",
      explore: "Conhecer a Arquitetura",
      latency: "Latência de Borda: < 14ms",
      cluster: "Cluster Global: 14 PoPs Ativos",
      cleanTraffic: "Entrega: Proxy Reverso 200 OK",
      proxyBadge: "Filtro 6 Camadas Ativo",
    },
    demo: {
      title: "A interface em ação.",
      subtitle: "Monitore acessos, telemetria de requisições e atividade de rede em tempo real.",
      demoEnv: "Ambiente Demonstrativo",
      createAccount: "Criar Conta Gratuita",
      matrixTitle: "MATRIZ DE TELEMETRIA GLOBAL EM TEMPO REAL",
      filterBy: "Filtrando por",
      clickToFilter: "Passe o cursor sobre os pontos ou clique para filtrar",
    },
  },
  en: {
    nav: {
      features: "Features",
      howItWorks: "How It Works",
      demo: "Demo",
      pricing: "Pricing",
      signIn: "Sign In",
      getStarted: "Get Started",
    },
    hero: {
      eyebrow: "EDGE ARCHITECTURE • CLOAKILIOSHIELD V2.4",
      titleLine1: "Invisible Traffic Infrastructure.",
      titleLine2: "At Global Scale.",
      subtitle:
        "Deterministic edge routing with real-time bot filtering, transparent Reverse Proxy delivery (HTTP 200 OK without redirects), and full ad reviewer shielding.",
      startFree: "Create Free Account",
      explore: "Explore Architecture",
      latency: "Edge Latency: < 14ms",
      cluster: "Global Cluster: 14 Active PoPs",
      cleanTraffic: "Delivery: Reverse Proxy 200 OK",
      proxyBadge: "6-Layer Filter Active",
    },
    demo: {
      title: "The interface in action.",
      subtitle: "Monitor accesses, request telemetry, and network activity in real time.",
      demoEnv: "Demo Environment",
      createAccount: "Create Free Account",
      matrixTitle: "GLOBAL REAL-TIME TELEMETRY MATRIX",
      filterBy: "Filtering by",
      clickToFilter: "Hover over dots or click to filter",
    },
  },
  es: {
    nav: {
      features: "Funcionalidades",
      howItWorks: "Cómo Funciona",
      demo: "Demostración",
      pricing: "Precios",
      signIn: "Iniciar Sesión",
      getStarted: "Comenzar gratis",
    },
    hero: {
      eyebrow: "ARQUITECTURA DE BORDE • CLOAKILIOSHIELD V2.4",
      titleLine1: "Infraestructura de Tráfico Invisible.",
      titleLine2: "A Escala Global.",
      subtitle:
        "Enrutamiento determinista en el borde con filtrado de bots en tiempo real, entrega transparente mediante Proxy Inverso (HTTP 200 OK sin redirecciones) y protección de atribución.",
      startFree: "Crear Cuenta Gratuita",
      explore: "Explorar la Arquitectura",
      latency: "Latencia de Borde: < 14ms",
      cluster: "Cluster Global: 14 PoPs Activos",
      cleanTraffic: "Entrega: Proxy Inverso 200 OK",
      proxyBadge: "Filtro 6 Capas Activo",
    },
    demo: {
      title: "La interfaz en acción.",
      subtitle: "Supervise accesos, telemetría de solicitudes y actividad de red en tiempo real.",
      demoEnv: "Ambiente Demostrativo",
      createAccount: "Crear Cuenta Gratuita",
      matrixTitle: "MATRIZ DE TELEMETRÍA GLOBAL EN TIEMPO REAL",
      filterBy: "Filtrando por",
      clickToFilter: "Pase el cursor sobre los puntos o haga clic para filtrar",
    },
  },
};

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: Translations;
}

const LanguageContext = createContext<LanguageContextType>({
  language: "pt",
  setLanguage: () => {},
  t: translations.pt,
});

export const LanguageProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [language, setLanguageState] = useState<Language>("pt");

  useEffect(() => {
    const saved = localStorage.getItem("phantom_lang") as Language;
    if (saved && (saved === "pt" || saved === "en" || saved === "es")) {
      setLanguageState(saved);
    }
  }, []);

  const setLanguage = (lang: Language) => {
    setLanguageState(lang);
    localStorage.setItem("phantom_lang", lang);
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t: translations[language] }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => useContext(LanguageContext);
