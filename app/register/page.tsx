"use client";

import React, { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { useToast } from "@/context/ToastContext";
import {
  PartyPopper,
  User,
  Building2,
  Mail,
  Lock,
  Phone,
  ArrowRight,
  ArrowLeft,
  Eye,
  EyeOff,
  CheckCircle,
  Sparkles,
  ShieldCheck,
  RefreshCw,
} from "lucide-react";

export default function RegisterPage() {
  const router = useRouter();
  const { toast } = useToast();
  const { refreshUser } = useAuth();

  const [step, setStep] = useState<"details" | "verification">("details");
  const [role, setRole] = useState<"customer" | "organiser">("customer");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [phone, setPhone] = useState("");
  const [companyName, setCompanyName] = useState("");

  // Verification step state
  const [digits, setDigits] = useState<string[]>(["", "", "", "", "", ""]);
  const [verifying, setVerifying] = useState(false);
  const [resending, setResending] = useState(false);
  const [resendCooldown, setResendCooldown] = useState(0);

  const [loading, setLoading] = useState(false);
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  // Cooldown timer for resend
  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (resendCooldown > 0) {
      timer = setTimeout(() => setResendCooldown((prev) => prev - 1), 1000);
    }
    return () => clearTimeout(timer);
  }, [resendCooldown]);

  const handleDetailsSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !email.trim() || !password) {
      toast.error("Please fill in all required fields.");
      return;
    }
    if (password.length < 6) {
      toast.error("Password must be at least 6 characters.");
      return;
    }

    setLoading(true);

    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: name.trim(),
          email: email.trim(),
          password,
          role,
          phone: phone.trim(),
          companyName: role === "organiser" ? companyName.trim() : "",
        }),
      });

      const data = await res.json();
      if (res.ok) {
        toast.success(
          `We've sent a 6-digit verification code to ${email}.`,
          "Verification Code Sent"
        );
        setStep("verification");
        setResendCooldown(60);
      } else {
        toast.error(data.error || "Failed to initiate registration.", "Registration Error");
      }
    } catch {
      toast.error("An unexpected network error occurred. Please try again.", "Error");
    } finally {
      setLoading(false);
    }
  };

  const handleDigitChange = (index: number, value: string) => {
    const char = value.replace(/[^0-9]/g, "").slice(-1);
    const newDigits = [...digits];
    newDigits[index] = char;
    setDigits(newDigits);

    if (char && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Backspace" && !digits[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handlePaste = (e: React.ClipboardEvent) => {
    e.preventDefault();
    const paste = e.clipboardData.getData("text").replace(/[^0-9]/g, "").slice(0, 6);
    if (paste.length === 6) {
      setDigits(paste.split(""));
      inputRefs.current[5]?.focus();
    }
  };

  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    const code = digits.join("");
    if (code.length !== 6) {
      toast.error("Please enter the complete 6-digit code.");
      return;
    }

    setVerifying(true);

    try {
      const res = await fetch("/api/auth/verify-email", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: email.trim(), code }),
      });

      const data = await res.json();
      if (res.ok && data.success) {
        toast.success("Account verified successfully! Welcome to CelebrateHub.", "Verified");
        await refreshUser();
        if (role === "organiser") {
          router.push("/organiser/dashboard");
        } else {
          router.push("/customer/bookings");
        }
      } else {
        toast.error(data.error || "Invalid or expired verification code.", "Verification Failed");
      }
    } catch {
      toast.error("Failed to verify code. Please check your connection.");
    } finally {
      setVerifying(false);
    }
  };

  const handleResendCode = async () => {
    try {
      setResending(true);
      const res = await fetch("/api/auth/resend-verification", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: email.trim() }),
      });

      const data = await res.json();
      if (res.ok && data.success) {
        toast.success(`New verification code sent to ${email}`, "Code Resent");
        setResendCooldown(60);
      } else {
        toast.error(data.error || "Failed to resend code.");
      }
    } catch {
      toast.error("An error occurred while resending the code.");
    } finally {
      setResending(false);
    }
  };

  return (
    <div className="min-h-screen flex items-stretch bg-slate-950 text-slate-100">
      {/* Brand & Showcase Sidebar */}
      <div className="hidden lg:flex lg:w-5/12 xl:w-1/2 relative bg-gradient-to-br from-slate-900 via-pink-950/30 to-purple-950/40 p-12 flex-col justify-between border-r border-white/10 overflow-hidden">
        <div className="absolute top-0 left-0 w-96 h-96 bg-purple-600/20 rounded-full blur-[140px] pointer-events-none" />
        <div className="absolute bottom-0 right-0 w-80 h-80 bg-amber-600/15 rounded-full blur-[140px] pointer-events-none" />

        {/* Top brand */}
        <div className="relative z-10">
          <Link href="/" className="inline-flex items-center gap-3 group">
            <div className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-purple-600 via-pink-600 to-amber-500 flex items-center justify-center text-white shadow-lg shadow-purple-900/40 group-hover:scale-105 transition">
              <PartyPopper className="w-6 h-6" />
            </div>
            <div className="flex flex-col">
              <span className="font-heading font-extrabold text-xl text-white tracking-tight">
                Celebrate<span className="bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">Hub</span>
              </span>
              <span className="text-[10px] uppercase font-bold tracking-widest text-slate-400">
                Member & Host Registration
              </span>
            </div>
          </Link>
        </div>

        {/* Feature Comparison */}
        <div className="relative z-10 space-y-6 max-w-md">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-pink-500/10 border border-pink-500/20 text-pink-300 text-xs font-semibold">
            <Sparkles className="w-3.5 h-3.5" />
            <span>{role === "customer" ? "Guest Celebration Concierge" : "Host Partner Network"}</span>
          </div>

          <h2 className="text-3xl xl:text-4xl font-heading font-black text-white leading-tight">
            {role === "customer"
              ? "Your Passport to Exclusive Celebration Venues."
              : "Monetize Your Venue with Direct Guest Bookings."}
          </h2>

          <p className="text-sm text-slate-400 leading-relaxed">
            {role === "customer"
              ? "Discover hidden rooftop lounges, pool villas, banquet estates, and beachfront gardens for birthdays, anniversaries, and milestone reunions."
              : "List your property, manage party shifts (Day, Sunset, Glow Night), receive direct guest inquiries, and get automatic net payouts."}
          </p>

          <div className="space-y-3 pt-2">
            {role === "customer" ? (
              <>
                <div className="flex items-center gap-3 text-xs text-slate-300">
                  <CheckCircle className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span>Instant 10-Minute Cart Reservation Hold</span>
                </div>
                <div className="flex items-center gap-3 text-xs text-slate-300">
                  <CheckCircle className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span>Digital QR Entry Passes with Real-Time Countdown</span>
                </div>
                <div className="flex items-center gap-3 text-xs text-slate-300">
                  <CheckCircle className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span>Transparent Hosting Packages & Cancellation Protection</span>
                </div>
              </>
            ) : (
              <>
                <div className="flex items-center gap-3 text-xs text-slate-300">
                  <CheckCircle className="w-4 h-4 text-pink-400 shrink-0" />
                  <span>Shift Capacity Management & Direct Organiser Controls</span>
                </div>
                <div className="flex items-center gap-3 text-xs text-slate-300">
                  <CheckCircle className="w-4 h-4 text-pink-400 shrink-0" />
                  <span>Automated Revenue Distribution & Real-Time Guest Check-In</span>
                </div>
                <div className="flex items-center gap-3 text-xs text-slate-300">
                  <CheckCircle className="w-4 h-4 text-pink-400 shrink-0" />
                  <span>Verified Host Partner Badge & Priority Venue Search</span>
                </div>
              </>
            )}
          </div>
        </div>

        {/* Security badge */}
        <div className="relative z-10 flex items-center gap-2 text-xs text-slate-400">
          <ShieldCheck className="w-4 h-4 text-emerald-400" />
          <span>Mandatory verified accounts for safe marketplace celebrations</span>
        </div>
      </div>

      {/* Main Interactive Form Panel */}
      <div className="flex-1 flex flex-col justify-between p-6 sm:p-10 lg:p-16 relative overflow-y-auto">
        {/* Top Header / Back Nav */}
        <div className="flex items-center justify-between">
          <Link
            href="/login"
            className="inline-flex items-center gap-2 text-xs sm:text-sm font-semibold text-slate-400 hover:text-white transition px-3.5 py-2 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Already have an account? Sign In</span>
          </Link>

          <Link href="/" className="lg:hidden inline-flex items-center gap-2">
            <span className="font-heading font-extrabold text-base text-white">
              Celebrate<span className="text-pink-400">Hub</span>
            </span>
          </Link>
        </div>

        {/* STEP 1: ACCOUNT DETAILS */}
        {step === "details" && (
          <div className="max-w-md w-full mx-auto my-auto py-8 space-y-6">
            <div className="space-y-2">
              <h1 className="text-2xl sm:text-3xl font-heading font-black text-white">
                Create an Account
              </h1>
              <p className="text-xs sm:text-sm text-slate-400">
                Join CelebrateHub to discover and host unforgettable celebrations.
              </p>
            </div>

            {/* Role Switcher */}
            <div className="grid grid-cols-2 gap-2 bg-slate-900 p-1.5 rounded-2xl border border-white/10">
              <button
                type="button"
                onClick={() => setRole("customer")}
                className={`py-2.5 px-3 rounded-xl text-xs font-heading font-bold transition flex items-center justify-center gap-2 ${
                  role === "customer"
                    ? "bg-purple-600 text-white shadow-lg shadow-purple-600/30"
                    : "text-slate-400 hover:text-white"
                }`}
              >
                <User className="w-4 h-4" />
                <span>Celebration Guest</span>
              </button>

              <button
                type="button"
                onClick={() => setRole("organiser")}
                className={`py-2.5 px-3 rounded-xl text-xs font-heading font-bold transition flex items-center justify-center gap-2 ${
                  role === "organiser"
                    ? "bg-pink-600 text-white shadow-lg shadow-pink-600/30"
                    : "text-slate-400 hover:text-white"
                }`}
              >
                <Building2 className="w-4 h-4" />
                <span>Host Organiser</span>
              </button>
            </div>

            {/* Registration Form */}
            <form onSubmit={handleDetailsSubmit} className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-300">Full Name *</label>
                <div className="relative">
                  <User className="w-4 h-4 text-slate-400 absolute left-4 top-3.5 pointer-events-none" />
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Enter your full name"
                    className="w-full pl-11 pr-4 py-3 rounded-2xl border border-white/10 bg-slate-900 text-white text-sm outline-none focus:border-purple-500 transition placeholder:text-slate-500"
                    required
                  />
                </div>
              </div>

              {role === "organiser" && (
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-300">Venue or Hospitality Company *</label>
                  <div className="relative">
                    <Building2 className="w-4 h-4 text-slate-400 absolute left-4 top-3.5 pointer-events-none" />
                    <input
                      type="text"
                      value={companyName}
                      onChange={(e) => setCompanyName(e.target.value)}
                      placeholder="e.g. Skyline Rooftop Lounge LLC"
                      className="w-full pl-11 pr-4 py-3 rounded-2xl border border-white/10 bg-slate-900 text-white text-sm outline-none focus:border-pink-500 transition placeholder:text-slate-500"
                      required
                    />
                  </div>
                </div>
              )}

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-300">Email Address *</label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-slate-400 absolute left-4 top-3.5 pointer-events-none" />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="yourname@gmail.com"
                    className="w-full pl-11 pr-4 py-3 rounded-2xl border border-white/10 bg-slate-900 text-white text-sm outline-none focus:border-purple-500 transition placeholder:text-slate-500"
                    required
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-300">Phone Number</label>
                <div className="relative">
                  <Phone className="w-4 h-4 text-slate-400 absolute left-4 top-3.5 pointer-events-none" />
                  <input
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="+91 98765 43210"
                    className="w-full pl-11 pr-4 py-3 rounded-2xl border border-white/10 bg-slate-900 text-white text-sm outline-none focus:border-purple-500 transition placeholder:text-slate-500"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-300">Create Password *</label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-slate-400 absolute left-4 top-3.5 pointer-events-none" />
                  <input
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="At least 6 characters"
                    minLength={6}
                    className="w-full pl-11 pr-11 py-3 rounded-2xl border border-white/10 bg-slate-900 text-white text-sm outline-none focus:border-purple-500 transition placeholder:text-slate-500"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3.5 top-3 text-slate-400 hover:text-white transition"
                    tabIndex={-1}
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-purple-600 via-pink-600 to-amber-500 hover:from-purple-500 hover:to-amber-400 text-white font-heading font-bold text-sm shadow-xl shadow-purple-900/30 flex items-center justify-center gap-2 transition disabled:opacity-50 mt-2"
              >
                <span>{loading ? "Sending Verification Code..." : "Continue to Email Verification"}</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </form>
          </div>
        )}

        {/* STEP 2: VERIFICATION OTP CODE */}
        {step === "verification" && (
          <div className="max-w-md w-full mx-auto my-auto py-8 space-y-6">
            <div className="text-center space-y-2">
              <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-purple-600/30 to-pink-600/30 border border-purple-500/30 text-purple-300 flex items-center justify-center mx-auto mb-4">
                <Mail className="w-7 h-7" />
              </div>
              <h1 className="text-2xl sm:text-3xl font-heading font-black text-white">
                Verify Your Email
              </h1>
              <p className="text-xs sm:text-sm text-slate-400">
                We&apos;ve sent a 6-digit confirmation code to:
              </p>
              <div className="inline-block px-3.5 py-1.5 rounded-xl bg-purple-500/10 border border-purple-500/20 text-purple-300 text-xs font-mono font-bold">
                {email}
              </div>
            </div>

            <form onSubmit={handleVerifyOtp} className="space-y-6">
              <div className="space-y-2 text-center">
                <label className="text-xs font-bold uppercase tracking-wider text-slate-400">
                  Enter 6-Digit Code
                </label>
                <div className="flex justify-center gap-2 sm:gap-3" onPaste={handlePaste}>
                  {digits.map((digit, i) => (
                    <input
                      key={i}
                      ref={(el) => {
                        inputRefs.current[i] = el;
                      }}
                      type="text"
                      inputMode="numeric"
                      maxLength={1}
                      value={digit}
                      onChange={(e) => handleDigitChange(i, e.target.value)}
                      onKeyDown={(e) => handleKeyDown(i, e)}
                      className="w-11 h-13 sm:w-13 sm:h-14 text-center text-xl sm:text-2xl font-mono font-black rounded-2xl border border-white/15 bg-slate-900 text-white outline-none focus:border-purple-400 focus:ring-2 focus:ring-purple-500/30 transition shadow-inner"
                    />
                  ))}
                </div>
              </div>

              <button
                type="submit"
                disabled={verifying || digits.join("").length !== 6}
                className="w-full py-3.5 px-6 rounded-2xl bg-gradient-to-r from-purple-600 via-pink-600 to-amber-500 hover:from-purple-500 hover:to-amber-400 text-white font-heading font-bold text-sm shadow-xl shadow-purple-900/30 transition flex items-center justify-center gap-2 disabled:opacity-50"
              >
                {verifying ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    <span>Verifying Code...</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4" />
                    <span>Verify & Complete Registration</span>
                  </>
                )}
              </button>
            </form>

            <div className="pt-2 text-center space-y-3">
              <p className="text-xs text-slate-400">
                Didn&apos;t receive the email in your inbox or spam?
              </p>
              <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
                <button
                  type="button"
                  onClick={handleResendCode}
                  disabled={resending || resendCooldown > 0}
                  className="text-xs font-bold text-amber-400 hover:text-amber-300 disabled:text-slate-500 transition inline-flex items-center gap-1.5"
                >
                  {resending ? (
                    <span>Sending new code...</span>
                  ) : resendCooldown > 0 ? (
                    <span>Resend available in {resendCooldown}s</span>
                  ) : (
                    <>
                      <RefreshCw className="w-3.5 h-3.5" />
                      <span>Resend Verification Code</span>
                    </>
                  )}
                </button>
                <span className="text-slate-600 hidden sm:inline">•</span>
                <button
                  type="button"
                  onClick={() => setStep("details")}
                  className="text-xs text-slate-400 hover:text-white transition"
                >
                  Change email address
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Footer */}
        <div className="text-center text-xs text-slate-500 pt-6">
          CelebrateHub Marketplace &copy; 2026. Secure 256-bit encryption.
        </div>
      </div>
    </div>
  );
}

