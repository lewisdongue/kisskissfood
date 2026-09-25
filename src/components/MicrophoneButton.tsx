import { useState } from "react";
import { Button } from "@/components/ui/button";

export default function MicrophoneButton() {
  const [micGranted, setMicGranted] = useState(false);

  const handleRequestMic = async () => {
    try {
      await navigator.mediaDevices.getUserMedia({ audio: true });
      setMicGranted(true);
      console.log("Microphone access granted");
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
    } catch (err) {
      setMicGranted(false);
      console.log("Microphone access denied or blocked");
      alert(
        "Please allow microphone access in your browser settings to continue."
      );
    }
  };

  if (micGranted) return null;

  return (
    <Button
      variant="default"
      onClick={handleRequestMic}
      className="mb-4 border-2 bg-purple-500/20 rounded-2xl group-hover:bg-purple-500/30 transition-colors text-white"
    >
      Enable Microphone
    </Button>
  );
}
