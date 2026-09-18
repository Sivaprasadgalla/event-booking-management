"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useToast } from "@/context/ToastContext";
import { Mail, ArrowLeft, KeyRound, CheckCircle2, Sparkles, ArrowRight, Loader2 } from "lucide-react";
import { motion } from "framer-motion";

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
    <div className="min-h-[80vh] flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md">
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-slate-900/80 border border-white/10 rounded-3xl p-6 sm:p-8 backdrop-blur-2xl shadow-2xl space-y-6"
        >
          <div className="text-center space-y-2">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-amber-400 to-amber-500 text-slate-950 flex items-center justify-center mx-auto shadow-lg shadow-amber-400/20">
              <KeyRound className="w-7 h-7" />
            </div>
            <h1 className="text-2xl sm:text-3xl font-heading font-extrabold text-white">
              Forgot Password?
            </h1>
            <p className="text-xs sm:text-sm text-slate-400">
              Enter your registered CelebrateHub email and we will generate a secure reset link.
            </p>
          </div>

          {!submittedSuccess ? (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-300 uppercase tracking-wider">
                  Registered Email Address
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-slate-500 absolute left-3.5 top-3.5" />
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="you@example.com"
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-950 border border-white/10 text-white text-sm font-medium focus:border-amber-400 outline-none"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full py-3 rounded-xl bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-300 hover:to-amber-400 text-slate-950 font-heading font-extrabold text-sm shadow-xl shadow-amber-400/20 transition flex items-center justify-center gap-2 disabled:opacity-50 mt-2"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" /> Generating Link...
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
            <div className="space-y-4 text-center">
              <div className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-xs space-y-2 text-left">
                <div className="flex items-center gap-2 font-bold text-emerald-400">
                  <CheckCircle2 className="w-4 h-4" /> Reset Link Ready (Valid for 1 hour)
                </div>
                <p className="text-slate-300 leading-relaxed">
                  A cryptographic reset token has been issued for <strong>{email}</strong>.
                </p>
              </div>

              {resetUrl && (
                <div className="space-y-2">
                  <p className="text-xs text-slate-400">Click below to proceed with setting a new password:</p>
                  <Link
                    href={resetUrl}
                    className="block w-full py-3 rounded-xl bg-amber-400 hover:bg-amber-300 text-slate-950 font-heading font-bold text-sm shadow-lg transition text-center"
                  >
                    Reset Password Now
                  </Link>
                </div>
              )}

              <button
                type="button"
                onClick={() => {
                  setSubmittedSuccess(false);
                  setResetUrl(null);
                }}
                className="text-xs text-slate-400 hover:text-white underline block mx-auto"
              >
                Send to a different email
              </button>
            </div>
          )}

          <div className="pt-2 border-t border-white/10 text-center">
            <Link
              href="/login"
              className="inline-flex items-center gap-1.5 text-xs text-slate-400 hover:text-amber-400 transition font-medium"
            >
              <ArrowLeft className="w-3.5 h-3.5" /> Back to Sign In
            </Link>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
