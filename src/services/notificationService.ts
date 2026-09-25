import { messaging, onMessage } from '../config/firebase';
import { getFCMTokenWithRetry } from './pushService';
import { supabase, TABLES } from '../config/supabase';

// Notification types - All supported notification types
export type NotificationType =
    | 'yuyu_earned'
    | 'friend_accepted'
    | 'friend_request_received'
    | 'secret_reply'
    | 'referral_bonus'
    | 'referral_signup'
    | 'system_announcement'
    | 're_engagement'
    | 'daily_reminder'
    | 'weekly_summary'
    | 'invite_bonus'
    | 'earnings_update'
    | 'milestone_reached'
    | 'leaderboard_spotlight'
    | 'premium_gift_showcase'
    | 'streak_at_risk';

export interface NotificationData {
    // YUYU related
    amount?: number;
    total_balance?: number;
    balance_usd?: number;
    next_milestone?: number;
    points_to_milestone?: number;
    milestone?: number;

    // Friend related
    friend_id?: string;
    friend_name?: string;
    friend_email?: string;
    request_id?: string;
    friend_count?: number;

    // Referral related
    total_referrals?: number;
    total_earned?: number;
    bonus_amount?: number;
    referral_code?: string;
    new_user_name?: string;

    // General
    app_url?: string;
    campaign_id?: string;
    notification_type?: string;
    donor_name?: string;
    donor_amount?: number;
    leaderboard_rank?: number;

    [key: string]: unknown;
}

export interface NotificationPreferences {
    user_id?: string;

    // Global settings
    email_enabled: boolean;
    push_enabled: boolean;
    in_app_enabled: boolean;

    // YUYU Earnings notifications
    yuyu_earned_email: boolean;
    yuyu_earned_push: boolean;
    yuyu_earned_threshold: number;

    // Friend notifications
    friend_requests_email: boolean;
    friend_requests_push: boolean;
    friend_accepted_email: boolean;
    friend_accepted_push: boolean;

    // Referral notifications
    referral_updates_email: boolean;
    referral_updates_push: boolean;
    referral_bonus_email: boolean;
    referral_bonus_push: boolean;

    // Re-engagement notifications
    re_engagement_enabled: boolean;
    daily_reminders: boolean;
    weekly_summary: boolean;

    // System notifications
    system_announcements_email: boolean;
    system_announcements_push: boolean;

    // Quiet hours (UTC)
    quiet_hours_enabled: boolean;
    quiet_hours_start: string;
    quiet_hours_end: string;

    // Rate limiting
    max_notifications_per_day: number;
    min_hours_between_notifications: number;

    // Timestamps
    created_at?: string;
    updated_at?: string;
}

export class NotificationService {
    private static instance: NotificationService;
    private notificationChannel: BroadcastChannel | null = null;

    private constructor() {
        // Set up broadcast channel for cross-tab notifications (browser only)
        if (typeof window !== 'undefined' && 'BroadcastChannel' in window) {
            this.notificationChannel = new BroadcastChannel('notifications');
            this.notificationChannel.onmessage = (event) => {
                this.handleCrossTabNotification(event.data);
            };
        }
    }


    static getInstance(): NotificationService {
        if (!NotificationService.instance) {
            NotificationService.instance = new NotificationService();
        }
        return NotificationService.instance;
    }

    /**
     * Request browser notification permission
     * Shows a friendly prompt before requesting permission
     */
    async requestPermission(): Promise<string | null> {
        try {
            // Check if notifications are supported
            if (!('Notification' in window)) {
                console.log('Browser notifications not supported');
                return null;
            }

            // Check if already granted
            if (Notification.permission === 'granted') {
                return await this.getFCMToken();
            }

            // Check if already denied
            if (Notification.permission === 'denied') {
                console.log('Notification permission previously denied');
                return null;
            }

            // Request permission
            const permission = await Notification.requestPermission();
            if (permission !== 'granted') {
                console.log('Notification permission denied');
                return null;
            }

            // Get FCM token after permission granted
            return await this.getFCMToken();
        } catch (error) {
            console.error('Error requesting notification permission:', error);
            return null;
        }
    }

    /**
     * Get Firebase Cloud Messaging token
     */
    private async getFCMToken(): Promise<string | null> {
        try {
            if (!messaging) {
                console.log('Firebase messaging not supported');
                return null;
            }

            // IMPORTANT: We must get the specific service worker registration for
            // firebase-messaging-sw.js. Using navigator.serviceWorker.ready could
            // return a different SW if multiple are registered.
            let swReg: ServiceWorkerRegistration | null = null;
            try {
                if ('serviceWorker' in navigator) {
                    // First try to find the specific firebase-messaging-sw.js registration
                    const registrations = await navigator.serviceWorker.getRegistrations();
                    swReg = registrations.find(
                        (reg) => reg.active?.scriptURL?.includes('firebase-messaging-sw.js')
                    ) || null;

                    // If not found yet (still installing), wait for ready
                    if (!swReg) {
                        swReg = await navigator.serviceWorker.ready;
                    }
                }
            } catch (e) {
                // ignore; we'll proceed without a registration
                console.warn('Could not get serviceWorker registration:', e);
            }

            // Use helper that retries and handles transient failures
            const token = await getFCMTokenWithRetry(
                messaging,
                import.meta.env.VITE_FIREBASE_VAPID_KEY,
                4,
                500,
                swReg
            );

            return token;
        } catch (error) {
            console.error('Error getting FCM token:', error);
            return null;
        }
    }

    /**
     * Save FCM token to user profile
     */
    async saveFCMToken(userId: string, token: string): Promise<boolean> {
        try {
            const { error } = await supabase
                .from(TABLES.USERS)
                .update({ fcm_token: token })
                .eq('id', userId);

            if (error) throw error;
            return true;
        } catch (error) {
            console.error('Error saving FCM token:', error);
            return false;
        }
    }

    /**
     * Set up listener for incoming FCM messages
     */
    setupMessageListener(callback: (payload: unknown) => void): void {
        if (!messaging) return;

        onMessage(messaging, (payload) => {
            console.log('FCM message received:', payload);
            callback(payload);

            // Show browser notification if supported
            if (payload.notification) {
                this.showBrowserNotification(
                    payload.notification.title || 'New Notification',
                    payload.notification.body || '',
                    payload.notification.icon
                );
            }
        });
    }

    /**
     * Send push notification via Supabase edge function
     */
    private async sendPushNotification(
        userId: string,
        type: NotificationType,
        title: string,
        message: string,
        data?: NotificationData
    ): Promise<void> {
        const { data: response, error } = await supabase.functions.invoke('send-push-notification', {
            body: {
                user_id: userId,
                title,
                body: message,
                data: data || {},
                notification_type: type
            }
        });

        if (error) {
            throw new Error(`Failed to send push notification: ${error.message}`);
        }

        if (!response?.success) {
            throw new Error(`Push notification failed: ${response?.error || 'Unknown error'}`);
        }
    }

    /**
     * Create a notification in the database
     * This will automatically trigger email sending via database triggers
     */
    async createNotification(
        userId: string,
        type: NotificationType,
        title: string,
        message: string,
        data?: NotificationData
    ): Promise<boolean> {
        try {
            const { error } = await supabase
                .from(TABLES.NOTIFICATIONS)
                .insert({
                    user_id: userId,
                    type,
                    title,
                    message,
                    data: data || {},
                    read: false,
                    sent_via: ['push'] // Initially mark as sent via push
                });

            if (error) throw error;

            // Send push notification via edge function
            try {
                await this.sendPushNotification(userId, type, title, message, data);
            } catch (pushError) {
                console.error('Failed to send push notification:', pushError);
                // Don't fail the whole operation if push fails
            }

            // Broadcast to other tabs
            this.broadcastNotification({ userId, type, title, message, data });

            return true;
        } catch (error) {
            console.error('Error creating notification:', error);
            return false;
        }
    }

    /**
     * Show browser notification (Web Notification API)
     * Works even when tab is in background
     */
    showBrowserNotification(
        title: string,
        body: string,
        icon?: string
    ): void {
        if (!('Notification' in window)) return;
        if (Notification.permission !== 'granted') return;

        try {
            const notification = new Notification(title, {
                body,
                icon: icon || '/logo.png',
                badge: '/logo.png',
                tag: 'yuyu-notification',
                requireInteraction: false,
                silent: false
            } as NotificationOptions);

            // Handle notification click
            notification.onclick = () => {
                window.focus();
                notification.close();
            };

            // Auto-close after 5 seconds
            setTimeout(() => notification.close(), 5000);
        } catch (error) {
            console.error('Error showing browser notification:', error);
        }
    }

    /**
     * Get user's notification preferences
     */
    async getPreferences(userId: string): Promise<NotificationPreferences | null> {
        try {
            const { data, error } = await supabase
                .from('notification_preferences')
                .select('*')
                .eq('user_id', userId)
                .single();

            if (error) throw error;
            return data as NotificationPreferences;
        } catch (error) {
            console.error('Error fetching notification preferences:', error);
            return null;
        }
    }

    /**
     * Update user's notification preferences
     */
    async updatePreferences(
        userId: string,
        preferences: Partial<NotificationPreferences>
    ): Promise<boolean> {
        try {
            const { error } = await supabase
                .from('notification_preferences')
                .upsert({
                    user_id: userId,
                    ...preferences,
                    updated_at: new Date().toISOString()
                });

            if (error) throw error;
            return true;
        } catch (error) {
            console.error('Error updating notification preferences:', error);
            return false;
        }
    }

    /**
     * Get unread notification count for a user
     */
    async getUnreadCount(userId: string): Promise<number> {
        try {
            const { count, error } = await supabase
                .from(TABLES.NOTIFICATIONS)
                .select('*', { count: 'exact', head: true })
                .eq('user_id', userId)
                .eq('read', false);

            if (error) throw error;
            return count || 0;
        } catch (error) {
            console.error('Error getting unread count:', error);
            return 0;
        }
    }

    /**
     * Get recent notifications for a user
     */
    async getNotifications(
        userId: string,
        limit: number = 20
    ): Promise<unknown[]> {
        try {
            const { data, error } = await supabase
                .from(TABLES.NOTIFICATIONS)
                .select('*')
                .eq('user_id', userId)
                .order('created_at', { ascending: false })
                .limit(limit);

            if (error) throw error;
            return (data as unknown[]) || [];
        } catch (error) {
            console.error('Error fetching notifications:', error);
            return [];
        }
    }

    /**
     * Mark a notification as read
     */
    async markAsRead(notificationId: string): Promise<boolean> {
        try {
            const { error } = await supabase
                .from(TABLES.NOTIFICATIONS)
                .update({
                    read: true,
                    read_at: new Date().toISOString()
                })
                .eq('id', notificationId);

            if (error) throw error;
            return true;
        } catch (error) {
            console.error('Error marking notification as read:', error);
            return false;
        }
    }

    /**
     * Mark all notifications as read for a user
     */
    async markAllAsRead(userId: string): Promise<boolean> {
        try {
            const { error } = await supabase
                .from(TABLES.NOTIFICATIONS)
                .update({
                    read: true,
                    read_at: new Date().toISOString()
                })
                .eq('user_id', userId)
                .eq('read', false);

            if (error) throw error;
            return true;
        } catch (error) {
            console.error('Error marking all notifications as read:', error);
            return false;
        }
    }

    /**
     * Subscribe to real-time notification updates
     */
    subscribeToNotifications(
        userId: string,
        callback: (notification: unknown) => void
    ) {
        const channel = supabase
            .channel(`notifications:${userId}`)
            .on(
                'postgres_changes',
                {
                    event: 'INSERT',
                    schema: 'public',
                    table: TABLES.NOTIFICATIONS,
                    filter: `user_id=eq.${userId}`
                },
                (payload: { new?: { title?: string; message?: string } }) => {
                    console.log('New notification received:', payload);
                    callback(payload.new ?? null);

                    // Show browser notification
                    if (payload.new?.title && payload.new?.message) {
                        this.showBrowserNotification(
                            payload.new.title,
                            payload.new.message
                        );
                    }
                }
            )
            .subscribe();

        return () => {
            supabase.removeChannel(channel);
        };
    }

    /**
     * Broadcast notification to other tabs
     */
    private broadcastNotification(data: unknown): void {
        if (this.notificationChannel) {
            this.notificationChannel.postMessage(data);
        }
    }

    /**
     * Handle notifications from other tabs
     */
    private handleCrossTabNotification(data: unknown): void {
        // try to read title/message if present
        try {
            const maybe = data as { title?: string; message?: string };
            if (maybe.title && maybe.message) {
                this.showBrowserNotification(maybe.title, maybe.message);
            }
        } catch {
            // ignore malformed cross-tab payloads
        }
    }

    /**
     * Check if push notifications are supported and enabled
     */
    isPushSupported(): boolean {
        return 'Notification' in window && 'serviceWorker' in navigator;
    }

    /**
     * Get notification permission status
     */
    getPermissionStatus(): NotificationPermission {
        if (!('Notification' in window)) {
            return 'denied';
        }
        return Notification.permission;
    }

    /**
     * Clean up resources
     */
    cleanup(): void {
        if (this.notificationChannel) {
            this.notificationChannel.close();
            this.notificationChannel = null;
        }
    }
}

export default NotificationService.getInstance();
