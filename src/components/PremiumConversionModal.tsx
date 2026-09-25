import { useNavigate } from "@/lib/router-compat";
import { ReferralUnlockModal } from "@/components/ReferralUnlockModal";

export type PremiumConversionContext =
  | "filter_gender"
  | "filter_country"
  | "skip_limit"
  | "skip_wait"
  | "customize";

interface PremiumConversionModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  context: PremiumConversionContext;
  userId?: string | null;
  onSignIn?: () => void;
}

export const PremiumConversionModal = ({
  open,
  onOpenChange,
  context,
  userId,
  onSignIn,
}: PremiumConversionModalProps) => {
  const navigate = useNavigate();

  const handleUpgrade = () => {
    onOpenChange(false);
    navigate("/plan");
  };

  return <ReferralUnlockModal open={open} onOpenChange={onOpenChange} userId={userId} initialTarget={context === "skip_limit" || context === "skip_wait" ? 10 : 5} onUpgrade={handleUpgrade} onSignIn={onSignIn} />;
};
