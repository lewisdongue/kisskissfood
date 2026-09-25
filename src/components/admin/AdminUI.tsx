import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

export const formatNumber = (num: number) => {
  if (!Number.isFinite(num)) return '0';
  if (Math.abs(num) >= 1_000_000_000) return `${(num / 1_000_000_000).toFixed(1)} B`;
  if (Math.abs(num) >= 1_000_000) return `${(num / 1_000_000).toFixed(1)} M`;
  if (Math.abs(num) >= 1_000) return `${(num / 1_000).toFixed(1)} k`;
  return `${num}`;
};

export const formatCurrency = (amount: number) =>
  new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(amount || 0);

export const formatDuration = (seconds: number) => {
  const s = Math.max(0, Math.round(seconds || 0));
  const m = Math.floor(s / 60);
  if (m >= 60) return `${Math.floor(m / 60)}h ${m % 60}m`;
  return `${m}m ${String(s % 60).padStart(2, '0')}s`;
};

export const relativeTime = (value?: string | null) => {
  if (!value) return 'never';
  const diff = Date.now() - new Date(value).getTime();
  if (Number.isNaN(diff)) return 'unknown';
  const mins = Math.floor(diff / 60_000);
  if (mins < 1) return 'just now';
  if (mins < 60) return `${mins}m ago`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days < 30) return `${days}d ago`;
  return new Date(value).toLocaleDateString();
};

export const AdminCard: React.FC<{
  title: string;
  description?: string;
  icon?: React.ComponentType<{ className?: string }>;
  children: React.ReactNode;
}> = ({ title, description, icon: Icon, children }) => (
  <Card className="w-full max-w-full overflow-hidden border border-slate-700/60 bg-slate-900/60 backdrop-blur-sm">
    <CardHeader className="pb-3">
      <CardTitle className="flex items-center gap-2 text-base text-slate-100">
        {Icon ? <Icon className="h-4 w-4 shrink-0 text-blue-400" /> : null}
        <span className="truncate">{title}</span>
      </CardTitle>
      {description ? (
        <CardDescription className="text-xs text-slate-400">{description}</CardDescription>
      ) : null}
    </CardHeader>
    <CardContent className="w-full max-w-full overflow-x-auto">{children}</CardContent>
  </Card>
);

export const StatCard: React.FC<{
  title: string;
  value: React.ReactNode;
  description?: string;
  icon: React.ComponentType<{ className?: string }>;
  loading?: boolean;
}> = ({ title, value, description, icon: Icon, loading }) => (
  <Card className="w-full max-w-full overflow-hidden border border-slate-700/60 bg-slate-900/60 backdrop-blur-sm">
    <CardContent className="p-4">
      <div className="flex items-start justify-between gap-2">
        <span className="min-w-0 truncate text-xs font-medium uppercase tracking-wide text-slate-400">
          {title}
        </span>
        <Icon className="h-4 w-4 shrink-0 text-blue-400" />
      </div>
      <div className="mt-2 truncate text-2xl font-bold text-slate-50">
        {loading ? <span className="block h-7 w-20 animate-pulse rounded bg-slate-700" /> : value}
      </div>
      {description ? <p className="mt-1 truncate text-xs text-slate-500">{description}</p> : null}
    </CardContent>
  </Card>
);

export const BarRow: React.FC<{ label: string; value: string; percentage: number }> = ({
  label,
  value,
  percentage,
}) => (
  <div className="w-full max-w-full space-y-1">
    <div className="flex items-center justify-between gap-2 text-sm">
      <span className="min-w-0 truncate text-slate-200">{label}</span>
      <span className="shrink-0 text-slate-400">{value}</span>
    </div>
    <div className="h-2 w-full overflow-hidden rounded-full bg-slate-700/60">
      <div
        className="h-full rounded-full bg-gradient-to-r from-blue-500 to-indigo-500 transition-all duration-500"
        style={{ width: `${Math.min(100, Math.max(0, percentage))}%` }}
      />
    </div>
  </div>
);

export const EmptyState: React.FC<{ message: string }> = ({ message }) => (
  <p className="py-6 text-center text-sm text-slate-500">{message}</p>
);

export const Sparkline: React.FC<{ points: { label: string; value: number }[] }> = ({ points }) => {
  const max = Math.max(1, ...points.map((p) => p.value));
  return (
    <div className="flex h-24 w-full max-w-full items-end gap-[2px]">
      {points.map((p) => (
        <div
          key={p.label}
          title={`${p.label}: ${p.value}`}
          className="min-w-0 flex-1 rounded-t bg-gradient-to-t from-blue-600/40 to-indigo-400"
          style={{ height: `${Math.max(3, (p.value / max) * 100)}%` }}
        />
      ))}
    </div>
  );
};
