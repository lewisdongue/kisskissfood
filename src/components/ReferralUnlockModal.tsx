import { useCallback, useEffect, useMemo, useState } from "react";
import { Copy, Crown, ExternalLink, Gift, Sparkles } from "lucide-react";
import toast from "react-hot-toast";
import { supabase } from "@/config/supabase";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Progress } from "@/components/ui/progress";

type ReferralStatus = {
  verified_referrals: number;
  target: number;
  progress: number;
  premium_expires_at: string | null;
};

type ReferralUnlockModalProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  userId?: string | null;
  referralCode?: string | null;
  initialTarget?: 1 | 5 | 10 | 50;
  onUpgrade?: () => void;
  onSignIn?: () => void;
  partnerOfferUrl?: string;
};

const EMPTY_STATUS: ReferralStatus = {
  verified_referrals: 0,
  target: 1,
  progress: 0,
  premium_expires_at: null,
};

export function ReferralUnlockModal({
  open,
  onOpenChange,
  userId,
  referralCode,
  initialTarget = 1,
  onUpgrade,
  onSignIn,
  partnerOfferUrl,
}: ReferralUnlockModalProps) {
  const [status, setStatus] = useState<ReferralStatus>(EMPTY_STATUS);
  const [target, setTarget] = useState<1 | 5 | 10 | 50>(initialTarget);
  const [busy, setBusy] = useState(false);
  const inviteLink = useMemo(
    () => typeof window === "undefined" ? "" : `${window.location.origin}?ref=${referralCode || userId || ""}`,
    [referralCode, userId],
  );

  const loadStatus = useCallback(async () => {
    if (!userId) return;
    const { data, error } = await supabase.rpc("get_referral_unlock_status");
    if (error || !data || typeof data !== "object" || Array.isArray(data)) return;
    const next = data as unknown as ReferralStatus;
    setStatus(next);
    if ([5, 10, 50].includes(next.target)) setTarget(next.target as 5 | 10 | 50);
  }, [userId]);

  useEffect(() => {
    if (!open || !userId) return;
    void loadStatus();
    const channel = supabase
      .channel(`referral-unlock-${userId}-${Math.random().toString(36).slice(2)}`)
      .on("postgres_changes", { event: "INSERT", schema: "public", table: "referrals", filter: `referrer_id=eq.${userId}` }, loadStatus)
      .on("postgres_changes", { event: "UPDATE", schema: "public", table: "users", filter: `id=eq.${userId}` }, loadStatus)
      .subscribe();
    return () => { void supabase.removeChannel(channel); };
  }, [loadStatus, open, userId]);

  useEffect(() => setTarget(initialTarget), [initialTarget, open]);

  const selectCampaign = async (nextTarget: 5 | 10 | 50) => {
    if (!userId) { onSignIn?.(); return; }
    setBusy(true);
    const { error } = await supabase.rpc("start_referral_campaign", { p_target: nextTarget });
    setBusy(false);
    if (error) { toast.error("Could not start the referral challenge."); return; }
    setTarget(nextTarget);
    setStatus((current) => ({ ...current, target: nextTarget, progress: 0 }));
    toast.success(`${nextTarget}-friend challenge started`);
  };

  const copyInvite = async () => {
    if (!userId) { onSignIn?.(); return; }
    await navigator.clipboard.writeText(inviteLink);
    toast.success("Invite link copied");
  };

  const goal = target === 1 ? 1 : target;
  const progress = target === 1 ? Math.min(status.verified_referrals, 1) : Math.min(status.progress, goal);
  const percent = Math.min(100, Math.round((progress / goal) * 100));

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="w-[95vw] max-w-[calc(100vw-1rem)] sm:max-w-5xl max-h-[90dvh] overflow-x-hidden overflow-y-auto rounded-2xl border border-zinc-800 bg-zinc-950 p-4 shadow-2xl sm:p-8">
        <DialogHeader className="min-w-0 pr-10 text-center sm:pr-0">
          <DialogTitle className="flex min-w-0 flex-wrap items-center justify-center gap-2 break-words text-lg font-bold text-foreground sm:text-2xl">
            <Crown className="h-6 w-6 shrink-0 text-amber-400" /> Unlock Premium your way
          </DialogTitle>
          <DialogDescription className="break-words">Pay normally, or invite verified friends and unlock it free.</DialogDescription>
        </DialogHeader>

        <div className={`flex min-w-0 flex-col gap-4 sm:grid ${partnerOfferUrl ? "sm:grid-cols-3" : "sm:grid-cols-2"}`}>
          <section className="min-w-0 rounded-lg border border-border bg-card p-4">
            <p className="text-xs font-bold uppercase text-muted-foreground">Standard</p>
            <h3 className="mt-2 text-lg font-extrabold text-card-foreground">Regular Premium</h3>
            <p className="mt-1 text-2xl font-black text-card-foreground">$21.99<span className="text-sm font-semibold text-muted-foreground">/mo</span></p>
            <Button onClick={onUpgrade} className="mt-5 w-full font-bold">Upgrade</Button>
          </section>

          <section className="min-w-0 rounded-lg border border-amber-400/40 bg-card p-4 shadow-[0_0_28px_color-mix(in_oklab,var(--color-amber-400)_28%,transparent)]">
            <p className="flex items-center gap-1.5 text-xs font-extrabold uppercase text-amber-400"><Gift className="h-4 w-4" /> Free alternative</p>
            <h3 className="mt-2 text-lg font-extrabold text-card-foreground">Invite friends. Pay nothing.</h3>
            <p className="mt-1 text-sm text-muted-foreground">Every verified friend adds 1 Premium day. Complete a challenge for 30 extra days.</p>
            <div className="mt-4 grid min-w-0 grid-cols-1 gap-2 min-[360px]:grid-cols-3">
              {([5, 10, 50] as const).map((value) => (
                <Button key={value} disabled={busy} variant={target === value ? "default" : "outline"} onClick={() => void selectCampaign(value)} className="min-w-0 px-2 text-xs font-bold">
                  {value} friends
                </Button>
              ))}
            </div>
            <div className="mt-4 flex items-center justify-between text-xs font-bold text-card-foreground"><span>{progress} / {goal} verified</span><span>{percent}%</span></div>
            <Progress value={percent} className="mt-2 h-2.5 bg-muted [&_[data-slot=progress-indicator]]:bg-amber-400" />
            <div className="mt-4 flex min-w-0 gap-2">
              <div className="min-w-0 flex-1 truncate rounded-md border border-border bg-muted px-3 py-2 text-xs text-muted-foreground">{userId ? inviteLink : "Sign in to get your link"}</div>
              <Button onClick={() => void copyInvite()} size="icon" aria-label="Copy referral link" className="shrink-0 bg-amber-400 text-amber-950 hover:bg-amber-300"><Copy className="h-4 w-4" /></Button>
            </div>
            {status.premium_expires_at && new Date(status.premium_expires_at).getTime() > Date.now() && (
              <p className="mt-3 flex items-center justify-center gap-1 text-xs font-bold text-amber-400"><Sparkles className="h-3.5 w-3.5" /> Active until {new Date(status.premium_expires_at).toLocaleDateString()}</p>
            )}
          </section>

          {partnerOfferUrl && (
            <section className="min-w-0 rounded-lg border border-border bg-card p-4">
              <p className="text-xs font-bold uppercase text-muted-foreground">Partner option</p>
              <h3 className="mt-2 text-lg font-extrabold text-card-foreground">Complete a partner offer</h3>
              <p className="mt-1 text-sm text-muted-foreground">
                Opens in a new tab. Access is granted only after the partner confirms completion.
              </p>
              <Button
                type="button"
                variant="outline"
                className="mt-5 w-full font-bold"
                onClick={() => window.open(partnerOfferUrl, "_blank", "noopener,noreferrer")}
              >
                <ExternalLink className="h-4 w-4" aria-hidden />
                View partner offer
              </Button>
            </section>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}