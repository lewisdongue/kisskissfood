import React, { useCallback, useEffect, useState } from 'react';
import { useServerFn } from '@tanstack/react-start';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Switch } from '@/components/ui/switch';
import { RefreshCw, Send, Clock, CheckCircle2, AlertTriangle, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import {
  getIndexingStatus,
  runIndexingNow,
  setIndexingConfig,
  type IndexingStatus,
} from '@/lib/indexing.functions';

function fmt(n: number) {
  return new Intl.NumberFormat('en-US').format(n);
}

export function IndexingPanel() {
  const fetchStatus = useServerFn(getIndexingStatus);
  const runNow = useServerFn(runIndexingNow);
  const saveConfig = useServerFn(setIndexingConfig);

  const [status, setStatus] = useState<IndexingStatus | null>(null);
  const [loading, setLoading] = useState(true);
  const [running, setRunning] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      setStatus(await fetchStatus());
    } catch (err) {
      toast.error((err as Error).message);
    } finally {
      setLoading(false);
    }
  }, [fetchStatus]);

  useEffect(() => {
    void load();
  }, [load]);

  const onRun = async () => {
    setRunning(true);
    try {
      const res = await runNow({ data: {} });
      if (res.failed > 0) {
        toast.error(`${res.failed}/${res.submitted} URLs refused. The cursor was not advanced.`);
      } else {
        toast.success(`${res.succeeded}/${res.submitted} URLs accepted by Google`);
      }
      await load();
    } catch (err) {
      toast.error((err as Error).message);
    } finally {
      setRunning(false);
    }
  };

  const onToggle = async (enabled: boolean) => {
    setStatus((s) => (s ? { ...s, enabled } : s));
    try {
      await saveConfig({ data: { enabled } });
      toast.success(enabled ? 'Daily auto-submission enabled' : 'Daily auto-submission paused');
    } catch (err) {
      toast.error((err as Error).message);
      await load();
    }
  };

  const progress = status ? Math.min(100, (status.nextOffset / Math.max(1, status.totalPerLang)) * 100) : 0;

  return (
    <div className="w-full max-w-full space-y-4">
      <Card className="admin-glass-card border backdrop-blur-xl">
        <CardContent className="space-y-4 p-4 sm:p-6">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div className="min-w-0">
              <h2 className="text-base font-semibold text-slate-100 sm:text-lg">
                Google Indexing
              </h2>
              <p className="mt-1 text-xs text-slate-400 sm:text-sm">
                A scheduled job submits a new batch to Google every day at 03:00 UTC — no action needed.
              </p>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-xs text-slate-400">Auto</span>
              <Switch
                checked={Boolean(status?.enabled)}
                onCheckedChange={(v) => void onToggle(v)}
                disabled={loading}
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            <Stat label="Per day" value={status ? fmt(status.dailyLimit) : '—'} />
            <Stat label="Accepted total" value={status ? fmt(status.submittedTotal) : '—'} />
            <Stat label="Cursor" value={status ? fmt(status.nextOffset) : '—'} />
            <Stat label="Pages / language" value={status ? fmt(status.totalPerLang) : '—'} />
          </div>

          <div className="space-y-1">
            <Progress value={progress} className="h-2" />
            <p className="text-[11px] text-slate-500">
              {progress.toFixed(2)}% of the {status ? fmt(status.totalPerLang) : ''} pages for{' '}
              <span className="uppercase">{status?.lang ?? 'en'}</span> submitted in the current pass.
            </p>
          </div>

          <div className="flex flex-wrap gap-2">
            <Button onClick={() => void onRun()} disabled={running} className="admin-indexing-primary gap-2">
              {running ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
              {running ? 'Submitting…' : 'Submit next batch now'}
            </Button>
            <Button variant="outline" onClick={() => void load()} disabled={loading} className="admin-action gap-2">
              <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} /> Refresh
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card className="admin-glass-card border backdrop-blur-xl">
        <CardContent className="p-0">
          <div className="border-b border-slate-800 px-4 py-3 text-sm font-medium text-slate-200 sm:px-6">
            Recent submissions
          </div>
          <div className="w-full max-w-full overflow-x-auto">
            <table className="admin-terminal-table w-full min-w-[640px] text-left text-xs sm:text-sm">
              <thead className="text-slate-400">
                <tr>
                  <th className="px-4 py-2 font-medium sm:px-6">When</th>
                  <th className="px-4 py-2 font-medium">Source</th>
                  <th className="px-4 py-2 font-medium">Range</th>
                  <th className="px-4 py-2 font-medium">Accepted</th>
                  <th className="px-4 py-2 font-medium">Status</th>
                </tr>
              </thead>
              <tbody className="text-slate-300">
                {(status?.runs ?? []).map((run) => (
                  <tr key={run.id} className="border-t border-slate-800/70">
                    <td className="whitespace-nowrap px-4 py-2 sm:px-6">
                      {new Date(run.created_at).toLocaleString()}
                    </td>
                    <td className="px-4 py-2 capitalize">{run.source}</td>
                    <td className="whitespace-nowrap px-4 py-2">
                      {fmt(run.start_offset ?? 0)} → {fmt((run.start_offset ?? 0) + (run.url_count ?? 0))}
                    </td>
                    <td className="px-4 py-2">
                      {run.succeeded ?? 0}/{run.submitted ?? run.url_count ?? 0}
                    </td>
                    <td className="px-4 py-2">
                      <StatusBadge status={run.status} error={run.error} />
                    </td>
                  </tr>
                ))}
                {!loading && (status?.runs.length ?? 0) === 0 && (
                  <tr>
                    <td colSpan={5} className="px-4 py-6 text-center text-slate-500 sm:px-6">
                      No submission yet.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="admin-indexing-stat rounded-md border p-3">
      <p className="text-[11px] uppercase tracking-wide text-slate-500">{label}</p>
      <p className="mt-1 truncate text-base font-semibold text-slate-100">{value}</p>
    </div>
  );
}

function StatusBadge({ status, error }: { status: string; error: string | null }) {
  if (status === 'done') {
    return (
      <Badge variant="outline" className="gap-1 border-emerald-700 text-emerald-400">
        <CheckCircle2 className="h-3 w-3" /> Done
      </Badge>
    );
  }
  if (status === 'pending') {
    return (
      <Badge variant="outline" className="gap-1 border-slate-700 text-slate-300">
        <Clock className="h-3 w-3" /> Pending
      </Badge>
    );
  }
  return (
    <div className="space-y-1">
      <Badge
        variant="outline"
        className="gap-1 border-red-800 text-red-400"
        title={error ?? undefined}
      >
        <AlertTriangle className="h-3 w-3" /> Error
      </Badge>
      {error ? <p className="max-w-72 whitespace-normal text-[11px] text-red-300">{error}</p> : null}
    </div>
  );
}
