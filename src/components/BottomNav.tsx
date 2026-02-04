'use client';

import { Home, BarChart2, Settings } from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useI18n } from '@/lib/i18n';

export function BottomNav() {
  const pathname = usePathname();
  const { language } = useI18n();

  const tabs = [
    {
      href: '/',
      icon: Home,
      label: language === 'zh' ? '首页' : 'Home',
    },
    {
      href: '/records',
      icon: BarChart2,
      label: language === 'zh' ? '记录' : 'Records',
    },
    {
      href: '/settings',
      icon: Settings,
      label: language === 'zh' ? '设置' : 'Settings',
    },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-zinc-100">
      <div className="max-w-lg mx-auto flex">
        {tabs.map(({ href, icon: Icon, label }) => {
          const isActive = pathname === href;
          return (
            <Link
              key={href}
              href={href}
              className={`flex-1 flex flex-col items-center py-3 transition-colors ${
                isActive
                  ? 'text-zinc-900'
                  : 'text-zinc-400 hover:text-zinc-600'
              }`}
            >
              <Icon className="w-5 h-5" strokeWidth={isActive ? 2 : 1.5} />
              <span className="text-xs mt-1">{label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
