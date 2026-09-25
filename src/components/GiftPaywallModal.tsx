import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { ShieldCheck, Sparkles } from "lucide-react";
import { PremiumButton } from "./PremiumButton";

interface GiftPaywallModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  variant?: "send" | "receive";
}

export const GiftPaywallModal = ({ open, onOpenChange, variant = "send" }: GiftPaywallModalProps) => {
  const title =
    variant === "receive" ? "Premium required to receive gifts" : "Premium required to send gifts";
  const description =
    variant === "receive"
      ? "Upgrade to unlock exclusive gifting benefits and receive luxury gifts from top donors."
      : "Upgrade to unlock gifting and send premium gifts that boost your status.";

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="w-[95%] sm:max-w-lg rounded-3xl bg-gradient-to-br from-white via-indigo-50/60 to-purple-50/70 dark:from-gray-950 dark:via-indigo-950/40 dark:to-purple-950/50 border border-white/30 dark:border-white/10 shadow-2xl">
        <DialogHeader>
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-500 text-white flex items-center justify-center shadow-lg">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <DialogTitle className="text-lg sm:text-xl font-bold text-gray-900 dark:text-white">
              {title}
            </DialogTitle>
          </div>
          <DialogDescription className="text-sm text-gray-600 dark:text-gray-300 mt-2">
            {description}
          </DialogDescription>
        </DialogHeader>

        <div className="mt-4 flex items-center gap-2 rounded-2xl bg-white/70 dark:bg-gray-900/60 border border-indigo-200/50 dark:border-indigo-800/40 px-4 py-3 text-sm text-indigo-700 dark:text-indigo-200">
          <Sparkles className="w-4 h-4" />
          Premium plans include Student and Regular tiers.
        </div>

        <div className="mt-6 flex items-center gap-3">
          <PremiumButton />
          <button
            className="h-9 px-4 rounded-lg text-sm font-medium text-gray-700 dark:text-gray-200 bg-gray-200/70 dark:bg-gray-800/70 hover:bg-gray-300 dark:hover:bg-gray-700 transition-all"
            onClick={() => onOpenChange(false)}
          >
            Not now
          </button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

