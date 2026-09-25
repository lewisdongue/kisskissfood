# caakus-chat Edge Function

AI chatbot for Caakus — proxies to Anthropic Claude API.

## Setup

1. **Add the secret in Supabase:**
   ```bash
   supabase secrets set ANTHROPIC_API_KEY=sk-ant-api03-your-key-here
   ```

2. **Deploy the function:**
   ```bash
   supabase functions deploy caakus-chat
   ```

## Usage

The frontend `CaakusChatWidget` calls this function via `api.post("caakus-chat", { messages }, { isGuest: true })`.

- **Body:** `{ messages: [{ role: "user"|"assistant", content: string }] }`
- **Response:** `{ reply: string }`

## Security

- API key is stored as a Supabase secret (never exposed to client)
- CORS allows requests from your app origin
- No auth required — chat is available to all visitors
