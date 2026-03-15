'use client';

import { AlertTriangle, Lightbulb, Info } from 'lucide-react';
import { Insight } from '@/types/dashboard';

const typeConfig = {
  warning: {
    icon: AlertTriangle,
    iconColor: 'text-amber-600',
    bgColor: 'bg-amber-50',
    borderColor: 'border-amber-200',
  },
  opportunity: {
    icon: Lightbulb,
    iconColor: 'text-emerald-600',
    bgColor: 'bg-emerald-50',
    borderColor: 'border-emerald-200',
  },
  info: {
    icon: Info,
    iconColor: 'text-blue-600',
    bgColor: 'bg-blue-50',
    borderColor: 'border-blue-200',
  },
};

export function InsightCard({ insight }: { insight: Insight }) {
  const config = typeConfig[insight.type];
  const Icon = config.icon;

  return (
    <div className={`rounded-xl border p-4 ${config.bgColor} ${config.borderColor}`}>
      <div className="flex items-start gap-3">
        <div className="mt-0.5">
          <Icon className={`w-5 h-5 ${config.iconColor}`} />
        </div>
        <div className="flex-1">
          <div className="flex items-center justify-between">
            <h4 className="text-sm font-semibold text-zinc-900">{insight.title}</h4>
            {insight.metric && (
              <span className="text-sm font-bold text-zinc-900">{insight.metric}</span>
            )}
          </div>
          <p className="text-sm text-zinc-600 mt-1 leading-relaxed">{insight.description}</p>
        </div>
      </div>
    </div>
  );
}
