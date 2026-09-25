import React, { useState } from "react";
import { MessageCircle } from "lucide-react";
import { MessengerPanel } from "./MessengerPanel";
import { useUnreadMessages } from "@/hooks/useUnreadMessages";
import { useTranslation } from "react-i18next";

interface MessengerFABProps {
  /** Position relative to a `position: relative` parent container */
  position?: "bottom-right" | "bottom-left";
}

export const MessengerFAB: React.FC<MessengerFABProps> = ({
  position = "bottom-right",
}) => {
  const [open, setOpen] = useState(false);
  const { total: totalUnread, refresh } = useUnreadMessages();
  const { t } = useTranslation();

  const posClass =
    position === "bottom-right"
      ? "bottom-4 right-4"
      : "bottom-4 left-4";
  return (
    <>
      {/* Floating Action Button */}
      <div className={`fixed ${posClass} z-[9990]`}>
        {/* Pulse ring when there are unread messages */}
        {totalUnread > 0 && !open && (
          <span className="absolute inset-0 rounded-full animate-ping bg-indigo-500 opacity-30 pointer-events-none" />
        )}

        <button
          onClick={() => setOpen((v) => !v)}
          aria-label={t("globalConnection.title")}
          className={`relative w-11 h-11 rounded-full flex items-center justify-center shadow-2xl transition-all duration-300 active:scale-95 focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-400 ${
            open
              ? "bg-gradient-to-br from-indigo-600 to-purple-700 scale-95 rotate-12"
              : "bg-gradient-to-br from-indigo-500 to-purple-600 hover:scale-110 hover:shadow-indigo-500/40"
          }`}
          style={{
            boxShadow: open
              ? "0 8px 32px rgba(99,102,241,0.5)"
              : "0 8px 24px rgba(99,102,241,0.35)",
          }}
        >
          <MessageCircle
            className={`w-5 h-5 text-white transition-transform duration-300 ${open ? "scale-90" : ""}`}
          />

          {/* Unread badge */}
          {totalUnread > 0 && (
            <span className="absolute -top-1.5 -right-1.5 min-w-[20px] h-5 px-1 bg-gradient-to-br from-rose-500 to-pink-600 text-white text-[11px] font-black rounded-full flex items-center justify-center shadow-lg border-2 border-slate-950 leading-none">
              {totalUnread > 9 ? "9+" : totalUnread}
            </span>
          )}
        </button>

        {/* Tooltip label — only visible on desktop hover when closed */}
        {!open && (
          <div className={`absolute bottom-full mb-2 hidden sm:block pointer-events-none ${position === "bottom-right" ? "right-0" : "left-0"}`}>
            <div className="relative bg-slate-900/95 text-white text-xs font-semibold px-3 py-1.5 rounded-lg shadow-xl border border-white/10 whitespace-nowrap">
              {t("globalConnection.title")}
              {totalUnread > 0 && (
                <span className="ml-1.5 bg-indigo-500/30 text-indigo-300 border border-indigo-500/40 rounded-full px-1.5 py-0.5 text-[10px]">
                  {totalUnread} new
                </span>
              )}
              <div className={`absolute top-full border-4 border-transparent border-t-slate-900/95 ${position === "bottom-right" ? "right-4" : "left-4"}`} />
            </div>
          </div>
        )}
      </div>

      {/* Messenger slide-up panel */}
      <MessengerPanel
        isOpen={open}
        onClose={() => {
          setOpen(false);
          refresh();
        }}
        onUnreadChange={refresh}
        anchor={position === "bottom-left" ? "bottom-left" : "bottom-right"}
      />
    </>
  );
};
