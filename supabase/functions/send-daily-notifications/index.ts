import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

// Environment variables
const SUPABASE_URL = Deno.env.get('SUPABASE_URL')
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')
const APP_URL = Deno.env.get('APP_URL') || 'https://caakus.com'

// CORS headers
const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

// Load notification config
// CRON: Run twice daily (e.g. 9am and 6pm UTC) so active users get 2 messages per day.
// Example: 0 9,18 * * * (9am and 6pm UTC)
const notificationConfig = {
    reEngagementNotifications: {
        enabled: true,
        scheduleTime: "09:00:00",
        timezone: "America/New_York",
        inactivityThresholdHours: 24,
        campaigns: [
            {
                id: "inactive_8h",
                name: "8-Hour Inactive Reminder",
                enabled: true,
                targetInactiveHours: 8,
                messages: [
                    {
                        title: "👋 Hey, we miss you!",
                        body: "Come back and earn more YUYU tokens! Your friends are waiting.",
                        data: { app_url: APP_URL, campaign_id: "inactive_8h" }
                    },
                    {
                        title: "🎁 Don't miss out!",
                        body: "Log in now to claim your daily YUYU bonus and keep your streak alive!",
                        data: { app_url: APP_URL, campaign_id: "inactive_8h" }
                    }
                ]
            },
            {
                id: "inactive_12h",
                name: "12-Hour Inactive Reminder",
                enabled: true,
                targetInactiveHours: 12,
                messages: [
                    {
                        title: "🔥 Your streak is waiting!",
                        body: "Jump back in and keep your activity streak going. Earn YUYU today!",
                        data: { app_url: APP_URL, campaign_id: "inactive_12h" }
                    },
                    {
                        title: "💎 New opportunities await",
                        body: "Your friends are active. Join them and earn more YUYU!",
                        data: { app_url: `${APP_URL}/`, campaign_id: "inactive_12h" }
                    }
                ]
            },
            {
                id: "active_user",
                name: "Active User - Daily (2 per day)",
                enabled: true,
                targetActiveHours: 24,
                maxPerDay: 2,
                messages: [
                    {
                        title: "☀️ Good morning!",
                        body: "Start your day by earning YUYU. Your friends are waiting!",
                        data: { app_url: APP_URL, campaign_id: "active_user" }
                    },
                    {
                        title: "🌟 Daily challenge awaits",
                        body: "Climb the leaderboard today. Every YUYU counts!",
                        data: { app_url: `${APP_URL}/`, campaign_id: "active_user" }
                    },
                    {
                        title: "🌙 Evening check-in",
                        body: "Don't forget to earn YUYU today. Your streak depends on it!",
                        data: { app_url: APP_URL, campaign_id: "active_user" }
                    },
                    {
                        title: "💪 One more session?",
                        body: "A quick visit could boost your YUYU balance. Your friends are online!",
                        data: { app_url: `${APP_URL}/`, campaign_id: "active_user" }
                    }
                ]
            },
            {
                id: "leaderboard_spotlight",
                name: "Hall of Fame Spotlight",
                enabled: true,
                targetInactiveHours: 24,
                messages: [
                    {
                        title: "🏆 Hall of Fame Update",
                        body: "{{leader_name}} is leading with {{leader_amount}} in gifts this week. Join the leaderboard!",
                        data: {
                            app_url: `${APP_URL}/`,
                            campaign_id: "leaderboard_spotlight"
                        }
                    }
                ]
            },
            {
                id: "premium_gift_showcase",
                name: "Luxury Gift Showcase",
                enabled: true,
                targetInactiveHours: 24,
                messages: [
                    {
                        title: "💎 Prestige Gifts Trending",
                        body: "Eternal Legend and Cosmic Sovereignty are trending. Send a premium gift to rise in rank.",
                        data: {
                            app_url: `${APP_URL}/`,
                            campaign_id: "premium_gift_showcase"
                        }
                    }
                ]
            },
            {
                id: "daily_reminder",
                name: "Daily Activity Reminder",
                enabled: true,
                targetInactiveHours: 24,
                messages: [
                    {
                        title: "👋 We miss you!",
                        body: "Come back and earn more YUYU tokens! Your friends are waiting.",
                        data: {
                            app_url: APP_URL,
                            campaign_id: "daily_reminder"
                        }
                    },
                    {
                        title: "🎁 Daily bonus waiting!",
                        body: "Log in now to claim your daily YUYU bonus!",
                        data: {
                            app_url: APP_URL,
                            campaign_id: "daily_reminder"
                        }
                    },
                    {
                        title: "🔥 Keep your streak alive!",
                        body: "Don't break your activity streak! Come back today.",
                        data: {
                            app_url: APP_URL,
                            campaign_id: "daily_reminder"
                        }
                    }
                ]
            },
            {
                id: "weekly_summary",
                name: "Weekly Activity Summary",
                enabled: true,
                targetInactiveHours: 168,
                messages: [
                    {
                        title: "📊 Your Weekly Summary",
                        body: "See how much YUYU you earned this week and climb the leaderboard!",
                        data: {
                            app_url: `${APP_URL}/`,
                            campaign_id: "weekly_summary"
                        }
                    }
                ]
            },
            {
                id: "friend_activity",
                name: "Friend Activity Alert",
                enabled: true,
                targetInactiveHours: 48,
                messages: [
                    {
                        title: "👥 Your friends are active!",
                        body: "{{friend_count}} friends are online now. Join them!",
                        data: {
                            app_url: `${APP_URL}/`,
                            campaign_id: "friend_activity"
                        }
                    }
                ]
            },
            {
                id: "yuyu_milestone",
                name: "YUYU Milestone Reminder",
                enabled: true,
                targetInactiveHours: 72,
                messages: [
                    {
                        title: "🏆 You're so close!",
                        body: "Just {{points_needed}} more YUYU to reach your next milestone!",
                        data: {
                            app_url: APP_URL,
                            campaign_id: "yuyu_milestone"
                        }
                    }
                ]
            },
            {
                id: "referral_reminder",
                name: "Referral Bonus Reminder",
                enabled: true,
                targetInactiveHours: 120,
                messages: [
                    {
                        title: "💰 Earn 100 YUYU per referral!",
                        body: "Share your referral code and earn rewards for each friend who joins.",
                        data: {
                            app_url: `${APP_URL}/`,
                            campaign_id: "referral_reminder"
                        }
                    }
                ]
            }
        ]
    },
    notificationLimits: {
        maxNotificationsPerDay: 8,
        minHoursBetweenNotifications: 2,
        quietHoursStart: "22:00:00",
        quietHoursEnd: "08:00:00"
    }
}

// Get random message from campaign
function getRandomMessage(campaign: any) {
    const messages = campaign.messages
    return messages[Math.floor(Math.random() * messages.length)]
}

// Replace template variables in message
function replacePlaceholders(text: string, userData: any) {
    return text
        .replace('{{friend_count}}', userData.friend_count || 0)
        .replace('{{points_needed}}', userData.points_needed || 100)
        .replace('{{username}}', userData.name || 'there')
        .replace('{{leader_name}}', userData.leader_name || 'A donor')
        .replace('{{leader_amount}}', userData.leader_amount || '$0')
}

// Check if user is in quiet hours
function isInQuietHours(timezone: string): boolean {
    const now = new Date()
    const hour = now.getHours()
    const quietStart = parseInt(notificationConfig.notificationLimits.quietHoursStart.split(':')[0])
    const quietEnd = parseInt(notificationConfig.notificationLimits.quietHoursEnd.split(':')[0])

    if (quietStart > quietEnd) {
        // Quiet hours span midnight (e.g., 22:00 to 08:00)
        return hour >= quietStart || hour < quietEnd
    } else {
        return hour >= quietStart && hour < quietEnd
    }
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

        console.log('[send-daily-notifications] Starting daily notification job...')

        if (!notificationConfig.reEngagementNotifications.enabled) {
            console.log('[send-daily-notifications] Re-engagement notifications are disabled in config')
            return new Response(JSON.stringify({
                success: true,
                message: 'Re-engagement notifications disabled',
                sent: 0
            }), {
                status: 200,
                headers: { ...corsHeaders, 'Content-Type': 'application/json' }
            })
        }

        // Check if we're in quiet hours
        if (isInQuietHours(notificationConfig.reEngagementNotifications.timezone)) {
            console.log('[send-daily-notifications] Currently in quiet hours, skipping')
            return new Response(JSON.stringify({
                success: true,
                message: 'In quiet hours',
                sent: 0
            }), {
                status: 200,
                headers: { ...corsHeaders, 'Content-Type': 'application/json' }
            })
        }

        let totalSent = 0
        const results: any[] = []

        // Fetch leaderboard leader (weekly)
        let leaderName = 'A donor'
        let leaderAmount = '$0'
        try {
            const { data: leaders } = await supabase.rpc('get_weekly_top_donors', { p_limit: 1 })
            const top = leaders?.[0]
            if (top?.name) {
                leaderName = top.name
            }
            if (top?.total_amount !== undefined) {
                const amount = Number(top.total_amount || 0)
                leaderAmount = new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(amount)
            }
        } catch (err) {
            console.log('[send-daily-notifications] Leaderboard lookup failed:', err)
        }

        // Process each campaign
        for (const campaign of notificationConfig.reEngagementNotifications.campaigns) {
            if (!campaign.enabled) {
                console.log(`[send-daily-notifications] Campaign ${campaign.id} is disabled, skipping`)
                continue
            }

            console.log(`[send-daily-notifications] Processing campaign: ${campaign.name}`)

            // Get users for this campaign (inactive OR active based on campaign type)
            let usersQuery = supabase
                .from('users')
                .select('id, name, email, fcm_token, last_active_at, yuyu_score')
                .not('fcm_token', 'is', null)

            if (campaign.targetActiveHours) {
                // Active users: last_active_at within last X hours
                const activeSince = new Date(Date.now() - campaign.targetActiveHours * 60 * 60 * 1000).toISOString()
                usersQuery = usersQuery.gte('last_active_at', activeSince)
            } else {
                // Inactive users: last_active_at older than X hours
                const inactiveSince = new Date(Date.now() - (campaign.targetInactiveHours || 24) * 60 * 60 * 1000).toISOString()
                usersQuery = usersQuery.lt('last_active_at', inactiveSince)
            }

            const { data: campaignUsers, error: usersError } = await usersQuery

            if (usersError) {
                console.error(`[send-daily-notifications] Error fetching users for campaign ${campaign.id}:`, usersError)
                continue
            }

            console.log(`[send-daily-notifications] Found ${campaignUsers?.length || 0} users for campaign ${campaign.id}`)

            // Send notifications to users
            for (const user of campaignUsers || []) {
                try {
                    // Check notification limits (last 24h for rate limiting)
                    const since = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString()
                    const { data: recentNotifications } = await supabase
                        .from('notifications')
                        .select('created_at')
                        .eq('user_id', user.id)
                        .gte('created_at', since)

                    // For active user campaign: enforce max 2 per day
                    const maxPerDay = campaign.maxPerDay ?? notificationConfig.notificationLimits.maxNotificationsPerDay
                    if (campaign.targetActiveHours && maxPerDay <= 2) {
                        const todayStart = new Date()
                        todayStart.setUTCHours(0, 0, 0, 0)
                        const todayCount = (recentNotifications || []).filter(
                            (n: any) => new Date(n.created_at) >= todayStart
                        ).length
                        if (todayCount >= maxPerDay) continue
                    }

                    // Enforce minimum hours between notifications
                    if (recentNotifications && recentNotifications.length > 0) {
                        const latest = recentNotifications
                            .map((n: any) => new Date(n.created_at).getTime())
                            .sort((a, b) => b - a)[0]
                        const minMs = notificationConfig.notificationLimits.minHoursBetweenNotifications * 60 * 60 * 1000
                        if (Date.now() - latest < minMs) {
                            continue
                        }
                    }

                    // Get random message from campaign
                    const messageTemplate = getRandomMessage(campaign)

                    // Calculate user-specific data
                    const { data: friendData } = await supabase
                        .from('friend_requests')
                        .select('id')
                        .or(`from_user_id.eq.${user.id},to_user_id.eq.${user.id}`)
                        .eq('status', 'accepted')

                    const nextMilestone = Math.ceil(user.yuyu_score / 100) * 100
                    const pointsNeeded = nextMilestone - user.yuyu_score

                    const userData = {
                        name: user.name,
                        friend_count: friendData?.length || 0,
                        points_needed: pointsNeeded,
                        leader_name: leaderName,
                        leader_amount: leaderAmount
                    }

                    // Replace placeholders in message
                    const title = replacePlaceholders(messageTemplate.title, userData)
                    const body = replacePlaceholders(messageTemplate.body, userData)

                    // Send push notification
                    const { data: pushResponse, error: pushError } = await supabase.functions.invoke('send-push-notification', {
                        body: {
                            user_id: user.id,
                            title,
                            body,
                            data: {
                                ...messageTemplate.data,
                                notification_type: 're_engagement',
                                campaign_id: campaign.id
                            },
                            notification_type: campaign.id
                        }
                    })

                    if (pushError) {
                        console.error(`[send-daily-notifications] Error sending to user ${user.id}:`, pushError)
                        results.push({
                            user_id: user.id,
                            campaign: campaign.id,
                            success: false,
                            error: pushError.message
                        })
                    } else {
                        console.log(`[send-daily-notifications] Successfully sent to user ${user.id}`)
                        totalSent++
                        results.push({
                            user_id: user.id,
                            campaign: campaign.id,
                            success: true
                        })
                    }

                    // Small delay to avoid rate limiting
                    await new Promise(resolve => setTimeout(resolve, 100))

                } catch (error) {
                    console.error(`[send-daily-notifications] Error processing user ${user.id}:`, error)
                }
            }
        }

        console.log(`[send-daily-notifications] Job complete. Sent ${totalSent} notifications`)

        return new Response(JSON.stringify({
            success: true,
            sent: totalSent,
            results: results
        }), {
            status: 200,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        })

    } catch (error: unknown) {
        console.error('[send-daily-notifications] Error:', error)

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
