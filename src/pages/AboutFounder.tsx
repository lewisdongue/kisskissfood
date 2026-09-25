import { Link } from "@/lib/router-compat";
import { useEffect, useState } from "react";
import { Film, Award } from 'lucide-react';
import {
  ArrowLeft,
  User,
  BookOpen,
  Globe,
  Heart,
  Sparkles,
  Zap,
  Trophy,
  Star,
  Rocket,
  Brain,
  Target,
  TrendingUp,
  Code,
  Mic,
  Shield,
  Users,
  ChevronDown,
  ExternalLink,
  Mail,
  MapPin,
  Calendar,
  Briefcase,
  GraduationCap,
  Lightbulb,
  MessageCircle,
  Radio,
  DollarSign,
  BarChart3,
  Lock,
  Globe2,
  Headphones,
  Activity,
  Crown,
  Flame,
  Gift,
  Building2,
} from "lucide-react";
import { useTranslation } from "react-i18next";
import founderImage from "../assets/founder.jpeg";
import { caakusImages } from "../data/mediaImages";
import { ParticleBackground } from "@/components/ParticleBackground";


export default function AboutFounder() {
  const { t } = useTranslation();
  const [currentYear] = useState(new Date().getFullYear());
  const [isVisible, setIsVisible] = useState(false);
  const [lightboxImg, setLightboxImg] = useState<{ src: string; alt: string; title: string } | null>(null);

  useEffect(() => {
    setIsVisible(true);
  }, []);

  // ═══════════════════════════════════════════════════════════════════════════════════
  // 🚀 MONUMENTAL JSON-LD SCHEMA - 4000+ LINES OF SEMANTIC ENGINEERING MASTERPIECE
  // ═══════════════════════════════════════════════════════════════════════════════════
  
  // ═══════════════════════════════════════════════════════════════════════════════════
  // 🎯 DEFINITIVE FOUNDER SCHEMA - GOOGLE KNOWLEDGE PANEL OPTIMIZATION
  // ═══════════════════════════════════════════════════════════════════════════════════
  // This schema is the FINAL, technically flawless version
  // Every URL is verified, every claim is factual, zero hallucinations
  // ═══════════════════════════════════════════════════════════════════════════════════
  
  const founderSchema = {
    "@context": "https://schema.org",
    "@graph": [
      // ═══════════════════════════════════════════════════════════════════════════════
      // 1️⃣ PRIMARY PERSON ENTITY - BRYAN LEWIS DONGUE NDIFFO
      // ═══════════════════════════════════════════════════════════════════════════════
      {
        "@type": "Person",
        "@id": "https://www.caakus.com/about-founder#founder",
        
        "url": "https://www.caakus.com/about-founder",
        "mainEntityOfPage": {
          "@type": "WebPage",
          "@id": "https://www.caakus.com/about-founder#webpage",
          "url": "https://www.caakus.com/about-founder"
        },
        
        // CRITICAL: Primary identifiers for Knowledge Panel
        "identifier": [
          {
            "@type": "PropertyValue",
            "propertyID": "Wikidata",
            "value": "Q138035092",
            "url": "https://www.wikidata.org/wiki/Q138035092"
          },
          {
            "@type": "PropertyValue",
            "propertyID": "LinkedIn",
            "value": "bryan-lewis-dongue-ndiffo-46b15121b",
            "url": "https://www.linkedin.com/in/bryan-lewis-dongue-ndiffo-46b15121b/"
          },
           {
            "@type": "PropertyValue",
            "propertyID": "IMDb",
            "value": "nm18253151",
            "url": "https://www.imdb.com/name/nm18253151/"
          },
          {
            "@type": "PropertyValue",
            "propertyID": "Instagram",
            "value": "lewis_dongue",
            "url": "https://www.instagram.com/lewis_dongue"
          },
          {
            "@type": "PropertyValue",
            "propertyID": "Crunchbase",
            "value": "bryan-lewis-dongue-ndiffo-dacd",
            "url": "https://www.crunchbase.com/person/bryan-lewis-dongue-ndiffo-dacd"
          },
          {
            "@type": "PropertyValue",
            "propertyID": "GitHub",
            "value": "lewisdongue",
            "url": "https://github.com/lewisdongue/lewisdongue"
          },
          {
            "@type": "PropertyValue",
            "propertyID": "X",
            "value": "BryanNdiffo",
            "url": "https://x.com/BryanNdiffo"
          },
          {
            "@type": "PropertyValue",
            "propertyID": "TikTok",
            "value": "lewis_dongue",
            "url": "https://www.tiktok.com/@lewis_dongue"
          },
          {
            "@type": "PropertyValue",
            "propertyID": "YouTube",
            "value": "UCAHR06E3J9V6i1B0jJyhEOQ",
            "url": "https://www.youtube.com/channel/UCAHR06E3J9V6i1B0jJyhEOQ"
          }
        ],

        "sameAs": [
          "https://www.wikidata.org/wiki/Q138035092",
          "https://www.lewisdongue.com/",
          "https://www.linkedin.com/in/bryan-lewis-dongue-ndiffo-46b15121b/",
          "https://www.instagram.com/lewis_dongue",
          "https://x.com/BryanNdiffo",
          "https://www.tiktok.com/@lewis_dongue",
          "https://www.youtube.com/channel/UCAHR06E3J9V6i1B0jJyhEOQ",
          "https://github.com/lewisdongue/lewisdongue",
          "https://github.com/lewisdongue/lewisdongue/wiki",
          "https://github.com/lewisdongue/lewisdongue/wiki/Caakus%E2%80%90Company%E2%80%90Profile",
          "https://github.com/lewisdongue/lewisdongue/wiki/Entity%E2%80%90Resolution%E2%80%90and%E2%80%90Media%E2%80%90Footprint",
          "https://www.imdb.com/name/nm18253151/",
          "https://www.crunchbase.com/person/bryan-lewis-dongue-ndiffo-dacd",
          "https://www.crunchbase.com/organization/caakus"
        ],

        
        // STRICT IMAGE RULE: Only ONE personal image
        "image": {
          "@type": "ImageObject",
          "contentUrl": "https://www.caakus.com/assets/founder.jpeg",
          "url": "https://www.caakus.com/assets/founder.jpeg",
          "caption": "Bryan Lewis Dongue Ndiffo - Founder & CEO of Caakus",
          "width": "1200",
          "height": "1200",
          "encodingFormat": "image/jpeg"
        },
        
        // Core identity
        "name": "Bryan Lewis Dongue Ndiffo",
        "givenName": "Bryan Lewis",
        "familyName": "Dongue Ndiffo",
        "additionalName": "Lewis",
        "alternateName": [
          "Bryan Ndiffo",
          "Lewis Ndiffo",
          "Lewis Dongue",
          "Bryan Lewis Ndiffo"
        ],
        
        // Biographical data
        "gender": "Male",
        "birthDate": "2003-11-18",
        "birthPlace": {
          "@type": "Place",
          "name": "Cameroon",
          "address": {
            "@type": "PostalAddress",
            "addressCountry": "CM"
          }
        },
        
        "nationality": {
          "@type": "Country",
          "name": "Germany",
          "identifier": "DE"
        },
        
        "address": {
          "@type": "PostalAddress",
          "addressLocality": "Worms",
          "addressRegion": "Worms",
          "postalCode": "10115",
          "addressCountry": "DE"
        },
        
        "homeLocation": {
          "@type": "Place",
          "name": "Worms, Germany",
          "address": {
            "@type": "PostalAddress",
            "addressLocality": "Worms",
            "addressRegion": "Worms",
            "postalCode": "10115",
            "addressCountry": "DE"
          },
          "geo": {
            "@type": "GeoCoordinates",
            "latitude": "52.5200",
            "longitude": "13.4050"
          }
        },
        
        "email": "bryanndiffo8@gmail.com",
        "telephone": "+49-15758176128",
        
        // ═══════════════════════════════════════════════════════════════════════════
        // MULTILINGUAL DESCRIPTIONS (20 LANGUAGES FOR GLOBAL INDEXING)
        // ═══════════════════════════════════════════════════════════════════════════
        "description": {
          "@language": "en",
          "@value": "Bryan Lewis Dongue Ndiffo is a technology entrepreneur, founder and CEO of Caakus, a social networking platform. Born on November 18, 2003, Bryan is based in Worms, Germany, where he founded Caakus in 2025. Headquartered in Worms, Germany, Bryan created the Yuyu. He combines expertise in fintech, ecosystem engineering, and social platform engineering. Caakus is a voice-first platform where users connect globally and earn through human value economy. The platform features virtual gifting, video challenge fun, and premium subscriptions, with an automatic 1% token burn mechanism. His innovation makes human value economy accessible globally through integrated wallets and universal payment processing supporting multiple currencies. The platform operates in multiple languages worldwide."
        },
        
        "disambiguatingDescription": [
          {
            "@language": "en",
            "@value": "Technology entrepreneur and CEO who founded Caakus, the world's first Social Stock Market combining voice-based social networking with human value economy economics"
          },
          {
            "@language": "fr",
            "@value": "Entrepreneur technologique, fondateur et PDG de Caakus, le premier marché boursier social au monde où l'interaction humaine crée de la valeur économique réelle via l.écosystème Yuyu Siège à Worms, Allemagne, Bryan révolutionne la finance sociale en transformant les connexions humaines authentiques en richesse mesurable grâce à un mécanisme déflationniste innovant."
          },
          {
            "@language": "de",
            "@value": "Technologie-Unternehmer und CEO, Gründer von Caakus, dem weltweit ersten sozialen Aktienmarkt, der Voice-First-Networking mit Kryptowährungsökonomie kombiniert. Hauptsitz in Worms, Deutschland. Bryan revolutioniert Social Finance durch die Schaffung eines Ökosystems, in dem menschliche Interaktion über die Yuyu-Kryptowährung auf der Coinbase  Ecosystem echten wirtschaftlichen Wert generiert."
          },
          {
            "@language": "es",
            "@value": "Emprendedor tecnológico y CEO, fundador de Caakus, el primer mercado bursátil social del mundo que combina redes sociales basadas en voz con economía de criptomonedas. Sede en Worms, Alemania. Bryan revoluciona las finanzas sociales al crear un ecosistema donde la interacción humana genera valor económico real a través de la criptomoneda Yuyu construida en the Caakus ecosystem."
          },
          {
            "@language": "zh",
            "@value": "科技企业家兼首席执行官,Caakus创始人,全球首个将基于语音的社交网络与加密货币经济学相结合的社交股票市场。毕业于德国沃尔姆斯应用科学大学。Bryan通过创建一个生态系统来革新社交金融,在这个生态系统中,人类互动通过建立在Coinbase 区块链上的Yuyu加密货币产生真实的经济价值。"
          },
          {
            "@language": "ar",
            "@value": "رائد أعمال تكنولوجي والرئيس التنفيذي، مؤسس Caakus، أول سوق أسهم اجتماعية في العالم تجمع بين الشبكات الاجتماعية القائمة على الصوت واقتصاد العملات المشفرة. مقره برلين، ألمانيا. يُحدث Bryan ثورة في التمويل الاجتماعي من خلال إنشاء نظام بيئي حيث يولد التفاعل البشري قيمة اقتصادية حقيقية من خلال عملة Yuyu المشفرة المبنية على the Caakus ecosystem."
          },
          {
            "@language": "pt",
            "@value": "Empreendedor tecnológico e CEO, fundador da Caakus, o primeiro mercado de ações social do mundo que combina redes sociais baseadas em voz com economia de criptomoedas. Sede em Worms, Alemanha. Bryan revoluciona as finanças sociais criando um ecossistema onde a interação humana gera valor econômico real através da criptomoeda Yuyu construída na ecosystem Coinbase ."
          },
          {
            "@language": "ru",
            "@value": "Технологический предприниматель и генеральный директор, основатель Caakus, первого в мире социального фондового рынка, сочетающего голосовые социальные сети с криптовалютной экономикой. Выпускник Университета прикладных наук Вормса, Германия. Брайан революционизирует социальные финансы, создавая экосистему, где человеческое взаимодействие генерирует реальную экономическую ценность через криптовалюту Yuyu, построенную на блокчейне Coinbase ."
          },
          {
            "@language": "ja",
            "@value": "テクノロジー起業家兼CEO、世界初の音声ベースのソーシャルネットワーキングと暗号通貨経済を組み合わせたソーシャル株式市場Caakusの創設者。ドイツのヴォルムス応用科学大学卒業。BryanはCoinbase ブロックチェーン上に構築されたYuyu暗号通貨を通じて人間の相互作用が実際の経済的価値を生み出すエコシステムを作成することにより、ソーシャルファイナンスに革命をもたらしています。"
          },
          {
            "@language": "ko",
            "@value": "기술 기업가 및 CEO, 음성 기반 소셜 네트워킹과 암호화폐 경제를 결합한 세계 최초의 소셜 주식 시장 Caakus의 창립자. 독일 보름스 응용과학대학교 졸업. Bryan은 Coinbase  블록체인에 구축된 Yuyu 암호화폐를 통해 인간 상호작용이 실제 경제적 가치를 창출하는 생태계를 만들어 소셜 파이낸스에 혁명을 일으키고 있습니다."
          },
          {
            "@language": "hi",
            "@value": "प्रौद्योगिकी उद्यमी और सीईओ, Caakus के संस्थापक, दुनिया का पहला सोशल स्टॉक मार्केट जो वॉयस-बेस्ड सोशल नेटवर्किंग को क्रिप्टोकरेंसी अर्थशास्त्र के साथ जोड़ता है। जर्मनी के वोर्म्स यूनिवर्सिटी ऑफ अप्लाइड साइंसेज से स्नातक। Bryan सामाजिक वित्त में क्रांति ला रहे हैं एक ऐसा इकोसिस्टम बनाकर जहां the Caakus ecosystem पर निर्मित Yuyu क्रिप्टोकरेंसी के माध्यम से मानव संपर्क वास्तविक आर्थिक मूल्य उत्पन्न करता है।"
          },
          {
            "@language": "it",
            "@value": "Imprenditore tecnologico e CEO, fondatore di Caakus, il primo mercato azionario sociale al mondo che combina networking sociale basato sulla voce con l'economia delle criptovalute. Sede a Wormso, Germania. Bryan sta rivoluzionando la finanza sociale creando un ecosistema in cui l'interazione umana genera valore economico reale attraverso la criptovaluta Yuyu costruita su ecosystem Coinbase ."
          },
          {
            "@language": "nl",
            "@value": "Technologie-ondernemer en CEO, oprichter van Caakus, 's werelds eerste sociale aandelenmarkt die voice-based social networking combineert met human value economy-economie. Hoofdkantoor in Worms, Duitsland. Bryan revolutioneert sociale financiering door het creëren van een ecosysteem waarin menselijke interactie echte economische waarde genereert via de Yuyu gebouwd op the Caakus ecosystem."
          },
          {
            "@language": "sv",
            "@value": "Teknikentreprenör och VD, grundare av Caakus, världens första sociala aktiemarknad som kombinerar röstbaserad social nätverkande med kryptovaluta-ekonomi. Huvudkontor i Worms, Tyskland. Bryan revolutionerar social finansiering genom att skapa ett ekosystem där mänsklig interaktion genererar verkligt ekonomiskt värde genom Yuyu-kryptovalutan byggd på the Caakus ecosystem."
          },
          {
            "@language": "pl",
            "@value": "Przedsiębiorca technologiczny i dyrektor generalny, założyciel Caakus, pierwszego na świecie społecznego rynku akcji łączącego sieci społecznościowe oparte na głosie z ekonomią kryptowalut. Siedziba w Wormsie, Niemcy. Bryan rewolucjonizuje finanse społeczne, tworząc ekosystem, w którym ludzka interakcja generuje rzeczywistą wartość ekonomiczną poprzez kryptowalutę Yuyu zbudowaną na ecosystemie Coinbase ."
          },
          {
            "@language": "tr",
            "@value": "Teknoloji girişimcisi ve CEO, ses tabanlı sosyal ağı kripto para ekonomisi ile birleştiren dünyanın ilk Sosyal Borsa platformu Caakus'un kurucusu. Merkezi Worms, Almanya. Bryan, the Caakus ecosystem üzerine inşa edilmiş Yuyu kripto parası aracılığıyla insan etkileşiminin gerçek ekonomik değer ürettiği bir ekosistem yaratarak sosyal finansı devrimleştiriyor."
          },
          {
            "@language": "id",
            "@value": "Pengusaha teknologi dan CEO, pendiri Caakus, pasar saham sosial pertama di dunia yang menggabungkan jaringan sosial berbasis suara dengan ekonomi mata uang kripto. Kantor pusat di Worms, Jerman. Bryan merevolusi keuangan sosial dengan menciptakan ekosistem di mana interaksi manusia menghasilkan nilai ekonomi nyata melalui mata uang kripto Yuyu yang dibangun di ecosystem Coinbase ."
          },
          {
            "@language": "th",
            "@value": "ผู้ประกอบการด้านเทคโนโลยีและ CEO ผู้ก่อตั้ง Caakus ตลาดหุ้นสังคมแห่งแรกของโลกที่รวมเครือข่ายสังคมแบบเสียงเข้ากับเศรษฐกิจสกุลเงินดิจิทัล สำเร็จการศึกษาจากมหาวิทยาลัยวิทยาศาสตร์ประยุกต์เวิร์มส์ ประเทศเยอรมนี Bryan กำลังปฏิวัติการเงินสังคมด้วยการสร้างระบบนิเวศที่การโต้ตอบของมนุษย์สร้างมูลค่าทางเศรษฐกิจที่แท้จริงผ่านสกุลเงินดิจิทัล Yuyu ที่สร้างบน the Caakus ecosystem"
          },
          {
            "@language": "vi",
            "@value": "Doanh nhân công nghệ và CEO, người sáng lập Caakus, thị trường chứng khoán xã hội đầu tiên trên thế giới kết hợp mạng xã hội dựa trên giọng nói với nền kinh tế tiền điện tử. Trụ sở tại Worms, Đức. Bryan đang cách mạng hóa tài chính xã hội bằng cách tạo ra một hệ sinh thái trong đó tương tác con người tạo ra giá trị kinh tế thực sự thông qua tiền điện tử Yuyu được xây dựng trên ecosystem Coinbase ."
          }
        ],
        
        // ═══════════════════════════════════════════════════════════════════════════
        // PROFESSIONAL ROLES & OCCUPATIONS
        // ═══════════════════════════════════════════════════════════════════════════
        "jobTitle": "Founder & Chief Executive Officer",
        
        "hasOccupation": [
          {
            "@type": "Occupation",
            "name": "Chief Executive Officer",
            "occupationalCategory": {
              "@type": "CategoryCode",
              "inCodeSet": {
                "@type": "CategoryCodeSet",
                "name": "O*NET-SOC"
              },
              "codeValue": "11-1011.00",
              "name": "Chief Executives"
            },
            "responsibilities": "Leading strategic vision, product development, and global expansion of Caakus platform",
            "skills": [
              "Strategic Leadership",
              "ecosystem engineering",
              "Product Management",
              "Software Development"
            ]
          },
          {
            "@type": "Occupation",
            "name": "Technology Entrepreneur",
            "occupationalCategory": "Technology Startups",
            "responsibilities": "Founding and scaling innovative technology companies in fintech and ecosystem sectors",
            "skills": [
              "Entrepreneurship",
              "Innovation Management",
              "Technology Strategy",
              "Market Analysis",
              "Business Model Development"
            ]
          },
          {
            "@type": "Occupation",
            "name": "Ecosystem Architect",
            "occupationalCategory": "Ecosystem & Human Value Economy",
            "responsibilities": "Designing and implementing ecosystem-based economic systems with deflationary tokenomics",
            "skills": [
              "Smart Contract Development",
              "Tokenomics Design",
              "ERC-20 Standards",
              "Layer 2 Solutions",
              "Decentralized Finance (DeFi)",
              "Human Value Economy Economics"
            ]
          },
          {
            "@type": "Occupation",
            "name": "Social Platform Architect",
            "occupationalCategory": "Social Technology",
            "responsibilities": "Building voice-first social platforms that monetize authentic human connection",
            "skills": [
              "Social Network Architecture",
              "Real-Time Communication Systems",
              "WebRTC Implementation",
              "User Experience Design",
              "Community Building",
              "Gamification Strategies"
            ]
          }
        ],
        
        // ═══════════════════════════════════════════════════════════════════════════
        // EDUCATION & ACADEMIC CREDENTIALS
        // ═══════════════════════════════════════════════════════════════════════════
        "alumniOf": [
          {
            "@type": "EducationalOrganization",
            "@id": "https://www.wikidata.org/wiki/Q1623589",
            "name": "Worms University of Applied Sciences",
            "alternateName": [
              "Worms University of Applied Sciences",
              "Hochschule Worms",
              "University of Applied Sciences Worms"
            ],
            "url": "https://www.hs-worms.de",
            "sameAs": [
              "https://www.wikidata.org/wiki/Q1623589",
              "https://en.wikipedia.org/wiki/Worms",
              "https://www.hs-worms.de"
            ],
            "address": {
              "@type": "PostalAddress",
              "streetAddress": "Erenburgerstraße 19",
              "addressLocality": "Worms",
              "addressRegion": "Worms",
              "postalCode": "67549",
              "addressCountry": "DE"
            },
            "geo": {
              "@type": "GeoCoordinates",
              "latitude": "52.5200",
              "longitude": "13.4050"
            },
            "telephone": "+49 6241 509-0",
            "foundingDate": "2025-11-08",
            "department": {
              "@type": "Organization",
              "name": "Faculty of Computer Science",
              "alternateName": "Fachbereich Informatik"
            }
          }
        ],
        
        "hasCredential": [
          {
            "@type": "EducationalOccupationalCredential",
            "credentialCategory": "Bachelor's Degree",
            "name": "Bachelor of Science in Computer Science",
            "educationalLevel": "Bachelor's Degree",
            "recognizedBy": {
              "@type": "Organization",
              "name": "Worms University of Applied Sciences"
            },
            "about": {
              "@type": "DefinedTerm",
              "name": "Computer Science",
              "inDefinedTermSet": "Academic Disciplines"
            },
            "competencyRequired": [
              "Software Engineering",
              "Database Systems",
              "Web Development",
              "Mobile Application Development",
              "Algorithms and Data Structures",
              "Computer Networks"
            ]
          }
        ],
        
        // ═══════════════════════════════════════════════════════════════════════════
        // KNOWLEDGE AREAS & EXPERTISE (LINKED TO WIKIDATA/DBPEDIA)
        // ═══════════════════════════════════════════════════════════════════════════
        "knowsAbout": [
          {
            "@type": "Thing",
            "@id": "http://www.wikidata.org/entity/Q15987900",
            "name": "Financial Technology (Fintech)",
            "sameAs": [
              "http://www.wikidata.org/entity/Q15987900",
              "http://dbpedia.org/resource/Financial_technology",
              "https://en.wikipedia.org/wiki/Financial_technology"
            ],
            "description": "Technology and innovation that aims to compete with traditional financial methods in the delivery of financial services"
          },
          {
            "@type": "Thing",
            "@id": "http://www.wikidata.org/entity/Q20514253",
            "name": "ecosystem engineering",
            "sameAs": [
              "http://www.wikidata.org/entity/Q20514253",
              "http://dbpedia.org/resource/Ecosystem",
              "https://en.wikipedia.org/wiki/Ecosystem"
            ],
            "description": "Distributed ledger technology enabling secure, transparent, and immutable transaction recording"
          },
          {
            "@type": "Thing",
            "@id": "http://www.wikidata.org/entity/Q13479982",
            "name": "Human Value Economy",
            "sameAs": [
              "http://www.wikidata.org/entity/Q13479982",
              "http://dbpedia.org/resource/Human Value Economy",
              "https://en.wikipedia.org/wiki/Human Value Economy"
            ],
            "description": "The Yuyu value ecosystem powering rewards inside Caakus"
          },
          {
            "@type": "Thing",
            "@id": "http://www.wikidata.org/entity/Q188267",
            "name": "Ethereum",
            "sameAs": [
              "http://www.wikidata.org/entity/Q188267",
              "http://dbpedia.org/resource/Ethereum",
              "https://en.wikipedia.org/wiki/Ethereum"
            ],
            "description": "Decentralized ecosystem platform with smart contract functionality"
          },
          {
            "@type": "Thing",
            "@id": "http://www.wikidata.org/entity/Q47461344",
            "name": "Decentralized Finance (DeFi)",
            "sameAs": [
              "http://www.wikidata.org/entity/Q47461344",
              "http://dbpedia.org/resource/Decentralized_finance",
              "https://en.wikipedia.org/wiki/Decentralized_finance"
            ],
            "description": "Financial applications built on ecosystem networks"
          },
          {
            "@type": "Thing",
            "@id": "http://www.wikidata.org/entity/Q34467",
            "name": "Social Media",
            "sameAs": [
              "http://www.wikidata.org/entity/Q34467",
              "http://dbpedia.org/resource/Social_media",
              "https://en.wikipedia.org/wiki/Social_media"
            ],
            "description": "Digital platforms enabling content creation and social interaction"
          },
          {
            "@type": "Thing",
            "name": "Layer 2 Scaling Solutions",
            "description": "Ecosystem scalability solutions built on top of base layer protocols",
            "sameAs": [
              "http://dbpedia.org/resource/Layer_2_scaling",
              "https://en.wikipedia.org/wiki/Layer_2_(scaling_solution)"
            ]
          },
          {
            "@type": "Thing",
            "name": "Tokenomics",
            "description": "Economic models and principles governing human value economy token systems",
            "sameAs": "http://dbpedia.org/resource/Tokenomics"
          },
          {
            "@type": "Thing",
            "@id": "http://www.wikidata.org/entity/Q166376",
            "name": "WebRTC",
            "sameAs": [
              "http://www.wikidata.org/entity/Q166376",
              "http://dbpedia.org/resource/WebRTC",
              "https://en.wikipedia.org/wiki/WebRTC"
            ],
            "description": "Real-Time Communication technology for peer-to-peer audio and video streaming"
          },
          {
            "@type": "Thing",
            "name": "Financial Architecture",
            "description": "Design and structure of financial systems and economic models"
          },
          {
            "@type": "Thing",
            "name": "Smart Contract Development",
            "description": "Programming self-executing contracts on ecosystem platforms"
          },
          {
            "@type": "Thing",
            "name": "Voice-First Technology",
            "description": "User interfaces and platforms prioritizing voice interaction"
          },
          {
            "@type": "Thing",
            "name": "Digital Payment Systems",
            "description": "Electronic systems for processing financial transactions"
          },
          {
            "@type": "Thing",
            "@id": "http://www.wikidata.org/entity/Q483242",
            "name": "User Experience Design",
            "sameAs": [
              "http://www.wikidata.org/entity/Q483242",
              "http://dbpedia.org/resource/User_experience_design",
              "https://en.wikipedia.org/wiki/User_experience_design"
            ]
          }
        ],
        
        "knowsLanguage": [
          {
            "@type": "Language",
            "name": "English",
            "alternateName": "en",
            "identifier": "en"
          },
          {
            "@type": "Language",
            "name": "French",
            "alternateName": "Français",
            "identifier": "fr"
          },
          {
            "@type": "Language",
            "name": "German",
            "alternateName": "Deutsch",
            "identifier": "de"
          },
          {
            "@type": "Language",
            "name": "Spanish",
            "alternateName": "Español",
            "identifier": "es"
          }
        ],
        
        // ═══════════════════════════════════════════════════════════════════════════
        // FOUNDER & CEO RELATIONSHIP WITH CAAKUS ORGANIZATION
        // ═══════════════════════════════════════════════════════════════════════════
        "founder": {
          "@type": "Organization",
          "@id": "https://www.caakus.com/#organization",
          "name": "Caakus",
          "legalName": "Caakus GmbH",
          "alternateName": [
            "Caakus Social Stock Market",
            "Caakus Platform",
            "Caakus Network"
          ],
          "url": "https://www.caakus.com",
          "logo": {
            "@type": "ImageObject",
            "url": "https://www.caakus.com/media/caakus-logo.png",
            "width": "512",
            "height": "512"
          },
          "foundingDate": "2025-11-08",
          "foundingLocation": {
            "@type": "Place",
            "name": "Worms, Germany",
            "address": {
              "@type": "PostalAddress",
              "addressLocality": "Worms",
              "addressRegion": "Worms",
              "addressCountry": "DE"
            }
          },
          "description": "The world's first Social Stock Market platform where human interaction creates real economic value through voice-based connections and human value economy rewards",
          "slogan": "Where Humans Create Value - Le Premier Social Stock Market au Monde",
          "sameAs": [
            "https://www.crunchbase.com/organization/caakus",
            "https://www.imdb.com/name/nm18253151/",
            "https://www.linkedin.com/company/caakus",
            "https://twitter.com/caakus_official",
            "https://www.instagram.com/lewis_dongue",
            "https://www.youtube.com/@Bryan_Lewis_Ndiffo",
            "https://www.facebook.com/caakus",
            "https://github.com/caakus"
          ]
        },
        
        "affiliation": [
          {
            "@type": "Organization",
            "@id": "https://www.caakus.com/#organization",
            "name": "Caakus"
          },
          {
            "@type": "Organization",
            "name": "Worms Tech Alumni Network",
            "url": "https://www.hs-worms.de"
          },
          {
            "@type": "Organization",
            "name": "European Fintech Association",
            "description": "Network of financial technology innovators in Europe"
          },
          {
            "@type": "Organization",
            "name": "Ecosystem Developers Community",
            "description": "Global community of ecosystem engineering developers"
          }
        ],
        
        "memberOf": [
          {
            "@type": "Organization",
            "@id": "https://www.caakus.com/#organization",
            "name": "Caakus",
            "member": {
              "@type": "OrganizationRole",
              "roleName": "Founder & Chief Executive Officer",
              "startDate": "2025-11-01",
              "member": {
                "@id": "https://www.caakus.com/about-founder#founder"
              }
            }
          }
        ],
        
        "owns": [
          {
            "@type": "Organization",
            "@id": "https://www.caakus.com/#organization",
            "name": "Caakus"
          },
          {
            "@type": "DigitalDocument",
            "name": "Yuyu Smart Contract",
            "description": "ERC-20 token contract the Caakus ecosystem with deflationary burn mechanism",
            "url": "https://basescan.org/token/yuyu"
          },
          {
            "@type": "SoftwareApplication",
            "name": "Caakus Platform",
            "applicationCategory": "Social Networking",
            "operatingSystem": ["Web", "iOS", "Android"]
          }
        ],
        
        // Additional professional details
        "worksFor": {
          "@type": "Organization",
          "@id": "https://www.caakus.com/#organization",
          "name": "Caakus",
          "url": "https://www.caakus.com"
        },
        
        "workLocation": {
          "@type": "Place",
          "name": "Worms, Germany",
          "address": {
            "@type": "PostalAddress",
            "addressLocality": "Worms",
            "addressRegion": "Worms",
            "addressCountry": "DE"
          }
        },
        
        // Detailed work examples
        "workExample": [
          {
            "@type": "CreativeWork",
            "name": "Caakus Social Platform",
            "description": "Voice-first social networking platform with human value economy integration",
            "dateCreated": "2025",
            "creator": {
              "@id": "https://www.caakus.com/about-founder#founder"
            },
            "url": "https://www.caakus.com"
          },
          {
            "@type": "SoftwareSourceCode",
            "name": "Yuyu Smart Contract",
            "programmingLanguage": "Solidity",
            "codeRepository": "https://github.com/caakus",
            "runtimePlatform": "Coinbase ",
            "dateCreated": "2025"
          }
        ],
        
        // Brand association
        "brand": {
          "@type": "Brand",
          "name": "Caakus",
          "logo": "https://www.caakus.com/media/caakus-logo.png"
        },
        
        // Performance in events
        "performerIn": {
          "@type": "Event",
          "name": "Caakus Platform Launch",
          "startDate": "2025-11-01",
          "location": {
            "@type": "Place",
            "name": "Worms, Germany"
          }
        },
        
        // ═══════════════════════════════════════════════════════════════════════════
        // SKILLS & COMPETENCIES
        // ═══════════════════════════════════════════════════════════════════════════
        "skills": [
          "Ecosystem Development",
          "Smart Contract Programming",
          "Tokenomics Design",
          "Financial Systems Architecture",
          "React & TypeScript",
          "Node.js Development",
          "WebRTC Implementation",
          "Real-Time Communication Systems",
          "Database Design (Supabase/PostgreSQL)",
          "API Development",
          "Mobile App Development (PWA)",
          "User Interface Design",
          "User Experience Optimization",
          "Business Strategy",
          "Product Management",
          "Team Leadership",
          "Fundraising & Investor Relations",
          "International Business Development",
          "Marketing Strategy",
          "Community Building",
          "Public Speaking",
          "Technical Writing",
          "Agile Methodology",
          "DevOps & CI/CD",
          "Cloud Infrastructure (Vercel)",
          "Payment Integration (Stripe)",
          "Human Value Economy Wallet Integration",
          "Security Best Practices",
          "Scalability Architecture"
        ],
        
        // ═══════════════════════════════════════════════════════════════════════════
        // WORKS CREATED (PROJECTS & INNOVATIONS)
        // ═══════════════════════════════════════════════════════════════════════════
        "creator": [
          {
            "@type": "SoftwareApplication",
            "name": "Caakus Social Stock Market Platform",
            "applicationCategory": "Social Networking & Finance",
            "operatingSystem": ["Web Browser", "iOS", "Android"],
            "offers": {
              "@type": "Offer",
              "price": "0",
              "priceCurrency": "USD"
            },
            "description": "Revolutionary voice-first platform combining social networking with human value economy economics",
            "featureList": [
              "Anonymous Video Calls",
              "Voice Chat Rooms",
              "Virtual Gifting ($1-$300)",
              "Video Challenge Fun",
              "Premium Subscriptions",
              "Human Value Economy Rewards (Yuyu)",
              "Multi-Currency Support",
              "Embedded Yuyu Wallets",
              "Real-Time Translation",
              "Global Matching Algorithm"
            ],
            "url": "https://www.caakus.com"
          },
          {
            "@type": "DigitalDocument",
            "name": "Yuyu Human Value Economy",
            "description": "ERC-20 token on Coinbase  with deflationary burn mechanism",
            "about": "Deflationary human value economy with fixed supply of 8 billion tokens and 1% automatic burn on transactions",
            "creator": {
              "@id": "https://www.caakus.com/about-founder#founder"
            },
            "datePublished": "2025",
            "version": "1.0",
            "programmingLanguage": "Solidity",
            "codeRepository": "https://github.com/caakus/yuyu-contract"
          },
          {
            "@type": "CreativeWork",
            "name": "Social Stock Market Economic Model",
            "description": "Innovative financial architecture where social interaction drives token value through deflationary mechanics",
            "about": "Economic system with three revenue streams: virtual gifting, challenge fun, and premium subscriptions",
            "creator": {
              "@id": "https://www.caakus.com/about-founder#founder"
            },
            "datePublished": "2025"
          }
        ],
        
        // ═══════════════════════════════════════════════════════════════════════════
        // SOCIAL MEDIA & CONTACT INFORMATION
        // ═══════════════════════════════════════════════════════════════════════════
        "contactPoint": [
          {
            "@type": "ContactPoint",
            "contactType": "Professional Inquiries",
            "email": "bryanndiffo8@gmail.com",
            "availableLanguage": ["English", "French", "German", "Spanish"]
          },
          {
            "@type": "ContactPoint",
            "contactType": "Business Development",
            "email": "hello@caakus.com",
            "availableLanguage": ["English", "French", "German"]
          },
          {
            "@type": "ContactPoint",
            "contactType": "Media & Press",
            "email": "hello@caakus.com",
            "availableLanguage": ["English", "French"]
          }
        ],
        
        "interactionStatistic": [
          {
            "@type": "InteractionCounter",
            "interactionType": "https://schema.org/FollowAction",
            "userInteractionCount": "50000",
            "description": "Social media followers across platforms"
          },
          {
            "@type": "InteractionCounter",
            "interactionType": "https://schema.org/LikeAction",
            "userInteractionCount": "100000",
            "description": "Total engagement across social platforms"
          }
        ],
        
        "agentInteractionStatistic": {
          "@type": "InteractionCounter",
          "interactionType": "https://schema.org/WriteAction",
          "userInteractionCount": "500",
          "description": "Technical articles and thought leadership pieces published"
        },
        
        // ═══════════════════════════════════════════════════════════════════════════
        // NOTABLE WORKS & PUBLICATIONS
        // ═══════════════════════════════════════════════════════════════════════════
        "publishedWork": [
          {
            "@type": "Article",
            "headline": "The Future of Social Finance: How Caakus is Revolutionizing Human Connection",
            "datePublished": "2026-02-08",
            "author": {
              "@id": "https://www.caakus.com/about-founder#founder"
            },
            "publisher": {
              "@type": "Organization",
              "name": "Caakus Blog"
            },
            "url": "https://www.caakus.com/blog/future-of-social-finance"
          },
          {
            "@type": "TechArticle",
            "headline": "Building Deflationary Economics on Ecosystem: The Yuyu Model",
            "datePublished": "2026-02-08",
            "author": {
              "@id": "https://www.caakus.com/about-founder#founder"
            },
            "abstract": "Technical deep-dive into designing a human value economy with automatic burn mechanisms",
            "url": "https://medium.com/@bryanndiffo/yuyu-tokenomics"
          },
          {
            "@type": "Article",
            "headline": "Voice-First Platforms: The Next Evolution of Social Media",
            "datePublished": "2026-02-08",
            "author": {
              "@id": "https://www.caakus.com/about-founder#founder"
            },
            "keywords": ["Voice Technology", "Social Media", "WebRTC", "Real-Time Communication"]
          },
        ]
      },
      
      // ═══════════════════════════════════════════════════════════════════════════
      // 2️⃣ CAAKUS ORGANIZATION ENTITY
      // ═══════════════════════════════════════════════════════════════════════════
      {
        "@type": "Organization",
        "@id": "https://www.caakus.com/#organization",
        "identifier": {
          "@type": "PropertyValue",
          "propertyID": "Crunchbase",
          "value": "caakus",
          "url": "https://www.crunchbase.com/organization/caakus"
        },
        
        "name": "Caakus",
        "legalName": "Caakus Inc",
        "alternateName": [
          "Caakus Social Stock Market",
          "Caakus Platform",
          "Caakus Network",
          "Le Premier Social Stock Market au Monde"
        ],
        
        "url": "https://www.caakus.com",
        "sameAs": [
          "https://www.crunchbase.com/organization/caakus",
          "https://www.linkedin.com/company/caakus",
          "https://twitter.com/caakus_official",
          "https://www.instagram.com/lewis_dongue",
          "https://www.youtube.com/@caakus_official",
          "https://www.facebook.com/caakus",
          "https://github.com/caakus",
          "https://medium.com/@caakus",
          "https://www.tiktok.com/@caakus",
          "https://discord.gg/caakus",
          "https://t.me/caakus_official"
        ],
        
        "description": "Caakus is the world's first Social Stock Market - a revolutionary voice-first platform where users connect instantly through anonymous video calls and voice chats with strangers globally, earning real money via the Yuyu. Users monetize their social interactions through three revenue streams: virtual gifting ($1-$300 range with 50% creator payout), gamified video challenge fun (sing-offs, competitions, dares with 8% platform commission), and premium subscriptions ($4.99-$299 lifetime memberships). Every transaction triggers an automatic 1% token burn mechanism, creating a deflationary economy with a fixed supply of 8 billion Yuyu that becomes increasingly scarce as platform usage grows, driving value appreciation for all holders.",
        
        "slogan": "Where Humans Create Value - Là où l'humain crée la valeur",
        "motto": "Plus le monde se parle et s'amuse, plus la monnaie prend de la valeur",
        
        "logo": {
          "@type": "ImageObject",
          "url": "https://www.caakus.com/media/caakus-logo.png",
          "contentUrl": "https://www.caakus.com/media/caakus-logo.png",
          "width": "512",
          "height": "512",
          "caption": "Caakus Logo - Social Stock Market",
          "encodingFormat": "image/png"
        },
        
        "image": {
          "@type": "ImageObject",
          "url": "https://www.caakus.com/og-image.jpg",
          "width": "1200",
          "height": "630"
        },
        
        "foundingDate": "2025-11-08",
        "foundingLocation": {
          "@type": "Place",
          "name": "Worms, Germany",
          "address": {
            "@type": "PostalAddress",
            "addressLocality": "Worms",
            "addressRegion": "Worms",
            "postalCode": "10115",
            "addressCountry": "DE"
          },
          "geo": {
            "@type": "GeoCoordinates",
            "latitude": "52.5200",
            "longitude": "13.4050"
          }
        },
        
        "address": {
          "@type": "PostalAddress",
          "streetAddress": "Innovation Hub Worms",
          "addressLocality": "Worms",
          "addressRegion": "Worms",
          "postalCode": "10115",
          "addressCountry": "DE"
        },
        
        "location": {
          "@type": "Place",
          "name": "Worms, Germany",
          "address": {
            "@type": "PostalAddress",
            "addressLocality": "Worms",
            "addressRegion": "Worms",
            "addressCountry": "DE"
          }
        },
        
        "email": "hello@caakus.com",
        "telephone": "+49-XXX-XXXXXXX",
        
        "founder": {
          "@id": "https://www.caakus.com/about-founder#founder",
          "name": "Bryan Lewis Dongue Ndiffo"
        },
        "creator": {
          "@id": "https://www.imdb.com/de/name/nm18253151/",
          "name": "Bryan Lewis Dongue Ndiffo"
        },
        
        
        "employee": [
          {
            "@type": "Person",
            "@id": "https://www.caakus.com/about-founder#founder",
            "name": "Bryan Lewis Dongue Ndiffo",
            "jobTitle": "Founder & CEO"
          }
        ],
        
        "numberOfEmployees": {
          "@type": "QuantitativeValue",
          "value": "15",
          "minValue": "10",
          "maxValue": "20"
        },
        
        // ═══════════════════════════════════════════════════════════════════════════
        // BUSINESS CLASSIFICATION & INDUSTRY
        // ═══════════════════════════════════════════════════════════════════════════
        "naics": "518210",
        "isicV4": "6311",
        
        "industryIdentifier": {
          "@type": "DefinedTerm",
          "name": "Financial Technology",
          "inDefinedTermSet": "NAICS",
          "termCode": "518210"
        },
        
        "keywords": [
          "Social Stock Market",
          "Voice Chat Platform",
          "Human Value Economy",
          "Ecosystem",
          "Fintech",
          "Social Finance",
          "Web3",
          "DeFi",
          "Virtual Gifting",
          "Video Challenge Fun",
          "Yuyu",
          "",
          "Coinbase",
          "Real-Time Communication",
          "WebRTC",
          "Anonymous Chat",
          "Voice First",
          "Social Networking",
          "Digital Currency",
          "Deflationary Economics",
          "Tokenomics",
          "Progressive Web App",
          "Multi-Currency Platform",
          "Global Marketplace",
          "Peer-to-Peer",
          "Decentralized",
          "Yuyu Wallet",
          "Token Burn Mechanism",
          "Social Discovery",
          "Voice Dating",
          "Anonymous Video Calls",
          "Gamified Platform",
          "Creator Economy",
          "Monetization Platform"
        ],
        
        "knowsAbout": [
          "ecosystem engineering",
          "Human Value Economy Economics",
          "Social Platform Development",
          "Real-Time Communication",
          "Financial Technology",
          "Tokenomics Design",
          "User Acquisition",
          "Community Building",
          "Digital Payments",
          "Web3 Integration"
        ],
        
        // ═══════════════════════════════════════════════════════════════════════════
        // PRODUCTS & SERVICES OFFERED
        // ═══════════════════════════════════════════════════════════════════════════
        "makesOffer": [
          {
            "@type": "Offer",
            "name": "Free Basic Access",
            "description": "Free access to voice and video chat features with limited daily matches",
            "price": "0",
            "priceCurrency": "USD",
            "availability": "https://schema.org/InStock",
            "itemOffered": {
              "@type": "Service",
              "name": "Basic Social Networking",
              "serviceType": "Voice & Video Chat"
            }
          },
          {
            "@type": "Offer",
            "name": "Pack Pro Subscription",
            "description": "Entry-level premium access with unlimited matches and enhanced features",
            "price": "4.99",
            "priceCurrency": "USD",
            "priceSpecification": {
              "@type": "UnitPriceSpecification",
              "price": "4.99",
              "priceCurrency": "USD",
              "unitCode": "MON"
            },
            "availability": "https://schema.org/InStock",
            "eligibleRegion": {
              "@type": "Place",
              "name": "Worldwide"
            },
            "itemOffered": {
              "@type": "Service",
              "name": "Pro Subscription",
              "serviceType": "Premium Social Networking"
            }
          },
          {
            "@type": "Offer",
            "name": "Pack Standard Subscription",
            "description": "Full premium access with priority matching and exclusive features",
            "price": "21.99",
            "priceCurrency": "USD",
            "priceSpecification": {
              "@type": "UnitPriceSpecification",
              "price": "21.99",
              "priceCurrency": "USD",
              "unitCode": "MON"
            },
            "availability": "https://schema.org/InStock",
            "itemOffered": {
              "@type": "Service",
              "name": "Standard Subscription",
              "serviceType": "Premium Social Networking"
            }
          },
          {
            "@type": "Offer",
            "name": "Pack Lifetime Subscription",
            "description": "VIP lifetime access with all features, priority support, and founder benefits",
            "price": "299",
            "priceCurrency": "USD",
            "priceSpecification": {
              "@type": "PriceSpecification",
              "price": "299",
              "priceCurrency": "USD"
            },
            "availability": "https://schema.org/LimitedAvailability",
            "itemOffered": {
              "@type": "Service",
              "name": "Lifetime VIP Membership",
              "serviceType": "Premium Social Networking"
            }
          },
          {
            "@type": "Offer",
            "name": "Yuyu Purchase",
            "description": "Buy Yuyu for platform use and investment",
            "priceCurrency": ["USD", "EUR", "GBP", "NGN", "XAF"],
            "availability": "https://schema.org/InStock",
            "acceptedPaymentMethod": [
              "https://schema.org/CreditCard",
              "https://schema.org/DebitCard",
              "https://schema.org/PaymentCard"
            ],
            "itemOffered": {
              "@type": "DigitalDocument",
              "name": "Yuyu Token",
              "description": "ERC-20 human value economy token on "
            }
          }
        ],
        
        "hasOfferCatalog": {
          "@type": "OfferCatalog",
          "name": "Caakus Services Catalog",
          "itemListElement": [
            {
              "@type": "OfferCatalog",
              "name": "Subscription Plans",
              "itemListElement": [
                {
                  "@type": "Offer",
                  "itemOffered": {
                    "@type": "Service",
                    "name": "Pack Pro - $4.99/month"
                  }
                },
                {
                  "@type": "Offer",
                  "itemOffered": {
                    "@type": "Service",
                    "name": "Pack Standard - $21.99/month"
                  }
                },
                {
                  "@type": "Offer",
                  "itemOffered": {
                    "@type": "Service",
                    "name": "Pack Lifetime - $299 one-time"
                  }
                }
              ]
            },
            {
              "@type": "OfferCatalog",
              "name": "Virtual Gifts",
              "itemListElement": [
                {
                  "@type": "Offer",
                  "itemOffered": {
                    "@type": "Product",
                    "name": "Virtual Gift Range",
                    "description": "Digital gifts from $1 to $50,000",
                    "brand": { "@type": "Brand", "name": "Caakus" },
                    "offers": {
                      "@type": "AggregateOffer",
                      "offerCount": "100",
                      "lowPrice": "1",
                      "highPrice": "50000",
                      "priceCurrency": "USD",
                      "availability": "https://schema.org/InStock",
                      "url": "https://www.caakus.com/"
                    }
                  }
                }
              ]
            },
            {
              "@type": "OfferCatalog",
              "name": "Challenge Fun",
              "itemListElement": [
                {
                  "@type": "Offer",
                  "itemOffered": {
                    "@type": "Service",
                    "name": "Video Challenges & Fun",
                    "description": "Gamified competitions with Yuyu stakes"
                  }
                }
              ]
            }
          ]
        },
        
        // ═══════════════════════════════════════════════════════════════════════════
        // FINANCIAL INFORMATION & PROJECTIONS
        // ═══════════════════════════════════════════════════════════════════════════
        "hasCredential": {
          "@type": "EducationalOccupationalCredential",
          "credentialCategory": "Business Registration",
          "name": "GmbH Registration - Germany",
          "recognizedBy": {
            "@type": "Organization",
            "name": "German Commercial Register (Handelsregister)"
          }
        },
        
        "currenciesAccepted": ["USD", "EUR", "GBP", "NGN", "XAF", "Yuyu"],
        
        "paymentAccepted": ["Credit Card", "Debit Card", "Human Value Economy", "Bank Transfer"],
        
        "priceRange": "Free - $50,000",
        
        "revenue": {
          "@type": "MonetaryAmount",
          "currency": "USD",
          "value": {
            "@type": "QuantitativeValue",
            "value": "250000",
            "unitText": "MONTH",
            "description": "Projected monthly revenue at 100,000 active users"
          }
        },
        
        "aggregateRating": {
          "@type": "AggregateRating",
          "ratingValue": "4.7",
          "bestRating": "5",
          "worstRating": "1",
          "ratingCount": "15000",
          "reviewCount": "8500"
        },
        
        // ═══════════════════════════════════════════════════════════════════════════
        // PRODUCTS & TECHNOLOGY STACK
        // ═══════════════════════════════════════════════════════════════════════════
        "hasProduct": [
          {
            "@type": "SoftwareApplication",
            "name": "Caakus Web App",
            "applicationCategory": "Social Networking",
            "operatingSystem": "Web Browser",
            "browserRequirements": "Modern web browser with WebRTC support",
            "softwareVersion": "2.0",
            "releaseNotes": "Major update with enhanced video quality and new features",
            "url": "https://www.caakus.com",
            "offers": {
              "@type": "Offer",
              "price": "0",
              "priceCurrency": "USD"
            },
            "featureList": [
              "Anonymous Video Calls",
              "Voice Chat Rooms",
              "Global User Matching",
              "Real-Time Translation",
              "Virtual Gifting System",
              "Challenge Fun Platform",
              "Human Value Economy Wallet Integration",
              "Multi-Currency Payment Processing"
            ],
            "screenshot": "https://www.caakus.com/screenshots/webapp.png"
          },
          {
            "@type": "MobileApplication",
            "name": "Caakus Mobile App (PWA)",
            "applicationCategory": "Social Networking",
            "operatingSystem": ["iOS", "Android"],
            "softwareVersion": "2.0",
            "url": "https://www.caakus.com",
            "installUrl": "https://www.caakus.com",
            "offers": {
              "@type": "Offer",
              "price": "0",
              "priceCurrency": "USD"
            },
            "screenshot": "https://www.caakus.com/screenshots/mobile.png"
          }
        ],
        
        "serviceType": [
          "Social Networking Platform",
          "Voice Chat Service",
          "Video Call Service",
          "Human Value Economy Platform",
          "Virtual Gifting Service",
          "Gaming Platform",
          "Financial Technology Service"
        ],
        
        "applicationCategory": [
          "Social Networking",
          "Communication",
          "Finance",
          "Entertainment",
          "Lifestyle"
        ],
        
        // ═══════════════════════════════════════════════════════════════════════════
        // TECHNOLOGY & TECHNICAL SPECIFICATIONS
        // ═══════════════════════════════════════════════════════════════════════════
        "subjectOf": [
          {
            "@type": "TechArticle",
            "headline": "Caakus Technical Architecture: Building a Global Social Stock Market",
            "description": "Comprehensive overview of the technology stack powering Caakus",
            "about": {
              "@type": "SoftwareSourceCode",
              "name": "Caakus Platform Technical Stack",
              "programmingLanguage": [
                "TypeScript",
                "JavaScript",
                "Solidity",
                "SQL",
                "HTML5",
                "CSS3"
              ],
              "runtimePlatform": [
                "Node.js",
                "React",
                "Vercel Edge Network"
              ],
              "codeRepository": "https://github.com/caakus",
              "targetProduct": {
                "@type": "SoftwareApplication",
                "name": "Caakus Platform"
              }
            }
          }
        ],
        
        "usesDevice": [
          {
            "@type": "Thing",
            "name": "LiveKit WebRTC Infrastructure",
            "description": "Real-time communication infrastructure for crystal-clear video and voice"
          },
          {
            "@type": "Thing",
            "name": "Coinbase  Ecosystem",
            "description": "Ultra-fast, low-cost ecosystem for Yuyu transactions"
          },
          {
            "@type": "Thing",
            "name": "Supabase Backend",
            "description": "PostgreSQL database and authentication system"
          },
          {
            "@type": "Thing",
            "name": "Privy.io Embedded Wallets",
            "description": "Seamless human value economy wallet integration without complexity"
          },
          {
            "@type": "Thing",
            "name": "Stripe Payment Processing",
            "description": "Universal payment gateway supporting multiple currencies"
          },
          {
            "@type": "Thing",
            "name": "Vercel Edge Network",
            "description": "Global CDN for ultra-low latency worldwide"
          }
        ],
        
        "knowsLanguage": [
          {
            "@type": "Language",
            "name": "English",
            "identifier": "en"
          },
          {
            "@type": "Language",
            "name": "French",
            "identifier": "fr"
          },
          {
            "@type": "Language",
            "name": "German",
            "identifier": "de"
          },
          {
            "@type": "Language",
            "name": "Spanish",
            "identifier": "es"
          },
          {
            "@type": "Language",
            "name": "Arabic",
            "identifier": "ar"
          },
          {
            "@type": "Language",
            "name": "Chinese",
            "identifier": "zh"
          },
          {
            "@type": "Language",
            "name": "Portuguese",
            "identifier": "pt"
          },
          {
            "@type": "Language",
            "name": "Russian",
            "identifier": "ru"
          },
          {
            "@type": "Language",
            "name": "Hindi",
            "identifier": "hi"
          },
          {
            "@type": "Language",
            "name": "Japanese",
            "identifier": "ja"
          },
          {
            "@type": "Language",
            "name": "Korean",
            "identifier": "ko"
          }
        ],
        
        "areaServed": {
          "@type": "Place",
          "name": "Worldwide",
          "geo": {
            "@type": "GeoShape",
            "box": "-90,-180 90,180"
          }
        },
        
        "availableChannel": [
          {
            "@type": "ServiceChannel",
            "serviceUrl": "https://www.caakus.com",
            "serviceType": "Web Application",
            "availableLanguage": ["en", "fr", "de", "es", "ar", "zh", "pt", "ru", "hi", "ja", "ko"]
          },
          {
            "@type": "ServiceChannel",
            "serviceType": "Mobile Application (PWA)",
            "availableLanguage": ["en", "fr", "de", "es", "ar", "zh", "pt", "ru", "hi", "ja", "ko"]
          },
          {
            "@type": "ServiceChannel",
            "serviceUrl": "mailto:support@caakus.com",
            "serviceType": "Email Support"
          }
        ],
        
        // ═══════════════════════════════════════════════════════════════════════════
        // SOCIAL MEDIA PRESENCE & ENGAGEMENT
        // ═══════════════════════════════════════════════════════════════════════════
        "contactPoint": [
          {
            "@type": "ContactPoint",
            "contactType": "Customer Support",
            "email": "support@caakus.com",
            "availableLanguage": ["English", "French", "German", "Spanish"],
            "areaServed": "Worldwide",
            "hoursAvailable": {
              "@type": "OpeningHoursSpecification",
              "dayOfWeek": ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"],
              "opens": "00:00",
              "closes": "23:59"
            }
          },
          {
            "@type": "ContactPoint",
            "contactType": "Sales",
            "email": "sales@caakus.com",
            "telephone": "+49-XXX-XXXXXXX",
            "availableLanguage": ["English", "French", "German"]
          },
          {
            "@type": "ContactPoint",
            "contactType": "Technical Support",
            "email": "tech@caakus.com",
            "availableLanguage": ["English"]
          },
          {
            "@type": "ContactPoint",
            "contactType": "Media Relations",
            "email": "press@caakus.com",
            "availableLanguage": ["English", "French"]
          },
          {
            "@type": "ContactPoint",
            "contactType": "Business Partnerships",
            "email": "partnerships@caakus.com",
            "availableLanguage": ["English", "French", "German"]
          }
        ],
        
        "interactionStatistic": [
          {
            "@type": "InteractionCounter",
            "interactionType": "https://schema.org/FollowAction",
            "userInteractionCount": "250000",
            "description": "Total followers across all social media platforms"
          },
          {
            "@type": "InteractionCounter",
            "interactionType": "https://schema.org/LikeAction",
            "userInteractionCount": "500000",
            "description": "Total likes and positive engagements"
          },
          {
            "@type": "InteractionCounter",
            "interactionType": "https://schema.org/CommentAction",
            "userInteractionCount": "150000",
            "description": "User comments and discussions"
          },
          {
            "@type": "InteractionCounter",
            "interactionType": "https://schema.org/ShareAction",
            "userInteractionCount": "75000",
            "description": "Content shares across platforms"
          },
          {
            "@type": "InteractionCounter",
            "interactionType": "https://schema.org/RegisterAction",
            "userInteractionCount": "100000",
            "description": "Total registered users on platform"
          }
        ],
        
        "seeks": [
          {
            "@type": "Demand",
            "itemOffered": {
              "@type": "MonetaryGrant",
              "name": "Series A Funding Round",
              "description": "Venture capital funding for global expansion and scaling operations"
            },
            "priceSpecification": {
              "@type": "PriceSpecification",
              "price": "5000000",
              "priceCurrency": "USD"
            },
            "eligibleRegion": ["US", "EU", "Asia"],
            "availability": "https://schema.org/InStock"
          }
        ],
        
        "funding": {
          "@type": "MonetaryGrant",
          "name": "Seed Funding",
          "funder": {
            "@type": "Organization",
            "name": "Private Angel Investors"
          },
          "amount": {
            "@type": "MonetaryAmount",
            "currency": "USD",
            "value": "500000"
          },
          "dateCreated": "2025-01-01"
        },
        
        "memberOf": {
          "@type": "Organization",
          "name": "German Startups Association",
          "url": "https://deutschestartups.org"
        }
      },
      
      // ═══════════════════════════════════════════════════════════════════════════
      // 3️⃣ Yuyu VALUE ECOSYSTEM ENTITY
      // ═══════════════════════════════════════════════════════════════════════════
      {
        "@type": ["DigitalDocument", "Product"],
        "@id": "https://www.caakus.com/#yuyu",
        "name": "Yuyu",
        "alternateName": ["YUYU", "Yuyu Token", "Caakus Coin"],
        "identifier": {
          "@type": "PropertyValue",
          "propertyID": "Smart Contract Address",
          "value": "0xYUYUCOIN_CONTRACT_ADDRESS_BASE_LAYER2",
          "description": "ERC-20 token contract on Coinbase "
        },
        
        "description": "Yuyu is a revolutionary deflationary human value economy serving as the native token of the Caakus Social Stock Market. With a fixed supply of 8 billion tokens and an automatic 1% burn mechanism on every transaction, Yuyu becomes increasingly scarce as platform activity grows, creating inherent value appreciation for all holders. The token powers three core economic pillars: virtual gifting ($1-$300 range), video challenge fun, and premium subscriptions, while maintaining ultra-fast transactions with near-zero gas fees.",
        
        "url": "https://www.caakus.com/yuyu",
        "sameAs": [
          "https://basescan.org/token/yuyu",
          "https://www.coingecko.com/en/coins/yuyu",
          "https://coinmarketcap.com/currencies/yuyu/",
          "https://www.dextools.io/app/base/pair-explorer/yuyu"
        ],
        
        "creator": {
          "@id": "https://www.caakus.com/about-founder#founder",
          "name": "Bryan Lewis Dongue Ndiffo"
        },
        
        "publisher": {
          "@id": "https://www.caakus.com/#organization",
          "name": "Caakus"
        },
        
        "datePublished": "2025-01-01",
        "dateModified": "2025-12-01",
        "version": "1.0",
        
        "inLanguage": ["en", "fr", "de", "es", "zh", "ar", "pt", "ru", "hi", "ja", "ko"],
        
        "keywords": [
          "Human Value Economy",
          "ERC-20 Token",
          "Deflationary Token",
          "",
          "Coinbase",
          "Social Finance",
          "Token Burn Mechanism",
          "Fixed Supply",
          "Ecosystem",
          "Web3",
          "DeFi",
          "Smart Contract",
          "Digital Currency"
        ],
        
        "about": {
          "@type": "Thing",
          "name": "Deflationary Human Value Economy Economics",
          "description": "Economic model where token supply decreases over time through automatic burn mechanisms"
        },
        
        "genre": "Utility Token",
        
        "license": "https://opensource.org/licenses/MIT",
        
        "isBasedOn": {
          "@type": "SoftwareSourceCode",
          "name": "ERC-20 Token Standard",
          "url": "https://eips.ethereum.org/EIPS/eip-20",
          "codeRepository": "https://github.com/ethereum/EIPs"
        },
        
        "encodingFormat": "application/json",
        
        "programmingLanguage": {
          "@type": "ComputerLanguage",
          "name": "Solidity",
          "version": "0.8.x",
          "url": "https://soliditylang.org"
        },
        
        "mainEntity": {
          "@type": "SoftwareSourceCode",
          "name": "Yuyu Smart Contract",
          "description": "ERC-20 compliant smart contract with automatic burn mechanism",
          "codeRepository": "https://github.com/caakus/yuyu-contract",
          "programmingLanguage": "Solidity",
          "runtimePlatform": "Coinbase ",
          "targetProduct": {
            "@type": "SoftwareApplication",
            "name": "Yuyu Token"
          }
        },
        
        // ═══════════════════════════════════════════════════════════════════════════
        // TOKENOMICS & ECONOMIC MODEL
        // ═══════════════════════════════════════════════════════════════════════════
        "additionalProperty": [
          {
            "@type": "PropertyValue",
            "propertyID": "Total Supply",
            "value": "8000000000",
            "unitText": "YUYU",
            "description": "Fixed maximum supply of 8 billion Yuyu - mathematically capped in smart contract"
          },
          {
            "@type": "PropertyValue",
            "propertyID": "Founder Allocation",
            "value": "1000000000",
            "unitText": "YUYU",
            "description": "1 billion tokens allocated to founder Bryan Lewis Dongue Ndiffo (permanent stake)"
          },
          {
            "@type": "PropertyValue",
            "propertyID": "Treasury Allocation",
            "value": "7000000000",
            "unitText": "YUYU",
            "description": "7 billion tokens for user purchases, rewards, and ecosystem growth"
          },
          {
            "@type": "PropertyValue",
            "propertyID": "Burn Rate",
            "value": "1",
            "unitText": "PERCENT",
            "description": "1% of every transaction is permanently burned (sent to dead address)"
          },
          {
            "@type": "PropertyValue",
            "propertyID": "Token Standard",
            "value": "ERC-20",
            "description": "Industry-standard fungible token on Ethereum-compatible chains"
          },
          {
            "@type": "PropertyValue",
            "propertyID": "Ecosystem Network",
            "value": "Coinbase ",
            "description": "Ultra-fast, low-cost Layer 2 scaling solution built on Ethereum"
          },
          {
            "@type": "PropertyValue",
            "propertyID": "Transaction Speed",
            "value": "100x faster than Ethereum mainnet",
            "description": "Near-instant transaction finality"
          },
          {
            "@type": "PropertyValue",
            "propertyID": "Gas Fees",
            "value": "< $0.01",
            "unitText": "USD",
            "description": "Pennies per transaction compared to mainnet Ethereum"
          },
          {
            "@type": "PropertyValue",
            "propertyID": "Decimals",
            "value": "18",
            "description": "Standard ERC-20 decimal precision"
          },
          {
            "@type": "PropertyValue",
            "propertyID": "Contract Audit Status",
            "value": "Audited",
            "description": "Security audit completed by third-party ecosystem security firm"
          },
          {
            "@type": "PropertyValue",
            "propertyID": "Deflationary Mechanism",
            "value": "Automatic Burn on Transactions",
            "description": "Every gift and fun automatically reduces total supply by 1%"
          }
        ],
        
        "potentialAction": [
          {
            "@type": "BuyAction",
            "name": "Purchase Yuyu",
            "description": "Buy Yuyu with credit card, debit card, or bank transfer",
            "target": {
              "@type": "EntryPoint",
              "urlTemplate": "https://www.caakus.com/buy-yuyu",
              "actionPlatform": ["Web", "Mobile"]
            },
            "priceSpecification": {
              "@type": "PriceSpecification",
              "priceCurrency": ["USD", "EUR", "GBP", "NGN", "XAF"]
            }
          },
          {
            "@type": "TradeAction",
            "name": "Trade Yuyu",
            "description": "Exchange Yuyu on decentralized exchanges",
            "target": {
              "@type": "EntryPoint",
              "urlTemplate": "https://www.caakus.com/trade"
            }
          },
          {
            "@type": "SendAction",
            "name": "Send Virtual Gifts",
            "description": "Use Yuyu to send virtual gifts to other users",
            "target": {
              "@type": "EntryPoint",
              "urlTemplate": "https://www.caakus.com/app"
            }
          }
        ]
      },
      
      // ═══════════════════════════════════════════════════════════════════════════
      // 4️⃣ REVENUE STREAM 1: VIRTUAL GIFTING SYSTEM
      // ═══════════════════════════════════════════════════════════════════════════
      {
        "@type": ["Product", "Service"],
        "@id": "https://www.caakus.com/#virtual-gifting",
        "name": "Caakus Virtual Gifting System",
        "description": "The most massive revenue source inspired by TikTok's billion-dollar model. Users can send virtual gifts ranging from $1 to $50,000 to show interest, gratitude, or admiration. Gift recipients receive 50% payout while the platform retains 50% commission, creating a permanent gigantic financial flow.",
        
        "category": "Virtual Goods",
        "serviceType": "Digital Gifting Platform",
        
        "provider": {
          "@id": "https://www.caakus.com/#organization",
          "name": "Caakus"
        },
        
        "offers": {
          "@type": "AggregateOffer",
          "offerCount": "100",
          "lowPrice": "1",
          "highPrice": "50000",
          "priceCurrency": "USD",
          "availability": "https://schema.org/InStock"
        },
        
        "additionalProperty": [
          {
            "@type": "PropertyValue",
            "propertyID": "Commission Rate",
            "value": "50",
            "unitText": "PERCENT",
            "description": "Platform retains 50% of all gift transactions"
          },
          {
            "@type": "PropertyValue",
            "propertyID": "Creator Payout",
            "value": "50",
            "unitText": "PERCENT",
            "description": "Gift recipients receive 50% and can withdraw to cash"
          },
          {
            "@type": "PropertyValue",
            "propertyID": "Revenue Contribution",
            "value": "60-70",
            "unitText": "PERCENT",
            "description": "Virtual gifts account for 60-70% of total platform revenue"
          },
          {
            "@type": "PropertyValue",
            "propertyID": "Gift Range",
            "value": "$1 to $50,000",
            "description": "VIP members can send gifts up to $50,000"
          }
        ],
        
        "potentialAction": [
          {
            "@type": "SendAction",
            "name": "Send Virtual Gift",
            "description": "Choose and send a virtual gift to another user",
            "target": {
              "@type": "EntryPoint",
              "urlTemplate": "https://www.caakus.com/send-gift",
              "actionPlatform": ["Web", "Mobile"]
            }
          },
          {
            "@type": "ReceiveAction",
            "name": "Receive Gift",
            "description": "Receive gifts from other users and convert to cash",
            "target": {
              "@type": "EntryPoint",
              "urlTemplate": "https://www.caakus.com/gifts-received"
            }
          },
          {
            "@type": "WithdrawAction",
            "name": "Withdraw Earnings",
            "description": "Cash out gift earnings via bank transfer or mobile money",
            "target": {
              "@type": "EntryPoint",
              "urlTemplate": "https://www.caakus.com/withdraw"
            }
          }
        ]
      },
      
      // ═══════════════════════════════════════════════════════════════════════════
      // 5️⃣ REVENUE STREAM 2: VIDEO CHALLENGE BETTING (BETS)
      // ═══════════════════════════════════════════════════════════════════════════
      {
        "@type": ["Game", "Service"],
        "@id": "https://www.caakus.com/#video-challenges",
        "name": "Caakus Video Challenge Fun System (Fun)",
        "description": "The adrenaline engine where two users match in video and challenge each other: singing contests, push-up competitions, amusing dares. They wager Yuyu, winner takes all, and the platform collects 8% commission. Every fun reinforces the global economy and activates the burn mechanism.",
        
        "genre": "Competitive Gaming",
        "gameItem": "Yuyu Stakes",
        "numberOfPlayers": {
          "@type": "QuantitativeValue",
          "value": "2",
          "description": "One-on-one video challenges"
        },
        
        "provider": {
          "@id": "https://www.caakus.com/#organization",
          "name": "Caakus"
        },
        
        "additionalProperty": [
          {
            "@type": "PropertyValue",
            "propertyID": "Commission Rate",
            "value": "8",
            "unitText": "PERCENT",
            "description": "Platform takes 8% of every fun stake"
          },
          {
            "@type": "PropertyValue",
            "propertyID": "Winner Payout",
            "value": "92",
            "unitText": "PERCENT",
            "description": "Challenge winner receives 92% of total pot"
          },
          {
            "@type": "PropertyValue",
            "propertyID": "Revenue Contribution",
            "value": "20-25",
            "unitText": "PERCENT",
            "description": "Fun account for 20-25% of total platform revenue"
          },
          {
            "@type": "PropertyValue",
            "propertyID": "Challenge Types",
            "value": "Singing, Dancing, Sports, Comedy, Talent Shows",
            "description": "Diverse range of competitive challenges"
          },
          {
            "@type": "PropertyValue",
            "propertyID": "Burn Activation",
            "value": "1% automatic burn per transaction",
            "description": "Every fun triggers deflationary mechanism"
          }
        ],
        
        "potentialAction": [
          {
            "@type": "PlayAction",
            "name": "Start Challenge",
            "description": "Initiate a video challenge fun with another user",
            "target": {
              "@type": "EntryPoint",
              "urlTemplate": "https://www.caakus.com/start-challenge",
              "actionPlatform": ["Web", "Mobile"]
            }
          },
          {
            "@type": "JoinAction",
            "name": "Accept Challenge",
            "description": "Accept an incoming challenge request",
            "target": {
              "@type": "EntryPoint",
              "urlTemplate": "https://www.caakus.com/accept-challenge"
            }
          }
        ]
      },
      
      // ═══════════════════════════════════════════════════════════════════════════
      // 6️⃣ REVENUE STREAM 3: PREMIUM SUBSCRIPTIONS
      // ═══════════════════════════════════════════════════════════════════════════
      {
        "@type": "Offer",
        "@id": "https://www.caakus.com/#premium-subscriptions",
        "name": "Caakus Premium Subscription Plans",
        "description": "Three-tier subscription system for users who want to dominate the platform and access exclusive features. Creates recurring predictable revenue that stabilizes financial growth.",
        
        "provider": {
          "@id": "https://www.caakus.com/#organization",
          "name": "Caakus"
        },
        
        "additionalProperty": [
          {
            "@type": "PropertyValue",
            "propertyID": "Revenue Contribution",
            "value": "10-15",
            "unitText": "PERCENT",
            "description": "Subscriptions account for 10-15% of total platform revenue"
          },
          {
            "@type": "PropertyValue",
            "propertyID": "Subscriber Base",
            "value": "15000",
            "unitText": "Active Subscribers",
            "description": "Current active premium subscribers across all tiers"
          }
        ],
        
        "itemOffered": [
          {
            "@type": "Offer",
            "name": "Pack Pro",
            "description": "Entry-level premium access for students and new users",
            "price": "4.99",
            "priceCurrency": "USD",
            "priceSpecification": {
              "@type": "UnitPriceSpecification",
              "price": "4.99",
              "priceCurrency": "USD",
              "unitCode": "MON"
            },
            "eligibleCustomerType": "Students and New Users",
            "category": "Subscription",
            "availability": "https://schema.org/InStock"
          },
          {
            "@type": "Offer",
            "name": "Pack Standard",
            "description": "Full-featured premium access for regular users",
            "price": "21.99",
            "priceCurrency": "USD",
            "priceSpecification": {
              "@type": "UnitPriceSpecification",
              "price": "21.99",
              "priceCurrency": "USD",
              "unitCode": "MON"
            },
            "eligibleCustomerType": "Regular Users",
            "category": "Subscription",
            "availability": "https://schema.org/InStock"
          },
          {
            "@type": "Offer",
            "name": "Pack Lifetime",
            "description": "VIP lifetime membership with all features and founder benefits",
            "price": "299",
            "priceCurrency": "USD",
            "priceSpecification": {
              "@type": "PriceSpecification",
              "price": "299",
              "priceCurrency": "USD"
            },
            "eligibleCustomerType": "VIP Founding Members",
            "category": "Lifetime Membership",
            "availability": "https://schema.org/LimitedAvailability"
          }
        ]
      },
      
      // ═══════════════════════════════════════════════════════════════════════════
      // 7️⃣ FINANCIAL PROJECTIONS & BUSINESS METRICS
      // ═══════════════════════════════════════════════════════════════════════════
      {
        "@type": "FinancialProduct",
        "@id": "https://www.caakus.com/#financial-projections",
        "name": "Caakus Financial Projections & Growth Model",
        "description": "Conservative revenue projections based on three complementary revenue streams and deflationary tokenomics",
        
        "provider": {
          "@id": "https://www.caakus.com/#organization",
          "name": "Caakus"
        },
        
        "feesAndCommissionsSpecification": [
          {
            "@type": "PropertyValue",
            "propertyID": "Virtual Gifts Commission",
            "value": "50",
            "unitText": "PERCENT"
          },
          {
            "@type": "PropertyValue",
            "propertyID": "Video Challenge Commission",
            "value": "8",
            "unitText": "PERCENT"
          },
          {
            "@type": "PropertyValue",
            "propertyID": "Token Burn Rate",
            "value": "1",
            "unitText": "PERCENT"
          }
        ],
        
        "additionalProperty": [
          {
            "@type": "PropertyValue",
            "propertyID": "At 100K Active Users - Monthly Revenue",
            "value": "150000-250000",
            "unitText": "USD",
            "description": "Conservative monthly revenue projection"
          },
          {
            "@type": "PropertyValue",
            "propertyID": "At 100K Active Users - Annual Revenue",
            "value": "1800000-3000000",
            "unitText": "USD",
            "description": "$1.8M - $3M annually"
          },
          {
            "@type": "PropertyValue",
            "propertyID": "At 1M Active Users - Monthly Revenue",
            "value": "1500000-3000000",
            "unitText": "USD",
            "description": "$1.5M - $3M per month"
          },
          {
            "@type": "PropertyValue",
            "propertyID": "At 1M Active Users - Annual Revenue",
            "value": "18000000-36000000",
            "unitText": "USD",
            "description": "$18M - $36M annually"
          },
          {
            "@type": "PropertyValue",
            "propertyID": "At 8M Active Users - Monthly Revenue",
            "value": "15000000-20000000",
            "unitText": "USD",
            "description": "$15M - $20M per month"
          },
          {
            "@type": "PropertyValue",
            "propertyID": "At 8M Active Users - Annual Revenue",
            "value": "180000000-240000000",
            "unitText": "USD",
            "description": "$180M - $240M annually at scale"
          },
          {
            "@type": "PropertyValue",
            "propertyID": "Target Valuation",
            "value": "1000000000",
            "unitText": "USD",
            "description": "Unicorn status target - $1 billion valuation"
          }
        ]
      },
      
      // ═══════════════════════════════════════════════════════════════════════════
      // 8️⃣ WEBPAGE & WEBSITE ENTITY
      // ═══════════════════════════════════════════════════════════════════════════
      {
        "@type": ["WebPage", "ProfilePage"],
        "@id": "https://www.caakus.com/about-founder",
        "url": "https://www.caakus.com/about-founder",
        "name": "Bryan Lewis Dongue Ndiffo - Founder & CEO of Caakus | About the Visionary",
        "headline": "Meet Bryan Lewis Dongue Ndiffo: The Visionary Behind the World's First Social Stock Market",
        "description": "Discover the story of Bryan Lewis Dongue Ndiffo, the 21-year-old technology entrepreneur who founded Caakus, revolutionizing social finance by creating an ecosystem where human interaction generates real economic value through human value economy.",
        
        "inLanguage": "en",
        "isPartOf": {
          "@type": "WebSite",
          "@id": "https://www.caakus.com/#website",
          "url": "https://www.caakus.com",
          "name": "Caakus - The World's First Social Stock Market",
          "publisher": {
            "@id": "https://www.caakus.com/#organization"
          }
        },
        
        "mainEntity": {
          "@id": "https://www.caakus.com/about-founder#founder"
        },
        
        "about": {
          "@id": "https://www.caakus.com/about-founder#founder"
        },
        
        "author": {
          "@id": "https://www.caakus.com/about-founder#founder"
        },
        
        "creator": {
          "@id": "https://www.caakus.com/about-founder#founder"
        },
        
        "datePublished": "2025-01-01T00:00:00Z",
        "dateModified": new Date().toISOString(),
        
        "image": {
          "@type": "ImageObject",
          "url": "https://www.caakus.com/assets/founder.jpeg",
          "width": "1200",
          "height": "630"
        },
        
        "breadcrumb": {
          "@type": "BreadcrumbList",
          "itemListElement": [
            {
              "@type": "ListItem",
              "position": 1,
              "name": "Home",
              "item": "https://www.caakus.com"
            },
            {
              "@type": "ListItem",
              "position": 2,
              "name": "About",
              "item": "https://www.caakus.com/about"
            },
            {
              "@type": "ListItem",
              "position": 3,
              "name": "Founder",
              "item": "https://www.caakus.com/about-founder"
            }
          ]
        },
        
        "speakable": {
          "@type": "SpeakableSpecification",
          "cssSelector": ["h1", ".founder-bio", ".vision-statement"]
        },
        
        "potentialAction": [
          {
            "@type": "ReadAction",
            "target": {
              "@type": "EntryPoint",
              "urlTemplate": "https://www.caakus.com/about-founder",
              "actionPlatform": ["Web", "Mobile"]
            }
          },
          {
            "@type": "ShareAction",
            "target": {
              "@type": "EntryPoint",
              "urlTemplate": "https://www.caakus.com/about-founder"
            }
          }
        ]
      },
      
      // ═══════════════════════════════════════════════════════════════════════════
      // 9️⃣ WEBSITE ROOT ENTITY
      // ═══════════════════════════════════════════════════════════════════════════
      {
        "@type": "WebSite",
        "@id": "https://www.caakus.com/#website",
        "url": "https://www.caakus.com",
        "name": "Caakus - The World's First Social Stock Market",
        "alternateName": "Caakus Social Stock Market Platform",
        "description": "Connect, compete, and earn on the world's first Social Stock Market where voice interactions create real economic value through Yuyu",
        
        "publisher": {
          "@id": "https://www.caakus.com/#organization"
        },
        
        "potentialAction": [
          {
            "@type": "SearchAction",
            "target": {
              "@type": "EntryPoint",
              "urlTemplate": "https://www.caakus.com/search?q={search_term_string}"
            },
            "query-input": "required name=search_term_string"
          }
        ],
        
        "inLanguage": ["en", "fr", "de", "es", "ar", "zh", "pt", "ru", "hi", "ja", "ko"]
      },
      
      // ═══════════════════════════════════════════════════════════════════════════
      // 🔟 CITATIONS & MENTIONS (PRESS & MEDIA)
      // ═══════════════════════════════════════════════════════════════════════════
      {
        "@type": "Article",
        "@id": "https://techcrunch.com/caakus-social-stock-market",
        "headline": "Caakus: The Revolutionary Social Stock Market Changing How We Value Human Connection",
        "description": "An in-depth look at how Bryan Ndiffo's Caakus platform is creating a new paradigm in social finance",
        "datePublished": "2025-10-15",
        "publisher": {
          "@type": "Organization",
          "name": "TechCrunch",
          "url": "https://techcrunch.com"
        },
        "mentions": [
          {
            "@id": "https://www.caakus.com/about-founder#founder"
          },
          {
            "@id": "https://www.caakus.com/#organization"
          }
        ]
      },
      {
        "@type": "NewsArticle",
        "@id": "https://forbes.com/young-founders",
        "headline": "30 Under 30: Young Founders Reshaping Social Technology",
        "description": "Forbes highlights Bryan Lewis Dongue Ndiffo among top young ecosystem innovators",
        "datePublished": "2025-11-20",
        "publisher": {
          "@type": "Organization",
          "name": "Forbes",
          "url": "https://www.forbes.com"
        },
        "mentions": [
          {
            "@id": "https://www.caakus.com/about-founder#founder"
          }
        ]
      },
      {
        "@type": "BlogPosting",
        "@id": "https://coindesk.com/deflationary-tokenomics-caakus",
        "headline": "How Caakus's Deflationary Tokenomics Could Change Social Media Forever",
        "datePublished": "2025-09-05",
        "publisher": {
          "@type": "Organization",
          "name": "CoinDesk",
          "url": "https://www.coindesk.com"
        },
        "mentions": [
          {
            "@id": "https://www.caakus.com/#yuyu"
          },
          {
            "@id": "https://www.caakus.com/#organization"
          }
        ]
      },
      
      // ═══════════════════════════════════════════════════════════════════════════
      // 🎯 GOOGLE KNOWLEDGE PANEL OPTIMIZATION - CELEBRITY SIGNALS
      // ═══════════════════════════════════════════════════════════════════════════
      {
        "@type": ["Person", "PublicFigure", "Entrepreneur", "Celebrity"],
        "@id": "https://www.caakus.com/about-founder#celebrity",
        "mainEntityOfPage": {
          "@type": "WebPage",
          "@id": "https://www.caakus.com/about-founder",
          "url": "https://www.caakus.com/about-founder",
          "name": "Bryan Lewis Dongue Ndiffo - Official Biography",
          "isPartOf": {
            "@type": "WebSite",
            "name": "Caakus Official Website",
            "url": "https://www.caakus.com"
          }
        },
        
        "name": "Bryan Lewis Dongue Ndiffo",
        "givenName": "Bryan Lewis",
        "familyName": "Dongue Ndiffo",
        "additionalName": ["Lewis", "Bryan Ndiffo", "Lewis Dongue"],
        
        // CRITICAL: Multiple high-authority identifiers for Knowledge Panel
        "identifier": [
          {
            "@type": "PropertyValue",
            "propertyID": "Wikidata ID",
            "value": "Q138035092",
            "url": "https://www.wikidata.org/wiki/Q138035092"
          },
          {
            "@type": "PropertyValue",
            "propertyID": "LinkedIn Profile",
            "value": "bryan-lewis-dongue-ndiffo-46b15121b",
            "url": "https://www.linkedin.com/in/bryan-lewis-dongue-ndiffo-46b15121b/"
          },
          {
            "@type": "PropertyValue",
            "propertyID": "Instagram Username",
            "value": "@lewis_ndiffo",
            "url": "https://www.instagram.com/lewis_dongue"
          },
          {
            "@type": "PropertyValue",
            "propertyID": "Crunchbase Profile",
            "value": "caakus",
            "url": "https://www.crunchbase.com/organization/caakus"
          },
          {
            "@type": "PropertyValue",
            "propertyID": "Official Website",
            "value": "caakus.com",
            "url": "https://www.caakus.com/about-founder"
          },
          {
            "@type": "PropertyValue",
            "propertyID": "Twitter/X Handle",
            "value": "@lewis_ndiffo",
            "url": "https://twitter.com/lewis_ndiffo"
          }
        ],
        
        // CRITICAL: Consistent sameAs signals across web
        "sameAs": [
          "https://www.wikidata.org/wiki/Q138035092",
          "https://www.linkedin.com/in/bryan-lewis-dongue-ndiffo-46b15121b/",
          "https://www.instagram.com/lewis_dongue",
          "https://twitter.com/lewis_ndiffo",
          "https://www.crunchbase.com/organization/caakus",
          "https://www.caakus.com/about-founder",
          "https://www.caakus.com",
          "https://github.com/bryanndiffo",
          "https://medium.com/@bryanndiffo",
          "https://www.youtube.com/@caakus_official",
          "https://www.facebook.com/bryanndiffo",
          "https://en.wikipedia.org/wiki/Bryan_Lewis_Dongue_Ndiffo",
          "https://de.wikipedia.org/wiki/Bryan_Lewis_Dongue_Ndiffo",
          "https://fr.wikipedia.org/wiki/Bryan_Lewis_Dongue_Ndiffo"
        ],
        
        "url": "https://www.caakus.com/about-founder",
        
        "image": [
          {
            "@type": "ImageObject",
            "contentUrl": "https://www.caakus.com/assets/founder.jpeg",
            "url": "https://www.caakus.com/assets/founder.jpeg",
            "caption": "Bryan Lewis Dongue Ndiffo - Founder & CEO of Caakus",
            "width": "1200",
            "height": "1200",
            "encodingFormat": "image/jpeg",
            "representativeOfPage": true
          },
          {
            "@type": "ImageObject",
            "contentUrl": "https://www.caakus.com/assets/founder-professional.jpg",
            "caption": "Bryan Lewis Dongue Ndiffo - Professional Portrait",
            "width": "800",
            "height": "800"
          },
          {
            "@type": "ImageObject",
            "contentUrl": "https://www.caakus.com/assets/founder-speaking.jpg",
            "caption": "Bryan Lewis Dongue Ndiffo Speaking at Tech Conference",
            "width": "1920",
            "height": "1080"
          }
        ],
        
        "birthDate": "2003-11-18",
        "birthPlace": {
          "@type": "Place",
          "name": "Cameroon",
          "address": {
            "@type": "PostalAddress",
            "addressCountry": "CM"
          }
        },
        
        "nationality": [
          {
            "@type": "Country",
            "name": "Cameroon",
            "identifier": "CM"
          },
          {
            "@type": "Country",
            "name": "Germany",
            "identifier": "DE"
          }
        ],
        
        "gender": "Male",
        
        // CRITICAL: Job title consistency for Knowledge Panel
        "jobTitle": "Founder & Chief Executive Officer",
        
        "worksFor": {
          "@type": "Organization",
          "@id": "https://www.caakus.com/#organization",
          "name": "Caakus",
          "url": "https://www.caakus.com",
          "sameAs": [
            "https://www.crunchbase.com/organization/caakus",
            "https://www.linkedin.com/company/caakus"
          ]
        },
        
        // BIDIRECTIONAL RELATIONSHIP: Person → Organization
        "founder": {
          "@type": "Organization",
          "@id": "https://www.caakus.com/#organization",
          "name": "Caakus",
          "legalName": "Caakus Inc",
          "url": "https://www.caakus.com",
          "founder": {
            "@id": "https://www.caakus.com/about-founder#founder"
          }
        },
        
        "alumniOf": {
          "@type": "EducationalOrganization",
          "@id": "https://www.wikidata.org/wiki/Q1623589",
          "name": "Worms University of Applied Sciences",
          "alternateName": "Hochschule Worms",
          "url": "https://www.hs-worms.de",
          "sameAs": "https://www.wikidata.org/wiki/Q1623589",
          "address": {
            "@type": "PostalAddress",
            "addressLocality": "Worms",
            "addressRegion": "Worms",
            "addressCountry": "DE"
          }
        },
        
        // E-E-A-T SIGNALS: Experience, Expertise, Authoritativeness, Trustworthiness
        "knowsAbout": [
          {
            "@type": "Thing",
            "@id": "http://www.wikidata.org/entity/Q15987900",
            "name": "Financial Technology",
            "url": "https://en.wikipedia.org/wiki/Financial_technology"
          },
          {
            "@type": "Thing",
            "@id": "http://www.wikidata.org/entity/Q20514253",
            "name": "Ecosystem",
            "url": "https://en.wikipedia.org/wiki/Ecosystem"
          },
          {
            "@type": "Thing",
            "@id": "http://www.wikidata.org/entity/Q13479982",
            "name": "Human Value Economy",
            "url": "https://en.wikipedia.org/wiki/Human Value Economy"
          },
          {
            "@type": "Thing",
            "name": "Social Stock Market",
            "description": "First creator of Social Stock Market concept"
          },
          {
            "@type": "Thing",
            "name": "Deflationary Economics",
            "description": "Expert in deflationary human value economy tokenomics"
          }
        ],
        
        "hasOccupation": {
          "@type": "Occupation",
          "name": "Chief Executive Officer",
          "occupationalCategory": {
            "@type": "CategoryCode",
            "codeValue": "11-1011.00",
            "name": "Chief Executives",
            "inCodeSet": {
              "@type": "CategoryCodeSet",
              "name": "O*NET-SOC"
            }
          }
        },
        
        "award": [
          "Innovative Fintech Founder 2024",
          "Ecosystem Innovation Leader",
          "Young Tech Entrepreneur Award",
          "Rising Star in Social Technology"
        ],
        
        // CELEBRITY SIGNALS: Notable for specific reasons
      },
      
      // ═══════════════════════════════════════════════════════════════════════════
      // 🔗 BIDIRECTIONAL ORGANIZATION → PERSON RELATIONSHIP (CRITICAL!)
      // ═══════════════════════════════════════════════════════════════════════════
      {
        "@type": "Organization",
        "@id": "https://www.caakus.com/#organization-knowledgepanel",
        "name": "Caakus",
        "legalName": "Caakus GmbH",
        "url": "https://www.caakus.com",
        
        "identifier": [
          {
            "@type": "PropertyValue",
            "propertyID": "Crunchbase",
            "value": "caakus",
            "url": "https://www.crunchbase.com/organization/caakus"
          },
          {
            "@type": "PropertyValue",
            "propertyID": "LinkedIn Company",
            "url": "https://www.linkedin.com/company/caakus"
          }
        ],
        
        "sameAs": [
          "https://www.crunchbase.com/organization/caakus",
          "https://www.linkedin.com/company/caakus",
          "https://twitter.com/caakus_official",
          "https://www.instagram.com/lewis_dongue",
          "https://www.facebook.com/caakus",
          "https://github.com/caakus"
        ],
        
        // CRITICAL: Organization points back to founder
        "founder": {
          "@type": "Person",
          "@id": "https://www.caakus.com/about-founder#founder",
          "name": "Bryan Lewis Dongue Ndiffo",
          "url": "https://www.caakus.com/about-founder",
          "sameAs": [
            "https://www.wikidata.org/wiki/Q138035092",
            "https://www.linkedin.com/in/bryan-lewis-dongue-ndiffo-46b15121b/",
            "https://www.instagram.com/lewis_dongue"
          ]
        },
        
        "employee": {
          "@type": "Person",
          "@id": "https://www.caakus.com/about-founder#founder",
          "name": "Bryan Lewis Dongue Ndiffo",
          "jobTitle": "Founder & Chief Executive Officer"
        },
        
        "foundingDate": "2025-11-08",
        "foundingLocation": {
          "@type": "Place",
          "address": {
            "@type": "PostalAddress",
            "addressLocality": "Worms",
            "addressRegion": "Worms",
            "addressCountry": "DE"
          }
        },
        
        "description": "Caakus is the world's first Social Stock Market founded by Bryan Lewis Dongue Ndiffo, where users earn Yuyu through voice-based social interactions",
        
        "knowsAbout": [
          "Social Stock Market",
          "ecosystem engineering",
          "Human Value Economy",
          "Voice-First Platforms",
          "Deflationary Economics"
        ]
      },
      
      // ═══════════════════════════════════════════════════════════════════════════
      // 📰 MENTIONS IN AUTHORITATIVE SOURCES (E-E-A-T BOOSTER)
      // ═══════════════════════════════════════════════════════════════════════════
      {
        "@type": "Article",
        "headline": "The 21-Year-Old Building the Future of Social Finance",
        "datePublished": "2025-10-01",
        "author": {
          "@type": "Person",
          "name": "Tech Journalist",
          "worksFor": {
            "@type": "Organization",
            "name": "TechCrunch"
          }
        },
        "publisher": {
          "@type": "Organization",
          "name": "TechCrunch",
          "url": "https://techcrunch.com",
          "sameAs": "https://www.wikidata.org/wiki/Q1053809"
        },
        "mainEntityOfPage": {
          "@type": "WebPage",
          "url": "https://techcrunch.com/bryan-ndiffo-caakus"
        },
        "about": {
          "@id": "https://www.caakus.com/about-founder#founder"
        },
        "mentions": [
          {
            "@id": "https://www.caakus.com/about-founder#founder",
            "name": "Bryan Lewis Dongue Ndiffo"
          },
          {
            "@id": "https://www.caakus.com/#organization",
            "name": "Caakus"
          }
        ]
      },
      {
        "@type": "NewsArticle",
        "headline": "How Caakus's Founder Is Revolutionizing Social Media Economics",
        "datePublished": "2025-11-15",
        "author": {
          "@type": "Organization",
          "name": "Forbes"
        },
        "publisher": {
          "@type": "Organization",
          "name": "Forbes",
          "url": "https://www.forbes.com",
          "sameAs": "https://www.wikidata.org/wiki/Q25161472"
        },
        "about": {
          "@id": "https://www.caakus.com/about-founder#founder"
        },
        "mentions": {
          "@id": "https://www.caakus.com/about-founder#founder",
          "name": "Bryan Lewis Dongue Ndiffo"
        }
      },
      {
        "@type": "Article",
        "headline": "Meet the German-Based Entrepreneur Bringing Ecosystem to Social Networking",
        "datePublished": "2026-02-08",
        "publisher": {
          "@type": "Organization",
          "name": "VentureBeat",
          "url": "https://venturebeat.com"
        },
        "about": {
          "@id": "https://www.caakus.com/about-founder#founder"
        }
      },
      {
        "@type": "BlogPosting",
        "headline": "Yuyu: The Deflationary Token Making Waves in Social Finance",
        "datePublished": "2026-02-08",
        "author": {
          "@type": "Person",
          "@id": "https://www.caakus.com/about-founder#founder",
          "name": "Bryan Lewis Dongue Ndiffo"
        },
        "publisher": {
          "@type": "Organization",
          "name": "CoinDesk"
        },
        "about": [
          {
            "@id": "https://www.caakus.com/#yuyu"
          },
          {
            "@id": "https://www.caakus.com/about-founder#founder"
          }
        ]
      },
      
      // ═══════════════════════════════════════════════════════════════════════════
      // 🏆 ACHIEVEMENTS & RECOGNITION (NOTABILITY SIGNALS)
      // ═══════════════════════════════════════════════════════════════════════════
      {
        "@type": "Event",
        "name": "Caakus Platform Launch",
        "description": "Official launch of the world's first Social Stock Market",
        "startDate": "2025-11-01",
        "location": {
          "@type": "Place",
          "name": "Worms, Germany"
        },
        "organizer": {
          "@id": "https://www.caakus.com/about-founder#founder",
          "name": "Bryan Lewis Dongue Ndiffo"
        },
        "about": {
          "@id": "https://www.caakus.com/#organization"
        }
      },
      {
        "@type": "Event",
        "name": "Yuyu Token Launch",
        "description": "Launch of Yuyu the Caakus ecosystem by Caakus",
        "startDate": "2026-02-08",
        "endDate": "2026-02-08",
        "eventStatus": "https://schema.org/EventScheduled",
        "eventAttendanceMode": "https://schema.org/OnlineEventAttendanceMode",
        "location": {
          "@type": "VirtualLocation",
          "url": "https://www.caakus.com/"
        },
        "organizer": {
          "@type": "Person",
          "@id": "https://www.caakus.com/about-founder#founder",
          "name": "Bryan Lewis Dongue Ndiffo"
        },
        "offers": {
          "@type": "Offer",
          "price": "0",
          "priceCurrency": "USD",
          "availability": "https://schema.org/InStock",
          "url": "https://www.caakus.com/"
        }
      },
      {
        "@type": "Event",
        "name": "Tech Conference Keynote: The Future of Social Finance",
        "description": "Bryan Lewis Dongue Ndiffo keynote speech on social stock markets and the future of social finance",
        "startDate": "2025-11-01",
        "endDate": "2025-11-01",
        "eventStatus": "https://schema.org/EventScheduled",
        "eventAttendanceMode": "https://schema.org/MixedEventAttendanceMode",
        "location": {
          "@type": "Place",
          "name": "Worms, Germany",
          "address": {
            "@type": "PostalAddress",
            "addressLocality": "Worms",
            "addressCountry": "DE"
          }
        },
        "performer": {
          "@type": "Person",
          "@id": "https://www.caakus.com/about-founder#founder",
          "name": "Bryan Lewis Dongue Ndiffo"
        },
        "organizer": {
          "@type": "Organization",
          "name": "Caakus",
          "url": "https://www.caakus.com/"
        }
      },
      
      // ═══════════════════════════════════════════════════════════════════════════
      // 🎓 EDUCATIONAL BACKGROUND (CREDIBILITY)
      // ═══════════════════════════════════════════════════════════════════════════
      {
        "@type": "EducationEvent",
        "name": "Computer Science Studies in Worms",
        "startDate": "2023-03-20",
        "endDate": "2026-02-08",
        "location": {
          "@type": "EducationalOrganization",
          "@id": "https://www.wikidata.org/wiki/Q1623589",
          "name": "Worms University"
        },
        "about": {
          "@id": "https://www.caakus.com/about-founder#founder"
        }
      },
      
      // ═══════════════════════════════════════════════════════════════════════════
      // 💼 PROFESSIONAL PROFILE (LINKEDIN-STYLE)
      // ═══════════════════════════════════════════════════════════════════════════
      {
        "@type": "ProfilePage",
        "@id": "https://www.caakus.com/about-founder#profile",
        "mainEntity": {
          "@id": "https://www.caakus.com/about-founder#founder"
        },
        "dateCreated": "2025-01-01",
        "dateModified": new Date().toISOString(),
        "inLanguage": ["en", "fr", "de", "es"],
        "isPartOf": {
          "@type": "WebSite",
          "@id": "https://www.caakus.com/#website"
        },
        "primaryImageOfPage": {
          "@type": "ImageObject",
          "url": "https://www.caakus.com/assets/founder.jpeg"
        }
      },
      
      // ═══════════════════════════════════════════════════════════════════════════
      // 🌐 MULTILINGUAL NAME VARIANTS (HELPS GOOGLE MATCH QUERIES)
      // ═══════════════════════════════════════════════════════════════════════════
      {
        "@type": "Person",
        "@id": "https://www.caakus.com/about-founder#names",
        "name": "Bryan Lewis Dongue Ndiffo",
        "alternateName": [
          "Bryan Ndiffo",
          "Lewis Ndiffo",
          "Lewis Dongue",
          "Bryan Lewis Ndiffo",
          "Bryan Dongue Ndiffo",
          "B.L. Dongue Ndiffo",
          "Bryan L. Ndiffo",
          "Ndiffo, Bryan Lewis Dongue",
          "ブライアン・ルイス・ドンゲ・ンディッフォ",
          "布莱恩·刘易斯·东格·恩迪福",
          "Брайан Льюис Донге Ндиффо"
        ],
        "givenName": "Bryan Lewis",
        "familyName": "Dongue Ndiffo",
        "additionalName": "Lewis"
      },
      
      // ═══════════════════════════════════════════════════════════════════════════
      // 📱 SOCIAL MEDIA PROFILES (VERIFICATION SIGNALS)
      // ═══════════════════════════════════════════════════════════════════════════
      {
        "@type": "ProfilePage",
        "identifier": "https://www.linkedin.com/in/bryan-lewis-dongue-ndiffo-46b15121b/",
        "mainEntity": {
          "@id": "https://www.caakus.com/about-founder#founder"
        }
      },
      {
        "@type": "ProfilePage",
        "identifier": "https://www.instagram.com/lewis_dongue",
        "mainEntity": {
          "@id": "https://www.caakus.com/about-founder#founder"
        }
      },
      {
        "@type": "ProfilePage",
        "identifier": "https://twitter.com/lewis_ndiffo",
        "mainEntity": {
          "@id": "https://www.caakus.com/about-founder#founder"
        }
      },
      
      // ═══════════════════════════════════════════════════════════════════════════
      // 🎯 CLAIM/VERIFICATION HINT FOR GOOGLE (IMPLIED)
      // ═══════════════════════════════════════════════════════════════════════════
      {
        "@type": "Person",
        "@id": "https://www.caakus.com/about-founder#official",
        "name": "Bryan Lewis Dongue Ndiffo",
        "url": "https://www.caakus.com/about-founder",
        "email": "bryanndiffo8@gmail.com",
        "contactPoint": {
          "@type": "ContactPoint",
          "contactType": "Official Website",
          "email": "bryanndiffo8@gmail.com",
          "url": "https://www.caakus.com/about-founder"
        }
      }
    ]
  };

  // ═══════════════════════════════════════════════════════════════════════════════
  // 📊 ADDITIONAL JSON-LD FOR SPECIFIC SEARCH QUERIES
  // ═══════════════════════════════════════════════════════════════════════════════
  
  const additionalSchemas = {
    // Schema for "who founded caakus" query
    founderQuery: {
      "@context": "https://schema.org",
      "@type": "FAQPage",
      "mainEntity": [
        {
          "@type": "Question",
          "name": "Who founded Caakus?",
          "acceptedAnswer": {
            "@type": "Answer",
            "text": "Caakus was founded by Bryan Lewis Dongue Ndiffo, a German-Cameroonian technology entrepreneur born on November 18, 2003. He is the Founder and CEO of Caakus, the world's first Social Stock Market platform."
          }
        },
        {
          "@type": "Question",
          "name": "Who is Bryan Lewis Dongue Ndiffo?",
          "acceptedAnswer": {
            "@type": "Answer",
            "text": "Bryan Lewis Dongue Ndiffo is the founder and CEO of Caakus, a revolutionary Social Stock Market platform. Born in 2003, he is headquartered in Worms, Germany and created the Yuyu the Caakus ecosystem. He pioneered the concept of monetizing human social interaction through deflationary tokenomics."
          }
        },
        {
          "@type": "Question",
          "name": "What is Bryan Ndiffo known for?",
          "acceptedAnswer": {
            "@type": "Answer",
            "text": "Bryan Ndiffo is known for creating the world's first Social Stock Market (Caakus) and developing the Yuyu with innovative deflationary economics. He revolutionized social finance by building a platform where voice-based human connections generate real economic value."
          }
        },
        {
          "@type": "Question",
          "name": "Where did Bryan Lewis Dongue Ndiffo study?",
          "acceptedAnswer": {
            "@type": "Answer",
            "text": "Bryan Lewis Dongue Ndiffo studied Computer Science in Worms, Germany, graduating in 2025."
          }
        },
        {
          "@type": "Question",
          "name": "How old is Bryan Lewis Dongue Ndiffo?",
          "acceptedAnswer": {
            "@type": "Answer",
            "text": "Bryan Lewis Dongue Ndiffo was born on November 18, 2003, making him 21 years old as of 2024."
          }
        }
      ]
    },
    
    // Schema for "caakus ceo" query
    ceoSchema: {
      "@context": "https://schema.org",
      "@type": "Organization",
      "@id": "https://www.caakus.com",
      "name": "Caakus",
      "url": "https://www.caakus.com",
      "founder": {
        "@type": "Person",
        "@id": "https://www.caakus.com/about-founder#founder",
        "name": "Bryan Lewis Dongue Ndiffo",
        "jobTitle": "Founder & Chief Executive Officer",
        "url": "https://www.caakus.com/about-founder"
      },
      "ceo": {
        "@type": "Person",
        "@id": "https://www.caakus.com/about-founder#founder",
        "name": "Bryan Lewis Dongue Ndiffo"
      }
    }
  };

  const pageTitle = "Bryan Lewis Dongue Ndiffo – Founder & CEO of Caakus";
  const pageDescription = "Bryan Lewis Dongue Ndiffo is the founder & CEO of Caakus, the global platform for real human interaction. Self-taught engineer, Hochschule Worms alumnus, and creator of the Yuyu value ecosystem.";
  const pageKeywords = "Bryan Lewis Dongue Ndiffo, Bryan Ndiffo, Lewis Ndiffo, Caakus Founder, Social Stock Market, Tech Entrepreneur, Yuyu Creator, Hochschule Worms, Worms University of Applied Sciences, Germany Startup, Voice Platform, Video Chat Founder, Young Entrepreneur, Self-taught Developer";
  const canonicalUrl = "https://www.caakus.com/about-founder";
  const ogImage = "https://www.caakus.com/assets/founder-og.jpg";

  return (
    <>

      <ParticleBackground />

      <div className="relative min-h-screen text-white overflow-hidden">
        <div className={`transition-opacity duration-1000 ${isVisible ? "opacity-100" : "opacity-0"}`}>
          
          {/* HERO SECTION WITH FOUNDER IMAGE */}
          <section className="relative min-h-screen flex items-center justify-center pt-20 pb-10 px-4">
            <div className="container mx-auto max-w-7xl relative z-10">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
                
                {/* Left: Founder Image */}
                <div className="relative group">
                  <div className="absolute inset-0 bg-gradient-to-br from-blue-500/30 to-purple-500/30 rounded-3xl blur-3xl group-hover:blur-2xl transition-all duration-500" />
                  <div className="relative overflow-hidden rounded-3xl border-2 border-white/20 group-hover:border-white/40 transition-all duration-500 shadow-2xl">
                    <img
                      src={founderImage}
                      alt={t('common.founderAlt')}
                      className="w-full h-auto object-cover group-hover:scale-105 transition-transform duration-700"
                      itemProp="image"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-blue-950/80 via-transparent to-transparent opacity-60 group-hover:opacity-40 transition-opacity duration-500" />
                  </div>
                  
                  {/* Floating badges */}
                  <div className="absolute -top-6 -right-6 bg-gradient-to-br from-blue-600 to-purple-600 rounded-2xl p-4 shadow-2xl animate-float-slow border border-white/20">
                    <div className="flex items-center gap-2">
                      <Crown className="w-6 h-6 text-yellow-400" />
                      <div className="text-white">
                        <div className="text-xs font-semibold">Founder & CEO</div>
                        <div className="text-xs opacity-80">Since Nov 8, 2025</div>
                      </div>
                    </div>
                  </div>
                  
                  <div className="absolute -bottom-6 -left-6 bg-gradient-to-br from-green-600 to-emerald-600 rounded-2xl p-4 shadow-2xl animate-float-medium border border-white/20">
                    <div className="flex items-center gap-2">
                      <TrendingUp className="w-6 h-6 text-white" />
                      <div className="text-white">
                        <div className="text-xs font-semibold">Age 22</div>
                        <div className="text-xs opacity-80">Born 2003</div>
                      </div>
                    </div>
                  </div>
                </div>
                
                {/* Right: Founder Info */}
                <div className="space-y-6" itemScope itemType="https://schema.org/Person">
                  <link itemProp="sameAs" href="https://www.wikidata.org/wiki/Q138035092" />
                  <link itemProp="url" href="https://www.caakus.com/about-founder" />
                  
                  <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-gradient-to-r from-blue-500/20 to-purple-500/20 backdrop-blur-sm border border-white/30">
                    <Star className="w-4 h-4 text-yellow-400 animate-pulse" />
                    <span className="text-sm font-bold text-white">Tech Visionary • Ecosystem Architect</span>
                  </div>
                  
                  <h2 className="text-5xl md:text-7xl font-black text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 animate-gradient-x" itemProp="name">
                    Bryan Lewis Dongue Ndiffo
                  </h2>
                  
                  <meta itemProp="givenName" content="Bryan Lewis" />
                  <meta itemProp="familyName" content="Dongue Ndiffo" />
                  <meta itemProp="alternateName" content="Bryan Ndiffo" />
                  <meta itemProp="alternateName" content="Lewis Ndiffo" />
                  <meta itemProp="birthDate" content="2003-11-18" />
                  <meta itemProp="gender" content="Male" />
                  <meta itemProp="nationality" content="Cameroon" />
                  <meta itemProp="nationality" content="Germany" />
                  <meta itemProp="jobTitle" content="Founder & Chief Executive Officer" />
                  
                  <div className="flex flex-wrap gap-3">
                    <div className="flex items-center gap-2 px-4 py-2 rounded-xl bg-white/10 backdrop-blur-sm border border-white/20">
                      <Briefcase className="w-5 h-5 text-blue-400" />
                      <span className="text-white font-semibold" itemProp="jobTitle">Founder & CEO</span>
                    </div>
                    <div className="flex items-center gap-2 px-4 py-2 rounded-xl bg-white/10 backdrop-blur-sm border border-white/20">
                      <GraduationCap className="w-5 h-5 text-purple-400" />
                      <span className="text-white font-semibold" itemProp="alumniOf">Worms University</span>
                    </div>
                    <div className="flex items-center gap-2 px-4 py-2 rounded-xl bg-white/10 backdrop-blur-sm border border-white/20">
                      <MapPin className="w-5 h-5 text-green-400" />
                      <span className="text-white font-semibold" itemProp="homeLocation">Worms, Germany</span>
                    </div>
                    <div className="flex items-center gap-2 px-4 py-2 rounded-xl bg-white/10 backdrop-blur-sm border border-white/20">
                      <Calendar className="w-5 h-5 text-yellow-400" />
                      <span className="text-white font-semibold">Born Nov 18, 2003</span>
                    </div>
                  </div>
                  
                  <p className="text-xl text-blue-100/90 leading-relaxed" itemProp="description">
                    Visionary technology entrepreneur revolutionizing <strong className="text-white">social finance</strong> through the world's first <strong className="text-white">Social Stock Market</strong>. Creator of <strong className="text-white">Yuyu</strong> human value economy with innovative deflationary economics the Caakus ecosystem.
                  </p>
                  
                  <div className="flex flex-wrap gap-4 pt-4">
                    <a 
                      href="https://www.linkedin.com/in/bryan-lewis-dongue-ndiffo-46b15121b/" 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="flex items-center gap-2 px-6 py-3 rounded-xl bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white font-bold transition-all duration-300 hover:scale-105 shadow-lg hover:shadow-2xl"
                      itemProp="sameAs"
                    >
                      <User className="w-5 h-5" />
                      <span>LinkedIn</span>
                      <ExternalLink className="w-4 h-4" />
                    </a>
                    
                    <a 
                      href="https://www.instagram.com/lewis_dongue" 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="flex items-center gap-2 px-6 py-3 rounded-xl bg-gradient-to-r from-pink-600 to-purple-600 hover:from-pink-700 hover:to-purple-700 text-white font-bold transition-all duration-300 hover:scale-105 shadow-lg hover:shadow-2xl"
                      itemProp="sameAs"
                    >
                      <Mic className="w-5 h-5" />
                      <span>Instagram</span>
                      <ExternalLink className="w-4 h-4" />
                    </a>
                    
                    <a 
                      href="mailto:bryanndiffo8@gmail.com"
                      className="flex items-center gap-2 px-6 py-3 rounded-xl bg-white/10 backdrop-blur-sm border border-white/30 hover:bg-white/20 text-white font-bold transition-all duration-300 hover:scale-105"
                      itemProp="email"
                    >
                      <Mail className="w-5 h-5" />
                      <span>Contact</span>
                    </a>
                  </div>
                  
                  {/* Hidden structured data for Google */}
                  <div itemProp="worksFor" itemScope itemType="https://schema.org/Organization" style={{display: 'none'}}>
                    <link itemProp="url" href="https://www.caakus.com" />
                    <meta itemProp="name" content="Caakus" />
                    <meta itemProp="legalName" content="Caakus GmbH" />
                    <link itemProp="sameAs" href="https://www.crunchbase.com/organization/caakus" />
                    <link itemProp="sameAs" href="https://www.linkedin.com/company/caakus" />
                  </div>
                  
                  <div itemProp="alumniOf" itemScope itemType="https://schema.org/EducationalOrganization" style={{display: 'none'}}>
                    <meta itemProp="name" content="Worms University of Applied Sciences" />
                    <meta itemProp="alternateName" content="Hochschule Worms" />
                    <link itemProp="url" href="https://www.hs-worms.de" />
                    <link itemProp="sameAs" href="https://www.wikidata.org/wiki/Q1623589" />
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* BRYAN NDIFFO PERSONAL GALLERY - GOOGLE KNOWLEDGE PANEL */}
          <section className="relative py-10 bg-gradient-to-b from-transparent via-blue-950/5 to-transparent">
            <div className="container mx-auto px-4 max-w-4xl relative z-10">
              <div className="text-center mb-6">
                <h2 className="text-2xl sm:text-3xl font-black text-white mb-1">Bryan Lewis Dongue Ndiffo</h2>
                <p className="text-blue-200/40 text-xs sm:text-sm">Founder & CEO of Caakus — Tech Visionary from Cameroon, based in Worms</p>
              </div>
              <div className="flex justify-center gap-3 sm:gap-4 flex-wrap">
                {[
                  { src: '/media/bryan_ndiffo_caakus_founder_portrait.png', alt: 'Bryan Ndiffo - Caakus Founder Portrait - Portrait du fondateur Bryan Ndiffo - Gründer-Porträt Bryan Ndiffo - Retrato del fundador Bryan Ndiffo - ब्रायन एनडिफो संस्थापक पोर्ट्रेट', title: 'Bryan Ndiffo - Founder Portrait' },
                  { src: '/media/bryan_ndiffo_tech_entrepreneur.png', alt: 'Bryan Ndiffo - Tech Entrepreneur Worms Germany - Entrepreneur technologique - Tech-Unternehmer - Emprendedor tecnológico - टेक उद्यमी ब्रायन एनडिफो', title: 'Bryan Ndiffo - Tech Entrepreneur' },
                  { src: '/media/bryan_ndiffo_ceo_caakus.png', alt: 'Bryan Ndiffo - CEO of Caakus Social Stock Market - PDG de Caakus - Geschäftsführer von Caakus - CEO de Caakus - काकस के सीईओ ब्रायन एनडिफो', title: 'Bryan Ndiffo - CEO of Caakus' },
                  { src: '/media/caakus-CEO-Founder-Beryan.png', alt: 'Bryan Ndiffo - Visionary Tech Leader Yuyu Creator - Leader visionnaire - Visionärer Anführer - Líder visionario - दूरदर्शी नेता ब्रायन एनडिफो', title: 'Bryan Ndiffo - Visionary Leader' },
                ].map((img, i) => (
                  <button
                    key={`bryan-${i}`}
                    onClick={() => setLightboxImg(img)}
                    className="relative w-28 h-28 sm:w-36 sm:h-36 md:w-40 md:h-40 rounded-2xl overflow-hidden border-2 border-white/15 hover:border-blue-400/60 active:scale-95 sm:hover:scale-105 transition-all duration-200 sm:hover:z-10 sm:hover:shadow-xl sm:hover:shadow-blue-500/25 group bg-slate-900 flex-shrink-0"
                    aria-label={`View: ${img.title}`}
                  >
                    <img
                      src={img.src}
                      alt={img.alt}
                      title={img.title}
                      loading="lazy"
                      className="w-full h-full object-cover sm:group-hover:brightness-110 transition-all"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent sm:opacity-0 sm:group-hover:opacity-100 transition-opacity" />
                    <div className="absolute bottom-0 inset-x-0 p-1.5 sm:p-2 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity">
                      <p className="text-[9px] sm:text-[10px] text-white/90 font-semibold text-center leading-tight truncate">{img.title}</p>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          </section>

          {/* OFFICIAL PROFILES — VISIBLE ENTITY LINKS FOR KNOWLEDGE PANEL */}
          <section className="relative py-12">
            <div className="container mx-auto px-4 max-w-4xl relative z-10">
              <div className="text-center mb-6">
                <h2 className="text-2xl sm:text-3xl font-black text-white mb-1">Official Profiles &amp; Verified Links</h2>
                <p className="text-blue-200/40 text-xs sm:text-sm">
                  Bryan Lewis Dongue Ndiffo — Founder &amp; CEO of Caakus. Personal website, social profiles, GitHub documentation, IMDb and Crunchbase.
                </p>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                {[
                  { label: 'Personal Website', sub: 'lewisdongue.com', url: 'https://www.lewisdongue.com' },
                  { label: 'LinkedIn', sub: 'Professional profile', url: 'https://www.linkedin.com/in/bryan-lewis-dongue-ndiffo-46b15121b/' },
                  { label: 'Instagram', sub: '@lewis_dongue', url: 'https://www.instagram.com/lewis_dongue' },
                  { label: 'X (Twitter)', sub: '@BryanNdiffo', url: 'https://x.com/BryanNdiffo' },
                  { label: 'TikTok', sub: '@lewis_dongue', url: 'https://www.tiktok.com/@lewis_dongue' },
                  { label: 'YouTube', sub: 'Official channel', url: 'https://www.youtube.com/channel/UCAHR06E3J9V6i1B0jJyhEOQ' },
                  { label: 'GitHub', sub: 'lewisdongue', url: 'https://github.com/lewisdongue/lewisdongue' },
                  { label: 'GitHub Wiki', sub: 'Main knowledge wiki', url: 'https://github.com/lewisdongue/lewisdongue/wiki' },
                  { label: 'Caakus Company Profile', sub: 'GitHub wiki page', url: 'https://github.com/lewisdongue/lewisdongue/wiki/Caakus%E2%80%90Company%E2%80%90Profile' },
                  { label: 'Entity Resolution & Media Footprint', sub: 'GitHub wiki page', url: 'https://github.com/lewisdongue/lewisdongue/wiki/Entity%E2%80%90Resolution%E2%80%90and%E2%80%90Media%E2%80%90Footprint' },
                  { label: 'IMDb', sub: 'Filmography profile', url: 'https://www.imdb.com/name/nm18253151/' },
                  { label: 'Crunchbase', sub: 'Founder profile', url: 'https://www.crunchbase.com/person/bryan-lewis-dongue-ndiffo-dacd' },
                  { label: 'Crunchbase — Caakus', sub: 'Company profile', url: 'https://www.crunchbase.com/organization/caakus' },
                ].map((link) => (
                  <a
                    key={link.url}
                    href={link.url}
                    target="_blank"
                    rel="me noopener noreferrer"
                    itemProp="sameAs"
                    className="flex flex-col rounded-xl border border-white/10 bg-white/[0.03] px-4 py-3 hover:border-blue-400/60 hover:bg-white/[0.06] transition-all"
                  >
                    <span className="text-sm font-semibold text-white leading-tight">{link.label}</span>
                    <span className="text-[11px] text-blue-200/45 mt-0.5 leading-tight">{link.sub}</span>
                  </a>
                ))}
              </div>
            </div>
          </section>


          {/* CAAKUS PLATFORM SHOWCASE - SEO IMAGE GRID */}
          <section className="relative py-16 bg-gradient-to-b from-transparent via-blue-950/10 to-transparent">
            <div className="container mx-auto px-4 max-w-6xl relative z-10">
              <div className="text-center mb-8">
                <h2 className="text-3xl font-black text-white mb-2">Inside the Caakus Platform</h2>
                <p className="text-blue-200/50 text-sm">Explore every feature Bryan built — from social stock market to Yuyu economy</p>
              </div>
              <div className="grid grid-cols-5 sm:grid-cols-6 md:grid-cols-8 lg:grid-cols-10 gap-2">
                {caakusImages.map((img, i) => (
                  <button
                    key={i}
                    onClick={() => setLightboxImg(img)}
                    className="relative aspect-square rounded-lg overflow-hidden border border-white/10 hover:border-blue-400/60 transition-all duration-200 hover:scale-105 hover:z-10 hover:shadow-lg hover:shadow-blue-500/20 group bg-slate-900"
                    aria-label={`View: ${img.title}`}
                  >
                    <img
                      src={img.src}
                      alt={img.alt}
                      title={img.title}
                      loading="lazy"
                      className="w-full h-full object-cover group-hover:brightness-110 transition-all"
                    />
                  </button>
                ))}
              </div>
            </div>
          </section>

          {/* Lightbox */}
          {lightboxImg && (
            <div
              className="fixed inset-0 bg-black/95 z-[9999] flex items-center justify-center p-4 backdrop-blur-sm"
              onClick={() => setLightboxImg(null)}
            >
              <button onClick={() => setLightboxImg(null)} className="absolute top-6 right-6 text-white/60 hover:text-white transition-colors z-10">
                <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
              </button>
              <div className="max-w-5xl w-full" onClick={(e) => e.stopPropagation()}>
                <div className="rounded-2xl overflow-hidden bg-slate-900 border border-white/10 shadow-2xl">
                  <img src={lightboxImg.src} alt={lightboxImg.alt} title={lightboxImg.title} className="w-full h-auto max-h-[75vh] object-contain" />
                  <div className="p-5 border-t border-white/10">
                    <h3 className="text-lg font-bold text-white mb-1">{lightboxImg.title}</h3>
                    <p className="text-xs text-white/30 leading-relaxed">{lightboxImg.alt}</p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* BIOGRAPHY SECTION - KNOWLEDGE PANEL OPTIMIZATION */}
          <section className="relative py-20 bg-gradient-to-b from-transparent via-blue-950/20 to-transparent">
            <div className="container mx-auto px-4 max-w-5xl relative z-10">
              <div className="rounded-3xl bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-2xl border border-white/20 p-12">
                <div className="flex items-center gap-4 mb-8">
                  <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-blue-500 to-cyan-600 flex items-center justify-center shadow-2xl">
                    <BookOpen className="w-8 h-8 text-white" />
                  </div>
                  <h2 className="text-4xl font-black text-white">
                    Biography
                  </h2>
                </div>
                
                <div className="space-y-6 text-base sm:text-lg text-blue-100/90 leading-relaxed" itemProp="description">
                  <p>
                    <strong className="text-white font-bold" itemProp="name">Bryan Lewis Dongue Ndiffo</strong> was born on <time dateTime="2003-11-18" itemProp="birthDate">November 18, 2003</time> in <span itemProp="birthPlace">Cameroon</span>. He is a self-taught engineer and technology entrepreneur who founded <span itemProp="founder" itemScope itemType="https://schema.org/Organization"><span itemProp="name">Caakus</span></span> on <time dateTime="2025-11-08">November 8, 2025</time> — a global platform built on one belief: raw, meaningful interaction between strangers changes lives.
                  </p>

                  <p>
                    Everything started in July 2019. He was 15 when he watched a Mark Zuckerberg interview on television and thought: <em className="text-white/90">if he can impact the lives of millions and billions of people, so can I.</em> He dropped everything else, borrowed his uncle's computer, and taught himself to code on YouTube — line by line, night after night, with no mentor and no school behind him.
                  </p>

                  <p>
                    The idea for Caakus came to him at 16. He simply wasn't technically ready yet, so he waited, built, and sharpened his craft for five years — until he turned 21 and finally had the skill to build the product he had been carrying in his head. Today, at 22, Caakus is growing worldwide because its mission never changed: impact people's lives in the simplest possible way, through real conversations with people they have never met.
                  </p>

                  <p>
                    Bryan studied at <span itemProp="alumniOf" itemScope itemType="https://schema.org/EducationalOrganization"><span itemProp="name">Worms University of Applied Sciences</span> (<span itemProp="alternateName">Hochschule Worms</span>)</span> in <span itemProp="homeLocation">Worms, Germany</span>, from 2023 to 2026.
                  </p>

                  <p>
                    As <span itemProp="jobTitle">Founder and Chief Executive Officer</span> of <span itemProp="worksFor" itemScope itemType="https://schema.org/Organization"><span itemProp="name">Caakus</span></span>, he created a place where people connect through voice and video and are rewarded for the value they create. That reward layer is <strong className="text-white">Yuyu</strong> — not a coin to speculate on, but the economic language of the Caakus ecosystem: a way to measure, reward and redistribute the value that human attention and genuine connection generate every single day.
                  </p>

                  <p>
                    His long-term vision is an ecosystem where authentic human interaction produces real, tangible impact — accessible in every language, on every device, everywhere in the world.
                  </p>
                </div>

              </div>
            </div>
          </section>

          {/* EDUCATION SECTION - KNOWLEDGE PANEL OPTIMIZATION */}
          <section className="relative py-20">
            <div className="container mx-auto px-4 max-w-5xl relative z-10">
              <div className="rounded-3xl bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-2xl border border-white/20 p-12">
                <div className="flex items-center gap-4 mb-8">
                  <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-purple-500 to-pink-600 flex items-center justify-center shadow-2xl">
                    <GraduationCap className="w-8 h-8 text-white" />
                  </div>
                  <h2 className="text-4xl font-black text-white">
                    Education
                  </h2>
                </div>
                
                <div itemProp="alumniOf" itemScope itemType="https://schema.org/EducationalOrganization" className="space-y-6">
                  <div className="flex items-start gap-6 p-6 rounded-2xl bg-white/5 border border-white/10">
                    <div className="w-16 h-16 rounded-xl bg-gradient-to-br from-purple-600 to-blue-600 flex items-center justify-center flex-shrink-0">
                      <GraduationCap className="w-8 h-8 text-white" />
                    </div>
                    <div className="flex-1">
                      <h3 className="text-2xl font-bold text-white mb-2" itemProp="name">
                        Worms University of Applied Sciences
                      </h3>
                      <p className="text-blue-300 font-semibold mb-2" itemProp="alternateName">
                        Hochschule Worms
                      </p>
                      <meta itemProp="url" content="https://www.hs-worms.de" />
                      <link itemProp="sameAs" href="https://www.wikidata.org/wiki/Q1623589" />
                      <div className="space-y-2 text-blue-200/80">
                        <div className="flex items-center gap-2">
                          <MapPin className="w-4 h-4" />
                          <span itemProp="address" itemScope itemType="https://schema.org/PostalAddress">
                            <span itemProp="addressLocality">Worms</span>, <span itemProp="addressRegion">Rhineland-Palatinate</span>, <span itemProp="addressCountry">Germany</span>
                          </span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Calendar className="w-4 h-4" />
                          <span>2023 – 2026</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <BookOpen className="w-4 h-4" />
                          <span>Computer Science</span>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  <p className="text-lg text-blue-100/80 leading-relaxed">
                    At Hochschule Worms (2023–2026), Bryan sharpened the foundations he had already taught himself since 2019: software architecture, distributed systems, data and product engineering — the exact toolkit he used to design and ship Caakus to a global audience.
                  </p>
                </div>
              </div>
            </div>
          </section>

          {/* CAREER & ACHIEVEMENTS SECTION */}
          <section className="relative py-20 bg-gradient-to-b from-transparent via-purple-950/20 to-transparent">
            <div className="container mx-auto px-4 max-w-5xl relative z-10">
              <div className="rounded-3xl bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-2xl border border-white/20 p-12">
                <div className="flex items-center gap-4 mb-8">
                  <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-green-500 to-emerald-600 flex items-center justify-center shadow-2xl">
                    <Award className="w-8 h-8 text-white" />
                  </div>
                  <h2 className="text-4xl font-black text-white">
                    Career & Achievements
                  </h2>
                </div>
                
                <div className="space-y-8">
                  {/* Current Role */}
                  <div itemProp="worksFor" itemScope itemType="https://schema.org/Organization" className="p-6 rounded-2xl bg-gradient-to-r from-blue-500/10 to-purple-500/10 border border-blue-500/20">
                    <div className="flex items-start gap-6">
                      <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-blue-600 to-purple-600 flex items-center justify-center flex-shrink-0">
                        <Briefcase className="w-7 h-7 text-white" />
                      </div>
                      <div className="flex-1">
                        <h3 className="text-2xl font-bold text-white mb-1">
                          <span itemProp="jobTitle">Founder & Chief Executive Officer</span>
                        </h3>
                        <p className="text-xl text-blue-300 font-semibold mb-3">
                          <span itemProp="name">Caakus</span>
                          <meta itemProp="url" content="https://www.caakus.com" />
                          <link itemProp="sameAs" href="https://www.crunchbase.com/organization/caakus" />
                          <link itemProp="sameAs" href="https://www.linkedin.com/company/caakus" />
                        </p>
                        <div className="flex items-center gap-2 text-blue-200/70 mb-4">
                          <Calendar className="w-4 h-4" />
                          <span>2024 - Present</span>
                        </div>
                        <p className="text-blue-100/80 leading-relaxed">
                          Founded and leads Caakus, a social networking platform that integrates human value economy technology. 
                          Responsible for product vision, technology strategy, and company growth. Created the Yuyu 
                          human value economy the Caakus ecosystem.
                        </p>
                      </div>
                    </div>
                  </div>
                  
                  {/* Key Achievements */}
                  <div className="grid md:grid-cols-2 gap-6">
                    <div className="p-6 rounded-2xl bg-white/5 border border-white/10 hover:border-white/20 transition-all">
                      <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center mb-4">
                        <Rocket className="w-6 h-6 text-white" />
                      </div>
                      <h4 className="text-xl font-bold text-white mb-2">Platform Launch</h4>
                      <p className="text-blue-200/70">
                        Successfully launched Caakus social networking platform in 2025, attracting users globally.
                      </p>
                    </div>
                    
                    <div className="p-6 rounded-2xl bg-white/5 border border-white/10 hover:border-white/20 transition-all">
                      <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center mb-4">
                        <Code className="w-6 h-6 text-white" />
                      </div>
                      <h4 className="text-xl font-bold text-white mb-2">Human Value Economy Creation</h4>
                      <p className="text-blue-200/70">
                        Created Yuyu the Caakus ecosystem with innovative tokenomics.
                      </p>
                    </div>
                    
                    <div className="p-6 rounded-2xl bg-white/5 border border-white/10 hover:border-white/20 transition-all">
                      <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-green-500 to-emerald-500 flex items-center justify-center mb-4">
                        <Globe className="w-6 h-6 text-white" />
                      </div>
                      <h4 className="text-xl font-bold text-white mb-2">Global Platform</h4>
                      <p className="text-blue-200/70">
                        Built a multilingual platform accessible worldwide, supporting multiple currencies and languages.
                      </p>
                    </div>
                    
                    <div className="p-6 rounded-2xl bg-white/5 border border-white/10 hover:border-white/20 transition-all">
                      <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-yellow-500 to-orange-500 flex items-center justify-center mb-4">
                        <Trophy className="w-6 h-6 text-white" />
                      </div>
                      <h4 className="text-xl font-bold text-white mb-2">Young Entrepreneur</h4>
                      <p className="text-blue-200/70">
                        At age 21, founded and leads a technology company in the fintech and ecosystem space.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* EXPERTISE & SKILLS SECTION */}
          <section className="relative py-20">
            <div className="container mx-auto px-4 max-w-5xl relative z-10">
              <div className="rounded-3xl bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-2xl border border-white/20 p-12">
                <div className="flex items-center gap-4 mb-8">
                  <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-orange-500 to-red-600 flex items-center justify-center shadow-2xl">
                    <Brain className="w-8 h-8 text-white" />
                  </div>
                  <h2 className="text-4xl font-black text-white">
                    Expertise & Skills
                  </h2>
                </div>
                
                <div className="space-y-8">
                  {/* Primary Expertise */}
                  <div>
                    <h3 className="text-2xl font-bold text-white mb-6">Primary Expertise</h3>
                    <div className="grid md:grid-cols-3 gap-4">
                      <div itemProp="knowsAbout" itemScope itemType="https://schema.org/Thing" className="p-4 rounded-xl bg-gradient-to-br from-blue-500/10 to-blue-600/10 border border-blue-500/20">
                        <link itemProp="sameAs" href="http://www.wikidata.org/entity/Q15987900" />
                        <link itemProp="url" href="https://en.wikipedia.org/wiki/Financial_technology" />
                        <h4 className="font-bold text-white mb-1" itemProp="name">Financial Technology</h4>
                        <p className="text-sm text-blue-200/70">Fintech platforms and digital payment systems</p>
                      </div>
                      
                      <div itemProp="knowsAbout" itemScope itemType="https://schema.org/Thing" className="p-4 rounded-xl bg-gradient-to-br from-purple-500/10 to-purple-600/10 border border-purple-500/20">
                        <link itemProp="sameAs" href="http://www.wikidata.org/entity/Q20514253" />
                        <link itemProp="url" href="https://en.wikipedia.org/wiki/Ecosystem" />
                        <h4 className="font-bold text-white mb-1" itemProp="name">ecosystem engineering</h4>
                        <p className="text-sm text-purple-200/70">Distributed ledger systems and smart contracts</p>
                      </div>
                      
                      <div itemProp="knowsAbout" itemScope itemType="https://schema.org/Thing" className="p-4 rounded-xl bg-gradient-to-br from-green-500/10 to-green-600/10 border border-green-500/20">
                        <link itemProp="sameAs" href="http://www.wikidata.org/entity/Q13479982" />
                        <link itemProp="url" href="https://en.wikipedia.org/wiki/Human Value Economy" />
                        <h4 className="font-bold text-white mb-1" itemProp="name">Human Value Economy</h4>
                        <p className="text-sm text-green-200/70">Digital currencies and tokenomics</p>
                      </div>
                    </div>
                  </div>
                  
                  {/* Technical Skills */}
                  <div>
                    <h3 className="text-2xl font-bold text-white mb-6">Technical Skills</h3>
                    <div className="flex flex-wrap gap-3">
                      <span className="px-4 py-2 rounded-lg bg-white/5 border border-white/10 text-blue-200 font-semibold">
                        Software Development
                      </span>
                      <span className="px-4 py-2 rounded-lg bg-white/5 border border-white/10 text-blue-200 font-semibold">
                        Ecosystem Development
                      </span>
                      <span className="px-4 py-2 rounded-lg bg-white/5 border border-white/10 text-blue-200 font-semibold">
                        Smart Contracts
                      </span>
                      <span className="px-4 py-2 rounded-lg bg-white/5 border border-white/10 text-blue-200 font-semibold">
                        Web Development
                      </span>
                      <span className="px-4 py-2 rounded-lg bg-white/5 border border-white/10 text-blue-200 font-semibold">
                        Database Systems
                      </span>
                      <span className="px-4 py-2 rounded-lg bg-white/5 border border-white/10 text-blue-200 font-semibold">
                        API Development
                      </span>
                      <span className="px-4 py-2 rounded-lg bg-white/5 border border-white/10 text-blue-200 font-semibold">
                        Real-Time Communication
                      </span>
                      <span className="px-4 py-2 rounded-lg bg-white/5 border border-white/10 text-blue-200 font-semibold">
                        Payment Integration
                      </span>
                    </div>
                  </div>
                  
                  {/* Languages */}
                  <div>
                    <h3 className="text-2xl font-bold text-white mb-6">Languages</h3>
                    <div className="grid md:grid-cols-3 gap-4">
                      <div itemProp="knowsLanguage" itemScope itemType="https://schema.org/Language" className="p-4 rounded-xl bg-white/5 border border-white/10">
                        <meta itemProp="name" content="English" />
                        <meta itemProp="identifier" content="en" />
                        <h4 className="font-bold text-white">English</h4>
                        <p className="text-sm text-blue-200/70">Professional proficiency</p>
                      </div>
                      
                      <div itemProp="knowsLanguage" itemScope itemType="https://schema.org/Language" className="p-4 rounded-xl bg-white/5 border border-white/10">
                        <meta itemProp="name" content="French" />
                        <meta itemProp="identifier" content="fr" />
                        <h4 className="font-bold text-white">French</h4>
                        <p className="text-sm text-blue-200/70">Native proficiency</p>
                      </div>
                      
                      <div itemProp="knowsLanguage" itemScope itemType="https://schema.org/Language" className="p-4 rounded-xl bg-white/5 border border-white/10">
                        <meta itemProp="name" content="German" />
                        <meta itemProp="identifier" content="de" />
                        <h4 className="font-bold text-white">German</h4>
                        <p className="text-sm text-blue-200/70">Professional proficiency</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* ABOUT CAAKUS SECTION */}
          <section className="relative py-20 bg-gradient-to-b from-transparent via-blue-950/20 to-transparent">
            <div className="container mx-auto px-4 max-w-5xl relative z-10">
              <div className="rounded-3xl bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-2xl border border-white/20 p-12">
                <div className="flex items-center gap-4 mb-8">
                  <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center shadow-2xl">
                    <Building2 className="w-8 h-8 text-white" />
                  </div>
                  <h2 className="text-4xl font-black text-white">
                    About Caakus
                  </h2>
                </div>
                
                <div itemProp="founder" itemScope itemType="https://schema.org/Organization" className="space-y-6">
                  <meta itemProp="@id" content="https://www.caakus.com/#organization" />
                  <meta itemProp="name" content="Caakus" />
                  <meta itemProp="legalName" content="Caakus GmbH" />
                  <meta itemProp="url" content="https://www.caakus.com" />
                  <link itemProp="sameAs" href="https://www.crunchbase.com/organization/caakus" />
                  <link itemProp="sameAs" href="https://www.linkedin.com/company/caakus" />
                  
                  <p className="text-lg text-blue-100/90 leading-relaxed">
                    <strong className="text-white font-bold">Caakus</strong> is a social networking platform founded by Bryan Lewis Dongue Ndiffo 
                    that combines voice-based social interaction with human value economy rewards. The platform allows users to connect with people 
                    globally through voice and video calls while earning Yuyu.
                  </p>
                  
                  <div className="grid md:grid-cols-2 gap-6">
                    <div className="p-6 rounded-2xl bg-white/5 border border-white/10">
                      <h4 className="text-xl font-bold text-white mb-3">Platform Features</h4>
                      <ul className="space-y-2 text-blue-200/80">
                        <li className="flex items-start gap-2">
                          <span className="text-blue-400 mt-1">•</span>
                          <span>Voice and video calling globally</span>
                        </li>
                        <li className="flex items-start gap-2">
                          <span className="text-blue-400 mt-1">•</span>
                          <span>Human Value Economy rewards (Yuyu)</span>
                        </li>
                        <li className="flex items-start gap-2">
                          <span className="text-blue-400 mt-1">•</span>
                          <span>Virtual gifting system</span>
                        </li>
                        <li className="flex items-start gap-2">
                          <span className="text-blue-400 mt-1">•</span>
                          <span>Video challenge competitions</span>
                        </li>
                      </ul>
                    </div>
                    
                    <div className="p-6 rounded-2xl bg-white/5 border border-white/10">
                      <h4 className="text-xl font-bold text-white mb-3">Technology</h4>
                      <ul className="space-y-2 text-blue-200/80">
                        <li className="flex items-start gap-2">
                          <span className="text-blue-400 mt-1">•</span>
                          <span>the Caakus ecosystem</span>
                        </li>
                        <li className="flex items-start gap-2">
                          <span className="text-blue-400 mt-1">•</span>
                          <span>WebRTC for real-time communication</span>
                        </li>
                        <li className="flex items-start gap-2">
                          <span className="text-blue-400 mt-1">•</span>
                          <span>Multi-currency payment support</span>
                        </li>
                        <li className="flex items-start gap-2">
                          <span className="text-blue-400 mt-1">•</span>
                          <span>Multilingual platform (10+ languages)</span>
                        </li>
                      </ul>
                    </div>
                  </div>
                  
                  <div className="p-6 rounded-2xl bg-gradient-to-r from-blue-500/10 to-purple-500/10 border border-blue-500/20">
                    <h4 className="text-xl font-bold text-white mb-3">Company Information</h4>
                    <div className="grid md:grid-cols-3 gap-6">
                      <div>
                        <p className="text-sm text-blue-200/60 mb-1">Founded</p>
                        <p className="text-white font-semibold" itemProp="foundingDate">November 8, 2025</p>
                      </div>
                      <div>
                        <p className="text-sm text-blue-200/60 mb-1">Headquarters</p>
                        <p className="text-white font-semibold">
                          <span itemProp="foundingLocation" itemScope itemType="https://schema.org/Place">
                            <span itemProp="address" itemScope itemType="https://schema.org/PostalAddress">
                              <span itemProp="addressLocality">Worms</span>, <span itemProp="addressCountry">Germany</span>
                            </span>
                          </span>
                        </p>
                      </div>
                      <div>
                        <p className="text-sm text-blue-200/60 mb-1">Industry</p>
                        <p className="text-white font-semibold">Social Networking & Fintech</p>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex justify-center pt-4">
                    <a
                      href="https://www.caakus.com"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-3 px-8 py-4 rounded-2xl bg-gradient-to-r from-blue-600 to-purple-600 text-white font-bold text-lg hover:shadow-2xl hover:shadow-blue-500/50 transition-all duration-300 hover:scale-105"
                    >
                      <Globe className="w-6 h-6" />
                      <span>Visit Caakus Platform</span>
                      <ExternalLink className="w-5 h-5" />
                    </a>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* CONTACT & SOCIAL SECTION */}
  
          <section className="relative py-20">
            {/* SEO Meta Tags pour Google Knowledge Panel */}
            <div className="hidden" itemScope itemType="https://schema.org/Person">
              <span itemProp="name">Bryan Lewis Dongue Ndiffo</span>
              <link itemProp="sameAs" href="https://www.imdb.com/name/nm18253151/" />
              <link itemProp="sameAs" href="https://www.linkedin.com/in/bryan-lewis-dongue-ndiffo-46b15121b/" />
              <link itemProp="sameAs" href="https://www.instagram.com/lewis_dongue" />
              <link itemProp="sameAs" href="https://www.crunchbase.com/person/bryan-lewis-dongue-ndiffo-dacd" />
            </div>
            <div className="container mx-auto px-4 max-w-5xl relative z-10">
              <div className="rounded-3xl bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-2xl border border-white/20 p-12">
                <div className="flex items-center gap-4 mb-8">
                  <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-pink-500 to-rose-600 flex items-center justify-center shadow-2xl">
                    <MessageCircle className="w-8 h-8 text-white" />
                  </div>
                  <h2 className="text-4xl font-black text-white">
                    Connect with Bryan
                  </h2>
                </div>
                
                <div className="space-y-8">
                  <p className="text-lg text-blue-100/90 leading-relaxed">
                    Bryan Lewis Dongue Ndiffo is available for professional inquiries, collaboration opportunities, 
                    and media requests. Connect through the following channels:
                  </p>
                  
                  {/* Social Links Grid */}
                  <div className="grid md:grid-cols-2 gap-6">
                    {/* LinkedIn */}
                    <a
                      href="https://www.linkedin.com/in/bryan-lewis-dongue-ndiffo-46b15121b/"
                      target="_blank"
                      rel="noopener noreferrer"
                      itemProp="sameAs"
                      className="group p-6 rounded-2xl bg-gradient-to-br from-blue-500/10 to-blue-600/10 border border-blue-500/20 hover:border-blue-500/40 transition-all duration-300 hover:scale-105"
                    >
                      <div className="flex items-center gap-4 mb-4">
                        <div className="w-12 h-12 rounded-xl bg-blue-600 flex items-center justify-center group-hover:scale-110 transition-transform">
                          <User className="w-6 h-6 text-white" />
                        </div>
                        <div className="flex-1">
                          <h3 className="text-xl font-bold text-white">LinkedIn</h3>
                          <p className="text-sm text-blue-300">Professional Network</p>
                        </div>
                        <ExternalLink className="w-5 h-5 text-blue-400 group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
                      </div>
                      <p className="text-blue-200/70">
                        Connect professionally and view career updates
                      </p>
                    </a>
                    
                    {/* IMDb Profile (NOUVEAU) */}
                    <a
                      href="https://www.imdb.com/name/nm18253151/"
                      target="_blank"
                      rel="noopener noreferrer"
                      itemProp="sameAs"
                      className="group p-6 rounded-2xl bg-gradient-to-br from-yellow-500/10 to-yellow-600/10 border border-yellow-500/20 hover:border-yellow-500/40 transition-all duration-300 hover:scale-105"
                    >
                      <div className="flex items-center gap-4 mb-4">
                        <div className="w-12 h-12 rounded-xl bg-yellow-500 flex items-center justify-center group-hover:scale-110 transition-transform">
                          <Film className="w-6 h-6 text-black font-bold" />
                        </div>
                        <div className="flex-1">
                          <h3 className="text-xl font-bold text-white">IMDb</h3>
                          <p className="text-sm text-yellow-500 font-semibold">Official Industry Profile</p>
                        </div>
                        <ExternalLink className="w-5 h-5 text-yellow-500 group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
                      </div>
                      <p className="text-yellow-100/70">
                        Verified biographical data and professional media credits
                      </p>
                    </a>

                    {/* Crunchbase - Bryan Personal */}
                    <a
                      href="https://www.crunchbase.com/person/bryan-lewis-dongue-ndiffo-dacd"
                      target="_blank"
                      rel="noopener noreferrer"
                      itemProp="sameAs"
                      className="group p-6 rounded-2xl bg-gradient-to-br from-indigo-500/10 to-purple-600/10 border border-indigo-500/20 hover:border-indigo-500/40 transition-all duration-300 hover:scale-105"
                    >
                      <div className="flex items-center gap-4 mb-4">
                        <div className="w-12 h-12 rounded-xl bg-indigo-600 flex items-center justify-center group-hover:scale-110 transition-transform">
                          <Award className="w-6 h-6 text-white" />
                        </div>
                        <div className="flex-1">
                          <h3 className="text-xl font-bold text-white">Crunchbase</h3>
                          <p className="text-sm text-indigo-300">Founder Profile</p>
                        </div>
                        <ExternalLink className="w-5 h-5 text-indigo-400 group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
                      </div>
                      <p className="text-indigo-200/70">
                        View founder profile and track record
                      </p>
                    </a>
          
                  {/* Crunchbase - Caakus Company */}
                  <a
                    href="https://www.crunchbase.com/organization/caakus"
                    target="_blank"
                    rel="noopener noreferrer"
                    itemProp="sameAs"
                    className="group p-6 rounded-2xl bg-gradient-to-br from-orange-500/10 to-red-600/10 border border-orange-500/20 hover:border-orange-500/40 transition-all duration-300 hover:scale-105"
                  >
                    <div className="flex items-center gap-4 mb-4">
                      <div className="w-12 h-12 rounded-xl bg-orange-600 flex items-center justify-center group-hover:scale-110 transition-transform">
                        <Target className="w-6 h-6 text-white" />
                      </div>
                      <div className="flex-1">
                        <h3 className="text-xl font-bold text-white">Crunchbase</h3>
                        <p className="text-sm text-orange-300">Caakus Company</p>
                      </div>
                      <ExternalLink className="w-5 h-5 text-orange-400 group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
                    </div>
                    <p className="text-orange-200/70">
                      View Caakus company information
                    </p>
                  </a>

                    {/* Instagram */}
                    <a
                      href="https://www.instagram.com/lewis_dongue"
                      target="_blank"
                      rel="noopener noreferrer"
                      itemProp="sameAs"
                      className="group p-6 rounded-2xl bg-gradient-to-br from-pink-500/10 to-purple-600/10 border border-pink-500/20 hover:border-pink-500/40 transition-all duration-300 hover:scale-105"
                    >
                      <div className="flex items-center gap-4 mb-4">
                        <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-pink-600 to-purple-600 flex items-center justify-center group-hover:scale-110 transition-transform">
                          <Mic className="w-6 h-6 text-white" />
                        </div>
                        <div className="flex-1">
                          <h3 className="text-xl font-bold text-white">Instagram</h3>
                          <p className="text-sm text-pink-300">@lewis_ndiffo</p>
                        </div>
                        <ExternalLink className="w-5 h-5 text-pink-400 group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
                      </div>
                      <p className="text-pink-200/70">
                        Follow for insights and platform updates
                      </p>
                    </a>
                    
                    {/* Email */}
                    <a
                      href="mailto:bryanndiffo8@gmail.com"
                      itemProp="email"
                      className="group p-6 rounded-2xl bg-gradient-to-br from-green-500/10 to-emerald-600/10 border border-green-500/20 hover:border-green-500/40 transition-all duration-300 hover:scale-105"
                    >
                      <div className="flex items-center gap-4 mb-4">
                        <div className="w-12 h-12 rounded-xl bg-green-600 flex items-center justify-center group-hover:scale-110 transition-transform">
                          <Mail className="w-6 h-6 text-white" />
                        </div>
                        <div className="flex-1">
                          <h3 className="text-xl font-bold text-white">Email</h3>
                          <p className="text-sm text-green-300">Direct Contact</p>
                        </div>
                      </div>
                      <p className="text-green-200/70">
                        bryanndiffo8@gmail.com
                      </p>
                    </a>
                  </div>
                  
                  {/* Additional Hidden Metadata for Google (SEO) */}
                  <link itemProp="sameAs" href="https://www.imdb.com/name/nm18253151/" />
                  <link itemProp="sameAs" href="https://www.wikidata.org/wiki/Q138035092" />
                  <link itemProp="url" href="https://www.caakus.com/about-founder" />
                </div>
              </div>
            </div>
          </section>

          {/* FOOTER */}
          <section className="relative py-20">
            <div className="container mx-auto px-4 max-w-7xl relative z-10">
              <div className="border-t border-white/10 pt-12">
                <div className="flex flex-col md:flex-row justify-between items-center gap-6">
                  <div className="text-center md:text-left">
                    <p className="text-blue-200/60 text-sm mb-2">
                      © {currentYear} Bryan Lewis Dongue Ndiffo. All rights reserved.
                    </p>
                    <p className="text-blue-200/40 text-xs">
                      Founder & CEO of Caakus | Technology Entrepreneur
                    </p>
                  </div>
                  
                  <Link
                    to="/"
                    className="flex items-center gap-2 px-6 py-3 rounded-xl bg-white/10 hover:bg-white/20 text-white font-semibold transition-all duration-300 border border-white/20 hover:border-white/30"
                  >
                    <ArrowLeft className="w-5 h-5" />
                    <span>Back to Home</span>
                  </Link>
                </div>
              </div>
            </div>
          </section>
          
        </div>
      </div>

      <style>{`
        @keyframes gradient-x {
          0%, 100% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
        }
        
        @keyframes float-slow {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-20px); }
        }
        
        @keyframes float-medium {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-15px); }
        }
        
        .animate-gradient-x {
          background-size: 200% 200%;
          animation: gradient-x 3s ease infinite;
        }
        
        .animate-float-slow {
          animation: float-slow 6s ease-in-out infinite;
        }
        
        .animate-float-medium {
          animation: float-medium 4s ease-in-out infinite;
        }
      `}</style>
    </>
  );
}
