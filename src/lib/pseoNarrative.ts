// ═══════════════════════════════════════════════════════════════════════════
// CAAKUS DEEP NARRATIVE ENGINE
// Layer on top of the deterministic assembly engine: tone-aware narrative,
// SSR social-proof feed, localized leaderboard and a 50+ FAQ pool.
// Pure functions — identical output on server and client for the same inputs.
// ═══════════════════════════════════════════════════════════════════════════

import { DEFAULT_LANGUAGE, type PseoCategory, type PseoLanguage, type PseoLocation } from "@/data/pseoData";
import { categoryLabel, formatUtc, murmurHash3 } from "@/lib/pseo";

type Lang = string;

function pick<T>(list: readonly T[], hash: number, salt: number): T {
  return list[(hash >>> salt) % list.length] as T;
}

function pickNumber(hash: number, salt: number, min: number, max: number): number {
  return min + ((hash >>> salt) % (max - min + 1));
}

// ── Tone profiles ──────────────────────────────────────────────────────────

export type Tone = "gamer" | "creative" | "academic" | "social" | "pro";

const TONE_BY_CATEGORY: Record<string, Tone> = {
  gamers: "gamer",
  streamers: "gamer",
  "anime-fans": "gamer",
  "night-owls": "gamer",
  "late-night-talks": "social",
  artists: "creative",
  musicians: "creative",
  creators: "creative",
  dancers: "creative",
  photographers: "creative",
  "film-fans": "creative",
  students: "academic",
  "students-abroad": "academic",
  "study-buddies": "academic",
  "language-partners": "academic",
  "english-practice": "academic",
  "book-lovers": "academic",
  developers: "pro",
  entrepreneurs: "pro",
  expats: "pro",
  travelers: "social",
  foodies: "social",
  "coffee-chats": "social",
  "new-friends": "social",
  "football-fans": "social",
  "fitness-fans": "social",
};

export function toneFor(categorySlug: string): Tone {
  return TONE_BY_CATEGORY[categorySlug] ?? "social";
}

// ── Regional internet-culture context (factual, neutral) ───────────────────

const CULTURE: Record<string, { en: string; fr: string; es: string }> = {
  JP: {
    en: "late-night browsing is a habit here, and most people join from a phone on mobile data",
    fr: "la navigation tardive est une habitude ici, et la plupart se connectent depuis un téléphone",
    es: "navegar de madrugada es costumbre aquí, y la mayoría entra desde el móvil",
  },
  KR: {
    en: "mobile-first internet use is the norm, so the browser camera works without any setup",
    fr: "l'usage mobile domine, la caméra du navigateur fonctionne donc sans installation",
    es: "el uso móvil domina, así que la cámara del navegador funciona sin instalar nada",
  },
  BR: {
    en: "evenings are the busiest social window, and conversations often switch between Portuguese and English",
    fr: "les soirées sont le créneau social le plus actif, entre portugais et anglais",
    es: "las noches son la franja social más activa, entre portugués e inglés",
  },
  IN: {
    en: "multilingual chats are normal here — people switch languages mid-conversation without friction",
    fr: "les échanges multilingues sont la norme : on change de langue en pleine conversation",
    es: "las charlas multilingües son normales: se cambia de idioma sin fricción",
  },
  US: {
    en: "desktop and phone traffic split roughly evenly, and English is the default meeting language",
    fr: "le trafic se partage entre ordinateur et téléphone, l'anglais reste la langue par défaut",
    es: "el tráfico se reparte entre ordenador y móvil, y el inglés es el idioma por defecto",
  },
  FR: {
    en: "conversations pick up after dinner, later than in most neighbouring countries",
    fr: "les conversations démarrent après le dîner, plus tard que chez la plupart des voisins",
    es: "las conversaciones arrancan después de cenar, más tarde que en los países vecinos",
  },
  DE: {
    en: "people tend to join in shorter, focused sessions rather than long open-ended ones",
    fr: "les sessions sont plutôt courtes et ciblées que longues et ouvertes",
    es: "las sesiones suelen ser cortas y concretas más que largas y abiertas",
  },
  NG: {
    en: "mobile data is the main connection, so Caakus stays light and works on a single browser tab",
    fr: "la connexion passe surtout par la data mobile : Caakus reste léger dans un simple onglet",
    es: "la conexión es sobre todo por datos móviles: Caakus es ligero en una sola pestaña",
  },
  ID: {
    en: "phone-only users are the majority, and the front camera opens straight from the browser",
    fr: "les utilisateurs uniquement mobiles sont majoritaires, la caméra frontale s'ouvre direct",
    es: "predominan los usuarios solo de móvil y la cámara frontal se abre desde el navegador",
  },
  GB: {
    en: "traffic peaks on weekday evenings and again late on weekends",
    fr: "le trafic culmine en soirée en semaine, puis tard le week-end",
    es: "el tráfico sube entre semana por la noche y de nuevo tarde el fin de semana",
  },
};

const CULTURE_FALLBACK = {
  en: "most people join straight from a phone browser, with no app store step in between",
  fr: "la plupart se connectent directement depuis le navigateur du téléphone, sans passer par un store",
  es: "la mayoría entra directamente desde el navegador del móvil, sin pasar por una tienda de apps",
};

function cultureNote(countryCode: string, lang: Lang): string {
  const entry = CULTURE[countryCode] ?? CULTURE_FALLBACK;
  return (entry as Record<string, string>)[lang] ?? entry.en;
}

// ── Narrative hooks per tone (structure + voice both vary) ─────────────────

type Ctx = {
  c: string; // category label
  l: string; // city
  country: string;
  peak: string;
  utc: string;
  culture: string;
};

type Tpl = (x: Ctx) => string;

const HOOKS: Record<Tone, Record<Lang, Tpl[]>> = {
  gamer: {
    en: [
      (x) => `It is ${x.peak} in ${x.l} and the ${x.c} queue is already moving. Caakus drops you into a live camera conversation in about two seconds — no install, no lobby, no account wall.`,
      (x) => `Bored of one-way feeds? ${x.l} ${x.c} use Caakus the way you would use a quick match: press once, talk, skip, repeat. The browser handles the camera, nothing gets downloaded.`,
      (x) => `Caakus is the fastest way to end up face to face with ${x.c} in ${x.l}. One tap connects you; one more skips to the next person. No queue timer, no ranked grind.`,
      (x) => `${x.l} runs on ${x.utc}, which means the ${x.c} room here fills up while half the planet is asleep. That is exactly why matches land so fast around ${x.peak}.`,
    ],
    fr: [
      (x) => `Il est ${x.peak} à ${x.l} et la file des ${x.c} bouge déjà. Caakus vous place en conversation caméra en deux secondes : rien à installer, pas de lobby, pas de compte obligatoire.`,
      (x) => `Marre des flux à sens unique ? Les ${x.c} de ${x.l} utilisent Caakus comme une partie rapide : un clic, on parle, on passe, on recommence. La caméra s'ouvre dans le navigateur.`,
      (x) => `Caakus est le chemin le plus court vers un face-à-face avec des ${x.c} à ${x.l}. Un tap pour se connecter, un autre pour passer au suivant.`,
      (x) => `${x.l} est en ${x.utc} : la salle des ${x.c} se remplit quand la moitié de la planète dort. D'où des mises en relation très rapides vers ${x.peak}.`,
    ],
    es: [
      (x) => `Son las ${x.peak} en ${x.l} y la cola de ${x.c} ya se mueve. Caakus te pone en videollamada en unos dos segundos: sin instalar, sin sala de espera, sin registro obligatorio.`,
      (x) => `¿Cansado de feeds unidireccionales? Los ${x.c} de ${x.l} usan Caakus como una partida rápida: un toque, hablas, saltas, repites.`,
      (x) => `Caakus es la vía más corta para acabar cara a cara con ${x.c} en ${x.l}. Un toque conecta, otro salta a la siguiente persona.`,
      (x) => `${x.l} está en ${x.utc}: la sala de ${x.c} se llena mientras medio planeta duerme. Por eso los emparejamientos son tan rápidos hacia las ${x.peak}.`,
    ],
  },
  creative: {
    en: [
      (x) => `Showing work to a stranger changes how you see it. Caakus connects you with ${x.c} in ${x.l} in a live camera conversation that starts in the browser, seconds after you open it.`,
      (x) => `In ${x.l}, ${x.c} use Caakus as a sketchbook for conversation: short, unplanned exchanges with people who make things, from ${x.country} and 190+ other countries.`,
      (x) => `Caakus removes the studio door. Meet ${x.c} from ${x.l} face to face, share what you are working on, and move to the next conversation whenever you want.`,
      (x) => `Every conversation with ${x.c} in ${x.l} starts the same way — camera on, no profile to polish first. Around ${x.peak} local time the room is at its widest.`,
    ],
    fr: [
      (x) => `Montrer son travail à un inconnu change le regard qu'on porte dessus. Caakus vous met en visio avec des ${x.c} à ${x.l}, directement depuis le navigateur.`,
      (x) => `À ${x.l}, les ${x.c} utilisent Caakus comme un carnet de croquis conversationnel : des échanges courts et non préparés avec des gens qui créent.`,
      (x) => `Caakus enlève la porte de l'atelier. Rencontrez des ${x.c} de ${x.l} en face à face et passez à la suite quand vous voulez.`,
      (x) => `Chaque conversation avec des ${x.c} à ${x.l} commence pareil : caméra allumée, aucun profil à peaufiner. Vers ${x.peak}, la salle est au plus large.`,
    ],
    es: [
      (x) => `Enseñar tu trabajo a un desconocido cambia cómo lo ves. Caakus te conecta con ${x.c} en ${x.l} por vídeo, directo desde el navegador.`,
      (x) => `En ${x.l}, los ${x.c} usan Caakus como un cuaderno de bocetos conversacional: intercambios cortos con gente que crea.`,
      (x) => `Caakus quita la puerta del estudio. Conoce ${x.c} de ${x.l} cara a cara y pasa a la siguiente conversación cuando quieras.`,
      (x) => `Cada conversación con ${x.c} en ${x.l} empieza igual: cámara encendida, sin perfil que pulir. Hacia las ${x.peak} la sala es más amplia.`,
    ],
  },
  academic: {
    en: [
      (x) => `Practising out loud beats reading in silence. Caakus pairs you with ${x.c} in ${x.l} for live camera conversations that begin in your browser within seconds.`,
      (x) => `${x.c} in ${x.l} use Caakus between study blocks: a short spoken exchange, then straight back to work. There is nothing to install and no subscription.`,
      (x) => `If you are looking for ${x.c} in ${x.l} to talk with rather than text with, Caakus opens the camera directly and matches you with someone who is online right now.`,
      (x) => `${x.l} sits in ${x.utc}, so study sessions here overlap with a different half of the world than they would in ${x.country}'s neighbours. Activity peaks around ${x.peak}.`,
    ],
    fr: [
      (x) => `S'exercer à l'oral vaut mieux que lire en silence. Caakus vous met en relation avec des ${x.c} à ${x.l} en visio, depuis le navigateur.`,
      (x) => `Les ${x.c} de ${x.l} utilisent Caakus entre deux blocs de révision : un échange oral court, puis retour au travail. Rien à installer.`,
      (x) => `Si vous cherchez des ${x.c} à ${x.l} pour parler plutôt qu'écrire, Caakus ouvre la caméra et vous met en relation avec quelqu'un en ligne maintenant.`,
      (x) => `${x.l} est en ${x.utc} : les sessions de révision croisent une autre moitié du monde. Le pic d'activité est vers ${x.peak}.`,
    ],
    es: [
      (x) => `Practicar en voz alta supera leer en silencio. Caakus te empareja con ${x.c} en ${x.l} en videollamada desde el navegador.`,
      (x) => `Los ${x.c} de ${x.l} usan Caakus entre bloques de estudio: un intercambio hablado corto y de vuelta al trabajo. Nada que instalar.`,
      (x) => `Si buscas ${x.c} en ${x.l} para hablar y no para escribir, Caakus abre la cámara y te empareja con alguien conectado ahora.`,
      (x) => `${x.l} está en ${x.utc}: las sesiones aquí coinciden con otra mitad del mundo. La actividad sube hacia las ${x.peak}.`,
    ],
  },
  social: {
    en: [
      (x) => `Meeting someone new in ${x.l} should not take a week of messaging. Caakus puts you face to face with ${x.c} here in about two seconds, straight from the browser.`,
      (x) => `Caakus is where ${x.c} in ${x.l} go when the group chat has gone quiet. Camera on, one tap, a real conversation — and the next one is always one skip away.`,
      (x) => `No download, no profile photo, no swiping. Just ${x.c} from ${x.l} who are online right now and open to a short live conversation.`,
      (x) => `Local clock: ${x.utc}. The room in ${x.l} is busiest around ${x.peak}, and ${x.culture}.`,
    ],
    fr: [
      (x) => `Rencontrer quelqu'un à ${x.l} ne devrait pas prendre une semaine de messages. Caakus vous met face à des ${x.c} d'ici en deux secondes.`,
      (x) => `Caakus, c'est là que vont les ${x.c} de ${x.l} quand la conversation de groupe s'éteint. Caméra, un tap, une vraie discussion.`,
      (x) => `Aucun téléchargement, aucune photo de profil, aucun swipe. Juste des ${x.c} de ${x.l} en ligne maintenant.`,
      (x) => `Heure locale : ${x.utc}. La salle de ${x.l} est la plus dense vers ${x.peak}, et ${x.culture}.`,
    ],
    es: [
      (x) => `Conocer a alguien en ${x.l} no debería costar una semana de mensajes. Caakus te pone cara a cara con ${x.c} de aquí en dos segundos.`,
      (x) => `Caakus es a donde van los ${x.c} de ${x.l} cuando el grupo se queda en silencio. Cámara, un toque, una conversación real.`,
      (x) => `Sin descargas, sin foto de perfil, sin swipe. Solo ${x.c} de ${x.l} conectados ahora mismo.`,
      (x) => `Hora local: ${x.utc}. La sala de ${x.l} está más llena hacia las ${x.peak}, y ${x.culture}.`,
    ],
  },
  pro: {
    en: [
      (x) => `Cold outreach is slow. A two-second video match is not. Caakus connects you with ${x.c} in ${x.l} live, in the browser, with no scheduling step.`,
      (x) => `${x.c} in ${x.l} use Caakus for unscheduled conversations: no calendar link, no meeting room, no install — the camera opens on the page.`,
      (x) => `Caakus gives ${x.c} in ${x.l} a direct line to people outside their usual network, across ${x.country} and 190+ other countries.`,
      (x) => `Working in ${x.utc} narrows who you can reach during the day. Caakus widens it: the local room peaks around ${x.peak}, and the global one never closes.`,
    ],
    fr: [
      (x) => `La prospection à froid est lente. Une mise en relation vidéo en deux secondes ne l'est pas. Caakus vous connecte aux ${x.c} de ${x.l} en direct.`,
      (x) => `Les ${x.c} de ${x.l} utilisent Caakus pour des échanges non planifiés : pas de lien d'agenda, pas de salle, rien à installer.`,
      (x) => `Caakus donne aux ${x.c} de ${x.l} un accès direct à des personnes hors de leur réseau habituel, dans ${x.country} et 190+ pays.`,
      (x) => `Travailler en ${x.utc} limite qui vous pouvez joindre en journée. Caakus élargit : pic local vers ${x.peak}, salle mondiale toujours ouverte.`,
    ],
    es: [
      (x) => `La prospección en frío es lenta; un emparejamiento de vídeo en dos segundos no. Caakus te conecta con ${x.c} en ${x.l} en directo.`,
      (x) => `Los ${x.c} de ${x.l} usan Caakus para conversaciones no agendadas: sin enlace de calendario, sin sala, sin instalar nada.`,
      (x) => `Caakus da a los ${x.c} de ${x.l} acceso directo a gente fuera de su red habitual, en ${x.country} y 190+ países.`,
      (x) => `Trabajar en ${x.utc} limita a quién alcanzas de día. Caakus lo amplía: pico local hacia las ${x.peak}, sala global siempre abierta.`,
    ],
  },
};

const BODY_A: Record<Lang, Tpl[]> = {
  en: [
    (x) => `Technically, nothing sits between the two of you: Caakus uses direct peer-to-peer WebRTC in the browser, so audio and video travel the shortest path available. In ${x.l}, ${x.culture}.`,
    (x) => `${x.l} runs on ${x.utc}. Local activity among ${x.c} climbs through the evening and peaks around ${x.peak}, which is when the wait between matches is shortest. ${x.culture.charAt(0).toUpperCase()}${x.culture.slice(1)}.`,
    (x) => `There is no app to install and no card to enter. The connection is peer-to-peer, the camera permission is asked once by your browser, and you can close the tab to end everything instantly.`,
    (x) => `Caakus works on any modern browser in ${x.country} — Chrome, Safari, Firefox or Edge, on phone or laptop. ${x.culture.charAt(0).toUpperCase()}${x.culture.slice(1)}.`,
  ],
  fr: [
    (x) => `Techniquement, rien ne s'interpose : Caakus utilise le WebRTC pair-à-pair dans le navigateur, donc l'audio et la vidéo prennent le chemin le plus court. À ${x.l}, ${x.culture}.`,
    (x) => `${x.l} est en ${x.utc}. L'activité des ${x.c} monte en soirée et culmine vers ${x.peak}, le moment où l'attente est la plus courte.`,
    (x) => `Aucune application à installer, aucune carte à saisir. La connexion est pair-à-pair, l'autorisation caméra est demandée une fois, et fermer l'onglet coupe tout.`,
    (x) => `Caakus fonctionne sur tout navigateur récent en ${x.country} — Chrome, Safari, Firefox ou Edge, sur téléphone comme sur ordinateur.`,
  ],
  es: [
    (x) => `Técnicamente no hay nada en medio: Caakus usa WebRTC punto a punto en el navegador, así que el audio y el vídeo toman el camino más corto. En ${x.l}, ${x.culture}.`,
    (x) => `${x.l} está en ${x.utc}. La actividad de ${x.c} sube por la tarde y culmina hacia las ${x.peak}, cuando la espera es mínima.`,
    (x) => `No hay app que instalar ni tarjeta que introducir. La conexión es punto a punto y cerrar la pestaña lo termina todo al instante.`,
    (x) => `Caakus funciona en cualquier navegador moderno de ${x.country} — Chrome, Safari, Firefox o Edge, en móvil o portátil.`,
  ],
};

const BODY_B: Record<Lang, Tpl[]> = {
  en: [
    (x) => `Caakus is strictly 18+. On-device screening watches each stream for explicit behaviour, reporting takes one tap, and you can skip anyone instantly without explaining yourself.`,
    (x) => `Every conversation is one tap from the next. Skip freely, stay in your language, and collect Yuyu points — an internal gamified score — as you meet more people from ${x.country} and beyond.`,
    (x) => `Guests can start without an account. Creating a free one only adds saved connections, Yuyu points and a place on the ${x.country} leaderboard.`,
    (x) => `Safety is not optional here: adults only, automatic screening for explicit content, instant reporting, and no recording of your conversations on our side.`,
  ],
  fr: [
    (x) => `Caakus est strictement réservé aux 18 ans et plus. Une analyse sur l'appareil surveille les flux, le signalement se fait en un tap et vous pouvez passer à tout moment.`,
    (x) => `Chaque conversation mène à la suivante. Passez librement, restez dans votre langue et gagnez des points Yuyu — un score interne ludique — en rencontrant du monde depuis ${x.country}.`,
    (x) => `On peut commencer en invité. Le compte gratuit ajoute les contacts enregistrés, les points Yuyu et le classement ${x.country}.`,
    (x) => `La sécurité n'est pas optionnelle : adultes uniquement, détection automatique des contenus explicites, signalement immédiat, aucun enregistrement de vos conversations de notre côté.`,
  ],
  es: [
    (x) => `Caakus es solo para mayores de 18. El análisis en el dispositivo vigila cada stream, reportar cuesta un toque y puedes saltar a cualquiera al instante.`,
    (x) => `Cada conversación lleva a la siguiente. Salta cuando quieras, habla en tu idioma y gana puntos Yuyu — una puntuación interna del juego — conociendo gente de ${x.country}.`,
    (x) => `Puedes empezar como invitado. La cuenta gratuita añade contactos guardados, puntos Yuyu y la clasificación de ${x.country}.`,
    (x) => `La seguridad no es opcional: solo adultos, detección automática de contenido explícito, reporte inmediato y sin grabaciones por nuestra parte.`,
  ],
};

// ── FAQ pool: 5 intents × 11 = 55 unique pairs ─────────────────────────────

type FaqTpl = { q: Tpl; a: Tpl };
type Intent = "free" | "safety" | "yuyu" | "speed" | "mobile";

const FAQ_POOL: Record<Intent, Record<Lang, FaqTpl[]>> = {
  free: {
    en: [
      { q: (x) => `Is video chat with ${x.c} in ${x.l} really free?`, a: (x) => `Yes. Matching, video and voice are free on Caakus. There is no subscription and no download required to start talking with ${x.c} in ${x.l}.` },
      { q: (x) => `Do I need an account to meet ${x.c} in ${x.l}?`, a: (x) => `No. You can start as a guest. A free account only adds saved connections, Yuyu points and your place on the ${x.country} leaderboard.` },
      { q: (x) => `Are there hidden charges after a few minutes in ${x.l}?`, a: () => `No. Conversation length is not metered and nothing unlocks behind a paywall mid-call. Optional virtual gifts are the only paid item and they are never required.` },
      { q: (x) => `Do I have to install an app to use Caakus in ${x.l}?`, a: () => `No. Caakus runs entirely in the browser. The camera permission prompt is the only step between the page and your first conversation.` },
      { q: (x) => `Is there a free trial limit for ${x.c}?`, a: () => `There is no trial. The core product — matching, video and audio — stays free indefinitely for every user, guest or registered.` },
      { q: (x) => `Can I use Caakus in ${x.l} without giving a phone number?`, a: () => `Yes. No phone number is required. Guests need nothing at all, and registered accounts only need an email address.` },
      { q: (x) => `Is a payment card needed to register from ${x.country}?`, a: (x) => `No card is required to create an account or to video chat with ${x.c} in ${x.l}. Cards are only involved if you choose to buy a virtual gift.` },
      { q: () => `Does Caakus show ads during a conversation?`, a: () => `Advertising never interrupts a live conversation. Nothing plays over the video while you are connected to another person.` },
      { q: (x) => `How many conversations can I have per day in ${x.l}?`, a: () => `There is no daily cap. Rate limits exist only to block automated abuse, and normal human use never reaches them.` },
      { q: (x) => `Is Caakus free for students in ${x.l}?`, a: (x) => `Yes, and no student verification is needed. Everyone in ${x.l} gets the same free access to matching, video and audio.` },
      { q: (x) => `What does a free account add for ${x.c} in ${x.l}?`, a: () => `Saved connections, Yuyu points, streaks and leaderboard placement. None of it gates the conversation itself.` },
    ],
    fr: [
      { q: (x) => `Le chat vidéo avec des ${x.c} à ${x.l} est-il vraiment gratuit ?`, a: (x) => `Oui. La mise en relation, la vidéo et l'audio sont gratuites, sans abonnement ni téléchargement pour parler avec des ${x.c} à ${x.l}.` },
      { q: (x) => `Faut-il un compte pour rencontrer des ${x.c} à ${x.l} ?`, a: (x) => `Non, on peut commencer en invité. Le compte gratuit ajoute les contacts enregistrés, les points Yuyu et le classement ${x.country}.` },
      { q: () => `Y a-t-il des frais cachés après quelques minutes ?`, a: () => `Non. La durée des conversations n'est pas décomptée et rien ne se bloque en cours d'appel. Les cadeaux virtuels sont optionnels.` },
      { q: (x) => `Faut-il installer une application à ${x.l} ?`, a: () => `Non. Caakus fonctionne entièrement dans le navigateur ; seule l'autorisation caméra est demandée.` },
      { q: (x) => `Existe-t-il une limite d'essai pour les ${x.c} ?`, a: () => `Il n'y a pas d'essai. La mise en relation, la vidéo et l'audio restent gratuites indéfiniment.` },
      { q: (x) => `Puis-je utiliser Caakus à ${x.l} sans numéro de téléphone ?`, a: () => `Oui. Aucun numéro n'est demandé. Les invités n'ont rien à fournir, les comptes ne demandent qu'un e-mail.` },
      { q: (x) => `Une carte bancaire est-elle nécessaire depuis ${x.country} ?`, a: () => `Non. Une carte n'intervient que si vous choisissez d'acheter un cadeau virtuel.` },
      { q: () => `Caakus affiche-t-il des publicités pendant une conversation ?`, a: () => `Aucune publicité n'interrompt une conversation en direct.` },
      { q: (x) => `Combien de conversations par jour à ${x.l} ?`, a: () => `Aucune limite journalière. Les garde-fous ne visent que les abus automatisés.` },
      { q: (x) => `Caakus est-il gratuit pour les étudiants à ${x.l} ?`, a: (x) => `Oui, sans justificatif. Tout le monde à ${x.l} a le même accès gratuit.` },
      { q: (x) => `Qu'apporte le compte gratuit aux ${x.c} de ${x.l} ?`, a: () => `Contacts enregistrés, points Yuyu, séries et classement. Rien de tout cela ne bloque la conversation.` },
    ],
    es: [
      { q: (x) => `¿El videochat con ${x.c} en ${x.l} es realmente gratis?`, a: (x) => `Sí. Emparejamiento, vídeo y voz son gratuitos, sin suscripción ni descargas para hablar con ${x.c} en ${x.l}.` },
      { q: (x) => `¿Necesito cuenta para conocer ${x.c} en ${x.l}?`, a: (x) => `No, puedes empezar como invitado. La cuenta gratuita añade contactos, puntos Yuyu y la clasificación de ${x.country}.` },
      { q: () => `¿Hay cargos ocultos tras unos minutos?`, a: () => `No. La duración no se cobra y nada se bloquea a mitad de llamada. Los regalos virtuales son opcionales.` },
      { q: (x) => `¿Hay que instalar una app en ${x.l}?`, a: () => `No. Caakus funciona en el navegador; solo se pide el permiso de cámara.` },
      { q: (x) => `¿Existe un límite de prueba para ${x.c}?`, a: () => `No hay prueba: emparejamiento, vídeo y audio siguen gratis indefinidamente.` },
      { q: (x) => `¿Puedo usar Caakus en ${x.l} sin número de teléfono?`, a: () => `Sí. No se pide número; las cuentas solo requieren un correo.` },
      { q: (x) => `¿Hace falta tarjeta desde ${x.country}?`, a: () => `No. La tarjeta solo interviene si compras un regalo virtual.` },
      { q: () => `¿Caakus muestra anuncios durante la conversación?`, a: () => `Ninguna publicidad interrumpe una conversación en directo.` },
      { q: (x) => `¿Cuántas conversaciones al día en ${x.l}?`, a: () => `Sin límite diario. Los topes solo frenan el abuso automatizado.` },
      { q: (x) => `¿Es gratis para estudiantes en ${x.l}?`, a: (x) => `Sí, sin verificación. Todos en ${x.l} tienen el mismo acceso gratuito.` },
      { q: (x) => `¿Qué añade la cuenta gratuita a los ${x.c} de ${x.l}?`, a: () => `Contactos guardados, puntos Yuyu, rachas y clasificación. Nada bloquea la conversación.` },
    ],
  },
  safety: {
    en: [
      { q: (x) => `How does Caakus keep conversations in ${x.l} safe?`, a: () => `Caakus is strictly 18+. On-device screening watches for nudity and explicit behaviour, one-tap reporting removes offenders, and you can skip anyone instantly.` },
      { q: () => `Are minors allowed on Caakus?`, a: () => `No. The platform is adults only, 18 and over. Accounts found to belong to minors are removed and the terms of service prohibit it explicitly.` },
      { q: () => `What happens when I report someone?`, a: () => `The conversation ends immediately, the stream is cut on your side, and the report is queued for review. Repeat offenders lose access.` },
      { q: () => `Is nudity allowed anywhere on Caakus?`, a: () => `No. Nudity and sexual content are banned everywhere on the platform, and automatic screening ends matches where it is detected.` },
      { q: (x) => `Are conversations in ${x.l} recorded?`, a: () => `Caakus does not record your video or audio. The media path is peer-to-peer, so streams are not stored on our side.` },
      { q: () => `Can I block someone from matching with me again?`, a: () => `Yes. Skipping plus reporting keeps that person out of your future matches, and the Safety Lab lets you tighten who can reach you.` },
      { q: (x) => `Do I have to show my face to meet ${x.c}?`, a: () => `You control the camera and can turn it off at any moment. Most people keep it on, but nothing forces you to.` },
      { q: (x) => `Is my exact location in ${x.l} shared?`, a: (x) => `No. Only the city-level region is used for matching preferences. Your precise location is never shown to the other person.` },
      { q: () => `What if the other person behaves badly mid-call?`, a: () => `One tap skips them, one tap reports them. Neither requires you to explain anything or wait for the call to finish.` },
      { q: (x) => `Is Caakus moderated at night in ${x.l}?`, a: () => `Automatic screening runs on every stream at all hours; it does not depend on a moderation shift being awake.` },
      { q: () => `How do I delete my account and data?`, a: () => `Account deletion is available in settings and removes your profile and associated records from the database, not just from the app view.` },
    ],
    fr: [
      { q: (x) => `Comment Caakus sécurise-t-il les conversations à ${x.l} ?`, a: () => `Caakus est strictement réservé aux 18+. Une analyse sur l'appareil détecte la nudité, le signalement est immédiat et vous pouvez passer à tout moment.` },
      { q: () => `Les mineurs sont-ils autorisés ?`, a: () => `Non. La plateforme est réservée aux adultes de 18 ans et plus ; les conditions l'interdisent explicitement.` },
      { q: () => `Que se passe-t-il quand je signale quelqu'un ?`, a: () => `La conversation s'arrête immédiatement et le signalement part en revue. Les récidivistes perdent l'accès.` },
      { q: () => `La nudité est-elle tolérée quelque part ?`, a: () => `Non. Nudité et contenu sexuel sont interdits partout, et la détection automatique coupe la mise en relation.` },
      { q: (x) => `Les conversations à ${x.l} sont-elles enregistrées ?`, a: () => `Non. Le flux est pair-à-pair et n'est pas stocké de notre côté.` },
      { q: () => `Puis-je empêcher quelqu'un de me retomber dessus ?`, a: () => `Oui. Passer et signaler exclut la personne de vos futures mises en relation ; le Safety Lab affine qui peut vous joindre.` },
      { q: (x) => `Dois-je montrer mon visage pour rencontrer des ${x.c} ?`, a: () => `Vous gardez le contrôle de la caméra et pouvez la couper à tout instant.` },
      { q: (x) => `Ma position exacte à ${x.l} est-elle partagée ?`, a: () => `Non. Seule la région au niveau ville sert aux préférences de mise en relation.` },
      { q: () => `Et si la personne se comporte mal en plein appel ?`, a: () => `Un tap pour passer, un tap pour signaler, sans justification ni attente.` },
      { q: (x) => `Y a-t-il une modération la nuit à ${x.l} ?`, a: () => `La détection automatique tourne sur chaque flux à toute heure.` },
      { q: () => `Comment supprimer mon compte et mes données ?`, a: () => `La suppression est dans les réglages et efface réellement le profil et les enregistrements liés.` },
    ],
    es: [
      { q: (x) => `¿Cómo mantiene Caakus seguras las conversaciones en ${x.l}?`, a: () => `Caakus es solo para mayores de 18. El análisis en el dispositivo detecta desnudos, el reporte es inmediato y puedes saltar al instante.` },
      { q: () => `¿Se permiten menores?`, a: () => `No. La plataforma es solo para adultos de 18 años o más y los términos lo prohíben expresamente.` },
      { q: () => `¿Qué ocurre cuando reporto a alguien?`, a: () => `La conversación termina al momento y el reporte pasa a revisión. Los reincidentes pierden el acceso.` },
      { q: () => `¿Se permite la desnudez en algún lugar?`, a: () => `No. La desnudez y el contenido sexual están prohibidos y la detección automática corta la conexión.` },
      { q: (x) => `¿Se graban las conversaciones en ${x.l}?`, a: () => `No. El flujo es punto a punto y no se almacena por nuestra parte.` },
      { q: () => `¿Puedo bloquear a alguien para no volver a verlo?`, a: () => `Sí. Saltar y reportar lo excluye de tus futuros emparejamientos.` },
      { q: (x) => `¿Debo mostrar la cara para conocer ${x.c}?`, a: () => `Controlas la cámara y puedes apagarla en cualquier momento.` },
      { q: (x) => `¿Se comparte mi ubicación exacta en ${x.l}?`, a: () => `No. Solo se usa la región a nivel de ciudad para las preferencias.` },
      { q: () => `¿Y si la otra persona se comporta mal?`, a: () => `Un toque para saltar, otro para reportar, sin dar explicaciones.` },
      { q: (x) => `¿Hay moderación de noche en ${x.l}?`, a: () => `La detección automática funciona en cada stream a todas horas.` },
      { q: () => `¿Cómo borro mi cuenta y mis datos?`, a: () => `Desde los ajustes; elimina realmente el perfil y los registros asociados.` },
    ],
  },
  yuyu: {
    en: [
      { q: () => `What are Yuyu points?`, a: () => `Yuyu points are Caakus's internal gamified score. They track activity such as calls, streaks and gifts received. They are whole numbers inside the app and nothing else.` },
      { q: (x) => `How do ${x.c} in ${x.l} earn Yuyu points?`, a: () => `By having real conversations: completed calls, daily streaks, challenges and receiving virtual gifts all add points.` },
      { q: (x) => `Is there a Yuyu leaderboard for ${x.country}?`, a: (x) => `Yes. Registered members appear on country and global leaderboards, so activity in ${x.l} is visible alongside the rest of ${x.country}.` },
      { q: () => `Can I send Yuyu points to a friend?`, a: () => `Yes. Transfers between members use the recipient's Yuyu ID and are applied as a single atomic operation, so a balance can never go negative.` },
      { q: () => `Do Yuyu points expire?`, a: () => `Points do not expire on their own. They stay attached to your account for as long as the account exists.` },
      { q: (x) => `Do guests earn Yuyu points in ${x.l}?`, a: () => `Guest sessions can talk freely but points are attached to a registered account, so creating a free one is what starts the counter.` },
      { q: () => `Why does the Yuyu index move up and down?`, a: () => `The community activity index reflects real usage — calls, gifts sent and active members — measured against the last 24 hours, so it rises on busy days and eases on quiet ones.` },
      { q: (x) => `What is the fastest way for ${x.c} to climb the ranking?`, a: (x) => `Consistency beats volume: daily streaks and completed conversations during the ${x.peak} peak window move the ranking faster than a single long session.` },
      { q: () => `Are virtual gifts required to earn points?`, a: () => `No. Gifts are one of several sources. Plenty of top-ranked members never buy a single one.` },
      { q: (x) => `Does the leaderboard in ${x.l} reset?`, a: () => `Weekly and all-time views exist side by side, so a slow week never erases your cumulative standing.` },
      { q: () => `Are Yuyu points a currency?`, a: () => `No. They are a gamified in-app score used for ranking, streaks and unlocking playful features. Nothing more.` },
    ],
    fr: [
      { q: () => `Que sont les points Yuyu ?`, a: () => `Les points Yuyu sont le score interne et ludique de Caakus. Ils mesurent l'activité : appels, séries, cadeaux reçus. Ce sont des nombres entiers dans l'application.` },
      { q: (x) => `Comment les ${x.c} de ${x.l} gagnent-ils des points Yuyu ?`, a: () => `En discutant réellement : appels terminés, séries quotidiennes, défis et cadeaux virtuels reçus.` },
      { q: (x) => `Existe-t-il un classement Yuyu pour ${x.country} ?`, a: (x) => `Oui. Les membres inscrits apparaissent dans les classements pays et mondial, donc l'activité de ${x.l} est visible.` },
      { q: () => `Puis-je envoyer des points Yuyu à un ami ?`, a: () => `Oui, via l'identifiant Yuyu du destinataire. Le transfert est atomique : un solde ne peut jamais devenir négatif.` },
      { q: () => `Les points Yuyu expirent-ils ?`, a: () => `Non, ils restent attachés au compte tant qu'il existe.` },
      { q: (x) => `Les invités gagnent-ils des points à ${x.l} ?`, a: () => `Les invités peuvent discuter, mais les points nécessitent un compte gratuit.` },
      { q: () => `Pourquoi l'indice Yuyu monte et descend ?`, a: () => `L'indice d'activité reflète l'usage réel — appels, cadeaux, membres actifs — comparé aux 24 dernières heures.` },
      { q: (x) => `Comment les ${x.c} montent-ils vite au classement ?`, a: (x) => `La régularité prime : séries quotidiennes et conversations pendant le pic de ${x.peak}.` },
      { q: () => `Faut-il acheter des cadeaux pour gagner des points ?`, a: () => `Non. Beaucoup de membres bien classés n'en achètent jamais.` },
      { q: (x) => `Le classement de ${x.l} est-il réinitialisé ?`, a: () => `Les vues hebdomadaire et globale coexistent : une semaine calme n'efface pas le cumul.` },
      { q: () => `Les points Yuyu sont-ils une monnaie ?`, a: () => `Non. C'est un score ludique interne, rien de plus.` },
    ],
    es: [
      { q: () => `¿Qué son los puntos Yuyu?`, a: () => `Son la puntuación interna y gamificada de Caakus: miden actividad como llamadas, rachas y regalos recibidos. Números enteros dentro de la app.` },
      { q: (x) => `¿Cómo ganan puntos los ${x.c} de ${x.l}?`, a: () => `Conversando de verdad: llamadas completadas, rachas diarias, retos y regalos virtuales recibidos.` },
      { q: (x) => `¿Hay clasificación Yuyu para ${x.country}?`, a: (x) => `Sí. Los miembros registrados aparecen en los rankings de país y global, así que ${x.l} es visible.` },
      { q: () => `¿Puedo enviar puntos a un amigo?`, a: () => `Sí, con el ID Yuyu del destinatario. La transferencia es atómica y el saldo nunca queda negativo.` },
      { q: () => `¿Caducan los puntos Yuyu?`, a: () => `No. Siguen ligados a tu cuenta mientras exista.` },
      { q: (x) => `¿Ganan puntos los invitados en ${x.l}?`, a: () => `Los invitados pueden hablar, pero los puntos requieren una cuenta gratuita.` },
      { q: () => `¿Por qué sube y baja el índice Yuyu?`, a: () => `Refleja el uso real — llamadas, regalos, miembros activos — comparado con las últimas 24 horas.` },
      { q: (x) => `¿Cómo suben rápido los ${x.c} en el ranking?`, a: (x) => `La constancia gana: rachas diarias y conversaciones en el pico de las ${x.peak}.` },
      { q: () => `¿Hay que comprar regalos para ganar puntos?`, a: () => `No. Muchos de los mejores clasificados nunca compran ninguno.` },
      { q: (x) => `¿Se reinicia la clasificación de ${x.l}?`, a: () => `Conviven la vista semanal y la histórica: una semana floja no borra tu acumulado.` },
      { q: () => `¿Los puntos Yuyu son una moneda?`, a: () => `No. Son una puntuación interna del juego, nada más.` },
    ],
  },
  speed: {
    en: [
      { q: (x) => `How fast does a match happen in ${x.l}?`, a: (x) => `Typically a couple of seconds during the ${x.peak} peak window. Off-peak it can take longer, because it depends on who is online in ${x.l} at that moment.` },
      { q: () => `Why is Caakus video lower latency than a meeting app?`, a: () => `Because the media path is direct peer-to-peer WebRTC between the two browsers. A relay is only used when a strict network blocks the direct path.` },
      { q: (x) => `What are the best hours to video chat with ${x.c} from ${x.l}?`, a: (x) => `${x.l} sits in ${x.utc}. Activity climbs after work and peaks around ${x.peak} local time, which is when match times are shortest.` },
      { q: () => `What happens if my connection drops mid-call?`, a: () => `Caakus attempts an automatic reconnection before ending anything, and only falls back to a relay path after several failures.` },
      { q: (x) => `Do I need fast internet in ${x.l}?`, a: () => `A normal mobile connection is enough. Video quality adapts down before the conversation is ever interrupted.` },
      { q: () => `Is there a queue before I get matched?`, a: () => `There is a waiting pool, not a queue with a position number. As soon as a compatible person is available you are connected.` },
      { q: (x) => `Why did a match take longer than usual in ${x.l}?`, a: (x) => `Outside the ${x.peak} window there are simply fewer people online locally, so the search widens to the rest of ${x.country} and then globally.` },
      { q: () => `Can I skip to the next person instantly?`, a: () => `Yes. Skipping releases the current conversation and re-enters the pool in the same action, usually within a second.` },
      { q: () => `Does using a VPN slow down matching?`, a: () => `It can. A VPN changes the network path and sometimes forces a relayed connection, which adds latency compared to a direct one.` },
      { q: (x) => `Will I be matched with the same person twice in ${x.l}?`, a: () => `The matcher prioritises people you have not met yet, so repeats are rare unless very few people are online.` },
      { q: () => `Does Caakus work behind a strict company firewall?`, a: () => `Usually yes. When a direct path is blocked, the connection switches to a relay so the conversation still goes through.` },
    ],
    fr: [
      { q: (x) => `En combien de temps est-on mis en relation à ${x.l} ?`, a: (x) => `Quelques secondes pendant le pic de ${x.peak}. Hors pic, cela dépend de qui est en ligne à ${x.l}.` },
      { q: () => `Pourquoi la latence est-elle plus faible qu'en visioconférence ?`, a: () => `Parce que le flux est en pair-à-pair direct entre les deux navigateurs ; un relais n'est utilisé qu'en dernier recours.` },
      { q: (x) => `Quelles sont les meilleures heures depuis ${x.l} ?`, a: (x) => `${x.l} est en ${x.utc}. L'activité culmine vers ${x.peak}, quand l'attente est la plus courte.` },
      { q: () => `Que se passe-t-il si ma connexion coupe ?`, a: () => `Caakus tente une reconnexion automatique avant d'arrêter quoi que ce soit, puis bascule sur un relais si nécessaire.` },
      { q: (x) => `Faut-il une connexion rapide à ${x.l} ?`, a: () => `Une connexion mobile normale suffit : la qualité s'adapte avant toute interruption.` },
      { q: () => `Y a-t-il une file d'attente ?`, a: () => `Il y a un vivier, pas une file numérotée : dès qu'une personne compatible est disponible, vous êtes connecté.` },
      { q: (x) => `Pourquoi la mise en relation a-t-elle été longue à ${x.l} ?`, a: (x) => `Hors du créneau de ${x.peak}, moins de monde est en ligne : la recherche s'élargit à ${x.country} puis au monde.` },
      { q: () => `Puis-je passer au suivant instantanément ?`, a: () => `Oui, en une seule action, généralement en moins d'une seconde.` },
      { q: () => `Un VPN ralentit-il la mise en relation ?`, a: () => `Possible : il modifie le chemin réseau et force parfois un relais, ce qui ajoute de la latence.` },
      { q: (x) => `Peut-on tomber deux fois sur la même personne à ${x.l} ?`, a: () => `La priorité va aux personnes jamais rencontrées ; les répétitions sont rares.` },
      { q: () => `Caakus fonctionne-t-il derrière un pare-feu strict ?`, a: () => `En général oui : si le chemin direct est bloqué, la connexion passe par un relais.` },
    ],
    es: [
      { q: (x) => `¿Cuánto tarda un emparejamiento en ${x.l}?`, a: (x) => `Unos segundos durante el pico de las ${x.peak}. Fuera de pico depende de quién esté conectado en ${x.l}.` },
      { q: () => `¿Por qué hay menos latencia que en una app de reuniones?`, a: () => `Porque el vídeo viaja punto a punto entre los dos navegadores; el relé solo se usa como último recurso.` },
      { q: (x) => `¿Cuáles son las mejores horas desde ${x.l}?`, a: (x) => `${x.l} está en ${x.utc}. La actividad culmina hacia las ${x.peak}, cuando la espera es mínima.` },
      { q: () => `¿Qué pasa si se cae mi conexión?`, a: () => `Caakus intenta reconectar automáticamente antes de cortar y solo después pasa a un relé.` },
      { q: (x) => `¿Necesito internet rápido en ${x.l}?`, a: () => `Basta una conexión móvil normal: la calidad baja antes de interrumpir la conversación.` },
      { q: () => `¿Hay cola antes de emparejar?`, a: () => `Hay una bolsa de espera, no una cola numerada. En cuanto hay alguien compatible, te conecta.` },
      { q: (x) => `¿Por qué tardó más de lo normal en ${x.l}?`, a: (x) => `Fuera de las ${x.peak} hay menos gente local, así que la búsqueda se amplía a ${x.country} y al mundo.` },
      { q: () => `¿Puedo saltar al siguiente al instante?`, a: () => `Sí, en una sola acción y normalmente en menos de un segundo.` },
      { q: () => `¿Una VPN ralentiza el emparejamiento?`, a: () => `Puede: cambia la ruta de red y a veces fuerza un relé, lo que añade latencia.` },
      { q: (x) => `¿Me tocará la misma persona dos veces en ${x.l}?`, a: () => `Se prioriza a quien aún no has conocido, así que repetir es raro.` },
      { q: () => `¿Funciona tras un cortafuegos estricto?`, a: () => `Normalmente sí: si se bloquea la vía directa, la conexión pasa por un relé.` },
    ],
  },
  mobile: {
    en: [
      { q: (x) => `Does Caakus work on a phone browser in ${x.l}?`, a: () => `Yes. Chrome, Safari, Firefox and Edge on Android and iOS all run Caakus without an app. The camera permission prompt is the only extra step.` },
      { q: () => `Can I switch between the front and back camera?`, a: () => `Yes, during the call. The rear camera image is not mirrored, and switching does not drop the conversation.` },
      { q: () => `Does Caakus work on iPhone without the App Store?`, a: () => `Yes. Safari supports the browser camera directly, so nothing has to be installed from the App Store.` },
      { q: (x) => `Will Caakus drain my battery in ${x.l}?`, a: () => `Video always costs battery, but the peer-to-peer path avoids an extra server hop, which keeps usage closer to a normal phone call with video.` },
      { q: () => `Can I use Caakus on a tablet or laptop?`, a: () => `Yes. The layout adapts to any screen size and the same browser-only rule applies — nothing to install.` },
      { q: () => `What if my browser blocks the camera?`, a: () => `Re-allow it from the padlock icon in the address bar, then reload the page. Caakus asks again on the next attempt.` },
      { q: (x) => `Does mobile data work for calls in ${x.l}?`, a: () => `Yes. Quality adapts to the available bandwidth, so a normal mobile data connection is enough for a stable conversation.` },
      { q: () => `Can I use Caakus with headphones?`, a: () => `Yes, wired or Bluetooth. The browser routes audio to whichever output your phone is currently using.` },
      { q: () => `Does the conversation continue if I lock the screen?`, a: () => `Locking the screen suspends the video on most phones. Keep the tab in the foreground for an uninterrupted conversation.` },
      { q: () => `Is there a Caakus app to install?`, a: () => `Caakus is browser-first by design. You can add it to your home screen for an app-like icon, but there is nothing to download.` },
      { q: (x) => `Which browser is fastest for Caakus in ${x.country}?`, a: () => `Any recent Chromium browser or Safari performs comparably. Keeping the browser updated matters far more than which one you pick.` },
    ],
    fr: [
      { q: (x) => `Caakus fonctionne-t-il sur navigateur mobile à ${x.l} ?`, a: () => `Oui. Chrome, Safari, Firefox et Edge sur Android et iOS fonctionnent sans application.` },
      { q: () => `Peut-on basculer entre caméra avant et arrière ?`, a: () => `Oui, pendant l'appel. L'image arrière n'est pas inversée et l'appel ne se coupe pas.` },
      { q: () => `Caakus marche-t-il sur iPhone sans App Store ?`, a: () => `Oui. Safari gère la caméra du navigateur directement.` },
      { q: (x) => `Caakus consomme-t-il beaucoup de batterie à ${x.l} ?`, a: () => `La vidéo consomme toujours, mais le pair-à-pair évite un détour serveur.` },
      { q: () => `Puis-je utiliser Caakus sur tablette ou ordinateur ?`, a: () => `Oui, la mise en page s'adapte à tous les écrans, toujours sans installation.` },
      { q: () => `Et si le navigateur bloque la caméra ?`, a: () => `Réautorisez-la depuis le cadenas dans la barre d'adresse, puis rechargez la page.` },
      { q: (x) => `La data mobile suffit-elle à ${x.l} ?`, a: () => `Oui. La qualité s'adapte à la bande passante disponible.` },
      { q: () => `Puis-je utiliser un casque ?`, a: () => `Oui, filaire ou Bluetooth : le navigateur suit la sortie audio active du téléphone.` },
      { q: () => `L'appel continue-t-il écran verrouillé ?`, a: () => `Le verrouillage suspend la vidéo sur la plupart des téléphones ; gardez l'onglet au premier plan.` },
      { q: () => `Existe-t-il une application à installer ?`, a: () => `Caakus est pensé pour le navigateur. Vous pouvez l'ajouter à l'écran d'accueil, sans téléchargement.` },
      { q: (x) => `Quel navigateur est le plus rapide en ${x.country} ?`, a: () => `Chromium récent ou Safari se valent ; la mise à jour compte plus que le choix.` },
    ],
    es: [
      { q: (x) => `¿Funciona Caakus en el navegador del móvil en ${x.l}?`, a: () => `Sí. Chrome, Safari, Firefox y Edge en Android e iOS funcionan sin app.` },
      { q: () => `¿Puedo cambiar entre cámara frontal y trasera?`, a: () => `Sí, durante la llamada. La imagen trasera no se refleja y la llamada no se corta.` },
      { q: () => `¿Funciona en iPhone sin App Store?`, a: () => `Sí. Safari admite la cámara del navegador directamente.` },
      { q: (x) => `¿Gasta mucha batería en ${x.l}?`, a: () => `El vídeo siempre gasta, pero la ruta punto a punto evita un salto extra de servidor.` },
      { q: () => `¿Puedo usarlo en tablet o portátil?`, a: () => `Sí, el diseño se adapta a cualquier pantalla y sigue sin instalar nada.` },
      { q: () => `¿Y si el navegador bloquea la cámara?`, a: () => `Vuelve a permitirla desde el candado de la barra de direcciones y recarga.` },
      { q: (x) => `¿Basta con datos móviles en ${x.l}?`, a: () => `Sí. La calidad se adapta al ancho de banda disponible.` },
      { q: () => `¿Puedo usar auriculares?`, a: () => `Sí, con cable o Bluetooth; el navegador sigue la salida activa del móvil.` },
      { q: () => `¿Sigue la llamada con la pantalla bloqueada?`, a: () => `El bloqueo suspende el vídeo en la mayoría de móviles; mantén la pestaña en primer plano.` },
      { q: () => `¿Hay una app para instalar?`, a: () => `Caakus está pensado para el navegador. Puedes añadirlo a la pantalla de inicio, sin descargas.` },
      { q: (x) => `¿Qué navegador es más rápido en ${x.country}?`, a: () => `Chromium reciente o Safari rinden igual; importa más tenerlo actualizado.` },
    ],
  },
};

const INTENTS: Intent[] = ["free", "safety", "yuyu", "speed", "mobile"];

// ── Social proof: name pools by rough region ───────────────────────────────

const NAMES_BY_REGION: Record<string, string[]> = {
  latin: ["Alex", "Mateo", "Sofia", "Lucas", "Valentina", "Diego", "Camila", "Nico"],
  euro: ["Léa", "Jonas", "Marta", "Elias", "Chiara", "Nora", "Tomasz", "Sven"],
  asia: ["Haru", "Mei", "Jin", "Riko", "Arjun", "Ayu", "Minho", "Linh"],
  mena: ["Yasmin", "Omar", "Layla", "Karim", "Nour", "Selim", "Rania", "Tarek"],
  africa: ["Amara", "Kofi", "Zola", "Chidi", "Thabo", "Aisha", "Sade", "Mensah"],
  anglo: ["Jamie", "Taylor", "Morgan", "Riley", "Casey", "Avery", "Quinn", "Drew"],
};

const REGION_BY_COUNTRY: Record<string, keyof typeof NAMES_BY_REGION> = {
  US: "anglo", GB: "anglo", CA: "anglo", AU: "anglo", IE: "anglo", NZ: "anglo",
  BR: "latin", MX: "latin", AR: "latin", CO: "latin", CL: "latin", PE: "latin", ES: "latin", PT: "latin",
  FR: "euro", DE: "euro", IT: "euro", NL: "euro", PL: "euro", SE: "euro", NO: "euro", CH: "euro", AT: "euro", BE: "euro", CZ: "euro", RO: "euro", RU: "euro", UA: "euro", GR: "euro", DK: "euro", FI: "euro",
  JP: "asia", KR: "asia", CN: "asia", IN: "asia", ID: "asia", VN: "asia", TH: "asia", PH: "asia", MY: "asia", SG: "asia", TW: "asia", HK: "asia", PK: "asia", BD: "asia",
  AE: "mena", SA: "mena", EG: "mena", MA: "mena", DZ: "mena", TN: "mena", TR: "mena", QA: "mena", KW: "mena", IQ: "mena", JO: "mena", LB: "mena",
  NG: "africa", GH: "africa", KE: "africa", ZA: "africa", CM: "africa", CI: "africa", SN: "africa", UG: "africa", TZ: "africa", ET: "africa",
};

function namesFor(countryCode: string): string[] {
  return NAMES_BY_REGION[REGION_BY_COUNTRY[countryCode] ?? "anglo"] as string[];
}

export type ActivityEvent = { id: string; text: string; ago: string };

const ACTIVITY_TPL: Record<Lang, ((n: string, l: string, c: string, v: number) => string)[]> = {
  en: [
    (n, l) => `${n} from ${l} just joined a live video conversation`,
    (n, l, c) => `${n} matched with ${c} two cities away from ${l}`,
    (n, l, c, v) => `${n} earned +${v} Yuyu points after a ${l} streak day`,
    (n, l) => `${n} started a 2-minute camera chat from ${l}`,
    (n, l, c) => `A ${c.replace(/s$/, "")} in ${l} completed their 10th conversation today`,
    (n, l, c, v) => `Top Yuyu contributor in ${l} gained +${v} points this evening`,
    (n, l) => `${n} switched to the rear camera to show a street in ${l}`,
    (n, l, c) => `${n} joined the ${c} room from ${l} on a phone browser`,
  ],
  fr: [
    (n, l) => `${n} de ${l} vient de rejoindre une conversation vidéo`,
    (n, l, c) => `${n} a été mis en relation avec des ${c} près de ${l}`,
    (n, l, c, v) => `${n} a gagné +${v} points Yuyu après une série à ${l}`,
    (n, l) => `${n} a lancé un chat caméra de 2 minutes depuis ${l}`,
    (n, l, c) => `Un membre ${c} à ${l} a terminé sa 10e conversation aujourd'hui`,
    (n, l, c, v) => `Le meilleur contributeur Yuyu de ${l} a gagné +${v} points ce soir`,
    (n, l) => `${n} est passé à la caméra arrière pour montrer une rue de ${l}`,
    (n, l, c) => `${n} a rejoint le salon ${c} depuis ${l} sur navigateur mobile`,
  ],
  es: [
    (n, l) => `${n} de ${l} acaba de entrar en una videollamada`,
    (n, l, c) => `${n} conectó con ${c} cerca de ${l}`,
    (n, l, c, v) => `${n} ganó +${v} puntos Yuyu tras una racha en ${l}`,
    (n, l) => `${n} inició un chat de cámara de 2 minutos desde ${l}`,
    (n, l, c) => `Un miembro ${c} en ${l} completó su 10ª conversación hoy`,
    (n, l, c, v) => `El mayor contribuidor Yuyu de ${l} sumó +${v} puntos esta noche`,
    (n, l) => `${n} cambió a la cámara trasera para enseñar una calle de ${l}`,
    (n, l, c) => `${n} entró en la sala ${c} desde ${l} con el navegador del móvil`,
  ],
};

const AGO: Record<Lang, (m: number) => string> = {
  en: (m) => (m < 60 ? `${m} min ago` : `${Math.floor(m / 60)} h ago`),
  fr: (m) => (m < 60 ? `il y a ${m} min` : `il y a ${Math.floor(m / 60)} h`),
  es: (m) => (m < 60 ? `hace ${m} min` : `hace ${Math.floor(m / 60)} h`),
};

export type LeaderRow = { rank: number; name: string; badge: string; points: number; streak: number };

const BADGES: Record<Lang, string[]> = {
  en: ["Local host", "Night regular", "Streak keeper", "Gift champion", "First responder", "Language bridge", "Weekend anchor"],
  fr: ["Hôte local", "Habitué du soir", "Gardien de série", "Champion des cadeaux", "Toujours présent", "Pont linguistique", "Pilier du week-end"],
  es: ["Anfitrión local", "Habitual nocturno", "Guardián de racha", "Campeón de regalos", "Siempre presente", "Puente de idiomas", "Ancla del finde"],
};

const SECTION_LABELS: Record<Lang, {
  activity: string;
  activityNote: string;
  activityEmpty: (l: string) => string;
  leaderboard: string;
  leaderboardNote: string;
  leaderboardEmpty: (l: string) => string;
  colRank: string; colMember: string; colBadge: string; colPoints: string; colStreak: string;
  nearbyAside: string; altCategories: string; directoryTree: string;
}> = {
  en: {
    activity: "Local activity",
    activityNote: "Only real sessions from this location appear here.",
    activityEmpty: (l) => `Be the first to start a video session in ${l} today and earn your first Yuyu points!`,
    leaderboard: "Top Caakus contributors",
    leaderboardNote: "Standings come from real conversations, streaks and gifts received.",
    leaderboardEmpty: (l) => `No local contributor yet — take the #1 spot in ${l} today!`,
    colRank: "#", colMember: "Member", colBadge: "Badge", colPoints: "Yuyu points", colStreak: "Streak",
    nearbyAside: "Nearby cities", altCategories: "Other communities here", directoryTree: "Full HTML directory",
  },
  fr: {
    activity: "Activité locale",
    activityNote: "Seules les sessions réelles de cette ville apparaissent ici.",
    activityEmpty: (l) => `Sois le premier à lancer une session vidéo à ${l} aujourd'hui et gagne tes premiers points Yuyu !`,
    leaderboard: "Meilleurs contributeurs Caakus",
    leaderboardNote: "Classement issu de conversations, séries et cadeaux réels.",
    leaderboardEmpty: (l) => `Aucun contributeur local pour l'instant — prends la 1re place à ${l} aujourd'hui !`,
    colRank: "#", colMember: "Membre", colBadge: "Badge", colPoints: "Points Yuyu", colStreak: "Série",
    nearbyAside: "Villes proches", altCategories: "Autres communautés ici", directoryTree: "Annuaire HTML complet",
  },
  es: {
    activity: "Actividad local",
    activityNote: "Aquí solo aparecen sesiones reales de esta ciudad.",
    activityEmpty: (l) => `¡Sé el primero en iniciar una videollamada en ${l} hoy y gana tus primeros puntos Yuyu!`,
    leaderboard: "Mejores contribuidores de Caakus",
    leaderboardNote: "Clasificación basada en conversaciones, rachas y regalos reales.",
    leaderboardEmpty: (l) => `Aún no hay contribuidores locales: ¡toma el puesto n.º 1 en ${l} hoy!`,
    colRank: "#", colMember: "Miembro", colBadge: "Insignia", colPoints: "Puntos Yuyu", colStreak: "Racha",
    nearbyAside: "Ciudades cercanas", altCategories: "Otras comunidades aquí", directoryTree: "Directorio HTML completo",
  },
};


function L<T>(map: Record<Lang, T>, lang: Lang): T {
  return map[lang] ?? (map[DEFAULT_LANGUAGE] as T);
}

// ── Public API ─────────────────────────────────────────────────────────────

export type Narrative = {
  tone: Tone;
  intro: string[];
  faq: { q: string; a: string }[];
  activity: ActivityEvent[];
  leaderboard: LeaderRow[];
  labels: Omit<(typeof SECTION_LABELS)["en"], "activityEmpty" | "leaderboardEmpty"> & {
    activityEmpty: string;
    leaderboardEmpty: string;
  };
};

export function buildNarrative(input: {
  language: PseoLanguage;
  category: PseoCategory;
  location: PseoLocation;
  hash: number;
  peakLabel: string;
  hourSeed: number;
}): Narrative {
  const { language, category, location, hash, peakLabel, hourSeed } = input;
  const lang = language.code;
  const ctx: Ctx = {
    c: categoryLabel(category, lang),
    l: location.name,
    country: location.country,
    peak: peakLabel,
    utc: formatUtc(location.utc),
    culture: cultureNote(location.countryCode, lang),
  };

  const tone = toneFor(category.slug);
  const hook = pick(L(HOOKS[tone], lang), hash, 2);
  const bodyA = pick(L(BODY_A, lang), hash, 9);
  const bodyB = pick(L(BODY_B, lang), hash, 15);
  const intro = [hook(ctx), bodyA(ctx), bodyB(ctx)];

  // FAQ: four different intents, deterministic rotation, per-intent index.
  const intentStart = hash % INTENTS.length;
  const faq: { q: string; a: string }[] = [];
  for (let i = 0; i < 4; i++) {
    const intent = INTENTS[(intentStart + i) % INTENTS.length] as Intent;
    const pool = L(FAQ_POOL[intent], lang);
    const item = pool[(hash >>> (i * 3 + 1)) % pool.length] as FaqTpl;
    faq.push({ q: item.q(ctx), a: item.a(ctx) });
  }

  // Integrity rule: no synthetic social proof. Real events/rows only; empty
  // arrays trigger the honest fallback copy rendered by the page.
  const activity: ActivityEvent[] = [];
  const leaderboard: LeaderRow[] = [];
  void hourSeed;

  const localizedLabels = L(SECTION_LABELS, lang);
  const labels: Narrative["labels"] = {
    ...localizedLabels,
    activityEmpty: localizedLabels.activityEmpty(location.name),
    leaderboardEmpty: localizedLabels.leaderboardEmpty(location.name),
  };

  return { tone, intro, faq, activity, leaderboard, labels };

}
