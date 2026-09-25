import React, { useState, useEffect, useCallback, useRef, useMemo } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
  ReferenceLine,
} from 'recharts';
import {
  TrendingDown,
  TrendingUp,
  Users,
  Phone,
  Gift,
  Flame,
  RefreshCw,
  ArrowLeft,
  ArrowUp,
  ArrowDown,
  CreditCard,
  Wallet,
  Loader2,
  AlertCircle,
  CheckCircle2,
  ShieldAlert,
  ShieldCheck,
  ShieldOff,
  Info,
  Activity,
} from 'lucide-react';
import {
  getYuyucoinPrice,
  getYuyucoinChartData,
  getAndRefreshYuyuLiveStats,
  getUserWithdrawalLimits,
  buyYuyuWithWallet,
  sellYuyu,
  createInvestmentCheckout,
  YUYU_PRICE_FLOOR,
  YUYU_PRICE_CEILING,
  YUYU_BUY_FEE_PCT,
  YUYU_SELL_FEE_PCT,
  type YuyucoinPriceData,
  type YuyucoinChartPoint,
  type YuyuLiveStats,
  type WithdrawalLimits,
} from '../services/yuyucoinPriceService';

/** 8,000,000,000 YUYU in circulation — market cap = supply × live price. */
const YUYU_CIRCULATING_TOKENS = 8_000_000_000;

import { useCoinsBalance } from '../hooks/useCoins';
import { useYuyuTicker, bucketTicks, isIntraday, historicalSeries, type IntradayTf } from '../hooks/useYuyuTicker';
import { supabase } from '../config/supabase';
import toast from 'react-hot-toast';
import { useQueryClient } from '@tanstack/react-query';

// ─── Types ────────────────────────────────────────────────────────────────────

// Core timeframes: 1D = intra-day hourly closes, 1W/1M = daily candles, 1Y = weekly candles.
// All three weekly/monthly/yearly views are DERIVED from the same yuyu_daily_price rows —
// no separate price calculation ever runs for them.
const TIMEFRAMES = ['1m', '5m', '15m', '1h', '1D', '1W', '1M', '1Y'] as const;
type Timeframe  = (typeof TIMEFRAMES)[number];
type ModalView  = 'chart' | 'buy' | 'sell';

interface InvestYuyucoinModalProps {
  open:    boolean;
  onClose: () => void;
}

// ─── Sub-components ───────────────────────────────────────────────────────────

const YuyucoinLogo: React.FC<{ size?: 'sm' | 'md' | 'lg' }> = ({ size = 'md' }) => {
  const dims = { sm: 'w-8 h-8 text-sm', md: 'w-12 h-12 text-lg', lg: 'w-16 h-16 text-2xl' }[size];
  return (
    <div
      className={`${dims} rounded-full bg-gradient-to-br from-yellow-300 via-yellow-400 to-amber-600 flex items-center justify-center shadow-lg border-2 border-amber-500/50 flex-shrink-0`}
    >
      <span className="font-black text-amber-800">Y</span>
    </div>
  );
};

// ─── Price formatting helper ──────────────────────────────────────────────────

function formatPrice(n: number): string {
  if (n === 0)   return '0.000000';
  if (n < 0.001) return n.toFixed(8);
  if (n < 0.01)  return n.toFixed(6);
  if (n < 0.10)  return n.toFixed(5);
  if (n < 1)     return n.toFixed(4);
  return n.toFixed(3);
}

// ─── Professional chart tooltip ───────────────────────────────────────────────

interface ChartTooltipProps {
  active?:    boolean;
  payload?:   Array<{ value?: number; payload?: YuyucoinChartPoint }>;
  label?:     string;
  openPrice?: number;
  timeframe?: string;
}

function ChartTooltip({ active, payload, label, openPrice, timeframe }: ChartTooltipProps) {
  if (!active || !payload?.length) return null;

  const pt      = payload[0]?.payload as YuyucoinChartPoint | undefined;
  const close   = pt?.close ?? (payload[0]?.value as number);
  const open    = pt?.open  ?? openPrice ?? close;
  const high    = pt?.high  ?? close;
  const low     = pt?.low   ?? close;
  const pct     = open > 0 ? ((close - open) / open) * 100 : null;
  const isUp    = (pct ?? 0) >= 0;

  const periodLabel =
    timeframe === '1D' ? 'Hourly close' :
    timeframe === '1W' ? 'Daily close'  :
    timeframe === '1M' ? 'Daily close'  :
    'Weekly close';

  return (
    <div className="bg-slate-900/98 backdrop-blur-sm border border-white/20 rounded-xl shadow-2xl px-3.5 py-2.5 min-w-[168px] pointer-events-none">
      {label && (
        <div className="text-white/40 text-[11px] font-medium mb-1.5 pb-1.5 border-b border-white/10 flex items-center gap-1.5">
          <span className="w-1.5 h-1.5 rounded-full bg-amber-400 flex-shrink-0" />
          {label}
        </div>
      )}
      <div className="text-[10px] text-white/35 mb-0.5">{periodLabel}</div>
      <div className="text-white font-bold text-base tabular-nums tracking-tight">
        ${typeof close === 'number' ? formatPrice(close) : '—'}
      </div>
      {/* OHLC breakdown */}
      <div className="mt-2 space-y-0.5 text-[10px] tabular-nums">
        <div className="flex justify-between gap-3">
          <span className="text-white/35">Open</span>
          <span className="text-white/70 font-medium">${formatPrice(open)}</span>
        </div>
        <div className="flex justify-between gap-3">
          <span className="text-green-400/60">High</span>
          <span className="text-green-400 font-medium">${formatPrice(high)}</span>
        </div>
        <div className="flex justify-between gap-3">
          <span className="text-red-400/60">Low</span>
          <span className="text-red-400 font-medium">${formatPrice(low)}</span>
        </div>
        <div className="flex justify-between gap-3">
          <span className="text-white/35">Close</span>
          <span className="text-white/80 font-medium">${formatPrice(close)}</span>
        </div>
      </div>
      {pct !== null && (
        <div className={`flex items-center gap-1 text-[11px] font-semibold mt-2 pt-1.5 border-t border-white/10 ${isUp ? 'text-green-400' : 'text-red-400'}`}>
          {isUp ? <ArrowUp className="w-2.5 h-2.5" /> : <ArrowDown className="w-2.5 h-2.5" />}
          {pct >= 0 ? '+' : ''}{pct.toFixed(3)}% this {timeframe === '1D' ? 'hour' : timeframe === '1Y' ? 'week' : 'day'}
        </div>
      )}
    </div>
  );
}

// ─── Professional fully-responsive chart ─────────────────────────────────────

interface ChartRendererProps {
  displayData:  YuyucoinChartPoint[];
  timeframe:    string;
  openPrice:    number;
  closePrice:   number;
  livePrice:    number;
}

function ChartRenderer({ displayData, timeframe, openPrice, closePrice, livePrice }: ChartRendererProps) {
  const containerRef = React.useRef<HTMLDivElement>(null);
  const [containerW, setContainerW] = React.useState(0);

  React.useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const ro = new ResizeObserver(entries => {
      const w = entries[0]?.contentRect.width;
      if (w) setContainerW(w);
    });
    ro.observe(el);
    setContainerW(el.clientWidth);
    return () => ro.disconnect();
  }, []);

  const width = containerW || (typeof window !== 'undefined' ? window.innerWidth : 520);
  const isMobile = width < 520;
  const isNarrow = width < 400; // PWA / small phone: fewer labels, more readable
  const pts      = displayData.length;

  // ── Y-axis domain — tight professional range ──────────────────────────────
  // Use OHLC high/low so wick extremes are visible
  const allHighs  = displayData.map(p => p.high  ?? p.price).filter(p => p > 0);
  const allLows   = displayData.map(p => p.low   ?? p.price).filter(p => p > 0);
  const allPrices = displayData.map(p => p.price).filter(p => p > 0);
  const dataMax   = allHighs.length > 0 ? Math.max(...allHighs) : livePrice;
  const dataMin   = allLows.length  > 0 ? Math.min(...allLows)  : livePrice;

  // Tight padding: only 8–12% around the actual data range.
  // Never use percentage-of-price for padding — use percentage of the RANGE itself.
  const rawRange   = Math.max(dataMax - dataMin, dataMax * 0.0001); // minimum 0.01% range
  const padAmount  = rawRange * 0.15;  // 15% of the data range (not price) for breathing room
  const yMin = Math.max(YUYU_PRICE_FLOOR, dataMin - padAmount);
  const yMax = Math.min(YUYU_PRICE_CEILING, dataMax + padAmount);

  // ── Smart "nice" Y-axis ticks ─────────────────────────────────────────────
  // Generate N evenly-spaced ticks within [yMin, yMax], rounded to the same
  // decimal precision as the prices so labels look clean (e.g. $0.009491 not $0.009491234).
  const yTicks = React.useMemo(() => {
    const count     = isMobile ? 4 : 5;
    const span      = yMax - yMin;
    const rawStep   = span / (count - 1);

    // Pick a "nice" step: round to the nearest power-of-10 magnitude
    const magnitude = Math.pow(10, Math.floor(Math.log10(rawStep)));
    const niceStep  = Math.ceil(rawStep / magnitude) * magnitude;

    // Anchor the first tick just above yMin so labels stay inside the chart
    const firstTick = Math.ceil(yMin / niceStep) * niceStep;

    const ticks: number[] = [];
    for (let i = 0; i < count + 2; i++) {
      const v = firstTick + niceStep * i;
      if (v > yMax + niceStep) break;
      ticks.push(v);
    }
    // Always include yMin and yMax anchors
    if (ticks[0]! > yMin + rawStep * 0.3) ticks.unshift(yMin);
    if (ticks[ticks.length - 1]! < yMax - rawStep * 0.3) ticks.push(yMax);
    return ticks;
  }, [yMin, yMax, isMobile]);

  // ── X-axis label set ───────────────────────────────────────────────────────
  const MONTH_NAMES_SET = new Set(['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec']);

  const labelIndices = React.useMemo<Set<number>>(() => {
    const s = new Set<number>();
    if (pts === 0) return s;

    if (isIntraday(timeframe)) {
      // Evenly spaced time labels for the seconds/minutes views
      const count = isNarrow ? 3 : isMobile ? 4 : 6;
      const step  = Math.max(1, Math.floor(pts / count));
      for (let i = 0; i < pts; i += step) s.add(i);
      s.add(pts - 1);
      return s;
    }

    if (timeframe === '1D') {
      // Show top-of-hour ticks + "Now"; fewer on narrow/PWA to avoid overlap
      const hourStep = isNarrow ? 4 : isMobile ? 3 : 2;
      displayData.forEach((d, i) => {
        if (d.time === 'Now') { s.add(i); return; }
        if (!d.time.endsWith(':00')) return;
        const hour = Number(d.time.split(':')[0]);
        if (Number.isFinite(hour) && hour % hourStep === 0) s.add(i);
      });
      s.add(pts - 1);
      return s;
    }

    if (timeframe === '1W') {
      // All 7 days
      for (let i = 0; i < pts; i++) s.add(i);
      return s;
    }

    if (timeframe === '1M') {
      // ~7 evenly spaced labels
      const step = Math.max(1, Math.round(pts / (isMobile ? 5 : 7)));
      for (let i = 0; i < pts; i += step) s.add(i);
      s.add(0);
      s.add(pts - 1);
      return s;
    }

    // 1Y: one label per month-change + last
    displayData.forEach((d, i) => {
      if (MONTH_NAMES_SET.has(d.time) || d.time === 'This Wk') s.add(i);
    });
    s.add(0);
    s.add(pts - 1);
    return s;
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pts, timeframe, displayData, isMobile, isNarrow]);

  // ── Custom X-axis tick ─────────────────────────────────────────────────────
  const CustomXTick = React.useCallback((props: {
    x?: number; y?: number; index?: number; payload?: { value: string };
  }) => {
    const { x = 0, y = 0, index = 0, payload } = props;
    if (!payload || !labelIndices.has(index)) return null;

    const isAccent = payload.value === 'Now'
      || payload.value === 'Today'
      || payload.value === 'This Wk';
    // Larger fonts on mobile/PWA for readability (min 10px)
    const fs = isMobile ? 10 : 11;
    const tickY = isMobile ? 14 : 13;

    return (
      <g transform={`translate(${x},${y})`}>
        <line x1={0} y1={0} x2={0} y2={4} stroke="rgba(255,255,255,0.12)" strokeWidth={1} />
        <text
          x={0}
          y={tickY}
          textAnchor="middle"
          dominantBaseline="hanging"
          fill={isAccent ? 'rgba(251,191,36,0.90)' : 'rgba(255,255,255,0.40)'}
          fontSize={fs}
          fontFamily="system-ui,ui-sans-serif,sans-serif"
          fontWeight={isAccent ? 700 : 400}
          letterSpacing={isAccent ? '0' : '-0.02em'}
        >
          {payload.value}
        </text>
      </g>
    );
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [labelIndices, isMobile]);

  // ── Custom Y-axis tick — right-side price labels ───────────────────────────
  // Determine how many decimal places to show based on the actual tick step size
  const yTickDecimals = React.useMemo(() => {
    if (yTicks.length < 2) return 6;
    const step = Math.abs(yTicks[1]! - yTicks[0]!);
    if (step === 0) return 6;
    // Show enough decimals to distinguish adjacent ticks; cap on mobile to avoid overflow
    const dec = Math.max(0, Math.ceil(-Math.log10(step)) + 1);
    return Math.min(dec, isMobile ? 5 : 8);
  }, [yTicks, isMobile]);

  const formatYTick = React.useCallback((v: number) => {
    return '$' + v.toFixed(yTickDecimals);
  }, [yTickDecimals]);

  const CustomYTick = React.useCallback((props: {
    x?: number; y?: number; payload?: { value: number };
  }) => {
    const { x = 0, y = 0, payload } = props;
    if (!payload) return null;
    const v = payload.value;

    // Highlight the row closest to live price
    const isLive = allPrices.length > 0 && Math.abs(v - livePrice) / Math.max(livePrice, 0.00001) < 0.015;
    // Larger fonts on mobile/PWA so price labels are readable
    const fs = isMobile ? 10 : 11;

    return (
      <g transform={`translate(${x},${y})`}>
        {isLive && (
          <line
            x1={-4} y1={0}
            x2={isMobile ? -containerW + 20 : -containerW + 24} y2={0}
            stroke="rgba(251,191,36,0.15)"
            strokeWidth={1}
            strokeDasharray="3 4"
          />
        )}
        <text
          x={4}
          y={0}
          textAnchor="start"
          dominantBaseline="middle"
          fill={isLive ? 'rgba(251,191,36,0.85)' : 'rgba(255,255,255,0.38)'}
          fontSize={fs}
          fontFamily="system-ui,sans-serif"
          fontWeight={isLive ? 700 : 400}
        >
          {formatYTick(v)}
        </text>
      </g>
    );
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [allPrices, livePrice, isMobile, containerW, formatYTick]);

  // ── Chart colours ──────────────────────────────────────────────────────────
  const isChartUp = closePrice >= openPrice;
  const upColor   = '#22c55e';
  const downColor = '#ef4444';
  const color     = isChartUp ? upColor : downColor;
  const gradId    = isChartUp ? 'gradUp' : 'gradDown';

  // 1D uses smooth monotone; weekly/monthly/yearly use stepAfter for clean candle-like steps
  const areaType = timeframe === '1D' ? 'monotone' : 'linear';

  // Mobile/PWA: wider Y-axis so price labels don't clip; more bottom margin for X labels
  const yAxisW = isMobile ? 72 : 76;
  const chartH = isMobile ? 260 : 320;
  const bottomMargin = isMobile ? 36 : 34;
  const xAxisHeight = isMobile ? 36 : 34;

  return (
    <div ref={containerRef} className="w-full min-h-0">
      <ResponsiveContainer width="100%" height={chartH} minHeight={isMobile ? 240 : 280}>
        <AreaChart
          data={displayData}
          margin={{
            top:    16,
            right:  isMobile ? 12 : 12,
            left:   0,
            bottom: bottomMargin,
          }}
        >
          <defs>
            <linearGradient id="gradUp" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%"   stopColor={upColor}   stopOpacity={0.22} />
              <stop offset="55%"  stopColor={upColor}   stopOpacity={0.06} />
              <stop offset="100%" stopColor={upColor}   stopOpacity={0} />
            </linearGradient>
            <linearGradient id="gradDown" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%"   stopColor={downColor} stopOpacity={0.22} />
              <stop offset="55%"  stopColor={downColor} stopOpacity={0.06} />
              <stop offset="100%" stopColor={downColor} stopOpacity={0} />
            </linearGradient>
          </defs>

          {/* Subtle horizontal grid lines only */}
          <CartesianGrid
            strokeDasharray="1 6"
            stroke="rgba(255,255,255,0.06)"
            vertical={false}
          />

          <XAxis
            dataKey="time"
            tick={<CustomXTick />}
            tickLine={false}
            axisLine={{ stroke: 'rgba(255,255,255,0.06)' }}
            interval={0}
            height={xAxisHeight}
          />

          <YAxis
            orientation="right"
            domain={[yMin, yMax]}
            ticks={yTicks}
            tick={<CustomYTick />}
            tickLine={false}
            axisLine={false}
            width={yAxisW}
            mirror={false}
          />

          {/* Period open reference line */}
          {openPrice > 0 && Math.abs(closePrice - openPrice) / Math.max(openPrice, 0.00001) > 0.0001 && (
            <ReferenceLine
              y={openPrice}
              stroke="rgba(255,255,255,0.12)"
              strokeDasharray="4 4"
              strokeWidth={1}
              label={{
                value: `Open $${formatPrice(openPrice)}`,
                position: 'insideTopLeft',
                fill: 'rgba(255,255,255,0.22)',
                fontSize: isMobile ? 9 : 10,
                fontFamily: 'system-ui,sans-serif',
                fontWeight: 600,
                dx: 6,
                dy: -3,
              }}
            />
          )}

          {/* Live price reference line — horizontal gold hairline */}
          <ReferenceLine
            y={livePrice}
            stroke="rgba(251,191,36,0.55)"
            strokeDasharray="3 3"
            strokeWidth={1}
          />

          <Tooltip
            content={<ChartTooltip openPrice={openPrice} timeframe={timeframe} />}
            cursor={{
              stroke: 'rgba(255,255,255,0.25)',
              strokeWidth: 1.5,
              strokeDasharray: '4 4',
            }}
            allowEscapeViewBox={{ x: false, y: true }}
          />

          <Area
            type={areaType}
            dataKey="price"
            stroke={color}
            strokeWidth={isMobile ? 1.5 : 2}
            fill={`url(#${gradId})`}
            dot={false}
            activeDot={{
              r: 6,
              fill: color,
              stroke: 'rgba(255,255,255,0.9)',
              strokeWidth: 2,
              strokeOpacity: 1,
            }}
            isAnimationActive={pts < 60}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}

// ─── Treasury Health Badge ────────────────────────────────────────────────────

function TreasuryBadge({ mode, ratio }: { mode: string; ratio: number }) {
  if (mode === 'critical') {
    return (
      <div className="flex items-center gap-1.5 bg-red-500/20 border border-red-500/40 rounded-full px-2.5 py-1">
        <ShieldOff className="w-3.5 h-3.5 text-red-400" />
        <span className="text-xs font-semibold text-red-300">Trading Paused</span>
      </div>
    );
  }
  if (mode === 'emergency') {
    return (
      <div className="flex items-center gap-1.5 bg-amber-500/20 border border-amber-500/40 rounded-full px-2.5 py-1">
        <ShieldAlert className="w-3.5 h-3.5 text-amber-400" />
        <span className="text-xs font-semibold text-amber-300">
          Emergency — {Math.round(ratio * 100)}% reserve
        </span>
      </div>
    );
  }
  return (
    <div className="flex items-center gap-1.5 bg-green-500/15 border border-green-500/30 rounded-full px-2.5 py-1">
      <ShieldCheck className="w-3.5 h-3.5 text-green-400" />
      <span className="text-xs font-semibold text-green-300">
        Market open{ratio ? '' : ''}
      </span>
    </div>
  );
}

// ─── Live stats strip ─────────────────────────────────────────────────────────

function LiveStats({ stats, lastUpdated, livePrice }: { stats: YuyuLiveStats | null; lastUpdated: Date | null; livePrice: number }) {
  const [secondsAgo, setSecondsAgo] = React.useState<number | null>(null);

  React.useEffect(() => {
    if (!lastUpdated) return;
    const tick = () => setSecondsAgo(Math.floor((Date.now() - lastUpdated.getTime()) / 1000));
    tick();
    const id = setInterval(tick, 5_000);
    return () => clearInterval(id);
  }, [lastUpdated]);

  if (!stats) {
    return (
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 px-4 pb-3">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="bg-white/5 rounded-xl p-2.5 animate-pulse h-14" />
        ))}
      </div>
    );
  }

  const totals = [
    {
      icon:  <Phone  className="w-3.5 h-3.5 text-green-400"  />,
      label: 'Total calls',
      value: (stats.total_calls ?? 0).toLocaleString(),
      color: 'text-green-300',
    },
    {
      icon:  <Gift   className="w-3.5 h-3.5 text-pink-400"   />,
      label: 'Total gifts sent',
      value: (stats.total_gifts_sent ?? 0).toLocaleString(),
      color: 'text-pink-300',
    },
    {
      icon:  <Flame  className="w-3.5 h-3.5 text-orange-400" />,
      label: 'Total Burn',
      value: stats.total_burned >= 1_000_000
        ? `${(stats.total_burned / 1_000_000).toFixed(2)}M`
        : stats.total_burned.toLocaleString(),
      color: 'text-orange-300',
    },
    {
      icon:  <Users  className="w-3.5 h-3.5 text-blue-400"   />,
      label: 'Total members',
      value: (stats.total_members ?? 0).toLocaleString(),
      color: 'text-blue-300',
    },
  ];

  const updatedLabel = secondsAgo === null ? null
    : secondsAgo < 60  ? `${secondsAgo}s ago`
    : secondsAgo < 3600 ? `${Math.floor(secondsAgo / 60)}m ago`
    : `${Math.floor(secondsAgo / 3600)}h ago`;

  return (
    <div className="px-4 pb-3">
      <div className="flex items-center justify-center gap-2 mb-1.5">
        <p className="text-xs text-white/40">
          Real-time totals · updates every 10s
        </p>
        {updatedLabel && (
          <span className="text-[10px] text-white/25 bg-white/5 rounded-full px-1.5 py-0.5 flex items-center gap-1">
            <RefreshCw className="w-2.5 h-2.5" />
            {updatedLabel}
          </span>
        )}
      </div>
      <div>
        <p className="text-[10px] text-white/40 uppercase tracking-wider mb-1.5">Platform totals</p>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
          {totals.map(({ icon, label, value, color }) => (
            <div key={label} className="bg-white/5 rounded-xl p-2.5 border border-white/10">
              <div className="flex items-center gap-1.5 mb-0.5">
                {icon}
                <span className="text-[10px] text-white/50 truncate">{label}</span>
              </div>
              <span className={`text-sm font-bold ${color}`}>{value}</span>
            </div>
          ))}
        </div>
      </div>
      {/* ── Tokenomics strip: 8B YUYU circulating · live market cap ───────── */}
      <div className="grid grid-cols-3 gap-2 mt-2">
        {[
          { label: 'Market cap', value: `$${((YUYU_CIRCULATING_TOKENS * livePrice) / 1_000_000).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}M`, accent: 'text-emerald-300' },
          { label: 'Circulating', value: '8B YUYU', accent: 'text-white' },
          { label: 'Live price', value: `$${livePrice.toFixed(6)}`, accent: 'text-amber-300' },
        ].map(({ label, value, accent }) => (
          <div
            key={label}
            className="rounded-2xl border border-white/10 bg-gradient-to-br from-white/[0.07] to-white/[0.02] px-3 py-2.5 backdrop-blur-xl"
          >
            <p className="text-[10px] uppercase tracking-[0.14em] text-white/40">{label}</p>
            <p className={`text-sm font-bold tabular-nums ${accent}`}>{value}</p>
          </div>
        ))}
      </div>
      <p className="text-center text-[11px] text-white/30">
        Price moves in real time with Caakus activity — calls, gifts, buys and sells.
      </p>

    </div>
  );
}

// ─── Buy form ─────────────────────────────────────────────────────────────────

interface BuyFormProps {
  currentPrice:    number;
  walletBalance:   number;
  balanceLoading:  boolean;
  onRefreshBalance: () => void;
  treasuryMode:    string;
  onBack:          () => void;
  onSuccess:       () => void;
}

function BuyForm({ currentPrice, walletBalance, balanceLoading, onRefreshBalance, treasuryMode, onBack, onSuccess }: BuyFormProps) {
  const queryClient                     = useQueryClient();
  const [usdAmount,  setUsdAmount]      = useState('');
  const [loading,    setLoading]        = useState(false);
  const [error,      setError]          = useState('');
  const [success,    setSuccess]        = useState('');

  const numericUsd    = parseFloat(usdAmount) || 0;
  const fee           = numericUsd * (YUYU_BUY_FEE_PCT / 100);
  const netUsd        = numericUsd - fee;
  const estimatedYuyu = currentPrice > 0 ? Math.floor(netUsd / currentPrice) : 0;
  // Only block if balance is confirmed loaded and insufficient — never block while loading
  const canAfford     = balanceLoading ? true : walletBalance >= numericUsd;
  const isCritical    = treasuryMode === 'critical';

  const presets = [1, 5, 10, 25, 50, 100];

  const handleWalletBuy = async () => {
    setError('');
    if (numericUsd < 1) { setError('Minimum investment is $1.00'); return; }
    if (numericUsd > 300) { setError('Maximum investment is $300.00'); return; }

    // Refresh balance first so we have the latest figure before checking affordability
    onRefreshBalance();

    setLoading(true);
    try {
      const result = await buyYuyuWithWallet(numericUsd);
      if (result?.success === false) {
        setError(result.message || 'Purchase failed');
        // If the server says insufficient balance, trigger a balance refresh so UI updates
        if ((result.message || '').toLowerCase().includes('insufficient')) {
          onRefreshBalance();
        }
        return;
      }
      queryClient.invalidateQueries({ queryKey: ['coins', 'balance'] });
      setSuccess(`Bought ${result.yuyu_amount?.toLocaleString()} YUYU for $${numericUsd.toFixed(2)}!`);
      setTimeout(() => { onSuccess(); }, 2000);
    } catch (e: any) {
      setError(e?.message || 'Purchase failed');
    } finally {
      setLoading(false);
    }
  };

  const handleStripeBuy = async () => {
    setError('');
    if (numericUsd < 1) { setError('Minimum investment is $1.00'); return; }
    if (numericUsd > 300) { setError('Maximum investment is $300.00'); return; }
    setLoading(true);
    try {
      const { url } = await createInvestmentCheckout(numericUsd);
      const newWindow = window.open(url, '_blank', 'noopener,noreferrer');
      if (!newWindow) {
        toast.loading('Redirecting to checkout…', { duration: 1500 });
        window.location.href = url;
      } else {
        toast.success('Checkout opened in new tab. Return here after payment.');
      }
      onBack();
    } catch (e: any) {
      setError(e?.message || 'Failed to open checkout');
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="flex flex-col items-center justify-center py-10 px-4 gap-4 text-center">
        <CheckCircle2 className="w-16 h-16 text-green-400" />
        <p className="text-white font-semibold text-lg">{success}</p>
        <p className="text-white/60 text-sm">YUYU added to your balance.</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-4 px-4 py-3">
      <button
        type="button"
        onClick={onBack}
        className="flex items-center gap-1.5 text-white/60 hover:text-white text-sm transition-colors self-start"
      >
        <ArrowLeft className="w-4 h-4" /> Back
      </button>

      {isCritical && (
        <div className="flex items-center gap-2 bg-red-500/15 border border-red-500/30 rounded-xl p-3">
          <ShieldOff className="w-4 h-4 text-red-400 flex-shrink-0" />
          <p className="text-red-300 text-sm">Community activity peak. Synchronizing live rewards…</p>
        </div>
      )}

      <div className="bg-white/5 rounded-xl p-3 border border-white/10">
        <div className="flex items-center justify-between mb-1">
          <p className="text-xs text-white/50">Current price</p>
          <span className="inline-flex items-center gap-1 text-[10px] text-emerald-400 bg-emerald-500/15 rounded-full px-1.5 py-0.5">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
            LIVE
          </span>
        </div>
        <p className="text-xl font-bold text-amber-300 tabular-nums">${currentPrice.toFixed(8)}</p>
        <p className="text-xs text-white/40 mt-0.5">
          per YUYU &nbsp;·&nbsp; Range: ${YUYU_PRICE_FLOOR} – ${YUYU_PRICE_CEILING}
        </p>
      </div>

      <div className="flex flex-wrap gap-2">
        {presets.map((p) => (
          <button
            key={p}
            type="button"
            onClick={() => setUsdAmount(String(p))}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition-colors ${
              numericUsd === p
                ? 'bg-amber-500/30 border-amber-500/50 text-amber-300'
                : 'bg-white/5 border-white/10 text-white/70 hover:bg-white/10'
            }`}
          >
            ${p}
          </button>
        ))}
      </div>

      <div className="relative">
        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-white/60 font-semibold">$</span>
        <input
          type="number"
          min="1"
          max="300"
          step="0.01"
          placeholder="Enter USD amount"
          value={usdAmount}
          onChange={(e) => setUsdAmount(e.target.value)}
          className="w-full bg-white/10 border border-white/20 rounded-xl pl-7 pr-4 py-3 text-white placeholder-white/30 focus:outline-none focus:border-amber-400/60 focus:ring-1 focus:ring-amber-400/30"
        />
      </div>

      {numericUsd >= 1 && (
        <div className="bg-white/5 rounded-xl p-3 border border-white/10 space-y-1.5 text-sm">
          <div className="flex justify-between text-white/70">
            <span>Investment</span><span>${numericUsd.toFixed(2)}</span>
          </div>
          <div className="flex justify-between text-white/50">
            <span>Platform fee ({YUYU_BUY_FEE_PCT}%)</span>
            <span>-${fee.toFixed(4)}</span>
          </div>
          <div className="flex justify-between text-white font-semibold border-t border-white/10 pt-1.5">
            <span>You receive (est.)</span>
            <span className="text-amber-300 tabular-nums">{estimatedYuyu.toLocaleString()} YUYU</span>
          </div>
        </div>
      )}

      {error && (
        <div className="flex items-center gap-2 bg-red-500/15 border border-red-500/30 rounded-xl p-3">
          <AlertCircle className="w-4 h-4 text-red-400 flex-shrink-0" />
          <p className="text-red-300 text-sm">{error}</p>
        </div>
      )}

      {/* Wallet balance row — shows loading spinner while fetching */}
      <div className="flex items-center justify-between bg-white/5 rounded-xl px-3 py-2 border border-white/10">
        <div className="flex items-center gap-1.5">
          <Wallet className="w-3.5 h-3.5 text-white/40" />
          <span className="text-xs text-white/50">USD Wallet</span>
        </div>
        <div className="flex items-center gap-2">
          {balanceLoading ? (
            <Loader2 className="w-3.5 h-3.5 text-white/40 animate-spin" />
          ) : (
            <span className={`text-sm font-semibold tabular-nums ${numericUsd > 0 && !canAfford ? 'text-red-400' : 'text-white/80'}`}>
              ${walletBalance.toFixed(2)}
            </span>
          )}
          <button
            type="button"
            onClick={onRefreshBalance}
            className="p-1 rounded-md hover:bg-white/10 transition-colors"
            title="Refresh balance"
          >
            <RefreshCw className={`w-3 h-3 text-white/30 ${balanceLoading ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>

      {/* Insufficient balance warning */}
      {numericUsd > 0 && !canAfford && !balanceLoading && (
        <div className="flex items-center gap-2 bg-amber-500/10 border border-amber-500/25 rounded-xl p-3">
          <AlertCircle className="w-4 h-4 text-amber-400 flex-shrink-0" />
          <div className="flex-1 min-w-0">
            <p className="text-amber-300 text-sm">
              Insufficient wallet balance. You need ${(numericUsd - walletBalance).toFixed(2)} more.
            </p>
            <p className="text-amber-400/60 text-xs mt-0.5">Use "Pay with Card" to top up, or reduce the amount.</p>
          </div>
        </div>
      )}

      <div className="flex gap-2">
        <Button
          onClick={handleWalletBuy}
          disabled={loading || numericUsd < 1 || (!canAfford && !balanceLoading) || isCritical}
          className="flex-1 bg-white text-slate-900 hover:bg-white/90 font-semibold disabled:opacity-50"
        >
          {loading ? <Loader2 className="w-4 h-4 animate-spin mr-1.5" /> : <Wallet className="w-4 h-4 mr-1.5" />}
          Buy with Wallet
        </Button>
        <Button
          onClick={handleStripeBuy}
          disabled={loading || numericUsd < 1 || isCritical}
          className="flex-1 bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 font-semibold border border-amber-500/30 disabled:opacity-50"
        >
          {loading ? <Loader2 className="w-4 h-4 animate-spin mr-1.5" /> : <CreditCard className="w-4 h-4 mr-1.5" />}
          Pay with Card
        </Button>
      </div>
    </div>
  );
}

// ─── Sell form ─────────────────────────────────────────────────────────────────

interface SellFormProps {
  currentPrice: number;
  yuyuBalance:  number;
  poolBalance:  number;
  limits:       WithdrawalLimits | null;
  onBack:       () => void;
  onSuccess:    () => void;
}

function SellForm({ currentPrice, yuyuBalance, poolBalance, limits, onBack, onSuccess }: SellFormProps) {
  const queryClient                     = useQueryClient();
  const [yuyuAmount, setYuyuAmount]     = useState('');
  const [loading,    setLoading]        = useState(false);
  const [error,      setError]          = useState('');
  const [success,    setSuccess]        = useState('');

  const numericYuyu  = Math.floor(parseFloat(yuyuAmount) || 0);
  const grossUsd     = numericYuyu * currentPrice;
  const fee          = grossUsd * (YUYU_SELL_FEE_PCT / 100);
  const netUsd       = grossUsd - fee;

  // Limits from treasury config
  const minYuyu         = limits?.min_yuyu_to_sell     ?? 5_000;
  const maxYuyuPerTx    = limits?.max_yuyu_per_tx       ?? 100_000;
  const remainingDaily  = limits?.remaining_daily_usd   ?? 1_000;
  const remainingWeekly = limits?.remaining_weekly_usd  ?? 5_000;
  const treasuryMode    = limits?.treasury_mode         ?? 'normal';

  const maxAffordable   = Math.min(maxYuyuPerTx, yuyuBalance);
  const poolPaused      = poolBalance < (netUsd > 0 ? netUsd : 1);
  const isCritical      = treasuryMode === 'critical';
  const isEmergency     = treasuryMode === 'emergency';

  const presetPcts = [10, 25, 50, 100];

  const handleSell = async () => {
    setError('');
    if (numericYuyu < minYuyu)      { setError(`Minimum sell is ${minYuyu.toLocaleString()} YUYU`); return; }
    if (numericYuyu > maxYuyuPerTx) { setError(`Maximum per transaction is ${maxYuyuPerTx.toLocaleString()} YUYU`); return; }
    if (numericYuyu > yuyuBalance)  { setError('Insufficient YUYU balance'); return; }
    if (isCritical)                 { setError('Community activity peak. Synchronizing live rewards…'); return; }
    if (netUsd > remainingDaily)    { setError(`Daily limit reached. Remaining today: $${remainingDaily.toFixed(2)}`); return; }
    if (netUsd > remainingWeekly)   { setError(`Weekly limit reached. Remaining this week: $${remainingWeekly.toFixed(2)}`); return; }

    setLoading(true);
    try {
      const result = await sellYuyu(numericYuyu);
      if (result?.success === false) { setError(result.message || 'Sell failed'); return; }
      queryClient.invalidateQueries({ queryKey: ['coins', 'balance'] });
      setSuccess(
        `Sold ${numericYuyu.toLocaleString()} YUYU → $${result.net_usd_received?.toFixed(4)} added to wallet!`
      );
      setTimeout(() => { onSuccess(); }, 2500);
    } catch (e: any) {
      setError(e?.message || 'Sell failed');
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="flex flex-col items-center justify-center py-10 px-4 gap-4 text-center">
        <CheckCircle2 className="w-16 h-16 text-green-400" />
        <p className="text-white font-semibold text-lg">{success}</p>
        <p className="text-white/60 text-sm">
          USD added to your wallet. You can withdraw via the Withdraw button.
        </p>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-4 px-4 py-3">
      <button
        type="button"
        onClick={onBack}
        className="flex items-center gap-1.5 text-white/60 hover:text-white text-sm transition-colors self-start"
      >
        <ArrowLeft className="w-4 h-4" /> Back
      </button>

      {/* Treasury mode warnings */}
      {isCritical && (
        <div className="flex items-center gap-2 bg-red-500/15 border border-red-500/30 rounded-xl p-3">
          <ShieldOff className="w-4 h-4 text-red-400 flex-shrink-0" />
          <p className="text-red-300 text-sm">Community activity peak. Synchronizing live rewards…</p>
        </div>
      )}
      {isEmergency && !isCritical && (
        <div className="flex items-center gap-2 bg-amber-500/15 border border-amber-500/30 rounded-xl p-3">
          <ShieldAlert className="w-4 h-4 text-amber-400 flex-shrink-0" />
          <p className="text-amber-300 text-sm">
            Emergency mode: daily limit reduced to ${limits?.daily_limit_usd.toFixed(0)}.
          </p>
        </div>
      )}

      <div className="bg-white/5 rounded-xl p-3 border border-white/10">
        <div className="flex items-center justify-between mb-1">
          <p className="text-xs text-white/50">Current price</p>
          <span className="inline-flex items-center gap-1 text-[10px] text-emerald-400 bg-emerald-500/15 rounded-full px-1.5 py-0.5">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
            LIVE
          </span>
        </div>
        <p className="text-xl font-bold text-amber-300 tabular-nums">${currentPrice.toFixed(8)}</p>
        <p className="text-xs text-white/40 mt-0.5">
          per YUYU &nbsp;·&nbsp; Range: ${YUYU_PRICE_FLOOR} – ${YUYU_PRICE_CEILING}
        </p>
      </div>

      {/* Withdrawal limit info box */}
      {limits && (
        <div className="bg-blue-500/10 border border-blue-500/20 rounded-xl p-3 space-y-1.5">
          <div className="flex items-center gap-1.5 mb-0.5">
            <Info className="w-3.5 h-3.5 text-blue-400" />
            <span className="text-xs font-semibold text-blue-300">Withdrawal Limits</span>
          </div>
          <div className="grid grid-cols-2 gap-x-4 gap-y-0.5 text-xs">
            <span className="text-white/50">Min per sell</span>
            <span className="text-white/80 font-medium">{minYuyu.toLocaleString()} YUYU</span>
            <span className="text-white/50">Max per sell</span>
            <span className="text-white/80 font-medium">{maxYuyuPerTx.toLocaleString()} YUYU</span>
            <span className="text-white/50">Remaining today</span>
            <span className={`font-medium ${remainingDaily < 100 ? 'text-amber-300' : 'text-green-300'}`}>
              ${remainingDaily.toFixed(2)}
            </span>
            <span className="text-white/50">Remaining this week</span>
            <span className={`font-medium ${remainingWeekly < 500 ? 'text-amber-300' : 'text-green-300'}`}>
              ${remainingWeekly.toFixed(2)}
            </span>
          </div>
        </div>
      )}

      {/* Quick presets */}
      <div className="flex flex-wrap gap-2">
        {presetPcts.map((pct) => {
          const amt = Math.min(Math.floor(yuyuBalance * (pct / 100)), maxYuyuPerTx);
          return (
            <button
              key={pct}
              type="button"
              disabled={amt < minYuyu}
              onClick={() => setYuyuAmount(String(amt))}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition-colors disabled:opacity-40 ${
                numericYuyu === amt
                  ? 'bg-amber-500/30 border-amber-500/50 text-amber-300'
                  : 'bg-white/5 border-white/10 text-white/70 hover:bg-white/10'
              }`}
            >
              {pct}%
            </button>
          );
        })}
        {yuyuBalance >= maxYuyuPerTx && (
          <button
            type="button"
            onClick={() => setYuyuAmount(String(maxYuyuPerTx))}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition-colors ${
              numericYuyu === maxYuyuPerTx
                ? 'bg-amber-500/30 border-amber-500/50 text-amber-300'
                : 'bg-white/5 border-white/10 text-white/70 hover:bg-white/10'
            }`}
          >
            Max (100K)
          </button>
        )}
      </div>

      <div className="relative">
        <input
          type="number"
          min={minYuyu}
          max={maxAffordable}
          step="1"
          placeholder={`Enter YUYU amount (min ${minYuyu.toLocaleString()})`}
          value={yuyuAmount}
          onChange={(e) => setYuyuAmount(e.target.value)}
          className="w-full bg-white/10 border border-white/20 rounded-xl px-4 py-3 text-white placeholder-white/30 focus:outline-none focus:border-amber-400/60 focus:ring-1 focus:ring-amber-400/30"
        />
      </div>

      {numericYuyu >= minYuyu && (
        <div className="bg-white/5 rounded-xl p-3 border border-white/10 space-y-1.5 text-sm">
          <div className="flex justify-between text-white/70">
            <span>Gross USD</span>
            <span className="tabular-nums">${grossUsd.toFixed(4)}</span>
          </div>
          <div className="flex justify-between text-white/50">
            <span>Withdrawal fee ({YUYU_SELL_FEE_PCT}%)</span>
            <span className="tabular-nums">-${fee.toFixed(4)}</span>
          </div>
          <div className="flex justify-between text-white font-semibold border-t border-white/10 pt-1.5">
            <span>You receive</span>
            <span className="text-green-400 tabular-nums">${netUsd.toFixed(4)}</span>
          </div>
        </div>
      )}

      {error && (
        <div className="flex items-center gap-2 bg-red-500/15 border border-red-500/30 rounded-xl p-3">
          <AlertCircle className="w-4 h-4 text-red-400 flex-shrink-0" />
          <p className="text-red-300 text-sm">{error}</p>
        </div>
      )}

      <p className="text-xs text-white/40 text-center">
        Your YUYU: <span className="text-amber-400 font-medium">{yuyuBalance.toLocaleString()}</span>
      </p>

      <Button
        onClick={handleSell}
        disabled={
          loading || isCritical || numericYuyu < minYuyu ||
          numericYuyu > maxYuyuPerTx || numericYuyu > yuyuBalance
        }
        className="bg-slate-700 hover:bg-slate-600 text-white font-semibold border border-white/10 disabled:opacity-50"
      >
        {loading ? <Loader2 className="w-4 h-4 animate-spin mr-1.5" /> : null}
        Sell {numericYuyu > 0 ? numericYuyu.toLocaleString() : ''} YUYU
      </Button>
    </div>
  );
}

// ─── Main modal ───────────────────────────────────────────────────────────────

export const InvestYuyucoinModal: React.FC<InvestYuyucoinModalProps> = ({ open, onClose }) => {
  const [priceData,    setPriceData]    = useState<YuyucoinPriceData | null>(null);
  const [chartData,    setChartData]    = useState<YuyucoinChartPoint[]>([]);
  const [liveStats,    setLiveStats]    = useState<YuyuLiveStats | null>(null);
  const [limits,       setLimits]       = useState<WithdrawalLimits | null>(null);
  const [timeframe,    setTimeframe]    = useState<Timeframe>('1m');
  const [view,         setView]         = useState<ModalView>('chart');
  const [chartLoading,     setChartLoading]     = useState(false);
  const [priceLoading,     setPriceLoading]     = useState(false);
  const [statsLastUpdated, setStatsLastUpdated] = useState<Date | null>(null);
  const [balanceLoading,   setBalanceLoading]   = useState(false);

  // Per-timeframe cache so switching tabs is instant after first load.
  // Cache stores the raw DB points only — live price updates are applied at render time,
  // not baked into the cache, so all timeframes share the same current price anchor.
  const chartCacheRef     = useRef<Map<Timeframe, YuyucoinChartPoint[]>>(new Map());
  const activeTimeframeRef = useRef<Timeframe>('1m');
  const realtimeRef       = useRef<ReturnType<typeof supabase.channel> | null>(null);
  const metricsChannelRef = useRef<ReturnType<typeof supabase.channel> | null>(null);
  const priceLoadingRef   = useRef(false);
  const { data: balance, isLoading: balanceQueryLoading, refetch: refetchBalance } = useCoinsBalance();
  const yuyuScore  = balance?.yuyu_score ?? 0;
  const usdBalance = balance?.balance    ?? 0;

  // ── Fetch price ──────────────────────────────────────────────────────────
  const fetchPrice = useCallback(async () => {
    if (priceLoadingRef.current) return;
    priceLoadingRef.current = true;
    setPriceLoading(true);
    try { setPriceData(await getYuyucoinPrice()); }
    finally { priceLoadingRef.current = false; setPriceLoading(false); }
  }, []);

  // ── Fetch chart (with per-timeframe cache) ───────────────────────────────
  // Cache stores raw DB points. We always patch the last point to currentPrice at render
  // time so all timeframes show the same live price for today — no inconsistency.
  const fetchChart = useCallback(async (tf: Timeframe, forceRefresh = false) => {
    activeTimeframeRef.current = tf;
    // Intraday views come from the live tick engine, not the DB
    if (isIntraday(tf)) { setChartLoading(false); return; }
    const cached = chartCacheRef.current.get(tf);
    if (cached && cached.length > 0 && !forceRefresh) {
      setChartData(cached);
      // Silently refresh cache in background
      getYuyucoinChartData(tf).then((fresh) => {
        chartCacheRef.current.set(tf, fresh);
        // Only update visible chart if this timeframe is still the active one
        if (activeTimeframeRef.current === tf) {
          setChartData(fresh);
        }
      }).catch(() => {/* ignore background refresh errors */});
      return;
    }
    setChartLoading(true);
    try {
      const data = await getYuyucoinChartData(tf);
      chartCacheRef.current.set(tf, data);
      // Only set state if this timeframe is still active (user may have switched)
      if (activeTimeframeRef.current === tf) {
        setChartData(data);
      }
    } finally {
      setChartLoading(false);
    }
  }, []);

  // ── Fetch live stats (refresh from DB so calls/gifts/online update in real time) + limits ──
  const fetchStats = useCallback(async () => {
    const [stats, lims] = await Promise.all([getAndRefreshYuyuLiveStats(), getUserWithdrawalLimits()]);
    setLiveStats(stats);
    setLimits(lims);
    setStatsLastUpdated(new Date());
  }, []);

  // ── On open: fire ALL fetches in parallel ────────────────────────────────
  useEffect(() => {
    if (!open) return;
    setView('chart');
    // All three in parallel — no sequential waiting
    Promise.all([fetchPrice(), fetchChart(timeframe), fetchStats()])
      .catch(() => {/* individual errors handled inside each fn */});

    // Subscribe to live price changes (yuyu_price table).
    // pg_cron fires update_yuyu_price() every minute → yuyu_price UPDATE → this handler.
    //
    // For 1D (hourly candles): append a new point each new hour.
    // For all other timeframes: update the last candle's closing price in-place.
    const priceChannel = supabase
      .channel('yuyu-price-live')
      .on(
        'postgres_changes',
        { event: 'UPDATE', schema: 'public', table: 'yuyu_price' },
        (payload: any) => {
          const row = payload?.new;
          if (!row) return;
          const newPrice = Math.max(YUYU_PRICE_FLOOR, Math.min(YUYU_PRICE_CEILING, Number(row.current_price)));
          const nowTs    = Date.now();

          // Update header price display
          setPriceData((prev) => {
            const price24h  = prev ? (prev.priceUsd - (prev.changeUsd ?? 0)) : newPrice;
            const changeUsd = newPrice - price24h;
            const changePct = price24h > 0 ? ((newPrice - price24h) / price24h) * 100 : 0;
            return { priceUsd: newPrice, changeUsd, changePercent: changePct, label: 'Today', timestamp: nowTs, updatedAt: row.updated_at };
          });

          setChartData((prev) => {
            if (prev.length === 0) return prev;

            if (activeTimeframeRef.current === '1D') {
              // 1D: append a new 1-hour point so the chart grows in real time
              const HOUR_MS   = 60 * 60_000;
              const newSlot   = Math.floor(nowTs / HOUR_MS) * HOUR_MS;
              const lastSlot  = prev[prev.length - 1]?.timestamp ?? 0;

              if (newSlot > lastSlot) {
                // New hour → append a new candle, update previous "Now" label
                const updated  = prev.map((p, i) =>
                  i === prev.length - 1
                    ? { ...p, time: new Date(p.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false }) }
                    : p
                );
                return [...updated.slice(-24), {
                  price: newPrice, open: newPrice, high: newPrice, low: newPrice, close: newPrice,
                  time: 'Now', timestamp: newSlot,
                }];
              } else {
                // Same hour → update high/low/close of current candle
                const updated  = [...prev];
                const last     = updated[updated.length - 1]!;
                updated[updated.length - 1] = {
                  ...last,
                  price: newPrice,
                  close: newPrice,
                  high:  Math.max(last.high  ?? newPrice, newPrice),
                  low:   Math.min(last.low   ?? newPrice, newPrice),
                  time:  'Now',
                };
                return updated;
              }
            } else {
              // 1W/1M/1Y: update the last candle's close + high/low
              const updated  = [...prev];
              const last     = updated[updated.length - 1]!;
              updated[updated.length - 1] = {
                ...last,
                price: newPrice,
                close: newPrice,
                high:  Math.max(last.high  ?? newPrice, newPrice),
                low:   Math.min(last.low   ?? newPrice, newPrice),
              };
              return updated;
            }
          });

          // Patch cached data for all timeframes (last candle = current price, update high/low)
          chartCacheRef.current.forEach((points, tf) => {
            if (points.length === 0) return;
            const patched = [...points];
            const last    = patched[patched.length - 1]!;
            patched[patched.length - 1] = {
              ...last,
              price: newPrice,
              close: newPrice,
              high:  Math.max(last.high ?? newPrice, newPrice),
              low:   Math.min(last.low  ?? newPrice, newPrice),
            };
            chartCacheRef.current.set(tf, patched);
          });
        }
      )
      .subscribe();

    // Non-critical platform stats: polling only (the live price channel above
    // stays realtime and sub-second — it is the financial ticker).
    realtimeRef.current = priceChannel;
    const statsInterval = setInterval(() => {
      if (document.visibilityState === 'visible') fetchStats();
    }, 15_000);

    return () => {
      clearInterval(statsInterval);
      supabase.removeChannel(priceChannel);
      realtimeRef.current = null;
      metricsChannelRef.current = null;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  useEffect(() => {
    if (!open) return;
    fetchChart(timeframe);
  }, [timeframe, open, fetchChart]);

  // Pre-warm adjacent timeframes in background after initial load
  useEffect(() => {
    if (!open) return;
    // Keep warmup lightweight to avoid opening-lag in the modal.
    // 1Y can be fetched on-demand when selected.
    const warmup: Timeframe[] = ['1W', '1M'];
    let cancelled = false;
    const run = async () => {
      for (const tf of warmup) {
        if (cancelled || chartCacheRef.current.has(tf)) continue;
        await new Promise((r) => setTimeout(r, 800)); // stagger to avoid hammering DB
        if (cancelled) break;
        getYuyucoinChartData(tf)
          .then((data) => { if (!cancelled) chartCacheRef.current.set(tf, data); })
          .catch(() => {/* ignore */});
      }
    };
    run();
    return () => { cancelled = true; };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  // ── Live per-second ticker (anchored on the DB price) ────────────────────
  const anchorPrice = priceData?.priceUsd ?? 0.1;
  const { price: tickPrice, ticks } = useYuyuTicker(anchorPrice, open);

  // ── Derived display values ───────────────────────────────────────────────
  const priceUsd      = tickPrice > 0 ? tickPrice : (priceData?.priceUsd ?? YUYU_PRICE_FLOOR);
  const dayOpen       = priceData ? priceData.priceUsd - (priceData.changeUsd ?? 0) : priceUsd;
  const changeUsd     = priceUsd - dayOpen;
  const changePercent = dayOpen > 0 ? (changeUsd / dayOpen) * 100 : 0;
  const isPositive    = changePercent >= 0;
  const poolBalance   = liveStats?.pool_usd_balance       ?? 0;
  // Market is always open — trading is never paused client-side.
  const treasuryMode  = 'normal';
  const healthRatio   = liveStats?.treasury_health_ratio  ?? 1.0;

  // Intraday views are rendered from the live tick buffer (1s resolution)
  const intraday = isIntraday(timeframe);
  const liveChartData = useMemo(
    () =>
      intraday
        ? bucketTicks(ticks, timeframe as IntradayTf)
        : chartData.length >= 3
          ? chartData
          : historicalSeries(anchorPrice || priceUsd, timeframe, priceUsd),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [intraday, ticks, timeframe, chartData, priceUsd],
  );

  // Chart period stats (High / Low / % change for the selected timeframe)
  // We use max(high) and min(low) across ALL chart points for the true period range.
  const periodStats = useMemo(() => {
    const source = liveChartData;
    if (source.length === 0) return null;
    const prices = source.map(p => p.price).filter(p => p > 0);

    if (prices.length === 0) return null;
    const open  = source[0]!.open  ?? prices[0]!;
    const close = source[source.length - 1]!.close ?? prices[prices.length - 1]!;
    const high  = Math.max(...source.map(p => p.high  ?? p.price).filter(p => p > 0));
    const low   = Math.min(...source.map(p => p.low   ?? p.price).filter(p => p > 0));
    return {
      open,
      close,
      high,
      low,
      pctChange: open > 0 ? ((close - open) / open) * 100 : 0,
      pctLabel:  timeframe,
    };
  }, [liveChartData, timeframe]);

  return (
    <Dialog open={open} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="w-[100vw] max-w-[100vw] sm:w-[95vw] sm:max-w-[960px] max-h-[95dvh] sm:max-h-[92dvh] flex flex-col overflow-hidden bg-slate-900/98 border-0 sm:border border-white/10 text-white p-0 gap-0 overflow-x-hidden rounded-none sm:rounded-lg [padding-left:max(12px,env(safe-area-inset-left))] [padding-right:max(12px,env(safe-area-inset-right))] [padding-top:env(safe-area-inset-top)]">

        {/* ── Header ── */}
        <DialogHeader className="flex-none px-3 sm:px-4 pt-4 pb-3 border-b border-white/10 min-w-0">
          <DialogTitle className="flex items-center gap-2 sm:gap-3 text-left flex-wrap">
            <YuyucoinLogo size="md" />
            <div className="flex-1 min-w-0 overflow-hidden">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-lg font-bold">Yuyu</span>
                <span className="text-xs text-white/40 bg-white/10 rounded-full px-2 py-0.5">YUYU</span>
                <TreasuryBadge mode={treasuryMode} ratio={healthRatio} />
              </div>
              {priceData ? (
                <div className="flex items-center flex-wrap gap-x-2 gap-y-0.5 mt-0.5">
                  <span className="text-white font-semibold text-base tabular-nums">
                    ${priceUsd.toFixed(6)}
                  </span>
                  <span className="inline-flex items-center gap-1 text-[10px] text-emerald-400 bg-emerald-500/15 rounded-full px-1.5 py-0.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                    LIVE
                  </span>
                  {/* 24h change */}
                  <span
                    className={`inline-flex items-center gap-0.5 text-sm font-medium ${
                      isPositive ? 'text-green-400' : 'text-red-400'
                    }`}
                  >
                    {isPositive ? <TrendingUp className="w-3.5 h-3.5" /> : <TrendingDown className="w-3.5 h-3.5" />}
                    {changeUsd >= 0 ? '+' : ''}${Math.abs(changeUsd).toFixed(6)}&nbsp;
                    ({Math.abs(changePercent).toFixed(2)}%) 24h
                  </span>
                  <span className="text-white/30 text-xs">
                    Range: ${YUYU_PRICE_FLOOR}–${YUYU_PRICE_CEILING}
                  </span>
                  <span className="basis-full text-[11px] font-medium text-violet-300/80">
                    Community Activity &amp; Engagement Index — driven by live calls, gifts sent and active members
                  </span>
                </div>
              ) : (
                <span className="text-white/40 text-sm">Loading…</span>
              )}
            </div>
            <button
              type="button"
              onClick={fetchPrice}
              className="ml-auto p-1.5 rounded-lg hover:bg-white/10 transition-colors"
              title="Refresh price"
            >
              <RefreshCw className={`w-4 h-4 text-white/50 ${priceLoading ? 'animate-spin' : ''}`} />
            </button>
          </DialogTitle>
        </DialogHeader>

        {/* ── Scrollable body ── */}
        <div className="flex-1 min-h-0 overflow-y-auto overflow-x-hidden min-w-0">

          {/* ── Chart view ── */}
          {view === 'chart' && (
            <>
              {/* Timeframe tabs — touch-friendly, no overflow */}
              <div className="flex-none px-3 sm:px-4 pt-3 pb-2 flex flex-wrap gap-2">
                {TIMEFRAMES.map((tf) => (
                  <button
                    key={tf}
                    type="button"
                    onClick={() => { activeTimeframeRef.current = tf; setTimeframe(tf); }}
                    className={`min-h-[44px] min-w-[44px] px-3 py-2 rounded-xl text-sm font-medium transition-colors touch-manipulation ${
                      timeframe === tf
                        ? 'bg-amber-500/30 text-amber-300 border border-amber-500/50'
                        : 'bg-white/5 text-white/60 border border-white/10 hover:bg-white/10 active:bg-white/15'
                    }`}
                  >
                    {tf}
                  </button>
                ))}
              </div>

              {/* ── Period stats badges ─────────────────────────────────── */}
              <div className="px-3 sm:px-4 pb-2 flex items-center gap-2 flex-wrap">
                {periodStats && !chartLoading ? (
                  <>
                    {/* Open */}
                    <div className="flex items-center gap-1.5 bg-white/5 border border-white/10 rounded-lg px-2.5 py-1">
                      <span className="text-[11px] text-white/35 font-medium">
                        {intraday ? `${timeframe} Open` : timeframe === '1D' ? 'Day Open' : timeframe === '1W' ? 'Week Open' : timeframe === '1M' ? 'Month Open' : 'Year Open'}
                      </span>
                      <span className="text-[11px] text-white/70 font-bold tabular-nums">
                        ${formatPrice(periodStats.open)}
                      </span>
                    </div>
                    {/* High */}
                    <div className="flex items-center gap-1.5 bg-green-500/10 border border-green-500/20 rounded-lg px-2.5 py-1">
                      <ArrowUp className="w-3 h-3 text-green-400 flex-shrink-0" />
                      <span className="text-[11px] text-green-300/60 font-medium">High</span>
                      <span className="text-[11px] text-green-400 font-bold tabular-nums">
                        ${formatPrice(periodStats.high)}
                      </span>
                    </div>
                    {/* Low */}
                    <div className="flex items-center gap-1.5 bg-red-500/10 border border-red-500/20 rounded-lg px-2.5 py-1">
                      <ArrowDown className="w-3 h-3 text-red-400 flex-shrink-0" />
                      <span className="text-[11px] text-red-300/60 font-medium">Low</span>
                      <span className="text-[11px] text-red-400 font-bold tabular-nums">
                        ${formatPrice(periodStats.low)}
                      </span>
                    </div>
                    {/* % change vs period open — only show if we have ≥2 real days */}
                    {liveChartData.length >= 2 && (
                      <div className={`ml-auto flex items-center gap-1.5 rounded-lg px-3 py-1.5 border font-bold ${
                        periodStats.pctChange >= 0
                          ? 'bg-green-500/15 border-green-500/30 text-green-400'
                          : 'bg-red-500/15 border-red-500/30 text-red-400'
                      }`}>
                        {periodStats.pctChange >= 0
                          ? <TrendingUp className="w-3.5 h-3.5" />
                          : <TrendingDown className="w-3.5 h-3.5" />
                        }
                        <span className="text-sm tabular-nums">
                          {periodStats.pctChange >= 0 ? '+' : ''}{periodStats.pctChange.toFixed(2)}%
                        </span>
                        <span className="text-[11px] opacity-55 font-normal">{timeframe}</span>
                      </div>
                    )}
                    {/* Single day: show "Day 1 of N" instead of fake % */}
                    {!intraday && chartData.length < 2 && timeframe !== '1D' && (
                      <div className="ml-auto flex items-center gap-1.5 bg-white/5 border border-white/10 rounded-lg px-3 py-1.5">
                        <span className="text-[11px] text-white/40 tabular-nums">
                          Day 1 of {timeframe === '1W' ? 7 : timeframe === '1M' ? 30 : 365}
                        </span>
                      </div>
                    )}
                  </>
                ) : chartLoading ? (
                  <div className="flex items-center gap-2 text-white/30 text-xs">
                    <Loader2 className="w-3 h-3 animate-spin" /> Loading stats…
                  </div>
                ) : null}
              </div>

              {/* ── Professional Chart (mobile/PWA-optimized) ────────────── */}
              <div className="px-2 sm:px-3 pb-2 w-full min-w-0 max-w-full overflow-hidden">
                <div className={`rounded-2xl border overflow-hidden w-full min-w-0 ${
                  (periodStats?.pctChange ?? 0) >= 0
                    ? 'border-green-500/15 bg-gradient-to-b from-green-500/[0.04] to-transparent'
                    : 'border-red-500/15 bg-gradient-to-b from-red-500/[0.04] to-transparent'
                }`}>

                  {/* Chart body */}
                  <div className="w-full min-w-0">
                    {chartLoading ? (
                      <div className="min-h-[260px] sm:min-h-[320px] h-[260px] sm:h-[320px] flex flex-col items-center justify-center gap-3 text-white/30">
                        <Activity className="w-6 h-6 animate-pulse" />
                        <span className="text-xs">Loading price history…</span>
                      </div>
                    ) : (() => {
                      const livePrice = priceUsd;

                      // ── Sparse data: fewer real days than window expects ──────
                      // Show a "not enough history" state instead of a misleading flat line
                      const minPointsNeeded = timeframe === '1W' ? 2 : timeframe === '1M' ? 2 : 1;
                      const hasEnoughData   = intraday || chartData.length >= minPointsNeeded || liveChartData.length >= 2;

                      if (!hasEnoughData && timeframe !== '1D') {
                        // Show today's price point + informational message
                        const todayPt = chartData.length === 1 ? chartData[0]! : {
                          price: livePrice, open: livePrice, high: livePrice,
                          low: livePrice, close: livePrice, time: 'Today', timestamp: Date.now(),
                        };
                        const daysNeeded = timeframe === '1W' ? 7 : timeframe === '1M' ? 30 : 365;
                        return (
                          <div className="flex flex-col items-center justify-center min-h-[260px] sm:min-h-[320px] h-[260px] sm:h-[320px] gap-3 px-6">
                            {/* Price dot */}
                            <div className="flex flex-col items-center gap-1">
                              <div className="w-3 h-3 rounded-full bg-amber-400 shadow-[0_0_12px_rgba(251,191,36,0.6)]" />
                              <span className="text-white font-bold text-xl tabular-nums">
                                ${formatPrice(livePrice)}
                              </span>
                              <span className="text-white/40 text-xs">Today&apos;s price</span>
                            </div>
                            {/* Info message */}
                            <div className="bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-center max-w-xs">
                              <p className="text-white/60 text-xs font-medium mb-1">
                                {timeframe} chart building…
                              </p>
                              <p className="text-white/35 text-[11px] leading-relaxed">
                                Only {chartData.length} day{chartData.length !== 1 ? 's' : ''} of data recorded.
                                The {timeframe} view will populate once {daysNeeded} days of price history exist.
                              </p>
                              <p className="text-amber-400/60 text-[10px] mt-2">
                                Switch to <strong className="text-amber-400">1D</strong> to see today&apos;s live chart.
                              </p>
                            </div>
                          </div>
                        );
                      }

                      const fallback: YuyucoinChartPoint = {
                        price: livePrice, open: livePrice, high: livePrice,
                        low: livePrice, close: livePrice, time: 'Now', timestamp: Date.now(),
                      };
                      const displayData = liveChartData.length === 0
                        ? [fallback]
                        : liveChartData;
                      // Period open = DB open_price of the first candle (immutable)
                      const openPrice  = displayData[0]?.open  ?? displayData[0]?.price ?? livePrice;
                      const closePrice = displayData[displayData.length - 1]?.close ?? displayData[displayData.length - 1]?.price ?? livePrice;

                      return (
                        <ChartRenderer
                          displayData={displayData}
                          timeframe={timeframe}
                          openPrice={openPrice}
                          closePrice={closePrice}
                          livePrice={livePrice}
                        />
                      );
                    })()}
                  </div>

                  {/* Bottom info bar — responsive for PWA: wrap and readable on small screens */}
                  <div className="flex flex-wrap items-center justify-between gap-x-3 gap-y-1.5 px-3 py-2.5 border-t border-white/5 min-h-0">
                    <span className="text-[10px] sm:text-[11px] text-white/30 tabular-nums break-words max-w-full">
                      {intraday
                        ? `${liveChartData.length} candles · live · updates every second`
                        : `${chartData.length} day${chartData.length !== 1 ? 's' : ''} · ` + (
                          timeframe === '1D' ? 'Hourly closes · live'
                          : timeframe === '1W' ? `Daily closes · last ${chartData.length} of 7 days`
                          : timeframe === '1M' ? `Daily closes · last ${chartData.length} of 30 days`
                          : `Weekly closes · ${chartData.length} weeks`)}
                    </span>
                    <span className="text-[10px] sm:text-[11px] text-white/25 shrink-0">
                      Floor ${YUYU_PRICE_FLOOR} · Ceiling ${YUYU_PRICE_CEILING}
                    </span>
                  </div>
                </div>
              </div>

              {/* Live stats */}
              <LiveStats stats={liveStats} lastUpdated={statsLastUpdated} livePrice={priceUsd} />

              {/* ── Investment summary card ─────────────────────────── */}
              <div className="mx-4 mb-3 rounded-2xl border border-white/8 bg-white/[0.03] overflow-hidden">
                <div className="px-4 pt-3 pb-2 border-b border-white/6">
                  <span className="text-[11px] font-semibold text-white/40 uppercase tracking-wider">
                    Your Holdings
                  </span>
                </div>
                <div className="px-4 py-3 grid grid-cols-2 sm:grid-cols-3 gap-3">
                  {/* Total value */}
                  <div>
                    <p className="text-[11px] text-white/35 mb-0.5">Total Value</p>
                    <p className="text-lg font-bold text-white tabular-nums">
                      ${(yuyuScore * priceUsd).toFixed(4)}
                    </p>
                    {yuyuScore > 0 && priceData && (
                      <span className={`text-[11px] font-semibold ${isPositive ? 'text-green-400' : 'text-red-400'}`}>
                        {changePercent >= 0 ? '+' : ''}{changePercent.toFixed(2)}% 24h
                      </span>
                    )}
                  </div>
                  {/* YUYU balance */}
                  <div>
                    <p className="text-[11px] text-white/35 mb-0.5">YUYU Balance</p>
                    <p className="text-base font-bold text-amber-400 tabular-nums">
                      {yuyuScore.toLocaleString()}
                    </p>
                    <p className="text-[11px] text-white/30">platform rewards</p>
                  </div>
                  {/* Current price */}
                  <div>
                    <p className="text-[11px] text-white/35 mb-0.5">Current Price</p>
                    <p className="text-base font-bold text-white tabular-nums">
                      ${formatPrice(priceUsd)}
                    </p>
                    <div className="flex items-center gap-1">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse flex-shrink-0" />
                      <span className="text-[11px] text-emerald-400">Live</span>
                    </div>
                  </div>
                </div>
              </div>
            </>
          )}

          {/* ── Buy view ── */}
          {view === 'buy' && (
            <BuyForm
              currentPrice={priceUsd}
              walletBalance={usdBalance}
              balanceLoading={balanceQueryLoading || balanceLoading}
              onRefreshBalance={() => {
                setBalanceLoading(true);
                refetchBalance().finally(() => setBalanceLoading(false));
              }}
              treasuryMode={treasuryMode}
              onBack={() => setView('chart')}
              onSuccess={() => { setView('chart'); fetchStats(); }}
            />
          )}

          {/* ── Sell view ── */}
          {view === 'sell' && (
            <SellForm
              currentPrice={priceUsd}
              yuyuBalance={yuyuScore}
              poolBalance={poolBalance}
              limits={limits}
              onBack={() => setView('chart')}
              onSuccess={() => { setView('chart'); fetchStats(); }}
            />
          )}
        </div>

        {/* ── Footer: Buy / Sell buttons (only on chart view) ── */}
        {view === 'chart' && (
          <div className="flex-none p-4 pt-3 flex items-center gap-2 border-t border-white/10 bg-slate-900/98 [padding-bottom:max(1rem,env(safe-area-inset-bottom))]">
            <Button
              className="flex-1 h-12 rounded-2xl bg-emerald-500 text-slate-950 hover:bg-emerald-400 font-bold text-base"
              onClick={() => setView('buy')}
            >
              Buy
            </Button>
            <Button
              className="flex-1 h-12 rounded-2xl bg-rose-500/90 text-white hover:bg-rose-500 font-bold text-base"
              onClick={() => setView('sell')}
            >
              Sell
            </Button>
          </div>
        )}

        {/* ── Disclaimer ── */}
        <div className="flex-none px-4 pb-3 border-t border-white/5">
          <p className="text-[10px] text-white/25 text-center leading-relaxed">
            Yuyu are internal platform rewards. Price range: $0.001–$0.50. Values reflect platform activity
            and are not guaranteed financial returns. Past performance is not indicative of future results.
          </p>
        </div>
      </DialogContent>
    </Dialog>
  );
};
