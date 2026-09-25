// ═══════════════════════════════════════════════════════════════════════════
// CAAKUS FREE BROWSER LAB — 10 standalone micro-utilities
// Each tool is a linkable, citable asset: a real measurement run entirely in
// the visitor's browser, with a score, and no signup.
// ═══════════════════════════════════════════════════════════════════════════

export type MicroTool = {
  slug: string;
  name: string;
  short: string;
  title: string;
  description: string;
  keywords: string;
  intro: string;
  features: string[];
  faq: { q: string; a: string }[];
};

export const MICRO_TOOLS: MicroTool[] = [
  {
    slug: "video-call-speed-test",
    name: "Video Call Speed Test",
    short: "Measure how fast your browser can open a live connection.",
    title: "Free Video Call Speed Test — Check Your Live Connection Time | Caakus",
    description:
      "Run a free, instant video call speed test in your browser. Measure setup time, round-trip delay and connection quality with no download and no signup.",
    keywords:
      "video call speed test, webrtc latency test, video chat connection test, online call quality test, free connection tester",
    intro:
      "This test opens a real peer connection inside your browser and times every step, from the first handshake to the moment media can flow. Nothing is uploaded and nothing is recorded.",
    features: [
      "Real handshake timing, not a simulated ping",
      "Round-trip delay measured over a live data channel",
      "Quality score from 0 to 100",
      "Runs entirely on your device",
    ],
    faq: [
      {
        q: "What is a good result for a video call speed test?",
        a: "Under 100 ms round-trip and a setup time below 1.5 seconds means calls will feel instant. Between 100 and 250 ms is still comfortable. Above 400 ms you will notice people talking over each other.",
      },
      {
        q: "Does this test use my camera?",
        a: "No. This test only opens a data connection, so your camera and microphone stay switched off.",
      },
    ],
  },
  {
    slug: "camera-test",
    name: "Camera Test",
    short: "Check your camera, resolution and frame rate in one click.",
    title: "Free Online Camera Test — Check Webcam, Resolution & FPS | Caakus",
    description:
      "Test your webcam online for free. See your live picture, real resolution, frame rate and every camera your device exposes. No download, nothing saved.",
    keywords:
      "camera test, webcam test online, test my camera, check webcam resolution, webcam fps test, front camera test",
    intro:
      "See exactly what other people would see, plus the real resolution and frame rate your browser is able to deliver right now.",
    features: [
      "Live preview with instant on / off",
      "True negotiated resolution and frame rate",
      "Lists every camera available on the device",
      "Nothing is uploaded, recorded or stored",
    ],
    faq: [
      {
        q: "Is my video saved anywhere?",
        a: "No. The picture never leaves your device — it is displayed locally by your browser and disappears the moment you stop the test.",
      },
      {
        q: "Why does my camera show a lower resolution than advertised?",
        a: "Browsers negotiate a resolution based on lighting, available bandwidth and the camera driver. A 1080p camera often delivers 720p in low light to keep the frame rate smooth.",
      },
    ],
  },
  {
    slug: "connection-checker",
    name: "Connection Checker",
    short: "Verify that a direct device-to-device connection can be created.",
    title: "Free P2P Connection Checker — Can Your Network Connect Directly? | Caakus",
    description:
      "Check in seconds whether your network allows a direct device-to-device connection, or whether traffic has to be relayed. Free, instant, in-browser.",
    keywords:
      "p2p connection checker, direct connection test, nat type test browser, peer to peer test online, webrtc connectivity check",
    intro:
      "This check creates two connection endpoints inside your own browser and confirms they can find each other, exactly like a real call would.",
    features: [
      "Full handshake performed locally",
      "Reports direct versus relayed routing",
      "Round-trip delay over the live channel",
      "Works on mobile and desktop",
    ],
    faq: [
      {
        q: "What does a relayed connection mean?",
        a: "It means your network blocks a direct route, so traffic travels through a middle server. Calls still work, but latency is slightly higher. This is common on corporate and campus networks.",
      },
      {
        q: "Do I need to install anything?",
        a: "No. Everything runs in the page you are reading.",
      },
    ],
  },
  {
    slug: "mic-test",
    name: "Microphone Test",
    short: "See your live audio level and check that people will hear you.",
    title: "Free Online Microphone Test — Check Your Mic Level Instantly | Caakus",
    description:
      "Test your microphone online for free. Watch a live level meter, measure peak and average loudness, and confirm your voice is picked up before a call.",
    keywords:
      "microphone test, mic test online, test my microphone, audio level meter, check mic before call, headset mic test",
    intro:
      "Speak normally and watch the meter. If the bar moves into the green range, everyone on the other side will hear you clearly.",
    features: [
      "Live loudness meter at 60 frames per second",
      "Peak and average level tracking",
      "Clipping and silence detection",
      "Audio is analysed locally and never recorded",
    ],
    faq: [
      {
        q: "The meter does not move. What should I check?",
        a: "Make sure you allowed microphone access, that the right input is selected in your system settings, and that no other app is holding the microphone.",
      },
      {
        q: "What level should I aim for?",
        a: "A speaking level that peaks between 60 and 85 is ideal. Constantly hitting 100 means the sound is distorting.",
      },
    ],
  },
  {
    slug: "server-reachability-test",
    name: "Server Reachability Test",
    short: "Check which connection helpers your network can reach.",
    title: "Free STUN & TURN Server Test — Check Reachability In Browser | Caakus",
    description:
      "Test STUN and TURN server reachability from your browser for free. See which candidate types your network produces and how long discovery takes.",
    keywords:
      "stun server test, turn server test, stun turn connectivity checker, ice candidate test, webrtc server test online",
    intro:
      "Connection helpers tell two devices how to find each other. This test contacts them and reports which types of route your network actually produces.",
    features: [
      "Per-server reachability and response time",
      "Local, reflexive and relayed route detection",
      "Clear verdict for restrictive networks",
      "Add your own server address",
    ],
    faq: [
      {
        q: "What is the difference between the two server types?",
        a: "The first kind only tells your device its public address. The second kind actually forwards traffic when a direct route is impossible.",
      },
      {
        q: "No reflexive route was found. Is that bad?",
        a: "It usually means a firewall is blocking discovery traffic. Calls will fall back to a relay, which still works.",
      },
    ],
  },
  {
    slug: "packet-loss-simulator",
    name: "Packet Loss Simulator",
    short: "See what a shaky network does to a live call.",
    title: "Packet Loss Simulator — See How Loss Affects Live Video Calls | Caakus",
    description:
      "Simulate packet loss, jitter and delay on a real in-browser data channel and watch the effect on call quality, with a live quality score.",
    keywords:
      "packet loss simulator, packet loss test, jitter simulator, network quality simulator, video call quality test",
    intro:
      "Choose a loss rate and this tool pushes real messages through a live channel, dropping them at that rate so you can see exactly where a call starts to break.",
    features: [
      "Adjustable loss from 0 to 40 percent",
      "Live delivery rate, jitter and quality score",
      "Real data channel, not a chart animation",
      "Instant reset",
    ],
    faq: [
      {
        q: "How much loss can a video call absorb?",
        a: "Below 2 percent is invisible. Between 2 and 5 percent you hear occasional clipping. Above 10 percent the picture freezes regularly.",
      },
      {
        q: "Will this affect my real internet connection?",
        a: "No. The loss is applied inside this page only.",
      },
    ],
  },
  {
    slug: "screen-share-benchmark",
    name: "Screen Share Benchmark",
    short: "Measure the real quality of your screen sharing.",
    title: "Screen Share Benchmark — Test Screen Sharing Quality & FPS | Caakus",
    description:
      "Benchmark your screen sharing quality for free. Measure captured resolution, real frame rate and dropped frames directly in your browser.",
    keywords:
      "screen share test, screen sharing fps test, screen capture benchmark, test screen sharing quality, browser screen share test",
    intro:
      "Share a window or a tab and this benchmark measures the frame rate your browser really delivers, plus the frames it has to drop.",
    features: [
      "Real captured resolution and frame rate",
      "Dropped frame counter",
      "Smoothness score from 0 to 100",
      "Stops the moment you close it",
    ],
    faq: [
      {
        q: "What frame rate do I need for screen sharing?",
        a: "Slides and documents look fine at 5 to 15 frames per second. Video or gameplay needs 30 or more.",
      },
      {
        q: "Does this work on a phone?",
        a: "Most mobile browsers do not allow screen capture yet, so the benchmark is designed for laptops and desktops.",
      },
    ],
  },
  {
    slug: "network-restriction-checker",
    name: "Network Restriction Checker",
    short: "Find out whether your network blocks live calls.",
    title: "Network Restriction Checker — Is Your Firewall Blocking Video Calls? | Caakus",
    description:
      "Check for free whether your office, campus or hotel network blocks live video calls, and which ports and routes are open, right from your browser.",
    keywords:
      "firewall port checker browser, is my network blocking video calls, udp blocked test, port 443 check, restrictive network test",
    intro:
      "Some networks quietly block the traffic live calls depend on. This check tries each common route and tells you, in plain words, what is open.",
    features: [
      "Tests the standard and secure call routes",
      "Detects blocked discovery traffic",
      "Plain-language verdict, no jargon",
      "Takes about ten seconds",
    ],
    faq: [
      {
        q: "Everything is blocked. What can I do?",
        a: "Switch to mobile data or a personal hotspot, or ask your network administrator to allow outbound traffic on the secure call port.",
      },
      {
        q: "Is this a port scanner?",
        a: "No. It only tests your own outbound access from this browser and never scans anyone else.",
      },
    ],
  },
  {
    slug: "resolution-fps-matcher",
    name: "Resolution & FPS Matcher",
    short: "Find the best picture setting your camera can hold.",
    title: "Resolution & FPS Matcher — Find Your Camera's Best Setting | Caakus",
    description:
      "Test every resolution and frame rate your webcam supports and find the sharpest setting it can actually hold, free and in your browser.",
    keywords:
      "webcam resolution test, camera fps test, best webcam settings, 1080p webcam check, camera capability test online",
    intro:
      "This matcher asks your camera for each common picture setting in turn and reports what it truly delivers, not what the box claims.",
    features: [
      "Tests 360p up to 4K",
      "Reports the real negotiated result",
      "Recommends your best everyday setting",
      "One permission prompt, then fully automatic",
    ],
    faq: [
      {
        q: "Why does a higher resolution sometimes look worse?",
        a: "Pushing more pixels forces the camera to lower its frame rate and raise compression, which looks blurrier in motion than a clean lower setting.",
      },
      {
        q: "Which setting should I pick for calls?",
        a: "720p at 30 frames per second is the sweet spot for almost everyone.",
      },
    ],
  },
  {
    slug: "encryption-verifier",
    name: "Encryption Verifier",
    short: "Confirm that your live connection is actually encrypted.",
    title: "Encryption Verifier — Check That Your Video Call Is Encrypted | Caakus",
    description:
      "Verify that your browser negotiates an encrypted, authenticated live connection. Inspect the security profile and fingerprint in one click, free.",
    keywords:
      "webrtc encryption test, is my video call encrypted, dtls srtp verifier, secure signaling test, call security checker",
    intro:
      "Every modern live connection must be encrypted. This verifier opens one and reads back the security profile it negotiated, so you can see the proof.",
    features: [
      "Confirms the encrypted media profile",
      "Shows the certificate fingerprint",
      "Checks the page is on a secure origin",
      "Security score from 0 to 100",
    ],
    faq: [
      {
        q: "Can a live video call be unencrypted?",
        a: "No. Browsers refuse to open a live media connection without encryption, and this verifier shows you the negotiated proof.",
      },
      {
        q: "What is the fingerprint for?",
        a: "It uniquely identifies the certificate used for this session, so both sides can be sure no one swapped in a third party.",
      },
    ],
  },
];

export const TOOL_BY_SLUG: Record<string, MicroTool> = Object.fromEntries(
  MICRO_TOOLS.map((t) => [t.slug, t]),
);
