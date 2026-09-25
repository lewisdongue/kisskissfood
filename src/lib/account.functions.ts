import { createServerFn } from '@tanstack/react-start';
import { requireSupabaseAuth } from '@/integrations/supabase/auth-middleware';

/**
 * Permanently deletes the caller's account: their auth identity plus the
 * profile row. Everything referencing the user with ON DELETE CASCADE goes
 * with it. Irreversible by design.
 */
export const deleteMyAccount = createServerFn({ method: 'POST' })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const userId = (context as { userId: string }).userId;

    const { supabaseAdmin } = await import('@/integrations/supabase/client.server');

    // Some deployments contain legacy/optional tables while others do not.
    // A missing optional relation must never prevent deletion of the identity.
    const cleanupResults = await Promise.all([
      supabaseAdmin.from('gifts').delete().eq('sender_id', userId),
      supabaseAdmin.from('gifts').delete().eq('receiver_id', userId),
      supabaseAdmin.from('match_history').delete().eq('user_id', userId),
      supabaseAdmin.from('match_history').delete().eq('partner_id', userId),
      supabaseAdmin.from('moderation_events').delete().eq('user_id', userId),
      supabaseAdmin.from('waiting_users').delete().eq('user_id', userId),
      supabaseAdmin.from('online_users').delete().eq('user_id', userId),
      supabaseAdmin.from('referrals').delete().eq('referrer_id', userId),
      supabaseAdmin.from('referrals').delete().eq('referred_user_id', userId),
      supabaseAdmin.from('yuyu_transactions').delete().eq('user_id', userId),
      supabaseAdmin.from('notification_queue').delete().eq('user_id', userId),
      supabaseAdmin.from('notifications').delete().eq('user_id', userId),
      supabaseAdmin.from('notification_preferences').delete().eq('user_id', userId),
    ]);
    const cleanupError = cleanupResults
      .map((result) => result.error)
      .find((error) => error && error.code !== '42P01' && error.code !== 'PGRST205');
    if (cleanupError) throw new Error(`Account data deletion failed: ${cleanupError.message}`);

    const { error: profileError } = await supabaseAdmin.from('users').delete().eq('id', userId);
    if (profileError) throw new Error(`Profile deletion failed: ${profileError.message}`);

    const { error: authError } = await supabaseAdmin.auth.admin.deleteUser(userId);
    if (authError) throw new Error(`Account deletion failed: ${authError.message}`);

    return { success: true as const };
  });
