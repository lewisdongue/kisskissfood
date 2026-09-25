/**
 * NOTIFICATION SCHEDULER SERVICE
 * 
 * This service handles scheduling and batch processing of notifications.
 * It manages the notification queue and ensures notifications are sent
 * according to user preferences and rate limits.
 */

import { supabase, TABLES } from '../config/supabase';
import type { NotificationType, NotificationData } from './notificationService';

export interface QueuedNotification {
    id?: string;
    user_id: string;
    type: NotificationType;
    title: string;
    message: string;
    data?: NotificationData;
    scheduled_for?: string;
    priority?: 'low' | 'normal' | 'high' | 'urgent';
    campaign_id?: string;
    batch_id?: string;
}

export interface NotificationSchedule {
    type: NotificationType;
    title: string;
    message: string;
    data?: NotificationData;
    schedule: {
        time?: string; // HH:MM:SS format
        daysOfWeek?: number[]; // 0-6, Sunday = 0
        interval?: 'daily' | 'weekly' | 'monthly';
        timezone?: string;
    };
    targetUsers?: {
        inactiveDays?: number;
        minYUYUScore?: number;
        maxYUYUScore?: number;
        hasReferrals?: boolean;
        hasFriends?: boolean;
    };
}

class NotificationSchedulerService {
    private static instance: NotificationSchedulerService;

    private constructor() { }

    static getInstance(): NotificationSchedulerService {
        if (!NotificationSchedulerService.instance) {
            NotificationSchedulerService.instance = new NotificationSchedulerService();
        }
        return NotificationSchedulerService.instance;
    }

    /**
     * Schedule a notification for a specific user
     */
    async scheduleNotification(notification: QueuedNotification): Promise<boolean> {
        try {
            const { error } = await supabase
                .from('notification_queue')
                .insert({
                    user_id: notification.user_id,
                    type: notification.type,
                    title: notification.title,
                    message: notification.message,
                    data: notification.data || {},
                    scheduled_for: notification.scheduled_for || new Date().toISOString(),
                    priority: notification.priority || 'normal',
                    campaign_id: notification.campaign_id,
                    batch_id: notification.batch_id,
                    status: 'pending'
                });

            if (error) throw error;
            return true;
        } catch (error) {
            console.error('Error scheduling notification:', error);
            return false;
        }
    }

    /**
     * Schedule notifications for multiple users (batch)
     */
    async scheduleBatchNotifications(notifications: QueuedNotification[]): Promise<number> {
        try {
            const batchId = crypto.randomUUID();
            const notificationsWithBatch = notifications.map(n => ({
                ...n,
                batch_id: n.batch_id || batchId,
                scheduled_for: n.scheduled_for || new Date().toISOString(),
                priority: n.priority || 'normal',
                status: 'pending'
            }));

            const { data, error } = await supabase
                .from('notification_queue')
                .insert(notificationsWithBatch)
                .select();

            if (error) throw error;
            return data?.length || 0;
        } catch (error) {
            console.error('Error scheduling batch notifications:', error);
            return 0;
        }
    }

    /**
     * Schedule daily reminder notifications for inactive users
     */
    async scheduleDailyReminders(inactiveHours: number = 24): Promise<number> {
        try {
            const inactiveSince = new Date();
            inactiveSince.setHours(inactiveSince.getHours() - inactiveHours);

            // Get inactive users who have push enabled
            const { data: inactiveUsers, error } = await supabase
                .from(TABLES.USERS)
                .select('id, name, yuyu_score')
                .not('fcm_token', 'is', null)
                .lt('last_active_at', inactiveSince.toISOString());

            if (error) throw error;
            if (!inactiveUsers || inactiveUsers.length === 0) return 0;

            const messages = [
                {
                    title: '👋 We miss you!',
                    body: 'Come back and earn more YUYU tokens! Your friends are waiting.'
                },
                {
                    title: '🎁 Daily bonus waiting!',
                    body: 'Log in now to claim your daily YUYU bonus!'
                },
                {
                    title: '🔥 Keep your streak alive!',
                    body: "Don't break your activity streak! Come back today."
                },
                {
                    title: '💎 New features available!',
                    body: 'Check out the latest updates and earn more YUYU!'
                }
            ];

            const notifications: QueuedNotification[] = inactiveUsers.map(user => {
                const randomMessage = messages[Math.floor(Math.random() * messages.length)];
                return {
                    user_id: user.id,
                    type: 'daily_reminder',
                    title: randomMessage.title,
                    message: randomMessage.body,
                    data: {
                        campaign_id: 'daily_reminder',
                        total_balance: user.yuyu_score
                    },
                    priority: 'normal',
                    campaign_id: 'daily_reminder'
                };
            });

            return await this.scheduleBatchNotifications(notifications);
        } catch (error) {
            console.error('Error scheduling daily reminders:', error);
            return 0;
        }
    }

    /**
     * Schedule weekly summary notifications
     */
    async scheduleWeeklySummaries(): Promise<number> {
        try {
            // Get users who haven't been active in the last 7 days
            const weekAgo = new Date();
            weekAgo.setDate(weekAgo.getDate() - 7);

            const { data: users, error } = await supabase
                .from(TABLES.USERS)
                .select('id, name, yuyu_score')
                .not('fcm_token', 'is', null)
                .lt('last_active_at', weekAgo.toISOString());

            if (error) throw error;
            if (!users || users.length === 0) return 0;

            // Get friend count for each user
            const usersWithFriendCount = await Promise.all(
                users.map(async (user) => {
                    const { count } = await supabase
                        .from('friend_requests')
                        .select('*', { count: 'exact', head: true })
                        .or(`from_user_id.eq.${user.id},to_user_id.eq.${user.id}`)
                        .eq('status', 'accepted');

                    return { ...user, friend_count: count || 0 };
                })
            );

            const notifications: QueuedNotification[] = usersWithFriendCount.map(user => ({
                user_id: user.id,
                type: 'weekly_summary',
                title: '📊 Your Weekly Summary',
                message: `See how much YUYU you earned this week and climb the leaderboard!`,
                data: {
                    campaign_id: 'weekly_summary',
                    total_balance: user.yuyu_score,
                    friend_count: user.friend_count
                },
                priority: 'normal',
                campaign_id: 'weekly_summary'
            }));

            return await this.scheduleBatchNotifications(notifications);
        } catch (error) {
            console.error('Error scheduling weekly summaries:', error);
            return 0;
        }
    }

    /**
     * Schedule milestone reminder notifications
     */
    async scheduleMilestoneReminders(): Promise<number> {
        try {
            // Get users who are close to the next milestone
            const { data: users, error } = await supabase
                .from(TABLES.USERS)
                .select('id, name, yuyu_score')
                .not('fcm_token', 'is', null);

            if (error) throw error;
            if (!users || users.length === 0) return 0;

            // Filter users who are within 50 points of a milestone
            const usersNearMilestone = users.filter(user => {
                const nextMilestone = Math.ceil(user.yuyu_score / 100) * 100;
                const pointsNeeded = nextMilestone - user.yuyu_score;
                return pointsNeeded > 0 && pointsNeeded <= 50;
            });

            const notifications: QueuedNotification[] = usersNearMilestone.map(user => {
                const nextMilestone = Math.ceil(user.yuyu_score / 100) * 100;
                const pointsNeeded = nextMilestone - user.yuyu_score;

                return {
                    user_id: user.id,
                    type: 're_engagement',
                    title: '🏆 You\'re so close!',
                    message: `Just ${pointsNeeded} more YUYU to reach ${nextMilestone}!`,
                    data: {
                        campaign_id: 'milestone_reminder',
                        points_needed: pointsNeeded,
                        next_milestone: nextMilestone,
                        total_balance: user.yuyu_score
                    },
                    priority: 'normal',
                    campaign_id: 'milestone_reminder'
                };
            });

            return await this.scheduleBatchNotifications(notifications);
        } catch (error) {
            console.error('Error scheduling milestone reminders:', error);
            return 0;
        }
    }

    /**
     * Schedule referral reminder notifications
     */
    async scheduleReferralReminders(): Promise<number> {
        try {
            // Get users with no or few referrals
            const { data: users, error } = await supabase
                .from(TABLES.USERS)
                .select('id, name, referral_code')
                .not('fcm_token', 'is', null);

            if (error) throw error;
            if (!users || users.length === 0) return 0;

            // Get referral count for each user
            const usersWithReferralCount = await Promise.all(
                users.map(async (user) => {
                    const { count } = await supabase
                        .from('referrals')
                        .select('*', { count: 'exact', head: true })
                        .eq('referrer_id', user.id);

                    return { ...user, referral_count: count || 0 };
                })
            );

            // Filter users with less than 5 referrals
            const usersWithFewReferrals = usersWithReferralCount.filter(user => user.referral_count < 5);

            const notifications: QueuedNotification[] = usersWithFewReferrals.map(user => ({
                user_id: user.id,
                type: 're_engagement',
                title: '💰 Earn 100 Yuyu per referral!',
                message: 'Share your referral code and earn rewards for each friend who joins.',
                data: {
                    campaign_id: 'referral_reminder',
                    referral_code: user.referral_code,
                    total_referrals: user.referral_count
                },
                priority: 'normal',
                campaign_id: 'referral_reminder'
            }));

            return await this.scheduleBatchNotifications(notifications);
        } catch (error) {
            console.error('Error scheduling referral reminders:', error);
            return 0;
        }
    }

    /**
     * Process pending notifications in the queue
     */
    async processPendingNotifications(limit: number = 100): Promise<number> {
        try {
            // Get pending notifications that are ready to send
            const { data: pending, error } = await supabase
                .from('notification_queue')
                .select('*')
                .eq('status', 'pending')
                .lte('scheduled_for', new Date().toISOString())
                .limit(limit);

            if (error) throw error;
            if (!pending || pending.length === 0) return 0;

            let processed = 0;

            for (const notification of pending) {
                try {
                    // Send via push notification edge function
                    const { error: sendError } = await supabase.functions.invoke('send-push-notification', {
                        body: {
                            user_id: notification.user_id,
                            title: notification.title,
                            body: notification.message,
                            data: notification.data || {},
                            notification_type: notification.type
                        }
                    });

                    if (sendError) {
                        // Mark as failed
                        await supabase
                            .from('notification_queue')
                            .update({
                                status: 'failed',
                                error_message: sendError.message,
                                last_attempt_at: new Date().toISOString(),
                                attempts: notification.attempts + 1
                            })
                            .eq('id', notification.id);
                    } else {
                        // Mark as sent
                        await supabase
                            .from('notification_queue')
                            .update({
                                status: 'sent',
                                processed_at: new Date().toISOString(),
                                last_attempt_at: new Date().toISOString()
                            })
                            .eq('id', notification.id);

                        processed++;
                    }
                } catch (err) {
                    console.error('Error processing notification:', err);
                }
            }

            return processed;
        } catch (error) {
            console.error('Error processing pending notifications:', error);
            return 0;
        }
    }

    /**
     * Cancel scheduled notification(s)
     */
    async cancelNotification(notificationId: string): Promise<boolean> {
        try {
            const { error } = await supabase
                .from('notification_queue')
                .update({ status: 'cancelled' })
                .eq('id', notificationId)
                .eq('status', 'pending');

            if (error) throw error;
            return true;
        } catch (error) {
            console.error('Error cancelling notification:', error);
            return false;
        }
    }

    /**
     * Cancel all notifications for a user
     */
    async cancelUserNotifications(userId: string): Promise<boolean> {
        try {
            const { error } = await supabase
                .from('notification_queue')
                .update({ status: 'cancelled' })
                .eq('user_id', userId)
                .eq('status', 'pending');

            if (error) throw error;
            return true;
        } catch (error) {
            console.error('Error cancelling user notifications:', error);
            return false;
        }
    }

    /**
     * Get notification statistics
     */
    async getNotificationStats(userId?: string): Promise<{
        total: number;
        pending: number;
        sent: number;
        failed: number;
    }> {
        try {
            let query = supabase
                .from('notification_queue')
                .select('status');

            if (userId) {
                query = query.eq('user_id', userId);
            }

            const { data, error } = await query;

            if (error) throw error;

            const stats = {
                total: data?.length || 0,
                pending: 0,
                sent: 0,
                failed: 0
            };

            data?.forEach(item => {
                if (item.status === 'pending') stats.pending++;
                else if (item.status === 'sent') stats.sent++;
                else if (item.status === 'failed') stats.failed++;
            });

            return stats;
        } catch (error) {
            console.error('Error getting notification stats:', error);
            return { total: 0, pending: 0, sent: 0, failed: 0 };
        }
    }

    /**
     * Retry failed notifications
     */
    async retryFailedNotifications(maxAttempts: number = 3): Promise<number> {
        try {
            const { data: failed, error } = await supabase
                .from('notification_queue')
                .select('*')
                .eq('status', 'failed')
                .lt('attempts', maxAttempts);

            if (error) throw error;
            if (!failed || failed.length === 0) return 0;

            // Reset to pending for retry
            const { data: updated, error: updateError } = await supabase
                .from('notification_queue')
                .update({
                    status: 'pending',
                    scheduled_for: new Date().toISOString()
                })
                .in('id', failed.map(n => n.id))
                .select();

            if (updateError) throw updateError;
            return updated?.length || 0;
        } catch (error) {
            console.error('Error retrying failed notifications:', error);
            return 0;
        }
    }

    /**
     * Clean up old notifications
     */
    async cleanupOldNotifications(daysOld: number = 30): Promise<number> {
        try {
            const cutoffDate = new Date();
            cutoffDate.setDate(cutoffDate.getDate() - daysOld);

            const { data, error } = await supabase
                .from('notification_queue')
                .delete()
                .in('status', ['sent', 'cancelled', 'failed'])
                .lt('created_at', cutoffDate.toISOString())
                .select();

            if (error) throw error;
            return data?.length || 0;
        } catch (error) {
            console.error('Error cleaning up old notifications:', error);
            return 0;
        }
    }
}

export default NotificationSchedulerService.getInstance();
