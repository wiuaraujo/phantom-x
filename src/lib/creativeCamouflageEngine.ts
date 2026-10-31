/**
 * PHANTOM-X ADVANCED CREATIVE CAMOUFLAGE BACKEND ENGINE
 * Motor de Transformação e Camuflagem de Anúncios para Bypass de Moderação
 * em Meta Ads, Google Ads e TikTok Ads.
 */

export interface CamouflageRequest {
  copy: string;
  headline?: string;
  niche?: "saude" | "financas" | "relacionamento" | "apostas" | "estetica" | "geral";
  platform?: "meta_ads" | "google_ads" | "tiktok_ads";
}

export interface CamouflagedVariation {
  id: string;
  type: "direct_sanitized" | "editorial_news" | "scientific_discovery" | "indirect_story";
  label: string;
  badge: string;
  approvalProbability: number; // Ex: 99%
  headline: string;
  bodyCopy: string;
  cta: string;
  metaAngleExplanation: string;
}

export interface CamouflageResponse {
  success: boolean;
  detectedNiche: string;
  originalRiskScore: number;
  forbiddenTriggersFound: Array<{
    term: string;
    penalty: number;
    reason: string;
  }>;
  variations: CamouflagedVariation[];
  whitepageSync: {
    recommendedTitle: string;
    recommendedSlug: string;
    schemaType: string;
    editorialHtmlSnippet: string;
    requiredLegalNotice: string;
  };
  trafficCamouflageProtocol: {
    phase1ReviewMode: "SO_WHITEPAGE";
    phase2ActiveMode: "AUTOMATICO_SMART_SWITCH";
    fbclidEnforcement: boolean;
    workerScriptAction: string;
  };
}

// Dicionário de Termos Proibidos com Substitutos de Camuflagem Semântica
const FORBIDDEN_DICTIONARY: Array<{
  pattern: RegExp;
  term: string;
  penalty: number;
  reason: string;
  safeReplacement: string;
}> = [
  // Saúde / Emagrecimento
  {
    pattern: /\b(cura\s+definitiva|curar|cura|reverter\s+diabetes)\b/gi,
    term: "cura definitiva",
    penalty: 40,
    reason: "A Meta rejeita imediatamente promessas de cura de doenças crônicas.",
    safeReplacement: "protocolo diário de vitalidade e bem-estar",
  },
  {
    pattern: /\b(perca\s+\d+\s*kg|emagreça\s+\d+\s*kg|queime\s+gordura\s+dormindo)\b/gi,
    term: "perda de peso em prazo fixo",
    penalty: 35,
    reason: "Promessas quantitativas de emagrecimento violam a política 4.3 da Meta.",
    safeReplacement: "ajustes nutricionais recomendados por especialistas em rotina saudável",
  },
  {
    pattern: /\b(chá\s+secreto|remédio\s+caseiro\s+milagroso|pílula\s+mágica)\b/gi,
    term: "substância milagrosa",
    penalty: 30,
    reason: "Alegações de poções ou pílulas ativam o filtro de fraude médica.",
    safeReplacement: "combinação natural estudada por pesquisadores",
  },

  // Finanças / Renda Extra / Riqueza
  {
    pattern: /\b(ganhe\s+r\$\s*\d+|fique\s+rico|dinheiro\s+fácil|robô\s+do\s+pix|lucro\s+garantido)\b/gi,
    term: "promessa financeira irreal",
    penalty: 45,
    reason: "A Meta e o Google banem esquemas de renda garantida e promessas de ganhos expressos.",
    safeReplacement: "desenvolvimento de competências para monetização na internet",
  },
  {
    pattern: /\b(fature\s+\d+\s*k|salário\s+sem\s+sair\s+de\s+casa|100%\s+garantido)\b/gi,
    term: "garantia absoluta de ganhos",
    penalty: 35,
    reason: "A expressão '100% garantido' em negócios aciona o classificador de risco da Meta.",
    safeReplacement: "metodologia estruturada para criação de novas fontes de receita",
  },

  // Sensacionalismo / Atributos Pessoais
  {
    pattern: /\b(você\s+está\s+gordo|você\s+está\s+com\s+vergonha|cansado\s+de\s+ser\s+pobre|endividado\?)\b/gi,
    term: "atributos pessoais negativos",
    penalty: 35,
    reason: "Políticas da Meta proíbem anúncios que afirmem defeitos pessoais do usuário.",
    safeReplacement: "para quem busca transformar sua rotina com novas práticas",
  },
  {
    pattern: /\b(o\s+que\s+a\s+indústria\s+esconde|segredo\s+proibido|médicos\s+estão\s+furiosos)\b/gi,
    term: "teoria conspiratória / clickbait",
    penalty: 25,
    reason: "Clickbait agressivo reduz o Quality Score e leva a conta para revisão manual.",
    safeReplacement: "o levantamento recente que está chamando a atenção no setor",
  },
];

export class CreativeCamouflageEngine {
  /**
   * Processa a promessa agressiva da oferta e gera o pacote de camuflagem completo para aprovação expressa.
   */
  public static processCamouflage(params: CamouflageRequest): CamouflageResponse {
    const rawCopy = (params.copy || "").trim();
    const rawHeadline = (params.headline || "").trim();
    const niche = params.niche || this.detectNiche(rawCopy + " " + rawHeadline);
    const platform = params.platform || "meta_ads";

    // 1. Identificar gatilhos proibidos no texto original
    const detectedTriggers: CamouflageResponse["forbiddenTriggersFound"] = [];
    let accumulatedPenalty = 0;

    for (const rule of FORBIDDEN_DICTIONARY) {
      if (rule.pattern.test(rawCopy) || rule.pattern.test(rawHeadline)) {
        detectedTriggers.push({
          term: rule.term,
          penalty: rule.penalty,
          reason: rule.reason,
        });
        accumulatedPenalty += rule.penalty;
      }
    }

    const originalRiskScore = Math.min(95, Math.max(15, accumulatedPenalty || 20));

    // 2. Geração das 3 Variações Camufladas de Alta Aprovação na Meta
    const variations = this.generateVariations(rawCopy, rawHeadline, niche, platform);

    // 3. Geração da Estrutura Camaleão da Whitepage
    const whitepageSync = this.generateWhitepageSync(niche, variations[0].headline);

    return {
      success: true,
      detectedNiche: niche,
      originalRiskScore,
      forbiddenTriggersFound: detectedTriggers,
      variations,
      whitepageSync,
      trafficCamouflageProtocol: {
        phase1ReviewMode: "SO_WHITEPAGE",
        phase2ActiveMode: "AUTOMATICO_SMART_SWITCH",
        fbclidEnforcement: true,
        workerScriptAction: "Injeção de Whitepage durante revisão + Desbloqueio de Blackpage para cliques legítimos mobile",
      },
    };
  }

  private static detectNiche(text: string): "saude" | "financas" | "relacionamento" | "apostas" | "estetica" | "geral" {
    const lower = text.toLowerCase();
    if (lower.includes("chá") || lower.includes("quilo") || lower.includes("kg") || lower.includes("gordura") || lower.includes("emagrec") || lower.includes("diabetes")) {
      return "saude";
    }
    if (lower.includes("r$") || lower.includes("renda") || lower.includes("fature") || lower.includes("dinheiro") || lower.includes("lucro") || lower.includes("invest")) {
      return "financas";
    }
    if (lower.includes("amor") || lower.includes("casamento") || lower.includes("atração") || lower.includes("conquist")) {
      return "relacionamento";
    }
    if (lower.includes("roleta") || lower.includes("cassino") || lower.includes("pix") || lower.includes("aposta")) {
      return "apostas";
    }
    return "geral";
  }

  private static sanitizeCopyDirectly(rawCopy: string): string {
    let sanitized = rawCopy;
    for (const rule of FORBIDDEN_DICTIONARY) {
      sanitized = sanitized.replace(rule.pattern, rule.safeReplacement);
    }
    return sanitized;
  }

  private static generateVariations(
    rawCopy: string,
    rawHeadline: string,
    niche: string,
    platform: string
  ): CamouflagedVariation[] {
    const directSanitizedText = this.sanitizeCopyDirectly(rawCopy);
    const directVariation: CamouflagedVariation = {
      id: "var_direct_sanitized",
      type: "direct_sanitized",
      label: "Camuflagem Direta da sua Copy (Bypass de Gatilhos)",
      badge: "98% de Aprovação na Meta",
      approvalProbability: 98,
      headline: rawHeadline
        ? this.sanitizeCopyDirectly(rawHeadline)
        : "Tendências e Práticas Recomendadas para o Setor",
      bodyCopy: directSanitizedText,
      cta: "Conhecer Metodologia",
      metaAngleExplanation:
        "Todos os termos proibidos (alegações de cura, prazos mágicos, cifras monetárias proibidas) foram substituídos por vocabulário editorial e educativo aceito pela moderação.",
    };

    let nicheVariations: CamouflagedVariation[] = [];

    if (niche === "saude") {
      nicheVariations = [
        {
          id: "var_editorial_1",
          type: "editorial_news",
          label: "Ângulo Editorial / Notícia (Recomendado)",
          badge: "99% de Aprovação na Meta",
          approvalProbability: 99,
          headline: "Especialistas em nutrição analisam novo protocolo que está ganhando destaque no bem-estar diário",
          bodyCopy:
            "Um levantamento recente publicado por pesquisadores da área de rotina saudável está chamando a atenção de pessoas que buscam mais disposição e equilíbrio físico. Conheça o passo a passo da metodologia explicada em detalhes.",
          cta: "Acessar Artigo Informativo",
          metaAngleExplanation:
            "A IA da Meta classifica o criativo como 'Conteúdo Noticioso e Educativo', isento de promessas milagrosas. O anúncio aprova em minutos.",
        },
        {
          id: "var_discovery_2",
          type: "scientific_discovery",
          label: "Ângulo de Descoberta / Novo Método",
          badge: "97% de Aprovação na Meta",
          approvalProbability: 97,
          headline: "O método simples baseado em ingredientes naturais que está simplificando rotinas de autocuidado",
          bodyCopy:
            "Sem procedimentos invasivos ou dietas restritivas extremas. Veja como milhares de pessoas estão aplicando 3 hábitos matinais simples para conquistar mais vitalidade ao longo do dia.",
          cta: "Ver Metodologia Completa",
          metaAngleExplanation:
            "Elimina promessas de perda de peso em prazos fixos, focando no 'método' e no 'hábito', o que dribla o classificador de alegações de saúde da Meta.",
        },
        {
          id: "var_indirect_3",
          type: "indirect_story",
          label: "Ângulo Indireto / História de Terceiros",
          badge: "96% de Aprovação na Meta",
          approvalProbability: 96,
          headline: "Como uma profissional de 42 anos reformulou seus hábitos após adotar esta prática nutricional",
          bodyCopy:
            "Acompanhe o relato prático de quem decidiu testar uma nova abordagem na alimentação diária e conquistou resultados consistentes em sua rotina de vida.",
          cta: "Conhecer a História",
          metaAngleExplanation:
            "Falar da experiência de um terceiro elimina a violação de 'Atributos Pessoais' (apontar defeitos ou fazer perguntas acusatórias ao leitor).",
        },
      ];
    } else if (niche === "financas" || niche === "apostas") {
      nicheVariations = [
        {
          id: "var_editorial_1",
          type: "editorial_news",
          label: "Ângulo Educativo / Gestão Digital",
          badge: "99% de Aprovação na Meta",
          approvalProbability: 99,
          headline: "A nova metodologia de gestão digital que profissionais estão utilizando para diversificar fontes de receita",
          bodyCopy:
            "O mercado digital continua abrindo oportunidades para quem busca novas competências práticas. Entenda como funciona a estrutura passo a passo documentada por analistas do setor.",
          cta: "Acessar Guia Profissional",
          metaAngleExplanation:
            "Substitui promessas de 'dinheiro fácil' ou 'robôs' por capacitação profissional e gestão digital, passando 100% liso na moderação de fintech/renda da Meta.",
        },
        {
          id: "var_discovery_2",
          type: "scientific_discovery",
          label: "Ângulo de Ferramenta / Tendência Tecnológica",
          badge: "98% de Aprovação na Meta",
          approvalProbability: 98,
          headline: "Como a automação e ferramentas modernas estão transformando rotinas de trabalho pela internet",
          bodyCopy:
            "Descubra as principais tendências de tecnologia aplicada e veja como operadores independentes estão estruturando seus projetos com máxima eficiência operacional.",
          cta: "Conferir Análise Completa",
          metaAngleExplanation:
            "Posiciona o anúncio como tecnologia e software, categoria com índice de aprovação extremamente alto no algoritmo de leilão.",
        },
        {
          id: "var_indirect_3",
          type: "indirect_story",
          label: "Ângulo de Estudo de Caso Prático",
          badge: "96% de Aprovação na Meta",
          approvalProbability: 96,
          headline: "Estudo de caso: a transição de carreira rumo ao ecossistema de negócios online",
          bodyCopy:
            "Confira os aprendizados práticos e os desafios superados ao implementar processos digitais organizados para gerar novas oportunidades no mercado atual.",
          cta: "Ler Estudo de Caso",
          metaAngleExplanation:
            "Evita números mágicos (ex: 'R$ 5.000/semana') e foca na narrativa de negócio, mantendo o anúncio vivo e o CPM baixo.",
        },
      ];
    } else {
      nicheVariations = [
        {
          id: "var_editorial_1",
          type: "editorial_news",
          label: "Ângulo Editorial de Curiosidade",
          badge: "99% de Aprovação na Meta",
          approvalProbability: 99,
          headline: "A abordagem inovadora que está ganhando espaço e despertando a atenção de especialistas",
          bodyCopy:
            "Um método prático e direto ao ponto que traz uma nova perspectiva para quem busca soluções inteligentes no dia a dia. Conheça todos os detalhes.",
          cta: "Saiba Mais",
          metaAngleExplanation: "Curiosidade pura sem palavras proibidas no dicionário de políticas da Meta.",
        },
        {
          id: "var_discovery_2",
          type: "scientific_discovery",
          label: "Ângulo de Guia Prático",
          badge: "98% de Aprovação na Meta",
          approvalProbability: 98,
          headline: "Guia completo: como implementar esta estratégia de forma simplificada e segura",
          bodyCopy:
            "Confira o roteiro em 3 etapas simples para dominar os fundamentos e alcançar resultados previsíveis em suas atividades.",
          cta: "Acessar Guia Gratuito",
          metaAngleExplanation: "Formato informativo que atinge máximo Quality Score no Meta Ads Manager.",
        },
        {
          id: "var_indirect_3",
          type: "indirect_story",
          label: "Ângulo de Análise Comparativa",
          badge: "97% de Aprovação na Meta",
          approvalProbability: 97,
          headline: "Análise comparativa: por que os modelos convencionais estão sendo substituídos por este novo formato",
          bodyCopy:
            "Especialistas comparam os prós e contras das abordagens tradicionais e mostram o que torna este método moderno tão procurado atualmente.",
          cta: "Conferir Comparativo",
          metaAngleExplanation: "Ângulo analítico e imparcial que nenhum revisor humano reprova.",
        },
      ];
    }

    return [directVariation, ...nicheVariations];
  }

  private static generateWhitepageSync(niche: string, headline: string) {
    const slug = headline
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/[^a-z0-9]+/g, "-")
      .slice(0, 48);

    const editorialHtmlSnippet = `<!DOCTYPE html>
<html lang="pt-BR">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${headline} | Portal Saúde &amp; Atualidades</title>
  <meta name="description" content="Artigo informativo e educativo sobre práticas modernas recomendadas por especialistas.">
  <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/tailwindcss@2.2.19/dist/tailwind.min.css">
</head>
<body class="bg-gray-50 text-gray-800 font-sans antialiased">
  <header class="bg-white border-b border-gray-200 py-4 px-6 shadow-sm">
    <div class="max-w-4xl mx-auto flex justify-between items-center">
      <span class="font-bold text-xl text-blue-900 tracking-tight">PORTAL INFORMATIVO</span>
      <span class="text-xs text-gray-500 font-mono">Artigo Educativo • Atualizado hoje</span>
    </div>
  </header>
  <main class="max-w-3xl mx-auto px-6 py-10">
    <span class="text-xs font-semibold uppercase tracking-wider text-blue-600 bg-blue-50 px-2.5 py-1 rounded-md">Tendências &amp; Estudos</span>
    <h1 class="text-2xl sm:text-3xl font-extrabold text-gray-900 mt-3 mb-4 leading-tight">${headline}</h1>
    <div class="text-sm text-gray-500 mb-8 border-b pb-4">Por Redação de Pesquisa Aplicada • Tempo de leitura: 3 min</div>
    <div class="prose max-w-none space-y-4 text-gray-700 leading-relaxed text-base">
      <p>O acompanhamento contínuo de novas práticas tem revelado avanços significativos para o dia a dia de quem busca resultados mais previsíveis e consistentes.</p>
      <p>Segundo levantamentos consolidados no setor, a adesão a rotinas simples e orientadas por princípios técnicos diminui o desgaste e potencializa a eficácia geral das iniciativas.</p>
      <p>Abaixo, detalhamos os fatores de maior impacto observados por especialistas nas últimas análises independentes...</p>
    </div>
  </main>
  <footer class="bg-white border-t border-gray-200 py-8 px-6 mt-16 text-center text-xs text-gray-400 space-y-2">
    <div>Este portal tem finalidade estritamente informativa e jornalística.</div>
    <div>Termos de Uso • Políticas de Privacidade • Contato Institucional</div>
    <div class="text-[11px] text-gray-300">© ${new Date().getFullYear()} Portal Informativo. Todos os direitos reservados.</div>
  </footer>
</body>
</html>`;

    return {
      recommendedTitle: headline,
      recommendedSlug: slug || "artigo-informativo-especial",
      schemaType: "NewsArticle",
      editorialHtmlSnippet,
      requiredLegalNotice:
        "Este conteúdo é estritamente informativo e educacional. Não substitui orientações profissionais individuais. Todos os direitos reservados. Termos de Uso e Política de Privacidade disponíveis no rodapé.",
    };
  }
}
