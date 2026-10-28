import React from "react";

interface LogoProps {
  className?: string;
  size?: number;
  /** Força o uso do logotipo branco mesmo no tema claro (ex: dentro de badges ou cards escuros) */
  darkBg?: boolean;
}

export const Logo: React.FC<LogoProps> = ({ className = "", size = 30, darkBg = false }) => {
  return (
    <div
      className={`relative flex items-center justify-center shrink-0 phantom-logo-container ${className}`}
      style={{ width: size, height: size }}
    >
      {/* 
        1. LOGOTIPO BRANCO (/logo.png)
        - Visível no tema escuro (html.dark)
        - Visível no tema claro quando estiver sobre fundo escuro (darkBg={true} ou container escuro)
      */}
      <img
        src="/logo.png"
        alt="Phantom-X Logo"
        width={size}
        height={size}
        className={`w-full h-full object-contain filter drop-shadow-[0_0_10px_rgba(255,255,255,0.45)] phantom-logo-white ${
          darkBg ? "block" : "block [html.light_&]:hidden"
        }`}
      />

      {/* 
        2. NOVO LOGOTIPO PRETO ESTILIZADO (/logo-dark.png)
        - Ativo no tema claro (html.light) EXCLUSIVAMENTE em fundos claros/brancos
        - Preserva o acabamento 3D obsidian glossy de altíssima definição sem filtros destrutivos
      */}
      {!darkBg && (
        <img
          src="/logo-dark.png"
          alt="Phantom-X Logo"
          width={size}
          height={size}
          className="w-full h-full object-contain filter drop-shadow-[0_2px_8px_rgba(0,0,0,0.12)] phantom-logo-dark hidden [html.light_&]:block"
        />
      )}
    </div>
  );
};
