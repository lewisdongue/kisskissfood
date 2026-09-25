import React, { useState, useEffect } from 'react';
import { supabase } from '../config/supabase';
import { Button } from './ui/button';
import { useAuth } from '../hooks/useAuth';

export const AuthDebugComponent: React.FC = () => {
    const { user } = useAuth();
    const [debugInfo, setDebugInfo] = useState<Record<string, unknown>>({});
    const [testResults, setTestResults] = useState<Record<string, unknown>>({});

    const runAuthTests = async () => {
        const results: Record<string, unknown> = {};

        console.log('🔍 Starting authentication debug tests...');

        try {
            // Test 1: Check environment variables
            results.envVars = {
                VITE_SUPABASE_URL: import.meta.env.VITE_SUPABASE_URL,
                VITE_SUPABASE_ANON_KEY: import.meta.env.VITE_SUPABASE_ANON_KEY ? 'Present' : 'Missing',
                url: import.meta.env.VITE_SUPABASE_URL || 'MISSING',
                key: import.meta.env.VITE_SUPABASE_ANON_KEY ? `${import.meta.env.VITE_SUPABASE_ANON_KEY.substring(0, 20)}...` : 'MISSING'
            };

            // Test 2: Check auth session
            const { data: { session }, error: sessionError } = await supabase.auth.getSession();
            results.session = {
                hasSession: !!session,
                sessionError: sessionError?.message || null,
                userId: session?.user?.id || null,
                userEmail: session?.user?.email || null,
                accessToken: session?.access_token ? `${session.access_token.substring(0, 20)}...` : null
            };

            // Test 3: Check current user
            const { data: { user: currentUser }, error: userError } = await supabase.auth.getUser();
            results.currentUser = {
                hasUser: !!currentUser,
                userError: userError?.message || null,
                userId: currentUser?.id || null,
                userEmail: currentUser?.email || null
            };

            // Test 4: Test basic database connection
            const { data: testData, error: dbError } = await supabase
                .from('users')
                .select('id')
                .limit(1);

            results.dbConnection = {
                success: !dbError,
                error: dbError ? {
                    code: dbError.code,
                    message: dbError.message,
                    details: dbError.details,
                    hint: dbError.hint
                } : null,
                count: testData?.length || 0
            };

            // Test 5: Test secrets table access - try simple SELECT first
            const { data: secretsData, error: secretsError } = await supabase
                .from('secrets')
                .select('id, status')
                .limit(1);

            results.secretsTable = {
                success: !secretsError,
                error: secretsError ? {
                    code: secretsError.code,
                    message: secretsError.message,
                    details: secretsError.details,
                    hint: secretsError.hint
                } : null,
                data: secretsData || null
            };

            // Test 5a: Check RLS policies on secrets table
            try {
                const { data: policyData, error: policyError } = await supabase
                    .rpc('exec_sql', {
                        sql_query: `SELECT policyname, cmd, roles, qual, with_check FROM pg_policies WHERE tablename = 'secrets' AND schemaname = 'public' ORDER BY policyname;`
                    });

                results.secretsPolicies = {
                    success: !policyError,
                    error: policyError?.message || null,
                    policies: policyData || null
                };
            } catch {
                results.secretsPolicies = {
                    success: false,
                    error: 'Cannot check policies - might need service role key',
                    policies: null
                };
            }

            // Test 5b: Try different SELECT approaches on secrets
            const selectTests = [];

            // Test approved secrets only
            const { data: approvedSecrets, error: approvedError } = await supabase
                .from('secrets')
                .select('*')
                .eq('status', 'approved')
                .limit(5);

            selectTests.push({
                test: 'approved_secrets_only',
                success: !approvedError,
                error: approvedError ? {
                    code: approvedError.code,
                    message: approvedError.message,
                    details: approvedError.details
                } : null,
                count: approvedSecrets?.length || 0
            });

            // Test all secrets (should fail if RLS blocks it)
            const { data: allSecrets, error: allError } = await supabase
                .from('secrets')
                .select('*')
                .limit(5);

            selectTests.push({
                test: 'all_secrets',
                success: !allError,
                error: allError ? {
                    code: allError.code,
                    message: allError.message,
                    details: allError.details
                } : null,
                count: allSecrets?.length || 0
            });

            results.secretsSelectTests = selectTests;

            // Test 6: Check if user exists in users table
            if (currentUser) {
                const { data: userRecord, error: userError } = await supabase
                    .from('users')
                    .select('*')
                    .eq('id', currentUser.id)
                    .single();

                results.userInDatabase = {
                    exists: !!userRecord,
                    error: userError?.message || null,
                    userData: userRecord || null
                };
            }

            // Test 7: Try to insert a test secret (if authenticated)
            if (currentUser) {
                const testSecretData = {
                    content: 'This is a test secret for debugging authentication',
                    author_id: null, // Anonymous
                    author_pseudonym: 'Debug User',
                    is_anonymous: true,
                    status: 'pending'
                };

                console.log('Attempting to insert test secret:', testSecretData);

                const { data: insertData, error: insertError } = await supabase
                    .from('secrets')
                    .insert(testSecretData)
                    .select()
                    .single();

                results.testInsert = {
                    success: !insertError,
                    error: insertError ? {
                        code: insertError.code,
                        message: insertError.message,
                        details: insertError.details,
                        hint: insertError.hint
                    } : null,
                    data: insertData || null
                };

                // Clean up test record if successful
                if (insertData) {
                    await supabase
                        .from('secrets')
                        .delete()
                        .eq('id', insertData.id);
                    console.log('✅ Test record cleaned up');
                }

                // Test 8: Try RPC call to test auth context
                try {
                    const { data: authTest, error: authTestError } = await supabase
                        .rpc('exec_sql', {
                            sql_query: 'SELECT auth.uid() as current_auth_uid;'
                        });

                    results.authContextTest = {
                        success: !authTestError,
                        error: authTestError?.message || null,
                        authUid: authTest?.[0]?.current_auth_uid || null
                    };
                } catch {
                    results.authContextTest = {
                        success: false,
                        error: 'Cannot test auth context - RPC not available',
                        authUid: null
                    };
                }
            } else {
                results.testInsert = {
                    success: false,
                    error: 'No authenticated user for test insert',
                    data: null
                };

                results.userInDatabase = {
                    exists: false,
                    error: 'No authenticated user to check',
                    userData: null
                };
            }

        } catch (error) {
            console.error('Debug test error:', error);
            results.error = error;
        }

        console.log('🔍 Debug results:', results);
        setTestResults(results);
    };

    useEffect(() => {
        setDebugInfo({
            hookUser: user,
            timestamp: new Date().toISOString()
        });
    }, [user]);

    return (
        <div className="p-6 bg-gray-100 dark:bg-gray-800 rounded-lg">
            <h3 className="text-lg font-bold mb-4">🔍 Authentication Debug Panel</h3>

            <div className="space-y-4">
                <div>
                    <h4 className="font-semibold mb-2">Current State:</h4>
                    <pre className="bg-white dark:bg-gray-900 p-3 rounded text-xs overflow-auto">
                        {JSON.stringify(debugInfo, null, 2)}
                    </pre>
                </div>

                <Button onClick={runAuthTests} className="mb-4">
                    Run Authentication Tests
                </Button>

                {Object.keys(testResults).length > 0 && (
                    <div>
                        <h4 className="font-semibold mb-2">Test Results:</h4>
                        <pre className="bg-white dark:bg-gray-900 p-3 rounded text-xs overflow-auto max-h-96">
                            {JSON.stringify(testResults, null, 2)}
                        </pre>
                    </div>
                )}

                <div className="mt-4 text-sm">
                    <p><strong>Instructions:</strong></p>
                    <ol className="list-decimal list-inside space-y-1">
                        <li>Make sure you're logged in</li>
                        <li>Click "Run Authentication Tests"</li>
                        <li>Check the console for detailed logs</li>
                        <li>Look for any errors in the test results</li>
                    </ol>
                </div>
            </div>
        </div>
    );
};

export default AuthDebugComponent;