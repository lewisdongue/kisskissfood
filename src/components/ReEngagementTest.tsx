import React, { useState } from 'react';
import { Card } from './ui/card';
import { Button } from './ui/button';
import { supabase } from '../config/supabase';

interface TestResult {
    test: string;
    status: 'pending' | 'success' | 'warning' | 'error';
    message: string;
    details?: string;
}

export const ReEngagementTest: React.FC = () => {
    const [results, setResults] = useState<TestResult[]>([]);
    const [isRunning, setIsRunning] = useState(false);

    const addResult = (result: TestResult) => {
        setResults(prev => [...prev, result]);
    };

    const updateResult = (index: number, updates: Partial<TestResult>) => {
        setResults(prev => prev.map((r, i) => i === index ? { ...r, ...updates } : r));
    };

    const runTests = async () => {
        setIsRunning(true);
        setResults([]);

        let testIndex = 0;

        // Test 1: Check config file
        addResult({
            test: 'Config File Validation',
            status: 'pending',
            message: 'Checking notification-config.json...'
        });

        try {
            const response = await fetch('/notification-config.json');
            if (!response.ok) throw new Error('Config file not found');

            const config = await response.json();

            // Validate structure
            if (!config.reEngagementNotifications?.campaigns) {
                throw new Error('Invalid config structure');
            }

            updateResult(testIndex, {
                status: 'success',
                message: `✅ Config valid - ${config.reEngagementNotifications.campaigns.length} campaigns found`,
                details: `Max notifications/day: ${config.notificationLimits?.maxNotificationsPerDay || 'N/A'}`
            });
        } catch (error: any) {
            updateResult(testIndex, {
                status: 'error',
                message: '❌ Config file error',
                details: error.message
            });
        }

        testIndex++;

        // Test 2: Check database tables
        addResult({
            test: 'Database Schema',
            status: 'pending',
            message: 'Checking database tables...'
        });

        try {
            // Check if re_engagement_logs table exists
            const logsRes = await supabase
                .from('re_engagement_logs')
                .select('count', { count: 'exact', head: true });

            if ((logsRes as any).error && (logsRes as any).error.code === 'PGRST116') {
                throw new Error('re_engagement_logs table not found - run RE_ENGAGEMENT_SCHEMA.sql');
            }

            // Check if users table has last_active_at column
            const usersRes = await supabase
                .from('users')
                .select('last_active_at')
                .limit(1);

            if ((usersRes as any).error && (usersRes as any).error.message.includes('last_active_at')) {
                throw new Error('last_active_at column missing - run RE_ENGAGEMENT_SCHEMA.sql');
            }

            updateResult(testIndex, {
                status: 'success',
                message: '✅ Database schema ready',
                details: 'All required tables and columns exist'
            });
        } catch (error: any) {
            updateResult(testIndex, {
                status: 'error',
                message: '❌ Database schema error',
                details: error.message
            });
        }

        testIndex++;

        // Test 3: Check edge function
        addResult({
            test: 'Edge Function',
            status: 'pending',
            message: 'Testing edge function connectivity...'
        });

        try {
            const { data, error } = await supabase.functions.invoke('send-daily-notifications', {
                body: { test: true }
            });

            if (error) {
                if (error.message.includes('function') && error.message.includes('not found')) {
                    throw new Error('Edge function not deployed - run: supabase functions deploy send-daily-notifications');
                }
                throw new Error(error.message);
            }

            updateResult(testIndex, {
                status: 'success',
                message: '✅ Edge function deployed and responding',
                details: data?.message || 'Function responded successfully'
            });
        } catch (error: any) {
            updateResult(testIndex, {
                status: 'error',
                message: '❌ Edge function error',
                details: error.message
            });
        }

        testIndex++;

        // Test 4: Check inactive users
        addResult({
            test: 'Inactive Users Query',
            status: 'pending',
            message: 'Checking for inactive users...'
        });

        try {
            const { data, error } = await supabase.rpc('get_inactive_users', {
                inactive_hours: 24,
                max_daily_notifications: 3
            });

            if (error) {
                if (error.message.includes('function') && error.message.includes('not found')) {
                    throw new Error('get_inactive_users function not found - run RE_ENGAGEMENT_SCHEMA.sql');
                }
                throw new Error(error.message);
            }

            updateResult(testIndex, {
                status: 'success',
                message: `✅ Found ${data?.length || 0} inactive users (24h threshold)`,
                details: data?.length > 0 ? `Next user inactive since: ${data[0]?.last_active_at || 'N/A'}` : 'No inactive users found'
            });
        } catch (error: any) {
            updateResult(testIndex, {
                status: 'warning',
                message: '⚠️ Inactive users query issue',
                details: error.message
            });
        }

        testIndex++;

        // Test 5: Check notification preferences
        addResult({
            test: 'Notification Preferences',
            status: 'pending',
            message: 'Checking user notification preferences...'
        });

        try {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) {
                throw new Error('User not authenticated');
            }

            const { data, error } = await supabase
                .from('notification_preferences')
                .select('*')
                .eq('user_id', user.id)
                .single();

            if (error && error.code !== 'PGRST116') {
                throw new Error(error.message);
            }

            if (data) {
                updateResult(testIndex, {
                    status: 'success',
                    message: '✅ Notification preferences configured',
                    details: `Push enabled: ${data.push_enabled}, Email enabled: ${data.email_enabled}`
                });
            } else {
                updateResult(testIndex, {
                    status: 'warning',
                    message: '⚠️ No notification preferences found',
                    details: 'User preferences will be created automatically on first use'
                });
            }
        } catch (error: any) {
            updateResult(testIndex, {
                status: 'warning',
                message: '⚠️ Cannot check preferences',
                details: error.message
            });
        }

        testIndex++;

        // Test 6: Manual notification trigger
        addResult({
            test: 'Manual Notification Test',
            status: 'pending',
            message: 'Testing manual notification trigger...'
        });

        try {
            const { data, error } = await supabase.rpc('trigger_re_engagement_check');

            if (error) {
                if (error.message.includes('function') && error.message.includes('not found')) {
                    throw new Error('trigger_re_engagement_check function not found - run RE_ENGAGEMENT_SCHEMA.sql');
                }
                throw new Error(error.message);
            }

            updateResult(testIndex, {
                status: 'success',
                message: '✅ Manual trigger works',
                details: `Inactive users: 24h=${data?.inactive_users_24h || 0}, 48h=${data?.inactive_users_48h || 0}, 72h=${data?.inactive_users_72h || 0}`
            });
        } catch (error: any) {
            updateResult(testIndex, {
                status: 'warning',
                message: '⚠️ Manual trigger not available',
                details: error.message
            });
        }

        setIsRunning(false);
    };

    const getStatusIcon = (status: TestResult['status']) => {
        switch (status) {
            case 'success': return '✅';
            case 'warning': return '⚠️';
            case 'error': return '❌';
            default: return '⏳';
        }
    };

    const getStatusColor = (status: TestResult['status']) => {
        switch (status) {
            case 'success': return 'text-green-600';
            case 'warning': return 'text-yellow-600';
            case 'error': return 'text-red-600';
            default: return 'text-gray-600';
        }
    };

    return (
        <div className="max-w-4xl mx-auto p-6 space-y-6">
            <div className="flex items-center justify-between">
                <h1 className="text-3xl font-bold">🧪 Re-Engagement System Test</h1>
                <Button
                    onClick={runTests}
                    disabled={isRunning}
                    className="bg-blue-600 hover:bg-blue-700"
                >
                    {isRunning ? '⏳ Running Tests...' : '🚀 Run Tests'}
                </Button>
            </div>

            <Card className="p-6">
                <h2 className="text-xl font-semibold mb-4">Test Results</h2>

                {results.length === 0 && !isRunning && (
                    <p className="text-gray-600">Click "Run Tests" to check your re-engagement notification system.</p>
                )}

                <div className="space-y-4">
                    {results.map((result, index) => (
                        <div
                            key={index}
                            className={`p-4 border rounded-lg ${getStatusColor(result.status)} border-current`}
                        >
                            <div className="flex items-start space-x-3">
                                <span className="text-lg">{getStatusIcon(result.status)}</span>
                                <div className="flex-1">
                                    <h3 className="font-semibold">{result.test}</h3>
                                    <p className="text-sm">{result.message}</p>
                                    {result.details && (
                                        <p className="text-xs mt-1 opacity-75">{result.details}</p>
                                    )}
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </Card>

            <Card className="p-6 bg-blue-50">
                <h3 className="font-bold mb-2">📋 Next Steps</h3>
                <ul className="space-y-2 text-sm">
                    <li>✅ <strong>Fix any errors</strong> shown in the test results</li>
                    <li>🚀 <strong>Deploy edge function:</strong> <code>supabase functions deploy send-daily-notifications</code></li>
                    <li>🗄️ <strong>Run database migration:</strong> Execute <code>RE_ENGAGEMENT_SCHEMA.sql</code> in Supabase SQL Editor</li>
                    <li>⏰ <strong>Set up cron job:</strong> Create daily schedule in Supabase Dashboard → Database → Cron</li>
                    <li>🧪 <strong>Test manually:</strong> Use the manual trigger function to send test notifications</li>
                </ul>
            </Card>

            <Card className="p-6 bg-green-50">
                <h3 className="font-bold mb-2">📖 Documentation</h3>
                <p className="text-sm mb-2">See <code>RE_ENGAGEMENT_GUIDE.md</code> for complete setup instructions and how to edit notifications.</p>
                <p className="text-sm">Edit <code>notification-config.json</code> to customize messages, timing, and campaigns.</p>
            </Card>
        </div>
    );
};
