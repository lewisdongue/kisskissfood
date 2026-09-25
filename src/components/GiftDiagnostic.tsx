import { useState, useEffect } from 'react';
import { supabase, SUPABASE_FUNCTIONS_URL } from '../config/supabase';
import { Button } from './ui/button';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { CheckCircle, XCircle, AlertCircle } from 'lucide-react';

/**
 * GiftDiagnostic Component
 * 
 * Temporary component to diagnose gift feature issues
 * 
 * Usage: Add to your AudioCall or main page temporarily:
 * import { GiftDiagnostic } from './components/GiftDiagnostic';
 * <GiftDiagnostic />
 */

export const GiftDiagnostic = () => {
  const [results, setResults] = useState<Record<string, { status: 'pass' | 'fail' | 'warn', message: string }>>({});
  const [loading, setLoading] = useState(false);

  const runDiagnostics = async () => {
    setLoading(true);
    const checks: Record<string, { status: 'pass' | 'fail' | 'warn', message: string }> = {};

    // Check 1: Environment Variables
    const functionsUrl = SUPABASE_FUNCTIONS_URL;
    const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
    const anonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

    if (!functionsUrl) {
      checks['env_functions_url'] = { status: 'fail', message: `Backend functions URL is unavailable` };
    } else {
      checks['env_functions_url'] = { status: 'pass', message: `Functions URL: ${functionsUrl}` };
    }

    if (!supabaseUrl) {
      checks['env_supabase_url'] = { status: 'fail', message: `VITE_SUPABASE_URL is not set` };
    } else {
      checks['env_supabase_url'] = { status: 'pass', message: `Supabase URL: ${supabaseUrl}` };
    }

    if (!anonKey) {
      checks['env_anon_key'] = { status: 'fail', message: `VITE_SUPABASE_ANON_KEY is not set` };
    } else {
      checks['env_anon_key'] = { status: 'pass', message: `Anon key is set (${anonKey.substring(0, 20)}...)` };
    }

    // Check 2: Authentication
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        checks['auth'] = { status: 'fail', message: 'User not authenticated' };
      } else {
        checks['auth'] = { status: 'pass', message: `Authenticated as ${session.user.id.substring(0, 8)}...` };
      }
    } catch (error: any) {
      checks['auth'] = { status: 'fail', message: `Auth error: ${error.message}` };
    }

    // Check 3: Gifts Table
    try {
      const { error } = await supabase.from('gifts').select('id').limit(1);
      if (error) {
        checks['gifts_table'] = { status: 'fail', message: `Gifts table error: ${error.message}` };
      } else {
        checks['gifts_table'] = { status: 'pass', message: 'Gifts table exists and is accessible' };
      }
    } catch (error: any) {
      checks['gifts_table'] = { status: 'fail', message: `Gifts table error: ${error.message}` };
    }

    // Check 4: sendGift Edge Function
    if (functionsUrl) {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (session) {
          const res = await fetch(`${functionsUrl}/sendGift`, {
            method: 'OPTIONS',
            headers: {
              'Content-Type': 'application/json',
            },
          });
          
          if (res.ok) {
            checks['sendgift_function'] = { status: 'pass', message: 'sendGift function responds to OPTIONS' };
          } else {
            checks['sendgift_function'] = { status: 'warn', message: `sendGift OPTIONS returned ${res.status}` };
          }
        }
      } catch (error: any) {
        checks['sendgift_function'] = { status: 'fail', message: `sendGift function error: ${error.message}` };
      }
    }

    // Check 5: createGiftCheckout Edge Function
    if (functionsUrl) {
      try {
        const res = await fetch(`${functionsUrl}/createGiftCheckout`, {
          method: 'OPTIONS',
          headers: {
            'Content-Type': 'application/json',
          },
        });
        
        if (res.ok) {
          checks['creategiftcheckout_function'] = { status: 'pass', message: 'createGiftCheckout function responds to OPTIONS' };
        } else {
          checks['creategiftcheckout_function'] = { status: 'warn', message: `createGiftCheckout OPTIONS returned ${res.status}` };
        }
      } catch (error: any) {
        checks['creategiftcheckout_function'] = { status: 'fail', message: `createGiftCheckout function error: ${error.message}` };
      }
    }

    // Check 6: User Balance
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (session) {
        const { data, error } = await supabase
          .from('users')
          .select('balance')
          .eq('id', session.user.id)
          .single();
        
        if (error) {
          checks['user_balance'] = { status: 'fail', message: `Balance check error: ${error.message}` };
        } else {
          checks['user_balance'] = { status: 'pass', message: `Balance: $${data?.balance || 0}` };
        }
      }
    } catch (error: any) {
      checks['user_balance'] = { status: 'fail', message: `Balance check error: ${error.message}` };
    }

    // Check 7: Real-time Connection
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (session) {
        const channel = supabase.channel(`gifts:${session.user.id}`);
        
        const subscribed = await new Promise((resolve) => {
          channel.subscribe((status) => {
            if (status === 'SUBSCRIBED') {
              resolve(true);
            } else if (status === 'CHANNEL_ERROR' || status === 'TIMED_OUT') {
              resolve(false);
            }
          });
          
          // Timeout after 5 seconds
          setTimeout(() => resolve(false), 5000);
        });

        await supabase.removeChannel(channel);

        if (subscribed) {
          checks['realtime'] = { status: 'pass', message: 'Real-time subscription successful' };
        } else {
          checks['realtime'] = { status: 'fail', message: 'Real-time subscription failed or timed out' };
        }
      }
    } catch (error: any) {
      checks['realtime'] = { status: 'fail', message: `Real-time error: ${error.message}` };
    }

    setResults(checks);
    setLoading(false);
  };

  useEffect(() => {
    runDiagnostics();
  }, []);

  const getStatusIcon = (status: 'pass' | 'fail' | 'warn') => {
    switch (status) {
      case 'pass':
        return <CheckCircle className="text-green-500" size={20} />;
      case 'fail':
        return <XCircle className="text-red-500" size={20} />;
      case 'warn':
        return <AlertCircle className="text-yellow-500" size={20} />;
    }
  };

  const getStatusBadge = (status: 'pass' | 'fail' | 'warn') => {
    const colors = {
      pass: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300',
      fail: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300',
      warn: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300',
    };
    return <Badge className={colors[status]}>{status.toUpperCase()}</Badge>;
  };

  const overallStatus = Object.values(results).every(r => r.status === 'pass') ? 'pass' :
                        Object.values(results).some(r => r.status === 'fail') ? 'fail' : 'warn';

  return (
    <Card className="w-full max-w-2xl mx-auto my-8">
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span>Gift Feature Diagnostics</span>
          {!loading && getStatusBadge(overallStatus)}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {loading && (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-500 mx-auto"></div>
              <p className="mt-4 text-gray-600 dark:text-gray-400">Running diagnostics...</p>
            </div>
          )}

          {!loading && Object.entries(results).map(([key, result]) => (
            <div key={key} className="flex items-start space-x-3 p-3 rounded-lg bg-gray-50 dark:bg-gray-800">
              <div className="mt-0.5">{getStatusIcon(result.status)}</div>
              <div className="flex-1">
                <p className="font-medium text-sm capitalize">{key.replace(/_/g, ' ')}</p>
                <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">{result.message}</p>
              </div>
            </div>
          ))}

          <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
            <Button onClick={runDiagnostics} disabled={loading} className="w-full">
              Re-run Diagnostics
            </Button>
          </div>

          {overallStatus === 'fail' && (
            <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
              <h4 className="font-semibold text-red-800 dark:text-red-300 mb-2">Issues Detected</h4>
              <ul className="text-sm text-red-700 dark:text-red-400 space-y-1 list-disc list-inside">
                {Object.entries(results)
                  .filter(([_, r]) => r.status === 'fail')
                  .map(([key, result]) => (
                    <li key={key}>{result.message}</li>
                  ))}
              </ul>
              <div className="mt-3 text-sm text-red-700 dark:text-red-400">
                <p className="font-medium">Quick Fixes:</p>
                <ul className="list-disc list-inside mt-1 space-y-1">
                  {!SUPABASE_FUNCTIONS_URL && (
                    <li>Check the canonical backend URL configuration</li>
                  )}
                  {results['auth']?.status === 'fail' && (
                    <li>Make sure you're logged in</li>
                  )}
                  {results['gifts_table']?.status === 'fail' && (
                    <li>Run the SQL in supabase/migrations/create_gifts_table.sql</li>
                  )}
                  {(results['sendgift_function']?.status === 'fail' || results['creategiftcheckout_function']?.status === 'fail') && (
                    <li>Deploy edge functions: supabase functions deploy sendGift && supabase functions deploy createGiftCheckout</li>
                  )}
                </ul>
              </div>
            </div>
          )}

          {overallStatus === 'pass' && (
            <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-4 text-center">
              <p className="text-green-800 dark:text-green-300 font-semibold">✅ All checks passed!</p>
              <p className="text-sm text-green-700 dark:text-green-400 mt-1">The gift feature should be working correctly.</p>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

