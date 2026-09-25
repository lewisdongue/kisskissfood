import { ParticleBackground } from "@/components/ParticleBackground";
import { Button } from "@/components/ui/button";
import { useNavigate } from "@/lib/router-compat";
import {
  ArrowLeft,
  FileText,
  Shield,
  Users,
  UserCheck,
  Coins,
  CreditCard,
  DollarSign,
  Lock,
  Ban,
  AlertTriangle,
  Scale,
  Mail,
} from "lucide-react";

export default function TermsOfService() {
  const navigate = useNavigate();

  return (
    <>

      <ParticleBackground />
      
      <div className="min-h-screen w-full overflow-x-hidden relative z-10">
        <header className="sticky top-0 z-50 w-full border-b border-white/10 bg-slate-900/60 backdrop-blur-2xl shadow-2xl">
          <div className="container mx-auto px-4">
            <div className="flex h-16 items-center gap-3">
              <button
                onClick={() => navigate("/")}
                className="rounded-full p-2 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-400 hover:bg-white/10 transition-all duration-200 group"
                aria-label="Back to home"
              >
                <ArrowLeft className="h-5 w-5 text-white group-hover:-translate-x-1 transition-transform" />
              </button>
              <div className="relative group animate-fade-in">
                <div className="absolute inset-0 bg-gradient-to-br from-blue-400 via-blue-500 to-indigo-600 rounded-xl blur-lg opacity-60 group-hover:opacity-100 transition-all duration-300"></div>
                <div className="relative w-10 h-10 rounded-xl flex items-center justify-center shadow-2xl ring-2 ring-white/20 bg-white/0 overflow-hidden">
                  <img
                    src="/logo.webp"
                    alt="Caakus Logo"
                    className="w-8 h-8 object-contain"
                  />
                </div>
              </div>
              <div className="ml-1">
                <h2 className="text-lg font-black bg-gradient-to-r from-blue-400 via-blue-300 to-indigo-400 bg-clip-text text-transparent tracking-tight">
                  Caakus
                </h2>
                <p className="text-xs text-blue-200/70 font-medium">
                  Terms of Service
                </p>
              </div>
            </div>
          </div>
        </header>

        <main className="container mx-auto px-4 py-12 max-w-5xl relative z-10">
          <div className="text-center mb-12 animate-fade-in-up">
            <div className="inline-block mb-4">
              <div className="relative">
                <div className="absolute inset-0 bg-gradient-to-br from-blue-400 to-indigo-600 rounded-2xl blur-xl opacity-60"></div>
                <div className="relative w-16 h-16 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-2xl flex items-center justify-center shadow-2xl">
                  <Scale className="w-8 h-8 text-white" strokeWidth={2.5} />
                </div>
              </div>
            </div>
            <h2 className="text-4xl md:text-5xl font-black mb-3 bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 bg-clip-text text-transparent drop-shadow-2xl tracking-tight leading-tight">
              Terms of Service
            </h2>
            <p className="text-sm text-blue-200/70 font-medium mb-2">
              Last Updated: February 19, 2026
            </p>
            <p className="text-xs text-blue-300/60 max-w-2xl mx-auto">
              Please read these Terms of Service carefully before using Caakus.
            </p>
          </div>

          <div className="space-y-6 mb-10">
            <div className="bg-gradient-to-br from-white/8 to-white/[0.02] backdrop-blur-xl rounded-2xl p-6 shadow-xl border border-white/10 hover:border-white/20 transition-all duration-300 group">
              <div className="flex items-start gap-4 mb-4">
                <div className="relative flex-shrink-0">
                  <div className="absolute inset-0 bg-gradient-to-br from-blue-400 to-indigo-600 rounded-xl blur-md opacity-50 group-hover:opacity-100 transition-opacity"></div>
                  <div className="relative w-12 h-12 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center shadow-lg">
                    <FileText className="w-6 h-6 text-white" strokeWidth={2.5} />
                  </div>
                </div>
                <div className="flex-1">
                  <h2 className="text-xl font-bold text-white mb-3 tracking-tight">1. Agreement to Terms</h2>
                  <div className="text-blue-200/80 text-sm leading-relaxed space-y-2">
                    <p>By creating an account or using Caakus services, you agree to comply with and be bound by these Terms of Service, our Privacy Policy, Community Guidelines, and Refund Policy.</p>
                    <p>We reserve the right to modify these terms at any time. Changes will be effective immediately upon posting.</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-gradient-to-br from-white/8 to-white/[0.02] backdrop-blur-xl rounded-2xl p-6 shadow-xl border border-white/10 hover:border-white/20 transition-all duration-300 group">
              <div className="flex items-start gap-4 mb-4">
                <div className="relative flex-shrink-0">
                  <div className="absolute inset-0 bg-gradient-to-br from-purple-400 to-pink-600 rounded-xl blur-md opacity-50 group-hover:opacity-100 transition-opacity"></div>
                  <div className="relative w-12 h-12 bg-gradient-to-br from-purple-500 to-pink-600 rounded-xl flex items-center justify-center shadow-lg">
                    <UserCheck className="w-6 h-6 text-white" strokeWidth={2.5} />
                  </div>
                </div>
                <div className="flex-1">
                  <h2 className="text-xl font-bold text-white mb-3 tracking-tight">2. Eligibility</h2>
                  <div className="text-blue-200/80 text-sm leading-relaxed space-y-2">
                    <p><strong className="text-white">Strictly 18+ — No Minors:</strong> Caakus is reserved for adults aged 18 or over. Minors are strictly forbidden from creating an account or appearing on any video, voice or chat stream. Any account suspected of belonging to, or exposing, a minor is terminated immediately and irreversibly, and reported to the competent authorities where the law requires it.</p>
                    <p><strong className="text-white">Zero Nudity &amp; Zero Sexual Content:</strong> Nudity, partial nudity, sexual acts, sexually suggestive behaviour and any pornographic material are strictly prohibited anywhere on Caakus. Violations lead to instant disconnection, permanent ban and forfeiture of any pending balance.</p>
                    <p><strong className="text-white">Account Security:</strong> You are responsible for maintaining the confidentiality of your account credentials.</p>
                    <p><strong className="text-white">One Account Per Person:</strong> Each individual may maintain only one Caakus account.</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-gradient-to-br from-white/8 to-white/[0.02] backdrop-blur-xl rounded-2xl p-6 shadow-xl border border-white/10 hover:border-white/20 transition-all duration-300 group">
              <div className="flex items-start gap-4 mb-4">
                <div className="relative flex-shrink-0">
                  <div className="absolute inset-0 bg-gradient-to-br from-green-400 to-emerald-600 rounded-xl blur-md opacity-50 group-hover:opacity-100 transition-opacity"></div>
                  <div className="relative w-12 h-12 bg-gradient-to-br from-green-500 to-emerald-600 rounded-xl flex items-center justify-center shadow-lg">
                    <Users className="w-6 h-6 text-white" strokeWidth={2.5} />
                  </div>
                </div>
                <div className="flex-1">
                  <h2 className="text-xl font-bold text-white mb-3 tracking-tight">3. User Conduct</h2>
                  <div className="text-blue-200/80 text-sm leading-relaxed space-y-2">
                    <p><strong className="text-white">Prohibited Conduct:</strong> You agree NOT to share nude, sexual or otherwise explicit content, NOT to involve or depict minors, engage in harassment, impersonate others, spam, use bots, or violate any laws.</p>
                    <p><strong className="text-white">Content Moderation:</strong> Caakus employs AI-powered moderation systems operating 24/7.</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-gradient-to-br from-white/8 to-white/[0.02] backdrop-blur-xl rounded-2xl p-6 shadow-xl border border-white/10 hover:border-white/20 transition-all duration-300 group">
              <div className="flex items-start gap-4 mb-4">
                <div className="relative flex-shrink-0">
                  <div className="absolute inset-0 bg-gradient-to-br from-yellow-400 to-orange-600 rounded-xl blur-md opacity-50 group-hover:opacity-100 transition-opacity"></div>
                  <div className="relative w-12 h-12 bg-gradient-to-br from-yellow-500 to-orange-600 rounded-xl flex items-center justify-center shadow-lg">
                    <Coins className="w-6 h-6 text-white" strokeWidth={2.5} />
                  </div>
                </div>
                <div className="flex-1">
                  <h2 className="text-xl font-bold text-white mb-3 tracking-tight">4. Digital Goods</h2>
                  <div className="text-blue-200/80 text-sm leading-relaxed space-y-2">
                    <p><strong className="text-red-300">YUYU Cryptocurrency:</strong> All YUYU coin purchases are FINAL and NON-REFUNDABLE once delivered.</p>
                    <p><strong className="text-red-300">Virtual Gifts:</strong> Virtual gifts are NON-REFUNDABLE once sent to a recipient.</p>
                    <p><strong className="text-white">Premium Subscriptions:</strong> Subject to our 7-day money-back guarantee for first-time purchases. See our <a href="/refund-policy" className="text-purple-400 hover:underline">Refund Policy</a>.</p>
                    <p><strong className="text-white">Exception:</strong> Refunds only for technical errors preventing delivery (report within 48 hours to hello@caakus.com).</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-gradient-to-br from-white/8 to-white/[0.02] backdrop-blur-xl rounded-2xl p-6 shadow-xl border border-white/10 hover:border-white/20 transition-all duration-300 group">
              <div className="flex items-start gap-4 mb-4">
                <div className="relative flex-shrink-0">
                  <div className="absolute inset-0 bg-gradient-to-br from-red-400 to-pink-600 rounded-xl blur-md opacity-50 group-hover:opacity-100 transition-opacity"></div>
                  <div className="relative w-12 h-12 bg-gradient-to-br from-red-500 to-pink-600 rounded-xl flex items-center justify-center shadow-lg">
                    <CreditCard className="w-6 h-6 text-white" strokeWidth={2.5} />
                  </div>
                </div>
                <div className="flex-1">
                  <h2 className="text-xl font-bold text-white mb-3 tracking-tight">5. Payment Terms & Chargeback Policy</h2>
                  <div className="text-blue-200/80 text-sm leading-relaxed space-y-2">
                    <p><strong className="text-white">Payment Processing:</strong> All payments processed securely through Stripe.</p>
                    <div className="bg-red-500/10 rounded-xl p-4 border border-red-400/30 my-3">
                      <p className="text-red-300 font-bold mb-2">CHARGEBACK WARNING:</p>
                      <p className="text-red-200">Filing a chargeback without contacting support WILL result in:</p>
                      <ul className="list-disc list-inside space-y-1 ml-4 mt-2">
                        <li>Immediate account suspension</li>
                        <li>Permanent ban from Caakus</li>
                        <li>Forfeiture of all account balances</li>
                      </ul>
                      <p className="mt-3 text-yellow-200 font-semibold">ALWAYS contact hello@caakus.com FIRST before filing any payment dispute.</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-gradient-to-br from-white/8 to-white/[0.02] backdrop-blur-xl rounded-2xl p-6 shadow-xl border border-white/10 hover:border-white/20 transition-all duration-300 group">
              <div className="flex items-start gap-4 mb-4">
                <div className="relative flex-shrink-0">
                  <div className="absolute inset-0 bg-gradient-to-br from-green-400 to-teal-600 rounded-xl blur-md opacity-50 group-hover:opacity-100 transition-opacity"></div>
                  <div className="relative w-12 h-12 bg-gradient-to-br from-green-500 to-teal-600 rounded-xl flex items-center justify-center shadow-lg">
                    <DollarSign className="w-6 h-6 text-white" strokeWidth={2.5} />
                  </div>
                </div>
                <div className="flex-1">
                  <h2 className="text-xl font-bold text-white mb-3 tracking-tight">6. Earnings & Withdrawals</h2>
                  <div className="text-blue-200/80 text-sm leading-relaxed space-y-2">
                    <p><strong className="text-white">Minimum Withdrawal:</strong> $10 USD (5,000 YUYU coins)</p>
                    <p><strong className="text-white">Withdrawal Methods:</strong> PayPal, Bank Transfer, Cryptocurrency Wallet, Venmo/Cash App</p>
                    <p><strong className="text-white">Processing Time:</strong> 24-48 hours for first withdrawal, instant for subsequent</p>
                    <p><strong className="text-white">Tax Obligations:</strong> You are responsible for reporting and paying taxes on earnings</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-gradient-to-br from-white/8 to-white/[0.02] backdrop-blur-xl rounded-2xl p-6 shadow-xl border border-white/10 hover:border-white/20 transition-all duration-300 group">
              <div className="flex items-start gap-4 mb-4">
                <div className="relative flex-shrink-0">
                  <div className="absolute inset-0 bg-gradient-to-br from-indigo-400 to-purple-600 rounded-xl blur-md opacity-50 group-hover:opacity-100 transition-opacity"></div>
                  <div className="relative w-12 h-12 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-xl flex items-center justify-center shadow-lg">
                    <Lock className="w-6 h-6 text-white" strokeWidth={2.5} />
                  </div>
                </div>
                <div className="flex-1">
                  <h2 className="text-xl font-bold text-white mb-3 tracking-tight">7. Privacy & Data Protection</h2>
                  <div className="text-blue-200/80 text-sm leading-relaxed space-y-2">
                    <p>Your use of Caakus is governed by our <a href="/privacy" className="text-purple-400 hover:underline">Privacy Policy</a>.</p>
                    <p><strong className="text-white">Data Security:</strong> End-to-end encryption, SOC 2 Type II certified, GDPR compliant</p>
                    <p><strong className="text-white">No Data Selling:</strong> We never sell your personal data to third parties</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-gradient-to-br from-white/8 to-white/[0.02] backdrop-blur-xl rounded-2xl p-6 shadow-xl border border-white/10 hover:border-white/20 transition-all duration-300 group">
              <div className="flex items-start gap-4 mb-4">
                <div className="relative flex-shrink-0">
                  <div className="absolute inset-0 bg-gradient-to-br from-red-400 to-orange-600 rounded-xl blur-md opacity-50 group-hover:opacity-100 transition-opacity"></div>
                  <div className="relative w-12 h-12 bg-gradient-to-br from-red-500 to-orange-600 rounded-xl flex items-center justify-center shadow-lg">
                    <Ban className="w-6 h-6 text-white" strokeWidth={2.5} />
                  </div>
                </div>
                <div className="flex-1">
                  <h2 className="text-xl font-bold text-white mb-3 tracking-tight">8. Account Termination</h2>
                  <div className="text-blue-200/80 text-sm leading-relaxed space-y-2">
                    <p><strong className="text-white">Termination by You:</strong> Delete your account anytime from Settings</p>
                    <p><strong className="text-white">Termination by Caakus:</strong> We may suspend or terminate accounts for violations, fraud, chargebacks, harassment, or illegal activity</p>
                    <p><strong className="text-white">Appeals:</strong> Email hello@caakus.com within 30 days if you believe termination was in error</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-gradient-to-br from-white/8 to-white/[0.02] backdrop-blur-xl rounded-2xl p-6 shadow-xl border border-white/10 hover:border-white/20 transition-all duration-300 group">
              <div className="flex items-start gap-4 mb-4">
                <div className="relative flex-shrink-0">
                  <div className="absolute inset-0 bg-gradient-to-br from-yellow-400 to-red-600 rounded-xl blur-md opacity-50 group-hover:opacity-100 transition-opacity"></div>
                  <div className="relative w-12 h-12 bg-gradient-to-br from-yellow-500 to-red-600 rounded-xl flex items-center justify-center shadow-lg">
                    <AlertTriangle className="w-6 h-6 text-white" strokeWidth={2.5} />
                  </div>
                </div>
                <div className="flex-1">
                  <h2 className="text-xl font-bold text-white mb-3 tracking-tight">9. Disclaimers & Limitations</h2>
                  <div className="text-blue-200/80 text-sm leading-relaxed space-y-2">
                    <p><strong className="text-white">AS-IS BASIS:</strong> Caakus is provided without warranties of any kind</p>
                    <p><strong className="text-white">No Guarantees:</strong> We do not guarantee uninterrupted service or specific earnings</p>
                    <p><strong className="text-white">Limitation of Liability:</strong> Our liability is limited to amounts you paid in the past 12 months or $100, whichever is greater</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-gradient-to-br from-white/8 to-white/[0.02] backdrop-blur-xl rounded-2xl p-6 shadow-xl border border-white/10 hover:border-white/20 transition-all duration-300 group">
              <div className="flex items-start gap-4 mb-4">
                <div className="relative flex-shrink-0">
                  <div className="absolute inset-0 bg-gradient-to-br from-purple-400 to-blue-600 rounded-xl blur-md opacity-50 group-hover:opacity-100 transition-opacity"></div>
                  <div className="relative w-12 h-12 bg-gradient-to-br from-purple-500 to-blue-600 rounded-xl flex items-center justify-center shadow-lg">
                    <Scale className="w-6 h-6 text-white" strokeWidth={2.5} />
                  </div>
                </div>
                <div className="flex-1">
                  <h2 className="text-xl font-bold text-white mb-3 tracking-tight">10. Dispute Resolution</h2>
                  <div className="text-blue-200/80 text-sm leading-relaxed space-y-2">
                    <p><strong className="text-white">Informal Resolution:</strong> Contact hello@caakus.com first to attempt resolution</p>
                    <p><strong className="text-white">Binding Arbitration:</strong> Disputes resolved through arbitration rather than court</p>
                    <p><strong className="text-white">Governing Law:</strong> Delaware, United States</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-gradient-to-br from-blue-600 via-blue-500 to-indigo-600 rounded-2xl p-8 shadow-2xl border border-blue-400/20 relative overflow-hidden group">
            <div className="absolute inset-0 bg-gradient-to-br from-white/0 via-white/5 to-white/0 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
            <div className="relative z-10">
              <div className="flex items-start gap-4 mb-5">
                <div className="relative flex-shrink-0">
                  <div className="absolute inset-0 bg-white rounded-xl blur-md opacity-30"></div>
                  <div className="relative w-12 h-12 bg-white/20 backdrop-blur-sm rounded-xl flex items-center justify-center shadow-lg border border-white/30">
                    <Mail className="w-6 h-6 text-white" strokeWidth={2.5} />
                  </div>
                </div>
                <div>
                  <h2 className="text-2xl font-black mb-2 text-white tracking-tight">
                    Questions About These Terms?
                  </h2>
                  <p className="text-blue-50 text-sm leading-relaxed mb-4">
                    If you have any questions or concerns, please contact us.
                  </p>
                  <div className="space-y-2 mb-5">
                    <p className="text-white text-sm">
                      <strong className="font-semibold">General Support:</strong>{' '}
                      <a
                        href="mailto:hello@caakus.com"
                        className="text-white hover:underline"
                      >
                        hello@caakus.com
                      </a>
                    </p>
                    <p className="text-white text-sm">
                      <strong className="font-semibold">Company:</strong> Caakus Inc., Delaware, USA
                    </p>
                  </div>
                  <div className="flex flex-wrap gap-3">
                    <Button
                      onClick={() => navigate("/contact")}
                      className="bg-white text-blue-600 hover:bg-blue-50 font-semibold px-6 py-2 rounded-xl shadow-lg hover:shadow-xl hover:scale-105 transition-all"
                    >
                      Contact Us
                    </Button>
                    <Button
                      onClick={() => navigate("/refund-policy")}
                      className="border-2 border-white bg-transparent text-white hover:bg-white/10 font-semibold px-6 py-2 rounded-xl"
                    >
                      Refund Policy
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="mt-8 text-center text-xs text-blue-300/60">
            <p>By using Caakus, you acknowledge that you have read and agree to these Terms of Service.</p>
            <p className="mt-2">© 2026 Caakus Inc. All rights reserved.</p>
          </div>
        </main>
      </div>
    </>
  );
}
