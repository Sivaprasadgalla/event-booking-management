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
  AlertCircle,
  RefreshCw,
  Sparkles,
  ShieldCheck,
  Zap,
  Terminal,
  Send,
  ChevronDown,
  ChevronUp,
  ExternalLink,
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
  const [error, setError] = useState("");
  const [resendCooldown, setResendCooldown] = useState(0);
  const [demoCode, setDemoCode] = useState<string | null>(searchParams.get("demoCode") || null);

  // Email diagnostics & logs state
  const [emailLogs, setEmailLogs] = useState<any[]>([]);
  const [smtpConfigured, setSmtpConfigured] = useState<boolean | null>(null);
  const [showDiagnostics, setShowDiagnostics] = useState(false);
  const [testingSmtp, setTestingSmtp] = useState(false);
  const [testResult, setTestResult] = useState<any>(null);

  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  const fetchEmailLogs = async () => {
    try {
      const res = await fetch("/api/auth/email-logs");
      const data = await res.json();
      if (data.success) {
        setEmailLogs(data.logs || []);
        setSmtpConfigured(data.smtpConfigured);
        const match = (data.logs || []).find((l: any) => l.toEmail === emailParam) || data.logs?.[0];
        if (match?.code && !demoCode) {
          setDemoCode(match.code);
        }
      }
    } catch {
      // ignore
    }
  };

  useEffect(() => {
    fetchEmailLogs();
  }, []);

  const handleRunSmtpTest = async () => {
    setTestingSmtp(true);
    setTestResult(null);
    try {
      const target = email || "test@celebratehub.com";
      const res = await fetch(`/api/auth/test-email?to=${encodeURIComponent(target)}`);
      const data = await res.json();
      setTestResult(data);
      if (data.success) {
        toast.success("SMTP connection verified! Check response details below.", "Diagnostics");
      } else {
        toast.info("SMTP check completed. Check details below.", "Diagnostics");
      }
      await fetchEmailLogs();
    } catch (err: any) {
      setTestResult({ success: false, message: err.message || "Failed to contact diagnostic endpoint" });
    } finally {
      setTestingSmtp(false);
    }
  };

  // Auto-verify if token is in query params
  useEffect(() => {
    if (tokenParam && emailParam) {
      handleAutoVerifyWithToken(tokenParam, emailParam);
    }
  }, [tokenParam, emailParam]);

  // Resend cooldown timer
  useEffect(() => {
    if (resendCooldown <= 0) return;
    const interval = setInterval(() => {
      setResendCooldown((prev) => Math.max(0, prev - 1));
    }, 1000);
    return () => clearInterval(interval);
  }, [resendCooldown]);

  const handleAutoVerifyWithToken = async (token: string, userEmail: string) => {
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/auth/verify-email", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: userEmail, token }),
      });
      const data = await res.json();
      if (res.ok) {
        toast.success("Gmail verified successfully! Welcome to CelebrateHub.", "Verified");
        await refreshUser();
        const dest = data.user?.role === "organiser" ? "/organiser/dashboard" : "/customer/dashboard";
        router.push(dest);
      } else {
        setError(data.error || "Verification link is invalid or expired.");
      }
    } catch {
      setError("An unexpected error occurred during verification.");
    } finally {
      setLoading(false);
    }
  };

  const handleDigitChange = (index: number, val: string) => {
    const char = val.replace(/\D/g, "").slice(-1);
    const newDigits = [...digits];
    newDigits[index] = char;
    setDigits(newDigits);

    // Auto-advance to next input
    if (char && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Backspace" && !digits[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handlePaste = (e: React.ClipboardEvent<HTMLInputElement>) => {
    e.preventDefault();
    const pasteData = e.clipboardData.getData("text").replace(/\D/g, "").slice(0, 6);
    if (!pasteData) return;
    const newDigits = [...digits];
    for (let i = 0; i < pasteData.length; i++) {
      newDigits[i] = pasteData[i];
    }
    setDigits(newDigits);
    const nextIndex = Math.min(pasteData.length, 5);
    inputRefs.current[nextIndex]?.focus();
  };

  const handleVerifyOtp = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const code = digits.join("");
    if (code.length !== 6) {
      setError("Please enter the complete 6-digit verification code.");
      return;
    }

    if (!email.trim()) {
      setError("Please provide your Gmail address.");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const res = await fetch("/api/auth/verify-email", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: email.trim(), code }),
      });

      const data = await res.json();
      if (res.ok) {
        toast.success("Email verified successfully!", "Account Activated");
        await refreshUser();
        const dest = data.user?.role === "organiser" ? "/organiser/dashboard" : "/customer/dashboard";
        router.push(dest);
      } else {
        setError(data.error || "Invalid or expired code. Please try again.");
      }
    } catch {
      setError("Failed to connect to verification server.");
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    if (!email.trim() || resendCooldown > 0) return;
    setResending(true);
    setError("");

    try {
      const res = await fetch("/api/auth/resend-verification", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: email.trim() }),
      });

      const data = await res.json();
      if (res.ok) {
        toast.success("A fresh 6-digit code has been sent to your Gmail inbox.", "Code Sent");
        setResendCooldown(60);
        if (data.demoCode) {
          setDemoCode(data.demoCode);
        }
        await fetchEmailLogs();
      } else {
        setError(data.error || "Failed to resend code.");
      }
    } catch {
      setError("Error requesting new code. Please check your network.");
    } finally {
      setResending(false);
    }
  };

  const handleQuickFillDemo = (code: string) => {
    const chars = code.split("").slice(0, 6);
    setDigits(chars);
    toast.info(`Auto-filled code: ${code}`);
  };

  return (
    <div className="min-h-screen flex items-stretch bg-slate-950 text-slate-100">
      {/* Brand & Showcase Sidebar */}
      <div className="hidden lg:flex lg:w-5/12 xl:w-1/2 relative bg-gradient-to-br from-slate-900 via-purple-950/40 to-slate-950 p-12 flex-col justify-between border-r border-white/10 overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-purple-600/20 rounded-full blur-[140px] pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-80 h-80 bg-pink-600/15 rounded-full blur-[140px] pointer-events-none" />

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
                Security & Verification
              </span>
            </div>
          </Link>
        </div>

        {/* Middle highlight */}
        <div className="relative z-10 space-y-6 max-w-md">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-semibold">
            <ShieldCheck className="w-4 h-4" />
            <span>Verified Celebration Access</span>
          </div>

          <h2 className="text-3xl xl:text-4xl font-heading font-black text-white leading-tight">
            Protecting Your Celebration Experience.
          </h2>

          <p className="text-sm text-slate-400 leading-relaxed">
            Verifying your Gmail ensures your booking confirmations, dynamic QR admission passes,
            and host check-in notifications reach you reliably and securely.
          </p>

          <div className="space-y-3.5 pt-4">
            <div className="flex items-center gap-3 text-xs text-slate-300">
              <div className="w-6 h-6 rounded-lg bg-purple-500/20 text-purple-300 flex items-center justify-center shrink-0">
                <CheckCircle className="w-3.5 h-3.5" />
              </div>
              <span>Direct digital QR passes stored in your customer lounge</span>
            </div>
            <div className="flex items-center gap-3 text-xs text-slate-300">
              <div className="w-6 h-6 rounded-lg bg-pink-500/20 text-pink-300 flex items-center justify-center shrink-0">
                <CheckCircle className="w-3.5 h-3.5" />
              </div>
              <span>Exclusive access to rooftop sky lounges and private pool villas</span>
            </div>
            <div className="flex items-center gap-3 text-xs text-slate-300">
              <div className="w-6 h-6 rounded-lg bg-amber-500/20 text-amber-300 flex items-center justify-center shrink-0">
                <CheckCircle className="w-3.5 h-3.5" />
              </div>
              <span>Instant host confirmation & party shift reminders</span>
            </div>
          </div>
        </div>

        {/* Bottom security pill */}
        <div className="relative z-10 text-xs text-slate-500 flex items-center gap-2 border-t border-white/5 pt-6">
          <Zap className="w-4 h-4 text-purple-400" />
          <span>Encrypted 256-bit authentication token verification</span>
        </div>
      </div>

      {/* Main Interactive Form Panel */}
      <div className="flex-1 flex flex-col justify-between p-6 sm:p-10 lg:p-16 relative overflow-y-auto">
        {/* Back navigation button */}
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
              Verify Your Gmail
            </h1>
            <p className="text-xs sm:text-sm text-slate-400">
              We&apos;ve sent a 6-digit confirmation code to:
            </p>
            <div className="inline-block px-3.5 py-1.5 rounded-xl bg-purple-500/10 border border-purple-500/20 text-purple-300 text-xs font-mono font-bold">
              {email || "your registered email"}
            </div>
          </div>

          {error && (
            <div className="p-4 bg-rose-500/10 border border-rose-500/20 text-rose-300 rounded-2xl text-xs sm:text-sm flex items-start gap-3">
              <AlertCircle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          {/* OTP Input Form */}
          <form onSubmit={handleVerifyOtp} className="space-y-6">
            {!emailParam && (
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-300">Email Address</label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Enter your Gmail address"
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
                  <span>Verify & Unlock Dashboard</span>
                </>
              )}
            </button>
          </form>

          {/* Resend & Helper Row */}
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
                  <span>Resend Verification Code to Gmail</span>
                </>
              )}
            </button>

            {/* Quick Fill for Testing/Demo */}
            {demoCode && (
              <div className="p-3 bg-purple-500/10 border border-purple-500/20 rounded-xl text-xs text-purple-300 flex items-center justify-between">
                <span>Test Code: <strong className="font-mono">{demoCode}</strong></span>
                <button
                  type="button"
                  onClick={() => handleQuickFillDemo(demoCode)}
                  className="px-2.5 py-1 bg-purple-600 hover:bg-purple-500 text-white text-[11px] font-bold rounded-lg transition"
                >
                  Quick Fill
                </button>
              </div>
            )}

            {/* Developer Email Diagnostics & Live Logs Panel */}
            <div className="pt-4 border-t border-white/10 text-left space-y-3">
              <div className="p-4 rounded-2xl bg-slate-900/90 border border-white/10 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-xs font-bold text-slate-300">
                    <Terminal className="w-4 h-4 text-purple-400" />
                    <span>Email Delivery & Diagnostic Center</span>
                  </div>

                  {smtpConfigured ? (
                    <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                      <CheckCircle className="w-3 h-3" />
                      <span>SMTP Active</span>
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30">
                      <AlertCircle className="w-3 h-3" />
                      <span>Simulation Mode</span>
                    </span>
                  )}
                </div>

                <p className="text-[11px] text-slate-400 leading-relaxed">
                  {smtpConfigured
                    ? "Live Gmail SMTP is configured in .env.local. Emails are dispatched to real inboxes."
                    : "No SMTP credentials in .env.local. Emails run in Simulation Mode and are logged to terminal & the live log viewer below."}
                </p>

                {/* Diagnostics Toggle & Test Action */}
                <div className="flex items-center gap-2 pt-1">
                  <button
                    type="button"
                    onClick={handleRunSmtpTest}
                    disabled={testingSmtp}
                    className="flex-1 py-2 px-3 rounded-xl bg-purple-600/20 hover:bg-purple-600/30 border border-purple-500/30 text-purple-200 text-xs font-bold flex items-center justify-center gap-1.5 transition disabled:opacity-50"
                  >
                    {testingSmtp ? (
                      <>
                        <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                        <span>Testing Connection...</span>
                      </>
                    ) : (
                      <>
                        <Send className="w-3.5 h-3.5 text-pink-400" />
                        <span>Run SMTP Connection Test</span>
                      </>
                    )}
                  </button>

                  <button
                    type="button"
                    onClick={() => setShowDiagnostics(!showDiagnostics)}
                    className="py-2 px-3 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-slate-300 text-xs font-semibold flex items-center gap-1 transition"
                  >
                    <span>Logs ({emailLogs.length})</span>
                    {showDiagnostics ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
                  </button>
                </div>

                {/* Test Result Box */}
                {testResult && (
                  <div
                    className={`p-3 rounded-xl text-xs space-y-1 ${
                      testResult.success
                        ? "bg-emerald-500/10 border border-emerald-500/20 text-emerald-200"
                        : "bg-amber-500/10 border border-amber-500/20 text-amber-200"
                    }`}
                  >
                    <div className="font-bold flex items-center gap-1.5">
                      {testResult.success ? (
                        <CheckCircle className="w-3.5 h-3.5 text-emerald-400" />
                      ) : (
                        <AlertCircle className="w-3.5 h-3.5 text-amber-400" />
                      )}
                      <span>Status: {testResult.connectionStatus || (testResult.success ? "CONNECTED" : "NOT CONFIGURED")}</span>
                    </div>
                    <p className="text-[11px] leading-relaxed text-slate-300">{testResult.message}</p>
                    {testResult.help && (
                      <p className="text-[10px] text-amber-300 font-mono pt-1">{testResult.help}</p>
                    )}
                  </div>
                )}

                {/* Expanded Logs Viewer */}
                {showDiagnostics && (
                  <div className="space-y-2 pt-2 border-t border-white/10 max-h-48 overflow-y-auto font-mono text-[11px]">
                    {emailLogs.length === 0 ? (
                      <div className="text-slate-500 text-center py-2">No email events recorded yet. Click &apos;Resend Verification Code&apos; to trigger one!</div>
                    ) : (
                      emailLogs.map((log) => (
                        <div
                          key={log.id}
                          className="p-2.5 rounded-lg bg-slate-950/80 border border-white/5 space-y-1"
                        >
                          <div className="flex items-center justify-between text-slate-400 text-[10px]">
                            <span>{new Date(log.timestamp).toLocaleTimeString()}</span>
                            <span
                              className={`px-1.5 py-0.5 rounded uppercase font-bold text-[9px] ${
                                log.status === "sent"
                                  ? "bg-emerald-500/20 text-emerald-300"
                                  : log.status === "simulated"
                                  ? "bg-amber-500/20 text-amber-300"
                                  : "bg-rose-500/20 text-rose-300"
                              }`}
                            >
                              {log.mode}: {log.status}
                            </span>
                          </div>
                          <div className="text-slate-200 truncate">To: {log.toEmail}</div>
                          {log.code && (
                            <div className="flex items-center justify-between text-amber-300 font-bold">
                              <span>Code: {log.code}</span>
                              <button
                                type="button"
                                onClick={() => handleQuickFillDemo(log.code)}
                                className="px-2 py-0.5 bg-amber-500/20 hover:bg-amber-500/30 text-amber-200 text-[10px] rounded transition"
                              >
                                Fill This Code
                              </button>
                            </div>
                          )}
                          {log.error && (
                            <div className="text-rose-400 text-[10px] truncate">Error: {log.error}</div>
                          )}
                        </div>
                      ))
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Footer note */}
        <div className="text-center text-xs text-slate-500 pt-6">
          CelebrateHub Marketplace &copy; 2026. All celebration bookings verified.
        </div>
      </div>
    </div>
  );
}

export default function VerifyEmailPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-slate-950 flex items-center justify-center text-white">Loading verification...</div>}>
      <VerifyEmailContent />
    </Suspense>
  );
}
