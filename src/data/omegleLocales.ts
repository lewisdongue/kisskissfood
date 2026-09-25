// ═══════════════════════════════════════════════════════════════════════════
// LOCALIZED "OMEGLE ALTERNATIVE" MONEY PAGE
// One entry per indexable language variant of /{lang}/omegle-alternative.
// Every string is hand-localized (no machine boilerplate) so each variant is a
// genuinely distinct document for Google, not a translated template shell.
// ═══════════════════════════════════════════════════════════════════════════

export type OmegleFaq = { q: string; a: string };
export type OmegleFeature = { t: string; d: string };
export type OmegleRow = { label: string; omegle: string; caakus: string };

export type OmegleLocale = {
  code: string;
  hreflang: string;
  dir: "ltr" | "rtl";
  label: string;
  title: string;
  description: string;
  keywords: string;
  h1: string;
  h2: string;
  intro: string;
  pains: string[];
  features: OmegleFeature[];
  cta: string;
  ctaNote: string;
  onlineSuffix: string;
  badges: [string, string, string];
  compareHeading: string;
  rows: OmegleRow[];
  faqHeading: string;
  faq: OmegleFaq[];
  directoryHeading: string;
  hubHeading: string;
  langHeading: string;
};

export const OMEGLE_LOCALES: OmegleLocale[] = [
  {
    code: "en",
    hreflang: "en",
    dir: "ltr",
    label: "English",
    title: "The Only Real Omegle Alternative: No Bots, Instant Video Chat | Caakus",
    description:
      "Caakus is the Omegle alternative that actually works: real humans in under 2 seconds, true peer-to-peer WebRTC video, zero fake cams and no paywall to start matching.",
    keywords:
      "omegle alternative, sites like omegle, omegle replacement, random video chat, talk to strangers, free video chat no signup",
    h1: "The Omegle Alternative That Actually Works.",
    h2: "Real Humans in Under 2 Seconds. Zero Bots. Zero Latency.",
    intro:
      "Omegle shut down in 2023 and every replacement you tried since was the same trap: looping fake cams, a paywall before the first match, or a lobby that never fills. Caakus runs real browser-to-browser video over WebRTC, so the person on your screen is live, unrecorded and one tap away.",
    pains: [
      "No fake cams. Every stream is a live peer connection negotiated in your browser — pre-recorded loops are structurally impossible here.",
      "No paywall to start. Matching, video, audio and text are free forever. Nothing is gated behind a card before you meet anyone.",
      "No bot farms. Device fingerprinting, rate limits and human moderation filter automated accounts out of the matching pool before they reach you.",
    ],
    features: [
      { t: "True P2P WebRTC", d: "Video and audio travel directly between the two browsers. No server sits in the middle recording you." },
      { t: "Sub-2-second matching", d: "Regional matching pools and pre-warmed ICE candidates mean the handshake finishes before you finish reading this." },
      { t: "Moderation that answers", d: "Reports are reviewed by humans, not a ticket queue. Repeat offenders lose the ability to match within minutes." },
    ],
    cta: "Launch Live Match Now",
    ctaNote: "No download. No card. Camera permission only when you press start.",
    onlineSuffix: "people online right now",
    badges: ["WebRTC Secured", "End-to-End Encrypted", "Strict Bot Filtering"],
    compareHeading: "Omegle vs Caakus, honestly",
    rows: [
      { label: "Service status", omegle: "Shut down in 2023", caakus: "Live worldwide" },
      { label: "Cost to start matching", omegle: "Free", caakus: "Free forever" },
      { label: "Media path", omegle: "Server relayed", caakus: "Peer-to-peer WebRTC" },
      { label: "Account required", omegle: "No", caakus: "No, optional profile" },
      { label: "Moderation", omegle: "Minimal", caakus: "Human review + filters" },
    ],
    faqHeading: "Questions people actually ask",
    faq: [
      { q: "Is Caakus really free?", a: "Yes. Random video matching, audio and chat cost nothing and always will. Optional cosmetic extras exist, but nothing blocks the first match." },
      { q: "Do I need an account to start?", a: "No. You can press start and match immediately. Creating a profile only saves your friends, history and reward points." },
      { q: "Are the cams real people or loops?", a: "Real people. The stream is a live peer connection negotiated between two browsers, so a pre-recorded loop cannot be served as a match." },
      { q: "Is it safe and private?", a: "Video and audio are encrypted in transit over WebRTC and are never recorded. Reports go to human moderators, and you can leave any match with one tap." },
    ],
    directoryHeading: "Find your community and city",
    hubHeading: "Go deeper into the network",
    langHeading: "Read this page in your language",
  },
  {
    code: "fr",
    hreflang: "fr",
    dir: "ltr",
    label: "Français",
    title: "La vraie alternative à Omegle : sans bots, chat vidéo instantané | Caakus",
    description:
      "Caakus est l'alternative à Omegle en français qui fonctionne vraiment : de vraies personnes en moins de 2 secondes, vidéo pair-à-pair WebRTC, zéro fausse webcam et aucun paiement pour commencer.",
    keywords:
      "alternative omegle francais, site comme omegle, remplacement omegle, chat video aleatoire, parler a des inconnus, chat video gratuit sans inscription",
    h1: "L'alternative à Omegle qui fonctionne vraiment.",
    h2: "De vraies personnes en moins de 2 secondes. Zéro bot. Zéro latence.",
    intro:
      "Omegle a fermé en 2023 et chaque remplaçant testé depuis répétait le même piège : fausses webcams en boucle, paiement avant le premier match, ou salon désespérément vide. Caakus fait circuler la vidéo directement entre deux navigateurs via WebRTC : la personne en face est réellement là, en direct, sans enregistrement.",
    pains: [
      "Aucune fausse webcam. Chaque flux est une connexion pair-à-pair négociée dans votre navigateur : une vidéo préenregistrée est structurellement impossible.",
      "Aucun paiement pour démarrer. Match, vidéo, audio et texte sont gratuits à vie. Rien n'est bloqué derrière une carte bancaire.",
      "Aucune ferme à bots. Empreinte d'appareil, limites de débit et modération humaine écartent les comptes automatisés avant qu'ils ne vous atteignent.",
    ],
    features: [
      { t: "Vrai WebRTC pair-à-pair", d: "La vidéo et l'audio passent directement d'un navigateur à l'autre, sans serveur intermédiaire qui vous enregistre." },
      { t: "Match en moins de 2 secondes", d: "Files régionales et candidats ICE préchauffés : la connexion est établie avant que vous ayez fini de lire cette ligne." },
      { t: "Une modération qui répond", d: "Les signalements sont traités par des humains. Les récidivistes perdent l'accès au matching en quelques minutes." },
    ],
    cta: "Lancer un match en direct",
    ctaNote: "Aucun téléchargement. Aucune carte. La caméra ne s'active qu'au démarrage.",
    onlineSuffix: "personnes connectées en ce moment",
    badges: ["Sécurisé par WebRTC", "Chiffré de bout en bout", "Filtrage strict des bots"],
    compareHeading: "Omegle contre Caakus, honnêtement",
    rows: [
      { label: "État du service", omegle: "Fermé en 2023", caakus: "En ligne partout" },
      { label: "Coût pour commencer", omegle: "Gratuit", caakus: "Gratuit à vie" },
      { label: "Chemin des flux", omegle: "Relayé par serveur", caakus: "Pair-à-pair WebRTC" },
      { label: "Compte obligatoire", omegle: "Non", caakus: "Non, profil optionnel" },
      { label: "Modération", omegle: "Minimale", caakus: "Humaine + filtres" },
    ],
    faqHeading: "Les questions que l'on pose vraiment",
    faq: [
      { q: "Caakus est-il vraiment gratuit ?", a: "Oui. Le match vidéo aléatoire, l'audio et le chat ne coûtent rien et resteront gratuits. Des options cosmétiques existent, mais rien ne bloque le premier match." },
      { q: "Faut-il un compte pour commencer ?", a: "Non. Vous pouvez démarrer et être mis en relation immédiatement. Le profil sert seulement à garder vos amis, votre historique et vos points." },
      { q: "Les webcams sont-elles de vraies personnes ?", a: "Oui. Le flux est une connexion en direct entre deux navigateurs : une vidéo préenregistrée ne peut pas être servie comme un match." },
      { q: "Est-ce sûr et privé ?", a: "La vidéo et l'audio sont chiffrés en transit via WebRTC et ne sont jamais enregistrés. Les signalements vont à des modérateurs humains et vous quittez un match d'un seul geste." },
    ],
    directoryHeading: "Trouvez votre communauté et votre ville",
    hubHeading: "Explorer le réseau plus loin",
    langHeading: "Lire cette page dans votre langue",
  },
  {
    code: "es",
    hreflang: "es",
    dir: "ltr",
    label: "Español",
    title: "La única alternativa real a Omegle: sin bots, videochat instantáneo | Caakus",
    description:
      "Caakus es la alternativa a Omegle que sí funciona: personas reales en menos de 2 segundos, vídeo peer-to-peer con WebRTC, cero cámaras falsas y sin pagar para empezar.",
    keywords:
      "alternativa a omegle, paginas como omegle, omegle en español, videochat aleatorio, hablar con desconocidos, videochat gratis sin registro",
    h1: "La alternativa a Omegle que sí funciona.",
    h2: "Personas reales en menos de 2 segundos. Cero bots. Cero latencia.",
    intro:
      "Omegle cerró en 2023 y casi todos sus sustitutos repiten la misma trampa: cámaras falsas en bucle, un muro de pago antes del primer match o una sala que nunca se llena. Caakus mueve el vídeo directamente entre dos navegadores con WebRTC: quien aparece en pantalla está en vivo y sin grabación.",
    pains: [
      "Sin cámaras falsas. Cada emisión es una conexión directa negociada en tu navegador; un vídeo pregrabado es imposible por diseño.",
      "Sin muro de pago. Emparejar, hablar y escribir es gratis para siempre. Nada se bloquea detrás de una tarjeta.",
      "Sin granjas de bots. Huella del dispositivo, límites de peticiones y moderación humana retiran las cuentas automáticas antes de que te toquen.",
    ],
    features: [
      { t: "WebRTC peer-to-peer real", d: "El vídeo y el audio viajan de navegador a navegador, sin un servidor en medio que te grabe." },
      { t: "Emparejamiento en menos de 2 s", d: "Colas regionales y candidatos ICE precalentados cierran la conexión antes de que termines esta frase." },
      { t: "Moderación que responde", d: "Los reportes los revisan personas. Quien reincide pierde el emparejamiento en minutos." },
    ],
    cta: "Iniciar match en vivo",
    ctaNote: "Sin descargas. Sin tarjeta. La cámara solo se activa al empezar.",
    onlineSuffix: "personas conectadas ahora mismo",
    badges: ["Protegido con WebRTC", "Cifrado de extremo a extremo", "Filtrado estricto de bots"],
    compareHeading: "Omegle frente a Caakus, sin adornos",
    rows: [
      { label: "Estado del servicio", omegle: "Cerrado en 2023", caakus: "Activo en todo el mundo" },
      { label: "Coste para empezar", omegle: "Gratis", caakus: "Gratis para siempre" },
      { label: "Ruta del vídeo", omegle: "Por servidor", caakus: "Peer-to-peer WebRTC" },
      { label: "Cuenta obligatoria", omegle: "No", caakus: "No, perfil opcional" },
      { label: "Moderación", omegle: "Mínima", caakus: "Humana + filtros" },
    ],
    faqHeading: "Preguntas que la gente hace de verdad",
    faq: [
      { q: "¿Caakus es realmente gratis?", a: "Sí. El vídeo aleatorio, el audio y el chat no cuestan nada. Hay extras estéticos opcionales, pero nada bloquea el primer match." },
      { q: "¿Necesito cuenta para empezar?", a: "No. Pulsas empezar y emparejas al instante. El perfil solo guarda amigos, historial y puntos." },
      { q: "¿Las cámaras son personas reales?", a: "Sí. La emisión es una conexión en vivo entre dos navegadores, así que un bucle pregrabado no puede servirse como match." },
      { q: "¿Es seguro y privado?", a: "El vídeo y el audio se cifran en tránsito con WebRTC y nunca se graban. Los reportes llegan a moderadores humanos y puedes salir de cualquier match con un toque." },
    ],
    directoryHeading: "Encuentra tu comunidad y tu ciudad",
    hubHeading: "Profundiza en la red",
    langHeading: "Lee esta página en tu idioma",
  },
  {
    code: "pt",
    hreflang: "pt",
    dir: "ltr",
    label: "Português",
    title: "A verdadeira alternativa ao Omegle: sem bots, vídeo instantâneo | Caakus",
    description:
      "Caakus é a alternativa ao Omegle que funciona de verdade: pessoas reais em menos de 2 segundos, vídeo peer-to-peer via WebRTC, zero câmeras falsas e nada a pagar para começar.",
    keywords:
      "alternativa ao omegle, sites como omegle, omegle português, bate-papo por vídeo aleatório, falar com estranhos, videochat grátis sem cadastro",
    h1: "A alternativa ao Omegle que funciona de verdade.",
    h2: "Pessoas reais em menos de 2 segundos. Zero bots. Zero latência.",
    intro:
      "O Omegle encerrou em 2023 e quase todo substituto repete a mesma armadilha: câmeras falsas em loop, pagamento antes do primeiro match ou uma sala que nunca enche. O Caakus envia o vídeo direto entre dois navegadores com WebRTC: quem aparece está ao vivo e nada é gravado.",
    pains: [
      "Sem câmeras falsas. Cada transmissão é uma conexão direta negociada no seu navegador; vídeo pré-gravado é impossível por arquitetura.",
      "Sem paywall. Match, vídeo, áudio e texto são gratuitos para sempre. Nada exige cartão antes de conhecer alguém.",
      "Sem fazendas de bots. Impressão digital do aparelho, limites de requisição e moderação humana removem contas automáticas antes de chegarem a você.",
    ],
    features: [
      { t: "WebRTC ponto a ponto real", d: "Vídeo e áudio vão de navegador para navegador, sem servidor no meio gravando você." },
      { t: "Match em menos de 2 s", d: "Filas regionais e candidatos ICE pré-aquecidos fecham a conexão antes de você terminar esta linha." },
      { t: "Moderação que responde", d: "Denúncias passam por pessoas. Reincidentes perdem o direito de dar match em minutos." },
    ],
    cta: "Iniciar match ao vivo",
    ctaNote: "Sem download. Sem cartão. A câmera só liga quando você começa.",
    onlineSuffix: "pessoas online agora",
    badges: ["Protegido por WebRTC", "Criptografia ponta a ponta", "Filtro rígido de bots"],
    compareHeading: "Omegle x Caakus, com honestidade",
    rows: [
      { label: "Situação do serviço", omegle: "Encerrado em 2023", caakus: "No ar em todo o mundo" },
      { label: "Custo para começar", omegle: "Grátis", caakus: "Grátis para sempre" },
      { label: "Caminho do vídeo", omegle: "Via servidor", caakus: "Peer-to-peer WebRTC" },
      { label: "Conta obrigatória", omegle: "Não", caakus: "Não, perfil opcional" },
      { label: "Moderação", omegle: "Mínima", caakus: "Humana + filtros" },
    ],
    faqHeading: "Perguntas que as pessoas realmente fazem",
    faq: [
      { q: "O Caakus é mesmo gratuito?", a: "Sim. Match por vídeo, áudio e chat não custam nada. Existem itens cosméticos opcionais, mas nada bloqueia o primeiro match." },
      { q: "Preciso de conta para começar?", a: "Não. Você aperta iniciar e já conecta. O perfil serve para guardar amigos, histórico e pontos." },
      { q: "As câmeras são pessoas reais?", a: "Sim. A transmissão é uma conexão ao vivo entre dois navegadores, então um vídeo gravado não pode ser entregue como match." },
      { q: "É seguro e privado?", a: "Vídeo e áudio são criptografados em trânsito pelo WebRTC e nunca gravados. Denúncias vão para moderadores humanos e você sai de qualquer match com um toque." },
    ],
    directoryHeading: "Encontre sua comunidade e cidade",
    hubHeading: "Explore mais a rede",
    langHeading: "Leia esta página no seu idioma",
  },
  {
    code: "de",
    hreflang: "de",
    dir: "ltr",
    label: "Deutsch",
    title: "Die einzige echte Omegle-Alternative: keine Bots, sofort Videochat | Caakus",
    description:
      "Caakus ist die Omegle-Alternative, die wirklich funktioniert: echte Menschen in unter 2 Sekunden, Peer-to-Peer-Video über WebRTC, keine Fake-Cams und keine Bezahlschranke.",
    keywords:
      "omegle alternative deutsch, seiten wie omegle, omegle ersatz, zufalls videochat, mit fremden sprechen, kostenloser videochat ohne anmeldung",
    h1: "Die Omegle-Alternative, die wirklich funktioniert.",
    h2: "Echte Menschen in unter 2 Sekunden. Keine Bots. Keine Verzögerung.",
    intro:
      "Omegle wurde 2023 abgeschaltet, und fast jeder Ersatz wiederholt dieselbe Falle: Fake-Cams in Endlosschleife, Bezahlschranke vor dem ersten Match oder eine Lobby, die nie voll wird. Caakus überträgt Video direkt zwischen zwei Browsern per WebRTC – die Person auf dem Bildschirm ist live und wird nicht aufgezeichnet.",
    pains: [
      "Keine Fake-Cams. Jeder Stream ist eine direkte Verbindung, die im Browser ausgehandelt wird – vorproduzierte Schleifen sind technisch ausgeschlossen.",
      "Keine Bezahlschranke. Matching, Video, Audio und Text bleiben dauerhaft kostenlos. Nichts hängt hinter einer Kreditkarte.",
      "Keine Bot-Farmen. Geräte-Fingerprinting, Rate Limits und menschliche Moderation entfernen automatisierte Konten, bevor sie dich erreichen.",
    ],
    features: [
      { t: "Echtes P2P-WebRTC", d: "Video und Audio laufen direkt von Browser zu Browser, ohne Server dazwischen, der mitschneidet." },
      { t: "Match in unter 2 Sekunden", d: "Regionale Warteschlangen und vorgewärmte ICE-Kandidaten schließen die Verbindung, bevor du diesen Satz zu Ende liest." },
      { t: "Moderation, die reagiert", d: "Meldungen prüfen Menschen. Wiederholungstäter verlieren das Matching innerhalb von Minuten." },
    ],
    cta: "Live-Match jetzt starten",
    ctaNote: "Kein Download. Keine Karte. Die Kamera startet erst auf Klick.",
    onlineSuffix: "Menschen gerade online",
    badges: ["WebRTC-gesichert", "Ende-zu-Ende verschlüsselt", "Strenge Bot-Filter"],
    compareHeading: "Omegle gegen Caakus, ehrlich",
    rows: [
      { label: "Status des Dienstes", omegle: "2023 eingestellt", caakus: "Weltweit aktiv" },
      { label: "Kosten zum Start", omegle: "Kostenlos", caakus: "Dauerhaft kostenlos" },
      { label: "Medienweg", omegle: "Über Server", caakus: "Peer-to-Peer WebRTC" },
      { label: "Konto nötig", omegle: "Nein", caakus: "Nein, Profil optional" },
      { label: "Moderation", omegle: "Minimal", caakus: "Menschlich + Filter" },
    ],
    faqHeading: "Fragen, die wirklich gestellt werden",
    faq: [
      { q: "Ist Caakus wirklich kostenlos?", a: "Ja. Zufalls-Video, Audio und Chat kosten nichts und bleiben es. Optionale Extras gibt es, aber nichts blockiert das erste Match." },
      { q: "Brauche ich ein Konto?", a: "Nein. Starten und sofort matchen. Ein Profil speichert nur Freunde, Verlauf und Punkte." },
      { q: "Sind die Cams echte Menschen?", a: "Ja. Der Stream ist eine Live-Verbindung zwischen zwei Browsern, eine Aufzeichnung kann nicht als Match ausgeliefert werden." },
      { q: "Ist es sicher und privat?", a: "Video und Audio sind per WebRTC bei der Übertragung verschlüsselt und werden nie gespeichert. Meldungen gehen an Menschen, und du verlässt jedes Match mit einem Tippen." },
    ],
    directoryHeading: "Finde deine Community und Stadt",
    hubHeading: "Tiefer ins Netzwerk",
    langHeading: "Diese Seite in deiner Sprache",
  },
  {
    code: "it",
    hreflang: "it",
    dir: "ltr",
    label: "Italiano",
    title: "La vera alternativa a Omegle: niente bot, videochat istantanea | Caakus",
    description:
      "Caakus è l'alternativa a Omegle che funziona davvero: persone reali in meno di 2 secondi, video peer-to-peer con WebRTC, zero webcam finte e nessun pagamento per iniziare.",
    keywords:
      "alternativa a omegle, siti come omegle, omegle italiano, videochat casuale, parlare con sconosciuti, videochat gratis senza registrazione",
    h1: "L'alternativa a Omegle che funziona davvero.",
    h2: "Persone reali in meno di 2 secondi. Zero bot. Zero latenza.",
    intro:
      "Omegle ha chiuso nel 2023 e quasi ogni sostituto ripete la stessa trappola: webcam finte in loop, paywall prima del primo match o una lobby sempre vuota. Caakus fa viaggiare il video direttamente tra due browser con WebRTC: chi vedi è in diretta e nulla viene registrato.",
    pains: [
      "Niente webcam finte. Ogni flusso è una connessione diretta negoziata nel browser: un video registrato è impossibile per architettura.",
      "Niente paywall. Match, video, audio e testo sono gratis per sempre. Nessuna carta prima di conoscere qualcuno.",
      "Niente bot farm. Impronta del dispositivo, limiti di richieste e moderazione umana tolgono gli account automatici prima che ti raggiungano.",
    ],
    features: [
      { t: "WebRTC peer-to-peer reale", d: "Video e audio passano da browser a browser, senza un server che registra in mezzo." },
      { t: "Match in meno di 2 secondi", d: "Code regionali e candidati ICE pronti chiudono la connessione prima che tu finisca questa riga." },
      { t: "Moderazione che risponde", d: "Le segnalazioni le leggono persone. Chi recidiva perde il match in pochi minuti." },
    ],
    cta: "Avvia un match dal vivo",
    ctaNote: "Nessun download. Nessuna carta. La fotocamera parte solo al via.",
    onlineSuffix: "persone online in questo momento",
    badges: ["Protetto da WebRTC", "Cifratura end-to-end", "Filtro anti-bot severo"],
    compareHeading: "Omegle contro Caakus, senza giri di parole",
    rows: [
      { label: "Stato del servizio", omegle: "Chiuso nel 2023", caakus: "Attivo nel mondo" },
      { label: "Costo per iniziare", omegle: "Gratis", caakus: "Gratis per sempre" },
      { label: "Percorso del video", omegle: "Via server", caakus: "Peer-to-peer WebRTC" },
      { label: "Account obbligatorio", omegle: "No", caakus: "No, profilo opzionale" },
      { label: "Moderazione", omegle: "Minima", caakus: "Umana + filtri" },
    ],
    faqHeading: "Le domande che si fanno davvero",
    faq: [
      { q: "Caakus è davvero gratis?", a: "Sì. Video casuale, audio e chat non costano nulla. Esistono extra estetici opzionali, ma nulla blocca il primo match." },
      { q: "Serve un account?", a: "No. Premi avvia e sei collegato. Il profilo serve solo per amici, cronologia e punti." },
      { q: "Le webcam sono persone vere?", a: "Sì. Il flusso è una connessione live tra due browser, quindi un video registrato non può essere servito come match." },
      { q: "È sicuro e privato?", a: "Video e audio sono cifrati in transito con WebRTC e mai registrati. Le segnalazioni vanno a moderatori umani e lasci ogni match con un tocco." },
    ],
    directoryHeading: "Trova la tua community e la tua città",
    hubHeading: "Esplora la rete più a fondo",
    langHeading: "Leggi questa pagina nella tua lingua",
  },
  {
    code: "nl",
    hreflang: "nl",
    dir: "ltr",
    label: "Nederlands",
    title: "Het enige echte Omegle-alternatief: geen bots, direct videochat | Caakus",
    description:
      "Caakus is het Omegle-alternatief dat echt werkt: echte mensen binnen 2 seconden, peer-to-peer video via WebRTC, geen nepcams en geen betaalmuur om te starten.",
    keywords:
      "omegle alternatief, sites zoals omegle, omegle vervanger, willekeurige videochat, praten met vreemden, gratis videochat zonder registratie",
    h1: "Het Omegle-alternatief dat echt werkt.",
    h2: "Echte mensen binnen 2 seconden. Geen bots. Geen vertraging.",
    intro:
      "Omegle stopte in 2023 en bijna elke opvolger herhaalt dezelfde val: nepcams in een loop, een betaalmuur voor het eerste match of een lobby die nooit vol raakt. Caakus stuurt video rechtstreeks tussen twee browsers via WebRTC: wie je ziet is live en wordt niet opgenomen.",
    pains: [
      "Geen nepcams. Elke stream is een directe verbinding in je browser; een vooraf opgenomen video kan hier niet bestaan.",
      "Geen betaalmuur. Matchen, video, audio en tekst blijven gratis. Niets zit achter een creditcard.",
      "Geen botfarms. Apparaatvingerafdruk, ratelimieten en menselijke moderatie halen automatische accounts eruit voordat ze jou bereiken.",
    ],
    features: [
      { t: "Echte P2P-WebRTC", d: "Video en audio gaan van browser naar browser, zonder server die meekijkt." },
      { t: "Match binnen 2 seconden", d: "Regionale wachtrijen en voorbereide ICE-kandidaten ronden de verbinding af voor je deze zin uit hebt." },
      { t: "Moderatie die reageert", d: "Meldingen worden door mensen beoordeeld. Herhaalde overtreders verliezen matchen binnen minuten." },
    ],
    cta: "Start nu een live match",
    ctaNote: "Geen download. Geen kaart. Camera pas bij de start.",
    onlineSuffix: "mensen nu online",
    badges: ["WebRTC-beveiligd", "End-to-end versleuteld", "Strikte botfiltering"],
    compareHeading: "Omegle versus Caakus, eerlijk",
    rows: [
      { label: "Status van de dienst", omegle: "Gestopt in 2023", caakus: "Wereldwijd actief" },
      { label: "Kosten om te starten", omegle: "Gratis", caakus: "Altijd gratis" },
      { label: "Route van het beeld", omegle: "Via server", caakus: "Peer-to-peer WebRTC" },
      { label: "Account nodig", omegle: "Nee", caakus: "Nee, profiel optioneel" },
      { label: "Moderatie", omegle: "Minimaal", caakus: "Menselijk + filters" },
    ],
    faqHeading: "Vragen die mensen echt stellen",
    faq: [
      { q: "Is Caakus echt gratis?", a: "Ja. Willekeurige video, audio en chat kosten niets en blijven gratis. Optionele extra's bestaan, maar blokkeren nooit het eerste match." },
      { q: "Heb ik een account nodig?", a: "Nee. Druk op start en je matcht meteen. Een profiel bewaart alleen vrienden, geschiedenis en punten." },
      { q: "Zijn de cams echte mensen?", a: "Ja. De stream is een live verbinding tussen twee browsers, dus een opname kan niet als match worden geleverd." },
      { q: "Is het veilig en privé?", a: "Video en audio zijn tijdens transport versleuteld via WebRTC en worden nooit opgeslagen. Meldingen gaan naar mensen en je verlaat elk match met één tik." },
    ],
    directoryHeading: "Vind je community en stad",
    hubHeading: "Verder het netwerk in",
    langHeading: "Lees deze pagina in jouw taal",
  },
  {
    code: "pl",
    hreflang: "pl",
    dir: "ltr",
    label: "Polski",
    title: "Jedyna prawdziwa alternatywa dla Omegle: bez botów, czat wideo od razu | Caakus",
    description:
      "Caakus to alternatywa dla Omegle, która naprawdę działa: prawdziwi ludzie w mniej niż 2 sekundy, wideo peer-to-peer przez WebRTC, zero fałszywych kamer i brak opłat na start.",
    keywords:
      "alternatywa dla omegle, strony jak omegle, zamiennik omegle, losowy czat wideo, rozmowa z nieznajomymi, darmowy czat wideo bez rejestracji",
    h1: "Alternatywa dla Omegle, która naprawdę działa.",
    h2: "Prawdziwi ludzie w mniej niż 2 sekundy. Zero botów. Zero opóźnień.",
    intro:
      "Omegle zamknięto w 2023 roku, a kolejne zamienniki powielają tę samą pułapkę: zapętlone fałszywe kamery, opłata przed pierwszym połączeniem albo pusta poczekalnia. Caakus przesyła wideo bezpośrednio między dwiema przeglądarkami przez WebRTC — osoba po drugiej stronie jest na żywo i nic nie jest nagrywane.",
    pains: [
      "Bez fałszywych kamer. Każdy strumień to bezpośrednie połączenie negocjowane w przeglądarce, więc nagranie nie może udawać rozmówcy.",
      "Bez opłat na start. Łączenie, wideo, audio i czat są darmowe na zawsze. Nic nie wymaga karty.",
      "Bez farm botów. Odcisk urządzenia, limity zapytań i moderacja przez ludzi usuwają automaty, zanim do ciebie trafią.",
    ],
    features: [
      { t: "Prawdziwe P2P WebRTC", d: "Wideo i dźwięk idą z przeglądarki do przeglądarki, bez serwera pośrodku." },
      { t: "Połączenie poniżej 2 sekund", d: "Kolejki regionalne i gotowe kandydaty ICE domykają połączenie szybciej, niż przeczytasz to zdanie." },
      { t: "Moderacja, która odpowiada", d: "Zgłoszenia czytają ludzie. Recydywiści tracą dostęp do łączenia w kilka minut." },
    ],
    cta: "Uruchom połączenie na żywo",
    ctaNote: "Bez pobierania. Bez karty. Kamera dopiero po starcie.",
    onlineSuffix: "osób online w tej chwili",
    badges: ["Zabezpieczone WebRTC", "Szyfrowanie end-to-end", "Ostre filtrowanie botów"],
    compareHeading: "Omegle a Caakus, bez ściemy",
    rows: [
      { label: "Status serwisu", omegle: "Zamknięty w 2023", caakus: "Działa na świecie" },
      { label: "Koszt startu", omegle: "Darmowy", caakus: "Darmowy na zawsze" },
      { label: "Droga obrazu", omegle: "Przez serwer", caakus: "Peer-to-peer WebRTC" },
      { label: "Wymagane konto", omegle: "Nie", caakus: "Nie, profil opcjonalny" },
      { label: "Moderacja", omegle: "Minimalna", caakus: "Ludzie + filtry" },
    ],
    faqHeading: "Pytania, które padają naprawdę",
    faq: [
      { q: "Czy Caakus jest darmowy?", a: "Tak. Losowe wideo, audio i czat nic nie kosztują. Są opcjonalne dodatki kosmetyczne, ale nic nie blokuje pierwszego połączenia." },
      { q: "Czy potrzebuję konta?", a: "Nie. Naciskasz start i od razu łączysz się z kimś. Profil zapisuje tylko znajomych, historię i punkty." },
      { q: "Czy kamery to prawdziwi ludzie?", a: "Tak. Strumień to połączenie na żywo między dwiema przeglądarkami, więc nagranie nie może zostać podane jako rozmówca." },
      { q: "Czy to bezpieczne?", a: "Wideo i dźwięk są szyfrowane w trakcie przesyłu przez WebRTC i nigdy nie są nagrywane. Zgłoszenia trafiają do ludzi, a rozmowę kończysz jednym dotknięciem." },
    ],
    directoryHeading: "Znajdź swoją społeczność i miasto",
    hubHeading: "Wejdź głębiej w sieć",
    langHeading: "Przeczytaj tę stronę w swoim języku",
  },
  {
    code: "tr",
    hreflang: "tr",
    dir: "ltr",
    label: "Türkçe",
    title: "Gerçek Omegle alternatifi: bot yok, anında görüntülü sohbet | Caakus",
    description:
      "Caakus gerçekten çalışan Omegle alternatifi: 2 saniyenin altında gerçek insanlar, WebRTC ile uçtan uca eşler arası görüntü, sahte kamera yok ve başlamak için ödeme yok.",
    keywords:
      "omegle alternatifi, omegle gibi siteler, omegle yerine, rastgele görüntülü sohbet, yabancılarla konuş, ücretsiz görüntülü sohbet üyeliksiz",
    h1: "Gerçekten çalışan Omegle alternatifi.",
    h2: "2 saniyenin altında gerçek insanlar. Sıfır bot. Sıfır gecikme.",
    intro:
      "Omegle 2023'te kapandı ve denediğin her alternatif aynı tuzağı tekrarladı: döngüye alınmış sahte kameralar, ilk eşleşmeden önce ödeme duvarı ya da hiç dolmayan bir lobi. Caakus görüntüyü WebRTC ile doğrudan iki tarayıcı arasında taşır; karşındaki kişi canlıdır ve kayıt alınmaz.",
    pains: [
      "Sahte kamera yok. Her yayın tarayıcında kurulan canlı bir bağlantıdır; önceden kaydedilmiş döngü mimari olarak mümkün değildir.",
      "Ödeme duvarı yok. Eşleşme, görüntü, ses ve yazışma sonsuza dek ücretsiz. Hiçbir şey kart arkasına kilitlenmez.",
      "Bot çiftliği yok. Cihaz parmak izi, hız sınırları ve insan moderasyonu otomatik hesapları sana ulaşmadan ayıklar.",
    ],
    features: [
      { t: "Gerçek P2P WebRTC", d: "Görüntü ve ses tarayıcıdan tarayıcıya gider; arada seni kaydeden bir sunucu yoktur." },
      { t: "2 saniyenin altında eşleşme", d: "Bölgesel havuzlar ve önceden hazırlanmış ICE adayları bağlantıyı sen bu satırı bitirmeden kurar." },
      { t: "Yanıt veren moderasyon", d: "Şikayetleri insanlar inceler. Tekrar edenler dakikalar içinde eşleşme hakkını kaybeder." },
    ],
    cta: "Canlı eşleşmeyi başlat",
    ctaNote: "İndirme yok. Kart yok. Kamera sadece başlatınca açılır.",
    onlineSuffix: "kişi şu anda çevrim içi",
    badges: ["WebRTC korumalı", "Uçtan uca şifreli", "Sıkı bot filtresi"],
    compareHeading: "Omegle ve Caakus, dürüstçe",
    rows: [
      { label: "Servis durumu", omegle: "2023'te kapandı", caakus: "Dünya çapında aktif" },
      { label: "Başlangıç maliyeti", omegle: "Ücretsiz", caakus: "Her zaman ücretsiz" },
      { label: "Görüntü yolu", omegle: "Sunucu üzerinden", caakus: "Eşler arası WebRTC" },
      { label: "Hesap zorunlu", omegle: "Hayır", caakus: "Hayır, profil isteğe bağlı" },
      { label: "Moderasyon", omegle: "Çok az", caakus: "İnsan + filtre" },
    ],
    faqHeading: "İnsanların gerçekten sorduğu sorular",
    faq: [
      { q: "Caakus gerçekten ücretsiz mi?", a: "Evet. Rastgele görüntü, ses ve sohbet hiçbir ücret istemez. İsteğe bağlı görsel ekler vardır ama ilk eşleşmeyi hiçbir şey engellemez." },
      { q: "Başlamak için hesap gerekir mi?", a: "Hayır. Başlat'a basıp hemen eşleşirsin. Profil yalnızca arkadaşlarını, geçmişini ve puanlarını saklar." },
      { q: "Kameralar gerçek insan mı?", a: "Evet. Yayın iki tarayıcı arasında canlı bir bağlantıdır, bu yüzden kayıt bir eşleşme olarak sunulamaz." },
      { q: "Güvenli ve gizli mi?", a: "Görüntü ve ses WebRTC ile aktarım sırasında şifrelenir ve asla kaydedilmez. Şikayetler insanlara gider, istediğin an tek dokunuşla çıkarsın." },
    ],
    directoryHeading: "Topluluğunu ve şehrini bul",
    hubHeading: "Ağın derinine in",
    langHeading: "Bu sayfayı kendi dilinde oku",
  },
  {
    code: "ru",
    hreflang: "ru",
    dir: "ltr",
    label: "Русский",
    title: "Настоящая альтернатива Omegle: без ботов, видеочат сразу | Caakus",
    description:
      "Caakus — альтернатива Omegle, которая действительно работает: живые люди менее чем за 2 секунды, видео peer-to-peer через WebRTC, никаких фейковых камер и оплаты на старте.",
    keywords:
      "альтернатива omegle, сайты как omegle, замена omegle, случайный видеочат, общение с незнакомцами, бесплатный видеочат без регистрации",
    h1: "Альтернатива Omegle, которая действительно работает.",
    h2: "Живые люди менее чем за 2 секунды. Ноль ботов. Ноль задержек.",
    intro:
      "Omegle закрылся в 2023 году, и почти каждая замена повторяет ту же ловушку: зацикленные фейковые камеры, оплата до первого собеседника или пустой зал ожидания. Caakus передаёт видео напрямую между двумя браузерами по WebRTC — человек на экране находится в прямом эфире, запись не ведётся.",
    pains: [
      "Никаких фейковых камер. Каждый поток — прямое соединение, установленное в браузере; заранее записанный ролик подать как собеседника невозможно.",
      "Никакой оплаты на старте. Поиск, видео, аудио и чат бесплатны навсегда. Ничего не спрятано за картой.",
      "Никаких ботоферм. Отпечаток устройства, лимиты запросов и живая модерация убирают автоматические аккаунты до того, как они дойдут до вас.",
    ],
    features: [
      { t: "Настоящий P2P WebRTC", d: "Видео и звук идут напрямую между браузерами, без сервера-посредника, который вас записывает." },
      { t: "Соединение меньше 2 секунд", d: "Региональные очереди и подготовленные ICE-кандидаты завершают соединение быстрее, чем вы дочитаете строку." },
      { t: "Модерация, которая отвечает", d: "Жалобы читают люди. Нарушители теряют доступ к поиску за считанные минуты." },
    ],
    cta: "Запустить живой матч",
    ctaNote: "Без загрузки. Без карты. Камера включается только после старта.",
    onlineSuffix: "человек онлайн прямо сейчас",
    badges: ["Защита WebRTC", "Сквозное шифрование", "Строгий фильтр ботов"],
    compareHeading: "Omegle против Caakus, честно",
    rows: [
      { label: "Статус сервиса", omegle: "Закрыт в 2023", caakus: "Работает по всему миру" },
      { label: "Стоимость старта", omegle: "Бесплатно", caakus: "Бесплатно навсегда" },
      { label: "Путь видео", omegle: "Через сервер", caakus: "Peer-to-peer WebRTC" },
      { label: "Нужен аккаунт", omegle: "Нет", caakus: "Нет, профиль по желанию" },
      { label: "Модерация", omegle: "Минимальная", caakus: "Люди + фильтры" },
    ],
    faqHeading: "Вопросы, которые задают на самом деле",
    faq: [
      { q: "Caakus действительно бесплатный?", a: "Да. Случайное видео, аудио и чат ничего не стоят. Есть необязательные украшения, но первый матч ничем не заблокирован." },
      { q: "Нужен ли аккаунт?", a: "Нет. Нажимаете «старт» и сразу соединяетесь. Профиль хранит только друзей, историю и баллы." },
      { q: "Камеры — это живые люди?", a: "Да. Поток — живое соединение между двумя браузерами, поэтому запись не может быть выдана за собеседника." },
      { q: "Это безопасно и приватно?", a: "Видео и звук шифруются при передаче по WebRTC и никогда не сохраняются. Жалобы уходят живым модераторам, выйти можно одним касанием." },
    ],
    directoryHeading: "Найдите своё сообщество и город",
    hubHeading: "Глубже в сеть",
    langHeading: "Читайте эту страницу на своём языке",
  },
  {
    code: "ar",
    hreflang: "ar",
    dir: "rtl",
    label: "العربية",
    title: "البديل الحقيقي لـ Omegle: بلا بوتات، دردشة فيديو فورية | Caakus",
    description:
      "Caakus هو بديل Omegle الذي يعمل فعلاً: أشخاص حقيقيون في أقل من ثانيتين، فيديو مباشر بين المتصفحين عبر WebRTC، بلا كاميرات مزيفة وبلا دفع للبدء.",
    keywords:
      "بديل omegle, مواقع مثل omegle, دردشة فيديو عشوائية, التحدث مع الغرباء, شات فيديو مجاني بدون تسجيل",
    h1: "بديل Omegle الذي يعمل فعلاً.",
    h2: "أشخاص حقيقيون في أقل من ثانيتين. بلا بوتات. بلا تأخير.",
    intro:
      "أغلق Omegle في 2023، وكل بديل جربته كرر الفخ نفسه: كاميرات مزيفة مكررة، أو دفع قبل أول محادثة، أو قاعة انتظار لا تمتلئ أبداً. يمرر Caakus الفيديو مباشرة بين متصفحين عبر WebRTC، فالشخص أمامك موجود الآن ولا يجري تسجيل شيء.",
    pains: [
      "لا كاميرات مزيفة. كل بث هو اتصال مباشر يُبنى داخل متصفحك، لذا يستحيل تقديم مقطع مسجل كمحادثة.",
      "لا دفع للبدء. المطابقة والفيديو والصوت والكتابة مجانية دائماً، ولا شيء محجوب خلف بطاقة.",
      "لا مزارع بوتات. بصمة الجهاز وحدود الطلبات والإشراف البشري تزيل الحسابات الآلية قبل أن تصل إليك.",
    ],
    features: [
      { t: "WebRTC مباشر بين الطرفين", d: "الفيديو والصوت ينتقلان من متصفح إلى متصفح دون خادم وسيط يسجلك." },
      { t: "مطابقة في أقل من ثانيتين", d: "طوابير إقليمية ومرشحات ICE جاهزة تنهي الاتصال قبل أن تكمل قراءة هذا السطر." },
      { t: "إشراف يستجيب", d: "البلاغات يراجعها بشر، والمخالف المتكرر يفقد المطابقة خلال دقائق." },
    ],
    cta: "ابدأ مكالمة مباشرة الآن",
    ctaNote: "بلا تنزيل. بلا بطاقة. الكاميرا تعمل عند الضغط فقط.",
    onlineSuffix: "شخصاً متصلون الآن",
    badges: ["محمي بـ WebRTC", "تشفير من طرف إلى طرف", "تصفية صارمة للبوتات"],
    compareHeading: "Omegle مقابل Caakus بصراحة",
    rows: [
      { label: "حالة الخدمة", omegle: "أُغلق في 2023", caakus: "يعمل عالمياً" },
      { label: "تكلفة البدء", omegle: "مجاني", caakus: "مجاني دائماً" },
      { label: "مسار الفيديو", omegle: "عبر خادم", caakus: "مباشر عبر WebRTC" },
      { label: "حساب إلزامي", omegle: "لا", caakus: "لا، الملف اختياري" },
      { label: "الإشراف", omegle: "ضعيف", caakus: "بشري + مرشحات" },
    ],
    faqHeading: "أسئلة يطرحها الناس فعلاً",
    faq: [
      { q: "هل Caakus مجاني حقاً؟", a: "نعم. المطابقة بالفيديو والصوت والدردشة بلا مقابل. هناك إضافات تجميلية اختيارية، لكن لا شيء يمنع أول محادثة." },
      { q: "هل أحتاج حساباً للبدء؟", a: "لا. اضغط ابدأ وستتصل فوراً. الملف الشخصي يحفظ الأصدقاء والسجل والنقاط فقط." },
      { q: "هل الكاميرات لأشخاص حقيقيين؟", a: "نعم. البث اتصال حي بين متصفحين، لذا لا يمكن تقديم تسجيل مسبق كمحادثة." },
      { q: "هل هو آمن وخاص؟", a: "الفيديو والصوت مشفران أثناء النقل عبر WebRTC ولا يُسجلان أبداً. البلاغات تصل لمشرفين بشر، ويمكنك الخروج بلمسة." },
    ],
    directoryHeading: "اعثر على مجتمعك ومدينتك",
    hubHeading: "تعمّق داخل الشبكة",
    langHeading: "اقرأ هذه الصفحة بلغتك",
  },
  {
    code: "hi",
    hreflang: "hi",
    dir: "ltr",
    label: "हिन्दी",
    title: "असली Omegle विकल्प: कोई बॉट नहीं, तुरंत वीडियो चैट | Caakus",
    description:
      "Caakus वही Omegle विकल्प है जो सचमुच काम करता है: 2 सेकंड से कम में असली लोग, WebRTC पर सीधा पीयर-टू-पीयर वीडियो, कोई नकली कैम नहीं और शुरू करने के लिए कोई भुगतान नहीं।",
    keywords:
      "omegle alternative hindi, omegle जैसी साइट, रैंडम वीडियो चैट, अजनबियों से बात, फ्री वीडियो चैट बिना रजिस्ट्रेशन",
    h1: "वह Omegle विकल्प जो सचमुच काम करता है।",
    h2: "2 सेकंड से कम में असली लोग। शून्य बॉट। शून्य लैग।",
    intro:
      "Omegle 2023 में बंद हो गया और उसके बाद हर विकल्प वही जाल दोहराता रहा: लूप में चलती नकली कैम, पहले मैच से पहले पेमेंट, या कभी न भरने वाली लॉबी। Caakus वीडियो को WebRTC से सीधे दो ब्राउज़रों के बीच भेजता है, इसलिए स्क्रीन पर मौजूद व्यक्ति सचमुच लाइव है और कुछ भी रिकॉर्ड नहीं होता।",
    pains: [
      "कोई नकली कैम नहीं। हर स्ट्रीम आपके ब्राउज़र में बनी लाइव कनेक्शन है, इसलिए रिकॉर्डेड वीडियो को मैच की तरह नहीं दिखाया जा सकता।",
      "शुरू करने के लिए कोई पेवॉल नहीं। मैचिंग, वीडियो, ऑडियो और चैट हमेशा मुफ़्त हैं। कार्ड मांगने वाला कोई कदम नहीं।",
      "कोई बॉट फ़ार्म नहीं। डिवाइस फ़िंगरप्रिंट, रेट लिमिट और इंसानी मॉडरेशन ऑटोमेटेड अकाउंट आप तक पहुँचने से पहले हटा देते हैं।",
    ],
    features: [
      { t: "सच्चा P2P WebRTC", d: "वीडियो और ऑडियो सीधे ब्राउज़र से ब्राउज़र जाते हैं, बीच में कोई रिकॉर्ड करने वाला सर्वर नहीं।" },
      { t: "2 सेकंड से कम में मैच", d: "क्षेत्रीय पूल और पहले से तैयार ICE कैंडिडेट कनेक्शन इस लाइन के खत्म होने से पहले पूरा कर देते हैं।" },
      { t: "जवाब देने वाला मॉडरेशन", d: "रिपोर्ट इंसान पढ़ते हैं। बार-बार नियम तोड़ने वाले मिनटों में मैचिंग खो देते हैं।" },
    ],
    cta: "अभी लाइव मैच शुरू करें",
    ctaNote: "कोई डाउनलोड नहीं। कोई कार्ड नहीं। कैमरा सिर्फ़ शुरू करने पर।",
    onlineSuffix: "लोग अभी ऑनलाइन हैं",
    badges: ["WebRTC सुरक्षित", "एंड-टू-एंड एन्क्रिप्टेड", "सख़्त बॉट फ़िल्टरिंग"],
    compareHeading: "Omegle बनाम Caakus, ईमानदारी से",
    rows: [
      { label: "सेवा की स्थिति", omegle: "2023 में बंद", caakus: "दुनिया भर में चालू" },
      { label: "शुरू करने की लागत", omegle: "मुफ़्त", caakus: "हमेशा मुफ़्त" },
      { label: "वीडियो का रास्ता", omegle: "सर्वर से होकर", caakus: "पीयर-टू-पीयर WebRTC" },
      { label: "अकाउंट ज़रूरी", omegle: "नहीं", caakus: "नहीं, प्रोफ़ाइल वैकल्पिक" },
      { label: "मॉडरेशन", omegle: "बहुत कम", caakus: "इंसानी + फ़िल्टर" },
    ],
    faqHeading: "लोग सचमुच यही पूछते हैं",
    faq: [
      { q: "क्या Caakus वाकई मुफ़्त है?", a: "हाँ। रैंडम वीडियो, ऑडियो और चैट का कोई शुल्क नहीं है। वैकल्पिक सजावटी चीज़ें हैं, पर पहला मैच कभी नहीं रुकता।" },
      { q: "क्या शुरू करने के लिए अकाउंट चाहिए?", a: "नहीं। स्टार्ट दबाइए और तुरंत जुड़िए। प्रोफ़ाइल सिर्फ़ दोस्त, हिस्ट्री और पॉइंट सहेजती है।" },
      { q: "क्या कैम पर असली लोग होते हैं?", a: "हाँ। स्ट्रीम दो ब्राउज़रों के बीच लाइव कनेक्शन है, इसलिए रिकॉर्डिंग मैच के रूप में नहीं दी जा सकती।" },
      { q: "क्या यह सुरक्षित है?", a: "वीडियो और ऑडियो WebRTC पर ट्रांज़िट में एन्क्रिप्टेड रहते हैं और कभी रिकॉर्ड नहीं होते। रिपोर्ट इंसानी मॉडरेटर देखते हैं और आप एक टैप में बाहर आ सकते हैं।" },
    ],
    directoryHeading: "अपना समुदाय और शहर खोजें",
    hubHeading: "नेटवर्क में और गहराई",
    langHeading: "यह पेज अपनी भाषा में पढ़ें",
  },
  {
    code: "id",
    hreflang: "id",
    dir: "ltr",
    label: "Bahasa Indonesia",
    title: "Alternatif Omegle yang asli: tanpa bot, video chat instan | Caakus",
    description:
      "Caakus adalah alternatif Omegle yang benar-benar bekerja: orang sungguhan dalam kurang dari 2 detik, video peer-to-peer lewat WebRTC, tanpa kamera palsu dan tanpa bayar untuk mulai.",
    keywords:
      "alternatif omegle, situs seperti omegle, pengganti omegle, video chat acak, ngobrol dengan orang asing, video chat gratis tanpa daftar",
    h1: "Alternatif Omegle yang benar-benar bekerja.",
    h2: "Orang sungguhan dalam kurang dari 2 detik. Nol bot. Nol lag.",
    intro:
      "Omegle tutup pada 2023 dan hampir semua penggantinya mengulang jebakan yang sama: kamera palsu berulang, bayar sebelum match pertama, atau lobi yang tak pernah penuh. Caakus mengalirkan video langsung antara dua browser lewat WebRTC, jadi orang di layar benar-benar hadir dan tidak direkam.",
    pains: [
      "Tanpa kamera palsu. Setiap siaran adalah koneksi langsung yang dibangun di browser, sehingga rekaman tidak bisa disajikan sebagai match.",
      "Tanpa paywall. Match, video, audio, dan teks gratis selamanya. Tidak ada kartu sebelum kamu bertemu siapa pun.",
      "Tanpa ladang bot. Sidik perangkat, batas permintaan, dan moderasi manusia menyingkirkan akun otomatis sebelum sampai ke kamu.",
    ],
    features: [
      { t: "WebRTC peer-to-peer asli", d: "Video dan audio berjalan dari browser ke browser, tanpa server di tengah yang merekam." },
      { t: "Match di bawah 2 detik", d: "Antrean regional dan kandidat ICE siap pakai menutup koneksi sebelum kamu selesai membaca baris ini." },
      { t: "Moderasi yang merespons", d: "Laporan dibaca manusia. Pelanggar berulang kehilangan akses match dalam hitungan menit." },
    ],
    cta: "Mulai match langsung",
    ctaNote: "Tanpa unduhan. Tanpa kartu. Kamera aktif hanya saat mulai.",
    onlineSuffix: "orang online sekarang",
    badges: ["Diamankan WebRTC", "Terenkripsi ujung ke ujung", "Penyaringan bot ketat"],
    compareHeading: "Omegle vs Caakus, jujur saja",
    rows: [
      { label: "Status layanan", omegle: "Tutup pada 2023", caakus: "Aktif di seluruh dunia" },
      { label: "Biaya untuk mulai", omegle: "Gratis", caakus: "Gratis selamanya" },
      { label: "Jalur video", omegle: "Lewat server", caakus: "Peer-to-peer WebRTC" },
      { label: "Wajib akun", omegle: "Tidak", caakus: "Tidak, profil opsional" },
      { label: "Moderasi", omegle: "Minim", caakus: "Manusia + filter" },
    ],
    faqHeading: "Pertanyaan yang benar-benar ditanyakan",
    faq: [
      { q: "Apakah Caakus benar-benar gratis?", a: "Ya. Video acak, audio, dan chat tidak dipungut biaya. Ada item kosmetik opsional, tapi match pertama tidak pernah dikunci." },
      { q: "Perlu akun untuk mulai?", a: "Tidak. Tekan mulai dan langsung tersambung. Profil hanya menyimpan teman, riwayat, dan poin." },
      { q: "Apakah kameranya orang asli?", a: "Ya. Siaran adalah koneksi langsung antara dua browser, jadi rekaman tidak bisa dikirim sebagai match." },
      { q: "Apakah aman dan privat?", a: "Video dan audio dienkripsi saat transit lewat WebRTC dan tidak pernah direkam. Laporan ditangani manusia dan kamu bisa keluar dengan satu ketukan." },
    ],
    directoryHeading: "Temukan komunitas dan kotamu",
    hubHeading: "Masuk lebih dalam ke jaringan",
    langHeading: "Baca halaman ini dalam bahasamu",
  },
  {
    code: "ja",
    hreflang: "ja",
    dir: "ltr",
    label: "日本語",
    title: "本物のOmegle代替サービス：ボットなし、即つながるビデオチャット | Caakus",
    description:
      "Caakusは本当に機能するOmegleの代替サービスです。2秒以内に実在の相手とつながり、WebRTCによるP2P映像、偽カメラゼロ、開始に料金は不要。",
    keywords:
      "omegle 代替, omegle みたいなサイト, ランダムビデオチャット, 知らない人と話す, 無料ビデオチャット 登録不要",
    h1: "本当に使えるOmegleの代替サービス。",
    h2: "2秒以内に実在の相手。ボットゼロ、遅延ゼロ。",
    intro:
      "Omegleは2023年に終了し、その後の代替サービスの多くは同じ罠を繰り返してきました。ループする偽カメラ、最初のマッチ前の課金、いつまでも埋まらない待機列。Caakusは映像をWebRTCでブラウザ同士に直接流すため、画面の相手は確かに生身で、録画も残りません。",
    pains: [
      "偽カメラはありません。すべての映像はブラウザ内で確立される生の接続で、録画済み動画をマッチとして流すことは構造上できません。",
      "開始に課金はありません。マッチング、映像、音声、テキストは永続的に無料。カード情報の壁は一切ありません。",
      "ボット農場はありません。端末フィンガープリント、レート制限、人による監視が自動アカウントを事前に排除します。",
    ],
    features: [
      { t: "本物のP2P WebRTC", d: "映像と音声はブラウザ間を直接流れ、途中で記録するサーバーは存在しません。" },
      { t: "2秒未満のマッチング", d: "地域別の待機プールと事前準備済みICE候補により、この一文を読み終える前に接続が完了します。" },
      { t: "返答のある運営", d: "通報は人が確認します。繰り返す違反者は数分でマッチング権を失います。" },
    ],
    cta: "今すぐライブマッチを開始",
    ctaNote: "ダウンロード不要。カード不要。カメラは開始時のみ。",
    onlineSuffix: "人が今オンライン",
    badges: ["WebRTCで保護", "エンドツーエンド暗号化", "厳格なボット排除"],
    compareHeading: "OmegleとCaakusを正直に比較",
    rows: [
      { label: "サービス状況", omegle: "2023年に終了", caakus: "世界中で稼働中" },
      { label: "開始費用", omegle: "無料", caakus: "永続無料" },
      { label: "映像の経路", omegle: "サーバー経由", caakus: "P2P WebRTC" },
      { label: "アカウント必須", omegle: "不要", caakus: "不要（任意で作成）" },
      { label: "運営監視", omegle: "最小限", caakus: "人＋フィルター" },
    ],
    faqHeading: "実際によくある質問",
    faq: [
      { q: "Caakusは本当に無料ですか？", a: "はい。ランダムビデオ、音声、チャットは無料のままです。任意の装飾アイテムはありますが、最初のマッチを妨げるものはありません。" },
      { q: "開始にアカウントは必要ですか？", a: "不要です。開始を押せばすぐにつながります。プロフィールは友達、履歴、ポイントを保存するだけです。" },
      { q: "カメラの相手は実在しますか？", a: "はい。映像は二つのブラウザ間のライブ接続なので、録画をマッチとして配信することはできません。" },
      { q: "安全でプライバシーは守られますか？", a: "映像と音声はWebRTCで送信中に暗号化され、保存されません。通報は人が対応し、ワンタップで退出できます。" },
    ],
    directoryHeading: "コミュニティと都市を探す",
    hubHeading: "ネットワークをさらに深く",
    langHeading: "このページを他の言語で読む",
  },
  {
    code: "ko",
    hreflang: "ko",
    dir: "ltr",
    label: "한국어",
    title: "진짜 Omegle 대안: 봇 없음, 즉시 영상 채팅 | Caakus",
    description:
      "Caakus는 실제로 작동하는 Omegle 대안입니다. 2초 이내 실제 사용자 연결, WebRTC 기반 P2P 영상, 가짜 캠 없음, 시작에 결제 없음.",
    keywords:
      "오메글 대안, omegle 같은 사이트, 랜덤 영상 채팅, 모르는 사람과 대화, 무료 화상채팅 가입없이",
    h1: "실제로 작동하는 Omegle 대안.",
    h2: "2초 이내 실제 사용자. 봇 제로, 지연 제로.",
    intro:
      "Omegle은 2023년에 종료됐고 이후의 대체 서비스 대부분은 같은 함정을 반복했습니다. 반복 재생되는 가짜 캠, 첫 매칭 전 결제, 채워지지 않는 대기열. Caakus는 WebRTC로 두 브라우저 사이에 영상을 직접 흘려보내므로 화면 속 상대는 실시간이며 녹화되지 않습니다.",
    pains: [
      "가짜 캠이 없습니다. 모든 스트림은 브라우저에서 맺어지는 실시간 연결이라 녹화 영상을 매칭으로 내보낼 수 없습니다.",
      "시작 결제가 없습니다. 매칭, 영상, 음성, 텍스트는 언제까지나 무료이며 카드 요구가 없습니다.",
      "봇 농장이 없습니다. 기기 지문, 요청 제한, 사람 검수가 자동 계정을 사전에 걸러냅니다.",
    ],
    features: [
      { t: "진짜 P2P WebRTC", d: "영상과 음성이 브라우저에서 브라우저로 직접 이동하며 중간에 기록하는 서버가 없습니다." },
      { t: "2초 미만 매칭", d: "지역별 대기열과 미리 준비된 ICE 후보가 이 문장을 읽는 사이 연결을 끝냅니다." },
      { t: "응답하는 운영", d: "신고는 사람이 검토합니다. 반복 위반자는 몇 분 안에 매칭 권한을 잃습니다." },
    ],
    cta: "지금 실시간 매칭 시작",
    ctaNote: "다운로드 없음. 카드 없음. 카메라는 시작할 때만.",
    onlineSuffix: "명이 지금 접속 중",
    badges: ["WebRTC 보안", "종단 간 암호화", "엄격한 봇 차단"],
    compareHeading: "Omegle 대 Caakus, 솔직하게",
    rows: [
      { label: "서비스 상태", omegle: "2023년 종료", caakus: "전 세계 운영 중" },
      { label: "시작 비용", omegle: "무료", caakus: "영구 무료" },
      { label: "영상 경로", omegle: "서버 경유", caakus: "P2P WebRTC" },
      { label: "계정 필수", omegle: "아니오", caakus: "아니오, 선택 사항" },
      { label: "운영 관리", omegle: "최소", caakus: "사람 + 필터" },
    ],
    faqHeading: "실제로 많이 묻는 질문",
    faq: [
      { q: "Caakus는 정말 무료인가요?", a: "네. 랜덤 영상, 음성, 채팅은 비용이 없습니다. 선택형 꾸미기 항목은 있지만 첫 매칭을 막지 않습니다." },
      { q: "시작하려면 계정이 필요한가요?", a: "아니요. 시작을 누르면 바로 연결됩니다. 프로필은 친구, 기록, 포인트만 저장합니다." },
      { q: "캠은 실제 사람인가요?", a: "네. 스트림은 두 브라우저 간 실시간 연결이므로 녹화본을 매칭으로 제공할 수 없습니다." },
      { q: "안전하고 사생활이 보호되나요?", a: "영상과 음성은 WebRTC 전송 중 암호화되며 저장되지 않습니다. 신고는 사람이 처리하고 한 번의 터치로 나갈 수 있습니다." },
    ],
    directoryHeading: "커뮤니티와 도시 찾기",
    hubHeading: "네트워크 더 깊이 보기",
    langHeading: "이 페이지를 다른 언어로 보기",
  },
  {
    code: "zh",
    hreflang: "zh",
    dir: "ltr",
    label: "中文",
    title: "真正可用的 Omegle 替代品：无机器人，即刻视频聊天 | Caakus",
    description:
      "Caakus 是真正可用的 Omegle 替代品：2 秒内接通真人，基于 WebRTC 的点对点视频，没有假摄像头，开始匹配无需付费。",
    keywords:
      "omegle 替代, 类似 omegle 的网站, 随机视频聊天, 和陌生人聊天, 免费视频聊天 免注册",
    h1: "真正可用的 Omegle 替代品。",
    h2: "2 秒内接通真人。零机器人，零延迟。",
    intro:
      "Omegle 已于 2023 年关闭，之后的多数替代站点都在重复同样的套路：循环播放的假摄像头、首次匹配前的付费墙、永远等不到人的队列。Caakus 通过 WebRTC 在两个浏览器之间直接传输视频，屏幕对面的人是实时的，并且不会被录制。",
    pains: [
      "没有假摄像头。每一路视频都是在浏览器中建立的实时连接，预录视频无法伪装成匹配对象。",
      "没有付费墙。匹配、视频、语音和文字永久免费，见到人之前不会索要银行卡。",
      "没有机器人农场。设备指纹、频率限制与人工审核会在自动账号触达你之前清除它们。",
    ],
    features: [
      { t: "真正的点对点 WebRTC", d: "音视频在浏览器之间直连，中间没有服务器记录你。" },
      { t: "2 秒内完成匹配", d: "区域匹配池与预热的 ICE 候选，在你读完这句话之前就完成握手。" },
      { t: "会回应的审核", d: "举报由真人处理，多次违规者数分钟内失去匹配资格。" },
    ],
    cta: "立即开始实时匹配",
    ctaNote: "无需下载，无需银行卡，点击开始才使用摄像头。",
    onlineSuffix: "人正在线上",
    badges: ["WebRTC 加密传输", "端到端加密", "严格机器人过滤"],
    compareHeading: "Omegle 与 Caakus 的坦诚对比",
    rows: [
      { label: "服务状态", omegle: "2023 年关闭", caakus: "全球运行中" },
      { label: "开始费用", omegle: "免费", caakus: "永久免费" },
      { label: "视频路径", omegle: "服务器中转", caakus: "点对点 WebRTC" },
      { label: "是否需注册", omegle: "否", caakus: "否，资料可选" },
      { label: "内容审核", omegle: "极少", caakus: "人工 + 过滤" },
    ],
    faqHeading: "大家真正会问的问题",
    faq: [
      { q: "Caakus 真的免费吗？", a: "是的。随机视频、语音和聊天都不收费。存在可选的装饰性内容，但不会阻挡第一次匹配。" },
      { q: "开始需要注册吗？", a: "不需要。点击开始即可立即匹配。资料只用于保存好友、记录和积分。" },
      { q: "摄像头后面是真人吗？", a: "是。视频是两个浏览器之间的实时连接，录像无法作为匹配内容播放。" },
      { q: "安全和隐私如何？", a: "音视频通过 WebRTC 在传输中加密，且从不录制。举报由真人处理，你随时一键离开。" },
    ],
    directoryHeading: "找到你的社群与城市",
    hubHeading: "深入了解网络",
    langHeading: "用你的语言阅读本页",
  },
  {
    code: "vi",
    hreflang: "vi",
    dir: "ltr",
    label: "Tiếng Việt",
    title: "Giải pháp thay thế Omegle thực sự: không bot, video chat tức thì | Caakus",
    description:
      "Caakus là lựa chọn thay thế Omegle thực sự hoạt động: gặp người thật dưới 2 giây, video ngang hàng qua WebRTC, không cam giả và không phải trả phí để bắt đầu.",
    keywords:
      "thay thế omegle, trang giống omegle, chat video ngẫu nhiên, nói chuyện với người lạ, chat video miễn phí không cần đăng ký",
    h1: "Giải pháp thay thế Omegle thực sự hoạt động.",
    h2: "Người thật dưới 2 giây. Không bot. Không độ trễ.",
    intro:
      "Omegle đóng cửa năm 2023 và hầu hết các bản thay thế đều lặp lại cùng một cái bẫy: cam giả phát vòng lặp, thu phí trước lần ghép đầu tiên, hoặc phòng chờ không bao giờ đầy. Caakus truyền video trực tiếp giữa hai trình duyệt bằng WebRTC nên người trên màn hình là thật và không hề bị ghi lại.",
    pains: [
      "Không có cam giả. Mỗi luồng là kết nối trực tiếp thiết lập trong trình duyệt, nên video quay sẵn không thể đóng vai người lạ.",
      "Không có tường phí. Ghép đôi, video, âm thanh và tin nhắn miễn phí mãi mãi, không đòi thẻ trước khi bạn gặp ai.",
      "Không có trại bot. Dấu vân tay thiết bị, giới hạn tần suất và kiểm duyệt bởi con người loại bỏ tài khoản tự động trước khi tới bạn.",
    ],
    features: [
      { t: "WebRTC ngang hàng thật sự", d: "Video và âm thanh đi thẳng giữa hai trình duyệt, không có máy chủ ghi lại ở giữa." },
      { t: "Ghép dưới 2 giây", d: "Hàng đợi theo khu vực và ứng viên ICE dựng sẵn hoàn tất kết nối trước khi bạn đọc xong dòng này." },
      { t: "Kiểm duyệt có phản hồi", d: "Báo cáo do người thật xử lý. Người vi phạm nhiều lần mất quyền ghép trong vài phút." },
    ],
    cta: "Bắt đầu ghép trực tiếp",
    ctaNote: "Không tải app. Không thẻ. Camera chỉ bật khi bạn bắt đầu.",
    onlineSuffix: "người đang trực tuyến",
    badges: ["Bảo mật WebRTC", "Mã hóa đầu cuối", "Lọc bot nghiêm ngặt"],
    compareHeading: "Omegle và Caakus, nói thẳng",
    rows: [
      { label: "Trạng thái dịch vụ", omegle: "Đóng cửa năm 2023", caakus: "Hoạt động toàn cầu" },
      { label: "Chi phí bắt đầu", omegle: "Miễn phí", caakus: "Miễn phí vĩnh viễn" },
      { label: "Đường truyền video", omegle: "Qua máy chủ", caakus: "Ngang hàng WebRTC" },
      { label: "Bắt buộc tài khoản", omegle: "Không", caakus: "Không, hồ sơ tùy chọn" },
      { label: "Kiểm duyệt", omegle: "Tối thiểu", caakus: "Con người + bộ lọc" },
    ],
    faqHeading: "Những câu hỏi thường gặp thật sự",
    faq: [
      { q: "Caakus có thực sự miễn phí?", a: "Có. Ghép video ngẫu nhiên, âm thanh và chat không tốn phí. Có vật phẩm trang trí tùy chọn nhưng không chặn lần ghép đầu tiên." },
      { q: "Có cần tài khoản không?", a: "Không. Bấm bắt đầu là ghép ngay. Hồ sơ chỉ lưu bạn bè, lịch sử và điểm thưởng." },
      { q: "Cam có phải người thật?", a: "Đúng vậy. Luồng là kết nối trực tiếp giữa hai trình duyệt nên bản ghi không thể được phát như một người lạ." },
      { q: "Có an toàn và riêng tư?", a: "Video và âm thanh được mã hóa khi truyền qua WebRTC và không bao giờ bị lưu. Báo cáo do người thật xử lý, bạn thoát bất kỳ lúc nào." },
    ],
    directoryHeading: "Tìm cộng đồng và thành phố của bạn",
    hubHeading: "Khám phá sâu hơn mạng lưới",
    langHeading: "Đọc trang này bằng ngôn ngữ của bạn",
  },
  {
    code: "th",
    hreflang: "th",
    dir: "ltr",
    label: "ไทย",
    title: "ทางเลือกแทน Omegle ของจริง: ไม่มีบอท วิดีโอแชททันที | Caakus",
    description:
      "Caakus คือทางเลือกแทน Omegle ที่ใช้ได้จริง เจอคนจริงในไม่ถึง 2 วินาที วิดีโอแบบเพียร์ทูเพียร์ผ่าน WebRTC ไม่มีกล้องปลอม และไม่ต้องจ่ายเพื่อเริ่ม",
    keywords:
      "ทางเลือกแทน omegle, เว็บคล้าย omegle, วิดีโอแชทสุ่ม, คุยกับคนแปลกหน้า, วิดีโอแชทฟรีไม่ต้องสมัคร",
    h1: "ทางเลือกแทน Omegle ที่ใช้ได้จริง",
    h2: "คนจริงในไม่ถึง 2 วินาที ไม่มีบอท ไม่มีดีเลย์",
    intro:
      "Omegle ปิดตัวในปี 2023 และทางเลือกส่วนใหญ่ก็วนอยู่กับกับดักเดิม ทั้งกล้องปลอมที่เล่นวนซ้ำ การเก็บเงินก่อนจับคู่ครั้งแรก หรือห้องรอที่ไม่เคยมีคน Caakus ส่งวิดีโอตรงระหว่างสองเบราว์เซอร์ด้วย WebRTC คนที่อยู่ตรงหน้าจึงเป็นคนจริงและไม่มีการบันทึก",
    pains: [
      "ไม่มีกล้องปลอม ทุกสตรีมคือการเชื่อมต่อสดที่สร้างในเบราว์เซอร์ วิดีโออัดไว้จึงปลอมเป็นคู่สนทนาไม่ได้",
      "ไม่มีกำแพงจ่ายเงิน การจับคู่ วิดีโอ เสียง และข้อความฟรีตลอดไป ไม่มีการขอบัตรก่อนเจอใคร",
      "ไม่มีฟาร์มบอท ลายนิ้วมืออุปกรณ์ การจำกัดอัตรา และผู้ดูแลที่เป็นคนจริงคัดบัญชีอัตโนมัติออกก่อนถึงคุณ",
    ],
    features: [
      { t: "WebRTC เพียร์ทูเพียร์ของจริง", d: "ภาพและเสียงวิ่งตรงระหว่างเบราว์เซอร์ ไม่มีเซิร์ฟเวอร์คั่นกลางคอยบันทึก" },
      { t: "จับคู่ไม่ถึง 2 วินาที", d: "คิวตามภูมิภาคและ ICE ที่เตรียมไว้ปิดการเชื่อมต่อก่อนคุณอ่านบรรทัดนี้จบ" },
      { t: "ทีมดูแลที่ตอบจริง", d: "รายงานมีคนอ่าน ผู้ทำผิดซ้ำจะถูกตัดสิทธิ์จับคู่ภายในไม่กี่นาที" },
    ],
    cta: "เริ่มจับคู่สดเดี๋ยวนี้",
    ctaNote: "ไม่ต้องดาวน์โหลด ไม่ต้องใช้บัตร กล้องเปิดเมื่อกดเริ่มเท่านั้น",
    onlineSuffix: "คนออนไลน์อยู่ตอนนี้",
    badges: ["ปลอดภัยด้วย WebRTC", "เข้ารหัสต้นทางถึงปลายทาง", "กรองบอทเข้มงวด"],
    compareHeading: "Omegle เทียบ Caakus แบบตรงไปตรงมา",
    rows: [
      { label: "สถานะบริการ", omegle: "ปิดในปี 2023", caakus: "เปิดใช้ทั่วโลก" },
      { label: "ค่าเริ่มต้นใช้งาน", omegle: "ฟรี", caakus: "ฟรีตลอด" },
      { label: "เส้นทางวิดีโอ", omegle: "ผ่านเซิร์ฟเวอร์", caakus: "เพียร์ทูเพียร์ WebRTC" },
      { label: "ต้องมีบัญชี", omegle: "ไม่", caakus: "ไม่ โปรไฟล์เป็นทางเลือก" },
      { label: "การดูแล", omegle: "น้อยมาก", caakus: "คนจริง + ตัวกรอง" },
    ],
    faqHeading: "คำถามที่คนถามจริง",
    faq: [
      { q: "Caakus ฟรีจริงไหม", a: "จริง วิดีโอสุ่ม เสียง และแชทไม่มีค่าใช้จ่าย มีของตกแต่งให้เลือกซื้อ แต่ไม่ขวางการจับคู่ครั้งแรก" },
      { q: "ต้องสมัครก่อนไหม", a: "ไม่ต้อง กดเริ่มแล้วจับคู่ได้ทันที โปรไฟล์เก็บแค่เพื่อน ประวัติ และแต้ม" },
      { q: "กล้องเป็นคนจริงไหม", a: "ใช่ สตรีมคือการเชื่อมต่อสดระหว่างสองเบราว์เซอร์ วิดีโออัดไว้จึงส่งเป็นคู่สนทนาไม่ได้" },
      { q: "ปลอดภัยและเป็นส่วนตัวไหม", a: "ภาพและเสียงเข้ารหัสระหว่างส่งด้วย WebRTC และไม่มีการบันทึก รายงานส่งถึงคนจริง และออกจากคู่ได้ในแตะเดียว" },
    ],
    directoryHeading: "ค้นหาชุมชนและเมืองของคุณ",
    hubHeading: "เจาะลึกเครือข่าย",
    langHeading: "อ่านหน้านี้ในภาษาของคุณ",
  },
  {
    code: "fa",
    hreflang: "fa",
    dir: "rtl",
    label: "فارسی",
    title: "جایگزین واقعی Omegle: بدون ربات، چت تصویری فوری | Caakus",
    description:
      "Caakus جایگزین Omegle است که واقعاً کار می‌کند: آدم‌های واقعی در کمتر از ۲ ثانیه، ویدیوی همتا به همتا با WebRTC، بدون وبکم جعلی و بدون پرداخت برای شروع.",
    keywords:
      "جایگزین omegle, سایت شبیه omegle, چت تصویری تصادفی, صحبت با غریبه‌ها, چت تصویری رایگان بدون ثبت نام",
    h1: "جایگزین Omegle که واقعاً کار می‌کند.",
    h2: "آدم‌های واقعی در کمتر از ۲ ثانیه. بدون ربات، بدون تأخیر.",
    intro:
      "Omegle در سال ۲۰۲۳ بسته شد و بیشتر جایگزین‌ها همان دام را تکرار کردند: وبکم‌های جعلی تکرارشونده، پرداخت پیش از اولین اتصال، یا صف انتظاری که هرگز پر نمی‌شود. Caakus ویدیو را با WebRTC مستقیم میان دو مرورگر می‌فرستد؛ پس طرف مقابل واقعاً زنده است و چیزی ضبط نمی‌شود.",
    pains: [
      "وبکم جعلی وجود ندارد. هر جریان یک اتصال زنده در مرورگر شماست، بنابراین ویدیوی ضبط‌شده نمی‌تواند جای طرف مقابل را بگیرد.",
      "دیوار پرداخت وجود ندارد. اتصال، ویدیو، صدا و متن همیشه رایگان است و پیش از دیدن کسی کارتی خواسته نمی‌شود.",
      "مزرعه ربات وجود ندارد. اثر انگشت دستگاه، محدودیت درخواست و نظارت انسانی حساب‌های خودکار را پیش از رسیدن به شما حذف می‌کند.",
    ],
    features: [
      { t: "WebRTC همتا به همتای واقعی", d: "تصویر و صدا مستقیم بین دو مرورگر جابه‌جا می‌شود و سروری در میانه ضبط نمی‌کند." },
      { t: "اتصال زیر ۲ ثانیه", d: "صف‌های منطقه‌ای و کاندیداهای آماده ICE اتصال را پیش از پایان همین خط کامل می‌کنند." },
      { t: "نظارتی که پاسخ می‌دهد", d: "گزارش‌ها را انسان بررسی می‌کند و متخلف تکراری ظرف چند دقیقه امکان اتصال را از دست می‌دهد." },
    ],
    cta: "شروع گفتگوی زنده",
    ctaNote: "بدون نصب. بدون کارت. دوربین فقط هنگام شروع.",
    onlineSuffix: "نفر همین حالا آنلاین‌اند",
    badges: ["ایمن با WebRTC", "رمزنگاری سرتاسری", "فیلتر سخت‌گیرانه ربات"],
    compareHeading: "مقایسه صادقانه Omegle و Caakus",
    rows: [
      { label: "وضعیت سرویس", omegle: "بسته در ۲۰۲۳", caakus: "فعال در سراسر جهان" },
      { label: "هزینه شروع", omegle: "رایگان", caakus: "همیشه رایگان" },
      { label: "مسیر ویدیو", omegle: "از طریق سرور", caakus: "همتا به همتا WebRTC" },
      { label: "نیاز به حساب", omegle: "خیر", caakus: "خیر، پروفایل اختیاری" },
      { label: "نظارت", omegle: "حداقلی", caakus: "انسانی + فیلتر" },
    ],
    faqHeading: "پرسش‌هایی که واقعاً پرسیده می‌شود",
    faq: [
      { q: "آیا Caakus واقعاً رایگان است؟", a: "بله. ویدیوی تصادفی، صدا و چت هزینه‌ای ندارد. موارد تزئینی اختیاری هست اما جلوی اولین اتصال را نمی‌گیرد." },
      { q: "برای شروع حساب لازم است؟", a: "خیر. دکمه شروع را بزنید و بلافاصله وصل شوید. پروفایل فقط دوستان، تاریخچه و امتیازها را نگه می‌دارد." },
      { q: "آیا پشت دوربین آدم واقعی است؟", a: "بله. جریان یک اتصال زنده میان دو مرورگر است، پس ویدیوی ضبط‌شده قابل ارائه نیست." },
      { q: "امن و خصوصی است؟", a: "تصویر و صدا هنگام انتقال با WebRTC رمزگذاری می‌شوند و ذخیره نمی‌شوند. گزارش‌ها به ناظر انسانی می‌رسد و با یک لمس خارج می‌شوید." },
    ],
    directoryHeading: "جامعه و شهر خود را پیدا کنید",
    hubHeading: "عمیق‌تر در شبکه",
    langHeading: "این صفحه را به زبان خود بخوانید",
  },
  {
    code: "ur",
    hreflang: "ur",
    dir: "rtl",
    label: "اردو",
    title: "اصل Omegle متبادل: بوٹس کے بغیر، فوری ویڈیو چیٹ | Caakus",
    description:
      "Caakus وہ Omegle متبادل ہے جو واقعی کام کرتا ہے: دو سیکنڈ سے کم میں حقیقی لوگ، WebRTC پر براہِ راست ویڈیو، جعلی کیم نہیں اور شروع کرنے کے لیے کوئی ادائیگی نہیں۔",
    keywords:
      "omegle متبادل, omegle جیسی سائٹ, رینڈم ویڈیو چیٹ, اجنبیوں سے بات, مفت ویڈیو چیٹ بغیر رجسٹریشن",
    h1: "وہ Omegle متبادل جو واقعی کام کرتا ہے۔",
    h2: "دو سیکنڈ سے کم میں حقیقی لوگ۔ کوئی بوٹ نہیں، کوئی تاخیر نہیں۔",
    intro:
      "Omegle 2023 میں بند ہوا اور اس کے بعد بیشتر متبادل وہی جال دہراتے رہے: لوپ میں چلنے والی جعلی کیم، پہلی ملاقات سے پہلے ادائیگی، یا ایسا انتظار گاہ جو کبھی نہیں بھرتا۔ Caakus ویڈیو کو WebRTC کے ذریعے دو براؤزرز کے درمیان براہِ راست بھیجتا ہے، اس لیے سامنے والا شخص واقعی موجود ہے اور کچھ بھی ریکارڈ نہیں ہوتا۔",
    pains: [
      "جعلی کیم نہیں۔ ہر اسٹریم آپ کے براؤزر میں بننے والا زندہ رابطہ ہے، اس لیے ریکارڈ شدہ ویڈیو کو ساتھی بنا کر پیش نہیں کیا جا سکتا۔",
      "شروع کرنے کے لیے ادائیگی نہیں۔ میچنگ، ویڈیو، آواز اور پیغام ہمیشہ مفت ہیں، کارڈ کا مطالبہ نہیں۔",
      "بوٹ فارم نہیں۔ ڈیوائس فنگر پرنٹ، ریٹ حدود اور انسانی نگرانی خودکار اکاؤنٹس کو آپ تک پہنچنے سے پہلے نکال دیتی ہے۔",
    ],
    features: [
      { t: "حقیقی P2P WebRTC", d: "ویڈیو اور آواز براؤزر سے براؤزر جاتی ہے، درمیان میں ریکارڈ کرنے والا سرور نہیں۔" },
      { t: "دو سیکنڈ سے کم میں میچ", d: "علاقائی قطاریں اور تیار ICE امیدوار اس سطر کے ختم ہونے سے پہلے رابطہ مکمل کر دیتے ہیں۔" },
      { t: "جواب دینے والی نگرانی", d: "رپورٹس انسان دیکھتے ہیں۔ بار بار خلاف ورزی کرنے والے منٹوں میں میچنگ کھو دیتے ہیں۔" },
    ],
    cta: "ابھی لائیو میچ شروع کریں",
    ctaNote: "کوئی ڈاؤن لوڈ نہیں۔ کوئی کارڈ نہیں۔ کیمرہ صرف شروع کرنے پر۔",
    onlineSuffix: "افراد اس وقت آن لائن ہیں",
    badges: ["WebRTC محفوظ", "اینڈ ٹو اینڈ خفیہ کاری", "سخت بوٹ فلٹرنگ"],
    compareHeading: "Omegle بمقابلہ Caakus، دیانت داری سے",
    rows: [
      { label: "سروس کی حالت", omegle: "2023 میں بند", caakus: "دنیا بھر میں فعال" },
      { label: "شروع کرنے کی قیمت", omegle: "مفت", caakus: "ہمیشہ مفت" },
      { label: "ویڈیو کا راستہ", omegle: "سرور کے ذریعے", caakus: "براہِ راست WebRTC" },
      { label: "اکاؤنٹ لازمی", omegle: "نہیں", caakus: "نہیں، پروفائل اختیاری" },
      { label: "نگرانی", omegle: "بہت کم", caakus: "انسانی + فلٹر" },
    ],
    faqHeading: "لوگ واقعی یہ پوچھتے ہیں",
    faq: [
      { q: "کیا Caakus واقعی مفت ہے؟", a: "جی ہاں۔ رینڈم ویڈیو، آواز اور چیٹ بالکل مفت ہیں۔ اختیاری آرائشی اشیاء موجود ہیں مگر پہلا میچ کبھی نہیں رکتا۔" },
      { q: "کیا اکاؤنٹ ضروری ہے؟", a: "نہیں۔ اسٹارٹ دبائیں اور فوراً جُڑ جائیں۔ پروفائل صرف دوست، تاریخ اور پوائنٹس محفوظ کرتی ہے۔" },
      { q: "کیا کیم پر حقیقی لوگ ہوتے ہیں؟", a: "جی۔ اسٹریم دو براؤزرز کے درمیان زندہ رابطہ ہے، اس لیے ریکارڈنگ میچ کے طور پر نہیں دی جا سکتی۔" },
      { q: "کیا یہ محفوظ ہے؟", a: "ویڈیو اور آواز WebRTC پر منتقلی کے دوران خفیہ رہتی ہیں اور کبھی محفوظ نہیں کی جاتیں۔ رپورٹ انسان دیکھتے ہیں اور آپ ایک ٹچ سے نکل سکتے ہیں۔" },
    ],
    directoryHeading: "اپنی کمیونٹی اور شہر تلاش کریں",
    hubHeading: "نیٹ ورک میں مزید گہرائی",
    langHeading: "یہ صفحہ اپنی زبان میں پڑھیں",
  },
  {
    code: "bn",
    hreflang: "bn",
    dir: "ltr",
    label: "বাংলা",
    title: "সত্যিকারের Omegle বিকল্প: বট নেই, সঙ্গে সঙ্গে ভিডিও চ্যাট | Caakus",
    description:
      "Caakus হলো সেই Omegle বিকল্প যা সত্যিই কাজ করে: ২ সেকেন্ডের কমে আসল মানুষ, WebRTC-তে সরাসরি পিয়ার-টু-পিয়ার ভিডিও, নকল ক্যাম নেই এবং শুরু করতে কোনো টাকা লাগে না।",
    keywords:
      "omegle বিকল্প, omegle এর মতো সাইট, র‍্যান্ডম ভিডিও চ্যাট, অপরিচিতদের সাথে কথা, ফ্রি ভিডিও চ্যাট রেজিস্ট্রেশন ছাড়া",
    h1: "যে Omegle বিকল্প সত্যিই কাজ করে।",
    h2: "২ সেকেন্ডের কমে আসল মানুষ। শূন্য বট, শূন্য দেরি।",
    intro:
      "Omegle ২০২৩ সালে বন্ধ হয়ে যায় এবং তারপরের বেশিরভাগ বিকল্প একই ফাঁদ ফিরিয়ে এনেছে: লুপে চলা নকল ক্যাম, প্রথম ম্যাচের আগেই টাকা, কিংবা কখনো না ভরা অপেক্ষার ঘর। Caakus WebRTC দিয়ে দুই ব্রাউজারের মধ্যে সরাসরি ভিডিও পাঠায়, তাই পর্দার মানুষটি সত্যিই লাইভ এবং কিছুই রেকর্ড হয় না।",
    pains: [
      "নকল ক্যাম নেই। প্রতিটি স্ট্রিম ব্রাউজারে তৈরি হওয়া সরাসরি সংযোগ, তাই আগে রেকর্ড করা ভিডিও ম্যাচ হিসেবে চালানো যায় না।",
      "শুরু করতে পেওয়াল নেই। ম্যাচিং, ভিডিও, অডিও ও টেক্সট চিরকাল ফ্রি, কার্ড চাওয়ার কোনো ধাপ নেই।",
      "বট ফার্ম নেই। ডিভাইস ফিঙ্গারপ্রিন্ট, রেট লিমিট আর মানুষের মডারেশন স্বয়ংক্রিয় অ্যাকাউন্ট আগেই সরিয়ে দেয়।",
    ],
    features: [
      { t: "সত্যিকারের P2P WebRTC", d: "ভিডিও ও অডিও এক ব্রাউজার থেকে অন্যটিতে সরাসরি যায়, মাঝখানে রেকর্ড করার সার্ভার নেই।" },
      { t: "২ সেকেন্ডের কমে ম্যাচ", d: "অঞ্চলভিত্তিক সারি ও আগে থেকে প্রস্তুত ICE প্রার্থী এই লাইনটি শেষ হওয়ার আগেই সংযোগ সম্পন্ন করে।" },
      { t: "সাড়া দেওয়া মডারেশন", d: "রিপোর্ট মানুষ পড়ে। বারবার নিয়ম ভাঙলে কয়েক মিনিটেই ম্যাচিং বন্ধ হয়ে যায়।" },
    ],
    cta: "এখনই লাইভ ম্যাচ শুরু করুন",
    ctaNote: "ডাউনলোড নেই। কার্ড নেই। ক্যামেরা কেবল শুরু করলে।",
    onlineSuffix: "জন এখন অনলাইনে",
    badges: ["WebRTC সুরক্ষিত", "এন্ড-টু-এন্ড এনক্রিপ্টেড", "কঠোর বট ফিল্টার"],
    compareHeading: "Omegle বনাম Caakus, সরাসরি",
    rows: [
      { label: "সেবার অবস্থা", omegle: "২০২৩-এ বন্ধ", caakus: "বিশ্বজুড়ে চালু" },
      { label: "শুরুর খরচ", omegle: "ফ্রি", caakus: "সবসময় ফ্রি" },
      { label: "ভিডিওর পথ", omegle: "সার্ভার হয়ে", caakus: "পিয়ার-টু-পিয়ার WebRTC" },
      { label: "অ্যাকাউন্ট বাধ্যতামূলক", omegle: "না", caakus: "না, প্রোফাইল ঐচ্ছিক" },
      { label: "মডারেশন", omegle: "খুব কম", caakus: "মানুষ + ফিল্টার" },
    ],
    faqHeading: "মানুষ আসলে যা জিজ্ঞেস করে",
    faq: [
      { q: "Caakus কি সত্যিই ফ্রি?", a: "হ্যাঁ। র‍্যান্ডম ভিডিও, অডিও ও চ্যাটে কোনো খরচ নেই। ঐচ্ছিক সাজসজ্জা আছে, কিন্তু প্রথম ম্যাচ কখনো আটকায় না।" },
      { q: "শুরু করতে অ্যাকাউন্ট লাগে?", a: "না। স্টার্ট চাপলেই সংযোগ। প্রোফাইল শুধু বন্ধু, ইতিহাস ও পয়েন্ট রাখে।" },
      { q: "ক্যামের মানুষ কি আসল?", a: "হ্যাঁ। স্ট্রিম দুই ব্রাউজারের লাইভ সংযোগ, তাই রেকর্ডিং ম্যাচ হিসেবে দেওয়া সম্ভব নয়।" },
      { q: "এটি কি নিরাপদ?", a: "ভিডিও ও অডিও WebRTC-তে পাঠানোর সময় এনক্রিপ্ট থাকে এবং কখনো সংরক্ষণ হয় না। রিপোর্ট মানুষ দেখে, এক টোকায় বেরিয়ে আসা যায়।" },
    ],
    directoryHeading: "আপনার কমিউনিটি ও শহর খুঁজুন",
    hubHeading: "নেটওয়ার্কে আরও গভীরে",
    langHeading: "এই পাতা আপনার ভাষায় পড়ুন",
  },
  {
    code: "uk",
    hreflang: "uk",
    dir: "ltr",
    label: "Українська",
    title: "Справжня альтернатива Omegle: без ботів, відеочат одразу | Caakus",
    description:
      "Caakus — альтернатива Omegle, яка справді працює: живі люди менш ніж за 2 секунди, відео peer-to-peer через WebRTC, жодних фейкових камер і жодної оплати на старті.",
    keywords:
      "альтернатива omegle, сайти як omegle, заміна omegle, випадковий відеочат, спілкування з незнайомцями, безкоштовний відеочат без реєстрації",
    h1: "Альтернатива Omegle, яка справді працює.",
    h2: "Живі люди менш ніж за 2 секунди. Нуль ботів. Нуль затримок.",
    intro:
      "Omegle закрився у 2023 році, і майже кожна заміна повторює ту саму пастку: зациклені фейкові камери, оплата до першого співрозмовника або порожня черга. Caakus передає відео напряму між двома браузерами через WebRTC — людина на екрані справді наживо, і нічого не записується.",
    pains: [
      "Жодних фейкових камер. Кожен потік — це живе з'єднання у вашому браузері, тож запис неможливо видати за співрозмовника.",
      "Жодної оплати на старті. Пошук, відео, аудіо та чат безкоштовні назавжди; картку ніхто не просить.",
      "Жодних ботоферм. Відбиток пристрою, ліміти запитів і людська модерація прибирають автоматичні акаунти заздалегідь.",
    ],
    features: [
      { t: "Справжній P2P WebRTC", d: "Відео та звук ідуть безпосередньо між браузерами, без сервера-посередника, який записує." },
      { t: "З'єднання менш ніж за 2 секунди", d: "Регіональні черги та підготовлені ICE-кандидати завершують з'єднання швидше, ніж ви дочитаєте рядок." },
      { t: "Модерація, яка відповідає", d: "Скарги читають люди. Порушники втрачають доступ до пошуку за лічені хвилини." },
    ],
    cta: "Запустити живий матч",
    ctaNote: "Без завантаження. Без картки. Камера вмикається лише на старті.",
    onlineSuffix: "людей онлайн просто зараз",
    badges: ["Захищено WebRTC", "Наскрізне шифрування", "Суворий фільтр ботів"],
    compareHeading: "Omegle проти Caakus, чесно",
    rows: [
      { label: "Статус сервісу", omegle: "Закритий у 2023", caakus: "Працює по всьому світу" },
      { label: "Вартість старту", omegle: "Безкоштовно", caakus: "Безкоштовно назавжди" },
      { label: "Шлях відео", omegle: "Через сервер", caakus: "Peer-to-peer WebRTC" },
      { label: "Потрібен акаунт", omegle: "Ні", caakus: "Ні, профіль за бажанням" },
      { label: "Модерація", omegle: "Мінімальна", caakus: "Люди + фільтри" },
    ],
    faqHeading: "Питання, які ставлять насправді",
    faq: [
      { q: "Caakus справді безкоштовний?", a: "Так. Випадкове відео, аудіо та чат нічого не коштують. Є необов'язкові оздоблення, але перший матч ніщо не блокує." },
      { q: "Чи потрібен акаунт?", a: "Ні. Натискаєте «старт» — і одразу з'єднання. Профіль зберігає лише друзів, історію та бали." },
      { q: "Камери — це справжні люди?", a: "Так. Потік — живе з'єднання між двома браузерами, тож запис неможливо подати як співрозмовника." },
      { q: "Чи це безпечно?", a: "Відео та звук шифруються під час передачі через WebRTC і ніколи не зберігаються. Скарги обробляють люди, вийти можна одним дотиком." },
    ],
    directoryHeading: "Знайдіть свою спільноту та місто",
    hubHeading: "Глибше в мережу",
    langHeading: "Читайте цю сторінку своєю мовою",
  },
  {
    code: "ro",
    hreflang: "ro",
    dir: "ltr",
    label: "Română",
    title: "Singura alternativă reală la Omegle: fără boți, video chat instant | Caakus",
    description:
      "Caakus este alternativa la Omegle care chiar funcționează: oameni reali în mai puțin de 2 secunde, video peer-to-peer prin WebRTC, zero camere false și fără plată pentru a începe.",
    keywords:
      "alternativa omegle, site-uri ca omegle, inlocuitor omegle, video chat aleatoriu, vorbeste cu necunoscuti, video chat gratuit fara inregistrare",
    h1: "Alternativa la Omegle care chiar funcționează.",
    h2: "Oameni reali în sub 2 secunde. Zero boți. Zero latență.",
    intro:
      "Omegle s-a închis în 2023, iar aproape fiecare înlocuitor repetă aceeași capcană: camere false în buclă, plată înainte de prima potrivire sau o sală de așteptare mereu goală. Caakus trimite imaginea direct între două browsere prin WebRTC, așa că persoana de pe ecran este live și nimic nu se înregistrează.",
    pains: [
      "Fără camere false. Fiecare flux este o conexiune directă creată în browser, deci un clip înregistrat nu poate fi livrat ca partener.",
      "Fără plată la start. Potrivirea, video, audio și textul sunt gratuite permanent, fără card înainte de prima discuție.",
      "Fără ferme de boți. Amprenta dispozitivului, limitele de cereri și moderarea umană elimină conturile automate înainte să ajungă la tine.",
    ],
    features: [
      { t: "WebRTC peer-to-peer real", d: "Video și audio circulă direct între browsere, fără un server care înregistrează la mijloc." },
      { t: "Potrivire sub 2 secunde", d: "Cozile regionale și candidații ICE pregătiți închid conexiunea înainte să termini rândul acesta." },
      { t: "Moderare care răspunde", d: "Raportările sunt citite de oameni. Cei care repetă abuzurile pierd potrivirea în câteva minute." },
    ],
    cta: "Pornește un match live",
    ctaNote: "Fără descărcare. Fără card. Camera pornește doar la start.",
    onlineSuffix: "persoane online chiar acum",
    badges: ["Securizat WebRTC", "Criptare end-to-end", "Filtrare strictă a boților"],
    compareHeading: "Omegle versus Caakus, sincer",
    rows: [
      { label: "Starea serviciului", omegle: "Închis în 2023", caakus: "Activ global" },
      { label: "Cost pentru start", omegle: "Gratuit", caakus: "Gratuit permanent" },
      { label: "Traseul video", omegle: "Prin server", caakus: "Peer-to-peer WebRTC" },
      { label: "Cont obligatoriu", omegle: "Nu", caakus: "Nu, profil opțional" },
      { label: "Moderare", omegle: "Minimă", caakus: "Umană + filtre" },
    ],
    faqHeading: "Întrebări pe care oamenii chiar le pun",
    faq: [
      { q: "Caakus este cu adevărat gratuit?", a: "Da. Video aleatoriu, audio și chat nu costă nimic. Există elemente cosmetice opționale, dar nimic nu blochează prima potrivire." },
      { q: "Am nevoie de cont?", a: "Nu. Apeși start și te conectezi imediat. Profilul salvează doar prietenii, istoricul și punctele." },
      { q: "Camerele sunt oameni reali?", a: "Da. Fluxul este o conexiune live între două browsere, deci o înregistrare nu poate fi servită ca potrivire." },
      { q: "Este sigur și privat?", a: "Video și audio sunt criptate în tranzit prin WebRTC și nu sunt niciodată salvate. Raportările ajung la moderatori umani și ieși dintr-un match cu o atingere." },
    ],
    directoryHeading: "Găsește-ți comunitatea și orașul",
    hubHeading: "Intră mai adânc în rețea",
    langHeading: "Citește pagina în limba ta",
  },
  {
    code: "sw",
    hreflang: "sw",
    dir: "ltr",
    label: "Kiswahili",
    title: "Mbadala halisi wa Omegle: hakuna roboti, video chat papo hapo | Caakus",
    description:
      "Caakus ni mbadala wa Omegle unaofanya kazi kweli: watu halisi chini ya sekunde 2, video ya moja kwa moja kupitia WebRTC, hakuna kamera bandia na hakuna malipo kuanza.",
    keywords:
      "mbadala wa omegle, tovuti kama omegle, video chat ya nasibu, ongea na wageni, video chat bure bila usajili",
    h1: "Mbadala wa Omegle unaofanya kazi kweli.",
    h2: "Watu halisi chini ya sekunde 2. Hakuna roboti. Hakuna ucheleweshaji.",
    intro:
      "Omegle ilifungwa mwaka 2023 na mbadala wengi walirudia mtego uleule: kamera bandia zinazojirudia, malipo kabla ya kuunganishwa mara ya kwanza, au chumba cha kusubiri kisichojaa. Caakus hupitisha video moja kwa moja kati ya vivinjari viwili kupitia WebRTC, hivyo mtu unayemwona yupo live na hakuna kinachorekodiwa.",
    pains: [
      "Hakuna kamera bandia. Kila mtiririko ni muunganisho wa moja kwa moja unaojengwa kwenye kivinjari chako, hivyo video iliyorekodiwa haiwezi kutolewa kama mtu.",
      "Hakuna malipo ya kuanza. Kuunganishwa, video, sauti na maandishi ni bure milele; hakuna kadi inayoombwa.",
      "Hakuna mashamba ya roboti. Alama ya kifaa, mipaka ya maombi na usimamizi wa binadamu huondoa akaunti za kiotomatiki kabla hazijakufikia.",
    ],
    features: [
      { t: "WebRTC halisi ya moja kwa moja", d: "Video na sauti husafiri kivinjari hadi kivinjari bila seva ya kati inayorekodi." },
      { t: "Kuunganishwa chini ya sekunde 2", d: "Foleni za kikanda na wagombea wa ICE walioandaliwa humaliza muunganisho kabla hujamaliza mstari huu." },
      { t: "Usimamizi unaojibu", d: "Ripoti husomwa na binadamu. Wanaorudia makosa hupoteza kuunganishwa ndani ya dakika chache." },
    ],
    cta: "Anzisha mazungumzo ya moja kwa moja",
    ctaNote: "Hakuna upakuaji. Hakuna kadi. Kamera huwaka unapoanza tu.",
    onlineSuffix: "watu wapo mtandaoni sasa hivi",
    badges: ["Imelindwa na WebRTC", "Usimbaji kutoka mwisho hadi mwisho", "Uchujaji mkali wa roboti"],
    compareHeading: "Omegle dhidi ya Caakus, kwa uwazi",
    rows: [
      { label: "Hali ya huduma", omegle: "Ilifungwa 2023", caakus: "Inafanya kazi duniani" },
      { label: "Gharama ya kuanza", omegle: "Bure", caakus: "Bure milele" },
      { label: "Njia ya video", omegle: "Kupitia seva", caakus: "Moja kwa moja WebRTC" },
      { label: "Akaunti inahitajika", omegle: "Hapana", caakus: "Hapana, wasifu ni hiari" },
      { label: "Usimamizi", omegle: "Mdogo", caakus: "Binadamu + vichujio" },
    ],
    faqHeading: "Maswali watu huuliza kweli",
    faq: [
      { q: "Je, Caakus ni bure kweli?", a: "Ndiyo. Video ya nasibu, sauti na gumzo havigharimu chochote. Kuna vitu vya mapambo vya hiari, lakini havizuii mazungumzo ya kwanza." },
      { q: "Nahitaji akaunti kuanza?", a: "Hapana. Bonyeza anza na uunganishwe mara moja. Wasifu huhifadhi marafiki, historia na pointi tu." },
      { q: "Kamera ni watu halisi?", a: "Ndiyo. Mtiririko ni muunganisho wa moja kwa moja kati ya vivinjari viwili, hivyo rekodi haiwezi kutolewa kama mtu." },
      { q: "Ni salama na faragha?", a: "Video na sauti husimbwa wakati wa usafirishaji kupitia WebRTC na hazihifadhiwi kamwe. Ripoti huenda kwa wasimamizi halisi na unaweza kuondoka kwa mguso mmoja." },
    ],
    directoryHeading: "Pata jamii na jiji lako",
    hubHeading: "Ingia ndani zaidi ya mtandao",
    langHeading: "Soma ukurasa huu kwa lugha yako",
  },
  {
    code: "fil",
    hreflang: "fil",
    dir: "ltr",
    label: "Filipino",
    title: "Ang tunay na alternatibo sa Omegle: walang bot, instant video chat | Caakus",
    description:
      "Ang Caakus ang alternatibo sa Omegle na talagang gumagana: tunay na tao sa wala pang 2 segundo, peer-to-peer video sa WebRTC, walang pekeng cam at walang bayad para magsimula.",
    keywords:
      "alternatibo sa omegle, sites na parang omegle, random video chat, makipag-usap sa estranghero, libreng video chat walang sign up",
    h1: "Ang alternatibo sa Omegle na talagang gumagana.",
    h2: "Tunay na tao sa wala pang 2 segundo. Walang bot. Walang lag.",
    intro:
      "Nagsara ang Omegle noong 2023 at halos lahat ng kapalit ay inulit ang parehong bitag: pekeng cam na paulit-ulit, bayad bago ang unang match, o lobby na hindi napupuno. Direktang ipinapadala ng Caakus ang video sa pagitan ng dalawang browser gamit ang WebRTC, kaya totoo at live ang taong nasa screen at walang naitatala.",
    pains: [
      "Walang pekeng cam. Bawat stream ay live na koneksyon na binubuo sa browser mo, kaya imposibleng ipalabas ang recorded na video bilang katapat.",
      "Walang paywall. Libre habambuhay ang pag-match, video, audio at chat. Walang hinihinging card bago ka makakilala ng tao.",
      "Walang bot farm. Tinatanggal ng device fingerprint, rate limit at tao-tao na moderation ang automated accounts bago pa man makarating sa iyo.",
    ],
    features: [
      { t: "Tunay na P2P WebRTC", d: "Dumadaan ang video at audio nang direkta sa pagitan ng dalawang browser, walang server sa gitna na nagre-record." },
      { t: "Match sa wala pang 2 segundo", d: "Ang regional queues at handang ICE candidates ay tapos na bago mo matapos basahin ang linyang ito." },
      { t: "Moderation na sumasagot", d: "Tao ang bumabasa ng report. Ang paulit-ulit na lumalabag ay nawawalan ng match sa loob ng ilang minuto." },
    ],
    cta: "Simulan ang live match",
    ctaNote: "Walang download. Walang card. Bubukas lang ang camera kapag nagsimula ka.",
    onlineSuffix: "katao ang online ngayon",
    badges: ["Protektado ng WebRTC", "End-to-end na encrypted", "Mahigpit na bot filtering"],
    compareHeading: "Omegle laban sa Caakus, totohanan",
    rows: [
      { label: "Katayuan ng serbisyo", omegle: "Sarado noong 2023", caakus: "Aktibo sa buong mundo" },
      { label: "Gastos para magsimula", omegle: "Libre", caakus: "Libre habambuhay" },
      { label: "Daan ng video", omegle: "Sa pamamagitan ng server", caakus: "Peer-to-peer WebRTC" },
      { label: "Kailangan ng account", omegle: "Hindi", caakus: "Hindi, opsyonal ang profile" },
      { label: "Moderation", omegle: "Kakaunti", caakus: "Tao + filter" },
    ],
    faqHeading: "Mga tanong na talagang itinatanong",
    faq: [
      { q: "Libre ba talaga ang Caakus?", a: "Oo. Walang bayad ang random video, audio at chat. May opsyonal na pampaganda, pero walang humaharang sa unang match." },
      { q: "Kailangan ba ng account?", a: "Hindi. Pindutin ang start at agad kang maka-match. Ang profile ay para lang sa mga kaibigan, history at puntos." },
      { q: "Tunay bang tao ang nasa cam?", a: "Oo. Live na koneksyon ang stream sa pagitan ng dalawang browser, kaya hindi puwedeng ihain ang recording bilang katapat." },
      { q: "Ligtas at pribado ba?", a: "Naka-encrypt ang video at audio habang dumadaan sa WebRTC at hindi kailanman itinatala. Tao ang humahawak ng report at makakaalis ka sa isang pindot." },
    ],
    directoryHeading: "Hanapin ang iyong komunidad at lungsod",
    hubHeading: "Laliman pa ang network",
    langHeading: "Basahin ang pahinang ito sa iyong wika",
  },
];

export const OMEGLE_LOCALE_BY_CODE = new Map(OMEGLE_LOCALES.map((l) => [l.code, l]));
export const OMEGLE_LOCALE_CODES = OMEGLE_LOCALES.map((l) => l.code);
export const OMEGLE_DEFAULT_LOCALE = "en";

export function omeglePath(lang: string): string {
  return lang === OMEGLE_DEFAULT_LOCALE ? "/omegle-alternative" : `/${lang}/omegle-alternative`;
}
