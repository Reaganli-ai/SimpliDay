'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { LayoutDashboard, Store, Package, Lightbulb, TrendingUp, Menu, X } from 'lucide-react';
import { useState } from 'react';

const navItems = [
  { href: '/dashboard', icon: LayoutDashboard, label: '数据概览' },
  { href: '/dashboard/pareto', icon: TrendingUp, label: '帕累托分析' },
  { href: '/dashboard/stores', icon: Store, label: '门店分析' },
  { href: '/dashboard/skus', icon: Package, label: 'SKU 分析' },
  { href: '/dashboard/insights', icon: Lightbulb, label: '经营洞察' },
];

export function Sidebar() {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);

  const nav = (
    <div className="flex flex-col h-full">
      <div className="px-6 py-5 border-b border-zinc-100">
        <h1 className="text-lg font-bold text-zinc-900">餐饮分析看板</h1>
        <p className="text-xs text-zinc-400 mt-0.5">SKU & 门店数据洞察</p>
      </div>
      <nav className="flex-1 px-3 py-4 space-y-1">
        {navItems.map(({ href, icon: Icon, label }) => {
          const isActive = pathname === href;
          return (
            <Link
              key={href}
              href={href}
              onClick={() => setMobileOpen(false)}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-colors ${
                isActive
                  ? 'bg-zinc-900 text-white'
                  : 'text-zinc-600 hover:bg-zinc-100 hover:text-zinc-900'
              }`}
            >
              <Icon className="w-4.5 h-4.5" />
              {label}
            </Link>
          );
        })}
      </nav>
      <div className="px-6 py-4 border-t border-zinc-100">
        <p className="text-xs text-zinc-400">数据为模拟数据</p>
        <p className="text-xs text-zinc-400">等待 Excel 接入</p>
      </div>
    </div>
  );

  return (
    <>
      {/* Mobile toggle */}
      <button
        onClick={() => setMobileOpen(!mobileOpen)}
        className="lg:hidden fixed top-4 left-4 z-50 p-2 bg-white rounded-lg shadow-md border border-zinc-200"
      >
        {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
      </button>

      {/* Mobile overlay */}
      {mobileOpen && (
        <div
          className="lg:hidden fixed inset-0 bg-black/20 z-40"
          onClick={() => setMobileOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside className={`
        fixed top-0 left-0 h-full w-60 bg-white border-r border-zinc-200 z-40
        transition-transform duration-200
        lg:translate-x-0 lg:static lg:z-0
        ${mobileOpen ? 'translate-x-0' : '-translate-x-full'}
      `}>
        {nav}
      </aside>
    </>
  );
}
