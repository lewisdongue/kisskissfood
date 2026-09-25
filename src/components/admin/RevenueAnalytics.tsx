import React from 'react';
import { DollarSign, TrendingUp, Gift, Crown, Coins, Receipt } from 'lucide-react';
import type { RevenueBreakdown } from '@/lib/admin.functions';
import {
  AdminCard,
  EmptyState,
  Sparkline,
  StatCard,
  formatCurrency,
  formatNumber,
  relativeTime,
} from './AdminUI';

interface Props {
  data: RevenueBreakdown | null;
  loading: boolean;
}

export const RevenueAnalytics: React.FC<Props> = ({ data, loading }) => (
  <div className="w-full max-w-full space-y-4 overflow-x-hidden">
    <div className="grid w-full max-w-full grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-4">
      <StatCard title="Revenue (30d)" value={formatCurrency(data?.usd30d ?? 0)} description={`${formatCurrency(data?.usd7d ?? 0)} in 7 days`} icon={DollarSign} loading={loading} />
      <StatCard title="All-time" value={formatCurrency(data?.totalUsd ?? 0)} description={`${formatNumber(data?.paidUsers ?? 0)} paying users`} icon={TrendingUp} loading={loading} />
      <StatCard title="Gifts (30d)" value={formatNumber(data?.giftValue30d ?? 0)} description="Yuyu value gifted" icon={Gift} loading={loading} />
      <StatCard title="Premium" value={formatNumber(data?.premiumUsers ?? 0)} description="Premium accounts" icon={Crown} loading={loading} />
    </div>

    <AdminCard title="Daily revenue, last 30 days" description="Yuyu purchases and sales in USD" icon={TrendingUp}>
      {data && data.daily.some((d) => d.usd > 0) ? (
        <div className="w-full max-w-full space-y-2">
          <Sparkline points={data.daily.map((d) => ({ label: d.date, value: d.usd }))} />
          <div className="flex justify-between text-[10px] text-slate-500">
            <span>{data.daily[0]?.date}</span>
            <span>{data.daily[data.daily.length - 1]?.date}</span>
          </div>
        </div>
      ) : (
        <EmptyState message={loading ? 'Loading…' : 'No revenue recorded in the last 30 days.'} />
      )}
    </AdminCard>

    <div className="grid w-full max-w-full grid-cols-1 gap-3 lg:grid-cols-2">
      <AdminCard title="Yuyu market" description="Live internal price and flow" icon={Coins}>
        <div className="space-y-3">
          <div className="flex items-center justify-between rounded-lg bg-slate-800/60 px-3 py-2 text-sm">
            <span className="text-slate-300">Current Yuyu price</span>
            <span className="font-semibold text-slate-100">{formatCurrency(data?.yuyuPrice ?? 0)}</span>
          </div>
          <div className="flex items-center justify-between rounded-lg bg-slate-800/60 px-3 py-2 text-sm">
            <span className="text-slate-300">Market phase</span>
            <span className="font-semibold capitalize text-slate-100">{data?.marketPhase ?? 'unknown'}</span>
          </div>
          <div className="flex items-center justify-between rounded-lg bg-slate-800/60 px-3 py-2 text-sm">
            <span className="text-slate-300">Purchases</span>
            <span className="font-semibold text-emerald-400">{formatCurrency(data?.buyUsd ?? 0)}</span>
          </div>
          <div className="flex items-center justify-between rounded-lg bg-slate-800/60 px-3 py-2 text-sm">
            <span className="text-slate-300">Pay-outs</span>
            <span className="font-semibold text-amber-400">{formatCurrency(data?.sellUsd ?? 0)}</span>
          </div>
        </div>
      </AdminCard>

      <AdminCard title="Latest transactions" description="Most recent Yuyu movements" icon={Receipt}>
        {data && data.recent.length > 0 ? (
          <div className="w-full max-w-full space-y-2">
            {data.recent.map((tx) => (
              <div key={tx.id} className="flex items-center justify-between gap-2 rounded-lg bg-slate-800/60 px-3 py-2">
                <div className="min-w-0">
                  <p className="truncate text-sm capitalize text-slate-100">{tx.type}</p>
                  <p className="truncate text-[11px] text-slate-500">{relativeTime(tx.created_at)}</p>
                </div>
                <div className="shrink-0 text-right">
                  <p className="text-sm font-semibold text-slate-100">{formatCurrency(tx.amount_usd)}</p>
                  <p className="text-[11px] text-slate-500">{formatNumber(tx.amount)} Yuyu</p>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <EmptyState message={loading ? 'Loading…' : 'No transactions recorded yet.'} />
        )}
      </AdminCard>
    </div>
  </div>
);
