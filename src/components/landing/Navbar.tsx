"use client";

import React, { useState } from "react";
import Link from "next/link";
import { siteConfig } from "@/config/site";
import { Logo } from "@/components/ui/Logo";
import { LanguageSelector } from "@/components/ui/LanguageSelector";
import { ThemeToggle } from "@/components/ui/ThemeToggle";
import { useLanguage } from "@/lib/i18n";
import { ArrowRight, Menu, X } from "lucide-react";

export const Navbar: React.FC = () => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { t } = useLanguage();

  const navLinks = [
    { label: t.nav.howItWorks, href: "#how-it-works" },
    { label: t.nav.features, href: "#features" },
    { label: t.nav.pricing, href: "#pricing" },
  ];

  return (
    <header className="fixed top-4 sm:top-6 left-0 right-0 z-50 flex justify-center px-3 sm:px-4">
      <nav className="w-full max-w-[1100px] h-14 sm:h-16 rounded-full bg-brand-black/85 backdrop-blur-xl border border-brand-border px-3.5 sm:px-5 flex items-center justify-between shadow-glow-sm transition-all hover:border-brand-borderHighlight">
        {/* Brand Logo & Name */}
        <Link href="/" className="flex items-center space-x-2.5 sm:space-x-3 group shrink-0">
          <Logo size={36} className="group-hover:scale-105 transition-transform" />
          <span className="font-poppins text-base sm:text-lg font-bold tracking-tight text-brand-white">
            {siteConfig.name}
          </span>
        </Link>

        {/* Center Desktop Links */}
        <div className="hidden md:flex items-center space-x-7 text-xs font-medium text-brand-secondary">
          {navLinks.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="hover:text-brand-white transition-colors tracking-wide"
            >
              {item.label}
            </Link>
          ))}
        </div>

        {/* Action Controls & Language Selector */}
        <div className="hidden md:flex items-center space-x-2.5">
          {/* Dark / Light Theme Toggle */}
          <ThemeToggle />

          {/* Minimalist Flag Language Selector */}
          <LanguageSelector />

          <Link
            href="/login"
            className="px-3.5 py-1.5 rounded-full text-xs font-medium text-brand-secondary hover:text-brand-white hover:bg-brand-surface border border-transparent hover:border-brand-border transition"
          >
            {t.nav.signIn}
          </Link>
          <Link
            href="/signup"
            className="px-4 py-1.5 rounded-full text-xs font-semibold bg-neutral-900 dark:bg-white text-white dark:text-black hover:bg-neutral-800 dark:hover:bg-zinc-200 transition shadow-sm flex items-center space-x-1.5 group"
          >
            <span>{t.nav.getStarted}</span>
            <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
          </Link>
        </div>

        {/* Mobile Hamburger Button, Theme Toggle & Language Selector */}
        <div className="flex md:hidden items-center space-x-2">
          <ThemeToggle />
          <LanguageSelector />
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="p-1.5 text-brand-secondary hover:text-brand-white"
            aria-label="Abrir menu"
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </nav>

      {/* Mobile Drawer Menu */}
      {mobileMenuOpen && (
        <div className="absolute top-16 left-3 right-3 bg-brand-surface/98 backdrop-blur-2xl border border-brand-border rounded-2xl p-5 shadow-2xl z-50 flex flex-col space-y-4 md:hidden">
          <div className="flex items-center space-x-2.5 pb-3 border-b border-brand-border">
            <Logo size={32} />
            <span className="font-poppins text-base font-bold tracking-tight text-brand-white">
              {siteConfig.name}
            </span>
          </div>
          <div className="flex flex-col space-y-3 text-sm font-poppins">
            {navLinks.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setMobileMenuOpen(false)}
                className="text-brand-secondary hover:text-brand-white py-1 transition"
              >
                {item.label}
              </Link>
            ))}
          </div>
          <div className="pt-4 border-t border-brand-border flex items-center justify-between">
            <span className="text-xs text-brand-secondary">Tema da Interface</span>
            <ThemeToggle showLabel />
          </div>
          <div className="pt-2 flex flex-col space-y-2">
            <Link
              href="/login"
              onClick={() => setMobileMenuOpen(false)}
              className="w-full text-center py-2.5 rounded-lg text-xs font-medium text-brand-white bg-brand-surface border border-brand-border"
            >
              {t.nav.signIn}
            </Link>
            <Link
              href="/signup"
              onClick={() => setMobileMenuOpen(false)}
              className="w-full text-center py-2.5 rounded-lg text-xs font-semibold bg-neutral-900 text-white dark:bg-white dark:text-black"
            >
              {t.nav.getStarted}
            </Link>
          </div>
        </div>
      )}
    </header>
  );
};
