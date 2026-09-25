import React, { useEffect } from 'react';
import { Link } from '@/lib/router-compat';
import { ArrowLeft, Home, RefreshCw, CreditCard, Shield, AlertCircle, Mail, Clock, CheckCircle, XCircle } from 'lucide-react';
import { ParticleBackground } from "@/components/ParticleBackground";

const RefundPolicy: React.FC = () => {
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  return (
    <>

      <ParticleBackground />

      <div className="min-h-screen w-full overflow-x-hidden relative z-10 font-sans text-white antialiased">
        <nav className="fixed top-0 left-0 right-0 z-50 bg-[#020617]/95 backdrop-blur-xl shadow-2xl shadow-black/30 border-b border-white/10">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3 sm:py-4">
            <div className="flex justify-between items-center">
              <div className="flex items-center gap-3 sm:gap-4">
                <Link to="/" className="flex items-center gap-1.5 text-white/70 hover:text-white transition-colors group">
                  <ArrowLeft className="w-4 h-4 group-hover:-translate-x-0.5 transition-transform" />
                  <Home className="w-4 h-4" />
                </Link>
                <div className="w-px h-5 bg-white/20" />
                <Link to="/" className="flex items-center gap-2 group">
                  <div className="relative">
                    <div className="absolute inset-0 bg-gradient-to-br from-purple-500 via-pink-500 to-orange-500 rounded-lg blur-lg opacity-70 group-hover:opacity-100 transition-opacity" />
                    <div className="relative w-8 h-8 rounded-lg flex items-center justify-center overflow-hidden">
                      <img src="/logo.webp" alt="Caakus Logo" className="w-6 h-6 object-contain" />
                    </div>
                  </div>
                  <span className="font-black text-xl sm:text-2xl tracking-tighter bg-gradient-to-r from-white to-white/90 bg-clip-text text-transparent">CAAKUS</span>
                </Link>
              </div>
              <Link to="/" className="px-6 py-2.5 bg-gradient-to-r from-purple-600 via-pink-500 to-orange-500 text-white rounded-lg font-bold text-sm hover:shadow-2xl hover:shadow-purple-500/40 hover:scale-105 transition-all">
                Back to Home
              </Link>
            </div>
          </div>
        </nav>

        <main className="pt-32 pb-24 px-4 sm:px-6">
          <div className="max-w-4xl mx-auto">
            <div className="text-center mb-16">
              <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-blue-500 to-indigo-500 rounded-2xl mb-6 shadow-2xl">
                <RefreshCw className="w-10 h-10 text-white" />
              </div>
              <h2 className="text-4xl sm:text-5xl md:text-6xl font-black text-white mb-4">Refund & Cancellation Policy</h2>
              <p className="text-xl text-slate-300">Last Updated: February 19, 2026</p>
            </div>

            <div className="bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-xl border border-white/10 rounded-3xl p-8 sm:p-12 mb-8 shadow-2xl">
              <div className="prose prose-invert prose-lg max-w-none">
                <div className="mb-12">
                  <div className="flex items-start gap-4 mb-6">
                    <div className="w-12 h-12 bg-gradient-to-br from-yellow-500 to-orange-500 rounded-xl flex items-center justify-center flex-shrink-0">
                      <CreditCard className="w-6 h-6 text-white" />
                    </div>
                    <div className="flex-1">
                      <h2 className="text-2xl font-black text-white mb-4">1. Yuyu Purchases</h2>
                      <div className="space-y-3 text-slate-300">
                        <div className="flex items-start gap-3">
                          <XCircle className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" />
                          <p className="mb-0"><strong className="text-white">Non-refundable once purchased.</strong> YUYU coins are internal platform rewards (digital assets) that cannot be returned once delivered to your account.</p>
                        </div>
                        <div className="flex items-start gap-3">
                          <CheckCircle className="w-5 h-5 text-green-400 flex-shrink-0 mt-0.5" />
                          <p className="mb-0"><strong className="text-white">Exception:</strong> Technical errors preventing coin delivery will be refunded within 48 hours. Contact support immediately if coins don't appear in your wallet within 10 minutes.</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="mb-12">
                  <div className="flex items-start gap-4 mb-6">
                    <div className="w-12 h-12 bg-gradient-to-br from-pink-500 to-rose-500 rounded-xl flex items-center justify-center flex-shrink-0">
                      <Shield className="w-6 h-6 text-white" />
                    </div>
                    <div className="flex-1">
                      <h2 className="text-2xl font-black text-white mb-4">2. Virtual Gifts</h2>
                      <div className="space-y-3 text-slate-300">
                        <div className="flex items-start gap-3">
                          <XCircle className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" />
                          <p className="mb-0"><strong className="text-white">Non-refundable once sent to recipient.</strong> Virtual gifts (roses, diamonds, cars, etc.) cannot be refunded after the recipient receives them.</p>
                        </div>
                        <div className="flex items-start gap-3">
                          <CheckCircle className="w-5 h-5 text-green-400 flex-shrink-0 mt-0.5" />
                          <p className="mb-0"><strong className="text-white">Exception:</strong> Gift not delivered due to technical issue will be refunded within 24 hours. You must report the issue before the recipient acknowledges receipt.</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="mb-12">
                  <div className="flex items-start gap-4 mb-6">
                    <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-indigo-500 rounded-xl flex items-center justify-center flex-shrink-0">
                      <CheckCircle className="w-6 h-6 text-white" />
                    </div>
                    <div className="flex-1">
                      <h2 className="text-2xl font-black text-white mb-4">3. Premium Subscriptions</h2>
                      <div className="space-y-4 text-slate-300">
                        <div className="bg-green-500/10 border border-green-400/30 rounded-xl p-4">
                          <div className="flex items-center gap-2 mb-2">
                            <CheckCircle className="w-5 h-5 text-green-400" />
                            <strong className="text-green-400">7-Day Money-Back Guarantee</strong>
                          </div>
                          <p className="mb-0">Cancel within 7 days of initial purchase for a full refund. No questions asked. This applies to Student ($4.99/mo), Regular ($21.99/mo), and Founder's Club ($299 lifetime) plans.</p>
                        </div>
                        <div className="flex items-start gap-3">
                          <AlertCircle className="w-5 h-5 text-yellow-400 flex-shrink-0 mt-0.5" />
                          <p className="mb-0"><strong className="text-white">After 7 days:</strong> You can cancel anytime, but no refund for the current billing period. Your subscription remains active until the end of the paid period.</p>
                        </div>
                        <div className="flex items-start gap-3">
                          <Clock className="w-5 h-5 text-blue-400 flex-shrink-0 mt-0.5" />
                          <p className="mb-0"><strong className="text-white">Refund processing:</strong> Approved refunds are processed within 5-7 business days to your original payment method.</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="mb-12">
                  <div className="flex items-start gap-4 mb-6">
                    <div className="w-12 h-12 bg-gradient-to-br from-orange-500 to-red-500 rounded-xl flex items-center justify-center flex-shrink-0">
                      <AlertCircle className="w-6 h-6 text-white" />
                    </div>
                    <div className="flex-1">
                      <h2 className="text-2xl font-black text-white mb-4">4. Skill-Based Challenges</h2>
                      <div className="space-y-3 text-slate-300">
                        <div className="flex items-start gap-3">
                          <XCircle className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" />
                          <p className="mb-0"><strong className="text-white">Entry fees non-refundable once match starts.</strong> Challenge entry fees ($5-$500) cannot be refunded after you enter the competition and matching begins.</p>
                        </div>
                        <div className="flex items-start gap-3">
                          <CheckCircle className="w-5 h-5 text-green-400 flex-shrink-0 mt-0.5" />
                          <p className="mb-0"><strong className="text-white">Exception:</strong> Technical issues preventing match completion (server crash, connection failure) will be refunded within 24 hours. Entry fee is returned to your wallet automatically.</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="mb-12">
                  <div className="flex items-start gap-4 mb-6">
                    <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-emerald-500 rounded-xl flex items-center justify-center flex-shrink-0">
                      <Mail className="w-6 h-6 text-white" />
                    </div>
                    <div className="flex-1">
                      <h2 className="text-2xl font-black text-white mb-4">5. How to Request a Refund</h2>
                      <div className="space-y-4 text-slate-300">
                        <div className="bg-blue-500/10 border border-blue-400/30 rounded-xl p-6">
                          <p className="mb-3"><strong className="text-white text-lg">Contact Support:</strong></p>
                          <div className="space-y-2">
                            <p className="mb-0">📧 <strong className="text-white">Email:</strong> support@caakus.com</p>
                            <p className="mb-0">🆔 <strong className="text-white">Include:</strong> Transaction ID, order number, email address, and reason for refund</p>
                            <p className="mb-0">⏱️ <strong className="text-white">Response time:</strong> 24-48 hours</p>
                            <p className="mb-0">💳 <strong className="text-white">Processing:</strong> Approved refunds processed in 5-7 business days</p>
                          </div>
                        </div>
                        <p className="text-sm italic">Refunds are issued to the original payment method used for purchase (credit card, PayPal, etc.). Other payment methods may be refunded in USD equivalent where applicable.</p>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="mb-12">
                  <div className="bg-gradient-to-br from-red-500/20 to-orange-500/20 border border-red-400/40 rounded-2xl p-8">
                    <div className="flex items-start gap-4">
                      <AlertCircle className="w-8 h-8 text-red-400 flex-shrink-0" />
                      <div className="flex-1">
                        <h2 className="text-2xl font-black text-white mb-4">6. Chargebacks & Disputes</h2>
                        <div className="space-y-3 text-slate-300">
                          <p><strong className="text-white">⚠️ IMPORTANT:</strong> Filing a chargeback with your bank instead of requesting a refund through our support team may result in immediate account suspension and permanent ban from Caakus.</p>
                          <p><strong className="text-white">Why?</strong> Chargebacks cost us processing fees ($15-$25 per dispute) and hurt our merchant standing. We want to resolve issues fairly.</p>
                          <p className="text-lg font-bold text-yellow-400">🔴 Always contact support@caakus.com FIRST before filing any payment dispute.</p>
                          <p>We respond within 24-48 hours and resolve most issues quickly. Chargebacks should only be used as a last resort after exhausting our refund process.</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="mb-8">
                  <h2 className="text-2xl font-black text-white mb-4">7. Cancellation Policy</h2>
                  <div className="space-y-3 text-slate-300">
                    <p><strong className="text-white">Premium Subscriptions:</strong> Cancel anytime from Settings → Subscription → Cancel. Your access continues until the end of your paid billing period. No partial refunds after 7-day guarantee expires.</p>
                    <p><strong className="text-white">Account Deletion:</strong> Deleting your account does not trigger automatic refunds. Any unused subscription time or YUYU coin balance is forfeited. Withdraw your earnings and cancel subscriptions before deleting your account.</p>
                  </div>
                </div>

                <div className="bg-gradient-to-br from-purple-500/20 to-pink-500/20 border border-purple-400/30 rounded-2xl p-8">
                  <h2 className="text-2xl font-black text-white mb-4">8. Contact Information</h2>
                  <div className="space-y-2 text-slate-300">
                    <p className="mb-0">📧 <strong className="text-white">Email:</strong> support@caakus.com</p>
                    <p className="mb-0">🌐 <strong className="text-white">Website:</strong> www.caakus.com</p>
                    <p className="mb-0">📍 <strong className="text-white">Address:</strong> Caakus Inc, Delaware, USA</p>
                    <p className="mb-0">⏰ <strong className="text-white">Support Hours:</strong> 24/7 (Response within 24-48 hours)</p>
                  </div>
                </div>

                <div className="mt-8 text-sm text-slate-400 italic">
                  <p className="mb-2">This Refund & Cancellation Policy is effective as of February 19, 2026. We reserve the right to update this policy at any time. Changes will be posted on this page with an updated revision date.</p>
                  <p className="mb-0">By using Caakus, you agree to this Refund Policy. If you do not agree, please do not use our services.</p>
                </div>
              </div>
            </div>

            <div className="text-center">
              <Link to="/terms-of-service" className="text-purple-400 hover:text-purple-300 font-bold mr-6 transition-colors">Terms of Service</Link>
              <Link to="/privacy" className="text-purple-400 hover:text-purple-300 font-bold mr-6 transition-colors">Privacy Policy</Link>
              <Link to="/support" className="text-purple-400 hover:text-purple-300 font-bold transition-colors">Contact Support</Link>
            </div>
          </div>
        </main>
      </div>
    </>
  );
};

export default RefundPolicy;
