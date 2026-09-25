import { useEffect } from 'react';
import { Helmet } from "@/lib/helmet";

interface VoiceMessageMetaProps {
  messageId?: string;
  title?: string;
  description?: string;
  audioUrl?: string;
  duration?: number;
  waveformImage?: string;
  author?: string;
}

/**
 * VoiceMessageMeta Component
 * 
 * Dynamically generates Open Graph and Twitter Card meta tags for voice messages.
 * This enables rich previews when sharing on social networks like Facebook, Twitter, LinkedIn, etc.
 * 
 * IMPORTANT: For full functionality in production, you need server-side rendering (SSR).
 * Social media crawlers don't execute JavaScript, so they won't see client-side meta tags.
 * 
 * Production Options:
 * 1. Use a meta tag service like Prerender.io or Rendertron
 * 2. Implement SSR with Next.js or similar framework
 * 3. Use edge functions (Vercel, Netlify, Cloudflare Workers) to generate meta tags
 * 4. Use a reverse proxy that intercepts crawler requests and serves pre-rendered HTML
 */
export const VoiceMessageMeta: React.FC<VoiceMessageMetaProps> = ({
  messageId,
  title = 'Listen to this amazing voice message on Caakus!',
  description = 'Join Caakus to discover and share voice messages from around the world.',
  audioUrl,
  duration,
  waveformImage = 'https://caakus.com/og-image-voice.png', // Default OG image
  author = 'Anonymous Creator'
}) => {
  const baseUrl = 'https://caakus.com';
  const url = messageId ? `${baseUrl}/voice/${messageId}` : baseUrl;
  
  // Format duration for display
  const formatDuration = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };
  
  const durationText = duration ? ` (${formatDuration(duration)})` : '';
  const fullTitle = `🎙️ ${title}${durationText}`;
  const fullDescription = `${description}\n\nCreated by ${author} on Caakus Voice Studio`;

  return (
    <Helmet>
      {/* Primary Meta Tags */}
      <title>{fullTitle}</title>
      <meta name="title" content={fullTitle} />
      <meta name="description" content={fullDescription} />

      {/* Open Graph / Facebook */}
      <meta property="og:type" content="music.song" />
      <meta property="og:url" content={url} />
      <meta property="og:title" content={fullTitle} />
      <meta property="og:description" content={fullDescription} />
      <meta property="og:image" content={waveformImage} />
      <meta property="og:image:width" content="1200" />
      <meta property="og:image:height" content="630" />
      <meta property="og:site_name" content="Caakus Voice Studio" />
      
      {/* Audio specific OG tags */}
      {audioUrl && (
        <>
          <meta property="og:audio" content={audioUrl} />
          <meta property="og:audio:type" content="audio/mpeg" />
        </>
      )}
      
      {duration && (
        <meta property="music:duration" content={duration.toString()} />
      )}

      {/* Twitter Card */}
      <meta name="twitter:card" content="player" />
      <meta name="twitter:url" content={url} />
      <meta name="twitter:title" content={fullTitle} />
      <meta name="twitter:description" content={fullDescription} />
      <meta name="twitter:image" content={waveformImage} />
      <meta name="twitter:player" content={`${baseUrl}/voice/${messageId}/player`} />
      <meta name="twitter:player:width" content="480" />
      <meta name="twitter:player:height" content="270" />
      <meta name="twitter:player:stream" content={audioUrl || ''} />
      <meta name="twitter:player:stream:content_type" content="audio/mpeg" />

      {/* Additional Meta Tags for better SEO */}
      <meta name="author" content={author} />
      <meta name="robots" content="index, follow" />
      <meta name="keywords" content="voice message, audio content, podcast, social audio, voice social network, caakus" />
      
      {/* WhatsApp / Telegram specific */}
      <meta property="og:audio:title" content={title} />
      <meta property="og:audio:artist" content={author} />
      
      {/* LinkedIn */}
      <meta property="article:author" content={author} />
      
      {/* Schema.org structured data for rich snippets */}
      <script type="application/ld+json">
        {JSON.stringify({
          "@context": "https://schema.org",
          "@type": "AudioObject",
          "name": title,
          "description": description,
          "url": url,
          "contentUrl": audioUrl,
          "duration": duration ? `PT${duration}S` : undefined,
          "encodingFormat": "audio/mpeg",
          "author": {
            "@type": "Person",
            "name": author
          },
          "publisher": {
            "@type": "Organization",
            "name": "Caakus",
            "logo": {
              "@type": "ImageObject",
              "url": `${baseUrl}/logo.png`
            }
          },
          "thumbnailUrl": waveformImage,
          "uploadDate": new Date().toISOString(),
          "interactionStatistic": {
            "@type": "InteractionCounter",
            "interactionType": "https://schema.org/ListenAction",
            "userInteractionCount": 0
          }
        })}
      </script>
    </Helmet>
  );
};

export default VoiceMessageMeta;

