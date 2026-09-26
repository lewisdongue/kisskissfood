import React, { useCallback, useEffect, useState } from 'react';
import { Link } from '@tanstack/react-router';
import { useServerFn } from '@tanstack/react-start';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Shield,
  RefreshCw,
  BarChart3,
  Users,
  PhoneCall,
  DollarSign,
  Flag,
  Lock,
  Search,
} from 'lucide-react';
import { toast } from 'sonner';
import { motion } from 'framer-motion';
import { supabase } from '@/integrations/supabase/client';
import {
  getAdminOverview,
  getCallInsights,
  getRevenueBreakdown,
  isAdminUser,
  type AdminOverview,
  type CallInsights as CallInsightsData,
  type RevenueBreakdown,
} from '@/lib/admin.functions';
import { OverviewDashboard } from '@/components/admin/OverviewDashboard';
import { UserControlPanel } from '@/components/admin/UserControlPanel';
import { CallInsights } from '@/components/admin/CallInsights';
import { RevenueAnalytics } from '@/components/admin/RevenueAnalytics';
import { ModerationInbox } from '@/components/admin/ModerationInbox';
import { IndexingPanel } from '@/components/admin/IndexingPanel';

type Access = 'checking' | 'signed_out' | 'denied' | 'granted';

export default function AdminDashboard() {
  const checkAdmin = useServerFn(isAdminUser);
  const fetchOverview = useServerFn(getAdminOverview);
  const fetchCalls = useServerFn(getCallInsights);
  const fetchRevenue = useServerFn(getRevenueBreakdown);

  const [access, setAccess] = useState<Access>('checking');
  const [loading, setLoading] = useState(true);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
  const [overview, setOverview] = useState<AdminOverview | null>(null);
  const [calls, setCalls] = useState<CallInsightsData | null>(null);
  const [revenue, setRevenue] = useState<RevenueBreakdown | null>(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      const { data } = await supabase.auth.getSession();
      if (cancelled) return;
      if (!data.session) {
        setAccess('signed_out');
        setLoading(false);
        return;
      }
      try {
        const result = await checkAdmin();
        if (cancelled) return;
        setAccess(result.isAdmin ? 'granted' : 'denied');
        if (!result.isAdmin) setLoading(false);
      } catch {
        if (!cancelled) {
          setAccess('denied');
          setLoading(false);
        }
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [checkAdmin]);

  const refresh = useCallback(async () => {
    setLoading(true);
    try {
      const [o, c, r] = await Promise.all([fetchOverview(), fetchCalls(), fetchRevenue()]);
      setOverview(o);
      setCalls(c);
      setRevenue(r);
      setLastUpdated(new Date());
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Unable to load dashboard data');
    } finally {
      setLoading(false);
    }
  }, [fetchOverview, fetchCalls, fetchRevenue]);

  useEffect(() => {
    if (access === 'granted') void refresh();
  }, [access, refresh]);

  if (access !== 'granted') {
    return (
      <div className="admin-shell flex min-h-screen w-full max-w-full items-center justify-center overflow-x-hidden p-4">
        <Card className="admin-glass-card w-full max-w-md border backdrop-blur-xl">
          <CardContent className="space-y-4 p-6 text-center">
            <Lock className="admin-accent-text mx-auto h-8 w-8" />
            <h1 className="text-xl font-bold text-slate-100">System management</h1>
            {access === 'checking' ? (
              <p className="text-sm text-slate-400">Checking your access…</p>
            ) : access === 'signed_out' ? (
              <>
                <p className="text-sm text-slate-400">Sign in with an administrator account to continue.</p>
                <Button asChild className="w-full">
                  <Link to="/">Sign in</Link>
                </Button>
              </>
            ) : (
              <>
                <p className="text-sm text-slate-400">
                  This account does not have administrator access.
                </p>
                <Button asChild variant="outline" className="w-full">
                  <Link to="/">Back to Caakus</Link>
                </Button>
              </>
            )}
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="admin-shell min-h-screen w-full max-w-full overflow-x-hidden">
      <header className="admin-header sticky top-0 z-40 w-full max-w-full border-b backdrop-blur-xl">
        <div className="mx-auto flex w-full max-w-[1480px] flex-wrap items-center justify-between gap-3 px-3 py-3 sm:px-6 sm:py-4">
          <div className="flex min-w-0 items-center gap-2">
            <div className="admin-brand-icon"><Shield className="h-5 w-5" /></div>
            <div className="min-w-0">
              <h1 className="truncate text-base font-bold text-slate-100 sm:text-xl">System management</h1>
              <p className="hidden text-[11px] text-slate-500 sm:block">Caakus control center</p>
            </div>
            <Badge variant="outline" className="admin-live-badge hidden shrink-0 sm:inline-flex">
              <span className="admin-live-dot" />
              Admin
            </Badge>
          </div>
          <div className="flex shrink-0 items-center gap-2">
            {lastUpdated ? (
              <span className="hidden text-xs text-slate-500 sm:inline">
                Updated {lastUpdated.toLocaleTimeString()}
              </span>
            ) : null}
            <Button variant="outline" size="sm" onClick={() => void refresh()} disabled={loading} className="admin-action h-9">
              <RefreshCw className={`mr-2 h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
              Refresh
            </Button>
          </div>
        </div>
      </header>

      <main className="mx-auto w-full max-w-[1480px] px-3 py-4 sm:px-6 sm:py-6">
        <Tabs defaultValue="overview" className="w-full max-w-full space-y-4">
          <div className="admin-tab-scroll w-full max-w-full overflow-x-auto pb-1">
            <TabsList className="admin-tabs inline-flex h-12 w-max min-w-full justify-start gap-1 p-1">
              <TabsTrigger value="overview" className="admin-tab admin-tab-overview gap-2 whitespace-nowrap">
                <BarChart3 className="h-4 w-4" /> Overview
              </TabsTrigger>
              <TabsTrigger value="users" className="admin-tab admin-tab-users gap-2 whitespace-nowrap">
                <Users className="h-4 w-4" /> Users
              </TabsTrigger>
              <TabsTrigger value="calls" className="admin-tab admin-tab-calls gap-2 whitespace-nowrap">
                <PhoneCall className="h-4 w-4" /> Calls
              </TabsTrigger>
              <TabsTrigger value="revenue" className="admin-tab admin-tab-revenue gap-2 whitespace-nowrap">
                <DollarSign className="h-4 w-4" /> Revenue
              </TabsTrigger>
              <TabsTrigger value="moderation" className="admin-tab admin-tab-moderation gap-2 whitespace-nowrap">
                <Flag className="h-4 w-4" /> Moderation
              </TabsTrigger>
              <TabsTrigger value="indexing" className="admin-tab admin-tab-indexing gap-2 whitespace-nowrap">
                <Search className="h-4 w-4" /> Indexing
              </TabsTrigger>
            </TabsList>
          </div>

          <TabsContent value="overview" className="admin-tone-overview w-full max-w-full"><motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }}><OverviewDashboard data={overview} loading={loading} /></motion.div></TabsContent>
          <TabsContent value="users" className="admin-tone-users w-full max-w-full"><motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }}><UserControlPanel /></motion.div></TabsContent>
          <TabsContent value="calls" className="admin-tone-calls w-full max-w-full"><motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }}><CallInsights data={calls} loading={loading} /></motion.div></TabsContent>
          <TabsContent value="revenue" className="admin-tone-revenue w-full max-w-full"><motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }}><RevenueAnalytics data={revenue} loading={loading} /></motion.div></TabsContent>
          <TabsContent value="moderation" className="admin-tone-moderation w-full max-w-full"><motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }}><ModerationInbox /></motion.div></TabsContent>
          <TabsContent value="indexing" className="admin-tone-indexing w-full max-w-full"><motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }}><IndexingPanel /></motion.div></TabsContent>
        </Tabs>
      </main>
    </div>
  );
}
