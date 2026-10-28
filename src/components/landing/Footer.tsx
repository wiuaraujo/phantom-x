"use client";

import React from "react";
import Link from "next/link";
import { siteConfig } from "@/config/site";
import { Logo } from "@/components/ui/Logo";

export const Footer: React.FC = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-brand-black border-t border-brand-border py-16 px-6">
      <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-5 gap-10">
        {/* Brand Column */}
        <div className="md:col-span-2 space-y-4">
          <Link href="/" className="flex items-center space-x-3">
            <Logo size={28} />
            <span className="font-mono text-base font-bold text-brand-white tracking-widest">
              {siteConfig.name}
            </span>
          </Link>
          <p className="text-xs text-brand-secondary leading-relaxed max-w-sm">
            Plataforma de inteligência, telemetria em tempo real e roteamento de
            tráfego web com visibilidade global e proteção de infraestrutura.
          </p>
          <div className="text-[11px] font-mono text-brand-muted">
            {siteConfig.company.name} — Registro Global
          </div>
        </div>

        {/* Product Column */}
        <div className="space-y-3">
          <div className="text-xs font-semibold text-brand-white tracking-wider uppercase font-mono">
            Plataforma
          </div>
          <ul className="space-y-2 text-xs text-brand-secondary">
            <li>
              <a href="#features" className="hover:text-brand-white transition">
                Funcionalidades
              </a>
            </li>
            <li>
              <a href="#how-it-works" className="hover:text-brand-white transition">
                Console Ao Vivo
              </a>
            </li>
            <li>
              <a href="#pricing" className="hover:text-brand-white transition">
                Planos & Preços
              </a>
            </li>
            <li>
              <Link href="/dashboard" className="hover:text-brand-white transition">
                Console Operacional
              </Link>
            </li>
          </ul>
        </div>

        {/* Security & Docs */}
        <div className="space-y-3">
          <div className="text-xs font-semibold text-brand-white tracking-wider uppercase font-mono">
            Recursos
          </div>
          <ul className="space-y-2 text-xs text-brand-secondary">
            <li>
              <Link href="/dashboard/settings" className="hover:text-brand-white transition">
                Documentação da API
              </Link>
            </li>
            <li>
              <Link href="/dashboard/live" className="hover:text-brand-white transition">
                Status dos Clusters
              </Link>
            </li>
            <li>
              <a href="mailto:suporte@phantomx.pro" className="hover:text-brand-white transition">
                Suporte Técnico
              </a>
            </li>
          </ul>
        </div>

        {/* Legal Column */}
        <div className="space-y-3">
          <div className="text-xs font-semibold text-brand-white tracking-wider uppercase font-mono">
            Legal & LGPD
          </div>
          <ul className="space-y-2 text-xs text-brand-secondary">
            <li>
              <Link href="/terms" className="hover:text-brand-white transition">
                Termos de Uso
              </Link>
            </li>
            <li>
              <Link href="/privacy" className="hover:text-brand-white transition">
                Política de Privacidade
              </Link>
            </li>
            <li>
              <span className="text-brand-muted text-[11px]">
                Anonimização de IP por padrão
              </span>
            </li>
          </ul>
        </div>
      </div>

      <div className="max-w-6xl mx-auto pt-10 mt-10 border-t border-brand-borderSubtle flex flex-col sm:flex-row items-center justify-between text-xs text-brand-muted font-mono">
        <div>© {currentYear} {siteConfig.name}. Todos os direitos reservados.</div>
        <div className="mt-2 sm:mt-0 flex items-center space-x-2">
          <span className="w-1.5 h-1.5 rounded-full bg-white" />
          <span>Sistemas Operando em Normalidade</span>
        </div>
      </div>
    </footer>
  );
};
