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
  auth: {
    loginTitlePrefix: string;
    loginTitleBrand: string;
    loginSubtitle: string;
    authRequiredTitle: string;
    authRequiredDesc: string;
    accountNotFoundTitle: string;
    accountNotFoundDescPre: string;
    accountNotFoundDescPost: string;
    createAccountNow: string;
    genericError: string;
    emailOrUsername: string;
    emailPlaceholder: string;
    password: string;
    passwordPlaceholder: string;
    forgotPassword: string;
    showPassword: string;
    hidePassword: string;
    rememberMe: string;
    signInBtn: string;
    signingIn: string;
    noAccount: string;
    createAccountLink: string;
    fillRequired: string;
    passwordMinLength: string;
    invalidCredentials: string;
    authError: string;
    edgeRoutingBadge: string;
    edgeRoutingTitle: string;
    edgeRoutingDesc: string;
    activeFilteringTitle: string;
    activeFilteringDesc: string;
    realTelemetryTitle: string;
    realTelemetryDesc: string;
    showcaseTitle: string;
    showcaseSubtitle: string;
    encryptedSessionTls: string;
    securityFooter: string;
    commandCenter: string;
    commandCenterDesc: string;
    loadingConsole: string;
    // Mobile badges
    edgeBadgeSpeed: string;
    edgeBadgeSpeedSub: string;
    edgeBadgeBot: string;
    edgeBadgeBotSub: string;
    edgeBadgeVault: string;
    edgeBadgeVaultSub: string;
    // Verification Modal
    confirmAccountBadge: string;
    confirmEmailTitle: string;
    confirmEmailSubtitle: string;
    gmailCardTitle: string;
    gmailCardDesc: string;
    spamNotice: string;
    openGmailBtn: string;
    resendPrompt: string;
    resending: string;
    resendSuccess: string;
    resendError: string;
    goToLogin: string;
    close: string;
    secureActivationFooter: string;
  };
  signup: {
    signupTitle: string;
    signupSubtitle: string;
    fullName: string;
    fullNamePlaceholder: string;
    email: string;
    emailPlaceholder: string;
    phone: string;
    phonePlaceholder: string;
    timezone: string;
    password: string;
    passwordPlaceholder: string;
    confirmPassword: string;
    confirmPasswordPlaceholder: string;
    termsAgreePre: string;
    termsAgreeTerms: string;
    termsAgreeAnd: string;
    termsAgreePrivacy: string;
    createAccountBtn: string;
    creatingAccount: string;
    hasAccount: string;
    signInLink: string;
    passwordMismatch: string;
    existingAccountError: string;
    phoneAlreadyRegistered: string;
    passwordSecurityTitle: string;
    pwdReqLength: string;
    pwdReqUpper: string;
    pwdReqLower: string;
    pwdReqNumber: string;
    pwdReqSpecial: string;
    pwdReqNotNumbersOnly: string;
    pwdStrengthWeak: string;
    pwdStrengthMedium: string;
    pwdStrengthStrong: string;
    pwdStrengthFortified: string;
    invalidPhone: string;
    fillAllFields: string;
    acceptTermsRequired: string;
    showcaseTitle: string;
    showcaseSubtitle: string;
    badgeSpeed: string;
    badgeSpeedSub: string;
    badgeShield: string;
    badgeShieldSub: string;
    badgeSafe: string;
    badgeSafeSub: string;
  };
  dashboard: {
    greetingMorning: string;
    greetingAfternoon: string;
    greetingEvening: string;
    overview: string;
    liveAudit: string;
    globe360: string;
    campaigns: string;
    domains: string;
    events: string;
    cloudflareWorker: string;
    cloakerSettings: string;
    profileSettings: string;
    adminPanel: string;
    logout: string;
    logoutConfirm: string;
    allDomains: string;
    currentPlan: string;
    trialPlan: string;
    viewPlans: string;
    upgrade: string;
    notifications: string;
    systemEvents: string;
    systemMitigationTitle: string;
    systemMitigationDesc: string;
    trafficPeakTitle: string;
    trafficPeakDesc: string;
    timezoneLabel: string;
    accountEmail: string;
    emailConfirmed: string;
    emailPending: string;
    languageCardTitle: string;
    languageCardDesc: string;
    languageSavedSuccess: string;
    selectLanguage: string;
    period24h: string;
    period7d: string;
    period30d: string;
    // New Comprehensive System Keys
    overviewTitle: string;
    overviewSubtitle: string;
    greetingHello: string;
    activeVisitors: string;
    activeVisitorsSub: string;
    eventsReceived: string;
    eventsReceivedSub: string;
    filteredTraffic: string;
    filteredTrafficSub: string;
    uniqueSessions: string;
    uniqueSessionsSub: string;
    mappedCountries: string;
    mappedCountriesSub: string;
    coverageSub: string;
    trafficTelemetryTitle: string;
    totalRequests: string;
    cleanHits: string;
    threatsBlocked: string;
    blockRate: string;
    metricTotal: string;
    metricClean: string;
    metricThreats: string;
    metricShield: string;
    deviceDistribution: string;
    deviceDistributionSub: string;
    deviceMobile: string;
    deviceDesktop: string;
    deviceTablet: string;
    deviceBot: string;
    topRegions: string;
    noRegionsYet: string;
    campaignsTitle: string;
    campaignsSubtitle: string;
    domainsTitle: string;
    domainsSubtitle: string;
    eventsTitle: string;
    eventsSubtitle: string;
    liveTitle: string;
    liveSubtitle: string;
    mapTitle: string;
    mapSubtitle: string;
    settingsTitle: string;
    settingsSubtitle: string;
    areaPhantom: string;
    areaPhantomTitle: string;
    areaPhantomSubtitle: string;
  };
  common: {
    portuguese: string;
    english: string;
    spanish: string;
    save: string;
    saved: string;
    cancel: string;
    loading: string;
    close: string;
    systemLanguage: string;
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
      eyebrow: "ARQUITETURA DE BORDA • PHANTOM-X V2.4",
      titleLine1: "Infraestrutura de Tráfego Invisível.",
      titleLine2: "Em Escala Global.",
      subtitle:
        "Roteamento determinístico em borda com filtragem de bots em tempo real, entrega via Proxy Reverso transparente (HTTP 200 OK sem redirects), camuflagem inteligente para aprovação rápida e geolocalização de alta fidelidade para Meta e Google Ads.",
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
    auth: {
      loginTitlePrefix: "Entrar no",
      loginTitleBrand: "PHANTOM-X",
      loginSubtitle: "Terminal seguro de controle de tráfego e regras de borda.",
      authRequiredTitle: "Autenticação Requerida",
      authRequiredDesc: "Acesso restrito. Identifique-se com sua conta ou cadastre-se primeiro.",
      accountNotFoundTitle: "CONTA NÃO CADASTRADA NO SISTEMA",
      accountNotFoundDescPre: "O e-mail ou usuário",
      accountNotFoundDescPost: "não possui cadastro. É obrigatório registrar-se antes de entrar.",
      createAccountNow: "Criar Minha Conta Agora",
      genericError: "Falha na autenticação. Verifique suas credenciais.",
      emailOrUsername: "E-MAIL OU NOME DE USUÁRIO",
      emailPlaceholder: "seu.email@exemplo.com",
      password: "SENHA",
      passwordPlaceholder: "••••••••••••",
      forgotPassword: "Esqueceu?",
      showPassword: "Exibir senha",
      hidePassword: "Ocultar senha",
      rememberMe: "Manter sessão ativa neste terminal (7 dias)",
      signInBtn: "Acessar Console Phantom-X",
      signingIn: "Autenticando sessão criptografada...",
      noAccount: "Não possui uma conta?",
      createAccountLink: "Criar conta de operador",
      fillRequired: "Por favor, preencha todos os campos obrigatórios.",
      passwordMinLength: "A senha deve conter no mínimo 6 caracteres.",
      invalidCredentials: "Credenciais inválidas. Verifique os dados e tente novamente.",
      authError: "Ocorreu um erro no terminal de autenticação. Tente novamente.",
      edgeRoutingBadge: "Borda Global",
      edgeRoutingTitle: "Roteamento Borda",
      edgeRoutingDesc: "Execução local distribuída em mais de 14 data centers.",
      activeFilteringTitle: "Filtragem Ativa",
      activeFilteringDesc: "Heurísticas de inspeção contra bots de ad networks.",
      realTelemetryTitle: "Telemetria Real",
      realTelemetryDesc: "Métricas precisas de cliques, IPs e decisões de tráfego.",
      showcaseTitle: "Acesso ao Centro de Comando Phantom-X.",
      showcaseSubtitle:
        "Monitore fluxos de tráfego em tempo real, configure regras determinísticas de borda e proteja suas ofertas com latência submilisegundo.",
      encryptedSessionTls: "Sessão Criptografada • TLS 1.3",
      securityFooter: "Terminal protegido por SHA-256 com Salting e Detecção de Força Bruta",
      commandCenter: "Centro de Comando Phantom-X",
      commandCenterDesc: "Roteamento em borda e telemetria de tráfego em tempo real",
      loadingConsole: "Carregando console seguro...",
      edgeBadgeSpeed: "< 18ms",
      edgeBadgeSpeedSub: "Borda Global",
      edgeBadgeBot: "Anti-Bot",
      edgeBadgeBotSub: "Filtragem Ativa",
      edgeBadgeVault: "SHA-256",
      edgeBadgeVaultSub: "Cofre Seguro",
      confirmAccountBadge: "CONFIRMAÇÃO DE CONTA",
      confirmEmailTitle: "Confirme o seu E-mail",
      confirmEmailSubtitle: "Enviamos a confirmação de acesso para o seu endereço de e-mail:",
      gmailCardTitle: "Acesse o seu aplicativo ou navegador do Gmail.",
      gmailCardDesc:
        "Abra o e-mail de verificação que acabamos de enviar e confirme o seu acesso para ativar sua conta na plataforma.",
      spamNotice: "(Caso não veja na caixa de entrada principal, verifique também a pasta de Spam / Lixo Eletrônico).",
      openGmailBtn: "Abrir o Meu Gmail",
      resendPrompt: "Não recebeu? Reenviar",
      resending: "Reenviando...",
      resendSuccess: "Nova confirmação enviada com sucesso para o seu e-mail!",
      resendError: "Falha ao reenviar e-mail de confirmação. Aguarde alguns instantes.",
      goToLogin: "Ir para Login",
      close: "Fechar",
      secureActivationFooter: "Terminal protegido por infraestrutura Phantom-X Edge • Ativação Segura",
    },
    signup: {
      signupTitle: "Criar Conta de Operador",
      signupSubtitle: "Acesso à infraestrutura global de borda e blindagem de campanhas.",
      fullName: "NOME COMPLETO DO OPERADOR",
      fullNamePlaceholder: "Ex: Carlos Silva",
      email: "E-MAIL PROFISSIONAL",
      emailPlaceholder: "operador@empresa.com",
      phone: "TELEFONE (WHATSAPP)",
      phonePlaceholder: "Com DDD",
      timezone: "FUSO HORÁRIO OPERACIONAL",
      password: "SENHA DE ACESSO",
      passwordPlaceholder: "Mínimo 6 caracteres",
      confirmPassword: "CONFIRMAR SENHA",
      confirmPasswordPlaceholder: "Repita a senha",
      termsAgreePre: "Concordo com os",
      termsAgreeTerms: "Termos de Serviço",
      termsAgreeAnd: "e a",
      termsAgreePrivacy: "Política de Privacidade",
      createAccountBtn: "Criar Minha Conta no Phantom-X",
      creatingAccount: "Criando conta e provisionando chaves...",
      hasAccount: "Já possui uma conta ativa?",
      signInLink: "Acessar console existente",
      passwordMismatch: "As senhas não coincidem. Digite novamente.",
      existingAccountError: "Já existe uma conta registrada com este e-mail. Por favor, faça login ou use outro e-mail.",
      phoneAlreadyRegistered: "Este número de telefone já está cadastrado no sistema. Por favor, utilize outro número ou faça login na sua conta.",
      passwordSecurityTitle: "Segurança da Senha",
      pwdReqLength: "Mínimo 8 caracteres",
      pwdReqUpper: "Ao menos 1 letra maiúscula (A-Z)",
      pwdReqLower: "Ao menos 1 letra minúscula (a-z)",
      pwdReqNumber: "Ao menos 1 número (0-9)",
      pwdReqSpecial: "Ao menos 1 caractere especial (!@#$...)",
      pwdReqNotNumbersOnly: "Não permitido apenas números",
      pwdStrengthWeak: "Fraca",
      pwdStrengthMedium: "Moderada",
      pwdStrengthStrong: "Forte",
      pwdStrengthFortified: "Blindada",
      invalidPhone: "Por favor, informe um número de telefone válido com DDD.",
      fillAllFields: "Preencha todos os campos obrigatórios.",
      acceptTermsRequired: "É necessário concordar com os Termos de Serviço para continuar.",
      showcaseTitle: "Infraestrutura de Borda para Tráfego de Alta Performance.",
      showcaseSubtitle: "Crie sua conta em segundos e conecte seus domínios com roteamento inteligente e blindagem contra inspeção.",
      badgeSpeed: "< 14ms",
      badgeSpeedSub: "Latência em Borda",
      badgeShield: "Camada 6",
      badgeShieldSub: "Cloaking Ativo",
      badgeSafe: "200 OK",
      badgeSafeSub: "Proxy Reverso",
    },
    dashboard: {
      greetingMorning: "Bom dia",
      greetingAfternoon: "Boa tarde",
      greetingEvening: "Boa noite",
      overview: "Visão Geral & Matriz",
      liveAudit: "Auditoria Ao Vivo",
      globe360: "Globo 360º",
      campaigns: "Campanhas",
      domains: "Domínios",
      events: "Eventos",
      cloudflareWorker: "Cloudflare Worker",
      cloakerSettings: "Configurações do Cloaker",
      profileSettings: "Configurações do Perfil",
      adminPanel: "Painel Admin",
      logout: "Sair do Sistema",
      logoutConfirm: "Deseja realmente sair do sistema?",
      allDomains: "Todos os Domínios",
      currentPlan: "Plano Atual",
      trialPlan: "PLANO TRIAL",
      viewPlans: "VER PLANOS",
      upgrade: "Fazer Upgrade",
      notifications: "Notificações do Sistema",
      systemEvents: "Eventos do Sistema",
      systemMitigationTitle: "Mitigação de Tráfego Automático",
      systemMitigationDesc: "12 requisições isoladas com sucesso",
      trafficPeakTitle: "Novo pico de acessos (Brasil)",
      trafficPeakDesc: "Latência média mantida em 18ms",
      timezoneLabel: "Fuso:",
      accountEmail: "E-mail da Conta",
      emailConfirmed: "E-mail Confirmado (Gmail)",
      emailPending: "Pendente de Confirmação",
      languageCardTitle: "Idioma do Sistema",
      languageCardDesc: "Selecione o idioma de sua preferência para o painel, login e relatórios.",
      languageSavedSuccess: "Idioma atualizado com sucesso!",
      selectLanguage: "Selecionar Idioma",
      period24h: "24h",
      period7d: "7d",
      period30d: "30d",
      overviewTitle: "Visão Geral da Operação",
      overviewSubtitle: "Monitoramento unificado de borda, telemetria global e análise de risco",
      greetingHello: "Olá",
      activeVisitors: "Visitantes Ativos",
      activeVisitorsSub: "Agora em tempo real",
      eventsReceived: "Eventos Recebidos",
      eventsReceivedSub: "Últimas 24 horas",
      filteredTraffic: "Tráfego Filtrado",
      filteredTrafficSub: "Mitigados e isolados",
      uniqueSessions: "Sessões Únicas",
      uniqueSessionsSub: "Volume consolidado",
      mappedCountries: "Países Mapeados",
      mappedCountriesSub: "Origem geográfica",
      coverageSub: "Cobertura cartográfica ativa no cluster",
      trafficTelemetryTitle: "Telemetria em Tempo Real de Tráfego",
      totalRequests: "requisições totais",
      cleanHits: "acessos limpos",
      threatsBlocked: "bots retidos",
      blockRate: "taxa de bloqueio",
      metricTotal: "Volume Total",
      metricClean: "Tráfego Limpo",
      metricThreats: "Bots Barrados",
      metricShield: "Taxa de Blindagem",
      deviceDistribution: "Distribuição por Dispositivo",
      deviceDistributionSub: "Categorização de dispositivos e agentes",
      deviceMobile: "Mobile (Smartphones)",
      deviceDesktop: "Desktop (Workstations)",
      deviceTablet: "Tablets & Outros",
      deviceBot: "Bots / Reviewers Barrados",
      topRegions: "Principais Regiões",
      noRegionsYet: "Nenhuma região com tráfego registrado no momento.",
      campaignsTitle: "Camuflagens & Campanhas",
      campaignsSubtitle: "Gerenciamento de regras de proxy reverso e proteção de anúncios",
      domainsTitle: "Domínios & Roteamento",
      domainsSubtitle: "Conexão de domínios customizados com SSL automático em borda",
      eventsTitle: "Logs & Auditoria de Tráfego",
      eventsSubtitle: "Inspeção detalhada de cada requisição e heurística de decisão",
      liveTitle: "Auditoria Ao Vivo",
      liveSubtitle: "Monitoramento de tráfego em tempo real com websocket e telemetria",
      mapTitle: "Globo Global 360º",
      mapSubtitle: "Visualização cartográfica em 3D dos nós de borda e requisições",
      settingsTitle: "Configurações da Operação",
      settingsSubtitle: "Preferências de perfil, chaves de API e integração com Cloudflare",
      areaPhantom: "Área Phantom-X",
      areaPhantomTitle: "Área Phantom-X • Base de Maestria Operacional",
      areaPhantomSubtitle: "Documentação de ponta a ponta, engenharia de cloaking, estratégias de aprovação e FAQs",
    },
    common: {
      portuguese: "Português",
      english: "English",
      spanish: "Español",
      save: "Salvar",
      saved: "Salvo com sucesso!",
      cancel: "Cancelar",
      loading: "Carregando...",
      close: "Fechar",
      systemLanguage: "Idioma do Sistema",
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
      eyebrow: "EDGE ARCHITECTURE • PHANTOM-X V2.4",
      titleLine1: "Invisible Traffic Infrastructure.",
      titleLine2: "At Global Scale.",
      subtitle:
        "Deterministic edge routing with real-time bot filtering, transparent Reverse Proxy delivery (HTTP 200 OK without redirects), smart camouflage for fast ad approval, and high-fidelity edge geolocation for Meta and Google Ads.",
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
    auth: {
      loginTitlePrefix: "Sign in to",
      loginTitleBrand: "PHANTOM-X",
      loginSubtitle: "Secure edge traffic control and routing terminal.",
      authRequiredTitle: "Authentication Required",
      authRequiredDesc: "Restricted access. Sign in with your account or register first.",
      accountNotFoundTitle: "ACCOUNT NOT REGISTERED",
      accountNotFoundDescPre: "The email or username",
      accountNotFoundDescPost: "is not registered in the system. Registration is required before signing in.",
      createAccountNow: "Create My Account Now",
      genericError: "Authentication failed. Please verify your credentials.",
      emailOrUsername: "EMAIL OR USERNAME",
      emailPlaceholder: "your.email@example.com",
      password: "PASSWORD",
      passwordPlaceholder: "••••••••••••",
      forgotPassword: "Forgot?",
      showPassword: "Show password",
      hidePassword: "Hide password",
      rememberMe: "Keep session active on this device (7 days)",
      signInBtn: "Access Phantom-X Console",
      signingIn: "Authenticating encrypted session...",
      noAccount: "Don't have an account?",
      createAccountLink: "Create operator account",
      fillRequired: "Please fill in all required fields.",
      passwordMinLength: "Password must be at least 6 characters long.",
      invalidCredentials: "Invalid credentials. Please verify your details and try again.",
      authError: "An error occurred in the authentication terminal. Please try again.",
      edgeRoutingBadge: "Global Edge",
      edgeRoutingTitle: "Edge Routing",
      edgeRoutingDesc: "Local execution distributed across 14+ data centers.",
      activeFilteringTitle: "Active Filtering",
      activeFilteringDesc: "Inspection heuristics against ad network bots.",
      realTelemetryTitle: "Real-Time Telemetry",
      realTelemetryDesc: "Accurate metrics on clicks, IPs, and traffic decisions.",
      showcaseTitle: "Access the Phantom-X Command Center.",
      showcaseSubtitle:
        "Monitor real-time traffic streams, configure deterministic edge rules, and shield your offers with sub-millisecond latency.",
      encryptedSessionTls: "Encrypted Session • TLS 1.3",
      securityFooter: "Terminal protected by SHA-256 with Salting and Brute-Force Detection",
      commandCenter: "Phantom-X Command Center",
      commandCenterDesc: "Edge routing and real-time traffic telemetry",
      loadingConsole: "Loading secure console...",
      edgeBadgeSpeed: "< 18ms",
      edgeBadgeSpeedSub: "Global Edge",
      edgeBadgeBot: "Anti-Bot",
      edgeBadgeBotSub: "Active Filtering",
      edgeBadgeVault: "SHA-256",
      edgeBadgeVaultSub: "Secure Vault",
      confirmAccountBadge: "ACCOUNT CONFIRMATION",
      confirmEmailTitle: "Confirm your Email",
      confirmEmailSubtitle: "We sent access confirmation to your email address:",
      gmailCardTitle: "Access your Gmail app or web browser.",
      gmailCardDesc:
        "Open the verification email we just sent and confirm your access to activate your account on the platform.",
      spamNotice: "(If not visible in your primary inbox, please also check your Spam / Junk folder).",
      openGmailBtn: "Open My Gmail",
      resendPrompt: "Didn't receive it? Resend",
      resending: "Resending...",
      resendSuccess: "New confirmation email successfully sent!",
      resendError: "Failed to resend confirmation email. Please wait a moment.",
      goToLogin: "Go to Sign In",
      close: "Close",
      secureActivationFooter: "Terminal protected by Phantom-X Edge infrastructure • Secure Activation",
    },
    signup: {
      signupTitle: "Create Operator Account",
      signupSubtitle: "Access global edge infrastructure and campaign shielding.",
      fullName: "OPERATOR FULL NAME",
      fullNamePlaceholder: "Ex: John Doe",
      email: "PROFESSIONAL EMAIL",
      emailPlaceholder: "operator@company.com",
      phone: "PHONE NUMBER (WHATSAPP)",
      phonePlaceholder: "With area code",
      timezone: "OPERATING TIMEZONE",
      password: "ACCESS PASSWORD",
      passwordPlaceholder: "Minimum 6 characters",
      confirmPassword: "CONFIRM PASSWORD",
      confirmPasswordPlaceholder: "Repeat password",
      termsAgreePre: "I agree to the",
      termsAgreeTerms: "Terms of Service",
      termsAgreeAnd: "and",
      termsAgreePrivacy: "Privacy Policy",
      createAccountBtn: "Create My Phantom-X Account",
      creatingAccount: "Creating account and provisioning keys...",
      hasAccount: "Already have an active account?",
      signInLink: "Sign in to existing console",
      passwordMismatch: "Passwords do not match. Please try again.",
      existingAccountError: "An account with this email already exists. Please sign in or use another email.",
      phoneAlreadyRegistered: "This phone number is already registered in the system. Please use another number or sign in to your account.",
      passwordSecurityTitle: "Password Security",
      pwdReqLength: "Minimum 8 characters",
      pwdReqUpper: "At least 1 uppercase letter (A-Z)",
      pwdReqLower: "At least 1 lowercase letter (a-z)",
      pwdReqNumber: "At least 1 number (0-9)",
      pwdReqSpecial: "At least 1 special character (!@#$...)",
      pwdReqNotNumbersOnly: "Cannot be only numbers",
      pwdStrengthWeak: "Weak",
      pwdStrengthMedium: "Moderate",
      pwdStrengthStrong: "Strong",
      pwdStrengthFortified: "Hardened",
      invalidPhone: "Please provide a valid phone number with area code.",
      fillAllFields: "Please fill in all required fields.",
      acceptTermsRequired: "You must accept the Terms of Service to continue.",
      showcaseTitle: "Edge Infrastructure for High-Performance Traffic.",
      showcaseSubtitle: "Create your account in seconds and connect your domains with intelligent routing and inspection cloaking.",
      badgeSpeed: "< 14ms",
      badgeSpeedSub: "Edge Latency",
      badgeShield: "Layer 6",
      badgeShieldSub: "Active Cloaking",
      badgeSafe: "200 OK",
      badgeSafeSub: "Reverse Proxy",
    },
    dashboard: {
      greetingMorning: "Good morning",
      greetingAfternoon: "Good afternoon",
      greetingEvening: "Good evening",
      overview: "Overview & Matrix",
      liveAudit: "Live Audit",
      globe360: "360º Globe",
      campaigns: "Campaigns",
      domains: "Domains",
      events: "Events",
      cloudflareWorker: "Cloudflare Worker",
      cloakerSettings: "Cloaker Settings",
      profileSettings: "Profile Settings",
      adminPanel: "Admin Panel",
      logout: "Sign Out",
      logoutConfirm: "Are you sure you want to sign out?",
      allDomains: "All Domains",
      currentPlan: "Current Plan",
      trialPlan: "TRIAL PLAN",
      viewPlans: "VIEW PLANS",
      upgrade: "Upgrade Plan",
      notifications: "System Notifications",
      systemEvents: "System Events",
      systemMitigationTitle: "Automated Traffic Mitigation",
      systemMitigationDesc: "12 requests isolated successfully",
      trafficPeakTitle: "Traffic peak detected (Global)",
      trafficPeakDesc: "Average latency maintained at 18ms",
      timezoneLabel: "Zone:",
      accountEmail: "Account Email",
      emailConfirmed: "Email Verified (Gmail)",
      emailPending: "Pending Verification",
      languageCardTitle: "System Language",
      languageCardDesc: "Select your preferred language for the console, login, and reporting.",
      languageSavedSuccess: "Language updated successfully!",
      selectLanguage: "Select Language",
      period24h: "24h",
      period7d: "7d",
      period30d: "30d",
      overviewTitle: "Operations Overview",
      overviewSubtitle: "Unified edge monitoring, global telemetry, and risk analysis",
      greetingHello: "Hello",
      activeVisitors: "Active Visitors",
      activeVisitorsSub: "Real-time now",
      eventsReceived: "Events Received",
      eventsReceivedSub: "Last 24 hours",
      filteredTraffic: "Filtered Traffic",
      filteredTrafficSub: "Mitigated and isolated",
      uniqueSessions: "Unique Sessions",
      uniqueSessionsSub: "Consolidated volume",
      mappedCountries: "Mapped Countries",
      mappedCountriesSub: "Geographic origin",
      coverageSub: "Active cartographic coverage in cluster",
      trafficTelemetryTitle: "Real-Time Traffic Telemetry",
      totalRequests: "total requests",
      cleanHits: "clean hits",
      threatsBlocked: "blocked bots",
      blockRate: "block rate",
      metricTotal: "Total Volume",
      metricClean: "Clean Traffic",
      metricThreats: "Blocked Bots",
      metricShield: "Shielding Rate",
      deviceDistribution: "Device Distribution",
      deviceDistributionSub: "Categorization of devices and agents",
      deviceMobile: "Mobile (Smartphones)",
      deviceDesktop: "Desktop (Workstations)",
      deviceTablet: "Tablets & Others",
      deviceBot: "Blocked Bots / Reviewers",
      topRegions: "Top Regions",
      noRegionsYet: "No region with traffic recorded at the moment.",
      campaignsTitle: "Cloaking & Campaigns",
      campaignsSubtitle: "Management of reverse proxy rules and ad protection",
      domainsTitle: "Domains & Routing",
      domainsSubtitle: "Custom domain connection with automatic edge SSL",
      eventsTitle: "Traffic Logs & Auditing",
      eventsSubtitle: "Detailed inspection of each request and decision heuristic",
      liveTitle: "Live Audit",
      liveSubtitle: "Real-time traffic monitoring with websocket and telemetry",
      mapTitle: "Global 360º Globe",
      mapSubtitle: "3D cartographic visualization of edge nodes and requests",
      settingsTitle: "Operations Settings",
      settingsSubtitle: "Profile preferences, API keys, and Cloudflare integration",
      areaPhantom: "Phantom-X Area",
      areaPhantomTitle: "Phantom-X Area • Operations Mastery Hub",
      areaPhantomSubtitle: "End-to-end tutorials, cloaking engineering, ad approval playbooks, and FAQs",
    },
    common: {
      portuguese: "Português",
      english: "English",
      spanish: "Español",
      save: "Save",
      saved: "Saved successfully!",
      cancel: "Cancel",
      loading: "Loading...",
      close: "Close",
      systemLanguage: "System Language",
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
      eyebrow: "ARQUITECTURA DE BORDE • PHANTOM-X V2.4",
      titleLine1: "Infraestructura de Tráfico Invisible.",
      titleLine2: "A Escala Global.",
      subtitle:
        "Enrutamiento determinista en el borde con filtrado de bots en tiempo real, entrega transparente mediante Proxy Inverso (HTTP 200 OK sin redirecciones), camuflaje inteligente para aprobación rápida y geolocalización de alta fidelidad.",
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
    auth: {
      loginTitlePrefix: "Iniciar sesión en",
      loginTitleBrand: "PHANTOM-X",
      loginSubtitle: "Terminal seguro de control de tráfico y reglas de borde.",
      authRequiredTitle: "Autenticación Requerida",
      authRequiredDesc: "Acceso restringido. Inicie sesión con su cuenta o regístrese primero.",
      accountNotFoundTitle: "CUENTA NO REGISTRADA EN EL SISTEMA",
      accountNotFoundDescPre: "El correo o usuario",
      accountNotFoundDescPost: "no posee registro. Es obligatorio registrarse antes de entrar.",
      createAccountNow: "Crear Mi Cuenta Ahora",
      genericError: "Error de autenticación. Verifique sus credenciales.",
      emailOrUsername: "CORREO O NOMBRE DE USUARIO",
      emailPlaceholder: "su.correo@ejemplo.com",
      password: "CONTRASEÑA",
      passwordPlaceholder: "••••••••••••",
      forgotPassword: "¿Olvidó?",
      showPassword: "Mostrar contraseña",
      hidePassword: "Ocultar contraseña",
      rememberMe: "Mantener sesión activa en este terminal (7 días)",
      signInBtn: "Acceder a Consola Phantom-X",
      signingIn: "Autenticando sesión cifrada...",
      noAccount: "¿No tienes una cuenta?",
      createAccountLink: "Crear cuenta de operador",
      fillRequired: "Por favor, complete todos los campos obligatorios.",
      passwordMinLength: "La contraseña debe tener al menos 6 caracteres.",
      invalidCredentials: "Credenciales inválidas. Verifique sus datos e intente de nuevo.",
      authError: "Ocurrió un error en el terminal de autenticación. Intente de nuevo.",
      edgeRoutingBadge: "Borde Global",
      edgeRoutingTitle: "Enrutamiento de Borde",
      edgeRoutingDesc: "Ejecución local distribuida en más de 14 centros de datos.",
      activeFilteringTitle: "Filtrado Activo",
      activeFilteringDesc: "Heurísticas de inspección contra bots de redes publicitarias.",
      realTelemetryTitle: "Telemetría Real",
      realTelemetryDesc: "Métricas precisas de clics, IPs y decisiones de tráfico.",
      showcaseTitle: "Acceso al Centro de Comando Phantom-X.",
      showcaseSubtitle:
        "Supervise flujos de tráfico en tiempo real, configure reglas deterministas de borde y proteja sus ofertas con latencia de sub-milisegundos.",
      encryptedSessionTls: "Sesión Cifrada • TLS 1.3",
      securityFooter: "Terminal protegido por SHA-256 con Salting y Detección de Fuerza Bruta",
      commandCenter: "Centro de Comando Phantom-X",
      commandCenterDesc: "Enrutamiento perimetral y telemetría de tráfico en tiempo real",
      loadingConsole: "Cargando consola segura...",
      edgeBadgeSpeed: "< 18ms",
      edgeBadgeSpeedSub: "Borde Global",
      edgeBadgeBot: "Anti-Bot",
      edgeBadgeBotSub: "Filtrado Activo",
      edgeBadgeVault: "SHA-256",
      edgeBadgeVaultSub: "Cofre Seguro",
      confirmAccountBadge: "CONFIRMACIÓN DE CUENTA",
      confirmEmailTitle: "Confirme su Correo Electrónico",
      confirmEmailSubtitle: "Enviamos la confirmación de acceso a su dirección de correo:",
      gmailCardTitle: "Acceda a su aplicación o navegador de Gmail.",
      gmailCardDesc:
        "Abra el correo de verificación que acabamos de enviar y confirme su acceso para activar su cuenta en la plataforma.",
      spamNotice: "(Si no lo ve en la bandeja principal, revise también la carpeta de Spam / Correo no deseado).",
      openGmailBtn: "Abrir Mi Gmail",
      resendPrompt: "¿No lo recibió? Reenviar",
      resending: "Reenviando...",
      resendSuccess: "¡Nueva confirmación enviada con éxito a su correo!",
      resendError: "Error al reenviar correo de confirmación. Espere unos momentos.",
      goToLogin: "Ir a Iniciar Sesión",
      close: "Cerrar",
      secureActivationFooter: "Terminal protegido por infraestructura Phantom-X Edge • Activación Segura",
    },
    signup: {
      signupTitle: "Crear Cuenta de Operador",
      signupSubtitle: "Acceso a la infraestructura global de borde y protección de campañas.",
      fullName: "NOMBRE COMPLETO DEL OPERADOR",
      fullNamePlaceholder: "Ej: Carlos Silva",
      email: "CORREO PROFESIONAL",
      emailPlaceholder: "operador@empresa.com",
      phone: "TELÉFONO (WHATSAPP)",
      phonePlaceholder: "Con código de área",
      timezone: "ZONA HORARIA OPERATIVA",
      password: "CONTRASEÑA DE ACCESO",
      passwordPlaceholder: "Mínimo 6 caracteres",
      confirmPassword: "CONFIRMAR CONTRASEÑA",
      confirmPasswordPlaceholder: "Repita la contraseña",
      termsAgreePre: "Acepto los",
      termsAgreeTerms: "Términos de Servicio",
      termsAgreeAnd: "y la",
      termsAgreePrivacy: "Política de Privacidad",
      createAccountBtn: "Crear Mi Cuenta en Phantom-X",
      creatingAccount: "Creando cuenta y aprovisionando claves...",
      hasAccount: "¿Ya tienes una cuenta activa?",
      signInLink: "Acceder a consola existente",
      passwordMismatch: "Las contraseñas no coinciden. Inténtelo de nuevo.",
      existingAccountError: "Ya existe una cuenta registrada con este correo. Por favor inicie sesión o use outro correo.",
      phoneAlreadyRegistered: "Este número de teléfono ya está registrado en el sistema. Por favor use otro número o inicie sesión.",
      passwordSecurityTitle: "Seguridad de la Contraseña",
      pwdReqLength: "Mínimo 8 caracteres",
      pwdReqUpper: "Al menos 1 letra mayúscula (A-Z)",
      pwdReqLower: "Al menos 1 letra minúscula (a-z)",
      pwdReqNumber: "Al menos 1 número (0-9)",
      pwdReqSpecial: "Al menos 1 carácter especial (!@#$...)",
      pwdReqNotNumbersOnly: "No se permite solo números",
      pwdStrengthWeak: "Débil",
      pwdStrengthMedium: "Moderada",
      pwdStrengthStrong: "Fuerte",
      pwdStrengthFortified: "Blindada",
      invalidPhone: "Por favor, ingrese un número de teléfono válido con código de área.",
      fillAllFields: "Complete todos los campos obligatorios.",
      acceptTermsRequired: "Debe aceptar los Términos de Servicio para continuar.",
      showcaseTitle: "Infraestructura de Borde para Tráfico de Alto Rendimiento.",
      showcaseSubtitle: "Cree su cuenta en segundos y conecte sus dominios con enrutamiento inteligente y protección contra inspección.",
      badgeSpeed: "< 14ms",
      badgeSpeedSub: "Latencia de Borde",
      badgeShield: "Capa 6",
      badgeShieldSub: "Cloaking Activo",
      badgeSafe: "200 OK",
      badgeSafeSub: "Proxy Inverso",
    },
    dashboard: {
      greetingMorning: "Buenos días",
      greetingAfternoon: "Buenas tardes",
      greetingEvening: "Buenas noches",
      overview: "Visión General y Matriz",
      liveAudit: "Auditoría en Vivo",
      globe360: "Globo 360º",
      campaigns: "Campañas",
      domains: "Dominios",
      events: "Eventos",
      cloudflareWorker: "Cloudflare Worker",
      cloakerSettings: "Configuración del Cloaker",
      profileSettings: "Configuración del Perfil",
      adminPanel: "Panel de Admin",
      logout: "Cerrar Sesión",
      logoutConfirm: "¿Realmente desea cerrar sesión?",
      allDomains: "Todos los Dominios",
      currentPlan: "Plan Actual",
      trialPlan: "PLAN TRIAL",
      viewPlans: "VER PLANES",
      upgrade: "Actualizar Plan",
      notifications: "Notificaciones del Sistema",
      systemEvents: "Eventos del Sistema",
      systemMitigationTitle: "Mitigación Automática de Tráfico",
      systemMitigationDesc: "12 solicitudes aisladas con éxito",
      trafficPeakTitle: "Pico de tráfico detectado (Global)",
      trafficPeakDesc: "Latencia promedio mantenida en 18ms",
      timezoneLabel: "Zona:",
      accountEmail: "Correo de la Cuenta",
      emailConfirmed: "Correo Verificado (Gmail)",
      emailPending: "Pendiente de Verificación",
      languageCardTitle: "Idioma del Sistema",
      languageCardDesc: "Seleccione su idioma preferido para el panel, inicio de sesión e informes.",
      languageSavedSuccess: "¡Idioma actualizado con éxito!",
      selectLanguage: "Seleccionar Idioma",
      period24h: "24h",
      period7d: "7d",
      period30d: "30d",
      overviewTitle: "Visión General de la Operación",
      overviewSubtitle: "Monitoreo unificado de borde, telemetría global y análisis de riesgo",
      greetingHello: "Hola",
      activeVisitors: "Visitantes Activos",
      activeVisitorsSub: "Ahora en tiempo real",
      eventsReceived: "Eventos Recibidos",
      eventsReceivedSub: "Últimas 24 horas",
      filteredTraffic: "Tráfico Filtrado",
      filteredTrafficSub: "Mitigados y aislados",
      uniqueSessions: "Sesiones Únicas",
      uniqueSessionsSub: "Volumen consolidado",
      mappedCountries: "Países Mapeados",
      mappedCountriesSub: "Origen geográfico",
      coverageSub: "Cobertura cartográfica activa en el clúster",
      trafficTelemetryTitle: "Telemetría en Tiempo Real de Tráfico",
      totalRequests: "solicitudes totales",
      cleanHits: "accesos limpios",
      threatsBlocked: "bots retenidos",
      blockRate: "tasa de bloqueo",
      metricTotal: "Volumen Total",
      metricClean: "Tráfico Limpio",
      metricThreats: "Bots Bloqueados",
      metricShield: "Tasa de Blindaje",
      deviceDistribution: "Distribución por Dispositivo",
      deviceDistributionSub: "Categorización de dispositivos y agentes",
      deviceMobile: "Móvil (Smartphones)",
      deviceDesktop: "Escritorio (Workstations)",
      deviceTablet: "Tabletas y Otros",
      deviceBot: "Bots / Revisores Bloqueados",
      topRegions: "Regiones Principales",
      noRegionsYet: "Ninguna región con tráfico registrado en este momento.",
      campaignsTitle: "Camuflajes y Campañas",
      campaignsSubtitle: "Gestión de reglas de proxy inverso y protección de anuncios",
      domainsTitle: "Dominios y Enrutamiento",
      domainsSubtitle: "Conexión de dominios personalizados con SSL automático en borde",
      eventsTitle: "Registros y Auditoría de Tráfico",
      eventsSubtitle: "Inspección detallada de cada solicitud y heurística de decisión",
      liveTitle: "Auditoría en Vivo",
      liveSubtitle: "Monitoreo de tráfico en tiempo real con websocket y telemetría",
      mapTitle: "Globo Global 360º",
      mapSubtitle: "Visualización cartográfica en 3D de nodos de borde y solicitudes",
      settingsTitle: "Configuraciones de la Operación",
      settingsSubtitle: "Preferencias de perfil, claves de API e integración con Cloudflare",
      areaPhantom: "Área Phantom-X",
      areaPhantomTitle: "Área Phantom-X • Base de Maestría Operacional",
      areaPhantomSubtitle: "Tutoriales integrales, ingeniería de cloaking, estrategias de aprobación y preguntas frecuentes",
    },
    common: {
      portuguese: "Português",
      english: "English",
      spanish: "Español",
      save: "Guardar",
      saved: "¡Guardado con éxito!",
      cancel: "Cancelar",
      loading: "Cargando...",
      close: "Cerrar",
      systemLanguage: "Idioma del Sistema",
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
    try {
      const saved = localStorage.getItem("phantom_lang") as Language;
      if (saved && (saved === "pt" || saved === "en" || saved === "es")) {
        setLanguageState(saved);
      }
    } catch {}

    const handleExternalChange = (e: any) => {
      if (e.detail?.language && (e.detail.language === "pt" || e.detail.language === "en" || e.detail.language === "es")) {
        setLanguageState(e.detail.language);
      }
    };
    window.addEventListener("phantom_lang_changed", handleExternalChange);
    return () => window.removeEventListener("phantom_lang_changed", handleExternalChange);
  }, []);

  const setLanguage = (lang: Language) => {
    setLanguageState(lang);
    try {
      localStorage.setItem("phantom_lang", lang);
      window.dispatchEvent(new CustomEvent("phantom_lang_changed", { detail: { language: lang } }));
    } catch {}
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t: translations[language] }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => useContext(LanguageContext);
