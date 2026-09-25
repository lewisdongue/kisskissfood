import { ParticleBackground } from "@/components/ParticleBackground";
import { Button } from "@/components/ui/button";
import { useNavigate } from "@/lib/router-compat";
import {
  ArrowLeft,
  Shield,
  Lock,
  Eye,
  UserCheck,
  FileText,
  Mail,
  CreditCard,
  Database,
  Globe,
} from "lucide-react";

export default function PrivacyPolicy() {
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
                  Privacy Policy
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
                  <Shield className="w-8 h-8 text-white" strokeWidth={2.5} />
                </div>
              </div>
            </div>
            <h2 className="text-4xl md:text-5xl font-black mb-3 bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 bg-clip-text text-transparent drop-shadow-2xl tracking-tight leading-tight">
              Privacy Policy
            </h2>
            <p className="text-sm text-blue-200/70 font-medium mb-2">
              Last Updated: February 19, 2026
            </p>
            <p className="text-xs text-blue-300/60 max-w-2xl mx-auto">
              Your privacy is important to us. This policy explains how we collect, use, and protect your data.
            </p>
          </div>

          <div className="space-y-6 mb-10">
            <div className="bg-gradient-to-br from-white/8 to-white/[0.02] backdrop-blur-xl rounded-2xl p-6 shadow-xl border border-white/10 hover:border-white/20 transition-all duration-300 group">
              <div className="flex items-start gap-4 mb-4">
                <div className="relative flex-shrink-0">
                  <div className="absolute inset-0 bg-gradient-to-br from-blue-400 to-blue-600 rounded-xl blur-md opacity-50 group-hover:opacity-100 transition-opacity"></div>
                  <div className="relative w-12 h-12 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl flex items-center justify-center shadow-lg">
                    <FileText className="w-6 h-6 text-white" strokeWidth={2.5} />
                  </div>
                </div>
                <div className="flex-1">
                  <h2 className="text-xl font-bold text-white mb-3 tracking-tight">1. Introduction</h2>
                  <div className="text-blue-200/80 text-sm leading-relaxed space-y-2">
                    <p>Caakus Inc. ("we", "us", "our") operates www.caakus.com and associated mobile applications. This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you use our services.</p>
                    <p>By using Caakus, you agree to the collection and use of information in accordance with this policy.</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-gradient-to-br from-white/8 to-white/[0.02] backdrop-blur-xl rounded-2xl p-6 shadow-xl border border-white/10 hover:border-white/20 transition-all duration-300 group">
              <div className="flex items-start gap-4 mb-4">
                <div className="relative flex-shrink-0">
                  <div className="absolute inset-0 bg-gradient-to-br from-purple-400 to-purple-600 rounded-xl blur-md opacity-50 group-hover:opacity-100 transition-opacity"></div>
                  <div className="relative w-12 h-12 bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl flex items-center justify-center shadow-lg">
                    <Eye className="w-6 h-6 text-white" strokeWidth={2.5} />
                  </div>
                </div>
                <div className="flex-1">
                  <h2 className="text-xl font-bold text-white mb-3 tracking-tight">2. Information We Collect</h2>
                  <div className="text-blue-200/80 text-sm leading-relaxed space-y-3">
                    <div>
                      <h3 className="text-base font-semibold text-blue-100 mb-2">Personal Information:</h3>
                      <ul className="space-y-1.5">
                        <li className="flex items-start gap-2">
                          <span className="text-blue-400 mt-1">•</span>
                          <span>Name, email address, date of birth, phone number</span>
                        </li>
                        <li className="flex items-start gap-2">
                          <span className="text-blue-400 mt-1">•</span>
                          <span>Profile photo, bio, preferences</span>
                        </li>
                        <li className="flex items-start gap-2">
                          <span className="text-blue-400 mt-1">•</span>
                          <span>Payment information (processed securely by Stripe - we never store full card details)</span>
                        </li>
                        <li className="flex items-start gap-2">
                          <span className="text-blue-400 mt-1">•</span>
                          <span>Government ID for verification (encrypted and securely stored)</span>
                        </li>
                      </ul>
                    </div>
                    <div>
                      <h3 className="text-base font-semibold text-blue-100 mb-2">Automatically Collected Data:</h3>
                      <ul className="space-y-1.5">
                        <li className="flex items-start gap-2">
                          <span className="text-blue-400 mt-1">•</span>
                          <span>IP address, device type, browser type, operating system</span>
                        </li>
                        <li className="flex items-start gap-2">
                          <span className="text-blue-400 mt-1">•</span>
                          <span>Usage data: pages visited, features used, time spent</span>
                        </li>
                        <li className="flex items-start gap-2">
                          <span className="text-blue-400 mt-1">•</span>
                          <span>Location data (with your permission)</span>
                        </li>
                        <li className="flex items-start gap-2">
                          <span className="text-blue-400 mt-1">•</span>
                          <span>Cookies and tracking technologies</span>
                        </li>
                      </ul>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-gradient-to-br from-white/8 to-white/[0.02] backdrop-blur-xl rounded-2xl p-6 shadow-xl border border-white/10 hover:border-white/20 transition-all duration-300 group">
              <div className="flex items-start gap-4 mb-4">
                <div className="relative flex-shrink-0">
                  <div className="absolute inset-0 bg-gradient-to-br from-green-400 to-emerald-600 rounded-xl blur-md opacity-50 group-hover:opacity-100 transition-opacity"></div>
                  <div className="relative w-12 h-12 bg-gradient-to-br from-green-500 to-emerald-600 rounded-xl flex items-center justify-center shadow-lg">
                    <Database className="w-6 h-6 text-white" strokeWidth={2.5} />
                  </div>
                </div>
                <div className="flex-1">
                  <h2 className="text-xl font-bold text-white mb-3 tracking-tight">3. How We Use Your Information</h2>
                  <div className="text-blue-200/80 text-sm leading-relaxed space-y-2">
                    <p>We use your information to:</p>
                    <ul className="space-y-1.5 mt-2">
                      <li className="flex items-start gap-2">
                        <span className="text-blue-400 mt-1">•</span>
                        <span>Provide and maintain our services</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="text-blue-400 mt-1">•</span>
                        <span>Process payments and withdrawals through Stripe</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="text-blue-400 mt-1">•</span>
                        <span>Verify your identity and prevent fraud</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="text-blue-400 mt-1">•</span>
                        <span>Personalize your experience and match you with appropriate users</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="text-blue-400 mt-1">•</span>
                        <span>Send you notifications, updates, and promotional materials</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="text-blue-400 mt-1">•</span>
                        <span>Analyze usage patterns and improve our platform</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="text-blue-400 mt-1">•</span>
                        <span>Comply with legal obligations and enforce our Terms of Service</span>
                      </li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-gradient-to-br from-white/8 to-white/[0.02] backdrop-blur-xl rounded-2xl p-6 shadow-xl border border-white/10 hover:border-white/20 transition-all duration-300 group">
              <div className="flex items-start gap-4 mb-4">
                <div className="relative flex-shrink-0">
                  <div className="absolute inset-0 bg-gradient-to-br from-yellow-400 to-orange-600 rounded-xl blur-md opacity-50 group-hover:opacity-100 transition-opacity"></div>
                  <div className="relative w-12 h-12 bg-gradient-to-br from-yellow-500 to-orange-600 rounded-xl flex items-center justify-center shadow-lg">
                    <CreditCard className="w-6 h-6 text-white" strokeWidth={2.5} />
                  </div>
                </div>
                <div className="flex-1">
                  <h2 className="text-xl font-bold text-white mb-3 tracking-tight">4. Payment Processing (Stripe)</h2>
                  <div className="text-blue-200/80 text-sm leading-relaxed space-y-2">
                    <p><strong className="text-white">Third-Party Payment Processor:</strong> All payments are processed by Stripe, Inc., a PCI-DSS Level 1 certified payment processor. We never store your full credit card details on our servers.</p>
                    <p><strong className="text-white">Information Shared with Stripe:</strong> When you make a payment, we share your name, email, and transaction amount with Stripe. Stripe independently collects payment card information.</p>
                    <p><strong className="text-white">Stripe Privacy Policy:</strong> Your payment information is subject to Stripe's Privacy Policy at <a href="https://stripe.com/privacy" target="_blank" rel="noopener noreferrer" className="text-purple-400 hover:underline">stripe.com/privacy</a></p>
                    <p><strong className="text-white">Transaction Records:</strong> We retain transaction IDs, amounts, dates, and statuses for accounting, tax compliance, and dispute resolution purposes.</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-gradient-to-br from-white/8 to-white/[0.02] backdrop-blur-xl rounded-2xl p-6 shadow-xl border border-white/10 hover:border-white/20 transition-all duration-300 group">
              <div className="flex items-start gap-4 mb-4">
                <div className="relative flex-shrink-0">
                  <div className="absolute inset-0 bg-gradient-to-br from-pink-400 to-pink-600 rounded-xl blur-md opacity-50 group-hover:opacity-100 transition-opacity"></div>
                  <div className="relative w-12 h-12 bg-gradient-to-br from-pink-500 to-pink-600 rounded-xl flex items-center justify-center shadow-lg">
                    <Lock className="w-6 h-6 text-white" strokeWidth={2.5} />
                  </div>
                </div>
                <div className="flex-1">
                  <h2 className="text-xl font-bold text-white mb-3 tracking-tight">5. Data Security</h2>
                  <div className="text-blue-200/80 text-sm leading-relaxed space-y-2">
                    <p><strong className="text-white">Encryption:</strong> All data transmission is encrypted using TLS 1.3. Video calls run peer-to-peer over encrypted WebRTC (DTLS-SRTP) on our own TURN infrastructure.</p>
                    <p><strong className="text-white">Storage:</strong> Data is stored on secure servers with AES-256 encryption at rest.</p>
                    <p><strong className="text-white">Certifications:</strong> SOC 2 Type II certified, GDPR compliant, CCPA compliant.</p>
                    <p><strong className="text-white">Access Control:</strong> Strict employee access controls with two-factor authentication and audit logging.</p>
                    <p><strong className="text-white">No Breach Promise:</strong> While we implement industry-leading security measures, no method is 100% secure. We will notify you within 72 hours if a breach affects your data.</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-gradient-to-br from-white/8 to-white/[0.02] backdrop-blur-xl rounded-2xl p-6 shadow-xl border border-white/10 hover:border-white/20 transition-all duration-300 group">
              <div className="flex items-start gap-4 mb-4">
                <div className="relative flex-shrink-0">
                  <div className="absolute inset-0 bg-gradient-to-br from-indigo-400 to-indigo-600 rounded-xl blur-md opacity-50 group-hover:opacity-100 transition-opacity"></div>
                  <div className="relative w-12 h-12 bg-gradient-to-br from-indigo-500 to-indigo-600 rounded-xl flex items-center justify-center shadow-lg">
                    <UserCheck className="w-6 h-6 text-white" strokeWidth={2.5} />
                  </div>
                </div>
                <div className="flex-1">
                  <h2 className="text-xl font-bold text-white mb-3 tracking-tight">6. Your Privacy Rights</h2>
                  <div className="text-blue-200/80 text-sm leading-relaxed space-y-2">
                    <p>You have the right to:</p>
                    <ul className="space-y-1.5 mt-2">
                      <li className="flex items-start gap-2">
                        <span className="text-blue-400 mt-1">•</span>
                        <span><strong className="text-white">Access:</strong> Request a copy of your personal data</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="text-blue-400 mt-1">•</span>
                        <span><strong className="text-white">Correction:</strong> Update inaccurate or incomplete data</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="text-blue-400 mt-1">•</span>
                        <span><strong className="text-white">Deletion:</strong> Request deletion of your data (account deletion)</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="text-blue-400 mt-1">•</span>
                        <span><strong className="text-white">Portability:</strong> Receive your data in a structured, machine-readable format</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="text-blue-400 mt-1">•</span>
                        <span><strong className="text-white">Opt-Out:</strong> Unsubscribe from marketing communications</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="text-blue-400 mt-1">•</span>
                        <span><strong className="text-white">Object:</strong> Object to processing of your data for certain purposes</span>
                      </li>
                    </ul>
                    <p className="mt-3">To exercise these rights, email hello@caakus.com with your request. We will respond within 30 days.</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-gradient-to-br from-white/8 to-white/[0.02] backdrop-blur-xl rounded-2xl p-6 shadow-xl border border-white/10 hover:border-white/20 transition-all duration-300 group">
              <div className="flex items-start gap-4 mb-4">
                <div className="relative flex-shrink-0">
                  <div className="absolute inset-0 bg-gradient-to-br from-cyan-400 to-blue-600 rounded-xl blur-md opacity-50 group-hover:opacity-100 transition-opacity"></div>
                  <div className="relative w-12 h-12 bg-gradient-to-br from-cyan-500 to-blue-600 rounded-xl flex items-center justify-center shadow-lg">
                    <Globe className="w-6 h-6 text-white" strokeWidth={2.5} />
                  </div>
                </div>
                <div className="flex-1">
                  <h2 className="text-xl font-bold text-white mb-3 tracking-tight">7. Data Sharing & Third Parties</h2>
                  <div className="text-blue-200/80 text-sm leading-relaxed space-y-2">
                    <p><strong className="text-white">We DO NOT sell your personal data.</strong> We may share data with:</p>
                    <ul className="space-y-1.5 mt-2">
                      <li className="flex items-start gap-2">
                        <span className="text-blue-400 mt-1">•</span>
                        <span><strong className="text-white">Stripe:</strong> Payment processing (name, email, transaction details)</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="text-blue-400 mt-1">•</span>
                        <span><strong className="text-white">Caakus TURN (self-hosted):</strong> Peer-to-peer video relay infrastructure (no personal data, only technical data)</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="text-blue-400 mt-1">•</span>
                        <span><strong className="text-white">Analytics Providers:</strong> Anonymized usage statistics (Google Analytics, Mixpanel)</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="text-blue-400 mt-1">•</span>
                        <span><strong className="text-white">Law Enforcement:</strong> When legally required or to protect rights and safety</span>
                      </li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="grid md:grid-cols-2 gap-5 mb-10">
            <div className="bg-gradient-to-br from-white/5 to-white/[0.02] backdrop-blur-xl rounded-xl p-5 shadow-lg border border-white/10">
              <h3 className="text-lg font-bold text-white mb-2 tracking-tight">Data Retention</h3>
              <p className="text-blue-200/70 text-sm leading-relaxed">
                We retain your data as long as your account is active. After deletion, we retain transaction records for 7 years (legal requirement) and anonymized data indefinitely for analytics.
              </p>
            </div>

            <div className="bg-gradient-to-br from-white/5 to-white/[0.02] backdrop-blur-xl rounded-xl p-5 shadow-lg border border-white/10">
              <h3 className="text-lg font-bold text-white mb-2 tracking-tight">Cookies & Tracking</h3>
              <p className="text-blue-200/70 text-sm leading-relaxed">
                We use essential cookies for functionality, analytics cookies for usage insights, and advertising cookies for targeted ads. You can disable non-essential cookies in your browser settings.
              </p>
            </div>

            <div className="bg-gradient-to-br from-white/5 to-white/[0.02] backdrop-blur-xl rounded-xl p-5 shadow-lg border border-white/10">
              <h3 className="text-lg font-bold text-white mb-2 tracking-tight">Children's Privacy</h3>
              <p className="text-blue-200/70 text-sm leading-relaxed">
                Caakus is only for users 18+. We do not knowingly collect data from minors. If we discover a minor's account, we immediately terminate it and delete all associated data.
              </p>
            </div>

            <div className="bg-gradient-to-br from-white/5 to-white/[0.02] backdrop-blur-xl rounded-xl p-5 shadow-lg border border-white/10">
              <h3 className="text-lg font-bold text-white mb-2 tracking-tight">International Transfers</h3>
              <p className="text-blue-200/70 text-sm leading-relaxed">
                Your data may be transferred to servers in the United States and other countries. We use Standard Contractual Clauses approved by the EU Commission to protect international transfers.
              </p>
            </div>

            <div className="bg-gradient-to-br from-white/5 to-white/[0.02] backdrop-blur-xl rounded-xl p-5 shadow-lg border border-white/10">
              <h3 className="text-lg font-bold text-white mb-2 tracking-tight">AI Moderation</h3>
              <p className="text-blue-200/70 text-sm leading-relaxed">
                We use AI to moderate content for safety. Video frames may be analyzed (not stored) to detect violations. Human moderators may review flagged content.
              </p>
            </div>

            <div className="bg-gradient-to-br from-white/5 to-white/[0.02] backdrop-blur-xl rounded-xl p-5 shadow-lg border border-white/10">
              <h3 className="text-lg font-bold text-white mb-2 tracking-tight">Policy Changes</h3>
              <p className="text-blue-200/70 text-sm leading-relaxed">
                We may update this Privacy Policy. Material changes will be notified via email or in-app notification. Continued use after changes constitutes acceptance.
              </p>
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
                    Contact Us About Privacy
                  </h2>
                  <p className="text-blue-50 text-sm leading-relaxed mb-4">
                    Questions about this Privacy Policy or how we handle your data?
                  </p>
                  <div className="space-y-2 mb-5">
                    <p className="text-white text-sm">
                      <strong className="font-semibold">General Privacy:</strong>{' '}
                      <a
                        href="mailto:hello@caakus.com"
                        className="text-white hover:underline"
                      >
                        hello@caakus.com
                      </a>
                    </p>
                    <p className="text-white text-sm">
                      <strong className="font-semibold">GDPR/Data Protection:</strong>{' '}
                      <a
                        href="mailto:privacy@caakus.com"
                        className="text-white hover:underline"
                      >
                        privacy@caakus.com
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
                      onClick={() => navigate("/terms-of-service")}
                      className="border-2 border-white bg-transparent text-white hover:bg-white/10 font-semibold px-6 py-2 rounded-xl"
                    >
                      Terms of Service
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="mt-8 text-center text-xs text-blue-300/60">
            <p>By using Caakus, you acknowledge that you have read and understand this Privacy Policy.</p>
            <p className="mt-2">© 2026 Caakus Inc. All rights reserved.</p>
          </div>
        </main>
      </div>
    </>
  );
}
