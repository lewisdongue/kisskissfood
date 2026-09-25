import { useState, useEffect } from "react";
import { useNavigate } from "@/lib/router-compat";
import { useTranslation } from "react-i18next";
import { toast } from "react-hot-toast";
import { supabase } from "@/config/supabase";
import {
  ArrowLeft,
  Mail,
  MessageSquare,
  Globe,
  Clock,
  Send,
  CheckCircle2,
  Sparkles,
  Instagram,
  Shield,
  Zap,
  HeadphonesIcon,
  AlertCircle,
  Users,
  Star,
  Award,
  TrendingUp,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { ParticleBackground } from "@/components/ParticleBackground";

const CONTACT_EMAIL = "hello@caakus.com";
const INSTAGRAM_URL = "https://instagram.com/lewis_dongue";
const INSTAGRAM_HANDLE = "@caakus";
const MAX_MESSAGE_LENGTH = 2000;
const MIN_MESSAGE_LENGTH = 10;
const MIN_NAME_LENGTH = 2;

export default function Contact() {
  const navigate = useNavigate();
  const { t } = useTranslation();
  
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    subject: "",
    message: "",
  });
  
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [touched, setTouched] = useState<Record<string, boolean>>({});

  useEffect(() => {
  }, []);

  const validateField = (name: string, value: string) => {
    let error = "";
    if (name === "name") {
      if (!value.trim()) error = "Name is required";
      else if (value.trim().length < MIN_NAME_LENGTH) error = "Name must be at least 2 characters";
    } else if (name === "email") {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!value.trim()) error = "Email is required";
      else if (!emailRegex.test(value)) error = "Please enter a valid email";
    } else if (name === "subject") {
      if (!value.trim()) error = "Subject is required";
      else if (value.trim().length < 3) error = "Subject must be at least 3 characters";
    } else if (name === "message") {
      if (!value.trim()) error = "Message is required";
      else if (value.trim().length < MIN_MESSAGE_LENGTH) error = `Message must be at least ${MIN_MESSAGE_LENGTH} characters`;
    }
    return error;
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (touched[name]) {
      const error = validateField(name, value);
      setErrors((prev) => ({ ...prev, [name]: error }));
    }
  };

  const handleBlur = (name: string) => {
    setTouched((prev) => ({ ...prev, [name]: true }));
    const error = validateField(name, formData[name as keyof typeof formData]);
    setErrors((prev) => ({ ...prev, [name]: error }));
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};
    Object.keys(formData).forEach((key) => {
      const error = validateField(key, formData[key as keyof typeof formData]);
      if (error) newErrors[key] = error;
    });
    setErrors(newErrors);
    setTouched({ name: true, email: true, subject: true, message: true });
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) {
      toast.error("Please fix the errors before submitting");
      return;
    }
    setLoading(true);
    try {
      const { error } = await supabase.functions.invoke("send-contact-email", {
        body: {
          name:    formData.name.trim(),
          email:   formData.email.trim(),
          subject: formData.subject.trim(),
          message: formData.message.trim(),
        },
      });

      if (error) {
        const msg = (error as any)?.message || "Failed to send message. Please try again.";
        toast.error(msg);
        return;
      }

      toast.success("Message sent! We'll get back to you within 24–48 hours.");
      setFormData({ name: "", email: "", subject: "", message: "" });
      setErrors({});
      setTouched({});
    } catch (err: any) {
      toast.error(err?.message || "Failed to send message. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const messageLength = formData.message.length;
  const isMessageNearLimit = messageLength >= MAX_MESSAGE_LENGTH - 100;
  const hasErrors = Object.values(errors).some((error) => error !== "");

  return (
    <>

      <ParticleBackground />

      <div className="min-h-screen w-full overflow-x-hidden relative z-10">
        <header className="sticky top-0 z-50 w-full border-b border-white/10 bg-slate-900/80 backdrop-blur-2xl shadow-2xl">
          <div className="container mx-auto px-3 sm:px-4">
            <div className="flex h-14 sm:h-16 items-center gap-2 sm:gap-3">
              <button onClick={() => navigate("/")} className="group rounded-full p-2 hover:bg-white/10 transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-purple-500/50" aria-label="Back to home">
                <ArrowLeft className="h-4 w-4 sm:h-5 sm:w-5 text-white group-hover:-translate-x-1 transition-transform" />
              </button>
              <div className="relative group">
                <div className="absolute inset-0 bg-gradient-to-br from-purple-500 via-pink-500 to-orange-500 rounded-xl blur-lg opacity-60 group-hover:opacity-100 transition-all duration-300" />
                <div className="relative w-9 h-9 sm:w-10 sm:h-10 rounded-xl flex items-center justify-center shadow-2xl ring-2 ring-white/20 overflow-hidden">
                  <img src="/logo.webp" alt="Caakus Logo" className="w-7 h-7 sm:w-8 sm:h-8 object-contain" />
                </div>
              </div>
              <div className="ml-1">
                <h2 className="text-base sm:text-lg font-black bg-gradient-to-r from-purple-400 via-pink-400 to-orange-400 bg-clip-text text-transparent">Caakus</h2>
                <p className="text-xs text-white/60 font-medium hidden sm:block">Video, Voice & Social Platform</p>
              </div>
            </div>
          </div>
        </header>

        <main className="container mx-auto px-3 sm:px-4 py-8 sm:py-12 max-w-6xl">
          <div className="text-center mb-8 sm:mb-12 relative">
            <div className="absolute inset-0 bg-gradient-to-r from-purple-500/10 via-pink-500/10 to-orange-500/10 blur-3xl" />
            <div className="relative">
              <div className="inline-flex items-center justify-center w-14 h-14 sm:w-16 sm:h-16 bg-gradient-to-br from-purple-500 via-pink-500 to-orange-500 rounded-2xl sm:rounded-3xl mb-4 sm:mb-5 shadow-2xl shadow-purple-500/30 animate-float relative">
                <div className="absolute inset-0 bg-gradient-to-br from-purple-400 to-pink-400 rounded-2xl sm:rounded-3xl blur-xl opacity-50 animate-pulse" />
                <HeadphonesIcon className="w-7 h-7 sm:w-8 sm:h-8 text-white relative z-10" />
              </div>
              <h2 className="text-3xl sm:text-4xl md:text-5xl font-black mb-3 sm:mb-4 bg-gradient-to-r from-purple-400 via-pink-400 to-orange-400 bg-clip-text text-transparent leading-tight drop-shadow-2xl">{t("contact.title") || "Contact Us"}</h2>
              <p className="text-sm sm:text-base md:text-lg text-white/70 max-w-2xl mx-auto mb-6">{t("contact.description") || "Have questions? We're here to help you succeed on Caakus"}</p>
              
              <div className="flex flex-wrap items-center justify-center gap-4 sm:gap-6 mt-6">
                <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-gradient-to-r from-purple-500/20 to-pink-500/20 border border-purple-500/30 backdrop-blur-sm">
                  <Star className="w-4 h-4 text-yellow-400 fill-yellow-400" />
                  <span className="text-xs sm:text-sm font-semibold text-white">4.9/5 Rating</span>
                </div>
                <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-gradient-to-r from-pink-500/20 to-orange-500/20 border border-pink-500/30 backdrop-blur-sm">
                  <TrendingUp className="w-4 h-4 text-green-400" />
                  <span className="text-xs sm:text-sm font-semibold text-white">Fast Response</span>
                </div>
                <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-gradient-to-r from-orange-500/20 to-purple-500/20 border border-orange-500/30 backdrop-blur-sm">
                  <Award className="w-4 h-4 text-blue-400" />
                  <span className="text-xs sm:text-sm font-semibold text-white">Expert Team</span>
                </div>
              </div>
            </div>
          </div>

          <div className="grid md:grid-cols-2 gap-5 sm:gap-6">
            <div className="space-y-4 sm:space-y-5">
              <div className="bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-xl rounded-2xl sm:rounded-3xl p-5 sm:p-7 shadow-2xl border border-white/20 hover:border-white/30 transition-all duration-300 relative overflow-hidden group">
                <div className="absolute inset-0 bg-gradient-to-br from-purple-500/5 to-pink-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                <div className="relative z-10">
                  <div className="flex items-center gap-2 mb-5 sm:mb-6">
                    <Sparkles className="w-5 h-5 text-purple-400 animate-pulse" />
                    <h3 className="text-xl sm:text-2xl font-bold text-white">{t("contact.info.title") || "Get in Touch"}</h3>
                  </div>
                  <div className="space-y-4 sm:space-y-5">
                    <div className="flex items-start gap-3 sm:gap-4 group/item hover:translate-x-1 transition-transform duration-300">
                      <div className="relative flex-shrink-0">
                        <div className="absolute inset-0 bg-gradient-to-br from-purple-400 to-purple-600 rounded-xl blur-md opacity-50 group-hover/item:opacity-100 transition-opacity" />
                        <div className="relative w-11 h-11 sm:w-12 sm:h-12 rounded-xl bg-gradient-to-br from-purple-400 to-purple-600 flex items-center justify-center shadow-lg group-hover/item:scale-110 transition-transform duration-300">
                          <Mail className="h-5 w-5 text-white" />
                        </div>
                      </div>
                      <div className="flex-1 min-w-0">
                        <h4 className="font-semibold mb-1 text-white text-sm sm:text-base">{t("contact.info.email") || "Email"}</h4>
                        <a href={`mailto:${CONTACT_EMAIL}`} className="text-purple-300 hover:text-purple-200 transition-colors text-xs sm:text-sm break-all">{CONTACT_EMAIL}</a>
                      </div>
                    </div>
                    <div className="flex items-start gap-3 sm:gap-4 group/item hover:translate-x-1 transition-transform duration-300">
                      <div className="relative flex-shrink-0">
                        <div className="absolute inset-0 bg-gradient-to-br from-pink-400 to-pink-600 rounded-xl blur-md opacity-50 group-hover/item:opacity-100 transition-opacity" />
                        <div className="relative w-11 h-11 sm:w-12 sm:h-12 rounded-xl bg-gradient-to-br from-pink-400 to-pink-600 flex items-center justify-center shadow-lg group-hover/item:scale-110 transition-transform duration-300">
                          <MessageSquare className="h-5 w-5 text-white" />
                        </div>
                      </div>
                      <div className="flex-1">
                        <h4 className="font-semibold mb-1 text-white text-sm sm:text-base">{t("contact.info.liveSupport") || "Live Support"}</h4>
                        <p className="text-white/70 text-xs sm:text-sm">{t("contact.info.liveSupportHours") || "Available every day at all hours"}</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3 sm:gap-4 group/item hover:translate-x-1 transition-transform duration-300">
                      <div className="relative flex-shrink-0">
                        <div className="absolute inset-0 bg-gradient-to-br from-orange-400 to-orange-600 rounded-xl blur-md opacity-50 group-hover/item:opacity-100 transition-opacity" />
                        <div className="relative w-11 h-11 sm:w-12 sm:h-12 rounded-xl bg-gradient-to-br from-orange-400 to-orange-600 flex items-center justify-center shadow-lg group-hover/item:scale-110 transition-transform duration-300">
                          <Instagram className="h-5 w-5 text-white" />
                        </div>
                      </div>
                      <div className="flex-1">
                        <h4 className="font-semibold mb-1 text-white text-sm sm:text-base">{t("contact.info.social") || "Social Media"}</h4>
                        <a href={INSTAGRAM_URL} target="_blank" rel="noopener noreferrer" className="text-orange-300 hover:text-orange-200 transition-colors text-xs sm:text-sm font-medium">{INSTAGRAM_HANDLE}</a>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-3 sm:gap-4">
                <div className="bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-xl rounded-xl sm:rounded-2xl p-4 sm:p-5 border border-white/20 hover:border-purple-500/40 hover:scale-105 transition-all duration-300 group relative overflow-hidden">
                  <div className="absolute inset-0 bg-gradient-to-br from-purple-500/10 to-purple-500/5 opacity-0 group-hover:opacity-100 transition-opacity" />
                  <div className="relative z-10">
                    <div className="flex items-center gap-2 mb-2">
                      <Clock className="w-5 h-5 text-purple-400 group-hover:scale-110 transition-transform" />
                      <h4 className="font-semibold text-white text-sm">Response</h4>
                    </div>
                    <p className="text-white/70 text-xs sm:text-sm">24-48 hours</p>
                  </div>
                </div>
                <div className="bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-xl rounded-xl sm:rounded-2xl p-4 sm:p-5 border border-white/20 hover:border-pink-500/40 hover:scale-105 transition-all duration-300 group relative overflow-hidden">
                  <div className="absolute inset-0 bg-gradient-to-br from-pink-500/10 to-pink-500/5 opacity-0 group-hover:opacity-100 transition-opacity" />
                  <div className="relative z-10">
                    <div className="flex items-center gap-2 mb-2">
                      <Shield className="w-5 h-5 text-pink-400 group-hover:scale-110 transition-transform" />
                      <h4 className="font-semibold text-white text-sm">Secure</h4>
                    </div>
                    <p className="text-white/70 text-xs sm:text-sm">Protected</p>
                  </div>
                </div>
              </div>
              
              <div className="bg-gradient-to-br from-green-500/10 to-emerald-500/5 backdrop-blur-xl rounded-xl sm:rounded-2xl p-4 sm:p-5 border border-green-500/20 hover:border-green-500/40 transition-all duration-300 relative overflow-hidden group">
                <div className="absolute inset-0 bg-gradient-to-br from-green-500/5 to-emerald-500/5 opacity-0 group-hover:opacity-100 transition-opacity" />
                <div className="relative z-10 flex items-start gap-3">
                  <CheckCircle2 className="w-5 h-5 text-green-400 flex-shrink-0 mt-0.5 group-hover:scale-110 transition-transform" />
                  <div>
                    <h4 className="font-semibold text-green-300 text-sm sm:text-base mb-1">Expert Support Team</h4>
                    <p className="text-green-200/70 text-xs sm:text-sm leading-relaxed">Our team responds to every message personally with care and expertise</p>
                  </div>
                </div>
              </div>

              <div className="bg-gradient-to-br from-blue-500/10 to-indigo-500/5 backdrop-blur-xl rounded-xl sm:rounded-2xl p-4 sm:p-5 border border-blue-500/20 hover:border-blue-500/40 transition-all duration-300 relative overflow-hidden group">
                <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 to-indigo-500/5 opacity-0 group-hover:opacity-100 transition-opacity" />
                <div className="relative z-10">
                  <div className="flex items-center gap-2 mb-3">
                    <Users className="w-5 h-5 text-blue-400 group-hover:scale-110 transition-transform" />
                    <h4 className="font-semibold text-blue-300 text-sm sm:text-base">Join Our Community</h4>
                  </div>
                  <p className="text-blue-200/70 text-xs sm:text-sm leading-relaxed mb-3">Connect with thousands of users earning and chatting globally</p>
                  <div className="flex items-center gap-2">
                    <div className="flex -space-x-2">
                      <div className="w-6 h-6 rounded-full bg-gradient-to-br from-purple-400 to-pink-400 border-2 border-slate-900" />
                      <div className="w-6 h-6 rounded-full bg-gradient-to-br from-pink-400 to-orange-400 border-2 border-slate-900" />
                      <div className="w-6 h-6 rounded-full bg-gradient-to-br from-orange-400 to-purple-400 border-2 border-slate-900" />
                    </div>
                    <span className="text-xs text-blue-300 font-medium">+1M active users</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-xl rounded-2xl sm:rounded-3xl p-5 sm:p-7 shadow-2xl border border-white/20 relative overflow-hidden group">
              <div className="absolute inset-0 bg-gradient-to-br from-orange-500/5 to-purple-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
              <div className="relative z-10">
                <div className="flex items-center gap-2 mb-5 sm:mb-6">
                  <Zap className="w-5 h-5 text-orange-400 animate-pulse" />
                  <h3 className="text-xl sm:text-2xl font-bold text-white">{t("contact.form.title") || "Send Message"}</h3>
                </div>
                <form onSubmit={handleSubmit} className="space-y-4" noValidate>
                  <div>
                    <label htmlFor="name" className="block text-sm font-medium mb-2 text-white/90">{t("contact.form.fullName") || "Full Name"}<span className="text-red-400 ml-1">*</span></label>
                    <input type="text" id="name" name="name" value={formData.name} onChange={handleChange} onBlur={() => handleBlur("name")} className={`w-full px-4 py-2.5 sm:py-3 rounded-xl border bg-white/5 text-white placeholder:text-white/40 focus:outline-none focus:ring-2 transition-all backdrop-blur-sm hover:bg-white/10 ${errors.name && touched.name ? "border-red-500/50 focus:ring-red-500/50" : "border-white/20 focus:ring-purple-500/50 focus:border-purple-500/50"}`} placeholder={t("contact.form.placeholders.name") || "Your name"} aria-invalid={errors.name && touched.name ? "true" : "false"} aria-describedby={errors.name && touched.name ? "name-error" : undefined} />
                    {errors.name && touched.name && <p id="name-error" className="mt-1.5 text-xs text-red-400 flex items-center gap-1 animate-fade-in" role="alert"><AlertCircle className="w-3 h-3" />{errors.name}</p>}
                  </div>
                  <div>
                    <label htmlFor="email" className="block text-sm font-medium mb-2 text-white/90">{t("contact.form.email") || "Email"}<span className="text-red-400 ml-1">*</span></label>
                    <input type="email" id="email" name="email" value={formData.email} onChange={handleChange} onBlur={() => handleBlur("email")} className={`w-full px-4 py-2.5 sm:py-3 rounded-xl border bg-white/5 text-white placeholder:text-white/40 focus:outline-none focus:ring-2 transition-all backdrop-blur-sm hover:bg-white/10 ${errors.email && touched.email ? "border-red-500/50 focus:ring-red-500/50" : "border-white/20 focus:ring-purple-500/50 focus:border-purple-500/50"}`} placeholder={t("contact.form.placeholders.email") || "your@email.com"} aria-invalid={errors.email && touched.email ? "true" : "false"} aria-describedby={errors.email && touched.email ? "email-error" : undefined} />
                    {errors.email && touched.email && <p id="email-error" className="mt-1.5 text-xs text-red-400 flex items-center gap-1 animate-fade-in" role="alert"><AlertCircle className="w-3 h-3" />{errors.email}</p>}
                  </div>
                  <div>
                    <label htmlFor="subject" className="block text-sm font-medium mb-2 text-white/90">{t("contact.form.subject") || "Subject"}<span className="text-red-400 ml-1">*</span></label>
                    <input type="text" id="subject" name="subject" value={formData.subject} onChange={handleChange} onBlur={() => handleBlur("subject")} className={`w-full px-4 py-2.5 sm:py-3 rounded-xl border bg-white/5 text-white placeholder:text-white/40 focus:outline-none focus:ring-2 transition-all backdrop-blur-sm hover:bg-white/10 ${errors.subject && touched.subject ? "border-red-500/50 focus:ring-red-500/50" : "border-white/20 focus:ring-purple-500/50 focus:border-purple-500/50"}`} placeholder={t("contact.form.placeholders.subject") || "What's this about?"} aria-invalid={errors.subject && touched.subject ? "true" : "false"} aria-describedby={errors.subject && touched.subject ? "subject-error" : undefined} />
                    {errors.subject && touched.subject && <p id="subject-error" className="mt-1.5 text-xs text-red-400 flex items-center gap-1 animate-fade-in" role="alert"><AlertCircle className="w-3 h-3" />{errors.subject}</p>}
                  </div>
                  <div>
                    <label htmlFor="message" className="block text-sm font-medium mb-2 text-white/90">{t("contact.form.message") || "Message"}<span className="text-red-400 ml-1">*</span></label>
                    <textarea id="message" name="message" value={formData.message} onChange={handleChange} onBlur={() => handleBlur("message")} maxLength={MAX_MESSAGE_LENGTH} rows={5} className={`w-full px-4 py-2.5 sm:py-3 rounded-xl border bg-white/5 text-white placeholder:text-white/40 focus:outline-none focus:ring-2 transition-all resize-none backdrop-blur-sm hover:bg-white/10 ${errors.message && touched.message ? "border-red-500/50 focus:ring-red-500/50" : "border-white/20 focus:ring-purple-500/50 focus:border-purple-500/50"}`} placeholder={t("contact.form.placeholders.message") || "Tell us how we can help..."} aria-invalid={errors.message && touched.message ? "true" : "false"} aria-describedby={errors.message && touched.message ? "message-error" : "message-count"} />
                    <div className="mt-1.5 flex items-center justify-between">
                      {errors.message && touched.message ? <p id="message-error" className="text-xs text-red-400 flex items-center gap-1 animate-fade-in" role="alert"><AlertCircle className="w-3 h-3" />{errors.message}</p> : <span className="text-xs text-white/50" id="message-count">{messageLength < MIN_MESSAGE_LENGTH ? `${MIN_MESSAGE_LENGTH - messageLength} more characters needed` : ""}</span>}
                      <span className={`text-xs font-medium transition-colors ${isMessageNearLimit ? "text-orange-400" : "text-white/50"}`}>{messageLength}/{MAX_MESSAGE_LENGTH}</span>
                    </div>
                  </div>
                  <Button type="submit" disabled={loading || hasErrors} className="w-full bg-gradient-to-r from-purple-500 via-pink-500 to-orange-500 text-white font-semibold px-6 py-6 sm:py-7 rounded-xl shadow-lg hover:shadow-purple-500/50 hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 focus:outline-none focus:ring-2 focus:ring-purple-500/50 transition-all duration-300 group active:scale-95 relative overflow-hidden" aria-label="Send message">
                    <div className="absolute inset-0 bg-gradient-to-r from-purple-600 via-pink-600 to-orange-600 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                    <span className="flex items-center justify-center gap-2 relative z-10">
                      <Send className="w-4 h-4 sm:w-5 sm:h-5 group-hover:translate-x-1 transition-transform" />
                      {loading ? t("common.sending") || "Sending..." : t("contact.form.sendButton") || "Send Message"}
                    </span>
                  </Button>
                </form>
              </div>
            </div>
          </div>

          <div className="mt-8 sm:mt-10 text-center">
            <div className="inline-flex items-center gap-2 px-5 sm:px-6 py-3 sm:py-4 rounded-full bg-gradient-to-r from-purple-500/10 via-pink-500/10 to-orange-500/10 border border-white/20 backdrop-blur-sm hover:border-white/30 transition-all duration-300 group relative overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-r from-purple-500/20 via-pink-500/20 to-orange-500/20 opacity-0 group-hover:opacity-100 transition-opacity" />
              <Globe className="w-4 h-4 sm:w-5 sm:h-5 text-purple-400 group-hover:rotate-12 transition-transform relative z-10" />
              <p className="text-xs sm:text-sm text-white/70 relative z-10">Trusted by <span className="font-bold text-transparent bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text">1,000,000+</span> users worldwide</p>
            </div>
          </div>
        </main>
      </div>
    </>
  );
}
