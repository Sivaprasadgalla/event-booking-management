"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useToast } from "@/context/ToastContext";
import {
  PartyPopper,
  Mail,
  ArrowLeft,
  KeyRound,
  CheckCircle2,
  Sparkles,
  ArrowRight,
  Loader2,
  ShieldCheck,
  Clock,
} from "lucide-react";

export default function ForgotPasswordPage() {
  const { toast } = useToast();
  const [email, setEmail] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submittedSuccess, setSubmittedSuccess] = useState(false);
  const [resetUrl, setResetUrl] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) {
      toast.error("Please enter your registered email address.");
      return;
    }

    try {
      setIsSubmitting(true);
      const res = await fetch("/api/auth/forgot-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: email.trim() }),
      });
      const data = await res.json();

      if (res.ok) {
        setSubmittedSuccess(true);
        if (data.resetUrl) {
          setResetUrl(data.resetUrl);
        }
        toast.success(
          "Password reset link generated. Follow the instructions to proceed.",
          "Reset Link Ready"
        );
      } else {
        toast.error(data.error || "Failed to initiate password reset.", "Error");
      }
    } catch (err) {
      console.error(err);
      toast.error("An unexpected error occurred.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen flex items-stretch bg-slate-950 text-slate-100">
      {/* Brand & Showcase Sidebar */}
      <div className="hidden lg:flex lg:w-5/12 xl:w-1/2 relative bg-gradient-to-br from-slate-900 via-amber-950/20 to-purple-950/40 p-12 flex-col justify-between border-r border-white/10 overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-amber-600/15 rounded-full blur-[140px] pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-80 h-80 bg-purple-600/15 rounded-full blur-[140px] pointer-events-none" />

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
                Account Recovery
              </span>
            </div>
          </Link>
        </div>

        {/* Feature Hero */}
        <div className="relative z-10 space-y-6 max-w-md">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-300 text-xs font-semibold">
            <ShieldCheck className="w-4 h-4" />
            <span>Secure Password Recovery</span>
          </div>

          <h2 className="text-3xl xl:text-4xl font-heading font-black text-white leading-tight">
            Never Miss a Planned Celebration.
          </h2>

          <p className="text-sm text-slate-400 leading-relaxed">
            Quickly recover access to your booked private rooftop lounges, party farmhouses,
            and organizer management studio with our zero-knowledge password reset links.
          </p>
        </div>

        {/* Bottom security pill */}
        <div className="relative z-10 text-xs text-slate-500 flex items-center gap-2 border-t border-white/5 pt-6">
          <Sparkles className="w-4 h-4 text-amber-400" />
          <span>One-time cryptographic tokens expire strictly in 60 minutes</span>
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

        {/* Form Container */}
        <div className="max-w-md w-full mx-auto my-auto py-8 space-y-6">
          <div className="text-center space-y-2">
            <div className="w-14 h-14 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-amber-400 flex items-center justify-center mx-auto mb-4">
              <KeyRound className="w-7 h-7" />
            </div>
            <h1 className="text-2xl sm:text-3xl font-heading font-black text-white">
              Forgot Password?
            </h1>
            <p className="text-xs sm:text-sm text-slate-400">
              Enter your registered Gmail or email address to generate a secure recovery link.
            </p>
          </div>

          {!submittedSuccess ? (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-300">Registered Email Address</label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-slate-400 absolute left-4 top-3.5 pointer-events-none" />
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="name@example.com"
                    className="w-full pl-11 pr-4 py-3 rounded-2xl border border-white/10 bg-slate-900 text-white text-sm outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500 transition placeholder:text-slate-500"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-amber-500 to-pink-600 hover:from-amber-400 hover:to-pink-500 text-slate-950 font-heading font-bold text-sm shadow-xl shadow-amber-500/20 flex items-center justify-center gap-2 transition disabled:opacity-50"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Generating Link...</span>
                  </>
                ) : (
                  <>
                    <span>Generate Reset Link</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </form>
          ) : (
            <div className="space-y-5 text-center">
              <div className="w-16 h-16 rounded-3xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 flex items-center justify-center mx-auto shadow-lg shadow-emerald-950/40">
                <Mail className="w-8 h-8 text-emerald-400" />
              </div>

              <div className="space-y-2">
                <h2 className="text-xl font-heading font-bold text-white">
                  Check Your Email Inbox
                </h2>
                <p className="text-xs sm:text-sm text-slate-300 leading-relaxed max-w-sm mx-auto">
                  We have dispatched a secure password reset link to{" "}
                  <strong className="text-white font-mono">{email}</strong>.
                </p>
              </div>

              <div className="p-4 rounded-2xl bg-slate-900 border border-white/10 text-left text-xs space-y-2">
                <div className="flex items-center gap-2 font-bold text-amber-400">
                  <Clock className="w-4 h-4" /> Link Expires in 60 Minutes
                </div>
                <p className="text-slate-400 leading-relaxed">
                  Click the link inside the email to choose a new password. If you don't see it in your primary inbox, please check your spam or promotional folders.
                </p>
              </div>

              <div className="space-y-2 pt-2">
                <Link
                  href="/login"
                  className="block w-full py-3.5 rounded-2xl bg-gradient-to-r from-purple-600 via-pink-600 to-amber-500 hover:from-purple-500 hover:to-amber-400 text-white font-heading font-bold text-sm shadow-xl shadow-purple-900/30 transition text-center"
                >
                  Return to Sign In
                </Link>

                <button
                  type="button"
                  onClick={() => {
                    setSubmittedSuccess(false);
                    setResetUrl(null);
                  }}
                  className="text-xs text-slate-400 hover:text-white underline block mx-auto pt-2 transition"
                >
                  Try a different email address or resend
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="text-center text-xs text-slate-500 pt-6">
          CelebrateHub Marketplace &copy; 2026. Automated Account Recovery.
        </div>
      </div>
    </div>
  );
}
