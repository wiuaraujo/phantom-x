"use client";

import React from "react";

interface Platform {
  name: string;
  category: string;
  svg: React.ReactNode;
}

const PLATFORMS: Platform[] = [
  {
    name: "Meta Ads",
    category: "Facebook & Instagram",
    svg: (
      <svg className="w-5 h-5 sm:w-6 sm:h-6 text-white shrink-0" viewBox="0 0 24 24" fill="currentColor">
        <path d="M12.001 8.272c-.878-.96-2.128-1.572-3.523-1.572-2.736 0-4.956 2.196-4.956 4.908s2.22 4.908 4.956 4.908c1.395 0 2.645-.612 3.523-1.572.878.96 2.128 1.572 3.523 1.572 2.736 0 4.956-2.196 4.956-4.908s-2.22-4.908-4.956-4.908c-1.395 0-2.645.612-3.523 1.572zm0 4.417c-.773-1.077-1.748-1.79-2.92-1.79-1.488 0-2.696 1.196-2.696 2.665s1.208 2.665 2.696 2.665c1.172 0 2.147-.713 2.92-1.79.773 1.077 1.748 1.79 2.92 1.79 1.488 0 2.696-1.196 2.696-2.665s-1.208-2.665-2.696-2.665c-1.172 0-2.147.713-2.92 1.79z" />
        <path d="M16.992 3.5c-2.404 0-4.398 1.408-5.002 3.42C11.386 4.908 9.392 3.5 6.988 3.5 3.129 3.5 0 6.64 0 10.516c0 4.793 4.298 8.441 10.024 10.36.438.147.882.224 1.326.224.444 0 .888-.077 1.326-.224 5.726-1.919 10.024-5.567 10.024-10.36 0-3.876-3.129-7.016-6.988-7.016zm0 13.905c-1.85 0-3.46-.867-4.48-2.235l-.512-.684-.512.684c-1.02 1.368-2.63 2.235-4.48 2.235-3.08 0-5.584-2.483-5.584-5.539 0-3.056 2.504-5.539 5.584-5.539 1.85 0 3.46.867 4.48 2.235l.512.684.512-.684c1.02-1.368 2.63-2.235 4.48-2.235 3.08 0 5.584 2.483 5.584 5.539 0 3.056-2.504 5.539-5.584 5.539z" />
      </svg>
    ),
  },
  {
    name: "Google Ads",
    category: "Search & Display",
    svg: (
      <svg className="w-5 h-5 sm:w-6 sm:h-6 text-white shrink-0" viewBox="0 0 24 24" fill="currentColor">
        <path d="M12.017 0C5.39 0 0 5.39 0 12.017c0 6.627 5.39 12.017 12.017 12.017 6.627 0 12.017-5.39 12.017-12.017C24.034 5.39 18.644 0 12.017 0zm.07 4.787a7.23 7.23 0 1 1 0 14.46 7.23 7.23 0 0 1 0-14.46zm3.926 2.768a1.597 1.597 0 1 0 0 3.194 1.597 1.597 0 0 0 0-3.194zm-7.922 4.092l4.135 7.163a2.532 2.532 0 1 0 4.385-2.532L12.45 9.115a2.532 2.532 0 1 0-4.385 2.532z" />
      </svg>
    ),
  },
  {
    name: "TikTok Ads",
    category: "Short-video ads",
    svg: (
      <svg className="w-5 h-5 sm:w-6 sm:h-6 text-white shrink-0" viewBox="0 0 24 24" fill="currentColor">
        <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.2 1.74 2.89 2.89 0 0 1 2.31-4.64c.29 0 .58.04.85.12V9.38a6.34 6.34 0 0 0-.85-.06A6.34 6.34 0 0 0 3.14 15.66a6.34 6.34 0 0 0 9.77 5.36 6.31 6.31 0 0 0 2.91-5.36V8.62a8.27 8.27 0 0 0 4.77 1.52V6.69z" />
      </svg>
    ),
  },
  {
    name: "Kwai Ads",
    category: "Kuaishou Network",
    svg: (
      <svg className="w-5 h-5 sm:w-6 sm:h-6 text-white shrink-0" viewBox="0 0 24 24" fill="currentColor">
        <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 14.5v-3.08c2.51-.27 4.5-2.4 4.5-5 0-2.76-2.24-5-5-5S7.5 5.66 7.5 8.42c0 2.6 1.99 4.73 4.5 5v3.08c-3.62-.32-6.5-3.36-6.5-7.08 0-3.92 3.18-7.1 7.1-7.1s7.1 3.18 7.1 7.1c0 3.72-2.88 6.76-6.5 7.08z" />
        <circle cx="12" cy="8.5" r="2.5" />
      </svg>
    ),
  },
  {
    name: "Taboola",
    category: "Native Discovery",
    svg: (
      <svg className="w-5 h-5 sm:w-6 sm:h-6 text-white shrink-0" viewBox="0 0 24 24" fill="currentColor">
        <circle cx="6" cy="18" r="3" />
        <circle cx="18" cy="18" r="3" />
        <path d="M6 15V6a3 3 0 0 1 3-3h6a3 3 0 0 1 3 3v9h-3V6h-6v9H6z" />
      </svg>
    ),
  },
  {
    name: "Outbrain",
    category: "Native Recommendation",
    svg: (
      <svg className="w-5 h-5 sm:w-6 sm:h-6 text-white shrink-0" viewBox="0 0 24 24" fill="currentColor">
        <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="2.5" fill="none" />
        <path d="M12 7a5 5 0 0 1 5 5 5 5 0 0 1-5 5 5 5 0 0 1-5-5" stroke="currentColor" strokeWidth="2.5" fill="none" />
        <circle cx="12" cy="12" r="2" fill="currentColor" />
      </svg>
    ),
  },
  {
    name: "Microsoft Ads",
    category: "Bing & MSN Network",
    svg: (
      <svg className="w-5 h-5 sm:w-6 sm:h-6 text-white shrink-0" viewBox="0 0 24 24" fill="currentColor">
        <path d="M1 1h10v10H1zM13 1h10v10H13zM1 13h10v10H1zM13 13h10v10H13z" />
      </svg>
    ),
  },
  {
    name: "Pinterest Ads",
    category: "Promoted Pins",
    svg: (
      <svg className="w-5 h-5 sm:w-6 sm:h-6 text-white shrink-0" viewBox="0 0 24 24" fill="currentColor">
        <path d="M12 0C5.373 0 0 5.373 0 12c0 5.084 3.163 9.426 7.627 11.174-.105-.949-.2-2.405.042-3.441.218-.937 1.407-5.965 1.407-5.965s-.359-.719-.359-1.782c0-1.668.967-2.914 2.171-2.914 1.023 0 1.518.769 1.518 1.69 0 1.029-.655 2.568-.994 3.995-.283 1.194.599 2.169 1.777 2.169 2.133 0 3.772-2.249 3.772-5.495 0-2.873-2.064-4.882-5.012-4.882-3.414 0-5.418 2.561-5.418 5.207 0 1.031.397 2.138.893 2.738.098.119.112.224.083.345-.09.375-.291 1.199-.332 1.365-.053.22-.174.267-.402.161-1.499-.698-2.436-2.889-2.436-4.649 0-3.785 2.75-7.262 7.929-7.262 4.163 0 7.398 2.967 7.398 6.931 0 4.136-2.607 7.464-6.227 7.464-1.216 0-2.359-.631-2.75-1.378l-.748 2.853c-.271 1.043-1.002 2.35-1.492 3.146C9.57 23.812 10.763 24 12 24c6.627 0 12-5.373 12-12 0-6.627-5.373-12-12-12z" />
      </svg>
    ),
  },
  {
    name: "X (Twitter) Ads",
    category: "Promoted Tweets",
    svg: (
      <svg className="w-5 h-5 sm:w-6 sm:h-6 text-white shrink-0" viewBox="0 0 24 24" fill="currentColor">
        <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
      </svg>
    ),
  },
  {
    name: "YouTube Ads",
    category: "Video In-Stream",
    svg: (
      <svg className="w-5 h-5 sm:w-6 sm:h-6 text-white shrink-0" viewBox="0 0 24 24" fill="currentColor">
        <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" />
      </svg>
    ),
  },
  {
    name: "Kiwify",
    category: "Checkout & CAPI",
    svg: (
      <svg className="w-5 h-5 sm:w-6 sm:h-6 text-white shrink-0" viewBox="0 0 24 24" fill="currentColor">
        <path d="M4 3h4.5v7.2L14.8 3H20l-7.7 8.5L20.5 21H15l-6.5-7.7V21H4V3z" />
      </svg>
    ),
  },
  {
    name: "Hotmart",
    category: "Global Checkout",
    svg: (
      <svg className="w-5 h-5 sm:w-6 sm:h-6 text-white shrink-0" viewBox="0 0 24 24" fill="currentColor">
        <path d="M12.3 1.9c-.3.4-.6.8-.8 1.3-.8 1.6-.7 3.2-.2 4.8.4 1.3.9 2.5.8 3.9-.1 1.7-1.3 3.1-3 3.4-1.9.4-3.7-.8-4.1-2.7-.2-1 .1-1.9.5-2.8.2-.4.4-.8.6-1.2.1-.2-.1-.5-.4-.4-1.5.5-2.8 1.5-3.7 2.8C.7 13.1.5 15.6 1.4 18c1.3 3.4 4.5 5.6 8.2 5.8 4.2.2 8.1-2.1 9.9-5.9 1.6-3.4 1.2-7.3-1.1-10.4-1.3-1.8-3.1-3.3-5-4.4-.4-.2-.8-.4-1.2-.6-.3-.2-.6.1-.5.4.3.8.4 1.7.3 2.5-.1 1.2-.6 2.3-1.3 3.2-.3.4-.7.8-1 1.2-.2.2-.4.1-.4-.2-.1-1.3.2-2.6.7-3.8.7-1.4 1.5-2.7 2.4-3.9z" />
      </svg>
    ),
  },
  {
    name: "PerfectPay",
    category: "High-Ticket Checkout",
    svg: (
      <svg className="w-5 h-5 sm:w-6 sm:h-6 text-white shrink-0" viewBox="0 0 24 24" fill="currentColor">
        <path d="M3 3h11a8 8 0 0 1 0 16H8v5H3V3zm5 11h6a3 3 0 0 0 0-6H8v6z" />
      </svg>
    ),
  },
  {
    name: "Braip",
    category: "Physical & Digital",
    svg: (
      <svg className="w-5 h-5 sm:w-6 sm:h-6 text-white shrink-0" viewBox="0 0 24 24" fill="currentColor">
        <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" />
      </svg>
    ),
  },
  {
    name: "Shopify",
    category: "E-Commerce Edge",
    svg: (
      <svg className="w-5 h-5 sm:w-6 sm:h-6 text-white shrink-0" viewBox="0 0 24 24" fill="currentColor">
        <path d="M15.337 2.502c-.035.033-.654.49-.654.49s-.517-.417-.834-.613c-.87-.535-1.93-.654-2.825-.323-.974.36-1.748 1.157-2.18 2.188-.309.739-.339 1.487-.25 2.195l-3.328 1.034c-.394.122-.442.274-.51.654L2.008 20.94c-.068.38.163.702.516.702h18.95c.354 0 .585-.322.517-.702l-2.75-12.808c-.067-.38-.115-.532-.51-.654l-3.327-1.034c.09-.708.06-1.456-.25-2.195-.43-1.03-1.205-1.827-2.18-2.188-.504-.187-1.077-.25-1.637-.159zm-2.023 2.015c.574-.212 1.25-.098 1.737.288l-2.28 4.093c-.452-.303-.54-.928-.485-1.572.067-.788.455-2.6 1.028-2.809zm-2.631.974c.277-.66.772-1.171 1.396-1.402-.573.209-.96 2.021-1.028 2.809-.055.644.033 1.269.485 1.572l-2.28-4.093c.487-.386 1.163-.5 1.427 1.114z" />
      </svg>
    ),
  },
];

export const PlatformLogosMarquee: React.FC = () => {
  // Duplicamos a lista para criar um loop infinito contínuo e sem emendas
  const marqueeItems = [...PLATFORMS, ...PLATFORMS];

  return (
    <div className="relative z-20 w-full mt-7 sm:mt-9 select-none">
      {/* Header Label do Carrossel de Compatibilidade */}
      <div className="flex items-center justify-center mb-3 sm:mb-4 px-4 text-center">
        <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-white/[0.04] dark:bg-white/[0.03] border border-white/10 text-[10px] sm:text-[11px] font-mono text-neutral-400 dark:text-neutral-400 tracking-wider uppercase">
          <span className="w-1.5 h-1.5 rounded-full bg-white animate-ping" />
          <span>COMPATIBILIDADE NATIVA HOMOLOGADA • ENTREGA REVERSE PROXY 200 OK</span>
        </div>
      </div>

      {/* Faixa Marquee com Fade Lateral */}
      <div className="relative w-full overflow-hidden py-3 sm:py-4 bg-[#09090b]/85 dark:bg-[#050505]/95 border-y border-white/10 backdrop-blur-md">
        {/* Gradientes de desvanecimento lateral (fade) para transição infinita perfeita */}
        <div className="pointer-events-none absolute left-0 top-0 bottom-0 w-16 sm:w-32 bg-gradient-to-r from-[#09090b] dark:from-[#050505] to-transparent z-10" />
        <div className="pointer-events-none absolute right-0 top-0 bottom-0 w-16 sm:w-32 bg-gradient-to-l from-[#09090b] dark:from-[#050505] to-transparent z-10" />

        {/* Fila Contínua passando da Direita para a Esquerda */}
        <div className="animate-marquee-infinite flex items-center space-x-3 sm:space-x-4">
          {marqueeItems.map((platform, index) => (
            <div
              key={`${platform.name}-${index}`}
              className="flex items-center space-x-2.5 sm:space-x-3 px-3.5 py-2 sm:px-4 sm:py-2.5 rounded-xl bg-white/[0.05] border border-white/10 hover:border-white/30 hover:bg-white/[0.08] transition shadow-sm whitespace-nowrap shrink-0 group cursor-default"
            >
              {/* Logotipo padrão na cor branca */}
              <div className="w-6 h-6 sm:w-7 sm:h-7 rounded-lg bg-white/10 flex items-center justify-center p-1 text-white group-hover:scale-110 transition-transform">
                {platform.svg}
              </div>

              {/* Tipografia da Plataforma em Branco */}
              <div className="flex flex-col text-left">
                <span className="text-xs sm:text-sm font-semibold tracking-wide text-white leading-tight font-poppins">
                  {platform.name}
                </span>
                <span className="text-[9px] sm:text-[10px] font-mono text-neutral-400 leading-none mt-0.5">
                  {platform.category}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
