/**
 * Yuyu price service – V2 Economic Model.
 *
 * Key constraints:
 *   Price floor:    $0.001
 *   Price ceiling:  $0.50
 *   Total supply:   8,000,000,000 YUYU
 *   Init circ.:     700,000 YUYU
 *   Sell fee:       2% (withdrawal fee → treasury)
 *   Buy fee:        3% (platform fee)
 *   Max sell/tx:    100,000 YUYU
 *   Daily limit:    $1,000 USD
 *   Weekly limit:   $5,000 USD
 *   Min to sell:    5,000 YUYU
 */

import { supabase } from '../config/supabase';
import api from '../lib/api';

// ─── Constants ────────────────────────────────────────────────────────────────

export const YUYU_PRICE_FLOOR    = 0.001;
export const YUYU_PRICE_CEILING  = 0.50;
export const YUYU_TOTAL_SUPPLY   = 8_000_000_000;
/** 1 billion YUYU reserved for Beryn (founder); not in circulation. */
export const YUYU_RESERVED_BERYN = 1_000_000_000;
/** 7 billion YUYU in circulation (8B total − 1B reserved). Burns reduce effective supply. */
export const YUYU_CIRCULATING_SUPPLY = 7_000_000_000;
// Circulation starts at 0 and grows as users buy. 700,000 is the issuance cap.
export const YUYU_INIT_CIRC      = 0;
export const YUYU_BUY_FEE_PCT    = 3;
export const YUYU_SELL_FEE_PCT   = 2;
export const YUYU_MAX_PER_TX     = 100_000;
export const YUYU_MIN_TO_SELL    = 5_000;
export const YUYU_DAILY_LIMIT    = 1_000;
export const YUYU_WEEKLY_LIMIT   = 5_000;

const FALLBACK_PRICE = 0.01;

// ─── Types ────────────────────────────────────────────────────────────────────

export interface YuyucoinPriceData {
  priceUsd:      number;
  changeUsd:     number;
  changePercent: number;
  label:         string;
  timestamp:     number;
  updatedAt:     string;
}

export interface YuyucoinChartPoint {
  time:      string;
  price:     number;   // = close price (used by the area chart)
  open:      number;
  high:      number;
  low:       number;
  close:     number;
  timestamp: number;
}

export type MarketPhase = 'medium' | 'explosive' | 'declining';
export type MomentumDirection = 'up' | 'down' | 'neutral';
export type OrderStatus = 'open' | 'partial' | 'filled' | 'cancelled';
export type OrderType = 'buy' | 'sell';

export interface YuyuLiveStats {
  // Platform activity
  active_users:        number;
  daily_calls:         number;
  daily_gifts:         number;
  /** Total calls/matches made today (real-time). */
  total_calls_today:  number;
  /** Total gifts sent today (real-time). */
  total_gifts_today:  number;
  /** All-time total calls (matches). */
  total_calls:        number;
  /** All-time total gifts sent. */
  total_gifts_sent:   number;
  /** Total members (users) on the app. */
  total_members:      number;
  /** People in queue waiting for a match. */
  users_waiting:      number;
  /** People currently in a call. */
  users_in_call:      number;
  total_burned:        number;
  buy_volume_24h:      number;
  sell_volume_24h:     number;
  // Supply / pool
  yuyu_in_circulation: number;
  pool_usd_balance:    number;
  current_price:       number;
  price_24h_ago:       number;
  // Market phase + order book
  market_phase:        MarketPhase;
  momentum_direction:  MomentumDirection;
  order_book_buy_qty:  number;
  order_book_sell_qty: number;
  // Treasury health
  treasury_mode:       'normal' | 'emergency' | 'critical';
  treasury_health_ratio: number;
  daily_limit_usd:     number;
  weekly_limit_usd:    number;
  max_yuyu_per_tx:     number;
  min_yuyu_to_sell:    number;
  // Constants
  price_floor:         number;
  price_ceiling:       number;
  total_supply:        number;
}

// ─── Order Book Types ─────────────────────────────────────────────────────────

export interface OrderBookLevel {
  price:    number;
  quantity: number;
  orders:   number;
}

export interface OrderBook {
  buy_orders:       OrderBookLevel[];
  sell_orders:      OrderBookLevel[];
  total_buy_qty:    number;
  total_sell_qty:   number;
  buy_ratio:        number;
  market_phase:     MarketPhase;
  phase_description: string;
}

export interface YuyuOrder {
  id:              string;
  order_type:      OrderType;
  limit_price:     number;
  quantity:        number;
  filled_quantity: number;
  remaining:       number;
  status:          OrderStatus;
  created_at:      string;
  updated_at:      string;
}

export interface WithdrawalLimits {
  treasury_mode:         'normal' | 'emergency' | 'critical';
  daily_limit_usd:       number;
  weekly_limit_usd:      number;
  max_yuyu_per_tx:       number;
  min_yuyu_to_sell:      number;
  withdrawn_today_usd:   number;
  withdrawn_week_usd:    number;
  remaining_daily_usd:   number;
  remaining_weekly_usd:  number;
}

// ─── Current price ────────────────────────────────────────────────────────────

export async function getYuyucoinPrice(): Promise<YuyucoinPriceData> {
  try {
    const { data: row, error } = await supabase
      .from('yuyu_price')
      .select('current_price, updated_at')
      .limit(1)
      .single();

    if (error || !row) throw error || new Error('no row');

    const priceUsd  = clamp(Number(row.current_price) || FALLBACK_PRICE);
    const updatedAt = row.updated_at as string;

    // Use yesterday's close from yuyu_daily_price as the 24h-ago benchmark.
    // Falls back to yuyu_price_history if the daily table has no yesterday row yet.
    const yesterday = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString().slice(0, 10);
    const { data: dayRow } = await supabase
      .from('yuyu_daily_price')
      .select('close_price')
      .lte('day_date', yesterday)
      .order('day_date', { ascending: false })
      .limit(1)
      .single();

    let price24h = dayRow ? clamp(Number(dayRow.close_price)) : priceUsd;

    // Fallback: minute-history if daily table not yet populated
    if (!dayRow) {
      const since24h = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();
      const { data: oldRow } = await supabase
        .from('yuyu_price_history')
        .select('price')
        .lte('recorded_at', since24h)
        .order('recorded_at', { ascending: false })
        .limit(1)
        .single();
      if (oldRow) price24h = clamp(Number(oldRow.price));
    }

    const changeUsd     = priceUsd - price24h;
    const changePercent = price24h > 0 ? ((priceUsd - price24h) / price24h) * 100 : 0;

    return { priceUsd, changeUsd, changePercent, label: 'Today', timestamp: Date.now(), updatedAt };
  } catch {
    return {
      priceUsd:      FALLBACK_PRICE,
      changeUsd:     0,
      changePercent: 0,
      label:         'Today',
      timestamp:     Date.now(),
      updatedAt:     new Date().toISOString(),
    };
  }
}

// ─── Chart data ───────────────────────────────────────────────────────────────

/**
 * Supported chart timeframes.
 *
 * Core rule: daily close is the SOURCE OF TRUTH.
 * Weekly / Monthly / Yearly are pure AGGREGATIONS of daily rows.
 * No extra price calculation ever happens for those views.
 *
 *  1D  → today's intra-day hourly closes from yuyu_price_history
 *  1W  → last 7 daily candles  (aggregated from yuyu_daily_price)
 *  1M  → last 30 daily candles (aggregated from yuyu_daily_price)
 *  1Y  → last 365 daily candles grouped into weekly candles
 */
export type ChartTimeframe = '1D' | '1W' | '1M' | '1Y';

export interface OhlcCandle {
  time:       string;   // x-axis label
  timestamp:  number;   // epoch ms for sorting
  open:       number;
  high:       number;
  low:        number;
  close:      number;
}

const MONTHS = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'] as const;
const DAYS   = ['Sun','Mon','Tue','Wed','Thu','Fri','Sat'] as const;

function clamp(v: number): number {
  return Math.max(YUYU_PRICE_FLOOR, Math.min(YUYU_PRICE_CEILING, v || FALLBACK_PRICE));
}

/** Format a UTC date string (YYYY-MM-DD) into a Date at midnight UTC. */
function parseDayDate(d: string): Date {
  return new Date(`${d}T00:00:00Z`);
}

/**
 * Fetch OHLC candles for a given timeframe.
 *
 * 1D  — hourly closes from yuyu_price_history (intra-day)
 * 1W  — one candle per day for last 7 days
 * 1M  — one candle per day for last 30 days
 * 1Y  — one candle per ISO week for last 52 weeks (built from daily rows)
 *
 * Historical candles are IMMUTABLE: only the current day's candle is updated
 * by the minute cron. Past candles are finalised at midnight by update_yuyu_daily_price.
 */
export async function getYuyucoinChartData(tf: string): Promise<YuyucoinChartPoint[]> {
  const timeframe = tf.toUpperCase() as ChartTimeframe;

  if (timeframe === '1D') {
    return _get1DChart();
  }
  return _getDailyBasedChart(timeframe as '1W' | '1M' | '1Y');
}

// ── 1D: intra-day HOURLY closes (24 points max) ───────────────────────────────
async function _get1DChart(): Promise<YuyucoinChartPoint[]> {
  const nowMs   = Date.now();
  const since   = new Date(nowMs - 24 * 60 * 60 * 1000);
  const HOUR    = 60 * 60 * 1000;

  const [histResult, priceResult, dailyResult] = await Promise.allSettled([
    supabase
      .from('yuyu_price_history')
      .select('price, recorded_at')
      .gte('recorded_at', since.toISOString())
      .order('recorded_at', { ascending: true })
      .limit(3000),
    supabase
      .from('yuyu_price')
      .select('current_price')
      .limit(1)
      .single(),
    supabase
      .from('yuyu_daily_price')
      .select('open_price, high_price, low_price, close_price')
      .eq('day_date', new Date().toISOString().slice(0, 10))
      .single(),
  ]);

  const currentPrice =
    priceResult.status === 'fulfilled' && priceResult.value.data
      ? clamp(Number(priceResult.value.data.current_price))
      : FALLBACK_PRICE;

  // Today's day-level OHLC for the header stats
  const todayDaily =
    dailyResult.status === 'fulfilled' && dailyResult.value.data
      ? dailyResult.value.data as { open_price: number; high_price: number; low_price: number; close_price: number }
      : null;

  const rows =
    histResult.status === 'fulfilled' && !histResult.value.error
      ? (histResult.value.data ?? [])
      : [];

  if (rows.length === 0) {
    const open = todayDaily ? clamp(Number(todayDaily.open_price)) : currentPrice;
    return [{
      price: currentPrice, open, high: currentPrice, low: currentPrice, close: currentPrice,
      time: 'Now', timestamp: nowMs,
    }];
  }

  // Build per-hour OHLC candles
  interface HourCandle { open: number; high: number; low: number; close: number; }
  const hourMap = new Map<number, HourCandle>();
  for (const row of rows) {
    const ts  = new Date(row.recorded_at).getTime();
    const key = Math.floor(ts / HOUR) * HOUR;
    const p   = clamp(Number(row.price));
    const ex  = hourMap.get(key);
    if (!ex) {
      hourMap.set(key, { open: p, high: p, low: p, close: p });
    } else {
      ex.high  = Math.max(ex.high,  p);
      ex.low   = Math.min(ex.low,   p);
      ex.close = p;
    }
  }

  const sortedKeys  = Array.from(hourMap.keys()).sort((a, b) => a - b);
  const firstKey    = sortedKeys[0]!;
  const lastSlot    = Math.floor(nowMs / HOUR) * HOUR;

  let lastKnownCandle: HourCandle = hourMap.get(firstKey)!;
  const points: YuyucoinChartPoint[] = [];

  for (let k = firstKey; k <= lastSlot; k += HOUR) {
    const isLast = k === lastSlot;
    const real   = hourMap.get(k);
    if (real) lastKnownCandle = real;

    const candle = real ?? { ...lastKnownCandle };
    const label  = isLast
      ? 'Now'
      : new Date(k).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false });

    const closeVal = isLast ? currentPrice : candle.close;
    points.push({
      price:     closeVal,
      open:      candle.open,
      high:      isLast ? Math.max(candle.high, currentPrice) : candle.high,
      low:       isLast ? Math.min(candle.low,  currentPrice) : candle.low,
      close:     closeVal,
      time:      label,
      timestamp: k,
    });
  }

  // Attach today's day-level open to the FIRST point so period stats open = day open
  if (todayDaily && points.length > 0) {
    points[0]!.open = clamp(Number(todayDaily.open_price));
  }

  return points;
}

// ── Row type returned by yuyu_daily_price queries ─────────────────────────────
interface DailyRow {
  day_date:    string;
  open_price:  number;
  high_price:  number;
  low_price:   number;
  close_price: number;
}

/**
 * Build chart points from yuyu_daily_price rows.
 *
 * 1W  → one point per day  (7 days)   – label: "Mon 3", "Tue 4" …
 * 1M  → one point per day  (30 days)  – label: "Mar 3", "Mar 8" …
 * 1Y  → one point per week (52 weeks) – label: "Jan", "Feb" …
 *
 * Each point's `price` = closing price of that day / week.
 * The LAST point is always the live current price.
 */
async function _getDailyBasedChart(tf: '1W' | '1M' | '1Y'): Promise<YuyucoinChartPoint[]> {
  const nowMs    = Date.now();
  const DAY      = 24 * 60 * 60 * 1000;
  const lookback = tf === '1W' ? 7 : tf === '1M' ? 30 : 365;
  const since    = new Date(nowMs - lookback * DAY);

  const [dailyResult, priceResult] = await Promise.allSettled([
    supabase
      .from('yuyu_daily_price')
      .select('day_date, open_price, high_price, low_price, close_price')
      .gte('day_date', since.toISOString().slice(0, 10))
      .order('day_date', { ascending: true })
      .limit(400),
    supabase
      .from('yuyu_price')
      .select('current_price')
      .limit(1)
      .single(),
  ]);

  const currentPrice =
    priceResult.status === 'fulfilled' && priceResult.value.data
      ? clamp(Number(priceResult.value.data.current_price))
      : FALLBACK_PRICE;

  let dailyRows: DailyRow[] =
    dailyResult.status === 'fulfilled' && !dailyResult.value.error
      ? ((dailyResult.value.data ?? []) as DailyRow[])
      : [];

  // Fallback: build daily rows from minute history if yuyu_daily_price is empty
  if (dailyRows.length === 0) {
    dailyRows = await _buildDailyRowsFromHistory(since, lookback);
  }

  // No data at all → single "Today" point
  if (dailyRows.length === 0) {
    return [{
      price: currentPrice, open: currentPrice, high: currentPrice,
      low: currentPrice, close: currentPrice,
      time: 'Today', timestamp: nowMs,
    }];
  }

  if (tf === '1W' || tf === '1M') {
    // Normalize fills gaps ONLY between real rows (no backwards phantom padding)
    const normalizedRows = _normalizeDailyWindow(dailyRows, lookback, currentPrice);
    return _buildDailyPoints(normalizedRows, currentPrice, tf);
  }
  return _buildWeeklyPoints(dailyRows, currentPrice);
}

/**
 * Fallback: aggregate yuyu_price_history (minute rows) into daily OHLC candles.
 * Used when yuyu_daily_price table has no rows yet.
 */
async function _buildDailyRowsFromHistory(since: Date, lookbackDays: number): Promise<DailyRow[]> {
  const DAY = 24 * 60 * 60 * 1000;
  const rowLimit = lookbackDays <= 7
    ? 15_000
    : lookbackDays <= 30
      ? 50_000
      : 150_000;

  const { data, error } = await supabase
    .from('yuyu_price_history')
    .select('price, recorded_at')
    .gte('recorded_at', since.toISOString())
    .order('recorded_at', { ascending: true })
    .limit(rowLimit);

  if (error || !data || data.length === 0) return [];

  // Group minute rows by UTC day key (YYYY-MM-DD)
  const dayMap = new Map<string, { open: number; high: number; low: number; close: number }>();

  for (const row of data) {
    const ts     = new Date(row.recorded_at).getTime();
    const dayKey = new Date(Math.floor(ts / DAY) * DAY).toISOString().slice(0, 10);
    const p      = clamp(Number(row.price));

    const existing = dayMap.get(dayKey);
    if (!existing) {
      dayMap.set(dayKey, { open: p, high: p, low: p, close: p });
    } else {
      existing.high  = Math.max(existing.high, p);
      existing.low   = Math.min(existing.low,  p);
      existing.close = p;  // last row in the day = close
    }
  }

  return Array.from(dayMap.entries())
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([day_date, ohlc]) => ({
      day_date,
      open_price:  ohlc.open,
      high_price:  ohlc.high,
      low_price:   ohlc.low,
      close_price: ohlc.close,
    }));
}

/**
 * Normalize the daily window for 1W / 1M charts.
 *
 * KEY RULE: only fill gaps that exist BETWEEN real data points.
 * Never fabricate phantom candles for days before the first real row.
 *
 * If fewer real rows exist than the requested window:
 *   - Show all real days + today (do NOT pad backwards)
 *   - This is correct behaviour: a 1-day-old coin shows 1–2 real points, not 7 fake ones
 */
function _normalizeDailyWindow(rows: DailyRow[], _days: number, currentPrice: number): DailyRow[] {
  if (rows.length === 0) return [];

  const DAY      = 24 * 60 * 60 * 1000;
  const todayUtc = new Date();
  const todayKey = todayUtc.toISOString().slice(0, 10);

  // Build lookup by date
  const byDay = new Map<string, DailyRow>();
  for (const r of rows) byDay.set(r.day_date, r);

  // Range = from first real row → today
  const firstDate = parseDayDate(rows[0]!.day_date).getTime();
  const lastDate  = Date.UTC(todayUtc.getUTCFullYear(), todayUtc.getUTCMonth(), todayUtc.getUTCDate());

  // Carry-forward fill only within [firstDate, today]
  let carry = clamp(Number(rows[0]!.close_price));
  const out: DailyRow[] = [];

  for (let t = firstDate; t <= lastDate; t += DAY) {
    const dayDate = new Date(t).toISOString().slice(0, 10);
    const exact   = byDay.get(dayDate);

    if (exact) {
      carry = clamp(Number(exact.close_price));
      // For today's row: patch close_price with live price so it's always current
      out.push(dayDate === todayKey
        ? { ...exact, close_price: currentPrice }
        : exact,
      );
    } else {
      // Gap between real rows — carry forward (flat line segment)
      out.push({
        day_date:    dayDate,
        open_price:  carry,
        high_price:  carry,
        low_price:   carry,
        close_price: carry,
      });
    }
  }

  return out;
}

function _buildDailyPoints(
  rows: DailyRow[],
  currentPrice: number,
  tf: '1W' | '1M',
): YuyucoinChartPoint[] {
  if (rows.length === 0) return [];

  const todayKey = new Date().toISOString().slice(0, 10);
  const points: YuyucoinChartPoint[] = [];

  for (let i = 0; i < rows.length; i++) {
    const row      = rows[i]!;
    const isToday  = row.day_date === todayKey;
    const d        = parseDayDate(row.day_date);
    const dayNum   = d.getUTCDate();
    const mon      = MONTHS[d.getUTCMonth()]!;
    const dow      = DAYS[d.getUTCDay()]!;

    // Label:
    //  today → "Today"
    //  1W    → "Mon 3"   (day-of-week + date)
    //  1M    → "Mar 3"   (month abbr + date)
    const label = isToday
      ? 'Today'
      : tf === '1W'
        ? `${dow} ${dayNum}`
        : `${mon} ${dayNum}`;

    // Close = live price for today; DB close for past days
    const closeVal = isToday ? currentPrice : clamp(Number(row.close_price));
    const openVal  = clamp(Number(row.open_price));
    const highVal  = isToday
      ? Math.max(clamp(Number(row.high_price)), currentPrice)
      : clamp(Number(row.high_price));
    const lowVal   = isToday
      ? Math.min(clamp(Number(row.low_price)),  currentPrice)
      : clamp(Number(row.low_price));

    points.push({
      price:     closeVal,
      open:      openVal,
      high:      highVal,
      low:       lowVal,
      close:     closeVal,
      time:      label,
      timestamp: d.getTime(),
    });
  }

  return points;
}

function _buildWeeklyPoints(
  rows: DailyRow[],
  currentPrice: number,
): YuyucoinChartPoint[] {
  const weekMap = new Map<string, {
    open: number; high: number; low: number; close: number; ts: number;
  }>();

  for (const row of rows) {
    const d        = parseDayDate(row.day_date);
    const weekKey  = _isoWeekKey(d);
    const existing = weekMap.get(weekKey);
    const o = clamp(Number(row.open_price));
    const h = clamp(Number(row.high_price));
    const l = clamp(Number(row.low_price));
    const c = clamp(Number(row.close_price));

    if (!existing) {
      weekMap.set(weekKey, { open: o, high: h, low: l, close: c, ts: d.getTime() });
    } else {
      existing.high  = Math.max(existing.high, h);
      existing.low   = Math.min(existing.low,  l);
      existing.close = c;
    }
  }

  const sortedWeeks = Array.from(weekMap.entries()).sort((a, b) => a[1].ts - b[1].ts);
  if (sortedWeeks.length === 0) {
    return [{
      price: currentPrice, open: currentPrice, high: currentPrice,
      low: currentPrice, close: currentPrice,
      time: 'Now', timestamp: Date.now(),
    }];
  }

  let lastMonth = -1;
  return sortedWeeks.map(([, candle], idx) => {
    const isLast = idx === sortedWeeks.length - 1;
    const d      = new Date(candle.ts);
    const mo     = d.getUTCMonth();
    const label  = isLast
      ? 'This Wk'
      : mo !== lastMonth
        ? MONTHS[mo]!
        : `${MONTHS[mo]} ${d.getUTCDate()}`;

    if (mo !== lastMonth) lastMonth = mo;

    const closeVal = isLast ? currentPrice : candle.close;
    return {
      price:     closeVal,
      open:      candle.open,
      high:      isLast ? Math.max(candle.high, currentPrice) : candle.high,
      low:       isLast ? Math.min(candle.low,  currentPrice) : candle.low,
      close:     closeVal,
      time:      label,
      timestamp: candle.ts,
    };
  });
}

/** Returns ISO week string like "2026-W10" for a given date. */
function _isoWeekKey(d: Date): string {
  const jan4      = new Date(Date.UTC(d.getUTCFullYear(), 0, 4));
  const dayOfYear = Math.floor((d.getTime() - new Date(Date.UTC(d.getUTCFullYear(), 0, 0)).getTime()) / 86400000);
  const weekNum   = Math.ceil((dayOfYear + jan4.getUTCDay()) / 7);
  return `${d.getUTCFullYear()}-W${String(weekNum).padStart(2, '0')}`;
}

// ─── Chart period stats ───────────────────────────────────────────────────────

export interface ChartPeriodStats {
  high:        number;
  low:         number;
  open:        number;  // first price of this period
  close:       number;  // last / current price of this period
  pctChange:   number;
  pctLabel:    string;  // e.g. "1D", "1W", "1M", "1Y"
}

/**
 * Calculates correct OHLC stats for the CURRENT period.
 *
 * Rules:
 *  1D  → open = first hourly price of today (today's candle open)
 *  1W  → open = Monday's open (first day of the 7-day window)
 *  1M  → open = first day's open in the 30-day window
 *  1Y  → open = first weekly candle open in the 52-week window
 *
 * These values come from `yuyu_daily_price.open_price` for past days,
 * and from `yuyu_price_history` for intra-day (1D).
 * They are IMMUTABLE for past periods — only today's close updates.
 */
export function calcChartPeriodStats(
  points: YuyucoinChartPoint[],
  tf: ChartTimeframe = '1D',
): ChartPeriodStats | null {
  if (points.length === 0) return null;
  const prices = points.map(p => p.price).filter(p => p > 0);
  if (prices.length === 0) return null;

  const open  = prices[0]!;
  const close = prices[prices.length - 1]!;
  const high  = Math.max(...prices);
  const low   = Math.min(...prices);

  return {
    high,
    low,
    open,
    close,
    pctChange: open > 0 ? ((close - open) / open) * 100 : 0,
    pctLabel:  tf,
  };
}

/**
 * Fetch the daily OHLC candle for today from yuyu_daily_price.
 * Used to display a more accurate 24h range in the header.
 */
export async function getTodayDailyCandle(): Promise<OhlcCandle | null> {
  try {
    const today = new Date().toISOString().slice(0, 10);
    const { data, error } = await supabase
      .from('yuyu_daily_price')
      .select('day_date, open_price, high_price, low_price, close_price')
      .eq('day_date', today)
      .single();
    if (error || !data) return null;
    const d = parseDayDate((data as DailyRow).day_date);
    return {
      time:      'Today',
      timestamp: d.getTime(),
      open:      clamp(Number((data as DailyRow).open_price)),
      high:      clamp(Number((data as DailyRow).high_price)),
      low:       clamp(Number((data as DailyRow).low_price)),
      close:     clamp(Number((data as DailyRow).close_price)),
    };
  } catch {
    return null;
  }
}

// ─── Live stats ───────────────────────────────────────────────────────────────

function parseLiveStatsResponse(data: Record<string, unknown> | null): YuyuLiveStats {
  if (!data) return getZeroLiveStats();
  return {
    active_users:          Number(data.active_users          ?? 0),
    daily_calls:           Number(data.daily_calls           ?? 0),
    daily_gifts:           Number(data.daily_gifts           ?? 0),
    total_calls_today:     Number(data.total_calls_today    ?? 0),
    total_gifts_today:     Number(data.total_gifts_today    ?? 0),
    total_calls:           Number(data.total_calls         ?? 0),
    total_gifts_sent:      Number(data.total_gifts_sent    ?? 0),
    total_members:         Number(data.total_members       ?? 0),
    users_waiting:         Number(data.users_waiting         ?? 0),
    users_in_call:         Number(data.users_in_call         ?? 0),
    total_burned:          Number(data.total_burned          ?? 0),
    buy_volume_24h:        Number(data.buy_volume_24h        ?? 0),
    sell_volume_24h:       Number(data.sell_volume_24h       ?? 0),
    yuyu_in_circulation:   Number(data.yuyu_in_circulation   ?? 0),
    pool_usd_balance:      Number(data.pool_usd_balance      ?? 0),
    current_price:         Math.max(YUYU_PRICE_FLOOR, Math.min(YUYU_PRICE_CEILING, Number(data.current_price ?? FALLBACK_PRICE))),
    price_24h_ago:         Number(data.price_24h_ago         ?? FALLBACK_PRICE),
    market_phase:          (data.market_phase        as MarketPhase)        ?? 'medium',
    momentum_direction:    (data.momentum_direction  as MomentumDirection)  ?? 'neutral',
    order_book_buy_qty:    Number(data.order_book_buy_qty    ?? 0),
    order_book_sell_qty:   Number(data.order_book_sell_qty   ?? 0),
    treasury_mode:         (data.treasury_mode as 'normal' | 'emergency' | 'critical') ?? 'normal',
    treasury_health_ratio: Number(data.treasury_health_ratio ?? 1.0),
    daily_limit_usd:       Number(data.daily_limit_usd       ?? YUYU_DAILY_LIMIT),
    weekly_limit_usd:      Number(data.weekly_limit_usd      ?? YUYU_WEEKLY_LIMIT),
    max_yuyu_per_tx:       Number(data.max_yuyu_per_tx       ?? YUYU_MAX_PER_TX),
    min_yuyu_to_sell:      Number(data.min_yuyu_to_sell      ?? YUYU_MIN_TO_SELL),
    price_floor:           YUYU_PRICE_FLOOR,
    price_ceiling:         YUYU_PRICE_CEILING,
    total_supply:          YUYU_TOTAL_SUPPLY,
  };
}

function getZeroLiveStats(): YuyuLiveStats {
  return {
    active_users: 0, daily_calls: 0, daily_gifts: 0,
    total_calls_today: 0, total_gifts_today: 0, total_calls: 0, total_gifts_sent: 0, total_members: 0, users_waiting: 0, users_in_call: 0,
    total_burned: 0,
    buy_volume_24h: 0, sell_volume_24h: 0, yuyu_in_circulation: 0, pool_usd_balance: 0,
    current_price: FALLBACK_PRICE, price_24h_ago: FALLBACK_PRICE,
    market_phase: 'medium', momentum_direction: 'neutral',
    order_book_buy_qty: 0, order_book_sell_qty: 0,
    treasury_mode: 'normal', treasury_health_ratio: 1.0,
    daily_limit_usd: YUYU_DAILY_LIMIT, weekly_limit_usd: YUYU_WEEKLY_LIMIT,
    max_yuyu_per_tx: YUYU_MAX_PER_TX, min_yuyu_to_sell: YUYU_MIN_TO_SELL,
    price_floor: YUYU_PRICE_FLOOR, price_ceiling: YUYU_PRICE_CEILING, total_supply: YUYU_TOTAL_SUPPLY,
  };
}

/** Fetches live stats from DB (platform_metrics). Use when you only need to read. */
export async function getYuyuLiveStats(): Promise<YuyuLiveStats> {
  try {
    const { data, error } = await supabase.rpc('get_yuyu_live_stats');
    if (error || !data) throw error || new Error('no data');
    return parseLiveStatsResponse(data as Record<string, unknown>);
  } catch {
    return getZeroLiveStats();
  }
}

/**
 * Refreshes platform_metrics from source tables (users, match_history, gifts) then returns live stats.
 * Use for real-time UI: calls, gifts, online now update from actual DB activity.
 * If the refresh RPC is not deployed or fails, falls back to read-only getYuyuLiveStats (cron data).
 */
export async function getAndRefreshYuyuLiveStats(): Promise<YuyuLiveStats> {
  try {
    const { data, error } = await supabase.rpc('get_and_refresh_yuyu_live_stats');
    if (error || !data) throw error || new Error('no data');
    return parseLiveStatsResponse(data as Record<string, unknown>);
  } catch {
    // RPC may not exist yet (migration not run) or refresh failed — use read-only so at least cron data shows
    return getYuyuLiveStats();
  }
}

// ─── Order Book ───────────────────────────────────────────────────────────────

export async function getOrderBook(depth = 10): Promise<OrderBook> {
  try {
    const { data, error } = await supabase.rpc('get_order_book', { p_depth: depth });
    if (error || !data) throw error || new Error('no data');
    return {
      buy_orders:        (data.buy_orders  as OrderBookLevel[]) ?? [],
      sell_orders:       (data.sell_orders as OrderBookLevel[]) ?? [],
      total_buy_qty:     Number(data.total_buy_qty  ?? 0),
      total_sell_qty:    Number(data.total_sell_qty ?? 0),
      buy_ratio:         Number(data.buy_ratio      ?? 0.5),
      market_phase:      (data.market_phase as MarketPhase) ?? 'medium',
      phase_description: (data.phase_description as string)  ?? '',
    };
  } catch {
    return {
      buy_orders:        [],
      sell_orders:       [],
      total_buy_qty:     0,
      total_sell_qty:    0,
      buy_ratio:         0.5,
      market_phase:      'medium',
      phase_description: 'Balanced market – normal fluctuations',
    };
  }
}

export async function getMyOrders(status?: OrderStatus): Promise<YuyuOrder[]> {
  try {
    const { data: authData } = await supabase.auth.getUser();
    const userId = authData?.user?.id;
    if (!userId) return [];

    const { data, error } = await supabase.rpc('get_my_orders', {
      p_user_id: userId,
      p_status:  status ?? null,
    });
    if (error || !data) throw error || new Error('no data');
    return (data as YuyuOrder[]) ?? [];
  } catch {
    return [];
  }
}

/** Place a limit buy or sell order on the order book. */
export async function placeYuyuOrder(
  orderType:  OrderType,
  limitPrice: number,
  quantity:   number,
): Promise<{ success: boolean; order_id?: string; error?: string }> {
  try {
    const { data: authData } = await supabase.auth.getUser();
    const userId = authData?.user?.id;
    if (!userId) throw new Error('Not authenticated');

    const { data, error } = await supabase.rpc('place_yuyu_order', {
      p_user_id:     userId,
      p_order_type:  orderType,
      p_limit_price: limitPrice,
      p_quantity:    quantity,
    });
    if (error) throw error;
    return data as { success: boolean; order_id?: string; error?: string };
  } catch (e: unknown) {
    return { success: false, error: e instanceof Error ? e.message : 'Unknown error' };
  }
}

/** Cancel an open or partial order and refund reserved balance. */
export async function cancelYuyuOrder(
  orderId: string,
): Promise<{ success: boolean; error?: string }> {
  try {
    const { data: authData } = await supabase.auth.getUser();
    const userId = authData?.user?.id;
    if (!userId) throw new Error('Not authenticated');

    const { data, error } = await supabase.rpc('cancel_yuyu_order', {
      p_user_id:  userId,
      p_order_id: orderId,
    });
    if (error) throw error;
    return data as { success: boolean; error?: string };
  } catch (e: unknown) {
    return { success: false, error: e instanceof Error ? e.message : 'Unknown error' };
  }
}

// ─── Withdrawal limits ────────────────────────────────────────────────────────

export async function getUserWithdrawalLimits(): Promise<WithdrawalLimits> {
  try {
    const { data: authData } = await supabase.auth.getUser();
    const userId = authData?.user?.id;
    if (!userId) throw new Error('Not authenticated');

    const { data, error } = await supabase.rpc('get_user_withdrawal_limits', { p_user_id: userId });
    if (error || !data) throw error || new Error('no data');

    return {
      treasury_mode:        (data.treasury_mode as 'normal' | 'emergency' | 'critical') ?? 'normal',
      daily_limit_usd:      Number(data.daily_limit_usd      ?? YUYU_DAILY_LIMIT),
      weekly_limit_usd:     Number(data.weekly_limit_usd     ?? YUYU_WEEKLY_LIMIT),
      max_yuyu_per_tx:      Number(data.max_yuyu_per_tx      ?? YUYU_MAX_PER_TX),
      min_yuyu_to_sell:     Number(data.min_yuyu_to_sell     ?? YUYU_MIN_TO_SELL),
      withdrawn_today_usd:  Number(data.withdrawn_today_usd  ?? 0),
      withdrawn_week_usd:   Number(data.withdrawn_week_usd   ?? 0),
      remaining_daily_usd:  Number(data.remaining_daily_usd  ?? YUYU_DAILY_LIMIT),
      remaining_weekly_usd: Number(data.remaining_weekly_usd ?? YUYU_WEEKLY_LIMIT),
    };
  } catch {
    return {
      treasury_mode:        'normal',
      daily_limit_usd:      YUYU_DAILY_LIMIT,
      weekly_limit_usd:     YUYU_WEEKLY_LIMIT,
      max_yuyu_per_tx:      YUYU_MAX_PER_TX,
      min_yuyu_to_sell:     YUYU_MIN_TO_SELL,
      withdrawn_today_usd:  0,
      withdrawn_week_usd:   0,
      remaining_daily_usd:  YUYU_DAILY_LIMIT,
      remaining_weekly_usd: YUYU_WEEKLY_LIMIT,
    };
  }
}

// ─── Buy / Sell helpers ───────────────────────────────────────────────────────


/** Never surface "market closed / paused" wording — Caakus is a live engagement economy. */
function friendlyMarketError(error: any): Error {
  const raw = String(error?.message ?? error ?? '');
  if (/paus|closed|temporarily|maintenance|trading/i.test(raw)) {
    return new Error('Community activity peak. Synchronizing live rewards…');
  }
  return new Error(raw || 'Something went wrong. Please retry.');
}

/** Buy YUYU using existing USD wallet balance. Fee: 3%. */
export async function buyYuyuWithWallet(usdAmount: number) {
  const { data: authData } = await supabase.auth.getUser();
  const userId = authData?.user?.id;
  if (!userId) throw new Error('Not authenticated');

  const { data, error } = await supabase.rpc('buy_yuyu_at_market_price', {
    p_user_id:    userId,
    p_usd_amount: usdAmount,
  });

  if (error) throw friendlyMarketError(error);
  return data;
}

/** Sell YUYU for USD wallet credit. Fee: 2% withdrawal fee. */
export async function sellYuyu(yuyuAmount: number) {
  const { data: authData } = await supabase.auth.getUser();
  const userId = authData?.user?.id;
  if (!userId) throw new Error('Not authenticated');

  const { data, error } = await supabase.rpc('sell_yuyu_at_market_price', {
    p_user_id:     userId,
    p_yuyu_amount: yuyuAmount,
  });

  if (error) throw friendlyMarketError(error);
  return data;
}

/** Create a Dodo checkout to buy YUYU with a card. */
export async function createInvestmentCheckout(usdAmount: number): Promise<{ url: string; priceAtCheckout: number; estimatedYuyu: number }> {
  const origin = typeof window !== 'undefined' ? window.location.origin : '';
  const successUrl = `${origin || 'https://caakus.com'}/?yuyu_buy=success`;
  const cancelUrl = `${origin || 'https://caakus.com'}/?yuyu_buy=cancel`;

  const data = await api.post('createYuyuInvestmentCheckout', {
    usdAmount,
    successUrl,
    cancelUrl,
  });

  const url = data?.url ?? data?.checkout_url;
  if (!url) {
    const errMsg = data?.error || data?.dodo?.message || data?.dodo?.error || 'No checkout URL returned';
    throw new Error(typeof errMsg === 'string' ? errMsg : JSON.stringify(errMsg));
  }

  return {
    url,
    priceAtCheckout: data?.priceAtCheckout ?? 0.01,
    estimatedYuyu: data?.estimatedYuyu ?? 0,
  };
}
