import { createFileRoute } from "@tanstack/react-router";

const GREETINGS: Record<string, string> = {
  en: "Hey, you are unique.",
  fr: "Hey, tu es unique.",
  es: "Hola, eres único.",
  de: "Hey, du bist einzigartig.",
  pt: "Oi, você é único.",
  ar: "مرحبًا، أنت فريد.",
  zh: "嘿，你是独一无二的。",
  hi: "नमस्ते, आप अद्वितीय हैं।",
  yo: "Bawo, o jẹ́ àrà ọ̀tọ̀.",
  ig: "Ndewo, ị bụ ihe pụrụ iche.",
  ha: "Sannu, kai na musamman ne.",
};

export const Route = createFileRoute("/api/greeting")({
  server: {
    handlers: {
      GET: async ({ request }) => {
        const url = new URL(request.url);
        const base = (url.searchParams.get("lang") || "en").toLowerCase().split("-")[0];
        const text = GREETINGS[base] ?? GREETINGS["en"];

        const apiKey = process.env["LOVABLE_API_KEY"];
        if (!apiKey) return new Response("missing key", { status: 500 });

        const res = await fetch("https://ai.gateway.lovable.dev/v1/audio/speech", {
          method: "POST",
          headers: { Authorization: `Bearer ${apiKey}`, "Content-Type": "application/json" },
          body: JSON.stringify({
            model: "openai/gpt-4o-mini-tts",
            input: text,
            voice: "shimmer",
            instructions:
              "Speak as a warm, soft, natural young woman. Gentle, sincere, slightly playful compliment. Never robotic, never rushed.",
            response_format: "mp3",
            stream_format: "audio",
          }),
        });

        if (!res.ok) {
          const detail = await res.text().catch(() => "");
          return new Response(detail || "tts failed", { status: res.status });
        }

        return new Response(res.body, {
          headers: {
            "Content-Type": "audio/mpeg",
            "Cache-Control": "public, max-age=86400",
          },
        });
      },
    },
  },
});
