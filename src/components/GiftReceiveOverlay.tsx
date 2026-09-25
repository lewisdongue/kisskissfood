import { useCallback, useEffect, useRef, useState } from "react";
import confetti from "canvas-confetti";
import { useRealtimeGift } from "../hooks/useRealtimeGift";
import { GiftFloatingAnimation } from "./GiftFloatingAnimation";

export const GiftReceiveOverlay = () => {
  useEffect(() => {
    console.log("[GiftReceiveOverlay] Mounted");
  }, []);

  const [showAnimation, setShowAnimation] = useState(false);
  const [giftItem, setGiftItem] = useState("");
  const [giftSender, setGiftSender] = useState("");
  const [giftAmount, setGiftAmount] = useState(0);
  const [giftMessage, setGiftMessage] = useState("");
  const lastHandledGiftIdRef = useRef<string | null>(null);

  const handleGift = useCallback((gift: { id?: string; sender?: { full_name?: string; username?: string }; item_name?: string; amount?: number; message?: string | null }) => {
    if (!gift) return;
    if (gift.id && lastHandledGiftIdRef.current === gift.id) return;
    if (gift.id) lastHandledGiftIdRef.current = gift.id;

    if ((window as any).__caakusCallScreenActive) return;

    const senderName = gift.sender?.full_name || gift.sender?.username || "Someone";
    const itemName = gift.item_name || "Gift";

    setGiftItem(itemName);
    setGiftSender(senderName);
    setGiftAmount(Number(gift.amount) || 0);
    setGiftMessage(gift.message || "");
    setShowAnimation(true);

    confetti({
      particleCount: 120,
      spread: 70,
      origin: { y: 0.6 },
      colors: ["#ff0080", "#ff8800", "#ffdd00", "#8800ff", "#0088ff"],
    });
  }, []);

  useRealtimeGift(handleGift);

  if (!showAnimation) return null;

  const detail = `${giftSender} · +$${giftAmount.toFixed(2)}${giftMessage ? ` · ${giftMessage}` : ""}`;

  return (
    <GiftFloatingAnimation
      itemName={giftItem}
      variant="received"
      subtitle="Gift received! Congratulations!"
      detail={detail}
      onComplete={() => setShowAnimation(false)}
    />
  );
};
