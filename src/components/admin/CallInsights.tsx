import React from 'react';
import { PhoneCall, Clock, Radio, Users, Timer, BarChart3 } from 'lucide-react';
import type { CallInsights as CallInsightsData } from '@/lib/admin.functions';
import {
  AdminCard,
  BarRow,
  EmptyState,
  Sparkline,
  StatCard,
  formatDuration,
  formatNumber,
} from './AdminUI';

interface Props {
  data: CallInsightsData | null;
  loading: boolean;
}

export const CallInsights: React.FC<Props> = ({ data, loading }) => (
  <div className="w-full max-w-full space-y-4 overflow-x-hidden">
    <div className="grid w-full max-w-full grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-4">
      <StatCard title="Total calls" value={formatNumber(data?.totalCalls ?? 0)} description="All matches ever created" icon={PhoneCall} loading={loading} />
      <StatCard title="Calls (24h)" value={formatNumber(data?.calls24h ?? 0)} description={`${formatNumber(data?.calls7d ?? 0)} in 7 days`} icon={BarChart3} loading={loading} />
      <StatCard title="Live rooms" value={formatNumber(data?.liveRooms ?? 0)} description={`${formatNumber(data?.queueSize ?? 0)} waiting to match`} icon={Radio} loading={loading} />
      <StatCard title="Avg duration" value={formatDuration(data?.avgSeconds ?? 0)} description={`Longest ${formatDuration(data?.longestSeconds ?? 0)}`} icon={Clock} loading={loading} />
    </div>

    <AdminCard title="Calls per hour (last 24h)" description="Matches created, UTC hours" icon={Timer}>
      {data && data.hourly.some((h) => h.calls > 0) ? (
        <div className="w-full max-w-full space-y-2">
          <Sparkline points={data.hourly.map((h) => ({ label: h.hour, value: h.calls }))} />
          <div className="flex justify-between text-[10px] text-slate-500">
            <span>{data.hourly[0]?.hour}</span>
            <span>{data.hourly[data.hourly.length - 1]?.hour}</span>
          </div>
        </div>
      ) : (
        <EmptyState message={loading ? 'Loading…' : 'No calls recorded in the last 24 hours.'} />
      )}
    </AdminCard>

    <div className="grid w-full max-w-full grid-cols-1 gap-3 lg:grid-cols-2">
      <AdminCard title="Call length distribution" description="Based on the last 7 days" icon={BarChart3}>
        {data && data.durationBuckets.some((b) => b.calls > 0) ? (
          <div className="space-y-3">
            {data.durationBuckets.map((b) => (
              <BarRow key={b.label} label={b.label} value={`${formatNumber(b.calls)} (${b.percentage}%)`} percentage={b.percentage} />
            ))}
          </div>
        ) : (
          <EmptyState message={loading ? 'Loading…' : 'No call data for the last 7 days.'} />
        )}
      </AdminCard>

      <AdminCard title="Talk time" description="Total minutes connected, last 7 days" icon={Users}>
        <div className="space-y-3">
          <div className="admin-data-row flex items-center justify-between rounded-md border px-3 py-2 text-sm">
            <span className="text-slate-300">Minutes talked</span>
            <span className="font-semibold text-slate-100">{formatNumber(data?.totalMinutes ?? 0)}</span>
          </div>
          <div className="admin-data-row flex items-center justify-between rounded-md border px-3 py-2 text-sm">
            <span className="text-slate-300">Calls in queue right now</span>
            <span className="font-semibold text-slate-100">{formatNumber(data?.queueSize ?? 0)}</span>
          </div>
          <div className="admin-data-row flex items-center justify-between rounded-md border px-3 py-2 text-sm">
            <span className="text-slate-300">Average call</span>
            <span className="font-semibold text-slate-100">{formatDuration(data?.avgSeconds ?? 0)}</span>
          </div>
        </div>
      </AdminCard>
    </div>
  </div>
);
