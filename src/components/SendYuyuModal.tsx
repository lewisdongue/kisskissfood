import React, { useEffect, useMemo, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import { Send, Copy, Check, Loader2, ArrowRight } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { supabase } from '../config/supabase';
import { useYuyuBalance } from '@/context/YuyuBalanceContext';
import { modalSpring } from '@/lib/motionVariants';

// ───────────────────────────────────────────────────────────────────────────
// SEND YUYU — peer-to-peer transfer of gamified Yuyu points.
// The whole movement happens inside a single atomic database call
// (transfer_yuyu), so points can never be duplicated or lost mid-transfer.
// ───────────────────────────────────────────────────────────────────────────

type Props = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  /** Current balance, used for instant local feedback. */
  balance: number;
};

function normalizeId(raw: string): string {
  const cleaned = raw.toUpperCase().replace(/[^A-Z0-9]/g, '').replace(/^YY/, '');
  return cleaned ? `YY-${cleaned.slice(0, 6)}` : '';
}

export const SendYuyuModal: React.FC<Props> = ({ open, onOpenChange, balance }) => {
  const queryClient = useQueryClient();
  const { applyOptimisticDelta } = useYuyuBalance();
  const [recipient, setRecipient] = useState('');
  const [amount, setAmount] = useState('');
  const [sending, setSending] = useState(false);
  const [glow, setGlow] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [myId, setMyId] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (!open) return;
    let active = true;
    (async () => {
      const { data: auth } = await supabase.auth.getUser();
      const uid = auth?.user?.id;
      if (!uid) return;
      const { data } = await supabase.from('users').select('yuyu_id').eq('id', uid).maybeSingle();
      if (active && data?.yuyu_id) setMyId(data.yuyu_id as string);
    })();
    return () => {
      active = false;
    };
  }, [open]);

  useEffect(() => {
    if (!open) {
      setRecipient('');
      setAmount('');
      setError(null);
      setGlow(false);
    }
  }, [open]);

  const parsedAmount = Math.floor(Number(amount));
  const normalized = useMemo(() => normalizeId(recipient), [recipient]);
  const validId = /^YY-[A-Z0-9]{6}$/.test(normalized);
  const validAmount = Number.isFinite(parsedAmount) && parsedAmount > 0 && parsedAmount <= balance;
  const canSend = validId && validAmount && !sending;

  const copyMyId = async () => {
    if (!myId) return;
    try {
      await navigator.clipboard.writeText(myId);
      setCopied(true);
      setTimeout(() => setCopied(false), 1600);
    } catch {
      /* clipboard blocked — the ID is visible on screen anyway */
    }
  };

  const handleSend = async () => {
    if (!canSend) return;
    setSending(true);
    setError(null);

    const { data: auth } = await supabase.auth.getUser();
    const uid = auth?.user?.id;
    if (!uid) {
      setSending(false);
      setError('Please sign in to send Yuyu.');
      return;
    }

    // Optimistic: the globally shared counter drops the instant the user commits.
    const rollback = applyOptimisticDelta(-parsedAmount);

    const { data, error: rpcError } = await supabase.rpc('transfer_yuyu', {
      sender_id: uid,
      recipient_yuyu_id: normalized,
      amount: parsedAmount,
    });

    setSending(false);

    if (rpcError || data !== true) {
      rollback();
      const message = rpcError?.message ?? 'Transfer failed';
      setError(
        /Recipient not found/i.test(message)
          ? 'No member found with that Yuyu ID.'
          : /Insufficient/i.test(message)
            ? 'Not enough Yuyu points for this transfer.'
            : /yourself/i.test(message)
              ? 'You cannot send Yuyu to yourself.'
              : message,
      );
      return;
    }

    setGlow(true);
    toast.success(`+${parsedAmount.toLocaleString()} Yuyu sent`, { duration: 3000 });
    queryClient.invalidateQueries({ queryKey: ['coins', 'balance'] });

    setTimeout(() => {
      setGlow(false);
      onOpenChange(false);
    }, 1100);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md overflow-hidden border-white/10 bg-slate-950 p-0 text-white">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{
            opacity: 1,
            scale: 1,
            boxShadow: glow
              ? '0 0 0 2px rgba(16,185,129,0.9), 0 0 90px 6px rgba(16,185,129,0.55)'
              : '0 0 0 0 rgba(16,185,129,0)',
          }}
          transition={modalSpring}
          className="relative rounded-lg p-6"
        >
          <DialogHeader className="text-left">
            <DialogTitle className="flex items-center gap-2 text-2xl font-black">
              <Send className="h-5 w-5 text-emerald-400" />
              Send Yuyu
            </DialogTitle>
            <DialogDescription className="text-white/60">
              Transfer your Yuyu points to any member using their Yuyu ID.
            </DialogDescription>
          </DialogHeader>

          {myId && (
            <button
              type="button"
              onClick={copyMyId}
              className="mt-4 flex w-full items-center justify-between rounded-2xl border border-white/10 bg-white/[0.04] px-4 py-3 text-left transition-colors hover:border-emerald-400/40"
            >
              <span>
                <span className="block text-[11px] uppercase tracking-[0.18em] text-white/40">Your Yuyu ID</span>
                <span className="font-mono text-lg font-bold text-emerald-300">{myId}</span>
              </span>
              {copied ? <Check className="h-5 w-5 text-emerald-400" /> : <Copy className="h-5 w-5 text-white/40" />}
            </button>
          )}

          <div className="mt-5 space-y-4">
            <div>
              <label htmlFor="yuyu-recipient" className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-white/50">
                Recipient ID
              </label>
              <Input
                id="yuyu-recipient"
                value={recipient}
                onChange={(e) => setRecipient(e.target.value)}
                placeholder="YY-A1B2C3"
                autoComplete="off"
                spellCheck={false}
                className="h-12 border-white/10 bg-white/[0.04] font-mono text-lg uppercase tracking-wider text-white placeholder:text-white/25"
              />
            </div>

            <div>
              <div className="mb-1.5 flex items-center justify-between">
                <label htmlFor="yuyu-amount" className="text-xs font-semibold uppercase tracking-wider text-white/50">
                  Amount
                </label>
                <span className="text-xs text-white/40">
                  Balance: {Math.floor(balance).toLocaleString()} Yuyu
                </span>
              </div>
              <Input
                id="yuyu-amount"
                value={amount}
                inputMode="numeric"
                onChange={(e) => setAmount(e.target.value.replace(/[^0-9]/g, ''))}
                placeholder="100"
                className="h-12 border-white/10 bg-white/[0.04] text-lg font-bold text-white placeholder:text-white/25"
              />
            </div>
          </div>

          <AnimatePresence>
            {error && (
              <motion.p
                initial={{ opacity: 0, y: -4 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                className="mt-3 rounded-xl border border-rose-500/30 bg-rose-500/10 px-3 py-2 text-sm text-rose-300"
              >
                {error}
              </motion.p>
            )}
          </AnimatePresence>

          <Button
            onClick={handleSend}
            disabled={!canSend}
            className="mt-6 h-14 w-full rounded-2xl bg-violet-600 text-lg font-black text-white shadow-lg shadow-violet-950/50 transition-[transform,background-color,box-shadow] hover:scale-[1.01] hover:bg-violet-500 hover:shadow-xl active:scale-[0.99] disabled:bg-violet-600 disabled:text-white disabled:opacity-70"
          >
            {sending ? (
              <>
                <Loader2 className="mr-2 h-5 w-5 animate-spin" /> Sending…
              </>
            ) : (
              <>
                Send {validAmount ? parsedAmount.toLocaleString() : ''} Yuyu
                <ArrowRight className="ml-2 h-5 w-5" />
              </>
            )}
          </Button>

          <p className="mt-3 text-center text-[11px] text-white/35">
            Yuyu points are an in-app gamified reward. Transfers are instant and final.
          </p>
        </motion.div>
      </DialogContent>
    </Dialog>
  );
};

export default SendYuyuModal;
