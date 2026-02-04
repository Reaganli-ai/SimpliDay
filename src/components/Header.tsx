'use client';

import { useState } from 'react';
import { Menu, X, Globe, LogOut, Home, History, BarChart3, Settings } from 'lucide-react';
import { useI18n } from '@/lib/i18n';
import { useAuth } from '@/lib/auth';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

export function Header() {
  const { t, language, setLanguage } = useI18n();
  const { user, signOut } = useAuth();
  const [menuOpen, setMenuOpen] = useState(false);
  const pathname = usePathname();

  const navItems = [
    { href: '/', icon: Home, label: t.nav.home },
    { href: '/history', icon: History, label: t.nav.history },
    { href: '/insights', icon: BarChart3, label: t.nav.insights },
    { href: '/settings', icon: Settings, label: t.nav.settings },
  ];

  const toggleLanguage = () => {
    setLanguage(language === 'zh' ? 'en' : 'zh');
  };

  return (
    <header className="sticky top-0 z-50 bg-white/80 dark:bg-zinc-900/80 backdrop-blur-lg border-b border-zinc-200 dark:border-zinc-800">
      <div className="max-w-4xl mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link href="/" className="text-xl font-bold text-emerald-600">
            {t.common.appName}
          </Link>

          {/* Desktop Nav */}
          <nav className="hidden md:flex items-center gap-1">
            {navItems.map(({ href, icon: Icon, label }) => (
              <Link
                key={href}
                href={href}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${
                  pathname === href
                    ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400'
                    : 'text-zinc-600 hover:bg-zinc-100 dark:text-zinc-400 dark:hover:bg-zinc-800'
                }`}
              >
                <Icon className="w-4 h-4" />
                {label}
              </Link>
            ))}
          </nav>

          {/* Right side */}
          <div className="flex items-center gap-2">
            <button
              onClick={toggleLanguage}
              className="p-2 rounded-lg text-zinc-600 hover:bg-zinc-100 dark:text-zinc-400 dark:hover:bg-zinc-800 transition-colors"
              title={language === 'zh' ? 'Switch to English' : '切换到中文'}
            >
              <Globe className="w-5 h-5" />
              <span className="ml-1 text-sm">{language.toUpperCase()}</span>
            </button>

            {user && (
              <button
                onClick={signOut}
                className="hidden md:flex items-center gap-2 p-2 rounded-lg text-zinc-600 hover:bg-zinc-100 dark:text-zinc-400 dark:hover:bg-zinc-800 transition-colors"
              >
                <LogOut className="w-5 h-5" />
              </button>
            )}

            {/* Mobile menu button */}
            <button
              onClick={() => setMenuOpen(!menuOpen)}
              className="md:hidden p-2 rounded-lg text-zinc-600 hover:bg-zinc-100 dark:text-zinc-400 dark:hover:bg-zinc-800"
            >
              {menuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>

        {/* Mobile Nav */}
        {menuOpen && (
          <nav className="md:hidden py-4 border-t border-zinc-200 dark:border-zinc-800">
            {navItems.map(({ href, icon: Icon, label }) => (
              <Link
                key={href}
                href={href}
                onClick={() => setMenuOpen(false)}
                className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                  pathname === href
                    ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400'
                    : 'text-zinc-600 hover:bg-zinc-100 dark:text-zinc-400 dark:hover:bg-zinc-800'
                }`}
              >
                <Icon className="w-5 h-5" />
                {label}
              </Link>
            ))}
            {user && (
              <button
                onClick={() => {
                  signOut();
                  setMenuOpen(false);
                }}
                className="flex items-center gap-3 px-4 py-3 w-full text-left text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg"
              >
                <LogOut className="w-5 h-5" />
                {t.auth.signOut}
              </button>
            )}
          </nav>
        )}
      </div>
    </header>
  );
}
