/**
 * PROCESS NOTIFICATION QUEUE - Supabase Edge Function
 * 
 * This function processes the notification queue and sends push notifications
 * to users based on their preferences and rate limits.
 * 
 * This should be triggered by a cron job (e.g., every 5 minutes).
 */

import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

// Environment variables
const SUPABASE_URL = Deno.env.get('SUPABASE_URL')
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')

// CORS headers
const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
    // Handle CORS preflight requests
    if (req.method === 'OPTIONS') {
        return new Response('ok', { headers: corsHeaders })
    }

    try {
        // Initialize Supabase client with service role
        const supabase = createClient(
            SUPABASE_URL!,
            SUPABASE_SERVICE_ROLE_KEY!,
            {
                auth: {
                    autoRefreshToken: false,
                    persistSession: false
                }
            }
        )

        console.log('[process-notification-queue] Starting queue processing...')

        // Get pending notifications that are ready to send
        const { data: pendingNotifications, error: fetchError } = await supabase
            .from('notification_queue')
            .select('*')
            .eq('status', 'pending')
            .lte('scheduled_for', new Date().toISOString())
            .lt('attempts', 3) // Max 3 attempts
            .limit(100) // Process 100 at a time

        if (fetchError) {
            console.error('[process-notification-queue] Error fetching queue:', fetchError)
            throw fetchError
        }

        if (!pendingNotifications || pendingNotifications.length === 0) {
            console.log('[process-notification-queue] No pending notifications')
            return new Response(JSON.stringify({
                success: true,
                message: 'No pending notifications',
                processed: 0
            }), {
                status: 200,
                headers: { ...corsHeaders, 'Content-Type': 'application/json' }
            })
        }

        console.log(`[process-notification-queue] Found ${pendingNotifications.length} pending notifications`)

        let processed = 0
        let failed = 0
        const results: unknown[] = []

        // Process each notification
        for (const notification of pendingNotifications) {
            try {
                // Mark as processing
                await supabase
                    .from('notification_queue')
                    .update({
                        status: 'processing',
                        last_attempt_at: new Date().toISOString(),
                        attempts: notification.attempts + 1
                    })
                    .eq('id', notification.id)

                // Check if user is in quiet hours
                const { data: quietHoursCheck } = await supabase
                    .rpc('is_in_quiet_hours', { user_uuid: notification.user_id })

                if (quietHoursCheck === true) {
                    console.log(`[process-notification-queue] User ${notification.user_id} is in quiet hours, rescheduling`)

                    // Reschedule for 1 hour later
                    await supabase
                        .from('notification_queue')
                        .update({
                            status: 'pending',
                            scheduled_for: new Date(Date.now() + 3600000).toISOString()
                        })
                        .eq('id', notification.id)

                    continue
                }

                // Check rate limits
                const { data: rateLimitCheck } = await supabase
                    .rpc('check_notification_rate_limit', { user_uuid: notification.user_id })

                if (rateLimitCheck === false) {
                    console.log(`[process-notification-queue] User ${notification.user_id} exceeded rate limit`)

                    // Mark as failed with rate limit error
                    await supabase
                        .from('notification_queue')
                        .update({
                            status: 'failed',
                            error_message: 'Rate limit exceeded'
                        })
                        .eq('id', notification.id)

                    failed++
                    continue
                }

                // Send push notification
                const { error: pushError } = await supabase.functions.invoke('send-push-notification', {
                    body: {
                        user_id: notification.user_id,
                        title: notification.title,
                        body: notification.message,
                        data: notification.data || {},
                        notification_type: notification.type
                    }
                })

                if (pushError) {
                    console.error(`[process-notification-queue] Error sending notification ${notification.id}:`, pushError)

                    // Mark as failed
                    await supabase
                        .from('notification_queue')
                        .update({
                            status: notification.attempts >= 2 ? 'failed' : 'pending',
                            error_message: pushError.message,
                            scheduled_for: notification.attempts >= 2 ? null : new Date(Date.now() + 600000).toISOString() // Retry in 10 minutes
                        })
                        .eq('id', notification.id)

                    failed++
                    results.push({
                        id: notification.id,
                        user_id: notification.user_id,
                        success: false,
                        error: pushError.message
                    })
                } else {
                    console.log(`[process-notification-queue] Successfully sent notification ${notification.id}`)

                    // Mark as sent
                    await supabase
                        .from('notification_queue')
                        .update({
                            status: 'sent',
                            processed_at: new Date().toISOString()
                        })
                        .eq('id', notification.id)

                    processed++
                    results.push({
                        id: notification.id,
                        user_id: notification.user_id,
                        success: true
                    })
                }

                // Small delay to avoid overwhelming the system
                await new Promise(resolve => setTimeout(resolve, 100))

            } catch (error) {
                console.error(`[process-notification-queue] Error processing notification ${notification.id}:`, error)
                failed++
            }
        }

        console.log(`[process-notification-queue] Processing complete. Processed: ${processed}, Failed: ${failed}`)

        return new Response(JSON.stringify({
            success: true,
            processed,
            failed,
            total: pendingNotifications.length,
            results: results.slice(0, 10) // Return first 10 results for debugging
        }), {
            status: 200,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        })

    } catch (error: unknown) {
        console.error('[process-notification-queue] Fatal error:', error)

        const errorMessage = error instanceof Error ? error.message : 'Internal server error'

        return new Response(JSON.stringify({
            error: errorMessage,
            success: false
        }), {
            status: 500,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        })
    }
})
