import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const SUPABASE_URL = Deno.env.get('SUPABASE_URL')
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')
const APP_URL = Deno.env.get('APP_URL') || 'https://caakus.com'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

const config = {
  scheduleHourUtc: 22, // 10 PM UTC by default
  maxPerRun: 500,
}

function getIsoDate(date: Date) {
  return date.toISOString().slice(0, 10)
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const supabase = createClient(
      SUPABASE_URL!,
      SUPABASE_SERVICE_ROLE_KEY!,
      {
        auth: { autoRefreshToken: false, persistSession: false }
      }
    )

    const now = new Date()
    if (now.getUTCHours() !== config.scheduleHourUtc) {
      return new Response(JSON.stringify({
        success: true,
        message: 'Not scheduled hour',
        sent: 0
      }), {
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      })
    }

    const today = getIsoDate(now)
    const yesterday = getIsoDate(new Date(now.getTime() - 24 * 60 * 60 * 1000))

    const { data: users, error } = await supabase
      .from('users')
      .select('id, name, fcm_token, streak_count, last_streak_date, last_streak_risk_notified_at')
      .not('fcm_token', 'is', null)
      .gt('streak_count', 0)
      .eq('last_streak_date', yesterday)
      .or(`last_streak_risk_notified_at.is.null,last_streak_risk_notified_at.neq.${today}`)
      .limit(config.maxPerRun)

    if (error) throw error
    if (!users || users.length === 0) {
      return new Response(JSON.stringify({
        success: true,
        message: 'No users at risk',
        sent: 0
      }), {
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      })
    }

    let sent = 0

    for (const user of users) {
      try {
        const title = '🔥 Streak at risk!'
        const body = `Don't lose your ${user.streak_count}-day streak. Jump back in before midnight!`

        await supabase.functions.invoke('send-push-notification', {
          body: {
            user_id: user.id,
            title,
            body,
            data: {
              app_url: APP_URL,
              campaign_id: 'streak_at_risk'
            },
            notification_type: 'streak_at_risk'
          }
        })

        await supabase
          .from('users')
          .update({ last_streak_risk_notified_at: today })
          .eq('id', user.id)

        sent += 1
      } catch (sendError) {
        console.error('[send-streak-risk-notifications] failed for user', user.id, sendError)
      }
    }

    return new Response(JSON.stringify({
      success: true,
      message: 'Streak risk notifications processed',
      sent
    }), {
      status: 200,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    })
  } catch (error) {
    console.error('[send-streak-risk-notifications] error', error)
    const errorMessage = error instanceof Error ? error.message : 'Internal server error'
    return new Response(JSON.stringify({
      success: false,
      error: errorMessage
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    })
  }
})

