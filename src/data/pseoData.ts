// ═══════════════════════════════════════════════════════════════════════════
// CAAKUS P-SEO MATRIX — raw dimensions
// languages × categories × locations = the programmatic landing page matrix.
// Pure data, no browser/server APIs. Safe to import anywhere.
// ═══════════════════════════════════════════════════════════════════════════

export type PseoLanguage = {
  code: string;
  hreflang: string;
  label: string;
  dir: "ltr" | "rtl";
};

export type PseoCategory = {
  slug: string;
  /** Plural noun used inside sentences, per language (fallback: en). */
  labels: Record<string, string>;
};

export type PseoLocation = {
  slug: string;
  name: string;
  country: string;
  countryCode: string;
  /** UTC offset in hours (standard time). */
  utc: number;
};

export const PSEO_LANGUAGES: PseoLanguage[] = [
  { code: "en", hreflang: "en", label: "English", dir: "ltr" },
  { code: "fr", hreflang: "fr", label: "Français", dir: "ltr" },
  { code: "es", hreflang: "es", label: "Español", dir: "ltr" },
  { code: "pt", hreflang: "pt", label: "Português", dir: "ltr" },
  { code: "de", hreflang: "de", label: "Deutsch", dir: "ltr" },
  { code: "it", hreflang: "it", label: "Italiano", dir: "ltr" },
  { code: "nl", hreflang: "nl", label: "Nederlands", dir: "ltr" },
  { code: "pl", hreflang: "pl", label: "Polski", dir: "ltr" },
  { code: "tr", hreflang: "tr", label: "Türkçe", dir: "ltr" },
  { code: "ru", hreflang: "ru", label: "Русский", dir: "ltr" },
  { code: "ar", hreflang: "ar", label: "العربية", dir: "rtl" },
  { code: "hi", hreflang: "hi", label: "हिन्दी", dir: "ltr" },
  { code: "id", hreflang: "id", label: "Bahasa Indonesia", dir: "ltr" },
  { code: "ja", hreflang: "ja", label: "日本語", dir: "ltr" },
  { code: "ko", hreflang: "ko", label: "한국어", dir: "ltr" },
  { code: "zh", hreflang: "zh", label: "中文", dir: "ltr" },
];

export const DEFAULT_LANGUAGE = "en";

const cat = (slug: string, labels: Record<string, string>): PseoCategory => ({ slug, labels });

export const PSEO_CATEGORIES: PseoCategory[] = [
  cat("students", { en: "students", fr: "étudiants", es: "estudiantes", pt: "estudantes", de: "Studierende", it: "studenti", tr: "öğrenciler", ar: "الطلاب", ja: "学生", ko: "학생", zh: "学生" }),
  cat("gamers", { en: "gamers", fr: "gamers", es: "gamers", pt: "gamers", de: "Gamer", it: "gamer", tr: "oyuncular", ar: "اللاعبين", ja: "ゲーマー", ko: "게이머", zh: "玩家" }),
  cat("language-partners", { en: "language partners", fr: "partenaires linguistiques", es: "compañeros de idioma", pt: "parceiros de idioma", de: "Sprachpartner", it: "partner linguistici", tr: "dil partnerleri", ar: "شركاء اللغة", ja: "言語パートナー", ko: "언어 파트너", zh: "语言伙伴" }),
  cat("musicians", { en: "musicians", fr: "musiciens", es: "músicos", pt: "músicos", de: "Musiker", it: "musicisti", tr: "müzisyenler", ar: "الموسيقيين", ja: "ミュージシャン", ko: "뮤지션", zh: "音乐人" }),
  cat("artists", { en: "artists", fr: "artistes", es: "artistas", pt: "artistas", de: "Künstler", it: "artisti", tr: "sanatçılar", ar: "الفنانين", ja: "アーティスト", ko: "아티스트", zh: "艺术家" }),
  cat("travelers", { en: "travelers", fr: "voyageurs", es: "viajeros", pt: "viajantes", de: "Reisende", it: "viaggiatori", tr: "gezginler", ar: "المسافرين", ja: "旅行者", ko: "여행자", zh: "旅行者" }),
  cat("night-owls", { en: "night owls", fr: "couche-tard", es: "noctámbulos", pt: "notívagos", de: "Nachtschwärmer", it: "nottambuli", tr: "gece kuşları", ar: "سهارى الليل", ja: "夜型の人", ko: "올빼미족", zh: "夜猫子" }),
  cat("creators", { en: "creators", fr: "créateurs", es: "creadores", pt: "criadores", de: "Creator", it: "creator", tr: "içerik üreticileri", ar: "صناع المحتوى", ja: "クリエイター", ko: "크리에이터", zh: "创作者" }),
  cat("developers", { en: "developers", fr: "développeurs", es: "desarrolladores", pt: "desenvolvedores", de: "Entwickler", it: "sviluppatori", tr: "geliştiriciler", ar: "المطورين", ja: "開発者", ko: "개발자", zh: "开发者" }),
  cat("entrepreneurs", { en: "entrepreneurs", fr: "entrepreneurs", es: "emprendedores", pt: "empreendedores", de: "Gründer", it: "imprenditori", tr: "girişimciler", ar: "رواد الأعمال", ja: "起業家", ko: "창업가", zh: "创业者" }),
  cat("book-lovers", { en: "book lovers", fr: "amoureux des livres", es: "amantes de los libros", pt: "amantes de livros", de: "Buchliebhaber", it: "amanti dei libri", tr: "kitapseverler", ar: "محبي الكتب", ja: "読書好き", ko: "독서가", zh: "书迷" }),
  cat("film-fans", { en: "film fans", fr: "cinéphiles", es: "cinéfilos", pt: "cinéfilos", de: "Filmfans", it: "cinefili", tr: "sinemaseverler", ar: "عشاق السينما", ja: "映画ファン", ko: "영화팬", zh: "影迷" }),
  cat("football-fans", { en: "football fans", fr: "fans de football", es: "aficionados al fútbol", pt: "fãs de futebol", de: "Fußballfans", it: "tifosi di calcio", tr: "futbol taraftarları", ar: "عشاق كرة القدم", ja: "サッカーファン", ko: "축구팬", zh: "足球迷" }),
  cat("fitness-fans", { en: "fitness fans", fr: "passionnés de fitness", es: "amantes del fitness", pt: "fãs de fitness", de: "Fitnessfans", it: "appassionati di fitness", tr: "fitness tutkunları", ar: "عشاق اللياقة", ja: "フィットネス好き", ko: "피트니스 팬", zh: "健身爱好者" }),
  cat("foodies", { en: "foodies", fr: "gourmets", es: "foodies", pt: "foodies", de: "Foodies", it: "buongustai", tr: "yemek tutkunları", ar: "عشاق الطعام", ja: "グルメ好き", ko: "미식가", zh: "美食爱好者" }),
  cat("photographers", { en: "photographers", fr: "photographes", es: "fotógrafos", pt: "fotógrafos", de: "Fotografen", it: "fotografi", tr: "fotoğrafçılar", ar: "المصورين", ja: "写真家", ko: "사진가", zh: "摄影师" }),
  cat("dancers", { en: "dancers", fr: "danseurs", es: "bailarines", pt: "dançarinos", de: "Tänzer", it: "ballerini", tr: "dansçılar", ar: "الراقصين", ja: "ダンサー", ko: "댄서", zh: "舞者" }),
  cat("students-abroad", { en: "students abroad", fr: "étudiants à l'étranger", es: "estudiantes en el extranjero", pt: "estudantes no exterior", de: "Auslandsstudierende", it: "studenti all'estero", tr: "yurt dışındaki öğrenciler", ar: "الطلاب في الخارج", ja: "留学生", ko: "유학생", zh: "留学生" }),
  cat("expats", { en: "expats", fr: "expatriés", es: "expatriados", pt: "expatriados", de: "Expats", it: "expat", tr: "gurbetçiler", ar: "المغتربين", ja: "駐在員", ko: "해외 거주자", zh: "侨居者" }),
  cat("new-friends", { en: "new friends", fr: "nouveaux amis", es: "nuevos amigos", pt: "novos amigos", de: "neue Freunde", it: "nuovi amici", tr: "yeni arkadaşlar", ar: "أصدقاء جدد", ja: "新しい友達", ko: "새 친구", zh: "新朋友" }),
  cat("english-practice", { en: "English practice partners", fr: "partenaires pour pratiquer l'anglais", es: "compañeros para practicar inglés", pt: "parceiros para praticar inglês", de: "Englisch-Übungspartner", it: "partner per praticare l'inglese", tr: "İngilizce pratik partnerleri", ar: "شركاء ممارسة الإنجليزية", ja: "英会話パートナー", ko: "영어 연습 파트너", zh: "英语练习伙伴" }),
  cat("study-buddies", { en: "study buddies", fr: "partenaires de révision", es: "compañeros de estudio", pt: "parceiros de estudo", de: "Lernpartner", it: "compagni di studio", tr: "ders arkadaşları", ar: "رفاق الدراسة", ja: "勉強仲間", ko: "스터디 메이트", zh: "学习伙伴" }),
  cat("anime-fans", { en: "anime fans", fr: "fans d'anime", es: "fans del anime", pt: "fãs de anime", de: "Anime-Fans", it: "fan degli anime", tr: "anime hayranları", ar: "عشاق الأنمي", ja: "アニメファン", ko: "애니메이션 팬", zh: "动漫迷" }),
  cat("streamers", { en: "streamers", fr: "streameurs", es: "streamers", pt: "streamers", de: "Streamer", it: "streamer", tr: "yayıncılar", ar: "البثّاثين", ja: "配信者", ko: "스트리머", zh: "主播" }),
  cat("coffee-chats", { en: "coffee-chat partners", fr: "partenaires de pause-café", es: "compañeros de café", pt: "parceiros de café", de: "Kaffeeplausch-Partner", it: "compagni di caffè", tr: "kahve sohbeti arkadaşları", ar: "رفاق دردشة القهوة", ja: "コーヒーチャット相手", ko: "커피챗 상대", zh: "咖啡闲聊伙伴" }),
  cat("late-night-talks", { en: "late-night talkers", fr: "discussions nocturnes", es: "charlas nocturnas", pt: "conversas noturnas", de: "Spätgespräche", it: "chiacchiere notturne", tr: "gece sohbetleri", ar: "أحاديث آخر الليل", ja: "深夜トーク", ko: "심야 대화", zh: "深夜聊天" }),
];

const L = (slug: string, name: string, country: string, countryCode: string, utc: number): PseoLocation => ({
  slug, name, country, countryCode, utc,
});

export const PSEO_LOCATIONS: PseoLocation[] = [
  // Africa
  L("lagos", "Lagos", "Nigeria", "NG", 1), L("abuja", "Abuja", "Nigeria", "NG", 1),
  L("accra", "Accra", "Ghana", "GH", 0), L("nairobi", "Nairobi", "Kenya", "KE", 3),
  L("kampala", "Kampala", "Uganda", "UG", 3), L("dar-es-salaam", "Dar es Salaam", "Tanzania", "TZ", 3),
  L("addis-ababa", "Addis Ababa", "Ethiopia", "ET", 3), L("kigali", "Kigali", "Rwanda", "RW", 2),
  L("johannesburg", "Johannesburg", "South Africa", "ZA", 2), L("cape-town", "Cape Town", "South Africa", "ZA", 2),
  L("durban", "Durban", "South Africa", "ZA", 2), L("pretoria", "Pretoria", "South Africa", "ZA", 2),
  L("casablanca", "Casablanca", "Morocco", "MA", 1), L("rabat", "Rabat", "Morocco", "MA", 1),
  L("marrakech", "Marrakech", "Morocco", "MA", 1), L("algiers", "Algiers", "Algeria", "DZ", 1),
  L("tunis", "Tunis", "Tunisia", "TN", 1), L("cairo", "Cairo", "Egypt", "EG", 2),
  L("alexandria", "Alexandria", "Egypt", "EG", 2), L("dakar", "Dakar", "Senegal", "SN", 0),
  L("abidjan", "Abidjan", "Côte d'Ivoire", "CI", 0), L("douala", "Douala", "Cameroon", "CM", 1),
  L("yaounde", "Yaoundé", "Cameroon", "CM", 1), L("kinshasa", "Kinshasa", "DR Congo", "CD", 1),
  L("luanda", "Luanda", "Angola", "AO", 1), L("maputo", "Maputo", "Mozambique", "MZ", 2),
  L("harare", "Harare", "Zimbabwe", "ZW", 2), L("lusaka", "Lusaka", "Zambia", "ZM", 2),
  L("gaborone", "Gaborone", "Botswana", "BW", 2), L("windhoek", "Windhoek", "Namibia", "NA", 2),
  L("bamako", "Bamako", "Mali", "ML", 0), L("ouagadougou", "Ouagadougou", "Burkina Faso", "BF", 0),
  L("conakry", "Conakry", "Guinea", "GN", 0), L("lome", "Lomé", "Togo", "TG", 0),
  L("cotonou", "Cotonou", "Benin", "BJ", 1), L("libreville", "Libreville", "Gabon", "GA", 1),

  // Europe
  L("london", "London", "United Kingdom", "GB", 0), L("manchester", "Manchester", "United Kingdom", "GB", 0),
  L("birmingham", "Birmingham", "United Kingdom", "GB", 0), L("glasgow", "Glasgow", "United Kingdom", "GB", 0),
  L("dublin", "Dublin", "Ireland", "IE", 0), L("paris", "Paris", "France", "FR", 1),
  L("lyon", "Lyon", "France", "FR", 1), L("marseille", "Marseille", "France", "FR", 1),
  L("toulouse", "Toulouse", "France", "FR", 1), L("bordeaux", "Bordeaux", "France", "FR", 1),
  L("lille", "Lille", "France", "FR", 1), L("nice", "Nice", "France", "FR", 1),
  L("berlin", "Berlin", "Germany", "DE", 1), L("munich", "Munich", "Germany", "DE", 1),
  L("hamburg", "Hamburg", "Germany", "DE", 1), L("cologne", "Cologne", "Germany", "DE", 1),
  L("frankfurt", "Frankfurt", "Germany", "DE", 1), L("stuttgart", "Stuttgart", "Germany", "DE", 1),
  L("worms", "Worms", "Germany", "DE", 1), L("vienna", "Vienna", "Austria", "AT", 1),
  L("zurich", "Zurich", "Switzerland", "CH", 1), L("geneva", "Geneva", "Switzerland", "CH", 1),
  L("amsterdam", "Amsterdam", "Netherlands", "NL", 1), L("rotterdam", "Rotterdam", "Netherlands", "NL", 1),
  L("brussels", "Brussels", "Belgium", "BE", 1), L("antwerp", "Antwerp", "Belgium", "BE", 1),
  L("madrid", "Madrid", "Spain", "ES", 1), L("barcelona", "Barcelona", "Spain", "ES", 1),
  L("valencia", "Valencia", "Spain", "ES", 1), L("seville", "Seville", "Spain", "ES", 1),
  L("bilbao", "Bilbao", "Spain", "ES", 1), L("lisbon", "Lisbon", "Portugal", "PT", 0),
  L("porto", "Porto", "Portugal", "PT", 0), L("rome", "Rome", "Italy", "IT", 1),
  L("milan", "Milan", "Italy", "IT", 1), L("naples", "Naples", "Italy", "IT", 1),
  L("turin", "Turin", "Italy", "IT", 1), L("florence", "Florence", "Italy", "IT", 1),
  L("athens", "Athens", "Greece", "GR", 2), L("thessaloniki", "Thessaloniki", "Greece", "GR", 2),
  L("warsaw", "Warsaw", "Poland", "PL", 1), L("krakow", "Kraków", "Poland", "PL", 1),
  L("wroclaw", "Wrocław", "Poland", "PL", 1), L("prague", "Prague", "Czechia", "CZ", 1),
  L("budapest", "Budapest", "Hungary", "HU", 1), L("bucharest", "Bucharest", "Romania", "RO", 2),
  L("sofia", "Sofia", "Bulgaria", "BG", 2), L("belgrade", "Belgrade", "Serbia", "RS", 1),
  L("zagreb", "Zagreb", "Croatia", "HR", 1), L("ljubljana", "Ljubljana", "Slovenia", "SI", 1),
  L("bratislava", "Bratislava", "Slovakia", "SK", 1), L("copenhagen", "Copenhagen", "Denmark", "DK", 1),
  L("stockholm", "Stockholm", "Sweden", "SE", 1), L("gothenburg", "Gothenburg", "Sweden", "SE", 1),
  L("oslo", "Oslo", "Norway", "NO", 1), L("helsinki", "Helsinki", "Finland", "FI", 2),
  L("tallinn", "Tallinn", "Estonia", "EE", 2), L("riga", "Riga", "Latvia", "LV", 2),
  L("vilnius", "Vilnius", "Lithuania", "LT", 2), L("kyiv", "Kyiv", "Ukraine", "UA", 2),
  L("moscow", "Moscow", "Russia", "RU", 3), L("saint-petersburg", "Saint Petersburg", "Russia", "RU", 3),
  L("istanbul", "Istanbul", "Türkiye", "TR", 3), L("ankara", "Ankara", "Türkiye", "TR", 3),
  L("izmir", "İzmir", "Türkiye", "TR", 3), L("antalya", "Antalya", "Türkiye", "TR", 3),

  // Middle East
  L("dubai", "Dubai", "United Arab Emirates", "AE", 4), L("abu-dhabi", "Abu Dhabi", "United Arab Emirates", "AE", 4),
  L("doha", "Doha", "Qatar", "QA", 3), L("riyadh", "Riyadh", "Saudi Arabia", "SA", 3),
  L("jeddah", "Jeddah", "Saudi Arabia", "SA", 3), L("kuwait-city", "Kuwait City", "Kuwait", "KW", 3),
  L("manama", "Manama", "Bahrain", "BH", 3), L("muscat", "Muscat", "Oman", "OM", 4),
  L("amman", "Amman", "Jordan", "JO", 3), L("beirut", "Beirut", "Lebanon", "LB", 2),
  L("baghdad", "Baghdad", "Iraq", "IQ", 3), L("tel-aviv", "Tel Aviv", "Israel", "IL", 2),

  // Asia
  L("mumbai", "Mumbai", "India", "IN", 5.5), L("delhi", "Delhi", "India", "IN", 5.5),
  L("bengaluru", "Bengaluru", "India", "IN", 5.5), L("hyderabad", "Hyderabad", "India", "IN", 5.5),
  L("chennai", "Chennai", "India", "IN", 5.5), L("kolkata", "Kolkata", "India", "IN", 5.5),
  L("pune", "Pune", "India", "IN", 5.5), L("ahmedabad", "Ahmedabad", "India", "IN", 5.5),
  L("jaipur", "Jaipur", "India", "IN", 5.5), L("lucknow", "Lucknow", "India", "IN", 5.5),
  L("karachi", "Karachi", "Pakistan", "PK", 5), L("lahore", "Lahore", "Pakistan", "PK", 5),
  L("islamabad", "Islamabad", "Pakistan", "PK", 5), L("dhaka", "Dhaka", "Bangladesh", "BD", 6),
  L("colombo", "Colombo", "Sri Lanka", "LK", 5.5), L("kathmandu", "Kathmandu", "Nepal", "NP", 5.75),
  L("bangkok", "Bangkok", "Thailand", "TH", 7), L("chiang-mai", "Chiang Mai", "Thailand", "TH", 7),
  L("hanoi", "Hanoi", "Vietnam", "VN", 7), L("ho-chi-minh-city", "Ho Chi Minh City", "Vietnam", "VN", 7),
  L("phnom-penh", "Phnom Penh", "Cambodia", "KH", 7), L("jakarta", "Jakarta", "Indonesia", "ID", 7),
  L("bandung", "Bandung", "Indonesia", "ID", 7), L("surabaya", "Surabaya", "Indonesia", "ID", 7),
  L("bali", "Bali", "Indonesia", "ID", 8), L("kuala-lumpur", "Kuala Lumpur", "Malaysia", "MY", 8),
  L("singapore", "Singapore", "Singapore", "SG", 8), L("manila", "Manila", "Philippines", "PH", 8),
  L("cebu", "Cebu", "Philippines", "PH", 8), L("davao", "Davao", "Philippines", "PH", 8),
  L("hong-kong", "Hong Kong", "Hong Kong", "HK", 8), L("taipei", "Taipei", "Taiwan", "TW", 8),
  L("shanghai", "Shanghai", "China", "CN", 8), L("beijing", "Beijing", "China", "CN", 8),
  L("shenzhen", "Shenzhen", "China", "CN", 8), L("guangzhou", "Guangzhou", "China", "CN", 8),
  L("chengdu", "Chengdu", "China", "CN", 8), L("seoul", "Seoul", "South Korea", "KR", 9),
  L("busan", "Busan", "South Korea", "KR", 9), L("tokyo", "Tokyo", "Japan", "JP", 9),
  L("osaka", "Osaka", "Japan", "JP", 9), L("kyoto", "Kyoto", "Japan", "JP", 9),
  L("nagoya", "Nagoya", "Japan", "JP", 9), L("fukuoka", "Fukuoka", "Japan", "JP", 9),
  L("sapporo", "Sapporo", "Japan", "JP", 9), L("almaty", "Almaty", "Kazakhstan", "KZ", 5),
  L("tashkent", "Tashkent", "Uzbekistan", "UZ", 5), L("baku", "Baku", "Azerbaijan", "AZ", 4),
  L("tbilisi", "Tbilisi", "Georgia", "GE", 4), L("yerevan", "Yerevan", "Armenia", "AM", 4),
  L("ulaanbaatar", "Ulaanbaatar", "Mongolia", "MN", 8),

  // Americas
  L("new-york", "New York", "United States", "US", -5), L("los-angeles", "Los Angeles", "United States", "US", -8),
  L("chicago", "Chicago", "United States", "US", -6), L("houston", "Houston", "United States", "US", -6),
  L("phoenix", "Phoenix", "United States", "US", -7), L("philadelphia", "Philadelphia", "United States", "US", -5),
  L("san-antonio", "San Antonio", "United States", "US", -6), L("san-diego", "San Diego", "United States", "US", -8),
  L("dallas", "Dallas", "United States", "US", -6), L("austin", "Austin", "United States", "US", -6),
  L("san-francisco", "San Francisco", "United States", "US", -8), L("seattle", "Seattle", "United States", "US", -8),
  L("denver", "Denver", "United States", "US", -7), L("boston", "Boston", "United States", "US", -5),
  L("miami", "Miami", "United States", "US", -5), L("atlanta", "Atlanta", "United States", "US", -5),
  L("detroit", "Detroit", "United States", "US", -5), L("las-vegas", "Las Vegas", "United States", "US", -8),
  L("portland", "Portland", "United States", "US", -8), L("minneapolis", "Minneapolis", "United States", "US", -6),
  L("orlando", "Orlando", "United States", "US", -5), L("nashville", "Nashville", "United States", "US", -6),
  L("washington-dc", "Washington, D.C.", "United States", "US", -5), L("honolulu", "Honolulu", "United States", "US", -10),
  L("toronto", "Toronto", "Canada", "CA", -5), L("montreal", "Montreal", "Canada", "CA", -5),
  L("vancouver", "Vancouver", "Canada", "CA", -8), L("calgary", "Calgary", "Canada", "CA", -7),
  L("ottawa", "Ottawa", "Canada", "CA", -5), L("edmonton", "Edmonton", "Canada", "CA", -7),
  L("mexico-city", "Mexico City", "Mexico", "MX", -6), L("guadalajara", "Guadalajara", "Mexico", "MX", -6),
  L("monterrey", "Monterrey", "Mexico", "MX", -6), L("cancun", "Cancún", "Mexico", "MX", -5),
  L("guatemala-city", "Guatemala City", "Guatemala", "GT", -6), L("san-salvador", "San Salvador", "El Salvador", "SV", -6),
  L("san-jose-cr", "San José", "Costa Rica", "CR", -6), L("panama-city", "Panama City", "Panama", "PA", -5),
  L("havana", "Havana", "Cuba", "CU", -5), L("santo-domingo", "Santo Domingo", "Dominican Republic", "DO", -4),
  L("kingston", "Kingston", "Jamaica", "JM", -5), L("port-au-prince", "Port-au-Prince", "Haiti", "HT", -5),
  L("bogota", "Bogotá", "Colombia", "CO", -5), L("medellin", "Medellín", "Colombia", "CO", -5),
  L("cali", "Cali", "Colombia", "CO", -5), L("caracas", "Caracas", "Venezuela", "VE", -4),
  L("quito", "Quito", "Ecuador", "EC", -5), L("guayaquil", "Guayaquil", "Ecuador", "EC", -5),
  L("lima", "Lima", "Peru", "PE", -5), L("la-paz", "La Paz", "Bolivia", "BO", -4),
  L("santiago", "Santiago", "Chile", "CL", -4), L("buenos-aires", "Buenos Aires", "Argentina", "AR", -3),
  L("cordoba", "Córdoba", "Argentina", "AR", -3), L("rosario", "Rosario", "Argentina", "AR", -3),
  L("montevideo", "Montevideo", "Uruguay", "UY", -3), L("asuncion", "Asunción", "Paraguay", "PY", -3),
  L("sao-paulo", "São Paulo", "Brazil", "BR", -3), L("rio-de-janeiro", "Rio de Janeiro", "Brazil", "BR", -3),
  L("brasilia", "Brasília", "Brazil", "BR", -3), L("salvador", "Salvador", "Brazil", "BR", -3),
  L("fortaleza", "Fortaleza", "Brazil", "BR", -3), L("belo-horizonte", "Belo Horizonte", "Brazil", "BR", -3),
  L("curitiba", "Curitiba", "Brazil", "BR", -3), L("porto-alegre", "Porto Alegre", "Brazil", "BR", -3),
  L("recife", "Recife", "Brazil", "BR", -3), L("manaus", "Manaus", "Brazil", "BR", -4),

  // Oceania
  L("sydney", "Sydney", "Australia", "AU", 10), L("melbourne", "Melbourne", "Australia", "AU", 10),
  L("brisbane", "Brisbane", "Australia", "AU", 10), L("perth", "Perth", "Australia", "AU", 8),
  L("adelaide", "Adelaide", "Australia", "AU", 9.5), L("gold-coast", "Gold Coast", "Australia", "AU", 10),
  L("canberra", "Canberra", "Australia", "AU", 10), L("auckland", "Auckland", "New Zealand", "NZ", 12),
  L("wellington", "Wellington", "New Zealand", "NZ", 12), L("christchurch", "Christchurch", "New Zealand", "NZ", 12),
  L("suva", "Suva", "Fiji", "FJ", 12), L("port-moresby", "Port Moresby", "Papua New Guinea", "PG", 10),
];

export const CATEGORY_BY_SLUG = new Map(PSEO_CATEGORIES.map((c) => [c.slug, c]));
export const LOCATION_BY_SLUG = new Map(PSEO_LOCATIONS.map((l) => [l.slug, l]));
export const LANGUAGE_BY_CODE = new Map(PSEO_LANGUAGES.map((l) => [l.code, l]));

/** Total addressable programmatic page count. */
export const MATRIX_SIZE =
  PSEO_LANGUAGES.length * PSEO_CATEGORIES.length * PSEO_LOCATIONS.length;
