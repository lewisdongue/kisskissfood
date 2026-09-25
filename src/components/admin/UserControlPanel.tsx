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
  Users,
  Search,
  Download,
  Crown,
  Globe,
  ChevronLeft,
  ChevronRight,
  RefreshCw,
  Loader2,
} from 'lucide-react';
import { toast } from 'sonner';
import { useServerFn } from '@tanstack/react-start';
import { listAdminUsers, setUserPremium, type AdminUserRow } from '@/lib/admin.functions';
import { AdminCard, EmptyState, formatCurrency, formatNumber, relativeTime } from './AdminUI';

const PAGE_SIZE = 20;

export const UserControlPanel: React.FC = () => {
  const fetchUsers = useServerFn(listAdminUsers);
  const togglePremium = useServerFn(setUserPremium);

  const [search, setSearch] = useState('');
  const [debounced, setDebounced] = useState('');
  const [filter, setFilter] = useState('all');
  const [sortBy, setSortBy] = useState('lastActive');
  const [page, setPage] = useState(1);
  const [users, setUsers] = useState<AdminUserRow[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [premiumBusyId, setPremiumBusyId] = useState<string | null>(null);
  const [exporting, setExporting] = useState(false);

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
      const result = await fetchUsers({ data: { page, search: debounced, filter, sortBy } });
      setUsers(result.users);
      setTotal(result.total);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Unable to load users');
    } finally {
      setLoading(false);
    }
  }, [fetchUsers, page, debounced, filter, sortBy]);

  useEffect(() => {
    void load();
  }, [load]);

  const onTogglePremium = async (user: AdminUserRow) => {
    setPremiumBusyId(user.id);
    const next = !user.is_premium;
    setUsers((list) => list.map((u) => (u.id === user.id ? { ...u, is_premium: next } : u)));
    try {
      await togglePremium({ data: { userId: user.id, premium: next } });
      toast.success(`${user.name} is now ${next ? 'premium' : 'standard'}`);
    } catch (error) {
      setUsers((list) => list.map((u) => (u.id === user.id ? { ...u, is_premium: !next } : u)));
      toast.error(error instanceof Error ? error.message : 'Update failed — reverted');
    } finally {
      setPremiumBusyId(null);
    }
  };

  const exportCsv = () => {
    if (users.length === 0) {
      toast.error('Nothing to export on this page');
      return;
    }
    setExporting(true);
    const header = ['id', 'name', 'email', 'country', 'language', 'yuyu_score', 'balance', 'is_premium', 'created_at', 'last_active_at'];
    const rows = users.map((u) => header.map((k) => JSON.stringify((u as Record<string, unknown>)[k] ?? '')).join(','));
    const blob = new Blob([[header.join(','), ...rows].join('\n')], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `caakus-users-page-${page}.csv`;
    link.click();
    URL.revokeObjectURL(url);
    toast.success('CSV exported');
    window.setTimeout(() => setExporting(false), 350);
  };

  const maxPage = Math.max(1, Math.ceil(total / PAGE_SIZE));

  return (
    <div className="w-full max-w-full space-y-4 overflow-x-hidden">
      <AdminCard title="User management" description="Search, filter and manage real accounts" icon={Users}>
        <div className="flex w-full max-w-full flex-col gap-3 md:flex-row">
          <div className="relative min-w-0 flex-1">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500" />
            <Input
              placeholder="Search by name or email…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9"
            />
          </div>
          <div className="grid grid-cols-2 gap-2 md:flex md:w-auto">
            <Select value={filter} onValueChange={(v) => { setFilter(v); setPage(1); }}>
              <SelectTrigger className="w-full md:w-40"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All users</SelectItem>
                <SelectItem value="active24h">Active (24h)</SelectItem>
                <SelectItem value="premium">Premium</SelectItem>
                <SelectItem value="free">Standard</SelectItem>
                <SelectItem value="dormant">Dormant (30d+)</SelectItem>
              </SelectContent>
            </Select>
            <Select value={sortBy} onValueChange={(v) => { setSortBy(v); setPage(1); }}>
              <SelectTrigger className="w-full md:w-40"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="lastActive">Last active</SelectItem>
                <SelectItem value="joined">Join date</SelectItem>
                <SelectItem value="yuyu">Yuyu balance</SelectItem>
                <SelectItem value="balance">USD balance</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </AdminCard>

      <div className="flex w-full max-w-full flex-wrap items-center justify-between gap-2">
        <h3 className="min-w-0 truncate text-sm font-semibold text-slate-200">
          {loading ? 'Loading users…' : `${formatNumber(total)} users`}
        </h3>
        <div className="flex flex-wrap gap-2">
          <Button variant="outline" size="sm" onClick={() => void load()} disabled={loading} className="admin-action">
            <RefreshCw className={`mr-2 h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
          <Button variant="outline" size="sm" onClick={exportCsv} disabled={exporting} className="admin-action">
            {exporting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Download className="mr-2 h-4 w-4" />}
            Export CSV
          </Button>
        </div>
      </div>

      {loading ? (
        <div className="space-y-3">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="admin-loading h-28 w-full animate-pulse rounded-md" />
          ))}
        </div>
      ) : users.length === 0 ? (
        <EmptyState message="No users match these filters." />
      ) : (
        <div className="space-y-3">
          {users.map((user) => (
            <Card key={user.id} className="admin-user-card w-full max-w-full overflow-hidden border backdrop-blur-xl">
              <CardContent className="space-y-3 p-4">
                <div className="flex flex-wrap items-start justify-between gap-2">
                  <div className="min-w-0">
                    <p className="truncate font-semibold text-slate-100">{user.name || 'Unnamed'}</p>
                    <p className="truncate text-xs text-slate-400">{user.email}</p>
                  </div>
                  <Badge variant="outline" className={`admin-pill shrink-0 ${user.is_premium ? 'admin-pill-premium' : 'admin-pill-standard'}`}>
                    <span className="admin-pill-dot" />
                    {user.is_premium ? 'Premium' : 'Standard'}
                  </Badge>
                </div>

                <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
                  <div className="min-w-0">
                    <p className="text-[10px] uppercase text-slate-500">Yuyu</p>
                    <p className="truncate text-sm font-bold text-amber-300">{formatNumber(Number(user.yuyu_score ?? 0))}</p>
                  </div>
                  <div className="min-w-0">
                    <p className="text-[10px] uppercase text-slate-500">Balance</p>
                    <p className="truncate text-sm font-semibold text-slate-100">{formatCurrency(Number(user.balance ?? 0))}</p>
                  </div>
                  <div className="min-w-0">
                    <p className="text-[10px] uppercase text-slate-500">Level</p>
                    <p className="truncate text-sm font-semibold text-slate-100">{user.level} · {user.streak_count}🔥</p>
                  </div>
                  <div className="min-w-0">
                    <p className="text-[10px] uppercase text-slate-500">Country</p>
                    <p className="flex items-center gap-1 truncate text-sm font-semibold text-slate-100">
                      <Globe className="h-3 w-3 shrink-0" />
                      <span className="truncate">{user.country || 'Unknown'}</span>
                    </p>
                  </div>
                </div>

                <div className="flex flex-wrap items-center justify-between gap-2 text-xs text-slate-400">
                  <span className="truncate">
                    Active {relativeTime(user.last_active_at)} · joined {new Date(user.created_at).toLocaleDateString()}
                  </span>
                  <Button variant="outline" size="sm" disabled={premiumBusyId === user.id} onClick={() => void onTogglePremium(user)} className="admin-action w-full sm:w-auto">
                    {premiumBusyId === user.id ? <Loader2 className="mr-2 h-3 w-3 animate-spin" /> : <Crown className="mr-2 h-3 w-3" />}
                    {user.is_premium ? 'Remove premium' : 'Grant premium'}
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
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
