import React from "react";
import { useTranslation } from "react-i18next";
import { Crown, GraduationCap, ShieldCheck } from "lucide-react";

export type PlanType = "lifetime" | "student" | "regular" | "premium";

interface PremiumActivatedButtonProps {
  subscriptionType?: string | null;
  size?: "default" | "compact";
}

const PAID_PLANS: PlanType[] = ["lifetime", "student", "regular", "premium"];

function getPlanType(subscriptionType?: string | null): PlanType | null {
  const raw = subscriptionType?.toLowerCase() || "";
  return PAID_PLANS.includes(raw as PlanType) ? (raw as PlanType) : null;
}

function getPlanStyle(plan: PlanType) {
  switch (plan) {
    case "lifetime":
      return {
        className: "from-amber-500 to-yellow-600 shadow-amber-400/50 hover:shadow-amber-500/60",
        compactClass: "from-amber-500 to-yellow-600",
        Icon: Crown,
      };
    case "student":
      return {
        className: "from-emerald-500 to-green-600 shadow-emerald-400/50 hover:shadow-emerald-500/60",
        compactClass: "from-emerald-500 to-green-600",
        Icon: GraduationCap,
      };
    case "regular":
    case "premium":
    default:
      return {
        className: "from-blue-500 to-indigo-600 shadow-blue-400/50 hover:shadow-blue-500/60",
        compactClass: "from-blue-500 to-indigo-600",
        Icon: ShieldCheck,
      };
  }
}

const PremiumActivatedButton: React.FC<PremiumActivatedButtonProps> = ({
  subscriptionType,
  size = "default",
}) => {
  const { t } = useTranslation();
  const plan = getPlanType(subscriptionType);

  if (!plan) return null;

  const style = getPlanStyle(plan);
  const Icon = style.Icon;

  const label =
    plan === "lifetime"
      ? t("common.planFounder", { defaultValue: "Founder" })
      : plan === "student"
        ? t("common.planStudent", { defaultValue: "Student" })
        : t("common.planProfessional", { defaultValue: "Professional" });

  const buttonClass =
    size === "compact"
      ? `relative z-10 h-11 min-w-[82px] px-2 rounded-xl bg-gradient-to-r ${style.compactClass} text-white text-[10px] font-bold shadow-md hover:shadow-lg transition-transform flex items-center justify-center gap-1 whitespace-nowrap`
      : `relative z-10 h-12 sm:h-14 px-5 sm:px-7 rounded-full bg-gradient-to-r ${style.className} text-white text-sm sm:text-base font-bold shadow-lg hover:scale-105 hover:shadow-xl transition-transform flex items-center gap-2 whitespace-nowrap`;

  return (
    <div className="relative inline-block">
      <span className={buttonClass}>
        <Icon className={size === "compact" ? "w-3 h-3" : "w-4 h-4"} />
        {label}
      </span>
    </div>
  );
};

export default PremiumActivatedButton;
