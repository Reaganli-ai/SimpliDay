'use client';

import { LucideIcon } from 'lucide-react';

interface KpiCardProps {
  title: string;
  value: string;
  subtitle?: string;
  icon: LucideIcon;
  iconColor?: string;
  iconBg?: string;
  change?: number;
}

export function KpiCard({ title, value, subtitle, icon: Icon, iconColor = 'text-zinc-600', iconBg = 'bg-zinc-100', change }: KpiCardProps) {
  return (
    <div className="bg-white rounded-xl border border-zinc-200 p-5">
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <p className="text-sm text-zinc-500">{title}</p>
          <p className="text-2xl font-bold text-zinc-900 mt-1">{value}</p>
          {subtitle && <p className="text-xs text-zinc-400 mt-1">{subtitle}</p>}
          {change !== undefined && (
            <p className={`text-xs mt-1 font-medium ${change >= 0 ? 'text-emerald-600' : 'text-red-500'}`}>
              {change >= 0 ? '↑' : '↓'} {Math.abs(change)}%
            </p>
          )}
        </div>
        <div className={`p-2.5 rounded-lg ${iconBg}`}>
          <Icon className={`w-5 h-5 ${iconColor}`} />
        </div>
      </div>
    </div>
  );
}
