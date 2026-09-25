-- Quick Database Check: Verify Balance is Actually Updating
-- Run this immediately after sending a gift to verify the transaction succeeded

-- ============================================================================
-- 1. Check most recent gift transactions
-- ============================================================================
SELECT 
  g.id,
  g.sender_id,
  g.receiver_id,
  g.amount,
  g.platform_amount,
  g.receiver_amount,
  g.item_name,
  g.status,
  g.created_at,
  AGE(NOW(), g.created_at) as age
FROM public.gifts g
ORDER BY g.created_at DESC
LIMIT 5;

-- ============================================================================
-- 2. Check wallet_transactions for recent gifts
-- ============================================================================
SELECT 
  wt.id,
  wt.user_id,
  wt.direction,
  wt.amount,
  wt.type,
  wt.reference,
  wt.created_at,
  AGE(NOW(), wt.created_at) as age
FROM public.wallet_transactions wt
WHERE wt.created_at > NOW() - INTERVAL '5 minutes'
ORDER BY wt.created_at DESC;

-- ============================================================================
-- 3. Check current balances of last 2 users involved in gifts
-- ============================================================================
WITH recent_gift_users AS (
  SELECT DISTINCT sender_id as user_id FROM public.gifts 
  WHERE created_at > NOW() - INTERVAL '5 minutes'
  UNION
  SELECT DISTINCT receiver_id as user_id FROM public.gifts 
  WHERE created_at > NOW() - INTERVAL '5 minutes'
)
SELECT 
  u.id,
  u.name,
  u.email,
  u.balance,
  'Current Balance' as note
FROM public.users u
WHERE u.id IN (SELECT user_id FROM recent_gift_users)
ORDER BY u.balance DESC;

-- ============================================================================
-- 4. Verify wallet_transactions match user balances
-- ============================================================================
-- For each user involved in recent gifts, calculate expected balance from wallet_transactions
WITH recent_gift_users AS (
  SELECT DISTINCT sender_id as user_id FROM public.gifts 
  WHERE created_at > NOW() - INTERVAL '1 hour'
  UNION
  SELECT DISTINCT receiver_id as user_id FROM public.gifts 
  WHERE created_at > NOW() - INTERVAL '1 hour'
),
calculated_balances AS (
  SELECT 
    wt.user_id,
    SUM(CASE WHEN wt.direction = 'credit' THEN wt.amount ELSE -wt.amount END) as calculated_balance
  FROM public.wallet_transactions wt
  WHERE wt.user_id IN (SELECT user_id FROM recent_gift_users)
  GROUP BY wt.user_id
)
SELECT 
  u.id,
  u.name,
  u.balance as actual_balance,
  COALESCE(cb.calculated_balance, 0) as calculated_from_transactions,
  (u.balance - COALESCE(cb.calculated_balance, 0)) as difference
FROM public.users u
LEFT JOIN calculated_balances cb ON cb.user_id = u.id
WHERE u.id IN (SELECT user_id FROM recent_gift_users);

-- ============================================================================
-- 5. Check if there are any orphaned gifts (no wallet_transactions)
-- ============================================================================
SELECT 
  g.id,
  g.sender_id,
  g.receiver_id,
  g.amount,
  g.created_at,
  COUNT(wt.id) as wallet_tx_count,
  CASE 
    WHEN COUNT(wt.id) = 0 THEN '❌ ORPHANED (No wallet_transactions)'
    WHEN COUNT(wt.id) = 1 THEN '⚠️  INCOMPLETE (Missing sender or receiver tx)'
    WHEN COUNT(wt.id) >= 2 THEN '✅ COMPLETE'
    ELSE '❓ UNKNOWN'
  END as status
FROM public.gifts g
LEFT JOIN public.wallet_transactions wt ON wt.reference = g.id::TEXT
WHERE g.created_at > NOW() - INTERVAL '5 minutes'
GROUP BY g.id
ORDER BY g.created_at DESC;

-- ============================================================================
-- EXPECTED RESULTS:
-- ============================================================================
-- Query 1: Should show your most recent gift
-- Query 2: Should show 2 wallet_transactions per gift (1 debit, 1 credit)
-- Query 3: Should show correct current balances
-- Query 4: Difference should be close to 0 (if not, wallet_transactions are missing)
-- Query 5: Status should be '✅ COMPLETE' for all recent gifts

