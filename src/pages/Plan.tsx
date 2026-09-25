import { useNavigate } from "@/lib/router-compat";
import { useTranslation } from "react-i18next";
import { ArrowLeft } from "lucide-react";
import { Helmet } from "@/lib/helmet";
import { Button } from "@/components/ui/button";
import { PremiumButton } from "@/components/PremiumButton";
import { ParticleBackground } from "@/components/ParticleBackground";

export default function Plan() {
  const { t } = useTranslation();
  const navigate = useNavigate();

  return (
    <>
      <Helmet>
        <title>Caakus Premium Plans – From $4.99/month | Boost Earnings 50%</title>
        <meta name="description" content="Unlock 50% earnings boost, priority matching & advanced filters. Student $4.99/mo, Regular $21.99/mo, Founding Member $299 lifetime (10,000 slots only). Cancel anytime." />
        <meta name="keywords" content="caakus premium, caakus subscription, caakus founding member, caakus student plan, video chat premium, earn more money caakus, caakus upgrade" />
        <link rel="canonical" href="https://www.caakus.com/plan" />
        <meta property="og:title" content="Caakus Premium Plans – Boost Earnings 50% | From $4.99/mo" />
        <meta property="og:description" content="Upgrade to Caakus Premium: 50% earnings boost, priority matching & advanced filters. From $4.99/month." />
        <meta property="og:image:width" content="1200" />
        <meta property="og:image:height" content="630" />
        <meta property="og:image:alt" content="Caakus Premium Plans – Boost Your Earnings" />
        <meta property="og:type" content="website" />
        <meta property="og:site_name" content="Caakus" />
        <meta property="og:url" content="https://www.caakus.com/plan" />
        <meta property="og:image" content="https://www.caakus.com/og-image.jpg" />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:site" content="@caakus_official" />
        <meta name="twitter:title" content="Caakus Premium Plans – Boost Earnings 50% | From $4.99/mo" />
        <meta name="twitter:description" content="50% earnings boost, priority matching & advanced filters. Student $4.99/mo, Regular $21.99/mo, Founding Member $299 lifetime." />
        <meta name="twitter:image" content="https://www.caakus.com/og-image.jpg" />
        <meta name="robots" content="index, follow" />
        <script type="application/ld+json">{JSON.stringify({
          "@context": "https://schema.org",
          "@graph": [
            {
              "@type": "WebPage",
              "@id": "https://www.caakus.com/plan#webpage",
              "url": "https://www.caakus.com/plan",
              "name": "Caakus Premium Plans – From $4.99/month | Boost Earnings 50%",
              "isPartOf": { "@id": "https://www.caakus.com/#website" },
              "breadcrumb": {
                "@type": "BreadcrumbList",
                "itemListElement": [
                  { "@type": "ListItem", "position": 1, "name": "Home", "item": "https://www.caakus.com/" },
                  { "@type": "ListItem", "position": 2, "name": "Premium Plans", "item": "https://www.caakus.com/plan" }
                ]
              }
            },
            {
              "@type": "Product",
              "@id": "https://www.caakus.com/plan#product",
              "name": "Caakus Premium Subscription",
              "description": "Premium subscription for Caakus social video chat platform with 50% earnings boost, priority matching, and advanced filters.",
              "url": "https://www.caakus.com/plan",
              "image": "https://www.caakus.com/og-image.jpg",
              "brand": { "@type": "Brand", "name": "Caakus" },
              "offers": [
                {
                  "@type": "Offer",
                  "name": "Student Plan",
                  "price": "4.99",
                  "priceCurrency": "USD",
                  "priceSpecification": { "@type": "UnitPriceSpecification", "price": "4.99", "priceCurrency": "USD", "unitText": "MONTH" },
                  "availability": "https://schema.org/InStock",
                  "url": "https://www.caakus.com/plan"
                },
                {
                  "@type": "Offer",
                  "name": "Regular Plan",
                  "price": "21.99",
                  "priceCurrency": "USD",
                  "priceSpecification": { "@type": "UnitPriceSpecification", "price": "21.99", "priceCurrency": "USD", "unitText": "MONTH" },
                  "availability": "https://schema.org/InStock",
                  "url": "https://www.caakus.com/plan"
                },
                {
                  "@type": "Offer",
                  "name": "Founding Member Plan",
                  "price": "299",
                  "priceCurrency": "USD",
                  "priceSpecification": { "@type": "UnitPriceSpecification", "price": "299", "priceCurrency": "USD", "unitText": "MONTH" },
                  "availability": "https://schema.org/LimitedAvailability",
                  "url": "https://www.caakus.com/plan"
                }
              ],
              "aggregateRating": {
                "@type": "AggregateRating",
                "ratingValue": "4.8",
                "reviewCount": 3200,
                "bestRating": "5",
                "worstRating": "1"
              }
            }
          ]
        })}</script>
      </Helmet>
      <ParticleBackground />
      <div className="min-h-screen w-full overflow-x-hidden relative z-10">
        <header className="sticky top-0 z-50 w-full border-b border-white/10 bg-slate-900/80 backdrop-blur-xl">
          <div className="container mx-auto px-4 py-4">
            <div className="flex items-center gap-4">
              <Button
                variant="ghost"
                onClick={() => navigate(-1)}
                className="h-10 w-10 p-0 rounded-full hover:bg-white/10 text-white"
                aria-label={t("common.back")}
              >
                <ArrowLeft className="h-5 w-5" />
              </Button>
              <div>
                <h1 className="text-xl font-bold text-white">{t("premium.title")}</h1>
                <p className="text-sm text-slate-400">{t("premium.description")}</p>
              </div>
            </div>
          </div>
        </header>
        <main className="container mx-auto px-4 py-6 max-w-2xl">
          <PremiumButton defaultOpen renderTrigger={false} onDialogClose={() => navigate(-1)} />
        </main>
      </div>
    </>
  );
}
