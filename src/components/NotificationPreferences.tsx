import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Card } from './ui/card';
import { Button } from './ui/button';
import { Label } from './ui/label';
import NotificationService from '../services/notificationService';
import toast from 'react-hot-toast';

interface NotificationPreferencesProps {
  userId: string;
}

export const NotificationPreferences: React.FC<NotificationPreferencesProps> = ({ userId }) => {
  const { t } = useTranslation();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [preferences, setPreferences] = useState({
    email_enabled: true,
    push_enabled: true,
    in_app_enabled: true,
    yuyu_earned_email: true,
    yuyu_earned_push: true,
    yuyu_earned_threshold: 10,
    friend_requests_email: true,
    friend_requests_push: true,
    friend_accepted_email: true,
    friend_accepted_push: true,
    referral_updates_email: true,
    referral_updates_push: true,
    referral_bonus_email: true,
    referral_bonus_push: true,
    re_engagement_enabled: true,
    daily_reminders: true,
    weekly_summary: true,
    system_announcements_email: true,
    system_announcements_push: true,
    quiet_hours_enabled: true,
    quiet_hours_start: '22:00:00',
    quiet_hours_end: '08:00:00',
    max_notifications_per_day: 10,
    min_hours_between_notifications: 2,
  });

  useEffect(() => {
    loadPreferences();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userId]);

  const loadPreferences = async () => {
    try {
      setLoading(true);
      const prefs = await NotificationService.getPreferences(userId);
      if (prefs) {
        setPreferences(prefs);
      }
    } catch (error) {
      console.error('Failed to load preferences:', error);
      toast.error(t('notificationPrefs.loadFailed'));
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    try {
      setSaving(true);
      const success = await NotificationService.updatePreferences(userId, preferences);
      if (success) {
        toast.success(t('notificationPrefs.saved'));
      } else {
        toast.error(t('notificationPrefs.saveFailed'));
      }
    } catch (error) {
      console.error('Failed to save preferences:', error);
      toast.error(t('notificationPrefs.saveFailed'));
    } finally {
      setSaving(false);
    }
  };

  const handleToggle = (field: keyof typeof preferences) => {
    setPreferences(prev => ({
      ...prev,
      [field]: !prev[field]
    }));
  };

  const handleThresholdChange = (value: number) => {
    setPreferences(prev => ({
      ...prev,
      yuyu_earned_threshold: value
    }));
  };

  if (loading) {
    return (
      <Card className="p-6">
        <div className="animate-pulse space-y-4">
          <div className="h-6 bg-gray-200 rounded w-1/3"></div>
          <div className="space-y-2">
            <div className="h-4 bg-gray-200 rounded"></div>
            <div className="h-4 bg-gray-200 rounded"></div>
            <div className="h-4 bg-gray-200 rounded"></div>
          </div>
        </div>
      </Card>
    );
  }

  return (
    <Card className="p-6 space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-900">{t('notificationPrefs.title')}</h2>
        <p className="text-sm text-gray-600 mt-1">
          {t('notificationPrefs.subtitle')}
        </p>
      </div>

      {/* Global Settings */}
      <div className="space-y-4 border-b pb-6">
        <h3 className="text-lg font-semibold text-gray-800">{t('notificationPrefs.globalSettings')}</h3>

        <div className="flex items-center justify-between">
          <div className="flex-1">
            <Label className="text-base font-medium">{t('notificationPrefs.emailNotifications')}</Label>
            <p className="text-sm text-gray-500">{t('notificationPrefs.emailNotificationsDesc')}</p>
          </div>
          <button
            onClick={() => handleToggle('email_enabled')}
            className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${preferences.email_enabled ? 'bg-green-500' : 'bg-gray-300'
              }`}
          >
            <span
              className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${preferences.email_enabled ? 'translate-x-6' : 'translate-x-1'
                }`}
            />
          </button>
        </div>

        <div className="flex items-center justify-between">
          <div className="flex-1">
            <Label className="text-base font-medium">{t('notificationPrefs.pushNotifications')}</Label>
            <p className="text-sm text-gray-500">{t('notificationPrefs.pushNotificationsDesc')}</p>
          </div>
          <button
            onClick={() => handleToggle('push_enabled')}
            className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${preferences.push_enabled ? 'bg-green-500' : 'bg-gray-300'
              }`}
          >
            <span
              className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${preferences.push_enabled ? 'translate-x-6' : 'translate-x-1'
                }`}
            />
          </button>
        </div>
      </div>

      {/* YUYU Earned Notifications */}
      <div className="space-y-4 border-b pb-6">
        <h3 className="text-lg font-semibold text-gray-800">{t('notificationPrefs.yuyuEarned')}</h3>

        <div className="flex items-center justify-between">
          <Label className="text-sm">{t('notificationPrefs.emailLabel')}</Label>
          <button
            onClick={() => handleToggle('yuyu_earned_email')}
            className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${preferences.yuyu_earned_email ? 'bg-green-500' : 'bg-gray-300'
              }`}
            disabled={!preferences.email_enabled}
          >
            <span
              className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${preferences.yuyu_earned_email ? 'translate-x-6' : 'translate-x-1'
                }`}
            />
          </button>
        </div>

        <div className="flex items-center justify-between">
          <Label className="text-sm">{t('notificationPrefs.pushLabel')}</Label>
          <button
            onClick={() => handleToggle('yuyu_earned_push')}
            className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${preferences.yuyu_earned_push ? 'bg-green-500' : 'bg-gray-300'
              }`}
            disabled={!preferences.push_enabled}
          >
            <span
              className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${preferences.yuyu_earned_push ? 'translate-x-6' : 'translate-x-1'
                }`}
            />
          </button>
        </div>

        <div className="flex items-center justify-between">
          <div>
            <Label className="text-sm">{t('notificationPrefs.minYuyu')}</Label>
            <p className="text-xs text-gray-500">{t('notificationPrefs.minYuyuDesc')}</p>
          </div>
          <input
            type="number"
            min="1"
            max="100"
            value={preferences.yuyu_earned_threshold}
            onChange={(e) => handleThresholdChange(parseInt(e.target.value) || 1)}
            className="w-20 px-3 py-2 border border-gray-300 rounded-lg text-sm"
          />
        </div>
      </div>

      {/* Friend Requests */}
      <div className="space-y-4 border-b pb-6">
        <h3 className="text-lg font-semibold text-gray-800">{t('notificationPrefs.friendRequests')}</h3>

        <div className="flex items-center justify-between">
          <Label className="text-sm">{t('notificationPrefs.emailLabel')}</Label>
          <button
            onClick={() => handleToggle('friend_requests_email')}
            className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${preferences.friend_requests_email ? 'bg-green-500' : 'bg-gray-300'
              }`}
            disabled={!preferences.email_enabled}
          >
            <span
              className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${preferences.friend_requests_email ? 'translate-x-6' : 'translate-x-1'
                }`}
            />
          </button>
        </div>

        <div className="flex items-center justify-between">
          <Label className="text-sm">{t('notificationPrefs.pushLabel')}</Label>
          <button
            onClick={() => handleToggle('friend_requests_push')}
            className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${preferences.friend_requests_push ? 'bg-green-500' : 'bg-gray-300'
              }`}
            disabled={!preferences.push_enabled}
          >
            <span
              className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${preferences.friend_requests_push ? 'translate-x-6' : 'translate-x-1'
                }`}
            />
          </button>
        </div>
      </div>

      {/* Referral Updates */}
      <div className="space-y-4 border-b pb-6">
        <h3 className="text-lg font-semibold text-gray-800">{t('notificationPrefs.referralUpdates')}</h3>

        <div className="flex items-center justify-between">
          <Label className="text-sm">{t('notificationPrefs.emailLabel')}</Label>
          <button
            onClick={() => handleToggle('referral_updates_email')}
            className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${preferences.referral_updates_email ? 'bg-green-500' : 'bg-gray-300'
              }`}
            disabled={!preferences.email_enabled}
          >
            <span
              className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${preferences.referral_updates_email ? 'translate-x-6' : 'translate-x-1'
                }`}
            />
          </button>
        </div>

        <div className="flex items-center justify-between">
          <Label className="text-sm">{t('notificationPrefs.pushLabel')}</Label>
          <button
            onClick={() => handleToggle('referral_updates_push')}
            className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${preferences.referral_updates_push ? 'bg-green-500' : 'bg-gray-300'
              }`}
            disabled={!preferences.push_enabled}
          >
            <span
              className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${preferences.referral_updates_push ? 'translate-x-6' : 'translate-x-1'
                }`}
            />
          </button>
        </div>
      </div>

      {/* Re-engagement Notifications */}
      <div className="space-y-4 border-b pb-6">
        <h3 className="text-lg font-semibold text-gray-800">{t('notificationPrefs.reEngagement')}</h3>
        <p className="text-sm text-gray-500">{t('notificationPrefs.reEngagementDesc')}</p>

        <div className="flex items-center justify-between">
          <div className="flex-1">
            <Label className="text-sm">{t('notificationPrefs.enableReEngagement')}</Label>
            <p className="text-xs text-gray-500">{t('notificationPrefs.enableReEngagementDesc')}</p>
          </div>
          <button
            onClick={() => handleToggle('re_engagement_enabled')}
            className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${preferences.re_engagement_enabled ? 'bg-green-500' : 'bg-gray-300'
              }`}
          >
            <span
              className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${preferences.re_engagement_enabled ? 'translate-x-6' : 'translate-x-1'
                }`}
            />
          </button>
        </div>

        <div className="flex items-center justify-between pl-4">
          <Label className="text-sm">{t('notificationPrefs.dailyReminders')}</Label>
          <button
            onClick={() => handleToggle('daily_reminders')}
            className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${preferences.daily_reminders ? 'bg-green-500' : 'bg-gray-300'
              }`}
            disabled={!preferences.re_engagement_enabled}
          >
            <span
              className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${preferences.daily_reminders ? 'translate-x-6' : 'translate-x-1'
                }`}
            />
          </button>
        </div>

        <div className="flex items-center justify-between pl-4">
          <Label className="text-sm">{t('notificationPrefs.weeklySummary')}</Label>
          <button
            onClick={() => handleToggle('weekly_summary')}
            className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${preferences.weekly_summary ? 'bg-green-500' : 'bg-gray-300'
              }`}
            disabled={!preferences.re_engagement_enabled}
          >
            <span
              className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${preferences.weekly_summary ? 'translate-x-6' : 'translate-x-1'
                }`}
            />
          </button>
        </div>
      </div>

      {/* Quiet Hours */}
      <div className="space-y-4 border-b pb-6">
        <h3 className="text-lg font-semibold text-gray-800">{t('notificationPrefs.quietHours')}</h3>
        <p className="text-sm text-gray-500">{t('notificationPrefs.quietHoursDesc')}</p>

        <div className="flex items-center justify-between">
          <Label className="text-sm">{t('notificationPrefs.enableQuietHours')}</Label>
          <button
            onClick={() => handleToggle('quiet_hours_enabled')}
            className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${preferences.quiet_hours_enabled ? 'bg-green-500' : 'bg-gray-300'
              }`}
          >
            <span
              className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${preferences.quiet_hours_enabled ? 'translate-x-6' : 'translate-x-1'
                }`}
            />
          </button>
        </div>

        <div className="grid grid-cols-2 gap-4 pl-4">
          <div>
            <Label className="text-sm">{t('notificationPrefs.startTime')}</Label>
            <input
              type="time"
              value={preferences.quiet_hours_start.slice(0, 5)}
              onChange={(e) => setPreferences(prev => ({
                ...prev,
                quiet_hours_start: e.target.value + ':00'
              }))}
              disabled={!preferences.quiet_hours_enabled}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm disabled:bg-gray-100"
            />
          </div>
          <div>
            <Label className="text-sm">{t('notificationPrefs.endTime')}</Label>
            <input
              type="time"
              value={preferences.quiet_hours_end.slice(0, 5)}
              onChange={(e) => setPreferences(prev => ({
                ...prev,
                quiet_hours_end: e.target.value + ':00'
              }))}
              disabled={!preferences.quiet_hours_enabled}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm disabled:bg-gray-100"
            />
          </div>
        </div>
      </div>

      {/* Rate Limiting */}
      <div className="space-y-4 border-b pb-6">
        <h3 className="text-lg font-semibold text-gray-800">{t('notificationPrefs.rateLimiting')}</h3>
        <p className="text-sm text-gray-500">{t('notificationPrefs.rateLimitingDesc')}</p>

        <div className="flex items-center justify-between">
          <div className="flex-1">
            <Label className="text-sm">{t('notificationPrefs.maxPerDay')}</Label>
            <p className="text-xs text-gray-500">{t('notificationPrefs.maxPerDayDesc')}</p>
          </div>
          <input
            type="number"
            min="1"
            max="50"
            value={preferences.max_notifications_per_day}
            onChange={(e) => setPreferences(prev => ({
              ...prev,
              max_notifications_per_day: parseInt(e.target.value) || 10
            }))}
            className="w-20 px-3 py-2 border border-gray-300 rounded-lg text-sm"
          />
        </div>

        <div className="flex items-center justify-between">
          <div className="flex-1">
            <Label className="text-sm">{t('notificationPrefs.minHoursBetween')}</Label>
            <p className="text-xs text-gray-500">{t('notificationPrefs.minHoursBetweenDesc')}</p>
          </div>
          <input
            type="number"
            min="0.5"
            max="24"
            step="0.5"
            value={preferences.min_hours_between_notifications}
            onChange={(e) => setPreferences(prev => ({
              ...prev,
              min_hours_between_notifications: parseFloat(e.target.value) || 2
            }))}
            className="w-20 px-3 py-2 border border-gray-300 rounded-lg text-sm"
          />
        </div>
      </div>

      {/* System Announcements */}
      <div className="space-y-4 pb-2">
        <h3 className="text-lg font-semibold text-gray-800">{t('notificationPrefs.systemAnnouncements')}</h3>

        <div className="flex items-center justify-between">
          <Label className="text-sm">{t('notificationPrefs.emailLabel')}</Label>
          <button
            onClick={() => handleToggle('system_announcements_email')}
            className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${preferences.system_announcements_email ? 'bg-green-500' : 'bg-gray-300'
              }`}
            disabled={!preferences.email_enabled}
          >
            <span
              className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${preferences.system_announcements_email ? 'translate-x-6' : 'translate-x-1'
                }`}
            />
          </button>
        </div>

        <div className="flex items-center justify-between">
          <Label className="text-sm">{t('notificationPrefs.pushLabel')}</Label>
          <button
            onClick={() => handleToggle('system_announcements_push')}
            className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${preferences.system_announcements_push ? 'bg-green-500' : 'bg-gray-300'
              }`}
            disabled={!preferences.push_enabled}
          >
            <span
              className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${preferences.system_announcements_push ? 'translate-x-6' : 'translate-x-1'
                }`}
            />
          </button>
        </div>
      </div>

      {/* Save Button */}
      <Button
        onClick={handleSave}
        disabled={saving}
        className="w-full"
      >
        {saving ? t('notificationPrefs.saving') : t('notificationPrefs.savePreferences')}
      </Button>
    </Card>
  );
};
