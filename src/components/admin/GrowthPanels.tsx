import React, { useEffect, useMemo, useRef, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { useServerFn } from '@tanstack/react-start';
import { toast } from 'sonner';
import { Film, Gift, Radio, Coins, History, Download, Loader2, Search, ShieldAlert, XCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { killSession, takeDownClip, type GrowthCenter } from '@/lib/admin.functions';
import { EmptyState, formatCurrency, formatDuration, relativeTime } from './AdminUI';

export const AnimatedNumber: React.FC<{ value: number; format?: (n: number) => string }> = ({ value, format }) => {
  const [shown, setShown] = useState(value);
  const from = useRef(value);
  useEffect(() => {
    const start = performance.now();
    const a = from.current;
    let raf = 0;
    const step = (t: number) => {
      const k = Math.min(1, (t - start) / 700);
      const v = a + (value - a) * (1 - Math.pow(1 - k, 3));
      setShown(v);
      if (k < 1) raf = requestAnimationFrame(step);
      else from.current = value;
    };
    raf = requestAnimationFrame(step);
    return () => cancelAnimationFrame(raf);
  }, [value]);
  const n = Math.abs(value) < 1000 && !Number.isInteger(value) ? shown : Math.round(shown);
  return <>{format ? format(n) : n.toLocaleString('en-US')}</>;
};

const Neon: React.FC<{ color: string; title: string; icon: React.ComponentType<{ className?: string }>; children: React.ReactNode; action?: React.ReactNode }> = ({ color, title, icon: Icon, children, action }) => (
  <div className="w-full max-w-full overflow-hidden rounded-2xl border bg-[#121824]/70 p-4 backdrop-blur-md" style={{ borderColor: `${color}40`, boxShadow: `0 0 24px -12px ${color}` }}>
    <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
      <h3 className="flex items-center gap-2 text-sm font-semibold text-slate-100"><Icon className="h-4 w-4" />{title}</h3>
      {action}
    </div>
    <div className="w-full max-w-full overflow-x-auto">{children}</div>
  </div>
);

const Metric: React.FC<{ color: string; label: string; value: number; format?: (n: number) => string; hint?: string }> = ({ color, label, value, format, hint }) => (
  <div className="rounded-xl border bg-[#0B0E14]/70 p-3 backdrop-blur-md" style={{ borderColor: `${color}33` }}>
    <p className="truncate text-[11px] uppercase tracking-wide text-slate-400">{label}</p>
    <p className="mt-1 truncate text-2xl font-bold" style={{ color }}><AnimatedNumber value={value} format={format} /></p>
    {hint ? <p className="truncate text-[11px] text-slate-500">{hint}</p> : null}
  </div>
);

function exportCsv(name: string, rows: Record<string, unknown>[]) {
  if (!rows.length) {
    toast.error('Nothing to export');
    return;
  }
  const keys = Object.keys(rows[0]);
  const csv = [keys.join(','), ...rows.map((r) => keys.map((k) => JSON.stringify(r[k] ?? '')).join(','))].join('\n');
  const a = document.createElement('a');
  a.href = URL.createObjectURL(new Blob([csv], { type: 'text/csv' }));
  a.download = `${name}-${new Date().toISOString().slice(0, 10)}.csv`;
  a.click();
  toast.success(`Exported ${rows.length} rows`);
}

function useTable<T>(rows: T[], keys: (keyof T)[], size = 10) {
  const [q, setQ] = useState('');
  const [page, setPage] = useState(1);
  const filtered = useMemo(() => {
    const t = q.trim().toLowerCase();
    return t ? rows.filter((r) => keys.some((k) => String(r[k] ?? '').toLowerCase().includes(t))) : rows;
  }, [rows, q, keys]);
  const max = Math.max(1, Math.ceil(filtered.length / size));
  const p = Math.min(page, max);
  const pageRows = filtered.slice((p - 1) * size, p * size);
  const controls = (
    <div className="mt-3 flex items-center justify-between gap-2 text-xs text-slate-400">
      <span>{filtered.length} rows</span>
      <div className="flex items-center gap-2">
        <Button size="sm" variant="outline" disabled={p <= 1} onClick={() => setPage(p - 1)}>Prev</Button>
        <span>{p}/{max}</span>
        <Button size="sm" variant="outline" disabled={p >= max} onClick={() => setPage(p + 1)}>Next</Button>
      </div>
    </div>
  );
  const search = (
    <div className="relative mb-3">
      <Search className="absolute left-2 top-2.5 h-4 w-4 text-slate-500" />
      <Input value={q} onChange={(e) => { setQ(e.target.value); setPage(1); }} placeholder="Search…" className="border-slate-700 bg-[#0B0E14] pl-8" />
    </div>
  );
  return { pageRows, controls, search, filtered };
}

const th = 'px-2 py-2 text-left text-[11px] font-medium uppercase text-slate-400';
const td = 'px-2 py-2 text-sm text-slate-200 whitespace-nowrap';

export const ClipsPanel: React.FC<{ data: GrowthCenter | null; onChange: (fn: (d: GrowthCenter) => GrowthCenter) => void }> = ({ data, onChange }) => {
  const take = useServerFn(takeDownClip);
  const [busy, setBusy] = useState<string | null>(null);
  const C = '#EC4899';
  const rows = data?.clips.recent ?? [];
  const t = useTable(rows, ['name', 'room_name']);
  const onTake = async (id: string) => {
    setBusy(id);
    const snapshot = data;
    onChange((d) => ({ ...d, clips: { ...d.clips, created: d.clips.created - 1, recent: d.clips.recent.filter((r) => r.id !== id) } }));
    try { await take({ data: { rewardId: id } }); toast.success('Clip taken down'); }
    catch (e) { if (snapshot) onChange(() => snapshot); toast.error(e instanceof Error ? e.message : 'Failed — reverted'); }
    finally { setBusy(null); }
  };
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-5">
        <Metric color={C} label="Clips created" value={data?.clips.created ?? 0} />
        <Metric color="#D946EF" label="Rewarded" value={data?.clips.claimed ?? 0} />
        <Metric color={C} label="Last 24h" value={data?.clips.last24h ?? 0} />
        <Metric color="#D946EF" label="Shared-link plays" value={data?.clips.plays ?? 0} />
        <Metric color={C} label="External re-shares" value={data?.clips.shares ?? 0} />
      </div>
      <p className="text-xs text-slate-500">Clips are recorded on the user’s device; downloads and bandwidth are not sent to the server, so they are not shown.</p>
      <Neon color={C} title="Latest clips" icon={Film} action={<Button size="sm" variant="outline" onClick={() => exportCsv('clips', t.filtered as any)}><Download className="mr-1 h-4 w-4" />CSV</Button>}>
        {t.search}
        {t.pageRows.length ? (
          <table className="w-full min-w-[600px]"><thead><tr><th className={th}>Creator</th><th className={th}>Room</th><th className={th}>Reward</th><th className={th}>Created</th><th className={th} /></tr></thead>
            <tbody><AnimatePresence initial={false}>{t.pageRows.map((r) => (
              <motion.tr key={r.id} layout initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0, x: 30 }} className="border-t border-slate-800">
                <td className={td}>{r.name}</td><td className={`${td} font-mono text-xs`}>{r.room_name.slice(0, 18)}</td>
                <td className={td}><span className="rounded-full px-2 py-0.5 text-xs" style={{ background: `${C}22`, color: C }}>{r.claimed_at ? `+${r.amount} Yuyu` : 'pending'}</span></td>
                <td className={td}>{relativeTime(r.started_at)}</td>
                <td className={td}><Button size="sm" variant="destructive" disabled={busy === r.id} onClick={() => void onTake(r.id)}>{busy === r.id ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Take Down'}</Button></td>
              </motion.tr>))}</AnimatePresence></tbody></table>
        ) : <EmptyState message="No clips yet." />}
        {t.controls}
      </Neon>
    </div>
  );
};

export const ReferralsPanel: React.FC<{ data: GrowthCenter | null }> = ({ data }) => {
  const C = '#8B5CF6';
  const t = useTable(data?.referrals.top ?? [], ['name', 'code']);
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-6">
        <Metric color={C} label="Referrals" value={data?.referrals.total ?? 0} />
        <Metric color="#2DD4BF" label="Verified" value={data?.referrals.verified ?? 0} />
        <Metric color={C} label="Credited" value={data?.referrals.credited ?? 0} />
        <Metric color="#2DD4BF" label="Last 7 days" value={data?.referrals.last7d ?? 0} />
        <Metric color={C} label="Link clicks" value={data?.referrals.shareClicks ?? 0} />
        <Metric color="#2DD4BF" label="Link sign-ups" value={data?.referrals.shareSignups ?? 0} />
      </div>
      <div className="grid gap-4 lg:grid-cols-2">
        <Neon color={C} title="Top referrers" icon={Gift} action={<Button size="sm" variant="outline" onClick={() => exportCsv('referrers', t.filtered as any)}><Download className="mr-1 h-4 w-4" />CSV</Button>}>
          {t.search}
          {t.pageRows.length ? (
            <table className="w-full min-w-[360px]"><thead><tr><th className={th}>#</th><th className={th}>User</th><th className={th}>Code</th><th className={th}>Friends</th></tr></thead>
              <tbody>{t.pageRows.map((r, i) => (<tr key={r.id} className="border-t border-slate-800"><td className={td}>{i + 1}</td><td className={td}>{r.name}</td><td className={`${td} font-mono text-xs`}>{r.code}</td><td className={td} style={{ color: '#2DD4BF' }}>{r.count}</td></tr>))}</tbody></table>
          ) : <EmptyState message="No credited referrals yet." />}
          {t.controls}
        </Neon>
        <Neon color="#F43F5E" title="Fraud flags (same IP)" icon={ShieldAlert}>
          {data?.referrals.fraud.length ? (
            <table className="w-full min-w-[320px]"><thead><tr><th className={th}>IP</th><th className={th}>Clicks</th><th className={th}>Sign-ups</th></tr></thead>
              <tbody>{data.referrals.fraud.map((f) => (<tr key={f.ip} className="border-t border-slate-800"><td className={`${td} font-mono text-xs`}>{f.ip}</td><td className={td}>{f.clicks}</td><td className={td} style={{ color: '#F43F5E' }}>{f.signups}</td></tr>))}</tbody></table>
          ) : <EmptyState message="No suspicious IP activity." />}
        </Neon>
      </div>
    </div>
  );
};

export const LivePanel: React.FC<{ data: GrowthCenter | null; onChange: (fn: (d: GrowthCenter) => GrowthCenter) => void }> = ({ data, onChange }) => {
  const kill = useServerFn(killSession);
  const [busy, setBusy] = useState<string | null>(null);
  const C = '#3B82F6';
  const t = useTable(data?.live.rooms ?? [], ['room_name', 'user', 'partner']);
  const onKill = async (id: string) => {
    setBusy(id);
    const snapshot = data;
    onChange((d) => ({ ...d, live: { ...d.live, activeRooms: d.live.activeRooms - 1, rooms: d.live.rooms.filter((r) => r.id !== id) } }));
    try { await kill({ data: { matchId: id } }); toast.success('Session killed'); }
    catch (e) { if (snapshot) onChange(() => snapshot); toast.error(e instanceof Error ? e.message : 'Failed — reverted'); }
    finally { setBusy(null); }
  };
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-5">
        <Metric color={C} label="Active rooms" value={data?.live.activeRooms ?? 0} />
        <Metric color="#6366F1" label="Waiting in queue" value={data?.live.waiting ?? 0} />
        <Metric color={C} label="Calls 24h" value={data?.live.calls24h ?? 0} />
        <Metric color="#6366F1" label="Connected ≥10s" value={data?.live.successRate ?? 0} format={(n) => `${Math.round(n)}%`} />
        <Metric color={C} label="Avg duration" value={data?.live.avgSeconds ?? 0} format={formatDuration} />
      </div>
      <p className="text-xs text-slate-500">ICE candidate states stay peer-to-peer in the browser and are not stored, so they are not shown.</p>
      <Neon color={C} title="Live rooms" icon={Radio}>
        {t.search}
        {t.pageRows.length ? (
          <table className="w-full min-w-[600px]"><thead><tr><th className={th}>Room</th><th className={th}>User</th><th className={th}>Partner</th><th className={th}>Started</th><th className={th} /></tr></thead>
            <tbody><AnimatePresence initial={false}>{t.pageRows.map((r) => (
              <motion.tr key={r.id} layout initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0, x: 30 }} className="border-t border-slate-800">
                <td className={`${td} font-mono text-xs`}><span className="mr-2 inline-block h-2 w-2 animate-pulse rounded-full" style={{ background: C }} />{r.room_name.slice(0, 18)}</td>
                <td className={td}>{r.user}</td><td className={td}>{r.partner}</td><td className={td}>{relativeTime(r.created_at)}</td>
                <td className={td}><Button size="sm" variant="destructive" disabled={busy === r.id} onClick={() => void onKill(r.id)}>{busy === r.id ? <Loader2 className="h-4 w-4 animate-spin" /> : <><XCircle className="mr-1 h-4 w-4" />Kill Session</>}</Button></td>
              </motion.tr>))}</AnimatePresence></tbody></table>
        ) : <EmptyState message="No live rooms right now." />}
        {t.controls}
      </Neon>
    </div>
  );
};

export const EconomyPanel: React.FC<{ data: GrowthCenter | null }> = ({ data }) => {
  const C = '#22C55E';
  const e = data?.economy;
  const t = useTable(e?.purchases ?? [], ['name', 'status', 'payment_method']);
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <Metric color="#F59E0B" label="Yuyu supply" value={e?.supply ?? 0} />
        <Metric color={C} label="Wallet balances" value={e?.usdBalances ?? 0} format={formatCurrency} />
        <Metric color="#F59E0B" label="Yuyu bought" value={e?.purchasedYuyu ?? 0} hint={formatCurrency(e?.purchasedUsd ?? 0)} />
        <Metric color={C} label="Yuyu price" value={e?.price ?? 0} format={(n) => `$${n.toFixed(4)}`} />
        <Metric color="#F59E0B" label="Credited referrals" value={e?.referralRewards ?? 0} />
        <Metric color={C} label="Clip rewards paid" value={e?.clipRewards ?? 0} />
        <Metric color="#F43F5E" label="Failed payments" value={e?.failedPayments ?? 0} />
        <Metric color="#F43F5E" label="Refund / chargeback" value={e?.refunded ?? 0} />
      </div>
      <Neon color={C} title="Purchase ledger" icon={Coins} action={<Button size="sm" variant="outline" onClick={() => exportCsv('purchases', t.filtered as any)}><Download className="mr-1 h-4 w-4" />CSV</Button>}>
        {t.search}
        {t.pageRows.length ? (
          <table className="w-full min-w-[600px]"><thead><tr><th className={th}>User</th><th className={th}>USD</th><th className={th}>Yuyu</th><th className={th}>Method</th><th className={th}>Status</th><th className={th}>When</th></tr></thead>
            <tbody>{t.pageRows.map((r) => {
              const risk = /fail|refund|charge|dispute/i.test(r.status);
              return (<tr key={r.id} className="border-t border-slate-800"><td className={td}>{r.name}</td><td className={td}>{formatCurrency(r.amount_usd)}</td><td className={td}>{r.yuyu_coins}</td><td className={td}>{r.payment_method}</td>
                <td className={td}><span className="rounded-full px-2 py-0.5 text-xs" style={{ background: risk ? '#F43F5E22' : `${C}22`, color: risk ? '#F43F5E' : C }}>{r.status}</span></td><td className={td}>{relativeTime(r.created_at)}</td></tr>);
            })}</tbody></table>
        ) : <EmptyState message="No purchases yet." />}
        {t.controls}
      </Neon>
    </div>
  );
};

export const AuditPanel: React.FC<{ data: GrowthCenter | null }> = ({ data }) => {
  const C = '#94A3B8';
  const t = useTable(data?.audit ?? [], ['action', 'admin', 'target_id'], 15);
  return (
    <Neon color={C} title="Admin audit trail" icon={History} action={<Button size="sm" variant="outline" onClick={() => exportCsv('audit', t.filtered as any)}><Download className="mr-1 h-4 w-4" />CSV</Button>}>
      {t.search}
      {t.pageRows.length ? (
        <ol className="space-y-2"><AnimatePresence initial={false}>{t.pageRows.map((a) => (
          <motion.li key={a.id} layout initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} className="flex flex-wrap items-center justify-between gap-2 rounded-lg border border-slate-800 bg-[#0B0E14]/70 px-3 py-2 text-sm">
            <span className="min-w-0 truncate text-slate-200"><b>{a.action}</b> on {a.target_type} <span className="font-mono text-xs text-slate-400">{a.target_id?.slice(0, 12)}</span> by {a.admin}</span>
            <span className="shrink-0 text-xs text-slate-500">{relativeTime(a.created_at)}</span>
          </motion.li>))}</AnimatePresence></ol>
      ) : <EmptyState message="No admin actions recorded yet." />}
      {t.controls}
    </Neon>
  );
};
