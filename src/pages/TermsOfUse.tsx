import { Link } from "@/lib/router-compat";
import { ArrowLeft } from "lucide-react";

const EFFECTIVE_DATE = "18 September 2026";
const COMPANY = "Caakus Inc.";
const SUPPORT = "support@caakus.com";

type Clause = { title: string; body: string[]; bullets?: string[] };

const CLAUSES: Clause[] = [
  {
    title: "1. Acceptance of these Terms",
    body: [
      `These Terms of Use ("Terms") form a binding legal agreement between you and ${COMPANY} ("Caakus", "we", "us"), operator of caakus.com and its applications (the "Service"). By creating an account, accessing, purchasing, or using any part of the Service, you confirm that you have read, understood, and agreed to these Terms, to our Privacy Policy and to our Refund Policy, which are incorporated here by reference.`,
      "If you do not agree with any part of these Terms, you must stop using the Service immediately and close your account.",
    ],
  },
  {
    title: "2. Strict 18+ eligibility — zero tolerance for minors",
    body: [
      "The Service is an adult-only platform. You must be at least 18 years old, or the age of majority in your jurisdiction if higher, to create an account, join a video match, purchase credits or receive a payout.",
      "By using the Service you represent and warrant, under penalty of account termination and referral to the competent authorities, that you meet this age requirement and that every person appearing on your camera is also 18 or older.",
    ],
    bullets: [
      "No person under 18 may register, appear on camera, be described, depicted, or referenced in any sexualised context anywhere on the Service.",
      "Any account suspected of being operated by a minor is suspended immediately and permanently, without refund of any unused balance.",
      "Caakus operates a zero-tolerance policy against child sexual abuse material (CSAM), grooming, and any sexualisation of minors. Such content is reported to the National Center for Missing & Exploited Children (NCMEC) and to the relevant law enforcement agencies, together with all account, device, payment and connection data in our possession.",
      "We may request government-issued identification or a liveness check at any time to verify age. Refusal to comply results in suspension of matching, payouts, and purchases.",
      "If you believe a minor is using the Service, report it immediately to " + SUPPORT + " with the username and time of the incident.",
    ],
  },
  {
    title: "3. Account registration and security",
    body: [
      "You must provide accurate, current and complete information and keep it up to date. You are solely responsible for all activity carried out under your credentials and for keeping them confidential.",
    ],
    bullets: [
      "One account per person. Duplicate, shared, automated, or resold accounts are prohibited.",
      "You must notify " + SUPPORT + " without delay of any unauthorised use of your account.",
      "Caakus may refuse registration, suspend or terminate any account at its sole discretion where required for legal, safety, fraud-prevention, or payment-compliance reasons.",
    ],
  },
  {
    title: "4. Acceptable use and prohibited conduct",
    body: [
      "The Service connects real adults in real time. The following conduct is strictly prohibited and results in immediate, permanent termination without refund, and where applicable, referral to law enforcement:",
    ],
    bullets: [
      "Any sexual content involving minors, or content presenting adults as minors.",
      "Non-consensual sexual content, revenge content, trafficking, coercion, prostitution, or the solicitation of commercial sexual services.",
      "Violence, gore, self-harm, terrorism, extremist propaganda, or threats against any person.",
      "Harassment, hate speech, doxxing, stalking, or discrimination on any protected ground.",
      "Recording, screenshotting, redistributing or republishing another user's video, voice, image or private messages without their explicit consent.",
      "Impersonation, fraud, phishing, malware, scraping, bots, automated matching, reverse engineering, or circumvention of moderation or rate limits.",
      "Advertising, spam, external payment solicitation, or the sale of goods or services through the Service.",
      "Use of the Service from any jurisdiction where adult interactive video services are unlawful.",
    ],
  },
  {
    title: "5. Moderation, reporting and enforcement",
    body: [
      "Caakus operates automated on-device detection of explicit nudity and graphic violence, a user reporting system, and human review of reported incidents. Streams that trigger a confirmed detection are terminated instantly.",
      "Eight unique reports against an account trigger an automatic and permanent ban. Caakus may also suspend, restrict, shadow-limit, or terminate any account at its sole discretion where content or behaviour violates these Terms, applicable law, or the rules of our payment processors.",
      "Enforcement decisions may be appealed once by writing to " + SUPPORT + " within 30 days. Bans issued for content involving minors, non-consensual content, or fraud are final and non-appealable.",
    ],
  },
  {
    title: "6. Consent and content ownership",
    body: [
      "You retain ownership of the content you transmit. By transmitting content you grant Caakus a worldwide, non-exclusive, royalty-free licence to host, transmit, display, and process that content solely to operate, secure, and moderate the Service.",
      "You represent that you hold all rights and consents required for the content you transmit, including the consent of every identifiable person appearing in it, and that the content does not infringe any third-party right or any applicable law.",
    ],
  },
  {
    title: "7. YUYU credits — nature, purchase and use",
    body: [
      "YUYU are internal, non-monetary platform credits used to access features, send gifts, and take part in activities on the Service. YUYU are not a currency, not a security, not a cryptocurrency, not a deposit, and carry no monetary value outside the Service.",
    ],
    bullets: [
      "YUYU are licensed to you for personal use on the Service; they are not owned property and are non-transferable outside the mechanisms we provide.",
      "YUYU may not be sold, traded, gifted for consideration, or exchanged outside the Service. Off-platform trading voids the balance.",
      "Caakus may adjust pricing, feature costs, and conversion ratios prospectively, with notice posted on the Service.",
      "YUYU balances are forfeited without compensation when an account is terminated for a breach of these Terms.",
      "On voluntary account closure, unspent YUYU are cancelled and are not refundable in cash, except where mandatory local consumer law requires otherwise.",
    ],
  },
  {
    title: "8. Payments, subscriptions and recurring billing",
    body: [
      "Payments are processed by third-party payment processors, including CCBill and other authorised processors. Your purchase is also subject to the processor's own terms and privacy notice. Caakus does not store your full card details.",
      "Where you purchase a subscription, you expressly authorise recurring charges as described below, until you cancel.",
    ],
    bullets: [
      "Charges appear on your bank or card statement under the descriptor \"CCBILL.COM\" (or \"CCBill*Caakus\"), not under the name Caakus alone. The exact price, currency, billing period and renewal date are displayed on the checkout page before you confirm. By confirming, you consent to that exact recurring charge.",
      "Current plans: Caakus Student at USD 4.99 per month (recurring monthly), Caakus Regular at USD 21.99 per month (recurring monthly), and Founding Member at USD 299 as a one-time lifetime purchase (non-recurring, non-refundable once activated).",
      "Monthly subscriptions renew automatically every month at the then-current rate, using the payment method on file, until cancelled.",
      "You may cancel at any time from your account settings, through CCBill's consumer support portal at ccbill.com/consumer-support, or by emailing " + SUPPORT + ". Cancellation stops future renewals; it does not retroactively cancel the current period.",
      "Access to paid features continues until the end of the paid period already charged.",
      "A failed payment may result in retry attempts and suspension of paid features. Persistent failure terminates the subscription.",
      "Price changes are notified at least 14 days in advance and apply from the next renewal; continuing the subscription after that date constitutes acceptance.",
      "All prices exclude applicable taxes unless stated. You are responsible for taxes, bank charges, and currency conversion fees.",
    ],
  },
  {
    title: "9. Refunds and digital-goods policy",
    body: [
      "YUYU credits, gifts, and unlocked features are digital goods delivered instantly. By purchasing, you expressly request immediate delivery and acknowledge that you lose any statutory right of withdrawal once delivery has begun, to the extent permitted by law.",
    ],
    bullets: [
      "Purchases are final and non-refundable once credits are delivered or consumed, except where mandatory consumer law provides otherwise.",
      "Unauthorised, duplicate, or technically failed transactions are refunded on verification. Contact " + SUPPORT + " within 30 days with the transaction reference.",
      "Where a refund is granted, the corresponding YUYU, gifts, or benefits are removed from the account; any resulting negative balance must be settled before further purchases.",
      "Refunds are returned to the original payment method only.",
      "Our full Refund Policy forms part of these Terms.",
    ],
  },
  {
    title: "10. Chargebacks and payment-fraud protection",
    body: [
      "Filing a chargeback or payment dispute without first contacting " + SUPPORT + " is a material breach of these Terms and is treated as payment fraud where the services were in fact delivered.",
    ],
    bullets: [
      "You agree to contact " + SUPPORT + " and allow 5 business days for resolution before initiating any dispute with your bank or card issuer.",
      "On receipt of a chargeback, the account is immediately suspended, all YUYU and benefits are revoked, and pending payouts are frozen.",
      "Caakus and its processors will submit full transaction evidence to the issuer, including timestamps, IP addresses, device identifiers, delivery logs, and consent records.",
      "Fraudulent or abusive chargebacks may be referred to collection, reported to fraud-prevention networks used by our processors, and may result in a permanent ban across all Caakus services.",
      "Reinstatement after a reversed chargeback requires repayment of the disputed amount plus any processor fee incurred.",
    ],
  },
  {
    title: "11. Earnings, payouts and tax",
    body: [
      "Eligible users may convert qualifying activity into payouts, subject to identity verification (KYC), minimum thresholds, holding periods, and anti-fraud review.",
    ],
    bullets: [
      "Identity verification is mandatory before the first payout: a government-issued photo ID confirming that you are 18 or older, and where required, proof of address and tax details.",
      "The minimum payout amount is USD 20. Requests below that threshold remain in your balance until the threshold is reached.",
      "Earnings are subject to a 7-day holding period from the date they are credited, to allow for chargeback and fraud review. Payouts are normally released within 5 business days after the holding period.",
      "Payouts are withheld where activity appears fraudulent, self-dealing, collusive, or purchased with disputed funds.",
      "You are solely responsible for declaring and paying all taxes and social contributions on amounts received.",
      "Caakus may require tax documentation before releasing a payout and may withhold amounts where required by law.",
    ],
  },
  {
    title: "12. Intellectual property of Caakus Inc.",
    body: [
      `The Service, including the "Caakus" and "YUYU" names, logos, designs, interfaces, animations, text, software, matching and moderation systems, databases, and all derivative works, is the exclusive property of ${COMPANY} and its licensors, and is protected by copyright, trademark, trade-secret, and other intellectual-property laws worldwide.`,
    ],
    bullets: [
      "You receive a limited, revocable, non-exclusive, non-transferable licence to use the Service for personal, non-commercial purposes only.",
      "You may not copy, clone, frame, mirror, scrape, decompile, reverse engineer, or create derivative works from any part of the Service, except where such restriction is prohibited by law.",
      "You may not use the Caakus name, marks, or branding without prior written permission, except for the official embeddable widget which must retain its visible \"Powered by Caakus\" attribution link.",
      "Feedback and suggestions you submit may be used by Caakus without restriction or compensation.",
      "Infringement notices may be sent to " + SUPPORT + " with the information required under the DMCA; we operate a repeat-infringer termination policy.",
    ],
  },
  {
    title: "13. Privacy, data and lawful disclosure",
    body: [
      "Personal data is processed as described in our Privacy Policy. Caakus may retain and disclose account, payment, connection, and moderation data where required by law, court order, or a valid request from law enforcement, and where necessary to investigate abuse, fraud, or threats to safety.",
    ],
  },
  {
    title: "14. Service availability and changes",
    body: [
      "The Service is provided on an \"as is\" and \"as available\" basis. Caakus does not warrant uninterrupted availability, the behaviour of other users, or the outcome of any match. We may modify, suspend, or discontinue features at any time.",
    ],
  },
  {
    title: "15. Disclaimers and limitation of liability",
    body: [
      "To the maximum extent permitted by law, Caakus disclaims all implied warranties, including merchantability, fitness for a particular purpose and non-infringement. Caakus is not liable for the conduct of other users, whether online or offline.",
      `To the maximum extent permitted by law, the total aggregate liability of ${COMPANY} arising from or relating to the Service shall not exceed the greater of (a) the amounts you paid to Caakus in the three (3) months preceding the event giving rise to the claim, or (b) USD 100. Caakus shall not be liable for indirect, incidental, special, punitive, or consequential damages, or for loss of profit, data, or goodwill.`,
    ],
  },
  {
    title: "16. Indemnification",
    body: [
      `You agree to indemnify, defend and hold harmless ${COMPANY}, its officers, directors, employees, processors and partners from any claim, liability, damage, loss or expense, including reasonable legal fees, arising out of your use of the Service, your content, your breach of these Terms, or your violation of any law or third-party right.`,
    ],
  },
  {
    title: "17. Termination",
    body: [
      "You may close your account at any time from your settings. Caakus may suspend or terminate access immediately and without notice for any breach of these Terms, for legal or payment-compliance reasons, or to protect users.",
      "Termination does not affect accrued rights, including our right to retain records required for legal, tax, or anti-fraud purposes.",
    ],
  },
  {
    title: "18. Governing law, disputes and arbitration",
    body: [
      `These Terms are governed by the laws of the State of Delaware, United States of America, and, where applicable, by the federal laws of the United States, without regard to conflict-of-law rules. The United Nations Convention on Contracts for the International Sale of Goods does not apply. Any dispute shall first be submitted to good-faith negotiation by writing to ${SUPPORT}, and the parties shall allow thirty (30) days to reach a resolution.`,
      "If no resolution is reached, the dispute shall be settled by final and binding individual arbitration administered by the American Arbitration Association under its Consumer Arbitration Rules, seated in Delaware, conducted in English, and enforceable in any court of competent jurisdiction. You and Caakus waive any right to a jury trial and any right to participate in a class action or class arbitration.",
      "Nothing in this clause prevents either party from seeking injunctive relief for intellectual-property infringement or unauthorised access, from bringing an individual claim in small-claims court, or limits mandatory consumer rights that apply in your country of residence. Where arbitration is unenforceable, the state and federal courts located in Delaware shall have exclusive jurisdiction.",
    ],
  },
  {
    title: "19. Changes to these Terms",
    body: [
      "Caakus may update these Terms. Material changes are announced on the Service at least 14 days before they take effect. Continued use after the effective date constitutes acceptance. The current version is always available at caakus.com/terms-of-use.",
    ],
  },
  {
    title: "20. Miscellaneous and contact",
    body: [
      "If any provision is held unenforceable, the remainder stays in force. Our failure to enforce a provision is not a waiver. You may not assign these Terms; we may assign them in connection with a merger, acquisition, or sale of assets. These Terms, together with the Privacy Policy and Refund Policy, constitute the entire agreement between you and Caakus.",
      `${COMPANY} is a corporation organised under the laws of the State of Delaware, United States of America. Its registered office address and company registration number are available on written request to ${SUPPORT}.`,
      `Legal, support, billing, DMCA and copyright notices: ${SUPPORT}. Billing enquiries may also be addressed to CCBill consumer support at ccbill.com/consumer-support.`,
    ],
  },
];

export default function TermsOfUse() {
  return (
    <div className="min-h-screen w-full overflow-x-hidden bg-slate-950 text-white">
      <div className="pointer-events-none absolute left-1/2 top-0 h-[380px] w-[760px] -translate-x-1/2 rounded-full bg-violet-600/15 blur-[150px]" aria-hidden />

      <header className="sticky top-0 z-30 border-b border-white/[0.07] bg-black/70 backdrop-blur-2xl">
        <div className="mx-auto flex h-14 max-w-4xl items-center justify-between gap-3 px-4 sm:h-16 sm:px-6">
          <Link
            to="/"
            className="group flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.04] px-3.5 py-2 text-[11px] font-semibold uppercase tracking-[0.16em] text-white/50 transition-colors hover:border-white/25 hover:text-white"
          >
            <ArrowLeft className="h-3.5 w-3.5 transition-transform group-hover:-translate-x-0.5" />
            <span className="hidden sm:inline">Home</span>
          </Link>
          <span className="text-[11px] font-semibold uppercase tracking-[0.16em] text-white/50">Legal</span>
          <Link
            to="/support"
            className="rounded-full border border-violet-400/40 bg-violet-500/10 px-3.5 py-2 text-[11px] font-bold uppercase tracking-[0.16em] text-violet-200 transition-colors hover:bg-violet-500/20"
          >
            Support
          </Link>
        </div>
      </header>

      <main className="relative z-10 mx-auto max-w-4xl px-4 pb-24 pt-10 sm:px-6 sm:pt-14">
        <h1 className="text-[clamp(1.8rem,5.5vw,3rem)] font-black uppercase leading-[1.02] tracking-tight">
          Terms of Use
        </h1>
        <p className="mt-4 text-sm text-white/45">
          {COMPANY}, a Delaware corporation (USA) · Effective {EFFECTIVE_DATE} · Contact {SUPPORT} · Billing descriptor: CCBILL.COM
        </p>

        <div className="mt-8 rounded-2xl border border-red-500/30 bg-red-500/[0.07] p-5 text-sm leading-relaxed text-red-100/90">
          <strong className="font-bold">18+ only.</strong> Caakus is an adult platform with a zero-tolerance
          policy for minors. Any sexualisation of a minor results in immediate permanent termination and a
          report to NCMEC and law enforcement.
        </div>

        <nav className="mt-8 grid gap-2 rounded-2xl border border-white/10 bg-white/[0.03] p-5 sm:grid-cols-2">
          {CLAUSES.map((c) => (
            <a
              key={c.title}
              href={`#${slugify(c.title)}`}
              className="text-sm text-white/55 transition-colors hover:text-violet-200"
            >
              {c.title}
            </a>
          ))}
        </nav>

        <div className="mt-10 grid gap-8">
          {CLAUSES.map((c) => (
            <section key={c.title} id={slugify(c.title)} className="scroll-mt-24">
              <h2 className="text-lg font-black tracking-tight text-white sm:text-xl">{c.title}</h2>
              {c.body.map((p) => (
                <p key={p} className="mt-3 text-[15px] leading-relaxed text-white/60">
                  {p}
                </p>
              ))}
              {c.bullets ? (
                <ul className="mt-4 grid gap-2.5">
                  {c.bullets.map((b) => (
                    <li key={b} className="flex items-start gap-3 text-sm leading-relaxed text-white/65">
                      <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-violet-400" />
                      <span>{b}</span>
                    </li>
                  ))}
                </ul>
              ) : null}
            </section>
          ))}
        </div>

        <div className="mt-12 flex flex-wrap gap-3 text-sm">
          <Link to="/privacy" className="rounded-xl border border-white/10 bg-white/[0.04] px-4 py-2.5 text-white/70 hover:text-white">
            Privacy Policy
          </Link>
          <Link to="/refund-policy" className="rounded-xl border border-white/10 bg-white/[0.04] px-4 py-2.5 text-white/70 hover:text-white">
            Refund Policy
          </Link>
          <Link to="/terms-of-service" className="rounded-xl border border-white/10 bg-white/[0.04] px-4 py-2.5 text-white/70 hover:text-white">
            Terms of Service
          </Link>
        </div>
      </main>
    </div>
  );
}

function slugify(value: string) {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}
