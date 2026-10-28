import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: "class",
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          black: "rgba(var(--bg-page), <alpha-value>)",
          dark: "rgba(var(--bg-dark), <alpha-value>)",
          surface: "rgba(var(--bg-surface), <alpha-value>)",
          hover: "rgba(var(--bg-hover), <alpha-value>)",
          border: "rgba(var(--border-color), <alpha-value>)",
          borderSubtle: "rgba(var(--border-subtle), <alpha-value>)",
          borderHighlight: "rgba(var(--border-highlight), <alpha-value>)",
          white: "rgba(var(--text-primary), <alpha-value>)",
          secondary: "rgba(var(--text-secondary), <alpha-value>)",
          muted: "rgba(var(--text-muted), <alpha-value>)",
        },
      },
      fontFamily: {
        sans: [
          "Poppins",
          "-apple-system",
          "BlinkMacSystemFont",
          "Segoe UI",
          "Roboto",
          "sans-serif",
        ],
        poppins: [
          "Poppins",
          "sans-serif",
        ],
        mono: [
          "JetBrains Mono",
          "ui-monospace",
          "SFMono-Regular",
          "Menlo",
          "monospace",
        ],
      },
      boxShadow: {
        glow: "0 0 35px -5px rgba(255, 255, 255, 0.08)",
        "glow-sm": "0 0 15px -3px rgba(255, 255, 255, 0.05)",
        "glow-lg": "0 0 60px -10px rgba(255, 255, 255, 0.12)",
      },
      animation: {
        pulseSlow: "pulse 4s cubic-bezier(0.4, 0, 0.6, 1) infinite",
        float: "float 6s ease-in-out infinite",
      },
      keyframes: {
        float: {
          "0%, 100%": { transform: "translateY(0px)" },
          "50%": { transform: "translateY(-6px)" },
        },
      },
    },
  },
  plugins: [],
};

export default config;
