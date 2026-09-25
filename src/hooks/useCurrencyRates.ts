import { useQuery } from '@tanstack/react-query';
import type { CurrencyCode } from '../types';

/**
 * Live exchange rates from USD to other currencies.
 * Uses the free ExchangeRate-API (no API key required).
 * Rates are cached for 10 minutes and auto-refresh every 5 minutes.
 */

interface ExchangeRateResponse {
  rates: Record<string, number>;
}

// Fallback rates in case the API is unreachable (approximate values)
const FALLBACK_RATES: Record<string, number> = {
  USD: 1,
  EUR: 0.92,
  GBP: 0.79,
  NGN: 1550,
  INR: 83.5,
};

const fetchExchangeRates = async (): Promise<Record<string, number>> => {
  // Primary: ExchangeRate-API v4 (free, no key)
  try {
    const res = await fetch('https://api.exchangerate-api.com/v4/latest/USD', {
      signal: AbortSignal.timeout(8000),
    });
    if (res.ok) {
      const data: ExchangeRateResponse = await res.json();
      if (data.rates) return { USD: 1, ...data.rates };
    }
  } catch {
    // fall through to fallback
  }

  // Secondary: Frankfurter API (ECB data, free, no key – may lack NGN)
  try {
    const res = await fetch(
      'https://api.frankfurter.app/latest?from=USD&to=EUR,GBP,INR',
      { signal: AbortSignal.timeout(8000) },
    );
    if (res.ok) {
      const data: ExchangeRateResponse = await res.json();
      if (data.rates) return { USD: 1, ...FALLBACK_RATES, ...data.rates };
    }
  } catch {
    // fall through to fallback
  }

  // Return hardcoded fallback so the UI never breaks
  return { ...FALLBACK_RATES };
};

/**
 * React hook that provides live USD-based exchange rates.
 *
 * @returns `rates` – a map from currency code → rate (1 USD = rate units)
 * @returns `convert(amountUSD, toCurrency)` – helper to convert USD amount
 * @returns `isLoading` / `isError` – standard react-query flags
 */
export const useCurrencyRates = () => {
  const query = useQuery({
    queryKey: ['currency-rates'],
    queryFn: fetchExchangeRates,
    // Rates don't change every second; cache for 10 min, refetch every 5 min
    staleTime: 10 * 60 * 1000,
    refetchInterval: 5 * 60 * 1000,
    // Keep showing previous data while refetching
    placeholderData: (prev) => prev,
    // On error, still return fallback so UI works
    retry: 2,
  });

  const rates = query.data ?? FALLBACK_RATES;

  /** Convert a USD amount to the target currency using live rates */
  const convert = (amountUSD: number, toCurrency: CurrencyCode): number => {
    if (toCurrency === 'USD') return amountUSD;
    const rate = rates[toCurrency];
    if (!rate) return amountUSD; // unknown currency, show USD
    return amountUSD * rate;
  };

  return {
    rates,
    convert,
    isLoading: query.isLoading,
    isError: query.isError,
  };
};
