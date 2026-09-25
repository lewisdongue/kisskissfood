import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

// Environment variables
const SUPABASE_URL = Deno.env.get('SUPABASE_URL')
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')
const FIREBASE_PROJECT_ID = Deno.env.get('FIREBASE_PROJECT_ID') || 'caakus-44d54'
const FIREBASE_SERVICE_ACCOUNT_KEY = Deno.env.get('FIREBASE_SERVICE_ACCOUNT_KEY')
const APP_URL = Deno.env.get('APP_URL') || 'https://caakus.com'

// CORS headers
const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

// Generate access token for FCM
async function getAccessToken() {
    if (!FIREBASE_SERVICE_ACCOUNT_KEY) {
        throw new Error('FIREBASE_SERVICE_ACCOUNT_KEY not configured')
    }

    const serviceAccount = JSON.parse(FIREBASE_SERVICE_ACCOUNT_KEY)

    const jwtHeader = {
        alg: 'RS256',
        typ: 'JWT'
    }

    const now = Math.floor(Date.now() / 1000)
    const jwtPayload = {
        iss: serviceAccount.client_email,
        scope: 'https://www.googleapis.com/auth/firebase.messaging',
        aud: 'https://oauth2.googleapis.com/token',
        exp: now + 3600,
        iat: now
    }

    // Create JWT
    const encoder = new TextEncoder()
    const headerB64 = btoa(JSON.stringify(jwtHeader))
    const payloadB64 = btoa(JSON.stringify(jwtPayload))
    const message = `${headerB64}.${payloadB64}`

    // Sign JWT
    // Private keys stored as Supabase secrets encode newlines as literal \n (two chars).
    // We must strip both real newlines (\n) and literal backslash-n sequences,
    // as well as the PEM header/footer, before base64-decoding.
    const cleanedKey = serviceAccount.private_key
        .replace(/-----BEGIN PRIVATE KEY-----/g, '')
        .replace(/-----END PRIVATE KEY-----/g, '')
        .replace(/\\n/g, '')   // literal \n from JSON-encoded secret
        .replace(/\n/g, '')    // real newline characters
        .replace(/\r/g, '')    // carriage returns
        .replace(/\s/g, '')    // any remaining whitespace
    const key = await crypto.subtle.importKey(
        'pkcs8',
        str2ab(atob(cleanedKey)),
        {
            name: 'RSASSA-PKCS1-v1_5',
            hash: 'SHA-256'
        },
        false,
        ['sign']
    )

    const signature = await crypto.subtle.sign('RSASSA-PKCS1-v1_5', key, encoder.encode(message))
    const signatureB64 = btoa(String.fromCharCode(...new Uint8Array(signature)))
    const jwt = `${message}.${signatureB64}`

    // Exchange JWT for access token
    const tokenResponse = await fetch('https://oauth2.googleapis.com/token', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded'
        },
        body: new URLSearchParams({
            grant_type: 'urn:ietf:params:oauth:grant-type:jwt-bearer',
            assertion: jwt
        })
    })

    const tokenData = await tokenResponse.json()
    if (!tokenResponse.ok) {
        throw new Error(`Failed to get access token: ${tokenData.error}`)
    }

    return tokenData.access_token
}

// Helper function to convert string to ArrayBuffer
function str2ab(str: string) {
    const buf = new ArrayBuffer(str.length)
    const bufView = new Uint8Array(buf)
    for (let i = 0; i < str.length; i++) {
        bufView[i] = str.charCodeAt(i)
    }
    return buf
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

        // Parse request
        const { user_id, title, body, data, notification_type } = await req.json()

        console.log('Push notification request:', { user_id, title, body, notification_type })

        // Validate required fields
        if (!user_id || !title || !body) {
            return new Response(JSON.stringify({
                error: 'Missing required fields: user_id, title, body'
            }), {
                status: 400,
                headers: { ...corsHeaders, 'Content-Type': 'application/json' }
            })
        }

        // Get user's FCM token
        console.log('Querying for user_id:', user_id, 'type:', typeof user_id);

        const { data: userData, error: userError } = await supabase
            .from('users')
            .select('id, fcm_token, email')
            .eq('id', user_id)
            .single()

        console.log('User query result:', { userData, userError, user_id })

        if (userError) {
            console.log('User error details:', userError);
            return new Response(JSON.stringify({
                error: 'Database error fetching user data',
                details: { userError: userError.message, user_id, code: userError.code }
            }), {
                status: 500,
                headers: { ...corsHeaders, 'Content-Type': 'application/json' }
            })
        }

        if (!userData) {
            console.log('No user data found for user_id:', user_id);
            return new Response(JSON.stringify({
                error: 'User not found in database',
                details: { user_id }
            }), {
                status: 404,
                headers: { ...corsHeaders, 'Content-Type': 'application/json' }
            })
        }

        if (!userData.fcm_token) {
            return new Response(JSON.stringify({
                error: 'User has no FCM token - push notifications not available'
            }), {
                status: 400,
                headers: { ...corsHeaders, 'Content-Type': 'application/json' }
            })
        }

        // For now, assume push notifications are enabled
        // TODO: Add notification_preferences column to users table for granular control

        // Get access token for FCM
        const accessToken = await getAccessToken()

        // FCM data values MUST be strings — coerce all values
        const stringData: Record<string, string> = {}
        if (data) {
            for (const [k, v] of Object.entries(data)) {
                stringData[k] = String(v ?? '')
            }
        }
        if (notification_type) {
            stringData.type = String(notification_type)
        }

        // Prepare FCM message
        const fcmMessage = {
            message: {
                token: userData.fcm_token,
                notification: {
                    title,
                    body
                },
                data: stringData,
                webpush: {
                    headers: {
                        Urgency: 'high'
                    },
                    notification: {
                        icon: '/logo.png',
                        badge: '/logo.png',
                        requireInteraction: false
                    },
                    fcm_options: {
                        link: data?.app_url || APP_URL
                    }
                },
                // Android-specific settings for better delivery
                android: {
                    priority: 'high',
                    notification: {
                        click_action: data?.app_url || APP_URL,
                        default_sound: true
                    }
                }
            }
        }

        // Send FCM message
        const fcmResponse = await fetch(`https://fcm.googleapis.com/v1/projects/${FIREBASE_PROJECT_ID}/messages:send`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${accessToken}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(fcmMessage)
        })

        const fcmData = await fcmResponse.json()

        if (!fcmResponse.ok) {
            throw new Error(`FCM send failed: ${fcmData.error?.message || 'Unknown error'}`)
        }

        // Log the notification
        const { error: logError } = await supabase
            .from('notifications')
            .insert({
                user_id,
                type: notification_type || 'system',
                title,
                message: body,
                data: data || {},
                sent_at: new Date().toISOString(),
                delivery_status: 'sent',
                delivery_method: 'push'
            })

        if (logError) {
            console.error('Failed to log notification:', logError)
        }

        return new Response(JSON.stringify({
            success: true,
            message_id: fcmData.name,
            notification_type
        }), {
            status: 200,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        })

    } catch (error: unknown) {
        console.error('Error sending push notification:', error)

        const errorMessage = error instanceof Error ? error.message : 'Internal server error'
        const errorDetails = error instanceof Error ? error.toString() : String(error)

        return new Response(JSON.stringify({
            error: errorMessage,
            details: errorDetails
        }), {
            status: 500,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        })
    }
})