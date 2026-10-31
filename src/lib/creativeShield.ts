/**
 * PHANTOM-X CREATIVE SHIELD & COMPLIANCE PRE-FLIGHT ENGINE
 * Arquitetura de Engenharia Ad-Tech para Máxima Taxa de Aprovação em Meta Ads, Google Ads e TikTok Ads
 */

export interface PolicyTrigger {
  id: string;
  category: "health_claims" | "financial_promises" | "sensationalism" | "personal_attributes" | "aggressive_syntax";
  categoryLabel: string;
  matchedWord: string;
  severity: "critical" | "high" | "medium";
  penalty: number;
  explanation: string;
  suggestedReplacement: string;
}

export interface CreativeAuditResult {
  approvalScore: number; // 0 a 100%
  approvalStatus: "critical_risk" | "moderate_risk" | "high_approval" | "maximum_approval";
  statusLabel: string;
  triggers: PolicyTrigger[];
  sanitizedCopy: string;
  headlineSuggestions: string[];
  coherenceWhitepage: {
    suggestedPageTitle: string;
    suggestedSlug: string;
    schemaType: string;
    editorialAngle: string;
    requiredLegalNotice: string;
  };
  recommendations: string[];
}

// Dicionário de Gatilhos de Reprovação das Plataformas de Tráfego (Meta & Google Policies)
const POLICY_TRIGGER_RULES: Array<{
  pattern: RegExp;
  category: PolicyTrigger["category"];
  categoryLabel: string;
  severity: PolicyTrigger["severity"];
  penalty: number;
  explanation: string;
  replacement: string;
}> = [
  // 1. Saúde / Promessas Médicas / Cura
  {
    pattern: /\b(cura\s+definitiva|curar|eliminar|elimine\s+de\s+vez|reverter\s+diabetes|perca\s+\d+\s*kg\s+em\s+\d+|queime\s+gordura\s+dormindo)\b/gi,
    category: "health_claims",
    categoryLabel: "Promessa de Saúde / Cura Impossível",
    severity: "critical",
    penalty: 35,
    explanation: "A Meta e o Google proíbem terminantemente alegações de cura ou perda de peso em prazos específicos.",
    replacement: "aprimorar seus hábitos de bem-estar e vitalidade diária",
  },
  {
    pattern: /\b(chá\s+secreto|pílula\s+mágica|remédio\s+natural\s+secreto|injeção\s+caseira)\b/gi,
    category: "health_claims",
    categoryLabel: "Substância Não Regulamentada",
    severity: "critical",
    penalty: 30,
    explanation: "Termos que sugerem tratamentos milagrosos sem comprovação médica ativam flag de banimento imediato.",
    replacement: "protocolo nutricional com respaldo em hábitos saudáveis",
  },

  // 2. Finanças / Riqueza Fácil / Promessas de Renda
  {
    pattern: /\b(ganhe\s+r\$\s*\d+|lucro\s+garantido|renda\s+passiva\s+garantida|fique\s+rico|dinheiro\s+fácil|robô\s+do\s+pix|multiplique\s+seu\s+capital)\b/gi,
    category: "financial_promises",
    categoryLabel: "Promessa Financeira Exagerada / Renda Fácil",
    severity: "critical",
    penalty: 40,
    explanation: "A Meta proíbe esquemas de enriquecimento rápido, 'robôs de pix' e promessas irrealistas de ganhos.",
    replacement: "desenvolva competências práticas para estruturar uma nova fonte de receita",
  },
  {
    pattern: /\b(fature\s+\d+\s*k\s+por\s+mês|salário\s+sem\s+sair\s+de\s+casa|sem\s+esforço|100%\s+garantido)\b/gi,
    category: "financial_promises",
    categoryLabel: "Garantia Absoluta Financeira",
    severity: "high",
    penalty: 25,
    explanation: "O termo '100% garantido' em finanças é um gatilho direto do algoritmo de fraude da Meta.",
    replacement: "metodologia estruturada para impulsionar seus resultados profissionais",
  },

  // 3. Sensacionalismo / Clickbait / Teoria da Conspiração
  {
    pattern: /\b(o\s+que\s+a\s+indústria\s+esconde|segredo\s+proibido|médicos\s+estão\s+furiosos|estão\s+tentando\s+apagar\s+esse\s+vídeo|chocante)\b/gi,
    category: "sensationalism",
    categoryLabel: "Sensacionalismo e Clickbait",
    severity: "high",
    penalty: 20,
    explanation: "Linguagem conspiratória aciona o classificador de Clickbait e Low Quality Landing Page da Meta.",
    replacement: "o estudo e as descobertas recentes que estão chamando a atenção no setor",
  },
  {
    pattern: /\b(urgente[!]*|última\s+chance[!]*|assista\s+antes\s+que\s+saia\s+do\s+ar)\b/gi,
    category: "sensationalism",
    categoryLabel: "Urgência Artificiosa Agressiva",
    severity: "medium",
    penalty: 12,
    explanation: "Falsa escassez forçada diminui o Quality Score do criativo e encarece o leilão.",
    replacement: "confira os detalhes deste conteúdo exclusivo enquanto está disponível",
  },

  // 4. Atributos Pessoais & Constrangimento
  {
    pattern: /\b(você\s+está\s+com\s+vergonha|você\s+está\s+gordo|você\s+está\s+falido|endividado\?|cansado\s+de\s+ser\s+pobre)\b/gi,
    category: "personal_attributes",
    categoryLabel: "Atributos Pessoais Negativos",
    severity: "critical",
    penalty: 30,
    explanation: "A Meta proíbe anúncios que afirmem ou insinuem atributos pessoais negativos ou constrangimento direto.",
    replacement: "para quem busca transformar sua rotina e superar novos desafios",
  },

  // 5. Pontuação Excessiva e ALL CAPS
  {
    pattern: /\b[A-ZÁÉÍÓÚÂÊÔÃÕÇ]{5,}\b/g,
    category: "aggressive_syntax",
    categoryLabel: "Caixa Alta Excessiva (ALL CAPS)",
    severity: "medium",
    penalty: 10,
    explanation: "Palavras inteiras em maiúsculas violam os padrões editoriais de qualidade da Meta e Google.",
    replacement: "Formatação com inicial maiúscula padrão",
  },
  {
    pattern: /(!{2,}|\?{2,}|\${2,})/g,
    category: "aggressive_syntax",
    categoryLabel: "Pontuação Agressiva Repetida",
    severity: "medium",
    penalty: 8,
    explanation: "Múltiplos pontos de exclamação ou interrogação diminuem a credibilidade aos olhos dos crawlers.",
    replacement: "Pontuação gramatical padrão (.)",
  },
];

export class CreativeShieldEngine {
  /**
   * Realiza a auditoria de conformidade pré-voo em uma copy/headline de anúncio.
   */
  public static auditCreative(text: string): CreativeAuditResult {
    if (!text || text.trim().length === 0) {
      return {
        approvalScore: 100,
        approvalStatus: "maximum_approval",
        statusLabel: "Texto Vazio ou Neutro",
        triggers: [],
        sanitizedCopy: text,
        headlineSuggestions: [],
        coherenceWhitepage: {
          suggestedPageTitle: "Portal Editorial de Notícias & Conteúdo",
          suggestedSlug: "guia-exclusivo-bem-estar",
          schemaType: "NewsArticle",
          editorialAngle: "Editorial Informativo de Alto Valor",
          requiredLegalNotice: "Este site não possui vínculo institucional direto com o Facebook ou Meta Inc.",
        },
        recommendations: ["Insira uma copy ou criativo para auditar o risco de reprovação."],
      };
    }

    let currentScore = 100;
    const triggers: PolicyTrigger[] = [];
    let sanitized = text;

    for (const rule of POLICY_TRIGGER_RULES) {
      const matches = text.match(rule.pattern);
      if (matches && matches.length > 0) {
        const uniqueMatch = Array.from(new Set(matches))[0];
        triggers.push({
          id: `trg_${Date.now().toString(36)}_${Math.random().toString(36).substring(2, 6)}`,
          category: rule.category,
          categoryLabel: rule.categoryLabel,
          matchedWord: uniqueMatch,
          severity: rule.severity,
          penalty: rule.penalty,
          explanation: rule.explanation,
          suggestedReplacement: rule.replacement,
        });

        currentScore -= rule.penalty;

        // Higieniza o texto substituindo os termos perigosos pelo ângulo seguro
        sanitized = sanitized.replace(rule.pattern, rule.replacement);
      }
    }

    // Normalização de pontuação e caixa alta na copy higienizada
    sanitized = sanitized.replace(/!{2,}/g, ".");
    sanitized = sanitized.replace(/\?{2,}/g, "?");
    sanitized = sanitized.replace(/\${2,}/g, "R$");

    const finalScore = Math.max(8, Math.min(100, currentScore));

    let approvalStatus: CreativeAuditResult["approvalStatus"];
    let statusLabel: string;

    if (finalScore >= 90) {
      approvalStatus = "maximum_approval";
      statusLabel = "Aprovação Máxima (Zona Segura)";
    } else if (finalScore >= 70) {
      approvalStatus = "high_approval";
      statusLabel = "Alta Probabilidade de Aprovação";
    } else if (finalScore >= 45) {
      approvalStatus = "moderate_risk";
      statusLabel = "Risco Moderado (Pode ir para Análise Manual)";
    } else {
      approvalStatus = "critical_risk";
      statusLabel = "Risco Crítico de Reprovação / Banimento";
    }

    // Recomendações de engenharia
    const recommendations: string[] = [];
    if (triggers.some((t) => t.category === "health_claims")) {
      recommendations.push("Substitua promessas de cura por 'hábitos nutricionais e estilo de vida sustentável'.");
    }
    if (triggers.some((t) => t.category === "financial_promises")) {
      recommendations.push("Evite números exatos de ganhos ou promessas de renda fácil; utilize 'gestão de carreira' ou 'habilidades de monetização'.");
    }
    if (triggers.some((t) => t.category === "personal_attributes")) {
      recommendations.push("Elimine perguntas que apontem defeitos ou fraquezas do leitor; fale sobre a transformação de terceiros.");
    }
    if (triggers.length === 0) {
      recommendations.push("A copy está em total conformidade semântica com as diretrizes da Meta e Google Ads.");
    }
    recommendations.push("Garanta que sua Whitepage possua os termos de uso, política de privacidade e aviso de isenção de responsabilidade visíveis no rodapé.");

    return {
      approvalScore: finalScore,
      approvalStatus,
      statusLabel,
      triggers,
      sanitizedCopy: sanitized,
      headlineSuggestions: [
        "O método moderno que está simplificando resultados no dia a dia",
        "Especialistas explicam a nova abordagem adotada por profissionais",
        "Guia prático: como estruturar seu processo passo a passo",
      ],
      coherenceWhitepage: {
        suggestedPageTitle: "Artigo Especial: Tendências e Análises do Mercado",
        suggestedSlug: "artigo-especial-tendencias",
        schemaType: "NewsArticle",
        editorialAngle: "Artigo de Conteúdo Educativo e Informativo",
        requiredLegalNotice: "As informações fornecidas são apenas para fins educativos. Os resultados individuais podem variar.",
      },
      recommendations,
    };
  }
}
