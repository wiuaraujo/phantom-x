import React from "react";
import Link from "next/link";
import { siteConfig } from "@/config/site";
import { ArrowLeft } from "lucide-react";

export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-brand-black text-brand-white p-6 md:p-12">
      <div className="max-w-3xl mx-auto space-y-8">
        <Link
          href="/"
          className="inline-flex items-center space-x-2 text-xs font-mono text-brand-secondary hover:text-white transition"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Voltar para a página inicial</span>
        </Link>

        <div>
          <span className="text-xs font-mono tracking-widest uppercase text-brand-secondary">
            PRIVACIDADE E DADOS (LGPD / GDPR)
          </span>
          <h1 className="text-3xl font-bold text-white tracking-tight mt-2">
            Política de Privacidade — {siteConfig.name}
          </h1>
          <p className="text-xs text-brand-muted font-mono mt-1">
            Última revisão: Outubro de 2026
          </p>
        </div>

        <div className="space-y-6 text-sm text-brand-secondary leading-relaxed border-t border-brand-border pt-6">
          <section className="space-y-2">
            <h2 className="text-base font-semibold text-white">1. Princípio da Minimização de Dados</h2>
            <p>
              O {siteConfig.name} adota por padrão a técnica de **Privacy by Design**. Nós não
              armazenamos endereços IP completos de visitantes nos bancos de dados analíticos. Os
              dois últimos octetos dos endereços IPv4 são mascarados em tempo de ingestão (ex:
              189.45.***.***), garantindo conformidade estrita com a LGPD e o GDPR.
            </p>
          </section>

          <section className="space-y-2">
            <h2 className="text-base font-semibold text-white">2. Dados Coletados</h2>
            <p>
              Coletamos exclusivamente metadados técnicos necessários para o roteamento e a
              detecção de tráfego automatizado: país aproximado por ASN, tipo de dispositivo
              (mobile/desktop), versão do sistema operacional e cabeçalhos genéricos de requisição.
              Não utilizamos cookies persistentes de rastreamento entre domínios de terceiros.
            </p>
          </section>

          <section className="space-y-2">
            <h2 className="text-base font-semibold text-white">3. Retenção e Exclusão</h2>
            <p>
              Os eventos brutos são mantidos de acordo com o plano contratado (14 a 365 dias) e
              posteriormente agregados em métricas estatísticas anônimas, eliminando
              definitivamente os registros granulares.
            </p>
          </section>

          <section className="space-y-2">
            <h2 className="text-base font-semibold text-white">4. Direitos do Titular</h2>
            <p>
              Para esclarecimentos ou solicitações relativas a dados pessoais, os titulares e
              operadores podem entrar em contato com nosso Encarregado de Proteção de Dados (DPO)
              através do e-mail <strong>dpo@phantom-x.pro</strong>.
            </p>
          </section>
        </div>
      </div>
    </div>
  );
}
