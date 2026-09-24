"use client";

import React, { useState } from "react";
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
  AlertCircle,
  Eye,
  EyeOff,
  CheckCircle,
  Sparkles,
  ShieldCheck,
} from "lucide-react";

export default function RegisterPage() {
  const router = useRouter();
  const { toast } = useToast();

  const [role, setRole] = useState<"customer" | "organiser">("customer");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [phone, setPhone] = useState("");
  const [companyName, setCompanyName] = useState("");

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name,
          email,
          password,
          role,
          phone,
          companyName: role === "organiser" ? companyName : "",
        }),
      });

      const data = await res.json();
      if (res.ok) {
        toast.success(
          data.message || "Registration initiated! Please verify your Gmail.",
          "Verification Code Sent"
        );
        // Direct user to verify their Gmail!
        const query = new URLSearchParams({ email });
        if (data.demoCode) {
          query.set("demoCode", data.demoCode);
        }
        router.push(`/verify-email?${query.toString()}`);
      } else {
        const msg = data.error || "Failed to register account";
        setError(msg);
        toast.error(msg, "Registration Failed");
      }
    } catch {
      const msg = "An unexpected error occurred during registration.";
      setError(msg);
      toast.error(msg, "Registration Error");
    } finally {
      setLoading(false);
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

        {/* Feature Comparison based on selected role */}
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
              ? "Discover hidden rooftop lounges, pool villas, banquet estates, and beachfront gardens for birthdays, anniversaries, and reunions."
              : "List your property, manage party shifts (Day, Sunset, Glow Night), receive direct guest inquiries, and get automatic 95% net payouts."}
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
                  <span>Digital QR Entry Passes with real-time countdown</span>
                </div>
                <div className="flex items-center gap-3 text-xs text-slate-300">
                  <CheckCircle className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span>Fair Tiered Refund Policy & Invoice generation</span>
                </div>
              </>
            ) : (
              <>
                <div className="flex items-center gap-3 text-xs text-slate-300">
                  <CheckCircle className="w-4 h-4 text-purple-400 shrink-0" />
                  <span>Only 5% platform commission — you keep 95%</span>
                </div>
                <div className="flex items-center gap-3 text-xs text-slate-300">
                  <CheckCircle className="w-4 h-4 text-purple-400 shrink-0" />
                  <span>Built-in QR Pass Scanner for fast guest gate check-ins</span>
                </div>
                <div className="flex items-center gap-3 text-xs text-slate-300">
                  <CheckCircle className="w-4 h-4 text-purple-400 shrink-0" />
                  <span>Custom celebration packages & add-on services</span>
                </div>
              </>
            )}
          </div>
        </div>

        {/* Bottom guarantee */}
        <div className="relative z-10 flex items-center gap-2 text-xs text-slate-500 border-t border-white/5 pt-6">
          <ShieldCheck className="w-4 h-4 text-emerald-400" />
          <span>Every account is verified via Gmail OTP for maximum event safety</span>
        </div>
      </div>

      {/* Main Interactive Form Panel */}
      <div className="flex-1 flex flex-col justify-between p-6 sm:p-10 lg:p-14 relative overflow-y-auto">
        {/* Back navigation button */}
        <div className="flex items-center justify-between">
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-xs sm:text-sm font-semibold text-slate-400 hover:text-white transition px-3.5 py-2 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back to Home</span>
          </Link>

          <Link href="/" className="lg:hidden inline-flex items-center gap-2">
            <span className="font-heading font-extrabold text-base text-white">
              Celebrate<span className="text-purple-400">Hub</span>
            </span>
          </Link>
        </div>

        {/* Form Container */}
        <div className="max-w-md w-full mx-auto my-auto py-6 space-y-6">
          <div className="space-y-1">
            <h1 className="text-2xl sm:text-3xl font-heading font-black text-white">
              Create Your Account
            </h1>
            <p className="text-xs sm:text-sm text-slate-400">
              Join CelebrateHub as a Celebration Guest or Venue Host Partner.
            </p>
          </div>

          {/* Role Selector Tabs */}
          <div className="grid grid-cols-2 gap-2 bg-slate-900/90 p-1.5 rounded-2xl border border-white/10">
            <button
              type="button"
              onClick={() => setRole("customer")}
              className={`py-2.5 rounded-xl text-xs font-bold flex items-center justify-center gap-2 transition ${
                role === "customer"
                  ? "bg-gradient-to-r from-purple-600 to-pink-600 text-white shadow-lg shadow-purple-900/40"
                  : "text-slate-400 hover:text-white"
              }`}
            >
              <User className="w-4 h-4" />
              <span>Celebration Guest</span>
            </button>
            <button
              type="button"
              onClick={() => setRole("organiser")}
              className={`py-2.5 rounded-xl text-xs font-bold flex items-center justify-center gap-2 transition ${
                role === "organiser"
                  ? "bg-gradient-to-r from-amber-500 to-pink-600 text-white shadow-lg shadow-amber-900/40"
                  : "text-slate-400 hover:text-white"
              }`}
            >
              <Building2 className="w-4 h-4" />
              <span>Venue Host</span>
            </button>
          </div>

          {error && (
            <div className="p-4 bg-rose-500/10 border border-rose-500/20 text-rose-300 rounded-2xl text-xs sm:text-sm flex items-start gap-3">
              <AlertCircle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-300">
                {role === "organiser" ? "Primary Contact Name" : "Full Name"}
              </label>
              <div className="relative">
                <User className="w-4 h-4 text-slate-400 absolute left-4 top-3.5 pointer-events-none" />
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Rahul Sharma"
                  className="w-full pl-11 pr-4 py-3 rounded-2xl border border-white/10 bg-slate-900 text-white text-sm outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500 transition placeholder:text-slate-500"
                  required
                />
              </div>
            </div>

            {role === "organiser" && (
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-300">Venue or Hospitality Brand</label>
                <div className="relative">
                  <Building2 className="w-4 h-4 text-slate-400 absolute left-4 top-3.5 pointer-events-none" />
                  <input
                    type="text"
                    value={companyName}
                    onChange={(e) => setCompanyName(e.target.value)}
                    placeholder="e.g. Skydeck Lounge & Resorts"
                    className="w-full pl-11 pr-4 py-3 rounded-2xl border border-white/10 bg-slate-900 text-white text-sm outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500 transition placeholder:text-slate-500"
                    required
                  />
                </div>
              </div>
            )}

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-300">Gmail / Email Address</label>
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-400 absolute left-4 top-3.5 pointer-events-none" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@gmail.com"
                  className="w-full pl-11 pr-4 py-3 rounded-2xl border border-white/10 bg-slate-900 text-white text-sm outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500 transition placeholder:text-slate-500"
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
                  className="w-full pl-11 pr-4 py-3 rounded-2xl border border-white/10 bg-slate-900 text-white text-sm outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500 transition placeholder:text-slate-500"
                  required
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-300">Password</label>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-400 absolute left-4 top-3.5 pointer-events-none" />
                <input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="At least 6 characters"
                  minLength={6}
                  className="w-full pl-11 pr-11 py-3 rounded-2xl border border-white/10 bg-slate-900 text-white text-sm outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500 transition placeholder:text-slate-500"
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
              className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-purple-600 via-pink-600 to-amber-500 hover:from-purple-500 hover:to-amber-400 text-white font-heading font-bold text-sm shadow-xl shadow-purple-900/30 flex items-center justify-center gap-2 transition disabled:opacity-50"
            >
              <span>{loading ? "Creating Account..." : "Register & Verify Gmail"}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>

          <div className="text-center pt-2">
            <p className="text-xs text-slate-400">
              Already registered?{" "}
              <Link
                href="/login"
                className="font-bold text-purple-400 hover:text-purple-300 transition"
              >
                Sign In Here
              </Link>
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="text-center text-xs text-slate-500 pt-6">
          CelebrateHub Marketplace &copy; 2026. By registering you agree to our Terms & Safety Protocols.
        </div>
      </div>
    </div>
  );
}
