import React from 'react';
import {
  Users,
  Activity,
  UserPlus,
  Crown,
  DollarSign,
  PhoneCall,
  Clock,
  ShieldAlert,
  Globe,
  Languages,
  TrendingUp,
} from 'lucide-react';
import type { AdminOverview } from '@/lib/admin.functions';
import {
  AdminCard,
  BarRow,
  EmptyState,
  Sparkline,
  StatCard,
  formatCurrency,
  formatDuration,
  formatNumber,
} from './AdminUI';

interface OverviewDashboardProps {
  data: AdminOverview | null;
  loading: boolean;
}

export const OverviewDashboard: React.FC<OverviewDashboardProps> = ({ data, loading }) => {
  const d = data;

  return (
    <div className="w-full max-w-full space-y-4 overflow-x-hidden">
      <div className="grid w-full max-w-full grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard title="Total users" value={formatNumber(d?.totalUsers ?? 0)} description="All registered accounts" icon={Users} loading={loading} />
        <StatCard title="Online now" value={formatNumber(d?.onlineNow ?? 0)} description="Seen in the last 5 minutes" icon={Activity} loading={loading} />
        <StatCard title="Active (24h)" value={formatNumber(d?.activeUsers24h ?? 0)} description="Users active today" icon={TrendingUp} loading={loading} />
        <StatCard title="Revenue (30d)" value={formatCurrency(d?.revenue30d ?? 0)} description="Yuyu purchases, last 30 days" icon={DollarSign} loading={loading} />
      </div>

      <div className="grid w-full max-w-full grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard title="New users (7d)" value={formatNumber(d?.newUsers7d ?? 0)} description="Sign-ups this week" icon={UserPlus} loading={loading} />
        <StatCard title="Premium" value={formatNumber(d?.premiumUsers ?? 0)} description="Premium accounts" icon={Crown} loading={loading} />
        <StatCard title="Calls (24h)" value={formatNumber(d?.calls24h ?? 0)} description={`Avg ${formatDuration(d?.avgCallSeconds ?? 0)}`} icon={PhoneCall} loading={loading} />
        <StatCard title="Moderation (7d)" value={formatNumber(d?.moderationOpen ?? 0)} description={`${formatNumber(d?.moderationTotal ?? 0)} all-time events`} icon={ShieldAlert} loading={loading} />
      </div>

      <AdminCard title="Sign-ups, last 30 days" description="Daily new accounts" icon={TrendingUp}>
        {d && d.growth.some((g) => g.users > 0) ? (
          <div className="w-full max-w-full space-y-2">
            <Sparkline points={d.growth.map((g) => ({ label: g.date, value: g.users }))} />
            <div className="flex justify-between text-[10px] text-slate-500">
              <span>{d.growth[0]?.date}</span>
              <span>{d.growth[d.growth.length - 1]?.date}</span>
            </div>
          </div>
        ) : (
          <EmptyState message={loading ? 'Loading…' : 'No sign-ups recorded in the last 30 days.'} />
        )}
      </AdminCard>

      <div className="grid w-full max-w-full grid-cols-1 gap-3 lg:grid-cols-2">
        <AdminCard title="Retention" description="Share of accounts active recently" icon={Clock}>
          <div className="space-y-4">
            <BarRow label="Active within 7 days" value={`${d?.retention7d ?? 0}%`} percentage={d?.retention7d ?? 0} />
            <BarRow label="Active within 30 days" value={`${d?.retention30d ?? 0}%`} percentage={d?.retention30d ?? 0} />
              <div className="admin-data-row flex items-center justify-between rounded-md border px-3 py-2 text-sm">
              <span className="text-slate-300">Users waiting to be matched</span>
              <span className="font-semibold text-slate-100">{formatNumber(d?.queueSize ?? 0)}</span>
            </div>
          </div>
        </AdminCard>

        <AdminCard title="Top countries" description="Registered accounts by country" icon={Globe}>
          {d && d.countries.length > 0 ? (
            <div className="space-y-3">
              {d.countries.map((c) => (
                <BarRow key={c.country} label={c.country} value={`${formatNumber(c.users)} (${c.percentage}%)`} percentage={c.percentage} />
              ))}
            </div>
          ) : (
            <EmptyState message={loading ? 'Loading…' : 'No country data yet.'} />
          )}
        </AdminCard>
      </div>

      <AdminCard title="Languages" description="Preferred language per account" icon={Languages}>
        {d && d.languages.length > 0 ? (
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {d.languages.map((l) => (
              <BarRow key={l.language} label={l.language.toUpperCase()} value={`${formatNumber(l.users)} (${l.percentage}%)`} percentage={l.percentage} />
            ))}
          </div>
        ) : (
          <EmptyState message={loading ? 'Loading…' : 'No language data yet.'} />
        )}
      </AdminCard>
    </div>
  );
};
