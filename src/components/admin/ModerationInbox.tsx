import React, { useCallback, useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Flag,
  Search,
  RefreshCw,
  ChevronLeft,
  ChevronRight,
  Ban,
  CheckCircle,
  Trash2,
} from 'lucide-react';
import { toast } from 'sonner';
import { useServerFn } from '@tanstack/react-start';
import { listModerationEvents, moderateUser, type ModerationRow } from '@/lib/admin.functions';
import { AdminCard, EmptyState, formatNumber, relativeTime } from './AdminUI';

const PAGE_SIZE = 20;

export const ModerationInbox: React.FC = () => {
  const fetchEvents = useServerFn(listModerationEvents);
  const applyAction = useServerFn(moderateUser);

  const [scope, setScope] = useState('all');
  const [search, setSearch] = useState('');
  const [debounced, setDebounced] = useState('');
  const [page, setPage] = useState(1);
  const [events, setEvents] = useState<ModerationRow[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [busyId, setBusyId] = useState<string | null>(null);

  useEffect(() => {
    const id = setTimeout(() => {
      setDebounced(search);
      setPage(1);
    }, 350);
    return () => clearTimeout(id);
  }, [search]);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const result = await fetchEvents({ data: { page, scope, search: debounced } });
      setEvents(result.events);
      setTotal(result.total);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Unable to load moderation events');
    } finally {
      setLoading(false);
    }
  }, [fetchEvents, page, scope, debounced]);

  useEffect(() => {
    void load();
  }, [load]);

  const act = async (eventId: string, action: 'ban24h' | 'ban7d' | 'clear' | 'delete') => {
    setBusyId(eventId);
    const snapshot = events;
    setEvents((list) =>
      action === 'delete'
        ? list.filter((e) => e.id !== eventId)
        : list.map((e) =>
            e.id === eventId
              ? {
                  ...e,
                  banned_until:
                    action === 'clear'
                      ? null
                      : new Date(Date.now() + (action === 'ban7d' ? 7 : 1) * 86_400_000).toISOString(),
                }
              : e,
          ),
    );
    try {
      await applyAction({ data: { eventId, action } });
      toast.success(
        action === 'delete' ? 'Event deleted'
        : action === 'clear' ? 'Restriction lifted'
        : `User restricted for ${action === 'ban7d' ? '7 days' : '24 hours'}`,
      );
    } catch (error) {
      setEvents(snapshot);
      toast.error(error instanceof Error ? error.message : 'Action failed — reverted');
    } finally {
      setBusyId(null);
    }
  };

  const maxPage = Math.max(1, Math.ceil(total / PAGE_SIZE));

  return (
    <div className="w-full max-w-full space-y-4 overflow-x-hidden">
      <AdminCard title="Moderation inbox" description="Live safety events reported by the platform" icon={Flag}>
        <div className="flex w-full max-w-full flex-col gap-3 md:flex-row">
          <div className="relative min-w-0 flex-1">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500" />
            <Input
              placeholder="Search by reason…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9"
            />
          </div>
          <Select value={scope} onValueChange={(v) => { setScope(v); setPage(1); }}>
            <SelectTrigger className="w-full md:w-44"><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All events</SelectItem>
              <SelectItem value="open">Not restricted</SelectItem>
              <SelectItem value="banned">Restricted</SelectItem>
              <SelectItem value="last7d">Last 7 days</SelectItem>
            </SelectContent>
          </Select>
          <Button variant="outline" size="sm" onClick={() => void load()} disabled={loading} className="md:w-auto">
            <RefreshCw className={`mr-2 h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
        </div>
      </AdminCard>

      <p className="text-sm font-semibold text-slate-200">
        {loading ? 'Loading events…' : `${formatNumber(total)} events`}
      </p>

      {loading ? (
        <div className="space-y-3">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="h-28 w-full animate-pulse rounded-xl bg-slate-800/60" />
          ))}
        </div>
      ) : events.length === 0 ? (
        <EmptyState message="No moderation events match these filters." />
      ) : (
        <div className="space-y-3">
          {events.map((event) => {
            const restricted = event.banned_until && new Date(event.banned_until) > new Date();
            return (
              <Card key={event.id} className="w-full max-w-full overflow-hidden border border-slate-700/60 bg-slate-900/60">
                <CardContent className="space-y-3 p-4">
                  <div className="flex flex-wrap items-start justify-between gap-2">
                    <div className="min-w-0">
                      <p className="truncate font-semibold text-slate-100">{event.reason}</p>
                      <p className="truncate text-xs text-slate-400">
                        {event.user_name ?? 'Unknown user'} · {event.user_email ?? event.user_id}
                      </p>
                    </div>
                    <Badge variant={restricted ? 'destructive' : 'secondary'} className="shrink-0">
                      {restricted ? 'Restricted' : 'Open'}
                    </Badge>
                  </div>

                  <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-slate-400">
                    <span className="truncate">Source: {event.source}</span>
                    {event.room_name ? <span className="truncate">Room: {event.room_name}</span> : null}
                    <span>{relativeTime(event.created_at)}</span>
                    {event.banned_until ? <span>Until {new Date(event.banned_until).toLocaleString()}</span> : null}
                  </div>

                  <div className="grid grid-cols-2 gap-2 sm:flex sm:flex-wrap">
                    <Button variant="outline" size="sm" disabled={busyId === event.id} onClick={() => void act(event.id, 'ban24h')}>
                      <Ban className="mr-2 h-3 w-3" /> Ban 24h
                    </Button>
                    <Button variant="outline" size="sm" disabled={busyId === event.id} onClick={() => void act(event.id, 'ban7d')}>
                      <Ban className="mr-2 h-3 w-3" /> Ban 7d
                    </Button>
                    <Button variant="outline" size="sm" disabled={busyId === event.id} onClick={() => void act(event.id, 'clear')}>
                      <CheckCircle className="mr-2 h-3 w-3" /> Lift
                    </Button>
                    <Button variant="destructive" size="sm" disabled={busyId === event.id} onClick={() => void act(event.id, 'delete')}>
                      <Trash2 className="mr-2 h-3 w-3" /> Delete
                    </Button>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}

      <div className="flex w-full max-w-full items-center justify-between gap-2">
        <Button variant="outline" size="sm" disabled={page <= 1 || loading} onClick={() => setPage((p) => Math.max(1, p - 1))}>
          <ChevronLeft className="mr-1 h-4 w-4" /> Previous
        </Button>
        <span className="text-xs text-slate-400">Page {page} / {maxPage}</span>
        <Button variant="outline" size="sm" disabled={page >= maxPage || loading} onClick={() => setPage((p) => p + 1)}>
          Next <ChevronRight className="ml-1 h-4 w-4" />
        </Button>
      </div>
    </div>
  );
};
