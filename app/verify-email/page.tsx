"use client";

import React, { useState, useEffect, useRef, Suspense } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { useToast } from "@/context/ToastContext";
import {
  PartyPopper,
  Mail,
  ArrowLeft,
  CheckCircle,
  RefreshCw,
  Sparkles,
  ShieldCheck,
  Zap,
} from "lucide-react";

function VerifyEmailContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { refreshUser } = useAuth();
  const { toast } = useToast();

  const emailParam = searchParams.get("email") || "";
  const tokenParam = searchParams.get("token") || "";

  const [email, setEmail] = useState(emailParam);
  const [digits, setDigits] = useState<string[]>(["", "", "", "", "", ""]);
  const [loading, setLoading] = useState(false);
  const [resending, setResending] = useState(false);
  const [resendCooldown, setResendCooldown] = useState(0);

  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  // Auto-verify if token is in query params (e.g. user clicked link from Gmail)
  useEffect(() => {
    if (tokenParam && emailParam) {
      handleAutoVerifyWithToken(tokenParam, emailParam);
    }
  }, [tokenParam, emailParam]);

  // Resend cooldown timer
  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (resendCooldown > 0) {
      timer = setTimeout(() => setResendCooldown((prev) => prev - 1), 1000);
    }
    return () => clearTimeout(timer);
  }, [resendCooldown]);

  const handleAutoVerifyWithToken = async (token: string, userEmail: string) => {
    try {
      setLoading(true);
      const res = await fetch("/api/auth/verify-email", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: userEmail, token }),
      });

      const data = await res.json();
      if (res.ok && data.success) {
        toast.success("Email verified successfully! Welcome to CelebrateHub.", "Verified");
        await refreshUser();
        const role = data.user?.role || "customer";
        if (role === "admin") router.push("/admin/dashboard");
        else if (role === "organiser") router.push("/organiser/dashboard");
        else router.push("/customer/bookings");
      } else {
        toast.error(data.error || "Verification link is invalid or expired.", "Verification Failed");
      }
    } catch {
      toast.error("Failed to verify email token. Please enter the 6-digit code manually.");
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
      const arr = paste.split("");
      setDigits(arr);
      inputRefs.current[5]?.focus();
    }
  };

  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    const code = digits.join("");
    if (code.length !== 6) {
      toast.error("Please enter the complete 6-digit verification code.");
      return;
    }

    if (!email) {
      toast.error("Please provide your email address.");
      return;
    }

    try {
      setLoading(true);
      const res = await fetch("/api/auth/verify-email", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, code }),
      });

      const data = await res.json();
      if (res.ok && data.success) {
        toast.success("Account verified successfully! Welcome to CelebrateHub.", "Verified");
        await refreshUser();
        const role = data.user?.role || "customer";
        if (role === "admin") router.push("/admin/dashboard");
        else if (role === "organiser") router.push("/organiser/dashboard");
        else router.push("/customer/bookings");
      } else {
        toast.error(data.error || "Invalid or expired verification code.", "Verification Failed");
      }
    } catch {
      toast.error("Failed to verify code. Please check your network connection.");
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    if (!email) {
      toast.error("Please enter your registered email address.");
      return;
    }

    try {
      setResending(true);
      const res = await fetch("/api/auth/resend-verification", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });

      const data = await res.json();
      if (res.ok && data.success) {
        toast.success(`New 6-digit verification code sent to ${email}`, "Code Resent");
        setResendCooldown(60);
      } else {
        toast.error(data.error || "Failed to resend code.", "Error");
      }
    } catch {
      toast.error("An error occurred while resending the code.");
    } finally {
      setResending(false);
    }
  };

  return (
    <div className="min-h-screen flex items-stretch bg-slate-950 text-slate-100">
      {/* Brand & Security Sidebar */}
      <div className="hidden lg:flex lg:w-5/12 xl:w-1/2 relative bg-gradient-to-br from-slate-900 via-purple-950/40 to-slate-950 p-12 flex-col justify-between border-r border-white/10 overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-purple-600/20 rounded-full blur-[140px] pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-80 h-80 bg-pink-600/15 rounded-full blur-[140px] pointer-events-none" />

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
                Security & Account Verification
              </span>
            </div>
          </Link>
        </div>

        <div className="relative z-10 space-y-6 max-w-md">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-purple-500/10 border border-purple-500/20 text-purple-300 text-xs font-semibold">
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>Zero-Trust Verification</span>
          </div>

          <h2 className="text-3xl xl:text-4xl font-heading font-black text-white leading-tight">
            Protecting Every Celebration and Host Partner.
          </h2>

          <p className="text-sm text-slate-400 leading-relaxed">
            All CelebrateHub accounts undergo mandatory cryptographic email verification before accessing venue calendars, slot locking, or private booking passes.
          </p>

          <div className="space-y-3 pt-2">
            <div className="flex items-center gap-3 text-xs text-slate-300">
              <CheckCircle className="w-4 h-4 text-emerald-400 shrink-0" />
              <span>Protects venue dates from unauthorized reservation holds</span>
            </div>
            <div className="flex items-center gap-3 text-xs text-slate-300">
              <CheckCircle className="w-4 h-4 text-emerald-400 shrink-0" />
              <span>Delivers real-time booking confirmation and tax invoices</span>
            </div>
            <div className="flex items-center gap-3 text-xs text-slate-300">
              <CheckCircle className="w-4 h-4 text-emerald-400 shrink-0" />
              <span>Ensures secure payout processing for celebration hosts</span>
            </div>
          </div>
        </div>

        <div className="relative z-10 text-xs text-slate-500 flex items-center gap-2">
          <Zap className="w-4 h-4 text-purple-400" />
          <span>Encrypted 256-bit authentication token verification</span>
        </div>
      </div>

      {/* Main Interactive Form Panel */}
      <div className="flex-1 flex flex-col justify-between p-6 sm:p-10 lg:p-16 relative overflow-y-auto">
        <div className="flex items-center justify-between">
          <Link
            href="/login"
            className="inline-flex items-center gap-2 text-xs sm:text-sm font-semibold text-slate-400 hover:text-white transition px-3.5 py-2 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back to Sign In</span>
          </Link>

          <Link href="/" className="lg:hidden inline-flex items-center gap-2">
            <span className="font-heading font-extrabold text-base text-white">
              Celebrate<span className="text-purple-400">Hub</span>
            </span>
          </Link>
        </div>

        {/* Verification Card */}
        <div className="max-w-md w-full mx-auto my-auto py-8 space-y-6">
          <div className="text-center space-y-2">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-purple-600/30 to-pink-600/30 border border-purple-500/30 text-purple-300 flex items-center justify-center mx-auto mb-4">
              <Mail className="w-7 h-7" />
            </div>
            <h1 className="text-2xl sm:text-3xl font-heading font-black text-white">
              Verify Your Email Address
            </h1>
            <p className="text-xs sm:text-sm text-slate-400">
              We&apos;ve sent a 6-digit confirmation code to:
            </p>
            <div className="inline-block px-3.5 py-1.5 rounded-xl bg-purple-500/10 border border-purple-500/20 text-purple-300 text-xs font-mono font-bold">
              {email || "your registered email"}
            </div>
          </div>

          {/* OTP Input Form */}
          <form onSubmit={handleVerifyOtp} className="space-y-6">
            {!emailParam && (
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-300">Email Address</label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Enter your registered email"
                  className="w-full px-4 py-3 rounded-2xl border border-white/10 bg-slate-900 text-white text-sm outline-none focus:border-purple-500 transition"
                  required
                />
              </div>
            )}

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
              disabled={loading || digits.join("").length !== 6}
              className="w-full py-3.5 px-6 rounded-2xl bg-gradient-to-r from-purple-600 via-pink-600 to-amber-500 hover:from-purple-500 hover:to-amber-400 text-white font-heading font-bold text-sm shadow-xl shadow-purple-900/30 transition flex items-center justify-center gap-2 disabled:opacity-50"
            >
              {loading ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  <span>Verifying Code...</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4" />
                  <span>Verify & Activate Account</span>
                </>
              )}
            </button>
          </form>

          {/* Resend Action */}
          <div className="pt-2 text-center space-y-3">
            <p className="text-xs text-slate-400">
              Didn&apos;t receive the email in your inbox or spam?
            </p>
            <button
              type="button"
              onClick={handleResend}
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
                  <span>Resend Verification Code to Email</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* Footer */}
        <div className="text-center text-xs text-slate-500 pt-6">
          CelebrateHub Marketplace &copy; 2026. Secure 256-bit encryption.
        </div>
      </div>
    </div>
  );
}

export default function VerifyEmailPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-slate-950 flex items-center justify-center text-white">Loading...</div>}>
      <VerifyEmailContent />
    </Suspense>
  );
}
