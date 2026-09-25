import { useState } from "react";
import { MessageCircle, Users, Copy, CheckCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { toast } from "sonner";

interface InnerCircleAccessProps {
  userName?: string;
}

export function InnerCircleAccess({ userName }: InnerCircleAccessProps) {
  const [copiedWhatsApp, setCopiedWhatsApp] = useState(false);
  const [copiedTelegram, setCopiedTelegram] = useState(false);

  // TODO: Replace with actual group invite links
  const whatsAppLink = "https://chat.whatsapp.com/FOUNDER_CLUB_LINK";
  const telegramLink = "https://t.me/+FOUNDER_CLUB_LINK";

  const handleCopy = async (link: string, type: "whatsapp" | "telegram") => {
    try {
      await navigator.clipboard.writeText(link);
      if (type === "whatsapp") {
        setCopiedWhatsApp(true);
        setTimeout(() => setCopiedWhatsApp(false), 2000);
      } else {
        setCopiedTelegram(true);
        setTimeout(() => setCopiedTelegram(false), 2000);
      }
      toast.success(`${type === "whatsapp" ? "WhatsApp" : "Telegram"} link copied!`);
    } catch (err) {
      toast.error("Failed to copy link");
    }
  };

  return (
    <Card className="relative overflow-hidden bg-gradient-to-br from-yellow-50/90 to-amber-100/90 dark:from-amber-950/60 dark:to-yellow-900/60 border-2 border-yellow-300/60 dark:border-yellow-700/50 p-6 shadow-2xl">
      {/* Animated background effect */}
      <div className="absolute inset-0 opacity-20 bg-[radial-gradient(circle_at_top_right,_rgba(251,191,36,0.4),_transparent_70%)]" />
      
      <div className="relative z-10 space-y-6">
        {/* Header */}
        <div className="flex items-center gap-3">
          <div className="p-3 bg-gradient-to-br from-yellow-400 to-amber-500 rounded-full shadow-lg animate-pulse">
            <Users className="h-6 w-6 text-black" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-gray-900 dark:text-white">
              🎉 Welcome to the Inner Circle!
            </h2>
            <p className="text-sm text-gray-700 dark:text-gray-300">
              Exclusive access for Founding Members
            </p>
          </div>
        </div>

        {/* Description */}
        <div className="bg-white/50 dark:bg-black/20 rounded-lg p-4 space-y-2">
          <p className="text-sm text-gray-800 dark:text-gray-200 font-medium">
            As a Founding Member, you get:
          </p>
          <ul className="text-sm text-gray-700 dark:text-gray-300 space-y-1.5 ml-4">
            <li className="flex items-start gap-2">
              <span className="text-yellow-600 dark:text-yellow-400 mt-0.5">✓</span>
              <span>Vote on upcoming features and roadmap priorities</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-yellow-600 dark:text-yellow-400 mt-0.5">✓</span>
              <span>Direct communication with the founder</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-yellow-600 dark:text-yellow-400 mt-0.5">✓</span>
              <span>Early access to beta features</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-yellow-600 dark:text-yellow-400 mt-0.5">✓</span>
              <span>Quarterly group meetings + 1 on 1 with the Founder</span>
            </li>
          </ul>
        </div>

        {/* WhatsApp Invite */}
        <div className="space-y-2">
          <div className="flex items-center gap-2 text-sm font-semibold text-gray-900 dark:text-white">
            <MessageCircle className="h-4 w-4 text-green-600 dark:text-green-400" />
            <span>WhatsApp Group</span>
          </div>
          <div className="flex gap-2">
            <Button
              onClick={() => window.open(whatsAppLink, "_blank")}
              className="flex-1 bg-green-600 hover:bg-green-700 text-white shadow-lg"
            >
              <MessageCircle className="h-4 w-4 mr-2" />
              Join WhatsApp
            </Button>
            <Button
              onClick={() => handleCopy(whatsAppLink, "whatsapp")}
              variant="outline"
              size="icon"
              className="border-green-600 text-green-600 hover:bg-green-50 dark:hover:bg-green-950"
            >
              {copiedWhatsApp ? (
                <CheckCircle className="h-4 w-4" />
              ) : (
                <Copy className="h-4 w-4" />
              )}
            </Button>
          </div>
        </div>

        {/* Telegram Invite */}
        <div className="space-y-2">
          <div className="flex items-center gap-2 text-sm font-semibold text-gray-900 dark:text-white">
            <MessageCircle className="h-4 w-4 text-blue-600 dark:text-blue-400" />
            <span>Telegram Group</span>
          </div>
          <div className="flex gap-2">
            <Button
              onClick={() => window.open(telegramLink, "_blank")}
              className="flex-1 bg-blue-600 hover:bg-blue-700 text-white shadow-lg"
            >
              <MessageCircle className="h-4 w-4 mr-2" />
              Join Telegram
            </Button>
            <Button
              onClick={() => handleCopy(telegramLink, "telegram")}
              variant="outline"
              size="icon"
              className="border-blue-600 text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-950"
            >
              {copiedTelegram ? (
                <CheckCircle className="h-4 w-4" />
              ) : (
                <Copy className="h-4 w-4" />
              )}
            </Button>
          </div>
        </div>

        {/* Footer Note */}
        <div className="text-xs text-center text-gray-600 dark:text-gray-400 pt-2 border-t border-yellow-300/40 dark:border-yellow-700/40">
          These links are exclusive to Founding Members only. Please don't share them publicly.
        </div>
      </div>
    </Card>
  );
}

